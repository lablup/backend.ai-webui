import React from "react";
import { useQuery } from "react-query";

import { Select, SelectProps } from "antd";
import { useTranslation } from "react-i18next";
import { useSuspendedBackendaiClient } from "../hooks";
import _ from "lodash";

interface Props extends SelectProps {
  value: string;
  onSelect: (hostName: string, volumeInfo: {}) => void;
}
const StorageSelector: React.FC<Props> = ({
  value,
  onSelect,
  ...selectProps
}) => {
  const { t } = useTranslation();

  const baiClient = useSuspendedBackendaiClient();

  const { data: vhostInfo, isLoading: isLoadingVhostInfo } = useQuery<{
    default: string;
    allowed: Array<string>;
    volume_info: any;
  }>(
    "vhostInfo",
    () => {
      return baiClient.vfolder.list_hosts();
    },
    {
      // for to render even this fail query failed
      suspense: false,
    }
  );

  return (
    <Select
      filterOption={false}
      placeholder={t("data.SelectStorageHost")}
      loading={isLoadingVhostInfo}
      style={{ minWidth: 165 }}
      defaultValue={vhostInfo?.default}
      onChange={(value, option) => {
        onSelect?.(value, option);
      }}
      options={_.map(vhostInfo?.allowed, (host) => {
        return {
          value: host,
          label: host,
          volume_info: vhostInfo?.volume_info[host],
        };
      })}
      {...selectProps}
    />
  );
};

export default StorageSelector;
