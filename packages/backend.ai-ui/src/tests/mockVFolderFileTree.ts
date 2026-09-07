import type { LegacyVFolder } from '../components/baiClient/BAILegacyVFolderSelect';
import type {
  BAIClient,
  VFolderFile,
} from '../components/provider/BAIClientProvider/types';

/**
 * Directory trees keyed by vfolder UUID, then by the same path notation
 * `useSearchVFolderFiles` uses ('.' = root, 'a/b' below it).
 */
export type MockVFolderFileTrees = Record<
  string,
  Record<string, Array<VFolderFile>>
>;

export const mockVFolderFile = (
  name: string,
  type: VFolderFile['type'],
  modified: string,
): VFolderFile => ({
  name,
  type,
  size: type === 'FILE' ? 4096 : 0,
  mode: 0o755,
  created: modified,
  modified,
});

/**
 * A REST `GET /folders` row with every field filled in, so a story only has
 * to name the handful that its gate or filter actually reads.
 */
export const mockLegacyVFolder = (
  folder: Pick<LegacyVFolder, 'id' | 'name'> & Partial<LegacyVFolder>,
): LegacyVFolder => ({
  quota_scope_id: 'project:00000000-0000-0000-0000-000000000000',
  host: 'local:volume1',
  status: 'ready',
  usage_mode: 'general',
  created_at: '2026-07-01T11:20:00+00:00',
  is_owner: true,
  permission: 'wd',
  user: null,
  group: null,
  creator: 'user@lablup.com',
  user_email: 'user@lablup.com',
  group_name: null,
  ownership_type: 'user',
  type: 'user',
  cloneable: false,
  max_files: 1000,
  max_size: null,
  cur_size: 0,
  ...folder,
});

export const MOCK_LEGACY_PROJECT_ID = '99999999-9999-9999-9999-999999999999';
export const MOCK_LEGACY_OTHER_PROJECT_ID =
  '88888888-8888-8888-8888-888888888888';

/** Only `local:volume1` grants `mount-in-session`, so `archive:cold` is gated out. */
export const MOCK_MOUNTABLE_HOSTS: Array<string> = ['local:volume1'];

/**
 * The shared REST folder fixture: two mountable folders, one auto-mounted
 * dotfile, one on a host without `mount-in-session`, and one owned by another
 * project — so a story exercises every gate BAILegacyVFolderSelect applies.
 */
export const mockLegacyVFolders: Array<LegacyVFolder> = [
  mockLegacyVFolder({
    id: 'aaaaaaaabbbbccccddddeeeeffff0001',
    name: 'my-project-data',
  }),
  mockLegacyVFolder({
    id: 'aaaaaaaabbbbccccddddeeeeffff0002',
    name: 'shared-datasets',
    ownership_type: 'group',
    type: 'group',
    group: MOCK_LEGACY_PROJECT_ID,
    group_name: 'default',
  }),
  mockLegacyVFolder({
    id: 'aaaaaaaabbbbccccddddeeeeffff0003',
    name: '.config',
  }),
  mockLegacyVFolder({
    id: 'aaaaaaaabbbbccccddddeeeeffff0004',
    name: 'cold-archive',
    host: 'archive:cold',
  }),
  mockLegacyVFolder({
    id: 'aaaaaaaabbbbccccddddeeeeffff0005',
    name: 'other-team-data',
    ownership_type: 'group',
    type: 'group',
    group: MOCK_LEGACY_OTHER_PROJECT_ID,
    group_name: 'other-team',
  }),
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const splitJoinedPath = (joined: string) => {
  const parts = joined.split('/').filter((p) => p !== '');
  const name = parts.pop() ?? '';
  const parentParts = parts.filter((p) => p !== '.');
  return {
    parent: parentParts.length === 0 ? '.' : parentParts.join('/'),
    name,
  };
};

const childKey = (parent: string, name: string) =>
  parent === '.' ? name : `${parent}/${name}`;

/**
 * A BAIClient whose `vfolder` file APIs (`list_files` / `mkdir` /
 * `rename_file` / `delete_files`) read and write the given in-memory trees,
 * and whose signed `GET /folders` request answers `folders`, so file-explorer
 * and folder-picker stories run without a backend. The trees are mutated in
 * place — hand a fresh copy per Storybook instance.
 */
export const createMockVFolderFileClient = (
  trees: MockVFolderFileTrees,
  folders?: Array<LegacyVFolder>,
): BAIClient => {
  const mockVFolder = {
    list_files: async (path: string, id: string) => {
      await delay(250);
      return { items: trees[id]?.[path] ?? [] };
    },
    mkdir: async (path: string, id: string | null) => {
      await delay(250);
      const tree = trees[id ?? ''];
      const { parent, name } = splitJoinedPath(path);
      if (!tree || !name) throw new Error('Invalid path');
      if (tree[parent]?.some((item) => item.name === name)) {
        throw new Error(`Directory already exists: ${name}`);
      }
      tree[parent] = [
        mockVFolderFile(name, 'DIRECTORY', '2026-07-29T12:00:00'),
        ...(tree[parent] ?? []),
      ];
      tree[childKey(parent, name)] = [];
      return {};
    },
    rename_file: async (
      target_path: string,
      new_name: string,
      targetFolder: string,
    ) => {
      await delay(250);
      const tree = trees[targetFolder];
      const { parent, name } = splitJoinedPath(target_path);
      const item = tree?.[parent]?.find((i) => i.name === name);
      if (!tree || !item) throw new Error('Not found');
      item.name = new_name;
      const oldKey = childKey(parent, name);
      const newKey = childKey(parent, new_name);
      for (const key of Object.keys(tree)) {
        if (key === oldKey || key.startsWith(`${oldKey}/`)) {
          tree[key.replace(oldKey, newKey)] = tree[key];
          delete tree[key];
        }
      }
      return {};
    },
    delete_files: async (
      files: Array<string>,
      _recursive: boolean,
      id: string,
    ) => {
      await delay(250);
      const tree = trees[id];
      if (!tree) throw new Error('Not found');
      for (const file of files) {
        const { parent, name } = splitJoinedPath(file);
        tree[parent] = (tree[parent] ?? []).filter((i) => i.name !== name);
        const key = childKey(parent, name);
        for (const treeKey of Object.keys(tree)) {
          if (treeKey === key || treeKey.startsWith(`${key}/`)) {
            delete tree[treeKey];
          }
        }
      }
      return { bgtask_id: null };
    },
    request_download_token: async () => {
      throw new Error('Download is not available in Storybook');
    },
  };

  // `useBAISignedRequestWithPromise` builds a request object and hands it to
  // `_wrapWithPromise`, so the pair below is the whole REST seam.
  const newSignedRequest = (method: string, url: string) => ({ method, url });
  const _wrapWithPromise = async (request: { method: string; url: string }) => {
    await delay(250);
    if (request.url.startsWith('/folders')) {
      return folders ?? [];
    }
    throw new Error(`Unmocked request: ${request.method} ${request.url}`);
  };

  return {
    vfolder: mockVFolder,
    supports: () => false,
    newSignedRequest,
    _wrapWithPromise,
    _config: {
      isDirectorySizeVisible: false,
      domainName: 'default',
    },
  } as unknown as BAIClient;
};
