/*
 to-astryx W2-D: antd `Typography.Text` -> Astryx `Text`, and the antd
 `ProgressProps` type import is replaced by the single key call sites use.

 `color: token.colorTextDisabled` becomes `color="disabled"` — a real member of
 Astryx's closed `TextColor` enum, so it follows the theme instead of a
 resolved hex. The remaining `token.*` reads are the theme-shim's job
 (final-switch material) and stay.
*/
import { theme } from '../theme-shim';
import BAIFlex from './BAIFlex';
import { Text } from '@astryxdesign/core/Text';
import * as _ from 'lodash-es';
import React from 'react';

export interface BAIProgressWithLabelProps {
  /**
   * antd's `showInfo` — the only `ProgressProps` key any call site passes
   * (measured across 44 sites in 7 files). The rest of antd's `ProgressProps`
   * described a control this component never rendered: it draws its own fill
   * bar, so `type`, `steps`, `strokeLinecap`, `trailColor`, `format` and
   * friends were all inert. Restating just this key is what drops the module
   * out of the antd import graph (P15).
   */
  showInfo?: boolean;
  title?: React.ReactNode;
  valueLabel?: React.ReactNode;
  percent?: number;
  width?: React.CSSProperties['width'];
  strokeColor?: string;
  labelStyle?: React.CSSProperties;
  progressStyle?: React.CSSProperties;
  size?: 'small' | 'middle' | 'large';
}
const BAIProgressWithLabel: React.FC<BAIProgressWithLabelProps> = ({
  title,
  valueLabel,
  percent,
  width,
  strokeColor,
  labelStyle,
  progressStyle,
  showInfo = true,
  size = 'small',
}) => {
  const { token } = theme.useToken();

  const fontSize =
    size === 'small'
      ? token.fontSizeSM
      : size === 'middle'
        ? token.fontSize
        : token.fontSizeLG;
  return (
    <BAIFlex
      style={{
        padding: 1,
        border: `1px solid ${token.colorBorder}`,
        borderRadius: 3,
        backgroundColor: token.colorBgContainerDisabled,
        ...(_.isNumber(width) || _.isString(width)
          ? { width: width }
          : { flex: 1 }),
        ...progressStyle,
      }}
      direction="column"
      align="stretch"
    >
      <BAIFlex
        style={{
          height: '100%',
          width: `${!percent || _.isNaN(percent) ? 0 : _.min([percent, 100])}%`,
          position: 'absolute',
          left: 0,
          top: 0,
          backgroundColor: strokeColor ?? token.colorSuccess,
          opacity: 0.7,
          zIndex: 0,
          overflow: 'hidden',
        }}
      ></BAIFlex>
      <BAIFlex direction="row" justify="between">
        <Text style={{ fontSize, ...labelStyle }}>{title}</Text>
        <Text
          color={
            _.isNaN(percent) || _.isUndefined(percent) ? 'disabled' : undefined
          }
          style={{
            fontSize,
            minHeight: token.sizeXXS,
            ...labelStyle,
          }}
        >
          {showInfo ? valueLabel : ' '}
        </Text>
      </BAIFlex>
    </BAIFlex>
  );
};

export default BAIProgressWithLabel;
