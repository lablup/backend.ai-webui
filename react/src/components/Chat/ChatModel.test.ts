/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  type ChatMessage,
  withoutStorageDroppedAttachments,
} from './ChatModel';

describe('withoutStorageDroppedAttachments', () => {
  it('drops only the file parts whose payload was stripped for storage', () => {
    const messages: ChatMessage[] = [
      {
        id: 'm1',
        role: 'user',
        parts: [
          { type: 'text', text: 'look at these' },
          { type: 'file', mediaType: 'image/png', filename: 'a.png', url: '' },
          {
            type: 'file',
            mediaType: 'image/png',
            filename: 'b.png',
            url: 'data:image/png;base64,AAAA',
          },
        ],
      },
    ];

    const [result] = withoutStorageDroppedAttachments(messages);

    expect(result.parts).toEqual([
      { type: 'text', text: 'look at these' },
      {
        type: 'file',
        mediaType: 'image/png',
        filename: 'b.png',
        url: 'data:image/png;base64,AAAA',
      },
    ]);
    // The stored copy keeps its placeholder for rendering.
    expect(messages[0].parts).toHaveLength(3);
  });

  it('returns messages without placeholders unchanged', () => {
    const message: ChatMessage = {
      id: 'm2',
      role: 'assistant',
      parts: [{ type: 'text', text: 'hi' }],
    };
    expect(withoutStorageDroppedAttachments([message])[0]).toBe(message);
  });
});
