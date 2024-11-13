import { useSuspendedBackendaiClient } from '../hooks';
import _ from 'lodash';
import React, { useEffect } from 'react';
import { Navigate, NavigateProps } from 'react-router-dom';

interface WebUINavigateProps extends NavigateProps {
  options?: {
    params?: any;
  };
}
const WebUINavigate: React.FC<WebUINavigateProps> = ({ options, ...props }) => {
  useSuspendedBackendaiClient();
  const pathName = _.isString(props.to) ? props.to : props.to.pathname || '';
  useEffect(() => {
    document.dispatchEvent(
      new CustomEvent('move-to-from-react', {
        detail: {
          path: pathName,
          params: options?.params,
        },
      }),
    );
    // Don't need to consider options.params
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathName]);
  return <Navigate {...props} />;
};

export default WebUINavigate;
