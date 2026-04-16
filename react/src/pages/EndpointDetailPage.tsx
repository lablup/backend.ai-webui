/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  EndpointDetailPageQuery,
  EndpointDetailPageQuery$data,
  RouteFilter,
  RouteHealthStatus,
  RouteStatus,
  RouteTrafficStatus,
} from '../__generated__/EndpointDetailPageQuery.graphql';
import { InferenceSessionErrorModalFragment$key } from '../__generated__/InferenceSessionErrorModalFragment.graphql';
import AutoScalingRuleList from '../components/AutoScalingRuleList';
import AutoScalingRuleListLegacy from '../components/AutoScalingRuleListLegacy';
import BAIJSONViewerModal from '../components/BAIJSONViewerModal';
import BAIRadioGroup from '../components/BAIRadioGroup';
import { isEndpointInDestroyingCategory } from '../components/EndpointList';
import EndpointOwnerInfo from '../components/EndpointOwnerInfo';
import EndpointStatusTag from '../components/EndpointStatusTag';
import EndpointTokenGenerationModal from '../components/EndpointTokenGenerationModal';
import { useFolderExplorerOpener } from '../components/FolderExplorerOpener';
import ImageNodeSimpleTag from '../components/ImageNodeSimpleTag';
import InferenceSessionErrorModal from '../components/InferenceSessionErrorModal';
import SessionDetailDrawer from '../components/SessionDetailDrawer';
import SourceCodeView from '../components/SourceCodeView';
import SwitchToProjectButton from '../components/SwitchToProjectButton';
import VFolderLazyView from '../components/VFolderLazyView';
import { baiSignedRequestWithPromise, convertToOrderBy } from '../helper';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import {
  ArrowRightOutlined,
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  PlusOutlined,
  SettingOutlined,
  SyncOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  Card,
  Descriptions,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import { DescriptionsItemType } from 'antd/es/descriptions';
import {
  filterOutNullAndUndefined,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIUnmountAfterClose,
  BAIText,
  BAIResourceNumberWithIcon,
  BAIRouteNodes,
  BAITag,
  GraphQLFilter,
  SemanticColor,
  toGlobalId,
  useFetchKey,
  useSemanticColorMap,
  BAITable,
  BAIFetchKeyButton,
} from 'backend.ai-ui';
import { default as dayjs } from 'dayjs';
import * as _ from 'lodash-es';
import { BotMessageSquareIcon } from 'lucide-react';
import React, {
  Suspense,
  useDeferredValue,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';
import VFolderNodeIdenticon from 'src/components/VFolderNodeIdenticon';

interface RoutingInfo {
  route_id: string;
  session_id: string;
  traffic_ratio: number;
}
export interface ModelServiceInfo {
  endpoint_id: string;
  name: string;
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
  const [routePagination, setRoutePagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [routeOrder, setRouteOrder] = useState<string | null>(null);
  const [routeStatusCategory, setRouteStatusCategory] = useState<
    'running' | 'finished'
  >('running');
  const [routePropertyFilter, setRoutePropertyFilter] =
    useState<GraphQLFilter>();
  const deferredRoutePagination = useDeferredValue(routePagination);
  const deferredRouteOrder = useDeferredValue(routeOrder);
  const deferredRouteStatusCategory = useDeferredValue(routeStatusCategory);
  const deferredRoutePropertyFilter = useDeferredValue(routePropertyFilter);
  const { serviceId } = useParams<{
    serviceId: string;
  }>();
  const [fetchKey, updateFetchKey, INITIAL_FETCH_KEY] = useFetchKey();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [isPendingClearError, startClearErrorTransition] = useTransition();
  const [selectedSessionErrorForModal, setSelectedSessionErrorForModal] =
    useState<InferenceSessionErrorModalFragment$key | null>(null);

  const [isOpenTokenGenerationModal, setIsOpenTokenGenerationModal] =
    useState(false);
  const [currentUser] = useCurrentUserInfo();
  const currentProject = useCurrentProjectValue();
  const baiClient = useSuspendedBackendaiClient();
  const blockList = baiClient?._config?.blockList ?? null;
  const webuiNavigate = useWebUINavigate();
  const { open } = useFolderExplorerOpener();
  const [selectedSessionId, setSelectedSessionId] = useState<string>();
  const isSupportAutoScalingRule = baiClient.supports('auto-scaling-rule');
  const isSupportPrometheusAutoScalingRule = baiClient.supports(
    'prometheus-auto-scaling-rule',
  );
  const isSupportRouteHealthStatus = baiClient.supports('route-health-status');
  const [errorDataForJSONModal, setErrorDataForJSONModal] = useState<string>();
  const {
    endpoint,
    endpoint_token_list,
    endpoint_auto_scaling_rules,
    routes,
    healthyRoutes,
    deploymentScopedSchedulingHistories,
  } = useLazyLoadQuery<EndpointDetailPageQuery>(
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
        $deploymentId: ID!
        $routeFilter: RouteFilter
        $healthyRouteFilter: RouteFilter
        $routeOrderBy: [RouteOrderBy!]
        $routeLimit: Int
        $routeOffset: Int
        $skipRouteNodes: Boolean!
        $skipRoutings: Boolean!
        $schedulingHistoryScope: DeploymentScope!
        $schedulingHistoryFilter: DeploymentHistoryFilter
        $skipSchedulingHistories: Boolean!
      ) {
        endpoint(endpoint_id: $endpointId) {
          name
          status
          lifecycle_stage
          endpoint_id
          project
          image_object {
            namespace
            humanized_name
            tag
            registry
            architecture
            is_local
            digest
            resource_limits {
              key
              min
            }
            labels {
              key
              value
            }
            size_bytes
            supported_accelerators
            ...ImageNodeSimpleTagFragment
          }
          replicas
          url
          open_to_public
          errors {
            session_id
            ...InferenceSessionErrorModalFragment
          }
          retries
          runtime_variant {
            human_readable_name
          }
          model
          model_mount_destination
          model_definition_path
          extra_mounts {
            row_id
            name
            ...VFolderNodeIdenticonFragment
          }
          environ
          resource_group
          resource_slots
          resource_opts
          routings @skipOnClient(if: $skipRoutings) {
            routing_id
            session
            traffic_ratio
            endpoint
            status
            error_data
          }
          created_user_email
          ...EndpointOwnerInfoFragment
          ...EndpointStatusTagFragment
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
              ...AutoScalingRuleEditorModalLegacyFragment
            }
          }
        }
        routes(
          deploymentId: $deploymentId
          filter: $routeFilter
          orderBy: $routeOrderBy
          limit: $routeLimit
          offset: $routeOffset
        ) @skipOnClient(if: $skipRouteNodes) {
          edges {
            node {
              ...BAIRouteNodesFragment
            }
          }
          count
        }
        healthyRoutes: routes(
          deploymentId: $deploymentId
          filter: $healthyRouteFilter
        ) @skipOnClient(if: $skipRouteNodes) {
          count
        }
        deploymentScopedSchedulingHistories(
          scope: $schedulingHistoryScope
          filter: $schedulingHistoryFilter
          limit: 1
        ) @skipOnClient(if: $skipSchedulingHistories) {
          count
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
      skipScalingRules:
        !isSupportAutoScalingRule || isSupportPrometheusAutoScalingRule,
      deploymentId: toGlobalId('ModelDeployment', serviceId || ''),
      routeFilter: {
        status: (deferredRouteStatusCategory === 'running'
          ? isSupportRouteHealthStatus
            ? ['PROVISIONING', 'RUNNING', 'TERMINATING']
            : [
                'PROVISIONING',
                'HEALTHY',
                'UNHEALTHY',
                'DEGRADED',
                'TERMINATING',
              ]
          : ['TERMINATED', 'FAILED_TO_START']) as RouteStatus[],
        ...(isSupportRouteHealthStatus &&
        deferredRoutePropertyFilter?.healthStatus
          ? {
              healthStatus: [
                deferredRoutePropertyFilter.healthStatus as RouteHealthStatus,
              ],
            }
          : {}),
        ...(deferredRoutePropertyFilter?.trafficStatus
          ? {
              trafficStatus: [
                deferredRoutePropertyFilter.trafficStatus as RouteTrafficStatus,
              ],
            }
          : {}),
      },
      healthyRouteFilter: (isSupportRouteHealthStatus
        ? { healthStatus: ['HEALTHY'] }
        : { status: ['HEALTHY'] }) as RouteFilter,
      routeOrderBy: convertToOrderBy(deferredRouteOrder) ?? undefined,
      routeLimit: deferredRoutePagination.pageSize,
      routeOffset:
        (deferredRoutePagination.current - 1) *
        deferredRoutePagination.pageSize,
      skipRouteNodes: !baiClient.supports('route-node'),
      skipRoutings: baiClient.supports('route-node'),
      schedulingHistoryScope: { deploymentId: serviceId || '' },
      schedulingHistoryFilter: { toStatus: ['READY'] },
      skipSchedulingHistories: !baiClient.supports('model-card-v2'),
    },
    {
      fetchPolicy:
        fetchKey === INITIAL_FETCH_KEY ? 'store-and-network' : 'network-only',
      fetchKey,
    },
  );

  // Check if the endpoint belongs to a different project than the currently selected one
  const isProjectMismatch = endpoint
    ? endpoint.project !== currentProject.id
    : false;

  const hasAnyHealthyRoute = baiClient.supports('route-node')
    ? (healthyRoutes?.count ?? 0) > 0
    : endpoint?.status === 'HEALTHY';

  const hasReachedReady = (deploymentScopedSchedulingHistories?.count ?? 0) > 0;

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

  const legacyRouteStatusSemanticMap: Record<string, SemanticColor> = {
    HEALTHY: 'success',
    PROVISIONING: 'info',
    UNHEALTHY: 'warning',
    DEGRADED: 'warning',
    FAILED_TO_START: 'error',
  };
  const semanticColorMap = useSemanticColorMap();

  const autoScalingRules = filterOutNullAndUndefined(
    _.map(endpoint_auto_scaling_rules?.edges, (edge) => edge?.node),
  );

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
      children: endpoint?.replicas,
    },
    {
      label: t('modelService.ServiceEndpoint'),
      children: endpoint?.url ? (
        <>
          <Typography.Text copyable>{endpoint?.url}</Typography.Text>
          {!_.includes(blockList, 'chat') ? (
            <Tooltip title={'LLM Chat Test'}>
              <Button
                type="link"
                icon={<BotMessageSquareIcon />}
                onClick={() => {
                  webuiNavigate({
                    pathname: '/chat',
                    search: new URLSearchParams({
                      endpointId: endpoint?.endpoint_id ?? '',
                    }).toString(),
                  });
                }}
                disabled={!hasAnyHealthyRoute}
              />
            </Tooltip>
          ) : null}
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
        <BAIFlex direction="row" wrap="wrap" gap={'md'}>
          <Tooltip title={t('session.ResourceGroup')}>
            <Tag>{endpoint?.resource_group}</Tag>
          </Tooltip>
          {_.map(
            JSON.parse(endpoint?.resource_slots || '{}'),
            (value: string, type) => {
              return (
                <BAIResourceNumberWithIcon
                  key={type}
                  type={type}
                  value={value}
                  opts={resource_opts}
                />
              );
            },
          )}
        </BAIFlex>
      ),
      span: {
        xl: 2,
      },
    },
    {
      label: t('session.launcher.ModelStorage'),
      children: endpoint?.model ? (
        <Suspense fallback={<Spin indicator={<LoadingOutlined spin />} />}>
          <BAIFlex direction="column" align="start">
            <VFolderLazyView uuid={endpoint?.model} clickable={true} />
            {endpoint?.model_mount_destination && (
              <BAIFlex direction="row" align="center" gap={'xxs'}>
                <ArrowRightOutlined type="secondary" />
                <Typography.Text type="secondary">
                  {endpoint?.model_mount_destination}
                </Typography.Text>
              </BAIFlex>
            )}
          </BAIFlex>
        </Suspense>
      ) : null,
    },
    {
      label: t('modelService.AdditionalMounts'),
      children: (
        <BAIFlex direction="column" align="start">
          {_.map(
            filterOutNullAndUndefined(endpoint?.extra_mounts),
            (vfolder) => {
              return (
                <Typography.Link
                  onClick={() => {
                    vfolder?.row_id && open(vfolder?.row_id);
                  }}
                >
                  <BAIFlex direction="row" gap={'xs'} key={vfolder?.row_id}>
                    <VFolderNodeIdenticon vfolderNodeIdenticonFrgmt={vfolder} />{' '}
                    {vfolder?.name}
                  </BAIFlex>
                </Typography.Link>
              );
            },
          )}
        </BAIFlex>
      ),
    },
    {
      label: t('session.launcher.EnvironmentVariable'),
      children: (() => {
        let envObj: Record<string, string> = {};
        try {
          envObj = JSON.parse(endpoint?.environ || '{}');
        } catch {
          return '-';
        }
        if (_.isEmpty(envObj)) return '-';
        const envText = _.map(envObj, (value, key) => `${key}="${value}"`).join(
          '\n',
        );
        return <SourceCodeView language="shell">{envText}</SourceCodeView>;
      })(),
      span: {
        sm: 1,
      },
    },
    {
      label: t('modelService.Image'),
      children: endpoint?.image_object ? (
        <ImageNodeSimpleTag imageFrgmt={endpoint.image_object} />
      ) : null,
      span: {
        xl: 3,
      },
    },
  ];

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
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex direction="row" justify="between">
        <Typography.Title level={3} style={{ margin: 0 }}>
          {endpoint?.name || ''}
        </Typography.Title>
        <BAIFlex gap={'xxs'}>
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
          <BAIFetchKeyButton
            loading={isPendingRefetch}
            value={fetchKey}
            autoUpdateDelay={10_000}
            disabled={isEndpointInDestroyingCategory(endpoint)}
            onChange={() => {
              startRefetchTransition(() => {
                updateFetchKey();
              });
            }}
          >
            {t('button.Refresh')}
          </BAIFetchKeyButton>
        </BAIFlex>
      </BAIFlex>
      {!hasReachedReady &&
        !hasAnyHealthyRoute &&
        !isEndpointInDestroyingCategory(endpoint) &&
        endpoint?.replicas !== 0 && (
          <Alert
            type="info"
            showIcon
            icon={<LoadingOutlined />}
            title={t('modelService.PreparingService')}
            description={t('modelService.PreparingServiceDescription')}
            style={{ marginBottom: token.marginSM }}
          />
        )}
      {hasAnyHealthyRoute &&
        !isEndpointInDestroyingCategory(endpoint) &&
        !_.includes(blockList, 'chat') && (
          <Alert
            type="success"
            showIcon
            title={t('modelService.ServiceReady')}
            description={t('modelService.ServiceReadyDescription')}
            style={{ marginBottom: token.marginSM }}
            action={
              <Button
                type="primary"
                size="small"
                icon={<BotMessageSquareIcon size={14} />}
                onClick={() => {
                  webuiNavigate({
                    pathname: '/chat',
                    search: new URLSearchParams({
                      endpointId: endpoint?.endpoint_id ?? '',
                    }).toString(),
                  });
                }}
              >
                {t('modelService.StartChat')}
              </Button>
            }
          />
        )}
      {isProjectMismatch && endpoint?.project && (
        <Alert
          title={t('modelService.NotInProject')}
          type="warning"
          showIcon
          style={{ marginBottom: token.marginSM }}
          action={<SwitchToProjectButton projectId={endpoint.project} />}
        />
      )}
      <Card
        title={t('modelService.ServiceInfo')}
        extra={
          <Button
            type="primary"
            icon={<SettingOutlined />}
            disabled={
              isEndpointInDestroyingCategory(endpoint) ||
              isProjectMismatch ||
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
          column={{ xxl: 3, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          style={{
            backgroundColor: token.colorBgBase,
          }}
          items={items}
        ></Descriptions>
      </Card>
      {isSupportAutoScalingRule &&
        (isSupportPrometheusAutoScalingRule ? (
          <AutoScalingRuleList
            deploymentId={toGlobalId(
              'ModelDeployment',
              endpoint?.endpoint_id || '',
            )}
            isEndpointDestroying={
              isEndpointInDestroyingCategory(endpoint) ?? false
            }
            isOwnedByCurrentUser={
              !endpoint?.created_user_email ||
              endpoint?.created_user_email === currentUser.email
            }
            fetchKey={fetchKey}
          />
        ) : (
          <AutoScalingRuleListLegacy
            endpoint_id={endpoint?.endpoint_id as string}
            autoScalingRules={autoScalingRules}
            isEndpointDestroying={
              isEndpointInDestroyingCategory(endpoint) ?? false
            }
            isOwnedByCurrentUser={
              !endpoint?.created_user_email ||
              endpoint?.created_user_email === currentUser.email
            }
            onRefetch={() => {
              startRefetchTransition(() => {
                updateFetchKey();
              });
            }}
          />
        ))}
      <Card
        title={t('modelService.GeneratedTokens')}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={isEndpointInDestroyingCategory(endpoint)}
            onClick={() => {
              setIsOpenTokenGenerationModal(true);
            }}
          >
            {t('modelService.GenerateToken')}
          </Button>
        }
      >
        <BAITable
          scroll={{ x: 'max-content' }}
          rowKey={'token'}
          columns={[
            {
              title: t('modelService.Token'),
              dataIndex: 'token',
              fixed: 'left',
              render: (_text, row) => (
                <BAIText
                  ellipsis={{ tooltip: false }}
                  copyable
                  style={{ width: 150 }}
                >
                  {row.token}
                </BAIText>
              ),
            },
            {
              title: t('modelService.Status'),
              render: (_text, row) => {
                const isExpired = dayjs.utc(row.valid_until).isBefore();
                return (
                  <Tag color={isExpired ? 'red' : 'green'}>
                    {isExpired ? 'Expired' : 'Valid'}
                  </Tag>
                );
              },
            },
            {
              title: t('modelService.ExpiredDate'),
              dataIndex: 'valid_until',
              render: (_text, row) => (
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
              title: t('modelService.CreatedAt'),
              dataIndex: 'created_at',
              render: (_text, row) => (
                <span>{dayjs(row.created_at).format('ll LT')}</span>
              ),
              sorter: dayDiff,
            },
          ]}
          showSorterTooltip={false}
          pagination={false}
          dataSource={filterOutNullAndUndefined(endpoint_token_list?.items)}
        ></BAITable>
      </Card>
      <Card
        title={t('modelService.RoutesInfo')}
        extra={
          endpoint?.endpoint_id ? (
            <Button
              icon={<SyncOutlined />}
              loading={mutationToSyncRoutes.isPending}
              disabled={isEndpointInDestroyingCategory(endpoint)}
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
                    onError: () => {
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
        {baiClient.supports('route-node') ? (
          <BAIFlex direction="column" align="stretch" gap="sm">
            <BAIFlex
              gap={'sm'}
              align="start"
              style={{ flexShrink: 1 }}
              wrap="wrap"
            >
              <BAIRadioGroup
                optionType="button"
                value={routeStatusCategory}
                onChange={(e) => {
                  setRouteStatusCategory(e.target.value);
                  setRoutePagination({ current: 1, pageSize: 10 });
                }}
                options={[
                  {
                    label: t('session.Running'),
                    value: 'running',
                  },
                  {
                    label: t('session.Finished'),
                    value: 'finished',
                  },
                ]}
              />
              <BAIGraphQLPropertyFilter
                value={routePropertyFilter}
                onChange={(value) => {
                  setRoutePropertyFilter(value ?? undefined);
                  setRoutePagination({ current: 1, pageSize: 10 });
                }}
                filterProperties={[
                  ...(isSupportRouteHealthStatus
                    ? [
                        {
                          key: 'healthStatus',
                          propertyLabel: t('modelService.HealthStatus'),
                          type: 'enum' as const,
                          valueMode: 'scalar' as const,
                          fixedOperator: 'equals' as const,
                          strictSelection: true,
                          options: [
                            { label: 'HEALTHY', value: 'HEALTHY' },
                            { label: 'UNHEALTHY', value: 'UNHEALTHY' },
                            { label: 'DEGRADED', value: 'DEGRADED' },
                            { label: 'NOT_CHECKED', value: 'NOT_CHECKED' },
                          ],
                        },
                      ]
                    : []),
                  {
                    key: 'trafficStatus',
                    propertyLabel: t('modelService.TrafficStatus'),
                    type: 'enum',
                    valueMode: 'scalar',
                    fixedOperator: 'equals',
                    strictSelection: true,
                    options: [
                      { label: 'ACTIVE', value: 'ACTIVE' },
                      { label: 'INACTIVE', value: 'INACTIVE' },
                    ],
                  },
                ]}
              />
            </BAIFlex>
            <BAIRouteNodes
              routesFrgmt={filterOutNullAndUndefined(
                routes?.edges?.map((edge) => edge?.node),
              )}
              order={routeOrder}
              onChangeOrder={setRouteOrder}
              loading={
                mutationToSyncRoutes.isPending ||
                deferredRoutePagination !== routePagination ||
                deferredRouteOrder !== routeOrder ||
                deferredRouteStatusCategory !== routeStatusCategory ||
                deferredRoutePropertyFilter !== routePropertyFilter
              }
              onClickSessionId={setSelectedSessionId}
              onClickErrorData={(errorData) =>
                setErrorDataForJSONModal(
                  typeof errorData === 'string'
                    ? errorData
                    : JSON.stringify(errorData),
                )
              }
              pagination={{
                ...routePagination,
                total: routes?.count,
                showSizeChanger: true,
                onChange: (page, pageSize) => {
                  setRoutePagination({ current: page, pageSize });
                },
              }}
            />
          </BAIFlex>
        ) : (
          <Table
            scroll={{ x: 'max-content' }}
            columns={[
              {
                title: t('modelService.RouteId'),
                dataIndex: 'routing_id',
                fixed: 'left',
                render: (_text, row) => (
                  <BAIText ellipsis>
                    {row.routing_id}
                    {!_.isEmpty(row.error_data) && (
                      <Button
                        size="small"
                        type="text"
                        icon={<ExclamationCircleOutlined />}
                        style={{ color: token.colorError }}
                        onClick={() => {
                          setErrorDataForJSONModal(row?.error_data || ' ');
                        }}
                      />
                    )}
                  </BAIText>
                ),
              },
              {
                title: t('modelService.SessionId'),
                dataIndex: 'session',
                render: (sessionId) => {
                  const matchedSessionError = endpoint?.errors?.find(
                    (sessionError) => sessionError.session_id === sessionId,
                  );
                  return (
                    <>
                      {baiClient.supports('session-node') ? (
                        <Typography.Link
                          onClick={() => {
                            setSelectedSessionId(sessionId);
                          }}
                        >
                          {sessionId}
                        </Typography.Link>
                      ) : (
                        <Typography.Text>{sessionId}</Typography.Text>
                      )}
                      {matchedSessionError && (
                        <Button
                          size="small"
                          type="text"
                          icon={<ExclamationCircleOutlined />}
                          style={{ color: token.colorError }}
                          onClick={() => {
                            setSelectedSessionErrorForModal(
                              matchedSessionError,
                            );
                          }}
                        />
                      )}
                    </>
                  );
                },
              },
              {
                title: t('modelService.Status'),
                render: (_text, row) =>
                  row.status && (
                    <>
                      <BAITag
                        color={
                          semanticColorMap[
                            legacyRouteStatusSemanticMap[
                              row?.status?.toUpperCase() ?? ''
                            ] ?? 'default'
                          ]
                        }
                        key={row?.status}
                        style={{ marginRight: 0 }}
                      >
                        {row.status.toUpperCase()}
                      </BAITag>
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
        )}
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
      <BAIUnmountAfterClose>
        <SessionDetailDrawer
          open={!!selectedSessionId}
          sessionId={selectedSessionId}
          onClose={() => {
            setSelectedSessionId(undefined);
          }}
        />
      </BAIUnmountAfterClose>
      <BAIJSONViewerModal
        open={!!errorDataForJSONModal}
        title={t('modelService.RouteError')}
        json={errorDataForJSONModal}
        onCancel={() => {
          setErrorDataForJSONModal(undefined);
        }}
      />
    </BAIFlex>
  );
};

export default EndpointDetailPage;
