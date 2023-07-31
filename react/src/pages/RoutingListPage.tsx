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
} from "@ant-design/icons";
import React, { useTransition } from "react";
import Flex from "../components/Flex";
import { useSuspendedBackendaiClient, useUpdatableState } from "../hooks";
import { useNavigate, useParams } from "react-router-dom";
import { useLazyLoadQuery } from "react-relay";
import graphql from "babel-plugin-relay/macro";
import {
  RoutingListPageQuery,
  RoutingListPageQuery$data,
} from "./__generated__/RoutingListPageQuery.graphql";
import CopyableCodeText from "../components/CopyableCodeText";
import ImageMetaIcon from "../components/ImageMetaIcon";

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
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const navigate = useNavigate();
  const { serviceId } = useParams<{
    serviceId: string;
  }>();

  const [fetchKey, updateFetchKey] = useUpdatableState("initial-fetch");
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const { endpoint } = useLazyLoadQuery<RoutingListPageQuery>(
    graphql`
      query RoutingListPageQuery($endpointId: UUID!) {
        endpoint(endpoint_id: $endpointId) {
          id
          name
          endpoint_id
          image
          desired_session_count
          url
          open_to_public
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
            title: "Services",
            onClick: (e) => {
              e.preventDefault();
              navigate("/serving");
            },
            href: "/serving",
          },
          {
            title: "Routing Info",
          },
        ]}
      ></Breadcrumb>
      <Flex direction="row" justify="between">
        <Typography.Title level={3} style={{ margin: 0 }}>
          {endpoint?.name || ""}
        </Typography.Title>
        <Tooltip title="Refresh">
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
      <Typography.Title level={4} style={{ margin: 0 }}>
        Service Info
      </Typography.Title>
      <Descriptions
        bordered
        column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
        style={{
          backgroundColor: token.colorBgBase,
        }}
      >
        <Descriptions.Item label="Name">
          <Typography.Text copyable>{endpoint?.name}</Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label="Endpoint ID">
          {endpoint?.endpoint_id}
        </Descriptions.Item>
        <Descriptions.Item label="Session Owner">
          {baiClient.email || ""}
        </Descriptions.Item>
        <Descriptions.Item label="Desired Session Count">
          {endpoint?.desired_session_count}
        </Descriptions.Item>
        <Descriptions.Item label="Service Endpoint">
          {endpoint?.url ? endpoint?.url : <Tag>No service endpoint</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="Open To Public">
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
        Routes Info
      </Typography.Title>
      <Table
        columns={[
          {
            title: "Route ID",
            dataIndex: "routing_id",
          },
          {
            title: "Session ID",
            dataIndex: "session",
          },
          {
            title: "Status",
            render: (_, { status }) =>
              status && (
                <Tag color={applyStatusColor(status)} key={status}>
                  {status.toUpperCase()}
                </Tag>
              ),
          },
          {
            title: "Traffic Ratio",
            dataIndex: "traffic_ratio",
          },
        ]}
        pagination={false}
        dataSource={endpoint?.routings as Routing[]}
      />
    </Flex>
  );
};

export default RoutingListPage;
