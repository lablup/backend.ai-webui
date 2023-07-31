import React, { useEffect } from "react";
import { useQuery } from "react-query";

import { Select, SelectProps } from "antd";
import { useTranslation } from "react-i18next";
import { useSuspendedBackendaiClient } from "../hooks";
import _ from "lodash";

export type VolumeInfo = {
  id: string;
  backend: string;
  capabilities: string[];
  usage: {
    percentage: number;
  };
  sftp_scaling_groups: string[];
};
interface Props extends Omit<SelectProps, "value" | "onChange"> {
  value?: string | VolumeInfo;
  onChange: (hostName: string, volumeInfo: VolumeInfo) => void;
  autoSelectDefault?: boolean;
}
const StorageSelector: React.FC<Props> = ({
  value,
  onChange,
  autoSelectDefault,
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
    }
  );

  useEffect(() => {
    if (autoSelectDefault && !value && vhostInfo?.default) {
      onChange?.(vhostInfo?.default, {
        id: vhostInfo?.default,
        ...(vhostInfo?.volume_info[vhostInfo?.default] || {}),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Select
      filterOption={false}
      placeholder={t("data.SelectStorageHost")}
      loading={isLoadingVhostInfo}
      style={{ minWidth: 165 }}
      // @ts-ignore
      value={value?.id || value}
      onChange={(id) => {
        onChange?.(id, {
          id: id,
          ...(vhostInfo?.volume_info[id] || {}),
        });
      }}
      options={_.map(vhostInfo?.allowed, (host) => {
        return {
          value: host,
          label: host,
        };
      })}
      {...selectProps}
    />
  );
};

export default StorageSelector;
