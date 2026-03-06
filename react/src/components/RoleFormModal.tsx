/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleFormModalCreateMutation } from '../__generated__/RoleFormModalCreateMutation.graphql';
import { RoleFormModalFragment$key } from '../__generated__/RoleFormModalFragment.graphql';
import { App, Form, Input } from 'antd';
import {
  BAIModal,
  BAIModalProps,
  toLocalId,
  useBAILogger,
} from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation } from 'react-relay';

interface RoleFormModalProps extends BAIModalProps {
  onRequestClose: (success: boolean) => void;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const [form] = Form.useForm();

  const editingRole = useFragment(
    graphql`
      fragment RoleFormModalFragment on Role {
        id
        name
        description
      }
    `,
    editingRoleFrgmt ?? null,
  );

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

  useEffect(() => {
    if (baiModalProps.open) {
      // Auto-focus name field after modal animation completes
      setTimeout(() => {
        if (editingRole) {
          formRef.current?.setFieldsValue({
            name: editingRole.name,
            description: editingRole.description || '',
          });
        }
        formRef.current?.getFieldInstance('name')?.focus();
      }, 100);
    } else {
      formRef.current?.resetFields();
    }
  }, [baiModalProps.open]);

  const handleOk = () => {
    return form.validateFields().then((values) => {
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
              formRef.current?.setFields([
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
    });
  };

  return (
    <BAIModal
      title={t('rbac.CreateRole')}
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
      confirmLoading={isInFlightCreateRole}
      destroyOnClose
      {...baiModalProps}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        preserve={false}
        initialValues={{
          name: editingRole?.name ?? '',
          description: editingRole?.description ?? '',
        }}
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
