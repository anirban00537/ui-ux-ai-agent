import { OpenAI } from 'openai';

/**
 * Singleton OpenRouter client for all LLM operations.
 *
 * WHY WE USE THE OPENAI SDK:
 * OpenRouter is 100% OpenAI-compatible. Using the OpenAI SDK with OpenRouter's
 * base URL is the OFFICIAL recommended way to interact with OpenRouter, especially
 * for streaming which requires proper async iteration support.
 *
 * The native @openrouter/sdk doesn't provide the same streaming API capabilities.
 *
 * This is NOT calling OpenAI directly - it's calling OpenRouter via the OpenAI SDK.
 */

// Singleton OpenRouter client (via OpenAI SDK for full streaming support)
let openrouterClientInstance: OpenAI | null = null;

/**
 * Get the singleton OpenRouter client.
 *
 * Uses OpenAI SDK pointed at OpenRouter's API for:
 * - Full streaming support with async iteration
 * - JSON schema structured outputs
 * - Proper timeout/retry handling
 * - Connection pooling
 *
 * @returns OpenAI client configured for OpenRouter
 */
export function getOpenRouterClient(): OpenAI {
  if (!openrouterClientInstance) {
    openrouterClientInstance = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY!,
      timeout: 600000, // 10 minute timeout
      maxRetries: 2,
      defaultHeaders: {
        'HTTP-Referer': 'https://butterfast.app',
        'X-Title': 'Butterfast',
      },
    });
  }
  return openrouterClientInstance;
}

/**
 * LLM Configuration constants
 */
export const LLM_CONFIG = {
  /** Maximum time to wait for a non-streaming LLM response (ms) */
  REQUEST_TIMEOUT_MS: 600000, // 10 minutes

  /** Maximum time to wait for first chunk in streaming response (ms) */
  STREAM_FIRST_CHUNK_TIMEOUT_MS: 60000, // 60 seconds

  /** Maximum time to wait between streaming chunks (ms) */
  STREAM_CHUNK_TIMEOUT_MS: 15000, // 15 seconds

  /** Maximum concurrent screen generations */
  MAX_CONCURRENT_SCREENS: 3,

  /** Retry configuration */
  MAX_RETRIES: 2,
} as const;

/**
 * Wrapper to execute LLM call with timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operationName: string,
  signal?: AbortSignal,
): Promise<T> {
  // Check if already aborted
  if (signal?.aborted) {
    throw new Error(`Operation cancelled: ${operationName}`);
  }

  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout after ${timeoutMs}ms: ${operationName}`));
    }, timeoutMs);

    // Listen for abort signal
    const abortHandler = () => {
      clearTimeout(timeoutId);
      reject(new Error(`Operation cancelled: ${operationName}`));
    };

    signal?.addEventListener('abort', abortHandler, { once: true });

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        signal?.removeEventListener('abort', abortHandler);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        signal?.removeEventListener('abort', abortHandler);
        reject(error);
      });
  });
}

/**
 * Check if operation should continue (not aborted)
 */
export function checkAborted(signal?: AbortSignal, operationName?: string): void {
  if (signal?.aborted) {
    throw new Error(
      `Operation cancelled${operationName ? `: ${operationName}` : ''}`,
    );
  }
}
