import {
  useBackendaiImageMetaData,
  useSuspendedBackendaiClient,
} from '../hooks';
import DoubleTag from './DoubleTag';
import Flex from './Flex';
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
  };
};

interface ImageEnvironmentSelectFormItemsProps {
  filter?: (image: Image) => boolean;
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
const ImageEnvironmentSelectFormItems: React.FC<
  ImageEnvironmentSelectFormItemsProps
> = ({ filter }) => {
  // TODO: fix below without useSuspendedBackendaiClient
  // Before fetching on relay environment, BAI client should be ready
  useSuspendedBackendaiClient();
  const form = Form.useFormInstance<ImageEnvironmentFormInput>();
  const currentEnvironmentsFormData = Form.useWatch('environments', form);

  const [environmentSearch, setEnvironmentSearch] = useState('');
  const [versionSearch, setVersionSearch] = useState('');
  const { t } = useTranslation();
  const [metadata, { getImageMeta }] = useBackendaiImageMetaData();
  const { token } = theme.useToken();

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

  console.log('nextEnvironmentName form', form.getFieldValue('environments'));
  console.log('nextEnvironmentName form', currentEnvironmentsFormData);
  // If not initial value, select first value
  // auto select when relative field is changed
  useEffect(() => {
    // if not initial value, select first value
    const nextEnvironmentName =
      form.getFieldValue('environments')?.environment ||
      imageGroups[0]?.environmentGroups[0]?.environmentName;

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

    // if current version does'nt exist in next environment group, select a version of the first image of next environment group
    if (
      !_.find(
        nextEnvironmentGroup?.images,
        (image) =>
          form.getFieldValue('environments')?.version ===
          getImageFullName(image),
      )
    ) {
      const nextNewImage = nextEnvironmentGroup?.images[0];
      if (nextNewImage) {
        form.setFieldsValue({
          environments: {
            environment: nextEnvironmentName,
            version: getImageFullName(nextNewImage),
            image: nextNewImage,
          },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.getFieldValue('environments')?.environment]);

  const imageGroups: ImageGroup[] = useMemo(
    () =>
      _.chain(images)
        .filter(filter ? filter : () => true)
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
              .map((images, environmentName) => ({
                environmentName,
                displayName:
                  metadata?.imageInfo[environmentName.split('/')?.[1]]?.name ||
                  environmentName,
                prefix: environmentName.split('/')?.[0],
                images: images.sort((a, b) =>
                  compareVersions(
                    // latest version comes first
                    b?.tag?.split('-')?.[0] ?? '',
                    a?.tag?.split('-')?.[0] ?? '',
                  ),
                ),
              }))
              .sortBy((item) => item.displayName)
              .value(),
          };
        })
        .sortBy((item) => item.groupName)
        .value(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [images, metadata, filter],
  );

  return (
    <>
      <Form.Item
        name={['environments', 'environment']}
        label={`${t('session.launcher.Environments')} / ${t(
          'session.launcher.Version',
        )}`}
        rules={[{ required: true }]}
        style={{ marginBottom: 10 }}
      >
        <Select
          showSearch
          // autoClearSearchValue
          labelInValue={false}
          searchValue={environmentSearch}
          onSearch={setEnvironmentSearch}
          defaultActiveFirstOption={true}
          optionLabelProp="label"
          optionFilterProp="filterValue"
          onSelect={() => {
            // versionSelectRef.current?.focus();
          }}
        >
          {_.map(imageGroups, (group) => {
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
                      <Tag color="purple">{environmentGroup.prefix}</Tag>
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
                          <Tag color={label.color}>
                            <TextHighlighter keyword={environmentSearch}>
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
                      label={
                        <Flex
                          direction="row"
                          align="center"
                          gap="xs"
                          style={{ display: 'inline-flex' }}
                        >
                          <ImageMetaIcon
                            image={getImageFullName(firstImage) || ''}
                            style={{
                              width: 15,
                              height: 15,
                            }}
                          />
                          {environmentGroup.displayName}
                        </Flex>
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
                        {environmentPrefixTag}
                        {tagsFromMetaImageInfoLabel}
                      </Flex>
                    </Select.Option>
                  );
                })}
              </Select.OptGroup>
            );
          })}
        </Select>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, cur) =>
          prev.environments?.environments !== cur.environments?.environment
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
              name={['environments', 'version']}
              rules={[{ required: true }]}
            >
              <Select
                ref={versionSelectRef}
                onChange={() => {}}
                showSearch
                searchValue={versionSearch}
                onSearch={setVersionSearch}
                // autoClearSearchValue
                optionFilterProp="filterValue"
                optionLabelProp="label"
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
                      requirements.length > 0 ? (
                        <Flex
                          direction="row"
                          wrap="wrap"
                          style={{
                            flex: 1,
                          }}
                          gap={'xxs'}
                        >
                          {_.map(requirements, (requirement, idx) => (
                            <DoubleTag
                              key={idx}
                              values={
                                metadata?.tagAlias[requirement]
                                  ?.split(':')
                                  .map((str) => {
                                    extraFilterValues.push(str);
                                    return (
                                      <TextHighlighter keyword={versionSearch}>
                                        {str}
                                      </TextHighlighter>
                                    );
                                  }) || requirements
                              }
                            />
                          ))}
                        </Flex>
                      ) : (
                        '-'
                      );
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
                        label={[
                          version,
                          tagAlias,
                          image?.architecture,
                          requirements.length > 0
                            ? requirements.join(', ')
                            : '-',
                        ].join(' | ')}
                      >
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
                          <Divider type="vertical" />
                          {requirementTags}
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
      <Form.Item noStyle hidden name={['environments', 'image']}>
        <Input />
      </Form.Item>
    </>
  );
};

export default ImageEnvironmentSelectFormItems;
