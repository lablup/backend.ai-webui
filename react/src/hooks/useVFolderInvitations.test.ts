/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  type InvitationItem,
  mergeSharePermissions,
} from './useVFolderInvitations';

const invitation = (id: string): InvitationItem => ({
  id,
  vfolder_id: 'vf-1',
  vfolder_name: 'data',
  inviter: 'admin@example.com',
  mount_permission: 'ro',
  created_at: '2026-10-19T00:00:00Z',
  modified_at: null,
  status: 'pending',
  perm: 'ro',
});

describe('mergeSharePermissions (#10329)', () => {
  it('attaches the share cap whose entityId is the invitation id', () => {
    const [full, bare] = mergeSharePermissions(
      [invitation('share-1'), invitation('share-2')],
      [
        { entityId: 'share-1', permissions: ['READ', 'UPDATE', 'CREATE'] },
        { entityId: 'share-9', permissions: ['READ'] },
      ],
    );
    expect(full.permissions).toEqual(['READ', 'UPDATE', 'CREATE']);
    // The mount permission the invite was sent with stays what it was.
    expect(full.perm).toBe('ro');
    expect(bare.permissions).toBeUndefined();
  });

  it('drops a cap the invitation no longer has a share for', () => {
    const [item] = mergeSharePermissions(
      [{ ...invitation('share-1'), permissions: ['READ'] }],
      [],
    );
    expect(item.permissions).toBeUndefined();
  });
});
