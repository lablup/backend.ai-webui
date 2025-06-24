import {
  ImageListQuery,
  ImageListQuery$data,
} from '../__generated__/ImageListQuery.graphql';
import Flex from '../components/Flex';
import {
  filterEmptyItem,
  filterNonNullItems,
  getImageFullName,
  localeCompare,
  preserveDotStartCase,
} from '../helper';
import {
  useBackendAIImageMetaData,
  useSuspendedBackendaiClient,
  useUpdatableState,
} from '../hooks';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import BAITable from './BAITable';
import DoubleTag from './DoubleTag';
import ImageInstallModal from './ImageInstallModal';
import { ImageTags } from './ImageTags';
import ManageAppsModal from './ManageAppsModal';
import ManageImageResourceLimitModal from './ManageImageResourceLimitModal';
import ResourceNumber from './ResourceNumber';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import TextHighlighter from './TextHighlighter';
import {
  AppstoreOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import { useToggle, useDebounceFn } from 'ahooks';
import { App, Button, Input, Tag, theme, Typography } from 'antd';
import { ColumnType } from 'antd/es/table';
import _ from 'lodash';
import { Key, useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type EnvironmentImage = NonNullable<
  NonNullable<ImageListQuery$data['images']>[number]
>;

const ImageList: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const { t } = useTranslation();
  const [selectedRows, setSelectedRows] = useState<EnvironmentImage[]>([]);
  const [, { getBaseVersion, getBaseImages, getBaseImage, tagAlias, getTags }] =
    useBackendAIImageMetaData();
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

  const { run: debouncedSetImageSearch } = useDebounceFn(
    (value: string) => {
      startSearchTransition(() => setImageSearch(value));
    },
    { wait: 500 },
  );

  const { images } = useLazyLoadQuery<ImageListQuery>(
    graphql`
      query ImageListQuery {
        images {
          id
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
          ...ManageImageResourceLimitModal_image
          ...ManageAppsModal_image
        }
      }
    `,
    {},
    {
      fetchPolicy:
        environmentFetchKey === 'initial-fetch'
          ? 'store-and-network'
          : 'network-only',
      fetchKey: environmentFetchKey,
    },
  );

  // Sort images by humanized_name to prevent the image list from jumping around when the images are updated
  // TODO: after `images` query  supports sort order, we should remove this line
  const defaultSortedImages = useMemo(
    () => _.sortBy(images, (image) => image?.humanized_name),
    [images],
  );

  const columns: Array<ColumnType<EnvironmentImage>> = useMemo(
    () =>
      filterEmptyItem([
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
          render: (text, row) =>
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
        !supportExtendedImageInfo && {
          title: t('environment.Namespace'),
          key: 'namespace',
          dataIndex: 'namespace',
          sorter: (a, b) => localeCompare(a?.namespace, b?.namespace),
          render: (text) => (
            <TextHighlighter keyword={imageSearch}>{text}</TextHighlighter>
          ),
        },
        !supportExtendedImageInfo && {
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
        !supportExtendedImageInfo && {
          title: t('environment.Version'),
          key: 'version',
          dataIndex: 'version',
          sorter: (a, b) => localeCompare(a?.version, b?.version),
          render: (text) => (
            <TextHighlighter keyword={imageSearch}>{text}</TextHighlighter>
          ),
        },
        !supportExtendedImageInfo && {
          title: t('environment.Tags'),
          key: 'tags',
          dataIndex: 'tags',
          render: (text, row) => {
            return (
              <Flex direction="row" align="start">
                {/* TODO: replace this with AliasedImageDoubleTags after image list query with ImageNode is implemented. */}
                {_.map(text, (tag: { key: string; value: string }) => {
                  const isCustomized = _.includes(tag.key, 'customized_');
                  const tagValue = isCustomized
                    ? _.find(row?.labels, {
                        key: 'ai.backend.customized-image.name',
                      })?.value
                    : tag.value;
                  const aliasedTag = tagAlias(tag.key + tagValue);
                  return _.isEqual(
                    aliasedTag,
                    preserveDotStartCase(tag.key + tagValue),
                  ) || isCustomized ? (
                    <DoubleTag
                      key={tag.key}
                      highlightKeyword={imageSearch}
                      values={[
                        {
                          label: tagAlias(tag.key),
                          color: isCustomized ? 'cyan' : 'blue',
                        },
                        {
                          label: tagValue ?? '',
                          color: isCustomized ? 'cyan' : 'blue',
                        },
                      ]}
                    />
                  ) : (
                    <Tag key={tag.key} color={isCustomized ? 'cyan' : 'blue'}>
                      <TextHighlighter keyword={imageSearch}>
                        {aliasedTag}
                      </TextHighlighter>
                    </Tag>
                  );
                })}
              </Flex>
            );
          },
        },
        !supportExtendedImageInfo && {
          title: t('environment.Namespace'),
          key: 'name',
          dataIndex: 'name',
          sorter: (a, b) =>
            localeCompare(getImageFullName(a), getImageFullName(b)),
          render: (text) => (
            <TextHighlighter keyword={imageSearch}>{text}</TextHighlighter>
          ),
        },
        !supportExtendedImageInfo && {
          title: t('environment.Base'),
          key: 'baseimage',
          dataIndex: 'baseimage',
          sorter: (a, b) =>
            localeCompare(
              getBaseImage(getImageFullName(a) || ''),
              getBaseImage(getImageFullName(b) || ''),
            ),
          render: (text, row) => (
            <TextHighlighter keyword={imageSearch}>
              {tagAlias(getBaseImage(getImageFullName(row) || ''))}
            </TextHighlighter>
          ),
        },
        !supportExtendedImageInfo && {
          title: t('environment.Version'),
          key: 'baseversion',
          dataIndex: 'baseversion',
          sorter: (a, b) =>
            localeCompare(
              getBaseVersion(getImageFullName(a) || ''),
              getBaseVersion(getImageFullName(b) || ''),
            ),
          render: (text, row) => (
            <TextHighlighter keyword={imageSearch}>
              {getBaseVersion(getImageFullName(row) || '')}
            </TextHighlighter>
          ),
        },
        !supportExtendedImageInfo && {
          title: t('environment.Tags'),
          key: 'tag',
          dataIndex: 'tag',
          sorter: (a, b) => localeCompare(a?.tag, b?.tag),
          render: (text, row) => (
            <ImageTags
              tag={text}
              labels={row.labels as Array<{ key: string; value: string }>}
              highlightKeyword={imageSearch}
            />
          ),
        },
        {
          title: t('environment.Digest'),
          dataIndex: 'digest',
          key: 'digest',
          sorter: (a, b) => localeCompare(a?.digest || '', b?.digest || ''),
          render: (text, row) => (
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
      ]),
    [
      t,
      imageSearch,
      installingImages,
      token,
      supportExtendedImageInfo,
      getBaseImage,
      getBaseVersion,
      tagAlias,
    ],
  );

  const [hiddenColumnKeys, setHiddenColumnKeys] =
    useHiddenColumnKeysSetting('ImageList');

  const imageFilterValues = useMemo(() => {
    return defaultSortedImages?.map((image) => {
      return {
        namespace: supportExtendedImageInfo ? image?.namespace : image?.name,
        fullName: getImageFullName(image) || '',
        digest: image?.digest || '',
        // ------------ need only before 24.12.0 ------------
        baseversion: getBaseVersion(getImageFullName(image) || ''),
        baseimage:
          image?.tag && image?.name ? getBaseImages(image.tag, image.name) : [],
        tag:
          getTags(
            image?.tag || '',
            image?.labels as Array<{ key: string; value: string }>,
          ) || [],
        isCustomized: image?.tag
          ? image.tag.indexOf('customized') !== -1
          : false,
        // -------------------------------------------------
        // ------------ need only after 24.12.0 ------------
        baseImageName: supportExtendedImageInfo ? image?.base_image_name : '',
        tags: supportExtendedImageInfo ? image?.tags : [],
        version: supportExtendedImageInfo ? image?.version : '',
        // -------------------------------------------------
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSortedImages]);

  const filteredImageData = useMemo(() => {
    if (_.isEmpty(imageSearch)) return defaultSortedImages;
    const regExp = new RegExp(`${_.escapeRegExp(imageSearch)}`, 'i');
    return _.filter(defaultSortedImages, (image, idx) => {
      return _.some(image, (value, key) => {
        if (key === 'id') return false;
        if (['digest', 'architecture', 'registry'].includes(key))
          return regExp.test(_.toString(value));
        const curFilterValues = imageFilterValues[idx] || {};
        const baseVersionMatch = regExp.test(curFilterValues.baseversion);
        const baseImagesMatch = _.some(curFilterValues.baseimage, (value) =>
          regExp.test(value),
        );
        const tagMatch = _.some(
          curFilterValues.tag,
          (tag) => regExp.test(tag.key) || regExp.test(tag.value),
        );
        const customizedMatch = curFilterValues.isCustomized
          ? regExp.test('customized')
          : false;
        const namespaceMatch = regExp.test(curFilterValues.namespace || '');
        const fullNameMatch = regExp.test(curFilterValues.fullName);
        const tagsMatch = _.some(
          curFilterValues.tags,
          (tag: { key: string; value: string }) =>
            regExp.test(tag.key) || regExp.test(tag.value),
        );
        const versionMatch = regExp.test(curFilterValues.version || '');
        const digestMatch = regExp.test(curFilterValues.digest);
        return (
          baseVersionMatch ||
          baseImagesMatch ||
          tagMatch ||
          namespaceMatch ||
          customizedMatch ||
          fullNameMatch ||
          tagsMatch ||
          versionMatch ||
          digestMatch
        );
      });
    });
  }, [imageSearch, imageFilterValues, defaultSortedImages]);

  return (
    <>
      <Flex
        direction="column"
        align="stretch"
        style={{
          flex: 1,
          paddingBottom: token.paddingSM,
          ...style,
        }}
      >
        <Flex justify="end" style={{ padding: token.paddingSM }} gap={'xs'}>
          {selectedRows.length > 0 ? (
            <Typography.Text>
              {t('general.NSelected', {
                count: selectedRows.length,
              })}
            </Typography.Text>
          ) : null}
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
          <Button
            icon={<ReloadOutlined />}
            loading={isPendingRefreshTransition}
            onClick={() => {
              setSelectedRows([]);
              startRefreshTransition(() => updateEnvironmentFetchKey());
            }}
          >
            {t('button.Refresh')}
          </Button>

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
        <BAITable
          resizable
          rowKey="id"
          scroll={{ x: 'max-content' }}
          pagination={{
            showTotal(total, range) {
              return `${range[0]}-${range[1]} of ${total} items`;
            },
            pageSizeOptions: ['10', '20', '50'],
            extraContent: (
              <Button
                type="text"
                style={{
                  marginRight: token.marginXS,
                }}
                icon={<SettingOutlined />}
                onClick={() => {
                  toggleColumnSettingModal();
                }}
              />
            ),
          }}
          dataSource={filterNonNullItems(filteredImageData)}
          columns={_.filter(
            columns,
            (column) => !_.includes(hiddenColumnKeys, _.toString(column?.key)),
          )}
          loading={isPendingSearchTransition}
          rowSelection={{
            type: 'checkbox',
            // hideSelectAll: true,
            // columnWidth: 48,
            onChange: (_, selectedRows) => {
              setSelectedRows(selectedRows);
            },
            selectedRowKeys: selectedRows.map((row) => row.id) as Key[],
          }}
          onRow={(record) => ({
            onClick: (e) => {
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
        {/* <Flex
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
        </Flex> */}
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
