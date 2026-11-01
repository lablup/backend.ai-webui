/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourceGridPickerQuery } from '../../__generated__/ResourceGridPickerQuery.graphql';
import { convertToBinaryUnit } from '../../helper';
import { parseSlotMap } from '../../helper/sessionResourceGridData';
import {
  useCurrentUserInfo,
  useResourceSlotsDetails,
} from '../../hooks/backendai';
import { useResourceLimitAndRemaining } from '../../hooks/useResourceLimitAndRemaining';
import type { ProjectContext } from '../../types/projectContext';
import { NON_ACCELERATOR_SLOTS } from '../SessionFormItems/resourceAllocationRules';
import { formatQuickAmount } from './QuickSessionResourceCards';
import {
  amountToCells,
  getDefaultUnit,
  getGridCells,
  getQuickSlotKind,
  getUnitSteps,
} from './quickResourceGrid';
import {
  type ResourceGridSelection,
  resourceGridSelectionAtom,
} from './resourceGridSelection';
import { Text } from '@lablup/ui-common/Text';
import {
  type AreaGridOccupiedGroup,
  BAIFlex,
  BAIResourceAreaGrid,
  BAISegmentedControl,
  BAISegmentedControlItem,
} from 'backend.ai-ui';
import { useAtom } from 'jotai';
import * as _ from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const PICKER_COLUMNS = 16;
const EPSILON = 1e-9;
const SESSION_COLORS = [
  'var(--color-icon-blue)',
  'var(--color-icon-purple)',
  'var(--color-icon-teal)',
  'var(--color-icon-orange)',
  'var(--color-icon-pink)',
  'var(--color-icon-cyan)',
  'var(--color-icon-yellow)',
];

const finite = (value: number | undefined) =>
  _.isFinite(value) ? value : undefined;
const toGiB = (bytesOrSize: string | number | undefined) =>
  _.isNil(bytesOrSize) || bytesOrSize === ''
    ? undefined
    : convertToBinaryUnit(bytesOrSize, 'g', 6)?.number;

interface ResourceGridPickerProps {
  project: ProjectContext;
  resourceGroup: string;
  fetchKey?: string;
}

/**
 * The "My resources in resource group" body as grids: the user's sessions'
 * cells per slot, then the free cells to drag a new session's resources from.
 */
