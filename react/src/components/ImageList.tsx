import {
  ImageListQuery,
  ImageListQuery$data,
  ImageListQuery$variables,
} from '../__generated__/ImageListQuery.graphql';
import { getImageFullName, localeCompare } from '../helper';
import {
  useBackendAIImageMetaData,
  useSuspendedBackendaiClient,
} from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import AliasedImageDoubleTags from './AliasedImageDoubleTags';
import ImageInstallModal from './ImageInstallModal';
import ManageAppsModal from './ManageAppsModal';
import ManageImageResourceLimitModal from './ManageImageResourceLimitModal';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import TextHighlighter from './TextHighlighter';
import {
  AppstoreOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { App, Button, Input, Tag, theme, Tooltip, Typography } from 'antd';
import type { ColumnType } from 'antd/es/table';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAIFlex,
  BAITable,
  BAIResourceNumberWithIcon,
  useUpdatableState,
} from 'backend.ai-ui';
import _ from 'lodash';
import { Key, useDeferredValue, useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useBAIPaginationOptionStateOnSearchParamLegacy } from 'src/hooks/reactPaginationQueryOptions';

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
  const [environmentFetchKey, updateEnvironmentFetchKey] =
    useUpdatableState('initial-fetch');
  const [, startTransition] = useTransition();
  const [installingImages, setInstallingImages] = useState<string[]>([]);
  const { message } = App.useApp();
  const [imageSearch, setImageSearch] = useState('');
  const [visibleColumnSettingModal, { toggle: toggleColumnSettingModal }] =
    useToggle();
  const [isPendingRefreshTransition, startRefreshTransition] = useTransition();
  const [isPendingSearchTransition, startSearchTransition] = useTransition();
  const baiClient = useSuspendedBackendaiClient();
  const supportExtendedImageInfo = baiClient?.supports('extended-image-info');
  const currentProject = useCurrentProjectValue();

  const { debouncedSetImageSearch } = useMemo(
    () => ({
      debouncedSetImageSearch: _.debounce((value: string) => {
        startSearchTransition(() => setImageSearch(value));
      }, 500),
    }),
    [],
  );

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParamLegacy({
    current: 1,
    pageSize: 20,
  });

  const queryVariables: ImageListQuery$variables = useMemo(
    () => ({
      scopeId: `project:${currentProject.id}`,
      offset: baiPaginationOption.offset,
      first: baiPaginationOption.first,
      filter: imageSearch ? `name ilike "%${imageSearch}%"` : undefined,
      order: undefined,
    }),
    [
      currentProject.id,
      baiPaginationOption.offset,
      baiPaginationOption.first,
      imageSearch,
    ],
  );
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(environmentFetchKey);

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
        deferredFetchKey === 'initial-fetch'
          ? 'store-and-network'
          : 'network-only',
      fetchKey:
        deferredFetchKey === 'initial-fetch' ? undefined : deferredFetchKey,
    },
  );

  const imageData = useMemo(
    () =>
      filterOutNullAndUndefined(
        image_nodes?.edges?.map((edge) => edge?.node) ?? [],
      ),
    [image_nodes],
  );

  const columns: Array<ColumnType<EnvironmentImage>> = useMemo(
    () =>
      filterOutEmpty([
        {
          title: t('environment.Status'),
          dataIndex: 'installed',
          key: 'installed',
          defaultSortOrder: 'descend',
          sorter: (a, b) => {
            return (
              _.toNumber(a?.installed || 0) - _.toNumber(b?.installed || 0)
            );
          },
          render: (_text, row) =>
            row?.id && installingImages.includes(row.id) ? (
              <Tag color="gold">
                <TextHighlighter keyword={imageSearch}>
                  {t('environment.Installing')}
                </TextHighlighter>
              </Tag>
            ) : row?.installed ? (
              <Tag color="gold">
                <TextHighlighter keyword={imageSearch}>
                  {t('environment.Installed')}
                </TextHighlighter>
              </Tag>
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
              <TextHighlighter keyword={imageSearch}>
                {getImageFullName(row) || ''}
              </TextHighlighter>
            </Typography.Text>
          ),
          sorter: (a, b) =>
            localeCompare(getImageFullName(a), getImageFullName(b)),
          width: token.screenXS,
        },
        {
          title: t('environment.Registry'),
          dataIndex: 'registry',
          key: 'registry',
          sorter: (a, b) => localeCompare(a?.registry, b?.registry),
          render: (text) => (
            <TextHighlighter keyword={imageSearch}>{text}</TextHighlighter>
          ),
        },
        {
          title: t('environment.Architecture'),
          dataIndex: 'architecture',
          key: 'architecture',
          sorter: (a, b) => localeCompare(a?.architecture, b?.architecture),
          render: (text) => (
            <TextHighlighter keyword={imageSearch}>{text}</TextHighlighter>
          ),
        },
        supportExtendedImageInfo && {
          title: t('environment.Namespace'),
          key: 'namespace',
          dataIndex: 'namespace',
          sorter: (a, b) => localeCompare(a?.namespace, b?.namespace),
          render: (text) => (
            <TextHighlighter keyword={imageSearch}>{text}</TextHighlighter>
          ),
        },
        supportExtendedImageInfo && {
          title: t('environment.BaseImageName'),
          key: 'base_image_name',
          dataIndex: 'base_image_name',
          sorter: (a, b) =>
            localeCompare(a?.base_image_name, b?.base_image_name),
          render: (text) => (
            <TextHighlighter keyword={imageSearch}>
              {tagAlias(text)}
            </TextHighlighter>
          ),
        },
        supportExtendedImageInfo && {
          title: t('environment.Version'),
          key: 'version',
          dataIndex: 'version',
          sorter: (a, b) => localeCompare(a?.version, b?.version),
          render: (text) => (
            <TextHighlighter keyword={imageSearch}>{text}</TextHighlighter>
          ),
        },
        supportExtendedImageInfo && {
          title: t('environment.Tags'),
          key: 'tags',
          dataIndex: 'tags',
          render: (_text, row) => {
            return (
              <AliasedImageDoubleTags
                label=""
                color="blue"
                imageFrgmt={row}
                highlightKeyword={imageSearch}
              />
            );
          },
        },
        {
          title: t('environment.Digest'),
          dataIndex: 'digest',
          key: 'digest',
          sorter: (a, b) => localeCompare(a?.digest || '', b?.digest || ''),
          render: (_text, row) => (
            <Typography.Text
              ellipsis={{ tooltip: true }}
              style={{ maxWidth: 200 }}
            >
              <TextHighlighter keyword={imageSearch}>
                {row.digest}
              </TextHighlighter>
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
      ]),
    [
      t,
      imageSearch,
      installingImages,
      token,
      supportExtendedImageInfo,
      tagAlias,
    ],
  );

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
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder={t('environment.SearchImages')}
            onChange={(e) => {
              debouncedSetImageSearch(e.target.value);
            }}
            style={{
              width: 200,
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
                  startRefreshTransition(() => updateEnvironmentFetchKey());
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
          loading={isPendingSearchTransition}
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
