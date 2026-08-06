/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { EditSessionPriorityModalFragment$key } from '../../__generated__/EditSessionPriorityModalFragment.graphql';
import { EditSessionPriorityModalMutation } from '../../__generated__/EditSessionPriorityModalMutation.graphql';
import { App, Form, FormInstance, InputNumber, Typography } from 'antd';
import { BAIModal, BAIModalProps, BAIFlex } from 'backend.ai-ui';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

const SESSION_PRIORITY_MIN = 0;
const SESSION_PRIORITY_MAX = 100;
// Matches the manager's SESSION_PRIORITY_DEFAULT; the column is non-null
// server-side, so this only guards the fragment's nullable typing.
const SESSION_PRIORITY_DEFAULT = 10;

interface EditSessionPriorityModalProps extends BAIModalProps {
  sessionFrgmt: EditSessionPriorityModalFragment$key | null;
  onRequestClose: (success?: boolean) => void;
}

const EditSessionPriorityModal: React.FC<EditSessionPriorityModalProps> = ({
  sessionFrgmt,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance>(null);

  const session = useFragment(
    graphql`
      fragment EditSessionPriorityModalFragment on ComputeSessionNode {
        id @required(action: NONE)
        name
        priority @since(version: "24.09.0")
      }
    `,
    sessionFrgmt,
  );

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

  const handleOk = () => {
    return formRef.current
      ?.validateFields()
      .then((values) => {
        if (!session) {
          onRequestClose();
          return;
        }
        commitModifySessionPriority({
          variables: {
            input: {
              id: session.id,
              priority: values.priority,
            },
          },
          onCompleted(res, errors) {
            if (!res?.modify_compute_session?.item || errors) {
              message.error(t('session.FailToUpdatePriority'));
              return;
            }
            message.success(t('session.PrioritySuccessfullyUpdated'));
            onRequestClose(true);
          },
          onError(error) {
            message.error(error?.message || t('session.FailToUpdatePriority'));
          },
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
            priority: session?.priority ?? SESSION_PRIORITY_DEFAULT,
          }}
        >
          <Form.Item label={t('session.SessionName')}>
            <Typography.Text>{session?.name}</Typography.Text>
          </Form.Item>
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
        </Form>
      </BAIFlex>
    </BAIModal>
  );
};

export default EditSessionPriorityModal;
