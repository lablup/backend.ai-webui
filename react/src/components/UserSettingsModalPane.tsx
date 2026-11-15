/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The settings dialog's panes, split from the dialog frame (`UserSettingsModal`)
 so the frame and the rail paint before this chunk arrives (#11144).
*/
import type { LoginHistoryQuery as LoginHistoryQueryType } from '../__generated__/LoginHistoryQuery.graphql';
import type { LoginSessionQuery as LoginSessionQueryType } from '../__generated__/LoginSessionQuery.graphql';
import type { UserSettingsCategory } from '../helper/userSettingsModal';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { AUTO_MOUNT_SETTING_MANAGER_VERSION } from '../hooks/useVFolderAutoMountsByVFolderId';
import ErrorLogList from './ErrorLogList';
import LoginHistory, { LoginHistoryQuery } from './LoginHistory';
import LoginSession, { LoginSessionQuery } from './LoginSession';
import UserSettingsGeneralPane from './UserSettingsGeneralPane';
import VFolderAutoMountList from './VFolderAutoMountList';
import { BAISkeleton } from 'backend.ai-ui';
import React, { useEffect, useEffectEvent } from 'react';
import { useQueryLoader } from 'react-relay';

const UserSettingsModalPane: React.FC<{
  category: UserSettingsCategory;
}> = ({ category }) => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const [currentUser] = useCurrentUserInfo();
  // The rail hides the auto-mount category without this manager version; this
  // fallback covers a direct `?settings=auto-mount` restore.
  const supportsAutoMount = baiClient.isManagerVersionCompatibleWith(
    AUTO_MOUNT_SETTING_MANAGER_VERSION,
  );
  const [loginSessionQueryRef, loadLoginSessionQuery] =
    useQueryLoader<LoginSessionQueryType>(LoginSessionQuery);
  const [loginHistoryQueryRef, loadLoginHistoryQuery] =
    useQueryLoader<LoginHistoryQueryType>(LoginHistoryQuery);
  // Lazily fetch a category's data only once it becomes active (covers both a
  // rail click and a direct `?settings=...` URL restore), so neither query runs
  // while the General/Logs categories are shown.
  const ensureActiveCategoryQueryLoaded = useEffectEvent(() => {
    if (category === 'login-sessions' && !loginSessionQueryRef) {
      loadLoginSessionQuery(
        {
          orderBy: [{ field: 'CREATED_AT', direction: 'DESC' }],
          limit: 10,
          offset: 0,
        },
        { fetchPolicy: 'store-and-network' },
      );
    }
    if (category === 'login-history' && !loginHistoryQueryRef) {
      loadLoginHistoryQuery(
        {
          orderBy: [{ field: 'CREATED_AT', direction: 'DESC' }],
          limit: 10,
          offset: 0,
        },
        { fetchPolicy: 'store-and-network' },
      );
    }
  });
  useEffect(
    function loadActiveCategoryQueryOnActivation() {
      ensureActiveCategoryQueryLoaded();
    },
    [category],
  );

  if (category === 'general') {
    return <UserSettingsGeneralPane />;
  }
  if (category === 'auto-mount') {
    if (!supportsAutoMount) {
      return <UserSettingsGeneralPane />;
    }
    return <VFolderAutoMountList scopeType="USER" scopeId={currentUser.uuid} />;
  }
  if (category === 'logs') {
    return <ErrorLogList />;
  }
  if (category === 'login-sessions') {
    return loginSessionQueryRef ? (
      <LoginSession
        queryRef={loginSessionQueryRef}
        onReload={loadLoginSessionQuery}
      />
    ) : (
      <BAISkeleton />
    );
  }
  return loginHistoryQueryRef ? (
    <LoginHistory
      queryRef={loginHistoryQueryRef}
      onReload={loadLoginHistoryQuery}
    />
  ) : (
    <BAISkeleton />
  );
};

export default UserSettingsModalPane;
