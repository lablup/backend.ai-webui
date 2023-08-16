import {
  Breadcrumb,
  Button,
  Descriptions,
  Table,
  Tag,
  Tooltip,
  Typography,
  theme,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import React, { useTransition } from "react";
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
import { baiSignedRequestWithPromise, useBaiSignedRequestWithPromise } from "../helper";

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
  const [showErrorJSONModal, setShowErrorJSONModal] = React.useState(false);
  const [errorJSONModalSessionID, setErrorJSONModalSessionID] = React.useState("");
  const [errorJSONModalError, setErrorJSONModalError] = React.useState("{}");

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
            errors {
              name
              repr
            }
          }
          retries
          routings {
            routing_id
            session
            traffic_ratio
            endpoint
            status
          }
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
    if (!endpoint) return
    console.log(endpoint)
    return baiSignedRequestWithPromise({
      method: "POST",
      url: `/services/${endpoint.endpoint_id}/errors/clear`,
      client: baiClient,
    });
  })
  const onTagClick = React.useCallback((session: string) => {
    if (endpoint === null) return
    const { errors } = endpoint
    const targetSession = errors.filter(({ session_id }) => session === session_id)
    if (targetSession.length > 0) {
      setErrorJSONModalSessionID(session)
      setErrorJSONModalError(targetSession[0].errors[0].repr)
      setShowErrorJSONModal(true)
    }
  }, [endpoint?.errors])
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
        <div>
          {(endpoint?.retries || 0) > 0 ? <Tooltip title={t("ClearErrors")}>
            <Button
              loading={isPendingClearError}
              icon={<WarningOutlined />}
              onClick={() => {
                startClearErrorTransition(() => {
                  mutationToClearError.mutate(undefined, {
                    onSuccess: () => startRefetchTransition(() => {
                      updateFetchKey();
                    })
                  })
                });
              }}
            />
          </Tooltip> : <></>}
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
        </div>
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
                <Tag color={applyStatusColor(status)} key={status} onClick={
                  (status === "FAILED_TO_START" ? () => onTagClick(session) : undefined)
                }>
                  {status.toUpperCase()}
                </Tag>
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
      {
        showErrorJSONModal ? 
          <ServingRouteErrorModal
            open
            close={() => setShowErrorJSONModal(false)}
            sessionId={errorJSONModalSessionID}
            error={errorJSONModalError}
          /> :
          <></>
      }
    </Flex>
  );
};

export default RoutingListPage;
