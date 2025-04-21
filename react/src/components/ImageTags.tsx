import { preserveDotStartCase } from '../helper';
import { useBackendAIImageMetaData } from '../hooks';
import DoubleTag, { DoubleTagObjectValue } from './DoubleTag';
import Flex from './Flex';
import TextHighlighter from './TextHighlighter';
import { Tag, TagProps } from 'antd';
import _ from 'lodash';
import React from 'react';

interface ImageAliasNameAndBaseVersionTagsProps
  extends Omit<DoubleTagObjectValue, 'label'> {
  image: string | null;
}
export const ImageAliasNameAndBaseVersionTags: React.FC<
  ImageAliasNameAndBaseVersionTagsProps
> = ({ image, ...props }) => {
  image = image || '';
  const [, { getImageAliasName, getBaseVersion, tagAlias }] =
    useBackendAIImageMetaData();
  return (
    <DoubleTag
      values={[
        {
          label: tagAlias(getImageAliasName(image)),
          color: 'blue',
        },
        {
          label: getBaseVersion(image),
          color: 'green',
        },
      ]}
      {...props}
    />
  );
};

interface BaseVersionTagsProps extends TagProps {
  image: string | null;
}
export const BaseVersionTags: React.FC<BaseVersionTagsProps> = ({
  image,
  ...props
}) => {
  image = image || '';
  const [, { getBaseVersion, tagAlias }] = useBackendAIImageMetaData();
  return _.isEmpty(tagAlias(getBaseVersion(image))) ? null : (
    <Tag color="green" {...props}>
      {tagAlias(getBaseVersion(image))}
    </Tag>
  );
};

interface BaseImageTagsProps extends TagProps {
  image: string | null;
}
export const BaseImageTags: React.FC<BaseImageTagsProps> = ({
  image,
  ...props
}) => {
  image = image || '';
  const [, { getBaseImage, tagAlias }] = useBackendAIImageMetaData();
  return _.isEmpty(tagAlias(getBaseImage(image))) ? null : (
    <Tag color="green" {...props}>
      {tagAlias(getBaseImage(image))}
    </Tag>
  );
};

interface ArchitectureTagsProps extends TagProps {
  image: string | null;
}
export const ArchitectureTags: React.FC<ArchitectureTagsProps> = ({
  image,
  ...props
}) => {
  image = image || '';
  const [, { getArchitecture, tagAlias }] = useBackendAIImageMetaData();
  return _.isEmpty(tagAlias(getArchitecture(image))) ? null : (
    <Tag color="green" {...props}>
      {getArchitecture(image)}
    </Tag>
  );
};

interface LangTagsProps extends TagProps {
  image: string | null;
}
export const LangTags: React.FC<LangTagsProps> = ({ image, ...props }) => {
  image = image || '';
  const [, { getImageLang, tagAlias }] = useBackendAIImageMetaData();
  return _.isEmpty(tagAlias(getImageLang(image))) ? null : (
    <Tag color="green" {...props}>
      {tagAlias(getImageLang(image))}
    </Tag>
  );
};

interface ConstraintTagsProps extends TagProps {
  tag: string;
  labels: { key: string; value: string }[];
  highlightKeyword?: string;
}
export const ConstraintTags: React.FC<ConstraintTagsProps> = ({
  tag,
  labels,
  highlightKeyword,
  ...props
}) => {
  labels = labels || [];
  const [, { getConstraints }] = useBackendAIImageMetaData();
  const constraints = getConstraints(tag, labels);
  return (
    <Flex direction="row" align="start">
      {!_.isEmpty(constraints?.[0]) ? (
        <Tag color="blue" {...props}>
          <TextHighlighter keyword={highlightKeyword}>
            {constraints[0]}
          </TextHighlighter>
        </Tag>
      ) : null}
      {!_.isEmpty(constraints?.[1]) ? (
        <DoubleTag
          color="cyan"
          highlightKeyword={highlightKeyword}
          values={[
            {
              label: 'Customized',
              color: 'cyan',
            },
            {
              label: constraints[1],
              color: 'cyan',
            },
          ]}
          {...props}
        />
      ) : null}
    </Flex>
  );
};

const SessionKernelTags: React.FC<{
  image: string | null;
  border?: boolean;
}> = ({ image }) => {
  image = image || '';
  return (
    <>
      <ImageAliasNameAndBaseVersionTags image={image} />
      <BaseImageTags image={image} />
      <ArchitectureTags image={image} />
    </>
  );
};

export default React.memo(SessionKernelTags);

interface ImageTagsProps extends TagProps {
  tag: string;
  labels: Array<{ key: string; value: string }>;
  highlightKeyword?: string;
}
export const ImageTags: React.FC<ImageTagsProps> = ({
  tag,
  labels,
  highlightKeyword,
  ...props
}) => {
  labels = labels || [];
  const [, { getTags, tagAlias }] = useBackendAIImageMetaData();
  const tags = getTags(tag, labels);
  return (
    <React.Fragment {...props}>
      {_.map(tags, (tag: { key: string; value: string }, index) => {
        const isCustomized = tag.key === 'Customized';
        const aliasedTag = tagAlias(tag.key + tag.value);
        return _.isEqual(
          aliasedTag,
          preserveDotStartCase(tag.key + tag.value),
        ) ? (
          <DoubleTag
            key={tag.key}
            highlightKeyword={highlightKeyword}
            values={[
              {
                label: tagAlias(tag.key),
                color: isCustomized ? 'cyan' : 'blue',
              },
              {
                label: tag.value,
                color: isCustomized ? 'cyan' : 'blue',
              },
            ]}
          />
        ) : (
          <Tag key={tag.key} color={isCustomized ? 'cyan' : 'blue'}>
            <TextHighlighter keyword={highlightKeyword} key={index}>
              {aliasedTag}
            </TextHighlighter>
          </Tag>
        );
      })}
    </React.Fragment>
  );
};
