import { AliasedImageDoubleTagsFragment$key } from '../__generated__/AliasedImageDoubleTagsFragment.graphql';
import { preserveDotStartCase } from '../helper';
import { useBackendAIImageMetaData } from '../hooks';
import DoubleTag, { DoubleTagObjectValue } from './DoubleTag';
import Flex from './Flex';
import { Tag } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React from 'react';
import { useFragment } from 'react-relay';

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
    <Flex direction="row" align="start" gap={'xxs'}>
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
          <DoubleTag
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
          <Tag
            key={tag.key}
            color={isCustomized ? 'cyan' : doubleTagProps.color}
          >
            {aliasedTag}
          </Tag>
        );
      })}
    </Flex>
  );
};

export default AliasedImageDoubleTags;
