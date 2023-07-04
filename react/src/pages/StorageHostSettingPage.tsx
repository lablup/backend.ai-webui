import React, { Suspense } from "react";
import graphql from "babel-plugin-relay/macro";
import { useLazyLoadQuery } from "react-relay";
import { StorageHostSettingPageQuery } from "./__generated__/StorageHostSettingPageQuery.graphql";

import { Typography, theme } from "antd";
import Flex from "../components/Flex";
import StorageHostResourcePanel from "../components/StorageHostResourcePanel";
import StorageHostSettingsPanel from "../components/StorageHostSettingsPanel";
import { useSuspendedBackendaiClient } from "../hooks";

interface StorageHostSettingPageProps {
  storageHostId: string;
}
const StorageHostSettingPage: React.FC<StorageHostSettingPageProps> = ({
  storageHostId,
}) => {
  const { token } = theme.useToken();
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
      <Typography.Title level={3} style={{ margin: 0 }}>
        {storageHostId || ""}
      </Typography.Title>
      <StorageHostResourcePanel storageVolumeFrgmt={storage_volume || null} />
      <Suspense fallback={<div>loading...</div>}>
        <StorageHostSettingsPanel storageVolumeFrgmt={storage_volume || null} />
      </Suspense>
    </Flex>
  );
};

export default StorageHostSettingPage;
