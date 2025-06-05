import { generateDisplayValues, InputSizeUnit, SizeUnit } from '.';
import { Big, type BigSource } from 'big.js';

export namespace BigNumber {
  export function isInvalidNumber(value: unknown): boolean {
    if (typeof value === 'number') {
      return Number.isNaN(value);
    }
    if (value instanceof Big) {
      try {
        // Attempt to perform an operation to ensure the Big instance is valid
        (value as Big).toString();
        return false;
      } catch {
        return true;
      }
    }
    return true; // If not a number or Big instance, consider it invalid
  }

  export function parseUnit(other: BigSource): [Big, SizeUnit] {
    if (typeof other === 'number') {
      return [new Big(other), ''];
    }

    if (typeof other === 'string') {
      const match = other?.match(/^(\d*\.?\d+)\s*([a-zA-Z%]*)$/);
      if (!match) {
        return [new Big(other), ''];
      }

      return [
        new Big(match[1]),
        !match[2] || match[2].length === 0 ? '' : (match[2] as SizeUnit),
      ];
    }

    return [new Big(other), ''];
  }

  export function convertUnitValue(
    inputValue?: BigSource,
    targetUnit?: SizeUnit | 'auto',
    options?: {
      fixed?: number;
      round?: boolean;
      base?: 1024 | 1000;
    },
  ) {
    const { fixed = 2, round = false, base = 1024 } = options || {};
    if (inputValue === undefined) {
      return undefined;
    }

    const sizes = ['', 'k', 'm', 'g', 't', 'p', 'e'];
    const [sizeValue, sizeUnit] = parseUnit(inputValue);

    if (isInvalidNumber(sizeValue)) {
      throw new Error(`Invalid size value: ${sizeValue}`);
    }

    const sizeIndex = sizes.indexOf(sizeUnit.toLowerCase());

    if (sizeIndex === -1) {
      throw new Error(`Invalid size unit: ${sizeUnit}`);
    }

    const bytes = (sizeValue as Big).times(base ** sizeIndex);
    let targetIndex = 0;

    if (targetUnit === 'auto') {
      targetIndex = logBigNumber(bytes, base);
      targetIndex = Math.min(Math.max(targetIndex, 0), sizes.length - 1);
    } else {
      targetIndex = targetUnit ? sizes.indexOf(targetUnit.toLowerCase()) : 0;
    }

    const finalBytes = bytes.div(base ** targetIndex);
    const numberFixed = round
      ? finalBytes.toFixed(fixed)
      : toFixedFloorWithoutTrailingZeros(finalBytes, fixed);

    const unit = sizes[targetIndex] as InputSizeUnit;

    return {
      number: finalBytes,
      numberFixed,
      unit,
      value: `${numberFixed}${unit}`,
    };
  }

  export function convertToBinaryUnit(
    inputValue?: BigSource,
    targetUnit?: SizeUnit | 'auto',
    fixed = 2,
    round = false,
  ) {
    return generateDisplayValues(
      BigNumber.convertUnitValue(inputValue, targetUnit, {
        fixed,
        round,
        base: 1024,
      }),
      {
        baseDisplayUnit: 'BiB',
        displayUnitSuffix: 'iB',
      },
    );
  }

  export function convertToDecimalUnit(
    inputValue?: BigSource,
    targetUnit?: SizeUnit | 'auto',
    fixed = 2,
    round = false,
  ) {
    return generateDisplayValues(
      BigNumber.convertUnitValue(inputValue, targetUnit, {
        fixed,
        round,
        base: 1000,
      }),
      {
        baseDisplayUnit: 'B',
        displayUnitSuffix: 'B',
      },
    );
  }

  export function toFixedFloorWithoutTrailingZeros(
    value: BigSource,
    fixed: number,
  ) {
    return BigNumber.parseUnit(
      BigNumber.parseUnit(value)[0].toFixed(fixed),
    )[0].toString();
  }

  // alias for shortened name
  export const toFixedWithNoZero = toFixedFloorWithoutTrailingZeros;

  export function compareNumberWithUnits(
    size1: BigSource,
    size2: BigSource,
  ): number {
    const [number1, unit1] = BigNumber.parseUnit(size1);
    const [number2, unit2] = BigNumber.parseUnit(size2);

    if (unit1 === unit2) {
      return compareBigNumber(number1, number2);
    }

    if (number1.eq(0) && number2.eq(0)) {
      return 0;
    }

    const value1 = BigNumber.convertToBinaryUnit(size1, 'g');
    const value2 = BigNumber.convertToBinaryUnit(size2, 'g');

    return compareBigNumber(value1?.number, value2?.number);
  }

  export function addNumberWithUnits(
    size1: BigSource,
    size2: BigSource,
    targetSizeUnit: SizeUnit = 'm',
  ) {
    const number1 = new Big(
      BigNumber.convertToBinaryUnit(size1, '')?.number || 0,
    );
    const number2 = new Big(
      BigNumber.convertToBinaryUnit(size2, '')?.number || 0,
    );
    return BigNumber.convertUnitValue(number1.add(number2), targetSizeUnit, {
      fixed: 2,
      round: false,
    })?.value;
  }

  export function subNumberWithUnits(
    size1: BigSource,
    size2: BigSource,
    targetSizeUnit: SizeUnit = 'm',
  ) {
    const number1 = new Big(
      BigNumber.convertToBinaryUnit(size1, '')?.number || 0,
    );
    const number2 = new Big(
      BigNumber.convertToBinaryUnit(size2, '')?.number || 0,
    );
    return BigNumber.convertUnitValue(number1.minus(number2), targetSizeUnit, {
      fixed: 2,
      round: false,
    })?.value;
  }

  export function isOutsideRangeWithUnits(
    value?: string,
    min?: string,
    max?: string,
  ) {
    if (value === undefined) {
      return false;
    }
    if (min !== undefined && compareNumberWithUnits(value, min) < 0) {
      return true;
    }

    if (max !== undefined && compareNumberWithUnits(value, max) > 0) {
      return true;
    }

    return false;
  }
}

// Calculates the logarithm of a Big number with respect to a specified base.
function logBigNumber(value: Big, logBase: number): number {
  if (value.lte(0)) {
    throw new Error('Invalid value for logarithm');
  }

  let exponent = 0;
  let comparison = new Big(1);
  const baseNumber = new Big(logBase);

  while (comparison.times(baseNumber).lte(value)) {
    comparison = comparison.times(baseNumber);
    exponent++;

    // Safety limit to prevent infinite loops with very large numbers
    if (exponent > 1000) {
      break;
    }
  }

  return exponent;
}

function compareBigNumber(a?: Big, b?: Big): number {
  if (!a && !b) {
    return 0;
  }

  if (!a) {
    return -1;
  }

  if (!b) {
    return 1;
  }

  if (a.eq(b)) {
    return 0;
  }

  if (a.gt(b)) {
    return 1;
  }

  return -1;
}
