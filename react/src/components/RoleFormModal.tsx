/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RBACElementType } from '../__generated__/CreatePermissionModalCreateMutation.graphql';
import { RoleFormModalCreateMutation } from '../__generated__/RoleFormModalCreateMutation.graphql';
import { RoleFormModalDomainQuery } from '../__generated__/RoleFormModalDomainQuery.graphql';
import { RoleFormModalFragment$key } from '../__generated__/RoleFormModalFragment.graphql';
import { RoleFormModalPermissionMatrixQuery } from '../__generated__/RoleFormModalPermissionMatrixQuery.graphql';
import { RoleFormModalResourceGroupQuery } from '../__generated__/RoleFormModalResourceGroupQuery.graphql';
import { RoleFormModalUpdateMutation } from '../__generated__/RoleFormModalUpdateMutation.graphql';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Form, Input, type SelectProps } from 'antd';
import {
  BAIAdminContainerRegistrySelect,
  BAIAdminModelServiceSelect,
  BAIAdminProjectSelect,
  BAIAdminResourceGroupSelect,
  BAIAdminSessionSelect,
  BAIFlex,
  BAIKeypairSelect,
  BAIModal,
  BAIModalProps,
  BAISelect,
  BAIStorageHostSelect,
  BAIUserSelect,
  BAIVFolderSelect,
  toLocalId,
  useBAILogger,
} from 'backend.ai-ui';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from 'react-relay';

// Scope types that have a UI-side scopeId selector implemented.
// Used as the whitelist for both role scope selection and permission scope selection;
// CreatePermissionModal imports this and intersects with rbacPermissionMatrix at usage time.
export const RBAC_ELEMENT_TYPES: ReadonlyArray<RBACElementType> = [
  // Scope ID select implemented
  'DOMAIN',
  'PROJECT',
  'USER',
  'VFOLDER',
  'RESOURCE_GROUP',
  'SESSION',
  'MODEL_DEPLOYMENT',
  'CONTAINER_REGISTRY',
  'STORAGE_HOST',
  'KEYPAIR',
  // TODO: Scope ID select to be implemented in separate stacks
  // 'IMAGE',
  // 'ARTIFACT',
  // 'ARTIFACT_REGISTRY',
  // 'ARTIFACT_REVISION',
  // 'RESOURCE_PRESET',
  // 'USER_RESOURCE_POLICY',
  // 'KEYPAIR_RESOURCE_POLICY',
  // 'PROJECT_RESOURCE_POLICY',
  // 'ROLE',
  // TODO: No management UI in WebUI yet
  // 'DEPLOYMENT',
  // 'NOTIFICATION_CHANNEL',
  // 'NETWORK',
  // 'SESSION_TEMPLATE',
  // 'APP_CONFIG',
  // 'AUDIT_LOG',
  // 'EVENT_LOG',
  // 'NOTIFICATION_RULE',
];

interface ScopeIdSelectProps extends SelectProps {
  scopeType?: string;
}

const DomainScopeIdSelect: React.FC<SelectProps> = (props) => {
  'use memo';
  const { domains } = useLazyLoadQuery<RoleFormModalDomainQuery>(
    graphql`
      query RoleFormModalDomainQuery($is_active: Boolean) {
        domains(is_active: $is_active) {
          name
        }
      }
    `,
    { is_active: true },
    { fetchPolicy: 'store-and-network' },
  );
  return (
    <BAISelect
      showSearch
      {...props}
      options={
        domains?.map((d) => ({ value: d?.name ?? '', label: d?.name })) ?? []
      }
    />
  );
};

const ResourceGroupScopeIdSelect: React.FC<Omit<SelectProps, 'options'>> = (
  props,
) => {
  'use memo';
  const queryRef = useLazyLoadQuery<RoleFormModalResourceGroupQuery>(
    graphql`
      query RoleFormModalResourceGroupQuery {
        ...BAIAdminResourceGroupSelect_resourceGroupsFragment
      }
    `,
    {},
    { fetchPolicy: 'store-and-network' },
  );
  return <BAIAdminResourceGroupSelect queryRef={queryRef} {...props} />;
};

