/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import _ from 'lodash';
import React from 'react';
import { Link, LinkProps } from 'react-router-dom';

interface WebUILinkProps extends LinkProps {
  options?: {
    params?: any;
  };
}

const WebUILink: React.FC<WebUILinkProps> = ({ options, ...props }) => {
  return (
    <Link
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        const pathName = _.isString(props.to)
          ? props.to
          : props.to.pathname || '';
        if (!e.metaKey && !e.ctrlKey) {
          document.dispatchEvent(
            new CustomEvent('move-to-from-react', {
              detail: {
                path: pathName,
                params: options?.params,
              },
            }),
          );
        }
      }}
    />
  );
};

export default WebUILink;
