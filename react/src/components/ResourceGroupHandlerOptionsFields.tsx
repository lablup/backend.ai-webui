/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../form-engine';
import BAIFormItem from './BAIFormItem';
import {
  AstryxFormNumberInput,
  AstryxFormTextInput,
} from './astryxFormControls';
import { IconButton } from '@lablup/ui-common/IconButton';
import { MetadataListItem } from '@lablup/ui-common/MetadataList';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIButton,
  BAICard,
  BAIFlex,
  BAIMetadataList,
  useBAIBreakpoint,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CircleMinus, PlusIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

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
    handlerName: _.trim(entry.handlerName),
    timeoutSec: entry.timeoutSec ?? null,
    maxRetryCount: entry.maxRetryCount ?? null,
  })),
});

export const HandlerOptionsFormFields: React.FC<{ name: string }> = ({
  name,
}) => {
  'use memo';
  const { t } = useTranslation();

  return (
    <BAICard size="small" title={t('resourceGroup.HandlerOptions')}>
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
                    style={{ marginBottom: 0, flex: 2 }}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: t('general.ValueRequired', {
                          name: t('resourceGroup.HandlerName'),
                        }),
                      },
                    ]}
                  >
                    <AstryxFormTextInput
                      label={t('resourceGroup.HandlerName')}
                      placeholder={t('resourceGroup.HandlerName')}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[fieldName, 'timeoutSec']}
                    style={{ marginBottom: 0, flex: 1 }}
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
                    style={{ marginBottom: 0, flex: 1 }}
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
    </BAICard>
  );
};

const formatSeconds = (
  value: number | null | undefined,
  unlimited: string,
  unit: string,
) => (_.isNil(value) ? unlimited : `${value} ${unit}`);

export const HandlerOptionsDescription: React.FC<{
  handlerOptions: HandlerOptionsInfo | null | undefined;
}> = ({ handlerOptions }) => {
  'use memo';
  const { t } = useTranslation();
  const { md } = useBAIBreakpoint();
  const unlimited = t('resourcePolicy.Unlimited');
  const seconds = t('resourceGroup.TimeoutSeconds');

  return (
    <BAIMetadataList
      title={t('resourceGroup.HandlerOptions')}
      columns={md ? 2 : 1}
    >
      <MetadataListItem label={t('resourceGroup.DefaultTimeout')}>
        {formatSeconds(handlerOptions?.default.timeoutSec, unlimited, seconds)}
      </MetadataListItem>
      <MetadataListItem label={t('resourceGroup.DefaultMaxRetries')}>
        {handlerOptions?.default.maxRetryCount ?? unlimited}
      </MetadataListItem>
      <MetadataListItem label={t('resourceGroup.HandlerOverrides')}>
        {_.isEmpty(handlerOptions?.byHandler) ? (
          '-'
        ) : (
          <BAIFlex direction="column" align="start" gap="xxs">
            {_.map(handlerOptions?.byHandler, (entry) => (
              <Text key={entry.handlerName}>
                <Text weight="semibold">{entry.handlerName}</Text>
                {` · ${t('resourceGroup.Timeout')} ${formatSeconds(
                  entry.timeoutSec,
                  unlimited,
                  seconds,
                )} · ${t('modelService.MaxRetries')} ${
                  entry.maxRetryCount ?? unlimited
                }`}
              </Text>
            ))}
          </BAIFlex>
        )}
      </MetadataListItem>
    </BAIMetadataList>
  );
};
