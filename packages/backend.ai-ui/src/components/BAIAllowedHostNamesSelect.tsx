/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The allowed storage host names as a multi-select (`BAIMultiSelector`).
*/
import { useAllowedHostNames } from '../hooks';
import BAIMultiSelector, {
  type BAIMultiSelectorProps,
} from './BAIMultiSelector';
import * as _ from 'lodash-es';
import React from 'react';

export interface AllowedHostNamesSelectProps extends Omit<
  BAIMultiSelectorProps,
  'options'
> {}

const AllowedHostNamesSelect: React.FC<AllowedHostNamesSelectProps> = (
  multiSelectorProps,
) => {
  'use memo';
  const allowedHostNames = useAllowedHostNames();

  return (
    <BAIMultiSelector
      hasSearch
      {...multiSelectorProps}
      options={_.map(allowedHostNames, (hostName) => ({
        value: hostName,
        label: hostName,
      }))}
    />
  );
};

export default AllowedHostNamesSelect;
