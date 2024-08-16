import Flex from '../components/Flex';
import { getImageFullName } from '../helper';
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
import {
  AppstoreOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import { App, Button, Input, Table, Tag, theme, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { ReactNode, useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

export type EnvironmentImage = NonNullable<
  NonNullable<ImageListQuery$data['images']>[number]
>;

const CellWrapper = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
}) => {
  if (!children) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

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

  const sortBasedOnInstalled = (a: EnvironmentImage, b: EnvironmentImage) => {
    return a?.installed && !b?.installed
      ? -1
      : !a?.installed && b?.installed
        ? 1
        : 0;
  };

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

  const columns: ColumnsType<EnvironmentImage> = [
    {
      title: t('environment.Status'),
      dataIndex: 'installed',
      key: 'installed',
      sorter: sortBasedOnInstalled,
      render: (text, row) => (
        <CellWrapper>
          {row?.id && installingImages.includes(row.id) ? (
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
          ) : null}
        </CellWrapper>
      ),
    },
    {
      title: t('environment.Registry'),
      dataIndex: 'registry',
      key: 'registry',
      sorter: (a, b) =>
        a?.registry && b?.registry ? a.registry.localeCompare(b.registry) : 0,
      render: (text, row) => (
        <CellWrapper>
          <TextHighlighter keyword={imageSearch}>
            {row.registry}
          </TextHighlighter>
        </CellWrapper>
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
        <CellWrapper>
          <TextHighlighter keyword={imageSearch}>
            {row.architecture}
          </TextHighlighter>
        </CellWrapper>
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
        <CellWrapper>
          <TextHighlighter keyword={imageSearch}>
            {getNamespace(getImageFullName(row) || '')}
          </TextHighlighter>
        </CellWrapper>
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
        <CellWrapper>
          <TextHighlighter keyword={imageSearch}>
            {row.name ? getLang(row.name) : null}
          </TextHighlighter>
        </CellWrapper>
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
        <CellWrapper>
          <TextHighlighter keyword={imageSearch}>
            {getBaseVersion(getImageFullName(row) || '')}
          </TextHighlighter>
        </CellWrapper>
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
        <CellWrapper>
          <Flex direction="column" align="start">
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
        </CellWrapper>
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
      render: (text, row) => (
        <CellWrapper>
          {row?.tag ? (
            <ConstraintTags
              tag={row?.tag}
              labels={row?.labels as { key: string; value: string }[]}
              wrapper={(constraint: unknown) =>
                typeof constraint === 'string' ? (
                  <TextHighlighter keyword={imageSearch}>
                    {constraint}
                  </TextHighlighter>
                ) : (
                  <></>
                )
              }
            />
          ) : null}
        </CellWrapper>
      ),
    },
    {
      title: t('environment.Digest'),
      dataIndex: 'digest',
      key: 'digest',
      sorter: (a, b) =>
        a?.digest && b?.digest ? a.digest.localeCompare(b.digest) : 0,
      render: (text, row) => (
        <CellWrapper>
          <Typography.Text ellipsis>
            <TextHighlighter keyword={imageSearch}>
              {row.digest}
            </TextHighlighter>
          </Typography.Text>
        </CellWrapper>
      ),
    },
    {
      title: t('environment.ResourceLimit'),
      dataIndex: 'resource_limits',
      key: 'resource_limits',
      render: (text, row) =>
        row?.resource_limits?.map((resource_limit) => (
          <ResourceNumber
            type={resource_limit?.key || ''}
            value={resource_limit?.min || '0'}
            max={resource_limit?.max || ''}
          />
        )),
    },
    {
      title: t('general.Control'),
      key: 'control',
      dataIndex: 'control',
      fixed: 'right',
      render: (text, row) => (
        <CellWrapper>
          <Flex direction="row" align="stretch" justify="center" gap="xxs">
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
        </CellWrapper>
      ),
    },
  ];

  const filteredImageData = useMemo(() => {
    const sortedImages: EnvironmentImage[] = images
      ? [...images]
          .filter(
            (image): image is EnvironmentImage =>
              image !== null && image !== undefined,
          )
          .sort(sortBasedOnInstalled)
      : [];
    if (_.isEmpty(imageSearch)) return sortedImages;
    const regExp = new RegExp(`${_.escapeRegExp(imageSearch)}`, 'i');
    return _.filter(sortedImages, (image) => {
      return _.some(image, (value, key) => {
        if (key === 'id') return false;
        if (key === 'installed') return regExp.test(t('environment.Installed'));
        if (['digest', 'architecture', 'registry'].includes(key))
          return regExp.test(_.toString(value));
        if (image.tag && image.name) {
          const baseVersionMatch = regExp.test(
            getBaseVersion(getImageFullName(image) || ''),
          );
          const baseImagesMatch = getBaseImages(image.tag, image.name).some(
            (baseImage) => regExp.test(baseImage),
          );
          const constraintsMatch = getConstraints(
            image.tag,
            image.labels as { key: string; value: string }[],
          ).some((constraint) => regExp.test(constraint));
          const customizedMatch =
            image.tag.indexOf('customized') !== -1
              ? regExp.test('customized')
              : false;
          const langMatch = regExp.test(image.name ? getLang(image.name) : '');
          const namespaceMatch = regExp.test(
            getNamespace(getImageFullName(image) || ''),
          );
          return (
            baseVersionMatch ||
            baseImagesMatch ||
            constraintsMatch ||
            langMatch ||
            namespaceMatch ||
            customizedMatch
          );
        }
        return false;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSearch, images]);

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
        <Flex justify="end" style={{ padding: token.paddingSM, gap: 8 }}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder={t('environment.SearchImages')}
            onChange={(e) => {
              startTransition(() => setImageSearch(e.target.value));
            }}
            style={{
              width: 200,
            }}
          />
          <Button
            icon={<ReloadOutlined />}
            loading={isPendingRefreshTransition}
            onClick={() => {
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
                message.warning(t('environment.NoImagesAreSelected'));
                return;
              }
              if (selectedRows.some((image) => !image.installed)) {
                setIsOpenInstallModal(true);
                return;
              }
              message.warning(t('environment.AlreadyInstalledImage'));
            }}
          >
            {t('environment.Install')}
          </Button>
        </Flex>
        <Table<EnvironmentImage>
          rowKey="id"
          scroll={{
            x: 1600,
            y: window.innerHeight - 145 - 56 - 54,
          }}
          virtual
          pagination={false}
          dataSource={filteredImageData}
          columns={columns}
          rowSelection={{
            type: 'checkbox',
            renderCell: (checked, record, index, originNode) => (
              <CellWrapper style={{ justifyContent: 'center' }}>
                {originNode}
              </CellWrapper>
            ),
            columnWidth: 48,
            onChange: (_, selectedRows: EnvironmentImage[]) => {
              setSelectedRows(selectedRows);
            },
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
