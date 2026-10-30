/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form, useFormInstance, useWatch } from '../form-engine';
import BAIFormItem from './BAIFormItem';
import FormListColumnHeader from './FormListColumnHeader';
import ResourceGroupOptionsCollapsible from './ResourceGroupOptionsCollapsible';
import { IconButton } from '@lablup/ui-common/IconButton';
import { MetadataListItem } from '@lablup/ui-common/MetadataList';
import {
  BAIButton,
  BAIFlex,
  BAIMetadataList,
  BAINumberInput,
  BAISelector,
  BAITable,
  BAIText,
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

// A cleared number input is `null`: unbounded in `default`, the default's
// value in a `byHandler` entry (manager `resolve()`).
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

// Row tracks of the per-handler override list, shared by its column header.
const HANDLER_COLUMN_STYLE: React.CSSProperties = {
  flex: '2 1 0',
  minWidth: 0,
};
const VALUE_COLUMN_STYLE: React.CSSProperties = { flex: '1 1 0', minWidth: 0 };

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
  const defaults = useWatch([name, 'default'], form) as
    HandlerOptionsFormValue['default'] | undefined;
  const unlimited = t('resourcePolicy.Unlimited');

  // One override per handler: the manager rejects a duplicate name, so a
  // name chosen in another row leaves this row's list.
  const chosenNames = _.map(byHandler, (entry) => entry?.handlerName);
  const knownNames = _.map(handlerNameOptions, 'value');
  const optionsForRow = (rowIndex: number) => {
    const ownName = chosenNames[rowIndex];
    // A stored name the list does not know still shows as this row's value.
    const ownUnknown: Array<HandlerNameOption> =
      ownName && !_.includes(knownNames, ownName) ? [{ value: ownName }] : [];
    const rowOptions: Array<HandlerNameOption> = [
      ..._.reject(
        handlerNameOptions,
        (option) =>
          _.includes(chosenNames, option.value) && ownName !== option.value,
      ),
      ...ownUnknown,
    ];
    return rowOptions.map((option) => ({
      value: option.value,
      label: option.value,
      description: option.description,
    }));
  };
  // A blank row has yet to claim a name, so it counts as taken.
  const hasUnchosenName =
    _.size(
      _.filter(chosenNames, (name) => !name || _.includes(knownNames, name)),
    ) < _.size(knownNames);

  // A stored spec may still carry the same handler twice.
  const validateUniqueHandler = (_rule: unknown, handlerName: string) => {
    const names = _.map(
      form.getFieldValue([name, 'byHandler']) as
        HandlerOptionsFormValue['byHandler'] | undefined,
      (entry) => entry?.handlerName,
    );
    return !_.isEmpty(handlerName) &&
      _.filter(names, (n) => n === handlerName).length > 1
      ? Promise.reject(new Error(t('resourceGroup.DuplicateHandlerOverride')))
      : Promise.resolve();
  };
  // Re-check the rows that have a name; a row still waiting for one stays quiet.
  const revalidateHandlerNames = () =>
    form.validateFields(
      _.compact(
        _.map(
          form.getFieldValue([name, 'byHandler']) as
            HandlerOptionsFormValue['byHandler'] | undefined,
          (entry, index) =>
            _.isEmpty(entry?.handlerName)
              ? null
              : [name, 'byHandler', index, 'handlerName'],
        ),
      ),
    );

  // An empty override falls back to the default, so the default is the placeholder.
  const timeoutPlaceholder = _.isNil(defaults?.timeoutSec)
    ? unlimited
    : String(defaults.timeoutSec);
  const maxRetriesPlaceholder = _.isNil(defaults?.maxRetryCount)
    ? unlimited
    : String(defaults.maxRetryCount);

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
          <BAINumberInput
            width="100%"
            aria-label={t('resourceGroup.DefaultTimeout')}
            units={t('resourceGroup.TimeoutSeconds')}
            placeholder={unlimited}
            min={1}
            isIntegerOnly
          />
        </BAIFormItem>
        <BAIFormItem
          label={t('resourceGroup.DefaultMaxRetries')}
          name={[name, 'default', 'maxRetryCount']}
          style={{ flex: 1 }}
        >
          <BAINumberInput
            width="100%"
            aria-label={t('resourceGroup.DefaultMaxRetries')}
            placeholder={unlimited}
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
              {fields.length > 0 && (
                <FormListColumnHeader
                  removeLabel={t('button.Remove')}
                  columns={[
                    {
                      key: 'handlerName',
                      label: t('resourceGroup.HandlerName'),
                      style: HANDLER_COLUMN_STYLE,
                    },
                    {
                      key: 'timeoutSec',
                      label: t('resourceGroup.Timeout'),
                      style: VALUE_COLUMN_STYLE,
                    },
                    {
                      key: 'maxRetryCount',
                      label: t('modelService.MaxRetries'),
                      style: VALUE_COLUMN_STYLE,
                    },
                  ]}
                />
              )}
              {fields.map(({ key, name: fieldName, ...restField }) => (
                <BAIFlex key={key} direction="row" align="start" gap="xs">
                  <Form.Item
                    {...restField}
                    name={[fieldName, 'handlerName']}
                    style={{ marginBottom: 0, ...HANDLER_COLUMN_STYLE }}
                    rules={[
                      {
                        required: true,
                        message: t('general.ValueRequired', {
                          name: t('resourceGroup.HandlerName'),
                        }),
                      },
                      { validator: validateUniqueHandler },
                    ]}
                  >
                    <BAISelector
                      aria-label={t('resourceGroup.HandlerName')}
                      placeholder={t('resourceGroup.SelectHandlerName')}
                      options={optionsForRow(fieldName)}
                      hasSearch
                      onChange={() => revalidateHandlerNames()}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[fieldName, 'timeoutSec']}
                    style={{ marginBottom: 0, ...VALUE_COLUMN_STYLE }}
                  >
                    <BAINumberInput
                      width="100%"
                      aria-label={t('resourceGroup.Timeout')}
                      placeholder={timeoutPlaceholder}
                      units={t('resourceGroup.TimeoutSecondsShort')}
                      min={1}
                      isIntegerOnly
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[fieldName, 'maxRetryCount']}
                    style={{ marginBottom: 0, ...VALUE_COLUMN_STYLE }}
                  >
                    <BAINumberInput
                      width="100%"
                      aria-label={t('modelService.MaxRetries')}
                      placeholder={maxRetriesPlaceholder}
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
  fallback: HandlerOptionsInfo['default'] | null | undefined;
}> = ({ byHandler, fallback }) => {
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
      // A null override field falls back to the default (manager `resolve()`),
      // shown muted like the edit form's placeholder.
      render: (value: HandlerOverrideRow['timeoutSec']) =>
        _.isNil(value) ? (
          <BAIText type="secondary">
            {formatSeconds(fallback?.timeoutSec, unlimited, seconds)}
          </BAIText>
        ) : (
          formatSeconds(value, unlimited, seconds)
        ),
    },
    {
      key: 'maxRetryCount',
      title: t('modelService.MaxRetries'),
      dataIndex: 'maxRetryCount',
      render: (value: HandlerOverrideRow['maxRetryCount']) =>
        _.isNil(value) ? (
          <BAIText type="secondary">
            {fallback?.maxRetryCount ?? unlimited}
          </BAIText>
        ) : (
          value
        ),
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
          <HandlerOverridesTable
            byHandler={handlerOptions?.byHandler}
            fallback={handlerOptions?.default}
          />
        </MetadataListItem>
      </BAIMetadataList>
    </BAIFlex>
  );
};
