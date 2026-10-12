/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { roleFromV2 } from './userRole';

describe('roleFromV2', () => {
  it('maps every UserRoleV2 enum member to its lowercase role', () => {
    expect(roleFromV2).toEqual({
      USER: 'user',
      ADMIN: 'admin',
      SUPERADMIN: 'superadmin',
      MONITOR: 'monitor',
    });
  });

  it('answers undefined for an unknown enum member', () => {
    expect(roleFromV2['OWNER']).toBeUndefined();
  });
});
