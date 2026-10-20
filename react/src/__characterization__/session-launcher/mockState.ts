/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Scenario state and `vi.mock` factories for the session-launcher
 * characterization suite. This module imports nothing from the app, so a
 * test file's `vi.mock` factory can `await import('./mockState')` without
 * re-entering the module it is mocking.
 */
import { useSyncExternalStore } from 'react';

export type SlotDetail = {
  slot_name?: string;
  human_readable_name: string;
  display_unit: string;
  description?: string;
};

export type RestPreset = {
  id: string;
  name: string;
  resource_slots: Record<string, string>;
  shared_memory: string | null;
  allocatable?: boolean;
};

export type GqlPreset = {
  id: string;
  name: string;
  resource_slots: string;
  shared_memory: string | null;
  scaling_group_name: string | null;
};

export type CheckPresetsResult = {
  presets: RestPreset[];
  keypair_limits: Record<string, string>;
  keypair_using: Record<string, string>;
  keypair_remaining: Record<string, string>;
  group_limits: Record<string, string>;
  group_using: Record<string, string>;
  group_remaining: Record<string, string>;
  scaling_group_remaining: Record<string, string>;
  scaling_groups: Record<string, unknown>;
};

export interface Scenario {
  config: Record<string, unknown>;
  /** `get_resource_slots()` — every slot the manager knows. */
  resourceSlots: Record<string, string>;
  /** `/config/resource-slots/details?sgroup=` per RG; `undefined` = loading. */
  slotsByRG: Record<string, Record<string, SlotDetail> | undefined>;
  /** REST `/scaling-groups?group=` (useProjectResourceGroups). */
  projectResourceGroups: Array<{ name: string }>;
  /** Relay `accessible_scaling_groups`. */
  scalingGroups: Array<{
    name: string;
    is_active: boolean;
    accelerator_quantum_size: number | null;
    resource_allocation_limit_for_sessions: string | null;
  }>;
  /** Relay `resource_presets` (both RAFI's and the select's query). */
  gqlPresets: GqlPreset[];
  /** REST `resourcePreset.check(params)`. A promise lets a test hold it. */
  checkPresets: (params: {
    group: string;
    scaling_group?: string;
  }) => CheckPresetsResult | Promise<CheckPresetsResult | null> | null;
  agents: Array<{
    id: string;
    status: string;
    schedulable: boolean;
    available_slots: string;
    occupied_slots: string;
    architecture: string;
  }>;
  /** Relay `images` for IESFI / image resolution. */
  images: Array<Record<string, unknown>>;
  keypairPolicy: {
    max_containers_per_session: number;
    max_concurrent_sessions: number;
  };
  /** RGs a storage volume designates for SFTP (`sftp_scaling_groups`). */
  sftpResourceGroups: string[];
  /** What the empty-mounts launch confirm resolves to. */
  confirmLaunch: boolean;
  currentProject: { id: string; name: string };
  globalResourceGroup: string | null;
  settings: Record<string, unknown>;
  version: number;
}

export const BASE_SLOT_DETAILS: Record<string, SlotDetail> = {
  cpu: { human_readable_name: 'CPU', display_unit: 'Core' },
  mem: { human_readable_name: 'RAM', display_unit: 'GiB' },
};

export const ACCEL_SLOT_DETAILS: Record<string, SlotDetail> = {
  ...BASE_SLOT_DETAILS,
  'cuda.device': { human_readable_name: 'GPU', display_unit: 'GPU' },
  'cuda.shares': { human_readable_name: 'fGPU', display_unit: 'FGPU' },
};

export const emptyCheck = (
  overrides: Partial<CheckPresetsResult> = {},
): CheckPresetsResult => ({
  presets: [],
  keypair_limits: { cpu: 'Infinity', mem: 'Infinity' },
  keypair_using: { cpu: '0', mem: '0' },
  keypair_remaining: { cpu: 'Infinity', mem: 'Infinity' },
  group_limits: { cpu: 'Infinity', mem: 'Infinity' },
  group_using: { cpu: '0', mem: '0' },
  group_remaining: { cpu: 'Infinity', mem: 'Infinity' },
  scaling_group_remaining: { cpu: 'Infinity', mem: 'Infinity' },
  scaling_groups: {},
  ...overrides,
});

