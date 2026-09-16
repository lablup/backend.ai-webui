/**
 * One-line identity of a v2 `ImageV2` (ADR 0004), drawn by the shared
 * `ImageNodeSimpleTag` row. `BAIImageNodeSimpleTag` reads the v1 schema into
 * the same row; both take their chips from `imageNodeTagFacts`.
 */
import { BAIImageNodeSimpleTagV2Fragment$key } from '../../__generated__/BAIImageNodeSimpleTagV2Fragment.graphql';
import { preserveDotStartCase } from '../../helper';
import { useBAIImageMetaData } from '../provider/BAIMetaDataProvider';
import ImageNodeSimpleTag, { type BAIImageTagFact } from './ImageNodeSimpleTag';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

export type { BAIImageTagFact };

type TagAlias = (tag: string) => string;
/** A tag as the v1 `ImageNode` and v2 `ImageV2` schemas expose it. */
type RawTag = { key?: string | null; value?: string | null } | null | undefined;
type KeyedTag = { key: string; value?: string | null };

/** A tag with no key has nothing to alias, so it is not a chip. */
const keyedTags = (tags: ReadonlyArray<RawTag> | null | undefined) =>
  _.filter(
    _.compact(tags ?? []),
    (tag): tag is KeyedTag => !_.isEmpty(tag.key),
  );

const toFact = (
  key: string,
  value: string | undefined,
  isCustomized: boolean,
  tagAlias: TagAlias,
): BAIImageTagFact => {
  // A tag's value is nullable on the v1 schema, and `key + undefined` would
  // alias `tensorflow` as `tensorflowundefined` and flip it to a double tag.
  const lookup = key + (value ?? '');
  const aliasedTag = tagAlias(lookup);
  const isDouble =
    _.isEqual(aliasedTag, preserveDotStartCase(lookup)) || isCustomized;
  return {
    key,
    value,
    isCustomized,
    aliasedTag,
    isDouble,
    keyAlias: isDouble ? tagAlias(key) : undefined,
  };
};

/** Display facts for an image node's own `tags`, read with its `labels`. */
export const imageNodeTagFacts = (
  tags: ReadonlyArray<RawTag> | null | undefined,
  labels: ReadonlyArray<RawTag> | null | undefined,
  tagAlias: TagAlias,
): Array<BAIImageTagFact> =>
  _.map(keyedTags(tags), (tag) => {
    const isCustomized = _.includes(tag.key, 'customized_');
    // A customized tag's value is a hash; the readable name is in the labels.
    const value = isCustomized
      ? _.find(keyedTags(labels), {
          key: 'ai.backend.customized-image.name',
        })?.value
      : tag.value;
    return toFact(tag.key, value ?? undefined, isCustomized, tagAlias);
  });

export interface BAIImageNodeSimpleTagV2Props {
  /** v2 `ImageV2` fragment. */
  imageFrgmt: BAIImageNodeSimpleTagV2Fragment$key | null;
  withoutTag?: boolean;
  copyable?: boolean;
}

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
    imageFrgmt,
  );

  if (!image) return null;

  // `canonicalName` carries no architecture, and the copy control emits this
  // string, so the suffix is appended when the nullable field is set.
  const canonicalName = image.identity?.canonicalName ?? '';
  const architecture = image.identity?.architecture;
  const fullName = architecture
    ? `${canonicalName}@${architecture}`
    : canonicalName;

  return (
    <ImageNodeSimpleTag
      fullName={fullName}
      name={tagAlias(getBaseImage(fullName))}
      version={getBaseVersion(fullName)}
      architecture={architecture}
      facts={imageNodeTagFacts(
        image.metadata?.tags,
        image.metadata?.labels,
        tagAlias,
      )}
      withoutTag={withoutTag}
      copyable={copyable}
    />
  );
};

export default BAIImageNodeSimpleTagV2;
