import { usageIndicatorColor } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import Flex from './Flex';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useControllableValue } from 'ahooks';
import { Select, SelectProps, Badge, Button } from 'antd';
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
  onChange?: React.Dispatch<React.SetStateAction<VolumeInfo | undefined>>;
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

  const [state, setState] = useControllableValue({ value, onChange });

  useEffect(() => {
    console.log('!');
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
    setState({
      id: selectedHost,
      ...(vhostInfo?.volume_info[selectedHost] || {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vhostInfo]);

  const optionRender = useMemo(() => {
    return (option: any) => {
      if (showUsageStatus) {
        const percentage =
          vhostInfo?.volume_info[option.label]?.usage?.percentage;
        return (
          <Flex justify="between" align="center">
            <Badge
              // @ts-ignore
              color={usageIndicatorColor(percentage)}
              text={option.label}
            />
            <Button type="link" size="small" icon={<InfoCircleOutlined />} />
          </Flex>
        );
      }
      return option.label;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vhostInfo]);

  return (
    <Select
      filterOption={true}
      placeholder={t('data.SelectStorageHost')}
      loading={isLoadingVhostInfo}
      style={{
        minWidth: 165,
        direction: 'ltr',
      }}
      // @ts-ignore
      value={state?.id || state}
      onChange={(host) => {
        setState({
          id: host,
          ...(vhostInfo?.volume_info[host] || {}),
        });
      }}
      options={_.map(vhostInfo?.allowed, (host) => ({
        label: host,
        value: host,
      }))}
      optionRender={optionRender}
      {...selectProps}
    />
  );
};

export default StorageSelect;
