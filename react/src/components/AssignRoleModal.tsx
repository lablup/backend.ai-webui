/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AssignRoleModalBulkAssignMutation } from '../__generated__/AssignRoleModalBulkAssignMutation.graphql';
import { App } from '../app-shim';
import { Form, type FormInstance } from '../form-engine';
import { reasonMessage } from '../helper/mutationError';
import {
  BAIAdminUserV2Select,
  BAIBulkErrorModal,
  BAIModal,
  BAIModalProps,
  BAISelect,
  useBAILogger,
  useMutationWithPromise,
  type BAIColumnsType,
} from 'backend.ai-ui';
import _ from 'lodash';
import React, { Suspense, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql } from 'react-relay';

interface AssignRoleModalProps extends BAIModalProps {
  roleId: string;
  /** Present when the role is scoped to a project. */
  projectId?: string;
  onRequestClose: (success: boolean) => void;
}

/** One failed assignment, shaped for the shared `BAIBulkErrorModal` table. */
interface FailedAssignment {
  key: string;
  userLabel: string;
  message: string;
}

/**
 * Assigns users to a role via `adminBulkAssignRole` (FR-3357). A refused user
 * rejects the whole request, so on failure the modal stays open with every
 * selected user still selected (marked with an error border) and the shared
 * `BAIBulkErrorModal` lists each of them — pressing Assign again retries.
 */
const AssignRoleModal: React.FC<AssignRoleModalProps> = ({
  roleId,
  projectId,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const formRef = useRef<FormInstance<{ userIds: string[] }>>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  // One row per user the server rejected on the last save; the error modal
  // is open while non-empty.
  const [failedAssignments, setFailedAssignments] = useState<
    FailedAssignment[]
  >([]);
  // Labels of every user selected so far, for failure rows — the options
  // list only holds the current search results, so failed users may no
  // longer be in it when the failure arrives.
  const userLabelsRef = useRef(new Map<string, string>());

  const bulkAssignRole =
    useMutationWithPromise<AssignRoleModalBulkAssignMutation>(graphql`
      mutation AssignRoleModalBulkAssignMutation($input: BulkAssignRoleInput!) {
        adminBulkAssignRole(input: $input) {
          assigned {
            id
            userId
            grantedBy
            grantedAt
          }
        }
      }
    `);

  const userLabelOf = (userId: string) =>
    userLabelsRef.current.get(userId) ?? userId;

  const handleAssign = async () => {
    setIsAssigning(true);
    try {
      await bulkAssignRole({
        input: {
          userIds: selectedUserIds,
          roleId,
          ...(projectId ? { projectId } : {}),
        },
      });
      message.success(t('rbac.UsersAssigned'));
      onRequestClose(true);
    } catch (error) {
      // A rejected request counts every requested user as failed.
      logger.error('Failed to bulk assign role', error);
      // Empty-string error: error status (red border) without printing a
      // message under the select — details live in the error modal. Changing
      // the selection revalidates the `required` rule and clears it.
      formRef.current?.setFields([{ name: 'userIds', errors: [''] }]);
      message.error(t('rbac.UserAssignmentsPartialFailureDescription'));
      setFailedAssignments(
        selectedUserIds.map((userId) => ({
          key: userId,
          userLabel: userLabelOf(userId),
          message: reasonMessage(error),
        })),
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const failureColumns: BAIColumnsType<FailedAssignment> = [
    {
      key: 'user',
      title: t('credential.UserID'),
      dataIndex: 'userLabel',
    },
    {
      key: 'message',
      title: t('rbac.ErrorMessage'),
      dataIndex: 'message',
    },
  ];

  return (
    <BAIModal
      title={t('rbac.AssignUser')}
      okText={t('rbac.Assign')}
      maskClosable={false}
      confirmLoading={isAssigning}
      // The in-flight promise is not cancellable: closing mid-request would
      // unmount this modal (BAIUnmountAfterClose) and drop the late
      // success/failure feedback on the floor. Block every close path
      // (Cancel button, X, Esc) while assigning.
      cancelButtonProps={{ disabled: isAssigning }}
      closable={!isAssigning}
      keyboard={!isAssigning}
      onOk={() => {
        return formRef.current
          ?.validateFields()
          .then(() => handleAssign())
          .catch((e) => {
            logger.debug(e);
          });
      }}
      onCancel={() => onRequestClose(false)}
      {...baiModalProps}
    >
      <Form ref={formRef} layout="vertical">
        <Suspense
          fallback={
            <Form.Item label={t('credential.Users')}>
              <BAISelect mode="multiple" disabled loading />
            </Form.Item>
          }
        >
          <Form.Item
            name="userIds"
            label={t('credential.Users')}
            rules={[{ required: true, message: t('rbac.PleaseSelectUsers') }]}
          >
            <BAIAdminUserV2Select
              multiple
              valuePropName="id"
              label={t('credential.Users')}
              isLabelHidden
              placeholder={t('rbac.SelectUsers')}
              onChange={(value, option) => {
                _.castArray(option ?? []).forEach((o) => {
                  userLabelsRef.current.set(
                    String(o.value),
                    String(o.label ?? o.value),
                  );
                });
                setSelectedUserIds(_.castArray(value ?? []));
              }}
            />
          </Form.Item>
        </Suspense>
      </Form>
      {/* Per-user errors of a failed assignment (FR-3357). The assign modal
          (and the selection) stays open behind it for a retry. */}
      <BAIBulkErrorModal<FailedAssignment>
        open={!_.isEmpty(failedAssignments)}
        alertDescription={t('rbac.UserAssignmentsPartialFailureDescription')}
        columns={failureColumns}
        dataSource={failedAssignments}
        onRequestClose={() => setFailedAssignments([])}
      />
    </BAIModal>
  );
};

export default AssignRoleModal;
