import { AntdPlacement } from '../helper/astryxPlacement';
import { ResourceSlotName } from './provider';
import { ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export type ResourceOpts = {
    shmem?: number;
};
export interface BAIResourceNumberWithIconProps {
    type: string;
    extra?: ReactNode;
    opts?: ResourceOpts;
    value: string;
    hideTooltip?: boolean;
    max?: string;
    /**
     * Optional reference value rendered after the primary one as
     * `value / comparedValue`, sharing a single unit (e.g. `1 / 2 Core`). Used to
     * show an actual-vs-target pair such as allocated vs. requested resources. The
     * `/ comparedValue` part is rendered in the muted (secondary) text color so it
     * reads as a reference next to the primary value. When set, the whole number
     * group carries an "Allocated / Requested" tooltip explaining the pair —
     * independent of the resource icon's own description tooltip. A compared
     * value that rounds to the same displayed number as `value` is ignored, so
     * sub-display-precision differences never render as `4 / 4 GiB`-style pairs.
     */
    comparedValue?: string;
}
/**
 * Displays a resource value with its corresponding icon and unit.
 * Supports various resource types (CPU, memory, accelerators) with automatic formatting.
 *
 * @param type - Resource type (e.g., 'cpu', 'mem', 'cuda.device', 'rocm.device')
 * @param value - Resource amount as string
 * @param max - Optional maximum value, supports 'Infinity' for unlimited resources
 * @param hideTooltip - When true, hides the tooltip on the resource icon
 * @param opts - Additional options like shmem for memory resources
 * @param extra - Extra content to display after the resource number
 *
 * Unit, number format and icon come from `BAIMetaDataProvider` and
 * `BAIResourceSlotsProvider`. Without the latter, a slot only the server knows
 * about renders with the generic icon and no unit.
 */
declare const BAIResourceNumberWithIcon: ({ type, extra, opts, value: amount, max, hideTooltip, comparedValue, }: BAIResourceNumberWithIconProps) => import("react").JSX.Element;
/**
 * The antd `TooltipProps` subset the two `tooltipProps` call sites actually
 * pass, restated locally so this module carries no antd specifier (P15).
 * Measured: `placement: 'left'` at both sites in `ResourceGroupFairShareTable`.
 */
export interface ResourceTypeIconTooltipProps {
    title?: ReactNode;
    placement?: AntdPlacement;
}
interface ResourceTypeIconProps {
    type: ResourceSlotName | string;
    showTooltip?: boolean;
    tooltipProps?: ResourceTypeIconTooltipProps;
    size?: number;
}
/**
 * The icon half of `BAIResourceNumberWithIcon`, usable on its own. Without
 * `BAIResourceSlotsProvider`, a slot only the server knows about falls back to
 * the generic icon.
 */
export declare const ResourceTypeIcon: ({ type, showTooltip, size, tooltipProps, }: ResourceTypeIconProps) => import("react").JSX.Element;
export default BAIResourceNumberWithIcon;
