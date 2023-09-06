import { humanReadableBinarySize } from '../helper';
import { Typography } from 'antd';
import _ from 'lodash';
import React from 'react';

interface Props {
  cpu: number | string;
  mem: number | string;
  gpu: number | string;
}
const ResourcesNumbers: React.FC<Props> = ({ cpu, mem, gpu }) => {
  return (
    <>
      {!_.isUndefined(cpu) && <Typography.Text>CPU: {cpu}</Typography.Text>}
      {!_.isUndefined(mem) && (
        <Typography.Text>
          Mem: {humanReadableBinarySize(parseInt(mem + ''))}
        </Typography.Text>
      )}
      {!_.isUndefined(gpu) && <Typography.Text>GPU: {gpu}</Typography.Text>}
    </>
  );
};

export default ResourcesNumbers;
