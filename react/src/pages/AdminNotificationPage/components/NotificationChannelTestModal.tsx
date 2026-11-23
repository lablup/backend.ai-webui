/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { NotificationChannelTestModalValidateMutation } from '../../../__generated__/NotificationChannelTestModalValidateMutation.graphql';
import { App } from '../../../app-shim';
import { Form, FormInstance } from '../../../form-engine';
import { BAIModal, BAITextArea } from 'backend.ai-ui';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation } from 'react-relay';

interface NotificationChannelTestModalProps {
  channel: { entityId: string; name: string } | null;
  onRequestClose: () => void;
}

const NotificationChannelTestModal: React.FC<
  NotificationChannelTestModalProps
> = ({ channel, onRequestClose }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance<{ testMessage: string }>>(null);

  const [commitValidate, isInFlight] =
    useMutation<NotificationChannelTestModalValidateMutation>(graphql`
      mutation NotificationChannelTestModalValidateMutation(
        $input: ValidateNotificationChannelInput!
      ) {
        adminValidateNotificationChannel(input: $input) {
          id
        }
      }
    `);

  const handleOk = () =>
    formRef.current
      ?.validateFields()
      .then(({ testMessage }) => {
        if (!channel) return;
        commitValidate({
          variables: { input: { id: channel.entityId, testMessage } },
          onCompleted: (_res, errors) => {
            if (errors && errors.length > 0) {
              message.error(errors[0]?.message || t('general.ErrorOccurred'));
              return;
            }
            message.success(
              t('externalNotification.TestMessageSent', { name: channel.name }),
            );
            onRequestClose();
          },
          onError: (error) => {
            message.error(error?.message || t('general.ErrorOccurred'));
          },
        });
      })
      .catch(() => {});

  return (
    <BAIModal
      open={!!channel}
      centered
      unmountOnClose
      title={t('externalNotification.SendTestMessageTo', {
        name: channel?.name ?? '',
      })}
      okText={t('externalNotification.Send')}
      confirmLoading={isInFlight}
      onOk={handleOk}
      onCancel={onRequestClose}
    >
      <Form
        ref={formRef}
        layout="vertical"
        initialValues={{
          // The manager posts it as application/json, which Slack and most webhooks parse.
          testMessage: JSON.stringify({
            text: t('externalNotification.DefaultTestMessage'),
          }),
        }}
      >
        <Form.Item
          label={t('externalNotification.TestMessage')}
          name="testMessage"
          extra={t('externalNotification.TestMessageExtra')}
          rules={[{ required: true, whitespace: true }, { max: 5000 }]}
        >
          <BAITextArea
            aria-label={t('externalNotification.TestMessage')}
            rows={3}
          />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default NotificationChannelTestModal;
