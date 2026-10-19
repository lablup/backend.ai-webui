import { UnitGridLayout } from './BAIResourceUnitGrid.geometry';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIUnitGridUnit {
    /** Resolved fill color of this unit cell. */
    color: string;
    /** 0..1 partial fill of this unit (fraction cells render bottom-up). */
    fraction?: number;
}
export interface BAIUnitGridGroup {
    key: string;
    /** Shown as the group initial and the popover chrome; falls back to `key`. */
    label?: string;
    units: BAIUnitGridUnit[];
    /** Plate outline style; 'dashed' marks a group as visually tentative. */
    plateVariant?: 'solid' | 'dashed';
}
export interface BAIResourceUnitGridProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
    groups: BAIUnitGridGroup[];
    layout?: UnitGridLayout;
    /** Resolved group hues; defaults to the component's token-backed muted 7-set. */
    groupPalette?: string[];
    /** Controlled per-group palette-index overrides, keyed by `group.key`. */
    hueOverrides?: Record<string, number>;
    /** Enables the popover's palette picker row when provided. */
    onHueOverrideChange?: (key: string, paletteIdx: number) => void;
    legendItems?: Array<{
        color: string;
        label: string;
    }>;
    renderGroupPopover?: (group: BAIUnitGridGroup, ctx: {
        hue: string;
        closePopover: () => void;
    }) => React.ReactNode;
    onClickGroup?: (key: string) => void;
    emptyFallback?: React.ReactNode;
    maxUnitsPerGroup?: number;
    /**
     * Fixed lattice column count. When omitted the count is derived from the
     * measured wrapper width (ResizeObserver); pass it for fixed layouts and
     * for jsdom tests, where no real layout exists.
     */
    columns?: number;
}
declare const BAIResourceUnitGrid: React.FC<BAIResourceUnitGridProps>;
export default BAIResourceUnitGrid;
