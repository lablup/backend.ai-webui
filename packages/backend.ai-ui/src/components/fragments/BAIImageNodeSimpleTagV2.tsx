/**
 * The one way this project shows a container image (ADR 0004).
 *
 * It reads either an `ImageV2` fragment or the plain strings a caller already
 * has, so the v1 adapter, the session launcher form values and a bare
 * `compute_session.image` string all reach the same markup.
 */
import { BAIImageNodeSimpleTagV2Fragment$key } from '../../__generated__/BAIImageNodeSimpleTagV2Fragment.graphql';
import { badgeVariantForTagColor, preserveDotStartCase } from '../../helper';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { theme } from '../../theme-shim';
import BAIDoubleTag from '../BAIDoubleTag';
import BAIFlex from '../BAIFlex';
import BAIImageMetaIcon from '../BAIImageMetaIcon';
import BAIText from '../BAIText';
import BAITextHighlighter from '../BAITextHighlighter';
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

const TagBadges: React.FC<{
  facts: Array<BAIImageTagFact>;
  highlightKeyword?: string;
}> = ({ facts, highlightKeyword }) => {
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

export type BAIImageNodeSimpleTagV2Variant =
  'full' | 'compact' | 'path' | 'version' | 'tags';

export interface BAIImageNodeSimpleTagV2Props extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'children'
> {
  /** v2 `ImageV2` fragment. Omit it and pass `fullName` instead. */
  imageFrgmt?: BAIImageNodeSimpleTagV2Fragment$key | null;
  /**
   * `registry/namespace:tag@architecture`, for a caller with no `ImageV2`
   * node. Drives the icon, the copy value and every part not overridden.
   */
  fullName?: string | null;
  /**
   * `full` is the whole row; `compact` drops the tag chips; `path` shows the
   * raw reference as monospace text; `version` drops the icon and the name,
   * for a picker whose rows differ only by version; `tags` is the chips alone.
   */
  variant?: BAIImageNodeSimpleTagV2Variant;
  /** Shorthand for `variant="compact"`, kept for the table call sites. */
  withoutTag?: boolean;
  /** Base image name; empty or absent derives from the reference. */
  name?: string | null;
  /** Base version; empty or absent derives from the reference. */
  version?: string | null;
  /** Architecture; empty or absent derives from the reference. */
  architecture?: string | null;
  /** Tag chips, from {@link imageNodeTagFacts}. Read by `full` only. */
  tags?: Array<BAIImageTagFact>;
  copyable?: boolean;
  /** Tooltip on the copy control; defaults to BUI's generic "Copy". */
  copyLabel?: string;
  highlightKeyword?: string;
}

/**
 * The markup. Split from the fragment read only so that `useFragment` is not
 * called for a caller that has no image node — a table cell showing a path
 * would otherwise need a `RelayEnvironmentProvider` to render a string.
 */
const ImageRow: React.FC<
  Omit<BAIImageNodeSimpleTagV2Props, 'imageFrgmt' | 'withoutTag'> & {
    variant: BAIImageNodeSimpleTagV2Variant;
  }
> = ({
  fullName,
  variant,
  name,
  version,
  architecture,
  tags,
  copyable = true,
  copyLabel,
  highlightKeyword,
  ...rest
}) => {
  'use memo';
  const [, { tagAlias, getBaseImage, getBaseVersion }] = useBAIImageMetaData();
  const { t } = useBAIi18n();
  const reference = fullName ?? '';

  // `tooltips` is a `[resting, copied]` tuple; a bare string leaves the copied
  // state with no tooltip at all.
  const copyConfig = copyable
    ? {
        text: reference,
        ...(copyLabel
          ? {
              tooltips: [copyLabel, t('general.button.Copied')] as [
                string,
                string,
              ],
            }
          : {}),
      }
    : undefined;

  if (variant === 'tags') {
    return <TagBadges facts={tags ?? []} highlightKeyword={highlightKeyword} />;
  }

  if (variant === 'path') {
    return (
      <BAIText
        monospace
        // The table cell is `white-space: nowrap; overflow: hidden`, so an
        // untruncated path is clipped rather than wrapped; one line plus the
        // truncation tooltip keeps the whole value reachable.
        ellipsis={{ tooltip: true }}
        copyable={copyConfig}
        {...rest}
      >
        <BAITextHighlighter keyword={highlightKeyword}>
          {reference}
        </BAITextHighlighter>
      </BAIText>
    );
  }

  // An override the server left empty must not blank the part out: the image
  // fields are nullable and the adapters pass them straight through.
  const displayName = _.isEmpty(name)
    ? tagAlias(getBaseImage(reference))
    : (name as string);
  const displayVersion = _.isEmpty(version)
    ? getBaseVersion(reference)
    : (version as string);
  const displayArchitecture = _.isEmpty(architecture)
    ? (_.nth(_.split(reference, '@'), 1) ?? '')
    : (architecture as string);

  // A version picker's rows differ only after the name, so it drops the icon
  // and the name rather than repeating them on every row.
  const showsIdentity = variant !== 'version';

  return (
    <BAIFlex direction="row" wrap="wrap" gap="xxs" {...rest}>
      {showsIdentity ? (
        <>
          <BAIImageMetaIcon image={reference} />
          <Text>
            <BAITextHighlighter keyword={highlightKeyword}>
              {displayName}
            </BAITextHighlighter>
          </Text>
          <MetaDivider />
        </>
      ) : null}
      <Text>
        <BAITextHighlighter keyword={highlightKeyword}>
          {displayVersion}
        </BAITextHighlighter>
      </Text>
      <MetaDivider />
      <Text>
        <BAITextHighlighter keyword={highlightKeyword}>
          {displayArchitecture}
        </BAITextHighlighter>
      </Text>
      {variant !== 'compact' && !_.isEmpty(tags) ? (
        <>
          <MetaDivider />
          <TagBadges facts={tags ?? []} highlightKeyword={highlightKeyword} />
        </>
      ) : null}
      {copyable && showsIdentity ? <BAIText copyable={copyConfig} /> : null}
    </BAIFlex>
  );
};

const FragmentImageRow: React.FC<
  BAIImageNodeSimpleTagV2Props & {
    imageFrgmt: BAIImageNodeSimpleTagV2Fragment$key;
    variant: BAIImageNodeSimpleTagV2Variant;
  }
> = ({ imageFrgmt, tags, architecture, ...rest }) => {
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
    imageFrgmt,
  );

  if (!image) return null;

  // `canonicalName` carries no architecture, so the copy control would emit a
  // shorter reference than the row displays.
  const nodeArchitecture = image.identity?.architecture;
  const canonicalName = image.identity?.canonicalName;

  return (
    <ImageRow
      {...rest}
      fullName={
        canonicalName && nodeArchitecture
          ? `${canonicalName}@${nodeArchitecture}`
          : canonicalName
      }
      architecture={architecture ?? nodeArchitecture}
      tags={
        tags ??
        imageNodeTagFacts(
          image.metadata?.tags,
          image.metadata?.labels,
          tagAlias,
        )
      }
    />
  );
};

const BAIImageNodeSimpleTagV2: React.FC<BAIImageNodeSimpleTagV2Props> = ({
  imageFrgmt,
  variant,
  withoutTag = false,
  ...rest
}) => {
  'use memo';
  const resolvedVariant = variant ?? (withoutTag ? 'compact' : 'full');
  return imageFrgmt ? (
    <FragmentImageRow
      {...rest}
      imageFrgmt={imageFrgmt}
      variant={resolvedVariant}
    />
  ) : (
    <ImageRow {...rest} variant={resolvedVariant} />
  );
};

export default BAIImageNodeSimpleTagV2;
