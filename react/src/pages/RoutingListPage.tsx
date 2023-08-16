import {
  Breadcrumb,
  Button,
  Descriptions,
  Popover,
  Table,
  Tag,
  Tooltip,
  Typography,
  theme,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import React, { useState, useTransition } from "react";
import Flex from "../components/Flex";
import { useSuspendedBackendaiClient, useUpdatableState } from "../hooks";
import { useNavigate, useParams } from "react-router-dom";
import { useLazyLoadQuery } from "react-relay";
import { useTranslation } from "react-i18next";
import graphql from "babel-plugin-relay/macro";
import {
  RoutingListPageQuery,
  RoutingListPageQuery$data,
} from "./__generated__/RoutingListPageQuery.graphql";
import CopyableCodeText from "../components/CopyableCodeText";
import ImageMetaIcon from "../components/ImageMetaIcon";
import ServingRouteErrorModal from "../components/ServingRouteErrorModal";
import { useTanMutation } from "../hooks/reactQueryAlias";
import { baiSignedRequestWithPromise } from "../helper";
import { ServingRouteErrorModalFragment$key } from "../components/__generated__/ServingRouteErrorModalFragment.graphql";
import EndpointStatusTag from "../components/EndpointStatusTag";

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

type EndPoint = NonNullable<RoutingListPageQuery$data["endpoint"]>;
type Routing = NonNullable<NonNullable<EndPoint["routings"]>[0]>;

const RoutingListPage: React.FC<RoutingListPageProps> = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const navigate = useNavigate();
  const { serviceId } = useParams<{
    serviceId: string;
  }>();

  const [fetchKey, updateFetchKey] = useUpdatableState("initial-fetch");
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [isPendingClearError, startClearErrorTransition] = useTransition();
  const [selectedSessionErrorForModal, setSelectedSessionErrorForModal] =
    useState<ServingRouteErrorModalFragment$key | null>(null);

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
        }
      }
    `,
    {
      endpointId: serviceId,
    },
    {
      fetchPolicy:
        fetchKey === "initial-fetch" ? "store-and-network" : "network-only",
      fetchKey,
    }
  );
  const mutationToClearError = useTanMutation(() => {
    if (!endpoint) return;
    return baiSignedRequestWithPromise({
      method: "POST",
      url: `/services/${endpoint.endpoint_id}/errors/clear`,
      client: baiClient,
    });
  });
  const openSessionErrorModal = (session: string) => {
    if (endpoint === null) return;
    const { errors } = endpoint;
    const firstMatchedSessionError = errors.find(
      ({ session_id }) => session === session_id
    );
    setSelectedSessionErrorForModal(firstMatchedSessionError || null);
  };
  // const { t } = useTranslation();

  // return color of tag by status
  const applyStatusColor = (status: string = "") => {
    let color = "default";
    switch (status.toUpperCase()) {
      case "HEALTHY":
        color = "success";
        break;
      case "PROVISIONING":
        color = "processing";
        break;
      case "UNHEALTHY":
        color = "warning";
        break;
    }
    return color;
  };

  return (
    <Flex
      direction="column"
      align="stretch"
      style={{ margin: token.marginSM, gap: token.margin }}
    >
      <Breadcrumb
        items={[
          {
            title: t("modelService.Services"),
            onClick: (e) => {
              e.preventDefault();
              navigate("/serving");
            },
            href: "/serving",
          },
          {
            title: t("modelService.RoutingInfo"),
          },
        ]}
      ></Breadcrumb>
      <Flex direction="row" justify="between">
        <Typography.Title level={3} style={{ margin: 0 }}>
          {endpoint?.name || ""}
        </Typography.Title>
        <Flex gap={"xxs"}>
          {(endpoint?.retries || 0) > 0 ? (
            <Tooltip title={t("ClearErrors")}>
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
          <Tooltip title={t("button.Refresh")}>
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
        </Flex>
      </Flex>
      <Typography.Title level={4} style={{ margin: 0 }}>
        {t("modelService.ServiceInfo")}
      </Typography.Title>
      <Descriptions
        bordered
        column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
        style={{
          backgroundColor: token.colorBgBase,
        }}
      >
        <Descriptions.Item label={t("modelService.EndpointName")}>
          <Typography.Text copyable>{endpoint?.name}</Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label={t("modelService.Status")}>
          <EndpointStatusTag endpointFrgmt={endpoint} />
        </Descriptions.Item>
        <Descriptions.Item label={t("modelService.EndpointId")}>
          {endpoint?.endpoint_id}
        </Descriptions.Item>
        <Descriptions.Item label={t("modelService.SessionOwner")}>
          {baiClient.email || ""}
        </Descriptions.Item>
        <Descriptions.Item label={t("modelService.DesiredSessionCount")}>
          {endpoint?.desired_session_count}
        </Descriptions.Item>
        <Descriptions.Item label={t("modelService.ServiceEndpoint")}>
          {endpoint?.url ? (
            endpoint?.url
          ) : (
            <Tag>{t("modelService.NoServiceEndpoint")}</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label={t("modelService.OpenToPublic")}>
          {endpoint?.open_to_public ? <CheckOutlined /> : <CloseOutlined />}
        </Descriptions.Item>
        <Descriptions.Item label="Image">
          {endpoint?.image && (
            <Flex direction="row" gap={"xs"}>
              <ImageMetaIcon image={endpoint.image} />
              <CopyableCodeText>{endpoint.image}</CopyableCodeText>
            </Flex>
          )}
        </Descriptions.Item>
      </Descriptions>
      <Typography.Title level={4} style={{ margin: 0 }}>
        {t("modelService.RoutesInfo")}
      </Typography.Title>
      <Table
        columns={[
          {
            title: t("modelService.RouteId"),
            dataIndex: "routing_id",
          },
          {
            title: t("modelService.SessionId"),
            dataIndex: "session",
          },
          {
            title: t("modelService.Status"),
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
                  {status === "FAILED_TO_START" && (
                    <Popover>
                      <Button
                        size="small"
                        type="ghost"
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
            title: t("modelService.TrafficRatio"),
            dataIndex: "traffic_ratio",
          },
        ]}
        pagination={false}
        dataSource={endpoint?.routings as Routing[]}
      />
      <ServingRouteErrorModal
        open={!!selectedSessionErrorForModal}
        inferenceSessionErrorFrgmt={selectedSessionErrorForModal}
        onRequestClose={() => setSelectedSessionErrorForModal(null)}
      />
    </Flex>
  );
};

export default RoutingListPage;
