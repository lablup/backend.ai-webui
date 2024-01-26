import { useSuspendedBackendaiClient } from '../hooks';
// @ts-ignore
import rawSelectCss from './StorageSelect.css?raw';
import { Select, SelectProps, Space } from 'antd';
import _ from 'lodash';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';

export type VolumeInfo = {
  id: string;
  backend: string;
  capabilities: string[];
  usage: {
    percentage: number;
  };
  sftp_scaling_groups: string[];
};
interface Props extends Omit<SelectProps, 'value' | 'onChange'> {
  value?: string | VolumeInfo;
  onChange?: (hostName: string, volumeInfo: VolumeInfo) => void;
  autoSelectDefault?: boolean;
  showUsageStatus?: boolean;
}
const StorageSelect: React.FC<Props> = ({
  value,
  onChange,
  autoSelectDefault,
  showUsageStatus,
  ...selectProps
}) => {
  const { t } = useTranslation();

  const baiClient = useSuspendedBackendaiClient();

  const { data: vhostInfo, isLoading: isLoadingVhostInfo } = useQuery<{
    default: string;
    allowed: Array<string>;
    volume_info: any;
  }>('vhostInfo', () => {
    return baiClient.vfolder.list_hosts();
  });

  useEffect(() => {
    if (autoSelectDefault && !value && vhostInfo?.default) {
      let selectedHost = vhostInfo?.default;

      if (showUsageStatus) {
        const lowestPercentageHost = _.minBy(
          _.map(vhostInfo?.allowed, (host) => ({
            host,
            volume_info: vhostInfo?.volume_info[host],
          })),
          'volume_info.usage.percentage',
        );
        selectedHost =
          `auto (${lowestPercentageHost?.host})` || vhostInfo?.default;
      }

      onChange?.(selectedHost, {
        id: selectedHost,
        ...(vhostInfo?.volume_info[selectedHost] || {}),
      });
    }
  }, []);

  const hostUsageStatus = (host: string) => {
    const percentage = vhostInfo?.volume_info[host]?.usage?.percentage;
    const idx = percentage < 70 ? 0 : percentage < 90 ? 1 : 2;
    const type = ['adequate', 'caution', 'insufficient'][idx];

    return type;
  };

  const options = useMemo(() => {
    return _.map(vhostInfo?.allowed, (host) => ({
      label: (
        <Space>
          {host}
          {showUsageStatus && (
            <div className={`host-status-indicator ${hostUsageStatus(host)}`} />
          )}
        </Space>
      ),
      value: host,
    }));
  }, [vhostInfo]);

  return (
    <>
      <style>{rawSelectCss}</style>
      <Select
        filterOption={true}
        placeholder={t('data.SelectStorageHost')}
        loading={isLoadingVhostInfo}
        style={{ minWidth: 165, direction: 'ltr' }}
        // @ts-ignore
        value={value?.id || value}
        onChange={(host) => {
          onChange?.(host, {
            id: host,
            ...(vhostInfo?.volume_info[host] || {}),
          });
        }}
      >
        {options.map((option) => (
          <Select.Option key={option.value}>{option.label}</Select.Option>
        ))}
      </Select>
    </>
  );
};

export default StorageSelect;
