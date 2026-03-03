/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import _ from 'lodash';
import React, { useEffect } from 'react';
import { Navigate, NavigateProps } from 'react-router-dom';

interface WebUINavigateProps extends NavigateProps {}
const WebUINavigate: React.FC<WebUINavigateProps> = ({ ...props }) => {
  useSuspendedBackendaiClient();
  const pathName = _.isString(props.to) ? props.to : props.to.pathname || '';
  const [path, query] = pathName.split('?');
  const params = {
    params: Object.fromEntries(new URLSearchParams(query)),
  };
  useEffect(() => {
    document.dispatchEvent(
      new CustomEvent('move-to-from-react', {
        detail: {
          path: path,
          params,
        },
      }),
    );
    // Don't need to consider options.params
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathName]);
  return <Navigate {...props} />;
};

export default WebUINavigate;
