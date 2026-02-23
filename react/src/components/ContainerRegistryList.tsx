/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ContainerRegistryListDeleteMutation } from '../__generated__/ContainerRegistryListDeleteMutation.graphql';
import { ContainerRegistryListDomainMutation } from '../__generated__/ContainerRegistryListDomainMutation.graphql';
import {
  ContainerRegistryListQuery,
  ContainerRegistryListQuery$data,
} from '../__generated__/ContainerRegistryListQuery.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParamLegacy } from '../hooks/reactPaginationQueryOptions';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import { usePainKiller } from '../hooks/usePainKiller';
import ContainerRegistryEditorModal from './ContainerRegistryEditorModal';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  Button,
  Form,
  Input,
  Switch,
  Tag,
  Tooltip,
  Typography,
  theme,
  App,
} from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import {
  filterOutNullAndUndefined,
  BAITable,
  BAIFlex,
  BAIPropertyFilter,
  BAIModal,
  useBAILogger,
  useFetchKey,
  INITIAL_FETCH_KEY,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useState, useDeferredValue, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import { StringParam, useQueryParams, withDefault } from 'use-query-params';

export type ContainerRegistry = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<ContainerRegistryListQuery$data>['container_registry_nodes']
    >['edges'][number]
  >['node']
>;

const ContainerRegistryList: React.FC<{
  style?: React.CSSProperties;
}> = ({ style }) => {
  const { logger } = useBAILogger();
  const baiClient = useSuspendedBackendaiClient();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const painKiller = usePainKiller();
  const { message } = App.useApp();
  const { upsertNotification } = useSetBAINotification();
  const [visibleColumnSettingModal, { toggle: toggleColumnSettingModal }] =
    useToggle();

  const [queryParams, setQueryParams] = useQueryParams({
    filter: withDefault(StringParam, undefined),
    order: withDefault(StringParam, undefined),
  });

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParamLegacy({
    current: 1,
    pageSize: 20,
  });

  const queryVariables = useMemo(
    () => ({
      domain: baiClient._config.domainName,
      filter: queryParams.filter,
      order: queryParams.order,
      first: baiPaginationOption.limit,
      offset: baiPaginationOption.offset,
    }),
    [
      baiClient._config.domainName,
      queryParams.filter,
      queryParams.order,
      baiPaginationOption.limit,
      baiPaginationOption.offset,
    ],
  );

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { container_registry_nodes, domain } =
    useLazyLoadQuery<ContainerRegistryListQuery>(
      graphql`
        query ContainerRegistryListQuery(
          $domain: String!
          $filter: String
          $order: String
          $first: Int
          $offset: Int
        ) {
          container_registry_nodes(
            filter: $filter
            order: $order
            first: $first
            offset: $offset
          ) @since(version: "24.09.0") {
            edges {
              node {
                ...ContainerRegistryEditorModalFragment
                id
                row_id
                registry_name
                name
                url
                type
                project
                username
                password
                ssl_verify
              }
            }
            count
          }
          domain(name: $domain) {
            name
            allowed_docker_registries
          }
        }
      `,
      deferredQueryVariables,
      {
        fetchPolicy:
          deferredFetchKey === INITIAL_FETCH_KEY
            ? 'store-and-network'
            : 'network-only',
        fetchKey: deferredFetchKey,
      },
    );
  const containerRegistries = _.map(container_registry_nodes?.edges, 'node');

  const [commitDeleteMutation, isInFlightDeleteMutation] =
    useMutation<ContainerRegistryListDeleteMutation>(graphql`
      mutation ContainerRegistryListDeleteMutation($id: String!) {
        delete_container_registry_node_v2(id: $id) {
          container_registry {
            id
          }
        }
      }
    `);

  const [commitDomainMutation, isInFlightDomainMutation] =
    useMutation<ContainerRegistryListDomainMutation>(graphql`
      mutation ContainerRegistryListDomainMutation(
        $domain: String!
        $allowed_docker_registries: [String]!
      ) {
        modify_domain(
          name: $domain
          props: { allowed_docker_registries: $allowed_docker_registries }
        ) {
          ok
          msg
          # TODO: update domain when it supports relay global id
          # domain {
          #   name
          #   allowed_vfolder_hosts
          # }
        }
      }
    `);

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [editingRegistry, setEditingRegistry] =
    useState<ContainerRegistry | null>();
  const [deletingRegistry, setDeletingRegistry] =
    useState<ContainerRegistry | null>();
  const [deletingConfirmText, setDeletingConfirmText] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const [inFlightHostName, setInFlightHostName] = useState<string>();

  const rescanImage = async (
    registry_name: string,
    project: string | undefined | null,
  ) => {
    const notiKey = upsertNotification({
      message: `${t('maintenance.RescanImages')}: ${registry_name}${project ? `/${project}` : ''}`,
      description: t('registry.UpdatingRegistryInfo'),
      open: true,
      backgroundTask: {
        status: 'pending',
      },
      duration: 0,
    });
    const handleReScanError = (err: any) => {
      logger.error(err);
      upsertNotification({
        key: notiKey,
        backgroundTask: {
          status: 'rejected',
        },
        duration: 1,
      });
      if (err && err.message) {
        document.dispatchEvent(
          new CustomEvent('add-bai-notification', {
            detail: {
              open: true,
              type: 'error',
              message: painKiller.relieve(err.title),
              description: err.message,
            },
          }),
        );
      }
    };
    const isSupportImageRescanByProject = baiClient.supports(
      'image_rescan_by_project',
    );
    baiClient.maintenance
      .rescan_images(
        registry_name,
        isSupportImageRescanByProject ? (project ?? undefined) : undefined,
      )
      .then(({ rescan_images }: any) => {
        if (rescan_images.ok) {
          upsertNotification({
            key: notiKey,
            backgroundTask: {
              status: 'pending',
              percent: 0,
              taskId: rescan_images.task_id,
              onChange: {
                pending: t('registry.RescanImages'),
                resolved: t('registry.RegistryUpdateFinished'),
                rejected: t('registry.RegistryUpdateFailed'),
              },
            },
          });
        } else {
          upsertNotification({
            key: notiKey,
            backgroundTask: {
              status: 'rejected',
            },
            duration: 1,
          });
        }
      })
      .catch(handleReScanError);
  };

  const columns: ColumnsType<ContainerRegistry> = [
    {
      key: 'registry_name',
      title: t('registry.RegistryName'),
      dataIndex: 'registry_name',
      sorter: true,
    },
    {
      key: 'url',
      title: t('registry.RegistryURL'),
      dataIndex: 'url',
    },
    {
      key: 'type',
      title: t('registry.Type'),
      dataIndex: 'type',
    },
    {
      key: 'project',
      title: t('registry.Project'),
      dataIndex: 'project',
      render: (value) => {
        return <Tag key={value || ''}>{value || ''}</Tag>;
      },
    },
    {
      key: 'username',
      title: t('registry.Username'),
      dataIndex: 'username',
    },
    {
      key: 'password',
      title: t('registry.Password'),
      dataIndex: 'password',
    },
    {
      key: 'enabled',
      title: t('general.Enabled'),
      render: (_value, record) => {
        const isEnabled = _.includes(
          domain?.allowed_docker_registries,
          record.registry_name,
        );
        return (
          <Switch
            checked={
              inFlightHostName === record.id + deferredFetchKey
                ? !isEnabled
                : isEnabled
            }
            disabled={deferredFetchKey !== fetchKey || isInFlightDomainMutation}
            loading={
              (deferredFetchKey !== fetchKey || isInFlightDomainMutation) &&
              inFlightHostName === record.id + deferredFetchKey
            }
            onChange={(isOn) => {
              if (!_.isString(record.registry_name)) return;
              let newAllowedDockerRegistries = _.clone(
                domain?.allowed_docker_registries || [],
              ) as string[];
              if (isOn) {
                newAllowedDockerRegistries.push(record.registry_name);
              } else {
                newAllowedDockerRegistries = _.without(
                  newAllowedDockerRegistries,
                  record.registry_name,
                );
              }

              setInFlightHostName(record.id + deferredFetchKey);
              commitDomainMutation({
                variables: {
                  domain: baiClient._config.domainName,
                  allowed_docker_registries: newAllowedDockerRegistries,
                },
                onCompleted: (res, errors) => {
                  if (!res?.modify_domain?.ok) {
                    message.error(res?.modify_domain?.msg);
                    return;
                  }
                  if (errors && errors?.length > 0) {
                    const errorMsgList = _.map(
                      errors,
                      (error) => error.message,
                    );
                    for (const error of errorMsgList) {
                      message.error(error);
                    }
                  } else {
                    updateFetchKey();
                  }

                  message.success({
                    key: 'registry-enabled',
                    content: isOn
                      ? t('registry.RegistryTurnedOn')
                      : t('registry.RegistryTurnedOff'),
                  });
                },
              });
            }}
          />
        );
      },
    },
    {
      title: t('general.Control'),
      fixed: 'right',
      render(_value, record) {
        return (
          <BAIFlex>
            <Tooltip title={t('button.Edit')}>
              <Button
                style={{
                  color: token.colorInfo,
                }}
                type="text"
                icon={<SettingOutlined />}
                onClick={() => {
                  setEditingRegistry(record);
                }}
              />
            </Tooltip>
            <Tooltip title={t('button.Delete')}>
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => {
                  setDeletingRegistry(record);
                }}
              />
            </Tooltip>
            <Tooltip title={t('maintenance.RescanImages')}>
              <Button
                type="text"
                icon={
                  <SyncOutlined
                    onClick={() => {
                      record.registry_name &&
                        rescanImage(record.registry_name, record.project);
                    }}
                  />
                }
              />
            </Tooltip>
          </BAIFlex>
        );
      },
    },
  ];

  const [hiddenColumnKeys, setHiddenColumnKeys] = useHiddenColumnKeysSetting(
    'ContainerRegistryList',
  );

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="sm"
      style={{
        flex: 1,
        ...style,
        // height: 'calc(100vh - 183px)',
      }}
    >
      <BAIFlex
        direction="row"
        justify="between"
        gap={'sm'}
        align="start"
        wrap="wrap"
      >
        <BAIPropertyFilter
          filterProperties={[
            {
              key: 'registry_name',
              propertyLabel: t('registry.RegistryName'),
              type: 'string',
            },
          ]}
          value={queryParams.filter}
          onChange={(value) => {
            setQueryParams({ filter: value }, 'replaceIn');
          }}
        />
        <BAIFlex gap="xs">
          <Tooltip title={t('button.Refresh')}>
            <Button
              loading={deferredFetchKey !== fetchKey}
              icon={<ReloadOutlined />}
              onClick={() => {
                updateFetchKey();
              }}
            />
          </Tooltip>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsNewModalOpen(true);
            }}
          >
            {t('registry.AddRegistry')}
          </Button>
        </BAIFlex>
      </BAIFlex>
      <BAITable
        rowKey={(record) => record.id}
        scroll={{ x: 'max-content' }}
        showSorterTooltip={false}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          total: container_registry_nodes?.count ?? 0,
          current: tablePaginationOption.current,
          onChange(current, pageSize) {
            if (_.isNumber(current) && _.isNumber(pageSize)) {
              setTablePaginationOption({
                current,
                pageSize,
              });
            }
          },
          extraContent: (
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => {
                toggleColumnSettingModal();
              }}
            />
          ),
        }}
        onChangeOrder={(order) => {
          setQueryParams({ order }, 'replaceIn');
        }}
        loading={
          deferredQueryVariables !== queryVariables ||
          deferredFetchKey !== fetchKey
        }
        dataSource={filterOutNullAndUndefined(containerRegistries)}
        columns={
          _.filter(
            columns,
            (column) => !_.includes(hiddenColumnKeys, _.toString(column?.key)),
          ) as ColumnType<AnyObject>[]
        }
      />
      <ContainerRegistryEditorModal
        containerRegistryFrgmt={editingRegistry}
        open={!!editingRegistry || isNewModalOpen}
        onOk={(type) => {
          if (type === 'create') {
            message.success({
              key: 'registry-added',
              content: t('registry.RegistrySuccessfullyAdded'),
            });
          } else if (type === 'modify') {
            message.success({
              key: 'registry-modified',
              content: t('registry.RegistrySuccessfullyModified'),
            });
          }
          updateFetchKey();
          setEditingRegistry(null);
          setIsNewModalOpen(false);
        }}
        onCancel={() => {
          setEditingRegistry(null);
          setIsNewModalOpen(false);
        }}
        centered={false}
      />
      <BAIModal
        title={
          <>
            <ExclamationCircleOutlined
              style={{
                color: token.colorWarning,
              }}
            />{' '}
            {t('dialog.warning.CannotBeUndone')}
          </>
        }
        okText={t('button.Delete')}
        okButtonProps={{
          danger: true,
          disabled: deletingConfirmText !== deletingRegistry?.registry_name,
        }}
        onOk={() => {
          if (deletingRegistry) {
            commitDeleteMutation({
              variables: {
                id: deletingRegistry.id,
              },
              onCompleted: (_res, error) => {
                if (error) {
                  setDeletingRegistry(null);
                  message.error({
                    key: 'registry-deletion-failed',
                    content: t('dialog.ErrorOccurred'),
                  });
                } else {
                  updateFetchKey();
                  message.success({
                    key: 'registry-deleted',
                    content: t('registry.RegistrySuccessfullyDeleted'),
                  });
                  setDeletingRegistry(null);
                }
              },
              onError: () => {
                message.error({
                  key: 'registry-deletion-failed',
                  content: t('dialog.ErrorOccurred'),
                });
              },
            });
          } else {
            setDeletingRegistry(null);
          }
        }}
        confirmLoading={isInFlightDeleteMutation}
        onCancel={() => {
          setDeletingRegistry(null);
        }}
        destroyOnHidden
        open={!!deletingRegistry}
      >
        <BAIFlex
          direction="column"
          align="stretch"
          gap="sm"
          style={{
            marginTop: token.marginMD,
          }}
        >
          <Typography.Text>
            <Typography.Text code>
              {deletingRegistry?.registry_name}
            </Typography.Text>{' '}
            {t('registry.TypeRegistryNameToDelete')}
          </Typography.Text>
          <Form>
            <Form.Item
              name={'confirmText'}
              rules={[
                {
                  required: true,
                  message: t('registry.HostnameDoesNotMatch'),
                  validator: () => {
                    if (
                      deletingConfirmText === deletingRegistry?.registry_name
                    ) {
                      return Promise.resolve();
                    }
                    return Promise.reject();
                  },
                },
              ]}
            >
              <Input
                autoComplete="off"
                value={deletingConfirmText}
                onChange={(e) => setDeletingConfirmText(e.target.value)}
              />
            </Form.Item>
          </Form>
        </BAIFlex>
      </BAIModal>
      <TableColumnsSettingModal
        open={visibleColumnSettingModal}
        onRequestClose={(values) => {
          values?.selectedColumnKeys &&
            setHiddenColumnKeys(
              _.difference(
                columns.map((column) => _.toString(column.key)),
                values?.selectedColumnKeys,
              ),
            );
          toggleColumnSettingModal();
        }}
        columns={columns}
        hiddenColumnKeys={hiddenColumnKeys}
      />
    </BAIFlex>
  );
};

export default ContainerRegistryList;
