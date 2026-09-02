/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import React from 'react';

/**
 * The Fluent Emoji asset families. Matches the set `@lobehub/fluent-emoji`
 * exposed as `EmojiType` — kept as a local type since ticket 30 removed that
 * package (it pulled `antd`, `antd-style` and `@lobehub/ui` in behind it for
 * the sake of one URL-template function).
 */
export type EmojiType = 'anim' | 'flat' | 'modern' | 'mono' | '3d';

const CUSTOM_CDN_URL = '/resources/fluentemoji/{type}/assets/{emoji}.{ext}';

/**
 * `😀` → `1f600`, `👨‍👩‍👧` → `1f468-200d-1f469-200d-1f467`.
 *
 * Iterating the string (rather than indexing it) walks whole code points, so
 * surrogate pairs and ZWJ sequences both come out right. This is the same
 * mapping the upstream `emojiToUnicode` did, and it is what the asset file
 * names under `/resources/fluentemoji/` are keyed by — do not "simplify" it to
 * `charCodeAt`.
 */
function emojiToUnicode(emoji: string): string {
  return [...emoji].map((char) => char.codePointAt(0)?.toString(16)).join('-');
}

/**
 * Build the local asset URL for a Fluent Emoji glyph.
 *
 * This is the custom-URL-template branch of the upstream `getFluentEmojiCDN`
 * — the only branch this app ever took, because `CUSTOM_CDN_URL` points at the
 * emoji copied into `resources/` rather than at a public CDN. The upstream
 * npm-registry / unpkg branches are deliberately NOT reproduced: shipping the
 * assets locally is the whole point (no third-party asset host at runtime).
 *
 * `anim` and `3d` are raster (`.webp`); the rest are `.svg` — same rule as
 * upstream, and the same rule the files in `resources/fluentemoji/` follow.
 */
export function getFluentEmojiURL(emoji: string, config: { type: EmojiType }) {
  const ext = config.type === 'anim' || config.type === '3d' ? 'webp' : 'svg';
  return CUSTOM_CDN_URL.replace('{emoji}', emojiToUnicode(emoji))
    .replace('{ext}', ext)
    .replace('{type}', config.type);
}

/**
 * A component that displays Fluent Emoji icons by loading them from the local
 * `/resources/fluentemoji` folder.
 *
 * @remarks
 * This component is designed to avoid bundling emoji assets directly into the
 * React bundle. Instead, it loads only the necessary emoji images on-demand,
 * which significantly reduces the bundle size.
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
