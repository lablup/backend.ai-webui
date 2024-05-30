import CopyableCodeText from '../components/CopyableCodeText';
import EndpointOwnerInfo from '../components/EndpointOwnerInfo';
import EndpointStatusTag from '../components/EndpointStatusTag';
import EndpointTokenGenerationModal from '../components/EndpointTokenGenerationModal';
import Flex from '../components/Flex';
import ImageMetaIcon from '../components/ImageMetaIcon';
import ResourceNumber, { ResourceTypeKey } from '../components/ResourceNumber';
import ServiceLauncherModal from '../components/ServiceLauncherModal';
import ServingRouteErrorModal from '../components/ServingRouteErrorModal';
import VFolderLazyView from '../components/VFolderLazyView';
import { ServingRouteErrorModalFragment$key } from '../components/__generated__/ServingRouteErrorModalFragment.graphql';
import { baiSignedRequestWithPromise, filterNonNullItems } from '../helper';
import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import {
  RoutingListPageQuery,
  RoutingListPageQuery$data,
} from './__generated__/RoutingListPageQuery.graphql';
import {
  ArrowRightOutlined,
  CheckOutlined,
  CloseOutlined,
  FolderOutlined,
  LoadingOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  Popover,
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
import React, { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';
import { useNavigate, useParams } from 'react-router-dom';

interface RoutingInfo {
  route_id: string;
  session_id: string;
  traffic_ratio: number;
}
export interface ModelServiceInfo {
  endpoint_id: string;
  name: string;
  desired_session_count: number;
  active_routes: RoutingInfo[];
  service_endpoint: string;
  is_public: boolean;
}

// TODO: display all of routings when API/GQL supports
// type RoutingStatus = "HEALTHY" | "PROVISIONING" | "UNHEALTHY";

interface RoutingListPageProps {}

type EndPoint = NonNullable<RoutingListPageQuery$data['endpoint']>;
type Routing = NonNullable<NonNullable<EndPoint['routings']>[0]>;

const dayDiff = (a: any, b: any) => {
  const date1 = dayjs(a.created_at);
  const date2 = dayjs(b.created_at);
  return date1.diff(date2);
};

const RoutingListPage: React.FC<RoutingListPageProps> = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const navigate = useNavigate();
  const { serviceId } = useParams<{
    serviceId: string;
  }>();

  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [isPendingClearError, startClearErrorTransition] = useTransition();
  const [selectedSessionErrorForModal, setSelectedSessionErrorForModal] =
    useState<ServingRouteErrorModalFragment$key | null>(null);
  const [isOpenServiceLauncherModal, setIsOpenServiceLauncherModal] =
    useState(false);
  const [isOpenTokenGenerationModal, setIsOpenTokenGenerationModal] =
    useState(false);
  // const curProject = useCurrentProjectValue();
  const [paginationState] = useState<{
    current: number;
    pageSize: number;
  }>({
    current: 1,
    pageSize: 100,
  });
  const { endpoint, endpoint_token_list } =
    useLazyLoadQuery<RoutingListPageQuery>(
      graphql`
        query RoutingListPageQuery(
          $endpointId: UUID!
          $tokenListOffset: Int!
          $tokenListLimit: Int!
        ) {
          endpoint(endpoint_id: $endpointId) {
            name
            status
            endpoint_id
            image @deprecatedSince(version: "23.09.9")
            image_object @since(version: "23.09.9") {
              name
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
            desired_session_count
            url
            open_to_public
            errors {
              session_id
              ...ServingRouteErrorModalFragment
            }
            retries
            model
            model_mount_destiation @deprecatedSince(version: "24.03.4")
            model_mount_destination @since(version: "24.03.4")
            model_definition_path @since(version: "24.03.4")
            extra_mounts @since(version: "24.03.4") {
              row_id
              name
            }
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
            ...ServiceLauncherModalFragment
            ...EndpointOwnerInfoFragment
            ...EndpointStatusTagFragment
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
        }
      `,
      {
        tokenListOffset:
          (paginationState.current - 1) * paginationState.pageSize,
        tokenListLimit: paginationState.pageSize,
        endpointId: serviceId || '',
      },
      {
        fetchPolicy:
          fetchKey === 'initial-fetch' ? 'store-and-network' : 'network-only',
        fetchKey,
      },
    );

  const mutationToClearError = useTanMutation(() => {
    if (!endpoint) return;
    return baiSignedRequestWithPromise({
      method: 'POST',
      url: `/services/${endpoint.endpoint_id}/errors/clear`,
      client: baiClient,
    });
  });
  const openSessionErrorModal = (session: string) => {
    if (endpoint === null) return;
    const { errors } = endpoint || {};
    const firstMatchedSessionError = errors?.find(
      ({ session_id }) => session === session_id,
    );
    setSelectedSessionErrorForModal(firstMatchedSessionError || null);
  };
  // const { t } = useTranslation();

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

  const fullImageString: string = (
    baiClient.supports('modify-endpoint')
      ? `${endpoint?.image_object?.registry}/${endpoint?.image_object?.name}:${endpoint?.image_object?.tag}@${endpoint?.image_object?.architecture}`
      : endpoint?.image
  ) as string;

  const resource_opts = JSON.parse(endpoint?.resource_opts || '{}');

  const items: DescriptionsItemType[] | undefined = [
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
      label: t('modelService.DesiredSessionCount'),
      children: endpoint?.desired_session_count,
    },
    {
      label: t('modelService.ServiceEndpoint'),
      children: endpoint?.url ? (
        <Typography.Text copyable>{endpoint?.url}</Typography.Text>
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
      label: t('modelService.resources'),
      children: (
        <Flex direction="row" wrap="wrap" gap={'md'}>
          <Tooltip title={t('session.ResourceGroup')}>
            <Tag>{endpoint?.resource_group}</Tag>
          </Tooltip>
          {_.map(
            JSON.parse(endpoint?.resource_slots || '{}'),
            (value: string, type: ResourceTypeKey) => {
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
              clickable={false}
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
      children:
        (endpoint?.extra_mounts?.length as number) > 0 ? (
          _.map(endpoint?.extra_mounts, (vfolder) => (
            <VFolderLazyView
              uuid={vfolder?.row_id as string}
              clickable={false}
            />
          ))
        ) : (
          <Typography.Text type="secondary">
            {t('modelService.NoExtraMounts')}
          </Typography.Text>
        ),
    });
  }

  items.push({
    label: t('modelService.Image'),
    children: (baiClient.supports('modify-endpoint')
      ? endpoint?.image_object
      : endpoint?.image) && (
      <Flex direction="row" gap={'xs'}>
        <ImageMetaIcon image={fullImageString} />
        <CopyableCodeText>{fullImageString}</CopyableCodeText>
      </Flex>
    ),
    span: {
      xl: 3,
    },
  });

  return (
    <Flex direction="column" align="stretch" gap="sm">
      <Breadcrumb
        items={[
          {
            title: t('modelService.Services'),
            onClick: (e) => {
              e.preventDefault();
              navigate('/serving');
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
              (endpoint?.desired_session_count || 0) < 0 ||
              endpoint?.status === 'DESTROYING'
            }
            onClick={() => {
              setIsOpenServiceLauncherModal(true);
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
      <Card
        title={t('modelService.GeneratedTokens')}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={endpoint?.status === 'DESTROYING'}
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
              showSorterTooltip: false,
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
              defaultSortOrder: 'descend',
              sortDirections: ['descend', 'ascend', 'descend'],
              sorter: dayDiff,
            },
            {
              title: 'Created at',
              dataIndex: 'created_at',
              render: (text, row) => (
                <span>{dayjs(row.created_at).format('ll LT')}</span>
              ),
              defaultSortOrder: 'descend',
              sortDirections: ['descend', 'ascend', 'descend'],
              sorter: dayDiff,
            },
          ]}
          pagination={false}
          dataSource={filterNonNullItems(endpoint_token_list?.items)}
          bordered
        ></Table>
      </Card>
      <Card title={t('modelService.RoutesInfo')}>
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
            },
            {
              title: t('modelService.Status'),
              render: (_, { session, status }) =>
                status && (
                  <>
                    <Tag
                      color={applyStatusColor(status)}
                      key={status}
                      style={{ marginRight: 0 }}
                    >
                      {status.toUpperCase()}
                    </Tag>
                    {status === 'FAILED_TO_START' && (
                      <Popover>
                        <Button
                          size="small"
                          type="text"
                          icon={<QuestionCircleOutlined />}
                          style={{ color: token.colorTextSecondary }}
                          onClick={() =>
                            session && openSessionErrorModal(session)
                          }
                        />
                      </Popover>
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
      <ServingRouteErrorModal
        open={!!selectedSessionErrorForModal}
        inferenceSessionErrorFrgmt={selectedSessionErrorForModal}
        onRequestClose={() => setSelectedSessionErrorForModal(null)}
      />
      <ServiceLauncherModal
        endpointFrgmt={endpoint}
        open={isOpenServiceLauncherModal}
        onRequestClose={(success) => {
          setIsOpenServiceLauncherModal(!isOpenServiceLauncherModal);
          if (success) {
            startRefetchTransition(() => {
              updateFetchKey();
            });
          }
        }}
      ></ServiceLauncherModal>
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
    </Flex>
  );
};

export default RoutingListPage;
