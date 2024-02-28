import { theme } from 'antd';
import React, { CSSProperties, PropsWithChildren } from 'react';

export interface FlexProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'dir'>,
    PropsWithChildren {
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around';
  // | "evenly";
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  gap?: number | 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}

const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
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
          gap:
            typeof gap === 'string'
              ? // @ts-ignore
                token['padding' + gap.toUpperCase()]
              : gap,
          ...flexStyle,
        }}
        {...restProps}
      >
        {children}
      </div>
    );
  },
);

export default Flex;
