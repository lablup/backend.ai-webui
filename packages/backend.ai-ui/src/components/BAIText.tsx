/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIText` — the antd `Typography.Text` structure on Astryx tokens (FR-3726).

 FRONTIER COMPONENT. The prop surface is the frozen antd-shaped vocabulary
 (`type`, `strong`, `italic`, `underline`, `delete`, `mark`, `code`, `keyboard`,
 `ellipsis`, `copyable`, `monospace`, …) and the DOM is the one the antd-era
 component rendered, so call sites and their layout assumptions stay put:

   plain          <span.bai-text>children</span>
   ellipsis/copy  <span.bai-text.bai-text-row>
                    <span.bai-text-content>children</span>   the clamp box
                    [Tooltip]  [Expand]  [Copy]
                  </span>

 The component owns its span rather than rendering Astryx `Text`: `Text`
 paints its own type scale and colour, turns `display: block` under
 `maxLines`, and brings its own truncation tooltip — none of which the
 antd-era layout expects. Styles live in BAIText.css (tokens only).
*/
import { useBAIi18n } from '../hooks/useBAIi18n';
import './BAIText.css';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Kbd } from '@astryxdesign/core/Kbd';
import { Link } from '@astryxdesign/core/Link';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import classNames from 'classnames';
import { CheckIcon, CopyIcon } from 'lucide-react';
import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type BAITextType = 'secondary' | 'success' | 'warning' | 'danger';

export type BAITextSize =
  | '4xs'
  | '3xs'
  | '2xs'
  | 'xsm'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl';

/**
 * antd `TooltipProps`, of which only `title` has a destination; the other
 * keys are accepted and ignored, and a missing `title` means the children.
 */
export interface BAITextTooltipConfig {
  title?: ReactNode;
  [antdTooltipProp: string]: unknown;
}

/** antd `EllipsisConfig`. */
export interface BAITextEllipsisConfig {
  rows?: number;
  expandable?: boolean;
  /** `true` shows the children; a node shows that node; `{ title }` its title. */
  tooltip?: ReactNode | BAITextTooltipConfig;
  onExpand?: (
    e: React.MouseEvent<HTMLElement>,
    info: { expanded: boolean },
  ) => void;
}

/** antd `CopyConfig`. Tuples are `[resting, copied]`. */
export interface BAITextCopyConfig {
  text?: string | (() => string | Promise<string>);
  icon?: ReactNode | [ReactNode, ReactNode];
  tooltips?: boolean | ReactNode | [ReactNode, ReactNode];
  onCopy?: (event?: React.MouseEvent<HTMLElement>) => void;
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
  /** Renders the children's text as an Astryx `Kbd` shortcut (`+`-separated). */
  keyboard?: boolean;
  disabled?: boolean;
  monospace?: boolean;
  /** Font size step (Astryx scale); antd had no counterpart. */
  size?: BAITextSize;
  /** CSS ellipsis — single line, or `rows` lines — with an optional tooltip. */
  ellipsis?: boolean | BAITextEllipsisConfig;
  copyable?: boolean | BAITextCopyConfig;
  /**
   * Take the surrounding colour instead of the text default, for a BAIText
   * nested in an element that owns the colour, e.g. a link (FR-3692). Ignored
   * when `type` / `disabled` name a colour.
   */
  inheritColor?: boolean;
}

const COPIED_RESET_MS = 1500;

const toTuple = <T,>(value: T | [T, T] | undefined): [T?, T?] =>
  Array.isArray(value) ? [value[0], value[1]] : [value, undefined];

/** The text antd would put on the clipboard for these children. */
const nodeToText = (node: ReactNode): string => {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(nodeToText).join('');
  }
  if (React.isValidElement<{ children?: ReactNode }>(node)) {
    return nodeToText(node.props.children);
  }
  return '';
};

const resolveTooltipContent = (
  ellipsis: boolean | BAITextEllipsisConfig | undefined,
  children: ReactNode,
): ReactNode | undefined => {
  if (!ellipsis || typeof ellipsis !== 'object') return undefined;
  const { tooltip } = ellipsis;
  if (tooltip === undefined || tooltip === null || tooltip === false) {
    return undefined;
  }
  if (tooltip === true) return children;
  // antd `TooltipProps` form: `title` defaults to the children.
  if (
    typeof tooltip === 'object' &&
    !React.isValidElement(tooltip) &&
    !Array.isArray(tooltip)
  ) {
    return (tooltip as BAITextTooltipConfig).title ?? children;
  }
  return tooltip as ReactNode;
};

/**
 * Overflow of the clamp box, re-measured on resize and on new children — a
 * fixed-width cell whose value changes does not resize, so a ResizeObserver
 * alone would leave the tooltip stale.
 */
const useOverflow = (
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  rows: number,
  children: ReactNode,
) => {
  const [isOverflowing, setIsOverflowing] = useState(false);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;
    const check = () => {
      if (rows === 1) {
        setIsOverflowing(element.scrollWidth > element.clientWidth);
        return;
      }
      // `-webkit-line-clamp` can report the clamped height as scrollHeight, so
      // measure the content itself as well.
      let contentHeight = element.scrollHeight;
      try {
        const range = document.createRange();
        range.selectNodeContents(element);
        contentHeight = Math.max(
          contentHeight,
          range.getBoundingClientRect().height,
        );
        range.detach();
      } catch {
        // jsdom
      }
      setIsOverflowing(contentHeight > element.clientHeight + 1);
    };
    check();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(check);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, enabled, rows, children]);

  return isOverflowing;
};

const CopyControl: React.FC<{
  copyable: true | BAITextCopyConfig;
  children: ReactNode;
}> = ({ copyable, children }) => {
  'use memo';
  const { t } = useBAIi18n();
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const config = typeof copyable === 'object' ? copyable : undefined;
  const [restingIcon, copiedIcon] = toTuple(config?.icon);
  const [restingTip, copiedTip] =
    config?.tooltips === false
      ? [undefined, undefined]
      : config?.tooltips === true || config?.tooltips === undefined
        ? [t('general.button.Copy'), t('general.button.Copied')]
        : toTuple(config.tooltips);
  const tip = copied ? copiedTip : restingTip;
  const tipText =
    typeof tip === 'string' || typeof tip === 'number'
      ? String(tip)
      : undefined;
  const label = tipText ?? t('general.button.Copy');

  const button = (
    <IconButton
      // `.bai-action-accent` — the tint antd's `operationUnit` painted here
      // (QA-FINDINGS Q-37); see `styles/actionAccent.css`.
      className="bai-text-copy bai-action-accent"
      variant="ghost"
      size="sm"
      label={label}
      tooltip={tipText}
      icon={
        copied
          ? (copiedIcon ?? <CheckIcon aria-hidden size="1em" />)
          : (restingIcon ?? <CopyIcon aria-hidden size="1em" />)
      }
      isDisabled={copied}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void (async () => {
          const text =
            typeof config?.text === 'function'
              ? await config.text()
              : typeof config?.text === 'string'
                ? config.text
                : nodeToText(children);
          await navigator.clipboard?.writeText(text);
          config?.onCopy?.(e);
          setCopied(true);
          timerRef.current = setTimeout(
            () => setCopied(false),
            COPIED_RESET_MS,
          );
        })();
      }}
    />
  );

  // A non-string tooltip cannot ride IconButton's `tooltip: string` slot.
  return tip !== undefined && tipText === undefined ? (
    <Tooltip content={tip}>{button}</Tooltip>
  ) : (
    button
  );
};

const BAIText: React.FC<BAITextProps> = ({
  className,
  style,
  type,
  strong,
  italic,
  underline,
  delete: deleteProp,
  mark,
  code,
  keyboard,
  disabled,
  monospace,
  size,
  ellipsis,
  copyable,
  inheritColor,
  children,
  ...restProps
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const [isExpanded, setIsExpanded] = useState(false);

  const ellipsisConfig = typeof ellipsis === 'object' ? ellipsis : undefined;
  const rows = ellipsisConfig?.rows || 1;
  const expandable = ellipsisConfig?.expandable ?? false;
  const tooltipContent = resolveTooltipContent(ellipsis, children);

  const contentRef = useRef<HTMLElement | null>(null);
  const isOverflowing = useOverflow(
    contentRef,
    !!ellipsis && !isExpanded,
    rows,
    children,
  );

  const rootClassName = classNames(
    'bai-text',
    disabled
      ? 'bai-text-disabled'
      : type
        ? `bai-text-${type}`
        : inheritColor
          ? 'bai-text-inherit'
          : undefined,
    {
      'bai-text-strong': strong,
      'bai-text-italic': italic,
      'bai-text-underline': underline,
      'bai-text-delete': deleteProp,
      'bai-text-monospace': monospace,
    },
    size && `bai-text-size-${size}`,
    className,
  );

  // antd wrapped the children in the matching element; the box treatment
  // rides on it, and under `ellipsis` it is also the clamp box. `keyboard`
  // is Astryx `Kbd`, which takes the children's text as its `keys` spec.
  const ContentTag = code ? 'code' : mark ? 'mark' : 'span';
  const boxClassName = code
    ? 'bai-text-code'
    : mark
      ? 'bai-text-mark'
      : undefined;
  const content = keyboard ? <Kbd keys={nodeToText(children)} /> : children;

  if (!ellipsis && !copyable) {
    return (
      <span {...restProps} className={rootClassName} style={style}>
        {boxClassName ? (
          <ContentTag className={boxClassName}>{content}</ContentTag>
        ) : (
          content
        )}
      </span>
    );
  }

  const handleExpand = (e: React.MouseEvent<HTMLElement>) => {
    const next = !isExpanded;
    setIsExpanded(next);
    ellipsisConfig?.onExpand?.(e, { expanded: next });
  };

  return (
    <span
      {...restProps}
      className={classNames(rootClassName, 'bai-text-row')}
      style={style}
    >
      <ContentTag
        ref={contentRef}
        className={classNames('bai-text-content', boxClassName, {
          'bai-text-content-expanded': !!ellipsis && isExpanded,
          'bai-text-content-clip': !!ellipsis && !isExpanded && rows === 1,
          'bai-text-content-clamp': !!ellipsis && !isExpanded && rows > 1,
        })}
        style={
          ellipsis && !isExpanded && rows > 1
            ? { WebkitLineClamp: rows }
            : undefined
        }
      >
        {content}
      </ContentTag>
      {tooltipContent !== undefined && isOverflowing && !isExpanded ? (
        <Tooltip anchorRef={contentRef} content={tooltipContent} />
      ) : null}
      {expandable && (isOverflowing || isExpanded) ? (
        <Link className="bai-text-expand" onClick={handleExpand}>
          {isExpanded
            ? t('general.button.Collapse')
            : t('general.button.Expand')}
        </Link>
      ) : null}
      {copyable ? (
        <CopyControl copyable={copyable}>{children}</CopyControl>
      ) : null}
    </span>
  );
};

export default BAIText;
