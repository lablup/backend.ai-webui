/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Layout element for the global `/admin/*` (system / superadmin) subtree.
 *
 * Intentionally thin: it only renders the matched child route via `<Outlet />`.
 * It exists as the single injection point for future "system scope = no current
 * project" handling (see plan §3.2 / §6 — deferred). Keeping it as a dedicated
 * component (rather than inlining `element: <Outlet/>`) means that work can land
 * here without another route-tree change.
 */
const AdminScopeLayout: React.FC = () => {
  'use memo';
  return <Outlet />;
};

export default AdminScopeLayout;
