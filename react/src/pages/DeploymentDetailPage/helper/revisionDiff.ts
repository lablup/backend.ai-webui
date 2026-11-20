/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

type Maybe<T> = T | null | undefined;
type Entries = Maybe<ReadonlyArray<{ name?: Maybe<string>; value?: unknown }>>;

/** The `ModelRevision` fields the compare view reads, all optional. */
export interface RevisionDiffInput {
  clusterConfig?: Maybe<{ mode?: Maybe<string>; size?: Maybe<number> }>;
  resourceSlots?: Maybe<
    ReadonlyArray<{ slotName?: Maybe<string>; quantity?: unknown }>
  >;
  resourceConfig?: Maybe<{ resourceOpts?: Maybe<{ entries?: Entries }> }>;
  modelRuntimeConfig?: Maybe<{
    runtimeVariant?: Maybe<{ name?: Maybe<string> }>;
    inferenceRuntimeConfig?: unknown;
    environ?: Maybe<{ entries?: Entries }>;
    runtimeVariantPresetValues?: Maybe<
      ReadonlyArray<{
        presetId: string;
        value?: Maybe<string>;
        preset?: Maybe<{
          name?: Maybe<string>;
          displayName?: Maybe<string>;
          targetSpec?: Maybe<{ key?: Maybe<string> }>;
        }>;
      }>
    >;
  }>;
  modelMountConfig?: Maybe<{
    vfolderId?: Maybe<string>;
    mountDestination?: Maybe<string>;
    definitionPath?: Maybe<string>;
    subpath?: Maybe<string>;
    vfolder?: Maybe<{ name?: Maybe<string> }>;
  }>;
  extraMounts?: Maybe<
    ReadonlyArray<{
      vfolderId: string;
      mountDestination?: Maybe<string>;
      mountPerm?: Maybe<string>;
      vfolder?: Maybe<{ name?: Maybe<string> }>;
    }>
  >;
  imageV2?: Maybe<{
    identity?: Maybe<{
      canonicalName?: Maybe<string>;
      architecture?: Maybe<string>;
    }>;
  }>;
  modelDefinition?: Maybe<{
    models?: Maybe<
      ReadonlyArray<{
        name?: Maybe<string>;
        modelPath?: Maybe<string>;
        service?: Maybe<{
          command?: Maybe<string>;
          port?: Maybe<number>;
        }>;
      }>
    >;
  }>;
}

export type RevisionDiffGroup =
  'image' | 'resources' | 'runtime' | 'environ' | 'mounts' | 'modelDefinition';

export type RevisionDiffStatus = 'added' | 'removed' | 'changed' | 'same';

/**
 * `field` names a fixed setting (the view maps it to a label); `name` is the
 * per-entry key for keyed settings (env var name, slot name, JSON path, …).
 */
export interface RevisionDiffRow {
  group: RevisionDiffGroup;
  key: string;
  field: string;
  name?: string;
  left: string | null;
  right: string | null;
  status: RevisionDiffStatus;
  isSecret?: boolean;
}

export const REVISION_DIFF_GROUPS: ReadonlyArray<RevisionDiffGroup> = [
  'image',
  'resources',
  'runtime',
  'environ',
  'mounts',
  'modelDefinition',
];

const toText = (value: unknown): string | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value);
};

const statusOf = (
  left: string | null,
  right: string | null,
): RevisionDiffStatus => {
  if (left === right) return 'same';
  if (left === null) return 'added';
  if (right === null) return 'removed';
  return 'changed';
};

const entriesToMap = (entries: Entries): Map<string, string | null> => {
  const map = new Map<string, string | null>();
  for (const entry of entries ?? []) {
    if (entry?.name) map.set(entry.name, toText(entry.value));
  }
  return map;
};

