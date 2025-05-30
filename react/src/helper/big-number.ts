import { Big, type BigSource } from 'big.js';

type SizeUnit =
  | 'B'
  | 'K'
  | 'M'
  | 'G'
  | 'T'
  | 'P'
  | 'E'
  | 'b'
  | 'k'
  | 'm'
  | 'g'
  | 't'
  | 'p'
  | 'e';

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

  export function parseUnit(
    other: BigSource,
    unit: SizeUnit = 'b',
  ): [Big, SizeUnit] {
    if (typeof other === 'number') {
      return [new Big(other), unit];
    }

    if (typeof other === 'string') {
      const match = other?.match(/^(\d*\.?\d+)([a-zA-Z%]*)$/);
      if (!match) {
        return [new Big(other), unit];
      }

      return [
        new Big(match[1]),
        !match[2] || match[2].length === 0
          ? 'b'
          : (match[2].toLowerCase() as SizeUnit),
      ];
    }

    return [new Big(other), unit];
  }

  export function convertSizeUnit(
    sizeWithUnit?: BigSource,
    targetSizeUnit?: SizeUnit | 'auto',
    fixed = 2,
    round = false,
    base: 1024 | 1000 = 1024,
  ) {
    if (sizeWithUnit === undefined) {
      return undefined;
    }

    const sizes = ['B', 'K', 'M', 'G', 'T', 'P', 'E'];
    const [sizeValue, sizeUnit] = parseUnit(sizeWithUnit);

    if (isInvalidNumber(sizeValue)) {
      throw new Error(`Invalid size value: ${sizeValue}`);
    }

    const sizeIndex = sizes.indexOf(sizeUnit.toUpperCase() as SizeUnit);

    if (sizeIndex === -1) {
      throw new Error(`Invalid size unit: ${sizeUnit}`);
    }

    const bytes = (sizeValue as Big).times(base ** sizeIndex);
    let targetIndex = 0;

    if (targetSizeUnit === 'auto') {
      targetIndex = logBigNumber(bytes, base);
      targetIndex = Math.min(Math.max(targetIndex, 0), sizes.length - 1);
    } else {
      targetIndex = targetSizeUnit
        ? sizes.indexOf(targetSizeUnit.toUpperCase() as SizeUnit)
        : sizeIndex;
    }

    const finalBytes = bytes.div(base ** targetIndex);
    const numberFixed = round
      ? finalBytes.toFixed(fixed)
      : toFixedFloorWithoutTrailingZeros(finalBytes, fixed);

    return {
      number: finalBytes,
      numberFixed,
      unit: sizes[targetIndex],
      numberUnit: `${numberFixed}${sizes[targetIndex]}`,
    };
  }

  export function convertBinarySizeUnit(
    sizeWithUnit?: BigSource,
    targetSizeUnit?: SizeUnit | 'auto',
    fixed = 2,
    round = false,
  ) {
    return BigNumber.convertSizeUnit(
      sizeWithUnit,
      targetSizeUnit,
      fixed,
      round,
      1024,
    );
  }

  export function convertDecimalSizeUnit(
    sizeWithUnit?: BigSource,
    targetSizeUnit?: SizeUnit | 'auto',
    fixed = 2,
    round = false,
  ) {
    return BigNumber.convertSizeUnit(
      sizeWithUnit,
      targetSizeUnit,
      fixed,
      round,
      1000,
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

    const value1 = BigNumber.convertBinarySizeUnit(size1, 'g');
    const value2 = BigNumber.convertBinarySizeUnit(size2, 'g');

    return compareBigNumber(value1?.number, value2?.number);
  }

  export function addNumberWithUnits(
    size1: BigSource,
    size2: BigSource,
    targetSizeUnit: SizeUnit = 'm',
  ) {
    const number1 = new Big(
      BigNumber.convertBinarySizeUnit(size1, 'b')?.number || 0,
    );
    const number2 = new Big(
      BigNumber.convertBinarySizeUnit(size2, 'b')?.number || 0,
    );
    return BigNumber.convertSizeUnit(
      number1.add(number2),
      targetSizeUnit,
      2,
      false,
    )?.numberUnit;
  }

  export function subNumberWithUnits(
    size1: BigSource,
    size2: BigSource,
    targetSizeUnit: SizeUnit = 'm',
  ) {
    const number1 = new Big(
      BigNumber.convertBinarySizeUnit(size1, 'b')?.number || 0,
    );
    const number2 = new Big(
      BigNumber.convertBinarySizeUnit(size2, 'b')?.number || 0,
    );
    return BigNumber.convertSizeUnit(
      number1.minus(number2),
      targetSizeUnit,
      2,
      false,
    )?.numberUnit;
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