const defaultScenario = (): Scenario => ({
  config: {
    allowCustomResourceAllocation: true,
    maxCPUCoresPerContainer: 64,
    maxMemoryPerContainer: 64,
    maxCUDADevicesPerContainer: 8,
    maxCUDASharesPerContainer: 8,
    maxCountForPreopenPorts: 10,
    domainName: 'default',
    accessKey: 'AKTEST',
    hideAgents: false,
    allowManualImageNameForSession: false,
  },
  resourceSlots: { cpu: 'count', mem: 'bytes' },
  slotsByRG: { 'rg-a': BASE_SLOT_DETAILS, 'rg-b': BASE_SLOT_DETAILS },
  projectResourceGroups: [{ name: 'rg-a' }, { name: 'rg-b' }],
  scalingGroups: [
    {
      name: 'rg-a',
      is_active: true,
      accelerator_quantum_size: null,
      resource_allocation_limit_for_sessions: null,
    },
    {
      name: 'rg-b',
      is_active: true,
      accelerator_quantum_size: null,
      resource_allocation_limit_for_sessions: null,
    },
  ],
  gqlPresets: [],
  checkPresets: () => emptyCheck(),
  agents: [],
  images: [],
  keypairPolicy: { max_containers_per_session: 4, max_concurrent_sessions: 5 },
  sftpResourceGroups: [],
  confirmLaunch: true,
  currentProject: { id: 'project-id', name: 'project-a' },
  globalResourceGroup: 'rg-a',
  settings: {},
  version: 0,
});

export const scenario: Scenario = defaultScenario();

const listeners = new Set<() => void>();

export const resetScenario = (overrides: Partial<Scenario> = {}) => {
  Object.assign(scenario, defaultScenario(), overrides);
  client = undefined;
  spies.createIfNotExists.length = 0;
  spies.checkPresetsCalls.length = 0;
  spies.navigate.length = 0;
  spies.confirm.length = 0;
  pageRefs.form = undefined;
  pageRefs.template = undefined;
  pageRefs.historyPushes.length = 0;
};

/** Page-level handles filled by the stubs in `./pageStubs`. */
export const pageRefs: {
  form?: any;
  /** Template the stubbed SessionTemplateModal hands back on "apply". */
  template?: Record<string, unknown>;
  historyPushes: unknown[];
} = { historyPushes: [] };

export const registerPageForm = (form: unknown) => {
  pageRefs.form = form;
};

export const mockRecentSessionHistoryModule = () => ({
  useRecentSessionHistory: () => [
    [],
    {
      push: (entry: unknown) => {
        pageRefs.historyPushes.push(entry);
      },
      remove: () => {},
      clear: () => {},
      rename: () => {},
    },
  ],
  usePinnedSessionHistory: () => [[], {}],
});

export const mockThemeModeModule = (original: Record<string, unknown>) => ({
  ...original,
  useThemeMode: () => ({
    isDarkMode: false,
    themeMode: 'light',
    setThemeMode: () => {},
  }),
});

export const mockAppShimModule = (original: Record<string, unknown>) => {
  const api = {
    message: {
      warning: () => {},
      error: () => {},
      info: () => {},
      success: () => {},
      open: () => {},
      destroy: () => {},
    },
    modal: {
      confirm: (config: unknown) => {
        spies.confirm.push(config);
        return Promise.resolve(scenario.confirmLaunch);
      },
      error: () => {},
      info: () => {},
      warning: () => {},
    },
  };
  return { ...original, App: { useApp: () => api }, useApp: () => api };
};

/** Mutate the scenario and re-render every component reading it. */
export const updateScenario = (mutate: (s: Scenario) => void) => {
  mutate(scenario);
  scenario.version += 1;
  listeners.forEach((l) => l());
};

const useScenarioVersion = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => scenario.version,
  );

export const spies = {
  createIfNotExists: [] as unknown[][],
  checkPresetsCalls: [] as unknown[],
  navigate: [] as unknown[],
  confirm: [] as unknown[],
};

