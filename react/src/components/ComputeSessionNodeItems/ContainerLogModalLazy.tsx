/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ContainerLogModalProps } from './ContainerLogModal';
import React, { Suspense } from 'react';

// Keeps the log viewer (@melloware/react-logviewer) out of the boot bundle.
const ContainerLogModal = React.lazy(() => import('./ContainerLogModal'));

const ContainerLogModalLazy: React.FC<ContainerLogModalProps> = (props) => {
  'use memo';
  return (
    <Suspense fallback={null}>
      <ContainerLogModal {...props} />
    </Suspense>
  );
};

export default ContainerLogModalLazy;
