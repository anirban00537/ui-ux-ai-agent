import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { StreamUpdate, ExistingScreen } from './schemas';
import { ColorPaletteGenerator } from './tools/agents-tools/color-pallette-generator';
import IntentAnalyzer from './tools/agents-tools/intent-analyzer';
import ScreenCreator from './tools/agents-tools/screen-creator';
import ScreenUpdater from './tools/agents-tools/screen-updater';
import ScreenDeleter from './tools/agents-tools/screen-deleter';
import { coreConstant } from '../../shared/helpers/coreConstant';
import { StreamMessenger } from './tools/stream-messenger';
import { CreditManager } from './tools/credit-manager';
import { AiUsageService } from '../subscription/services/ai-usage.service';

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

          const screenCreator = new ScreenCreator(this.prisma, creditManager, this.aiUsageService);
          const screenUpdater = new ScreenUpdater(this.prisma, creditManager, this.aiUsageService);
          const screenDeleter = new ScreenDeleter(this.prisma, creditManager);
          const intentAnalyzer = new IntentAnalyzer(creditManager, this.aiUsageService);
          const colorPaletteGenerator = new ColorPaletteGenerator(creditManager, this.aiUsageService);

          await this.prisma.message.create({
            data: { designId, role: 'user', content: prompt },
          });
          await messenger.emit(
            {
              type: coreConstant.STREAM_EVENT.STATUS_UPDATE,
              data: {
                message: 'Got it! Let me think this through.',
              },
            },
            'Got it! Let me think this through.',
          );

          const messages = await this.prisma.message.findMany({
            where: { designId },
            orderBy: { createdAt: 'asc' },
          });

          const contextMessages = messages.map((m) => ({
            role: m.role as 'system' | 'user' | 'assistant',
            content: m.content,
          }));

          const existingScreens = (await this.prisma.screen.findMany({
            where: { designId },
            orderBy: { createdAt: 'asc' },
          })) as ExistingScreen[];

          await messenger.emit(
            {
              type: coreConstant.STREAM_EVENT.STATUS_UPDATE,
              data: { message: 'Checking credit balance...' },
            },
            'Checking credit balance...',
          );

          const hasColorPalette = !!design.colorPalette;
          const estimatedOperation =
            existingScreens.length > 0 ? 'update_existing' : 'create_new';
          const estimatedCredits = creditManager.estimateCredits(
            estimatedOperation,
            {
              numScreens: 3,
              numScreensToUpdate: existingScreens.length > 0 ? 1 : 0,
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

          await messenger.emit(
            {
              type: coreConstant.STREAM_EVENT.INTENT_ANALYSIS,
              data: { message: 'Analyzing your request...' },
            },
            'Analyzing your request...',
          );

          let colorPalette = design.colorPalette ?? null;

          if (!colorPalette) {
            await messenger.emit(
              {
                type: coreConstant.STREAM_EVENT.AI_THINKING,
                data: { message: 'Generating a color palette...' },
              },
              'Generating a color palette...',
            );

            try {
              colorPalette = await colorPaletteGenerator.generateColorPalette(
                prompt,
                userId,
                designId,
              );
            } catch (error) {
              console.warn('[ColorPalette] Generation failed, using default');
              colorPalette =
                colorPaletteGenerator.generateDefaultColorPalette();
            }

            await this.prisma.design.update({
              where: { id: designId },
              data: { colorPalette },
            });

            const paletteMsg = colorPalette
              ? 'I created a custom color palette for your app.'
              : "I couldn't generate a palette from the prompt, so I set a sensible default palette.";

            await messenger.emit(
              { type: coreConstant.STREAM_EVENT.STATUS_UPDATE },
              paletteMsg,
            );
          }

          const intent = await intentAnalyzer.analyzeIntent(
            prompt,
            existingScreens,
            contextMessages,
            userId,
            designId,
          );

          await messenger.emit(
            {
              type: coreConstant.STREAM_EVENT.INTENT_ANALYSIS,
              data: {
                message: `Intent: ${intent.intent}. ${intent.reasoning ?? ''}`,
              },
            },
            `Intent: ${intent.intent}. ${intent.reasoning ?? ''}`.trim(),
          );

          if (
            intent.intent === 'update_existing' &&
            intent.screensToUpdate &&
            intent.screensToUpdate.length > 0
          ) {
            for (const s of intent.screensToUpdate) {
              const dbScreen = await this.prisma.screen.findUnique({
                where: { id: s.id },
              });
              if (!dbScreen) continue;

              await messenger.emit(
                {
                  type: coreConstant.STREAM_EVENT.SCREEN_UPDATE,
                  data: {
                    status: 'start',
                    screenId: s.id,
                    title: s.title ?? dbScreen.title,
                  },
                },
                `Updating screen "${s.title ?? dbScreen.title}"...`,
              );

              const updatedScreen = await screenUpdater.updateScreen(
                dbScreen as ExistingScreen,
                prompt,
                contextMessages,
                colorPalette ?? undefined,
                userId,
                designId,
              );

              const saved = await screenUpdater.saveUpdatedScreen(
                dbScreen.id,
                updatedScreen,
              );

              await messenger.emit(
                {
                  type: coreConstant.STREAM_EVENT.SCREEN_UPDATE,
                  data: { status: 'complete', screen: saved },
                },
                `Updated screen "${saved.title}".`,
              );
            }
          } else if (
            intent.intent === 'delete_existing' &&
            intent.screensToUpdate &&
            intent.screensToUpdate.length > 0
          ) {
            for (const s of intent.screensToUpdate) {
              await messenger.emit(
                {
                  type: coreConstant.STREAM_EVENT.SCREEN_DELETE,
                  data: { status: 'start', screenId: s.id, title: s.title },
                },
                `Deleting screen "${s.title}"...`,
              );

              await screenDeleter.deleteScreen(s.id, userId, designId);

              await messenger.emit(
                {
                  type: coreConstant.STREAM_EVENT.SCREEN_DELETE,
                  data: { status: 'complete', screenId: s.id },
                },
                `Deleted screen "${s.title}".`,
              );
            }
          } else {
            await messenger.emit(
              { type: coreConstant.STREAM_EVENT.PLANNING },
              'Planning screens to create...',
            );

            const plan = await screenCreator.planScreens(
              prompt,
              contextMessages,
              userId,
              designId,
            );

            await messenger.emit(
              {
                type: coreConstant.STREAM_EVENT.PLANNING_COMPLETE,
                data: {
                  totalScreens: plan.totalScreens,
                  screenPrompts: plan.screenPrompts,
                },
              },
              `Planning complete: ${plan.totalScreens} screen(s).`,
            );

            for (let i = 0; i < plan.screenPrompts.length; i += 1) {
              const sp = plan.screenPrompts[i];
              await messenger.emit(
                {
                  type: coreConstant.STREAM_EVENT.SCREEN_START,
                  progress: { current: i, total: plan.totalScreens },
                  data: { title: sp.title },
                },
                `Generating screen "${sp.title}"...`,
              );

              const screen = await screenCreator.generateScreen(
                { title: sp.title, prompt: sp.prompt },
                prompt,
                contextMessages,
                colorPalette ?? undefined,
                userId,
                designId,
              );

              const saved = await screenCreator.saveScreen(screen, designId);

              await messenger.emit(
                {
                  type: coreConstant.STREAM_EVENT.SCREEN_COMPLETE,
                  progress: { current: i + 1, total: plan.totalScreens },
                  data: saved,
                },
                `Generated screen "${saved.title}".`,
              );
            }
          }

          await messenger.emit(
            { type: coreConstant.STREAM_EVENT.ALL_COMPLETE },
            'All tasks completed.',
          );

          subscriber.complete();
        } catch (error) {
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
        }
      })();
    });
  }
}
