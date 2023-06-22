import React from "react";
import graphql from "babel-plugin-relay/macro";
import { useLazyLoadQuery } from "react-relay";
import { StorageHostSettingsQuery } from "./__generated__/StorageHostSettingsQuery.graphql";

import {
  Typography,
  theme,
} from "antd";
import { useTranslation } from "react-i18next";
import Flex from "./Flex";
import StorageHostResourcePanel from "./StorageHostPanels/StorageHostResourcePanel";
import StorageHostSettingsPanel from "./StorageHostPanels/StorageHostSettingsPanel";

interface StorageHostSettingsProps {}
const StorageHostSettings: React.FC<StorageHostSettingsProps> = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const storageHostId = window.location.href.split('/').pop()?? "";

  const { storage_volume } = useLazyLoadQuery<StorageHostSettingsQuery>(
    graphql`
      query StorageHostSettingsQuery(
        $id: String!
      ) {
        storage_volume(
          id: $id
        ) {
          id
          ...StorageHostResourcePanelFragment
        }
      }
    `,
    {
      id: storageHostId,
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

export default StorageHostSettings;
