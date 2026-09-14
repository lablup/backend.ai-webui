/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { GBToBytes } from '../helper';
import { AstryxFormNumberInput } from './astryxFormControls';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';

// The server filter takes raw bytes; GB (decimal) is the unit the policy
// setting modal authors this field in and the one the column renders.
const BYTES_PER_GB = Math.pow(10, 9);
const MAX_GIGABYTES = Math.floor(Number.MAX_SAFE_INTEGER / BYTES_PER_GB);

export interface MaxFolderSizeFilterInputProps {
  onAddCondition: (value: string | undefined, label?: string) => void;
  /** The staged (or committed) condition value, in raw bytes. */
  value: string | null;
  /** The edit popover's disabled state. */
  isDisabled?: boolean;
}

/**
 * `renderInput` editor for the `maxQuotaScopeSize` property filter on the user
 * and project resource policy lists.
 */
const MaxFolderSizeFilterInput = ({
  onAddCondition,
  value,
  isDisabled,
}: MaxFolderSizeFilterInputProps) => {
  'use memo';
  const { t } = useTranslation();
  // Controlled by the staged value, so reopening a condition — or restoring one
  // from a shared URL — shows the GB the filter actually holds.
  const bytes = _.isEmpty(value) ? NaN : Number(value);
  const gigabytes = Number.isFinite(bytes) ? bytes / BYTES_PER_GB : null;

  return (
    <AstryxFormNumberInput
      label={t('storageHost.MaxFolderSize')}
      units="GB"
      min={0}
      max={MAX_GIGABYTES}
      width={200}
      value={gigabytes}
      disabled={isDisabled}
      onChange={(next) => {
        onAddCondition(
          _.isNil(next) ? undefined : String(GBToBytes(next)),
          _.isNil(next) ? undefined : `${next} GB`,
        );
      }}
    />
  );
};

export default MaxFolderSizeFilterInput;
