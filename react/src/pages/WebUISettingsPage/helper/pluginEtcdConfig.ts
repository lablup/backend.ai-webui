/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Manager plugin configuration in etcd (`config/plugins/<group>/<name>/…`),
 read and written through the superadmin `/config/get|set|delete` API.
 The contract every provider editor follows is ADR 0038.
 */

/** A prefix read: every leaf is a string, keys are already unquoted. */
export type PluginConfigTree = { [key: string]: string | PluginConfigTree };

/** Paths are relative to `config/plugins/`, `/`-separated, segments quoted. */
export interface PluginConfigChange {
  set: Record<string, string>;
  remove: Array<string>;
  /** Subtrees replaced wholesale, deleted before `set` runs. */
  removeTree: Array<string>;
}

export interface PluginSettingClient {
  setting: {
    list: (prefix: string) => Promise<{ result?: unknown }>;
    set: (key: string, value: unknown) => Promise<{ result?: unknown }>;
    delete: (key: string, prefix?: boolean) => Promise<{ result?: unknown }>;
  };
}

/** `mismatch`: two copies of one secret where only one is set, or they differ. */
export type PluginSecretStatus = 'set' | 'unset' | 'mismatch';

/** The manager rejects one `/config/set` call with more leaves than this. */
export const PLUGIN_CONFIG_SET_CHUNK = 16;

export const emptyPluginConfigChange = (): PluginConfigChange => ({
  set: {},
  remove: [],
  removeTree: [],
});

/** Quotes a key segment the way the manager's `unquote` reads it back. */
export const quotePluginConfigKey = (segment: string): string =>
  encodeURIComponent(segment);

const isTree = (value: unknown): value is PluginConfigTree =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const readPluginConfig = async (
  client: PluginSettingClient,
  root: string,
): Promise<PluginConfigTree> => {
  const { result } = await client.setting.list(`plugins/${root}/`);
  return isTree(result) ? result : {};
};

export const getPluginConfigLeaf = (
  tree: PluginConfigTree,
  path: ReadonlyArray<string>,
): string | undefined => {
  let node: string | PluginConfigTree | undefined = tree;
  for (const segment of path) {
    if (!isTree(node)) return undefined;
    node = node[segment];
  }
  // A key that is also a prefix keeps its own value under ''.
  if (isTree(node)) node = node[''];
  return typeof node === 'string' ? node : undefined;
};

export const getPluginConfigSubtree = (
  tree: PluginConfigTree,
  path: ReadonlyArray<string>,
): PluginConfigTree => {
  let node: string | PluginConfigTree | undefined = tree;
  for (const segment of path) {
    if (!isTree(node)) return {};
    node = node[segment];
  }
  return isTree(node) ? node : {};
};

export const isPluginConfigChangeEmpty = (change: PluginConfigChange) =>
  Object.keys(change.set).length === 0 &&
  change.remove.length === 0 &&
  change.removeTree.length === 0;

/** Deletes first, then writes the leaves in transactions of at most 16. */
export const applyPluginConfigChange = async (
  client: PluginSettingClient,
  change: PluginConfigChange,
): Promise<void> => {
  for (const path of change.removeTree) {
    await client.setting.delete(`plugins/${path}/`, true);
  }
  for (const path of change.remove) {
    await client.setting.delete(`plugins/${path}`);
  }
  const entries = Object.entries(change.set);
  for (let i = 0; i < entries.length; i += PLUGIN_CONFIG_SET_CHUNK) {
    await client.setting.set(
      'plugins',
      Object.fromEntries(entries.slice(i, i + PLUGIN_CONFIG_SET_CHUNK)),
    );
  }
};

/** http(s) URL check for plugin URL fields; `{tenantid}` placeholders parse. */
export const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};
