/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { convertToBinaryUnit } from '../helper';
import { ResourceSlotName } from '../hooks/backendai';
import { useCurrentResourceGroupValue } from '../hooks/useCurrentProject';
import ImageWithFallback from './ImageWithFallback';
import { Tooltip, Typography, theme } from 'antd';
import {
  BAIFlex,
  BAINumberWithUnit,
  useResourceSlotsDetails,
} from 'backend.ai-ui';
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
    const roundLength =
      mergedResourceSlots?.[type]?.number_format.round_length || 0;
    return mergedResourceSlots?.[type]?.number_format.binary
      ? Number(
          convertToBinaryUnit(amount, 'g', 2, true)?.numberFixed,
        ).toString()
      : roundLength > 0
        ? parseFloat(amount).toFixed(roundLength)
        : amount;
  };

  return (
    <BAIFlex direction="row" gap="xxs">
      {mergedResourceSlots?.[type] ? (
        <ResourceTypeIcon type={type} showTooltip={!hideTooltip} />
      ) : (
        type
      )}
      {mergedResourceSlots?.[type]?.number_format.binary ? (
        <BAINumberWithUnit
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
    </BAIFlex>
  );
};

interface AccTypeIconProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src'
> {
  type: ResourceSlotName | string;
  showTooltip?: boolean;
  size?: number;
}
export const ResourceTypeIcon: React.FC<AccTypeIconProps> = ({
  type,
  size = 16,
  showTooltip = true,
  ...props
}) => {
  const { mergedResourceSlots } = useResourceSlotsDetails();

  const getIconContent = (): ReactElement => {
    if (type === 'cpu') {
      return (
        <BAIFlex style={{ width: 16, height: 16 }}>
          <CpuIcon />
        </BAIFlex>
      );
    }

    if (type === 'mem') {
      return (
        <BAIFlex style={{ width: 16, height: 16 }}>
          <MemoryStickIcon />
        </BAIFlex>
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
      <BAIFlex style={{ width: 16, height: 16 }}>
        <MicrochipIcon />
      </BAIFlex>
    );
  };

  const content = getIconContent();

  return showTooltip ? (
    <Tooltip title={mergedResourceSlots[type]?.description || type}>
      {content}
    </Tooltip>
  ) : (
    <BAIFlex style={{ pointerEvents: 'none' }}>{content}</BAIFlex>
  );
};

export default React.memo(ResourceNumber);
