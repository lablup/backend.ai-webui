import { Button, Table, TableProps } from "antd";
import { CheckOutlined, CloseOutlined, DeleteFilled, SettingFilled } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import React, { useDeferredValue } from "react";
import { useTranslation } from "react-i18next";
import { useSuspendedBackendaiClient, useUpdatableState } from "../hooks";
import { Link, useNavigate } from "react-router-dom";
import Flex from "./Flex";


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
  dataSource: Array<any>;
}

export interface ServingListInfo {
  name: string;
  id: String;
  image: string;
  desired_session_count: number;
  active_route_count: number; // only count for routings in HEALTHY status
  session_owner: string;
  is_public: boolean;
}

const ServingList: React.FC<ServingListProps> = ({
  status = [],
  limit = 50,
  currentPage = 1,
  pageSize = 50,
  projectId,
  dataSource = [],
  // filter,
  extraFetchKey = "",
  ...tableProps
}) => {
  const baiClient = useSuspendedBackendaiClient();
  const navigate = useNavigate();

  const [fetchKey, updateFetchKey] = useUpdatableState("initial-fetch");
  const deferredMergedFetchKey = useDeferredValue(fetchKey + extraFetchKey);
  const { t } = useTranslation();

  // FIXME: temporally disable radio-button because of unexpected behaviour.(all-selected)
  // const rowSelection = {
  //   onChange: (selectedRowKeys: React.Key[], selectedRows: ServingListInfo[]) => {
  //     console.log(
  //       `selectedRowKeys: ${selectedRowKeys}, 'selectedRow':`,
  //       selectedRows
  //     );
  //   },
  // };

  const columns: ColumnsType<ServingListInfo> = [
    {
      title: "Endpoint ID",
      dataIndex: "name",
      key: "name",
      render: (text, row) => <Link to={"/serving/" + row.id}>{text}</Link>,
    },
    {
      title: "Service Id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Controls",
      dataIndex: "controls",
      key: "control",
      render: () => (
        <>
          <Flex direction="row" align="stretch">
            <Button type="text" icon={<SettingFilled />} />
            <Button type="text" icon={<DeleteFilled />} />
          </Flex>
        </>
      ),
    },
    {
      title: "Desired Session Count",
      dataIndex: "desired_session_count",
      key: "desired_session_count",
    },
    {
      title: "Routing Count",
      dataIndex: "active_route_count",
      key: "active_route_count",
    },
    {
      title: "Open To Public",
      dataIndex: "is_public",
      key: "is_public",
      render: (is_public) => (is_public ? <CheckOutlined /> : <CloseOutlined />),
    },
  ];


  return (
    <>
      {/* {fetchKey}, {deferredFetchKey} */}
      {/* {fetchKey !== deferredFetchKey && <div>loading...{deferredFetchKey}</div>} */}
      <Table
        // FIXME: temporally disable radio-button because of unexpected behaviour.(all-selected)
        // rowSelection={{
        //   type: "radio",
        //   ...rowSelection,
        // }}
        columns={columns}
        dataSource={dataSource ? dataSource: []}
      />
    </>
  );
};

export default ServingList;
