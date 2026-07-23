import { convertToBinaryUnit, convertToDecimalUnit, SizeUnit } from '../helper';
import BAIFlex from './BAIFlex';
import { Typography } from 'antd';

interface BAINumberWithUnitProps {
  numberUnit: string;
  targetUnit: SizeUnit;
  unitType: 'binary' | 'decimal';
  postfix?: string;
  /**
   * Optional reference value rendered after the number as `number / compared`,
   * sharing the single trailing unit. The `/ compared` part is rendered in the
   * muted (secondary) text color — same as the unit — so it reads as a
   * reference next to the primary number.
   */
  comparedValue?: string;
}

const BAINumberWithUnit = ({
  numberUnit,
  targetUnit,
  unitType,
  postfix,
  comparedValue,
}: BAINumberWithUnitProps) => {
  'use memo';
  const convertedByTargetUnit =
    unitType === 'binary'
      ? convertToBinaryUnit(numberUnit, targetUnit, 2, true)
      : convertToDecimalUnit(numberUnit, targetUnit, 2, true);
  const convertedByAuto =
    unitType === 'binary'
      ? convertToBinaryUnit(numberUnit, 'auto', 2, true)
      : convertToDecimalUnit(numberUnit, 'auto', 2, true);
  const convertedComparedByTargetUnit =
    comparedValue === undefined
      ? undefined
      : unitType === 'binary'
        ? convertToBinaryUnit(comparedValue, targetUnit, 2, true)
        : convertToDecimalUnit(comparedValue, targetUnit, 2, true);
  return (
    <BAIFlex gap="xxs">
      <Typography.Text>
        {Number(convertedByTargetUnit?.numberFixed).toString()}
        {postfix && postfix}
      </Typography.Text>
      {convertedComparedByTargetUnit ? (
        <Typography.Text type="secondary">
          {`/ ${Number(convertedComparedByTargetUnit?.numberFixed).toString()}`}
        </Typography.Text>
      ) : null}
      <Typography.Text type="secondary">
        {convertedByTargetUnit?.displayUnit}
        {Number(convertedByTargetUnit?.numberFixed).toString() === '0' &&
          Number(convertedByAuto?.numberFixed).toString() !== '0' &&
          `(${Number(convertedByAuto?.numberFixed).toString()} ${
            convertedByAuto?.displayUnit
          })`}
      </Typography.Text>
    </BAIFlex>
  );
};

export default BAINumberWithUnit;
