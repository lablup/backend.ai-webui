/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  CreatePermissionModalCreateMutation,
  type OperationType,
  type RBACElementType,
} from '../__generated__/CreatePermissionModalCreateMutation.graphql';
import { CreatePermissionModalDomainQuery } from '../__generated__/CreatePermissionModalDomainQuery.graphql';
import { CreatePermissionModalResourceGroupQuery } from '../__generated__/CreatePermissionModalResourceGroupQuery.graphql';
import { CreatePermissionModalUpdateMutation } from '../__generated__/CreatePermissionModalUpdateMutation.graphql';
import { App, Form, Select, type SelectProps } from 'antd';
import {
  BAIAdminResourceGroupSelect,
  BAIArtifactRevisionSelect,
  BAIContainerRegistrySelect,
  BAIModal,
  BAIModalProps,
  BAIProjectSelect,
  BAIRoleSelect,
  BAIUserSelect,
  BAIVFolderSelect,
  useBAILogger,
} from 'backend.ai-ui';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

const RBAC_ELEMENT_TYPES: ReadonlyArray<RBACElementType> = [
  // Scope ID select implemented
  'DOMAIN',
  'PROJECT',
  'USER',
  'VFOLDER',
  'RESOURCE_GROUP',
  'CONTAINER_REGISTRY',
  'ARTIFACT_REVISION',
  'ROLE',
  // TODO: Scope ID select to be implemented in separate stacks
  // 'SESSION',
  // 'DEPLOYMENT',
  // 'MODEL_DEPLOYMENT',
  // 'KEYPAIR',
  // 'STORAGE_HOST',
  // 'IMAGE',
  // 'ARTIFACT',
  // 'ARTIFACT_REGISTRY',
  // 'RESOURCE_PRESET',
  // 'USER_RESOURCE_POLICY',
  // 'KEYPAIR_RESOURCE_POLICY',
  // 'PROJECT_RESOURCE_POLICY',
  // TODO: No management UI in WebUI yet
  // 'NOTIFICATION_CHANNEL',
  // 'NETWORK',
  // 'SESSION_TEMPLATE',
  // 'APP_CONFIG',
  // 'AUDIT_LOG',
  // 'EVENT_LOG',
  // 'NOTIFICATION_RULE',
];

const DIRECT_OPERATIONS: ReadonlyArray<OperationType> = [
  'CREATE',
  'READ',
  'UPDATE',
  'SOFT_DELETE',
  'HARD_DELETE',
];

const DELEGATE_OPERATIONS: ReadonlyArray<OperationType> = [
  'GRANT_ALL',
  'GRANT_READ',
  'GRANT_UPDATE',
  'GRANT_SOFT_DELETE',
  'GRANT_HARD_DELETE',
];

interface ScopeIdSelectProps extends SelectProps {
  scopeType?: string;
}

const DomainScopeIdSelect: React.FC<SelectProps> = (props) => {
  'use memo';
  const { domains } = useLazyLoadQuery<CreatePermissionModalDomainQuery>(
    graphql`
      query CreatePermissionModalDomainQuery($is_active: Boolean) {
        domains(is_active: $is_active) {
          name
        }
      }
    `,
    { is_active: true },
    { fetchPolicy: 'store-and-network' },
  );
  return (
    <Select
      showSearch
      {...props}
      options={[
        { value: '*', label: '* (All)' },
        ...(domains?.map((d) => ({ value: d?.name ?? '', label: d?.name })) ??
          []),
      ]}
    />
  );
};

const ResourceGroupScopeIdSelect: React.FC<Omit<SelectProps, 'options'>> = (
  props,
) => {
  'use memo';
  const queryRef = useLazyLoadQuery<CreatePermissionModalResourceGroupQuery>(
    graphql`
      query CreatePermissionModalResourceGroupQuery {
        ...BAIAdminResourceGroupSelect_resourceGroupsFragment
      }
    `,
    {},
    { fetchPolicy: 'store-and-network' },
  );
  return <BAIAdminResourceGroupSelect queryRef={queryRef} {...props} />;
};

