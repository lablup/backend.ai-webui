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
  type?: 'hover' | 'disabled' | undefined;
  icon?: React.ReactNode;
  to?: LinkProps['to'];
  ellipsis?: boolean | { tooltip?: string };
  children?: string | React.ReactNode;
}

const BAILink: React.FC<BAILinkProps> = ({
  type,
  icon,
  to,
  ellipsis,
  children,
  ...linkProps
}) => {
  if (type !== 'disabled' && to) {
    return (
      <Link
        className={type ? LINK_TYPE_CLASS[type] : undefined}
        to={to}
        {...linkProps}
      >
        {children}
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
      className={
        type
          ? `${LINK_TYPE_CLASS[type]}${className ? ` ${className}` : ''}`
          : className
      }
      style={style}
      target={target}
      isDisabled={type === 'disabled'}
      onClick={onClick}
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
