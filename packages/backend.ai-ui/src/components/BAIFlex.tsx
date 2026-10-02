/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Stays in BUI rather than ui-common (FR-4087): it is the frozen antd `Flex`
 vocabulary (`direction`, `justify`, `gap="sm"`) of ~290 call sites, and
 Astryx `Stack`/`HStack`/`VStack` already own the role for new code.
*/
import React, { type CSSProperties, type PropsWithChildren } from 'react';

type GapSize = number | 'xxs' | 'xs' | 'sm' | 'ms' | 'md' | 'lg' | 'xl' | 'xxl';
type GapProp = GapSize | [GapSize | undefined, GapSize | undefined];

/**
 * Named gap -> Astryx spacing token. The rungs are the antd `size*` ladder the
 * theme-shim used to resolve (4/8/12/16/20/24/32/48), which the shim read from
 * these same variables, so every gap is pixel-identical to the shim's
 * (`BAIFlex.test.tsx` compares them).
 */
const BAI_FLEX_GAP_VAR: Record<Exclude<GapSize, number>, string> = {
  xxs: 'var(--spacing-1)',
  xs: 'var(--spacing-2)',
  sm: 'var(--spacing-3)',
  ms: 'var(--spacing-4)',
  md: 'var(--spacing-5)',
  lg: 'var(--spacing-6)',
  xl: 'var(--spacing-8)',
  xxl: 'var(--spacing-12)',
};

export interface BAIFlexProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'dir'>, PropsWithChildren {
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  gap?: GapProp;
}

const BAIFlex = React.forwardRef<HTMLDivElement, BAIFlexProps>(
  (
    {
      direction = 'row',
      wrap = 'nowrap',
      justify = 'flex-start',
      align = 'center',
      gap = 0,
      style,
      children,
      ...restProps
    },
    ref,
  ) => {
    const getGapSize = (size: GapSize | undefined) => {
      if (size === undefined) return '0px';
      return typeof size === 'string' ? BAI_FLEX_GAP_VAR[size] : `${size}px`;
    };

    const gapStyle = Array.isArray(gap)
      ? `${getGapSize(gap[0])} ${getGapSize(gap[1])}`
      : typeof gap === 'number'
        ? gap
        : getGapSize(gap);

    const transferConst = [justify, align];
    const transferConstStyle = transferConst.map((el) => {
      let tempTxt;
      switch (el) {
        case 'start':
          tempTxt = 'flex-start';
          break;
        case 'end':
          tempTxt = 'flex-end';
          break;
        case 'between':
          tempTxt = 'space-between';
          break;
        case 'around':
          tempTxt = 'space-around';
          break;
        default:
          tempTxt = el;
          break;
      }

      return tempTxt;
    });

    const flexStyle: CSSProperties = {
      display: 'flex',
      flexDirection: direction,
      flexWrap: wrap,
      justifyContent: transferConstStyle[0],
      alignItems: transferConstStyle[1],
      ...style,
    };

    return (
      <div
        ref={ref}
        style={{
          alignItems: 'stretch',
          border: '0 solid black',
          boxSizing: 'border-box',
          display: 'flex',
          flexBasis: 'auto',
          flexDirection: 'column',
          flexShrink: 0,
          listStyle: 'none',
          margin: 0,
          minHeight: 0,
          minWidth: 0,
          padding: 0,
          position: 'relative',
          // `inherit`, not `none` (QA3). Outside a decorated ancestor the two
          // are identical, because `text-decoration-line` is `none` by default
          // anyway — so this reset only ever *did* anything in the one case
          // where it was wrong: a `BAIFlex` laid out inside a link. There it
          // silently cancelled the link's hover underline, and being an inline
          // style no stylesheet could win it back. Mirroring the ancestor keeps
          // link-shaped cells (e.g. the allowed-storage-host cells) underlining
          // with the link they belong to.
          textDecoration: 'inherit',
          gap: gapStyle,
          ...flexStyle,
        }}
        {...restProps}
      >
        {children}
      </div>
    );
  },
);

BAIFlex.displayName = 'BAIFlex';
export default BAIFlex;
