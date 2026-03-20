/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleFormModalCreateMutation } from '../__generated__/RoleFormModalCreateMutation.graphql';
import { RoleFormModalFragment$key } from '../__generated__/RoleFormModalFragment.graphql';
import { App, Form, Input } from 'antd';
import { BAIModal, BAIModalProps } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation } from 'react-relay';

// Fragment used by RoleNodes to pre-fetch data for edit mode (wired in PR #5770)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _RoleFormModalFragment = graphql`
  fragment RoleFormModalFragment on Role {
    id
    name
    description
  }
`;

export type { RoleFormModalFragment$key };

export interface RoleFormModalProps extends BAIModalProps {
  onRequestClose: (success: boolean) => void;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const [commitCreateRole, isInFlightCreateRole] =
    useMutation<RoleFormModalCreateMutation>(graphql`
      mutation RoleFormModalCreateMutation($input: CreateRoleInput!) {
        adminCreateRole(input: $input) {
          id
          name
          description
          source
          status
          createdAt
          updatedAt
        }
      }
    `);

  const handleOk = () => {
    return form
      .validateFields()
      .then((values) => {
        return new Promise<void>((resolve, reject) => {
          commitCreateRole({
            variables: {
              input: {
                name: values.name,
                description: values.description || null,
              },
            },
            onCompleted: (_data, errors) => {
              if (errors && errors.length > 0) {
                const errorMessage = errors[0]?.message || '';
                if (
                  errorMessage.includes('409') ||
                  errorMessage.toLowerCase().includes('duplicate') ||
                  errorMessage.toLowerCase().includes('already exists')
                ) {
                  form.setFields([
                    {
                      name: 'name',
                      errors: [t('rbac.DuplicateRoleName')],
                    },
                  ]);
                  reject();
                  return;
                }
                message.error(errorMessage);
                reject();
                return;
              }
              message.success(t('rbac.RoleCreated'));
              onRequestClose(true);
              resolve();
            },
            onError: (error) => {
              const errorMessage = error?.message || '';
              if (
                errorMessage.includes('409') ||
                errorMessage.toLowerCase().includes('duplicate') ||
                errorMessage.toLowerCase().includes('already exists')
              ) {
                form.setFields([
                  {
                    name: 'name',
                    errors: [t('rbac.DuplicateRoleName')],
                  },
                ]);
              } else {
                message.error(errorMessage || t('general.ErrorOccurred'));
              }
              reject();
            },
          });
        });
      })
      .catch(() => {});
  };

  return (
    <BAIModal
      title={t('rbac.CreateRole')}
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
      confirmLoading={isInFlightCreateRole}
      destroyOnHidden
      {...baiModalProps}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        preserve={false}
      >
        <Form.Item
          name="name"
          label={t('rbac.RoleName')}
          rules={[
            {
              required: true,
              message: t('general.ValueRequired', {
                name: t('rbac.RoleName'),
              }),
            },
          ]}
        >
          <Input autoFocus />
        </Form.Item>
        <Form.Item name="description" label={t('rbac.RoleDescription')}>
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default RoleFormModal;
