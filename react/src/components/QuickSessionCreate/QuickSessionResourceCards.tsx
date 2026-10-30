/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { QuickSessionResourceCardsQuery } from '../../__generated__/QuickSessionResourceCardsQuery.graphql';
import { Form } from '../../form-engine';
import { convertToBinaryUnit } from '../../helper';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useResourceSlotsDetails } from '../../hooks/backendai';
import { useResourceLimitAndRemaining } from '../../hooks/useResourceLimitAndRemaining';
import type { SessionLauncherFormValue } from '../../pages/SessionLauncherPage';
import type { ProjectContext } from '../../types/projectContext';
import { isUnifiedAcceleratorSlot } from '../SessionFormItems/ResourceAllocationFormItems';
import {
  NON_ACCELERATOR_SLOTS,
  type RuleContext,
  getAutomaticShmem,
  getSupportedAcceleratorTypes,
} from '../SessionFormItems/resourceAllocationRules';
import {
  amountToCells,
  getInitialUnit,
  getGridCells,
  getQuickSlotKind,
  getUnitSteps,
  roundAmountToUnit,
  type QuickSlotKind,
} from './quickResourceGrid';
import { Text } from '@lablup/ui-common/Text';
import {
  BAICard,
  BAIFlex,
  BAINumberInput,
  BAIResourceAreaGrid,
  BAISegmentedControl,
  BAISegmentedControlItem,
  BAIText,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const KIND_COLOR: Record<QuickSlotKind, string> = {
  cpu: 'var(--color-icon-blue)',
  mem: 'var(--color-icon-purple)',
  shares: 'var(--color-icon-green)',
  count: 'var(--color-icon-green)',
};

const toGiB = (value: string | number | undefined | null) =>
  _.isNil(value) || value === ''
    ? undefined
    : convertToBinaryUnit(value, 'g', 6)?.number;

const finiteOrUndefined = (value: number | undefined) =>
  _.isFinite(value) ? value : undefined;

export const formatQuickAmount = (kind: QuickSlotKind, amount: number) => {
  if (kind !== 'mem') return `${_.round(amount, 2)}`;
  return amount < 1
    ? `${_.round(amount * 1024)} MiB`
    : `${_.round(amount, 2)} GiB`;
};

interface ResourceGridCardProps {
  title: React.ReactNode;
  slotName: string;
  kind: QuickSlotKind;
  quantumSize?: number | null;
  unitLabel?: string;
  min?: number;
  max?: number;
  remaining?: number;
  amount: number;
  disabled?: boolean;
  headerExtra?: React.ReactNode;
  caption?: React.ReactNode;
  onAmountChange: (amount: number) => void;
}

const ResourceGridCard: React.FC<ResourceGridCardProps> = ({
  title,
  slotName,
  kind,
  quantumSize,
  unitLabel,
  min,
  max,
  remaining,
  amount,
  disabled,
  headerExtra,
  caption,
  onAmountChange,
}) => {
  'use memo';
  const { t } = useTranslation();
  const steps = getUnitSteps(kind, quantumSize);
  const [pickedUnit, setPickedUnit] = useState<number>();
  const unit =
    pickedUnit && steps.includes(pickedUnit)
      ? pickedUnit
      : getInitialUnit(kind, steps, max, amount);
  const cells = getGridCells({ kind, unit, min, max, remaining });
  const isShort = cells.availableCells < cells.minCells;
  const isDisabled = disabled || isShort || cells.totalCells === 0;
  const format = (value: number) =>
    `${formatQuickAmount(kind, value)}${kind === 'mem' || !unitLabel ? '' : ` ${unitLabel}`}`;

  return (
    <BAICard
      size="small"
      title={title}
      extra={
        <BAIFlex gap="xs" align="center" wrap="wrap">
          {headerExtra}
          {steps.length > 1 && (
            <BAISegmentedControl
              size="sm"
              aria-label={t('session.quickCreate.CellUnit')}
              value={String(unit)}
              onChange={(next) => {
                const nextUnit = Number(next);
                setPickedUnit(nextUnit);
                if (!isDisabled && amount > 0) {
                  onAmountChange(roundAmountToUnit(amount, nextUnit, min));
                }
              }}
            >
              {steps.map((step) => (
                <BAISegmentedControlItem
                  key={step}
                  value={String(step)}
                  label={formatQuickAmount(kind, step)}
                />
              ))}
            </BAISegmentedControl>
          )}
        </BAIFlex>
      }
    >
      <BAIFlex direction="column" align="stretch" gap="xs">
        <BAIFlex gap="sm" align="start" wrap="wrap">
          <BAIResourceAreaGrid
            aria-label={_.isString(title) ? title : slotName}
            data-testid={`quick-create-grid-${slotName}`}
            columns={cells.columns}
            totalCells={cells.totalCells}
            availableCells={cells.availableCells}
            minCells={cells.minCells}
            value={amountToCells(amount, unit)}
            color={KIND_COLOR[kind]}
            disabled={isDisabled}
            onChange={(count) => {
              // Keep the lattice still for the rest of the drag.
              if (!pickedUnit) setPickedUnit(unit);
              onAmountChange(_.round(count * unit, 6));
            }}
          />
          <BAIFlex direction="column" align="start" gap="xxs">
            <BAINumberInput
              aria-label={_.isString(title) ? title : slotName}
              value={amount}
              min={min ?? 0}
              max={max ?? null}
              step={kind === 'mem' ? 0.25 : kind === 'shares' ? steps[0] : 1}
              units={kind === 'mem' ? 'GiB' : unitLabel}
              width={140}
              disabled={isDisabled}
              onChange={(value) => {
                if (_.isNumber(value)) onAmountChange(value);
              }}
            />
            {remaining !== undefined && (
              <Text type="supporting">
                {t('session.quickCreate.Remaining', {
                  amount: format(remaining),
                })}
              </Text>
            )}
          </BAIFlex>
        </BAIFlex>
        {isShort && (
          <BAIText type="danger">
            {t('session.quickCreate.NotEnoughResource', { name: title })}
          </BAIText>
        )}
        {caption}
      </BAIFlex>
    </BAICard>
  );
};

interface QuickSessionResourceCardsProps {
  project: ProjectContext;
}

/** One drag-grid card per resource slot the group serves (#10733). */
const QuickSessionResourceCards: React.FC<QuickSessionResourceCardsProps> = ({
  project,
}) => {
  'use memo';
  const { t } = useTranslation();
  const form = Form.useFormInstance<SessionLauncherFormValue>();
  const baiClient = useSuspendedBackendaiClient();
  const isCustomAllowed = !!baiClient._config.allowCustomResourceAllocation;

  const resourceGroup =
    Form.useWatch('resourceGroup', { form, preserve: true }) ||
    form.getFieldValue('resourceGroup');
  const deferredResourceGroup = useDeferredValue(resourceGroup);
  const currentImage = Form.useWatch(['environments', 'image'], {
    form,
    preserve: true,
  });
  const manualImage = Form.useWatch(['environments', 'manual'], {
    form,
    preserve: true,
  });
  const resource: Partial<SessionLauncherFormValue['resource']> =
    Form.useWatch(['resource'], { form, preserve: true }) ?? {};
  const enabledAutomaticShmem = Form.useWatch('enabledAutomaticShmem', {
    form,
    preserve: true,
  });

  const { accessible_scaling_groups } =
    useLazyLoadQuery<QuickSessionResourceCardsQuery>(
      graphql`
        query QuickSessionResourceCardsQuery($projectID: UUID!) {
          accessible_scaling_groups(project_id: $projectID) {
            name
            accelerator_quantum_size
            ...useResourceLimitAndRemainingFragment
          }
        }
      `,
      { projectID: project.id },
      { fetchPolicy: 'store-and-network' },
    );
  const resourceGroupInfo = _.find(
    accessible_scaling_groups,
    (group) => group?.name === resourceGroup,
  );
  const [{ currentImageMinM, remaining, resourceLimits }] =
    useResourceLimitAndRemaining({
      currentProjectName: project.name,
      currentResourceGroup: deferredResourceGroup || undefined,
      currentResourceGroupFrgmtForLimit: resourceGroupInfo,
      currentImage,
      accessibleResourceGroupNames: _.compact(
        _.map(accessible_scaling_groups, (group) => group?.name),
      ),
    });
  const { mergedResourceSlots, resourceSlotsInRG } = useResourceSlotsDetails(
    resourceGroup || undefined,
  );

  const slotNamesInRG = resourceSlotsInRG ? _.keys(resourceSlotsInRG) : [];
  const supportedAcceleratorTypes =
    getSupportedAcceleratorTypes({
      slotsInRG: resourceSlotsInRG ? slotNamesInRG : undefined,
      image: currentImage,
      manualImage: !_.isEmpty(manualImage),
      acceleratorSlotsInRG: _.difference(slotNamesInRG, NON_ACCELERATOR_SLOTS),
    } as RuleContext) ?? [];
  const acceleratorType =
    resource.acceleratorType &&
    supportedAcceleratorTypes.includes(resource.acceleratorType)
      ? resource.acceleratorType
      : supportedAcceleratorTypes[0];

  // `custom` stops the `auto-select` rule from overwriting the grid.
  const writeResource = (
    patch: Partial<SessionLauncherFormValue['resource']>,
  ) => {
    form.setFieldsValue({
      allocationPreset: 'custom',
      resource: { ...form.getFieldValue('resource'), ...patch },
    });
    form.validateFields([['resource']], { recursive: true }).catch(() => {});
  };

  const slotTitle = (slotName: string, fallback: string) =>
    mergedResourceSlots?.[slotName]?.human_readable_name || fallback;

  const memMin = toGiB(resourceLimits.mem?.min);
  const shmemGiB = toGiB(resource.shmem);
  const acceleratorLimits = acceleratorType
    ? resourceLimits.accelerators?.[acceleratorType]
    : undefined;

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      {!isCustomAllowed && (
        <Text type="supporting">{t('session.quickCreate.PresetOnly')}</Text>
      )}
      {resourceSlotsInRG?.cpu && (
        <ResourceGridCard
          title={slotTitle('cpu', 'CPU')}
          slotName="cpu"
          kind="cpu"
          unitLabel={mergedResourceSlots?.cpu?.display_unit || 'Core'}
          min={resourceLimits.cpu?.min}
          max={finiteOrUndefined(resourceLimits.cpu?.max)}
          remaining={finiteOrUndefined(remaining.cpu)}
          amount={resource.cpu ?? 0}
          disabled={!isCustomAllowed}
          onAmountChange={(cpu) => writeResource({ cpu })}
        />
      )}
      {resourceSlotsInRG?.mem && (
        <ResourceGridCard
          title={t('session.launcher.Memory')}
          slotName="mem"
          kind="mem"
          min={memMin}
          max={finiteOrUndefined(toGiB(resourceLimits.mem?.max))}
          remaining={finiteOrUndefined(toGiB(remaining.mem))}
          amount={toGiB(resource.mem) ?? 0}
          disabled={!isCustomAllowed}
          caption={
            shmemGiB ? (
              <Text type="supporting">
                {t('session.quickCreate.ShmemIncluded', {
                  size: formatQuickAmount('mem', shmemGiB),
                })}
              </Text>
            ) : null
          }
          onAmountChange={(gib) => {
            const mem = `${gib}g`;
            writeResource({
              mem,
              ...(enabledAutomaticShmem
                ? { shmem: getAutomaticShmem(mem, currentImageMinM) }
                : {}),
            });
          }}
        />
      )}
      {acceleratorType &&
        (isUnifiedAcceleratorSlot(acceleratorType) ? (
          <BAICard
            size="small"
            title={slotTitle(acceleratorType, acceleratorType)}
          >
            <Text type="supporting">
              {t('session.quickCreate.AutoAllocated')}
            </Text>
          </BAICard>
        ) : (
          <ResourceGridCard
            title={slotTitle(acceleratorType, acceleratorType)}
            slotName={acceleratorType}
            kind={getQuickSlotKind(
              acceleratorType,
              mergedResourceSlots?.[acceleratorType]?.number_format?.binary,
            )}
            quantumSize={resourceGroupInfo?.accelerator_quantum_size}
            unitLabel={mergedResourceSlots?.[acceleratorType]?.display_unit}
            min={acceleratorLimits?.min}
            max={finiteOrUndefined(acceleratorLimits?.max)}
            remaining={finiteOrUndefined(
              remaining.accelerators?.[acceleratorType],
            )}
            amount={resource.accelerator ?? 0}
            disabled={!isCustomAllowed}
            headerExtra={
              supportedAcceleratorTypes.length > 1 ? (
                <BAISegmentedControl
                  size="sm"
                  aria-label={t('session.quickCreate.AcceleratorType')}
                  value={acceleratorType}
                  onChange={(next) =>
                    writeResource({ acceleratorType: next, accelerator: 0 })
                  }
                >
                  {supportedAcceleratorTypes.map((type) => (
                    <BAISegmentedControlItem
                      key={type}
                      value={type}
                      label={slotTitle(type, type)}
                    />
                  ))}
                </BAISegmentedControl>
              ) : undefined
            }
            onAmountChange={(accelerator) =>
              writeResource({ accelerator, acceleratorType })
            }
          />
        ))}
    </BAIFlex>
  );
};

export default QuickSessionResourceCards;
