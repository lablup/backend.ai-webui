/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  ImageListQuery,
  ImageListQuery$data,
  ImageListQuery$variables,
} from '../__generated__/ImageListQuery.graphql';
import { getImageFullName, localeCompare } from '../helper';
import { useBackendAIImageMetaData } from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import AliasedImageDoubleTags from './AliasedImageDoubleTags';
import ImageInstallModal from './ImageInstallModal';
import ManageAppsModal from './ManageAppsModal';
import ManageImageResourceLimitModal from './ManageImageResourceLimitModal';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import {
  AppstoreOutlined,
  ReloadOutlined,
  SettingOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { App, Button, Tag, theme, Tooltip, Typography } from 'antd';
import type { ColumnType } from 'antd/es/table';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAIFlex,
  BAIPropertyFilter,
  BAITable,
  BAIResourceNumberWithIcon,
  useFetchKey,
  INITIAL_FETCH_KEY,
} from 'backend.ai-ui';
import _ from 'lodash';
import { Key, useDeferredValue, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useBAIPaginationOptionStateOnSearchParam } from 'src/hooks/reactPaginationQueryOptions';

export type EnvironmentImage = NonNullableNodeOnEdges<
  ImageListQuery$data['image_nodes']
>;

const ImageList: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  'use memo';

  const { t } = useTranslation();
  const [selectedRows, setSelectedRows] = useState<EnvironmentImage[]>([]);
  const [, { tagAlias }] = useBackendAIImageMetaData();
  const { token } = theme.useToken();
  const [managingApp, setManagingApp] = useState<EnvironmentImage | null>(null);
  const [managingResourceLimit, setManagingResourceLimit] =
    useState<EnvironmentImage | null>(null);
  const [isOpenInstallModal, setIsOpenInstallModal] = useState<boolean>(false);
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [, startTransition] = useTransition();
  const [installingImages, setInstallingImages] = useState<string[]>([]);
  const { message } = App.useApp();
  const [imageFilter, setImageFilter] = useState('');
  const [visibleColumnSettingModal, { toggle: toggleColumnSettingModal }] =
    useToggle();
  const [isPendingRefreshTransition, startRefreshTransition] = useTransition();
  const [isPendingFilterTransition, startFilterTransition] = useTransition();
  const currentProject = useCurrentProjectValue();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 20,
  });

  const queryVariables: ImageListQuery$variables = {
    scopeId: `project:${currentProject.id}`,
    offset: baiPaginationOption.offset,
    first: baiPaginationOption.first,
    filter: imageFilter || undefined,
    order: undefined,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { image_nodes } = useLazyLoadQuery<ImageListQuery>(
    graphql`
      query ImageListQuery(
        $scopeId: ScopeField!
        $offset: Int
        $first: Int
        $filter: String
        $order: String
      ) {
        image_nodes(
          scope_id: $scopeId
          offset: $offset
          first: $first
          filter: $filter
          order: $order
        ) {
          edges @required(action: THROW) {
            node @required(action: THROW) {
              id @required(action: THROW)
              name @deprecatedSince(version: "24.12.0")
              tag
              registry
              architecture
              digest
              installed
              labels {
                key
                value
              }
              humanized_name
              resource_limits {
                key
                min
                max
              }
              namespace @since(version: "24.12.0")
              base_image_name @since(version: "24.12.0")
              tags @since(version: "24.12.0") {
                key
                value
              }
              version @since(version: "24.12.0")
              ...AliasedImageDoubleTagsFragment
              ...ManageImageResourceLimitModal_image
              ...ManageAppsModal_image
            }
          }
          count
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

  const imageData = filterOutNullAndUndefined(
    image_nodes?.edges?.map((edge) => edge?.node) ?? [],
  );

  const columns: Array<ColumnType<EnvironmentImage>> = filterOutEmpty([
    {
      title: t('environment.Status'),
      dataIndex: 'installed',
      key: 'installed',
      defaultSortOrder: 'descend',
      sorter: (a, b) => {
        return _.toNumber(a?.installed || 0) - _.toNumber(b?.installed || 0);
      },
      render: (_text, row) =>
        row?.installed ? (
          <Tag color="gold">{t('environment.Installed')}</Tag>
        ) : row?.id && installingImages.includes(row.id) ? (
          <Tag color="gold">{t('environment.Installing')}</Tag>
        ) : null,
    },
    {
      title: t('environment.FullImagePath'),
      key: 'fullImagePath',
      render: (row) => (
        <Typography.Text
          copyable={{
            text: getImageFullName(row) || '',
          }}
        >
          {getImageFullName(row) || ''}
        </Typography.Text>
      ),
      sorter: (a, b) => localeCompare(getImageFullName(a), getImageFullName(b)),
      width: token.screenXS,
    },
    {
      title: t('environment.Registry'),
      dataIndex: 'registry',
      key: 'registry',
      sorter: (a, b) => localeCompare(a?.registry, b?.registry),
    },
    {
      title: t('environment.Architecture'),
      dataIndex: 'architecture',
      key: 'architecture',
      sorter: (a, b) => localeCompare(a?.architecture, b?.architecture),
    },
    {
      title: t('environment.Namespace'),
      key: 'namespace',
      dataIndex: 'namespace',
      sorter: (a, b) => localeCompare(a?.namespace, b?.namespace),
    },
    {
      title: t('environment.BaseImageName'),
      key: 'base_image_name',
      dataIndex: 'base_image_name',
      sorter: (a, b) => localeCompare(a?.base_image_name, b?.base_image_name),
      render: (text) => tagAlias(text),
    },
    {
      title: t('environment.Version'),
      key: 'version',
      dataIndex: 'version',
      sorter: (a, b) => localeCompare(a?.version, b?.version),
    },
    {
      title: t('environment.Tags'),
      key: 'tags',
      dataIndex: 'tags',
      render: (_text, row) => (
        <AliasedImageDoubleTags label="" color="blue" imageFrgmt={row} />
      ),
    },
    {
      title: t('environment.Digest'),
      dataIndex: 'digest',
      key: 'digest',
      sorter: (a, b) => localeCompare(a?.digest || '', b?.digest || ''),
      render: (_text, row) => (
        <Typography.Text ellipsis={{ tooltip: true }} style={{ maxWidth: 200 }}>
          {row.digest}
        </Typography.Text>
      ),
    },
    {
      title: t('environment.ResourceLimit'),
      dataIndex: 'resource_limits',
      key: 'resource_limits',
      render: (_text, row) => (
        <BAIFlex direction="row" gap="xxs">
          {row?.resource_limits?.map((resource_limit) => (
            <BAIResourceNumberWithIcon
              key={resource_limit?.key}
              type={resource_limit?.key || ''}
              value={resource_limit?.min || '0'}
              max={resource_limit?.max || 'Infinity'}
            />
          ))}
        </BAIFlex>
      ),
    },
    {
      title: t('general.Control'),
      key: 'control',
      dataIndex: 'control',
      fixed: 'right',
      render: (_text, row) => (
        <BAIFlex
          direction="row"
          align="stretch"
          justify="center"
          gap="xxs"
          onClick={(e) => {
            // To prevent the click event from selecting the row
            e.stopPropagation();
          }}
        >
          <Button
            type="text"
            icon={
              <SettingOutlined
                style={{
                  color: token.colorInfo,
                }}
              />
            }
            onClick={() => setManagingResourceLimit(row)}
          />
          <Button
            type="text"
            icon={
              <AppstoreOutlined
                style={{
                  color: token.colorInfo,
                }}
              />
            }
            onClick={() => {
              setManagingApp(row);
            }}
          />
        </BAIFlex>
      ),
    },
  ]);

  const [hiddenColumnKeys, setHiddenColumnKeys] =
    useHiddenColumnKeysSetting('ImageList');

  return (
    <>
      <BAIFlex
        direction="column"
        align="stretch"
        style={{
          flex: 1,
          ...style,
        }}
        gap="sm"
      >
        <BAIFlex justify="between">
          <BAIPropertyFilter
            filterProperties={filterOutEmpty([
              {
                key: 'id',
                propertyLabel: t('environment.ID'),
                type: 'string',
                defaultOperator: '==',
              },
              {
                key: 'image',
                propertyLabel: t('environment.Image'),
                type: 'string',
              },
              {
                key: 'name',
                propertyLabel: t('environment.Name'),
                type: 'string',
              },
              {
                key: 'registry',
                propertyLabel: t('environment.Registry'),
                type: 'string',
              },
              {
                key: 'architecture',
                propertyLabel: t('environment.Architecture'),
                type: 'string',
                strictSelection: true,
                defaultOperator: '==',
                options: [
                  { label: 'x86_64', value: 'x86_64' },
                  { label: 'aarch64', value: 'aarch64' },
                ],
              },
              {
                key: 'namespace',
                propertyLabel: t('environment.Namespace'),
                type: 'string',
              },
              {
                key: 'base_image_name',
                propertyLabel: t('environment.BaseImageName'),
                type: 'string',
              },
              {
                key: 'tag',
                propertyLabel: t('environment.Tags'),
                type: 'string',
              },
              {
                key: 'status',
                propertyLabel: t('environment.Status'),
                type: 'string',
                strictSelection: true,
                defaultOperator: '==',
                options: [
                  { label: 'ALIVE', value: 'ALIVE' },
                  { label: 'DELETED', value: 'DELETED' },
                ],
              },
              {
                key: 'type',
                propertyLabel: t('data.Type'),
                type: 'string',
                strictSelection: true,
                defaultOperator: '==',
                options: [
                  { label: 'COMPUTE', value: 'COMPUTE' },
                  { label: 'SERVICE', value: 'SERVICE' },
                  { label: 'SYSTEM', value: 'SYSTEM' },
                ],
              },
              {
                key: 'is_local',
                propertyLabel: t('environment.Local'),
                type: 'boolean',
              },
            ])}
            value={imageFilter || undefined}
            onChange={(value) => {
              startFilterTransition(() => {
                setImageFilter(value || '');
                setTablePaginationOption({ current: 1 });
              });
            }}
          />
          <BAIFlex gap={'xs'}>
            {selectedRows.length > 0 ? (
              <Typography.Text>
                {t('general.NSelected', {
                  count: selectedRows.length,
                })}
              </Typography.Text>
            ) : null}
            <Tooltip title={t('button.Refresh')}>
              <Button
                icon={<ReloadOutlined />}
                loading={isPendingRefreshTransition}
                onClick={() => {
                  setSelectedRows([]);
                  startRefreshTransition(() => updateFetchKey());
                }}
              />
            </Tooltip>

            <Button
              icon={<VerticalAlignBottomOutlined />}
              style={{ backgroundColor: token.colorPrimary, color: 'white' }}
              onClick={() => {
                if (selectedRows.length === 0) {
                  message.error(t('environment.NoImagesAreSelected'));
                  return;
                }
                if (selectedRows.some((image) => !image.installed)) {
                  setIsOpenInstallModal(true);
                  return;
                }
                message.error(t('environment.AlreadyInstalledImage'));
              }}
            >
              {t('environment.Install')}
            </Button>
          </BAIFlex>
        </BAIFlex>
        <BAITable
          resizable
          rowKey="id"
          scroll={{ x: 'max-content' }}
          pagination={{
            total: image_nodes?.count ?? undefined,
            ...tablePaginationOption,
            onChange: (page, pageSize) => {
              setTablePaginationOption({ current: page, pageSize });
            },
            extraContent: (
              <Button
                type="text"
                icon={<SettingOutlined />}
                onClick={() => {
                  toggleColumnSettingModal();
                }}
              />
            ),
          }}
          dataSource={imageData}
          columns={_.filter(
            columns,
            (column) => !_.includes(hiddenColumnKeys, _.toString(column?.key)),
          )}
          loading={isPendingFilterTransition}
          rowSelection={{
            type: 'checkbox',
            onChange: (_, selectedRows) => {
              setSelectedRows(selectedRows);
            },
            selectedRowKeys: selectedRows.map((row) => row.id) as Key[],
          }}
          onRow={(record) => ({
            onClick: () => {
              // selected or deselect row
              if (selectedRows.find((row) => row.id === record.id)) {
                setSelectedRows((rows) =>
                  rows.filter((row) => row.id !== record.id),
                );
              } else {
                setSelectedRows((rows) => [...rows, record]);
              }
            },
          })}
          showSorterTooltip={false}
        />
      </BAIFlex>
      <ManageImageResourceLimitModal
        open={!!managingResourceLimit}
        onRequestClose={(success) => {
          setManagingResourceLimit(null);
          if (success)
            startTransition(() => {
              updateFetchKey();
            });
        }}
        imageFrgmt={managingResourceLimit}
      />
      <ManageAppsModal
        open={!!managingApp}
        onRequestClose={(success) => {
          setManagingApp(null);
          if (success)
            startTransition(() => {
              updateFetchKey();
            });
        }}
        imageFrgmt={managingApp}
      />
      <ImageInstallModal
        open={isOpenInstallModal}
        onRequestClose={() => {
          setIsOpenInstallModal(false);
        }}
        setInstallingImages={setInstallingImages}
        selectedRows={selectedRows}
      />
      <TableColumnsSettingModal
        open={visibleColumnSettingModal}
        onRequestClose={(values) => {
          values?.selectedColumnKeys &&
            setHiddenColumnKeys(
              _.difference(
                columns.map((column) => _.toString(column.key)),
                values?.selectedColumnKeys,
              ),
            );
          toggleColumnSettingModal();
        }}
        columns={columns}
        hiddenColumnKeys={hiddenColumnKeys}
      />
    </>
  );
};

export default ImageList;
