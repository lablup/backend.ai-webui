import { ImageNodeSimpleTagFragment$key } from '../__generated__/ImageNodeSimpleTagFragment.graphql';
import { preserveDotStartCase } from '../helper';
import {
  useBackendAIImageMetaData,
  useSuspendedBackendaiClient,
} from '../hooks';
import CopyableCodeText from './CopyableCodeText';
import ImageMetaIcon from './ImageMetaIcon';
import { Divider, Tag, Typography, theme } from 'antd';
import { BAIDoubleTag, BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

interface ImageNodeSimpleTagProps {
  imageFrgmt: ImageNodeSimpleTagFragment$key | null;
  withoutTag?: boolean;
  copyable?: boolean;
}

const ImageNodeSimpleTag: React.FC<ImageNodeSimpleTagProps> = ({
  imageFrgmt,
  withoutTag = false,
  copyable = true,
}) => {
  const [, { tagAlias }] = useBackendAIImageMetaData();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const image = useFragment(
    graphql`
      fragment ImageNodeSimpleTagFragment on ImageNode {
        base_image_name @since(version: "24.12.0")
        version @since(version: "24.12.0")
        architecture
        name
        tags @since(version: "24.12.0") {
          key
          value
        }
        labels {
          key @required(action: NONE)
          value
        }
        registry
        namespace @since(version: "24.12.0")
        tag
      }
    `,
    imageFrgmt,
  );

  if (!image) return null;

  const fullName = `${image.registry}/${image.namespace}:${image.tag}@${image.architecture}`;
  const legacyFullImageString = `${image.registry}/${image.name}:${image.tag}@${image.architecture}`;
  const isSupportBaseImageName = baiClient.supports('base-image-name');

  return isSupportBaseImageName ? (
    <BAIFlex direction="row" gap={'xs'} wrap="wrap">
      <ImageMetaIcon image={fullName} />
      <Typography.Text>{tagAlias(image.base_image_name || '')}</Typography.Text>
      <Divider
        type="vertical"
        style={{
          marginInline: 0,
        }}
      />
      <Typography.Text>{image.version}</Typography.Text>
      <Divider
        type="vertical"
        style={{
          marginInline: 0,
        }}
      />
      <Typography.Text>{image.architecture}</Typography.Text>
      {withoutTag ? null : (
        <>
          <Divider
            type="vertical"
            style={{
              marginInline: 0,
            }}
          />
          {_.map(image.tags, (tag, index) => {
            if (!tag) return null;
            const isCustomized = tag.key && _.includes(tag.key, 'customized_');
            const tagValue =
              (isCustomized
                ? _.find(image?.labels, {
                    key: 'ai.backend.customized-image.name',
                  })?.value
                : tag?.value) || '';
            const aliasedTag = tag?.key
              ? tagAlias(tag.key + tagValue)
              : undefined;
            return tag?.key &&
              _.isEqual(
                aliasedTag,
                preserveDotStartCase(tag.key + tagValue),
              ) ? (
              <BAIDoubleTag
                key={`${tag.key}-${index}`}
                values={[
                  {
                    label: tagAlias(tag.key),
                    color: isCustomized ? 'cyan' : undefined,
                  },
                  {
                    label: tagValue,
                    color: isCustomized ? 'cyan' : undefined,
                  },
                ]}
              />
            ) : (
              <Tag
                key={`${tag.key}-${index}`}
                color={isCustomized ? 'cyan' : undefined}
              >
                {aliasedTag}
              </Tag>
            );
          })}
        </>
      )}
      {copyable && (
        <Typography.Text
          style={{ color: token.colorLink }}
          copyable={{
            text: fullName,
          }}
        />
      )}
    </BAIFlex>
  ) : (
    <BAIFlex direction="row" gap={'xs'}>
      <ImageMetaIcon image={legacyFullImageString || null} />
      <CopyableCodeText>{legacyFullImageString}</CopyableCodeText>
    </BAIFlex>
  );
};

export default ImageNodeSimpleTag;
