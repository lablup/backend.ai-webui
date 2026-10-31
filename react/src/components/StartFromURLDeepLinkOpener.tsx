/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  parseStartDeepLink,
  withoutStartDeepLink,
  type StartDeepLink,
} from '../helper/startDeepLink';
import { useWebUINavigate } from '../hooks';
import StartFromURLModal from './StartFromURLModal';
import { BAIUnmountAfterClose } from 'backend.ai-ui';
import React, { useEffect, useEffectEvent, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Opens the import modal for `?type=url&data=` and the legacy `/github?…`
 * links, which `/start` forwards to the dashboard, then drops them from the URL.
 */
const StartFromURLDeepLinkOpener: React.FC = () => {
  'use memo';
  const location = useLocation();
  const webuiNavigate = useWebUINavigate();
  const [deepLink, setDeepLink] = useState<StartDeepLink | null>(() =>
    parseStartDeepLink(location.search),
  );

  const dropDeepLinkFromUrl = useEffectEvent(() => {
    if (!parseStartDeepLink(location.search)) return;
    webuiNavigate(
      {
        pathname: location.pathname,
        search: withoutStartDeepLink(location.search),
        hash: location.hash,
      },
      { replace: true },
    );
  });

  useEffect(() => {
    dropDeepLinkFromUrl();
  }, []);

  return (
    <BAIUnmountAfterClose>
      <StartFromURLModal
        open={!!deepLink}
        initialTab="notebook"
        initialData={deepLink?.data}
        onCancel={() => setDeepLink(null)}
      />
    </BAIUnmountAfterClose>
  );
};

export default StartFromURLDeepLinkOpener;
