/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  ImageEnvironmentSelectFormItemsQuery,
  ImageEnvironmentSelectFormItemsQuery$data,
} from '../__generated__/ImageEnvironmentSelectFormItemsQuery.graphql';
import { Form } from '../form-engine';
import {
  compareImageVersions,
  getImageFullName,
  isPrivateImage,
  localeCompare,
  parseImageString,
  preserveDotStartCase,
  removeArchitectureFromImageFullName,
} from '../helper';
import {
  useBackendAIImageMetaData,
  useSuspendedBackendaiClient,
} from '../hooks';
import { useThemeMode } from '../hooks/useThemeMode';
import { theme } from '../theme-shim';
// @ts-ignore
import ImageMetaIcon from './ImageMetaIcon';
import { ImageTags } from './ImageTags';
import TextHighlighter from './TextHighlighter';
import { AstryxFormTextInput } from './astryxFormControls';
import { Badge } from '@astryxdesign/core/Badge';
import { Divider } from '@astryxdesign/core/Divider';
import {
  badgeVariantForTagColor,
  BAIDoubleTag,
  BAIFlex,
  BAISelect,
  // `BAISelect` was rebuilt on Astryx in wave 2 and still accepts antd's
  // children option API — it flattens the element tree by reading PROPS, never
  // the element type. So `Select.Option` / `Select.OptGroup` are replaced by
  // BUI's own render-null carriers, and the rich JSX option rows below (image
  // icon + highlighted name + metadata badges) stay exactly as they are.
  BAISelectOptionItem as SelectOption,
  BAISelectOptionGroup as SelectOptGroup,
  BAIText,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
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
  searchPrefill?: string;
}

const ImageEnvironmentSelectFormItems: React.FC<
  ImageEnvironmentSelectFormItemsProps
