/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { Navigate, NavigateProps } from 'react-router-dom';

interface WebUINavigateProps extends NavigateProps {}
const WebUINavigate: React.FC<WebUINavigateProps> = ({ ...props }) => {
  useSuspendedBackendaiClient();
  return <Navigate {...props} />;
};

export default WebUINavigate;
