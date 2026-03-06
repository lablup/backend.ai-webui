/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { CreatePermissionModalMutation } from '../__generated__/CreatePermissionModalMutation.graphql';
import { App, Form, type FormInstance, Select } from 'antd';
import { BAIModal, BAIModalProps, useBAILogger } from 'backend.ai-ui';
import React, { useRef } from 'react';
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

interface CreatePermissionModalProps extends BAIModalProps {
  roleId: string;
  onRequestClose: (success: boolean) => void;
}

const CreatePermissionModal: React.FC<CreatePermissionModalProps> = ({
  roleId,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const formRef = useRef<FormInstance>(null);

  const [commitCreatePermission, isInFlight] =
    useMutation<CreatePermissionModalMutation>(graphql`
      mutation CreatePermissionModalMutation($input: CreatePermissionInput!) {
        adminCreatePermission(input: $input) {
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
              logger.error(errors[0]);
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
              logger.error(error);
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
      title={t('rbac.CreatePermission')}
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
      confirmLoading={isInFlight}
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
