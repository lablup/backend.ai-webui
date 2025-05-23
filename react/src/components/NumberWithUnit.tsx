import {
  convertBinarySizeUnit,
  convertDecimalSizeUnit,
  SizeUnit,
  sizeUnitToBinarySizeUnit,
  sizeUnitToDecimalSizeUnit,
} from '../helper';
import Flex from './Flex';
import { Typography } from 'antd';

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
      ? convertBinarySizeUnit(numberUnit, targetUnit, 2, true)
      : convertDecimalSizeUnit(numberUnit, targetUnit, 2, true);
  const convertedByAuto =
    unitType === 'binary'
      ? convertBinarySizeUnit(numberUnit, 'auto', 2, true)
      : convertDecimalSizeUnit(numberUnit, 'auto', 2, true);
  return (
    <Flex gap="xxs">
      <Typography.Text>
        {Number(convertedByTargetUnit?.numberFixed).toString()}
        {postfix && postfix}
      </Typography.Text>
      <Typography.Text type="secondary">
        {unitType === 'binary'
          ? sizeUnitToBinarySizeUnit(convertedByTargetUnit?.unit as SizeUnit)
          : sizeUnitToDecimalSizeUnit(convertedByTargetUnit?.unit as SizeUnit)}
        {Number(convertedByTargetUnit?.numberFixed).toString() === '0' &&
          Number(convertedByAuto?.numberFixed).toString() !== '0' &&
          `(${Number(convertedByAuto?.numberFixed).toString()} ${
            unitType === 'binary'
              ? sizeUnitToBinarySizeUnit(convertedByAuto?.unit as SizeUnit)
              : sizeUnitToDecimalSizeUnit(convertedByAuto?.unit as SizeUnit)
          })`}
      </Typography.Text>
    </Flex>
  );
};

export default NumberWithUnit;
