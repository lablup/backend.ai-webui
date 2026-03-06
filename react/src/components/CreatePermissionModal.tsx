/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { CreatePermissionModalCreateMutation } from '../__generated__/CreatePermissionModalCreateMutation.graphql';
import { CreatePermissionModalUpdateMutation } from '../__generated__/CreatePermissionModalUpdateMutation.graphql';
import { App, Form, type FormInstance, Select } from 'antd';
import { BAIModal, BAIModalProps } from 'backend.ai-ui';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation } from 'react-relay';

const RBAC_ELEMENT_TYPES = [
  'DOMAIN',
  'PROJECT',
  'USER',
  'SESSION',
  'VFOLDER',
  'DEPLOYMENT',
  'MODEL_DEPLOYMENT',
  'KEYPAIR',
  'NOTIFICATION_CHANNEL',
  'NETWORK',
  'RESOURCE_GROUP',
  'CONTAINER_REGISTRY',
  'STORAGE_HOST',
  'IMAGE',
  'ARTIFACT',
  'ARTIFACT_REGISTRY',
  'SESSION_TEMPLATE',
  'APP_CONFIG',
  'RESOURCE_PRESET',
  'USER_RESOURCE_POLICY',
  'KEYPAIR_RESOURCE_POLICY',
  'PROJECT_RESOURCE_POLICY',
  'ROLE',
  'AUDIT_LOG',
  'EVENT_LOG',
  'NOTIFICATION_RULE',
  'ARTIFACT_REVISION',
] as const;

const OPERATION_TYPES = [
  'CREATE',
  'READ',
  'UPDATE',
  'SOFT_DELETE',
  'HARD_DELETE',
  'GRANT_ALL',
  'GRANT_READ',
  'GRANT_UPDATE',
  'GRANT_SOFT_DELETE',
  'GRANT_HARD_DELETE',
] as const;

interface EditingPermission {
  id: string;
  scopeType: string;
  scopeId: string;
  entityType: string;
  operation: string;
}

interface CreatePermissionModalProps extends BAIModalProps {
  roleId: string;
  editingPermission?: EditingPermission | null;
  onRequestClose: (success: boolean) => void;
}

const CreatePermissionModal: React.FC<CreatePermissionModalProps> = ({
  roleId,
  editingPermission,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance>(null);
  const isEditMode = !!editingPermission;

  useEffect(() => {
    if (baiModalProps.open && editingPermission) {
      formRef.current?.setFieldsValue({
        scopeType: editingPermission.scopeType,
        scopeId: editingPermission.scopeId,
        entityType: editingPermission.entityType,
        operation: editingPermission.operation,
      });
    }
  }, [baiModalProps.open, editingPermission]);

  const [commitCreatePermission, isCreateInFlight] =
    useMutation<CreatePermissionModalCreateMutation>(graphql`
      mutation CreatePermissionModalCreateMutation(
        $input: CreatePermissionInput!
      ) {
        adminCreatePermission(input: $input) {
          id
          scopeType
          scopeId
          entityType
          operation
        }
      }
    `);

  const [commitUpdatePermission, isUpdateInFlight] =
    useMutation<CreatePermissionModalUpdateMutation>(graphql`
      mutation CreatePermissionModalUpdateMutation(
        $input: UpdatePermissionInput!
      ) {
        adminUpdatePermission(input: $input) {
          id
          scopeType
          scopeId
          entityType
          operation
        }
      }
    `);

  const isDuplicateError = (errorMessage: string) => {
    return (
      errorMessage.includes('409') ||
      errorMessage.toLowerCase().includes('duplicate') ||
      errorMessage.toLowerCase().includes('already exists')
    );
  };

  const handleOk = () => {
    return formRef.current?.validateFields().then((values) => {
      return new Promise<void>((resolve, reject) => {
        if (isEditMode) {
          commitUpdatePermission({
            variables: {
              input: {
                id: editingPermission.id,
                scopeType: values.scopeType,
                scopeId: values.scopeId,
                entityType: values.entityType,
                operation: values.operation,
              },
            },
            onCompleted: (_data, errors) => {
              if (errors && errors.length > 0) {
                message.error(errors[0]?.message || t('general.ErrorOccurred'));
                reject();
                return;
              }
              message.success(t('rbac.PermissionUpdated'));
              onRequestClose(true);
              resolve();
            },
            onError: (error) => {
              message.error(error?.message || t('general.ErrorOccurred'));
              reject();
            },
          });
        } else {
          commitCreatePermission({
            variables: {
              input: {
                roleId,
                scopeType: values.scopeType,
                scopeId: values.scopeId,
                entityType: values.entityType,
                operation: values.operation,
              },
            },
            onCompleted: (_data, errors) => {
              if (errors && errors.length > 0) {
                const errorMessage = errors[0]?.message || '';
                if (isDuplicateError(errorMessage)) {
                  message.error(t('rbac.DuplicatePermission'));
                  reject();
                  return;
                }
                message.error(errorMessage || t('general.ErrorOccurred'));
                reject();
                return;
              }
              message.success(t('rbac.PermissionCreated'));
              onRequestClose(true);
              resolve();
            },
            onError: (error) => {
              const errorMessage = error?.message || '';
              if (isDuplicateError(errorMessage)) {
                message.error(t('rbac.DuplicatePermission'));
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
      title={isEditMode ? t('rbac.EditPermission') : t('rbac.CreatePermission')}
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
      confirmLoading={isCreateInFlight || isUpdateInFlight}
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
          name="scopeType"
          label={t('rbac.ScopeType')}
          rules={[
            {
              required: true,
              message: t('general.ValueRequired', {
                name: t('rbac.ScopeType'),
              }),
            },
          ]}
        >
          <Select
            showSearch
            placeholder={t('rbac.ScopeType')}
            options={RBAC_ELEMENT_TYPES.map((type) => ({
              value: type,
              label: type,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="scopeId"
          label={t('rbac.ScopeId')}
          rules={[
            {
              required: true,
              message: t('general.ValueRequired', { name: t('rbac.ScopeId') }),
            },
          ]}
        >
          <Select
            showSearch
            placeholder={t('rbac.ScopeId')}
            options={[{ value: '*', label: '* (All)' }]}
          />
        </Form.Item>
        <Form.Item
          name="entityType"
          label={t('rbac.EntityType')}
          rules={[
            {
              required: true,
              message: t('general.ValueRequired', {
                name: t('rbac.EntityType'),
              }),
            },
          ]}
        >
          <Select
            showSearch
            placeholder={t('rbac.EntityType')}
            options={RBAC_ELEMENT_TYPES.map((type) => ({
              value: type,
              label: type,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="operation"
          label={t('rbac.Operation')}
          rules={[
            {
              required: true,
              message: t('general.ValueRequired', {
                name: t('rbac.Operation'),
              }),
            },
          ]}
        >
          <Select
            showSearch
            placeholder={t('rbac.Operation')}
            options={OPERATION_TYPES.map((type) => ({
              value: type,
              label: type,
            }))}
          />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default CreatePermissionModal;
