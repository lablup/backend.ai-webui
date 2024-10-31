import Flex from '../components/Flex';
import { filterNonNullItems, getImageFullName, localeCompare } from '../helper';
import {
  useBackendAIImageMetaData,
  useSuspendedBackendaiClient,
  useUpdatableState,
} from '../hooks';
import DoubleTag from './DoubleTag';
import ImageInstallModal from './ImageInstallModal';
import { BaseImageTags, ConstraintTags, LangTags } from './ImageTags';
import ManageAppsModal from './ManageAppsModal';
import ManageImageResourceLimitModal from './ManageImageResourceLimitModal';
import ResourceNumber from './ResourceNumber';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import TextHighlighter from './TextHighlighter';
import {
  ImageListQuery,
  ImageListQuery$data,
} from './__generated__/ImageListQuery.graphql';
import CopyButton from './lablupTalkativotUI/CopyButton';
import {
  AppstoreOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import { useLocalStorageState } from 'ahooks';
import { App, Button, Input, Table, Tag, theme, Typography } from 'antd';
import { ColumnsType, ColumnType } from 'antd/es/table';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { Key, useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

export type EnvironmentImage = NonNullable<
  NonNullable<ImageListQuery$data['images']>[number]
>;

const ImageList: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const { t } = useTranslation();
  const [selectedRows, setSelectedRows] = useState<EnvironmentImage[]>([]);
  const [
    ,
    {
      getNamespace,
      getBaseVersion,
      getLang,
      getBaseImages,
      getConstraints,
      getBaseImage,
      tagAlias,
    },
  ] = useBackendAIImageMetaData();
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
  const [isOpenColumnsSetting, setIsOpenColumnsSetting] = useState(false);
  const [isPendingRefreshTransition, startRefreshTransition] = useTransition();
  const [isPendingSearchTransition, startSearchTransition] = useTransition();
  const baiClient = useSuspendedBackendaiClient();
  const supportExtendedImageInfo = baiClient?.supports('extended-image-info');

  const { images } = useLazyLoadQuery<ImageListQuery>(
    graphql`
      query ImageListQuery {
        images {
          id
          name @deprecatedSince(version: "24.09.1.")
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
          namespace @since(version: "24.09.1.")
          base_image_name @since(version: "24.09.1.")
          tags @since(version: "24.09.1.") {
            key
            value
          }
          version @since(version: "24.09.1.")
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

  const columns: ColumnsType<EnvironmentImage> = [
    {
      title: t('environment.Status'),
      dataIndex: 'installed',
      key: 'installed',
      defaultSortOrder: 'descend',
      sorter: (a: EnvironmentImage, b: EnvironmentImage) => {
        return _.toNumber(a?.installed || 0) - _.toNumber(b?.installed || 0);
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
        <Flex gap={'xxs'}>
          <TextHighlighter keyword={imageSearch}>
            {getImageFullName(row) || ''}
          </TextHighlighter>
          <CopyButton
            type="text"
            style={{ color: token.colorPrimary }}
            copyable={{
              text: getImageFullName(row) || '',
            }}
          />
        </Flex>
      ),
      sorter: (a, b) => localeCompare(getImageFullName(a), getImageFullName(b)),
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
    ...(supportExtendedImageInfo
      ? [
          {
            title: t('environment.Namespace'),
            key: 'namespace',
            dataIndex: 'namespace',
            sorter: (a: EnvironmentImage, b: EnvironmentImage) =>
              localeCompare(a?.namespace, b?.namespace),
            render: (text: string) => (
              <TextHighlighter keyword={imageSearch}>{text}</TextHighlighter>
            ),
          },
          {
            title: t('environment.BaseImageName'),
            key: 'base_image_name',
            dataIndex: 'base_image_name',
            sorter: (a: EnvironmentImage, b: EnvironmentImage) =>
              localeCompare(a?.base_image_name, b?.base_image_name),
            render: (text: string, row: EnvironmentImage) => (
              <TextHighlighter keyword={imageSearch}>
                {tagAlias(text)}
              </TextHighlighter>
            ),
          },
          {
            title: t('environment.Version'),
            key: 'version',
            dataIndex: 'version',
            sorter: (a: EnvironmentImage, b: EnvironmentImage) =>
              localeCompare(a?.version, b?.version),
            render: (text: string) => (
              <TextHighlighter keyword={imageSearch}>{text}</TextHighlighter>
            ),
          },
          {
            title: t('environment.Tags'),
            key: 'tags',
            dataIndex: 'tags',
            render: (
              text: Array<{ key: string; value: string }>,
              row: EnvironmentImage,
            ) => {
              return (
                // <AliasedImageDoubleTags
                //   imageFrgmt={row}
                //   label={undefined}
                //   highlightKeyword={imageSearch}
                // />
                <Flex direction="row" align="start">
                  {_.map(text, (tag: { key: string; value: string }) => {
                    const isCustomized = _.includes(tag.key, 'customized_');
                    const tagValue = isCustomized
                      ? _.find(row?.labels, {
                          key: 'ai.backend.customized-image.name',
                        })?.value
                      : tag.value;
                    return (
                      <DoubleTag
                        key={tag.key}
                        values={[
                          {
                            label: (
                              <TextHighlighter
                                keyword={imageSearch}
                                key={tag.key}
                              >
                                {tagAlias(tag.key)}
                              </TextHighlighter>
                            ),
                            color: isCustomized ? 'cyan' : 'blue',
                          },
                          {
                            label: (
                              <TextHighlighter
                                keyword={imageSearch}
                                key={tagValue}
                              >
                                {tagValue}
                              </TextHighlighter>
                            ),
                            color: isCustomized ? 'cyan' : 'blue',
                          },
                        ]}
                      />
                    );
                  })}
                </Flex>
              );
            },
          },
        ]
      : [
          {
            title: t('environment.Namespace'),
            key: 'name',
            dataIndex: 'name',
            sorter: (a: EnvironmentImage, b: EnvironmentImage) =>
              localeCompare(getImageFullName(a), getImageFullName(b)),
            render: (text: string, row: EnvironmentImage) => (
              <TextHighlighter keyword={imageSearch}>
                {getNamespace(getImageFullName(row) || '')}
              </TextHighlighter>
            ),
          },
          {
            title: t('environment.Language'),
            key: 'lang',
            dataIndex: 'lang',
            sorter: (a: EnvironmentImage, b: EnvironmentImage) =>
              localeCompare(getLang(a.name ?? ''), getLang(b.name ?? '')),
            render: (text: string, row: EnvironmentImage) => (
              <LangTags image={getImageFullName(row) || ''} color="green" />
            ),
          },
          {
            title: t('environment.Version'),
            key: 'baseversion',
            dataIndex: 'baseversion',
            sorter: (a: EnvironmentImage, b: EnvironmentImage) =>
              localeCompare(
                getBaseVersion(getImageFullName(a) || ''),
                getBaseVersion(getImageFullName(b) || ''),
              ),
            render: (text: string, row: EnvironmentImage) => (
              <TextHighlighter keyword={imageSearch}>
                {getBaseVersion(getImageFullName(row) || '')}
              </TextHighlighter>
            ),
          },
          {
            title: t('environment.Base'),
            key: 'baseimage',
            dataIndex: 'baseimage',
            sorter: (a: EnvironmentImage, b: EnvironmentImage) =>
              localeCompare(
                getBaseImage(getBaseImage(getImageFullName(a) || '')),
                getBaseImage(getBaseImage(getImageFullName(b) || '')),
              ),
            render: (text: string, row: EnvironmentImage) => (
              <BaseImageTags image={getImageFullName(row) || ''} />
            ),
          },
          {
            title: t('environment.Constraint'),
            key: 'constraint',
            dataIndex: 'constraint',
            sorter: (a: EnvironmentImage, b: EnvironmentImage) => {
              const requirementA =
                a?.tag && b?.labels
                  ? getConstraints(
                      a?.tag,
                      a?.labels as { key: string; value: string }[],
                    )[0] || ''
                  : '';
              const requirementB =
                b?.tag && b?.labels
                  ? getConstraints(
                      b?.tag,
                      b?.labels as { key: string; value: string }[],
                    )[0] || ''
                  : '';
              return localeCompare(requirementA, requirementB);
            },
            render: (text: string, row: EnvironmentImage) =>
              row?.tag ? (
                <ConstraintTags
                  tag={row.tag}
                  labels={row?.labels as { key: string; value: string }[]}
                />
              ) : null,
          },
        ]),
    {
      title: t('environment.Digest'),
      dataIndex: 'digest',
      key: 'digest',
      sorter: (a, b) =>
        a?.digest && b?.digest ? a.digest.localeCompare(b.digest) : 0,
      render: (text, row) => (
        <Typography.Text ellipsis={{ tooltip: true }} style={{ maxWidth: 200 }}>
          <TextHighlighter keyword={imageSearch}>{row.digest}</TextHighlighter>
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
  ];

  const [displayedColumnKeys, setDisplayedColumnKeys] = useLocalStorageState(
    'backendaiwebui.EnvironmentPage.displayedColumnKeys',
    {
      defaultValue: columns.map((column) => _.toString(column.key)),
    },
  );

  const imageFilterValues = useMemo(() => {
    return defaultSortedImages?.map((image) => {
      return {
        installed: image?.installed ? t('environment.Installed') : '',
        namespace: getNamespace(getImageFullName(image) || ''),
        lang: image?.name ? getLang(image.name) : '',
        baseversion: getBaseVersion(getImageFullName(image) || ''),
        baseimage:
          image?.tag && image?.name ? getBaseImages(image.tag, image.name) : [],
        constraints:
          image?.tag && image?.labels
            ? getConstraints(
                image.tag,
                image.labels as { key: string; value: string }[],
              )
            : [],
        isCustomized: image?.tag
          ? image.tag.indexOf('customized') !== -1
          : false,
        fullName: getImageFullName(image) || '',
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
        if (key === 'installed') return regExp.test(curFilterValues.installed);
        const baseVersionMatch = regExp.test(curFilterValues.baseversion);
        const baseImagesMatch = _.some(curFilterValues.baseimage, (value) =>
          regExp.test(value),
        );
        const constraintsMatch = _.some(
          curFilterValues.constraints,
          (constraint) => regExp.test(constraint),
        );
        const customizedMatch = curFilterValues.isCustomized
          ? regExp.test('customized')
          : false;
        const langMatch = regExp.test(curFilterValues.lang);
        const namespaceMatch = regExp.test(curFilterValues.namespace);
        const fullNameMatch = regExp.test(curFilterValues.fullName);
        return (
          baseVersionMatch ||
          baseImagesMatch ||
          constraintsMatch ||
          langMatch ||
          namespaceMatch ||
          customizedMatch ||
          fullNameMatch
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
              startSearchTransition(() => setImageSearch(e.target.value));
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
        <Table<EnvironmentImage>
          rowKey="id"
          scroll={{ x: 'max-content' }}
          pagination={{
            showTotal(total, range) {
              return `${range[0]}-${range[1]} of ${total} items`;
            },
            pageSizeOptions: ['10', '20', '50'],
            style: { marginRight: token.marginXS },
          }}
          dataSource={filterNonNullItems(filteredImageData)}
          columns={
            columns.filter((column) =>
              displayedColumnKeys?.includes(_.toString(column.key)),
            ) as ColumnType<EnvironmentImage>[]
          }
          loading={isPendingSearchTransition}
          rowSelection={{
            type: 'checkbox',
            // hideSelectAll: true,
            // columnWidth: 48,
            onChange: (_, selectedRows: EnvironmentImage[]) => {
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
          sortDirections={['descend', 'ascend', 'descend']}
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
              setIsOpenColumnsSetting(true);
            }}
          />
        </Flex>
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
        image={managingResourceLimit}
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
        image={managingApp}
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
        open={isOpenColumnsSetting}
        onRequestClose={(values) => {
          values?.selectedColumnKeys &&
            setDisplayedColumnKeys(values?.selectedColumnKeys);
          setIsOpenColumnsSetting(!isOpenColumnsSetting);
        }}
        columns={columns}
        displayedColumnKeys={displayedColumnKeys ? displayedColumnKeys : []}
      />
    </>
  );
};

export default ImageList;
