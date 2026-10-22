/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../form-engine';
import { formatDuration } from '../helper';
import { useCurrentDomain } from '../hooks';
import { useResourceSlotsDetails } from '../hooks/backendai';
import BAIFormItem from './BAIFormItem';
import DatePickerISO from './DatePickerISO';
import ResourceGroupOptionsCollapsible from './ResourceGroupOptionsCollapsible';
import {
  AstryxFormCheckbox,
  AstryxFormNumberInput,
  AstryxFormSelector,
  AstryxFormTextArea,
  AstryxFormTextInput,
} from './astryxFormControls';
import { IconButton } from '@lablup/ui-common/IconButton';
import { InputGroup } from '@lablup/ui-common/InputGroup';
import { Selector } from '@lablup/ui-common/Selector';
import { TextInput } from '@lablup/ui-common/TextInput';
import {
  BAIScopedImageSelect,
  BAIButton,
  BAIDynamicUnitInputNumber,
  BAIFlex,
  convertToBinaryUnit,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { CircleMinus, PlusIcon } from 'lucide-react';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

export interface SessionExecutionSpecFormValue {
  imageId?: string | null;
  cpu?: number | null;
  // Binary size notation (e.g. `8g`), as BAIDynamicUnitInputNumber emits it.
  mem?: string | null;
  resources?: Array<{ resourceType: string; quantity: string }> | null;
  shmem?: string | null;
  isBatchSession?: boolean;
  startsAtEnabled?: boolean;
  startsAt?: string | null;
  batchTimeoutEnabled?: boolean;
  batchTimeout?: number | null;
  batchTimeoutUnit?: BatchTimeoutUnit;
  startupCommand?: string | null;
  bootstrapScript?: string | null;
}

type BatchTimeoutUnit = 's' | 'm' | 'h' | 'd' | 'w';

const SECONDS_PER_UNIT: Record<BatchTimeoutUnit, number> = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86400,
  w: 604800,
};

// The largest unit that divides the stored seconds evenly, so 7200 reads as "2 h".
const secondsToBatchTimeout = (
  seconds: number,
): { batchTimeout: number; batchTimeoutUnit: BatchTimeoutUnit } => {
  const unit: BatchTimeoutUnit =
    (['w', 'd', 'h', 'm'] as const).find(
      (u) => seconds > 0 && seconds % SECONDS_PER_UNIT[u] === 0,
    ) ?? 's';
  return {
    batchTimeout: seconds / SECONDS_PER_UNIT[unit],
    batchTimeoutUnit: unit,
  };
};

interface KernelExecutionSpecInfo {
  readonly imageId: string | null | undefined;
  readonly resources:
    | ReadonlyArray<{
        readonly resourceType: string;
        readonly quantity: unknown;
      }>
    | null
    | undefined;
  readonly resourceOpts:
    { readonly shmem: string | null | undefined } | null | undefined;
  readonly startupCommand: string | null | undefined;
  readonly bootstrapScript: string | null | undefined;
  readonly startsAt: string | null | undefined;
  readonly batchTimeoutSec: number | null | undefined;
}

const bytesToSizeNotation = (bytes: number) => {
  const gib = bytes / 1024 ** 3;
  return Number.isInteger(gib)
    ? `${gib}g`
    : `${Math.round(bytes / 1024 ** 2)}m`;
};

// The manager answers shmem as "3 MiB"; the size inputs and chips read "3m".
export const normalizeShmemExpr = (shmem: string | null | undefined) => {
  const match = shmem?.match(/^(\d+(?:\.\d+)?)\s*([kmgtpe]?)/i);
  return match ? `${match[1]}${_.toLower(match[2])}` : null;
};

