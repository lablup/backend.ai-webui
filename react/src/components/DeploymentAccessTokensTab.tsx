/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentAccessTokensTabCreateMutation } from '../__generated__/DeploymentAccessTokensTabCreateMutation.graphql';
import { DeploymentAccessTokensTabDeleteMutation } from '../__generated__/DeploymentAccessTokensTabDeleteMutation.graphql';
import { DeploymentAccessTokensTabListQuery } from '../__generated__/DeploymentAccessTokensTabListQuery.graphql';
import { DeploymentAccessTokensTab_deployment$key } from '../__generated__/DeploymentAccessTokensTab_deployment.graphql';
import {
  DeleteOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  DatePicker,
  Form,
  Select,
  Skeleton,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import {
  BAICard,
  BAIFetchKeyButton,
  BAIFlex,
  BAIModal,
  BAINameActionCell,
  BAITable,
  BAIText,
  BAIUnmountAfterClose,
  filterOutNullAndUndefined,
  toLocalId,
  useBAILogger,
  useMutationWithPromise,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from 'react-relay';

interface DeploymentAccessTokensTabProps {
  deploymentFrgmt: DeploymentAccessTokensTab_deployment$key;
  deploymentId: string;
  isOwnedByCurrentUser?: boolean;
  isDeploymentDestroying?: boolean;
}

const DeploymentAccessTokensTab: React.FC<DeploymentAccessTokensTabProps> = ({
  deploymentFrgmt,
  deploymentId,
  isOwnedByCurrentUser = true,
  isDeploymentDestroying = false,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [fetchKey, setFetchKey] = useState(0);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // After successful creation, show the plaintext token once in a modal.
  const [createdToken, setCreatedToken] = useState<{
    token: string;
    expiresAt: string | null;
  } | null>(null);

  const deployment = useFragment(
    graphql`
      fragment DeploymentAccessTokensTab_deployment on ModelDeployment {
        id
      }
    `,
    deploymentFrgmt,
  );

  const commitCreateMutation =
    useMutationWithPromise<DeploymentAccessTokensTabCreateMutation>(graphql`
      mutation DeploymentAccessTokensTabCreateMutation(
        $input: CreateAccessTokenInput!
      ) {
        createAccessToken(input: $input) {
          accessToken {
            id
            token
            createdAt
            expiresAt
          }
        }
      }
    `);

  const handleRefetch = () => {
    startRefetchTransition(() => {
      setFetchKey((k) => k + 1);
    });
  };

  const isMutationDisabled = isDeploymentDestroying || !isOwnedByCurrentUser;

  return (
    <>
      <BAICard
        title={
          <BAIFlex gap="xs" align="center">
            {t('deployment.tab.AccessTokens')}
            <Tooltip title={t('deployment.tab.description.AccessTokens')}>
              <QuestionCircleOutlined
                style={{ color: token.colorTextDescription }}
              />
            </Tooltip>
          </BAIFlex>
        }
        extra={
          <BAIFlex gap="xs" align="center">
            <BAIFetchKeyButton
              loading={isPendingRefetch}
              value=""
              onChange={handleRefetch}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={isMutationDisabled}
              onClick={() => setIsCreateModalOpen(true)}
            >
              {t('deployment.accessToken.Create')}
            </Button>
          </BAIFlex>
        }
        styles={{ body: { paddingTop: 0 } }}
      >
        <Suspense fallback={<Skeleton active />}>
          <DeploymentAccessTokensTable
            deploymentId={deploymentId}
            fetchKey={fetchKey}
            isPendingRefetch={isPendingRefetch}
            isDeleteDisabled={isMutationDisabled}
            onAfterDelete={handleRefetch}
          />
        </Suspense>
      </BAICard>

      <BAIUnmountAfterClose>
        <CreateAccessTokenModal
          open={isCreateModalOpen}
          confirmLoading={false}
          onRequestClose={(result) => {
            setIsCreateModalOpen(false);
            if (result) {
              // Kick off the mutation after the modal closes to avoid
              // overlapping dialogs.
              commitCreateMutation({
                input: {
                  modelDeploymentId: toLocalId(deployment.id),
                  // Schema requires DateTime! (non-null); map "no expiration" to a far-future date.
                  expiresAt:
                    result.expiresAt ?? new Date('2099-12-31').toISOString(),
                },
              })
                .then((response) => {
                  const created = response.createAccessToken?.accessToken;
                  if (created) {
                    setCreatedToken({
                      token: created.token,
                      expiresAt: created.expiresAt ?? null,
                    });
                  }
                  message.success({
                    key: 'access-token-created',
                    content: t('deployment.accessToken.Created'),
                  });
                  handleRefetch();
                })
                .catch((error) => {
                  const errors = Array.isArray(error) ? error : [error];
                  for (const err of errors) {
                    message.error(err?.message || t('dialog.ErrorOccurred'));
                  }
                  logger.error(error);
                });
            }
          }}
        />
      </BAIUnmountAfterClose>

      <BAIUnmountAfterClose>
        <BAIModal
          open={createdToken !== null}
          destroyOnHidden
          title={t('deployment.accessToken.Token')}
          onCancel={() => setCreatedToken(null)}
          footer={null}
          width={520}
        >
          <BAIFlex direction="column" align="stretch" gap="sm">
            <Typography.Text>
              {t('deployment.accessToken.Created')}
            </Typography.Text>
            {createdToken ? (
              <BAIText copyable={{ text: createdToken.token }} ellipsis code>
                {createdToken.token}
              </BAIText>
            ) : null}
            {createdToken?.expiresAt ? (
              <Typography.Text type="secondary">
                {`${t('deployment.accessToken.Expiration')}: ${dayjs(
                  createdToken.expiresAt,
                ).format('ll LT')}`}
              </Typography.Text>
            ) : (
              <Typography.Text type="secondary">
                {t('deployment.accessToken.NoExpiration')}
              </Typography.Text>
            )}
          </BAIFlex>
        </BAIModal>
      </BAIUnmountAfterClose>
    </>
  );
};

// ---------------------------------------------------------------------------
// Inner table component — owns the data fetch and per-row delete mutation so
// the BAICard header above can remain visible while the list suspends.
// ---------------------------------------------------------------------------

interface DeploymentAccessTokensTableProps {
  deploymentId: string;
  fetchKey: number;
  isPendingRefetch: boolean;
  isDeleteDisabled: boolean;
  onAfterDelete: () => void;
}

const DeploymentAccessTokensTable: React.FC<
  DeploymentAccessTokensTableProps
> = ({
  deploymentId,
  fetchKey,
  isPendingRefetch,
  isDeleteDisabled,
  onAfterDelete,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const { logger } = useBAILogger();

  const { deployment: listData } =
    useLazyLoadQuery<DeploymentAccessTokensTabListQuery>(
      graphql`
        query DeploymentAccessTokensTabListQuery($deploymentId: ID!) {
          deployment(id: $deploymentId) {
            accessTokens(orderBy: [{ field: CREATED_AT, direction: DESC }]) {
              count
              edges {
                node {
                  id
                  token
                  createdAt
                  expiresAt
                }
              }
            }
          }
        }
      `,
      { deploymentId },
      { fetchKey, fetchPolicy: 'network-only' },
    );

  type AccessTokenNode = NonNullable<
    NonNullable<
      NonNullable<typeof listData>['accessTokens']
    >['edges'][number]['node']
  >;

  const accessTokens = filterOutNullAndUndefined(
    listData?.accessTokens?.edges?.map((edge) => edge?.node),
  );

  const [commitDelete, isDeletingToken] =
    useMutation<DeploymentAccessTokensTabDeleteMutation>(graphql`
      mutation DeploymentAccessTokensTabDeleteMutation(
        $input: DeleteAccessTokenInput!
      ) {
        deleteAccessToken(input: $input) {
          id
        }
      }
    `);

  return (
    <BAITable<AccessTokenNode>
      scroll={{ x: 'max-content' }}
      rowKey="id"
      loading={isPendingRefetch || isDeletingToken}
      dataSource={accessTokens}
      pagination={false}
      columns={[
        {
          key: 'token',
          title: t('deployment.accessToken.Token'),
          dataIndex: 'token',
          render: (_text, row) => {
            if (!row) return '-';
            return (
              <BAINameActionCell
                title={
                  <BAIText
                    copyable={{ text: row.token }}
                    ellipsis
                    code
                    style={{ maxWidth: 120 }}
                  >
                    {row.token}
                  </BAIText>
                }
                showActions="always"
                actions={[
                  {
                    key: 'delete',
                    title: t('deployment.accessToken.Delete'),
                    icon: <DeleteOutlined />,
                    type: 'danger',
                    disabled: isDeleteDisabled,
                    onClick: () => {
                      modal.confirm({
                        title: t('deployment.accessToken.Delete'),
                        content: t('deployment.accessToken.DeleteConfirm'),
                        okText: t('button.Delete'),
                        okButtonProps: { danger: true },
                        onOk: () => {
                          commitDelete({
                            variables: {
                              input: {
                                id: toLocalId(row.id) ?? row.id,
                              },
                            },
                            onCompleted: (_res, errors) => {
                              if (errors && errors.length > 0) {
                                logger.error(errors[0]);
                                message.error(
                                  errors[0]?.message ??
                                    t('dialog.ErrorOccurred'),
                                );
                                return;
                              }
                              message.success(
                                t('deployment.accessToken.Deleted'),
                              );
                              onAfterDelete();
                            },
                            onError: (err) => {
                              logger.error(err);
                              message.error(
                                err.message ?? t('dialog.ErrorOccurred'),
                              );
                            },
                          });
                        },
                      });
                    },
                  },
                ]}
              />
            );
          },
        },
        {
          key: 'createdAt',
          title: t('deployment.CreatedAt'),
          dataIndex: 'createdAt',
          render: (_text, row) =>
            row?.createdAt ? dayjs(row.createdAt).format('ll LT') : '-',
        },
        {
          key: 'expiresAt',
          title: t('deployment.accessToken.Expiration'),
          dataIndex: 'expiresAt',
          render: (_text, row) =>
            row?.expiresAt
              ? dayjs(row.expiresAt).format('ll LT')
              : t('deployment.accessToken.NoExpiration'),
        },
      ]}
    />
  );
};

// ---------------------------------------------------------------------------
// Create Access Token modal — presets (7/30/90 days, custom, no expiration).
// ---------------------------------------------------------------------------

type ExpiryOption = 7 | 30 | 90 | 'custom' | 'none';

interface CreateAccessTokenFormValues {
  expiryOption: ExpiryOption;
  datetime: dayjs.Dayjs;
}

interface CreateAccessTokenModalProps {
  open: boolean;
  confirmLoading?: boolean;
  onRequestClose: (result?: { expiresAt: string | null }) => void;
}

const CreateAccessTokenModal: React.FC<CreateAccessTokenModalProps> = ({
  open,
  confirmLoading,
  onRequestClose,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [form] = Form.useForm<CreateAccessTokenFormValues>();

  // Form.useWatch re-renders this component when expiryOption changes,
  // replacing the Form.Item dependencies render-prop pattern which only
  // triggers re-validation (not re-render) when a dependency changes.
  const expiryOption = Form.useWatch<ExpiryOption>('expiryOption', form) ?? 7;

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        let expiresAt: string | null;
        if (values.expiryOption === 'none') {
          expiresAt = null;
        } else if (values.expiryOption === 'custom') {
          expiresAt = values.datetime.toISOString();
        } else {
          expiresAt = dayjs().add(values.expiryOption, 'day').toISOString();
        }
        onRequestClose({ expiresAt });
      })
      .catch(() => {
        // validation failures surface inline; do nothing.
      });
  };

  const options: Array<{ value: ExpiryOption; label: string }> = [
    {
      value: 7,
      label: t('general.Days', { num: 7, defaultValue: '7 days' }),
    },
    {
      value: 30,
      label: t('general.Days', { num: 30, defaultValue: '30 days' }),
    },
    {
      value: 90,
      label: t('general.Days', { num: 90, defaultValue: '90 days' }),
    },
    {
      value: 'custom',
      label: t('deployment.accessToken.CustomExpiration'),
    },
    {
      value: 'none',
      label: t('deployment.accessToken.NoExpiration'),
    },
  ];

  return (
    <BAIModal
      open={open}
      destroyOnHidden
      centered
      width={420}
      title={t('deployment.accessToken.Create')}
      okText={t('deployment.accessToken.Create')}
      confirmLoading={confirmLoading}
      onOk={handleOk}
      onCancel={() => onRequestClose()}
    >
      <Form<CreateAccessTokenFormValues>
        form={form}
        layout="vertical"
        initialValues={{
          expiryOption: 7 as ExpiryOption,
          datetime: dayjs().add(7, 'day'),
        }}
        validateTrigger={['onChange', 'onBlur']}
      >
        <Form.Item
          name="expiryOption"
          label={t('deployment.accessToken.Expiration')}
          rules={[{ required: true }]}
        >
          <Select<ExpiryOption>
            style={{ width: 200 }}
            options={options}
            onChange={(value) => {
              if (typeof value === 'number') {
                form.setFieldValue('datetime', dayjs().add(value, 'day'));
              }
            }}
          />
        </Form.Item>
        {expiryOption === 'custom' && (
          <Form.Item
            name="datetime"
            label={t('deployment.accessToken.CustomExpiration')}
            rules={[
              {
                type: 'object' as const,
                required: true,
              },
              () => ({
                validator(_rule, value) {
                  if (value && dayjs(value).isAfter(dayjs())) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('dialog.ErrorOccurred')));
                },
              }),
            ]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
            />
          </Form.Item>
        )}
      </Form>
    </BAIModal>
  );
};

export default DeploymentAccessTokensTab;
