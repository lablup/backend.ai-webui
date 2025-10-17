import {
  ImageEnvironmentSelectFormItemsQuery,
  ImageEnvironmentSelectFormItemsQuery$data,
} from '../__generated__/ImageEnvironmentSelectFormItemsQuery.graphql';
import {
  getImageFullName,
  localeCompare,
  preserveDotStartCase,
} from '../helper';
import {
  useBackendAIImageMetaData,
  useSuspendedBackendaiClient,
} from '../hooks';
import { useThemeMode } from '../hooks/useThemeMode';
import DoubleTag from './DoubleTag';
// @ts-ignore
import cssRaw from './ImageEnvironmentSelectFormItems.css?raw';
import ImageMetaIcon from './ImageMetaIcon';
import { ImageTags } from './ImageTags';
import TextHighlighter from './TextHighlighter';
import {
  Divider,
  Form,
  Input,
  RefSelectProps,
  Select,
  Tag,
  theme,
  Typography,
} from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type Image = NonNullable<
  NonNullable<ImageEnvironmentSelectFormItemsQuery$data>['images']
>[0];

type ImageGroup = {
  groupName: string;
  environmentGroups: {
    environmentName: string;
    displayName: string;
    prefix?: string;
    images: Image[];
  }[];
};

export type ImageEnvironmentFormInput = {
  environments: {
    environment: string;
    version: string;
    image: Image | undefined;
    manual?: string;
    customizedTag?: string;
  };
};

interface ImageEnvironmentSelectFormItemsProps {
  filter?: (image: Image) => boolean;
  showPrivate?: boolean;
}

function compareVersions(version1: string, version2: string): number {
  const v1 = version1.split('.').map(Number);
  const v2 = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const num1 = v1[i] || 0;
    const num2 = v2[i] || 0;

    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }

  return 0;
}

const isPrivateImage = (image: Image) => {
  return _.some(image?.labels, (label) => {
    return (
      label?.key === 'ai.backend.features' &&
      label?.value?.split(' ').includes('private')
    );
  });
};

const ImageEnvironmentSelectFormItems: React.FC<
  ImageEnvironmentSelectFormItemsProps
