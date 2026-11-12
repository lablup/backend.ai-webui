/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleFormModalCreateMutation } from '../../../__generated__/RoleFormModalCreateMutation.graphql';
import { RoleFormModalFragment$key } from '../../../__generated__/RoleFormModalFragment.graphql';
import { RoleFormModalPermissionMatrixQuery } from '../../../__generated__/RoleFormModalPermissionMatrixQuery.graphql';
import { RoleFormModalUpdateMutation } from '../../../__generated__/RoleFormModalUpdateMutation.graphql';
import { App } from '../../../app-shim';
import { Form } from '../../../form-engine';
import { rbacTypeI18nKey } from '../../../helper/rbacElementTypes';
import { useCurrentDomain } from '../../../hooks';
import {
  BAIAdminProjectSelect,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAISelect,
  BAIAdminUserV2Select,
  useBAILogger,
  BAICheckboxInput,
  BAITextArea,
  BAITextInput,
} from 'backend.ai-ui';
import _ from 'lodash';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from 'react-relay';

// The role scope types managers >= 26.10 report (`role_scope_types()`), in the
// uppercase spelling of the retired `RBACElementType` enum; managers report them lowercase.
export const RBAC_ELEMENT_TYPES: ReadonlyArray<string> = [
  'DOMAIN',
  'PROJECT',
  'USER',
];

interface ScopeIdSelectProps {
  scopeType?: string;
  /** Injected by `Form.Item`. */
  value?: string;
  onChange?: (value: string | Array<string> | undefined) => void;
  placeholder?: string;
  isDisabled?: boolean;
}

/** Every branch renders inside a `Form.Item` that prints its own label. */
type ScopeIdBranchProps = Omit<ScopeIdSelectProps, 'scopeType'> & {
  label: string;
  isLabelHidden?: boolean;
};

/** True for the DOMAIN scope, whose id is the signed-in domain and is never shown. */
export const isDomainScopeType = (scopeType?: string) =>
  scopeType?.toUpperCase() === 'DOMAIN';

export const ScopeIdSelect: React.FC<ScopeIdSelectProps> = ({
  scopeType: rawScopeType,
  ...selectProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const scopeType = rawScopeType?.toUpperCase();
  // The surrounding `Form.Item` already prints "Scope ID", so the Astryx
  // field's own label is the accessible name only.
  const branchProps: ScopeIdBranchProps = {
    ...selectProps,
    label: t('rbac.ScopeId'),
    isLabelHidden: true,
  };
  const fallback = (
    <BAISelect
      showSearch={false}
      aria-label={t('rbac.ScopeId')}
      placeholder={selectProps.placeholder}
      loading
      disabled
      options={[]}
    />
  );
  if (scopeType === 'PROJECT') {
    return (
      <Suspense fallback={fallback}>
        <BAIAdminProjectSelect {...branchProps} />
      </Suspense>
    );
  }
  if (scopeType === 'USER') {
    return (
      <Suspense fallback={fallback}>
        <BAIAdminUserV2Select valuePropName="id" {...branchProps} />
      </Suspense>
    );
  }
  // No scope type picked yet: an inert, empty field.
  return (
    <BAISelect
      showSearch={false}
      aria-label={t('rbac.ScopeId')}
      placeholder={selectProps.placeholder}
      value={selectProps.value}
      disabled
      options={[]}
    />
  );
};

interface RoleFormModalProps extends BAIModalProps {
  roleNodeFrgmt?: RoleFormModalFragment$key | null;
  onRequestClose: (success: boolean) => void;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({
  roleNodeFrgmt,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const [form] = Form.useForm();
  const scopeType = Form.useWatch('scopeType', form) as string | undefined;
  const currentDomain = useCurrentDomain();

  const { rbacPermissionMatrix } =
    useLazyLoadQuery<RoleFormModalPermissionMatrixQuery>(
      graphql`
        query RoleFormModalPermissionMatrixQuery {
          rbacPermissionMatrix {
            scopeType
          }
        }
      `,
      {},
      { fetchPolicy: 'store-and-network' },
    );

  // The scope types the manager reports, in its own spelling, that have a
  // scope-id picker.
  const scopeTypeOptions = _.uniqBy(
    (rbacPermissionMatrix ?? []).filter((combination) =>
      RBAC_ELEMENT_TYPES.includes(combination.scopeType.toUpperCase()),
    ),
    (combination) => combination.scopeType.toUpperCase(),
  ).map((combination) => ({
    value: combination.scopeType,
    label: t(rbacTypeI18nKey(combination.scopeType), {
      defaultValue: combination.scopeType,
    }),
  }));

  const editingRole = useFragment(
    graphql`
      fragment RoleFormModalFragment on Role {
        id
        entityId
        name
        description
        autoAssign
      }
    `,
    roleNodeFrgmt ?? null,
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
          autoAssign
          createdAt
          updatedAt
        }
      }
    `);

  const [commitUpdateRole, isInFlightUpdateRole] =
    useMutation<RoleFormModalUpdateMutation>(graphql`
      mutation RoleFormModalUpdateMutation(
        $id: UUID!
        $input: UpdateRoleInput!
      ) {
        updateRole(id: $id, input: $input) {
          id
          name
          description
          autoAssign
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
            autoAssign?: boolean;
          } = {};
          if (values.name !== editingRole.name) {
            changedFields.name = values.name;
          }
          if (
            (values.description || null) !== (editingRole.description || null)
          ) {
            changedFields.description = values.description || null;
          }
          if (values.autoAssign !== editingRole.autoAssign) {
            changedFields.autoAssign = values.autoAssign;
          }

          if (Object.keys(changedFields).length === 0) {
            onRequestClose(false);
            return;
          }

          commitUpdateRole({
            variables: {
              id: editingRole.entityId,
              input: changedFields,
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
          const scopeId = isDomainScopeType(values.scopeType)
            ? currentDomain.id
            : values.scopeId;
          commitCreateRole({
            variables: {
              input: {
                name: values.name,
                description: values.description || null,
                autoAssign: values.autoAssign,
                scope: { scopeType: values.scopeType, scopeId },
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
          autoAssign: editingRole?.autoAssign ?? false,
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
          <BAITextInput aria-label={t('rbac.RoleName')} hasAutoFocus />
        </Form.Item>
        <Form.Item name="description" label={t('rbac.RoleDescription')}>
          <BAITextArea aria-label={t('rbac.RoleDescription')} rows={1} />
        </Form.Item>
        <Form.Item
          name="autoAssign"
          label={t('rbac.AutoAssign')}
          valuePropName="checked"
          tooltip={t('rbac.AutoAssignDescription')}
        >
          <BAICheckboxInput>{t('general.Enable')}</BAICheckboxInput>
        </Form.Item>
        {!isEditMode && (
          <BAIFlex direction="row" gap="xs" align="start">
            <Form.Item
              name="scopeType"
              label={t('rbac.ScopeType')}
              style={{ flex: 1 }}
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
                options={scopeTypeOptions}
                onChange={() => form.setFieldsValue({ scopeId: undefined })}
              />
            </Form.Item>
            {!isDomainScopeType(scopeType) && (
              <Form.Item
                name="scopeId"
                label={t('rbac.ScopeId')}
                style={{ flex: 1 }}
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
                  scopeType={scopeType}
                  placeholder={t('rbac.ScopeId')}
                />
              </Form.Item>
            )}
          </BAIFlex>
        )}
      </Form>
    </BAIModal>
  );
};

export default RoleFormModal;
