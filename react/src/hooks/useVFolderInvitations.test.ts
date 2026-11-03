/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  type RecipientShare,
  toInvitationItems,
} from './useVFolderInvitations';

const share = (overrides: Partial<RecipientShare>): RecipientShare => ({
  entityId: 'share-1',
  status: 'PENDING',
  permissions: ['READ'],
  targetEntityType: 'vfolder',
  targetEntityId: 'vf-1',
  createdAt: '2026-10-19T00:00:00Z',
  sharer: { basicInfo: { email: 'admin@example.com' } },
  targetEntity: { __typename: 'VFolder', metadata: { name: 'data' } },
  ...overrides,
});

describe('toInvitationItems (#10329)', () => {
  it('keeps only the pending folder shares, newest first', () => {
    const items = toInvitationItems([
      share({ entityId: 'old', createdAt: '2026-10-18T00:00:00Z' }),
      share({ entityId: 'accepted', status: 'ACCEPTED' }),
      share({ entityId: 'session', targetEntityType: 'session' }),
      share({ entityId: 'new', createdAt: '2026-10-20T00:00:00Z' }),
    ]);
    expect(items.map((item) => item.id)).toEqual(['new', 'old']);
    expect(items[0]).toEqual({
      id: 'new',
      vfolderId: 'vf-1',
      vfolderName: 'data',
      sharerEmail: 'admin@example.com',
      permissions: ['READ'],
      createdAt: '2026-10-20T00:00:00Z',
    });
  });

  it('leaves the sharer and the folder name empty when the caller may not read them', () => {
    const [item] = toInvitationItems([
      share({ sharer: null, targetEntity: null }),
    ]);
    expect(item.sharerEmail).toBeNull();
    expect(item.vfolderName).toBeNull();
    expect(item.vfolderId).toBe('vf-1');
  });
});
