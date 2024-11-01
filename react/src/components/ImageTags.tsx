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
      {tagAlias(getArchitecture(image))}
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
          values={[
            {
              label: (
                <TextHighlighter keyword={highlightKeyword}>
                  Customized
                </TextHighlighter>
              ),
              color: 'cyan',
            },
            {
              label: (
                <TextHighlighter keyword={highlightKeyword}>
                  {constraints[1]}
                </TextHighlighter>
              ),
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
  style?: React.CSSProperties;
  border?: boolean;
}> = ({ image, style = {} }, bordered) => {
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
