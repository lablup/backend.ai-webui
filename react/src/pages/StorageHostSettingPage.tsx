import React, { Suspense } from "react";
import graphql from "babel-plugin-relay/macro";
import { useLazyLoadQuery } from "react-relay";
import { StorageHostSettingPageQuery } from "./__generated__/StorageHostSettingPageQuery.graphql";
import { useParams } from "react-router-dom";

import { Typography, theme } from "antd";
import Flex from "../components/Flex";
import StorageHostResourcePanel from "../components/StorageHostResourcePanel";
import StorageHostSettingsPanel from "../components/StorageHostSettingsPanel";
import { useSuspendedBackendaiClient } from "../hooks";

interface StorageHostSettingPageProps {}
const StorageHostSettingPage: React.FC<StorageHostSettingPageProps> = () => {
  const { token } = theme.useToken();
  const { storageHostId } = useParams<{
    storageHostId: string; // for `:storageHostId` on <Router path="/storage-settings:storageHostId" element={<StorageHostSettings />} />
  }>();
  useSuspendedBackendaiClient();
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

  return (
    <Flex
      direction="column"
      align="stretch"
      style={{ margin: token.marginSM, gap: token.margin }}
    >
      <Typography.Title level={2}>{storageHostId || ""}</Typography.Title>
      <StorageHostResourcePanel storageVolumeFrgmt={storage_volume || null} />
      <Suspense fallback={<div>loading...</div>}>
        <StorageHostSettingsPanel storageVolumeFrgmt={storage_volume || null} />
      </Suspense>
    </Flex>
  );
};

export default StorageHostSettingPage;
