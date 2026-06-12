/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import ChatTokenCounter from './ChatTokenCounter';
import { act, render, screen } from '@testing-library/react';
import type { UIMessage } from 'ai';
import React from 'react';

// Mock useTokenCount as a synchronous function returning str.length (1 token per character).
// This lets us assert on what string ChatTokenCounter actually passes down — the string's
// length directly reflects which parts were included — without needing gpt-tokenizer.
vi.mock('../../hooks/useTokenizer', () => ({
  useTokenCount: (str: string = '') => str.length,
}));

vi.mock('backend.ai-ui', () => ({
  BAIFlex: ({ children }: { children: React.ReactNode }) => (
    <React.Fragment>{children}</React.Fragment>
  ),
  BAIQuestionIconWithTooltip: () => null,
}));

vi.mock('i18next', () => ({
  t: (key: string) => key,
}));

const makeAssistantMessage = (
  parts: Array<{ type: string; text: string }>,
  metadata?: Record<string, unknown>,
): UIMessage =>
  ({
    id: 'msg-1',
    role: 'assistant',
    content: '',
    parts,
    ...(metadata ? { metadata } : {}),
  }) as unknown as UIMessage;

describe('ChatTokenCounter', () => {
  describe('reasoning part inclusion (FR-3091)', () => {
    it('counts text-only parts', () => {
      const messages = [
        makeAssistantMessage([{ type: 'text', text: 'hello' }]),
      ];
      render(
        <ChatTokenCounter
          input=""
          messages={messages}
          startTime={null}
          endTime={null}
        />,
      );
      expect(screen.getByText('5')).toBeTruthy(); // 'hello'.length = 5
    });

    it('includes reasoning-only parts in token count', () => {
      // Before fix: `type === 'text'` filter excluded reasoning → 0 displayed.
      const messages = [
        makeAssistantMessage([{ type: 'reasoning', text: 'think' }]),
      ];
      render(
        <ChatTokenCounter
          input=""
          messages={messages}
          startTime={null}
          endTime={null}
        />,
      );
      expect(screen.getByText('5')).toBeTruthy(); // 'think'.length = 5
    });

    it('sums text and reasoning parts', () => {
      // Before fix: 'think' (5) was excluded → only 'answer' (6) counted → 6 displayed.
      const messages = [
        makeAssistantMessage([
          { type: 'reasoning', text: 'think' },
          { type: 'text', text: 'answer' },
        ]),
      ];
      render(
        <ChatTokenCounter
          input=""
          messages={messages}
          startTime={null}
          endTime={null}
        />,
      );
      expect(screen.getByText('11')).toBeTruthy(); // 5 + 6 = 11
    });

    it('uses reasoning tokens in TPS numerator', () => {
      // Before fix: lastAssistantTokenCount = 0 (no text parts) → TPS guard fails → 0.0.
      // 'thinking'.length = 8 tokens over exactly 2 s → 4.0 TPS.
      const messages = [
        makeAssistantMessage([{ type: 'reasoning', text: 'thinking' }]),
      ];
      const startTime = 1_000_000;
      const endTime = startTime + 2_000;
      render(
        <ChatTokenCounter
          input=""
          messages={messages}
          startTime={startTime}
          endTime={endTime}
        />,
      );
      expect(screen.getByText('4.0')).toBeTruthy();
    });
  });

  describe('model-reported usage tokens (FR-3091)', () => {
    it('uses metadata.outputTokens for TPS instead of the tokenizer estimate', () => {
      // Estimate would be 100 (text length) → 100/2s = 50.0. The model reported
      // 40 output tokens → 40/2s = 20.0 must win.
      const messages = [
        makeAssistantMessage([{ type: 'text', text: 'x'.repeat(100) }], {
          outputTokens: 40,
        }),
      ];
      const startTime = 1_000_000;
      render(
        <ChatTokenCounter
          input=""
          messages={messages}
          startTime={startTime}
          endTime={startTime + 2_000}
        />,
      );
      expect(screen.getByText('20.0')).toBeTruthy();
    });

    it('falls back to the estimate when usage metadata is absent', () => {
      // No metadata → estimate (100) / 2s = 50.0.
      const messages = [
        makeAssistantMessage([{ type: 'text', text: 'x'.repeat(100) }]),
      ];
      const startTime = 1_000_000;
      render(
        <ChatTokenCounter
          input=""
          messages={messages}
          startTime={startTime}
          endTime={startTime + 2_000}
        />,
      );
      expect(screen.getByText('50.0')).toBeTruthy();
    });
  });

  describe('elapsed denominator sampled at token-count updates (FR-3091)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(1_000_000);
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    // The denominator timestamp is captured when the token count changes, not on
    // a timer. This guards two things at once:
    //   1. The React Compiler freeze fix: reading Date.now() in render would
    //      memoize the denominator on startTime/endTime only and freeze it,
    //      inflating TPS during streaming. Sampling in an effect keeps time out
    //      of render.
    //   2. The new semantics (replacing the 200ms tick): pure wall-clock passage
    //      with no new tokens must NOT change the display (no cosmetic decay);
    //      only a token-count change re-samples the clock.
    it('updates TPS on token-count change and holds steady while only time passes', () => {
      const startTime = 1_000_000 - 1_000; // started 1s ago
      const { rerender } = render(
        <ChatTokenCounter
          input=""
          messages={[
            makeAssistantMessage([{ type: 'text', text: 'x'.repeat(100) }]),
          ]}
          startTime={startTime}
          endTime={null}
        />,
      );
      // Mount samples now = 1_000_000 → 100 tokens / 1s = 100.0.
      expect(screen.getByText('100.0')).toBeTruthy();

      // 1s of wall-clock passes with no new tokens → denominator must hold.
      // (A ticking timer would have decayed this to 50.0.)
      act(() => {
        vi.advanceTimersByTime(1_000);
      });
      expect(screen.getByText('100.0')).toBeTruthy();

      // A larger token count arrives at clock = 1_001_000 → re-sample the wall
      // clock: 300 tokens / 2s = 150.0.
      rerender(
        <ChatTokenCounter
          input=""
          messages={[
            makeAssistantMessage([{ type: 'text', text: 'x'.repeat(300) }]),
          ]}
          startTime={startTime}
          endTime={null}
        />,
      );
      act(() => {});
      expect(screen.getByText('150.0')).toBeTruthy();
    });
  });
});
