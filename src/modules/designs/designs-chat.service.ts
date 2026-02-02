import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { StreamUpdate, ExistingArtboard, PreviousScreenContext } from './schemas';
import { ColorPaletteGenerator } from './tools/agents-tools/color-palette-generator';
import IntentAnalyzer from './tools/agents-tools/intent-analyzer';
import ArtboardCreator from './tools/agents-tools/artboard-creator';
import ArtboardUpdater from './tools/agents-tools/artboard-updater';
import ArtboardDeleter from './tools/agents-tools/artboard-deleter';
import { coreConstant } from '../../shared/helpers/coreConstant';
import { StreamMessenger } from './tools/stream-messenger';
import { CreditManager } from './tools/credit-manager';
import { AiUsageService } from '../subscription/services/ai-usage.service';
import { ImagesService } from '../images/images.service';

@Injectable()
export class DesignsChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiUsageService: AiUsageService,
    private readonly imagesService: ImagesService,
  ) {}

  async chatStream(
    prompt: string,
    userId: string,
    designId: string,
  ): Promise<Observable<StreamUpdate>> {
    return new Observable<StreamUpdate>((subscriber) => {
      // Create abort controller for cancellation support
      const abortController = new AbortController();
      const signal = abortController.signal;

      // Track if operation is running
      let isRunning = true;

      (async () => {
        try {
          const messenger = new StreamMessenger(
            this.prisma,
            subscriber,
            designId,
          );
          const creditManager = new CreditManager(this.prisma);

          if (!prompt) {
            await messenger.emit(
              { type: coreConstant.STREAM_EVENT.STATUS_UPDATE },
              'Prompt is required',
            );
            subscriber.complete();
            return;
          }
          if (!userId) {
            await messenger.emit(
              { type: coreConstant.STREAM_EVENT.STATUS_UPDATE },
              'User ID is required',
            );
            subscriber.complete();
            return;
          }

          let design = null;
          if (designId) {
            design = await this.prisma.design.findUnique({
              where: { id: designId, userId },
            });
            if (!design) {
              await messenger.emit(
                { type: coreConstant.STREAM_EVENT.STATUS_UPDATE },
                'Design not found',
              );
              subscriber.complete();
              return;
            }
          } else {
            design = await this.prisma.design.create({
              data: { userId },
            });
            designId = design.id;
            messenger.setDesignId(designId);
          }

          // Check for cancellation after initial setup
          if (signal.aborted) {
            console.log('[DesignsChatService] Cancelled during setup');
            subscriber.complete();
            return;
          }

          // Initialize tools with ImagesService for smart image fetching
          const artboardCreator = new ArtboardCreator(
            this.prisma,
            creditManager,
            this.aiUsageService,
          );
          const artboardUpdater = new ArtboardUpdater(
            this.prisma,
            creditManager,
            this.aiUsageService,
          );
          const artboardDeleter = new ArtboardDeleter(this.prisma, creditManager);
          const intentAnalyzer = new IntentAnalyzer(creditManager, this.aiUsageService);
          const colorPaletteGenerator = new ColorPaletteGenerator(creditManager, this.aiUsageService);

          await this.prisma.message.create({
            data: { designId, role: 'user', content: prompt },
          });
          
          // No verbose status message - just proceed silently

          const messages = await this.prisma.message.findMany({
            where: { designId },
            orderBy: { createdAt: 'asc' },
          });

          const contextMessages = messages.map((m) => ({
            role: m.role as 'system' | 'user' | 'assistant',
            content: m.content,
          }));

          const existingArtboards = (await this.prisma.artboard.findMany({
            where: { designId },
            orderBy: { createdAt: 'asc' },
          })) as ExistingArtboard[];

          const maxContext = coreConstant.DESIGN_CONTEXT.MAX_PREVIOUS_SCREENS;
          const getLastScreensForDesignPattern = (
            artboards: Array<{ title: string; description: string | null; html: string }>,
          ): PreviousScreenContext[] =>
            artboards.slice(-maxContext).map((a) => ({
              title: a.title,
              description: a.description ?? null,
              html: a.html,
            }));

          // Credit check (silent - no status message)
          const hasColorPalette = !!design.colorPalette;
          const estimatedOperation =
            existingArtboards.length > 0 ? 'update_existing' : 'create_new';
          const estimatedCredits = creditManager.estimateCredits(
            estimatedOperation,
            {
              numScreens: 3,
              numScreensToUpdate: existingArtboards.length > 0 ? 1 : 0,
              hasColorPalette,
            },
          );

          const creditCheck = await creditManager.hasEnoughCredits(
            userId,
            estimatedCredits,
          );

          if (!creditCheck.hasEnough) {
            const requiredCredits = estimatedCredits;
            const availableCredits = creditCheck.balance?.remainingCredits || 0;
            const errorMessage = `Insufficient credits. Required: ~${requiredCredits} credits, Available: ${availableCredits} credits. Please upgrade your plan.`;

            await messenger.emit(
              {
                type: coreConstant.STREAM_EVENT.STATUS_UPDATE,
                data: {
                  error: errorMessage,
                  code: 'INSUFFICIENT_CREDITS',
                  required: estimatedCredits,
                  available: creditCheck.balance?.remainingCredits || 0,
                },
              },
              errorMessage,
            );
            subscriber.complete();
            return;
          }

          // Check for cancellation
          if (signal.aborted) {
            console.log('[DesignsChatService] Cancelled before intent analysis');
            subscriber.complete();
            return;
          }

          // === PHASE 1: ANALYZING REQUEST ===
          await messenger.emit(
            {
              type: coreConstant.STREAM_EVENT.PHASE_STEP,
              data: { label: 'Analyzing request', status: 'started' },
            },
            'Analyzing request: started',
            true,
            { label: 'Analyzing request', status: 'started' },
          );

          let colorPalette = design.colorPalette ?? null;

          // Generate color palette if needed (part of analyzing phase)
          if (!colorPalette) {
            await messenger.emit(
              {
                type: coreConstant.STREAM_EVENT.PHASE_STEP,
                data: { label: 'Generating theme', status: 'started' },
              },
              'Generating theme: started',
              true,
              { label: 'Generating theme', status: 'started' },
            );

            try {
              colorPalette = await colorPaletteGenerator.generateColorPalette(
                prompt,
                userId,
                designId,
                signal,
              );
            } catch (error) {
              if (signal.aborted) {
                console.log('[DesignsChatService] Cancelled during color palette generation');
                subscriber.complete();
                return;
              }
              console.warn('[ColorPalette] Generation failed, using default');
              colorPalette =
                colorPaletteGenerator.generateDefaultColorPalette();
            }

            await this.prisma.design.update({
              where: { id: designId },
              data: { colorPalette },
            });

            await messenger.emit(
              {
                type: coreConstant.STREAM_EVENT.PHASE_STEP,
                data: { label: 'Generating theme', status: 'completed' },
              },
              'Generating theme: completed',
              true,
              { label: 'Generating theme', status: 'completed' },
            );
            messenger.emitFast({
              type: coreConstant.STREAM_EVENT.PHASE_THEME_COMPLETE,
              data: colorPalette,
            });
          } else {
            messenger.emitFast({
              type: coreConstant.STREAM_EVENT.PHASE_THEME_COMPLETE,
              data: colorPalette,
            });
          }

          // Check for cancellation before intent analysis
          if (signal.aborted) {
            console.log('[DesignsChatService] Cancelled before intent analysis');
            subscriber.complete();
            return;
          }

          // Analyze intent
          const intent = await intentAnalyzer.analyzeIntent(
            prompt,
            existingArtboards,
            contextMessages,
            userId,
            designId,
            signal,
          );

          await messenger.emit(
            {
              type: coreConstant.STREAM_EVENT.PHASE_STEP,
              data: { label: 'Analyzing request', status: 'completed' },
            },
            'Analyzing request: completed',
            true,
            { label: 'Analyzing request', status: 'completed' },
          );
          messenger.emitFast({
            type: coreConstant.STREAM_EVENT.PHASE_ANALYZED,
            data: { intent: intent.intent },
          });

          if (
            intent.intent === 'update_existing' &&
            intent.screensToUpdate &&
            intent.screensToUpdate.length > 0
          ) {
            await messenger.emit(
              {
                type: coreConstant.STREAM_EVENT.PHASE_STEP,
                data: { label: 'Planning actions', status: 'started' },
              },
              'Planning actions: started',
              true,
              { label: 'Planning actions', status: 'started' },
            );
            messenger.emitFast({
              type: coreConstant.STREAM_EVENT.PHASE_PLANNED,
              data: {
                totalScreens: intent.screensToUpdate.length,
                screenTitles: intent.screensToUpdate.map(s => s.title),
              },
            });
            await messenger.emit(
              {
                type: coreConstant.STREAM_EVENT.PHASE_STEP,
                data: { label: 'Planning actions', status: 'completed' },
              },
              'Planning actions: completed',
              true,
              { label: 'Planning actions', status: 'completed' },
            );

            // AI Response describing updates
            const updateDescription = intent.screensToUpdate
              .map(s => `• **${s.title}**: Updating based on your request.`)
              .join('\n');
            const aiResponseContent = `I'll update ${intent.screensToUpdate.length} screen${intent.screensToUpdate.length > 1 ? 's' : ''} for you:\n\n${updateDescription}`;
            
            await messenger.emit(
              {
                type: coreConstant.STREAM_EVENT.AI_RESPONSE,
                data: { message: aiResponseContent },
              },
              aiResponseContent,
              true,
            );

            await messenger.emit(
              {
                type: coreConstant.STREAM_EVENT.PHASE_STEP,
                data: { label: 'Generating screens', status: 'started' },
              },
              'Generating screens: started',
              true,
              { label: 'Generating screens', status: 'started' },
            );
            // Update screens - can be parallelized for multiple updates
            for (let idx = 0; idx < intent.screensToUpdate.length; idx += 1) {
              const s = intent.screensToUpdate[idx];
              if (signal.aborted) {
                console.log('[DesignsChatService] Cancelled during screen updates');
                break;
              }

              const dbArtboard = await this.prisma.artboard.findUnique({
                where: { id: s.id },
              });
              if (!dbArtboard) continue;

              const title = s.title ?? dbArtboard.title;
              // Persist screen_start message so this turn has a unique card; emit with messageId
              const screenStartMessageId = await messenger.createMessageAndGetId(
                `Updating: ${title}`,
                coreConstant.STREAM_EVENT.SCREEN_START,
                { title, kind: 'update', screenId: s.id },
              );
              messenger.emitFast({
                type: coreConstant.STREAM_EVENT.SCREEN_START,
                progress: { current: idx, total: intent.screensToUpdate.length },
                data: { messageId: screenStartMessageId, title, kind: 'update', screenId: s.id },
              });

              const otherArtboards = existingArtboards.filter(
                (a) => a.id !== dbArtboard.id,
              );
              const previousScreens = getLastScreensForDesignPattern(otherArtboards);

              const updatedScreen = await artboardUpdater.updateArtboard(
                dbArtboard as ExistingArtboard,
                prompt,
                contextMessages,
                colorPalette ?? undefined,
                userId,
                designId,
                design.type,
                previousScreens,
                signal,
              );

              const saved = await artboardUpdater.saveUpdatedArtboard(
                dbArtboard.id,
                updatedScreen,
              );

              // Embed plan title context for UI grouping
              const completeData = { ...saved, planTitle: saved.title };
              await messenger.updateMessage(
                screenStartMessageId,
                `Updated: ${saved.title}`,
                coreConstant.STREAM_EVENT.SCREEN_UPDATE,
                { screen: completeData, title: saved.title, screenId: saved.id },
              );
              messenger.emitFast({
                type: coreConstant.STREAM_EVENT.SCREEN_UPDATE,
                data: { messageId: screenStartMessageId, status: 'complete', screen: completeData },
              });
            }
            await messenger.emit(
              {
                type: coreConstant.STREAM_EVENT.PHASE_STEP,
                data: { label: 'Generating screens', status: 'completed' },
              },
              'Generating screens: completed',
              true,
              { label: 'Generating screens', status: 'completed' },
            );
          } else if (
            intent.intent === 'delete_existing' &&
            intent.screensToUpdate &&
            intent.screensToUpdate.length > 0
          ) {
            for (const s of intent.screensToUpdate) {
              if (signal.aborted) {
                console.log('[DesignsChatService] Cancelled during screen deletion');
                break;
              }

              await messenger.emit(
                {
                  type: coreConstant.STREAM_EVENT.SCREEN_DELETE,
                  data: { status: 'start', screenId: s.id, title: s.title },
                },
                `Deleting screen "${s.title}"...`,
              );

              await artboardDeleter.deleteArtboard(s.id, userId, designId);

              await messenger.emit(
                {
                  type: coreConstant.STREAM_EVENT.SCREEN_DELETE,
                  data: { status: 'complete', screenId: s.id },
                },
                `Deleted screen "${s.title}".`,
              );
            }
          } else {
            // CREATE NEW SCREENS
            await messenger.emit(
              {
                type: coreConstant.STREAM_EVENT.PHASE_STEP,
                data: { label: 'Planning actions', status: 'started' },
              },
              'Planning actions: started',
              true,
              { label: 'Planning actions', status: 'started' },
            );
            messenger.emitFast({
              type: coreConstant.STREAM_EVENT.PHASE_PLANNING,
            });

            const plan = await artboardCreator.planArtboards(
              prompt,
              contextMessages,
              userId,
              designId,
              design.type,
              signal,
            );

            if (signal.aborted) {
              console.log('[DesignsChatService] Cancelled after planning');
              subscriber.complete();
              return;
            }

            messenger.emitFast({
              type: coreConstant.STREAM_EVENT.PHASE_PLANNED,
              data: {
                totalScreens: plan.totalScreens,
                screenTitles: plan.screenPrompts.map(s => s.title),
              },
            });
            await messenger.emit(
              {
                type: coreConstant.STREAM_EVENT.PHASE_STEP,
                data: { label: 'Planning actions', status: 'completed' },
              },
              'Planning actions: completed',
              true,
              { label: 'Planning actions', status: 'completed' },
            );

            // Create AI response message describing what we're building (persisted)
            const screenDescriptions = plan.screenPrompts
              .map(s => `• **${s.title}**: ${s.prompt}`)
              .join('\n');
            const aiResponseContent = `I'll create ${plan.totalScreens} screen${plan.totalScreens > 1 ? 's' : ''} for your ${design.type || 'mobile app'}:\n\n${screenDescriptions}`;
            
            await messenger.emit(
              {
                type: coreConstant.STREAM_EVENT.AI_RESPONSE,
                data: { message: aiResponseContent },
              },
              aiResponseContent,
              true, // persist to DB
            );

            // Prepare context for generation
            let screensForContext: Array<{
              title: string;
              description: string | null;
              html: string;
            }> = existingArtboards.map((a) => ({
              title: a.title,
              description: a.description ?? null,
              html: a.html,
            }));

            await messenger.emit(
              {
                type: coreConstant.STREAM_EVENT.PHASE_STEP,
                data: { label: 'Generating screens', status: 'started' },
              },
              'Generating screens: started',
              true,
              { label: 'Generating screens', status: 'started' },
            );
            // SEQUENTIAL GENERATION WITH STREAMING
            // Always use streaming for real-time UI feedback
            console.log(`[DesignsChatService] Generating ${plan.screenPrompts.length} screens sequentially with streaming`);
            
            for (let i = 0; i < plan.screenPrompts.length; i += 1) {
              if (signal.aborted) {
                console.log('[DesignsChatService] Cancelled during screen generation');
                break;
              }

              const sp = plan.screenPrompts[i];
              const previousScreens = getLastScreensForDesignPattern(screensForContext);

              // Persist screen_start message so this turn has a unique card; emit with messageId
              const screenStartMessageId = await messenger.createMessageAndGetId(
                `Generating: ${sp.title}`,
                coreConstant.STREAM_EVENT.SCREEN_START,
                { title: sp.title, kind: 'create' },
              );
              messenger.emitFast({
                type: coreConstant.STREAM_EVENT.SCREEN_START,
                progress: { current: i, total: plan.totalScreens },
                data: { messageId: screenStartMessageId, title: sp.title, kind: 'create' },
              });

              // Use the streaming generator for real-time UI updates
              let screen: any = null;
              const streamGenerator = artboardCreator.generateArtboardStreaming(
                sp,
                prompt,
                contextMessages,
                colorPalette ?? undefined,
                userId,
                designId,
                design.type,
                previousScreens,
                signal,
              );

              for await (const streamEvent of streamGenerator) {
                if (signal.aborted) {
                  console.log('[DesignsChatService] Cancelled during streaming');
                  break;
                }

                if (streamEvent.type === 'chunk') {
                  // Forward streaming chunk to frontend - use fast emit (no DB persistence)
                  messenger.emitFast({
                    type: coreConstant.STREAM_EVENT.SCREEN_STREAMING,
                    progress: { current: i, total: plan.totalScreens },
                    data: {
                      title: sp.title,
                      rawChunk: streamEvent.data.rawChunk,
                      accumulatedText: streamEvent.data.accumulatedText,
                    },
                  });
                } else if (streamEvent.type === 'complete') {
                  screen = streamEvent.data;
                }
              }

              if (signal.aborted) break;

              if (!screen) {
                throw new Error(`Failed to generate screen "${sp.title}"`);
              }

              const saved = await artboardCreator.saveArtboard(screen, designId);
              screensForContext.push({
                title: saved.title,
                description: saved.description ?? null,
                html: saved.html,
              });

              const completeData = { ...saved, planTitle: sp.title };
              await messenger.updateMessage(
                screenStartMessageId,
                `Generated: ${saved.title}`,
                coreConstant.STREAM_EVENT.SCREEN_COMPLETE,
                { title: saved.title, screenId: saved.id, screen: completeData },
              );
              messenger.emitFast({
                type: coreConstant.STREAM_EVENT.SCREEN_COMPLETE,
                progress: { current: i + 1, total: plan.totalScreens },
                data: { messageId: screenStartMessageId, ...completeData },
              });
            }
            await messenger.emit(
              {
                type: coreConstant.STREAM_EVENT.PHASE_STEP,
                data: { label: 'Generating screens', status: 'completed' },
              },
              'Generating screens: completed',
              true,
              { label: 'Generating screens', status: 'completed' },
            );
          }

          if (!signal.aborted) {
            await messenger.emit(
              { type: coreConstant.STREAM_EVENT.ALL_COMPLETE },
              'All tasks completed.',
            );
          }

          subscriber.complete();
        } catch (error) {
          // Check if this was a cancellation
          if (signal.aborted) {
            console.log('[DesignsChatService] Operation was cancelled');
            subscriber.complete();
            return;
          }

          const errMsg =
            error instanceof Error ? error.message : 'Unknown error occurred';
          console.error('[DesignsChatService] Error:', error);

          try {
            const messenger = new StreamMessenger(
              this.prisma,
              subscriber,
              designId,
            );
            await messenger.emit(
              { type: coreConstant.STREAM_EVENT.STATUS_UPDATE },
              `Error: ${errMsg}`,
            );
          } catch (emitError) {
            console.error(
              '[DesignsChatService] Failed to emit error:',
              emitError,
            );
          }

          subscriber.complete();
        } finally {
          isRunning = false;
        }
      })();

      // Return teardown function for Observable cancellation
      return () => {
        if (isRunning) {
          console.log('[DesignsChatService] Teardown called - aborting operation');
          abortController.abort();
        }
      };
    });
  }
}
