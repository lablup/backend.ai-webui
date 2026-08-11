/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 antd placement -> Astryx `placement` + `alignment` (to-astryx phase 3,
 wave 2 / ticket W2-D).

 MAPPING §4: antd's single compound `placement` (`top`, `topLeft`,
 `bottomRight`, …) **splits into two props** everywhere in Astryx — `Tooltip`,
 `Popover`, `HoverCard`, `DropdownMenu` all take `placement` (the axis) plus
 `alignment` (the position along it). The axis vocabulary changes too:
 `top|bottom|left|right` -> `above|below|start|end`.

 Frontier wrappers that keep an antd-shaped `placement` prop route it through
 here rather than each restating the 12-value table.
*/

/** antd's `TooltipPlacement` union, restated locally. */
export type AntdPlacement =
  | 'top'
  | 'left'
  | 'right'
  | 'bottom'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'leftTop'
  | 'leftBottom'
  | 'rightTop'
  | 'rightBottom';

export type AstryxPlacement = 'above' | 'below' | 'start' | 'end';
export type AstryxAlignment = 'start' | 'center' | 'end';

const AXIS: Record<string, AstryxPlacement> = {
  top: 'above',
  bottom: 'below',
  left: 'start',
  right: 'end',
};

/**
 * Split an antd placement into Astryx's `{ placement, alignment }` pair.
 * Both are `undefined` for an absent/unknown value so the component keeps its
 * own defaults (`above` / `center`).
 */
export const splitAntdPlacement = (
  placement?: AntdPlacement | string | null,
): { placement?: AstryxPlacement; alignment?: AstryxAlignment } => {
  if (!placement) return {};
  const match = /^(top|bottom|left|right)(Left|Right|Top|Bottom)?$/.exec(
    placement,
  );
  if (!match) return {};
  const axis = AXIS[match[1]];
  const side = match[2];
  const alignment: AstryxAlignment | undefined =
    side === 'Left' || side === 'Top'
      ? 'start'
      : side === 'Right' || side === 'Bottom'
        ? 'end'
        : undefined;
  return { placement: axis, alignment };
};
