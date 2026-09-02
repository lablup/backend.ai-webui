/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { Text } from '@astryxdesign/core/Text';
import { useTheme } from '@astryxdesign/core/theme';
import { BAIFlex, BAIFlexProps } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { ReactNode } from 'react';

interface BAIPanelItemProps extends Omit<BAIFlexProps, 'title'> {
  title: ReactNode | string;
  value: ReactNode | string | number;
  unit?: string;
  percent?: number;
  color?: string;
  /** Accessible name for the progress bar; defaults to a string `title`. */
  progressLabel?: string;
}

const BAIPanelItem: React.FC<BAIPanelItemProps> = ({
  title,
  value,
  unit,
  percent,
  color,
  progressLabel,
  ...props
}) => {
  const { token } = useTheme();
  return (
    <BAIFlex
      {...props}
      direction="column"
      style={{
        minWidth: 80,
        ...props.style,
      }}
      justify="between"
      align="start"
      wrap="wrap"
    >
      {_.isString(title) ? (
        <Text
          style={{
            fontSize: token('--font-size-lg'),
            textAlign: 'left',
          }}
        >
          {title}
        </Text>
      ) : (
        title
      )}
      <BAIFlex>
        {_.isString(value) || _.isNumber(value) ? (
          <Text
            style={{
              fontSize: token('--font-size-4xl'),
              color: color ?? token('--bai-primary-5'),
            }}
          >
            {value}
          </Text>
        ) : (
          value
        )}
        {unit && <Text>{unit}</Text>}
      </BAIFlex>
      {_.isNumber(percent) && (
        /* PILOT-DECISION: antd `Progress steps={12} size={[5,12]}` (a 12-pill
           segmented bar) -> Astryx `ProgressBar`, a continuous track.
           MAPPING §3.11 grades `steps` as NONE — it is a self-build — and
           `strokeColor` as NONE (P5, the variant enum is closed). NO live call
           site passes `percent` today (grepped: `StorageStatusPanelCard`,
           `BulkCreateUserFromCSVModal`, `SessionCountDashboardItem` pass only
           title/value/unit/color/style), so the segmented look has no render to
           regress; rebuilding 12 pills to keep an unused branch pixel-identical
           is exactly what the simplicity policy rules out. The `.ant-progress-
           steps-item` radius rule in `BAIPanelItem.css` died with it (P6), so
           the file and its import are gone. */
        <ProgressBar
          label={progressLabel ?? (_.isString(title) ? title : '')}
          isLabelHidden
          value={percent}
        />
      )}
    </BAIFlex>
  );
};

export default BAIPanelItem;
