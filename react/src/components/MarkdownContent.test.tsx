/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for MarkdownContent (FR-3402).
 *
 * These pin the fenced-code contract that review surfaced, all of which the
 * type checker cannot see:
 *   - the language token is taken whole (`git-commit`, `c#`), not truncated
 *     at the first non-word character, since `useHighlight` keys off the
 *     full identifier;
 *   - block-vs-inline comes from the element tree, so a CommonMark code span
 *     that wraps across a newline stays inline instead of becoming a panel;
 *   - the panel replaces the `pre` rather than nesting inside it, which would
 *     put block elements (and a second `pre`) inside a preformatted element.
 *
 * The highlighter is mocked: shiki's async tokenization is irrelevant here,
 * and stubbing it lets each test read back the language it was handed.
 */
import MarkdownContent from './MarkdownContent';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./Chat/SyntaxHighlighter', () => ({
  SyntaxHighlighter: ({
    children,
    language,
  }: {
    children: string;
    language: string;
  }) => (
    <pre data-testid="code-block" data-language={language}>
      {children}
    </pre>
  ),
}));

describe('MarkdownContent fenced code', () => {
  it.each([
    ['git-commit', 'git-commit'],
    ['objective-c', 'objective-c'],
    ['c#', 'c#'],
    ['f#', 'f#'],
    ['ts', 'ts'],
  ])('passes the whole `%s` language token through', (lang, expected) => {
    render(
      <MarkdownContent>{`\`\`\`${lang}\nconst a = 1;\n\`\`\``}</MarkdownContent>,
    );

    expect(screen.getByTestId('code-block')).toHaveAttribute(
      'data-language',
      expected,
    );
  });

  it('falls back to `txt` for a fence with no language', () => {
    render(<MarkdownContent>{'```\nplain\n```'}</MarkdownContent>);

    expect(screen.getByTestId('code-block')).toHaveAttribute(
      'data-language',
      'txt',
    );
    expect(screen.getByTestId('code-block')).toHaveTextContent('plain');
  });

  it('renders the panel outside any `pre`, with no nested block elements', () => {
    const { container } = render(
      <MarkdownContent>{'```ts\nconst a = 1;\n```'}</MarkdownContent>,
    );

    // A `pre` takes phrasing content only — neither a nested `pre` nor a
    // block-level `div` may appear inside one.
    expect(container.querySelector('pre pre')).toBeNull();
    expect(container.querySelector('pre div')).toBeNull();
  });

  it('keeps a code span that wraps across a newline inline', () => {
    const { container } = render(
      <MarkdownContent>{'Text with `inline\ncode` span.'}</MarkdownContent>,
    );

    expect(screen.queryByTestId('code-block')).toBeNull();
    const inline = container.querySelector('p > code');
    expect(inline).not.toBeNull();
    expect(inline).toHaveTextContent('inline code');
  });

  it('keeps ordinary inline code inline', () => {
    const { container } = render(
      <MarkdownContent>{'Run `pnpm install` first.'}</MarkdownContent>,
    );

    expect(screen.queryByTestId('code-block')).toBeNull();
    expect(container.querySelector('p > code')).toHaveTextContent(
      'pnpm install',
    );
  });
});
