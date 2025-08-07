import { convertToBinaryUnit, convertToDecimalUnit, SizeUnit } from '../helper';
import { Typography } from 'antd';
import { BAIFlex } from 'backend.ai-ui';

interface NumberWithUnitProps {
  numberUnit: string;
  targetUnit: SizeUnit;
  unitType: 'binary' | 'decimal';
  postfix?: string;
}

const NumberWithUnit = ({
  numberUnit,
  targetUnit,
  unitType,
  postfix,
}: NumberWithUnitProps) => {
  const convertedByTargetUnit =
    unitType === 'binary'
      ? convertToBinaryUnit(numberUnit, targetUnit, 2, true)
      : convertToDecimalUnit(numberUnit, targetUnit, 2, true);
  const convertedByAuto =
    unitType === 'binary'
      ? convertToBinaryUnit(numberUnit, 'auto', 2, true)
      : convertToDecimalUnit(numberUnit, 'auto', 2, true);
  return (
    <BAIFlex gap="xxs">
      <Typography.Text>
        {Number(convertedByTargetUnit?.numberFixed).toString()}
        {postfix && postfix}
      </Typography.Text>
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

export default NumberWithUnit;
