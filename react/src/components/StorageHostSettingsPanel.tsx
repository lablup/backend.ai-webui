import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QuotaScopeType } from "../helper/index";

import { Card, Empty, theme } from "antd";

import Flex from "./Flex";
import ProjectSelector from "./ProjectSelector";
import UserSelector from "./UserSelector";
import ResourcePolicyCard from "./ResourcePolicyCard";
import FolderQuotaCard from "./FolderQuotaCard";

interface StorageHostSettingsPanelProps {
  isQuotaSupported?: boolean;
  extraFetchKey?: string;
}
const StorageHostSettingsPanel: React.FC<
  StorageHostSettingsPanelProps
> = ({
  isQuotaSupported = false,
  extraFetchKey = "",
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { storageHostId } = useParams<{
    storageHostId: string; // for `:storageHostId` on <Router path="/storage-settings:storageHostId" element={<StorageHostSettings />} />
  }>();

  const [currentSettingType, setCurrentSettingType] = useState<QuotaScopeType>("project");

  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [selectedProjectResourcePolicy, setSelectedProjectResourcePolicy] = useState<string>();
  const [selectedUserId, setSelectedUserId] = useState<string>();
  const [selectedUserResourcePolicy, setSelectedUserResourcePolicy] = useState<string>();

  const quotaScopeId = (currentSettingType === "project" ? selectedProjectId : selectedUserId);

  return (
    <Flex
      direction="column"
      align="stretch"
      style={{ margin: token.marginSM, gap: token.margin }}
    >
      <Card
        title={t("storageHost.QuotaSettings")}
        tabList={[
          {
            key: "project",
            tab: t("storageHost.ForProject"),
          },
          {
            key: "user",
            tab: t("storageHost.ForUser"),
          },
        ]}
        activeTabKey={currentSettingType}
        // eslint-disable-next-line
        //@ts-ignore
        onTabChange={setCurrentSettingType}
      >
      {isQuotaSupported ? (
        <>
          <Flex justify="between">
            {currentSettingType === "project" ? (
              <ProjectSelector
                style={{ width: '30vw', marginBottom: 10 }}
                onSelectProject={(project: any) => {
                  setSelectedProjectId(project?.projectId);
                  setSelectedProjectResourcePolicy(project?.projectResourcePolicy);
                }}
              />
            ) : (
              <UserSelector
                style={{ width: '30vw', marginBottom: 10 }}
                onSelectUser={(user: any) => {
                  setSelectedUserId(user?.userId);
                  setSelectedUserResourcePolicy(user?.userResourcePolicy);
                }}
                />
            )}
          </Flex>
          <ResourcePolicyCard
            quotaScopeId={quotaScopeId}
            currentSettingType={currentSettingType}
            selectedProjectId={selectedProjectId}
            selectedUserId={selectedUserId}
            selectedProjectResourcePolicy={selectedProjectResourcePolicy}
            selectedUserResourcePolicy={selectedUserResourcePolicy}
            extraFetchKey={extraFetchKey}
          />
          <FolderQuotaCard
            currentSettingType={currentSettingType}
            storageHostId={storageHostId}
            selectedProjectId={selectedProjectId}
            selectedUserId={selectedUserId}
            selectedProjectResourcePolicy={selectedProjectResourcePolicy}
            selectedUserResourcePolicy={selectedUserResourcePolicy}
            extraFetchKey={extraFetchKey}
          />
      </>
    ) : (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={t("storageHost.QuotaDoesNotSupported")}
      />
    )}
    </Card>
    </Flex>
  );
};

export default StorageHostSettingsPanel;
