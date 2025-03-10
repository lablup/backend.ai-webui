import * as fluentEmoji from '@iconify-json/fluent-emoji-flat';
import React from 'react';

export const FluentEmojiIcon: React.FC<{
  name?: string;
  height?: number;
  width?: number;
}> = ({ name, height, width }) => {
  const icon = fluentEmoji.icons.icons[name ?? 'pure'];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      height={height}
      width={width}
      role="img"
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
};
