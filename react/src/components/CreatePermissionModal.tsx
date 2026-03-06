/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { CreatePermissionModalCombinationsQuery } from '../__generated__/CreatePermissionModalCombinationsQuery.graphql';
import { CreatePermissionModalCreateMutation } from '../__generated__/CreatePermissionModalCreateMutation.graphql';
import { CreatePermissionModalUpdateMutation } from '../__generated__/CreatePermissionModalUpdateMutation.graphql';
import { App, Form, Select } from 'antd';
import { BAIModal, BAIModalProps, useBAILogger } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

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
  const { logger } = useBAILogger();
  const [form] = Form.useForm();
  const isEditMode = !!editingPermission;

  const { rbacScopeEntityCombinations } =
    useLazyLoadQuery<CreatePermissionModalCombinationsQuery>(
      graphql`
        query CreatePermissionModalCombinationsQuery {
          rbacScopeEntityCombinations {
            scopeType
            validEntityTypes
          }
        }
      `,
      {},
      { fetchPolicy: 'store-and-network' },
    );

  // Scope types available: intersection of UI-supported types and backend-reported types
  const availableScopeTypes = RBAC_ELEMENT_TYPES.filter((type) =>
    rbacScopeEntityCombinations?.some((c) => c.scopeType === type),
  );

  // Entity types valid for the currently selected scope type
  const watchedScopeType = Form.useWatch('scopeType', form);
  const validEntityTypes = watchedScopeType
    ? (rbacScopeEntityCombinations?.find(
        (c) => c.scopeType === watchedScopeType,
      )?.validEntityTypes ?? [])
    : [];

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
    return form
      .validateFields()
      .then((values) => {
        return new Promise<void>(() => {
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
                  logger.error(errors[0]);
                  message.error(
                    errors[0]?.message || t('general.ErrorOccurred'),
                  );
                  return;
                }
                message.success(t('rbac.PermissionUpdated'));
                onRequestClose(true);
              },
              onError: (error) => {
                logger.error(error);
                message.error(error?.message || t('general.ErrorOccurred'));
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
                    return;
                  }
                  logger.error(errors[0]);
                  message.error(errorMessage || t('general.ErrorOccurred'));
                  return;
                }
                message.success(t('rbac.PermissionCreated'));
                onRequestClose(true);
              },
              onError: (error) => {
                const errorMessage = error?.message || '';
                if (isDuplicateError(errorMessage)) {
                  message.error(t('rbac.DuplicatePermission'));
                } else {
                  logger.error(error);
                  message.error(errorMessage || t('general.ErrorOccurred'));
                }
              },
            });
          }
        });
      })
      .catch((err) => logger.error('Validation Failed:', err));
  };

  return (
    <BAIModal
      title={isEditMode ? t('rbac.EditPermission') : t('rbac.CreatePermission')}
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
      confirmLoading={isCreateInFlight || isUpdateInFlight}
      destroyOnHidden
      {...baiModalProps}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        preserve={false}
        initialValues={
          editingPermission
            ? {
                scopeType: editingPermission.scopeType,
                scopeId: editingPermission.scopeId,
                entityType: editingPermission.entityType,
                operation: editingPermission.operation,
              }
            : undefined
        }
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
            options={availableScopeTypes.map((type) => ({
              value: type,
              label: t(`rbac.types.${type}`, { defaultValue: type }),
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
            options={validEntityTypes.map((type) => ({
              value: type,
              label: t(`rbac.types.${type}`, { defaultValue: type }),
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
