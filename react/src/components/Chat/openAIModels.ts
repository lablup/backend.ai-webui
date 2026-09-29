/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ChatModel } from './ChatModel';
import * as _ from 'lodash-es';

export type ModelsFetchError =
  | { kind: 'http'; status: number }
  | { kind: 'network' }
  | { kind: 'timeout' }
  | { kind: 'invalid-response' };

export interface ModelsFetchResult {
  data: Array<ChatModel>;
  error?: ModelsFetchError;
}

export function createModelsURL(baseURL: string) {
  const { origin, pathname: path } = new URL(baseURL.trim());
  const normalizedPath = path === '/' ? '/models' : `${path}/models`;

  return new URL(normalizedPath, origin).toString();
}

// FR-3212: bound a TCP-connected-but-silent endpoint so the caller can recover.
const MODELS_FETCH_TIMEOUT_MS = 30000;

export async function fetchOpenAIModels(
  baseURL: string,
  apiKey?: string,
): Promise<ModelsFetchResult> {
  let response: Response;
  try {
    response = await fetch(createModelsURL(baseURL), {
      headers: {
        Authorization: apiKey ? `Bearer ${apiKey}` : '',
      },
      signal: AbortSignal.timeout(MODELS_FETCH_TIMEOUT_MS),
    });
  } catch (error) {
    const isTimeout =
      error instanceof DOMException &&
      (error.name === 'TimeoutError' || error.name === 'AbortError');
    return { data: [], error: { kind: isTimeout ? 'timeout' : 'network' } };
  }

  if (!response.ok) {
    return { data: [], error: { kind: 'http', status: response.status } };
  }

  try {
    const result = await response.json();
    if (!_.isArray(result?.data)) {
      return { data: [], error: { kind: 'invalid-response' } };
    }
    return {
      data: result.data.map((model: { id: string }) => ({
        id: model.id,
        name: model.id,
      })),
    };
  } catch {
    return { data: [], error: { kind: 'invalid-response' } };
  }
}