const ScopeIdSelect: React.FC<ScopeIdSelectProps> = ({
  scopeType,
  ...selectProps
}) => {
  'use memo';
  if (scopeType === 'DOMAIN') {
    return (
      <Suspense fallback={<Select {...selectProps} loading disabled />}>
        <DomainScopeIdSelect {...selectProps} />
      </Suspense>
    );
  }
  if (scopeType === 'PROJECT') {
    return (
      <Suspense fallback={<Select {...selectProps} loading disabled />}>
        <BAIProjectSelect
          placeholder={selectProps.placeholder}
          value={selectProps.value as string | undefined}
          onChange={(val, option) => selectProps.onChange?.(val as any, option)}
        />
      </Suspense>
    );
  }
  if (scopeType === 'USER') {
    return (
      <Suspense fallback={<Select {...selectProps} loading disabled />}>
        <BAIUserSelect
          placeholder={selectProps.placeholder}
          value={selectProps.value as string | undefined}
          onChange={(val, option) => selectProps.onChange?.(val as any, option)}
        />
      </Suspense>
    );
  }
  if (scopeType === 'VFOLDER') {
    return (
      <Suspense fallback={<Select {...selectProps} loading disabled />}>
        <BAIVFolderSelect
          placeholder={selectProps.placeholder}
          value={selectProps.value as string | undefined}
          onChange={(val, option) => selectProps.onChange?.(val as any, option)}
        />
      </Suspense>
    );
  }
  if (scopeType === 'RESOURCE_GROUP') {
    return (
      <Suspense fallback={<Select {...selectProps} loading disabled />}>
        <ResourceGroupScopeIdSelect {...selectProps} />
      </Suspense>
    );
  }
  if (scopeType === 'CONTAINER_REGISTRY') {
    return (
      <Suspense fallback={<Select {...selectProps} loading disabled />}>
        <BAIContainerRegistrySelect
          placeholder={selectProps.placeholder}
          value={selectProps.value as string | undefined}
          onChange={(val, option) => selectProps.onChange?.(val as any, option)}
        />
      </Suspense>
    );
  }
  if (scopeType === 'ARTIFACT_REVISION') {
    return (
      <Suspense fallback={<Select {...selectProps} loading disabled />}>
        <BAIArtifactRevisionSelect
          placeholder={selectProps.placeholder}
          value={selectProps.value as string | undefined}
          onChange={(val, option) => selectProps.onChange?.(val as any, option)}
        />
      </Suspense>
    );
  }
  if (scopeType === 'ROLE') {
    return (
      <Suspense fallback={<Select {...selectProps} loading disabled />}>
        <BAIRoleSelect
          placeholder={selectProps.placeholder}
          value={selectProps.value as string | undefined}
          onChange={(val, option) => selectProps.onChange?.(val as any, option)}
        />
      </Suspense>
    );
  }
  return (
    <Select
      showSearch
      {...selectProps}
      disabled={!scopeType || selectProps.disabled}
      options={[{ value: '*', label: '* (All)' }]}
    />
  );
};

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
  const watchedScopeType = Form.useWatch('scopeType', form);
  const watchedScopeId = Form.useWatch('scopeId', form);
  const watchedEntityType = Form.useWatch('entityType', form);

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
    return form.validateFields().then((values) => {
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
                logger.error(errors[0]);
                message.error(errors[0]?.message || t('general.ErrorOccurred'));
                reject();
                return;
              }
              message.success(t('rbac.PermissionUpdated'));
              onRequestClose(true);
              resolve();
            },
            onError: (error) => {
              logger.error(error);
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
        }
      });
    });
  };

  return (
    <BAIModal
      title={isEditMode ? t('rbac.EditPermission') : t('rbac.CreatePermission')}
      okText={isEditMode ? t('button.Save') : t('button.Add')}
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
      confirmLoading={isCreateInFlight || isUpdateInFlight}
      destroyOnClose
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
        onValuesChange={(changedValues) => {
          if ('scopeType' in changedValues) {
            form.setFieldsValue({
              scopeId: undefined,
              entityType: undefined,
              operation: undefined,
            });
          } else if ('scopeId' in changedValues) {
            form.setFieldsValue({
              entityType: undefined,
              operation: undefined,
            });
          } else if ('entityType' in changedValues) {
            form.setFieldsValue({ operation: undefined });
          }
        }}
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
          <ScopeIdSelect
            scopeType={watchedScopeType}
            placeholder={t('rbac.ScopeId')}
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
            disabled={!watchedScopeId}
            placeholder={t('rbac.EntityType')}
            options={RBAC_ELEMENT_TYPES.map((type) => ({
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
            disabled={!watchedEntityType}
            placeholder={t('rbac.Operation')}
            options={[
              {
                label: t('rbac.operationGroups.Direct'),
                options: DIRECT_OPERATIONS.map((type) => ({
                  value: type,
                  label: t(`rbac.operations.${type}`, { defaultValue: type }),
                })),
              },
              {
                label: t('rbac.operationGroups.Delegate'),
                options: DELEGATE_OPERATIONS.map((type) => ({
                  value: type,
                  label: t(`rbac.operations.${type}`, { defaultValue: type }),
                })),
              },
            ]}
          />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default CreatePermissionModal;
