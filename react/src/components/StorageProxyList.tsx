/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { StorageProxyListQuery } from '../__generated__/StorageProxyListQuery.graphql';
import {
  convertToDecimalUnit,
  convertUnitValue,
  toFixedFloorWithoutTrailingZeros,
} from '../helper';
import { useBAIPaginationOptionStateOnSearchParamLegacy } from '../hooks/reactPaginationQueryOptions';
import AutoUpdateFetchKeyButton from './AutoUpdateFetchKeyButton';
import StorageHostDetailDrawer from './StorageHostDetailDrawer';
import { type TableColumnsType, Tag, theme, Typography } from 'antd';
import {
  filterOutNullAndUndefined,
  BAICephIcon,
  BAIFlex,
  BAILink,
  BAIPureStorageIcon,
  BAITable,
  BAIProgressWithLabel,
  BAIDoubleTag,
  BAIUnmountAfterClose,
  INITIAL_FETCH_KEY,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Server } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const backendType = {
  xfs: {
    color: 'blue',
    icon: <Server />,
  },
  ceph: {
    color: 'geekblue',
    icon: <BAICephIcon />,
  },
  cephfs: {
    color: 'geekblue',
    icon: <BAICephIcon />,
  },
  vfs: {
    color: 'green',
    icon: <Server />,
  },
  nfs: {
    color: 'green',
    icon: <Server />,
  },
  purestorage: {
    color: 'red',
    icon: <BAIPureStorageIcon />,
  },
  dgx: {
    color: 'green',
    icon: <Server />,
  },
  spectrumscale: {
    color: 'green',
    icon: <Server />,
  },
  weka: {
    color: 'purple',
    icon: <Server />,
  },
};

type StorageVolume = NonNullable<
  NonNullable<
    StorageProxyListQuery['response']['storage_volume_list']
  >['items'][number]
>;

const StorageProxyList = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const [drawerStorageHostId, setDrawerStorageHostId] = useState<string | null>(
    null,
  );
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParamLegacy({
    current: 1,
    pageSize: 10,
  });
  const [fetchKey, updateFetchKey] = useFetchKey();
  const queryVariables = useMemo(
    () => ({
      offset: baiPaginationOption.offset,
      limit: baiPaginationOption.limit,
    }),
    [baiPaginationOption.offset, baiPaginationOption.limit],
  );
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);
  const { storage_volume_list } = useLazyLoadQuery<StorageProxyListQuery>(
    graphql`
      query StorageProxyListQuery($offset: Int!, $limit: Int!) {
        storage_volume_list(limit: $limit, offset: $offset) {
          items {
            id
            backend
            capabilities
            path
            fsprefix
            usage
            ...StorageHostDetailDrawerFragment @alias(as: "storageVolumeFrgmt")
          }
          total_count
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
      fetchKey: deferredFetchKey,
    },
  );

  const columns: TableColumnsType<StorageVolume> = [
    {
      title: <>ID / {t('agent.Endpoint')}</>,
      key: 'id',
      dataIndex: 'id',
      fixed: 'left',
      render: (value, record) => {
        return (
          <BAIFlex direction="column" align="start">
            <BAILink
              onClick={() => {
                setDrawerStorageHostId(record.id ?? null);
              }}
            >
              {value}
            </BAILink>
            <Typography.Text type="secondary">{record.path}</Typography.Text>
          </BAIFlex>
        );
      },
    },
    {
      title: t('agent.BackendType'),
      key: 'backend',
      dataIndex: 'backend',
      render: (value) => {
        const platform = backendType[value as keyof typeof backendType] ?? {
          color: 'gold',
          icon: <Server />,
        };

        return (
          <BAIFlex gap="xxs">
            {platform.icon}
            <BAIDoubleTag
              values={[
                {
                  label: 'Backend',
                },
                {
                  label: value,
                  color: platform.color,
                },
              ]}
            />
          </BAIFlex>
        );
      },
    },
    {
      title: t('agent.Resources'),
      key: 'usage',
      dataIndex: 'usage',
      render: (value) => {
        const usage = JSON.parse(value);
        const ratio =
          usage?.capacity_bytes > 0
            ? usage.used_bytes / usage.capacity_bytes
            : 0;
        const percent = _.toFinite(
          toFixedFloorWithoutTrailingZeros(ratio * 100, 2),
        );
        const color = percent > 80 ? token.colorError : token.colorSuccess;
        const baseUnit =
          convertUnitValue(_.toString(usage?.capacity_bytes), 'auto', {
            base: 1000,
          })?.unit || 'g';
        return (
          <>
            <BAIProgressWithLabel
              valueLabel={toFixedFloorWithoutTrailingZeros(percent, 1) + ' %'}
              percent={percent}
              strokeColor={color}
              width={120}
            />
            <Typography.Text style={{ fontSize: token.fontSizeSM }}>
              {usage.used_bytes
                ? convertToDecimalUnit(usage.used_bytes, baseUnit)?.numberFixed
                : '-'}
              &nbsp;/&nbsp;
              {usage.capacity_bytes
                ? convertToDecimalUnit(usage.capacity_bytes, baseUnit)
                    ?.displayValue
                : '-'}
            </Typography.Text>
          </>
        );
      },
    },
    {
      title: t('agent.Capabilities'),
      key: 'capabilities',
      dataIndex: 'capabilities',
      width: 150,
      render: (value) => {
        return (
          <BAIFlex gap="xxs" align="start" wrap="wrap">
            {_.map(value, (item) => (
              <Tag key={item} color="blue">
                {item}
              </Tag>
            ))}
          </BAIFlex>
        );
      },
    },
  ];

  useEffect(() => {
    if (!_.isEmpty(storage_volume_list?.items)) {
      // This event is being listened to by the plugin
      const event = new CustomEvent('backend-ai-storage-proxy-updated', {});
      document.dispatchEvent(event);
    }
  }, [storage_volume_list]);

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex justify="end" wrap="wrap" gap="sm">
        {/* // TODO: implement filter when filter and order are supported
          <BAIPropertyFilter
            filterProperties={[
              {
                key: 'id',
                propertyLabel: 'ID',
                type: 'string',
              },
            ]}
          /> */}
        <AutoUpdateFetchKeyButton
          settingId="storage-proxy-list"
          loading={
            deferredFetchKey !== fetchKey ||
            deferredQueryVariables !== queryVariables
          }
          value={fetchKey}
          onChange={() => {
            updateFetchKey();
          }}
        />
      </BAIFlex>
      <BAITable
        resizable
        size="small"
        scroll={{ x: 'max-content' }}
        rowKey={'id'}
        dataSource={filterOutNullAndUndefined(storage_volume_list?.items)}
        columns={columns}
        loading={
          deferredQueryVariables !== queryVariables ||
          deferredFetchKey !== fetchKey
        }
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          current: tablePaginationOption.current,
          total: storage_volume_list?.total_count ?? 0,
          onChange(current, pageSize) {
            if (_.isNumber(current) && _.isNumber(pageSize)) {
              setTablePaginationOption({
                pageSize,
                current,
              });
            }
          },
        }}
      />
      <BAIUnmountAfterClose>
        <StorageHostDetailDrawer
          open={!!drawerStorageHostId}
          storageVolumeFrgmt={
            _.find(
              storage_volume_list?.items,
              (v) => v?.id === drawerStorageHostId,
            )?.storageVolumeFrgmt ?? null
          }
          onRefetchParentList={() => {
            updateFetchKey();
          }}
          onRequestClose={() => setDrawerStorageHostId(null)}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default StorageProxyList;
