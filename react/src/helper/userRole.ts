/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

export type UserRole = 'superadmin' | 'admin' | 'user' | 'monitor';

// `UserRoleV2` enum → the lowercase role the legacy API and the forms use.
export const roleFromV2: Record<string, UserRole> = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
  MONITOR: 'monitor',
};
