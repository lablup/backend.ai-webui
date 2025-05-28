import { convertToBinaryUnit } from '../helper';
import {
  BaseResourceSlotName,
  KnownAcceleratorResourceSlotName,
  ResourceSlotName,
  useResourceSlotsDetails,
} from '../hooks/backendai';
import { useCurrentResourceGroupValue } from '../hooks/useCurrentProject';
import Flex from './Flex';
import NumberWithUnit from './NumberWithUnit';
import { Tooltip, Typography, theme } from 'antd';
import _ from 'lodash';
import { MicrochipIcon } from 'lucide-react';
import React, { ReactElement } from 'react';

export type ResourceOpts = {
  shmem?: number;
};
interface ResourceNumberProps {
  type: ResourceSlotName | string;
  extra?: ReactElement;
  opts?: ResourceOpts;
  value: string;
  hideTooltip?: boolean;
  max?: string;
}

type ResourceTypeInfo<V> = {
  [key in KnownAcceleratorResourceSlotName]: V;
} & {
  [key in BaseResourceSlotName]: V;
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
  const { mergedResourceSlots } = useResourceSlotsDetails(
    currentGroup || undefined,
  );

  const formatAmount = (amount: string) => {
    return mergedResourceSlots?.[type]?.number_format.binary
      ? Number(
          convertToBinaryUnit(amount, 'g', 2, true)?.numberFixed,
        ).toString()
      : (mergedResourceSlots?.[type]?.number_format.round_length || 0) > 0
        ? parseFloat(amount).toFixed(2)
        : amount;
  };

  return (
    <Flex direction="row" gap="xxs">
      {mergedResourceSlots?.[type] ? (
        <ResourceTypeIcon type={type} showTooltip={!hideTooltip} />
      ) : (
        type
      )}
      {mergedResourceSlots?.[type]?.number_format.binary ? (
        <NumberWithUnit
          numberUnit={amount}
          targetUnit="g"
          unitType="binary"
          postfix={
            _.isUndefined(max)
              ? ''
              : max === 'Infinity'
                ? '~∞'
                : `~${formatAmount(max)}`
          }
        />
      ) : (
        <>
          <Typography.Text>
            {formatAmount(amount)}
            {_.isUndefined(max)
              ? null
              : max === 'Infinity'
                ? '~∞'
                : `~${formatAmount(max)}`}
          </Typography.Text>
          <Typography.Text type="secondary">
            {mergedResourceSlots?.[type]?.display_unit || ''}
          </Typography.Text>
        </>
      )}

      {type === 'mem' && opts?.shmem && opts?.shmem > 0 ? (
        <Typography.Text
          type="secondary"
          style={{ fontSize: token.fontSizeSM }}
        >
          (SHM: {convertToBinaryUnit(opts.shmem, 'g', 2, true)?.numberFixed}
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
  type: ResourceSlotName | string;
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
  const resourceTypeIconSrcMap: ResourceTypeInfo<ReactElement | string> = {
    cpu: <MWCIconWrap size={size}>developer_board</MWCIconWrap>,
    mem: <MWCIconWrap size={size}>memory</MWCIconWrap>,
    'cuda.device': '/resources/icons/file_type_cuda.svg',
    'cuda.shares': '/resources/icons/file_type_cuda.svg',
    'rocm.device': '/resources/icons/rocm.svg',
    'tpu.device': '/resources/icons/tpu.svg',
    'ipu.device': '/resources/icons/ipu.svg',
    'atom.device': '/resources/icons/rebel.svg',
    'atom-plus.device': '/resources/icons/rebel.svg',
    'gaudi2.device': '/resources/icons/gaudi.svg',
    'warboy.device': '/resources/icons/furiosa.svg',
    'rngd.device': '/resources/icons/furiosa.svg',
    'hyperaccel-lpu.device': '/resources/icons/npu_generic.svg',
  };

  const targetIcon = resourceTypeIconSrcMap[
    type as KnownAcceleratorResourceSlotName
  ] ?? <MicrochipIcon />;

  const { mergedResourceSlots } = useResourceSlotsDetails();

  const content =
    typeof targetIcon === 'string' ? (
      <img
        {...props}
        style={{
          height: size,
          alignSelf: 'center',
          ...(props.style || {}),
        }}
        // @ts-ignore
        src={resourceTypeIconSrcMap[type] || ''}
        alt={type}
      />
    ) : (
      <Flex style={{ width: 16, height: 16 }}>{targetIcon || type}</Flex>
    );

  return showTooltip ? (
    <Tooltip title={mergedResourceSlots[type]?.description || type}>
      {content}
    </Tooltip>
  ) : (
    <Flex style={{ pointerEvents: 'none' }}>{content}</Flex>
  );
};

export default React.memo(ResourceNumber);
