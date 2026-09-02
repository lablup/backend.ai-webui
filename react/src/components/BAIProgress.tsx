/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import usePrimaryColors from '../hooks/usePrimaryColors';
import { theme } from '../theme-shim';
import { Text } from '@astryxdesign/core/Text';
import { BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { ReactNode } from 'react';

/**
 * PILOT-DECISION: the props no longer extend antd `ProgressProps` (P1 grep —
 * the only consumer, `QuotaPerStorageVolumePanelCard`, passes
 * `title`/`percent`/`used`/`total`). This component never rendered an antd
 * `Progress` in the first place: the bar is two hand-built `BAIFlex` boxes, so
 * `ProgressProps` only ever supplied the three field TYPES read below. They are
 * restated here and the antd import disappears with no render change.
 */
interface BAIProgressProps {
  title?: ReactNode;
  used?: number | string;
  total?: number | string;
  progressStyle?: React.CSSProperties;
  /** 0–100. */
  percent?: number;
  /** Bar colour; falls back to the brand primary. */
  strokeColor?: string;
  /** Bar height in px; falls back to the `size` token. */
  size?: number;
}

const BAIProgress: React.FC<BAIProgressProps> = ({
  title,
  used,
  total,
  progressStyle,
  ...baiProgressProps
}) => {
  const { token } = theme.useToken();
  const primaryColors = usePrimaryColors();

  return (
    <BAIFlex direction="column" align="stretch" gap={'xs'}>
      <BAIFlex align="stretch" justify={title ? 'between' : 'end'}>
        <Text style={{ alignContent: 'end' }}>{title}</Text>
        <Text
          style={{
            fontSize: token.fontSizeHeading3,
            color: _.isString(baiProgressProps.strokeColor)
              ? baiProgressProps.strokeColor
              : primaryColors.primary5,
            alignContent: 'end',
          }}
        >
          {baiProgressProps.percent ?? 0}%
        </Text>
      </BAIFlex>
      <BAIFlex
        style={{
          padding: 1,
          backgroundColor: token.colorFill,
          height: _.isNumber(baiProgressProps.size)
            ? baiProgressProps.size
            : token.size,
          ...progressStyle,
        }}
        direction="column"
        align="stretch"
      >
        <BAIFlex
          style={{
            height: _.isNumber(baiProgressProps.size)
              ? baiProgressProps.size
              : token.size,
            width: `${!baiProgressProps.percent || _.isNaN(baiProgressProps.percent) ? 0 : _.min([baiProgressProps.percent, 100])}%`,
            position: 'absolute',
            left: 0,
            top: 0,
            backgroundColor: _.isString(baiProgressProps.strokeColor)
              ? (baiProgressProps.strokeColor ??
                primaryColors.primary5 ??
                token.colorPrimary)
              : (primaryColors.primary5 ?? token.colorPrimary),
            zIndex: 0,
            overflow: 'hidden',
          }}
        ></BAIFlex>
      </BAIFlex>
      <BAIFlex justify="end">
        {used && total && baiProgressProps.percent ? (
          <BAIFlex gap={'xxs'}>
            <Text
              style={{
                color: _.isString(baiProgressProps.strokeColor)
                  ? (baiProgressProps.strokeColor ??
                    primaryColors.primary5 ??
                    token.colorPrimary)
                  : (primaryColors.primary5 ?? token.colorPrimary),
              }}
            >
              {used}
            </Text>
            <Text>/</Text>
            <Text>{total}</Text>
          </BAIFlex>
        ) : total ? (
          <Text>{total}</Text>
        ) : null}
      </BAIFlex>
    </BAIFlex>
  );
};

export default BAIProgress;
