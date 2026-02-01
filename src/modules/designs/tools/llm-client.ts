import { OpenAI } from 'openai';
import { OpenRouter } from '@openrouter/sdk';

/**
 * Singleton LLM client instances for efficient connection pooling.
 * Reuses HTTP connections instead of creating new clients per request.
 */

// Singleton OpenAI client (OpenRouter-compatible for streaming)
let openaiClientInstance: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClientInstance) {
    openaiClientInstance = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY!,
      timeout: 120000, // 2 minute timeout
      maxRetries: 2,
      defaultHeaders: {
        'HTTP-Referer': 'https://butterfast.app',
        'X-Title': 'Butterfast',
      },
    });
  }
  return openaiClientInstance;
}

// Singleton OpenRouter client
let openrouterClientInstance: OpenRouter | null = null;

export function getOpenRouterClient(): OpenRouter {
  if (!openrouterClientInstance) {
    openrouterClientInstance = new OpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY!,
    });
  }
  return openrouterClientInstance;
}

/**
 * LLM Configuration constants
 */
export const LLM_CONFIG = {
  /** Maximum time to wait for a non-streaming LLM response (ms) */
  REQUEST_TIMEOUT_MS: 120000, // 2 minutes
  
  /** Maximum time to wait for first chunk in streaming response (ms) */
  STREAM_FIRST_CHUNK_TIMEOUT_MS: 30000, // 30 seconds
  
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
    throw new Error(`Operation cancelled${operationName ? `: ${operationName}` : ''}`);
  }
}
