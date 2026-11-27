/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { convertToBinaryUnit } from '../../../helper';
import type { WebUISizeSetting } from '../../../helper/webuiSettings';
import * as _ from 'lodash-es';

/** A size string (`"512m"`) as the setting's stored number; bytes and MiB are whole. */
const toStoredNumber = (sizeString: string, size: WebUISizeSetting) =>
  _.round(
    convertToBinaryUnit(sizeString, size.storedUnit, 6)?.number ?? 0,
    size.storedUnit === 'g' ? 6 : 0,
  );

/**
 * A size string as the setting's stored number, clamped to the size bounds.
 * Switching the unit keeps the typed number (512 MiB -> 512 GiB), and a value
 * out of range would be dropped from the saved document, so it is clamped
 * here. `0` (store nothing) when the string is empty or not positive.
 */
export const toStoredSize = (
  sizeString: string | null | undefined,
  size: WebUISizeSetting,
): number => {
  const stored = _.isEmpty(sizeString)
    ? 0
    : toStoredNumber(sizeString as string, size);
  if (stored <= 0) return 0;
  return _.clamp(
    stored,
    toStoredNumber(size.min, size),
    toStoredNumber(size.max, size),
  );
};

/** A stored number in the largest of the setting's units it fills. */
export const toSizeString = (
  stored: number,
  size: WebUISizeSetting,
): string | undefined => {
  const auto = convertToBinaryUnit(`${stored}${size.storedUnit}`, 'auto');
  const unit = _.includes(size.units, auto?.unit) ? auto?.unit : size.units[0];
  return convertToBinaryUnit(
    `${stored}${size.storedUnit}`,
    unit as (typeof size.units)[number],
  )?.value;
};

/** The default as the number part of the input, in the setting's default unit. */
export const toPlaceholder = (
  stored: number,
  size: WebUISizeSetting,
): string | undefined =>
  convertToBinaryUnit(`${stored}${size.storedUnit}`, size.defaultUnit, 2)
    ?.numberFixed;
