/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { NotificationRuleType } from '../../../__generated__/NotificationRuleSettingModalCreateMutation.graphql';
import { NotificationRuleTestModalSchemaQuery } from '../../../__generated__/NotificationRuleTestModalSchemaQuery.graphql';
import { NotificationRuleTestModalValidateMutation } from '../../../__generated__/NotificationRuleTestModalValidateMutation.graphql';
import { App } from '../../../app-shim';
import BAIErrorBoundary from '../../../components/BAIErrorBoundary';
import { Form, FormInstance } from '../../../form-engine';
import {
  buildSampleNotificationData,
  getTemplateVariables,
} from '../helper/notificationRuleTemplate';
import './NotificationRuleTestModal.css';
import { BAIAlert, BAIModal, BAISkeleton, BAITextArea } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { Suspense, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

export type TestRule = {
  entityId: string;
  name: string;
  ruleType: NotificationRuleType;
  channelName: string;
};

interface NotificationRuleTestModalProps {
  rule: TestRule | null;
  onRequestClose: () => void;
}

const TestForm: React.FC<{
  rule: TestRule;
  formRef: React.RefObject<FormInstance<{ data: string }> | null>;
  sentMessage: string | null;
  onDataChange: () => void;
}> = ({ rule, formRef, sentMessage, onDataChange }) => {
  'use memo';
  const { t } = useTranslation();
  const { notificationRuleTypeSchema } =
    useLazyLoadQuery<NotificationRuleTestModalSchemaQuery>(
      graphql`
        query NotificationRuleTestModalSchemaQuery(
          $ruleType: NotificationRuleType!
        ) {
          notificationRuleTypeSchema(ruleType: $ruleType)
        }
      `,
      { ruleType: rule.ruleType },
      { fetchPolicy: 'store-or-network' },
    );
  const sampleData = buildSampleNotificationData(
    getTemplateVariables(notificationRuleTypeSchema),
  );

  return (
    <Form
      ref={formRef}
      layout="vertical"
      initialValues={{ data: JSON.stringify(sampleData, null, 2) }}
      onValuesChange={onDataChange}
    >
      <BAIAlert
        type="warning"
        showIcon
        className="notification-rule-test-alert"
        description={t('externalNotification.TestNotificationSendsTo', {
          channel: rule.channelName,
        })}
      />
      <Form.Item
        label={t('externalNotification.SampleEventData')}
        name="data"
        extra={t('externalNotification.SampleEventDataExtra')}
        rules={[
          {
            validator: (_rule, value?: string) => {
              try {
                // The manager takes an object keyed like the event's schema.
                if (_.isPlainObject(JSON.parse(value ?? ''))) {
                  return Promise.resolve();
                }
              } catch {
                // reported below
              }
              return Promise.reject(t('externalNotification.InvalidJson'));
            },
          },
        ]}
      >
        <BAITextArea
          aria-label={t('externalNotification.SampleEventData')}
          rows={8}
        />
      </Form.Item>
      {sentMessage !== null ? (
        <Form.Item label={t('externalNotification.SentMessage')}>
          <BAITextArea
            aria-label={t('externalNotification.SentMessage')}
            value={sentMessage}
            rows={5}
            isReadOnly
          />
        </Form.Item>
      ) : null}
    </Form>
  );
};

const NotificationRuleTestModal: React.FC<NotificationRuleTestModalProps> = ({
  rule,
  onRequestClose,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance<{ data: string }>>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const [commitValidate, isInFlight] =
    useMutation<NotificationRuleTestModalValidateMutation>(graphql`
      mutation NotificationRuleTestModalValidateMutation(
        $input: ValidateNotificationRuleInput!
      ) {
        adminValidateNotificationRule(input: $input) {
          message
        }
      }
    `);

  const handleOk = () =>
    formRef.current
      ?.validateFields()
      .then(({ data }) => {
        if (!rule) return;
        setSentMessage(null);
        commitValidate({
          variables: {
            input: { id: rule.entityId, notificationData: JSON.parse(data) },
          },
          onCompleted: (res, errors) => {
            if (errors && errors.length > 0) {
              message.error(errors[0]?.message || t('general.ErrorOccurred'));
              return;
            }
            message.success(
              t('externalNotification.TestNotificationSent', {
                channel: rule.channelName,
              }),
            );
            setSentMessage(res.adminValidateNotificationRule?.message ?? '');
          },
          onError: (error) => {
            message.error(error?.message || t('general.ErrorOccurred'));
          },
        });
      })
      .catch(() => {});

  return (
    <BAIModal
      open={!!rule}
      centered
      unmountOnClose
      width={640}
      title={t('externalNotification.SendTestNotificationTo', {
        name: rule?.name ?? '',
      })}
      okText={t('externalNotification.Send')}
      cancelText={t('button.Close')}
      confirmLoading={isInFlight}
      onOk={handleOk}
      onCancel={() => {
        setSentMessage(null);
        onRequestClose();
      }}
    >
      {rule ? (
        <BAIErrorBoundary>
          <Suspense fallback={<BAISkeleton rows={6} />}>
            <TestForm
              rule={rule}
              formRef={formRef}
              sentMessage={sentMessage}
              onDataChange={() => setSentMessage(null)}
            />
          </Suspense>
        </BAIErrorBoundary>
      ) : null}
    </BAIModal>
  );
};

export default NotificationRuleTestModal;
