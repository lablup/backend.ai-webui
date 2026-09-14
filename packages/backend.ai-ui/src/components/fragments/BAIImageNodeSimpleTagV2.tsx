/**
 * The one way this project shows a container image (ADR 0004).
 *
 * It reads either an `ImageV2` fragment or the plain strings a caller already
 * has, so the v1 adapter, the session launcher form values and a bare
 * `compute_session.image` string all reach the same markup.
 */
import { BAIImageNodeSimpleTagV2Fragment$key } from '../../__generated__/BAIImageNodeSimpleTagV2Fragment.graphql';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIFlex from '../BAIFlex';
import BAIImageMetaDivider from '../BAIImageMetaDivider';
import BAIImageMetaIcon from '../BAIImageMetaIcon';
import BAIImageTagBadges, {
  imageNodeTagFacts,
  type BAIImageTagFact,
} from '../BAIImageTagBadges';
import BAIText from '../BAIText';
import BAITextHighlighter from '../BAITextHighlighter';
import { useBAIImageMetaData } from '../provider/BAIMetaDataProvider';
import { Text } from '@astryxdesign/core/Text';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

export type BAIImageNodeSimpleTagV2Variant = 'full' | 'compact' | 'path';

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
   * `full` shows the tag chips, `compact` drops them, `path` shows the raw
   * reference as monospace text instead of the decomposed row.
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

  return (
    <BAIFlex direction="row" wrap="wrap" gap="xxs" {...rest}>
      <BAIImageMetaIcon image={reference} />
      <Text>
        <BAITextHighlighter keyword={highlightKeyword}>
          {displayName}
        </BAITextHighlighter>
      </Text>
      <BAIImageMetaDivider />
      <Text>
        <BAITextHighlighter keyword={highlightKeyword}>
          {displayVersion}
        </BAITextHighlighter>
      </Text>
      <BAIImageMetaDivider />
      <Text>
        <BAITextHighlighter keyword={highlightKeyword}>
          {displayArchitecture}
        </BAITextHighlighter>
      </Text>
      {variant === 'full' && !_.isEmpty(tags) ? (
        <>
          <BAIImageMetaDivider />
          <BAIImageTagBadges
            facts={tags ?? []}
            highlightKeyword={highlightKeyword}
          />
        </>
      ) : null}
      {copyable ? <BAIText copyable={copyConfig} /> : null}
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
