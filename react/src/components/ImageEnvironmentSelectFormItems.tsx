/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ImageEnvironmentSelectFormItemsQuery } from '../__generated__/ImageEnvironmentSelectFormItemsQuery.graphql';
import {
  buildImageGroups,
  DEDICATED_OPTION_VALUE_PREFIX,
  findFullNameMatchedImage,
  getDedicatedAccelerators,
  type ImageGroup,
  type LauncherImage,
} from '../features/session-launcher/domain/image';
import { compose, type Loadable } from '../features/session-launcher/model';
import { environmentSlice } from '../features/session-launcher/slices/environment';
import { useFormBoundSlice } from '../features/session-launcher/view/useFormBoundSlice';
import { Form } from '../form-engine';
import { getImageFullName } from '../helper';
import {
  useBackendAIImageMetaData,
  useSuspendedBackendaiClient,
} from '../hooks';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useThemeMode } from '../hooks/useThemeMode';
import { ImageMetaDivider, ImageTagTokens } from './ImageTags';
import { AstryxFormTextInput } from './astryxFormControls';
import { Divider } from '@lablup/ui-common/Divider';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
} from '@lablup/ui-common/DropdownMenu';
import { Token } from '@lablup/ui-common/Token';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAIDoubleToken,
  BAITextHighlighter,
  tokenColorForTagColor,
  BAIFlex,
  BAIImageMetaIcon,
  imageNodeTagFacts,
  BAISelect,
  // BAISelect still accepts antd's children option API via BUI's render-null
  // carriers; the rich JSX option rows below survive through `renderOption`.
  BAISelectOptionItem as SelectOption,
  BAISelectOptionGroup as SelectOptGroup,
  BAIText,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { ArrowUpDown } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type Image = LauncherImage;

const environmentModel = compose([environmentSlice]);

