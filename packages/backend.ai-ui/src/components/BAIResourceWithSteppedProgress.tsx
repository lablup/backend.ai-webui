import { divideNumberWithUnits, parseValueWithUnit } from '../helper';
import Flex from './Flex';
import { theme, Typography, Tooltip } from 'antd';
import _ from 'lodash';

const calculateCurrentPosition = (
  current: number | string,
  total: number | string | undefined,
  steps: number,
  unlimitedValues?: Array<number | string | undefined>,
): number => {
  if (_.includes(unlimitedValues, current) || total === 0) {
    return 100;
  } else if (
    !_.includes(unlimitedValues, current) &&
    _.includes(unlimitedValues, total)
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
  unlimitedValues?: Array<number | string | undefined>,
) => {
  const isUnlimited = (val: number | string | undefined) =>
    _.includes(unlimitedValues, val);
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
    formattedCurrent = formatNumber(current);
    formattedTotal = formatNumber(total);
    currentUnit = totalUnit = displayUnit;
  }

  return {
    formattedCurrent,
    formattedTotal,
    currentUnit,
    totalUnit,
  };
};

export interface BAIResourceWithSteppedProgressProps {
  title: string;
  current: number | string;
  total?: number | string;
  displayUnit: string;
  steps?: number;
  unlimitedValues?: Array<number | string | undefined>;
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
  unlimitedValues,
  showProgress = true,
}) => {
  const { token } = theme.useToken();

  const { formattedCurrent, formattedTotal, currentUnit, totalUnit } =
    formatResourceValues(title, current, total, displayUnit, unlimitedValues);

  return (
    <Flex direction="column" align="start">
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
      <Flex
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
          {formattedCurrent}
        </Typography.Text>
        {!_.isNaN(current) && <Typography.Text>{displayUnit}</Typography.Text>}
      </Flex>
      {showProgress && (
        <Tooltip
          title={`${formattedCurrent} ${currentUnit} / ${formattedTotal} ${totalUnit}`}
        >
          <Flex direction="row" gap={2}>
            {_.map(_.range(steps), (i) => {
              const currentPosition = calculateCurrentPosition(
                current,
                total,
                steps,
                unlimitedValues,
              );
              return (
                <Flex
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
          </Flex>
        </Tooltip>
      )}
    </Flex>
  );
};

export default BAIResourceWithSteppedProgress;
