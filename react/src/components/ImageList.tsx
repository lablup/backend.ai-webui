import {
  ImageListNodeQuery,
  ImageListNodeQuery$data,
  ImageListNodeQuery$variables,
} from '../__generated__/ImageListNodeQuery.graphql';
import Flex from '../components/Flex';
import {
  filterEmptyItem,
  filterNonNullItems,
  getImageFullName,
} from '../helper';
import { useCurrentDomainValue, useUpdatableState } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useDeferredQueryParams } from '../hooks/useDeferredQueryParams';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import BAIPropertyFilter from './BAIPropertyFilter';
import BAITable from './BAITable';
import ImageInstallModal from './ImageInstallModal';
import ImageNodeSimpleTag from './ImageNodeSimpleTag';
import ManageAppsModal from './ManageAppsModal';
import ManageImageResourceLimitModal from './ManageImageResourceLimitModal';
import ResourceNumber from './ResourceNumber';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import {
  AppstoreOutlined,
  ReloadOutlined,
  SettingOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  App,
  Button,
  TableColumnsType,
  Tag,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import _ from 'lodash';
import { useDeferredValue, useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery, graphql } from 'react-relay';
import { StringParam, withDefault } from 'use-query-params';

export type ImageNode = NonNullable<
  NonNullable<
    NonNullable<ImageListNodeQuery$data['image_nodes']>['edges'][number]
  >['node']
>;

const ImageList: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const { t } = useTranslation();
  const [selectedRows, setSelectedRows] = useState<Map<string, ImageNode>>(
    new Map(),
  );
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
  const [hiddenColumnKeys, setHiddenColumnKeys] =
    useHiddenColumnKeysSetting('ImageList');
  const [isPendingRefreshTransition, startRefreshTransition] = useTransition();
  const [isPendingPageChange, startPageChangeTransition] = useTransition();
  const currentDomain = useCurrentDomainValue();

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
      scope_id: currentDomain ? `domain:${currentDomain}` : '',
      offset: baiPaginationOption.offset,
      first: baiPaginationOption.first,
      order: queryParams.order || '-created_at',
      filter: queryParams.filter,
    }),
    [
      baiPaginationOption.offset,
      baiPaginationOption.first,
      queryParams.filter,
      currentDomain,
      queryParams.order,
    ],
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
              installed
              ...ImageNodeSimpleTagFragment
              ...ManageAppsModal_image
              ...ManageImageResourceLimitModal_image
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
    },
  );

  const columns: TableColumnsType<ImageNode> = filterEmptyItem([
    {
      title: t('environment.Status'),
      dataIndex: 'installed',
      key: 'installed',
      render: (text, row) => {
        if (
          !row?.id ||
          (!row?.installed && !installingImages.includes(row.id))
        ) {
          return null;
        }

        return (
          <Tag color="gold">
            {row?.installed
              ? t('environment.Installed')
              : t('environment.Installing')}
          </Tag>
        );
      },
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
      width: token.screenXS,
    },
    {
      title: t('environment.Registry'),
      dataIndex: 'registry',
      key: 'registry',
      sorter: true,
    },
    {
      title: t('environment.Architecture'),
      dataIndex: 'architecture',
      key: 'architecture',
      sorter: true,
    },
    {
      title: t('environment.Namespace'),
      key: 'namespace',
      dataIndex: 'namespace',
      width: 150,
    },
    {
      title: t('environment.Tags'),
      key: 'tags',
      width: 450,
      render: (text, row) => {
        return (
          <Flex
            wrap="wrap"
            style={{
              rowGap: token.marginXXS,
            }}
          >
            <ImageNodeSimpleTag imageFrgmt={row} copyable={false} />
          </Flex>
        );
      },
    },
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
          <Tooltip title={t('button.Edit')}>
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
          </Tooltip>
          <Tooltip title={t('environment.ManageApps')}>
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
          </Tooltip>
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
        gap="sm"
      >
        <Flex justify="between" align="start">
          {/* // TODO: implement project_id filter when backend supports it */}
          {/* <Form.Item
              label={t('environment.Project')}
              style={{ marginBottom: 0 }}
            >
              <ProjectSelect
                domain={currentDomain}
                value={queryParams.project}
                onChange={(project) => {
                  setQuery({ project }, 'replaceIn');
                  setTablePaginationOption({ current: 1 });
                  setSelectedRows([]);
                }}
                extraOptions={[
                  {
                    label: t('environment.All'),
                    value: currentDomain,
                  },
                ]}
              />
            </Form.Item> */}
          <BAIPropertyFilter
            filterProperties={[
              {
                key: 'name',
                propertyLabel: t('environment.Name'),
                type: 'string',
              },
              {
                key: 'id',
                propertyLabel: t('environment.ID'),
                type: 'string',
              },
              {
                key: 'project',
                propertyLabel: t('environment.Project'),
                type: 'string',
              },
              {
                key: 'image',
                propertyLabel: t('environment.Image'),
                type: 'string',
              },
              {
                key: 'registry',
                propertyLabel: t('environment.Registry'),
                type: 'string',
              },
              {
                key: 'registry_id',
                propertyLabel: t('environment.RegistryID'),
                type: 'string',
              },
              {
                key: 'is_local',
                propertyLabel: t('environment.IsLocal'),
                type: 'boolean',
              },
              {
                key: 'type',
                propertyLabel: t('environment.Type'),
                type: 'enum',
                options: [
                  {
                    label: 'compute',
                    value: 'compute',
                  },
                  {
                    label: 'system',
                    value: 'system',
                  },
                  {
                    label: 'service',
                    value: 'service',
                  },
                ],
              },
              {
                key: 'accelerators',
                propertyLabel: t('environment.Accelerators'),
                type: 'string',
              },
              {
                key: 'architecture',
                propertyLabel: t('environment.Architecture'),
                type: 'string',
              },
              {
                key: 'tag',
                propertyLabel: t('environment.Tag'),
                type: 'string',
              },
              {
                key: 'status',
                propertyLabel: t('environment.Status'),
                type: 'enum',
                options: [
                  {
                    label: 'ALIVE',
                    value: 'ALIVE',
                  },
                  {
                    label: 'DELETED',
                    value: 'DELETED',
                  },
                ],
              },
            ]}
            value={queryParams.filter}
            onChange={(value) => {
              setQuery({ filter: value }, 'replaceIn');
              setTablePaginationOption({ current: 1 });
              setSelectedRows(new Map());
            }}
          />
          <Flex gap={'xs'} align="center">
            {selectedRows.size > 0 ? (
              <Typography.Text>
                {t('general.NSelected', {
                  count: selectedRows.size,
                })}
              </Typography.Text>
            ) : null}
            <Tooltip title={t('button.Refresh')}>
              <Button
                icon={<ReloadOutlined />}
                loading={isPendingRefreshTransition}
                onClick={() => {
                  startRefreshTransition(() => updateEnvironmentFetchKey());
                }}
              />
            </Tooltip>
            <Button
              icon={<VerticalAlignBottomOutlined />}
              type="primary"
              onClick={() => {
                if (selectedRows.size === 0) {
                  message.error(t('environment.NoImagesAreSelected'));
                  return;
                }
                if (selectedRows.values().some((image) => !image.installed)) {
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
          neoStyle
          size="small"
          resizable
          rowKey="id"
          scroll={{ x: 'max-content' }}
          showSorterTooltip={false}
          dataSource={filterNonNullItems(
            filterEmptyItem(image_nodes?.edges.map((edge) => edge?.node) || []),
          )}
          loading={
            deferredQueryVariables !== queryVariables ||
            deferredFetchKey !== environmentFetchKey ||
            isPendingRefreshTransition ||
            isPendingPageChange
          }
          columns={_.filter(
            columns,
            (column) => !_.includes(hiddenColumnKeys, _.toString(column.key)),
          )}
          pagination={{
            pageSize: tablePaginationOption.pageSize,
            current: tablePaginationOption.current,
            total: image_nodes?.count || 0,
            extraContent: (
              <Button
                type="text"
                icon={<SettingOutlined />}
                onClick={() => {
                  toggleColumnSettingModal();
                }}
              />
            ),
            onChange(current, pageSize) {
              startPageChangeTransition(() => {
                if (_.isNumber(current) && _.isNumber(pageSize)) {
                  setTablePaginationOption({
                    pageSize,
                    current,
                  });
                }
              });
            },
          }}
          rowSelection={{
            type: 'checkbox',
            onChange: (selectedKeys, selectedData) => {
              setSelectedRows((prev) => {
                const newMap = new Map<string, ImageNode>(prev);
                const selectedSet = new Set<string>(selectedKeys as string[]);
                const items = new Set<string>(
                  filterEmptyItem(
                    image_nodes?.edges.map((edge) => edge?.node?.id) || [],
                  ),
                );
                // add selected rows to the map
                selectedData.forEach((row) => newMap.set(row.id, row));
                // remove rows that are not selected based on current data source
                items
                  .difference(selectedSet)
                  .forEach((item) => newMap.delete(item));
                return newMap;
              });
            },
            selectedRowKeys: Array.from(selectedRows.keys()),
          }}
          onRow={(record) => ({
            onClick: (e) => {
              if (selectedRows.has(record.id)) {
                selectedRows.delete(record.id);
              } else {
                selectedRows.set(record.id, record);
              }
              setSelectedRows(new Map(selectedRows));
            },
          })}
          order={queryParams.order}
          onChangeOrder={(newOrder) => {
            startPageChangeTransition(() => {
              setQuery({ order: newOrder }, 'replaceIn');
            });
          }}
        />
      </Flex>
      <ManageImageResourceLimitModal
        open={!!managingResourceLimit}
        onRequestClose={(success) => {
          setManagingResourceLimit(null);
          if (success)
            startTransition(() => {
              updateEnvironmentFetchKey();
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
              updateEnvironmentFetchKey();
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
        selectedRows={Array.from(selectedRows.values())}
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
