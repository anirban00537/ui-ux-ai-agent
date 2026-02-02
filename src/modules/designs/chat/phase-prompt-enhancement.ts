import { PromptEnhancer } from '../tools/agents/prompt-enhancer';
import { StreamMessenger } from '../tools/streaming';
import { coreConstant } from '../../../shared/helpers/coreConstant';

export async function runPromptEnhancementPhase(
  messenger: StreamMessenger,
  promptEnhancer: PromptEnhancer,
  originalPrompt: string,
  designType: string | null,
  userId: string,
  designId: string,
  signal: AbortSignal,
): Promise<string> {
  await messenger.emit(
    {
      type: coreConstant.STREAM_EVENT.PHASE_STEP,
      data: { label: 'Enhancing prompt', status: 'started' },
    },
    'Enhancing prompt: started',
    true,
    { label: 'Enhancing prompt', status: 'started' },
  );

  const enhanced = await promptEnhancer.enhancePrompt(
    originalPrompt,
    designType,
    userId,
    designId,
    signal,
  );

  await messenger.emit(
    {
      type: coreConstant.STREAM_EVENT.PHASE_STEP,
      data: { label: 'Enhancing prompt', status: 'completed' },
    },
    'Enhancing prompt: completed',
    true,
    { label: 'Enhancing prompt', status: 'completed' },
  );

  return enhanced;
}