> = ({ filter, showPrivate }) => {
  const form = Form.useFormInstance<ImageEnvironmentFormInput>();
  const environments = Form.useWatch('environments', { form, preserve: true });
  const baiClient = useSuspendedBackendaiClient();
  const supportExtendedImageInfo = baiClient?.supports('extended-image-info');

  const [environmentSearch, setEnvironmentSearch] = useState('');
  const [versionSearch, setVersionSearch] = useState('');
  const { t } = useTranslation();
  const [metadata, { getBaseVersion, getImageMeta, tagAlias }] =
    useBackendAIImageMetaData();
  const { token } = theme.useToken();
  const { isDarkMode } = useThemeMode();

  const envSelectRef = useRef<RefSelectProps>(null);
  const versionSelectRef = useRef<RefSelectProps>(null);
  const imageEnvironmentSelectFormItemsVariables = baiClient?._config
    ?.showNonInstalledImages
    ? {}
    : { installed: true };
  const { images } = useLazyLoadQuery<ImageEnvironmentSelectFormItemsQuery>(
    graphql`
      query ImageEnvironmentSelectFormItemsQuery($installed: Boolean) {
        images(is_installed: $installed) {
          id
          name @deprecatedSince(version: "24.12.0")
          humanized_name
          tag
          registry
          architecture
          digest
          installed
          resource_limits {
            key
            min
            max
          }
          labels {
            key
            value
          }
          namespace @since(version: "24.12.0")
          base_image_name @since(version: "24.12.0")
          tags @since(version: "24.12.0") {
            key
            value
          }
          version @since(version: "24.12.0")
          supported_accelerators
        }
      }
    `,
    imageEnvironmentSelectFormItemsVariables,
    {
      fetchPolicy: 'store-and-network',
    },
  );

  // If not initial value, select first value
  // auto select when relative field is changed
  useEffect(() => {
    if (!_.isEmpty(environments?.manual)) {
      // set undefined fields related to environments when manual is set
      if (environments.environment || environments.version) {
        form.setFieldsValue({
          environments: {
            environment: undefined,
            version: undefined,
            image: undefined,
          },
        });
      }
      return;
    }

    let matchedEnvironmentByVersion:
      | ImageGroup['environmentGroups'][0]
      | undefined;
    let matchedImageByVersion: Image | undefined;
    let version = form.getFieldValue('environments')?.version;
    // FIXME: manually add architecture based on amd64
    if (version && version.indexOf('@') < 0) {
      version += '@x86_64';
    }
    version &&
      _.find(imageGroups, (group) => {
        matchedEnvironmentByVersion = _.find(
          group.environmentGroups,
          (environment) => {
            matchedImageByVersion = _.find(
              environment.images,
              (image) => getImageFullName(image) === version,
            );
            return !!matchedImageByVersion; // break iteration
          },
        );
        return !!matchedEnvironmentByVersion; // break iteration
      });

    // if matchedEnvironmentByVersion is not existed, select first values
    let nextEnvironment: ImageGroup['environmentGroups'][0] | undefined;
    let nextImage: Image | undefined;
    if (matchedEnvironmentByVersion) {
      nextEnvironment = matchedEnvironmentByVersion;
      nextImage = matchedImageByVersion;
    } else if (form.getFieldValue(['environments', 'environment'])) {
      _.find(imageGroups, (group) => {
        nextEnvironment = _.find(group.environmentGroups, (environment) => {
          return (
            environment.environmentName ===
            form.getFieldValue(['environments', 'environment'])
          );
        });
        nextImage = nextEnvironment?.images[0];
        return !!nextEnvironment;
      });
    }

    if (!nextEnvironment || !nextImage) {
      nextEnvironment = imageGroups[0]?.environmentGroups[0];
      nextImage = nextEnvironment?.images[0];
    }

    const customizedImageTag = _.find(
      nextImage?.labels,
      (item) =>
        item !== null && item?.key === 'ai.backend.customized-image.name',
    )?.value;

    if (nextImage) {
      if (
        !matchedEnvironmentByVersion &&
        baiClient._config.allow_manual_image_name_for_session &&
        version
      ) {
        form.setFieldsValue({
          environments: {
            environment: undefined,
            version: undefined,
            image: undefined,
            manual: version,
            customizedTag: customizedImageTag ?? undefined,
          },
        });
      } else {
        form.setFieldsValue({
          environments: {
            environment: nextEnvironment.environmentName,
            version: getImageFullName(nextImage),
            image: nextImage,
            customizedTag: customizedImageTag ?? undefined,
          },
        });
      }
    } else if (baiClient._config.allow_manual_image_name_for_session) {
      // if no image is available, only set manual if it's allowed
      form.setFieldValue(['environments', 'manual'], version);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environments?.version, environments?.manual]); // environments?.environment,

  const imageGroups: ImageGroup[] = useMemo(
    () =>
      _.chain(images)
        .filter((image) => {
          return (
            (showPrivate ? true : !isPrivateImage(image)) &&
            (filter ? filter(image) : true)
          );
        })
        .groupBy((image) => {
          // group by using `group` property of image info
          return (
            metadata?.imageInfo[getImageMeta(getImageFullName(image) || '').key]
              ?.group || 'Custom Environments'
          );
        })
        .map((images, groupName) => {
          return {
            groupName,
            environmentGroups: _.chain(images)
              // sub group by using (environment) `name` property of image info
              .groupBy((image) => {
                return (
                  // metadata?.imageInfo[
                  //   getImageMeta(getImageFullName(image) || "").key
                  // ]?.name || image?.name
                  `${image?.registry}/${
                    supportExtendedImageInfo ? image?.namespace : image?.name
                  }`
                );
              })
              .map((images, environmentName) => {
                const imageKey = environmentName.split('/')?.[2];
                const displayName =
                  imageKey && metadata?.imageInfo[imageKey]?.name;

                return {
                  environmentName,
                  displayName:
                    displayName ||
                    (_.last(environmentName.split('/')) as string),
                  prefix: _.chain(environmentName)
                    .split('/')
                    .drop(1)
                    .dropRight(1)
                    .join('/')
                    .value(),
                  images: images.sort(
                    (a, b) =>
                      compareVersions(
                        // latest version comes first
                        b?.tag?.split('-')?.[0] ?? '',
                        a?.tag?.split('-')?.[0] ?? '',
                      ) || localeCompare(a?.architecture, b?.architecture),
                  ),
                };
              })

              .sortBy((item) => item.displayName)
              .value(),
          };
        })
        .sortBy((item) => item.groupName)
        .value(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [images, metadata, filter, showPrivate],
  );

  // support search image by full name
  const { fullNameMatchedImage } = useMemo(() => {
    let fullNameMatchedImage: Image | undefined;
    let fullNameMatchedImageGroup:
      | ImageGroup['environmentGroups'][0]
      | undefined;
    if (environmentSearch.length) {
      _.chain(
        imageGroups
          .flatMap((group) => group.environmentGroups)
          .find((envGroup) => {
            fullNameMatchedImageGroup = envGroup;
            fullNameMatchedImage = _.find(envGroup.images, (image) => {
              return getImageFullName(image) === environmentSearch;
            });
            return !!fullNameMatchedImage;
          }),
      ).value();
    }
    return {
      fullNameMatchedImage,
      fullNameMatchedImageGroup,
    };
  }, [environmentSearch, imageGroups]);

  return (
    <>
      <style>{cssRaw}</style>
      <Form.Item
        className="image-environment-select-form-item"
        name={['environments', 'environment']}
        label={
          <Typography.Text
            copyable={{
              text: getImageFullName(
                form.getFieldValue(['environments', 'image']),
              ),
            }}
          >
            {t('session.launcher.Environments')} /{' '}
            {t('session.launcher.Version')}
          </Typography.Text>
        }
        rules={[
          {
            required: _.isEmpty(environments?.manual),
            message: t('general.ValueRequired', {
              name: t('session.launcher.Environments'),
            }),
          },
        ]}
        style={{ marginBottom: 10 }}
      >
        <Select
          ref={envSelectRef}
          showSearch
          // open={true}
          // autoClearSearchValue
          searchValue={environmentSearch}
          onSearch={setEnvironmentSearch}
          defaultActiveFirstOption={true}
          optionFilterProp="filterValue"
          onChange={(value) => {
            if (fullNameMatchedImage) {
              form.setFieldsValue({
                environments: {
                  environment:
                    (supportExtendedImageInfo
                      ? fullNameMatchedImage?.namespace
                      : fullNameMatchedImage?.name) || '',
                  version: getImageFullName(fullNameMatchedImage),
                  image: fullNameMatchedImage,
                },
              });
            } else {
              // NOTE: when user set environment only then set the version to the first item
              const firstInListImage: Image = imageGroups
                .flatMap((group) => group.environmentGroups)
                .filter((envGroup) => envGroup.environmentName === value)[0]
                .images[0];
              form.setFieldsValue({
                environments: {
                  environment:
                    (supportExtendedImageInfo
                      ? firstInListImage?.namespace
                      : firstInListImage?.name) || '',
                  version: getImageFullName(firstInListImage),
                  image: firstInListImage,
                },
              });
            }
          }}
          disabled={
            baiClient._config.allow_manual_image_name_for_session &&
            !_.isEmpty(environments?.manual)
          }
        >
          {fullNameMatchedImage ? (
            <Select.Option
              value={
                supportExtendedImageInfo
                  ? fullNameMatchedImage?.namespace
                  : fullNameMatchedImage?.name
              }
              filterValue={getImageFullName(fullNameMatchedImage)}
            >
              <BAIFlex
                direction="row"
                align="center"
                gap="xs"
                style={{ display: 'inline-flex' }}
              >
                <ImageMetaIcon
                  image={getImageFullName(fullNameMatchedImage) || ''}
                  style={{
                    width: 15,
                    height: 15,
                  }}
                />
                {getImageFullName(fullNameMatchedImage)}
              </BAIFlex>
            </Select.Option>
          ) : (
            _.map(imageGroups, (group) => {
              return (
                <Select.OptGroup key={group.groupName} label={group.groupName}>
                  {_.map(group.environmentGroups, (environmentGroup) => {
                    const firstImage = environmentGroup.images[0];
                    const currentMetaImageInfo =
                      metadata?.imageInfo[
                        environmentGroup.environmentName.split('/')?.[2]
                      ];

                    const extraFilterValues: string[] = [];
                    let environmentPrefixTag = null;
                    if (
                      environmentGroup.prefix &&
                      !['lablup', 'cloud', 'stable'].includes(
                        environmentGroup.prefix,
                      )
                    ) {
                      extraFilterValues.push(environmentGroup.prefix);
                      environmentPrefixTag = (
                        <Tag color="purple">
                          <TextHighlighter keyword={environmentSearch}>
                            {environmentGroup.prefix}
                          </TextHighlighter>
                        </Tag>
                      );
                    }

                    const tagsFromMetaImageInfoLabel = _.map(
                      currentMetaImageInfo?.label,
                      (label) => {
                        if (
                          _.isUndefined(label.category) &&
                          label.tag &&
                          label.color
                        ) {
                          extraFilterValues.push(label.tag);
                          return (
                            <Tag color={label.color} key={label.tag}>
                              <TextHighlighter
                                keyword={environmentSearch}
                                key={label.tag}
                              >
                                {label.tag}
                              </TextHighlighter>
                            </Tag>
                          );
                        }
                        return null;
                      },
                    );
                    return (
                      <Select.Option
                        key={environmentGroup.environmentName}
                        value={environmentGroup.environmentName}
                        filterValue={
                          environmentGroup.displayName +
                          '\t' +
                          extraFilterValues.join('\t')
                        }
                      >
                        <BAIFlex direction="row" justify="between">
                          <BAIFlex direction="row" align="center" gap="xs">
                            <ImageMetaIcon
                              image={getImageFullName(firstImage) || ''}
                              style={{
                                width: 15,
                                height: 15,
                              }}
                            />
                            <TextHighlighter keyword={environmentSearch}>
                              {environmentGroup.displayName}
                            </TextHighlighter>
                          </BAIFlex>
                          <BAIFlex
                            direction="row"
                            // set specific class name to handle flex wrap using css
                            className={
                              isDarkMode ? 'tag-wrap-dark' : 'tag-wrap-light'
                            }
                            // style={{ flex: 1 }}
                            style={{
                              marginLeft: token.marginXS,
                              flexShrink: 1,
                            }}
                          >
                            {environmentPrefixTag}
                            {tagsFromMetaImageInfoLabel}
                          </BAIFlex>
                        </BAIFlex>
                      </Select.Option>
                    );
                  })}
                </Select.OptGroup>
              );
            })
          )}
        </Select>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, cur) =>
          prev.environments?.environment !== cur.environments?.environment
        }
      >
        {({ getFieldValue }) => {
          let selectedEnvironmentGroup:
            | ImageGroup['environmentGroups'][0]
            | undefined;
          _.find(imageGroups, (group) => {
            return _.find(group.environmentGroups, (environment) => {
              if (
                environment.environmentName ===
                getFieldValue('environments')?.environment
              ) {
                selectedEnvironmentGroup = environment;
                return true;
              } else {
                return false;
              }
            });
          });
          return (
            <Form.Item
              className="image-environment-select-form-item"
              name={['environments', 'version']}
              rules={[
                {
                  required: _.isEmpty(environments?.manual),
                  message: t('general.ValueRequired', {
                    name: t('session.launcher.Version'),
                  }),
                },
              ]}
            >
              <Select
                ref={versionSelectRef}
                onChange={(value) => {
                  const selectedImage = _.find(images, (image) => {
                    return getImageFullName(image) === value;
                  });
                  form.setFieldValue(['environments', 'image'], selectedImage);
                }}
                showSearch
                searchValue={versionSearch}
                onSearch={setVersionSearch}
                // autoClearSearchValue
                optionFilterProp="filterValue"
                // optionLabelProp="label"
                popupRender={(menu) => (
                  <>
                    <BAIFlex
                      style={{
                        fontWeight: token.fontWeightStrong,
                        paddingLeft: token.paddingSM,
                      }}
                    >
                      {t('session.launcher.Version')}
                      <Divider type="vertical" />
                      {t('session.launcher.Architecture')}
                      <Divider type="vertical" />
                      {t('session.launcher.Tags')}
                    </BAIFlex>
                    <Divider style={{ margin: '8px 0' }} />
                    {menu}
                  </>
                )}
                disabled={
                  baiClient._config.allow_manual_image_name_for_session &&
                  !_.isEmpty(environments?.manual)
                }
              >
                {_.map(
                  _.uniqBy(selectedEnvironmentGroup?.images, 'id'),

                  (image) => {
                    const [version, tag, ...requirements] = image?.tag?.split(
                      '-',
                    ) || ['', '', ''];

                    let metadataTagAlias = metadata?.tagAlias[tag];
                    if (!metadataTagAlias) {
                      for (const [key, replaceString] of Object.entries(
                        metadata?.tagReplace || {},
                      )) {
                        const pattern = new RegExp(key);
                        if (pattern.test(tag)) {
                          metadataTagAlias = tag?.replace(
                            pattern,
                            replaceString,
                          );
                        }
                      }
                      if (!metadataTagAlias) {
                        metadataTagAlias = tag;
                      }
                    }

                    const extraFilterValues: string[] = [];
                    const requirementTags = _.chain(requirements)
                      .filter(
                        (requirement) => !requirement.startsWith('customized_'),
                      )
                      .map((requirement, idx) => (
                        <DoubleTag
                          key={idx}
                          values={_.split(
                            metadata?.tagAlias[requirement] || requirement,
                            ':',
                          ).map((str) => {
                            extraFilterValues.push(str);
                            return {
                              label: str,
                              highlightKeyword: versionSearch,
                            };
                          })}
                        />
                      ))
                      .value();
                    const imageLabels = image?.labels;
                    if (imageLabels) {
                      const customizedImageNameLabelIdx = _.findIndex(
                        imageLabels,
                        (item) =>
                          item !== null &&
                          item?.key === 'ai.backend.customized-image.name',
                      );
                      if (
                        customizedImageNameLabelIdx &&
                        imageLabels[customizedImageNameLabelIdx]
                      ) {
                        const tag =
                          imageLabels[customizedImageNameLabelIdx]?.value || '';
                        extraFilterValues.push('Customized');
                        extraFilterValues.push(tag);
                        requirementTags.push(
                          <DoubleTag
                            key={requirementTags.length + 1}
                            highlightKeyword={versionSearch}
                            values={[
                              {
                                label: 'Customized',
                                color: 'cyan',
                              },
                              {
                                label: tag ?? '',
                                color: 'cyan',
                              },
                            ]}
                          />,
                        );
                      }
                    }
                    return (
                      <Select.Option
                        key={image?.id}
                        value={getImageFullName(image)}
                        filterValue={[
                          version,
                          metadataTagAlias,
                          image?.architecture,
                          ...extraFilterValues,
                        ].join('\t')}
                      >
                        {supportExtendedImageInfo ? (
                          <BAIFlex direction="row">
                            <TextHighlighter keyword={versionSearch}>
                              {image?.version}
                            </TextHighlighter>
                            <Divider type="vertical" />
                            <TextHighlighter keyword={versionSearch}>
                              {image?.architecture}
                            </TextHighlighter>
                            <Divider type="vertical" />
                            <BAIFlex direction="row" align="start">
                              {/* TODO: replace this with AliasedImageDoubleTags after image list query with ImageNode is implemented. */}
                              {_.map(
                                image?.tags,
                                (tag: { key: string; value: string }) => {
                                  const isCustomized = _.includes(
                                    tag.key,
                                    'customized_',
                                  );
                                  const tagValue = isCustomized
                                    ? _.find(image?.labels, {
                                        key: 'ai.backend.customized-image.name',
                                      })?.value
                                    : tag.value;
                                  const aliasedTag = tagAlias(
                                    tag.key + tagValue,
                                  );
                                  return _.isEqual(
                                    aliasedTag,
                                    preserveDotStartCase(tag.key + tagValue),
                                  ) || isCustomized ? (
                                    <DoubleTag
                                      key={tag.key}
                                      highlightKeyword={versionSearch}
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
                                    <Tag
                                      key={tag.key}
                                      color={isCustomized ? 'cyan' : 'blue'}
                                    >
                                      <TextHighlighter keyword={versionSearch}>
                                        {aliasedTag}
                                      </TextHighlighter>
                                    </Tag>
                                  );
                                },
                              )}
                            </BAIFlex>
                          </BAIFlex>
                        ) : (
                          <BAIFlex direction="row" justify="between">
                            <BAIFlex direction="row">
                              <TextHighlighter keyword={versionSearch}>
                                {getBaseVersion(getImageFullName(image) || '')}
                              </TextHighlighter>
                              <Divider type="vertical" />
                              <TextHighlighter keyword={versionSearch}>
                                {image?.architecture}
                              </TextHighlighter>
                              <Divider type="vertical" />
                              <ImageTags
                                tag={image?.tag || ''}
                                highlightKeyword={versionSearch}
                                labels={
                                  image?.labels as Array<{
                                    key: string;
                                    value: string;
                                  }>
                                }
                              />
                            </BAIFlex>
                          </BAIFlex>
                        )}
                      </Select.Option>
                    );
                  },
                )}
              </Select>
            </Form.Item>
          );
        }}
      </Form.Item>
      <Form.Item
        label={t('session.launcher.ManualImageName')}
        name={['environments', 'manual']}
        style={{
          display: baiClient._config.allow_manual_image_name_for_session
            ? 'block'
            : 'none',
        }}
      >
        <Input
          allowClear
          onChange={(value) => {
            if (!_.isEmpty(value)) {
              form.setFieldsValue({
                environments: {
                  environment: undefined,
                  version: undefined,
                  image: undefined,
                },
              });
            } else {
            }
          }}
        />
      </Form.Item>
      <Form.Item noStyle hidden name={['environments', 'image']}>
        <Input />
      </Form.Item>
    </>
  );
};

export default ImageEnvironmentSelectFormItems;