export const toSessionExecutionSpecFormValue = (
  info: KernelExecutionSpecInfo | null | undefined,
): SessionExecutionSpecFormValue => {
  const quantityOf = (slot: string) => {
    const entry = _.find(info?.resources, { resourceType: slot });
    return _.isNil(entry) ? undefined : Number(entry.quantity);
  };
  const mem = quantityOf('mem');
  const timeout = _.isNil(info?.batchTimeoutSec)
    ? { batchTimeout: null, batchTimeoutUnit: 's' as const }
    : secondsToBatchTimeout(info.batchTimeoutSec);
  return {
    imageId: info?.imageId ?? null,
    cpu: quantityOf('cpu') ?? null,
    mem: _.isNil(mem) || _.isNaN(mem) ? null : bytesToSizeNotation(mem),
    resources: _.map(
      _.reject(info?.resources, (entry) =>
        _.includes(['cpu', 'mem'], entry.resourceType),
      ),
      (entry) => ({
        resourceType: entry.resourceType,
        quantity: String(entry.quantity),
      }),
    ),
    shmem: normalizeShmemExpr(info?.resourceOpts?.shmem),
    isBatchSession: !(
      _.isEmpty(info?.startsAt) &&
      _.isNil(info?.batchTimeoutSec) &&
      _.isEmpty(info?.startupCommand) &&
      _.isEmpty(info?.bootstrapScript)
    ),
    startsAtEnabled: !_.isEmpty(info?.startsAt),
    startsAt: info?.startsAt ?? null,
    batchTimeoutEnabled: !_.isNil(info?.batchTimeoutSec),
    ...timeout,
    startupCommand: info?.startupCommand ?? null,
    bootstrapScript: info?.bootstrapScript ?? null,
  };
};

// An all-empty spec is sent as `null`, which the manager reads as "not configured".
export const toKernelExecutionSpecInput = (
  value?: SessionExecutionSpecFormValue,
) => {
  const blankToNull = (text?: string | null) =>
    _.isEmpty(_.trim(text ?? '')) ? null : text!;
  const memBytes = blankToNull(value?.mem)
    ? convertToBinaryUnit(value!.mem!, '', 0)?.number
    : undefined;
  const resources = [
    ...(_.isNil(value?.cpu)
      ? []
      : [{ resourceType: 'cpu', quantity: String(value.cpu) }]),
    ...(_.isNil(memBytes)
      ? []
      : [{ resourceType: 'mem', quantity: String(memBytes) }]),
    ..._.map(
      _.filter(value?.resources, (entry) => !_.isEmpty(entry?.resourceType)),
      (entry) => ({
        resourceType: entry.resourceType,
        quantity: _.trim(entry.quantity),
      }),
    ),
  ];
  const isBatch = !!value?.isBatchSession;
  const batchTimeoutSec =
    isBatch && value?.batchTimeoutEnabled && !_.isNil(value.batchTimeout)
      ? Math.round(
          value.batchTimeout * SECONDS_PER_UNIT[value.batchTimeoutUnit ?? 's'],
        )
      : null;
  const input = {
    imageId: blankToNull(value?.imageId),
    resources: _.isEmpty(resources) ? null : resources,
    resourceOpts: blankToNull(value?.shmem)
      ? { shmem: { expr: value!.shmem! } }
      : null,
    startupCommand: isBatch ? blankToNull(value?.startupCommand) : null,
    bootstrapScript: isBatch ? blankToNull(value?.bootstrapScript) : null,
    startsAt:
      isBatch && value?.startsAtEnabled ? blankToNull(value.startsAt) : null,
    batchTimeoutSec,
  };
  return _.every(input, _.isNil) ? null : input;
};

const ImageSelectField: React.FC<{
  value?: string | null;
  onChange?: (value: string | Array<string> | undefined) => void;
}> = ({ value, onChange }) => {
  'use memo';
  const { t } = useTranslation();
  const { id: currentDomainId } = useCurrentDomain();
  return (
    <Suspense
      fallback={
        <Selector
          label={t('general.Loading')}
          isLabelHidden
          isDisabled
          options={[]}
          placeholder={t('general.Loading')}
          width="100%"
        />
      }
    >
      <BAIScopedImageSelect
        scope={{ domain: [{ value: currentDomainId }], public: true }}
        label={t('general.Image')}
        isLabelHidden
        placeholder={t('adminDeploymentPreset.SelectImage')}
        value={value ?? undefined}
        onChange={(next) => onChange?.(next ?? undefined)}
        allowClear
      />
    </Suspense>
  );
};

