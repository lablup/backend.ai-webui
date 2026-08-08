import { theme } from '../theme-shim';
import type { GlobalToken } from 'antd';
import React, { type CSSProperties, type PropsWithChildren } from 'react';

type GapSize = number | 'xxs' | 'xs' | 'sm' | 'ms' | 'md' | 'lg' | 'xl' | 'xxl';
type GapProp = GapSize | [GapSize | undefined, GapSize | undefined];

/**
 * Named gap -> theme token. Declared as an explicit, TYPED table rather than
 * the old `token['size' + size.toUpperCase()]` string concatenation: that
 * form type-checks against any token object, so when `sizeSM`/`sizeMS`/
 * `sizeMD`/`sizeLG` were missing from the theme-shim's map the lookup
 * returned `undefined`, React dropped the `gap` declaration entirely, and
 * ~470 call sites collapsed to a 0 gap with nothing failing. Keying
 * `GlobalToken` makes any future hole a compile error here instead.
 */
const GAP_TOKEN: Record<
  Exclude<GapSize, number>,
  keyof Pick<
    GlobalToken,
    | 'sizeXXS'
    | 'sizeXS'
    | 'sizeSM'
    | 'sizeMS'
    | 'sizeMD'
    | 'sizeLG'
    | 'sizeXL'
    | 'sizeXXL'
  >
> = {
  xxs: 'sizeXXS',
  xs: 'sizeXS',
  sm: 'sizeSM',
  ms: 'sizeMS',
  md: 'sizeMD',
  lg: 'sizeLG',
  xl: 'sizeXL',
  xxl: 'sizeXXL',
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
    const { token } = theme.useToken();

    const getGapSize = (size: GapSize | undefined) => {
      if (size === undefined) return 0;
      // `?? 0` is a last-resort guard only: the table above plus
      // `GlobalToken` keying make an unresolved name impossible at compile
      // time. It exists so a runtime token object that predates a new rung
      // degrades to a flat gap rather than dropping the declaration.
      return typeof size === 'string' ? (token[GAP_TOKEN[size]] ?? 0) : size;
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
          textDecoration: 'none',
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
