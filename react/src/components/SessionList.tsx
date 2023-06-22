import { Table, TableProps } from "antd";
import React, { useDeferredValue } from "react";
import { useLazyLoadQuery } from "react-relay";
import graphql from "babel-plugin-relay/macro";
import { SessionListQuery } from "./__generated__/SessionListQuery.graphql";
import { useTranslation } from "react-i18next";
import SessionInfoCell from "./SessionListColums/SessionInfoCell";
import { useSuspendedBackendaiClient, useUpdatableState } from "../hooks";

type Session = NonNullable<
  SessionListQuery["response"]["compute_session_list"]
>["items"][0];
interface SessionListProps extends Omit<TableProps<any>, "dataSource"> {
  status?: string[];
  limit?: number;
  currentPage?: number;
  pageSize?: number;
  projectId?: string;
  filter: (item: Session) => boolean;
  extraFetchKey?: string;
}
const SessionList: React.FC<SessionListProps> = ({
  status = [],
  limit = 50,
  currentPage = 1,
  pageSize = 50,
  projectId,
  filter,
  extraFetchKey = "",
  ...tableProps
}) => {
  const baiClient = useSuspendedBackendaiClient();

  const [fetchKey, updateFetchKey] = useUpdatableState("initial-fetch");
  const deferredMergedFetchKey = useDeferredValue(fetchKey + extraFetchKey);
  const { t } = useTranslation();

  if (
    !baiClient.supports("avoid-hol-blocking") &&
    status.includes("SCHEDULED")
  ) {
    status = status.filter((e) => e !== "SCHEDULED");
  }

  // TODO: ????
  // if (baiClient.supports('detailed-session-states')) {
  //   status = status.join(',');
  // }

  const { compute_session_list } = useLazyLoadQuery<SessionListQuery>(
    graphql`
      query SessionListQuery(
        $limit: Int!
        $offset: Int!
        $ak: String
        $group_id: String
        $status: String
        $skipClusterSize: Boolean!
      ) {
        compute_session_list(
          limit: $limit
          offset: $offset
          access_key: $ak
          group_id: $group_id
          status: $status
        ) {
          items {
            id
            type
            session_id
            name
            image
            architecture
            created_at
            terminated_at
            status
            status_info
            service_ports
            mounts
            occupied_slots
            access_key
            starts_at
            # type @skip(if: $skipClusterSize)

            cluster_size @skipOnClient(if: $skipClusterSize)
            # id
            # # hello
            # name @skipOnClient(if: $skipCodejong)
            # group_name @skip(if: $skipCodejong)
            # domain_name @required(action: LOG)
            # codejong
            # @graphql-ignore
            # hello @skip(if: true)

            # @ts-ignore

            # id session_id name image architecture created_at terminated_at status status_info service_ports mounts occupied_slots access_key starts_at type cluster_size cluster_mode status_data idle_checks inference_metrics scaling_group user_email containers {container_id agent occupied_slots live_stat last_stat} containers {agent}
            ...SessionInfoCellFragment
          }
        }
      }
    `,
    {
      // skipCodejong: false,
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
      status: status?.join(","),
      group_id: projectId,

      // skipOnClients
      skipClusterSize: !baiClient.supports("multi-container"),
    },
    {
      fetchKey: deferredMergedFetchKey,
      fetchPolicy: "network-only",
    }
  );

  return (
    <>
      {/* {fetchKey}, {deferredFetchKey} */}
      {/* {fetchKey !== deferredFetchKey && <div>loading...{deferredFetchKey}</div>} */}
      <Table
        scroll={{ x: true }}
        columns={[
          {
            title: t("session.SessionInfo"),
            render(value, record, index) {
              console.log(record);
              return (
                <SessionInfoCell
                  key={record.session_id}
                  sessionFrgmt={record}
                  onRename={() => {
                    updateFetchKey(
                      record.session_id + new Date().toISOString()
                    );
                  }}
                />
              );
            },
            fixed: "left",
          },
          {
            title: t("session.Status"),
            dataIndex: "status",
          },
          {
            title: t("general.Control"),
          },
          {
            title: t("session.Configuration"),
          },
          {
            title: t("session.Usage"),
          },
          {
            title: t("session.Reservation"),
          },
          {
            title: t("session.Architecture"),
          },
          {
            title: t("session.SessionType"),
          },
          {
            title: t("session.Agent"),
          },
        ]}
        // @ts-ignore
        dataSource={(compute_session_list?.items || []).filter(filter)}
        // dataSource={_.filter(compute_session_list?.items || [], () => {})}
        // pagination={{

        // }}
        {...tableProps}
      />
    </>
  );
};

export default SessionList;
