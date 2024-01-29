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
  autoSelectType?: 'usage' | 'default';
  showUsageStatus?: boolean;
}
const StorageSelect: React.FC<Props> = ({
  value,
  onChange,
  autoSelectType,
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

  //for selecting default host
  useEffect(() => {
    if (!autoSelectType) return;

    let selectedHost = vhostInfo?.default ?? vhostInfo?.allowed[0] ?? '';
    if (autoSelectType === 'usage') {
      const lowestUsageHost = _.minBy(
        _.map(vhostInfo?.allowed, (host) => ({
          host,
          volume_info: vhostInfo?.volume_info[host],
        })),
        'volume_info.usage.percentage',
      );
      selectedHost = lowestUsageHost?.host || selectedHost;
    }

    onChange?.(selectedHost, {
      id: selectedHost,
      ...(vhostInfo?.volume_info[selectedHost] || {}),
    });
  }, []);

  const options = useMemo(() => {
    return _.map(vhostInfo?.allowed, (host) => ({
      label: host,
      value: host,
    }));
  }, [vhostInfo]);

  const hostUsageStatus = (host: string) => {
    const percentage = vhostInfo?.volume_info[host]?.usage?.percentage;
    const idx = percentage < 70 ? 0 : percentage < 90 ? 1 : 2;
    const type = ['adequate', 'caution', 'insufficient'][idx];

    return type;
  };

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
        options={options}
        optionRender={(option) => (
          <Space>
            {option.label}
            {showUsageStatus && (
              <div
                className={`host-status-indicator ${
                  // @ts-ignore
                  hostUsageStatus(option.label)
                }`}
              />
            )}
          </Space>
        )}
        {...selectProps}
      ></Select>
    </>
  );
};

export default StorageSelect;