const ready = <T,>(value: T): Loadable<T> => ({ status: 'ready', value });

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

  const [environmentSearch, setEnvironmentSearch] = useState(
    searchPrefill ?? '',
  );
  const [versionSearch, setVersionSearch] = useState('');
  const { t } = useTranslation();
  const [metadata, { getImageMeta, tagAlias }] = useBackendAIImageMetaData();
  const { token } = useTheme();
  const { isDarkMode } = useThemeMode();
  const [showDedicatedFirstSetting, setShowDedicatedFirst] =
    useBAISettingUserState('show_accelerator_dedicated_images_first');
  // On until the user explicitly turns it off.
  const showDedicatedFirst = showDedicatedFirstSetting ?? true;

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

  const imageGroups: ImageGroup[] = buildImageGroups({
    images,
    showPrivate,
    filter,
    dedicatedFirst: showDedicatedFirst,
    groupNameOf: (image) =>
      metadata?.imageInfo[getImageMeta(getImageFullName(image) || '').key]
        ?.group,
    groupSortKeyOf: (groupName) => metadata?.groupSortKeyMap?.[groupName],
    displayNameOf: (imageKey) => metadata?.imageInfo[imageKey]?.name,
  });

  // support search image by full name
  const fullNameMatchedImage = findFullNameMatchedImage(
    imageGroups,
    environmentSearch,
  );

  // E-01..E-07 live in `environmentSlice` (ADR 0013); this component only dispatches.
  const { dispatch } = useFormBoundSlice(form, environmentModel, {
    imageGroups: ready(imageGroups),
    images: ready(images),
    fullNameMatchedImage: ready(fullNameMatchedImage),
    watchedEnvironment: ready(environments?.environment),
    watchedVersion: ready(environments?.version),
    watchedManual: ready(environments?.manual),
    allowManualImageName: ready(
      baiClient._config.allow_manual_image_name_for_session,
    ),
  });

  const renderAcceleratorTokens = (
    accelerators: string[],
    highlightKeyword: string,
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

  const renderEnvironmentOption = (
    environmentGroup: ImageGroup['environmentGroups'][0],
    optionValue: string,
  ) => {
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
    return (
      <SelectOption
        key={optionValue}
        value={optionValue}
        // The prefix/meta token texts live in Token props, so
        // the accessible/search label restates them (FR-3544).
        label={_.compact([
          environmentGroup.displayName,
          ...extraFilterValues,
        ]).join(' | ')}
        filterValue={
          environmentGroup.displayName + '\t' + extraFilterValues.join('\t')
        }
      >
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
        </BAIFlex>
      </SelectOption>
    );
  };

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
            ref={envSelectRef}
            optionLabelProp="children"
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
            onChange={(selectedValue) => {
              dispatch({ type: 'environmentSelected', payload: selectedValue });
            }}
            disabled={
              baiClient._config.allow_manual_image_name_for_session &&
              !_.isEmpty(environments?.manual)
            }
          >
            {fullNameMatchedImage ? (
              <SelectOption
                value={fullNameMatchedImage?.namespace}
                filterValue={getImageFullName(fullNameMatchedImage)}
              >
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
                </BAIFlex>
              </SelectOption>
            ) : (
              [
                showDedicatedFirst && !_.isEmpty(dedicatedEnvironmentGroups) ? (
                  <SelectOptGroup
                    key={DEDICATED_OPTION_VALUE_PREFIX}
                    label={t('session.launcher.AcceleratorDedicatedImages')}
                  >
                    {_.map(dedicatedEnvironmentGroups, (environmentGroup) =>
                      renderEnvironmentOption(
                        environmentGroup,
                        DEDICATED_OPTION_VALUE_PREFIX +
                          environmentGroup.environmentName,
                      ),
                    )}
                  </SelectOptGroup>
                ) : null,
                ..._.map(imageGroups, (group) => (
                  <SelectOptGroup key={group.groupName} label={group.groupName}>
                    {_.map(group.environmentGroups, (environmentGroup) =>
                      renderEnvironmentOption(
                        environmentGroup,
                        environmentGroup.environmentName,
                      ),
                    )}
                  </SelectOptGroup>
                )),
              ]
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
                  optionLabelProp="children"
                  popupMatchSelectWidth={false}
                  onChange={(value) => {
                    dispatch({ type: 'versionSelected', payload: value });
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
                          fontWeight: token('--font-weight-semibold'),
                          paddingLeft: token('--spacing-3'),
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
                      const imageFullName = getImageFullName(image);
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
                          (requirement) =>
                            !requirement.startsWith('customized_'),
                        ),
                        (requirement, idx) => (
                          <BAIDoubleToken
                            key={idx}
                            highlightKeyword={versionSearch}
                            values={_.split(
                              metadata?.tagAlias[requirement] || requirement,
                              ':',
                            ).map((str) => {
                              extraFilterValues.push(str);
                              return { label: str, color: 'default' as const };
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
                            imageLabels[customizedImageNameLabelIdx]?.value ||
                            '';
                          extraFilterValues.push('Customized');
                          extraFilterValues.push(tag);
                          requirementTags.push(
                            <BAIDoubleToken
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
                      // The closed trigger renders a plain string (BAISelect
                      // FR-3544): compute each tag's display facts once, then
                      // derive both the trigger text and the option row from them.
                      const tagFacts = imageNodeTagFacts(
                        image?.tags as Array<{ key: string; value: string }>,
                        image?.labels as Array<{ key: string; value: string }>,
                        tagAlias,
                      );
                      const dedicatedAccelerators =
                        getDedicatedAccelerators(image);
                      const selectedLabel = _.compact([
                        image?.version,
                        image?.architecture,
                        ..._.map(tagFacts, (fact) =>
                          fact.isDouble
                            ? _.trim(
                                `${fact.keyAlias ?? ''} ${fact.value ?? ''}`,
                              )
                            : fact.aliasedTag,
                        ),
                        ...dedicatedAccelerators,
                      ]).join(' | ');
                      return (
                        <SelectOption
                          key={image?.id}
                          value={imageFullName}
                          label={selectedLabel}
                          filterValue={[
                            version,
                            metadataTagAlias,
                            image?.architecture,
                            ...extraFilterValues,
                            ...dedicatedAccelerators,
                          ].join('\t')}
                        >
                          <BAIFlex direction="row" wrap="wrap" gap="xxs">
                            <BAITextHighlighter keyword={versionSearch}>
                              {image?.version}
                            </BAITextHighlighter>
                            <ImageMetaDivider />
                            <BAITextHighlighter keyword={versionSearch}>
                              {image?.architecture}
                            </BAITextHighlighter>
                            {!_.isEmpty(tagFacts) ? (
                              <>
                                <ImageMetaDivider />
                                <ImageTagTokens
                                  facts={tagFacts}
                                  highlightKeyword={versionSearch}
                                />
                              </>
                            ) : null}
                            {!_.isEmpty(dedicatedAccelerators) ? (
                              <>
                                <ImageMetaDivider />
                                {renderAcceleratorTokens(
                                  dedicatedAccelerators,
                                  versionSearch,
                                )}
                              </>
                            ) : null}
                          </BAIFlex>
                        </SelectOption>
                      );
                    },
                  )}
                </BAISelect>
              </Form.Item>
            );
          }}
        </Form.Item>
      </BAIFlex>
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
            dispatch({ type: 'manualImageEdited', payload: value });
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