export const ScopeIdSelect: React.FC<ScopeIdSelectProps> = ({
  scopeType,
  ...selectProps
}) => {
  'use memo';
  if (scopeType === 'DOMAIN') {
    return (
      <Suspense fallback={<BAISelect {...selectProps} loading disabled />}>
        <DomainScopeIdSelect {...selectProps} />
      </Suspense>
    );
  }
  if (scopeType === 'PROJECT') {
    return (
      <Suspense fallback={<BAISelect {...selectProps} loading disabled />}>
        <BAIAdminProjectSelect {...selectProps} />
      </Suspense>
    );
  }
  if (scopeType === 'USER') {
    return (
      <Suspense fallback={<BAISelect {...selectProps} loading disabled />}>
        <BAIUserSelect valuePropName="id" {...selectProps} />
      </Suspense>
    );
  }
  if (scopeType === 'VFOLDER') {
    return (
      <Suspense fallback={<BAISelect {...selectProps} loading disabled />}>
        <BAIVFolderSelect {...selectProps} />
      </Suspense>
    );
  }
  if (scopeType === 'SESSION') {
    return (
      <Suspense fallback={<BAISelect {...selectProps} loading disabled />}>
        <BAIAdminSessionSelect {...selectProps} />
      </Suspense>
    );
  }
  if (scopeType === 'MODEL_DEPLOYMENT') {
    return (
      <Suspense fallback={<BAISelect {...selectProps} loading disabled />}>
        <BAIAdminModelServiceSelect {...selectProps} />
      </Suspense>
    );
  }
  if (scopeType === 'CONTAINER_REGISTRY') {
    return (
      <Suspense fallback={<BAISelect {...selectProps} loading disabled />}>
        <BAIAdminContainerRegistrySelect
          valuePropName="row_id"
          {...selectProps}
        />
      </Suspense>
    );
  }
  if (scopeType === 'STORAGE_HOST') {
    return (
      <Suspense fallback={<BAISelect {...selectProps} loading disabled />}>
        <BAIStorageHostSelect {...selectProps} />
      </Suspense>
    );
  }
  if (scopeType === 'KEYPAIR') {
    return (
      <Suspense fallback={<BAISelect {...selectProps} loading disabled />}>
        <BAIKeypairSelect {...selectProps} />
      </Suspense>
    );
  }
  if (scopeType === 'RESOURCE_GROUP') {
    return (
      <Suspense fallback={<BAISelect {...selectProps} loading disabled />}>
        <ResourceGroupScopeIdSelect {...selectProps} />
      </Suspense>
    );
  }
  return (
    <BAISelect
      showSearch
      {...selectProps}
      disabled={!scopeType || selectProps.disabled}
      options={[]}
    />
  );
};

interface ScopeRowProps {
  name: number;
  availableScopeTypes: ReadonlyArray<RBACElementType>;
  canRemove: boolean;
  onRemove: () => void;
}

