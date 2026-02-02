import { Intent } from '../schemas';
import IntentAnalyzer from '../tools/agents/intent-analyzer';
import { StreamMessenger } from '../tools/streaming';
import { coreConstant } from '../../../shared/helpers/coreConstant';
import type { ChatContext } from './chat-context';

export async function runIntentPhase(
  messenger: StreamMessenger,
  intentAnalyzer: IntentAnalyzer,
  prompt: string,
  context: ChatContext,
  userId: string,
  designId: string,
  signal: AbortSignal,
): Promise<Intent> {
  const intent = await intentAnalyzer.analyzeIntent(
    prompt,
    context.existingArtboards,
    context.contextMessages,
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

  return intent;
}
