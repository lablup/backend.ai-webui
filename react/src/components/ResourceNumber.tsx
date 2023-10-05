import { iSizeToSize } from '../helper';
import Flex from './Flex';
import { Tooltip, Typography, theme } from 'antd';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export type ResourceTypeKey =
  | 'cpu'
  | 'mem'
  | 'cuda.device'
  | 'cuda.shares'
  | 'rocm.device'
  | 'tpu.device'
  | 'ipu.device'
  | 'atom.device'
  | 'warboy.device';

export const ACCELERATOR_UNIT_MAP: {
  [key: string]: string;
} = {
  'cuda.device': 'GPU',
  'cuda.shares': 'FGPU',
  'rocm.device': 'GPU',
  'tpu.device': 'TPU',
  'ipu.device': 'IPU',
  'atom.device': 'ATOM',
  'warboy.device': 'Warboy',
};

export type ResourceOpts = {
  shmem?: number;
};
interface Props {
  type: ResourceTypeKey;
  extra?: ReactElement;
  opts?: ResourceOpts;
  value: string;
}

type ResourceTypeInfo<V> = {
  [key in string]: V;
};
const ResourceNumber: React.FC<Props> = ({
  type,
  value: amount,
  extra,
  opts,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const units: ResourceTypeInfo<string> = {
    cpu: t('session.core'),
    mem: 'GiB',
    ...ACCELERATOR_UNIT_MAP,
  };

  return (
    <Flex direction="row" gap="xxs">
      <ResourceTypeIcon type={type} />
      <Typography.Text>
        {units[type] === 'GiB'
          ? iSizeToSize(amount + 'b', 'g', 2).numberFixed
          : units[type] === 'FGPU'
          ? parseFloat(amount).toFixed(2)
          : amount}
      </Typography.Text>
      <Typography.Text type="secondary">{units[type]}</Typography.Text>
      {type === 'mem' && opts?.shmem && (
        <Typography.Text
          type="secondary"
          style={{ fontSize: token.fontSizeSM }}
        >
          (SHM: {iSizeToSize(opts.shmem + 'b', 'g', 2).numberFixed}
          GiB)
        </Typography.Text>
      )}
      {extra}
    </Flex>
  );
};

const MWCIconWrap: React.FC<{ size?: number; children: string }> = ({
  size = 16,
  children,
}) => {
  return (
    // @ts-ignore
    <mwc-icon
      style={{
        '--mdc-icon-size': `${size + 2}px`,
        width: size,
        height: size,
      }}
    >
      {children}
      {/* @ts-ignore */}
    </mwc-icon>
  );
};
interface AccTypeIconProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  type: ResourceTypeKey;
  showIcon?: boolean;
  showUnit?: boolean;
  showTooltip?: boolean;
  size?: number;
}
export const ResourceTypeIcon: React.FC<AccTypeIconProps> = ({
  type,
  size = 16,
  showIcon = true,
  showUnit = true,
  showTooltip = true,
  ...props
}) => {
  const { t } = useTranslation();

  const resourceTypeIconSrcMap: ResourceTypeInfo<
    [ReactElement | string, string]
  > = {
    cpu: [
      <MWCIconWrap size={size}>developer_board</MWCIconWrap>,
      t('session.core'),
    ],
    mem: [<MWCIconWrap size={size}>memory</MWCIconWrap>, 'GiB'],
    'cuda.device': ['/resources/icons/file_type_cuda.svg', 'GPU'],
    'cuda.shares': ['/resources/icons/file_type_cuda.svg', 'FGPU'],
    'rocm.device': ['/resources/icons/ROCm.png', 'GPU'],
    'tpu.device': [<MWCIconWrap size={size}>view_module</MWCIconWrap>, 'TPU'],
    'ipu.device': [<MWCIconWrap size={size}>view_module</MWCIconWrap>, 'IPU'],
    'atom.device': ['/resources/icons/rebel.svg', 'ATOM'],
    'warboy.device': ['/resources/icons/furiosa.svg', 'Warboy'],
  };

  return (
    <Tooltip
      title={
        // showTooltip ? `${type} (${resourceTypeIconSrcMap[type][1]})` : undefined
        showTooltip ? `${type}` : undefined
      }
    >
      {typeof resourceTypeIconSrcMap[type]?.[0] === 'string' ? (
        <img
          {...props}
          style={{
            height: size,
            ...(props.style || {}),
          }}
          // @ts-ignore
          src={resourceTypeIconSrcMap[type]?.[0] || ''}
          alt={type}
        />
      ) : (
        <div style={{ width: 16, height: 16 }}>
          {resourceTypeIconSrcMap[type]?.[0] || type}
        </div>
      )}
    </Tooltip>
  );
};

export default ResourceNumber;
