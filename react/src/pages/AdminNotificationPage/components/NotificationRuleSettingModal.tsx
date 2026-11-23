/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { NotificationRuleSettingModalChannelsQuery } from '../../../__generated__/NotificationRuleSettingModalChannelsQuery.graphql';
import {
  NotificationRuleSettingModalCreateMutation,
  NotificationRuleType,
} from '../../../__generated__/NotificationRuleSettingModalCreateMutation.graphql';
import { NotificationRuleSettingModalFragment$key } from '../../../__generated__/NotificationRuleSettingModalFragment.graphql';
import { NotificationRuleSettingModalSchemaQuery } from '../../../__generated__/NotificationRuleSettingModalSchemaQuery.graphql';
import { NotificationRuleSettingModalUpdateMutation } from '../../../__generated__/NotificationRuleSettingModalUpdateMutation.graphql';
import { App } from '../../../app-shim';
import { Form, FormInstance } from '../../../form-engine';
import {
  NOTIFICATION_RULE_TYPES,
  buildDefaultTemplate,
  getTemplateVariables,
  insertAtSelection,
  toTemplateExpression,
} from '../helper/notificationRuleTemplate';
import { Token } from '@lablup/ui-common/Token';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAISelect,
  BAISkeleton,
  BAISwitch,
  BAIText,
  BAITextArea,
  BAITextInput,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { Suspense, useEffect, useEffectEvent, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from 'react-relay';

type NotificationRuleFormValues = {
  name: string;
  description?: string;
  ruleType: NotificationRuleType;
  channelId: string;
  messageTemplate: string;
  enabled: boolean;
};

interface NotificationRuleSettingModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel'
> {
  ruleFrgmt?: NotificationRuleSettingModalFragment$key | null;
  onRequestClose: (success?: boolean) => void;
}

export const useRuleTypeLabel = () => {
  const { t } = useTranslation();
  return (ruleType: string) =>
    t(`externalNotification.ruleTypes.${ruleType}`, {
      defaultValue: ruleType,
    });
};

const ChannelFormItem: React.FC<{ isDisabled: boolean }> = ({ isDisabled }) => {
  'use memo';
  const { t } = useTranslation();
  const { adminNotificationChannels } =
    useLazyLoadQuery<NotificationRuleSettingModalChannelsQuery>(
      graphql`
        query NotificationRuleSettingModalChannelsQuery {
          adminNotificationChannels(
            orderBy: [{ field: NAME, direction: ASC }]
            limit: 100
          ) {
            edges {
              node {
                id
                entityId
                name
                channelType
                enabled
              }
            }
          }
        }
      `,
      {},
      { fetchPolicy: 'store-and-network' },
    );
  return (
    <Form.Item
      label={t('externalNotification.Channel')}
      name="channelId"
      rules={[
        { required: true, message: t('externalNotification.ChannelRequired') },
      ]}
    >
      <BAISelect
        disabled={isDisabled}
        showSearch
        placeholder={t('externalNotification.SelectChannel')}
        options={_.map(adminNotificationChannels?.edges, (edge) => ({
          value: edge?.node?.entityId ?? '',
          label: `${edge?.node?.name} (${t(
            `externalNotification.channelTypes.${edge?.node?.channelType}`,
          )})`,
        }))}
      />
    </Form.Item>
  );
};

// Inside the Form so the watch and the default-template fill see its values.
const MessageTemplateFormItem: React.FC<{
  ruleType: NotificationRuleType;
  autoFilledRef: React.RefObject<string | null>;
}> = ({ ruleType, autoFilledRef }) => {
  'use memo';
  const { t } = useTranslation();
  const form = Form.useFormInstance<NotificationRuleFormValues>();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { notificationRuleTypeSchema } =
    useLazyLoadQuery<NotificationRuleSettingModalSchemaQuery>(
      graphql`
        query NotificationRuleSettingModalSchemaQuery(
          $ruleType: NotificationRuleType!
        ) {
          notificationRuleTypeSchema(ruleType: $ruleType)
        }
      `,
      { ruleType },
      { fetchPolicy: 'store-or-network' },
    );
  const variables = getTemplateVariables(notificationRuleTypeSchema);

  // Replace the template only while it is empty or still the untouched default.
  const fillDefaultTemplate = useEffectEvent(() => {
    const current = form.getFieldValue('messageTemplate') ?? '';
    if (!_.trim(current) || current === autoFilledRef.current) {
      const next = buildDefaultTemplate(variables);
      autoFilledRef.current = next;
      form.setFieldValue('messageTemplate', next);
    }
  });
  useEffect(() => {
    fillDefaultTemplate();
  }, [ruleType]);

  const insertVariable = (name: string) => {
    const textArea = textAreaRef.current;
    const { value, caret } = insertAtSelection(
      form.getFieldValue('messageTemplate') ?? '',
      toTemplateExpression(name),
      textArea?.selectionStart,
      textArea?.selectionEnd,
    );
    form.setFieldValue('messageTemplate', value);
    requestAnimationFrame(() => {
      textArea?.focus();
      textArea?.setSelectionRange(caret, caret);
    });
  };

  return (
    <Form.Item
      label={t('externalNotification.MessageTemplate')}
      extra={
        <BAIFlex direction="column" align="start" gap="xxs">
          {t('externalNotification.MessageTemplateExtra')}
          <BAIFlex gap="xxs" wrap="wrap">
            {_.map(variables, (variable) => (
              <Tooltip
                key={variable.name}
                content={variable.description ?? variable.title ?? ''}
              >
                <Token
                  size="sm"
                  color={variable.isRequired ? 'blue' : 'default'}
                  label={variable.name}
                  onClick={() => insertVariable(variable.name)}
                />
              </Tooltip>
            ))}
          </BAIFlex>
        </BAIFlex>
      }
      name="messageTemplate"
      rules={[
        {
          required: true,
          whitespace: true,
          message: t('externalNotification.MessageTemplateRequired'),
        },
      ]}
    >
      <BAITextArea
        ref={textAreaRef}
        aria-label={t('externalNotification.MessageTemplate')}
        rows={5}
      />
    </Form.Item>
  );
};

const RuleTypeDependentItems: React.FC = () => {
  'use memo';
  const form = Form.useFormInstance<NotificationRuleFormValues>();
  const ruleType = Form.useWatch('ruleType', form);
  const autoFilledRef = useRef<string | null>(null);
  if (!ruleType) return null;
  return (
    <Suspense fallback={<BAISkeleton rows={3} />}>
      <MessageTemplateFormItem
        ruleType={ruleType}
        autoFilledRef={autoFilledRef}
      />
    </Suspense>
  );
};

const NotificationRuleSettingModal: React.FC<
  NotificationRuleSettingModalProps
> = ({ ruleFrgmt, onRequestClose, ...baiModalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const ruleTypeLabel = useRuleTypeLabel();
  const formRef = useRef<FormInstance<NotificationRuleFormValues>>(null);

  const rule = useFragment(
    graphql`
      fragment NotificationRuleSettingModalFragment on NotificationRule {
        id
        entityId
        name
        description
        ruleType
        channelId
        messageTemplate
        enabled
      }
    `,
    ruleFrgmt ?? null,
  );

  const [commitCreate, isInFlightCreate] =
    useMutation<NotificationRuleSettingModalCreateMutation>(graphql`
      mutation NotificationRuleSettingModalCreateMutation(
        $input: CreateNotificationRuleInput!
      ) {
        adminCreateNotificationRule(input: $input) {
          rule {
            id
            entityId
          }
        }
      }
    `);

  const [commitUpdate, isInFlightUpdate] =
    useMutation<NotificationRuleSettingModalUpdateMutation>(graphql`
      mutation NotificationRuleSettingModalUpdateMutation(
        $input: UpdateNotificationRuleInput!
      ) {
        updateNotificationRule(input: $input) {
          rule {
            id
            name
            description
            messageTemplate
            enabled
          }
        }
      }
    `);

  const handleResult = (errors: ReadonlyArray<{ message: string }> | null) => {
    if (errors && errors.length > 0) {
      message.error(errors[0]?.message || t('general.ErrorOccurred'));
      return;
    }
    message.success(t('externalNotification.RuleSaved'));
    onRequestClose(true);
  };
  const handleError = (error: Error) => {
    message.error(error?.message || t('general.ErrorOccurred'));
  };

  const handleOk = () =>
    formRef.current
      ?.validateFields()
      .then((values) => {
        const common = {
          name: _.trim(values.name),
          description: _.trim(values.description ?? '') || null,
          messageTemplate: values.messageTemplate,
          enabled: values.enabled,
        };
        if (rule) {
          commitUpdate({
            variables: { input: { id: rule.entityId, ...common } },
            onCompleted: (_res, errors) => handleResult(errors),
            onError: handleError,
          });
          return;
        }
        commitCreate({
          variables: {
            input: {
              ...common,
              ruleType: values.ruleType,
              channelId: values.channelId,
            },
          },
          onCompleted: (_res, errors) => handleResult(errors),
          onError: handleError,
        });
      })
      .catch(() => {});

  return (
    <BAIModal
      {...baiModalProps}
      centered
      unmountOnClose
      width={640}
      title={
        rule
          ? t('externalNotification.EditRule')
          : t('externalNotification.CreateRule')
      }
      okText={rule ? t('button.Save') : t('button.Create')}
      confirmLoading={isInFlightCreate || isInFlightUpdate}
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
    >
      <Form
        ref={formRef}
        layout="vertical"
        initialValues={{
          name: rule?.name,
          description: rule?.description ?? undefined,
          ruleType: rule?.ruleType,
          channelId: rule?.channelId,
          messageTemplate: rule?.messageTemplate ?? '',
          enabled: rule?.enabled ?? true,
        }}
      >
        <Form.Item
          label={t('externalNotification.Name')}
          name="name"
          rules={[
            {
              required: true,
              whitespace: true,
              message: t('externalNotification.NameRequired'),
            },
            { max: 256 },
          ]}
        >
          <BAITextInput aria-label={t('externalNotification.Name')} />
        </Form.Item>
        <Form.Item
          label={t('externalNotification.Description')}
          name="description"
        >
          <BAITextArea
            aria-label={t('externalNotification.Description')}
            rows={2}
          />
        </Form.Item>
        <Form.Item
          label={t('externalNotification.Event')}
          name="ruleType"
          extra={
            rule ? t('externalNotification.RuleTypeAndChannelFixed') : undefined
          }
          rules={[
            {
              required: true,
              message: t('externalNotification.EventRequired'),
            },
          ]}
        >
          <BAISelect
            disabled={!!rule}
            placeholder={t('externalNotification.SelectEvent')}
            options={_.map(NOTIFICATION_RULE_TYPES, (ruleType) => ({
              value: ruleType,
              label: ruleTypeLabel(ruleType),
            }))}
          />
        </Form.Item>
        <Suspense fallback={<BAISkeleton rows={1} />}>
          <ChannelFormItem isDisabled={!!rule} />
        </Suspense>
        <Form.Item label={t('externalNotification.Enabled')} name="enabled">
          <BAISwitch aria-label={t('externalNotification.Enabled')} />
        </Form.Item>
        <RuleTypeDependentItems />
        {rule ? null : (
          <BAIText type="secondary">
            {t('externalNotification.TestAfterSave')}
          </BAIText>
        )}
      </Form>
    </BAIModal>
  );
};

export default NotificationRuleSettingModal;
