/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import React, { PropsWithChildren } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

const ErrorBoundaryWithNullFallback: React.FC<PropsWithChildren> = (props) => {
  return <ErrorBoundary {...props} fallbackRender={() => null} />;
};

export default ErrorBoundaryWithNullFallback;
