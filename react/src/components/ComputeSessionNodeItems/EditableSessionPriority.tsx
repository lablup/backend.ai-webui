/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { EditableSessionPriorityFragment$key } from '../../__generated__/EditableSessionPriorityFragment.graphql';
import { EditableSessionPriorityMutation } from '../../__generated__/EditableSessionPriorityMutation.graphql';
import { EditOutlined } from '@ant-design/icons';
import { App, Form, InputNumber, Popover, theme, Typography } from 'antd';
import { BAIButton, BAIFlex } from 'backend.ai-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

// Manager's scheduling priority range (0 = lowest, 100 = highest / scheduled first).
const SESSION_PRIORITY_MIN = 0;
const SESSION_PRIORITY_MAX = 100;

interface EditableSessionPriorityProps {
  sessionFrgmt: EditableSessionPriorityFragment$key;
}

// Rendered only in the admin-gated priority column (SessionNodes); the
// modify_compute_session mutation is admin-only server-side as well.
const EditableSessionPriority: React.FC<EditableSessionPriorityProps> = ({
  sessionFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  const session = useFragment(
    graphql`
      fragment EditableSessionPriorityFragment on ComputeSessionNode {
        id
        priority
      }
    `,
    sessionFrgmt,
  );

  const [commitModifyPriority] = useMutation<EditableSessionPriorityMutation>(
    graphql`
      mutation EditableSessionPriorityMutation(
        $input: ModifyComputeSessionInput!
      ) {
        modify_compute_session(input: $input) {
          item {
            id
            priority
          }
        }
      }
    `,
  );

  const priority = session.priority;
  // Nullish coalescing (not `||`) so a valid priority of 0 still renders as 0.
  const displayValue = priority ?? '-';

  const handleSubmit = () => {
    return form.validateFields().then(
      (values) =>
        new Promise<void>((resolve, reject) => {
          commitModifyPriority({
            variables: {
              input: {
                id: session.id,
                priority: values.priority,
              },
            },
            onCompleted: (_response, errors) => {
              if (errors && errors.length > 0) {
                message.error(t('session.FailedToUpdatePriority'));
                reject(errors);
                return;
              }
              message.success(t('session.PriorityUpdated'));
              setOpen(false);
              resolve();
            },
            onError: (error) => {
              message.error(t('session.FailedToUpdatePriority'));
              reject(error);
            },
          });
        }),
      // validation rejected: keep the popover open, swallow the rejection
      () => {},
    );
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottomLeft"
      destroyOnHidden
      title={t('session.EditPriority')}
      content={
        <Form
          form={form}
          layout="inline"
          initialValues={{ priority: priority ?? undefined }}
        >
          <Form.Item
            name="priority"
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
              autoFocus
              style={{ width: 96 }}
            />
          </Form.Item>
          <BAIButton type="primary" action={handleSubmit}>
            {t('button.Save')}
          </BAIButton>
        </Form>
      }
    >
      <BAIFlex
        gap="xxs"
        align="center"
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
      >
        <Typography.Text>{displayValue}</Typography.Text>
        <EditOutlined style={{ color: token.colorTextTertiary }} />
      </BAIFlex>
    </Popover>
  );
};

export default EditableSessionPriority;
