import { SkeletonProps } from '@astryxdesign/core/Skeleton';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export type BAISkeletonVariant = 'block' | 'paragraph' | 'input' | 'button';
/** antd's `size` on `Skeleton.Input` / `Skeleton.Button`. */
export type BAISkeletonSize = 'small' | 'default' | 'large';
export interface BAISkeletonProps extends Omit<SkeletonProps, 'height' | 'index'> {
    /**
     * Which antd skeleton shape this stands in for.
     * - `paragraph` (default): title bar + `rows` lines — antd's `<Skeleton />`
     * - `block`: a single box — `width`/`height` are yours
     * - `input`: a control-height filled box — antd's `<Skeleton.Input />`
     * - `button`: a control-height box of button width
     * @default 'paragraph'
     */
    variant?: BAISkeletonVariant;
    /**
     * Paragraph line count. antd's `paragraph={{ rows: n }}`.
     * @default 3
     */
    rows?: number;
    /**
     * Render the title bar above the paragraph. antd's `title`.
     * @default true
     */
    hasTitle?: boolean;
    /**
     * Render a round avatar to the left of the lines. antd's `avatar`.
     * @default false
     */
    hasAvatar?: boolean;
    /** `input` / `button` height, via the Astryx element-size tokens. */
    size?: BAISkeletonSize;
    /** `block` / `input` / `button` box height. Astryx `Skeleton.height`. */
    height?: SkeletonProps['height'];
    /**
     * Stagger offset for the first box. Successive boxes increment from here, so
     * two adjacent skeletons can share one continuous wave.
     * @default 0
     */
    startIndex?: number;
}
declare const BAISkeleton: React.FC<BAISkeletonProps>;
export default BAISkeleton;
