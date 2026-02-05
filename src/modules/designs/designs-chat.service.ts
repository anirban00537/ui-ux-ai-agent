import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { StreamUpdate } from './schemas';
import { ColorPaletteGenerator } from './tools/agents/color-palette-generator';
import ArtboardCreator from './tools/agents/artboard-creator';
import ArtboardPlanner from './tools/agents/artboard-planner';
import ArtboardUpdater from './tools/agents/artboard-updater';
import { coreConstant } from '../../shared/helpers/coreConstant';
import { StreamMessenger } from './tools/streaming';
import { CreditManager } from './tools/credits';
import { AiUsageService } from '../subscription/services/ai-usage.service';
import {
  buildChatContext,
  checkCredits,
  runThemePhase,
  runCreatePhase,
} from './chat';
import { IntentAnalyzer } from './tools/agents/intent-analyzer';
import { ChatAgent } from './tools/agents/chat-agent';

@Injectable()
export class DesignsChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiUsageService: AiUsageService,
  ) {}

  async chatStream(
    prompt: string,
    userId: string,
    designId: string,
  ): Promise<Observable<StreamUpdate>> {
    return new Observable<StreamUpdate>((subscriber) => {
      const abortController = new AbortController();
      const signal = abortController.signal;
      let isRunning = true;

      let activeMessenger: StreamMessenger | null = null;

      (async () => {
        try {
          activeMessenger = new StreamMessenger(
            this.prisma,
            subscriber,
            designId,
          );
          const creditManager = new CreditManager(this.prisma);

          const context = await buildChatContext(
            this.prisma,
            activeMessenger,
            prompt,
            userId,
            designId,
          );
          if (!context) {
            subscriber.complete();
            return;
          }

          // Update messenger with the resolved design ID (in case it was new)
          if (context.designId) {
            activeMessenger.setDesignId(context.designId);
          }

          if (signal.aborted) {
            console.log('[DesignsChatService] Cancelled during setup');
            subscriber.complete();
            return;
          }

          const creditOutcome = await checkCredits(
            creditManager,
            userId,
            !!context.design.colorPalette,
            context.existingArtboards.length,
          );
          if (creditOutcome.ok === false) {
            await activeMessenger.emit(
              {
                type: creditOutcome.errorPayload.type,
                data: creditOutcome.errorPayload.data,
              },
              creditOutcome.errorMessage,
            );
            subscriber.complete();
            return;
          }

          if (signal.aborted) {
            console.log('[DesignsChatService] Cancelled before agents init');
            subscriber.complete();
            return;
          }

          const artboardCreator = new ArtboardCreator(
            this.prisma,
            creditManager,
            this.aiUsageService,
          );
          const artboardPlanner = new ArtboardPlanner(
            this.prisma,
            creditManager,
            this.aiUsageService,
          );
          const colorPaletteGenerator = new ColorPaletteGenerator(
            creditManager,
            this.aiUsageService,
          );
          const chatAgent = new ChatAgent(
            creditManager,
            this.aiUsageService,
          );
          const effectivePrompt = prompt;

          if (signal.aborted) {
            console.log('[DesignsChatService] Cancelled before theme phase');
            subscriber.complete();
            return;
          }

          // Intent Analysis Step
          const intentAnalyzer = new IntentAnalyzer(
            this.prisma,
            creditManager,
            this.aiUsageService,
          );

          await activeMessenger.emit(
            {
              type: coreConstant.STREAM_EVENT.INTENT_ANALYSIS,
              data: { label: 'Analyzing request', status: 'completed' },
            },
            'Analyzing request...',
          );

          let intentResult: { intent: 'CHAT' | 'DESIGN'; thinking?: string } = {
            intent: 'DESIGN',
          };
          try {
            intentResult = await intentAnalyzer.analyze(
              effectivePrompt,
              userId,
              designId,
              signal,
            );

            if (intentResult.thinking) {
              await activeMessenger.emit(
                {
                  type: coreConstant.STREAM_EVENT.AI_THINKING,
                  data: { message: intentResult.thinking },
                },
                intentResult.thinking,
                true,
              );
            }
          } catch (err) {
            console.error(
              '[DesignsChatService] Intent analysis failed, defaulting to DESIGN',
              err,
            );
          }

          if (intentResult.intent === 'CHAT') {
            const chatResult = await chatAgent.respond(
              effectivePrompt,
              context.contextMessages,
              userId,
              designId,
              context.existingArtboards.slice(-5).map(a => a.title),
              signal,
            );

            if (chatResult.thinking) {
              await activeMessenger.emit(
                {
                  type: coreConstant.STREAM_EVENT.AI_THINKING,
                  data: { message: chatResult.thinking },
                },
                chatResult.thinking,
                true,
              );
            }

            await activeMessenger.emit(
              {
                type: coreConstant.STREAM_EVENT.AI_RESPONSE,
                data: { message: chatResult.response },
              },
              chatResult.response,
              true,
            );

            await activeMessenger.emit(
              { type: coreConstant.STREAM_EVENT.ALL_COMPLETE },
              'Complete.',
            );

            subscriber.complete();
            return;
          }

          if (signal.aborted) {
            subscriber.complete();
            return;
          }

          await activeMessenger.emit(
            {
              type: coreConstant.STREAM_EVENT.PHASE_STEP,
              data: { label: 'Analyzing request', status: 'started' },
            },
            'Analyzing request: started',
            true,
            { label: 'Analyzing request', status: 'started' },
          );

          let colorPalette: unknown = null;
          try {
            colorPalette = await runThemePhase(
              this.prisma,
              activeMessenger,
              context.design,
              context.designId,
              effectivePrompt,
              userId,
              colorPaletteGenerator,
              signal,
            );
          } catch (err) {
            if (signal.aborted) {
              console.log(
                '[DesignsChatService] Cancelled during color palette generation',
              );
              subscriber.complete();
              return;
            }
            throw err;
          }

          await activeMessenger.emit(
            {
              type: coreConstant.STREAM_EVENT.PHASE_STEP,
              data: { label: 'Analyzing request', status: 'completed' },
            },
            'Analyzing request: completed',
            true,
            { label: 'Analyzing request', status: 'completed' },
          );

          if (signal.aborted) {
            console.log(
              '[DesignsChatService] Cancelled before screen generation',
            );
            subscriber.complete();
            return;
          }

          // Skip Intent Analysis/Update/Delete - Proceed directly to creation
          await runCreatePhase(
            activeMessenger,
            artboardCreator,
            artboardPlanner,
            context,
            effectivePrompt,
            colorPalette as import('./schemas').ColorPalette | null,
            userId,
            context.designId,
            context.design.type,
            signal,
          );

          if (!signal.aborted) {
            await activeMessenger.emit(
              { type: coreConstant.STREAM_EVENT.ALL_COMPLETE },
              'All tasks completed.',
            );
          }

          subscriber.complete();
        } catch (error) {
          if (signal.aborted) {
            console.log('[DesignsChatService] Operation was cancelled');
            subscriber.complete();
            return;
          }

          const errMsg =
            error instanceof Error ? error.message : 'Unknown error occurred';
          console.error('[DesignsChatService] Error:', error);

          try {
            const errorMessenger =
              activeMessenger ||
              new StreamMessenger(this.prisma, subscriber, designId);

            await errorMessenger.emit(
              { type: coreConstant.STREAM_EVENT.STATUS_UPDATE },
              `Error: ${errMsg}`,
              false, // Don't persist error statuses to DB to avoid potential FK issues
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

      return () => {
        if (isRunning) {
          console.log(
            '[DesignsChatService] Teardown called - aborting operation',
          );
          abortController.abort();
        }
      };
    });
  }

  async chatStreamUpdateArtboard(
    prompt: string,
    userId: string,
    designId: string,
    artboardId: string,
  ): Promise<Observable<StreamUpdate>> {
    return new Observable<StreamUpdate>((subscriber) => {
      const abortController = new AbortController();
      const signal = abortController.signal;
      let isRunning = true;

      (async () => {
        let activeMessenger: StreamMessenger | null = null;
        try {
          activeMessenger = new StreamMessenger(
            this.prisma,
            subscriber,
            designId,
          );

          // 1. Fetch Artboard
          const artboard = await this.prisma.artboard.findUnique({
            where: { id: artboardId },
            include: { design: true },
          });

          if (
            !artboard ||
            artboard.designId !== designId ||
            artboard.design.userId !== userId
          ) {
            throw new Error('Artboard not found or permission denied');
          }

          if (signal.aborted) {
            subscriber.complete();
            return;
          }

          const creditManager = new CreditManager(this.prisma);
          // Estimate credits for a screen update (approx 5000 tokens / 200 = 25 credits)
          const estimatedCredits = creditManager.estimateCredits('update_existing', { numScreensToUpdate: 1 });
          const { hasEnough, required, balance } = await creditManager.hasEnoughCredits(userId, estimatedCredits);

          if (!hasEnough) {
             const errMsg = `Insufficient credits. Required: ${required}, Available: ${balance?.remainingCredits || 0}`;
             await activeMessenger.emit(
               { type: coreConstant.STREAM_EVENT.STATUS_UPDATE },
               `Error: ${errMsg}`,
               false,
            );
             subscriber.complete();
             return;
          }

          // Save the user's update prompt message to the database
          await this.prisma.message.create({
            data: {
              designId,
              role: 'user',
              content: prompt,
            },
          });

          // Emit screen_start for the specific artboard to trigger UI card
          await activeMessenger.emit(
            {
              type: coreConstant.STREAM_EVENT.SCREEN_START,
              data: {
                messageId: `update-${Date.now()}`,
                title: artboard.title,
                kind: 'update',
                screenId: artboard.id,
              },
            },
            `Updating: ${artboard.title}`,
            true,
          );

          const artboardUpdater = new ArtboardUpdater(
            this.prisma,
            creditManager,
            this.aiUsageService,
          );

          // 2. Fetch Previous Screens for Context (Visual consistency)
          const prevScreens = await this.prisma.artboard.findMany({
            where: {
              designId: designId,
              id: { not: artboardId }, 
            },
            take: 3,
            orderBy: { createdAt: 'asc' },
            select: { id: true, title: true, description: true, html: true },
          });

          // 3. Fetch History for Context (Textual consistency)
          const messages = await this.prisma.message.findMany({
            where: { designId },
            orderBy: { createdAt: 'asc' },
          });
          const contextMessages = messages.map((m) => ({
            role: m.role as 'system' | 'user' | 'assistant',
            content: m.content,
          }));

          if (signal.aborted) {
            subscriber.complete();
            return;
          }

          // 4. Run Update
          const result = await artboardUpdater.updateArtboard(
            userId,
            designId,
            artboard.html || '', // Existing HTML
            prompt,
            contextMessages,
            signal,
            prevScreens.map((s) => ({
              title: s.title,
              description: s.description || '',
              html: s.html || '',
            })),
          );

          if (signal.aborted) {
            subscriber.complete();
            return;
          }

          // 4. Save to DB
          await this.prisma.artboard.update({
            where: { id: artboardId },
            data: {
              title: result.title,
              description: result.description,
              html: result.html,
            },
          });

          // 5. Emit Completion
          await activeMessenger.emit(
            {
              type: coreConstant.STREAM_EVENT.SCREEN_UPDATE,
              data: {
                id: artboardId,
                title: result.title,
                description: result.description,
                html: result.html,
              },
            },
            `Successfully updated screen: ${result.title}`,
            true,
          );

          await activeMessenger.emit(
            { type: coreConstant.STREAM_EVENT.ALL_COMPLETE },
            'Update completed.',
            true,
          );

          subscriber.complete();
        } catch (error) {
          if (signal.aborted) {
            subscriber.complete();
            return;
          }
          const errMsg =
            error instanceof Error ? error.message : 'Update failed';
          console.error('[DesignsChatService] Update Error:', error);

          if (activeMessenger) {
            await activeMessenger.emit(
              { type: coreConstant.STREAM_EVENT.STATUS_UPDATE },
              `Error: ${errMsg}`,
              false,
            );
          }
          subscriber.complete();
        } finally {
          isRunning = false;
        }
      })();

      return () => {
        if (isRunning) {
          abortController.abort();
        }
      };
    });
  }
}
