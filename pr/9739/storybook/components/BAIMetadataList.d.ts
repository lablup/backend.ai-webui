import { MetadataListItemProps, MetadataListProps } from '@astryxdesign/core/MetadataList';
import { default as React, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
declare const BAIMetadataList: React.FC<BAIMetadataListProps>;
/**
 * Astryx types `label` as `string`, but `MetadataListItem` renders it as a JSX
 * child with no attribute path, so a node works (CONVERSION-IDIOMS §3).
 */
export interface BAIMetadataListItemProps extends Omit<MetadataListItemProps, 'label'> {
    label: ReactNode;
}
export declare const BAIMetadataListItem: React.FC<BAIMetadataListItemProps>;
export default BAIMetadataList;
