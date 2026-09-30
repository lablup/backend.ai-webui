import {
  toLegacyVFolder,
  type MyVfolderNode,
} from './useSuspendedLegacyVFolders';
import { describe, expect, it } from 'vitest';

const ME = '11111111-2222-3333-4444-555555555555';
const OTHER = '99999999-8888-7777-6666-555555555555';
const PROJECT = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const VFOLDER = '0f1e2d3c-4b5a-6978-8796-a5b4c3d2e1f0';

const node = (overrides: Partial<MyVfolderNode> = {}): MyVfolderNode => ({
  id: btoa(`VFolder:${VFOLDER}`),
  status: 'READY',
  host: 'local:volume1',
  metadata: {
    name: 'datasets',
    usageMode: 'GENERAL',
    quotaScopeId: 'user:me',
    createdAt: '2026-09-01T00:00:00+00:00',
    cloneable: false,
  },
  accessControl: { permission: 'READ_WRITE', ownershipType: 'USER' },
  ownership: { userId: ME, projectId: null, creatorEmail: 'me@lablup.com' },
  ...overrides,
});

describe('toLegacyVFolder', () => {
  it('maps a user folder onto the REST row shape', () => {
    expect(toLegacyVFolder(node(), ME)).toMatchObject({
      id: VFOLDER.replace(/-/g, ''),
      name: 'datasets',
      status: 'ready',
      usage_mode: 'general',
      permission: 'rw',
      ownership_type: 'user',
      type: 'user',
      is_owner: true,
      user: ME,
      group: null,
      creator: 'me@lablup.com',
      host: 'local:volume1',
      created_at: '2026-09-01T00:00:00+00:00',
    });
  });

  it('keeps a project folder mountable through the project gate', () => {
    const row = toLegacyVFolder(
      node({
        accessControl: { permission: 'READ_ONLY', ownershipType: 'GROUP' },
        ownership: { userId: null, projectId: PROJECT, creatorEmail: null },
        status: 'DELETE_PENDING',
        metadata: {
          ...node().metadata,
          usageMode: 'MODEL',
          quotaScopeId: null,
        },
      }),
      ME,
    );
    expect(row).toMatchObject({
      ownership_type: 'group',
      group: PROJECT,
      user: null,
      permission: 'ro',
      status: 'delete-pending',
      usage_mode: 'model',
      quota_scope_id: '',
      creator: '',
      is_owner: false,
    });
  });

  it('reports someone else`s user folder as not owned', () => {
    expect(
      toLegacyVFolder(
        node({
          ownership: { userId: OTHER, projectId: null, creatorEmail: null },
        }),
        ME,
      ).is_owner,
    ).toBe(false);
  });
});
