/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { convertToBinaryUnit } from '../helper';
import { useResourceSlotsDetails } from '../hooks/backendai';
import { theme } from '../theme-shim';
import {
  ResourceAllocationFormValue,
  isUnifiedAcceleratorSlot,
} from './SessionFormItems/ResourceAllocationFormItems';
import { Divider } from '@astryxdesign/core/Divider';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import * as stylex from '@stylexjs/stylex';
import {
  BAIFlex,
  BAIResourceNumberWithIcon,
  ResourceTypeIcon,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';

type FormOrResourceRequired = {
  /**
   * The resource map to display as the primary value. For most callers this is
   * the requested (configured) resource; on the session detail page it is the
   * actually-allocated `occupied_slots`.
   */
  resource: ResourceAllocationFormValue['resource'];
  containerCount?: number;
  /**
   * Optional reference resource map to compare against `resource`. On the
   * session detail page this is the requested amount: for any numeric slot
   * whose primary value differs from the compared value, the compared amount is
   * appended as a muted `/ <value>` reference with an "allocated / requested"
   * tooltip on the chip. The component computes the differing slots itself —
   * callers only pass the two resource maps.
   *
   * Comparison is applied to the numeric `slotChips` only. The object-shaped
   * `{ accelerator, acceleratorType }` branch is not threaded through the
   * comparison; on the session detail page fGPU is compared via its dotted
   * `cuda.shares` slot key (which routes through `slotChips`), so that path is
   * covered. A form-shaped caller relying on `accelerator` would not get a
   * comparison reference on the accelerator chip.
   */
  comparedResource?: ResourceAllocationFormValue['resource'];
  /**
   * When true, render a vertical divider between chips so the resources read as
   * distinct items (used on the session detail page). Off by default so
   * column-layout callers (e.g. `DeploymentPresetDetailModal`) don't get stray
   * dividers between stacked chips.
   */
  showDividers?: boolean;
};

const unifiedChipStyles = stylex.create({
  description: {
    minWidth: 0,
    whiteSpace: 'normal',
    overflowWrap: 'anywhere',
  },
});

// Renders a unified-memory accelerator as "<device description>" with the same
// explanatory tooltip as the launcher's accelerator field. Kept as a separate
// component so a long description wraps gracefully: the icon + text wrap as a
// unit, and the text breaks onto multiple lines instead of overflowing.
const UnifiedAcceleratorChip: React.FC<{ type: string }> = ({ type }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  // The description lives only in the backend slot-details response, not in
  // the local device_metadata.json, and is not scoped to a resource group.
  const { mergedResourceSlots } = useResourceSlotsDetails();
  const description = mergedResourceSlots[type]?.description ?? type;
  // One line of the description text, so the icon can be vertically centered
  // against the first line (not the whole wrapped block).
  const lineHeightPx = token.fontSize * token.lineHeight;
  return (
    <Tooltip
      content={t('session.launcher.UnifiedAcceleratorMemoryNote', {
        description,
      })}
    >
      <BAIFlex
        direction="row"
        gap="xxs"
        align="start"
        style={{ minWidth: 0, maxWidth: '100%' }}
      >
        {/* Match the icon box to one text line and center the icon so it stays
            aligned with the first line when the description wraps. */}
        <BAIFlex align="center" style={{ flexShrink: 0, height: lineHeightPx }}>
          <ResourceTypeIcon type={type} showTooltip={false} />
        </BAIFlex>
        <Text xstyle={unifiedChipStyles.description}>{description}</Text>
      </BAIFlex>
    </Tooltip>
  );
};

export const ResourceNumbersOfSession: React.FC<FormOrResourceRequired> = ({
  resource,
  containerCount = 1,
  comparedResource,
  showDividers = false,
}) => {
  'use memo';
  // `resource` is the primary value to display; `comparedResource` (when given)
  // is the reference to compare against (e.g. requested vs. allocated on the
  // session detail page). Each chip carries a stable identity key (slot type /
  // 'accelerator' / 'unified') so React reconciles by resource across renders
  // even though `'0'` slots are dropped and the accelerator chip is
  // conditionally appended.
  const slotChips = _.compact(
    _.map(
      _.omit(resource, 'shmem', 'accelerator', 'acceleratorType'),
      (value, type) => {
        const comparedRaw = comparedResource
          ? _.get(comparedResource, type)
          : undefined;
        // A zero slot normally renders no chip, but when a non-zero compared
        // (requested) amount exists keep it so the fully-denied case renders
        // `0 / <requested>` instead of silently disappearing while the section
        // label still warns about the difference.
        const hasComparedAmount =
          !_.isUndefined(comparedRaw) && _.toNumber(comparedRaw) !== 0;
        if (value === '0' && !hasComparedAmount) {
          return null;
        }
        // Convert a raw slot value to the displayed amount (memory is byte count
        // → number; everything else is multiplied by the container count).
        // Applied identically to the primary and compared values.
        const toDisplayValue = (raw: string | number) =>
          type === 'mem'
            ? (convertToBinaryUnit(raw.toString(), '')?.number || 0) *
                containerCount +
              ''
            : _.toNumber(raw) * containerCount + '';
        // When a compared resource is present, compare it against this slot's
        // primary value. A difference passes the compared value to the chip,
        // which appends it as a muted `/ <value>` reference and wraps the whole
        // number group in an "allocated / requested" tooltip (separate from the
        // icon's description tooltip). Raw equality only short-circuits the
        // obviously-equal case; the chip itself additionally drops a compared
        // value that rounds to the same displayed number, so sub-precision
        // differences never render as `4 / 4 GiB`-style pairs.
        const isDifferent =
          !_.isUndefined(comparedRaw) &&
          _.toNumber(comparedRaw) !== _.toNumber(value);
        return {
          key: type,
          node: (
            <BAIResourceNumberWithIcon
              // @ts-ignore
              type={type}
              value={toDisplayValue(value)}
              comparedValue={
                isDifferent ? toDisplayValue(comparedRaw) : undefined
              }
              opts={{
                shmem: resource.shmem
                  ? (convertToBinaryUnit(resource.shmem, '')?.number || 0) *
                    containerCount
                  : undefined,
              }}
            />
          ),
        };
      },
    ),
  );
  const acceleratorChip =
    resource?.acceleratorType &&
    isUnifiedAcceleratorSlot(resource.acceleratorType)
      ? {
          key: 'unified',
          // Unified-memory accelerator: show the device description regardless
          // of amount, with the same explanatory tooltip as the launcher's
          // accelerator field on hover.
          node: <UnifiedAcceleratorChip type={resource.acceleratorType} />,
        }
      : resource &&
          resource.accelerator &&
          resource.acceleratorType &&
          _.isNumber(resource.accelerator)
        ? {
            key: 'accelerator',
            node: (
              <BAIResourceNumberWithIcon
                // @ts-ignore
                type={resource.acceleratorType}
                value={_.toString(resource.accelerator * containerCount)}
              />
            ),
          }
        : null;
  const chips = _.compact([...slotChips, acceleratorChip]);
  return (
    <>
      {chips.map(({ key, node }, index) => (
        <React.Fragment key={key}>
          {/* Separate each resource chip with a vertical divider (same pattern
              as ImageNodeSimpleTag) so the resources read as distinct items.
              Opt-in via `showDividers` — column-layout callers leave it off to
              avoid stray dividers between stacked chips. */}
          {showDividers && index > 0 ? (
            <Divider orientation="vertical" style={{ marginInline: 0 }} />
          ) : null}
          {node}
        </React.Fragment>
      ))}
    </>
  );
};
