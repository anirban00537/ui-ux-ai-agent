import { StreamUpdate } from '../schemas';
import { CreditManager } from '../tools/credits';
import { coreConstant } from '../../../shared/helpers/coreConstant';

export interface CreditCheckResult {
  ok: true;
}

export interface CreditCheckError {
  ok: false;
  errorMessage: string;
  errorPayload: StreamUpdate & {
    type: typeof coreConstant.STREAM_EVENT.STATUS_UPDATE;
    data: {
      error: string;
      code: string;
      required: number;
      available: number;
    };
  };
}

export type CreditCheckOutcome = CreditCheckResult | CreditCheckError;

/**
 * Estimates credits, checks balance. Returns { ok: true } or { ok: false, errorMessage, errorPayload }.
 */
export async function checkCredits(
  creditManager: CreditManager,
  userId: string,
  hasColorPalette: boolean,
  existingArtboardsCount: number,
): Promise<CreditCheckOutcome> {
  const estimatedOperation =
    existingArtboardsCount > 0 ? 'update_existing' : 'create_new';
  const estimatedCredits = creditManager.estimateCredits(estimatedOperation, {
    numScreens: 3,
    numScreensToUpdate: existingArtboardsCount > 0 ? 1 : 0,
    hasColorPalette,
  });

  const creditCheck = await creditManager.hasEnoughCredits(
    userId,
    estimatedCredits,
  );

  if (creditCheck.hasEnough) {
    return { ok: true };
  }

  const availableCredits = creditCheck.balance?.remainingCredits ?? 0;
  const errorMessage = `Insufficient credits. Required: ~${estimatedCredits} credits, Available: ${availableCredits} credits. Please upgrade your plan.`;

  return {
    ok: false,
    errorMessage,
    errorPayload: {
      type: coreConstant.STREAM_EVENT.STATUS_UPDATE,
      data: {
        error: errorMessage,
        code: 'INSUFFICIENT_CREDITS',
        required: estimatedCredits,
        available: creditCheck.balance?.remainingCredits ?? 0,
      },
    },
  };
}
