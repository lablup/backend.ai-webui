import AutoScalingRuleEditorModal, {
  COMPARATOR_LABELS,
} from '../components/AutoScalingRuleEditorModal';
import CopyableCodeText from '../components/CopyableCodeText';
import EndpointOwnerInfo from '../components/EndpointOwnerInfo';
import EndpointStatusTag from '../components/EndpointStatusTag';
import EndpointTokenGenerationModal from '../components/EndpointTokenGenerationModal';
import Flex from '../components/Flex';
import { useFolderExplorerOpener } from '../components/FolderExplorerOpener';
import ImageMetaIcon from '../components/ImageMetaIcon';
import InferenceSessionErrorModal from '../components/InferenceSessionErrorModal';
import ResourceNumber from '../components/ResourceNumber';
import SessionDetailDrawer from '../components/SessionDetailDrawer';
import VFolderLazyView from '../components/VFolderLazyView';
import { AutoScalingRuleEditorModalFragment$key } from '../components/__generated__/AutoScalingRuleEditorModalFragment.graphql';
import { InferenceSessionErrorModalFragment$key } from '../components/__generated__/InferenceSessionErrorModalFragment.graphql';
import ChatUIModal from '../components/lablupTalkativotUI/ChatUIModal';
import { baiSignedRequestWithPromise, filterNonNullItems } from '../helper';
import {
  useSuspendedBackendaiClient,
  useUpdatableState,
  useWebUINavigate,
} from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { isDestroyingStatus } from './EndpointListPage';
import { EndpointDetailPageAutoScalingRuleDeleteMutation } from './__generated__/EndpointDetailPageAutoScalingRuleDeleteMutation.graphql';
import {
  EndpointDetailPageQuery,
  EndpointDetailPageQuery$data,
} from './__generated__/EndpointDetailPageQuery.graphql';
import {
  ArrowRightOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  FolderOutlined,
  LoadingOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  SyncOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  App,
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  Popconfirm,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import { DescriptionsItemType } from 'antd/es/descriptions';
import graphql from 'babel-plugin-relay/macro';
import { default as dayjs } from 'dayjs';
import _ from 'lodash';
import { BotMessageSquareIcon } from 'lucide-react';
import React, { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery, useMutation } from 'react-relay';
import { useParams } from 'react-router-dom';

interface RoutingInfo {
  route_id: string;
  session_id: string;
  traffic_ratio: number;
}
export interface ModelServiceInfo {
  endpoint_id: string;
  name: string;
  desired_session_count?: number;
  replicas?: number;
  active_routes: RoutingInfo[];
  service_endpoint: string;
  is_public: boolean;
}

// TODO: display all of routings when API/GQL supports
// type RoutingStatus = "HEALTHY" | "PROVISIONING" | "UNHEALTHY";

interface EndpointDetailPageProps {}

type EndPoint = NonNullable<EndpointDetailPageQuery$data['endpoint']>;
type Routing = NonNullable<NonNullable<EndPoint['routings']>[0]>;
const dayDiff = (a: any, b: any) => {
  const date1 = dayjs(a.created_at);
  const date2 = dayjs(b.created_at);
  return date1.diff(date2);
};

const EndpointDetailPage: React.FC<EndpointDetailPageProps> = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { baiPaginationOption } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 100,
  });
  const { serviceId } = useParams<{
    serviceId: string;
  }>();
  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [isPendingClearError, startClearErrorTransition] = useTransition();
  const [selectedSessionErrorForModal, setSelectedSessionErrorForModal] =
    useState<InferenceSessionErrorModalFragment$key | null>(null);

  const [editingAutoScalingRule, setEditingAutoScalingRule] =
    useState<AutoScalingRuleEditorModalFragment$key | null>(null);
  const [isOpenTokenGenerationModal, setIsOpenTokenGenerationModal] =
    useState(false);
  const [openChatModal, setOpenChatModal] = useState(false);
  const [isOpenAutoScalingRuleModal, setIsOpenAutoScalingRuleModal] =
    useState(false);
  const [currentUser] = useCurrentUserInfo();
  // const curProject = useCurrentProjectValue();
  const baiClient = useSuspendedBackendaiClient();
  const webuiNavigate = useWebUINavigate();
  const { open } = useFolderExplorerOpener();
  const [selectedSessionId, setSelectedSessionId] = useState<string>();
  const isSupportAutoScalingRule =
    baiClient.isManagerVersionCompatibleWith('25.1.0');
  const { endpoint, endpoint_token_list, endpoint_auto_scaling_rules } =
    useLazyLoadQuery<EndpointDetailPageQuery>(
      graphql`
        query EndpointDetailPageQuery(
          $endpointId: UUID!
          $tokenListOffset: Int!
          $tokenListLimit: Int!
          $autoScalingRules_endpointId: String!
          $autoScalingRules_filter: String
          $autoScalingRules_offset: Int
          $autoScalingRules_order: String
          $autoScalingRules_before: String
          $autoScalingRules_after: String
          $autoScalingRules_first: Int
          $autoScalingRules_last: Int
          $skipScalingRules: Boolean!
        ) {
          endpoint(endpoint_id: $endpointId) {
            name
            status
            endpoint_id
            image @deprecatedSince(version: "23.09.9")
            image_object @since(version: "23.09.9") {
              name
              namespace @since(version: "24.12.0")
              humanized_name
              tag
              registry
              architecture
              is_local
              digest
              resource_limits {
                key
                min
                max
              }
              labels {
                key
                value
              }
              size_bytes
              supported_accelerators
            }
            desired_session_count @deprecatedSince(version: "24.12.0")
            replicas @since(version: "24.12.0")
            url
            open_to_public
            errors {
              session_id
              ...InferenceSessionErrorModalFragment
            }
            retries
            runtime_variant @since(version: "24.03.5") {
              human_readable_name
            }
            model
            model_mount_destiation @deprecatedSince(version: "24.03.4")
            model_mount_destination @since(version: "24.03.4")
            model_definition_path @since(version: "24.03.4")
            extra_mounts @since(version: "24.03.4") {
              row_id
              name
            }
            environ
            resource_group
            resource_slots
            resource_opts
            routings {
              routing_id
              session
              traffic_ratio
              endpoint
              status
            }
            created_user_email @since(version: "23.09.8")
            ...EndpointOwnerInfoFragment
            ...EndpointStatusTagFragment
            ...ChatUIModalFragment
            ...ServiceLauncherPageContentFragment
          }
          endpoint_token_list(
            offset: $tokenListOffset
            limit: $tokenListLimit
            endpoint_id: $endpointId
          ) {
            total_count
            items {
              id
              token
              endpoint_id
              domain
              project
              session_owner
              created_at
              valid_until
            }
            ...ChatUIModalEndpointTokenListFragment
          }
          endpoint_auto_scaling_rules: endpoint_auto_scaling_rule_nodes(
            endpoint: $autoScalingRules_endpointId
            filter: $autoScalingRules_filter
            order: $autoScalingRules_order
            offset: $autoScalingRules_offset
            before: $autoScalingRules_before
            after: $autoScalingRules_after
            first: $autoScalingRules_first
            last: $autoScalingRules_last
          ) @skipOnClient(if: $skipScalingRules) {
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
            edges {
              node {
                id
                endpoint
                metric_name
                metric_source
                threshold
                comparator
                step_size
                cooldown_seconds
                min_replicas
                max_replicas
                created_at
                last_triggered_at
                ...AutoScalingRuleEditorModalFragment
              }
            }
          }
        }
      `,
      {
        tokenListOffset: baiPaginationOption.offset,
        tokenListLimit: baiPaginationOption.limit,
        endpointId: serviceId || '',
        autoScalingRules_endpointId: serviceId as string,
        autoScalingRules_filter: undefined,
        autoScalingRules_offset: undefined,
        autoScalingRules_before: undefined,
        autoScalingRules_after: undefined,
        autoScalingRules_first: undefined,
        autoScalingRules_last: undefined,
        skipScalingRules: !isSupportAutoScalingRule,
      },
      {
        fetchPolicy:
          fetchKey === 'initial-fetch' ? 'store-and-network' : 'network-only',
        fetchKey,
      },
    );

  const mutationToClearError = useTanMutation({
    mutationFn: () => {
      if (!endpoint) return;
      return baiSignedRequestWithPromise({
        method: 'POST',
        url: `/services/${endpoint.endpoint_id}/errors/clear`,
        client: baiClient,
      });
    },
  });
  const mutationToSyncRoutes = useTanMutation<
    {
      success: boolean;
    },
    unknown,
    string
  >({
    mutationFn: (endpoint_id) => {
      return baiSignedRequestWithPromise({
        method: 'POST',
        url: `/services/${endpoint_id}/sync`,
        client: baiClient,
      });
    },
  });
  const openSessionErrorModal = (session: string) => {
    if (endpoint === null) return;
    const { errors } = endpoint || {};
    const firstMatchedSessionError = errors?.find(
      ({ session_id }) => session === session_id,
    );
    setSelectedSessionErrorForModal(firstMatchedSessionError || null);
  };

  const [
    commitDeleteAutoScalingRuleMutation,
    isInFlightDeleteAutoScalingRuleMutation,
  ] = useMutation<EndpointDetailPageAutoScalingRuleDeleteMutation>(graphql`
    mutation EndpointDetailPageAutoScalingRuleDeleteMutation($id: String!) {
      delete_endpoint_auto_scaling_rule_node(id: $id) {
        ok
        msg
      }
    }
  `);

  // return color of tag by status
  const applyStatusColor = (status: string = '') => {
    let color = 'default';
    switch (status.toUpperCase()) {
      case 'HEALTHY':
        color = 'success';
        break;
      case 'PROVISIONING':
        color = 'processing';
        break;
      case 'UNHEALTHY':
        color = 'warning';
        break;
    }
    return color;
  };

  const autoScalingRules = _.map(endpoint_auto_scaling_rules?.edges, (edge) => {
    return edge?.node;
  });

  const fullImageString =
    baiClient.supports('modify-endpoint') && endpoint?.image_object
      ? `${endpoint.image_object.registry}/${endpoint.image_object.namespace ?? endpoint.image_object.name}:${endpoint.image_object.tag}@${endpoint.image_object.architecture}`
      : endpoint?.image;

  const resource_opts = JSON.parse(endpoint?.resource_opts || '{}');

  const items: DescriptionsItemType[] = [
    {
      label: t('modelService.EndpointName'),
      children: <Typography.Text copyable>{endpoint?.name}</Typography.Text>,
    },
    {
      label: t('modelService.Status'),
      children: <EndpointStatusTag endpointFrgmt={endpoint} />,
    },
    {
      label: t('modelService.EndpointId'),
      children: endpoint?.endpoint_id,
    },
    {
      label: t('modelService.SessionOwner'),
      children: <EndpointOwnerInfo endpointFrgmt={endpoint} />,
    },
    {
      label: t('modelService.NumberOfReplicas'),
      children: endpoint?.replicas ?? endpoint?.desired_session_count,
    },
    {
      label: t('modelService.ServiceEndpoint'),
      children: endpoint?.url ? (
        <>
          <Typography.Text copyable>{endpoint?.url}</Typography.Text>
          <Tooltip title={'LLM Chat Test'}>
            <Button
              type="link"
              icon={<BotMessageSquareIcon />}
              onClick={() => {
                setOpenChatModal(true);
              }}
              disabled={endpoint?.status !== 'HEALTHY'}
            />
          </Tooltip>
        </>
      ) : (
        <Typography.Text type="secondary">
          {t('modelService.NoServiceEndpoint')}
        </Typography.Text>
      ),
    },
    {
      label: t('modelService.OpenToPublic'),
      children: endpoint?.open_to_public ? (
        <CheckOutlined />
      ) : (
        <CloseOutlined />
      ),
    },
    {
      label: t('modelService.Resources'),
      children: (
        <Flex direction="row" wrap="wrap" gap={'md'}>
          <Tooltip title={t('session.ResourceGroup')}>
            <Tag>{endpoint?.resource_group}</Tag>
          </Tooltip>
          {_.map(
            JSON.parse(endpoint?.resource_slots || '{}'),
            (value: string, type) => {
              return (
                <ResourceNumber
                  key={type}
                  type={type}
                  value={value}
                  opts={resource_opts}
                />
              );
            },
          )}
        </Flex>
      ),
      span: {
        xl: 2,
      },
    },
    {
      label: t('session.launcher.ModelStorage'),
      children: (
        <Suspense fallback={<Spin indicator={<LoadingOutlined spin />} />}>
          <Flex direction="column" align="start">
            <VFolderLazyView
              uuid={endpoint?.model as string}
              clickable={true}
            />
            {baiClient.supports('endpoint-extra-mounts') &&
              endpoint?.model_mount_destination && (
                <Flex direction="row" align="center" gap={'xxs'}>
                  <ArrowRightOutlined type="secondary" />
                  <Typography.Text type="secondary">
                    {endpoint?.model_mount_destination}
                  </Typography.Text>
                </Flex>
              )}
          </Flex>
        </Suspense>
      ),
    },
  ];

  if (baiClient.supports('endpoint-extra-mounts')) {
    items.push({
      label: t('modelService.AdditionalMounts'),
      children: (
        <Flex direction="column" align="start">
          {_.map(endpoint?.extra_mounts, (vfolder) => {
            return (
              <Flex direction="row" gap={'xxs'} key={vfolder?.row_id}>
                <Typography.Link
                  onClick={() => {
                    vfolder?.row_id && open(vfolder?.row_id);
                  }}
                >
                  <FolderOutlined /> {vfolder?.name}
                </Typography.Link>
              </Flex>
            );
          })}
        </Flex>
      ),
    });
  }

  items.push({
    label: t('session.launcher.EnvironmentVariable'),
    children: (
      <Typography.Text style={{ fontFamily: 'monospace' }}>
        {_.isEmpty(JSON.parse(endpoint?.environ || '{}'))
          ? '-'
          : endpoint?.environ}
      </Typography.Text>
    ),
    span: {
      sm: 1,
    },
  });

  items.push({
    label: t('modelService.Image'),
    children: (baiClient.supports('modify-endpoint')
      ? endpoint?.image_object
      : endpoint?.image) && (
      <Flex direction="row" gap={'xs'}>
        <ImageMetaIcon image={fullImageString || null} />
        <CopyableCodeText>{fullImageString}</CopyableCodeText>
        {endpoint?.runtime_variant?.human_readable_name ? (
          <Tag>{endpoint?.runtime_variant?.human_readable_name}</Tag>
        ) : null}
      </Flex>
    ),
    span: {
      xl: 3,
    },
  });

  // TODO: show current Autoscaling Rule in human-friendly way
  // items.push({
  //   label: 'Autoscaling Rule',
  //   children: (
  //     <>
  //       <Tag>vllm_avg_prompt_throughput_toks_per_s</Tag>
  //       <Tag>LESS_THAN</Tag>
  //       <Tag>Cool down sec: 300</Tag>
  //       <Tag>Min Replica #: 1</Tag>
  //       <Tag>Max Replica #: 3</Tag>
  //     </>
  //   ),
  // });

  return (
    <Flex direction="column" align="stretch" gap="sm">
      <Breadcrumb
        items={[
          {
            title: t('modelService.Services'),
            onClick: (e) => {
              e.preventDefault();
              webuiNavigate('/serving');
            },
            href: '/serving',
          },
          {
            title: t('modelService.RoutingInfo'),
          },
        ]}
      />
      <Flex direction="row" justify="between">
        <Typography.Title level={3} style={{ margin: 0 }}>
          {endpoint?.name || ''}
        </Typography.Title>
        <Flex gap={'xxs'}>
          {(endpoint?.retries || 0) > 0 ? (
            <Tooltip title={t('modelService.ClearErrors')}>
              <Button
                loading={isPendingClearError}
                icon={<WarningOutlined />}
                onClick={() => {
                  startClearErrorTransition(() => {
                    mutationToClearError.mutate(undefined, {
                      onSuccess: () =>
                        startRefetchTransition(() => {
                          updateFetchKey();
                        }),
                    });
                  });
                }}
              />
            </Tooltip>
          ) : (
            <></>
          )}
          <Button
            loading={isPendingRefetch}
            icon={<ReloadOutlined />}
            disabled={isDestroyingStatus(
              endpoint?.replicas ?? endpoint?.desired_session_count,
              endpoint?.status,
            )}
            onClick={() => {
              startRefetchTransition(() => {
                updateFetchKey();
              });
            }}
          >
            {t('button.Refresh')}
          </Button>
        </Flex>
      </Flex>
      <Card
        title={t('modelService.ServiceInfo')}
        extra={
          <Button
            type="primary"
            icon={<SettingOutlined />}
            disabled={
              isDestroyingStatus(
                endpoint?.replicas ?? endpoint?.desired_session_count,
                endpoint?.status,
              ) ||
              (!!endpoint?.created_user_email &&
                endpoint?.created_user_email !== currentUser.email)
            }
            onClick={() => {
              webuiNavigate('/service/update/' + serviceId);
            }}
          >
            {t('button.Edit')}
          </Button>
        }
      >
        <Descriptions
          bordered
          column={{ xxl: 3, xl: 3, lg: 2, md: 1, sm: 1, xs: 1 }}
          style={{
            backgroundColor: token.colorBgBase,
          }}
          items={items}
        ></Descriptions>
      </Card>
      {isSupportAutoScalingRule && (
        <Card
          title={t('modelService.AutoScalingRules')}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={isDestroyingStatus(
                endpoint?.replicas ?? endpoint?.desired_session_count,
                endpoint?.status,
              )}
              onClick={() => {
                setIsOpenAutoScalingRuleModal(true);
              }}
            >
              {t('modelService.AddRules')}
            </Button>
          }
        >
          <Table
            scroll={{ x: 'max-content' }}
            rowKey={'id'}
            columns={[
              {
                title: '#',
                fixed: 'left',
                render: (id, record, index) => {
                  ++index;
                  return index;
                },
              },
              {
                title: t('autoScalingRule.MetricName'),
                dataIndex: 'metric_name',
                fixed: 'left',
                render: (text, row) => (
                  <Typography.Text ellipsis copyable style={{ width: 150 }}>
                    {row?.metric_name}
                  </Typography.Text>
                ),
              },
              {
                title: t('modelService.Controls'),
                dataIndex: 'controls',
                key: 'controls',
                render: (text, row) => (
                  <Flex direction="row" align="stretch">
                    <Button
                      type="text"
                      icon={<SettingOutlined />}
                      style={
                        isDestroyingStatus(
                          endpoint?.replicas ?? endpoint?.desired_session_count,
                          endpoint?.status,
                        ) ||
                        (!!endpoint?.created_user_email &&
                          endpoint?.created_user_email !== currentUser.email)
                          ? {
                              color: token.colorTextDisabled,
                            }
                          : {
                              color: token.colorInfo,
                            }
                      }
                      disabled={
                        isDestroyingStatus(
                          endpoint?.replicas ?? endpoint?.desired_session_count,
                          endpoint?.status,
                        ) ||
                        (!!endpoint?.created_user_email &&
                          endpoint?.created_user_email !== currentUser.email)
                      }
                      onClick={() => {
                        if (row) {
                          setEditingAutoScalingRule(row);
                          setIsOpenAutoScalingRuleModal(true);
                        }
                      }}
                    />
                    <Popconfirm
                      title={t('dialog.warning.CannotBeUndone')}
                      okText={t('button.Delete')}
                      okButtonProps={{
                        danger: true,
                      }}
                      disabled={isInFlightDeleteAutoScalingRuleMutation}
                      onConfirm={() => {
                        if (autoScalingRules) {
                          commitDeleteAutoScalingRuleMutation({
                            variables: {
                              id: row?.id as string,
                            },
                            onCompleted: (res, errors) => {
                              if (
                                !res?.delete_endpoint_auto_scaling_rule_node?.ok
                              ) {
                                message.error(
                                  res?.delete_endpoint_auto_scaling_rule_node
                                    ?.msg,
                                );
                              } else if (errors && errors.length > 0) {
                                const errorMsgList = _.map(
                                  errors,
                                  (error) =>
                                    error.message || t('dialog.ErrorOccurred'),
                                );
                                for (const error of errorMsgList) {
                                  message.error(error, 2.5);
                                }
                              } else {
                                setEditingAutoScalingRule(null);
                                startRefetchTransition(() => {
                                  updateFetchKey();
                                });
                                message.success({
                                  key: 'autoscaling-rule-deleted',
                                  content: t(
                                    'autoScalingRule.SuccessfullyDeleted',
                                  ),
                                });
                              }
                            },
                            onError: (error) => {
                              message.error(
                                error?.message || t('dialog.ErrorOccurred'),
                              );
                            },
                          });
                        }
                      }}
                    >
                      <Button
                        type="text"
                        icon={
                          <DeleteOutlined
                            style={
                              isDestroyingStatus(
                                endpoint?.replicas ??
                                  endpoint?.desired_session_count,
                                endpoint?.status,
                              )
                                ? undefined
                                : {
                                    color: token.colorError,
                                  }
                            }
                          />
                        }
                        disabled={false}
                        onClick={() => {
                          if (row) {
                            setEditingAutoScalingRule(row);
                          }
                        }}
                      />
                    </Popconfirm>
                  </Flex>
                ),
              },
              {
                title: t('autoScalingRule.MetricSource'),
                dataIndex: 'metric_source',
                render: (text, row) => <Tag>{row?.metric_source}</Tag>,
              },
              {
                title: t('autoScalingRule.Comparator'),
                dataIndex: 'comparator',
                render: (text, row) => (
                  // @ts-ignore
                  <Tooltip title={text}>{COMPARATOR_LABELS[text]}</Tooltip>
                ),
              },
              {
                title: t('autoScalingRule.Threshold'),
                render: (text, row) => <span>{row?.threshold}</span>,
              },
              {
                title: t('autoScalingRule.StepSize'),
                dataIndex: 'step_size',
              },
              {
                title: t('autoScalingRule.MIN/MAXReplicas'),
                render: (text, row) => (
                  <span>
                    Min: {row?.min_replicas} / Max: {row?.max_replicas}
                  </span>
                ),
              },
              {
                title: t('autoScalingRule.CoolDownSeconds'),
                dataIndex: 'cooldown_seconds',
                // render: (text, row) => <span>{row?.cooldown_seconds}</span>,
              },
              {
                title: t('autoScalingRule.LastTriggered'),
                render: (text, row) => {
                  return (
                    <span>
                      {row?.last_triggered_at
                        ? dayjs
                            .utc(row?.last_triggered_at)
                            .tz()
                            .format('ll LTS')
                        : `-`}
                    </span>
                  );
                },
                sorter: dayDiff,
              },
              {
                title: t('autoScalingRule.CreatedAt'),
                dataIndex: 'created_at',
                render: (text, row) => (
                  <span>{dayjs(row?.created_at).format('ll LT')}</span>
                ),
                sorter: dayDiff,
              },
            ]}
            pagination={false}
            sortDirections={['descend', 'ascend', 'descend']}
            showSorterTooltip={false}
            dataSource={autoScalingRules}
            bordered
          ></Table>
        </Card>
      )}
      <Card
        title={t('modelService.GeneratedTokens')}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={isDestroyingStatus(
              endpoint?.replicas ?? endpoint?.desired_session_count,
              endpoint?.status,
            )}
            onClick={() => {
              setIsOpenTokenGenerationModal(true);
            }}
          >
            {t('modelService.GenerateToken')}
          </Button>
        }
      >
        <Table
          scroll={{ x: 'max-content' }}
          rowKey={'token'}
          columns={[
            {
              title: '#',
              fixed: 'left',
              render: (id, record, index) => {
                ++index;
                return index;
              },
            },
            {
              title: 'Token',
              dataIndex: 'token',
              fixed: 'left',
              render: (text, row) => (
                <Typography.Text ellipsis copyable style={{ width: 150 }}>
                  {row.token}
                </Typography.Text>
              ),
            },
            {
              title: 'Status',
              render: (text, row) => {
                const isExpired = dayjs.utc(row.valid_until).isBefore();
                return (
                  <Tag color={isExpired ? 'red' : 'green'}>
                    {isExpired ? 'Expired' : 'Valid'}
                  </Tag>
                );
              },
            },
            {
              title: 'Valid Until',
              dataIndex: 'valid_until',
              render: (text, row) => (
                <span>
                  {
                    // FIXME: temporally parse UTC and change to timezone (timezone need to be added in server side)
                    row.valid_until
                      ? dayjs.utc(row.valid_until).tz().format('ll LTS')
                      : '-'
                  }
                </span>
              ),
              sorter: dayDiff,
            },
            {
              title: 'Created at',
              dataIndex: 'created_at',
              render: (text, row) => (
                <span>{dayjs(row.created_at).format('ll LT')}</span>
              ),
              sorter: dayDiff,
            },
          ]}
          sortDirections={['descend', 'ascend', 'descend']}
          showSorterTooltip={false}
          pagination={false}
          dataSource={filterNonNullItems(endpoint_token_list?.items)}
          bordered
        ></Table>
      </Card>
      <Card
        title={t('modelService.RoutesInfo')}
        extra={
          endpoint?.endpoint_id ? (
            <Button
              icon={<SyncOutlined />}
              loading={mutationToSyncRoutes.isPending}
              disabled={isDestroyingStatus(
                endpoint?.replicas ?? endpoint?.desired_session_count,
                endpoint?.status,
              )}
              onClick={() => {
                endpoint?.endpoint_id &&
                  mutationToSyncRoutes.mutateAsync(endpoint?.endpoint_id, {
                    onSuccess: (data) => {
                      if (data?.success) {
                        message.success(t('modelService.SyncRoutesRequested'));
                        startRefetchTransition(() => {
                          updateFetchKey();
                        });
                      } else {
                        message.error(t('modelService.SyncRoutesFailed'));
                      }
                    },
                    onError: (error) => {
                      message.error(t('modelService.SyncRoutesFailed'));
                    },
                  });
              }}
            >
              {t('modelService.SyncRoutes')}
            </Button>
          ) : null
        }
      >
        <Table
          scroll={{ x: 'max-content' }}
          columns={[
            {
              title: t('modelService.RouteId'),
              dataIndex: 'routing_id',
              fixed: 'left',
            },
            {
              title: t('modelService.SessionId'),
              dataIndex: 'session',
              render: (sessionId) => {
                return baiClient.supports('session-node') ? (
                  <Typography.Link
                    onClick={() => {
                      setSelectedSessionId(sessionId);
                    }}
                  >
                    {sessionId}
                  </Typography.Link>
                ) : (
                  <Typography.Text>{sessionId}</Typography.Text>
                );
              },
            },
            {
              title: t('modelService.Status'),
              render: (_, row) =>
                row.status && (
                  <>
                    <Tag
                      color={applyStatusColor(row?.status)}
                      key={row?.status}
                      style={{ marginRight: 0 }}
                    >
                      {row.status.toUpperCase()}
                    </Tag>
                    {row.status === 'FAILED_TO_START' && row.session && (
                      <Button
                        size="small"
                        type="text"
                        icon={<QuestionCircleOutlined />}
                        style={{ color: token.colorTextSecondary }}
                        onClick={() => {
                          row.session && openSessionErrorModal(row.session);
                        }}
                      />
                    )}
                  </>
                ),
            },
            {
              title: t('modelService.TrafficRatio'),
              dataIndex: 'traffic_ratio',
            },
          ]}
          pagination={false}
          dataSource={endpoint?.routings as Routing[]}
          rowKey={'routing_id'}
          bordered
        />
      </Card>
      <InferenceSessionErrorModal
        open={!!selectedSessionErrorForModal}
        inferenceSessionErrorFrgmt={selectedSessionErrorForModal}
        onRequestClose={() => setSelectedSessionErrorForModal(null)}
      />
      <EndpointTokenGenerationModal
        open={isOpenTokenGenerationModal}
        onRequestClose={(success) => {
          setIsOpenTokenGenerationModal(!isOpenTokenGenerationModal);
          if (success) {
            startRefetchTransition(() => {
              updateFetchKey();
            });
          }
        }}
        endpoint_id={endpoint?.endpoint_id || ''}
      ></EndpointTokenGenerationModal>
      <ChatUIModal
        endpointFrgmt={endpoint}
        endpointTokenFrgmt={endpoint_token_list}
        open={openChatModal}
        onCancel={() => {
          setOpenChatModal(false);
        }}
      />
      {isSupportAutoScalingRule && (
        <AutoScalingRuleEditorModal
          open={isOpenAutoScalingRuleModal}
          endpoint_id={endpoint?.endpoint_id as string}
          autoScalingRuleFrgmt={editingAutoScalingRule}
          onRequestClose={(success) => {
            setIsOpenAutoScalingRuleModal(!isOpenAutoScalingRuleModal);
            setEditingAutoScalingRule(null);
            if (success) {
              startRefetchTransition(() => {
                updateFetchKey();
              });
            }
          }}
        />
      )}
      <SessionDetailDrawer
        open={!selectedSessionId}
        sessionId={selectedSessionId}
        onClose={() => {
          setSelectedSessionId(undefined);
        }}
      />
    </Flex>
  );
};

export default EndpointDetailPage;
