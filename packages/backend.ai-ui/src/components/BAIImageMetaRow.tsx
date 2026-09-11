import { useBAIi18n } from '../hooks/useBAIi18n';
import BAIFlex from './BAIFlex';
import BAIImageMetaDivider from './BAIImageMetaDivider';
import BAIImageMetaIcon from './BAIImageMetaIcon';
import BAIImageTagBadges, { type BAIImageTagFact } from './BAIImageTagBadges';
import BAIText from './BAIText';
import BAITextHighlighter from './BAITextHighlighter';
import { useBAIImageMetaData } from './provider';
import { Text } from '@astryxdesign/core/Text';
import * as _ from 'lodash-es';
import React from 'react';

export type BAIImageMetaRowVariant = 'full' | 'compact' | 'path';

export interface BAIImageMetaRowProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'children'
> {
  /**
   * `registry/namespace:tag@architecture`. Drives the icon, the copy value and
   * every part the caller does not override.
   */
  fullName: string | null | undefined;
  /**
   * `full` shows the tag chips, `compact` drops them, `path` shows the raw
   * reference as monospace text instead of the decomposed row.
   */
  variant?: BAIImageMetaRowVariant;
  /**
   * Aliased base image name. Empty or absent falls back to the one derived
   * from `fullName`, so a server that does not send the field renders the
   * derived name rather than a hole.
   */
  name?: string | null;
  /** Base version; empty or absent derives from `fullName`. */
  version?: string | null;
  /** Architecture; empty or absent derives from `fullName`. */
  architecture?: string | null;
  /** Tag chips for the `full` variant. */
  tags?: Array<BAIImageTagFact>;
  copyable?: boolean;
  /** Tooltip on the copy control; defaults to BUI's generic "Copy". */
  copyLabel?: string;
  highlightKeyword?: string;
}

/**
 * The one way this project shows a container image (ADR 0004): the meta icon,
 * the aliased base name, the base version and the architecture, separated by
 * {@link BAIImageMetaDivider}, followed by the tag chips and a copy control
 * for the full reference.
 *
 * It reads plain strings rather than a Relay fragment, so the v1 `ImageNode`
 * surfaces, the v2 `ImageV2` surfaces and the session launcher's form values
 * all render through it. Icon and aliasing come from `useBAIImageMetaData`, so
 * it must sit under `BAIMetaDataProvider`.
 */
const BAIImageMetaRow: React.FC<BAIImageMetaRowProps> = ({
  fullName,
  variant = 'full',
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

  // An override the server left empty must not blank the part out: several
  // image fields are `@since(version: "24.12.0")` and arrive null on an older
  // manager, and the adapters pass them straight through.
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

export default BAIImageMetaRow;
