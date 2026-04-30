/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import useControllableState_deprecated from '../hooks/useControllableState';
import TextHighlighter from './TextHighlighter';
import { Tooltip } from 'antd';
import {
  BAIFlex,
  BAISelect,
  BAISelectProps,
  StorageUsageBadge,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export type VolumeInfo = {
  id: string;
  backend: string;
  capabilities: string[];
  // `usage` is optional because `vfolder.list_hosts()` only attaches it for
  // hosts that can report capacity; `usage.percentage` is optional because
  // even a reporting host may omit the percentage.
  usage?: {
    percentage?: number;
  };
  sftp_scaling_groups: string[];
};

interface VHostInfo {
  default: string;
  allowed: Array<string>;
  volume_info?: {
    [key: string]: VolumeInfo;
  };
}

interface Props extends Omit<BAISelectProps, 'value' | 'onChange'> {
  autoSelectType?: 'usage' | 'default';
  showUsageStatus?: boolean;
  value?: string;
  onChange?: (v?: string, vInfo?: VolumeInfo) => void;
}
// TODO: use React.forwardRef
const StorageSelect: React.FC<Props> = ({
  autoSelectType,
  showUsageStatus,
  value,
  onChange,
  defaultValue,
  showSearch,
  ...partialSelectProps
}) => {
  const { t } = useTranslation();

  const baiClient = useSuspendedBackendaiClient();

  const { data: vhostInfo, isLoading: isLoadingVhostInfo } =
    useSuspenseTanQuery<VHostInfo | null>({
      queryKey: ['vhostInfo'],
      queryFn: () => {
        return baiClient.vfolder.list_hosts();
      },
    });

  const [controllableState, setControllableState] =
    useControllableState_deprecated({
      value,
      onChange,
      defaultValue,
    });
  const [controllableSearchValue, setControllableSearchValue] =
    useControllableState_deprecated({
      value:
        typeof showSearch === 'boolean' ? undefined : showSearch?.searchValue,
      onChange:
        typeof showSearch === 'boolean' ? undefined : showSearch?.onSearch,
    });
  useEffect(() => {
    if (!autoSelectType || !vhostInfo) return; // Return early if vhostInfo is null
    let nextHost = vhostInfo?.default ?? vhostInfo?.allowed[0] ?? '';
    if (autoSelectType === 'usage') {
      const lowestUsageHost = _.minBy(
        _.map(vhostInfo?.allowed, (host) => ({
          host,
          volume_info: vhostInfo?.volume_info?.[host],
        })),
        'volume_info.usage.percentage',
      )?.host;
      nextHost = lowestUsageHost || nextHost;
    }
    setControllableState(nextHost, {
      id: nextHost,
      ...(vhostInfo?.volume_info?.[nextHost] || {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vhostInfo]);
  return (
    <BAISelect
      placeholder={t('data.SelectStorageHost')}
      loading={isLoadingVhostInfo}
      popupMatchSelectWidth={false}
      value={controllableState}
      onChange={(host) => {
        setControllableState(host, {
          id: host,
          ...(vhostInfo?.volume_info?.[host] || {}),
        });
      }}
      showSearch={
        showSearch === false
          ? false
          : {
              ...(typeof showSearch === 'object' ? showSearch : {}),
              searchValue: controllableSearchValue,
              onSearch: setControllableSearchValue,
              filterOption: true,
            }
      }
      optionLabelProp={showUsageStatus ? 'label' : 'value'}
      options={_.map(vhostInfo?.allowed, (host) => {
        const usagePercent = vhostInfo?.volume_info?.[host]?.usage?.percentage;
        const usageLabel =
          usagePercent === undefined
            ? t('data.usage.Unknown')
            : usagePercent < 70
              ? t('data.usage.Adequate')
              : usagePercent < 90
                ? t('data.usage.Caution')
                : t('data.usage.Insufficient');
        return {
          label: showUsageStatus ? (
            <BAIFlex align="center">
              {vhostInfo?.volume_info?.[host]?.usage && (
                <Tooltip
                  title={t('data.usage.HostStatusTooltip', {
                    status: usageLabel,
                  })}
                >
                  <StorageUsageBadge percent={usagePercent} />
                  {/* Use &nbsp; instead of Flex gap to fix Tooltip  */}
                  &nbsp;&nbsp;
                </Tooltip>
              )}
              <TextHighlighter keyword={controllableSearchValue}>
                {host}
              </TextHighlighter>
              {/* TODO: uncomment after implementing click action */}
              {/* <Button type="link" size="small" icon={<InfoCircleOutlined />} /> */}
            </BAIFlex>
          ) : (
            host
          ),
          value: host,
        };
      })}
      {...partialSelectProps}
    />
  );
};

export default StorageSelect;
