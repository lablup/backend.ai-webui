import React, { Suspense } from "react";
import graphql from "babel-plugin-relay/macro";
import { useLazyLoadQuery } from "react-relay";
import { StorageHostSettingPageQuery } from "./__generated__/StorageHostSettingPageQuery.graphql";

import { Breadcrumb, Card, Empty, Typography, theme } from "antd";
import Flex from "../components/Flex";
import StorageHostResourcePanel from "../components/StorageHostResourcePanel";
import StorageHostSettingsPanel from "../components/StorageHostSettingsPanel";
import { useSuspendedBackendaiClient } from "../hooks";
import { useWebComponentInfo } from "../components/DefaultProviders";
import { useTranslation } from "react-i18next";

interface StorageHostSettingPageProps {
  storageHostId: string;
}
const StorageHostSettingPage: React.FC<StorageHostSettingPageProps> = ({
  storageHostId,
}) => {
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const { moveTo } = useWebComponentInfo();
  const { t } = useTranslation();
  const { storage_volume } = useLazyLoadQuery<StorageHostSettingPageQuery>(
    graphql`
      query StorageHostSettingPageQuery($id: String) {
        storage_volume(id: $id) {
          id
          capabilities
          ...StorageHostResourcePanelFragment
          ...StorageHostSettingsPanel_storageVolumeFrgmt
        }
      }
    `,
    {
      id: storageHostId || "",
    }
  );

  const isQuotaSupportedStorage =
    storage_volume?.capabilities?.includes("quota") ?? false;

  return (
    <Flex
      direction="column"
      align="stretch"
      style={{ margin: token.marginSM, gap: token.margin }}
    >
      <Breadcrumb
        items={[
          {
            title: "Resources",
            onClick: (e) => {
              e.preventDefault();
              moveTo("/agent");
            },
            href: "/agent",
          },
          {
            title: "Storage setting",
          },
        ]}
      ></Breadcrumb>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {storageHostId || ""}
      </Typography.Title>
      <StorageHostResourcePanel storageVolumeFrgmt={storage_volume || null} />
      {baiClient.supports("quota-scope") && (
        <>
          {isQuotaSupportedStorage ? (
            <Suspense fallback={<div>loading...</div>}>
              <StorageHostSettingsPanel
                storageVolumeFrgmt={storage_volume || null}
              />
            </Suspense>
          ) : (
            <Card title={t("storageHost.QuotaSettings")}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("storageHost.QuotaDoesNotSupported")}
              />
            </Card>
          )}
        </>
      )}
    </Flex>
  );
};

export default StorageHostSettingPage;
