import { useAllowedHostNames } from '../hooks';
import { Select, SelectProps } from 'antd';
import _ from 'lodash';
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
