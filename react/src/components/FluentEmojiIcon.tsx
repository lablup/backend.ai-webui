// Always use this component instead of directly importing `FluentEmoji` from `@lobehub/fluent-emoji`.
// eslint-disable-next-line no-restricted-imports
import { getFluentEmojiCDN as originalGetFluentEmojiCDN } from '@lobehub/fluent-emoji';
// eslint-disable-next-line no-restricted-imports
import { EmojiType } from '@lobehub/fluent-emoji/es/getFluentEmojiCDN/utils';
import React from 'react';

const CUSTOM_CDN_URL = '/resources/fluentemoji/{type}/assets/{emoji}.{ext}';

export function getFluentEmojiURL(emoji: string, config: { type: EmojiType }) {
  return originalGetFluentEmojiCDN(emoji, {
    type: config.type,
    cdn: CUSTOM_CDN_URL,
  });
}

/**
 * A component that displays Fluent Emoji icons by loading them from a CDN or local resources.
 *
 * @remarks
 * This component is designed to avoid bundling emoji assets directly into the React bundle.
 * Instead, it loads only the necessary emoji images on-demand from the `/resources/fluentemoji` folder
 * or CDN, which significantly reduces the bundle size.
 *
 * @param props - Component properties
 * @param props.emoji - The emoji character to display (default: '😀')
 * @param props.height - The height of the emoji image in pixels
 * @param props.width - The width of the emoji image in pixels
 *
 * @example
 * ```tsx
 * <FluentEmojiIcon emoji="🎉" width={32} height={32} />
 * ```
 *
 * @eslint-disable-next-line no-restricted-imports
 * The restricted-imports rule is disabled here because this is the designated wrapper component
 * that properly handles emoji loading without bundling assets. This is the only place where
 * importing from `@lobehub/fluent-emoji` is allowed.
 */
export const FluentEmojiIcon: React.FC<{
  emoji?: string;
  height?: string | number;
  width?: string | number;
}> = ({ emoji = '😀', height = '1em', width = '1em' }) => {
  return (
    <img
      width={width}
      height={height}
      src={getFluentEmojiURL(emoji, { type: '3d' })}
      alt={emoji}
    />
  );
};
