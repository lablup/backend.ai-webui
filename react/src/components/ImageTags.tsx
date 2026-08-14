/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ImageTagsUNSAFELazySessionImageTagQuery } from '../__generated__/ImageTagsUNSAFELazySessionImageTagQuery.graphql';
import { preserveDotStartCase } from '../helper';
import { useBackendAIImageMetaData } from '../hooks';
import { theme } from '../theme-shim';
import ImageMetaIcon from './ImageMetaIcon';
import TextHighlighter from './TextHighlighter';
import { Badge } from '@astryxdesign/core/Badge';
import {
  BAIDoubleTag,
  BAIFlex,
  DoubleTagObjectValue,
  badgeVariantForTagColor,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * The antd-shaped slice of `TagProps` these components actually read, restated
 * locally (MAPPING §6): a type-only antd import still holds the module — and
 * everything downstream of it — inside the antd import graph (P15). Grepped,
 * not guessed: no call site of `ImageTags` / `SessionKernelTags` passes any
 * `TagProps` key other than `color`.
 */
interface ImageTagColorProps {
  /** antd `Tag` colour, routed through `badgeVariantForTagColor`. */
  color?: string;
}

interface ImageAliasNameAndBaseVersionTagsProps extends Omit<
  DoubleTagObjectValue,
  'label'
> {
  image: string | null;
}
const ImageAliasNameAndBaseVersionTags: React.FC<
  ImageAliasNameAndBaseVersionTagsProps
> = ({ image, ...props }) => {
  image = image || '';
  const [, { getImageAliasName, getBaseVersion, tagAlias }] =
    useBackendAIImageMetaData();
  return (
    <BAIDoubleTag
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

interface BaseImageTagsProps extends ImageTagColorProps {
  image: string | null;
}
// Frontier note (ticket 19): the public prop surfaces keep their antd shape
// (`TagProps`, `color?: string`) for unmigrated consumers; internally every
// tag renders as an Astryx Badge through the repo-global Tag lookup
// (ticket 13 policy — unknown runtime strings drop to neutral). Extra
// TagProps beyond `color` have no Badge destination and are ignored.
const BaseImageTags: React.FC<BaseImageTagsProps> = ({ image, ...props }) => {
  image = image || '';
  const [, { getBaseImage, tagAlias }] = useBackendAIImageMetaData();
  return _.isEmpty(tagAlias(getBaseImage(image))) ? null : (
    <Badge
      variant={badgeVariantForTagColor(props.color ?? 'green')}
      label={tagAlias(getBaseImage(image))}
    />
  );
};

interface ArchitectureTagsProps extends ImageTagColorProps {
  image: string | null;
}
const ArchitectureTags: React.FC<ArchitectureTagsProps> = ({
  image,
  ...props
}) => {
  image = image || '';
  const [, { getArchitecture, tagAlias }] = useBackendAIImageMetaData();
  return _.isEmpty(tagAlias(getArchitecture(image))) ? null : (
    <Badge
      variant={badgeVariantForTagColor(props.color ?? 'green')}
      label={getArchitecture(image)}
    />
  );
};

const SessionKernelTags: React.FC<{
  image: string | null;
  border?: boolean;
}> = React.memo(function SessionKernelTags({ image }) {
  image = image || '';
  return (
    <BAIFlex gap="xs" wrap="wrap">
      <ImageAliasNameAndBaseVersionTags image={image} />
      <BaseImageTags image={image} />
      <ArchitectureTags image={image} />
    </BAIFlex>
  );
});

interface ImageTagsProps extends ImageTagColorProps {
  tag: string;
  labels: Array<{ key: string; value: string }>;
  highlightKeyword?: string;
}

// One rule for "how does a parsed image tag display" — the tag row (below)
// and the version select's trigger text (FR-3544) both read these facts.
export const imageTagFacts = (
  tags: Array<{ key: string; value: string }>,
  tagAlias: (tag: string) => string,
) =>
  _.map(tags, (tag) => {
    const aliasedTag = tagAlias(tag.key + tag.value);
    const isDouble = _.isEqual(
      aliasedTag,
      preserveDotStartCase(tag.key + tag.value),
    );
    return {
      ...tag,
      isCustomized: tag.key === 'Customized',
      aliasedTag,
      isDouble,
      keyAlias: isDouble ? tagAlias(tag.key) : undefined,
    };
  });

export const ImageTags: React.FC<ImageTagsProps> = ({
  tag,
  labels,
  highlightKeyword,
  ...props
}) => {
  labels = labels || [];
  const [, { getTags, tagAlias }] = useBackendAIImageMetaData();
  return (
    <React.Fragment {...props}>
      {_.map(imageTagFacts(getTags(tag, labels), tagAlias), (fact, index) =>
        fact.isDouble ? (
          <BAIDoubleTag
            key={fact.key}
            highlightKeyword={highlightKeyword}
            values={[
              {
                label: fact.keyAlias ?? '',
                color: fact.isCustomized ? 'cyan' : 'blue',
              },
              {
                label: fact.value,
                color: fact.isCustomized ? 'cyan' : 'blue',
              },
            ]}
          />
        ) : (
          <Badge
            key={fact.key}
            variant={badgeVariantForTagColor(
              fact.isCustomized ? 'cyan' : 'blue',
            )}
            label={
              <TextHighlighter keyword={highlightKeyword} key={index}>
                {fact.aliasedTag}
              </TextHighlighter>
            }
          />
        ),
      )}
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
    <BAIFlex gap={['xs', 0]} wrap="wrap">
      <ImageMetaIcon
        image={imageFullName}
        style={{ marginRight: token.marginXS }}
      />
      <SessionKernelTags image={imageFullName} />
    </BAIFlex>
  ) : null;
};
