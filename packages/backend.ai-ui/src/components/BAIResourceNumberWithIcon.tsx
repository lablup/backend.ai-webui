import { convertToBinaryUnit } from '../helper';
import { useBAIi18n } from '../hooks/useBAIi18n';
import { BAINvidiaIcon } from '../icons';
import BAIFuriosaIcon from '../icons/BAIFuriosaIcon';
import BAIGaudiIcon from '../icons/BAIGaudiIcon';
import BAIIpuIcon from '../icons/BAIIpuIcon';
import BAIRebelIcon from '../icons/BAIRebelIcon';
import BAIRocmIcon from '../icons/BAIRocmIcon';
import BAITenstorrentIcon from '../icons/BAITenstorrentIcon';
import BAITpuIcon from '../icons/BAITpuIcon';
import BAIFlex from './BAIFlex';
import BAIImageWithFallback from './BAIImageWithFallback';
import NumberWithUnit from './BAINumberWithUnit';
import BAIText from './BAIText';
import { ResourceSlotName } from './provider';
import useBAIMetaData from './provider/BAIMetaDataProvider/hooks/useBAIMetaData';
import { theme, Tooltip, TooltipProps } from 'antd';
import * as _ from 'lodash-es';
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
  /**
   * Optional reference value rendered after the primary one as
   * `value / comparedValue`, sharing a single unit (e.g. `1 / 2 Core`). Used to
   * show an actual-vs-target pair such as allocated vs. requested resources. The
   * `/ comparedValue` part is rendered in the muted (secondary) text color so it
   * reads as a reference next to the primary value. When set, the whole number
   * group carries an "Allocated / Requested" tooltip explaining the pair —
   * independent of the resource icon's own description tooltip. A compared
   * value that rounds to the same displayed number as `value` is ignored, so
   * sub-display-precision differences never render as `4 / 4 GiB`-style pairs.
   */
  comparedValue?: string;
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
  comparedValue,
}: BAIResourceNumberWithIconProps) => {
  'use memo';

  const { t } = useBAIi18n();
  const { mergedResourceSlots: deviceMetaData } = useBAIMetaData();
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

  // Drop a compared value that rounds to the same displayed number — a
  // sub-display-precision difference (e.g. mem bytes 4294967296 vs 4294967295)
  // would otherwise render as a confusing `4 / 4 GiB` pair.
  const effectiveComparedValue =
    !_.isUndefined(comparedValue) &&
    formatAmount(comparedValue) !== formatAmount(amount)
      ? comparedValue
      : undefined;

  // The number + optional `/ compared` + unit, sharing one trailing unit.
  const numberGroup = deviceMetaData?.[type]?.number_format.binary ? (
    <NumberWithUnit
      numberUnit={amount}
      targetUnit="g"
      unitType="binary"
      comparedValue={effectiveComparedValue}
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
      {_.isUndefined(effectiveComparedValue) ? null : (
        <BAIText type="secondary">{`/ ${formatAmount(effectiveComparedValue)}`}</BAIText>
      )}
      <BAIText type="secondary" style={{ whiteSpace: 'nowrap' }}>
        {deviceMetaData?.[type]?.display_unit || ''}
      </BAIText>
    </>
  );

  return (
    <BAIFlex direction="row" gap="xxs">
      {deviceMetaData?.[type] ? (
        <ResourceTypeIcon type={type} showTooltip={!hideTooltip} />
      ) : (
        type
      )}
      {/* When a compared value is shown, the whole number group carries a
          tooltip explaining the `value / compared` pair (allocated vs.
          requested). It is independent of the icon's description tooltip. */}
      {_.isUndefined(effectiveComparedValue) ? (
        numberGroup
      ) : (
        <Tooltip
          title={t('comp:BAIResourceNumberWithIcon.AllocatedVsRequested')}
        >
          <BAIFlex direction="row" gap="xxs">
            {numberGroup}
          </BAIFlex>
        </Tooltip>
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

  const { mergedResourceSlots: deviceMetaData } = useBAIMetaData();
  const displayIcon = deviceMetaData[type]?.display_icon;

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

    if (displayIcon && _.keys(knownDeviceIcons).includes(displayIcon)) {
      return (
        knownDeviceIcons[displayIcon as keyof typeof knownDeviceIcons] ?? null
      );
    }

    if (displayIcon) {
      return (
        <BAIImageWithFallback
          src={`/resources/icons/${displayIcon}.svg`}
          alt={type}
          width={size}
          height={size}
          style={{ alignSelf: 'center' }}
          fallbackIcon={
            <BAIFlex style={{ width: size, height: size }}>
              <MicrochipIcon />
            </BAIFlex>
          }
        />
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
