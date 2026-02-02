import { PrismaService } from '../../prisma/prisma.service';
import { ColorPalette, ExistingArtboard } from '../schemas';
import ArtboardUpdater from '../tools/agents/artboard-updater';
import { StreamMessenger } from '../tools/streaming';
import { coreConstant } from '../../../shared/helpers/coreConstant';
import type { ChatContext } from './chat-context';
import type { Intent } from '../schemas';

export async function runUpdatePhase(
  prisma: PrismaService,
  messenger: StreamMessenger,
  artboardUpdater: ArtboardUpdater,
  intent: Intent,
  context: ChatContext,
  prompt: string,
  colorPalette: ColorPalette | null,
  userId: string,
  designId: string,
  designType: string | null,
  signal: AbortSignal,
): Promise<void> {
  if (!intent.screensToUpdate || intent.screensToUpdate.length === 0) {
    return;
  }

  const { getLastScreensForDesignPattern, existingArtboards, contextMessages } =
    context;

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
      screenTitles: intent.screensToUpdate.map((s) => s.title),
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

  const updateDescription = intent.screensToUpdate
    .map((s) => `• **${s.title}**: Updating based on your request.`)
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

  for (let idx = 0; idx < intent.screensToUpdate.length; idx += 1) {
    const s = intent.screensToUpdate[idx];
    if (signal.aborted) break;

    const dbArtboard = await prisma.artboard.findUnique({
      where: { id: s.id },
    });
    if (!dbArtboard) continue;

    const title = s.title ?? dbArtboard.title;
    const screenStartMessageId = await messenger.createMessageAndGetId(
      `Updating: ${title}`,
      coreConstant.STREAM_EVENT.SCREEN_START,
      { title, kind: 'update', screenId: s.id },
    );
    messenger.emitFast({
      type: coreConstant.STREAM_EVENT.SCREEN_START,
      progress: { current: idx, total: intent.screensToUpdate.length },
      data: {
        messageId: screenStartMessageId,
        title,
        kind: 'update',
        screenId: s.id,
      },
    });

    const otherArtboards = existingArtboards.filter((a) => a.id !== dbArtboard.id);
    const previousScreens = getLastScreensForDesignPattern(otherArtboards);

    const updatedScreen = await artboardUpdater.updateArtboard(
      dbArtboard as ExistingArtboard,
      prompt,
      contextMessages,
      colorPalette ?? undefined,
      userId,
      designId,
      designType ?? undefined,
      previousScreens,
      signal,
    );

    const saved = await artboardUpdater.saveUpdatedArtboard(
      dbArtboard.id,
      updatedScreen,
    );

    const completeData = { ...saved, planTitle: saved.title };
    await messenger.updateMessage(
      screenStartMessageId,
      `Updated: ${saved.title}`,
      coreConstant.STREAM_EVENT.SCREEN_UPDATE,
      { screen: completeData, title: saved.title, screenId: saved.id },
    );
    messenger.emitFast({
      type: coreConstant.STREAM_EVENT.SCREEN_UPDATE,
      data: {
        messageId: screenStartMessageId,
        status: 'complete',
        screen: completeData,
      },
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
