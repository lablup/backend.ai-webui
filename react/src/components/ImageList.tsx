import Flex from '../components/Flex';
import {
  filterEmptyItem,
  filterNonNullItems,
  getImageFullName,
  localeCompare,
} from '../helper';
import {
  useBackendAIImageMetaData,
  useSuspendedBackendaiClient,
  useUpdatableState,
} from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useDeferredQueryParams } from '../hooks/useDeferredQueryParams';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import BAIPropertyFilter from './BAIPropertyFilter';
import BAITable from './BAITable';
import ImageInstallModal from './ImageInstallModal';
import ImageNodeSimpleTag from './ImageNodeSimpleTag';
import { ImageTags } from './ImageTags';
import ManageAppsModal from './ManageAppsModal';
import ManageImageResourceLimitModal from './ManageImageResourceLimitModal';
import ResourceNumber from './ResourceNumber';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import TextHighlighter from './TextHighlighter';
import {
  ImageListNodeQuery,
  ImageListNodeQuery$data,
  ImageListNodeQuery$variables,
} from './__generated__/ImageListNodeQuery.graphql';
import {
  AppstoreOutlined,
  ReloadOutlined,
  SettingOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { App, Button, TableColumnsType, theme, Typography } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { Key, useDeferredValue, useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';
import { StringParam, withDefault } from 'use-query-params';

export type ImageNode = NonNullable<
  NonNullable<
    NonNullable<ImageListNodeQuery$data['image_nodes']>['edges'][number]
  >['node']
>;

// "id": ("id", None),
// "name": ("name", None),
// "project": ("project", None),
// "image": ("image", None),
// "created_at": ("created_at", dtparse),
// "registry": ("registry", None),
// "registry_id": ("registry_id", None),
// "architecture": ("architecture", None),
// "is_local": ("is_local", None),
// "type": ("session_type", ImageType),
// "accelerators": ("accelerators", None),

const ImageList: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const { t } = useTranslation();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [, { getBaseVersion, getBaseImage, tagAlias }] =
    useBackendAIImageMetaData();
  const { token } = theme.useToken();
  const [managingApp, setManagingApp] = useState<ImageNode | null>(null);
  const [managingResourceLimit, setManagingResourceLimit] =
    useState<ImageNode | null>(null);
  const [isOpenInstallModal, setIsOpenInstallModal] = useState<boolean>(false);
  const [environmentFetchKey, updateEnvironmentFetchKey] =
    useUpdatableState('initial-fetch');
  const [, startTransition] = useTransition();
  const [installingImages, setInstallingImages] = useState<string[]>([]);
  const { message } = App.useApp();
  const [visibleColumnSettingModal, { toggle: toggleColumnSettingModal }] =
    useToggle();
  const [isPendingRefreshTransition, startRefreshTransition] = useTransition();
  const baiClient = useSuspendedBackendaiClient();
  const supportExtendedImageInfo = baiClient?.supports('extended-image-info');
  console.log(supportExtendedImageInfo);
  const currentProject = useCurrentProjectValue();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });
  const [queryParams, setQuery] = useDeferredQueryParams({
    order: withDefault(StringParam, undefined),
    filter: withDefault(StringParam, undefined),
  });
  const queryVariables: ImageListNodeQuery$variables = useMemo(
    () => ({
      scope_id: currentProject?.id ? `project:${currentProject.id}` : '',
      offset: baiPaginationOption.offset,
      first: baiPaginationOption.first,
      order: queryParams.order || '-created_at',
      filter: queryParams.filter,
    }),
    [
      baiPaginationOption.offset,
      baiPaginationOption.first,
      currentProject?.id,
      queryParams.filter,
      queryParams.order,
    ], // eslint-disable-line react-hooks/exhaustive-deps,
  );
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(environmentFetchKey);

  const { image_nodes } = useLazyLoadQuery<ImageListNodeQuery>(
    graphql`
      query ImageListNodeQuery(
        $scope_id: ScopeField!
        $offset: Int
        $first: Int
        $order: String
        $filter: String
      ) {
        image_nodes(
          scope_id: $scope_id
          offset: $offset
          first: $first
          order: $order
          filter: $filter
        ) {
          count
          edges {
            node {
              id
              row_id
              name @deprecatedSince(version: "24.12.0")
              tag
              registry
              architecture
              digest
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
              ...ImageNodeSimpleTagFragment
            }
          }
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchPolicy:
        environmentFetchKey === 'initial-fetch'
          ? 'store-and-network'
          : 'network-only',
      fetchKey: environmentFetchKey,
    },
  );

  const columns: TableColumnsType<ImageNode> = filterEmptyItem([
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
      width: token.screenXS,
    },
    {
      title: t('environment.Registry'),
      dataIndex: 'registry',
      key: 'registry',
      sorter: (a, b) => localeCompare(a?.registry, b?.registry),
      render: (text) => <Typography.Text>{text}</Typography.Text>,
    },
    {
      title: t('environment.Architecture'),
      dataIndex: 'architecture',
      key: 'architecture',
      sorter: (a, b) => localeCompare(a?.architecture, b?.architecture),
      render: (text) => <Typography.Text>{text}</Typography.Text>,
    },
    {
      title: t('environment.Namespace'),
      key: 'namespace',
      dataIndex: 'namespace',
      render: (text) => <Typography.Text>{text}</Typography.Text>,
    },
    {
      title: t('environment.Tags'),
      key: 'tags',
      render: (text, row) => {
        return <ImageNodeSimpleTag imageFrgmt={row} copyable={false} />;
      },
    },
    // !supportExtendedImageInfo && {
    //   title: t('environment.Namespace'),
    //   key: 'name',
    //   dataIndex: 'name',
    //   render: (text) => (
    //     <TextHighlighter keyword={imageSearch}>{text}</TextHighlighter>
    //   ),
    // },
    // !supportExtendedImageInfo && {
    //   title: t('environment.Base'),
    //   key: 'baseimage',
    //   dataIndex: 'baseimage',
    //   render: (text, row) => (
    //     <TextHighlighter keyword={imageSearch}>
    //       {tagAlias(getBaseImage(getImageFullName(row) || ''))}
    //     </TextHighlighter>
    //   ),
    // },
    // !supportExtendedImageInfo && {
    //   title: t('environment.Version'),
    //   key: 'baseversion',
    //   dataIndex: 'baseversion',
    //   render: (text, row) => (
    //     <TextHighlighter keyword={imageSearch}>
    //       {getBaseVersion(getImageFullName(row) || '')}
    //     </TextHighlighter>
    //   ),
    // },
    // !supportExtendedImageInfo && {
    //   title: t('environment.Tags'),
    //   key: 'tag',
    //   dataIndex: 'tag',
    //   render: (text, row) => (
    //     <ImageTags
    //       tag={text}
    //       labels={row.labels as Array<{ key: string; value: string }>}
    //       highlightKeyword={imageSearch}
    //     />
    //   ),
    // },
    {
      title: t('environment.Digest'),
      dataIndex: 'digest',
      key: 'digest',
      render: (text, row) => (
        <Typography.Text ellipsis={{ tooltip: true }} style={{ maxWidth: 200 }}>
          {row.digest}
        </Typography.Text>
      ),
    },
    {
      title: t('environment.ResourceLimit'),
      dataIndex: 'resource_limits',
      key: 'resource_limits',
      render: (text, row) => (
        <Flex direction="row" gap="xxs">
          {row?.resource_limits?.map((resource_limit) => (
            <ResourceNumber
              key={resource_limit?.key}
              type={resource_limit?.key || ''}
              value={resource_limit?.min || '0'}
              max={resource_limit?.max || 'Infinity'}
            />
          ))}
        </Flex>
      ),
    },
    {
      title: t('general.Control'),
      key: 'control',
      dataIndex: 'control',
      fixed: 'right',
      render: (text, row) => (
        <Flex
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
        </Flex>
      ),
    },
  ]);

  return (
    <>
      <Flex
        direction="column"
        align="stretch"
        style={{
          flex: 1,
          ...style,
        }}
      >
        <Flex justify="between" style={{ padding: token.paddingSM }}>
          <BAIPropertyFilter
            filterProperties={[
              {
                key: 'registry',
                propertyLabel: t('environment.Registry'),
                type: 'string',
              },
              {
                key: 'architecture',
                propertyLabel: t('environment.Architecture'),
                type: 'string',
              },
            ]}
            value={queryParams.filter}
            onChange={(value) => {
              setQuery({ filter: value }, 'replaceIn');
              setTablePaginationOption({ current: 1 });
              setSelectedRows([]);
            }}
          />
          <Flex gap={'xs'} align="center">
            {selectedRows.length > 0 ? (
              <Typography.Text>
                {t('general.NSelected', {
                  count: selectedRows.length,
                })}
              </Typography.Text>
            ) : null}
            <Button
              icon={<ReloadOutlined />}
              loading={isPendingRefreshTransition}
              onClick={() => {
                setSelectedRows([]);
                startRefreshTransition(() => updateEnvironmentFetchKey());
              }}
            />
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
          </Flex>
        </Flex>
        <BAITable
          resizable
          neoStyle
          size="small"
          rowKey="id"
          scroll={{ x: 'max-content' }}
          dataSource={filterNonNullItems(
            filterEmptyItem(image_nodes?.edges.map((edge) => edge?.node) || []),
          )}
          loading={
            deferredQueryVariables !== queryVariables ||
            deferredFetchKey !== environmentFetchKey ||
            isPendingRefreshTransition
          }
          columns={columns}
          pagination={{
            pageSize: tablePaginationOption.pageSize,
            current: tablePaginationOption.current,
            total: image_nodes?.count || 0,
            showTotal: (total) => (
              <Typography.Text type="secondary">
                {t('general.TotalItems', { total: total })}
              </Typography.Text>
            ),
            onChange(current, pageSize) {
              if (_.isNumber(current) && _.isNumber(pageSize)) {
                setTablePaginationOption({
                  pageSize,
                  current,
                });
              }
            },
          }}
          rowSelection={{
            type: 'checkbox',
            onChange: (_, selectedRows) => {
              setSelectedRows(selectedRows);
            },
            selectedRowKeys: selectedRows.map((row) => row.id) as Key[],
          }}
          onRow={(record) => ({
            onClick: (e) => {
              if (selectedRows.find((row) => row.id === record.id)) {
                setSelectedRows((rows) =>
                  rows.filter((row) => row.id !== record.id),
                );
              } else {
                setSelectedRows((rows) => [...rows, record]);
              }
            },
          })}
          order={queryParams.order}
          onChangeOrder={(newOrder) => {
            setQuery({ order: newOrder }, 'replaceIn');
          }}
        />
        <Flex
          justify="end"
          style={{
            padding: token.paddingXXS,
          }}
        >
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() => {
              toggleColumnSettingModal();
            }}
          />
        </Flex>
      </Flex>
      {/* <ManageImageResourceLimitModal
        open={!!managingResourceLimit}
        onRequestClose={(success) => {
          setManagingResourceLimit(null);
          if (success)
            startTransition(() => {
              updateEnvironmentFetchKey();
            });
        }}
        imageFrgmt={managingResourceLimit}
      /> */}
      {/* <ManageAppsModal
        open={!!managingApp}
        onRequestClose={(success) => {
          setManagingApp(null);
          if (success)
            startTransition(() => {
              updateEnvironmentFetchKey();
            });
        }}
        imageFrgmt={managingApp}
      /> */}
      {/* <ImageInstallModal
        open={isOpenInstallModal}
        onRequestClose={() => {
          setIsOpenInstallModal(false);
        }}
        setInstallingImages={setInstallingImages}
        selectedRows={selectedRows}
      /> */}
      {/* <TableColumnsSettingModal
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
      /> */}
    </>
  );
};

export default ImageList;
