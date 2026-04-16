/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  CreatePermissionModalCreateMutation,
  type OperationType,
  type RBACElementType,
} from '../__generated__/CreatePermissionModalCreateMutation.graphql';
import { CreatePermissionModalPermissionMatrixQuery } from '../__generated__/CreatePermissionModalPermissionMatrixQuery.graphql';
import { CreatePermissionModalUpdateMutation } from '../__generated__/CreatePermissionModalUpdateMutation.graphql';
import { CreatePermissionModal_roleScopeFragment$key } from '../__generated__/CreatePermissionModal_roleScopeFragment.graphql';
import { RBAC_ELEMENT_TYPES, ScopeIdSelect } from './RoleFormModal';
import { App, Form } from 'antd';
import {
  BAIModal,
  BAIModalProps,
  BAISelect,
  useBAILogger,
} from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from 'react-relay';

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

interface EditingPermission {
  id: string;
  scopeType: string;
  scopeId: string;
  entityType: string;
  operation: string;
}

interface CreatePermissionModalProps extends BAIModalProps {
  roleId: string;
  roleScopeFrgmt?: CreatePermissionModal_roleScopeFragment$key | null;
  editingPermission?: EditingPermission | null;
  onRequestClose: (success: boolean) => void;
}

const CreatePermissionModal: React.FC<CreatePermissionModalProps> = ({
  roleId,
  roleScopeFrgmt,
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

  const roleScope = useFragment(
    graphql`
      fragment CreatePermissionModal_roleScopeFragment on Role {
        allScopes: scopes(first: 100) {
          edges {
            node {
              scopeType
              scopeId
            }
          }
        }
      }
    `,
    roleScopeFrgmt ?? null,
  );

  const SCOPE_KEY_SEPARATOR = '|';
  const makeScopeKey = (scopeType: string, scopeId: string) =>
    `${scopeType}${SCOPE_KEY_SEPARATOR}${scopeId}`;
  const parseScopeKey = (
    key: string | undefined,
  ): { scopeType?: RBACElementType; scopeId?: string } => {
    if (!key) return {};
    const idx = key.indexOf(SCOPE_KEY_SEPARATOR);
    if (idx === -1) return {};
    return {
      scopeType: key.slice(0, idx) as RBACElementType,
      scopeId: key.slice(idx + 1),
    };
  };

  const roleScopes = (roleScope?.allScopes?.edges ?? [])
    .map((e) => e?.node)
    .filter(
      (n): n is { scopeType: RBACElementType; scopeId: string } =>
        !!n && !!n.scopeType && !!n.scopeId,
    );

  const hasRoleScopes = roleScopes.length > 0;
  const watchedRoleScopeKey = Form.useWatch('roleScopeKey', form) as
    | string
    | undefined;

  const { rbacPermissionMatrix } =
    useLazyLoadQuery<CreatePermissionModalPermissionMatrixQuery>(
      graphql`
        query CreatePermissionModalPermissionMatrixQuery {
          rbacPermissionMatrix {
            scopeType
            entities {
              entityType
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

  // Scope types available for the fallback free-pick UI (role has no scopes):
  // intersection of UI-supported types and backend-reported types with actions.
  const availableScopeTypes = RBAC_ELEMENT_TYPES.filter((type) => {
    const entry = rbacPermissionMatrix?.find((c) => c.scopeType === type);
    if (!entry) return false;
    return entry.entities.some((e) => e.actions.length > 0);
  });

  // Role scopes that actually have at least one actionable entity for permission
  // creation. Others would produce an empty entity/operation list.
  const actionableRoleScopes = roleScopes.filter((s) => {
    const entry = rbacPermissionMatrix?.find(
      (c) => c.scopeType === s.scopeType,
    );
    return entry?.entities.some((e) => e.actions.length > 0) ?? false;
  });

  // Effective (scopeType, scopeId) driving entity/operation filtering
  const parsedRoleScope = hasRoleScopes
    ? parseScopeKey(watchedRoleScopeKey)
    : {};
  const effectiveScopeType: RBACElementType | undefined = hasRoleScopes
    ? parsedRoleScope.scopeType
    : (watchedScopeType as RBACElementType | undefined);
  const effectiveScopeId: string | undefined = hasRoleScopes
    ? parsedRoleScope.scopeId
    : watchedScopeId;

  // Entity types valid for the currently selected scope type
  const selectedScopeEntry = effectiveScopeType
    ? rbacPermissionMatrix?.find((c) => c.scopeType === effectiveScopeType)
    : undefined;

  const validEntityTypes = selectedScopeEntry
    ? selectedScopeEntry.entities
        .filter((e) => e.actions.length > 0)
        .map((e) => e.entityType)
    : [];

  // Valid operations for the selected (scope, entity) pair
  const validOperations =
    watchedEntityType && selectedScopeEntry
      ? new Set(
          selectedScopeEntry.entities
            .find((e) => e.entityType === watchedEntityType)
            ?.actions.map((a) => a.requiredPermission) ?? [],
        )
      : new Set<OperationType>();

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
        const submittedScope = hasRoleScopes
          ? parseScopeKey(values.roleScopeKey)
          : { scopeType: values.scopeType, scopeId: values.scopeId };
        const scopeType = submittedScope.scopeType;
        const scopeId = submittedScope.scopeId;
        if (isEditMode) {
          commitUpdatePermission({
            variables: {
              input: {
                id: editingPermission.id,
                scopeType: scopeType as RBACElementType,
                scopeId: scopeId as string,
                entityType: values.entityType,
                operation: values.operation,
              },
            },
            onCompleted: (_data, errors) => {
              if (errors && errors.length > 0) {
                logger.error(errors[0]);
                message.error(errors[0]?.message || t('general.ErrorOccurred'));
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
                scopeType: scopeType as RBACElementType,
                scopeId: scopeId as string,
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
      })
      .catch((err) => logger.error('Validation Failed:', err));
  };

  return (
    <BAIModal
      title={isEditMode ? t('rbac.EditPermission') : t('rbac.CreatePermission')}
      okText={isEditMode ? t('button.Save') : t('button.Add')}
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
      confirmLoading={isCreateInFlight || isUpdateInFlight}
      maskClosable={false}
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
                roleScopeKey: hasRoleScopes
                  ? makeScopeKey(
                      editingPermission.scopeType,
                      editingPermission.scopeId,
                    )
                  : undefined,
                scopeType: editingPermission.scopeType,
                scopeId: editingPermission.scopeId,
                entityType: editingPermission.entityType,
                operation: editingPermission.operation,
              }
            : undefined
        }
        onValuesChange={(changedValues) => {
          if ('roleScopeKey' in changedValues) {
            form.setFieldsValue({
              entityType: undefined,
              operation: undefined,
            });
          } else if ('scopeType' in changedValues) {
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
        {hasRoleScopes ? (
          <Form.Item
            name="roleScopeKey"
            label={t('rbac.ScopeTypeAndId')}
            rules={[
              {
                required: true,
                message: t('general.ValueRequired', {
                  name: t('rbac.ScopeTypeAndId'),
                }),
              },
            ]}
          >
            <BAISelect
              showSearch
              placeholder={t('rbac.ScopeTypeAndId')}
              options={actionableRoleScopes.map((s) => ({
                value: makeScopeKey(s.scopeType, s.scopeId),
                label: `${t(`rbac.types.${s.scopeType}`, {
                  defaultValue: s.scopeType,
                })} / ${s.scopeId}`,
              }))}
            />
          </Form.Item>
        ) : (
          <>
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
              <BAISelect
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
                  message: t('general.ValueRequired', {
                    name: t('rbac.ScopeId'),
                  }),
                },
              ]}
            >
              <ScopeIdSelect
                scopeType={effectiveScopeType}
                placeholder={t('rbac.ScopeId')}
              />
            </Form.Item>
          </>
        )}
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
          <BAISelect
            showSearch
            disabled={!effectiveScopeId}
            placeholder={t('rbac.EntityType')}
            options={validEntityTypes.map((type) => ({
              value: type,
              label: t(`rbac.types.${type}`, { defaultValue: type }),
              disabled:
                !hasRoleScopes &&
                effectiveScopeType === 'PROJECT' &&
                type === 'USER',
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
          <BAISelect
            showSearch
            disabled={!watchedEntityType}
            placeholder={t('rbac.Operation')}
            options={[
              {
                label: t('rbac.operationGroups.Direct'),
                options: DIRECT_OPERATIONS.filter((op) =>
                  validOperations.has(op),
                ).map((type) => ({
                  value: type,
                  label: t(`rbac.operations.${type}`, { defaultValue: type }),
                })),
              },
              {
                label: t('rbac.operationGroups.Delegate'),
                options: DELEGATE_OPERATIONS.filter((op) =>
                  validOperations.has(op),
                ).map((type) => ({
                  value: type,
                  label: t(`rbac.operations.${type}`, { defaultValue: type }),
                })),
              },
            ].filter((group) => group.options.length > 0)}
          />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default CreatePermissionModal;
