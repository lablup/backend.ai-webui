import { convertToBinaryUnit } from '../helper';
import { ResourceSlotName, useResourceSlotsDetails } from '../hooks/backendai';
import { useCurrentResourceGroupValue } from '../hooks/useCurrentProject';
import Flex from './Flex';
import ImageWithFallback from './ImageWithFallback';
import NumberWithUnit from './NumberWithUnit';
import { Tooltip, Typography, theme } from 'antd';
import _ from 'lodash';
import { CpuIcon, MemoryStickIcon, MicrochipIcon } from 'lucide-react';
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
          <Typography.Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
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
  const { mergedResourceSlots } = useResourceSlotsDetails();

  const getIconContent = (): ReactElement => {
    if (type === 'cpu') {
      return (
        <Flex style={{ width: 16, height: 16 }}>
          <CpuIcon />
        </Flex>
      );
    }

    if (type === 'mem') {
      return (
        <Flex style={{ width: 16, height: 16 }}>
          <MemoryStickIcon />
        </Flex>
      );
    }

    const displayIcon = mergedResourceSlots[type]?.display_icon;
    if (displayIcon) {
      return (
        <ImageWithFallback
          {...props}
          style={{
            width: size,
            height: size,
            alignSelf: 'center',
            ...(props.style || {}),
          }}
          src={`/resources/icons/${displayIcon}.svg`}
          alt={type}
          fallbackIcon={<MicrochipIcon />}
        />
      );
    }

    return (
      <Flex style={{ width: 16, height: 16 }}>
        <MicrochipIcon />
      </Flex>
    );
  };

  const content = getIconContent();

  return showTooltip ? (
    <Tooltip title={mergedResourceSlots[type]?.description || type}>
      {content}
    </Tooltip>
  ) : (
    <Flex style={{ pointerEvents: 'none' }}>{content}</Flex>
  );
};

export default React.memo(ResourceNumber);
