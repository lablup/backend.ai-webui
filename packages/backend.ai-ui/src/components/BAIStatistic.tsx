import BAIFlex from './BAIFlex';
import { theme, Typography, Tooltip, Progress } from 'antd';
import _ from 'lodash';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { token } = theme.useToken();
  const { t } = useTranslation();
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
    if (!_.isFinite(current) || !isFinite(total) || total === 0) return 100;
    return _.isUndefined(current) ? 0 : Math.round((current / total) * 100);
  };

  const percent = calculatePercent();

  return (
    <BAIFlex direction="column" align="start" style={style}>
      <Typography.Text
        style={{
          fontSize: token.fontSizeLG,
          marginBottom: 16,
          lineHeight: '1em',
          color: token.colorTextSecondary,
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
            <Typography.Text
              style={{
                lineHeight: '1em',
              }}
            >
              {t('comp:BAIStatistic.Unlimited') || 'Unlimited'}
            </Typography.Text>
          </Typography.Text>
        ) : (
          <>
            <Typography.Text
              style={{
                fontSize: 32,
                lineHeight: '1em',
                color: style?.color ?? 'inherit',
              }}
            >
              {displayCurrent}
            </Typography.Text>
            {unit && (
              <Typography.Text
                style={{
                  color: token.colorTextSecondary,
                }}
              >
                {unit}
              </Typography.Text>
            )}
          </>
        )}
      </BAIFlex>

      {progressMode === 'normal' && total !== undefined ? (
        <Tooltip title={`${displayCurrent} ${unit} / ${displayTotal} ${unit}`}>
          <Progress
            percent={percent}
            style={{ width: 100 }}
            strokeColor={style?.color ?? token.colorTextTertiary}
            status="active"
            steps={progressSteps}
            size={[3, 10]}
            showInfo={false}
          />
        </Tooltip>
      ) : progressMode === 'ghost' ? (
        <Progress
          showInfo={false}
          trailColor={'transparent'}
          style={{ width: 100 }}
          steps={progressSteps}
          size={[3, 10]}
        />
      ) : null}
    </BAIFlex>
  );
};

export default BAIStatistic;
