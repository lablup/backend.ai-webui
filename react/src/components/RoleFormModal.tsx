/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleFormModalCreateMutation } from '../__generated__/RoleFormModalCreateMutation.graphql';
import { RoleFormModalUpdateMutation } from '../__generated__/RoleFormModalUpdateMutation.graphql';
import { App, Form, type FormInstance, Input } from 'antd';
import { BAIModal, BAIModalProps } from 'backend.ai-ui';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation } from 'react-relay';

export interface EditingRole {
  id: string;
  name: string;
  description?: string | null;
}

interface RoleFormModalProps extends BAIModalProps {
  editingRole?: EditingRole | null;
  onRequestClose: (success: boolean) => void;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({
  editingRole,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance>(null);

  const isEditMode = !!editingRole;

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

  const [commitUpdateRole, isInFlightUpdateRole] =
    useMutation<RoleFormModalUpdateMutation>(graphql`
      mutation RoleFormModalUpdateMutation($input: UpdateRoleInput!) {
        adminUpdateRole(input: $input) {
          id
          name
          description
          updatedAt
        }
      }
    `);

  useEffect(() => {
    if (baiModalProps.open) {
      if (editingRole) {
        formRef.current?.setFieldsValue({
          name: editingRole.name,
          description: editingRole.description || '',
        });
      }
      setTimeout(() => {
        formRef.current?.getFieldInstance('name')?.focus();
      }, 100);
    } else {
      formRef.current?.resetFields();
    }
  }, [baiModalProps.open, editingRole]);

  const isDuplicateError = (errorMessage: string) => {
    return (
      errorMessage.includes('409') ||
      errorMessage.toLowerCase().includes('duplicate') ||
      errorMessage.toLowerCase().includes('already exists')
    );
  };

  const isNotFoundError = (errorMessage: string) => {
    return (
      errorMessage.includes('404') ||
      errorMessage.toLowerCase().includes('not found')
    );
  };

  const handleOk = () => {
    return formRef.current?.validateFields().then((values) => {
      return new Promise<void>((resolve, reject) => {
        if (isEditMode && editingRole) {
          const changedFields: { name?: string; description?: string | null } =
            {};
          if (values.name !== editingRole.name) {
            changedFields.name = values.name;
          }
          if (
            (values.description || null) !== (editingRole.description || null)
          ) {
            changedFields.description = values.description || null;
          }

          if (Object.keys(changedFields).length === 0) {
            onRequestClose(false);
            resolve();
            return;
          }

          commitUpdateRole({
            variables: {
              input: {
                id: editingRole.id,
                ...changedFields,
              },
            },
            onCompleted: (_data, errors) => {
              if (errors && errors.length > 0) {
                const errorMessage = errors[0]?.message || '';
                if (isDuplicateError(errorMessage)) {
                  formRef.current?.setFields([
                    { name: 'name', errors: [t('rbac.DuplicateRoleName')] },
                  ]);
                  reject();
                  return;
                }
                if (isNotFoundError(errorMessage)) {
                  message.error(t('rbac.RoleNotFound'));
                  onRequestClose(true);
                  resolve();
                  return;
                }
                message.error(errorMessage);
                reject();
                return;
              }
              message.success(t('rbac.RoleUpdated'));
              onRequestClose(true);
              resolve();
            },
            onError: (error) => {
              const errorMessage = error?.message || '';
              if (isDuplicateError(errorMessage)) {
                formRef.current?.setFields([
                  { name: 'name', errors: [t('rbac.DuplicateRoleName')] },
                ]);
              } else if (isNotFoundError(errorMessage)) {
                message.error(t('rbac.RoleNotFound'));
                onRequestClose(true);
              } else {
                message.error(errorMessage || t('general.ErrorOccurred'));
              }
              reject();
            },
          });
        } else {
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
                if (isDuplicateError(errorMessage)) {
                  formRef.current?.setFields([
                    { name: 'name', errors: [t('rbac.DuplicateRoleName')] },
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
              if (isDuplicateError(errorMessage)) {
                formRef.current?.setFields([
                  { name: 'name', errors: [t('rbac.DuplicateRoleName')] },
                ]);
              } else {
                message.error(errorMessage || t('general.ErrorOccurred'));
              }
              reject();
            },
          });
        }
      });
    });
  };

  return (
    <BAIModal
      title={isEditMode ? t('rbac.EditRole') : t('rbac.CreateRole')}
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
      confirmLoading={isInFlightCreateRole || isInFlightUpdateRole}
      destroyOnClose
      {...baiModalProps}
    >
      <Form
        ref={formRef}
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
          <Input />
        </Form.Item>
        <Form.Item name="description" label={t('rbac.RoleDescription')}>
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default RoleFormModal;
