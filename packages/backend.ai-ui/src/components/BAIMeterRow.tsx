/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 One resource as a labelled gauge: `name … current / total unit` over a track
 whose fill is ALWAYS utilization, so the bar means the same thing whether the
 card's readout is showing "used" or "free".
*/
import { useBAIi18n } from '../hooks/useBAIi18n';
import './BAIMeterRow.css';
import { Text } from '@astryxdesign/core/Text';
import * as _ from 'lodash-es';
import React, { type ReactNode } from 'react';

export interface BAIMeterRowProps {
  title: ReactNode;
  /** The readout numerator — the used amount or the free one, per the card. */
  current?: number;
  total?: number;
  /** The consumed amount, which is what the track draws. Defaults to `current`. */
  utilized?: number;
  unit?: string;
  precision?: number;
  infinityDisplay?: string;
  style?: React.CSSProperties;
}

const WARNING_AT = 70;
const ERROR_AT = 90;

const severityOf = (percent: number) =>
  percent >= ERROR_AT ? 'error' : percent >= WARNING_AT ? 'warning' : 'ok';

const BAIMeterRow: React.FC<BAIMeterRowProps> = ({
  title,
  current,
  total,
  utilized,
  unit = '',
  precision = 2,
  infinityDisplay = '∞',
  style,
}) => {
  const { t } = useBAIi18n();

  const format = (value: number): string =>
    isFinite(value)
      ? parseFloat(value.toFixed(precision)).toString()
      : infinityDisplay;

  const consumed = _.isUndefined(utilized) ? current : utilized;
  const hasBound = !_.isUndefined(total) && isFinite(total);
  const isBounded = hasBound && !_.isUndefined(consumed);

  // Nothing consumed out of a zero quota is empty, not full; anything else
  // against a zero quota — a non-finite `consumed` included — is full.
  const percent = !isBounded
    ? null
    : total === 0
      ? consumed === 0
        ? 0
        : 100
      : !isFinite(consumed as number)
        ? 100
        : Math.min(100, Math.round(((consumed as number) / total) * 100));

  const unlimited = !_.isUndefined(current) && !isFinite(current);
  const accessibleTitle = typeof title === 'string' ? title : 'usage';

  return (
    <div className="bai-meter-row" style={style}>
      <div className="bai-meter-row__line">
        <Text type="label">{title}</Text>
        <Text
          className="bai-meter-row__value"
          color="secondary"
          hasTabularNumbers
        >
          {unlimited ? (
            // The same string BAIStatistic shows for an unbounded slot; reusing
            // its key keeps one translation across 20+ locales.
            <Text weight="semibold" size="lg" color="primary">
              {t('comp:BAIStatistic.Unlimited') || 'Unlimited'}
            </Text>
          ) : (
            <>
              <Text weight="semibold" size="lg" color="primary">
                {_.isUndefined(current) ? '—' : format(current)}
              </Text>
              {hasBound ? ` / ${format(total as number)}` : null}
              {unit ? ` ${unit}` : null}
            </>
          )}
        </Text>
      </div>

      {/* An unbounded slot has nothing to fill — an empty track would read as
          "zero used", which is the opposite of what unlimited means. */}
      {_.isNull(percent) ? null : (
        <div className="bai-meter-row__bar">
          <div
            className="bai-meter-row__track"
            role="progressbar"
            aria-label={accessibleTitle}
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span
              className={`bai-meter-row__fill bai-meter-row__fill--${severityOf(percent)}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <Text
            className="bai-meter-row__pct"
            type="supporting"
            hasTabularNumbers
          >
            {`${percent}%`}
          </Text>
        </div>
      )}
    </div>
  );
};

BAIMeterRow.displayName = 'BAIMeterRow';
export default BAIMeterRow;