let client: Record<string, unknown> | undefined;
/** One stable client per scenario: RAFI keys effects on `_config`. */
export const getClient = () => {
  if (!client) {
    client = {
      _config: scenario.config,
      resourcePreset: {
        check: (params: { group: string; scaling_group?: string }) => {
          spies.checkPresetsCalls.push(params);
          return Promise.resolve(scenario.checkPresets(params));
        },
      },
      get_resource_slots: () => Promise.resolve(scenario.resourceSlots),
      createIfNotExists: (...args: unknown[]) => {
        spies.createIfNotExists.push(args);
        return Promise.resolve({
          created: true,
          status: 'PENDING',
          sessionId: 'sid-' + spies.createIfNotExists.length,
        });
      },
      isManagerVersionCompatibleWith: () => true,
      supports: () => true,
    };
  }
  return client;
};

export const mockHooksModule = (original: Record<string, unknown>) => ({
  ...original,
  useSuspendedBackendaiClient: () => getClient(),
  useWebUINavigate: () => (to: unknown) => {
    spies.navigate.push(to);
  },
});

export const mockBackendaiHooksModule = (
  original: Record<string, unknown>,
) => ({
  ...original,
  useResourceSlots: () => {
    useScenarioVersion();
    return [scenario.resourceSlots, { refresh: () => {} }] as const;
  },
  useResourceSlotsDetails: (resourceGroupName?: string) => {
    useScenarioVersion();
    const resourceSlotsInRG = resourceGroupName
      ? scenario.slotsByRG[resourceGroupName]
      : undefined;
    const merged = Object.assign(
      {},
      ...Object.values(scenario.slotsByRG).filter(Boolean),
    );
    return {
      resourceSlotsInRG,
      deviceMetaData: undefined,
      mergedResourceSlots: { ...merged, ...(resourceSlotsInRG ?? {}) },
      refresh: () => {},
      isLoading: resourceSlotsInRG === undefined,
    };
  },
});

export const mockHooksUsingRelayModule = (
  original: Record<string, unknown>,
) => ({
  ...original,
  useCurrentKeyPairResourcePolicyLazyLoadQuery: () => [
    { keypairResourcePolicy: scenario.keypairPolicy },
    () => {},
  ],
});

export const mockCurrentProjectModule = (
  original: Record<string, unknown>,
) => ({
  ...original,
  useCurrentProjectValue: () => scenario.currentProject,
  useCurrentResourceGroupState: () => [
    scenario.globalResourceGroup,
    (rg: string) => {
      scenario.globalResourceGroup = rg;
    },
  ],
  useCurrentResourceGroupValue: () => scenario.globalResourceGroup,
  useResourceGroupsForCurrentProject: () => ({
    nonSftpResourceGroups: scenario.projectResourceGroups,
    resourceGroups: scenario.projectResourceGroups,
  }),
});

const cachedGroups = new Map<string, Array<{ name: string }>>();
export const mockProjectResourceGroupsModule = (
  original: Record<string, unknown>,
) => ({
  ...original,
  useProjectResourceGroups: (_projectName: string, options?: unknown) => {
    useScenarioVersion();
    const select = original.selectProjectResourceGroups as (
      groups: Array<{ name: string }>,
      volumeInfo: Record<string, { sftp_scaling_groups: string[] }>,
      options?: unknown,
    ) => Array<{ name: string }>;
    const value = select(
      scenario.projectResourceGroups,
      { volume: { sftp_scaling_groups: scenario.sftpResourceGroups } },
      options,
    );
    // Stable identity per content: BAIProjectResourceGroupSelect keys an effect on it.
    const key = JSON.stringify(value);
    if (!cachedGroups.has(key)) cachedGroups.set(key, value);
    return { resourceGroups: cachedGroups.get(key)! };
  },
});

export const i18nMock = async () => {
  const React = await import('react');
  return {
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
      ready: true,
    }),
    Trans: (props: { i18nKey?: string }) =>
      React.createElement('span', null, props.i18nKey),
    initReactI18next: { type: '3rdParty', init: () => {} },
  };
};
