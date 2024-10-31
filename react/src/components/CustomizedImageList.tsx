import Flex from '../components/Flex';
import {
  BaseImageTags,
  ConstraintTags,
  LangTags,
} from '../components/ImageTags';
import TableColumnsSettingModal from '../components/TableColumnsSettingModal';
import { filterNonNullItems, getImageFullName, localeCompare } from '../helper';
import {
  useBackendAIImageMetaData,
  useSuspendedBackendaiClient,
  useUpdatableState,
} from '../hooks';
import AliasedImageDoubleTags from './AliasedImageDoubleTags';
import TextHighlighter from './TextHighlighter';
import { CustomizedImageListForgetAndUntagMutation } from './__generated__/CustomizedImageListForgetAndUntagMutation.graphql';
import {
  CustomizedImageListQuery,
  CustomizedImageListQuery$data,
} from './__generated__/CustomizedImageListQuery.graphql';
import CopyButton from './lablupTalkativotUI/CopyButton';
import {
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useLocalStorageState } from 'ahooks';
import { App, Button, Popconfirm, Table, theme, Typography } from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import { ColumnsType, ColumnType } from 'antd/es/table';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, {
  PropsWithChildren,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery, useMutation } from 'react-relay';

export type CommittedImage = NonNullable<
  CustomizedImageListQuery$data['customized_images']
>[number];

