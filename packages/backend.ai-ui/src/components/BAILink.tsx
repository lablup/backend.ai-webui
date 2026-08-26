/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAILink` on Astryx (to-astryx phase 3, ticket A).

 FRONTIER COMPONENT — the public surface is unchanged (`to`, `type`, `icon`,
 `ellipsis`, plus react-router `LinkProps`), 71 call sites in 32 files stay at
 zero diff. Internals:

   `to` present, not disabled   -> react-router `Link` (UNCHANGED). Astryx's
                                   `Link as=` contract is href-first ("only
                                   used when href is provided") and cannot take
                                   a react-router `To` object, so routing keeps
                                   its own element; the `.bai-link-*` classes
                                   already carry the visuals from tokens.
   otherwise                    -> Astryx `Link` (MAPPING §3.16). With no
                                   `href` it renders a `<button>` with link
                                   styling — the correct semantics for the 25
                                   pure-`onClick` sites, which antd rendered as
                                   an `<a>` with no destination.
   `type="disabled"`            -> `isDisabled` + the existing class.
*/
import './BAILink.css';
import BAIText from './BAIText';
import { Link as AstryxLink } from '@astryxdesign/core/Link';
import React from 'react';
import { Link, type LinkProps } from 'react-router-dom';

const LINK_TYPE_CLASS = {
  hover: 'bai-link-hover',
  disabled: 'bai-link-disabled',
} as const;

export interface BAILinkProps extends Omit<LinkProps, 'to'> {
  /**
   * Defaults to `'hover'`. A link that does not look and behave like a link is
   * a bug, so the accent colour + hover underline are the baseline rather than
   * something each call site has to remember to ask for — before QA3, the
   * ~10 `to`-only sites (artifact/model names, `FolderLink`, …) fell through to
   * a class-less react-router `<a>`, which Astryx's reset
   * (`:where(a){color:inherit;text-decoration:inherit}`) flattened into plain
   * body text. Pass `'disabled'` for the non-interactive state.
   */
  type?: 'hover' | 'disabled' | undefined;
  icon?: React.ReactNode;
  to?: LinkProps['to'];
  ellipsis?: boolean | { tooltip?: string };
  children?: string | React.ReactNode;
}

const BAILink: React.FC<BAILinkProps> = ({
  type = 'hover',
  icon,
  to,
  ellipsis,
  children,
  ...linkProps
}) => {
  // FR-3686 — the clip AND the tooltip must sit on the element that owns the
  // text. An ancestor's `text-overflow` cannot shorten an atomic inline box,
  // and an ancestor's overflow measurement cannot see a child that fits it, so
  // `BAIText` goes INSIDE the link rather than around it. That keeps both
  // documented forms working: `ellipsis` shows the text itself, and
  // `ellipsis={{ tooltip: 'custom' }}` measures the box it is anchored to.
  const content = ellipsis ? (
    <BAIText ellipsis={ellipsis === true ? { tooltip: true } : ellipsis}>
      {children}
    </BAIText>
  ) : (
    children
  );
  // The link is what bounds that Text, so it needs the width cap in both
  // branches. Internal classes go AFTER the spread — `linkProps.className`
  // would otherwise replace them.
  const linkClassName = (callerClassName?: string) =>
    `${LINK_TYPE_CLASS[type]}${ellipsis ? ' bai-link-ellipsis' : ''}${
      callerClassName ? ` ${callerClassName}` : ''
    }`;

  if (type !== 'disabled' && to) {
    const { className: routerClassName, ...routerProps } = linkProps;
    return (
      <Link to={to} {...routerProps} className={linkClassName(routerClassName)}>
        {content}
        {icon}
      </Link>
    );
  }

  // Router-only props have no destination on an Astryx `Link`; `color` is the
  // legacy HTML attribute that `AnchorHTMLAttributes` still carries and that
  // Astryx re-purposes as a closed text-colour enum, so it must not ride along.
  const {
    onClick,
    style,
    className,
    target,
    color: _color,
    replace: _replace,
    state: _state,
    preventScrollReset: _preventScrollReset,
    relative: _relative,
    reloadDocument: _reloadDocument,
    viewTransition: _viewTransition,
    ...restProps
  } = linkProps;

  return (
    <AstryxLink
      {...restProps}
      className={linkClassName(className)}
      style={style}
      target={target}
      isDisabled={type === 'disabled'}
      onClick={onClick}
    >
      {content}
      {icon}
    </AstryxLink>
  );
};

export default BAILink;
