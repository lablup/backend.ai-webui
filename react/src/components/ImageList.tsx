import Flex from '../components/Flex';
import { filterNonNullItems, getImageFullName } from '../helper';
import { useBackendAIImageMetaData, useUpdatableState } from '../hooks';
import ImageInstallModal from './ImageInstallModal';
import { ConstraintTags } from './ImageTags';
import ManageAppsModal from './ManageAppsModal';
import ManageImageResourceLimitModal from './ManageImageResourceLimitModal';
import ResourceNumber from './ResourceNumber';
import TextHighlighter from './TextHighlighter';
import {
  ImageListQuery,
  ImageListQuery$data,
} from './__generated__/ImageListQuery.graphql';
import CopyButton from './lablupTalkativotUI/CopyButton';
import {
  AppstoreOutlined,
  CopyOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import { App, Button, Input, Table, Tag, theme, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
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
    { getNamespace, getBaseVersion, getLang, getBaseImages, getConstraints },
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
  const [isPendingRefreshTransition, startRefreshTransition] = useTransition();
  const [isPendingSearchTransition, startSearchTransition] = useTransition();

  const { images } = useLazyLoadQuery<ImageListQuery>(
    graphql`
      query ImageListQuery {
        images {
          id
          name
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
      title: t('environment.Registry'),
      dataIndex: 'registry',
      key: 'registry',
      sorter: (a, b) =>
        a?.registry && b?.registry ? a.registry.localeCompare(b.registry) : 0,
      render: (text, row) => (
        <TextHighlighter keyword={imageSearch}>{row.registry}</TextHighlighter>
      ),
    },
    {
      title: t('environment.Architecture'),
      dataIndex: 'architecture',
      key: 'architecture',
      sorter: (a, b) =>
        a?.architecture && b?.architecture
          ? a.architecture.localeCompare(b.architecture)
          : 0,
      render: (text, row) => (
        <TextHighlighter keyword={imageSearch}>
          {row.architecture}
        </TextHighlighter>
      ),
    },
    {
      title: t('environment.Namespace'),
      key: 'namespace',
      dataIndex: 'namespace',
      sorter: (a, b) => {
        const namespaceA = getNamespace(getImageFullName(a) || '');
        const namespaceB = getNamespace(getImageFullName(b) || '');
        return namespaceA && namespaceB
          ? namespaceA.localeCompare(namespaceB)
          : 0;
      },
      render: (text, row) => (
        <TextHighlighter keyword={imageSearch}>
          {getNamespace(getImageFullName(row) || '')}
        </TextHighlighter>
      ),
    },
    {
      title: t('environment.Language'),
      key: 'lang',
      dataIndex: 'lang',
      sorter: (a, b) => {
        const langA = a?.name ? getLang(a?.name) : '';
        const langB = b?.name ? getLang(b?.name) : '';
        return langA && langB ? langA.localeCompare(langB) : 0;
      },
      render: (text, row) => (
        <TextHighlighter keyword={imageSearch}>
          {row.name ? getLang(row.name) : null}
        </TextHighlighter>
      ),
    },
    {
      title: t('environment.Version'),
      key: 'baseversion',
      dataIndex: 'baseversion',
      sorter: (a, b) => {
        const baseversionA = getBaseVersion(getImageFullName(a) || '');
        const baseversionB = getBaseVersion(getImageFullName(b) || '');
        return baseversionA && baseversionB
          ? baseversionA.localeCompare(baseversionB)
          : 0;
      },
      render: (text, row) => (
        <TextHighlighter keyword={imageSearch}>
          {getBaseVersion(getImageFullName(row) || '')}
        </TextHighlighter>
      ),
    },
    {
      title: t('environment.Base'),
      key: 'baseimage',
      dataIndex: 'baseimage',
      sorter: (a, b) => {
        const baseimageA =
          !a?.tag || !a?.name ? '' : getBaseImages(a?.tag, a?.name)[0] || '';
        const baseimageB =
          !b?.tag || !b?.name ? '' : getBaseImages(b?.tag, b?.name)[0] || '';
        if (baseimageA === '' && baseimageB === '') return 0;
        if (baseimageA === '') return -1;
        if (baseimageB === '') return 1;
        return baseimageA.localeCompare(baseimageB);
      },
      render: (text, row) => (
        <Flex direction="row" align="start">
          {row?.tag && row?.name
            ? getBaseImages(row.tag, row.name).map((baseImage) => (
                <Tag color="green">
                  <TextHighlighter keyword={imageSearch}>
                    {baseImage}
                  </TextHighlighter>
                </Tag>
              ))
            : null}
        </Flex>
      ),
    },
    {
      title: t('environment.Constraint'),
      key: 'constraint',
      dataIndex: 'constraint',
      sorter: (a, b) => {
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
        if (requirementA === '' && requirementB === '') return 0;
        if (requirementA === '') return -1;
        if (requirementB === '') return 1;
        return requirementA.localeCompare(requirementB);
      },
      render: (text, row) =>
        row?.tag ? (
          <ConstraintTags
            tag={row?.tag}
            labels={row?.labels as { key: string; value: string }[]}
            highlightKeyword={imageSearch}
          />
        ) : null,
    },
    {
      title: t('environment.Digest'),
      dataIndex: 'digest',
      key: 'digest',
      sorter: (a, b) =>
        a?.digest && b?.digest ? a.digest.localeCompare(b.digest) : 0,
      render: (text, row) => (
        <TextHighlighter keyword={imageSearch}>{row.digest}</TextHighlighter>
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
          <CopyButton
            type="text"
            defaultIcon={<CopyOutlined />}
            style={{ color: token.colorPrimary }}
            copyable={{
              text: getImageFullName(row) || '',
            }}
          ></CopyButton>
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
        return (
          baseVersionMatch ||
          baseImagesMatch ||
          constraintsMatch ||
          langMatch ||
          namespaceMatch ||
          customizedMatch
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
          columns={columns}
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
    </>
  );
};

export default ImageList;
