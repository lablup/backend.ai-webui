/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useHasActiveErrorBoundary } from '../hooks/useActiveErrorBoundary';
import * as _ from 'lodash-es';
import React from 'react';
import { Link, LinkProps } from 'react-router-dom';

interface WebUILinkProps extends LinkProps {}

/**
 * Resolve a react-router `to` prop into a plain string href usable on a
 * native `<a>` element.
 */
const resolveHref = (to: LinkProps['to']): string => {
  if (_.isString(to)) {
    return to;
  }
  return (to.pathname ?? '') + (to.search ?? '') + (to.hash ?? '');
};

const WebUILink: React.FC<WebUILinkProps> = ({ ...props }) => {
  const hasActiveErrorBoundary = useHasActiveErrorBoundary();

  // After any error boundary has been triggered, the React tree may still
  // carry stale state (an error boundary higher up the tree does not remount
  // on SPA navigation). Fall back to a plain anchor so the browser performs
  // a real navigation, which fully resets the React tree.
  if (hasActiveErrorBoundary) {
    // Strip react-router-specific props that are not valid on a native
    // anchor element before spreading the rest.
    const {
      to,
      replace: _replace,
      state: _state,
      preventScrollReset: _preventScrollReset,
      relative: _relative,
      reloadDocument: _reloadDocument,
      onClick,
      ...anchorProps
    } = props;
    return (
      <a {...anchorProps} href={resolveHref(to)} onClick={onClick}>
        {props.children}
      </a>
    );
  }

  return <Link {...props} />;
};

export default WebUILink;
