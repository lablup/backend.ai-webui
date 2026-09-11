import { badgeVariantForTagColor, preserveDotStartCase } from '../helper';
import BAIDoubleTag from './BAIDoubleTag';
import BAIFlex from './BAIFlex';
import BAITextHighlighter from './BAITextHighlighter';
import { Badge } from '@astryxdesign/core/Badge';
import * as _ from 'lodash-es';
import React from 'react';

/**
 * One rule for "how does a parsed image tag display" — every surface that
 * shows image tags reads these facts (ADR 0004).
 */
export interface BAIImageTagFact {
  key: string;
  value?: string;
  isCustomized: boolean;
  aliasedTag: string;
  isDouble: boolean;
  keyAlias?: string;
}

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

/** Facts from `getTags`-parsed tags (servers without extended image info). */
export const imageTagFacts = (
  tags: ReadonlyArray<RawTag> | null | undefined,
  tagAlias: TagAlias,
): Array<BAIImageTagFact> =>
  _.map(keyedTags(tags), (tag) =>
    toFact(tag.key, tag.value ?? undefined, tag.key === 'Customized', tagAlias),
  );

/** Facts from an image node's own `tags` (extended image info). */
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

export interface BAIImageTagBadgesProps {
  facts: Array<BAIImageTagFact>;
  highlightKeyword?: string;
}

/** The badge row every image meta surface renders from {@link BAIImageTagFact}s. */
const BAIImageTagBadges: React.FC<BAIImageTagBadgesProps> = ({
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
              <BAITextHighlighter keyword={highlightKeyword}>
                {fact.aliasedTag}
              </BAITextHighlighter>
            }
          />
        ),
      )}
    </BAIFlex>
  );
};

export default BAIImageTagBadges;
