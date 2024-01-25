import { useSuspendedBackendaiClient } from '../hooks';
import Flex from './Flex';
import './StorageSelector.css';
import { Select, SelectProps } from 'antd';
import _ from 'lodash';
import React, { useEffect } from 'react';
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
        selectedHost = lowestPercentageHost?.host || vhostInfo?.default;
      }

      onChange?.(selectedHost, {
        id: `auto (${selectedHost})`,
        ...(vhostInfo?.volume_info[selectedHost] || {}),
      });
    }
    console.log(vhostInfo);
  }, []);

  //const idx = percentage < 70 ? 0 : percentage < 90 ? 1 : 2;
  // const type = ['Adequate', 'Caution', 'Insufficient'][idx];
  return (
    <Select
      filterOption={true}
      placeholder={t('data.SelectStorageHost')}
      loading={isLoadingVhostInfo}
      style={{ minWidth: 165, direction: 'ltr' }}
      // @ts-ignore
      value={value?.id || value}
      onChange={(id) => {
        onChange?.(id, {
          id: id,
          ...(vhostInfo?.volume_info[id] || {}),
        });
      }}
      {...selectProps}
    >
      {_.map(vhostInfo?.allowed, (host) => {
        return (
          <Select.Option key={host} value={host}>
            <Flex style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {host}
            </Flex>
          </Select.Option>
        );
      })}
    </Select>
  );
};

export default StorageSelect;
