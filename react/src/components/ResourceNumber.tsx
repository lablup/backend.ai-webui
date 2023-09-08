import { humanReadableBinarySize } from '../helper';
import { Tag, Typography } from 'antd';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  type: string;
  value: number;
}
const ResourceNumber: React.FC<Props> = ({ type, value: amount }) => {
  return type === 'cpu' ? (
    <Typography.Text>CPU: {amount}</Typography.Text>
  ) : type === 'mem' ? (
    <Typography.Text>
      Mem: {humanReadableBinarySize(parseInt(amount + ''))}
    </Typography.Text>
  ) : (
    <Typography.Text>
      {_.upperCase(type.split('.')[0])}: {amount}
    </Typography.Text>
  );
};

interface AccTypeIconProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  type:
    | 'cpu'
    | 'mem'
    | 'cuda.device'
    | 'cuda.shares'
    | 'rocm.device'
    | 'tpu.slot'
    | 'ipu.slot'
    | 'atom.slot'
    | 'warboy.slot';
  showIcon?: boolean;
  showUnit?: boolean;
  size?: number;
}
export const ResourceTypeIcon: React.FC<AccTypeIconProps> = ({
  type,
  showIcon = true,
  showUnit = true,
  ...props
}) => {
  const { t } = useTranslation();
  const resourceTypeIconSrcMap: {
    [key: string]: [string | null, string];
  } = {
    cpu: [
      //@ts-ignore
      <mwc-icon class="fg green indicator">developer_board</mwc-icon>,
      t('session.core'),
    ],
    //@ts-ignore
    mem: [<mwc-icon class="fg green indicator">memory</mwc-icon>, 'MEM'],
    'cuda.device': ['/resources/icons/file_type_cuda.svg', 'GPU'],
    'cuda.shares': ['/resources/icons/file_type_cuda.svg', 'FGPU'],
    'rocm.device': ['/resources/icons/ROCm.png', 'GPU'],
    'tpu.slot': [
      //@ts-ignore
      <mwc-icon class="fg green indicator">view_module</mwc-icon>,
      'TPU',
    ],
    'ipu.slot': [
      //@ts-ignore
      <mwc-icon class="fg green indicator">view_module</mwc-icon>,
      'IPU',
    ],
    'atom.slot': ['/resources/icons/rebel.svg', 'ATOM'],
    'warboy.slot': ['/resources/icons/furiosa.svg', 'Warboy'],
  };

  return typeof resourceTypeIconSrcMap[type]?.[0] === 'string' ? (
    <img
      {...props}
      style={{
        width: props.size,
        height: props.size,
        ...(props.style || {}),
      }}
      src="/resources/icons/file_type_cuda.svg"
      alt={type}
    />
  ) : (
    resourceTypeIconSrcMap[type]?.[0]
  );
};

export default ResourceNumber;
