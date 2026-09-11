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
 * so file-explorer stories browse and mutate directories without a backend.
 * The trees are mutated in place — hand a fresh copy per Storybook instance.
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

  return {
    vfolder: mockVFolder,
    supports: () => false,
    _config: { isDirectorySizeVisible: false },
  } as unknown as BAIClient;
};
