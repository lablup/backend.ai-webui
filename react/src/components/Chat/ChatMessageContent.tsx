/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import MarkdownContent from '../MarkdownContent';
import CopyButton from './CopyButton';
import { marked } from 'marked';
import React, { memo } from 'react';

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

// Per-block splitting (via `marked.lexer` above) lets each finished block
// memoize independently while streaming: only the currently-growing block
// re-renders on each token, since its `block` string is the only one whose
// identity changes. Each block renders through the shared `MarkdownContent`
// (FR-3402) with `isStreaming` so it gets the same typography and
// fenced-code panel every other call site uses.
const ChatMessageContentBlock = memo<{ block?: string; isStreaming?: boolean }>(
  ({ block, isStreaming }) => {
    'use memo';

    return (
      <MarkdownContent
        isStreaming={isStreaming}
        codeBlockExtra={(code) => (
          <CopyButton
            type="text"
            copyable={{ text: code }}
            style={{ display: isStreaming ? 'none' : 'block' }}
          />
        )}
      >
        {block ?? ''}
      </MarkdownContent>
    );
  },
);

ChatMessageContentBlock.displayName = 'ChatMessageContentBlock';

const ChatMessageContent: React.FC<{
  children?: string;
  isStreaming?: boolean;
}> = ({ children, isStreaming }) => {
  'use memo';

  const blocks = parseMarkdownIntoBlocks(children ?? '');

  return blocks.map((block, index) => (
    <ChatMessageContentBlock
      block={block}
      key={`block_${index}`}
      isStreaming={isStreaming}
    />
  ));
};

ChatMessageContent.displayName = 'ChatMessageContent';

export default memo(ChatMessageContent);
