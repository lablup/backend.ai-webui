/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { toFixedFloorWithoutTrailingZeros } from '../../helper';
import { useResourceSlotsDetails } from '../../hooks/backendai';
import {
  getUtilizationCheckerColor,
  useReclamationColorMap,
  RECLAMATION_LEGENDS,
  type UtilizationExtra,
} from './idleChecks';
import { Divider } from '@astryxdesign/core/Divider';
import { HoverCard } from '@astryxdesign/core/HoverCard';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Text } from '@astryxdesign/core/Text';
import { BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SessionReclamationStatusPopoverProps {
  utilizationExtra: UtilizationExtra;
}

/**
 * Popover body. Kept as its own component so the resource-slot lookup and the
 * per-resource/legend rows only run once the hover card actually opens, not for
 * every rendered session row.
 */
const ReclamationPopoverContent: React.FC<
  SessionReclamationStatusPopoverProps
> = ({ utilizationExtra }) => {
  'use memo';
  const { t } = useTranslation();
  const { mergedResourceSlots } = useResourceSlotsDetails();
  const colorMap = useReclamationColorMap();
  const { resources, thresholds_check_operator: thresholdsCheckOperator } =
    utilizationExtra;

  return (
    <BAIFlex direction="column" align="stretch" gap="xxs">
      <Text>
        {thresholdsCheckOperator === 'or'
          ? t('session.ReclamationStatusConditionAnyDesc')
          : t('session.ReclamationStatusConditionAllDesc')}
      </Text>
      {_.map(resources, (resource, key) => {
        const deviceName = ['cpu_util', 'mem'].includes(key)
          ? _.split(key, '_')[0]
          : _.split(key, '_').slice(0, -1).join('-') + '.device';
        const [util, threshold] = resource;
        const resourceStatus =
          util >= 0 ? getUtilizationCheckerColor(resource) : undefined;
        const resourceMeta = resourceStatus
          ? colorMap[resourceStatus.color]
          : undefined;
        return (
          <BAIFlex key={key} gap="xxs" align="center">
            <StatusDot
              variant={resourceMeta?.variant ?? 'neutral'}
              label={resourceMeta?.label ?? '-'}
            />
            <Text>
              {`${mergedResourceSlots?.[deviceName]?.human_readable_name ?? deviceName} ${resourceMeta?.label ?? '-'}`}
            </Text>
            <Text color="secondary">
              {t('session.ReclamationStatusCurrentVsThreshold', {
                current:
                  util >= 0 ? toFixedFloorWithoutTrailingZeros(util, 1) : '-',
                threshold,
              })}
            </Text>
          </BAIFlex>
        );
      })}
      <Divider />
      <Text color="secondary">{t('session.ReclamationStatusLegendTitle')}</Text>
      {RECLAMATION_LEGENDS.map(({ color, descKey }) => (
        <BAIFlex key={color} gap="xxs" align="center">
          <StatusDot
            variant={colorMap[color].variant}
            label={colorMap[color].label}
          />
          <Text>{`${colorMap[color].label}: ${t(descKey)}`}</Text>
        </BAIFlex>
      ))}
    </BAIFlex>
  );
};

/**
 * Info icon opening a popover that explains the idle-reclamation state: an
 * operator-aware condition sentence, one traffic-light row per resource with
 * its current average vs. threshold, and a legend describing each level.
 */
const SessionReclamationStatusPopover: React.FC<
  SessionReclamationStatusPopoverProps
> = ({ utilizationExtra }) => {
  'use memo';

  return (
    // antd hover-triggered Popover (mouseEnterDelay 0) -> Astryx HoverCard
    // (MAPPING.md §3.7: hover trigger branch; Astryx Popover is click-only).
    <HoverCard
      delay={0}
      content={
        <ReclamationPopoverContent utilizationExtra={utilizationExtra} />
      }
    >
      <Info
        style={{ color: 'var(--color-text-secondary)', cursor: 'pointer' }}
        size="1em"
      />
    </HoverCard>
  );
};

export default SessionReclamationStatusPopover;
