/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIStatistic` on Astryx (to-astryx phase 3, ticket A).

 The dashboard/resource-panel metric: a caption, a 32px value with its unit,
 and a segmented usage bar. Public props are unchanged — its 64 call sites live
 in `ResourceStatistics`, which passes them positionally identically.

 Composition:
   antd `Typography.Text`        -> Astryx `Text` (`size`, `color`)
   antd `Tooltip`                -> Astryx `Tooltip`
   antd `Progress steps size=[3,10]` -> see the PILOT-DECISION below

 PILOT-DECISION — the STEPPED bar is rebuilt, not dropped. Astryx `ProgressBar`
 is a continuous track with no `steps` knob, and the segmented 20-notch bar is
 the recognisable shape of the resource panel (it is what tells a 3/20 apart
 from a 4/20 at a glance). Swapping it for a solid bar is a visible redesign of
 the app's most-looked-at surface, so the notches are composed from tokens in
 `BAIStatistic.css` — the same geometry antd rendered (`size={[3, 10]}`: 3px
 wide, 10px tall notches). This is the "legacy fidelity beats a generic
 convention" corollary of the frontier rule, recorded as required by the
 per-component-CSS policy.

 PILOT-DECISION — the bar's `role="progressbar"` semantics. antd's `Progress`
 carried them; the notch strip does too (`role`/`aria-valuenow` below), so no
 accessibility is lost relative to either antd or `ProgressBar`.
*/
import { useBAIi18n } from '../hooks/useBAIi18n';
import BAIFlex from './BAIFlex';
import './BAIStatistic.css';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import * as _ from 'lodash-es';
import React, { type ReactNode } from 'react';

export interface BAIStatisticProps {
  title: ReactNode;
  current?: number;
  total?: number;
  unit?: string;
  precision?: number;
  infinityDisplay?: string;
  progressMode?: 'ghost' | 'hidden' | 'normal';
  progressSteps?: number;
  style?: React.CSSProperties;
}

/** The segmented bar antd drew as `<Progress steps={n} size={[3, 10]} />`. */
const StepBar: React.FC<{
  steps: number;
  percent: number;
  /** `ghost` keeps the layout box but paints nothing (antd: transparent trail). */
  ghost?: boolean;
  color?: string;
  label: string;
}> = ({ steps, percent, ghost, color, label }) => {
  const filled = Math.round((percent / 100) * steps);
  return (
    <div
      className="bai-statistic-steps"
      role="progressbar"
      aria-label={label}
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {_.times(steps, (index) => (
        <span
          key={index}
          className={
            ghost
              ? 'bai-statistic-step bai-statistic-step--ghost'
              : index < filled
                ? 'bai-statistic-step bai-statistic-step--filled'
                : 'bai-statistic-step'
          }
          style={
            ghost || index >= filled ? undefined : { backgroundColor: color }
          }
        />
      ))}
    </div>
  );
};

const BAIStatistic: React.FC<BAIStatisticProps> = ({
  title,
  current,
  total,
  unit = '',
  precision = 2,
  infinityDisplay = '∞',
  progressMode = 'hidden',
  progressSteps = 20,
  style,
}) => {
  const { t } = useBAIi18n();
  const showProgress = progressMode !== 'hidden';

  // Format number with precision
  const formatNumber = (value: number): string => {
    if (!isFinite(value)) return infinityDisplay;

    // Use toFixed and parseFloat to remove trailing zeros
    return parseFloat(value.toFixed(precision)).toString();
  };

  const displayCurrent = _.isUndefined(current)
    ? current
    : formatNumber(current);
  const displayTotal = total !== undefined ? formatNumber(total) : undefined;

  const calculatePercent = (): number => {
    if (!showProgress || total === undefined || total === Infinity) return 0;
    // Nothing allocated out of a zero quota is empty, not full. Anything else
    // against a zero quota — including a non-finite current — stays full.
    if (total === 0) return current === 0 ? 0 : 100;
    if (!_.isFinite(current) || !isFinite(total)) return 100;
    return _.isUndefined(current) ? 0 : Math.round((current / total) * 100);
  };

  const percent = calculatePercent();
  const accessibleTitle = typeof title === 'string' ? title : 'usage';

  return (
    <BAIFlex direction="column" align="start" style={style}>
      <Text
        size="lg"
        color="secondary"
        className="bai-statistic-title"
        display="block"
      >
        {title}
      </Text>

      <BAIFlex
        direction="row"
        gap="xxs"
        align="end"
        style={{
          marginBottom: 8,
        }}
      >
        {displayCurrent === infinityDisplay ? (
          <Text className="bai-statistic-value">
            {t('comp:BAIStatistic.Unlimited') || 'Unlimited'}
          </Text>
        ) : (
          <>
            <Text
              className="bai-statistic-value"
              style={style?.color ? { color: style.color } : undefined}
            >
              {displayCurrent}
            </Text>
            {unit && <Text color="secondary">{unit}</Text>}
          </>
        )}
      </BAIFlex>

      {progressMode === 'normal' && total !== undefined ? (
        <Tooltip
          content={`${displayCurrent} ${unit} / ${displayTotal} ${unit}`}
        >
          <StepBar
            steps={progressSteps}
            percent={percent}
            color={style?.color}
            label={accessibleTitle}
          />
        </Tooltip>
      ) : progressMode === 'ghost' ? (
        <StepBar
          ghost
          steps={progressSteps}
          percent={0}
          label={accessibleTitle}
        />
      ) : null}
    </BAIFlex>
  );
};

export default BAIStatistic;
