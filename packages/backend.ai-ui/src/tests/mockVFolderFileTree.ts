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

/** A folder as the mount-folder queries return it, flattened for fixtures. */
export interface MockMountFolder {
  /** The vfolder UUID. */
  id: string;
  name: string;
  host: string;
  status: string;
  usageMode: string;
  /** The caller's mount level: READ_ONLY, READ_WRITE, RW_DELETE or NONE. */
  permission: string;
  ownershipType: 'USER' | 'GROUP';
  projectId: string | null;
  creatorEmail: string | null;
  createdAt: string;
}

/**
 * A mount folder with every field filled in, so a story only has to name the
 * handful that its gate or filter actually reads.
 */
export const mockMountFolder = (
  folder: Pick<MockMountFolder, 'id' | 'name'> & Partial<MockMountFolder>,
): MockMountFolder => ({
  host: 'local:volume1',
  status: 'READY',
  usageMode: 'GENERAL',
  permission: 'RW_DELETE',
  ownershipType: 'USER',
  projectId: null,
  creatorEmail: 'user@lablup.com',
  createdAt: '2026-07-01T11:20:00+00:00',
  ...folder,
});

export const MOCK_PROJECT_ID = '99999999-9999-9999-9999-999999999999';
const MOCK_OTHER_PROJECT_ID = '88888888-8888-8888-8888-888888888888';

/** Only `local:volume1` grants `mount-in-session`, so `archive:cold` is gated out. */
export const MOCK_MOUNTABLE_HOSTS: Array<string> = ['local:volume1'];

/**
 * The shared folder fixture: two mountable folders, one auto-mounted dotfile,
 * one on a host without `mount-in-session`, and one owned by another project,
 * so a story exercises every gate the mount config input applies.
 */
export const mockMountFolders: Array<MockMountFolder> = [
  mockMountFolder({
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeffff0001',
    name: 'my-project-data',
  }),
  mockMountFolder({
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeffff0002',
    name: 'shared-datasets',
    ownershipType: 'GROUP',
    projectId: MOCK_PROJECT_ID,
    creatorEmail: null,
  }),
  mockMountFolder({
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeffff0003',
    name: '.config',
  }),
  mockMountFolder({
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeffff0004',
    name: 'cold-archive',
    host: 'archive:cold',
  }),
  mockMountFolder({
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeffff0005',
    name: 'other-team-data',
    ownershipType: 'GROUP',
    projectId: MOCK_OTHER_PROJECT_ID,
    creatorEmail: null,
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
 * so file-explorer and folder-picker stories run without a backend. The trees are mutated in
 * place — hand a fresh copy per Storybook instance.
 */
export const createMockVFolderFileClient = (
  trees: MockVFolderFileTrees,
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
    throw new Error(`Unmocked request: ${request.method} ${request.url}`);
  };

  return {
    vfolder: mockVFolder,
    isManagerVersionCompatibleWith: () => false,
    newSignedRequest,
    _wrapWithPromise,
    _config: {
      isDirectorySizeVisible: false,
      domainName: 'default',
    },
  } as unknown as BAIClient;
};
