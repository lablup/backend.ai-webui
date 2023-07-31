import {
  Breadcrumb,
  Descriptions,
  Table,
  TableProps,
  Tag,
  Typography,
  theme,
} from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import React from "react";
import Flex from "../components/Flex";
import { useSuspendedBackendaiClient } from "../hooks";
import { useNavigate, useParams } from "react-router-dom";
import { baiSignedRequestWithPromise } from "../helper";
import { useTanQuery } from "../hooks/reactQueryAlias";

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

// type Session = NonNullable<
//   ServingListQuery["response"]["compute_session_list"]
// >["items"][0];
interface ServingListProps extends Omit<TableProps<any>, "dataSource"> {
  status?: string[];
  limit?: number;
  currentPage?: number;
  pageSize?: number;
  projectId?: string;
  // filter: (item: Session) => boolean;
  extraFetchKey?: string;
}

interface DataType {
  key: string;
  sessionId: string;
  status: string;
  trafficRatio: number;
}

const RoutingListPage: React.FC<ServingListProps> = ({
  status = [],
  limit = 50,
  currentPage = 1,
  pageSize = 50,
  projectId,
  // filter,
  extraFetchKey = "",
  ...tableProps
}) => {
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const navigate = useNavigate();
  const { serviceId } = useParams<{
    serviceId: string;
  }>();

  // const [fetchKey, updateFetchKey] = useUpdatableState("initial-fetch");
  // const deferredMergedFetchKey = useDeferredValue(fetchKey + extraFetchKey);

  const { data: modelServiceInfo } = useTanQuery({
    queryKey: ["serviceInfo", serviceId],
    queryFn: () => {
      return baiSignedRequestWithPromise({
        method: "GET",
        url: `/services/${serviceId}`,
        client: baiClient,
      });
    },
    enabled: !!serviceId,
  });

  // const { t } = useTranslation();

  // const rowSelection = {
  //   onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
  //     console.log(
  //       `selectedRowKeys: ${selectedRowKeys}, 'selectedRow':`,
  //       selectedRows
  //     );
  //   },
  // };

  // return color of tag by status
  // const applyStatusColor = (status: string = "") => {
  //   let color = "default";
  //   switch (status.toUpperCase()) {
  //     case "HEALTHY":
  //       color = "success";
  //       break;
  //     case "PROVISIONING":
  //       color = "processing";
  //       break;
  //     case "UNHEALTHY":
  //       color = "warning";
  //       break;
  //   }
  //   return color;
  // };

  const columns: ColumnsType<DataType> = [
    {
      title: "Route ID",
      dataIndex: "routeId",
      key: "route_id",
      render: (text) => text,
    },
    {
      title: "Session ID",
      dataIndex: "sessionId",
      key: "session_id",
      // FIXME: currently there's no status showing through REST API
      // render: (_, { status }) => (
      //   <>
      //     <Tag color={applyStatusColor(status)} key={status}>
      //       {status.toUpperCase()}
      //     </Tag>
      //   </>
      // ),
    },
    {
      title: "Traffic Ratio",
      dataIndex: "trafficRatio",
      key: "traffic_ratio",
    },
  ];

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
      <Typography.Title level={3} style={{ margin: 0 }}>
        {modelServiceInfo.name || ""}
      </Typography.Title>
      <Typography.Title level={4} style={{ margin: 0 }}>
        Service Info
      </Typography.Title>
      <Descriptions
        bordered
        column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
      >
        <Descriptions.Item label="Name">
          {modelServiceInfo.name}
        </Descriptions.Item>
        <Descriptions.Item label="Endpoint ID">
          {modelServiceInfo.endpoint_id}
        </Descriptions.Item>
        <Descriptions.Item label="Session Owner">
          {baiClient.email || ""}
        </Descriptions.Item>
        <Descriptions.Item label="Desired Session Count">
          {modelServiceInfo.desired_session_count}
        </Descriptions.Item>
        <Descriptions.Item label="Service Endpoint">
          {modelServiceInfo.service_endpoint ? (
            modelServiceInfo.service_endpoint
          ) : (
            <Tag>No service endpoint</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Open To Public">
          {modelServiceInfo.is_public ? <CheckOutlined /> : <CloseOutlined />}
        </Descriptions.Item>
      </Descriptions>
      <Typography.Title level={4} style={{ margin: 0 }}>
        Active Routes Info
      </Typography.Title>
      <Table
        columns={columns}
        dataSource={
          modelServiceInfo.active_routes ? modelServiceInfo.active_routes : []
        }
      />
    </Flex>
  );
};

export default RoutingListPage;