const ResourceGridPicker: React.FC<ResourceGridPickerProps> = ({
  project,
  resourceGroup,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [currentUser] = useCurrentUserInfo();
  const [selection, setSelection] = useAtom(resourceGridSelectionAtom);
  const [memUnit, setMemUnit] = useState<number>();

  const { accessible_scaling_groups, compute_session_list } =
    useLazyLoadQuery<ResourceGridPickerQuery>(
      graphql`
        query ResourceGridPickerQuery(
          $projectID: UUID!
          $groupID: String
          $filter: String
        ) {
          accessible_scaling_groups(project_id: $projectID) {
            name
            accelerator_quantum_size
          }
          compute_session_list(
            limit: 100
            offset: 0
            filter: $filter
            group_id: $groupID
          ) {
            items {
              id
              name
              status
              occupied_slots
              requested_slots
            }
          }
        }
      `,
      {
        projectID: project.id,
        groupID: project.id,
        filter: [
          `user_id == "${currentUser.uuid}"`,
          'status != "TERMINATED"',
          'status != "CANCELLED"',
          `scaling_group == "${resourceGroup}"`,
        ].join(' & '),
      },
      { fetchPolicy: 'network-only', fetchKey },
    );
  const [{ remaining, resourceLimits }] = useResourceLimitAndRemaining({
    currentProjectName: project.name,
    currentResourceGroup: resourceGroup,
    fetchKey,
  });
  const { mergedResourceSlots, resourceSlotsInRG } =
    useResourceSlotsDetails(resourceGroup);

  const quantumSize = _.find(
    accessible_scaling_groups,
    (group) => group?.name === resourceGroup,
  )?.accelerator_quantum_size;
  const sessions = _.compact(compute_session_list?.items).map((session) => ({
    key: session.id ?? session.name ?? '',
    label: session.name ?? session.id,
    slots: parseSlotMap(session.occupied_slots, session.requested_slots).slots,
  }));

  const current: ResourceGridSelection =
    selection?.resourceGroup === resourceGroup
      ? selection
      : { resourceGroup, cpu: 0, memGiB: 0, accelerator: 0 };

  const slotNames = _.filter(
    [
      'cpu',
      'mem',
      ..._.difference(_.keys(resourceSlotsInRG), NON_ACCELERATOR_SLOTS),
    ],
    (slot) => !!resourceSlotsInRG?.[slot],
  );

  const renderSlot = (slot: string) => {
    const kind = getQuickSlotKind(
      slot,
      mergedResourceSlots?.[slot]?.number_format?.binary,
    );
    const steps = getUnitSteps(kind, quantumSize);
    const toAmount = (raw: string | number | undefined) =>
      kind === 'mem' ? toGiB(raw) : _.isNil(raw) ? undefined : _.toNumber(raw);

    const remainingAmount = finite(
      slot === 'cpu'
        ? remaining.cpu
        : slot === 'mem'
          ? toGiB(remaining.mem)
          : remaining.accelerators?.[slot],
    );
    const perContainerMax = finite(
      slot === 'cpu'
        ? resourceLimits.cpu?.max
        : slot === 'mem'
          ? toGiB(resourceLimits.mem?.max)
          : resourceLimits.accelerators?.[slot]?.max,
    );
    const unit =
      kind === 'mem'
        ? (memUnit ?? getDefaultUnit(kind, steps, remainingAmount))
        : steps[0];
    const cells = getGridCells({
      kind,
      unit,
      max: remainingAmount,
      remaining: _.min(_.compact([remainingAmount, perContainerMax])),
    });

    const usages = _.compact(
      sessions.map((session, index) => {
        const amount = toAmount(session.slots[slot]) ?? 0;
        return amount > 0 ? { session, amount, index } : undefined;
      }),
    );
    const usedAmount = _.sumBy(usages, 'amount');
    const occupiedGroups: AreaGridOccupiedGroup[] = usages.map(
      ({ session, amount, index }) => ({
        key: session.key,
        label: `${session.label} · ${formatQuickAmount(kind, amount)}`,
        cells: Math.min(128, Math.ceil(amount / unit - EPSILON)),
        color: SESSION_COLORS[index % SESSION_COLORS.length],
      }),
    );

    const isAccelerator = slot !== 'cpu' && slot !== 'mem';
    const selectedAmount =
      slot === 'cpu'
        ? current.cpu
        : slot === 'mem'
          ? current.memGiB
          : current.acceleratorType === slot
            ? current.accelerator
            : 0;
    const title =
      slot === 'mem'
        ? t('session.launcher.Memory')
        : mergedResourceSlots?.[slot]?.human_readable_name || slot;
    const unitLabel =
      kind === 'mem'
        ? ''
        : ` ${mergedResourceSlots?.[slot]?.display_unit ?? ''}`;
    const format = (amount: number) =>
      `${formatQuickAmount(kind, amount)}${unitLabel}`.trim();

    const select = (amount: number) => {
      setSelection({
        ...current,
        ...(slot === 'cpu' ? { cpu: amount } : {}),
        ...(slot === 'mem' ? { memGiB: amount } : {}),
        ...(isAccelerator
          ? { acceleratorType: slot, accelerator: amount }
          : {}),
      });
    };

    return (
      <BAIFlex key={slot} direction="column" align="start" gap="xxs">
        <BAIFlex gap="xs" align="center" wrap="wrap">
          <Text weight="semibold">{title}</Text>
          {kind === 'mem' && (
            <BAISegmentedControl
              size="sm"
              aria-label={t('session.quickCreate.CellUnit')}
              value={String(unit)}
              onChange={(next) => {
                const nextUnit = Number(next);
                setMemUnit(nextUnit);
                if (current.memGiB > 0) {
                  select(amountToCells(current.memGiB, nextUnit) * nextUnit);
                }
              }}
            >
              {steps.map((step) => (
                <BAISegmentedControlItem
                  key={step}
                  value={String(step)}
                  label={step < 1 ? 'MiB' : 'GiB'}
                />
              ))}
            </BAISegmentedControl>
          )}
        </BAIFlex>
        <Text type="supporting">
          {_.compact([
            t('session.quickCreate.InUse', { amount: format(usedAmount) }),
            selectedAmount > 0 &&
              t('session.quickCreate.Selected', {
                amount: format(selectedAmount),
              }),
            remainingAmount !== undefined &&
              t('session.quickCreate.Remaining', {
                amount: format(remainingAmount),
              }),
          ]).join(' · ')}
        </Text>
        <BAIResourceAreaGrid
          aria-label={title}
          data-testid={`resource-grid-picker-${slot}`}
          columns={Math.min(PICKER_COLUMNS, Math.max(1, cells.totalCells))}
          totalCells={cells.totalCells}
          availableCells={cells.availableCells}
          value={amountToCells(selectedAmount, unit)}
          occupiedGroups={occupiedGroups}
          disabled={cells.totalCells === 0}
          onChange={(count) => select(_.round(count * unit, 6))}
        />
      </BAIFlex>
    );
  };

  return (
    <BAIFlex gap="lg" align="start" wrap="wrap">
      {slotNames.map(renderSlot)}
    </BAIFlex>
  );
};

export default ResourceGridPicker;
