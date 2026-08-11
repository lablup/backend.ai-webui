/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIMetadataList` — Astryx `MetadataList` plus antd's `Descriptions bordered`
 look (to-astryx approved-2).

 Astryx's `MetadataList` is the destination the conversion picked for antd
 `Descriptions` (MAPPING §4), and it covers the plain variant exactly. It has
 no counterpart for `bordered`, so every converted call site dropped the prop
 — twenty-odd of them, each with a PILOT-DECISION note saying so
 (`git grep -n bordered origin/main -- react/src` for the
 originals). This wrapper gives that look back as an opt-in `bordered` prop,
 so both variants coexist and adopting it is a per-surface choice rather than
 a global restyle.

 `bordered` is purely paint: one class, and the declarations live in
 `BAIMetadataList.css`, entirely in design tokens. See that file's header for
 WHY it is CSS and not a `defineTheme` variant, for the antd metric each
 declaration reproduces, and for why the rules are drawn as the grid gap.

 Not bordered? The component is a pass-through — no class, no CSS reached, and
 the render is byte-for-byte Astryx's.
*/
import './BAIMetadataList.css';
import {
  MetadataList,
  type MetadataListProps,
} from '@astryxdesign/core/MetadataList';
import React from 'react';

export interface BAIMetadataListProps extends MetadataListProps {
  /**
   * antd `Descriptions.bordered`. Frames the list and rules it into
   * label/value cells, with the label column on a muted fill.
   *
   * Bordered implies SIDE labels: antd's bordered layout is a table whose
   * label is always the leading cell, and the rules only make sense against a
   * `label`/`value` track pair. So a bordered list defaults to
   * `label={{ position: 'start' }}` even at multi-column widths, where plain
   * Astryx would default to stacked labels. An explicit `label` prop still
   * wins — `position: 'top'` plus `bordered` has no antd equivalent and is not
   * styled.
   */
  bordered?: boolean;
  /**
   * antd `Descriptions.size`. Sets the bordered cell padding
   * (`'default'` 16px/24px, `'middle'` 12px/24px, `'small'` 8px/16px) and has
   * no effect without `bordered` — as in antd, where `size` only feeds the
   * bordered cell rules.
   */
  size?: 'default' | 'middle' | 'small';
}

const SIDE_LABELS = { position: 'start' } as const;

const BAIMetadataList: React.FC<BAIMetadataListProps> = ({
  bordered = false,
  size = 'default',
  label,
  className,
  children,
  ...metadataListProps
}) => {
  'use memo';
  return (
    <MetadataList
      {...metadataListProps}
      label={label ?? (bordered ? SIDE_LABELS : undefined)}
      className={[
        bordered ? 'bai-metadata-list--bordered' : '',
        bordered && size !== 'default'
          ? `bai-metadata-list--bordered-${size}`
          : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </MetadataList>
  );
};

BAIMetadataList.displayName = 'BAIMetadataList';

export default BAIMetadataList;
