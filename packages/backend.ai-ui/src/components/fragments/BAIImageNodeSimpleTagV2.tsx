import { BAIImageNodeSimpleTagV2Fragment$key } from '../../__generated__/BAIImageNodeSimpleTagV2Fragment.graphql';
import { badgeVariantForTagColor, preserveDotStartCase } from '../../helper';
import BAIDoubleTag from '../BAIDoubleTag';
import BAIFlex from '../BAIFlex';
import BAIImageMetaIcon from '../BAIImageMetaIcon';
import BAIText from '../BAIText';
import { useBAIImageMetaData } from '../provider/BAIMetaDataProvider';
import { Badge } from '@astryxdesign/core/Badge';
import { Divider } from '@astryxdesign/core/Divider';
import { Text } from '@astryxdesign/core/Text';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

export interface BAIImageNodeSimpleTagV2Props {
  /** v2 `ImageV2` fragment. */
  imageFrgmt: BAIImageNodeSimpleTagV2Fragment$key | null;
  withoutTag?: boolean;
  copyable?: boolean;
}

/**
 * v2 counterpart of the React app's `ImageNodeSimpleTag`. Renders the image
 * icon, base name, version and architecture in the same format as the v1
 * session list, resolving icons and tag aliases from the image metadata
 * provided via `BAIMetaDataProvider`.
 */
const BAIImageNodeSimpleTagV2: React.FC<BAIImageNodeSimpleTagV2Props> = ({
  imageFrgmt,
  withoutTag = false,
  copyable = true,
}) => {
  'use memo';
  const [, { tagAlias, getBaseImage, getBaseVersion }] = useBAIImageMetaData();
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

  const fullName = image.identity?.canonicalName ?? '';
  const architecture = image.identity?.architecture ?? '';

  return (
    <BAIFlex direction="row" gap={'xs'} wrap="wrap">
      <BAIImageMetaIcon image={fullName} />
      <Text>{tagAlias(getBaseImage(fullName))}</Text>
      <Divider orientation="vertical" style={{ marginInline: 0 }} />
      <Text>{getBaseVersion(fullName)}</Text>
      <Divider orientation="vertical" style={{ marginInline: 0 }} />
      <Text>{architecture}</Text>
      {withoutTag ? null : (
        <>
          <Divider orientation="vertical" style={{ marginInline: 0 }} />
          {_.map(image.metadata?.tags, (tag, index) => {
            if (!tag) return null;
            const isCustomized = tag.key && _.includes(tag.key, 'customized_');
            const tagValue =
              (isCustomized
                ? _.find(image?.metadata?.labels, {
                    key: 'ai.backend.customized-image.name',
                  })?.value
                : tag?.value) || '';
            const aliasedTag = tag?.key
              ? tagAlias(tag.key + tagValue)
              : undefined;
            return tag?.key &&
              _.isEqual(
                aliasedTag,
                preserveDotStartCase(tag.key + tagValue),
              ) ? (
              <BAIDoubleTag
                key={`${tag.key}-${index}`}
                values={[
                  {
                    label: tagAlias(tag.key),
                    color: isCustomized ? 'cyan' : undefined,
                  },
                  {
                    label: tagValue,
                    color: isCustomized ? 'cyan' : undefined,
                  },
                ]}
              />
            ) : (
              <Badge
                key={`${tag.key}-${index}`}
                variant={badgeVariantForTagColor(isCustomized ? 'cyan' : null)}
                label={aliasedTag}
              />
            );
          })}
        </>
      )}
      {copyable && (
        // PILOT-DECISION (to-astryx W2-D): the copy affordance loses its
        // `color: token.colorLink` tint. `BAIText`'s rebuilt copy control is a
        // ghost `IconButton` that takes its colour from the theme, and Astryx
        // `Text` has no arbitrary colour slot (P5) — the closed enum is
        // `primary|secondary|disabled|placeholder|accent|inherit` plus the
        // three status colours the theme adds. Defaults-first: the control now
        // looks like every other icon action in the app.
        <BAIText
          copyable={{
            text: fullName,
          }}
        />
      )}
    </BAIFlex>
  );
};

export default BAIImageNodeSimpleTagV2;
