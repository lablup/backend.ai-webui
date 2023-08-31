import CopyableCodeText from '../components/CopyableCodeText';
import EndpointStatusTag from '../components/EndpointStatusTag';
import Flex from '../components/Flex';
import ImageMetaIcon from '../components/ImageMetaIcon';
import ModelServiceSettingModal from '../components/ModelServiceSettingModal';
import ServingRouteErrorModal from '../components/ServingRouteErrorModal';
import EndpointTokenList from '../components/EndpointTokenList';

import { ServingRouteErrorModalFragment$key } from '../components/__generated__/ServingRouteErrorModalFragment.graphql';
import { baiSignedRequestWithPromise } from '../helper';
import { useSuspendedBackendaiClient, useUpdatableState, useCurrentProjectValue } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import {
  RoutingListPageQuery,
  RoutingListPageQuery$data,
} from './__generated__/RoutingListPageQuery.graphql';
import {
  CheckOutlined,
  CloseOutlined,
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
  Table,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import React, { useState, useTransition } from 'react';
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
  const [isOpenModelServiceSettingModal, setIsOpenModelServiceSettingModal] =
    useState(false);
  const curProject = useCurrentProjectValue();
  const [paginationState] = useState<{
    current: number;
    pageSize: number;
  }>({
    current: 1,
    pageSize: 100,
  });
  const [servicesFetchKey, updateServicesFetchKey] =
    useUpdatableState('initial-fetch');
  const { endpoint } = useLazyLoadQuery<RoutingListPageQuery>(
    graphql`
      query RoutingListPageQuery($endpointId: UUID!) {
        endpoint(endpoint_id: $endpointId) {
          name
          endpoint_id
          image
          desired_session_count
          url
          open_to_public
          errors {
            session_id
            ...ServingRouteErrorModalFragment
          }
          retries
          routings {
            routing_id
            session
            traffic_ratio
            endpoint
            status
          }
          ...EndpointStatusTagFragment
          ...ModelServiceSettingModal_endpoint
        }
      }
    `,
    {
      endpointId: serviceId,
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
    const { errors } = endpoint;
    const firstMatchedSessionError = errors.find(
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

  return (
    <Flex
      direction="column"
      align="stretch"
      style={{ margin: token.marginSM }}
      gap="sm"
    >
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
          <Tooltip title={t('button.Refresh')}>
            <Button
              loading={isPendingRefetch}
              icon={<ReloadOutlined />}
              onClick={() => {
                startRefetchTransition(() => {
                  updateFetchKey();
                });
              }}
            />
          </Tooltip>
          <Button
            type="primary"
            icon={<SettingOutlined />}
            disabled={(endpoint?.desired_session_count || 0) < 0}
            onClick={() => {
              setIsOpenModelServiceSettingModal(true);
            }}
          >
            {t('button.Edit')}
          </Button>
        </Flex>
      </Flex>
      <Card title={t('modelService.ServiceInfo')}>
        <Descriptions
          bordered
          column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
          style={{
            backgroundColor: token.colorBgBase,
          }}
        >
          <Descriptions.Item label={t('modelService.EndpointName')}>
            <Typography.Text copyable>{endpoint?.name}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('modelService.Status')}>
            <EndpointStatusTag endpointFrgmt={endpoint} />
          </Descriptions.Item>
          <Descriptions.Item label={t('modelService.EndpointId')}>
            {endpoint?.endpoint_id}
          </Descriptions.Item>
          <Descriptions.Item label={t('modelService.SessionOwner')}>
            {baiClient.email || ''}
          </Descriptions.Item>
          <Descriptions.Item label={t('modelService.DesiredSessionCount')}>
            {endpoint?.desired_session_count}
          </Descriptions.Item>
          <Descriptions.Item label={t('modelService.ServiceEndpoint')}>
            {endpoint?.url ? (
              endpoint?.url
            ) : (
              <Tag>{t('modelService.NoServiceEndpoint')}</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('modelService.OpenToPublic')}>
            {endpoint?.open_to_public ? <CheckOutlined /> : <CloseOutlined />}
          </Descriptions.Item>
          <Descriptions.Item label="Image">
            {endpoint?.image && (
              <Flex direction="row" gap={'xs'}>
                <ImageMetaIcon image={endpoint.image} />
                <CopyableCodeText>{endpoint.image}</CopyableCodeText>
              </Flex>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Card title={t('modelService.GeneratedTokens')}>
        <EndpointTokenList></EndpointTokenList>
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
                        onClick={() => openSessionErrorModal(session)}
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
        bordered
      />
      </Card>
      <ServingRouteErrorModal
        open={!!selectedSessionErrorForModal}
        inferenceSessionErrorFrgmt={selectedSessionErrorForModal}
        onRequestClose={() => setSelectedSessionErrorForModal(null)}
      />
      <ModelServiceSettingModal
        open={isOpenModelServiceSettingModal}
        onRequestClose={(success) => {
          setIsOpenModelServiceSettingModal(false);
          if (success) {
            startRefetchTransition(() => {
              updateFetchKey();
            });
          }
        }}
        endpointFrgmt={endpoint}
      />
    </Flex>
  );
};

export default RoutingListPage;
