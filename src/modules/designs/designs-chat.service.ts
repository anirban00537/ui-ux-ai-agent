import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { StreamUpdate } from './schemas';
import { ColorPaletteGenerator } from './tools/agents/color-palette-generator';
import IntentAnalyzer from './tools/agents/intent-analyzer';
import ArtboardCreator from './tools/agents/artboard-creator';
import ArtboardUpdater from './tools/agents/artboard-updater';
import ArtboardDeleter from './tools/agents/artboard-deleter';
import { coreConstant } from '../../shared/helpers/coreConstant';
import { StreamMessenger } from './tools/streaming';
import { CreditManager } from './tools/credits';
import { AiUsageService } from '../subscription/services/ai-usage.service';
import {
  buildChatContext,
  checkCredits,
  runThemePhase,
  runIntentPhase,
  runCreatePhase,
  runUpdatePhase,
  runDeletePhase,
} from './chat';

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

      (async () => {
        try {
          const messenger = new StreamMessenger(
            this.prisma,
            subscriber,
            designId,
          );
          const creditManager = new CreditManager(this.prisma);

          const context = await buildChatContext(
            this.prisma,
            messenger,
            prompt,
            userId,
            designId,
          );
          if (!context) {
            subscriber.complete();
            return;
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
            await messenger.emit(
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
            console.log('[DesignsChatService] Cancelled before intent analysis');
            subscriber.complete();
            return;
          }

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
          const artboardDeleter = new ArtboardDeleter(
            this.prisma,
            creditManager,
          );
          const intentAnalyzer = new IntentAnalyzer(
            creditManager,
            this.aiUsageService,
          );
          const colorPaletteGenerator = new ColorPaletteGenerator(
            creditManager,
            this.aiUsageService,
          );

          await messenger.emit(
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
              messenger,
              context.design,
              context.designId,
              prompt,
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

          if (signal.aborted) {
            console.log('[DesignsChatService] Cancelled before intent analysis');
            subscriber.complete();
            return;
          }

          const intent = await runIntentPhase(
            messenger,
            intentAnalyzer,
            prompt,
            context,
            userId,
            context.designId,
            signal,
          );

          if (
            intent.intent === 'update_existing' &&
            intent.screensToUpdate &&
            intent.screensToUpdate.length > 0
          ) {
            await runUpdatePhase(
              this.prisma,
              messenger,
              artboardUpdater,
              intent,
              context,
              prompt,
              colorPalette as import('./schemas').ColorPalette | null,
              userId,
              context.designId,
              context.design.type,
              signal,
            );
          } else if (
            intent.intent === 'delete_existing' &&
            intent.screensToUpdate &&
            intent.screensToUpdate.length > 0
          ) {
            await runDeletePhase(
              messenger,
              artboardDeleter,
              intent,
              userId,
              context.designId,
              signal,
            );
          } else {
            await runCreatePhase(
              messenger,
              artboardCreator,
              context,
              prompt,
              colorPalette as import('./schemas').ColorPalette | null,
              userId,
              context.designId,
              context.design.type,
              signal,
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
}
