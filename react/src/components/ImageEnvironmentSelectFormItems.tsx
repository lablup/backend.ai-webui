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
  removeArchitectureFromImageFullName,
} from '../helper';
import { useBackendAIImageMetaData } from '../hooks';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useThemeMode } from '../hooks/useThemeMode';
import { useEffectiveLoginConfig } from '../hooks/useWebUIConfig';
import { ImageMetaDivider, ImageTagTokens } from './ImageTags';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
} from '@lablup/ui-common/DropdownMenu';
import type {
  SelectorOptionData,
  SelectorOptionType,
} from '@lablup/ui-common/Selector';
import { Token } from '@lablup/ui-common/Token';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAITextHighlighter,
  tokenColorForTagColor,
  BAIFlex,
  BAIImageMetaIcon,
  imageNodeTagFacts,
  BAISelect,
  BAIText,
  BAITextInput,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { ArrowUpDown } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
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
    dedicatedAccelerators: string[];
  }[];
};

// Quick-pick options repeat an environment listed below, so they need their own value.
// `~` cannot start a registry host, so no real `registry/namespace` carries this prefix.
const DEDICATED_OPTION_VALUE_PREFIX = '~accelerator-dedicated:';

// An image's explicit `supported_accelerators`; empty for a generic image
// (`*`, or `''` from pre-BA-2358 managers).
const getDedicatedAccelerators = (image: Image | undefined): string[] => {
  if (_.includes(image?.supported_accelerators, '*')) return [];
  return _.uniq(
    _.filter(
      image?.supported_accelerators,
      (accelerator): accelerator is string => !!accelerator,
    ),
  );
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
  const loginConfig = useEffectiveLoginConfig();

  const [environmentSearch, setEnvironmentSearch] = useState(
    searchPrefill ?? '',
  );
  const { t } = useTranslation();
  const [metadata, { getImageMeta, tagAlias }] = useBackendAIImageMetaData();
  const { token } = useTheme();
  const { isDarkMode } = useThemeMode();
  const [showDedicatedFirstSetting, setShowDedicatedFirst] =
    useBAISettingUserState('show_accelerator_dedicated_images_first');
  // On until the user explicitly turns it off.
  const showDedicatedFirst = showDedicatedFirstSetting ?? true;

  const [prevSearchPrefill, setPrevSearchPrefill] = useState(searchPrefill);
  if (prevSearchPrefill !== searchPrefill) {
    setPrevSearchPrefill(searchPrefill);
    setEnvironmentSearch(searchPrefill ?? '');
  }

  const imageEnvironmentSelectFormItemsVariables =
    loginConfig.showNonInstalledImages ? {} : { installed: true };
  // TODO(needs-backend): #10300 `ImageV2Filter` has no installed-on-an-agent filter and ImageV2 has
  // no registry, tag, version or installed field, so the launcher stays on `images`.
  const { images } = useLazyLoadQuery<ImageEnvironmentSelectFormItemsQuery>(
    graphql`
      query ImageEnvironmentSelectFormItemsQuery($installed: Boolean) {
        images(is_installed: $installed) {
          id
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
          namespace
          base_image_name
          tags {
            key
            value
          }
          version
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
                  `${image?.registry}/${image?.namespace}`
                );
              }),
              (images, environmentName) => {
                const imageKey = environmentName.split('/')?.[2];
                const displayName =
                  (imageKey && metadata?.imageInfo[imageKey]?.name) ||
                  (_.last(environmentName.split('/')) as string);
                const sortedImages = images.sort(
                  (a, b) =>
                    compareImageVersions(
                      // latest version comes first
                      b?.tag?.split('-')?.[0] ?? '',
                      a?.tag?.split('-')?.[0] ?? '',
                    ) || localeCompare(a?.architecture, b?.architecture),
                );

                return {
                  environmentName,
                  displayName,
                  prefix: environmentName.split('/').slice(1, -1).join('/'),
                  // `_.sortBy` is stable, so the version order holds within each half.
                  images: showDedicatedFirst
                    ? _.sortBy(sortedImages, (image) =>
                        _.isEmpty(getDedicatedAccelerators(image)) ? 1 : 0,
                      )
                    : sortedImages,
                  dedicatedAccelerators: _.uniq(
                    _.flatMap(images, (image) =>
                      getDedicatedAccelerators(image),
                    ),
                  ),
                };
              },
            ),
            showDedicatedFirst
              ? [
                  (item) => (_.isEmpty(item.dedicatedAccelerators) ? 1 : 0),
                  (item) => item.displayName,
                ]
              : (item) => item.displayName,
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
        loginConfig.allow_manual_image_name_for_session &&
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
    } else if (loginConfig.allow_manual_image_name_for_session) {
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

  const renderAcceleratorTokens = (
    accelerators: string[],
    highlightKeyword?: string,
  ) =>
    _.map(accelerators, (accelerator) => (
      <Token
        key={`accelerator-${accelerator}`}
        label={accelerator}
        isLabelHidden
        endContent={
          <BAITextHighlighter keyword={highlightKeyword}>
            {accelerator}
          </BAITextHighlighter>
        }
      />
    ));

  const dedicatedEnvironmentGroups = _.sortBy(
    _.filter(
      _.flatMap(imageGroups, (group) => group.environmentGroups),
      (environmentGroup) => !_.isEmpty(environmentGroup.dedicatedAccelerators),
    ),
    (environmentGroup) => environmentGroup.displayName,
  );

  // The rich rows by option value; the select draws them in the list and on the trigger.
  const optionRows = new Map<string, React.ReactNode>();
  const renderOptionRow = (option: SelectorOptionData) =>
    optionRows.get(option.value) ?? option.label ?? option.value;

  const toEnvironmentOption = (
    environmentGroup: ImageGroup['environmentGroups'][0],
    optionValue: string,
  ): SelectorOptionData => {
    const firstImage = environmentGroup.images[0];
    const currentMetaImageInfo =
      metadata?.imageInfo[environmentGroup.environmentName.split('/')?.[2]];

    const extraFilterValues: string[] = [];
    let environmentPrefixTag = null;
    if (
      environmentGroup.prefix &&
      !['lablup', 'cloud', 'stable'].includes(environmentGroup.prefix)
    ) {
      extraFilterValues.push(environmentGroup.prefix);
      environmentPrefixTag = (
        <Token
          color="purple"
          label={environmentGroup.prefix}
          isLabelHidden
          endContent={
            <BAITextHighlighter keyword={environmentSearch}>
              {environmentGroup.prefix}
            </BAITextHighlighter>
          }
        />
      );
    }

    const tagsFromMetaImageInfoLabel = _.map(
      currentMetaImageInfo?.label,
      (label) => {
        if (_.isUndefined(label.category) && label.tag && label.color) {
          extraFilterValues.push(label.tag);
          // `label.color` is a runtime string from the image
          // metadata JSON; unknown values fall back to default.
          return (
            <Token
              key={label.tag}
              color={tokenColorForTagColor(label.color)}
              label={label.tag}
              isLabelHidden
              endContent={
                <BAITextHighlighter keyword={environmentSearch}>
                  {label.tag}
                </BAITextHighlighter>
              }
            />
          );
        }
        return null;
      },
    );
    extraFilterValues.push(...environmentGroup.dedicatedAccelerators);
    optionRows.set(
      optionValue,
      <BAIFlex direction="row" justify="between">
        <BAIFlex direction="row" align="center" gap="xs">
          <BAIImageMetaIcon
            image={getImageFullName(firstImage) || ''}
            style={{
              width: 15,
              height: 15,
            }}
          />
          <BAITextHighlighter keyword={environmentSearch}>
            {environmentGroup.displayName}
          </BAITextHighlighter>
        </BAIFlex>
        <BAIFlex
          direction="row"
          // set specific class name to handle flex wrap using css
          className={isDarkMode ? 'tag-wrap-dark' : 'tag-wrap-light'}
          // style={{ flex: 1 }}
          style={{
            marginLeft: token('--spacing-2'),
            flexShrink: 1,
          }}
          gap="xs"
        >
          {environmentPrefixTag}
          {tagsFromMetaImageInfoLabel}
          {renderAcceleratorTokens(
            environmentGroup.dedicatedAccelerators,
            environmentSearch,
          )}
        </BAIFlex>
      </BAIFlex>,
    );
    return {
      value: optionValue,
      // The prefix/meta token texts live in Token props, so
      // the accessible/search label restates them (FR-3544).
      label: _.compact([
        environmentGroup.displayName,
        ...extraFilterValues,
      ]).join(' | '),
    };
  };

  if (fullNameMatchedImage) {
    optionRows.set(
      fullNameMatchedImage.namespace ?? '',
      <BAIFlex
        direction="row"
        align="center"
        gap="xs"
        style={{ display: 'inline-flex' }}
      >
        <BAIImageMetaIcon
          image={getImageFullName(fullNameMatchedImage) || ''}
          style={{
            width: 15,
            height: 15,
          }}
        />
        {getImageFullName(fullNameMatchedImage)}
      </BAIFlex>,
    );
  }
  const environmentOptions: SelectorOptionType[] = fullNameMatchedImage
    ? [
        {
          value: fullNameMatchedImage.namespace ?? '',
          label:
            getImageFullName(fullNameMatchedImage) ||
            (fullNameMatchedImage.namespace ?? ''),
        },
      ]
    : [
        ...(showDedicatedFirst && !_.isEmpty(dedicatedEnvironmentGroups)
          ? [
              {
                type: 'section' as const,
                title: t('session.launcher.AcceleratorDedicatedImages'),
                options: _.map(dedicatedEnvironmentGroups, (environmentGroup) =>
                  toEnvironmentOption(
                    environmentGroup,
                    DEDICATED_OPTION_VALUE_PREFIX +
                      environmentGroup.environmentName,
                  ),
                ),
              },
            ]
          : []),
        ..._.map(imageGroups, (group) => ({
          type: 'section' as const,
          title: group.groupName,
          options: _.map(group.environmentGroups, (environmentGroup) =>
            toEnvironmentOption(
              environmentGroup,
              environmentGroup.environmentName,
            ),
          ),
        })),
      ];

  return (
    <>
      {/* The environment and version selects are one field. */}
      <BAIFlex direction="column" align="stretch" gap="xs">
        <Form.Item
          className="image-environment-select-form-item"
          // The wrapper's gap is the pair's spacing.
          style={{ marginBottom: 0 }}
          name={['environments', 'environment']}
          label={
            <BAIFlex direction="row" align="center" gap="xxs">
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
              <DropdownMenu
                button={{
                  label: t('session.launcher.ImageFilter'),
                  icon: (
                    <ArrowUpDown
                      size="1em"
                      style={
                        showDedicatedFirst
                          ? { color: 'var(--color-accent)' }
                          : undefined
                      }
                    />
                  ),
                  isIconOnly: true,
                  variant: 'ghost',
                  size: 'sm',
                }}
                hasChevron={false}
                alignment="start"
              >
                <DropdownMenuCheckboxItem
                  label={t(
                    'session.launcher.ShowAcceleratorDedicatedImagesFirst',
                  )}
                  value={showDedicatedFirst}
                  onChange={setShowDedicatedFirst}
                />
              </DropdownMenu>
            </BAIFlex>
          }
          rules={[
            {
              required: _.isEmpty(environments?.manual),
              message: t('general.ValueRequired', {
                name: t('session.launcher.Environments'),
              }),
            },
          ]}
        >
          <BAISelect
            options={environmentOptions}
            renderOption={renderOptionRow}
            renderValue={renderOptionRow}
            onChange={(selectedValue) => {
              const value =
                _.isString(selectedValue) &&
                selectedValue.startsWith(DEDICATED_OPTION_VALUE_PREFIX)
                  ? selectedValue.slice(DEDICATED_OPTION_VALUE_PREFIX.length)
                  : selectedValue;
              if (fullNameMatchedImage) {
                form.setFieldsValue({
                  environments: {
                    environment: fullNameMatchedImage?.namespace || '',
                    version: getImageFullName(fullNameMatchedImage),
                    image: fullNameMatchedImage,
                  },
                });
              } else {
                // NOTE: when user set environment only then set the version to the first item
                //
                // FR-3499 — write the OPTION's own key back, not the image's
                // bare namespace. Every option in this select is keyed by
                // `environmentGroup.environmentName`, i.e. `registry/namespace`,
                // and the rest of the component agrees: the version select finds
                // `selectedEnvironmentGroup` by `environmentName`, and the
                // auto-select effect stores `nextEnvironment.environmentName`.
                // Storing the registry-less `namespace` produced a value no
                // option matched, so Astryx `Selector` fell back to its
                // placeholder — the environment trigger read "Select…" and the
                // version select, keyed off the same field, emptied with it.
                // Choosing a DIFFERENT environment masked this, because the
                // resulting `version` change re-ran the effect and it rewrote the
                // field correctly; choosing the environment that was already
                // selected left the broken value in place, so on a cluster with a
                // single environment no image could be selected at all.
                const selectedEnvironmentGroup = _.find(
                  _.flatMap(imageGroups, (group) => group.environmentGroups),
                  (envGroup) => envGroup.environmentName === value,
                );
                const firstInListImage: Image | undefined =
                  selectedEnvironmentGroup?.images[0];
                form.setFieldsValue({
                  environments: {
                    environment:
                      selectedEnvironmentGroup?.environmentName ?? '',
                    version: getImageFullName(firstInListImage),
                    image: firstInListImage,
                  },
                });
              }
            }}
            disabled={
              loginConfig.allow_manual_image_name_for_session &&
              !_.isEmpty(environments?.manual)
            }
          />
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
            const versionRows = new Map<string, React.ReactNode>();
            const renderVersionRow = (option: SelectorOptionData) =>
              versionRows.get(option.value) ?? option.label ?? option.value;
            const versionOptions: SelectorOptionData[] = _.map(
              _.uniqBy(selectedEnvironmentGroup?.images, 'id'),
              (image) => {
                const imageFullName = getImageFullName(image);
                // Compute each tag's display facts once, then derive both the
                // trigger text and the option row from them.
                const tagFacts = imageNodeTagFacts(
                  image?.tags as Array<{ key: string; value: string }>,
                  image?.labels as Array<{ key: string; value: string }>,
                  tagAlias,
                );
                const dedicatedAccelerators = getDedicatedAccelerators(image);
                const selectedLabel = _.compact([
                  image?.version,
                  image?.architecture,
                  ..._.map(tagFacts, (fact) =>
                    fact.isDouble
                      ? _.trim(`${fact.keyAlias ?? ''} ${fact.value ?? ''}`)
                      : fact.aliasedTag,
                  ),
                  ...dedicatedAccelerators,
                ]).join(' | ');
                versionRows.set(
                  imageFullName ?? '',
                  <BAIFlex direction="row" wrap="wrap" gap="xxs">
                    {image?.version}
                    <ImageMetaDivider />
                    {image?.architecture}
                    {!_.isEmpty(tagFacts) ? (
                      <>
                        <ImageMetaDivider />
                        <ImageTagTokens facts={tagFacts} />
                      </>
                    ) : null}
                    {!_.isEmpty(dedicatedAccelerators) ? (
                      <>
                        <ImageMetaDivider />
                        {renderAcceleratorTokens(dedicatedAccelerators)}
                      </>
                    ) : null}
                  </BAIFlex>,
                );
                return { value: imageFullName ?? '', label: selectedLabel };
              },
            );
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
                  options={versionOptions}
                  renderOption={renderVersionRow}
                  renderValue={renderVersionRow}
                  onChange={(value) => {
                    const selectedImage = _.find(images, (image) => {
                      return getImageFullName(image) === value;
                    });
                    form.setFieldValue(
                      ['environments', 'image'],
                      selectedImage,
                    );
                  }}
                  disabled={
                    loginConfig.allow_manual_image_name_for_session &&
                    !_.isEmpty(environments?.manual)
                  }
                />
              </Form.Item>
            );
          }}
        </Form.Item>
      </BAIFlex>
      <Form.Item
        label={t('session.launcher.ManualImageName')}
        name={['environments', 'manual']}
        style={{
          display: loginConfig.allow_manual_image_name_for_session
            ? 'block'
            : 'none',
        }}
      >
        <BAITextInput
          aria-label={t('session.launcher.ManualImageName')}
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
        <BAITextInput aria-label={t('session.launcher.Environments')} />
      </Form.Item>
    </>
  );
};

export default ImageEnvironmentSelectFormItems;
