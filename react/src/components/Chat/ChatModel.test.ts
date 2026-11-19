/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { getAIErrorMessage } from './ChatModel';
import { APICallError } from 'ai';

const callError = (responseBody?: string) =>
  new APICallError({
    message: 'Bad Request',
    url: 'http://example/v1/chat/completions',
    requestBodyValues: {},
    statusCode: 400,
    responseBody,
  });

describe('getAIErrorMessage', () => {
  it('reads a top-level message', () => {
    expect(getAIErrorMessage(callError('{"message":"quota exceeded"}'))).toBe(
      'quota exceeded',
    );
  });

  it('reads the message an OpenAI-style server nests under error', () => {
    expect(
      getAIErrorMessage(
        callError(
          '{"error":{"code":400,"message":"request (4516 tokens) exceeds the available context size (4096 tokens), try increasing it","type":"exceed_context_size_error"}}',
        ),
      ),
    ).toBe(
      'request (4516 tokens) exceeds the available context size (4096 tokens), try increasing it',
    );
  });

  it('falls back to the call error message when the body has none', () => {
    expect(getAIErrorMessage(callError('{"detail":"x"}'))).toBe('Bad Request');
    expect(getAIErrorMessage(callError())).toBe('Bad Request');
  });
});
