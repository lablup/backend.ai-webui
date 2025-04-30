import { filterNonNullItems } from '../helper';
import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { usePainKiller } from '../hooks/usePainKiller';
import BAIModal from './BAIModal';
import ContainerRegistryEditorModal from './ContainerRegistryEditorModalBefore2409';
import Flex from './Flex';
import { ContainerRegistryListBefore2409DeleteMutation } from './__generated__/ContainerRegistryListBefore2409DeleteMutation.graphql';
import { ContainerRegistryListBefore2409DomainMutation } from './__generated__/ContainerRegistryListBefore2409DomainMutation.graphql';
import {
  ContainerRegistryListBefore2409Query,
  ContainerRegistryListBefore2409Query$data,
} from './__generated__/ContainerRegistryListBefore2409Query.graphql';
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  SyncOutlined,
} from '@ant-design/icons';
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
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery, useMutation } from 'react-relay';

export type ContainerRegistry = NonNullable<
  NonNullable<
    NonNullable<ContainerRegistryListBefore2409Query$data>['container_registries']
  >
>[0];

const ContainerRegistryListBefore2409: React.FC<{
  style?: React.CSSProperties;
}> = ({ style }) => {
  const baiClient = useSuspendedBackendaiClient();
  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');
  const [isPendingReload, startReloadTransition] = useTransition();
  const painKiller = usePainKiller();
  const { message } = App.useApp();
  const { upsertNotification } = useSetBAINotification();

  const { container_registries, domain } =
    useLazyLoadQuery<ContainerRegistryListBefore2409Query>(
      graphql`
        query ContainerRegistryListBefore2409Query($domain: String!) {
          container_registries {
            ...ContainerRegistryEditorModalBefore2409Fragment
            id
            hostname
            config {
              url
              type
              project
              username
              password
              ssl_verify
            }
          }
          domain(name: $domain) {
            name
            allowed_docker_registries
          }
        }
      `,
      {
        domain: baiClient._config.domainName,
      },
      {
        fetchPolicy: 'store-and-network',
        fetchKey,
      },
    );

  const [commitDeleteMutation, isInFlightDeleteMutation] =
    useMutation<ContainerRegistryListBefore2409DeleteMutation>(graphql`
      mutation ContainerRegistryListBefore2409DeleteMutation(
        $hostname: String!
      ) {
        delete_container_registry(hostname: $hostname) {
          container_registry {
            id
          }
        }
      }
    `);

  const [commitDomainMutation, isInFlightDomationMutation] =
    useMutation<ContainerRegistryListBefore2409DomainMutation>(graphql`
      mutation ContainerRegistryListBefore2409DomainMutation(
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
    useState<ContainerRegistry>(null);
  const [deletingRegistry, setDeletingRegistry] =
    useState<ContainerRegistry>(null);
  const [deletingConfirmText, setDeletingConfirmText] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const [inFlightHostName, setInFlightHostName] = useState<string>();

  // const deferredInFlightDomainName = useDeferredValue(inFlightDomainName);

  const rescanImage = async (hostname: string) => {
    // const indicator: any =
    //   // @ts-ignore
    //   await globalThis.lablupIndicator.start('indeterminate');

    // indicator.set(10, t('registry.UpdatingRegistryInfo'));
    const notiKey = upsertNotification({
      // key: notiKey,
      message: `${hostname} ${t('maintenance.RescanImages')}`,
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
      .rescan_images(hostname)
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
        pagination={false}
        columns={[
          // {
          //   title: '#',
          //   dataIndex: 'id',
          // },
          {
            title: t('registry.Hostname'),
            dataIndex: 'hostname',
            // fixed: 'left',
          },
          {
            title: t('registry.RegistryURL'),
            dataIndex: ['config', 'url'],
          },
          {
            title: t('registry.Type'),
            dataIndex: ['config', 'type'],
          },
          {
            title: t('registry.HarborProject'),
            dataIndex: ['config', 'project'],
            render: (value: string[], record) => {
              return _.map(value, (v) => <Tag key={v || ''}>{v || ''}</Tag>);
            },
          },
          {
            title: t('registry.Username'),
            dataIndex: ['config', 'username'],
          },
          {
            title: t('registry.Password'),
            dataIndex: ['config', 'password'],
          },
          {
            title: t('general.Enabled'),
            render: (value, record) => {
              const isEnabled = _.includes(
                domain?.allowed_docker_registries,
                record.hostname,
              );
              return (
                <Switch
                  checked={
                    inFlightHostName === record.hostname + fetchKey
                      ? !isEnabled
                      : isEnabled
                  }
                  disabled={isPendingReload || isInFlightDomationMutation}
                  loading={
                    (isPendingReload || isInFlightDomationMutation) &&
                    inFlightHostName === record.hostname + fetchKey
                  }
                  onChange={(isOn) => {
                    if (!_.isString(record.hostname)) return;
                    let newAllowedDockerRegistries = _.clone(
                      domain?.allowed_docker_registries || [],
                    ) as string[];
                    if (isOn) {
                      newAllowedDockerRegistries.push(record.hostname);
                    } else {
                      newAllowedDockerRegistries = _.without(
                        newAllowedDockerRegistries,
                        record.hostname,
                      );
                    }

                    setInFlightHostName(record.hostname + fetchKey);
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
                          startReloadTransition(() => {
                            updateFetchKey();
                          });
                        }

                        message.info({
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
                //   {record?.config?.ssl_verify ? 'Yes' : 'No'}
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
                            record.hostname && rescanImage(record.hostname);
                          }}
                        />
                      }
                    />
                  </Tooltip>
                </Flex>
              );
            },
          },
        ]}
        dataSource={filterNonNullItems(container_registries)}
      />
      <ContainerRegistryEditorModal
        containerRegistryFrgmt={editingRegistry}
        existingHostnames={_.map(
          container_registries,
          (r) => r?.hostname || '',
        )}
        open={!!editingRegistry || isNewModalOpen}
        onOk={(type) => {
          if (type === 'create') {
            updateFetchKey();
            message.info({
              key: 'registry-added',
              content: t('registry.RegistrySuccessfullyAdded'),
            });
          } else if (type === 'modify') {
            message.info({
              key: 'registry-modified',
              content: t('registry.RegistrySuccessfullyModified'),
            });
          }
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
          disabled: deletingConfirmText !== deletingRegistry?.hostname,
        }}
        onOk={() => {
          if (deletingRegistry) {
            commitDeleteMutation({
              variables: {
                hostname: deletingRegistry.hostname || '',
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
                  message.info({
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
            <Typography.Text code>{deletingRegistry?.hostname}</Typography.Text>{' '}
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
                    if (deletingConfirmText === deletingRegistry?.hostname) {
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
    </Flex>
  );
};

export default ContainerRegistryListBefore2409;
