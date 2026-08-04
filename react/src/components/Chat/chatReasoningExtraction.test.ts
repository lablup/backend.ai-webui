/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Pins the reasoning-extraction contract `ChatCard` relies on.
 *
 * Qwen3-style models are handed an opening `<think>` by their chat template,
 * so the response begins *inside* reasoning and only emits the closing
 * `</think>`. With the AI SDK's default (`startWithReasoning: false`) the
 * middleware waits for an opening tag that never arrives, so the reasoning
 * stays inline in the answer and the orphan `</think>` reaches the markdown
 * renderer — which escapes unknown tags and shows them as literal text.
 *
 * These assertions guard the `startWithReasoning: true` decision against an
 * `ai` upgrade quietly changing the semantics underneath it.
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
