import { Space, Table, TableProps, Tag, Radio } from "antd";
// import { Descriptions } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useDeferredValue } from "react";
import { useTranslation } from 'react-i18next';
import { useSuspendedBackendaiClient, useUpdatableState } from "../hooks";
import { useParams } from "react-router-dom";


// TODO: Need to implement wireframe of serving list using esm client

type RoutingStatus = 
  | "HEALTHY"
  | "PROVISIONING"
  | "UNHEALTHY";

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
  const baiClient = useSuspendedBackendaiClient();

  const {serviceId} = useParams<{
    serviceId: string
  }>();
  
  const [fetchKey, updateFetchKey] = useUpdatableState("initial-fetch");
  const deferredMergedFetchKey = useDeferredValue(fetchKey + extraFetchKey);
  const { t } = useTranslation();

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}, 'selectedRow':`, selectedRows);
    }
  }

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
  }

  const columns: ColumnsType<DataType> = [
    {
      title: '#',
      dataIndex: 'key',
      rowScope: 'row',
    },
    {
      title: 'Session ID',
      dataIndex: 'sessionId',
      key: 'sessionId',
      render: text => <a>{text}</a>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, { status }) => (
        <>
          <Tag color={ applyStatusColor(status) } key={ status }>{status.toUpperCase()}</Tag>
        </>
      ),
    },
    {
      title: 'Traffic Ratio',
      dataIndex: 'trafficRatio',
      key: 'trafficRatio'
    }
  ];

  // dummy data for wireframe
  const data: DataType[] = [
    {
      key: '1',
      sessionId: 'stable-diffusion-session01',
      status: 'HEALTHY',
      trafficRatio: 1.0,
    },
    {
      key: '2',
      sessionId: 'stable-diffusion-session02',
      status: 'PROVISIONING',
      trafficRatio: 1.0,
    },
    {
      key: '3',
      sessionId: 'stable-diffusion-session03',
      status: 'UNHEALTHY',
      trafficRatio: 1.0,
    },
  ];

  return (
    <>
      <h1>{serviceId}</h1>
      {/* {fetchKey}, {deferredFetchKey} */}
      {/* {fetchKey !== deferredFetchKey && <div>loading...{deferredFetchKey}</div>} */}
      <Table
        columns={columns} dataSource={data} />
    </>
  );
};

// const ServiceInfo: React.FC = ({}) => {
//     return (
//         <div>
//     <Descriptions
//       title="Service Info"
//       bordered
//       column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
//     >
//       <Descriptions.Item label="Name">Stable Diffusion V3</Descriptions.Item>
//       <Descriptions.Item label="Endpoint ID">f95e5a5c-7087-42c0-aeb9-7bd71e023cad</Descriptions.Item>
//       <Descriptions.Item label="Session Owner">d92b7fe3-dd07-4f0b-9f8-85dc4985e57</Descriptions.Item>
//       <Descriptions.Item label="Desired Session Count">$80.00</Descriptions.Item>
//       <Descriptions.Item label="Routings">
//         Data disk type: MongoDB
//         <br />
//         Database version: 3.4
//         <br />
//         Package: dds.mongo.mid
//         <br />
//         Storage space: 10 GB
//         <br />
//         Replication factor: 3
//         <br />
//         Region: East China 1
//       </Descriptions.Item>
//     </Descriptions>
//   </div>
//   );
// };

export default RoutingListPage;
