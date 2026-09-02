/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 to-astryx TICKET 30 — the local replacement for `@lobehub/icons`.

 ## Why this exists

 `@lobehub/icons` declares `@lobehub/ui` as a peerDependency. With
 `auto-install-peers` on, installing the icon set pulled the whole LobeHub
 component library into the tree — and with it `rc-collapse`, `rc-footer`,
 `rc-image`, `rc-input-number` and `rc-menu`, the LAST non-antd `rc-*` paths in
 the lockfile. Three files used the package, for a total of 36 brand glyphs.
 The glyphs are MIT-licensed static SVG, so they are vendored here (see
 `generated/`, produced once by the extractor documented in the ticket) and the
 dependency — plus its ~30 MB peer — is gone.

 ## Shape

 `createBrandIcon` returns a component with the same call surface the three
 consumers used from `@lobehub/icons`' `IconType`: `size`, `style`, `className`.
 The consumers keep their lazy `import()` loaders (one chunk per brand), so the
 bundle only ever carries the brands a page actually renders — the property
 that made the vendored set affordable in the first place.

 ## Why `dangerouslySetInnerHTML`

 The bodies are build-time-extracted static strings — no user input reaches
 them. Several brand marks are multi-path with `<linearGradient>` defs, and
 keeping the markup verbatim is what guarantees the vendored glyph is pixel-
 identical to what shipped before. Re-expressing them as hand-written JSX would
 mean 36 opportunities to silently mangle a path. The gradient ids are rewritten
 at extraction time to a stable `bai-brand-<brand>-<variant>-<n>` token, so two
 instances of the SAME icon share an id (valid enough — the browser resolves to
 the first, and the defs are identical) while different icons never collide.
*/
import React from 'react';

export interface BrandIconProps {
  /** Rendered `width`/`height`. `'1em'` tracks the surrounding font size. */
  size?: number | string;
  style?: React.CSSProperties;
  className?: string;
  /** Overrides the accessible name; pass `null` to drop the `<title>`. */
  title?: string | null;
}

/**
 * The component shape the brand-icon loaders resolve to. Named after — and
 * structurally compatible with — `@lobehub/icons`' `IconType`, so the
 * consumers' `Promise<{ default: BrandIconType }>` loader maps stayed as-is.
 */
export type BrandIconType = React.FC<BrandIconProps>;

interface BrandIconSpec {
  /** Brand name; the default accessible `<title>`. */
  title: string;
  viewBox: string;
  /** Root `fill` (Mono glyphs use `currentColor`; Color glyphs set it per path). */
  fill?: string;
  fillRule?: string;
  /** Static inner SVG markup, extracted at build time. */
  body: string;
}

export function createBrandIcon(spec: BrandIconSpec): BrandIconType {
  const BrandIcon: BrandIconType = ({
    size = '1em',
    style,
    className,
    title,
  }) => {
    'use memo';
    const accessibleName = title === undefined ? spec.title : title;
    return (
      <svg
        className={className}
        width={size}
        height={size}
        viewBox={spec.viewBox}
        fill={spec.fill}
        fillRule={spec.fillRule as React.SVGProps<SVGSVGElement>['fillRule']}
        xmlns="http://www.w3.org/2000/svg"
        role={accessibleName === null ? 'presentation' : 'img'}
        aria-hidden={accessibleName === null ? true : undefined}
        style={{ flex: 'none', lineHeight: 1, ...style }}
        dangerouslySetInnerHTML={{
          __html:
            (accessibleName === null
              ? ''
              : `<title>${escapeXml(accessibleName)}</title>`) + spec.body,
        }}
      />
    );
  };
  BrandIcon.displayName = `BrandIcon(${spec.title})`;
  return BrandIcon;
}

/** Titles are brand names from the map below, but escape anyway — the string
 *  is concatenated into markup. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
