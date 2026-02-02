import ArtboardDeleter from '../tools/agents/artboard-deleter';
import { StreamMessenger } from '../tools/streaming';
import { coreConstant } from '../../../shared/helpers/coreConstant';
import type { Intent } from '../schemas';

export async function runDeletePhase(
  messenger: StreamMessenger,
  artboardDeleter: ArtboardDeleter,
  intent: Intent,
  userId: string,
  designId: string,
  signal: AbortSignal,
): Promise<void> {
  if (!intent.screensToUpdate || intent.screensToUpdate.length === 0) {
    return;
  }

  for (const s of intent.screensToUpdate) {
    if (signal.aborted) break;

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
}
