import React from "react";
import graphql from "babel-plugin-relay/macro";
import { useLazyLoadQuery } from "react-relay";
import { StorageHostSettingPageQuery } from "./__generated__/StorageHostSettingPageQuery.graphql";
import { useParams } from "react-router-dom";

import {
  Typography,
  theme,
} from "antd";
import Flex from "../components/Flex";
import StorageHostResourcePanel from "../components/StorageHostResourcePanel";
import StorageHostSettingsPanel from "../components/StorageHostSettingsPanel";

interface StorageHostSettingPageProps {}
const StorageHostSettingPage: React.FC<StorageHostSettingPageProps> = () => {
  const { token } = theme.useToken();
  const { storageHostId } = useParams<{
    storageHostId: string;  // for `:storageHostId` on <Router path="/storage-settings:storageHostId" element={<StorageHostSettings />} />
  }>();
  const { storage_volume } = useLazyLoadQuery<StorageHostSettingPageQuery>(
    graphql`
      query StorageHostSettingPageQuery(
        $id: String,
      ) {
        storage_volume(
          id: $id,
        ) {
          id
          ...StorageHostResourcePanelFragment
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
      <Typography.Title level={2}>{storageHostId}</Typography.Title>
      <StorageHostResourcePanel 
        resourceFrgmt={storage_volume}
      />
      <StorageHostSettingsPanel/>
    </Flex>
  );
};

export default StorageHostSettingPage;
