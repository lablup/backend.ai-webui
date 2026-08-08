/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIAllowedHostNamesSelect` on Astryx (to-astryx phase 3, wave 2 / W2-D).

 antd `Select` + `Select.Option` children -> `BAISelect` with an `options`
 array. `BAISelect` is now the Astryx-backed frontier wrapper (this file's
 sibling), so this module keeps its antd-shaped surface (`mode="multiple"`,
 `allowClear`, `placeholder`, `style`, `value`, `onChange`) with no direct antd
 import of its own (P15).

 PILOT-DECISION — **`Select.Option` children become `options`.** MAPPING §3.1
 lists `OptGroup`/child-option syntax as having no destination; Astryx's
 `Selector` is `options`-driven only. The two shapes were already equivalent
 here (a flat list of `{value, label}` pairs where label === value), so this is
 a rewrite of the call, not a change of behaviour.
*/
import { useAllowedHostNames } from '../hooks';
import BAISelect, { type BAISelectProps } from './BAISelect';
import * as _ from 'lodash-es';
import React from 'react';

export interface AllowedHostNamesSelectProps extends BAISelectProps {}

const AllowedHostNamesSelect: React.FC<AllowedHostNamesSelectProps> = ({
  ...selectProps
}) => {
  const allowedHostNames = useAllowedHostNames();

  return (
    <BAISelect
      {...selectProps}
      options={_.map(allowedHostNames, (hostName) => ({
        value: hostName,
        label: hostName,
      }))}
    />
  );
};

export default AllowedHostNamesSelect;
