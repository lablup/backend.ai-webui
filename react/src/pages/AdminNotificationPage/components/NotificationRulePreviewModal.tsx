/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { NotificationRulePreviewModalSchemaQuery } from '../../../__generated__/NotificationRulePreviewModalSchemaQuery.graphql';
import { NotificationRulePreviewModalValidateMutation } from '../../../__generated__/NotificationRulePreviewModalValidateMutation.graphql';
import { NotificationRuleType } from '../../../__generated__/NotificationRuleSettingModalCreateMutation.graphql';
import { App } from '../../../app-shim';
import { Form, FormInstance } from '../../../form-engine';
import {
  buildSampleNotificationData,
  getTemplateVariables,
} from '../helper/notificationRuleTemplate';
import { BAIModal, BAISkeleton, BAITextArea } from 'backend.ai-ui';
import React, { Suspense, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

export type PreviewRule = {
  entityId: string;
  name: string;
  ruleType: NotificationRuleType;
};

interface NotificationRulePreviewModalProps {
  rule: PreviewRule | null;
  onRequestClose: () => void;
}

const PreviewForm: React.FC<{
  rule: PreviewRule;
  formRef: React.RefObject<FormInstance<{ data: string }> | null>;
  renderedMessage: string | null;
}> = ({ rule, formRef, renderedMessage }) => {
  'use memo';
  const { t } = useTranslation();
  const { notificationRuleTypeSchema } =
    useLazyLoadQuery<NotificationRulePreviewModalSchemaQuery>(
      graphql`
        query NotificationRulePreviewModalSchemaQuery(
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
    >
      <Form.Item
        label={t('externalNotification.SampleEventData')}
        name="data"
        extra={t('externalNotification.SampleEventDataExtra')}
        rules={[
          {
            validator: (_rule, value?: string) => {
              try {
                JSON.parse(value ?? '');
                return Promise.resolve();
              } catch {
                return Promise.reject(t('externalNotification.InvalidJson'));
              }
            },
          },
        ]}
      >
        <BAITextArea
          aria-label={t('externalNotification.SampleEventData')}
          rows={8}
        />
      </Form.Item>
      {renderedMessage !== null ? (
        <Form.Item label={t('externalNotification.RenderedMessage')}>
          <BAITextArea
            aria-label={t('externalNotification.RenderedMessage')}
            value={renderedMessage}
            rows={5}
            isReadOnly
          />
        </Form.Item>
      ) : null}
    </Form>
  );
};

const NotificationRulePreviewModal: React.FC<
  NotificationRulePreviewModalProps
> = ({ rule, onRequestClose }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance<{ data: string }>>(null);
  const [renderedMessage, setRenderedMessage] = useState<string | null>(null);

  const [commitValidate, isInFlight] =
    useMutation<NotificationRulePreviewModalValidateMutation>(graphql`
      mutation NotificationRulePreviewModalValidateMutation(
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
        commitValidate({
          variables: {
            input: { id: rule.entityId, notificationData: JSON.parse(data) },
          },
          onCompleted: (res, errors) => {
            if (errors && errors.length > 0) {
              message.error(errors[0]?.message || t('general.ErrorOccurred'));
              return;
            }
            setRenderedMessage(
              res.adminValidateNotificationRule?.message ?? '',
            );
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
      title={t('externalNotification.PreviewMessageOf', {
        name: rule?.name ?? '',
      })}
      okText={t('externalNotification.Render')}
      cancelText={t('button.Close')}
      confirmLoading={isInFlight}
      onOk={handleOk}
      onCancel={() => {
        setRenderedMessage(null);
        onRequestClose();
      }}
    >
      {rule ? (
        <Suspense fallback={<BAISkeleton rows={6} />}>
          <PreviewForm
            rule={rule}
            formRef={formRef}
            renderedMessage={renderedMessage}
          />
        </Suspense>
      ) : null}
    </BAIModal>
  );
};

export default NotificationRulePreviewModal;
