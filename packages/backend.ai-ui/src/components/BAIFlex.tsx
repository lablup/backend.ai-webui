import { useTheme } from '@astryxdesign/core/theme';
import React, { type CSSProperties, type PropsWithChildren } from 'react';

type GapSize = number | 'xxs' | 'xs' | 'sm' | 'ms' | 'md' | 'lg' | 'xl' | 'xxl';
type GapProp = GapSize | [GapSize | undefined, GapSize | undefined];

// Named gap -> Astryx spacing token (antd sizeXXS..sizeXXL = 4..48px). A
// `Record` over every rung: an unresolved name once silently dropped the gap
// declaration at ~470 call sites, so a missing rung must fail here at compile
// time, not degrade at runtime.
const GAP_TOKEN: Record<Exclude<GapSize, number>, string> = {
  xxs: '--spacing-1',
  xs: '--spacing-2',
  sm: '--spacing-3',
  ms: '--spacing-4',
  md: '--spacing-5',
  lg: '--spacing-6',
  xl: '--spacing-8',
  xxl: '--spacing-12',
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
    const { token } = useTheme();

    const getGapSize = (size: GapSize | undefined) => {
      if (size === undefined) return 0;
      // `|| 0` so a theme missing the token degrades to a flat gap rather
      // than emitting `NaNpx` and dropping the declaration.
      return typeof size === 'string'
        ? parseFloat(token(GAP_TOKEN[size])) || 0
        : size;
    };

    const gapStyle = Array.isArray(gap)
      ? `${getGapSize(gap[0])}px ${getGapSize(gap[1])}px`
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
