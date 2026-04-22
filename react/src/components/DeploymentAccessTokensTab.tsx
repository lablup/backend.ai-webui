/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentAccessTokensTabCreateMutation } from '../__generated__/DeploymentAccessTokensTabCreateMutation.graphql';
import { DeploymentAccessTokensTabListQuery } from '../__generated__/DeploymentAccessTokensTabListQuery.graphql';
import { DeploymentAccessTokensTab_deployment$key } from '../__generated__/DeploymentAccessTokensTab_deployment.graphql';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, App, Button, DatePicker, Form, Typography, theme } from 'antd';
import {
  BAIFetchKeyButton,
  BAIFlex,
  BAIModal,
  BAINameActionCell,
  BAITable,
  BAIUnmountAfterClose,
  filterOutNullAndUndefined,
  toLocalId,
  useBAILogger,
  useMutationWithPromise,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

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
  const { message, modal } = App.useApp();
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

  const handleDeleteToken = (tokenId: string) => {
    modal.confirm({
      title: t('dialog.warning.CannotBeUndone'),
      content: t('deployment.accessToken.Delete'),
      okText: t('button.Delete'),
      okButtonProps: { danger: true },
      onOk: () => {
        // TODO(needs-backend): FR-2679 — ModelDeployment access token
        // delete mutation is not yet exposed in the GraphQL schema.
        // When the backend adds e.g. `deleteAccessToken(input: { id })`,
        // wire it up here and call handleRefetch() on success.
        void tokenId;
        message.warning({
          key: 'access-token-delete-not-implemented',
          content: t('deployment.accessToken.Delete'),
        });
      },
    });
  };

  const truncateToken = (rawToken: string) => {
    if (rawToken.length <= 16) return rawToken;
    return `${rawToken.slice(0, 8)}…${rawToken.slice(-4)}`;
  };

  return (
    <>
      <BAIFlex direction="column" align="stretch" gap="sm">
        <BAIFlex justify="end" gap="xs">
          <BAIFetchKeyButton
            loading={isPendingRefetch}
            value=""
            onChange={handleRefetch}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={isDeploymentDestroying || !isOwnedByCurrentUser}
            onClick={() => setIsCreateModalOpen(true)}
          >
            {t('deployment.accessToken.Create')}
          </Button>
        </BAIFlex>
        <BAITable<AccessTokenNode>
          scroll={{ x: 'max-content' }}
          rowKey="id"
          loading={isPendingRefetch}
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
                      <Typography.Text code style={{ fontSize: 12 }}>
                        {truncateToken(row.token)}
                      </Typography.Text>
                    }
                    showActions="always"
                    actions={[
                      {
                        key: 'delete',
                        title: t('button.Delete'),
                        icon: <DeleteOutlined />,
                        type: 'danger',
                        disabled:
                          isDeploymentDestroying || !isOwnedByCurrentUser,
                        onClick: () => handleDeleteToken(row.id),
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
      </BAIFlex>

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
                  expiresAt: result.expiresAt,
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
          onOk={() => setCreatedToken(null)}
          onCancel={() => setCreatedToken(null)}
          cancelButtonProps={{ style: { display: 'none' } }}
          okText={t('button.OK')}
          width={520}
        >
          <BAIFlex direction="column" align="stretch" gap="sm">
            <Alert
              type="warning"
              showIcon
              title={t('deployment.accessToken.Created')}
              description={t('dialog.warning.CannotBeUndone')}
            />
            {createdToken ? (
              <div
                style={{
                  padding: token.paddingSM,
                  backgroundColor: token.colorFillQuaternary,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadiusSM,
                  wordBreak: 'break-all',
                }}
              >
                <Typography.Text copyable={{ text: createdToken.token }} code>
                  {createdToken.token}
                </Typography.Text>
              </div>
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
        {/* Hidden field so validateFields() includes expiryOption. */}
        <Form.Item name="expiryOption" hidden rules={[{ required: true }]}>
          <input type="hidden" />
        </Form.Item>
        <Form.Item label={t('deployment.accessToken.Expiration')} required>
          <BAIFlex direction="column" align="stretch" gap="xs">
            {options.map((opt) => (
              <Button
                key={String(opt.value)}
                type={expiryOption === opt.value ? 'primary' : 'default'}
                onClick={() => {
                  form.setFieldValue('expiryOption', opt.value);
                  if (typeof opt.value === 'number') {
                    form.setFieldValue(
                      'datetime',
                      dayjs().add(opt.value, 'day'),
                    );
                  }
                }}
              >
                {opt.label}
              </Button>
            ))}
          </BAIFlex>
        </Form.Item>
        {expiryOption === 'custom' && (
          <Form.Item
            name="datetime"
            label={t('deployment.accessToken.CustomExpiration')}
            rules={[
              {
                type: 'object' as const,
                required: true,
                message: t('dialog.ErrorOccurred'),
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
