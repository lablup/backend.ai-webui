import { divideNumberWithUnits, parseValueWithUnit } from '../helper';
import BAIFlex from './BAIFlex';
import { theme, Typography, Tooltip } from 'antd';
import _ from 'lodash';

// Use Intl.NumberFormat for grouping and up to 2 decimal places (trims trailing zeros)
const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});
// Format numbers with grouping and up to 2 decimal places, trimming trailing zeros
const formatCurrentNumber = (val: number): string => {
  if (!isFinite(val)) return String(val);
  return numberFormatter.format(val);
};

const calculateCurrentPosition = (
  current: number | string,
  total: number | string | undefined,
  steps: number,
  unlimitedValue: number | string = '∞',
): number => {
  if (_.isEqual(unlimitedValue, current) || total === 0) {
    return 100;
  } else if (
    !_.isEqual(unlimitedValue, current) &&
    _.isEqual(unlimitedValue, total)
  ) {
    return 0;
  } else {
    return total !== undefined &&
      typeof current === 'string' &&
      typeof total === 'string'
      ? Number(divideNumberWithUnits(current, total) || 0) * steps
      : (Number(current) / Number(total || 1)) * steps;
  }
};

const formatResourceValues = (
  title: string,
  current: number | string,
  total: number | string | undefined,
  displayUnit: string,
  unlimitedValue: number | string = '∞',
) => {
  const isUnlimited = (val: number | string | undefined) =>
    _.isEqual(unlimitedValue, val);
  const formatNumber = (val: number | string | undefined) =>
    _.isNaN(val) ? '-' : isUnlimited(val) ? '∞' : _.toString(val);

  let formattedCurrent, formattedTotal, currentUnit, totalUnit;

  if (title === 'RAM') {
    const [currVal, currUnitRaw] = parseValueWithUnit(_.toString(current));
    const [totVal, totUnitRaw] = parseValueWithUnit(_.toString(total));

    formattedCurrent = isUnlimited(current) ? '∞' : currVal;
    formattedTotal = isUnlimited(total) ? '∞' : totVal;

    currentUnit = `${_.toUpper(currUnitRaw || 'g')}iB`;
    totalUnit = `${_.toUpper(totUnitRaw || 'g')}iB`;
  } else {
    // Keep numbers as numbers to allow further numeric formatting at render time
    formattedCurrent = isUnlimited(current)
      ? '∞'
      : typeof current === 'number'
        ? current
        : formatNumber(current);

    formattedTotal = isUnlimited(total)
      ? '∞'
      : typeof total === 'number'
        ? total
        : formatNumber(total);

    currentUnit = totalUnit = displayUnit;
  }

  return {
    formattedCurrent,
    formattedTotal,
    currentUnit,
    totalUnit,
    unlimitedValue,
  };
};

export interface BAIResourceWithSteppedProgressProps {
  title: string;
  current: number | string;
  total?: number | string;
  displayUnit: string;
  steps?: number;
  unlimitedValue?: number | string;
  showProgress?: boolean;
}

const BAIResourceWithSteppedProgress: React.FC<
  BAIResourceWithSteppedProgressProps
> = ({
  title,
  current,
  total,
  displayUnit,
  steps = 12,
  unlimitedValue = '∞',
  showProgress = true,
}) => {
  const { token } = theme.useToken();

  const { formattedCurrent, formattedTotal, currentUnit, totalUnit } =
    formatResourceValues(title, current, total, displayUnit, unlimitedValue);

  // Apply number formatting only when formattedCurrent is a number
  const displayFormattedCurrent =
    typeof formattedCurrent === 'number'
      ? formatCurrentNumber(formattedCurrent)
      : formattedCurrent;

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
        <Typography.Text
          style={{
            fontSize: 32,
            lineHeight: '1em',
            fontWeight: 700,
            color: token.colorSuccess,
          }}
        >
          {displayFormattedCurrent}
        </Typography.Text>
        {!_.isNaN(current) && <Typography.Text>{displayUnit}</Typography.Text>}
      </BAIFlex>
      {showProgress && (
        <Tooltip
          title={`${displayFormattedCurrent} ${currentUnit} / ${formattedTotal} ${totalUnit}`}
        >
          <BAIFlex direction="row" gap={2}>
            {_.map(_.range(steps), (i) => {
              const currentPosition = calculateCurrentPosition(
                current,
                total,
                steps,
              );
              return (
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
              );
            })}
          </BAIFlex>
        </Tooltip>
      )}
    </BAIFlex>
  );
};

export default BAIResourceWithSteppedProgress;
