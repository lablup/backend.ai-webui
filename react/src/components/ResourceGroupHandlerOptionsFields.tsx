/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form, useFormInstance, useWatch } from '../form-engine';
import BAIFormItem from './BAIFormItem';
import ResourceGroupOptionsCollapsible from './ResourceGroupOptionsCollapsible';
import {
  AstryxFormNumberInput,
  AstryxFormSelector,
} from './astryxFormControls';
import { IconButton } from '@lablup/ui-common/IconButton';
import { MetadataListItem } from '@lablup/ui-common/MetadataList';
import {
  BAIButton,
  BAIFlex,
  BAIMetadataList,
  BAITable,
  type BAIColumnsType,
  useBAIBreakpoint,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CircleMinus, PlusIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface HandlerNameOption {
  value: string;
  description?: string;
}

export interface HandlerOptionsFormValue {
  default?: {
    timeoutSec?: number | null;
    maxRetryCount?: number | null;
  } | null;
  byHandler?: Array<{
    handlerName: string;
    timeoutSec?: number | null;
    maxRetryCount?: number | null;
  }> | null;
}

interface HandlerOptionsInfo {
  readonly default: {
    readonly timeoutSec: number | null | undefined;
    readonly maxRetryCount: number | null | undefined;
  };
  readonly byHandler: ReadonlyArray<{
    readonly handlerName: string;
    readonly timeoutSec: number | null | undefined;
    readonly maxRetryCount: number | null | undefined;
  }>;
}

export const toHandlerOptionsFormValue = (
  info: HandlerOptionsInfo | null | undefined,
): HandlerOptionsFormValue => ({
  default: {
    timeoutSec: info?.default.timeoutSec ?? null,
    maxRetryCount: info?.default.maxRetryCount ?? null,
  },
  byHandler: _.map(info?.byHandler, (entry) => ({
    handlerName: entry.handlerName,
    timeoutSec: entry.timeoutSec ?? null,
    maxRetryCount: entry.maxRetryCount ?? null,
  })),
});

// A cleared number input is `null`; the manager reads `null` as "unbounded".
export const toHandlerOptionsInput = (value?: HandlerOptionsFormValue) => ({
  default: {
    timeoutSec: value?.default?.timeoutSec ?? null,
    maxRetryCount: value?.default?.maxRetryCount ?? null,
  },
  byHandler: _.map(value?.byHandler, (entry) => ({
    handlerName: entry.handlerName,
    timeoutSec: entry.timeoutSec ?? null,
    maxRetryCount: entry.maxRetryCount ?? null,
  })),
});

export const HandlerOptionsFormFields: React.FC<{
  name: string;
  // The names the manager accepts in `byHandler`; it rejects any other.
  handlerNameOptions: ReadonlyArray<HandlerNameOption>;
  defaultIsOpen?: boolean;
}> = ({ name, handlerNameOptions, defaultIsOpen }) => {
  'use memo';
  const { t } = useTranslation();
  const form = useFormInstance();
  const byHandler = useWatch([name, 'byHandler'], form) as
    HandlerOptionsFormValue['byHandler'] | undefined;

  // One override per handler: the manager rejects a duplicate name, so a
  // name chosen in another row leaves this row's list.
  const chosenNames = _.map(byHandler, (entry) => entry?.handlerName);
  const optionsForRow = (rowIndex: number) =>
    _.map(
      _.reject(
        handlerNameOptions,
        (option) =>
          _.includes(chosenNames, option.value) &&
          chosenNames[rowIndex] !== option.value,
      ),
      (option) => ({
        value: option.value,
        label: option.value,
        description: option.description,
      }),
    );
  const hasUnchosenName =
    _.size(_.compact(chosenNames)) < _.size(handlerNameOptions);

  return (
    <ResourceGroupOptionsCollapsible
      title={t('resourceGroup.HandlerOptions')}
      defaultIsOpen={defaultIsOpen}
    >
      <BAIFlex direction="row" gap="sm" align="start">
        <BAIFormItem
          label={t('resourceGroup.DefaultTimeout')}
          name={[name, 'default', 'timeoutSec']}
          style={{ flex: 1 }}
        >
          <AstryxFormNumberInput
            label={t('resourceGroup.DefaultTimeout')}
            units={t('resourceGroup.TimeoutSeconds')}
            placeholder={t('resourcePolicy.Unlimited')}
            min={0}
            isIntegerOnly
          />
        </BAIFormItem>
        <BAIFormItem
          label={t('resourceGroup.DefaultMaxRetries')}
          name={[name, 'default', 'maxRetryCount']}
          style={{ flex: 1 }}
        >
          <AstryxFormNumberInput
            label={t('resourceGroup.DefaultMaxRetries')}
            placeholder={t('resourcePolicy.Unlimited')}
            min={0}
            isIntegerOnly
          />
        </BAIFormItem>
      </BAIFlex>
      <BAIFormItem
        label={t('resourceGroup.HandlerOverrides')}
        tooltip={t('resourceGroup.HandlerOverridesDesc')}
      >
        <Form.List name={[name, 'byHandler']}>
          {(fields, { add, remove }) => (
            <BAIFlex direction="column" gap="xs" align="stretch">
              {fields.map(({ key, name: fieldName, ...restField }) => (
                <BAIFlex key={key} direction="row" align="start" gap="xs">
                  <Form.Item
                    {...restField}
                    name={[fieldName, 'handlerName']}
                    // Equal tracks regardless of the chosen name's length.
                    style={{ marginBottom: 0, flex: '2 1 0', minWidth: 0 }}
                    rules={[
                      {
                        required: true,
                        message: t('general.ValueRequired', {
                          name: t('resourceGroup.HandlerName'),
                        }),
                      },
                    ]}
                  >
                    <AstryxFormSelector
                      label={t('resourceGroup.HandlerName')}
                      placeholder={t('resourceGroup.SelectHandlerName')}
                      options={optionsForRow(fieldName)}
                      hasSearch
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[fieldName, 'timeoutSec']}
                    style={{ marginBottom: 0, flex: '1 1 0', minWidth: 0 }}
                  >
                    <AstryxFormNumberInput
                      label={t('resourceGroup.Timeout')}
                      placeholder={t('resourceGroup.Timeout')}
                      units={t('resourceGroup.TimeoutSeconds')}
                      min={0}
                      isIntegerOnly
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[fieldName, 'maxRetryCount']}
                    style={{ marginBottom: 0, flex: '1 1 0', minWidth: 0 }}
                  >
                    <AstryxFormNumberInput
                      label={t('modelService.MaxRetries')}
                      placeholder={t('modelService.MaxRetries')}
                      min={0}
                      isIntegerOnly
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
                disabled={!hasUnchosenName}
                onClick={() =>
                  add({
                    handlerName: '',
                    timeoutSec: null,
                    maxRetryCount: null,
                  })
                }
              >
                {t('resourceGroup.AddHandlerOverride')}
              </BAIButton>
            </BAIFlex>
          )}
        </Form.List>
      </BAIFormItem>
    </ResourceGroupOptionsCollapsible>
  );
};

const formatSeconds = (
  value: number | null | undefined,
  unlimited: string,
  unit: string,
) => (_.isNil(value) ? unlimited : `${value} ${unit}`);

type HandlerOverrideRow = HandlerOptionsInfo['byHandler'][number];

const HandlerOverridesTable: React.FC<{
  byHandler: HandlerOptionsInfo['byHandler'] | null | undefined;
}> = ({ byHandler }) => {
  'use memo';
  const { t } = useTranslation();
  const unlimited = t('resourcePolicy.Unlimited');
  const seconds = t('resourceGroup.TimeoutSeconds');

  const columns: BAIColumnsType<HandlerOverrideRow> = [
    {
      key: 'handlerName',
      title: t('resourceGroup.HandlerName'),
      dataIndex: 'handlerName',
    },
    {
      key: 'timeoutSec',
      title: t('resourceGroup.Timeout'),
      dataIndex: 'timeoutSec',
      render: (value: HandlerOverrideRow['timeoutSec']) =>
        formatSeconds(value, unlimited, seconds),
    },
    {
      key: 'maxRetryCount',
      title: t('modelService.MaxRetries'),
      dataIndex: 'maxRetryCount',
      render: (value: HandlerOverrideRow['maxRetryCount']) =>
        value ?? unlimited,
    },
  ];

  return (
    <BAITable
      size="small"
      rowKey="handlerName"
      dataSource={[...(byHandler ?? [])]}
      columns={columns}
      pagination={false}
      // Back inside the card's own inset (BAICard default `padding={6}`).
      style={{ paddingInline: 'var(--spacing-6)' }}
    />
  );
};

export const HandlerOptionsDescription: React.FC<{
  handlerOptions: HandlerOptionsInfo | null | undefined;
}> = ({ handlerOptions }) => {
  'use memo';
  const { t } = useTranslation();
  const { md } = useBAIBreakpoint();
  const unlimited = t('resourcePolicy.Unlimited');
  const seconds = t('resourceGroup.TimeoutSeconds');

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIMetadataList columns={md ? 2 : 1}>
        <MetadataListItem label={t('resourceGroup.DefaultTimeout')}>
          {formatSeconds(
            handlerOptions?.default.timeoutSec,
            unlimited,
            seconds,
          )}
        </MetadataListItem>
        <MetadataListItem label={t('resourceGroup.DefaultMaxRetries')}>
          {handlerOptions?.default.maxRetryCount ?? unlimited}
        </MetadataListItem>
      </BAIMetadataList>
      {/* Full width, label on top like the two-column list above it. */}
      <BAIMetadataList columns={1} label={{ position: 'top' }}>
        <MetadataListItem label={t('resourceGroup.HandlerOverrides')}>
          <HandlerOverridesTable byHandler={handlerOptions?.byHandler} />
        </MetadataListItem>
      </BAIMetadataList>
    </BAIFlex>
  );
};
