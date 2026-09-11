import { BAIImageNodeSimpleTagV2Fragment$key } from '../../__generated__/BAIImageNodeSimpleTagV2Fragment.graphql';
import BAIImageMetaRow from '../BAIImageMetaRow';
import { imageNodeTagFacts } from '../BAIImageTagBadges';
import { useBAIImageMetaData } from '../provider/BAIMetaDataProvider';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

export interface BAIImageNodeSimpleTagV2Props {
  /** v2 `ImageV2` fragment. */
  imageFrgmt: BAIImageNodeSimpleTagV2Fragment$key | null;
  withoutTag?: boolean;
  copyable?: boolean;
}

/**
 * `ImageV2` adapter over {@link BAIImageMetaRow}: it reads the fragment and
 * hands the row its plain facts. The v1 counterpart is the React app's
 * `ImageNodeSimpleTag`, and both render the identical row (ADR 0004).
 */
const BAIImageNodeSimpleTagV2: React.FC<BAIImageNodeSimpleTagV2Props> = ({
  imageFrgmt,
  withoutTag = false,
  copyable = true,
}) => {
  'use memo';
  const [, { tagAlias }] = useBAIImageMetaData();
  const image = useFragment(
    graphql`
      fragment BAIImageNodeSimpleTagV2Fragment on ImageV2 {
        identity {
          canonicalName
          namespace
          architecture
        }
        metadata {
          tags {
            key
            value
          }
          labels {
            key
            value
          }
        }
      }
    `,
    imageFrgmt ?? null,
  );

  if (!image) return null;

  return (
    <BAIImageMetaRow
      fullName={image.identity?.canonicalName}
      variant={withoutTag ? 'compact' : 'full'}
      architecture={image.identity?.architecture}
      tags={imageNodeTagFacts(
        image.metadata?.tags,
        image.metadata?.labels,
        tagAlias,
      )}
      copyable={copyable}
    />
  );
};

export default BAIImageNodeSimpleTagV2;
