import { useAllowedHostNames } from '../hooks';
import { Select, type SelectProps } from 'antd';
import * as _ from 'lodash-es';
import React from 'react';

interface AllowedHostNamesSelectProps extends SelectProps {}

const AllowedHostNamesSelect: React.FC<AllowedHostNamesSelectProps> = ({
  ...selectProps
}) => {
  const allowedHostNames = useAllowedHostNames();

  return (
    <Select {...selectProps}>
      {_.map(allowedHostNames, (hostName) => (
        <Select.Option key={hostName} value={hostName}>
          {hostName}
        </Select.Option>
      ))}
    </Select>
  );
};

export default AllowedHostNamesSelect;
