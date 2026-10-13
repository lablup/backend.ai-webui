import {
  fetchAllMyVfolders,
  toVFolderListItem,
  type MyVfolderNode,
} from './useSuspendedMyVFolders';
import { createMockEnvironment } from 'relay-test-utils';
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

describe('toVFolderListItem', () => {
  it('maps a user folder onto the list row shape', () => {
    expect(toVFolderListItem(node(), ME)).toMatchObject({
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
    const row = toVFolderListItem(
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
      toVFolderListItem(
        node({
          ownership: { userId: OTHER, projectId: null, creatorEmail: null },
        }),
        ME,
      ).is_owner,
    ).toBe(false);
  });
});

describe('fetchAllMyVfolders', () => {
  it('sizes the remaining pages from the first count and keeps their order', async () => {
    const TOTAL = 250;
    const environment = createMockEnvironment();
    const offsets: Array<number> = [];
    const answerPending = () =>
      environment.mock.getAllOperations().forEach((operation) => {
        const { limit, offset } = operation.request.variables;
        offsets.push(offset);
        const length = Math.max(0, Math.min(limit, TOTAL - offset));
        environment.mock.resolve(operation, {
          data: {
            myVfolders: {
              count: TOTAL,
              edges: Array.from({ length }, (_, index) => ({
                node: {
                  ...node(),
                  id: btoa(
                    `VFolder:00000000-0000-0000-0000-${String(offset + index).padStart(12, '0')}`,
                  ),
                  metadata: { ...node().metadata, name: `f${offset + index}` },
                },
              })),
            },
          },
        });
      });

    const result = fetchAllMyVfolders(environment, ME);
    answerPending();
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
    // Both remaining pages are in flight together, before either answers.
    expect(environment.mock.getAllOperations()).toHaveLength(2);
    answerPending();

    const folders = await result;
    expect(offsets).toEqual([0, 100, 200]);
    expect(folders).toHaveLength(TOTAL);
    expect(folders.map((folder) => folder.name)).toEqual(
      Array.from({ length: TOTAL }, (_, index) => `f${index}`),
    );
  });

  it('stops after the first page when it holds everything', async () => {
    const environment = createMockEnvironment();
    const result = fetchAllMyVfolders(environment, ME);
    environment.mock.resolveMostRecentOperation({
      data: { myVfolders: { count: 1, edges: [{ node: node() }] } },
    });
    expect(await result).toHaveLength(1);
    expect(environment.mock.getAllOperations()).toHaveLength(0);
  });
});
