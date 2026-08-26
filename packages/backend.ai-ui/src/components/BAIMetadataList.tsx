/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIMetadataList` — Astryx `MetadataList` with an opt-in `bordered` prop that
 frames the list and rules a 1px separator between its items.

 `bordered` preserves the list's own layout: it does not force side labels,
 shade the label column, or reflow the grid — it adds only the outer frame and
 the inter-item separators, on whatever `columns`/`label` layout the list
 already has.

 Independently of `bordered`, the wrapper lightens the item label one step off
 Astryx's `--color-text-secondary` so it reads quieter than its value; nothing
 about the layout changes.

 The paint is one class; declarations live in `BAIMetadataList.css`, entirely
 in design tokens. See that file's header for why it is CSS and how the rules
 are drawn as the grid gap.
*/
import './BAIMetadataList.css';
import {
  MetadataList,
  MetadataListItem,
  type MetadataListItemProps,
  type MetadataListProps,
} from '@astryxdesign/core/MetadataList';
import React, { type ReactNode } from 'react';

export interface BAIMetadataListProps extends MetadataListProps {
  /**
   * Frames the whole list and draws a 1px separator between every item.
   *
   * It does not change the layout: the label position, `columns` and item
   * order stay whatever the list already uses (a multi-column list keeps its
   * stacked labels). Unlike antd `Descriptions bordered`, it neither forces
   * side labels nor shades the label column — only the frame and the
   * inter-item rules are added.
   */
  bordered?: boolean;
  /**
   * Sets the bordered cell padding (`'default'` 16px/24px, `'middle'`
   * 12px/24px, `'small'` 8px/16px) and has no effect without `bordered`.
   */
  size?: 'default' | 'middle' | 'small';
}

const BAIMetadataList: React.FC<BAIMetadataListProps> = ({
  bordered = false,
  size = 'default',
  className,
  children,
  ...metadataListProps
}) => {
  'use memo';
  return (
    <MetadataList
      {...metadataListProps}
      className={[
        'bai-metadata-list',
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

/**
 * Astryx types `label` as `string`, but `MetadataListItem` renders it as a JSX
 * child with no attribute path, so a node works (CONVERSION-IDIOMS §3).
 */
export interface BAIMetadataListItemProps extends Omit<
  MetadataListItemProps,
  'label'
> {
  label: ReactNode;
}

export const BAIMetadataListItem: React.FC<BAIMetadataListItemProps> = ({
  label,
  ...metadataListItemProps
}) => {
  'use memo';
  return (
    <MetadataListItem {...metadataListItemProps} label={label as string} />
  );
};

BAIMetadataListItem.displayName = 'BAIMetadataListItem';

export default BAIMetadataList;
