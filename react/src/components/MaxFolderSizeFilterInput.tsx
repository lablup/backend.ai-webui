/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { GBToBytes } from '../helper';
import { AstryxFormNumberInput } from './astryxFormControls';
import * as _ from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// The server filter takes raw bytes; GB (decimal) is the unit the policy
// setting modal authors this field in and the one the column renders.
const MAX_GIGABYTES = Math.floor(Number.MAX_SAFE_INTEGER / Math.pow(10, 9));

export interface MaxFolderSizeFilterInputProps {
  onAddCondition: (value: string | undefined, label?: string) => void;
}

/**
 * `renderInput` editor for the `maxQuotaScopeSize` property filter on the user
 * and project resource policy lists.
 */
const MaxFolderSizeFilterInput = ({
  onAddCondition,
}: MaxFolderSizeFilterInputProps) => {
  'use memo';
  const { t } = useTranslation();
  const [gigabytes, setGigabytes] = useState<number | null>(null);

  return (
    <AstryxFormNumberInput
      label={t('storageHost.MaxFolderSize')}
      units="GB"
      min={0}
      max={MAX_GIGABYTES}
      width={200}
      value={gigabytes}
      onChange={(next) => {
        setGigabytes(next);
        onAddCondition(
          _.isNil(next) ? undefined : String(GBToBytes(next)),
          _.isNil(next) ? undefined : `${next} GB`,
        );
      }}
    />
  );
};

export default MaxFolderSizeFilterInput;
