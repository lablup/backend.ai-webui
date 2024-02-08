import { usageIndicatorColor } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useShadowRoot } from './DefaultProviders';
import Flex from './Flex';
import { useControllableValue } from 'ahooks';
import { Select, SelectProps, Badge, Tooltip } from 'antd';
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
  autoSelectType?: 'usage' | 'default';
  showUsageStatus?: boolean;
  value?: string;
  onChange?: React.Dispatch<React.SetStateAction<VolumeInfo | undefined>>;
}
// TODO: use React.forwardRef
const StorageSelect: React.FC<Props> = ({
  autoSelectType,
  showUsageStatus,
  value,
  onChange,
  defaultValue,
  ...partialSelectProps
}) => {
  const { t } = useTranslation();

  const shadowRoot = useShadowRoot();
  const baiClient = useSuspendedBackendaiClient();

  const { data: vhostInfo, isLoading: isLoadingVhostInfo } = useQuery<{
    default: string;
    allowed: Array<string>;
    volume_info: any;
  }>('vhostInfo', () => {
    return baiClient.vfolder.list_hosts();
  });

  const [controllableState, setControllableState] = useControllableValue(
    _.omitBy({ value, onChange, defaultValue }, _.isUndefined),
  );
  useEffect(() => {
    if (!autoSelectType) return;
    let nextHost = vhostInfo?.default ?? vhostInfo?.allowed[0] ?? '';
    if (autoSelectType === 'usage') {
      const lowestUsageHost = _.minBy(
        _.map(vhostInfo?.allowed, (host) => ({
          host,
          volume_info: vhostInfo?.volume_info[host],
        })),
        'volume_info.usage.percentage',
      )?.host;
      nextHost = lowestUsageHost || nextHost;
    }
    setControllableState(nextHost, {
      id: nextHost,
      ...(vhostInfo?.volume_info[nextHost] || {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vhostInfo]);
  return (
    <Select
      filterOption={true}
      placeholder={t('data.SelectStorageHost')}
      loading={isLoadingVhostInfo}
      style={{
        // TODO: not good to hardcode
        minWidth: 165,
      }}
      value={controllableState}
      onChange={(host) => {
        setControllableState(host, {
          id: host,
          ...(vhostInfo?.volume_info[host] || {}),
        });
      }}
      optionLabelProp="value"
      options={_.map(vhostInfo?.allowed, (host) => ({
        label: showUsageStatus ? (
          <Flex align="center" gap={'xs'}>
            {vhostInfo?.volume_info[host]?.usage && (
              <Tooltip
                title={`${t('data.Host')} ${t('data.usage.Status')}:
                ${
                  vhostInfo?.volume_info[host]?.usage?.percentage < 70
                    ? t('data.usage.Adequate')
                    : vhostInfo?.volume_info[host]?.usage?.percentage < 90
                      ? t('data.usage.Caution')
                      : t('data.usage.Insufficient')
                }`}
                // @ts-ignore
                getPopupContainer={() => shadowRoot}
              >
                <Badge
                  color={usageIndicatorColor(
                    vhostInfo?.volume_info[host]?.usage?.percentage,
                  )}
                />
              </Tooltip>
            )}
            {host}
            {/* TODO: uncomment after implementing click action */}
            {/* <Button type="link" size="small" icon={<InfoCircleOutlined />} /> */}
          </Flex>
        ) : (
          host
        ),
        value: host,
      }))}
      {...partialSelectProps}
    />
  );
};

export default StorageSelect;
