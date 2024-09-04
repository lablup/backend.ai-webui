import { iSizeToSize } from '../helper';
import { useResourceSlotsDetails } from '../hooks/backendai';
import { useCurrentResourceGroupValue } from '../hooks/useCurrentProject';
import Flex from './Flex';
import { Tooltip, Typography, theme } from 'antd';
import _ from 'lodash';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export const ACCELERATOR_UNIT_MAP: {
  [key: string]: string;
} = {
  'cuda.device': 'GPU',
  'cuda.shares': 'FGPU',
  'rocm.device': 'GPU',
  'tpu.device': 'TPU',
  'ipu.device': 'IPU',
  'atom.device': 'ATOM',
  'atom-plus.device': 'ATOM+',
  'gaudi2.device': 'Gaudi 2',
  'warboy.device': 'Warboy',
  'hyperaccel-lpu.device': 'Hyperaccel LPU',
};

export type ResourceOpts = {
  shmem?: number;
};
interface ResourceNumberProps {
  type: string;
  extra?: ReactElement;
  opts?: ResourceOpts;
  value: string;
  hideTooltip?: boolean;
  max?: string;
}

type ResourceTypeInfo<V> = {
  [key in string]: V;
};
const ResourceNumber: React.FC<ResourceNumberProps> = ({
  type,
  value: amount,
  extra,
  opts,
  hideTooltip = false,
  max,
}) => {
  const { token } = theme.useToken();
  const currentGroup = useCurrentResourceGroupValue();
  const [resourceSlotsDetails] = useResourceSlotsDetails(
    currentGroup || undefined,
  );

  const formatAmount = (amount: string) => {
    return resourceSlotsDetails?.[type]?.number_format.binary
      ? Number(iSizeToSize(amount, 'g', 3, true)?.numberFixed).toString()
      : (resourceSlotsDetails?.[type]?.number_format.round_length || 0) > 0
        ? parseFloat(amount).toFixed(2)
        : amount;
  };

  return (
    <Flex direction="row" gap="xxs">
      {resourceSlotsDetails?.[type] ? (
        <ResourceTypeIcon type={type} showTooltip={!hideTooltip} />
      ) : (
        type
      )}

      <Typography.Text>
        {formatAmount(amount)}
        {_.isUndefined(max)
          ? null
          : max === 'Infinity'
            ? '~∞'
            : `~${formatAmount(max)}`}
      </Typography.Text>
      <Typography.Text type="secondary">
        {resourceSlotsDetails?.[type]?.display_unit || ''}
      </Typography.Text>
      {type === 'mem' && opts?.shmem && opts?.shmem > 0 ? (
        <Typography.Text
          type="secondary"
          style={{ fontSize: token.fontSizeSM }}
        >
          (SHM: {iSizeToSize(opts.shmem + 'b', 'g', 2, true)?.numberFixed}
          GiB)
        </Typography.Text>
      ) : null}
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
  type: string;
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
    'rocm.device': ['/resources/icons/rocm.svg', 'GPU'],
    'tpu.device': [<MWCIconWrap size={size}>view_module</MWCIconWrap>, 'TPU'],
    'ipu.device': [<MWCIconWrap size={size}>view_module</MWCIconWrap>, 'IPU'],
    'atom.device': ['/resources/icons/rebel.svg', 'ATOM'],
    'atom-plus.device': ['/resources/icons/rebel.svg', 'ATOM+'],
    'gaudi2.device': ['/resources/icons/gaudi.svg', 'Gaudi 2'],
    'warboy.device': ['/resources/icons/furiosa.svg', 'Warboy'],
    'hyperaccel-lpu.device': [
      '/resources/icons/npu_generic.svg',
      'Hyperaccel LPU',
    ],
  };

  const content =
    typeof resourceTypeIconSrcMap[type]?.[0] === 'string' ? (
      <img
        {...props}
        style={{
          height: size,
          alignSelf: 'center',
          ...(props.style || {}),
        }}
        // @ts-ignore
        src={resourceTypeIconSrcMap[type]?.[0] || ''}
        alt={type}
      />
    ) : (
      <Flex style={{ width: 16, height: 16 }}>
        {resourceTypeIconSrcMap[type]?.[0] || type}
      </Flex>
    );

  return showTooltip ? (
    // <Tooltip title={showTooltip ? `${type} (${resourceTypeIconSrcMap[type][1]})` : undefined}>
    <Tooltip title={type}>{content}</Tooltip>
  ) : (
    <Flex style={{ pointerEvents: 'none' }}>{content}</Flex>
  );
};

export default React.memo(ResourceNumber);
