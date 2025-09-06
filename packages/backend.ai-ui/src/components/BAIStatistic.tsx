import BAIFlex from './BAIFlex';
import { theme, Typography, Tooltip } from 'antd';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface BAIStatisticProps {
  title: string;
  current?: number;
  total?: number;
  unit?: string;
  precision?: number;
  infinityDisplay?: string;
  showProgress?: boolean;
  progressSteps?: number;
}

const BAIStatistic: React.FC<BAIStatisticProps> = ({
  title,
  current,
  total,
  unit = '',
  precision = 2,
  infinityDisplay = '∞',
  showProgress = false,
  progressSteps = 12,
}) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();

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

  // Calculate progress position
  const calculateProgress = (): number => {
    if (!showProgress || total === undefined) return 0;
    if (!_.isFinite(current) || !isFinite(total) || total === 0)
      return progressSteps;
    return _.isUndefined(current)
      ? 0
      : Math.round((current / total) * progressSteps);
  };

  const currentPosition = calculateProgress();

  return (
    <BAIFlex direction="column" align="start">
      <Typography.Text
        style={{
          fontSize: token.fontSizeLG,
          fontWeight: 600,
          marginBottom: 16,
          lineHeight: '1em',
        }}
      >
        {title}
      </Typography.Text>

      <BAIFlex
        direction="row"
        gap="xxs"
        align="end"
        style={{
          marginBottom: 8,
        }}
      >
        {displayCurrent === infinityDisplay ? (
          <Typography.Text
            style={{
              fontSize: 32,
              lineHeight: '1em',
            }}
          >
            {t('comp:BAIStatistic.Unlimited') || 'Unlimited'}
          </Typography.Text>
        ) : (
          <>
            <Typography.Text
              style={{
                fontSize: 32,
                lineHeight: '1em',
                fontWeight: 700,
                color: token.colorSuccess,
              }}
            >
              {displayCurrent}
            </Typography.Text>
            {unit && <Typography.Text>{unit}</Typography.Text>}
          </>
        )}
      </BAIFlex>

      {showProgress && total !== undefined && (
        <Tooltip title={`${displayCurrent} ${unit} / ${displayTotal} ${unit}`}>
          <BAIFlex direction="row" gap={2}>
            {_.map(_.range(progressSteps), (i) => (
              <BAIFlex
                key={i}
                style={{
                  width: 5,
                  height: 12,
                  borderRadius: 2.5,
                  backgroundColor:
                    i < currentPosition
                      ? token.colorSuccess
                      : token.colorTextDisabled,
                }}
              />
            ))}
          </BAIFlex>
        </Tooltip>
      )}
    </BAIFlex>
  );
};

export default BAIStatistic;
