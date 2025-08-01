import { ImageTagsUNSAFELazySessionImageTagQuery } from '../__generated__/ImageTagsUNSAFELazySessionImageTagQuery.graphql';
import { preserveDotStartCase } from '../helper';
import { useBackendAIImageMetaData } from '../hooks';
import DoubleTag, { DoubleTagObjectValue } from './DoubleTag';
import Flex from './Flex';
import ImageMetaIcon from './ImageMetaIcon';
import TextHighlighter from './TextHighlighter';
import { Tag, TagProps, theme } from 'antd';
import _ from 'lodash';
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface ImageAliasNameAndBaseVersionTagsProps
  extends Omit<DoubleTagObjectValue, 'label'> {
  image: string | null;
}
const ImageAliasNameAndBaseVersionTags: React.FC<
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

interface BaseImageTagsProps extends TagProps {
  image: string | null;
}
const BaseImageTags: React.FC<BaseImageTagsProps> = ({ image, ...props }) => {
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
const ArchitectureTags: React.FC<ArchitectureTagsProps> = ({
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

const SessionKernelTags: React.FC<{
  image: string | null;
  border?: boolean;
}> = React.memo(function SessionKernelTags({ image }) {
  image = image || '';
  return (
    <>
      <ImageAliasNameAndBaseVersionTags image={image} />
      <BaseImageTags image={image} />
      <ArchitectureTags image={image} />
    </>
  );
});

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

interface UNSAFELazySessionImageTagProps {
  sessionId: string | null;
}
export const UNSAFELazySessionImageTag: React.FC<
  UNSAFELazySessionImageTagProps
> = ({ sessionId }) => {
  const { token } = theme.useToken();
  const { compute_session } =
    useLazyLoadQuery<ImageTagsUNSAFELazySessionImageTagQuery>(
      graphql`
        query ImageTagsUNSAFELazySessionImageTagQuery($uuid: UUID!) {
          compute_session(id: $uuid) {
            image
            mounts
            architecture
          }
        }
      `,
      {
        uuid: sessionId || '',
      },
      {
        fetchPolicy: sessionId ? 'store-or-network' : 'store-only',
      },
    );

  const imageFullName =
    compute_session?.image &&
    compute_session?.architecture &&
    compute_session.image + '@' + compute_session.architecture;

  return imageFullName ? (
    <Flex gap={['xs', 0]} wrap="wrap">
      <ImageMetaIcon
        image={imageFullName}
        style={{ marginRight: token.marginXS }}
      />
      <SessionKernelTags image={imageFullName} />
    </Flex>
  ) : null;
};