const ScopeRow: React.FC<ScopeRowProps> = ({
  name,
  availableScopeTypes,
  canRemove,
  onRemove,
}) => {
  'use memo';
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const scopeType = Form.useWatch(['scopes', name, 'scopeType'], form) as
    | RBACElementType
    | undefined;

  return (
    <BAIFlex direction="row" gap="xs" align="start" style={{ width: '100%' }}>
      <Form.Item
        name={[name, 'scopeType']}
        style={{ flex: 1, marginBottom: 0 }}
        rules={[
          {
            required: true,
            message: t('general.ValueRequired', {
              name: t('rbac.ScopeType'),
            }),
          },
        ]}
      >
        <BAISelect
          showSearch
          placeholder={t('rbac.ScopeType')}
          options={availableScopeTypes.map((type) => ({
            value: type,
            label: t(`rbac.types.${type}`, { defaultValue: type }),
          }))}
          onChange={() => {
            const scopes = form.getFieldValue('scopes') ?? [];
            const next = [...scopes];
            next[name] = { ...next[name], scopeId: undefined };
            form.setFieldsValue({ scopes: next });
          }}
        />
      </Form.Item>
      <Form.Item
        name={[name, 'scopeId']}
        style={{ flex: 1, marginBottom: 0 }}
        rules={[
          {
            required: true,
            message: t('general.ValueRequired', {
              name: t('rbac.ScopeId'),
            }),
          },
          ({ getFieldValue }) => ({
            validator(_rule, value) {
              if (!value) return Promise.resolve();
              const scopes: Array<{ scopeType?: string; scopeId?: string }> =
                getFieldValue('scopes') ?? [];
              const hasDuplicate = scopes.some(
                (s, idx) =>
                  idx !== name &&
                  s?.scopeType === scopeType &&
                  s?.scopeId === value,
              );
              if (hasDuplicate) {
                return Promise.reject(new Error(t('rbac.DuplicateScope')));
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <ScopeIdSelect scopeType={scopeType} placeholder={t('rbac.ScopeId')} />
      </Form.Item>
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        disabled={!canRemove}
        onClick={onRemove}
        aria-label={t('button.Delete')}
      />
    </BAIFlex>
  );
};

interface RoleFormModalProps extends BAIModalProps {
  editingRoleFrgmt?: RoleFormModalFragment$key | null;
  onRequestClose: (success: boolean) => void;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({
  editingRoleFrgmt,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const [form] = Form.useForm();

  const { rbacPermissionMatrix } =
    useLazyLoadQuery<RoleFormModalPermissionMatrixQuery>(
      graphql`
        query RoleFormModalPermissionMatrixQuery {
          rbacPermissionMatrix {
            scopeType
            entities {
              actions {
                requiredPermission
              }
            }
          }
        }
      `,
      {},
      { fetchPolicy: 'store-and-network' },
    );

  // Scope types available for a new role: intersection of UI-supported types
  // (RBAC_ELEMENT_TYPES) and backend-reported scope types that have at least
  // one entity with at least one action.
  const availableScopeTypes = RBAC_ELEMENT_TYPES.filter((type) => {
    const entry = rbacPermissionMatrix?.find((c) => c.scopeType === type);
    if (!entry) return false;
    return entry.entities.some((e) => e.actions.length > 0);
  });

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
        if (isEditMode && editingRole) {
          const changedFields: {
            name?: string;
            description?: string | null;
          } = {};
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
            return;
          }

          commitUpdateRole({
            variables: {
              input: {
                id: toLocalId(editingRole.id),
                ...changedFields,
              },
            },
            onCompleted: (_data, errors) => {
              if (errors && errors.length > 0) {
                const errorMessage = errors[0]?.message || '';
                if (isDuplicateError(errorMessage)) {
                  form.setFields([
                    {
                      name: 'name',
                      errors: [t('rbac.DuplicateRoleName')],
                    },
                  ]);
                  return;
                }
                logger.error(errors[0]);
                message.error(errorMessage || t('general.ErrorOccurred'));
                return;
              }
              message.success(t('rbac.RoleUpdated'));
              onRequestClose(true);
            },
            onError: (error) => {
              const errorMessage = error?.message || '';
              if (isDuplicateError(errorMessage)) {
                form.setFields([
                  { name: 'name', errors: [t('rbac.DuplicateRoleName')] },
                ]);
              } else {
                logger.error(error);
                message.error(errorMessage || t('general.ErrorOccurred'));
              }
            },
          });
        } else {
          commitCreateRole({
            variables: {
              input: {
                name: values.name,
                description: values.description || null,
                scopes: (
                  values.scopes as Array<{
                    scopeType: RBACElementType;
                    scopeId: string;
                  }>
                ).map((s) => ({
                  scopeType: s.scopeType,
                  scopeId: s.scopeId,
                })),
              },
            },
            onCompleted: (_data, errors) => {
              if (errors && errors.length > 0) {
                const errorMessage = errors[0]?.message || '';
                if (isDuplicateError(errorMessage)) {
                  form.setFields([
                    {
                      name: 'name',
                      errors: [t('rbac.DuplicateRoleName')],
                    },
                  ]);
                  return;
                }
                logger.error(errors[0]);
                message.error(errorMessage || t('general.ErrorOccurred'));
                return;
              }
              message.success(t('rbac.RoleCreated'));
              onRequestClose(true);
            },
            onError: (error) => {
              const errorMessage = error?.message || '';
              if (isDuplicateError(errorMessage)) {
                form.setFields([
                  { name: 'name', errors: [t('rbac.DuplicateRoleName')] },
                ]);
              } else {
                logger.error(error);
                message.error(errorMessage || t('general.ErrorOccurred'));
              }
            },
          });
        }
      })
      .catch((err) => logger.error('Validation Failed:', err));
  };

  return (
    <BAIModal
      title={isEditMode ? t('rbac.EditRole') : t('rbac.CreateRole')}
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
      confirmLoading={isInFlightCreateRole || isInFlightUpdateRole}
      maskClosable={false}
      destroyOnHidden
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
          scopes: [{}],
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
          <Input.TextArea rows={1} />
        </Form.Item>
        {!isEditMode && (
          <Form.Item label={t('rbac.ScopeTypeAndId')} required>
            <Form.List
              name="scopes"
              rules={[
                {
                  validator: async (_rule, scopes) => {
                    if (!scopes || scopes.length === 0) {
                      return Promise.reject(
                        new Error(t('rbac.AtLeastOneScopeRequired')),
                      );
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <BAIFlex
                  direction="column"
                  gap="xs"
                  align="stretch"
                  style={{ width: '100%' }}
                >
                  {fields.map(({ key, name }) => (
                    <ScopeRow
                      key={key}
                      name={name}
                      availableScopeTypes={availableScopeTypes}
                      canRemove={fields.length > 1}
                      onRemove={() => remove(name)}
                    />
                  ))}
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => add({})}
                  >
                    {t('button.Add')}
                  </Button>
                  <Form.ErrorList errors={errors} />
                </BAIFlex>
              )}
            </Form.List>
          </Form.Item>
        )}
      </Form>
    </BAIModal>
  );
};

export default RoleFormModal;
