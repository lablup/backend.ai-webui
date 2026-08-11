/*
 to-astryx W2-D: antd `Tooltip` -> Astryx `Tooltip` (`title` -> `content`,
 compound `placement` split into `placement` + `alignment` — MAPPING §4).

 PILOT-DECISION: `ResourceTypeIcon.tooltipProps` is re-typed from the full antd
 `TooltipProps` to the two keys its call sites pass (`title`, `placement`).
 Keeping the antd type was the one thing holding this module in the antd import
 graph, and the wide type advertised knobs Astryx cannot honour (`color`,
 `overlayStyle`, `getPopupContainer`).

 The theme-shim `token.fontSizeSM` read becomes `var(--font-size-sm)`, which is
 the SAME value (0.75rem = 12px, checked against the built theme — P9/P19) and
 is declared by the brand theme, so no `var(--x, literal)` fallback is needed.
*/
import { convertToBinaryUnit } from '../helper';
import {
  splitAntdPlacement,
  type AntdPlacement,
} from '../helper/astryxPlacement';
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
import {
  ResourceSlotName,
  useBAIIconPath,
  useBAIResourceSlots,
} from './provider';
import { Tooltip } from '@astryxdesign/core/Tooltip';
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
 *
 * Unit, number format and icon come from `BAIMetaDataProvider` and
 * `BAIResourceSlotsProvider`. Without the latter, a slot only the server knows
 * about renders with the generic icon and no unit.
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
  const { mergedResourceSlots } = useBAIResourceSlots();

  const formatAmount = (amount: string) => {
    const roundLength =
      mergedResourceSlots[type]?.number_format.round_length || 0;
    return mergedResourceSlots[type]?.number_format.binary
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
  const numberGroup = mergedResourceSlots[type]?.number_format.binary ? (
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
        {mergedResourceSlots[type]?.display_unit || ''}
      </BAIText>
    </>
  );

  return (
    <BAIFlex direction="row" gap="xxs">
      {mergedResourceSlots[type] ? (
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
          content={t('comp:BAIResourceNumberWithIcon.AllocatedVsRequested')}
        >
          <BAIFlex direction="row" gap="xxs">
            {numberGroup}
          </BAIFlex>
        </Tooltip>
      )}

      {type === 'mem' && opts?.shmem && opts?.shmem > 0 ? (
        <BAIText type="secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
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

/**
 * The antd `TooltipProps` subset the two `tooltipProps` call sites actually
 * pass, restated locally so this module carries no antd specifier (P15).
 * Measured: `placement: 'left'` at both sites in `ResourceGroupFairShareTable`.
 */
export interface ResourceTypeIconTooltipProps {
  title?: ReactNode;
  placement?: AntdPlacement;
}

interface ResourceTypeIconProps {
  type: ResourceSlotName | string;
  showTooltip?: boolean;
  tooltipProps?: ResourceTypeIconTooltipProps;
  size?: number;
}

/**
 * The icon half of `BAIResourceNumberWithIcon`, usable on its own. Without
 * `BAIResourceSlotsProvider`, a slot only the server knows about falls back to
 * the generic icon.
 */
export const ResourceTypeIcon = ({
  type,
  showTooltip = true,
  size = 16,
  tooltipProps,
}: ResourceTypeIconProps) => {
  'use memo';

  const { mergedResourceSlots } = useBAIResourceSlots();
  const resolveIconPath = useBAIIconPath();
  const displayIcon = mergedResourceSlots[type]?.display_icon;
  const genericIcon = (
    <BAIFlex style={{ width: size, height: size }}>
      <MicrochipIcon />
    </BAIFlex>
  );

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

    // A server-configured slot can name an icon the package does not bundle;
    // those load from the host's icon directory.
    const iconUrl = resolveIconPath(displayIcon && `${displayIcon}.svg`);
    if (iconUrl) {
      return (
        <BAIImageWithFallback
          src={iconUrl}
          alt={type}
          width={size}
          height={size}
          style={{ alignSelf: 'center' }}
          fallbackIcon={genericIcon}
        />
      );
    }

    return genericIcon;
  };

  const content = getIconContent();

  const { placement, alignment } = splitAntdPlacement(tooltipProps?.placement);

  return showTooltip ? (
    <Tooltip
      content={
        tooltipProps?.title ?? mergedResourceSlots[type]?.description ?? type
      }
      placement={placement}
      alignment={alignment}
    >
      {content}
    </Tooltip>
  ) : (
    <BAIFlex>{content}</BAIFlex>
  );
};

export default BAIResourceNumberWithIcon;
