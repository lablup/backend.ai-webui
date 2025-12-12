import { CustomizedImageListForgetMutation } from '../__generated__/CustomizedImageListForgetMutation.graphql';
import {
  CustomizedImageListQuery,
  CustomizedImageListQuery$data,
} from '../__generated__/CustomizedImageListQuery.graphql';
import { CustomizedImageListUntagMutation } from '../__generated__/CustomizedImageListUntagMutation.graphql';
import TableColumnsSettingModal from '../components/TableColumnsSettingModal';
import { getImageFullName, localeCompare } from '../helper';
import {
  useBackendAIImageMetaData,
  useSuspendedBackendaiClient,
  useUpdatableState,
} from '../hooks';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import AliasedImageDoubleTags from './AliasedImageDoubleTags';
import { ImageTags } from './ImageTags';
import TextHighlighter from './TextHighlighter';
import {
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Alert, App, Button, Input, theme, Typography } from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import { ColumnsType, ColumnType } from 'antd/es/table';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAIFlex,
  BAIModal,
  BAITable,
  BAIText,
} from 'backend.ai-ui';
import _ from 'lodash';
import React, { useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

export type CommittedImage = NonNullable<
  CustomizedImageListQuery$data['customized_images']
>[number];

const CustomizedImageList: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const baiClient = useSuspendedBackendaiClient();
  const supportExtendedImageInfo =
    baiClient?.supports('extended-image-info') ?? false;

  const [visibleColumnSettingModal, { toggle: toggleColumnSettingModal }] =
    useToggle();
  const [isRefetchPending, startRefetchTransition] = useTransition();
  const [customizedImageListFetchKey, updateCustomizedImageListFetchKey] =
    useUpdatableState('initial-fetch');
  const [imageSearch, setImageSearch] = useState('');
  const [isPendingSearchTransition, startSearchTransition] = useTransition();
  const [imageToDelete, setImageToDelete] = useState<CommittedImage | null>(
    null,
  );
  const [, { getBaseVersion, getBaseImages, getBaseImage, tagAlias, getTags }] =
    useBackendAIImageMetaData();

  const { customized_images } = useLazyLoadQuery<CustomizedImageListQuery>(
    graphql`
      query CustomizedImageListQuery {
        customized_images {
          id
          name @deprecatedSince(version: "24.12.0")
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
          namespace @since(version: "24.12.0")
          base_image_name @since(version: "24.12.0")
          tags @since(version: "24.12.0") {
            key
            value
          }
          version @since(version: "24.12.0")
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

  const [commitForget, isInFlightForget] =
    useMutation<CustomizedImageListForgetMutation>(graphql`
      mutation CustomizedImageListForgetMutation($id: String!) {
        forget_image_by_id(image_id: $id) {
          ok
          msg
        }
      }
    `);

  const [commitUntag, isInFlightUntag] =
    useMutation<CustomizedImageListUntagMutation>(graphql`
      mutation CustomizedImageListUntagMutation($id: String!) {
        untag_image_from_registry(image_id: $id) {
          ok
          msg
        }
      }
    `);

  // TODO: when BA-1905 resolved.
  // const [commitPurgeImage, isInFlightPurgeImage] =
  //   useMutation<CustomizedImageListPurgeMutation>(graphql`
  //     mutation CustomizedImageListPurgeMutation($id: String!) {
  //       purge_image_by_id(
  //         image_id: $id
  //         options: { remove_from_registry: true }
  //       ) {
  //         image {
  //           id
  //         }
  //       }
  //     }
  //   `);

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

  const columns: ColumnsType<CommittedImage> = filterOutEmpty([
    {
      title: t('environment.FullImagePath'),
      key: 'fullImagePath',
      render: (row) => (
        <BAIText
          monospace
          copyable={{
            text: getImageFullName(row) || '',
          }}
        >
          <TextHighlighter keyword={imageSearch}>
            {getImageFullName(row) || ''}
          </TextHighlighter>
        </BAIText>
      ),
      sorter: (a, b) => localeCompare(getImageFullName(a), getImageFullName(b)),
      width: token.screenXS,
    },
    {
      title: t('general.Control'),
      key: 'control',
      render: (_text, row) => (
        <BAIFlex direction="row" align="stretch" justify="center" gap="xxs">
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => {
              setImageToDelete(row || null);
            }}
            danger
          />
        </BAIFlex>
      ),
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
      sorter: (a, b) => localeCompare(a?.base_image_name, b?.base_image_name),
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
      render: (_text: Array<{ key: string; value: string }>, row) => (
        <AliasedImageDoubleTags
          imageFrgmt={row}
          highlightKeyword={imageSearch}
          label={''}
        />
      ),
    },

    !supportExtendedImageInfo && {
      title: t('environment.Namespace'),
      key: 'name',
      dataIndex: 'name',
      sorter: (a, b) => localeCompare(getImageFullName(a), getImageFullName(b)),
      render: (text) => (
        <TextHighlighter keyword={imageSearch}>{text}</TextHighlighter>
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
      render: (_text, row) => (
        <TextHighlighter keyword={imageSearch}>
          {getBaseVersion(getImageFullName(row) || '')}
        </TextHighlighter>
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
      render: (_text, row) => (
        <TextHighlighter keyword={imageSearch}>
          {tagAlias(getBaseImage(getImageFullName(row) || ''))}
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
          labels={row?.labels as Array<{ key: string; value: string }>}
          highlightKeyword={imageSearch}
        />
      ),
    },
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
  ]);

  const [hiddenColumnKeys, setHiddenColumnKeys] = useHiddenColumnKeysSetting(
    'CustomizedImageList',
  );

  return (
    <BAIFlex direction="column" align="stretch">
      <BAIFlex direction="column" align="stretch" gap="sm">
        <BAIFlex justify="between" gap="xs" wrap="wrap">
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
          />
        </BAIFlex>
        <BAITable
          resizable
          loading={isPendingSearchTransition}
          columns={
            _.filter(
              columns,
              (column) =>
                !_.includes(hiddenColumnKeys, _.toString(column?.key)),
            ) as ColumnType<AnyObject>[]
          }
          dataSource={filterOutNullAndUndefined(filteredImageData)}
          rowKey="id"
          scroll={{ x: 'max-content' }}
          pagination={{
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
        />
      </BAIFlex>
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
      <BAIModal
        open={imageToDelete !== null}
        title={t('dialog.ask.DoYouWantToDelete')}
        okText={t('button.Delete')}
        okType="danger"
        confirmLoading={isInFlightForget || isInFlightUntag}
        onOk={() => {
          if (imageToDelete) {
            // TODO: when BA-1905 resolved. use commitPurgeImage
            commitUntag({
              variables: { id: imageToDelete.id },
              onCompleted: (res, errors) => {
                if (
                  !_.isNil(res.untag_image_from_registry) &&
                  !res.untag_image_from_registry.ok
                ) {
                  message.error(res.untag_image_from_registry.msg);
                  return;
                }
                if (errors && errors?.length > 0) {
                  const errorMsgList = _.map(errors, (error) => error.message);
                  for (const errorMsg of errorMsgList) {
                    message.error(errorMsg);
                  }
                  return;
                }
                commitForget({
                  variables: { id: imageToDelete.id },
                  onCompleted: (res, errors) => {
                    if (
                      !_.isNil(res.forget_image_by_id) &&
                      !res.forget_image_by_id.ok
                    ) {
                      message.error(res.forget_image_by_id.msg);
                      return;
                    }
                    if (errors && errors?.length > 0) {
                      const errorMsgList = _.map(
                        errors,
                        (error) => error.message,
                      );
                      for (const errorMsg of errorMsgList) {
                        message.error(errorMsg);
                      }

                      return;
                    }
                    startRefetchTransition(() => {
                      updateCustomizedImageListFetchKey();
                    });
                    message.success(
                      t('environment.CustomizedImageSuccessfullyDeleted'),
                    );
                    setImageToDelete(null);
                  },
                  onError: () => {
                    message.error(
                      t('environment.FailedToDeleteCustomizedImage'),
                    );
                  },
                });
              },
              onError: () => {
                message.error(t('environment.FailedToDeleteCustomizedImage'));
              },
            });
          }
        }}
        onCancel={() => {
          setImageToDelete(null);
        }}
      >
        <Alert
          type="warning"
          showIcon
          message={t('dialog.warning.CannotBeUndone')}
        />
        {imageToDelete !== null && (
          <ul
            style={{
              paddingInlineStart: token.marginSM,
              listStyle: 'circle',
            }}
          >
            <li>
              <BAIText monospace>{getImageFullName(imageToDelete)}</BAIText>
            </li>
          </ul>
        )}
      </BAIModal>
    </BAIFlex>
  );
};

export default CustomizedImageList;
