/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  type RecipientShare,
  toInvitationItems,
} from './useVFolderInvitations';
import * as _ from 'lodash-es';

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

  it('names a project share by its recipient project, falling back to the member list and then the id (#10659)', () => {
    const items = toInvitationItems(
      [
        share({
          entityId: 'named',
          recipientEntityType: 'project',
          recipientEntityId: 'p-1',
          recipientEntity: {
            __typename: 'ProjectV2',
            basicInfo: { name: 'research' },
          },
        }),
        share({
          entityId: 'listed',
          recipientEntityType: 'project',
          recipientEntityId: 'p-2',
          recipientEntity: null,
        }),
        share({
          entityId: 'unknown',
          recipientEntityType: 'project',
          recipientEntityId: 'p-3',
          recipientEntity: null,
        }),
        share({ entityId: 'mine', recipientEntityType: 'user' }),
      ],
      { projectNames: { 'p-2': 'vision' } },
    );
    expect(
      _.fromPairs(items.map((item) => [item.id, item.recipientProjectName])),
    ).toEqual({
      named: 'research',
      listed: 'vision',
      unknown: 'p-3',
      mine: undefined,
    });
  });

  it('lists a share once when both the user and a project query return it', () => {
    const items = toInvitationItems([
      share({ entityId: 'same' }),
      share({ entityId: 'same' }),
    ]);
    expect(items).toHaveLength(1);
  });

  it("lists the caller's own offer to a project they answer for", () => {
    const items = toInvitationItems([
      share({
        entityId: 'own',
        recipientEntityType: 'project',
        sharer: { entityId: 'me', basicInfo: { email: 'me@example.com' } },
      }),
      share({ entityId: 'theirs', recipientEntityType: 'project' }),
    ]);
    expect(items.map((item) => item.id).sort()).toEqual(['own', 'theirs']);
  });

  it('reads the entity types regardless of case', () => {
    const [item] = toInvitationItems([
      share({
        targetEntityType: 'VFOLDER',
        recipientEntityType: 'PROJECT',
        recipientEntityId: 'p-1',
        recipientEntity: null,
      }),
    ]);
    expect(item.recipientProjectName).toBe('p-1');
  });
});
