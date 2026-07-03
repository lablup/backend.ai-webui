/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ModifySessionModalFragment$key } from '../../__generated__/ModifySessionModalFragment.graphql';
import { ModifySessionModalMutation } from '../../__generated__/ModifySessionModalMutation.graphql';
import { useValidateSessionName } from '../../hooks/useValidateSessionName';
import SessionNameFormItem from '../SessionNameFormItem';
import { App, Form, InputNumber, type ModalProps } from 'antd';
import {
  BAIBulkEditFormItem,
  BAIModal,
  BAITagList,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

// Manager's scheduling priority range (0 = lowest, 100 = highest / scheduled first).
const SESSION_PRIORITY_MIN = 0;
const SESSION_PRIORITY_MAX = 100;

interface ModifySessionModalProps extends Omit<
  ModalProps,
  'onOk' | 'onCancel'
> {
  sessionFrgmts?: ModifySessionModalFragment$key;
  onRequestClose: (success: boolean) => void;
}

// The modify_compute_session mutation is admin-only server-side.
const ModifySessionModal: React.FC<ModifySessionModalProps> = ({
  sessionFrgmts,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<{ name?: string; priority: number }>();

  const sessions = filterOutNullAndUndefined(
    useFragment(
      graphql`
        fragment ModifySessionModalFragment on ComputeSessionNode
        @relay(plural: true) {
          id @required(action: NONE)
          name
          priority
        }
      `,
      sessionFrgmts,
    ),
  );

  const [commitModifySession, isInFlightModifySession] =
    useMutation<ModifySessionModalMutation>(graphql`
      mutation ModifySessionModalMutation($input: ModifyComputeSessionInput!) {
        modify_compute_session(input: $input) {
          item {
            id
            name
            priority
          }
        }
      }
    `);

  const isBulk = sessions.length > 1;
  const nameValidationRules = useValidateSessionName(sessions[0]?.name);

  const handleOk = () => {
    return form.validateFields().then(
      ({ name, priority }) => {
        // In bulk mode, an undefined priority means "keep as is"
        // (BAIBulkEditFormItem) — nothing to change, so just close.
        if (isBulk && _.isUndefined(priority)) {
          onRequestClose(false);
          return;
        }
        const promises = _.map(
          sessions,
          (session) =>
            new Promise<void>((resolve, reject) => {
              commitModifySession({
                variables: {
                  input: {
                    id: session.id,
                    priority,
                    // Rename applies to single-session edit only, and only
                    // when the name actually changed.
                    ...(!isBulk && name && name !== session.name
                      ? { name }
                      : {}),
                  },
                },
                onCompleted: (_response, errors) => {
                  if (errors && errors.length > 0) {
                    reject(errors);
                    return;
                  }
                  resolve();
                },
                onError: reject,
              });
            }),
        );
        return Promise.allSettled(promises).then((results) => {
          const rejectedCount = _.filter(results, {
            status: 'rejected',
          }).length;
          if (rejectedCount > 0) {
            message.error(t('general.ErrorOccurred'));
          } else {
            message.success(t('environment.SuccessfullyModified'));
          }
          onRequestClose(rejectedCount === 0);
        });
      },
      // validation rejected: keep the modal open, swallow the rejection
      () => {},
    );
  };

  return (
    <BAIModal
      centered
      title={t('session.ModifySession')}
      okText={t('button.Save')}
      confirmLoading={isInFlightModifySession}
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
      {...modalProps}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: isBulk ? undefined : sessions[0]?.name,
          // Nullish coalescing (not `||`) so a valid priority of 0 is kept.
          priority: isBulk ? undefined : (sessions[0]?.priority ?? undefined),
        }}
      >
        {isBulk ? (
          // `required` is display-only here (no rules): it suppresses the
          // "(optional)" label suffix on this read-only field.
          <Form.Item label={t('session.SessionName')} required>
            <BAITagList
              items={_.map(sessions, (session) => session.name || '')}
              popoverTitle={t('session.SessionName')}
            />
          </Form.Item>
        ) : (
          <SessionNameFormItem
            name="name"
            label={t('session.SessionName')}
            rules={nameValidationRules}
          />
        )}
        {isBulk ? (
          <BAIBulkEditFormItem name="priority" label={t('session.Priority')}>
            <InputNumber
              min={SESSION_PRIORITY_MIN}
              max={SESSION_PRIORITY_MAX}
              precision={0}
              style={{ width: '100%' }}
            />
          </BAIBulkEditFormItem>
        ) : (
          <Form.Item
            name="priority"
            label={t('session.Priority')}
            rules={[
              {
                required: true,
                message: t('session.PriorityRequired'),
              },
            ]}
          >
            <InputNumber
              min={SESSION_PRIORITY_MIN}
              max={SESSION_PRIORITY_MAX}
              precision={0}
              style={{ width: '100%' }}
            />
          </Form.Item>
        )}
      </Form>
    </BAIModal>
  );
};

export default ModifySessionModal;