const CustomizedImageList: React.FC<PropsWithChildren> = ({ children }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const baiClient = useSuspendedBackendaiClient();
  const supportExtendedImageInfo =
    baiClient?.supports('extended-image-info') ?? false;

  const [isOpenColumnsSetting, setIsOpenColumnsSetting] = useState(false);
  const [isRefetchPending, startRefetchTransition] = useTransition();
  const [customizedImageListFetchKey, updateCustomizedImageListFetchKey] =
    useUpdatableState('initial-fetch');
  const [inFlightImageId, setInFlightImageId] = useState<string>();
  const [imageSearch, setImageSearch] = useState('');
  const [isPendingSearchTransition, startSearchTransition] = useTransition();
  const [
    ,
    {
      getNamespace,
      getImageLang,
      getBaseVersion,
      getBaseImage,
      getConstraints,
      tagAlias,
      getLang,
      getBaseImages,
    },
  ] = useBackendAIImageMetaData();

  const { customized_images } = useLazyLoadQuery<CustomizedImageListQuery>(
    graphql`
      query CustomizedImageListQuery {
        customized_images {
          id
          name @deprecatedSince(version: "24.09.1.")
          humanized_name
          tag
          registry
          architecture
          digest
          labels {
            key
            value
          }
          supported_accelerators
          namespace @since(version: "24.09.1.")
          base_image_name @since(version: "24.09.1.")
          tags @since(version: "24.09.1.") {
            key
            value
          }
          version @since(version: "24.09.1.")
          ...AliasedImageDoubleTagsFragment
        }
      }
    `,
    {},
    {
      fetchPolicy:
        customizedImageListFetchKey === 'initial-fetch'
          ? 'store-and-network'
          : 'network-only',
      fetchKey: customizedImageListFetchKey,
    },
  );

  const [commitForgetAndUntag, isInflightForgetAndUntag] =
    useMutation<CustomizedImageListForgetAndUntagMutation>(graphql`
      mutation CustomizedImageListForgetAndUntagMutation($id: String!) {
        untag_image_from_registry(image_id: $id) {
          ok
          msg
        }
        forget_image_by_id(image_id: $id) {
          ok
          msg
        }
      }
    `);

  // Sort images by humanized_name to prevent the image list from jumping around when the images are updated
  // TODO: after `images` query  supports sort order, we should remove this line
  const defaultSortedImages = useMemo(
    () => _.sortBy(customized_images, (image) => image?.humanized_name),
    [customized_images],
  );

  const imageFilterValues = useMemo(() => {
    return defaultSortedImages?.map((image) => {
      return {
        namespace: supportExtendedImageInfo ? image?.namespace : image?.name,
        fullName: getImageFullName(image) || '',
        digest: image?.digest || '',
        // ------------ need only before 24.09.1 ------------
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
        // -------------------------------------------------
        // ------------ need only after 24.09.1 ------------
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
        const constraintsMatch = _.some(
          curFilterValues.constraints,
          (constraint) => regExp.test(constraint),
        );
        const customizedMatch = curFilterValues.isCustomized
          ? regExp.test('customized')
          : false;
        const langMatch = regExp.test(curFilterValues.lang);
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
          constraintsMatch ||
          langMatch ||
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

  const columns: ColumnsType<CommittedImage> = [
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
            sorter: (a: CommittedImage, b: CommittedImage) =>
              localeCompare(a?.namespace, b?.namespace),
            render: (text: string) => (
              <TextHighlighter keyword={imageSearch}>{text}</TextHighlighter>
            ),
          },
          {
            title: t('environment.BaseImageName'),
            key: 'base_image_name',
            dataIndex: 'base_image_name',
            sorter: (a: CommittedImage, b: CommittedImage) =>
              localeCompare(a?.base_image_name, b?.base_image_name),
            render: (text: string) => (
              <TextHighlighter keyword={imageSearch}>
                {tagAlias(text)}
              </TextHighlighter>
            ),
          },
          {
            title: t('environment.Version'),
            key: 'version',
            dataIndex: 'version',
            sorter: (a: CommittedImage, b: CommittedImage) =>
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
              row: CommittedImage,
            ) => (
              <AliasedImageDoubleTags
                imageFrgmt={row}
                label={undefined}
                highlightKeyword={imageSearch}
              />
            ),
          },
        ]
      : [
          {
            title: t('environment.Namespace'),
            key: 'name',
            dataIndex: 'name',
            sorter: (a: CommittedImage, b: CommittedImage) => {
              const namespaceA = getNamespace(getImageFullName(a) || '');
              const namespaceB = getNamespace(getImageFullName(b) || '');
              return namespaceA && namespaceB
                ? namespaceA.localeCompare(namespaceB)
                : 0;
            },
            render: (text: string, row: CommittedImage) => (
              <span>{getNamespace(getImageFullName(row) || '')}</span>
            ),
          },
          {
            title: t('environment.Language'),
            key: 'lang',
            sorter: (a: CommittedImage, b: CommittedImage) =>
              localeCompare(
                getImageLang(getImageFullName(a) || ''),
                getImageLang(getImageFullName(b) || ''),
              ),
            render: (text: string, row: CommittedImage) => (
              <LangTags image={getImageFullName(row) || ''} color="green" />
            ),
          },
          {
            title: t('environment.Version'),
            key: 'baseversion',
            dataIndex: 'baseversion',
            sorter: (a: CommittedImage, b: CommittedImage) =>
              localeCompare(
                getBaseVersion(getImageFullName(a) || ''),
                getBaseVersion(getImageFullName(b) || ''),
              ),
            render: (text: string, row: CommittedImage) => (
              <TextHighlighter keyword={imageSearch}>
                {getBaseVersion(getImageFullName(row) || '')}
              </TextHighlighter>
            ),
          },
          {
            title: t('environment.Base'),
            key: 'baseimage',
            dataIndex: 'baseimage',
            sorter: (a: CommittedImage, b: CommittedImage) =>
              localeCompare(
                getBaseImage(getBaseImage(getImageFullName(a) || '')),
                getBaseImage(getBaseImage(getImageFullName(b) || '')),
              ),
            render: (text: string, row: CommittedImage) => (
              <BaseImageTags image={getImageFullName(row) || ''} />
            ),
          },
          {
            title: t('environment.Constraint'),
            key: 'constraint',
            dataIndex: 'constraint',
            sorter: (a: CommittedImage, b: CommittedImage) => {
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
            render: (text: string, row: CommittedImage) =>
              row?.tag ? (
                <ConstraintTags
                  tag={row?.tag}
                  labels={row?.labels as Array<{ key: string; value: string }>}
                  highlightKeyword={imageSearch}
                />
              ) : null,
          },
        ]),
    {
      title: t('environment.Digest'),
      dataIndex: 'digest',
      key: 'digest',
      sorter: (a, b) => localeCompare(a?.digest, b?.digest),
      render: (text) => (
        <Typography.Text ellipsis={{ tooltip: true }} style={{ maxWidth: 200 }}>
          <TextHighlighter keyword={imageSearch}>{text}</TextHighlighter>
        </Typography.Text>
      ),
    },
    {
      title: t('general.Control'),
      key: 'control',
      fixed: 'right',
      render: (text, row) => (
        <Flex direction="row" align="stretch" justify="center" gap="xxs">
          <Popconfirm
            title={t('dialog.ask.DoYouWantToProceed')}
            description={t('dialog.warning.CannotBeUndone')}
            okType="danger"
            okText={t('button.Delete')}
            onConfirm={() => {
              if (row?.id) {
                setInFlightImageId(row.id + customizedImageListFetchKey);
                commitForgetAndUntag({
                  variables: {
                    id: row.id,
                  },
                  onCompleted(data, errors) {
                    if (errors) {
                      message.error(errors[0]?.message);
                      return;
                    }
                    startRefetchTransition(() => {
                      updateCustomizedImageListFetchKey();
                    });
                    message.success(
                      t('environment.CustomizedImageSuccessfullyDeleted'),
                    );
                  },
                  onError(err) {
                    message.error(err?.message);
                  },
                });
              }
            }}
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              loading={
                isInflightForgetAndUntag &&
                inFlightImageId === row?.id + customizedImageListFetchKey
              }
              disabled={
                isInflightForgetAndUntag &&
                inFlightImageId !== row?.id + customizedImageListFetchKey
              }
            />
          </Popconfirm>
        </Flex>
      ),
    },
  ];

  const [displayedColumnKeys, setDisplayedColumnKeys] = useLocalStorageState(
    'backendaiwebui.CustomizedImageList.displayedColumnKeys',
    {
      defaultValue: columns.map((column) => _.toString(column.key)),
    },
  );

  return (
    <Flex direction="column" align="stretch" gap={'xs'}>
      <Flex direction="column" align="stretch">
        <Flex justify="end" style={{ padding: token.paddingSM }} gap="xs">
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
            loading={isRefetchPending}
            onClick={() => {
              startRefetchTransition(() => updateCustomizedImageListFetchKey());
            }}
          >
            {t('button.Refresh')}
          </Button>
        </Flex>
        <Table
          loading={isPendingSearchTransition}
          columns={
            columns.filter((column) =>
              displayedColumnKeys?.includes(_.toString(column.key)),
            ) as ColumnType<AnyObject>[]
          }
          dataSource={filterNonNullItems(filteredImageData)}
          rowKey="id"
          scroll={{ x: 'max-content' }}
          pagination={false}
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
    </Flex>
  );
};

export default CustomizedImageList;
