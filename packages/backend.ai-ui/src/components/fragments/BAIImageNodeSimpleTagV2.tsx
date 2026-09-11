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

  // `canonicalName` carries no architecture, so the copy control would emit a
  // shorter reference than the row displays. Every other v2 call site joins
  // the two the same way.
  const architecture = image.identity?.architecture;
  const canonicalName = image.identity?.canonicalName;

  return (
    <BAIImageMetaRow
      fullName={
        canonicalName && architecture
          ? `${canonicalName}@${architecture}`
          : canonicalName
      }
      variant={withoutTag ? 'compact' : 'full'}
      architecture={architecture}
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
