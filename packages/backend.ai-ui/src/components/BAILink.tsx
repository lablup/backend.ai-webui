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
import { Text } from '@astryxdesign/core/Text';
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
  if (type !== 'disabled' && to) {
    return (
      <Link
        className={`${LINK_TYPE_CLASS[type]}${ellipsis ? ' bai-link-ellipsis' : ''}`}
        to={to}
        {...linkProps}
      >
        {/* A router <a> has no Astryx Text of its own, so `ellipsis` has to add
            one: it owns both the clip and the truncate tooltip, which an
            ancestor cannot (the <a> fits it exactly, so nothing overflows to
            measure). FR-3686. */}
        {ellipsis ? <Text maxLines={1}>{children}</Text> : children}
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

  const link = (
    <AstryxLink
      {...restProps}
      className={`${LINK_TYPE_CLASS[type]}${ellipsis ? ' bai-link-ellipsis' : ''}${className ? ` ${className}` : ''}`}
      style={style}
      target={target}
      isDisabled={type === 'disabled'}
      onClick={onClick}
      // The clip has to sit on the element that owns the text: an ancestor's
      // `text-overflow` cannot shorten an atomic inline-level box (FR-3686).
      maxLines={ellipsis ? 1 : 0}
    >
      {children}
      {icon}
    </AstryxLink>
  );

  if (ellipsis) {
    return (
      <BAIText ellipsis={ellipsis === true ? { tooltip: true } : ellipsis}>
        {link}
      </BAIText>
    );
  }

  return link;
};

export default BAILink;