/** Flattens a JSON value into `a.b[0].c` → leaf text pairs. */
export const flattenJson = (
  value: unknown,
  prefix = '',
  out: Map<string, string | null> = new Map(),
): Map<string, string | null> => {
  let parsed = value;
  if (typeof parsed === 'string' && prefix === '') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      // A non-JSON string is kept as a single leaf.
    }
  }
  if (Array.isArray(parsed)) {
    if (parsed.length === 0 && prefix) out.set(prefix, '[]');
    parsed.forEach((item, index) =>
      flattenJson(item, `${prefix}[${index}]`, out),
    );
  } else if (parsed !== null && typeof parsed === 'object') {
    const keys = Object.keys(parsed);
    if (keys.length === 0 && prefix) out.set(prefix, '{}');
    for (const key of keys) {
      flattenJson(
        (parsed as Record<string, unknown>)[key],
        prefix ? `${prefix}.${key}` : key,
        out,
      );
    }
  } else if (prefix || parsed != null) {
    out.set(prefix, toText(parsed));
  }
  return out;
};

const imageText = (revision: Maybe<RevisionDiffInput>) => {
  const identity = revision?.imageV2?.identity;
  if (!identity?.canonicalName) return null;
  return identity.architecture
    ? `${identity.canonicalName}@${identity.architecture}`
    : identity.canonicalName;
};

const presetMap = (revision: Maybe<RevisionDiffInput>) => {
  const map = new Map<string, { label: string; value: string | null }>();
  for (const entry of revision?.modelRuntimeConfig
    ?.runtimeVariantPresetValues ?? []) {
    map.set(entry.presetId, {
      label:
        entry.preset?.displayName ||
        entry.preset?.name ||
        entry.preset?.targetSpec?.key ||
        entry.presetId,
      value: toText(entry.value),
    });
  }
  return map;
};

const extraMountMap = (revision: Maybe<RevisionDiffInput>) => {
  const map = new Map<string, { label: string; value: string }>();
  for (const mount of revision?.extraMounts ?? []) {
    const destination = mount.mountDestination || '-';
    map.set(mount.vfolderId, {
      label: mount.vfolder?.name || mount.vfolderId,
      value: mount.mountPerm
        ? `${destination} (${mount.mountPerm})`
        : destination,
    });
  }
  return map;
};

const modelMap = (revision: Maybe<RevisionDiffInput>) => {
  const map = new Map<
    string,
    { modelPath: string | null; command: string | null; port: string | null }
  >();
  (revision?.modelDefinition?.models ?? []).forEach((model, index) => {
    map.set(model.name || `#${index + 1}`, {
      modelPath: toText(model.modelPath),
      command: toText(model.service?.command),
      port: toText(model.service?.port),
    });
  });
  return map;
};

const unionKeys = <K>(...maps: ReadonlyArray<Map<K, unknown>>): K[] => {
  const keys: K[] = [];
  for (const map of maps) {
    for (const key of map.keys()) if (!keys.includes(key)) keys.push(key);
  }
  return keys;
};

/**
 * Compares two revisions field by field. `left` is the baseline, `right` the
 * revision being looked at, so `added` means `right` sets what `left` lacks.
 */
