/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AliasedImageDoubleTagsFragment$key } from '../__generated__/AliasedImageDoubleTagsFragment.graphql';
import { preserveDotStartCase } from '../helper';
import { useBackendAIImageMetaData } from '../hooks';
import { Badge } from '@astryxdesign/core/Badge';
import {
  BAIDoubleTag,
  BAIFlex,
  DoubleTagObjectValue,
  badgeVariantForTagColor,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

interface AliasedImageDoubleTagsProps extends DoubleTagObjectValue {
  imageFrgmt?: AliasedImageDoubleTagsFragment$key | null;
  highlightKeyword?: string;
}

const AliasedImageDoubleTags: React.FC<AliasedImageDoubleTagsProps> = ({
  imageFrgmt,
  highlightKeyword,
  ...doubleTagProps
}) => {
  const images = useFragment(
    graphql`
      fragment AliasedImageDoubleTagsFragment on ImageNode {
        labels {
          key
          value
        }
        tags @since(version: "24.12.0") {
          key
          value
        }
      }
    `,
    imageFrgmt,
  );
  const [, { tagAlias }] = useBackendAIImageMetaData();

  return (
    <BAIFlex direction="row" align="start" gap={'xxs'}>
      {_.map(images?.tags, (tag: { key: string; value: string }) => {
        const isCustomized = _.includes(tag.key, 'customized_');
        // If the tag is customized, we need to find the corresponding label instead of using the tag value (hash).
        const tagValue = isCustomized
          ? _.find(images?.labels, {
              key: 'ai.backend.customized-image.name',
            })?.value
          : tag.value;
        const aliasedTag = tagAlias(tag.key + tagValue);
        return _.isEqual(
          aliasedTag,
          preserveDotStartCase(tag.key + tagValue),
        ) || isCustomized ? (
          <BAIDoubleTag
            key={tag.key}
            highlightKeyword={highlightKeyword}
            values={[
              {
                label: tagAlias(tag.key),
                color: isCustomized ? 'cyan' : doubleTagProps.color,
              },
              {
                label: tagValue ?? '',
                color: isCustomized ? 'cyan' : doubleTagProps.color,
              },
            ]}
            {...doubleTagProps}
          />
        ) : (
          // antd Tag -> Astryx Badge through the repo-global Tag lookup
          // (ticket 13 policy; unknown runtime strings drop to neutral).
          <Badge
            key={tag.key}
            variant={badgeVariantForTagColor(
              isCustomized ? 'cyan' : doubleTagProps.color,
            )}
            label={aliasedTag}
          />
        );
      })}
    </BAIFlex>
  );
};

export default AliasedImageDoubleTags;
