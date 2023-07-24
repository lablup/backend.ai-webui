import { Table, TableProps } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import React, { useDeferredValue } from "react";
import { useTranslation } from "react-i18next";
import { useSuspendedBackendaiClient, useUpdatableState } from "../hooks";
import { Link, useNavigate } from "react-router-dom";

// TODO: Need to implement wireframe of serving list using esm client

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
  name: string;
  endpointId: String;
  image: string;
  desiredSessionCount: number;
  routings: number; // only count for routings in HEALTHY status
  sessionOwner: string;
  isOpenToPublic: boolean;
}

const ServingList: React.FC<ServingListProps> = ({
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
  const navigate = useNavigate();

  const [fetchKey, updateFetchKey] = useUpdatableState("initial-fetch");
  const deferredMergedFetchKey = useDeferredValue(fetchKey + extraFetchKey);
  const { t } = useTranslation();

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}, 'selectedRow':`,
        selectedRows
      );
    },
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "Endpoint ID",
      dataIndex: "name",
      key: "name",
      render: (text) => <Link to={"/serving/" + text}>{text}</Link>,
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
    },
    {
      title: "Desired Session Count",
      dataIndex: "desiredSessionCount",
      key: "desiredSessionCount",
    },
    {
      title: "Routings",
      dataIndex: "routings",
      key: "routings",
    },
    {
      title: "Session Owner",
      dataIndex: "sessionOwner",
      key: "sessionOwner",
    },
    {
      title: "Open To Public",
      dataIndex: "isOpenToPublic",
      key: "isOpenToPublic",
      render: (isPublic) => (isPublic ? <CheckOutlined /> : <CloseOutlined />),
    },
  ];

  // dummy data
  const data: DataType[] = [
    {
      key: "1",
      name: "Test-session",
      endpointId: "f95e5a5c-7087-42c0-aeb9-7bd71e023cad",
      image: "allinone:7080/repo/ngc-pytorch:22.02-py3",
      desiredSessionCount: 1,
      routings: 1,
      sessionOwner: "John Doe",
      isOpenToPublic: true,
    },
    {
      key: "2",
      name: "AI-Character-service",
      endpointId: "abcdefgh-8888-42c0-aeb9-1e027bd73cad",
      image: "allinone:7080/repo/ngc-pytorch:22.02-py3",
      desiredSessionCount: 3,
      routings: 3,
      sessionOwner: "John Doe",
      isOpenToPublic: false,
    },
  ];

  return (
    <>
      {/* {fetchKey}, {deferredFetchKey} */}
      {/* {fetchKey !== deferredFetchKey && <div>loading...{deferredFetchKey}</div>} */}
      <Table
        rowSelection={{
          type: "radio",
          ...rowSelection,
        }}
        columns={columns}
        dataSource={data}
      />
    </>
  );
};

export default ServingList;
