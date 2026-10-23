/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { TOTPActivateModalProps } from './TOTPActivateModal';
import React, { Suspense, useState } from 'react';

// Keeps qrcode.react out of the bundle until the modal is first opened.
const TOTPActivateModal = React.lazy(() => import('./TOTPActivateModal'));

const TOTPActivateModalLazy: React.FC<TOTPActivateModalProps> = (props) => {
  'use memo';
  const [hasOpened, setHasOpened] = useState(!!props.open);
  if (props.open && !hasOpened) {
    setHasOpened(true);
  }
  if (!hasOpened) {
    return null;
  }
  return (
    <Suspense fallback={null}>
      <TOTPActivateModal {...props} />
    </Suspense>
  );
};

export default TOTPActivateModalLazy;
