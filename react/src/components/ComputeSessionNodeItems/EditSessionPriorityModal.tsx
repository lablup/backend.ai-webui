/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { EditSessionPriorityModalFragment$key } from '../../__generated__/EditSessionPriorityModalFragment.graphql';
import { EditSessionPriorityModalMutation } from '../../__generated__/EditSessionPriorityModalMutation.graphql';
import { App, Form, FormInstance, InputNumber, Typography } from 'antd';
import {
  BAIBulkEditFormItem,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAITagList,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

const SESSION_PRIORITY_MIN = 0;
const SESSION_PRIORITY_MAX = 100;
// Matches the manager's SESSION_PRIORITY_DEFAULT; the column is non-null
// server-side, so this only guards the fragment's nullable typing.
const SESSION_PRIORITY_DEFAULT = 10;

interface EditSessionPriorityModalProps extends BAIModalProps {
  sessionFrgmts: EditSessionPriorityModalFragment$key | null;
  onRequestClose: (success?: boolean) => void;
}

const EditSessionPriorityModal: React.FC<EditSessionPriorityModalProps> = ({
  sessionFrgmts,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance>(null);

  const sessions = useFragment(
    graphql`
      fragment EditSessionPriorityModalFragment on ComputeSessionNode
      @relay(plural: true) {
        id @required(action: NONE)
        name
        priority @since(version: "24.09.0")
      }
    `,
    sessionFrgmts,
  );
  const filteredSessions = filterOutNullAndUndefined(sessions ?? []);
  const isBulkEdit = filteredSessions.length > 1;

  const [commitModifySessionPriority, isInFlight] =
    useMutation<EditSessionPriorityModalMutation>(graphql`
      mutation EditSessionPriorityModalMutation(
        $input: ModifyComputeSessionInput!
      ) {
        modify_compute_session(input: $input) {
          item {
            id
            priority @since(version: "24.09.0")
          }
        }
      }
    `);

  const commitOne = (id: string, priority: number) =>
    new Promise<void>((resolve, reject) => {
      commitModifySessionPriority({
        variables: {
          input: {
            id,
            priority,
          },
        },
        onCompleted(res, errors) {
          if (!res?.modify_compute_session?.item || errors) {
            reject(new Error(errors?.[0]?.message));
          } else {
            resolve();
          }
        },
        onError: reject,
      });
    });

  const handleOk = () => {
    return formRef.current
      ?.validateFields()
      .then((values) => {
        // `undefined` means "Keep as is" in bulk mode — nothing to commit.
        if (filteredSessions.length === 0 || _.isUndefined(values.priority)) {
          onRequestClose();
          return;
        }
        return Promise.allSettled(
          filteredSessions.map((session) =>
            commitOne(session.id, values.priority),
          ),
        ).then((results) => {
          const { fulfilled, rejected } = _.groupBy(
            results,
            (result) => result.status,
          );
          if (!_.isEmpty(rejected)) {
            message.error(t('session.FailToUpdatePriority'));
            // Keep the modal open so the user can retry the failed sessions.
            return;
          }
          if (!_.isEmpty(fulfilled)) {
            message.success(t('session.PrioritySuccessfullyUpdated'));
          }
          onRequestClose(true);
        });
      })
      .catch(() => {
        // Keep the modal open when form validation rejects.
      });
  };

  return (
    <BAIModal
      title={t('session.EditPriority')}
      okText={t('button.Save')}
      onOk={handleOk}
      onCancel={() => onRequestClose()}
      confirmLoading={isInFlight}
      destroyOnHidden
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <Form
          ref={formRef}
          layout="vertical"
          preserve={false}
          initialValues={{
            // Bulk edit starts in "Keep as is" (undefined) so unchanged
            // sessions are excluded from submission.
            priority: isBulkEdit
              ? undefined
              : (filteredSessions[0]?.priority ?? SESSION_PRIORITY_DEFAULT),
          }}
        >
          <Form.Item label={t('session.SessionName')}>
            {isBulkEdit ? (
              <BAITagList
                items={_.map(
                  filteredSessions,
                  (session) => session.name || session.id,
                )}
              />
            ) : (
              <Typography.Text>{filteredSessions[0]?.name}</Typography.Text>
            )}
          </Form.Item>
          {isBulkEdit ? (
            <BAIBulkEditFormItem label={t('session.Priority')} name="priority">
              <InputNumber
                min={SESSION_PRIORITY_MIN}
                max={SESSION_PRIORITY_MAX}
                style={{ width: '100%' }}
              />
            </BAIBulkEditFormItem>
          ) : (
            <Form.Item
              label={t('session.Priority')}
              name="priority"
              rules={[
                {
                  required: true,
                  message: t('data.explorer.ValueRequired'),
                },
              ]}
            >
              <InputNumber
                min={SESSION_PRIORITY_MIN}
                max={SESSION_PRIORITY_MAX}
                style={{ width: '100%' }}
              />
            </Form.Item>
          )}
        </Form>
      </BAIFlex>
    </BAIModal>
  );
};

export default EditSessionPriorityModal;
