/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ImageNodeSimpleTagFragment$key } from '../__generated__/ImageNodeSimpleTagFragment.graphql';
import { preserveDotStartCase } from '../helper';
import { useBackendAIImageMetaData } from '../hooks';
import ImageMetaIcon from './ImageMetaIcon';
import { Badge } from '@astryxdesign/core/Badge';
import { Divider } from '@astryxdesign/core/Divider';
import { useTheme } from '@astryxdesign/core/theme';
import {
  badgeVariantForTagColor,
  BAIDoubleTag,
  BAIFlex,
  BAIText,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
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
  const { token } = useTheme();
  const image = useFragment(
    graphql`
      fragment ImageNodeSimpleTagFragment on ImageNode {
        base_image_name
        version
        architecture
        name
        tags {
          key
          value
        }
        labels {
          key @required(action: NONE)
          value
        }
        registry
        namespace
        tag
      }
    `,
    imageFrgmt,
  );

  if (!image) return null;

  const fullName = `${image.registry}/${image.namespace}:${image.tag}@${image.architecture}`;

  return (
    <BAIFlex direction="row" gap={'xs'} wrap="wrap">
      <ImageMetaIcon image={fullName} />
      <BAIText>{tagAlias(image.base_image_name || '')}</BAIText>
      <Divider
        orientation="vertical"
        style={{
          marginInline: 0,
        }}
      />
      <BAIText>{image.version}</BAIText>
      <Divider
        orientation="vertical"
        style={{
          marginInline: 0,
        }}
      />
      <BAIText>{image.architecture}</BAIText>
      {withoutTag ? null : (
        <>
          <Divider
            orientation="vertical"
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
              <Badge
                key={`${tag.key}-${index}`}
                variant={badgeVariantForTagColor(
                  isCustomized ? 'cyan' : undefined,
                )}
                label={aliasedTag}
              />
            );
          })}
        </>
      )}
      {copyable && (
        <BAIText
          style={{ color: token('--bai-color-link') }}
          copyable={{
            text: fullName,
          }}
        />
      )}
    </BAIFlex>
  );
};

export default ImageNodeSimpleTag;
