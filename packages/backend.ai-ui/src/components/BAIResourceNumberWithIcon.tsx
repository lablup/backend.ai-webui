import { convertToBinaryUnit } from '../helper';
import { BAINvidiaIcon } from '../icons';
import BAIFuriosaIcon from '../icons/BAIFuriosaIcon';
import BAIGaudiIcon from '../icons/BAIGaudiIcon';
import BAIIpuIcon from '../icons/BAIIpuIcon';
import BAIRebelIcon from '../icons/BAIRebelIcon';
import BAIRocmIcon from '../icons/BAIRocmIcon';
import BAITenstorrentIcon from '../icons/BAITenstorrentIcon';
import BAITpuIcon from '../icons/BAITpuIcon';
import BAIFlex from './BAIFlex';
import NumberWithUnit from './BAINumberWithUnit';
import BAIText from './BAIText';
import { ResourceSlotName, useBAIDeviceMetaData } from './provider';
import { theme, Tooltip, TooltipProps } from 'antd';
import _ from 'lodash';
import { CpuIcon, MemoryStickIcon, MicrochipIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type ResourceOpts = {
  shmem?: number;
};

export interface BAIResourceNumberWithIconProps {
  type: string;
  extra?: ReactNode;
  opts?: ResourceOpts;
  value: string;
  hideTooltip?: boolean;
  max?: string;
}

/**
 * Displays a resource value with its corresponding icon and unit.
 * Supports various resource types (CPU, memory, accelerators) with automatic formatting.
 *
 * @param type - Resource type (e.g., 'cpu', 'mem', 'cuda.device', 'rocm.device')
 * @param value - Resource amount as string
 * @param max - Optional maximum value, supports 'Infinity' for unlimited resources
 * @param hideTooltip - When true, hides the tooltip on the resource icon
 * @param opts - Additional options like shmem for memory resources
 * @param extra - Extra content to display after the resource number
 */
const BAIResourceNumberWithIcon = ({
  type,
  extra,
  opts,
  value: amount,
  max,
  hideTooltip = false,
}: BAIResourceNumberWithIconProps) => {
  'use memo';

  const deviceMetaData = useBAIDeviceMetaData();
  const { token } = theme.useToken();

  const formatAmount = (amount: string) => {
    const roundLength = deviceMetaData?.[type]?.number_format.round_length || 0;
    return deviceMetaData?.[type]?.number_format.binary
      ? Number(
          convertToBinaryUnit(amount, 'g', 2, true)?.numberFixed,
        ).toString()
      : roundLength > 0
        ? parseFloat(amount).toFixed(roundLength)
        : amount;
  };

  return (
    <BAIFlex direction="row" gap="xxs">
      {deviceMetaData?.[type] ? (
        <ResourceTypeIcon type={type} showTooltip={!hideTooltip} />
      ) : (
        type
      )}
      {deviceMetaData?.[type]?.number_format.binary ? (
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
          <BAIText>
            {formatAmount(amount)}
            {_.isUndefined(max)
              ? null
              : max === 'Infinity'
                ? '~∞'
                : `~${formatAmount(max)}`}
          </BAIText>
          <BAIText type="secondary" style={{ whiteSpace: 'nowrap' }}>
            {deviceMetaData?.[type]?.display_unit || ''}
          </BAIText>
        </>
      )}

      {type === 'mem' && opts?.shmem && opts?.shmem > 0 ? (
        <BAIText type="secondary" style={{ fontSize: token.fontSizeSM }}>
          (SHM: {convertToBinaryUnit(opts.shmem, 'g', 2, true)?.numberFixed}
          GiB)
        </BAIText>
      ) : null}
      {extra}
    </BAIFlex>
  );
};

const knownDeviceIcons = {
  gaudi: <BAIGaudiIcon />,
  furiosa: <BAIFuriosaIcon />,
  tpu: <BAITpuIcon />,
  ipu: <BAIIpuIcon />,
  nvidia: <BAINvidiaIcon />,
  rocm: <BAIRocmIcon />,
  rebel: <BAIRebelIcon />,
  tenstorrent: <BAITenstorrentIcon />,
} as const;

interface ResourceTypeIconProps {
  type: ResourceSlotName | string;
  showTooltip?: boolean;
  tooltipProps?: TooltipProps;
  size?: number;
}

export const ResourceTypeIcon = ({
  type,
  showTooltip = true,
  size = 16,
  tooltipProps,
}: ResourceTypeIconProps) => {
  'use memo';

  const deviceMetaData = useBAIDeviceMetaData();

  const getIconContent = () => {
    if (type === 'cpu') {
      return (
        <BAIFlex style={{ width: size, height: size }}>
          <CpuIcon />
        </BAIFlex>
      );
    }
    if (type === 'mem') {
      return (
        <BAIFlex style={{ width: size, height: size }}>
          <MemoryStickIcon />
        </BAIFlex>
      );
    }

    const displayIcon = deviceMetaData[type]?.display_icon;

    if (displayIcon && _.keys(knownDeviceIcons).includes(displayIcon)) {
      return (
        knownDeviceIcons[displayIcon as keyof typeof knownDeviceIcons] ?? null
      );
    }

    return (
      <BAIFlex style={{ width: size, height: size }}>
        <MicrochipIcon />
      </BAIFlex>
    );
  };

  const content = getIconContent();

  return showTooltip ? (
    <Tooltip
      title={deviceMetaData[type]?.description || type}
      {...tooltipProps}
    >
      {content}
    </Tooltip>
  ) : (
    <BAIFlex>{content}</BAIFlex>
  );
};

export default BAIResourceNumberWithIcon;
