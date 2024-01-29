import {
  useBackendAIImageMetaData,
  useSuspendedBackendaiClient,
} from '../hooks';
import { useThemeMode } from '../hooks/useThemeMode';
import DoubleTag from './DoubleTag';
import Flex from './Flex';
// @ts-ignore
import cssRaw from './ImageEnvironmentSelectFormItems.css?raw';
import ImageMetaIcon from './ImageMetaIcon';
import TextHighlighter from './TextHighlighter';
import {
  ImageEnvironmentSelectFormItemsQuery,
  ImageEnvironmentSelectFormItemsQuery$data,
} from './__generated__/ImageEnvironmentSelectFormItemsQuery.graphql';
import { Divider, Form, Input, RefSelectProps, Select, Tag, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

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
  };
};

interface ImageEnvironmentSelectFormItemsProps {
  filter?: (image: Image) => boolean;
  showPrivate?: boolean;
}

const getImageFullName = (image: Image) => {
  return image
    ? `${image.registry}/${image.name}:${image.tag}@${image.architecture}`
    : undefined;
};

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

  const [environmentSearch, setEnvironmentSearch] = useState('');
  const [versionSearch, setVersionSearch] = useState('');
  const { t } = useTranslation();
  const [metadata, { getImageMeta }] = useBackendAIImageMetaData();
  const { token } = theme.useToken();
  const { isDarkMode } = useThemeMode();

  const envSelectRef = useRef<RefSelectProps>(null);
  const versionSelectRef = useRef<RefSelectProps>(null);

  const { images } = useLazyLoadQuery<ImageEnvironmentSelectFormItemsQuery>(
    graphql`
      query ImageEnvironmentSelectFormItemsQuery($installed: Boolean) {
        images(is_installed: $installed) {
          name
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
        }
      }
    `,
    {
      installed: true,
    },
    {
      fetchPolicy: 'store-and-network',
    },
  );

  // If not initial value, select first value
  // auto select when relative field is changed
  useEffect(() => {
    if (!_.isEmpty(environments?.manual)) {
      return;
    }

    let matchedEnvironmentByVersion:
      | ImageGroup['environmentGroups'][0]
      | undefined;
    // let matchedImageByVersion;

    form.getFieldValue('environments')?.environment === undefined &&
      form.getFieldValue('environments')?.version &&
      _.find(imageGroups, (group) => {
        return _.find(group.environmentGroups, (environment) => {
          return _.find(environment.images, (image) => {
            const matched =
              getImageFullName(image) ===
              form.getFieldValue('environments')?.version;

            if (matched) {
              matchedEnvironmentByVersion = environment;
              // matchedImageByVersion = image;
            }
            return matched;
          });
        });
      });

    // if not initial value, select first value
    const nextEnvironmentName =
      form.getFieldValue('environments')?.environment ||
      form.getFieldValue('environments')?.version
        ? matchedEnvironmentByVersion?.environmentName
        : imageGroups[0]?.environmentGroups[0]?.environmentName;

    let nextEnvironmentGroup: ImageGroup['environmentGroups'][0] | undefined;
    _.find(imageGroups, (group) => {
      return _.find(group.environmentGroups, (environment) => {
        if (environment.environmentName === nextEnvironmentName) {
          nextEnvironmentGroup = environment;
          return true;
        } else {
          return false;
        }
      });
    });

    let nextNewImage;
    // if current version doesn't exist in next environment group, select a version of the first image of next environment group
    if (
      !_.find(
        nextEnvironmentGroup?.images,
        (image) =>
          form.getFieldValue('environments')?.version ===
          getImageFullName(image),
      )
    ) {
      nextNewImage = nextEnvironmentGroup?.images[0];
    } else {
      // if image info is partially set, fill out image info
      nextNewImage = _.find(
        nextEnvironmentGroup?.images,
        (image) =>
          form.getFieldValue('environments')?.version ===
          getImageFullName(image),
      );
    }
    if (nextNewImage) {
      form.setFieldsValue({
        environments: {
          environment: nextEnvironmentName,
          version: getImageFullName(nextNewImage),
          image: nextNewImage,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environments?.environment, environments?.version, environments?.manual]);

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
                  image?.name
                );
              })
              .map((images, environmentName) => {
                const imageKey = environmentName.split('/')?.[1];
                const displayName =
                  imageKey && metadata?.imageInfo[imageKey]?.name;

                return {
                  environmentName,
                  displayName:
                    displayName ||
                    (_.last(environmentName.split('/')) as string),
                  prefix: _.chain(environmentName)
                    .split('/')
                    .dropRight(1)
                    .join('/')
                    .value(),
                  images: images.sort((a, b) =>
                    compareVersions(
                      // latest version comes first
                      b?.tag?.split('-')?.[0] ?? '',
                      a?.tag?.split('-')?.[0] ?? '',
                    ),
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
        label={`${t('session.launcher.Environments')} / ${t(
          'session.launcher.Version',
        )}`}
        rules={[{ required: _.isEmpty(environments?.manual) }]}
        style={{ marginBottom: 10 }}
      >
        <Select
          ref={envSelectRef}
          showSearch
          className="image-environment-select"
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
                  environment: fullNameMatchedImage?.name || '',
                  version: getImageFullName(fullNameMatchedImage),
                  image: fullNameMatchedImage,
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
              value={fullNameMatchedImage?.name}
              filterValue={getImageFullName(fullNameMatchedImage)}
            >
              <Flex
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
              </Flex>
            </Select.Option>
          ) : (
            _.map(imageGroups, (group) => {
              return (
                <Select.OptGroup key={group.groupName} label={group.groupName}>
                  {_.map(group.environmentGroups, (environmentGroup) => {
                    const firstImage = environmentGroup.images[0];
                    const currentMetaImageInfo =
                      metadata?.imageInfo[
                        environmentGroup.environmentName.split('/')?.[1]
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
                        <Flex direction="row" justify="between">
                          <Flex direction="row" align="center" gap="xs">
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
                          </Flex>
                          <Flex
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
                          </Flex>
                        </Flex>
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
              rules={[{ required: _.isEmpty(environments?.manual) }]}
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
                dropdownRender={(menu) => (
                  <>
                    <Flex
                      style={{
                        fontWeight: token.fontWeightStrong,
                        paddingLeft: token.paddingSM,
                      }}
                    >
                      {t('session.launcher.Version')}
                      <Divider type="vertical" />
                      {t('session.launcher.Base')}
                      <Divider type="vertical" />
                      {t('session.launcher.Architecture')}
                      <Divider type="vertical" />
                      {t('session.launcher.Requirements')}
                    </Flex>
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
                  _.uniqBy(selectedEnvironmentGroup?.images, 'digest'),

                  (image) => {
                    const [version, tag, ...requirements] = image?.tag?.split(
                      '-',
                    ) || ['', '', ''];

                    let tagAlias = metadata?.tagAlias[tag];
                    if (!tagAlias) {
                      for (const [key, replaceString] of Object.entries(
                        metadata?.tagReplace || {},
                      )) {
                        const pattern = new RegExp(key);
                        if (pattern.test(tag)) {
                          tagAlias = tag?.replace(pattern, replaceString);
                        }
                      }
                      if (!tagAlias) {
                        tagAlias = tag;
                      }
                    }

                    const extraFilterValues: string[] = [];
                    const requirementTags =
                      requirements.length > 0
                        ? _.map(requirements, (requirement, idx) => (
                            <DoubleTag
                              key={idx}
                              values={_.split(
                                metadata?.tagAlias[requirement] || requirement,
                                ':',
                              ).map((str) => {
                                extraFilterValues.push(str);
                                return (
                                  <TextHighlighter
                                    keyword={versionSearch}
                                    key={str}
                                  >
                                    {str}
                                  </TextHighlighter>
                                );
                              })}
                            />
                          ))
                        : '-';
                    return (
                      <Select.Option
                        key={image?.digest}
                        value={getImageFullName(image)}
                        filterValue={[
                          version,
                          tagAlias,
                          image?.architecture,
                          ...extraFilterValues,
                        ].join('\t')}
                      >
                        <Flex direction="row" justify="between">
                          <Flex direction="row">
                            <TextHighlighter keyword={versionSearch}>
                              {version}
                            </TextHighlighter>
                            <Divider type="vertical" />
                            <TextHighlighter keyword={versionSearch}>
                              {tagAlias}
                            </TextHighlighter>
                            <Divider type="vertical" />
                            <TextHighlighter keyword={versionSearch}>
                              {image?.architecture}
                            </TextHighlighter>
                          </Flex>
                          <Flex
                            direction="row"
                            // set specific class name to handle flex wrap using css
                            className={
                              isDarkMode ? 'tag-wrap-dark' : 'tag-wrap-light'
                            }
                            style={{
                              marginLeft: token.marginXS,
                              flexShrink: 1,
                            }}
                          >
                            {requirementTags}
                          </Flex>
                        </Flex>
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
