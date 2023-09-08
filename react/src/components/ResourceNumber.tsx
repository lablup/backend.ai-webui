import { iSizeToSize } from '../helper';
import Flex from './Flex';
import { Tooltip, Typography } from 'antd';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

type ResourceTypeKey =
  | 'cpu'
  | 'mem'
  | 'cuda.device'
  | 'cuda.shares'
  | 'rocm.device'
  | 'tpu.slot'
  | 'ipu.slot'
  | 'atom.slot'
  | 'warboy.slot'
  | string;
interface Props {
  type: ResourceTypeKey | string;
  extra?: ReactElement;
  value: number;
}
const ResourceNumber: React.FC<Props> = ({ type, value: amount, extra }) => {
  const { t } = useTranslation();
  const units: {
    [key: ResourceTypeKey]: string;
  } = {
    cpu: t('session.core'),
    mem: 'GiB',
    'cuda.device': 'GPU',
    'cuda.shares': 'FGPU',
    'rocm.device': 'GPU',
    'tpu.slot': 'TPU',
    'ipu.slot': 'IPU',
    'atom.slot': 'ATOM',
    'warboy.slot': 'Warboy',
  };

  return (
    <Flex direction="row" gap="xxs">
      <ResourceTypeIcon type={type} />
      <Typography.Text>
        {units[type] === 'GiB'
          ? iSizeToSize(amount + 'b', 'g', 2).numberFixed
          : amount}
      </Typography.Text>
      <Typography.Text type="secondary">{units[type]}</Typography.Text>
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

  const resourceTypeIconSrcMap: {
    [key: ResourceTypeKey]: [string | ReactElement | null, string];
  } = {
    cpu: [
      <MWCIconWrap size={size}>developer_board</MWCIconWrap>,
      t('session.core'),
    ],
    mem: [<MWCIconWrap size={size}>memory</MWCIconWrap>, 'GiB'],
    'cuda.device': ['/resources/icons/file_type_cuda.svg', 'GPU'],
    'cuda.shares': ['/resources/icons/file_type_cuda.svg', 'FGPU'],
    'rocm.device': ['/resources/icons/ROCm.png', 'GPU'],
    'tpu.slot': [<MWCIconWrap size={size}>view_module</MWCIconWrap>, 'TPU'],
    'ipu.slot': [<MWCIconWrap size={size}>view_module</MWCIconWrap>, 'IPU'],
    'atom.slot': ['/resources/icons/rebel.svg', 'ATOM'],
    'warboy.slot': ['/resources/icons/furiosa.svg', 'Warboy'],
  };

  return (
    <Tooltip
      title={
        showTooltip ? `${type} (${resourceTypeIconSrcMap[type][1]})` : undefined
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
          {resourceTypeIconSrcMap[type]?.[0]}
        </div>
      )}
    </Tooltip>
  );
};

export default ResourceNumber;
