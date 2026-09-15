/**
 * One-line identity of a v2 `ImageV2` (ADR 0004): the meta icon, the aliased
 * base name, the base version and the architecture, then the tag chips and a
 * copy control for the full reference. `BAIImageNodeSimpleTag` draws the same
 * row from the v1 schema; the two share only `imageNodeTagFacts`.
 */
import { BAIImageNodeSimpleTagV2Fragment$key } from '../../__generated__/BAIImageNodeSimpleTagV2Fragment.graphql';
import { badgeVariantForTagColor, preserveDotStartCase } from '../../helper';
import { theme } from '../../theme-shim';
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

/**
 * One rule for "how does a parsed image tag display" — every surface that
 * shows image tags reads these facts.
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

/**
 * Astryx's vertical `Divider` is `height: 100%`, which a centered flex row
 * collapses to 0; these are antd's metrics.
 */
const MetaDivider: React.FC = () => {
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
  const facts = imageNodeTagFacts(
    image.metadata?.tags,
    image.metadata?.labels,
    tagAlias,
  );

  return (
    <BAIFlex direction="row" wrap="wrap" gap="xxs">
      <BAIImageMetaIcon image={fullName} />
      <Text>{tagAlias(getBaseImage(fullName))}</Text>
      <MetaDivider />
      <Text>{getBaseVersion(fullName)}</Text>
      <MetaDivider />
      <Text>{architecture}</Text>
      {!withoutTag && !_.isEmpty(facts) ? (
        <>
          <MetaDivider />
          <BAIFlex direction="row" align="center" gap="xxs" wrap="wrap">
            {_.map(facts, (fact, index) =>
              fact.isDouble ? (
                <BAIDoubleTag
                  key={`${fact.key}-${index}`}
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
                  label={fact.aliasedTag}
                />
              ),
            )}
          </BAIFlex>
        </>
      ) : null}
      {copyable ? <BAIText copyable={{ text: fullName }} /> : null}
    </BAIFlex>
  );
};

export default BAIImageNodeSimpleTagV2;
