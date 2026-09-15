/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ImageTagsUNSAFELazySessionImageTagQuery } from '../__generated__/ImageTagsUNSAFELazySessionImageTagQuery.graphql';
import { useBackendAIImageMetaData } from '../hooks';
import { theme } from '../theme-shim';
import TextHighlighter from './TextHighlighter';
import { Badge } from '@astryxdesign/core/Badge';
import { Divider } from '@astryxdesign/core/Divider';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIDoubleTag,
  BAIFlex,
  BAIImageMetaIcon,
  badgeVariantForTagColor,
  type BAIImageTagFact,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * Astryx's vertical `Divider` is `height: 100%`, which a centered flex row
 * collapses to 0; these are antd's metrics, shared by every host image row.
 */
export const ImageMetaDivider: React.FC = () => {
  'use memo';
  const { token } = theme.useToken();
  return (
    <Divider
      orientation="vertical"
      style={{
        alignSelf: 'center',
        height: '0.9em',
        marginInline: token.marginXXS,
      }}
    />
  );
};

interface ImageTagBadgesProps {
  facts: Array<BAIImageTagFact>;
  highlightKeyword?: string;
}
/** The chip row a host image surface draws from `imageNodeTagFacts`. */
export const ImageTagBadges: React.FC<ImageTagBadgesProps> = ({
  facts,
  highlightKeyword,
}) => {
  'use memo';
  return (
    <BAIFlex direction="row" align="center" gap="xxs" wrap="wrap">
      {_.map(facts, (fact, index) =>
        fact.isDouble ? (
          <BAIDoubleTag
            key={`${fact.key}-${index}`}
            highlightKeyword={highlightKeyword}
            values={[
              {
                label: fact.keyAlias ?? '',
                color: fact.isCustomized ? 'cyan' : 'blue',
              },
              {
                label: fact.value ?? '',
                color: fact.isCustomized ? 'cyan' : 'blue',
              },
            ]}
          />
        ) : (
          <Badge
            key={`${fact.key}-${index}`}
            variant={badgeVariantForTagColor(
              fact.isCustomized ? 'cyan' : 'blue',
            )}
            label={
              <TextHighlighter keyword={highlightKeyword}>
                {fact.aliasedTag}
              </TextHighlighter>
            }
          />
        ),
      )}
    </BAIFlex>
  );
};

interface UNSAFELazySessionImageTagProps {
  sessionId: string | null;
}

/**
 * The session detail's fallback when the session exposes no image node: the
 * image row from the `compute_session` image string alone, so without chips.
 */
export const UNSAFELazySessionImageTag: React.FC<
  UNSAFELazySessionImageTagProps
> = ({ sessionId }) => {
  'use memo';
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
  // After the session query: the metadata hook is a react-query suspense read
  // and must not be reached before Relay has suspended on the session.
  const [, { tagAlias, getBaseImage, getBaseVersion }] =
    useBackendAIImageMetaData();

  const imageFullName =
    compute_session?.image &&
    compute_session?.architecture &&
    compute_session.image + '@' + compute_session.architecture;

  return imageFullName ? (
    <BAIFlex direction="row" wrap="wrap" gap="xxs">
      <BAIImageMetaIcon image={imageFullName} />
      <Text>{tagAlias(getBaseImage(imageFullName))}</Text>
      <ImageMetaDivider />
      <Text>{getBaseVersion(imageFullName)}</Text>
      <ImageMetaDivider />
      <Text>{compute_session.architecture}</Text>
    </BAIFlex>
  ) : null;
};