// The name column of every slot row, so the fixed CPU / MEM rows and the
// removable custom rows line up although only the latter end with a button.
const NAME_COLUMN_STYLE: React.CSSProperties = {
  flex: '0 0 calc(50% - var(--spacing-2) / 2)',
  minWidth: 0,
};

// A non-removable row whose name is fixed, matching the deployment preset form.
const FixedNameRow: React.FC<{
  name: string;
  label: string;
  children: React.ReactNode;
}> = ({ name, label, children }) => {
  'use memo';
  return (
    <BAIFlex direction="row" align="start" gap="xs">
      <BAIFormItem style={{ marginBottom: 0, ...NAME_COLUMN_STYLE }}>
        <TextInput
          label={label}
          isLabelHidden
          value={name}
          isDisabled
          width="100%"
        />
      </BAIFormItem>
      <BAIFlex direction="column" align="stretch" style={{ flex: 1 }}>
        {children}
      </BAIFlex>
    </BAIFlex>
  );
};

export const SessionExecutionSpecFormFields: React.FC<{
  name: string;
  clusterModeName: string;
  resourceGroupName: string;
  defaultIsOpen?: boolean;
}> = ({ name, clusterModeName, resourceGroupName, defaultIsOpen }) => {
  'use memo';
  const { t } = useTranslation();
  const { resourceSlotsInRG } = useResourceSlotsDetails(resourceGroupName);
  const form = Form.useFormInstance();
  const currentResources: SessionExecutionSpecFormValue['resources'] =
    Form.useWatch([name, 'resources'], form);
  const isBatchSession: boolean | undefined = Form.useWatch(
    [name, 'isBatchSession'],
    form,
  );
  const startsAtEnabled: boolean | undefined = Form.useWatch(
    [name, 'startsAtEnabled'],
    form,
  );
  const batchTimeoutEnabled: boolean | undefined = Form.useWatch(
    [name, 'batchTimeoutEnabled'],
    form,
  );
  const batchTimeout: number | null | undefined = Form.useWatch(
    [name, 'batchTimeout'],
    form,
  );
  const batchTimeoutUnit: BatchTimeoutUnit | undefined = Form.useWatch(
    [name, 'batchTimeoutUnit'],
    form,
  );
  const batchTimeoutText =
    batchTimeoutEnabled && _.toFinite(batchTimeout) > 0
      ? formatDuration(
          dayjs.duration(_.toFinite(batchTimeout), batchTimeoutUnit ?? 's'),
          t,
        )
      : undefined;

  // Keep slot names the stored spec already uses even if the group lacks them now.
  const slotOptions = _.uniqBy(
    [
      ..._.map(
        _.omit(resourceSlotsInRG, ['cpu', 'mem']),
        (detail, slotName) => ({
          value: slotName,
          label: detail?.human_readable_name
            ? `${detail.human_readable_name} (${slotName})`
            : slotName,
        }),
      ),
      ..._.map(
        _.filter(currentResources, (entry) => !!entry?.resourceType),
        (entry) => ({ value: entry.resourceType, label: entry.resourceType }),
      ),
    ],
    'value',
  );

  return (
    <ResourceGroupOptionsCollapsible
      title={t('resourceGroup.SessionExecutionOptions')}
      defaultIsOpen={defaultIsOpen}
    >
      <BAIFormItem label={t('general.Image')} name={[name, 'imageId']}>
        <ImageSelectField />
      </BAIFormItem>
      <BAIFormItem label={t('adminDeploymentPreset.ResourceSlots')}>
        <BAIFlex direction="column" gap="xs" align="stretch">
          <FixedNameRow
            name="CPU"
            label={t('adminDeploymentPreset.ResourceSlots')}
          >
            <BAIFormItem name={[name, 'cpu']} style={{ marginBottom: 0 }}>
              <AstryxFormNumberInput
                label="CPU"
                units={resourceSlotsInRG?.cpu?.display_unit || undefined}
                min={0}
              />
            </BAIFormItem>
          </FixedNameRow>
          <FixedNameRow
            name="MEM"
            label={t('adminDeploymentPreset.ResourceSlots')}
          >
            <BAIFormItem name={[name, 'mem']} style={{ marginBottom: 0 }}>
              <BAIDynamicUnitInputNumber
                defaultUnit="g"
                style={{ width: '100%' }}
              />
            </BAIFormItem>
          </FixedNameRow>
          <Form.List name={[name, 'resources']}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name: fieldName, ...restField }) => (
                  <BAIFlex key={key} direction="row" align="start" gap="xs">
                    <Form.Item
                      {...restField}
                      name={[fieldName, 'resourceType']}
                      style={{ marginBottom: 0, ...NAME_COLUMN_STYLE }}
                      rules={[
                        {
                          required: true,
                          message: t('general.ValueRequired', {
                            name: t('adminDeploymentPreset.ResourceSlots'),
                          }),
                        },
                      ]}
                    >
                      <AstryxFormSelector
                        label={t('adminDeploymentPreset.ResourceSlots')}
                        placeholder={t('adminDeploymentPreset.ResourceSlots')}
                        options={slotOptions}
                        hasSearch
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[fieldName, 'quantity']}
                      style={{ marginBottom: 0, flex: 1 }}
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: t('general.ValueRequired', {
                            name: t('resourcePreset.Resources'),
                          }),
                        },
                      ]}
                    >
                      <AstryxFormTextInput
                        label={t('resourcePreset.Resources')}
                        placeholder={
                          resourceSlotsInRG?.[
                            currentResources?.[fieldName]?.resourceType ?? ''
                          ]?.display_unit || undefined
                        }
                      />
                    </Form.Item>
                    <IconButton
                      variant="ghost"
                      icon={<CircleMinus aria-hidden />}
                      label={t('button.Remove')}
                      tooltip={t('button.Remove')}
                      onClick={() => remove(fieldName)}
                    />
                  </BAIFlex>
                ))}
                <BAIButton
                  type="dashed"
                  icon={<PlusIcon />}
                  block
                  onClick={() => add({ resourceType: undefined, quantity: '' })}
                >
                  {t('adminDeploymentPreset.AddResourceSlot')}
                </BAIButton>
              </>
            )}
          </Form.List>
        </BAIFlex>
      </BAIFormItem>
      <BAIFormItem label={t('adminDeploymentPreset.ResourceOpts')}>
        <FixedNameRow
          name="SHMEM"
          label={t('adminDeploymentPreset.ResourceOpts')}
        >
          <BAIFormItem name={[name, 'shmem']} style={{ marginBottom: 0 }}>
            <BAIDynamicUnitInputNumber
              defaultUnit="m"
              style={{ width: '100%' }}
            />
          </BAIFormItem>
        </FixedNameRow>
      </BAIFormItem>
      <BAIFormItem
        label={t('session.ClusterMode')}
        name={clusterModeName}
        rules={[{ required: true }]}
      >
        <AstryxFormSelector
          label={t('session.ClusterMode')}
          options={[
            { label: t('session.launcher.SingleNode'), value: 'single-node' },
            { label: t('session.launcher.MultiNode'), value: 'multi-node' },
          ]}
        />
      </BAIFormItem>
      <BAIFormItem
        name={[name, 'isBatchSession']}
        valuePropName="checked"
        style={{ marginBottom: isBatchSession ? undefined : 0 }}
      >
        <AstryxFormCheckbox label={t('resourceGroup.RunAsBatchSession')} />
      </BAIFormItem>
      {isBatchSession ? (
        <>
          <BAIFormItem label={t('session.launcher.SessionStartTime')}>
            <BAIFlex direction="row" gap="xs" align="center">
              <Form.Item
                noStyle
                name={[name, 'startsAtEnabled']}
                valuePropName="checked"
              >
                <AstryxFormCheckbox
                  label={t('session.launcher.Enable')}
                  onValueChange={(checked) => {
                    if (!checked) {
                      form.setFieldValue([name, 'startsAt'], undefined);
                    }
                  }}
                />
              </Form.Item>
              <Form.Item
                name={[name, 'startsAt']}
                style={{ marginBottom: 0, flex: 1 }}
              >
                <DatePickerISO disabled={!startsAtEnabled} showTime />
              </Form.Item>
            </BAIFlex>
          </BAIFormItem>
          <BAIFormItem
            label={t('session.launcher.BatchJobTimeoutDuration')}
            tooltip={t('session.launcher.BatchJobTimeoutDurationDesc')}
            help={batchTimeoutText}
          >
            <BAIFlex direction="row" gap="xs" align="center">
              <Form.Item
                noStyle
                name={[name, 'batchTimeoutEnabled']}
                valuePropName="checked"
              >
                <AstryxFormCheckbox
                  label={t('session.launcher.Enable')}
                  onValueChange={(checked) => {
                    if (!checked) {
                      form.setFieldValue([name, 'batchTimeout'], undefined);
                    } else if (
                      !form.getFieldValue([name, 'batchTimeoutUnit'])
                    ) {
                      form.setFieldValue([name, 'batchTimeoutUnit'], 's');
                    }
                    form.validateFields([[name, 'batchTimeout']]);
                  }}
                />
              </Form.Item>
              <InputGroup
                label={t('session.launcher.BatchJobTimeoutDuration')}
                isLabelHidden
              >
                <Form.Item
                  noStyle
                  name={[name, 'batchTimeout']}
                  dependencies={[[name, 'batchTimeoutEnabled']]}
                  rules={[{ required: !!batchTimeoutEnabled, message: '' }]}
                >
                  <AstryxFormNumberInput
                    label={t('session.launcher.BatchJobTimeoutDuration')}
                    disabled={!batchTimeoutEnabled}
                    min={1}
                    isIntegerOnly
                  />
                </Form.Item>
                <Form.Item noStyle name={[name, 'batchTimeoutUnit']}>
                  <AstryxFormSelector
                    label={t('session.launcher.BatchJobTimeoutDuration')}
                    disabled={!batchTimeoutEnabled}
                    width={100}
                    options={[
                      { label: t('time.Sec'), value: 's' },
                      { label: t('time.Min'), value: 'm' },
                      { label: t('time.Hour'), value: 'h' },
                      { label: t('time.Day'), value: 'd' },
                      { label: t('time.Week'), value: 'w' },
                    ]}
                  />
                </Form.Item>
              </InputGroup>
            </BAIFlex>
          </BAIFormItem>
          <BAIFormItem
            label={t('session.launcher.StartUpCommand')}
            name={[name, 'startupCommand']}
          >
            <AstryxFormTextArea
              label={t('session.launcher.StartUpCommand')}
              rows={2}
            />
          </BAIFormItem>
          <BAIFormItem
            label={t('adminDeploymentPreset.BootstrapScript')}
            name={[name, 'bootstrapScript']}
            style={{ marginBottom: 0 }}
          >
            <AstryxFormTextArea
              label={t('adminDeploymentPreset.BootstrapScript')}
              placeholder={t(
                'adminDeploymentPreset.BootstrapScriptPlaceholder',
              )}
              rows={3}
            />
          </BAIFormItem>
        </>
      ) : null}
    </ResourceGroupOptionsCollapsible>
  );
};