> = ({ filter, showPrivate, searchPrefill }) => {
  'use memo';
  const form = Form.useFormInstance<ImageEnvironmentFormInput>();
  const environments = Form.useWatch('environments', { form, preserve: true });
  const baiClient = useSuspendedBackendaiClient();
  const supportExtendedImageInfo = baiClient?.supports('extended-image-info');

  const [environmentSearch, setEnvironmentSearch] = useState(
    searchPrefill ?? '',
  );
  const [versionSearch, setVersionSearch] = useState('');
  const { t } = useTranslation();
  const [metadata, { getBaseVersion, getImageMeta, tagAlias }] =
    useBackendAIImageMetaData();
  const { token } = theme.useToken();
  const { isDarkMode } = useThemeMode();

  // antd `RefSelectProps` restated as the one method these two refs ever
  // called. `BAISelect` accepts `ref` and never attaches it (P26-8 — Astryx's
  // `Selector` exposes no imperative handle), so `.focus()` below has already
  // been a no-op since wave 2; the optional-chained call keeps that harmless
  // and the declarations keep compiling without antd.
  type SelectFocusHandle = { focus: () => void };
  const envSelectRef = useRef<SelectFocusHandle>(null);
  const versionSelectRef = useRef<SelectFocusHandle>(null);
  const [envSelectOpen, setEnvSelectOpen] = useState<boolean | undefined>(
    searchPrefill ? true : undefined,
  );

  const [prevSearchPrefill, setPrevSearchPrefill] = useState(searchPrefill);
  if (prevSearchPrefill !== searchPrefill) {
    setPrevSearchPrefill(searchPrefill);
    if (searchPrefill) {
      setEnvironmentSearch(searchPrefill);
      setEnvSelectOpen(true);
    } else {
      setEnvironmentSearch('');
      setEnvSelectOpen(undefined);
    }
  }

  useEffect(
    function focusEnvironmentSelectOnPrefill() {
      if (searchPrefill) {
        queueMicrotask(() => {
          envSelectRef.current?.focus();
        });
      }
    },
    [searchPrefill],
  );

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

  const imageGroups: ImageGroup[] = _.sortBy(
    _.map(
      _.groupBy(
        _.filter(images, (image) => {
          return (
            (showPrivate ? true : !isPrivateImage(image)) &&
            (filter ? filter(image) : true)
          );
        }),
        (image) => {
          // group by using `group` property of image info
          return (
            metadata?.imageInfo[getImageMeta(getImageFullName(image) || '').key]
              ?.group || 'Custom Environments'
          );
        },
      ),
      (images, groupName) => {
        return {
          groupName,
          groupSortKey: metadata?.groupSortKeyMap?.[groupName] || groupName,
          environmentGroups: _.sortBy(
            _.map(
              // sub group by using (environment) `name` property of image info
              _.groupBy(images, (image) => {
                return (
                  // metadata?.imageInfo[
                  //   getImageMeta(getImageFullName(image) || "").key
                  // ]?.name || image?.name
                  `${image?.registry}/${
                    supportExtendedImageInfo ? image?.namespace : image?.name
                  }`
                );
              }),
              (images, environmentName) => {
                const imageKey = environmentName.split('/')?.[2];
                const displayName =
                  (imageKey && metadata?.imageInfo[imageKey]?.name) ||
                  (_.last(environmentName.split('/')) as string);

                return {
                  environmentName,
                  displayName,
                  prefix: environmentName.split('/').slice(1, -1).join('/'),
                  images: images.sort(
                    (a, b) =>
                      compareImageVersions(
                        // latest version comes first
                        b?.tag?.split('-')?.[0] ?? '',
                        a?.tag?.split('-')?.[0] ?? '',
                      ) || localeCompare(a?.architecture, b?.architecture),
                  ),
                };
              },
            ),
            (item) => item.displayName,
          ),
        };
      },
    ),
    (item) => item.groupSortKey,
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
      ImageGroup['environmentGroups'][0] | undefined;
    let matchedImageByVersion: Image | undefined;
    const version = form.getFieldValue('environments')?.version;

    // 1. Try exact full name matching (registry/namespace:tag@arch)
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

    // 2. If no exact match, try partial matching
    if (!matchedEnvironmentByVersion && version) {
      const { registryAndNamespace, hasTag, hasArch } =
        parseImageString(version);

      if (!hasArch && hasTag) {
        // version is "registry/namespace:tag" format without architecture
        _.find(imageGroups, (group) => {
          matchedEnvironmentByVersion = _.find(
            group.environmentGroups,
            (environment) => {
              matchedImageByVersion = _.find(environment.images, (image) => {
                const fullName = getImageFullName(image);
                // Match by removing architecture from fullName
                return (
                  removeArchitectureFromImageFullName(fullName) === version
                );
              });
              return !!matchedImageByVersion;
            },
          );
          return !!matchedEnvironmentByVersion;
        });
      } else if (!hasTag) {
        // version is "registry/namespace" format (no tag, no architecture)
        // Select the latest version (first image in sorted array)
        _.find(imageGroups, (group) => {
          matchedEnvironmentByVersion = _.find(
            group.environmentGroups,
            (environment) => {
              if (environment.environmentName === registryAndNamespace) {
                // images are already sorted by version (latest first)
                matchedImageByVersion = environment.images[0];
                return true;
              }
              return false;
            },
          );
          return !!matchedEnvironmentByVersion;
        });
      }
    }

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

  // support search image by full name
  const { fullNameMatchedImage } = useMemo(() => {
    let fullNameMatchedImage: Image | undefined;
    let fullNameMatchedImageGroup:
      ImageGroup['environmentGroups'][0] | undefined;
    if (environmentSearch.length) {
      imageGroups
        .flatMap((group) => group.environmentGroups)
        .find((envGroup) => {
          fullNameMatchedImageGroup = envGroup;
          fullNameMatchedImage = _.find(envGroup.images, (image) => {
            return getImageFullName(image) === environmentSearch;
          });
          return !!fullNameMatchedImage;
        });
    }
    return {
      fullNameMatchedImage,
      fullNameMatchedImageGroup,
    };
  }, [environmentSearch, imageGroups]);

  return (
    <>
      <Form.Item
        className="image-environment-select-form-item"
        name={['environments', 'environment']}
        label={
          <BAIText
            copyable={{
              text: getImageFullName(
                form.getFieldValue(['environments', 'image']),
              ),
            }}
          >
            {t('session.launcher.Environments')} /{' '}
            {t('session.launcher.Version')}
          </BAIText>
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
        <BAISelect
          ref={envSelectRef}
          open={envSelectOpen}
          onOpenChange={(visible) => {
            // Return to uncontrolled mode once the user interacts
            if (!visible) {
              setEnvSelectOpen(undefined);
            }
          }}
          showSearch={{
            searchValue: environmentSearch,
            onSearch: setEnvironmentSearch,
            optionFilterProp: 'filterValue',
          }}
          popupMatchSelectWidth={false}
          defaultActiveFirstOption={true}
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
            <SelectOption
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
            </SelectOption>
          ) : (
            _.map(imageGroups, (group) => {
              return (
                <SelectOptGroup key={group.groupName} label={group.groupName}>
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
                      // antd `Tag color` → Astryx `Badge variant` through the
                      // repo-global lookup (ticket 13). Never a raw hue/hex.
                      environmentPrefixTag = (
                        <Badge
                          variant={badgeVariantForTagColor('purple')}
                          label={
                            <TextHighlighter keyword={environmentSearch}>
                              {environmentGroup.prefix}
                            </TextHighlighter>
                          }
                        />
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
                          // `label.color` is a runtime-arbitrary string from
                          // the image metadata JSON; the lookup normalises it
                          // and falls back to `neutral` for anything it does
                          // not recognise (ticket 13 §5).
                          return (
                            <Badge
                              key={label.tag}
                              variant={badgeVariantForTagColor(label.color)}
                              label={
                                <TextHighlighter
                                  keyword={environmentSearch}
                                  key={label.tag}
                                >
                                  {label.tag}
                                </TextHighlighter>
                              }
                            />
                          );
                        }
                        return null;
                      },
                    );
                    return (
                      <SelectOption
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
                            gap="xs"
                          >
                            {environmentPrefixTag}
                            {tagsFromMetaImageInfoLabel}
                          </BAIFlex>
                        </BAIFlex>
                      </SelectOption>
                    );
                  })}
                </SelectOptGroup>
              );
            })
          )}
        </BAISelect>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, cur) =>
          prev.environments?.environment !== cur.environments?.environment
        }
      >
        {({ getFieldValue }) => {
          let selectedEnvironmentGroup:
            ImageGroup['environmentGroups'][0] | undefined;
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
              <BAISelect
                ref={versionSelectRef}
                popupMatchSelectWidth={false}
                onChange={(value) => {
                  const selectedImage = _.find(images, (image) => {
                    return getImageFullName(image) === value;
                  });
                  form.setFieldValue(['environments', 'image'], selectedImage);
                }}
                showSearch={{
                  searchValue: versionSearch,
                  onSearch: setVersionSearch,
                  optionFilterProp: 'filterValue',
                }}
                popupRender={(menu) => (
                  <>
                    <BAIFlex
                      style={{
                        fontWeight: token.fontWeightStrong,
                        paddingLeft: token.paddingSM,
                      }}
                    >
                      {t('session.launcher.Version')}
                      <Divider orientation="vertical" />
                      {t('session.launcher.Architecture')}
                      <Divider orientation="vertical" />
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
                    const requirementTags = _.map(
                      _.filter(
                        requirements,
                        (requirement) => !requirement.startsWith('customized_'),
                      ),
                      (requirement, idx) => (
                        <BAIDoubleTag
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
                      ),
                    );
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
                          <BAIDoubleTag
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
                      <SelectOption
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
                            <Divider orientation="vertical" />
                            <TextHighlighter keyword={versionSearch}>
                              {image?.architecture}
                            </TextHighlighter>
                            <Divider orientation="vertical" />
                            <BAIFlex direction="row" align="start" gap="xs">
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
                                    <BAIDoubleTag
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
                                    <Badge
                                      key={tag.key}
                                      variant={badgeVariantForTagColor(
                                        isCustomized ? 'cyan' : 'blue',
                                      )}
                                      label={
                                        <TextHighlighter
                                          keyword={versionSearch}
                                        >
                                          {aliasedTag}
                                        </TextHighlighter>
                                      }
                                    />
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
                              <Divider orientation="vertical" />
                              <TextHighlighter keyword={versionSearch}>
                                {image?.architecture}
                              </TextHighlighter>
                              <Divider orientation="vertical" />
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
                      </SelectOption>
                    );
                  },
                )}
              </BAISelect>
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
        {/* antd `Input allowClear` → `AstryxFormTextInput hasClear`
            (MAPPING §3.6). The handler already read the value rather than the
            event, which the adapter now guarantees. */}
        <AstryxFormTextInput
          label={t('session.launcher.ManualImageName')}
          hasClear
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
        <AstryxFormTextInput label={t('session.launcher.Environments')} />
      </Form.Item>
    </>
  );
};

export default ImageEnvironmentSelectFormItems;
