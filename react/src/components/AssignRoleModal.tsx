/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AssignRoleModalBulkAssignMutation } from '../__generated__/AssignRoleModalBulkAssignMutation.graphql';
import { AssignRoleModalQuery } from '../__generated__/AssignRoleModalQuery.graphql';
import { reasonMessage } from '../helper/mutationError';
import { App, Form, theme, Tooltip, Typography } from 'antd';
import {
  BAIBulkErrorModal,
  type BAIColumnsType,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAISelect,
  toLocalId,
  useBAILogger,
  useMutationWithPromise,
} from 'backend.ai-ui';
import _ from 'lodash';
import React, { useDeferredValue, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

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
 * Assigns users to a role via `adminBulkAssignRole` (FR-3357). On partial
 * failure the modal stays open: successfully assigned users are deselected,
 * only the failed users remain in the select (marked with an error border),
 * and the shared `BAIBulkErrorModal` lists each failure — pressing Assign
 * again retries just the remaining users.
 */
const AssignRoleModal: React.FC<AssignRoleModalProps> = ({
  roleId,
  projectId,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const [form] = Form.useForm<{ userIds: string[] }>();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [isAssigning, setIsAssigning] = useState(false);
  // One row per user the server rejected on the last save; the error modal
  // is open while non-empty.
  const [failedAssignments, setFailedAssignments] = useState<
    FailedAssignment[]
  >([]);
  // Whether any assignment already reached the backend (partial success) —
  // the parent must refetch on close even if the user then cancels.
  const [hasAssignedAny, setHasAssignedAny] = useState(false);
  // How many of the last save's requests the backend accepted — shown next to
  // the partial-failure notice as "(Success: n, Failed: m)".
  const [succeededRequestCount, setSucceededRequestCount] = useState(0);
  // Labels of every user selected so far, for failure rows — the options
  // list only holds the current search results, so failed users may no
  // longer be in it when the failure arrives.
  const userLabelsRef = useRef(new Map<string, string>());

  const data = useLazyLoadQuery<AssignRoleModalQuery>(
    graphql`
      query AssignRoleModalQuery($filter: UserV2Filter, $first: Int) {
        adminUsersV2(filter: $filter, first: $first) {
          edges {
            node {
              id
              basicInfo {
                email
                fullName
              }
            }
          }
        }
      }
    `,
    {
      filter: deferredSearch ? { email: { contains: deferredSearch } } : null,
      first: 50,
    },
    {
      fetchPolicy: baiModalProps.open ? 'store-and-network' : 'store-only',
    },
  );

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
          failed {
            userId
            message
          }
        }
      }
    `);

  const users = data.adminUsersV2?.edges?.map((edge) => edge?.node) ?? [];

  const userLabelOf = (userId: string) =>
    userLabelsRef.current.get(userId) ?? userId;

  // Keep only the failed users selected (error border via a field error) so
  // the next Assign retries exactly what failed.
  const markFailures = (
    failures: FailedAssignment[],
    failedIds: string[],
    succeededCount: number,
  ) => {
    setSelectedUserIds(failedIds);
    form.setFieldsValue({ userIds: failedIds });
    // Empty-string error: error status (red border) without printing a
    // message under the select — details live in the error modal. Changing
    // the selection revalidates the `required` rule and clears it.
    form.setFields([{ name: 'userIds', errors: [''] }]);
    // Immediate failure notice as a toast on top of the detail modal — the
    // modal carries the per-request table, the message the at-a-glance cue.
    message.error(t('rbac.UserAssignmentsPartialFailureDescription'));
    setSucceededRequestCount(succeededCount);
    setFailedAssignments(failures);
  };

  const handleAssign = async () => {
    setIsAssigning(true);
    try {
      const result = await bulkAssignRole({
        input: {
          userIds: selectedUserIds,
          roleId,
          ...(projectId ? { projectId } : {}),
        },
      });
      const failed = result.adminBulkAssignRole?.failed ?? [];
      if (failed.length === 0) {
        message.success(t('rbac.UsersAssigned'));
        onRequestClose(true);
        return;
      }
      const assignedCount = (result.adminBulkAssignRole?.assigned ?? []).length;
      if (assignedCount > 0) {
        setHasAssignedAny(true);
      }
      failed.forEach((failure) =>
        logger.error('Failed to assign user', failure.message),
      );
      markFailures(
        failed.map((failure) => ({
          key: failure.userId,
          userLabel: userLabelOf(failure.userId),
          message: failure.message,
        })),
        failed.map((failure) => failure.userId),
        assignedCount,
      );
    } catch (error) {
      // A wholly-rejected request counts every requested user as failed.
      logger.error('Failed to bulk assign role', error);
      markFailures(
        selectedUserIds.map((userId) => ({
          key: userId,
          userLabel: userLabelOf(userId),
          message: reasonMessage(error),
        })),
        selectedUserIds,
        0,
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
      // let a late rejection call `markFailures` after `afterClose` reset the
      // state, leaking a stale error modal into the next open. Block every
      // close path (Cancel button, X, Esc) while assigning.
      cancelButtonProps={{ disabled: isAssigning }}
      closable={!isAssigning}
      keyboard={!isAssigning}
      onOk={() => {
        return form
          .validateFields()
          .then(() => handleAssign())
          .catch((e) => {
            logger.debug(e);
          });
      }}
      // After a partial failure some assignments did reach the backend, so
      // even a cancel must report success=true — the parent then refetches.
      onCancel={() => onRequestClose(hasAssignedAny)}
      destroyOnHidden
      afterClose={() => {
        setSelectedUserIds([]);
        setSearch('');
        setFailedAssignments([]);
        setHasAssignedAny(false);
        setSucceededRequestCount(0);
        userLabelsRef.current.clear();
        form.resetFields();
      }}
      {...baiModalProps}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="userIds"
          label={t('credential.Users')}
          rules={[{ required: true, message: t('rbac.PleaseSelectUsers') }]}
        >
          <BAISelect
            mode="multiple"
            style={{ width: '100%' }}
            placeholder={t('rbac.SelectUsers')}
            onChange={(value: string[], options) => {
              _.castArray(options ?? []).forEach((option: any) => {
                if (option?.value !== undefined) {
                  userLabelsRef.current.set(
                    String(option.value),
                    String(option.label ?? option.value),
                  );
                }
              });
              setSelectedUserIds(value);
              setSearch('');
            }}
            loading={deferredSearch !== search}
            maxTagCount="responsive"
            allowClear
            maxTagPlaceholder={(omittedValues) => (
              <Tooltip
                title={
                  <BAIFlex direction="column" align="start" gap="xxs">
                    {omittedValues.map((v) => (
                      <Typography.Text
                        key={v.value}
                        style={{ color: 'inherit' }}
                      >
                        {v.label}
                      </Typography.Text>
                    ))}
                  </BAIFlex>
                }
              >
                <span>+{omittedValues.length} ...</span>
              </Tooltip>
            )}
            showSearch={{
              searchValue: search,
              onSearch: (v) => setSearch(v),
              filterOption: false,
            }}
            options={users.map((user) => ({
              value: user?.id ? toLocalId(user.id) : undefined,
              label: user?.basicInfo?.email || user?.id,
              description: user?.basicInfo?.fullName,
            }))}
            optionRender={(option) => (
              <div>
                <div>{option.label}</div>
                {option.data?.description && (
                  <div style={{ fontSize: 12, color: '#999' }}>
                    {option.data.description}
                  </div>
                )}
              </div>
            )}
          />
        </Form.Item>
      </Form>
      {/* Per-user errors of a partially-failed assignment (FR-3357). The
          assign modal (and the remaining failed selection) stays open behind
          it for a retry. */}
      <BAIBulkErrorModal<FailedAssignment>
        open={!_.isEmpty(failedAssignments)}
        alertDescription={
          <>
            {t('rbac.UserAssignmentsPartialFailureDescription')}{' '}
            <Typography.Text
              style={{
                color: token.colorTextSecondary,
                fontSize: token.fontSizeSM,
              }}
            >
              {t('rbac.PermissionsPartialFailureCounts', {
                succeeded: succeededRequestCount,
                failed: failedAssignments.length,
              })}
            </Typography.Text>
          </>
        }
        columns={failureColumns}
        dataSource={failedAssignments}
        onRequestClose={() => setFailedAssignments([])}
      />
    </BAIModal>
  );
};

export default AssignRoleModal;
