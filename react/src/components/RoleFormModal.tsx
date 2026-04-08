/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleFormModalCreateMutation } from '../__generated__/RoleFormModalCreateMutation.graphql';
import { RoleFormModalFragment$key } from '../__generated__/RoleFormModalFragment.graphql';
import { RoleFormModalUpdateMutation } from '../__generated__/RoleFormModalUpdateMutation.graphql';
import { App, Form, Input } from 'antd';
import {
  BAIAdminProjectSelect,
  BAIModal,
  BAIModalProps,
  BAISelect,
  toLocalId,
  useBAILogger,
} from 'backend.ai-ui';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

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
                ...(values.projectId
                  ? {
                      scopes: [
                        {
                          scopeType: 'PROJECT',
                          scopeId: values.projectId,
                        },
                      ],
                    }
                  : {}),
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
        {!isEditMode && (
          <Suspense fallback={<BAISelect disabled loading />}>
            <Form.Item
              name="projectId"
              label={t('general.Project')}
              tooltip={t('rbac.ProjectScopeTooltip')}
            >
              <BAIAdminProjectSelect allowClear />
            </Form.Item>
          </Suspense>
        )}
        <Form.Item name="description" label={t('rbac.RoleDescription')}>
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default RoleFormModal;
