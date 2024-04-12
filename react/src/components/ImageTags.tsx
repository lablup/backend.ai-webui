import { useBackendAIImageMetaData } from '../hooks';
import DoubleTag, { DoubleTagObjectValue } from './DoubleTag';
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
  return (
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
  return (
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
  return (
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
  return (
    <Tag color="green" {...props}>
      {tagAlias(getImageLang(image))}
    </Tag>
  );
};

interface ConstraintTagsProps extends TagProps {
  image: string | null;
  labels: { key: string; value: string }[];
}
export const ConstraintTags: React.FC<ConstraintTagsProps> = ({
  image,
  labels,
  ...props
}) => {
  image = image || '';
  labels = labels || [];
  const [, { getFilteredRequirementsTags, getCustomTag, tagAlias }] =
    useBackendAIImageMetaData();
  return (
    <>
      {_.map(getFilteredRequirementsTags(image), (tag, index) => (
        <Tag key={index} color="blue" {...props}>
          {tagAlias(tag || '')}
        </Tag>
      ))}
      <DoubleTag
        color="cyan"
        values={[
          {
            label: 'Customized',
            color: 'cyan',
          },
          {
            label: getCustomTag(labels),
            color: 'cyan',
          },
        ]}
        {...props}
      />
    </>
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
