/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The settings dialog's panes, split from the dialog frame (`UserSettingsModal`)
 so the frame and the rail paint before this chunk arrives (#11144).
*/
import type { LoginHistoryQuery as LoginHistoryQueryType } from '../__generated__/LoginHistoryQuery.graphql';
import type { LoginSessionQuery as LoginSessionQueryType } from '../__generated__/LoginSessionQuery.graphql';
import type { UserSettingsCategory } from '../helper/userSettingsModal';
import ErrorLogList from './ErrorLogList';
import LoginHistory, { LoginHistoryQuery } from './LoginHistory';
import LoginSession, { LoginSessionQuery } from './LoginSession';
import UserSettingsGeneralPane from './UserSettingsGeneralPane';
import { BAISkeleton } from 'backend.ai-ui';
import React, { useEffect, useEffectEvent } from 'react';
import { useQueryLoader } from 'react-relay';

const UserSettingsModalPane: React.FC<{
  category: UserSettingsCategory;
}> = ({ category }) => {
  'use memo';
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
