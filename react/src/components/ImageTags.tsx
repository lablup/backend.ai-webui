import { useBackendAIImageMetaData } from '../hooks';
import DoubleTag, { DoubleTagObjectValue } from './DoubleTag';
import Flex from './Flex';
import { Tag, TagProps } from 'antd';
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
  tag: string;
  labels: { key: string; value: string }[];
  wrapper?: (constraint: unknown) => React.ReactNode;
}
export const ConstraintTags: React.FC<ConstraintTagsProps> = ({
  tag,
  labels,
  wrapper,
  ...props
}) => {
  labels = labels || [];
  const [, { getConstraints }] = useBackendAIImageMetaData();
  const constraints = getConstraints(tag, labels);
  return (
    <Flex direction="row" align="start">
      {constraints[0] ? (
        <Tag color="blue" {...props}>
          {wrapper ? wrapper(constraints[0]) : constraints[0]}
        </Tag>
      ) : null}
      {constraints[1] ? (
        <DoubleTag
          color="cyan"
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
          wrapper={wrapper}
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
