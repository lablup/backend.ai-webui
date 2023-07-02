import React, { useDeferredValue } from "react";
import graphql from "babel-plugin-relay/macro";
import { useLazyLoadQuery, useMutation } from "react-relay";
import { QuotaScopeCardQuery } from "./__generated__/QuotaScopeCardQuery.graphql";
import { QuotaScopeCardUnsetMutation } from "./__generated__/QuotaScopeCardUnsetMutation.graphql";

import {
  Card,
  CardProps,
  Table,
  Button,
  ButtonProps,
  Popconfirm,
  message,
  Empty,
} from "antd";
import { EditFilled, DeleteFilled, PlusOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";
import { useToggle } from "ahooks";
import { QuotaScopeType, addQuotaScopeTypePrefix } from "../helper/index";
import { useDateISOState } from "../hooks";
import QuotaSettingModal from "./QuotaSettingModal";

interface Props extends CardProps {
  currentSettingType?: QuotaScopeType;
  storageHostId?: string;
  selectedProjectId?: string;
  selectedUserId?: string;
  selectedProjectResourcePolicy?: string;
  selectedUserResourcePolicy?: string;
  extraFetchKey?: string;
}
const QuotaScopeCard: React.FC<Props> = ({
  currentSettingType="project",
  storageHostId,
  selectedProjectId,
  selectedUserId,
  selectedProjectResourcePolicy,
  selectedUserResourcePolicy,
  extraFetchKey,
  ...props
}) => {
  const { t } = useTranslation();

  const [internalFetchKey, updateInternalFetchKey] = useDateISOState();
  const deferredMergedFetchKey = useDeferredValue(internalFetchKey + extraFetchKey);

  const [visibleQuotaSettingModal, { toggle: toggleQuotaSettingModal }] = useToggle(false);

  const quotaScopeId = (currentSettingType === "project" ? selectedProjectId : selectedUserId);
  const quotaScopeIdWithPrefix = (quotaScopeId === undefined || quotaScopeId === null) ? "" : addQuotaScopeTypePrefix(currentSettingType, quotaScopeId);

  const { quota_scope } = useLazyLoadQuery<QuotaScopeCardQuery>(
    graphql`
      query QuotaScopeCardQuery(
        $quota_scope_id: String!,
        $storage_host_name: String!,
        $skipQuotaScope: Boolean!,
      ) {
        quota_scope (
          storage_host_name: $storage_host_name,
          quota_scope_id: $quota_scope_id,
        ) @skip(if: $skipQuotaScope) {
          id
          quota_scope_id
          storage_host_name
          details {
            hard_limit_bytes
          }
          ...QuotaSettingModalFragment
        }
    }
  `,
    {
      storage_host_name: storageHostId || "",
      quota_scope_id: quotaScopeIdWithPrefix,
      skipQuotaScope: storageHostId === "" || quotaScopeId === "" || storageHostId === undefined || quotaScopeId === undefined,
    },
    {
      fetchKey: deferredMergedFetchKey,
      fetchPolicy: "store-and-network",
    }
  );

  const [commitUnsetQuotaScope, isInFlightcommitUnsetQuotaScope] = useMutation<QuotaScopeCardUnsetMutation>(
    graphql`
      mutation QuotaScopeCardUnsetMutation(
        $quota_scope_id: String!,
        $storage_host_name: String!
      ) {
        unset_quota_scope (
          quota_scope_id: $quota_scope_id,
          storage_host_name: $storage_host_name,
        ) {
          quota_scope {
            id
            quota_scope_id
            storage_host_name
            details {
              hard_limit_bytes
            }
          }
        }
      }
    `,
  );

  const selectProjectOrUserFirst = (
    <Empty
      style={{ width: '100%' }}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <div>
          {t("storageHost.quotaSettings.SelectFirst")}
        </div>
      }
    />
  );

  const addQuotaConfigsWhenEmpty = (
    <Empty
      style={{ width: '100%' }}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <>
          <div style={{ margin: 10 }}>
            {t("storageHost.quotaSettings.ClickSettingButton")}
          </div>
          <Button
            icon={<PlusOutlined />}
            onClick={() => toggleQuotaSettingModal()}
          >
            {t("storageHost.quotaSettings.AddQuotaConfigs")}
          </Button>
        </>
      }
    />
  );

  interface UnsetButtonProps extends ButtonProps {}
  const UnsetButton: React.FC<UnsetButtonProps> = ({
    ...props
  }) => {
    const { t } = useTranslation();
    return (
      <Popconfirm
        title={t("storageHost.quotaSettings.UnsetCustomSettings")}
        description={t("storageHost.quotaSettings.ConfirmUnsetCustomQuota")}
        placement="bottom"
        onConfirm={() => {
          if (quotaScopeId && storageHostId) {
            commitUnsetQuotaScope({
              variables: {
                quota_scope_id: addQuotaScopeTypePrefix(currentSettingType, quotaScopeId),
                storage_host_name: storageHostId,
              },
              onCompleted() {
                message.success(t("storageHost.quotaSettings.QuotaScopeSuccessfullyUpdated"));
                updateInternalFetchKey();
              },
              onError(error) {
                message.error(error?.message);
              },
            });
          }
        }}
      >
        <Button 
        {...props}
        danger
        icon={<DeleteFilled />}
        >
        {t("button.Unset")}
      </Button>
    </Popconfirm>
  );
};

  return (
    <>
     <Card bordered={false}>
      <Table
          columns={[
            {
              title: "ID",
              dataIndex: "quota_scope_id",
              key: "quota_scope_id",
            },
            {
              title: t("storageHost.HardLimit") + " (bytes)",
              dataIndex: ["details", "hard_limit_bytes"],
              key: "hard_limit_bytes",
            },
            {
              title: t("general.Control"),
              key: "control",
              render: () => (
                <>
                  <Button
                    type="text"
                    icon={<EditFilled />}
                    onClick={() => toggleQuotaSettingModal()}
                  >
                    {t("button.Edit")}
                  </Button>
                  <UnsetButton type="text" />
                </>
              ),
            },
          ]}
          dataSource={storageHostId && (selectedProjectId || selectedUserId) && quota_scope ? [quota_scope] : []}
          locale={{ emptyText: (selectedProjectId || selectedUserId) ? addQuotaConfigsWhenEmpty : selectProjectOrUserFirst }}
          pagination={false}
        />
      </Card>
      <QuotaSettingModal
        open={visibleQuotaSettingModal}
        destroyOnClose={true}
        onCancel={toggleQuotaSettingModal}
        onOk={toggleQuotaSettingModal}
        quotaScopeId={quotaScopeId}
        storageHostName={storageHostId}
        currentSettingType={currentSettingType}
        selectedProjectResourcePolicy={selectedProjectResourcePolicy}
        selectedUserResourcePolicy={selectedUserResourcePolicy}
        quotaScopeFrgmt={quota_scope || null}
        onRequestClose={() => {
          updateInternalFetchKey();
          toggleQuotaSettingModal();
        }}
      /> 
    </>
  )
}

export default QuotaScopeCard;
