import { ColorPalette } from '../schemas';
import ArtboardCreator from '../tools/agents/artboard-creator';
import { StreamMessenger } from '../tools/streaming';
import { coreConstant } from '../../../shared/helpers/coreConstant';
import type { ChatContext } from './chat-context';

export async function runCreatePhase(
  messenger: StreamMessenger,
  artboardCreator: ArtboardCreator,
  context: ChatContext,
  prompt: string,
  colorPalette: ColorPalette | null,
  userId: string,
  designId: string,
  designType: string | null,
  signal: AbortSignal,
): Promise<void> {
  const { contextMessages, existingArtboards, getLastScreensForDesignPattern } =
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
    type: coreConstant.STREAM_EVENT.PHASE_PLANNING,
  });

  const plan = await artboardCreator.planArtboards(
    prompt,
    contextMessages,
    userId,
    designId,
    designType ?? undefined,
    signal,
  );

  if (signal.aborted) return;

  messenger.emitFast({
    type: coreConstant.STREAM_EVENT.PHASE_PLANNED,
    data: {
      totalScreens: plan.totalScreens,
      screenTitles: plan.screenPrompts.map((s) => s.title),
      screenIds: plan.screenPrompts.map((s) => s.id),
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

  const screenDescriptions = plan.screenPrompts
    .map((s) => `• **${s.title}**: ${s.prompt}`)
    .join('\n');
  const aiResponseContent = `I'll create ${plan.totalScreens} screen${plan.totalScreens > 1 ? 's' : ''} for your ${designType || 'mobile app'}:\n\n${screenDescriptions}`;

  await messenger.emit(
    {
      type: coreConstant.STREAM_EVENT.AI_RESPONSE,
      data: { message: aiResponseContent },
    },
    aiResponseContent,
    true,
  );

  let screensForContext: Array<{
    title: string;
    description: string | null;
    html: string;
  }> = context.existingArtboards.map((a) => ({
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

  for (let i = 0; i < plan.screenPrompts.length; i += 1) {
    if (signal.aborted) break;

    const sp = plan.screenPrompts[i];
    const previousScreens = getLastScreensForDesignPattern(screensForContext);

    const screenStartMessageId = await messenger.createMessageAndGetId(
      `Generating: ${sp.title}`,
      coreConstant.STREAM_EVENT.SCREEN_START,
      { title: sp.title, kind: 'create' },
    );
    messenger.emitFast({
      type: coreConstant.STREAM_EVENT.SCREEN_START,
      progress: { current: i, total: plan.totalScreens },
      data: { 
        messageId: screenStartMessageId, 
        title: sp.title, 
        kind: 'create',
        screenId: sp.id, // Pass the stable temp ID
      },
    });

    let screen: { title: string; description: string; html: string } | null =
      null;
    const streamGenerator = artboardCreator.generateArtboardStreaming(
      sp,
      prompt,
      contextMessages,
      colorPalette ?? undefined,
      userId,
      designId,
      designType ?? undefined,
      previousScreens,
      signal,
    );

    for await (const streamEvent of streamGenerator) {
      if (signal.aborted) break;
      if (streamEvent.type === 'chunk') {
        messenger.emitFast({
          type: coreConstant.STREAM_EVENT.SCREEN_STREAMING,
          progress: { current: i, total: plan.totalScreens },
          data: {
            id: sp.id, // Use the stable ID
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
      data: { 
        messageId: screenStartMessageId, 
        ...completeData,
        tempId: sp.id, // Let frontend know which temp ID this real ID replaces
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
