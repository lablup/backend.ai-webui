import { filterNonNullItems } from '../helper';
import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import { usePainKiller } from '../hooks/usePainKiller';
import BAIModal from './BAIModal';
import ContainerRegistryEditorModal from './ContainerRegistryEditorModal';
import Flex from './Flex';
import { ContainerRegistryListDeleteMutation } from './__generated__/ContainerRegistryListDeleteMutation.graphql';
import { ContainerRegistryListDomainMutation } from './__generated__/ContainerRegistryListDomainMutation.graphql';
import {
  ContainerRegistryListQuery,
  ContainerRegistryListQuery$data,
} from './__generated__/ContainerRegistryListQuery.graphql';
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
  message,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery, useMutation } from 'react-relay';

export type ContainerRegistry = NonNullable<
  NonNullable<
    NonNullable<ContainerRegistryListQuery$data>['container_registries']
  >
>[0];

const ContainerRegistryList = () => {
  const baiClient = useSuspendedBackendaiClient();
  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');
  const [isPendingReload, startReloadTransition] = useTransition();
  const painKiller = usePainKiller();
  const [messageAPI, contextHolder] = message.useMessage();
  const { container_registries, domain } =
    useLazyLoadQuery<ContainerRegistryListQuery>(
      graphql`
        query ContainerRegistryListQuery($domain: String!) {
          container_registries {
            ...ContainerRegistryEditorModalFragment
            id
            hostname
            config {
              url
              type
              project
              username
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
        fetchPolicy: 'network-only',
        fetchKey,
      },
    );

  const [commitDeleteMutation, isInFlightDeleteMutation] =
    useMutation<ContainerRegistryListDeleteMutation>(graphql`
      mutation ContainerRegistryListDeleteMutation($hostname: String!) {
        delete_container_registry(hostname: $hostname) {
          container_registry {
            id
          }
        }
      }
    `);

  const [commitDomainMutation, isInFlightDomationMutation] =
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
    const indicator: any =
      // @ts-ignore
      await globalThis.lablupIndicator.start('indeterminate');
    const handleReScanError = (err: any) => {
      console.log(err);
      indicator.set(50, t('registry.RescanFailed'));
      indicator.end(1000);
      if (err && err.message) {
        // @ts-ignore
        globalThis.lablupNotification.text = painKiller.relieve(err.title);
        // @ts-ignore
        globalThis.lablupNotification.detail = err.message;
        // @ts-ignore
        globalThis.lablupNotification.show(true, err);
      }
    };
    indicator.set(10, t('registry.UpdatingRegistryInfo'));
    baiClient.maintenance
      .rescan_images(hostname)
      .then(({ rescan_images }: any) => {
        if (rescan_images.ok) {
          indicator.set(0, t('registry.RescanImages'));
          const sse: EventSource = baiClient.maintenance.attach_background_task(
            rescan_images.task_id,
          );
          sse.addEventListener('bgtask_updated', (e) => {
            const data = JSON.parse(e['data']);
            const ratio = data.current_progress / data.total_progress;
            indicator.set(100 * ratio, t('registry.RescanImages'));
          });
          sse.addEventListener('bgtask_done', () => {
            const event = new CustomEvent('image-rescanned');
            document.dispatchEvent(event);
            indicator.set(100, t('registry.RegistryUpdateFinished'));
            sse.close();
          });
          sse.addEventListener('bgtask_failed', (e) => {
            console.log('bgtask_failed', e['data']);
            sse.close();
            handleReScanError(
              new Error('Background Image scanning task has failed'),
            );
          });
          sse.addEventListener('bgtask_cancelled', () => {
            sse.close();
            handleReScanError(
              new Error('Background Image scanning task has been cancelled'),
            );
          });
        } else {
          indicator.set(50, t('registry.RegistryUpdateFailed'));
          indicator.end(1000);

          // TODO: handle notification in react side
          // @ts-ignore
          globalThis.lablupNotification.text = painKiller.relieve(
            rescan_images.msg,
          );
          // @ts-ignore
          globalThis.lablupNotification.detail = rescan_images.msg;
          // @ts-ignore
          globalThis.lablupNotification.show();
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
        // height: 'calc(100vh - 183px)',
      }}
    >
      {contextHolder}
      <Flex
        direction="row"
        justify="end"
        gap={'sm'}
        style={{ padding: token.paddingSM }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setIsNewModalOpen(true);
          }}
        >
          {t('registry.AddRegistry')}
        </Button>
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
      </Flex>
      <Table
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
            render: (value, record) => {
              return _.map(record.config?.project, (prjName) => {
                return <Tag key={prjName}>{prjName || ''}</Tag>;
              });
            },
          },
          {
            title: t('registry.Username'),
            dataIndex: ['config', 'username'],
          },
          // {
          // title: t('registry.Password')
          // },
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
                  loading={inFlightHostName === record.hostname + fetchKey}
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
                      onCompleted: (data) => {
                        startReloadTransition(() => {
                          updateFetchKey();
                        });

                        messageAPI.info({
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
            messageAPI.info(t('registry.RegistrySuccessfullyAdded'));
          } else if (type === 'modify') {
            messageAPI.info(t('registry.RegistrySuccessfullyModified'));
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
              onCompleted: (response, error) => {
                if (error) {
                  setDeletingRegistry(null);
                  messageAPI.error({
                    key: 'registry-deletion-failed',
                    content: t('dialog.ErrorOccurred'),
                  });
                } else {
                  startReloadTransition(() => {
                    updateFetchKey();
                  });
                  messageAPI.info({
                    key: 'registry-deleted',
                    content: t('registry.RegistrySuccessfullyDeleted'),
                  });
                  setDeletingRegistry(null);
                }
              },
              onError: (error) => {
                messageAPI.error({
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
              // help="asdf"
              // validateStatus={
              //   deletingConfirmText &&
              //   deletingConfirmText !== deletingRegistry?.hostname
              //     ? 'error'
              //     : undefined
              // }
              rules={[
                {
                  required: true,
                  message: t('registry.HostnameDoesNotMatch'),
                  validator: async () => {
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

export default ContainerRegistryList;