export const diffRevisions = (
  left: Maybe<RevisionDiffInput>,
  right: Maybe<RevisionDiffInput>,
): RevisionDiffRow[] => {
  const rows: RevisionDiffRow[] = [];
  const push = (
    group: RevisionDiffGroup,
    field: string,
    l: string | null,
    r: string | null,
    extra: { name?: string; keySuffix?: string; isSecret?: boolean } = {},
  ) => {
    rows.push({
      group,
      key: `${group}:${field}${extra.keySuffix ? `:${extra.keySuffix}` : ''}`,
      field,
      name: extra.name,
      left: l,
      right: r,
      status: statusOf(l, r),
      ...(extra.isSecret ? { isSecret: true } : {}),
    });
  };

  push('image', 'image', imageText(left), imageText(right));

  const leftSlots = new Map<string, string | null>();
  const rightSlots = new Map<string, string | null>();
  for (const slot of left?.resourceSlots ?? []) {
    if (slot.slotName) leftSlots.set(slot.slotName, toText(slot.quantity));
  }
  for (const slot of right?.resourceSlots ?? []) {
    if (slot.slotName) rightSlots.set(slot.slotName, toText(slot.quantity));
  }
  for (const slot of unionKeys(leftSlots, rightSlots)) {
    push(
      'resources',
      'resourceSlot',
      leftSlots.get(slot) ?? null,
      rightSlots.get(slot) ?? null,
      { name: slot, keySuffix: slot },
    );
  }
  const leftOpts = entriesToMap(left?.resourceConfig?.resourceOpts?.entries);
  const rightOpts = entriesToMap(right?.resourceConfig?.resourceOpts?.entries);
  for (const opt of unionKeys(leftOpts, rightOpts)) {
    push(
      'resources',
      'resourceOpt',
      leftOpts.get(opt) ?? null,
      rightOpts.get(opt) ?? null,
      { name: opt, keySuffix: opt },
    );
  }
  push(
    'resources',
    'clusterMode',
    toText(left?.clusterConfig?.mode),
    toText(right?.clusterConfig?.mode),
  );
  push(
    'resources',
    'clusterSize',
    toText(left?.clusterConfig?.size),
    toText(right?.clusterConfig?.size),
  );

  push(
    'runtime',
    'runtimeVariant',
    toText(left?.modelRuntimeConfig?.runtimeVariant?.name),
    toText(right?.modelRuntimeConfig?.runtimeVariant?.name),
  );
  const leftPresets = presetMap(left);
  const rightPresets = presetMap(right);
  for (const presetId of unionKeys(leftPresets, rightPresets)) {
    const l = leftPresets.get(presetId);
    const r = rightPresets.get(presetId);
    push('runtime', 'presetValue', l?.value ?? null, r?.value ?? null, {
      name: r?.label ?? l?.label,
      keySuffix: presetId,
    });
  }
  const leftJson = flattenJson(
    left?.modelRuntimeConfig?.inferenceRuntimeConfig,
  );
  const rightJson = flattenJson(
    right?.modelRuntimeConfig?.inferenceRuntimeConfig,
  );
  for (const path of unionKeys(leftJson, rightJson)) {
    push(
      'runtime',
      'inferenceRuntimeConfig',
      leftJson.get(path) ?? null,
      rightJson.get(path) ?? null,
      { name: path, keySuffix: path },
    );
  }

  const leftEnv = entriesToMap(left?.modelRuntimeConfig?.environ?.entries);
  const rightEnv = entriesToMap(right?.modelRuntimeConfig?.environ?.entries);
  for (const name of unionKeys(leftEnv, rightEnv)) {
    push(
      'environ',
      'environ',
      leftEnv.get(name) ?? null,
      rightEnv.get(name) ?? null,
      {
        name,
        keySuffix: name,
        isSecret: true,
      },
    );
  }

  const leftMount = left?.modelMountConfig;
  const rightMount = right?.modelMountConfig;
  push(
    'mounts',
    'modelFolder',
    toText(leftMount?.vfolder?.name || leftMount?.vfolderId),
    toText(rightMount?.vfolder?.name || rightMount?.vfolderId),
  );
  push(
    'mounts',
    'mountDestination',
    toText(leftMount?.mountDestination),
    toText(rightMount?.mountDestination),
  );
  push(
    'mounts',
    'definitionPath',
    toText(leftMount?.definitionPath),
    toText(rightMount?.definitionPath),
  );
  push(
    'mounts',
    'subpath',
    toText(leftMount?.subpath),
    toText(rightMount?.subpath),
  );
  const leftExtra = extraMountMap(left);
  const rightExtra = extraMountMap(right);
  for (const vfolderId of unionKeys(leftExtra, rightExtra)) {
    const l = leftExtra.get(vfolderId);
    const r = rightExtra.get(vfolderId);
    push('mounts', 'extraMount', l?.value ?? null, r?.value ?? null, {
      name: r?.label ?? l?.label,
      keySuffix: vfolderId,
    });
  }

  const leftModels = modelMap(left);
  const rightModels = modelMap(right);
  for (const modelName of unionKeys(leftModels, rightModels)) {
    const l = leftModels.get(modelName);
    const r = rightModels.get(modelName);
    for (const field of ['modelPath', 'command', 'port'] as const) {
      push('modelDefinition', field, l?.[field] ?? null, r?.[field] ?? null, {
        name: modelName,
        keySuffix: modelName,
      });
    }
  }

  return rows;
};
