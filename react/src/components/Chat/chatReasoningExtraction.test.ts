/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Pins the reasoning-extraction contract `ChatCard` relies on, and records why
 * the obvious client-side fix was rejected (FR-3466).
 *
 * Qwen3-style models are handed an opening `<think>` by their chat template,
 * so the response begins *inside* reasoning and only emits the closing
 * `</think>`. With the AI SDK's default (`startWithReasoning: false`) the
 * middleware waits for an opening tag that never arrives, so the reasoning
 * stays inline in the answer and the orphan `</think>` reaches the markdown
 * renderer — which escapes unknown tags and shows them as literal text.
 *
 * `startWithReasoning: true` looks like the fix and is **not** one. On the
 * streaming path — the one `ChatCard` uses via `streamText` — a model that
 * emits no think tags never leaves reasoning mode, so its entire answer is
 * routed to the collapsed panel and the visible message is empty. The
 * non-streaming path passes the same input through untouched, so the two
 * disagree and only a streaming test catches it.
 *
 * These assertions keep both behaviours visible, so the flag is not enabled
 * again on the strength of the non-streaming path alone, and so an `ai`
 * upgrade that changes the semantics fails loudly.
 */
import { extractReasoningMiddleware } from 'ai';
import { describe, expect, it } from 'vitest';

const extract = async (text: string, startWithReasoning: boolean) => {
  const middleware = extractReasoningMiddleware({
    tagName: 'think',
    startWithReasoning,
  });
  const result = await middleware.wrapGenerate?.({
    doGenerate: async () => ({ content: [{ type: 'text', text }] }),
  } as never);
  const content = (result as { content: Array<{ type: string; text: string }> })
    .content;

  return {
    reasoning: content.find((part) => part.type === 'reasoning')?.text,
    text: content.find((part) => part.type === 'text')?.text ?? '',
  };
};

/**
 * `ChatCard` calls `streamText`, so production runs through `wrapStream`, not
 * `wrapGenerate`. These feed the middleware a chunked stream — including a
 * closing tag split across two chunks, which is the boundary a buffer bug
 * would fall through.
 */
const streamExtract = async (deltas: string[], startWithReasoning: boolean) => {
  const middleware = extractReasoningMiddleware({
    tagName: 'think',
    startWithReasoning,
  });
  const doStream = async () => ({
    stream: new ReadableStream({
      start(controller) {
        controller.enqueue({ type: 'text-start', id: 'c1' });
        for (const delta of deltas) {
          controller.enqueue({ type: 'text-delta', id: 'c1', delta });
        }
        controller.enqueue({ type: 'text-end', id: 'c1' });
        controller.close();
      },
    }),
  });

  const { stream } = (await middleware.wrapStream?.({ doStream } as never)) as {
    stream: ReadableStream<{ type: string; delta?: string }>;
  };

  const chunks: Array<{ type: string; delta?: string }> = [];
  const reader = stream.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const join = (type: string) =>
    chunks
      .filter((chunk) => chunk.type === type)
      .map((chunk) => chunk.delta ?? '')
      .join('');

  return { reasoning: join('reasoning-delta'), text: join('text-delta') };
};

describe('extractReasoningMiddleware streaming (the path ChatCard uses)', () => {
  it('extracts reasoning when the closing tag arrives in one chunk', async () => {
    const { reasoning, text } = await streamExtract(
      ['Let me work through it.', '\n</think>\n\n', '# Answer'],
      true,
    );

    expect(reasoning.trim()).toBe('Let me work through it.');
    expect(text).toContain('# Answer');
    expect(text).not.toContain('think>');
  });

  it('extracts reasoning when the closing tag is split across chunks', async () => {
    const { reasoning, text } = await streamExtract(
      ['Let me work through it.\n</thi', 'nk>\n\n# Answer'],
      true,
    );

    expect(reasoning.trim()).toBe('Let me work through it.');
    expect(text).toContain('# Answer');
    // The split must not leak either half of the tag into the answer.
    expect(text).not.toContain('think>');
    expect(text).not.toContain('</thi');
  });

  // ⚠️ The streaming path does NOT behave like `wrapGenerate` here.
  //
  // With no closing tag the stream never leaves reasoning mode, so the entire
  // answer is emitted as `reasoning-delta` and the visible message is empty.
  // `wrapGenerate` passes the same input straight through as text (asserted
  // below in the non-streaming suite). Since `ChatCard` streams, enabling
  // `startWithReasoning` globally would hide the whole reply for every model
  // that does not emit think tags — which is most of them.
  //
  // This asymmetry is why the flag must be gated rather than applied to every
  // client-fetched model.
  it('swallows the whole answer when no tag ever arrives (hazard)', async () => {
    const { reasoning, text } = await streamExtract(
      ['The capital of ', 'France is Paris.'],
      true,
    );

    expect(reasoning).toBe('The capital of France is Paris.');
    expect(text).toBe('');
  });

  it('is safe for a tagless model when the flag is off', async () => {
    const { reasoning, text } = await streamExtract(
      ['The capital of ', 'France is Paris.'],
      false,
    );

    expect(reasoning).toBe('');
    expect(text).toBe('The capital of France is Paris.');
  });
});

describe('extractReasoningMiddleware for chat', () => {
  // The shape this endpoint actually returns — verified against a live
  // qwen3.5-4b deployment, which emits no opening tag.
  const qwen3Style =
    'Let me create a clear solution.\n</think>\n\n# Reverse a Linked List';

  it('leaves an orphan closing tag in the answer with the SDK default', async () => {
    const { reasoning, text } = await extract(qwen3Style, false);

    expect(reasoning).toBeUndefined();
    expect(text).toContain('</think>');
  });

  it('extracts the reasoning and drops the tag when starting in reasoning', async () => {
    const { reasoning, text } = await extract(qwen3Style, true);

    expect(reasoning?.trim()).toBe('Let me create a clear solution.');
    expect(text).not.toContain('</think>');
    expect(text).toContain('# Reverse a Linked List');
  });

  it('passes text through untouched when the model emits no tags at all', async () => {
    const plain = 'Just a plain answer with no reasoning.';
    const { reasoning, text } = await extract(plain, true);

    expect(reasoning).toBeUndefined();
    expect(text).toBe(plain);
  });

  // The one cost of this setting: a model that *does* emit the opening tag
  // has it prepended a second time, so the literal `<think>` lands at the
  // head of the reasoning text. The answer is still clean, and the reasoning
  // panel is collapsed by default, so this is cosmetic — recorded here so the
  // tradeoff is visible rather than surprising.
  it('still extracts when a model does emit the opening tag', async () => {
    const { reasoning, text } = await extract(
      '<think>weighing options</think>Final answer.',
      true,
    );

    expect(reasoning).toContain('weighing options');
    expect(reasoning).toBe('<think>weighing options');
    expect(text).toContain('Final answer.');
    expect(text).not.toContain('think>');
  });
});
