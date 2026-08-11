/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIText` on Astryx (to-astryx phase 3, ticket A — BUI display primitives).

 FRONTIER COMPONENT. 276 call sites in 62 files pass antd `Typography.Text`
 props (`type`, `strong`, `ellipsis={{rows,tooltip}}`, `copyable`, `code`,
 `keyboard`, `mark`, `delete`, `monospace`, …). Per the frontier rule the
 PUBLIC prop surface stays antd-SHAPED so none of those files change; only the
 internals move to Astryx. The antd *import* is gone though — the prop types
 are declared locally here (`BAITextEllipsisConfig`, `BAITextCopyConfig`)
 rather than re-exported from `antd/es/typography/*`, so this module and every
 file downstream of it drop out of the antd import graph (P15).

 Mapping (MAPPING §3.4):

   type="secondary"                -> Text color="secondary"
   type="danger|warning|success"   -> Text color="danger|warning|success",
                                      THEME-DEFINED custom colors — see
                                      `STATUS_TEXT_COLORS` in
                                      react/src/astryx-theme/backendAiTheme.ts
                                      and ../astryx-theme-augmentations.d.ts.
                                      (MAPPING calls this "a design decision,
                                      12 times"; it is made ONCE, in the theme.)
   strong                          -> weight="semibold"
   delete                          -> hasStrikethrough
   ellipsis / ellipsis={{rows}}    -> maxLines (+ hasTruncateTooltip)
   code                            -> <Code>
   keyboard                        -> <Kbd> when the content is a shortcut
                                      string, else the Kbd-ish box below
   copyable                        -> self-built (Astryx has no `copyable`);
                                      IconButton + navigator.clipboard, the
                                      same shape the pilot's BAICopyableText
                                      established.

 PILOT-DECISIONs recorded in `.scratch/astryx-migration/issues/p3-a-bui-primitives.md`.
*/
import { useBAIi18n } from '../hooks/useBAIi18n';
import './BAIText.css';
import { Code } from '@astryxdesign/core/Code';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Link } from '@astryxdesign/core/Link';
import { Text, useTruncation, type TextProps } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { CheckIcon, CopyIcon } from 'lucide-react';
import React, { useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

/** antd `Typography.Text` semantic types, kept verbatim for the call sites. */
export type BAITextType = 'secondary' | 'success' | 'warning' | 'danger';

/**
 * antd `EllipsisConfig`, restated locally (the antd type import is what kept
 * this module — and 592 files downstream — inside the antd import graph).
 * `suffix`/`symbol` are omitted: no call site passes them, and Astryx's
 * truncation renders neither.
 */
export interface BAITextEllipsisConfig {
  rows?: number;
  expandable?: boolean;
  /**
   * `true` -> tooltip shows the full text (Astryx's native behaviour).
   * A string/node -> that content instead.
   * An object with `title` -> antd's `TooltipProps` shape; only `title` is read.
   */
  tooltip?: ReactNode | { title?: ReactNode };
  onExpand?: (
    e: React.MouseEvent<HTMLElement>,
    info: { expanded: boolean },
  ) => void;
}

/** antd `Typography` `copyable` config, restated locally. */
export interface BAITextCopyConfig {
  /** Copy THIS instead of the rendered children. */
  text?: string;
  /** antd took `[copy, copied]`; only the resting label is used. */
  tooltips?: [ReactNode, ReactNode] | ReactNode[] | boolean;
  icon?: ReactNode;
  onCopy?: () => void;
}

export interface BAITextProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'color' | 'children'
> {
  children?: ReactNode;
  type?: BAITextType;
  strong?: boolean;
  italic?: boolean;
  underline?: boolean;
  delete?: boolean;
  mark?: boolean;
  code?: boolean;
  keyboard?: boolean;
  disabled?: boolean;
  monospace?: boolean;
  /** CSS-based ellipsis (multi-line via `rows`), with an optional tooltip. */
  ellipsis?: boolean | BAITextEllipsisConfig;
  copyable?: boolean | BAITextCopyConfig;
  /** Legacy variant used by the notification/keyboard-hint surfaces. */
  keyboardWithLightBorder?: boolean;
}

const TYPE_TO_COLOR: Record<BAITextType, NonNullable<TextProps['color']>> = {
  secondary: 'secondary',
  danger: 'danger',
  warning: 'warning',
  success: 'success',
};

/** Read the ellipsis tooltip slot into a renderable node (or `undefined`). */
const resolveTooltipContent = (
  ellipsis: boolean | BAITextEllipsisConfig | undefined,
  children: ReactNode,
): ReactNode | undefined => {
  if (!ellipsis || typeof ellipsis !== 'object') return undefined;
  const { tooltip } = ellipsis;
  if (tooltip === undefined || tooltip === false) return undefined;
  if (tooltip === true) return children;
  if (
    typeof tooltip === 'object' &&
    tooltip !== null &&
    !React.isValidElement(tooltip) &&
    'title' in tooltip
  ) {
    return (tooltip as { title?: ReactNode }).title;
  }
  return tooltip as ReactNode;
};

/** The copy target antd would have used. */
const resolveCopyText = (
  copyable: boolean | BAITextCopyConfig,
  children: ReactNode,
): string => {
  if (typeof copyable === 'object' && typeof copyable.text === 'string') {
    return copyable.text;
  }
  return typeof children === 'string' || typeof children === 'number'
    ? String(children)
    : '';
};

const CopyControl: React.FC<{
  copyable: boolean | BAITextCopyConfig;
  children: ReactNode;
  label: string;
}> = ({ copyable, children, label }) => {
  const [copied, setCopied] = useState(false);
  const config = typeof copyable === 'object' ? copyable : undefined;
  return (
    // QA-FINDINGS Q-37 — antd rendered `Typography`'s copy control through the
    // `operationUnit` mixin (`color: token.colorLink`), i.e. the SAME accent
    // the rest of this cluster lost. `variant="ghost"` has no colour slot, so
    // the tint comes back as a class; `--color-text-accent` resolves to
    // `colorLink` on brand routes and `colorInfo` on admin ones, which is
    // exactly what antd painted here. See `styles/actionAccent.css`.
    <IconButton
      className="bai-text-copy bai-action-accent"
      variant="ghost"
      size="sm"
      label={label}
      tooltip={label}
      icon={
        copied ? (
          <CheckIcon aria-hidden size="1em" />
        ) : (
          (config?.icon ?? <CopyIcon aria-hidden size="1em" />)
        )
      }
      isDisabled={copied}
      onClick={(e) => {
        e.stopPropagation();
        void navigator.clipboard?.writeText(
          resolveCopyText(copyable, children),
        );
        config?.onCopy?.();
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    />
  );
};

const BAIText: React.FC<BAITextProps> = ({
  style,
  className,
  monospace,
  ellipsis,
  copyable,
  children,
  strong,
  italic,
  underline,
  delete: deleteProp,
  mark,
  code,
  keyboard,
  keyboardWithLightBorder,
  disabled,
  type,
  ...restProps
}) => {
  const { t } = useBAIi18n();
  const [isExpanded, setIsExpanded] = useState(false);

  const ellipsisConfig = typeof ellipsis === 'object' ? ellipsis : undefined;
  const rows = ellipsisConfig?.rows ?? 1;
  const expandable = ellipsisConfig?.expandable ?? false;
  const maxLines = ellipsis && !isExpanded ? rows : 0;

  // A custom tooltip target (a different string, or a `{title}` object) is not
  // expressible through `hasTruncateTooltip`, which always shows the element's
  // own text. Those sites get an explicit Tooltip anchored to the same node,
  // gated on the same overflow signal Astryx uses internally. `expandable`
  // needs the same signal (the Expand link only appears when clamped), so both
  // opt into a second `useTruncation` — the hook shares ONE ResizeObserver
  // across every mounted instance, so the extra observation is not a per-cell
  // cost.
  const tooltipContent = resolveTooltipContent(ellipsis, children);
  const hasCustomTooltip =
    tooltipContent !== undefined && tooltipContent !== children;
  const needsMeasure = !!ellipsis && (expandable || hasCustomTooltip);
  const truncation = useTruncation({ maxLines: needsMeasure ? maxLines : 0 });
  const anchorRef = useRef<HTMLElement | null>(null);

  const decorationStyle: CSSProperties = {
    ...(monospace && { fontFamily: 'var(--font-family-mono, monospace)' }),
    ...(italic && { fontStyle: 'italic' }),
    ...(underline && deleteProp
      ? { textDecoration: 'underline line-through' }
      : underline
        ? { textDecoration: 'underline' }
        : {}),
  };

  const textNode = (
    <Text
      {...restProps}
      ref={(node: HTMLElement | null) => {
        anchorRef.current = node;
        if (needsMeasure) truncation.ref(node);
      }}
      className={className}
      color={
        disabled
          ? 'disabled'
          : type
            ? TYPE_TO_COLOR[type]
            : mark
              ? 'inherit'
              : undefined
      }
      weight={strong ? 'semibold' : undefined}
      hasStrikethrough={!!deleteProp && !underline}
      maxLines={maxLines}
      hasTruncateTooltip={!hasCustomTooltip && tooltipContent !== undefined}
      style={{ ...decorationStyle, ...style }}
    >
      {children}
    </Text>
  );

  // `code` / `keyboard` / `mark` are box treatments antd painted around the
  // text. `Code` is Astryx-native; `keyboard` and `mark` have no counterpart
  // and are rendered by the two co-located classes in BAIText.css (tokens
  // only, justified there).
  const boxed = code ? (
    <Code className="bai-text-code">{textNode}</Code>
  ) : keyboard || keyboardWithLightBorder ? (
    <span
      className={
        keyboardWithLightBorder
          ? 'bai-text-kbd bai-text-kbd--light'
          : 'bai-text-kbd'
      }
    >
      {textNode}
    </span>
  ) : mark ? (
    <mark className="bai-text-mark">{textNode}</mark>
  ) : (
    textNode
  );

  const withTooltip = hasCustomTooltip ? (
    <>
      {boxed}
      {truncation.isTruncated && !isExpanded ? (
        <Tooltip anchorRef={anchorRef} content={tooltipContent} />
      ) : null}
    </>
  ) : (
    boxed
  );

  if (!copyable && !expandable) {
    return withTooltip;
  }

  // The copy control and the expand link are siblings of the text, so the
  // ellipsis still measures against the text box alone.
  return (
    <span className="bai-text-row">
      {withTooltip}
      {expandable && truncation.isTruncated ? (
        <Link
          onClick={(e) => {
            const next = !isExpanded;
            setIsExpanded(next);
            ellipsisConfig?.onExpand?.(
              e as unknown as React.MouseEvent<HTMLElement>,
              { expanded: next },
            );
          }}
        >
          {isExpanded
            ? t('general.button.Collapse')
            : t('general.button.Expand')}
        </Link>
      ) : null}
      {copyable ? (
        // QA-FINDINGS Q-38 — the key was `button.Copy`, which does not exist in
        // BUI's OWN locale bundle: every BUI key is namespaced under `general.`
        // (`general.button.Copy`), as the two `Link` labels immediately above
        // already are. `useBAIi18n` binds to BUI's private i18next instance
        // rather than resolving through React context, so there is no host
        // bundle to fall through to; with no `parseMissingKeyHandler` set
        // (`src/locale/index.ts`), i18next's default is to return the KEY —
        // which then shipped as the copy button's aria-label and its visible
        // tooltip. Measured on the session detail drawer in both
        // modes: `aria-label="button.Copy"`, and reported independently as
        // "엑세스 토큰 생성 이후에 뜨는 모달에서도 카피 버튼의 i18n이 깨짐".
        <CopyControl copyable={copyable} label={t('general.button.Copy')}>
          {children}
        </CopyControl>
      ) : null}
    </span>
  );
};

export default BAIText;
