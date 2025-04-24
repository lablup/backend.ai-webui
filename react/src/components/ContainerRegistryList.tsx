import { filterNonNullItems, transformSorterToOrderString } from '../helper';
import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import { usePainKiller } from '../hooks/usePainKiller';
import BAIModal from './BAIModal';
import BAIPropertyFilter from './BAIPropertyFilter';
import ContainerRegistryEditorModal from './ContainerRegistryEditorModal';
import Flex from './Flex';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import { ContainerRegistryListDeleteMutation } from './__generated__/ContainerRegistryListDeleteMutation.graphql';
import { ContainerRegistryListDomainMutation } from './__generated__/ContainerRegistryListDomainMutation.graphql';
import {
  ContainerRegistryListQuery,
  ContainerRegistryListQuery$data,
} from './__generated__/ContainerRegistryListQuery.graphql';
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
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
  Table,
  Tag,
  Tooltip,
  Typography,
  theme,
  App,
} from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import { ColumnsType, ColumnType } from 'antd/es/table';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery, useMutation } from 'react-relay';

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
  const baiClient = useSuspendedBackendaiClient();
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [isPendingReload, startReloadTransition] = useTransition();
  const painKiller = usePainKiller();
  const { message } = App.useApp();
  const { upsertNotification } = useSetBAINotification();
  const [isPendingFilter, startFilterTransition] = useTransition();
  const [isPendingPageChange, startPageChangeTransition] = useTransition();
  const [filterString, setFilterString] = useState<string>();
  const [visibleColumnSettingModal, { toggle: toggleColumnSettingModal }] =
    useToggle();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 20,
  });
  const [order, setOrder] = useState<string>();

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
      {
        domain: baiClient._config.domainName,
        filter: filterString,
        order,
        first: baiPaginationOption.limit,
        offset: baiPaginationOption.offset,
      },
      {
        fetchPolicy:
          fetchKey === 'first' ? 'store-and-network' : 'network-only',
        fetchKey,
      },
    );
  const containerRegistries = _.map(container_registry_nodes?.edges, 'node');

  const [commitDeleteMutation, isInFlightDeleteMutation] =
    useMutation<ContainerRegistryListDeleteMutation>(graphql`
      mutation ContainerRegistryListDeleteMutation($id: String!) {
        delete_container_registry_node(id: $id) {
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

  // const deferredInFlightDomainName = useDeferredValue(inFlightDomainName);

  const rescanImage = async (registry_name: string) => {
    // const indicator: any =
    //   // @ts-ignore
    //   await globalThis.lablupIndicator.start('indeterminate');

    // indicator.set(10, t('registry.UpdatingRegistryInfo'));
    const notiKey = upsertNotification({
      // key: notiKey,
      message: `${registry_name} ${t('maintenance.RescanImages')}`,
      description: t('registry.UpdatingRegistryInfo'),
      open: true,
      backgroundTask: {
        status: 'pending',
      },
      duration: 0,
    });
    const handleReScanError = (err: any) => {
      console.log(err);
      upsertNotification({
        key: notiKey,
        backgroundTask: {
          status: 'rejected',
        },
        duration: 1,
      });
      if (err && err.message) {
        // @ts-ignore
        globalThis.lablupNotification.text = painKiller.relieve(err.title);
        // @ts-ignore
        globalThis.lablupNotification.detail = err.message;
        // @ts-ignore
        globalThis.lablupNotification.show(true, err);
      }
    };
    baiClient.maintenance
      .rescan_images(registry_name)
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
          // indicator.set(0, t('registry.RescanImages'));
          // const sse: EventSource = baiClient.maintenance.attach_background_task(
          //   rescan_images.task_id,
          // );
          // sse.addEventListener('bgtask_updated', (e) => {
          //   const data = JSON.parse(e['data']);
          //   const ratio = data.current_progress / data.total_progress;
          //   indicator.set(100 * ratio, t('registry.RescanImages'));
          // });
          // sse.addEventListener('bgtask_done', () => {
          //   const event = new CustomEvent('image-rescanned');
          //   document.dispatchEvent(event);
          //   indicator.set(100, t('registry.RegistryUpdateFinished'));
          //   sse.close();
          // });
          // sse.addEventListener('bgtask_failed', (e) => {
          //   console.log('bgtask_failed', e['data']);
          //   sse.close();
          //   handleReScanError(
          //     new Error('Background Image scanning task has failed'),
          //   );
          // });
          // sse.addEventListener('bgtask_cancelled', () => {
          //   sse.close();
          //   handleReScanError(
          //     new Error('Background Image scanning task has been cancelled'),
          //   );
          // });
        } else {
          upsertNotification({
            key: notiKey,
            backgroundTask: {
              status: 'rejected',
            },
            duration: 1,
          });
          // indicator.set(50, t('registry.RegistryUpdateFailed'));
          // indicator.end(1000);
          // TODO: handle notification in react side
          // @ts-ignore
          // globalThis.lablupNotification.text = painKiller.relieve(
          //   rescan_images.msg,
          // );
          // @ts-ignore
          // globalThis.lablupNotification.detail = rescan_images.msg;
          // @ts-ignore
          // globalThis.lablupNotification.show();
        }
      })
      .catch(handleReScanError);
  };

  const columns: ColumnsType<ContainerRegistry> = [
    // {
    //   title: '#',
    //   dataIndex: 'id',
    // },
    {
      key: 'registry_name',
      title: t('registry.RegistryName'),
      dataIndex: 'registry_name',
      sorter: true,
      // fixed: 'left',
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
      render: (value, record) => {
        const isEnabled = _.includes(
          domain?.allowed_docker_registries,
          record.registry_name,
        );
        return (
          <Switch
            checked={
              inFlightHostName === record.id + fetchKey ? !isEnabled : isEnabled
            }
            disabled={isPendingReload || isInFlightDomainMutation}
            loading={
              (isPendingReload || isInFlightDomainMutation) &&
              inFlightHostName === record.id + fetchKey
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

              setInFlightHostName(record.id + fetchKey);
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
                      message.error(error, 2.5);
                    }
                  } else {
                    startReloadTransition(() => {
                      updateFetchKey();
                    });
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
          // <Button type="primary">
          //   {record?.ssl_verify ? 'Yes' : 'No'}
          // </Button>
        );
      },
    },
    {
      title: t('general.Control'),
      fixed: 'right',
      render(value, record, index) {
        return (
          <Flex>
            <Tooltip title={t('button.Edit')}>
              <Button
                size="large"
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
                size="large"
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
                size="large"
                type="text"
                icon={
                  <SyncOutlined
                    onClick={() => {
                      record.registry_name && rescanImage(record.registry_name);
                    }}
                  />
                }
              />
            </Tooltip>
          </Flex>
        );
      },
    },
  ];

  const [hiddenColumnKeys, setHiddenColumnKeys] = useHiddenColumnKeysSetting(
    'ContainerRegistryList',
  );

  return (
    <Flex
      direction="column"
      align="stretch"
      style={{
        flex: 1,
        ...style,
        // height: 'calc(100vh - 183px)',
      }}
    >
      <Flex
        direction="row"
        justify="end"
        gap={'sm'}
        style={{
          padding: token.paddingContentVertical,
          paddingLeft: token.paddingContentHorizontalSM,
          paddingRight: token.paddingContentHorizontalSM,
        }}
      >
        <BAIPropertyFilter
          filterProperties={[
            // {
            //   key: 'row_id',
            //   propertyLabel: 'ID',
            //   type: 'string',
            // },
            {
              key: 'registry_name',
              propertyLabel: t('registry.RegistryName'),
              type: 'string',
            },
          ]}
          value={filterString}
          onChange={(value) => {
            startFilterTransition(() => {
              setFilterString(value);
            });
          }}
        />
        <Tooltip title={t('button.Refresh')}>
          <Button
            loading={isPendingReload}
            icon={<ReloadOutlined />}
            onClick={() => {
              startReloadTransition(() => {
                updateFetchKey();
              });
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
      </Flex>
      <Table
        rowKey={(record) => record.id}
        scroll={{ x: 'max-content' }}
        showSorterTooltip={false}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          showSizeChanger: true,
          total: container_registry_nodes?.count ?? 0,
          current: tablePaginationOption.current,
          showTotal(total, range) {
            return `${range[0]}-${range[1]} of ${total} items`;
          },
          pageSizeOptions: ['10', '20', '50'],
          style: { marginRight: token.marginXS },
        }}
        onChange={({ pageSize, current }, filters, sorter) => {
          startPageChangeTransition(() => {
            if (_.isNumber(current) && _.isNumber(pageSize)) {
              setTablePaginationOption({
                current,
                pageSize,
              });
            }
            setOrder(transformSorterToOrderString(sorter));
          });
        }}
        loading={{
          spinning: isPendingPageChange || isPendingFilter,
          indicator: <LoadingOutlined />,
        }}
        dataSource={filterNonNullItems(containerRegistries)}
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
              onCompleted: (res, error) => {
                if (error) {
                  setDeletingRegistry(null);
                  message.error({
                    key: 'registry-deletion-failed',
                    content: t('dialog.ErrorOccurred'),
                  });
                } else {
                  startReloadTransition(() => {
                    updateFetchKey();
                  });
                  message.success({
                    key: 'registry-deleted',
                    content: t('registry.RegistrySuccessfullyDeleted'),
                  });
                  setDeletingRegistry(null);
                }
              },
              onError: (error) => {
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
        destroyOnClose
        open={!!deletingRegistry}
      >
        <Flex
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
        </Flex>
      </BAIModal>
      <Flex
        justify="end"
        style={{
          padding: token.paddingXXS,
        }}
      >
        <Button
          type="text"
          icon={<SettingOutlined />}
          onClick={() => {
            toggleColumnSettingModal();
          }}
        />
      </Flex>
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
    </Flex>
  );
};

export default ContainerRegistryList;
