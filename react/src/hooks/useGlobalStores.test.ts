/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for useGlobalStores hooks.
 *
 * These hooks are thin wrappers that return the singleton store instances
 * created in global-stores.ts. The tests verify that each hook returns the
 * correct singleton and that the returned objects expose the expected API.
 */
import {
  backendaiOptions,
  backendaiMetadata,
  backendaiTasker,
  backendaiUtils,
} from '../global-stores';
import {
  useBackendAISettingsStore,
  useBackendAIMetadataStore,
  useBackendAITasker,
  useBackendAICommonUtils,
} from './useGlobalStores';

describe('useBackendAISettingsStore', () => {
  it('returns the backendaiOptions singleton', () => {
    const store = useBackendAISettingsStore();
    expect(store).toBe(backendaiOptions);
  });

  it('returned store has a get method', () => {
    const store = useBackendAISettingsStore();
    expect(typeof store.get).toBe('function');
  });

  it('returned store has a set method', () => {
    const store = useBackendAISettingsStore();
    expect(typeof store.set).toBe('function');
  });

  it('returned store has a delete method', () => {
    const store = useBackendAISettingsStore();
    expect(typeof store.delete).toBe('function');
  });

  it('returned store has an exists method', () => {
    const store = useBackendAISettingsStore();
    expect(typeof store.exists).toBe('function');
  });

  it('returned store has a readSettings method', () => {
    const store = useBackendAISettingsStore();
    expect(typeof store.readSettings).toBe('function');
  });
});

describe('useBackendAIMetadataStore', () => {
  it('returns the backendaiMetadata singleton', () => {
    const store = useBackendAIMetadataStore();
    expect(store).toBe(backendaiMetadata);
  });

  it('returned store has a readImageMetadata method', () => {
    const store = useBackendAIMetadataStore();
    expect(typeof store.readImageMetadata).toBe('function');
  });

  it('returned store has a readDeviceMetadata method', () => {
    const store = useBackendAIMetadataStore();
    expect(typeof store.readDeviceMetadata).toBe('function');
  });

  it('returned store exposes imageInfo property', () => {
    const store = useBackendAIMetadataStore();
    // imageInfo may be {} (initial) or have been partially populated by an
    // async constructor fetch; in either case the property exists on the store
    expect('imageInfo' in store).toBe(true);
  });
});

describe('useBackendAITasker', () => {
  it('returns the backendaiTasker singleton', () => {
    const tasker = useBackendAITasker();
    expect(tasker).toBe(backendaiTasker);
  });

  it('returned tasker has an add method', () => {
    const tasker = useBackendAITasker();
    expect(typeof tasker.add).toBe('function');
  });

  it('returned tasker has a remove method', () => {
    const tasker = useBackendAITasker();
    expect(typeof tasker.remove).toBe('function');
  });

  it('returned tasker has a list method', () => {
    const tasker = useBackendAITasker();
    expect(typeof tasker.list).toBe('function');
  });

  it('returned tasker has a gc method', () => {
    const tasker = useBackendAITasker();
    expect(typeof tasker.gc).toBe('function');
  });

  it('returned tasker has a signal method', () => {
    const tasker = useBackendAITasker();
    expect(typeof tasker.signal).toBe('function');
  });
});

describe('useBackendAICommonUtils', () => {
  it('returns the backendaiUtils singleton', () => {
    const utils = useBackendAICommonUtils();
    expect(utils).toBe(backendaiUtils);
  });

  it('returned utils has _humanReadableFileSize method', () => {
    const utils = useBackendAICommonUtils();
    expect(typeof utils._humanReadableFileSize).toBe('function');
  });

  it('returned utils has _maskString method', () => {
    const utils = useBackendAICommonUtils();
    expect(typeof utils._maskString).toBe('function');
  });

  it('returned utils has isEmpty method', () => {
    const utils = useBackendAICommonUtils();
    expect(typeof utils.isEmpty).toBe('function');
  });

  it('returned utils has deleteNestedKeyFromObject method', () => {
    const utils = useBackendAICommonUtils();
    expect(typeof utils.deleteNestedKeyFromObject).toBe('function');
  });

  it('returned utils has mergeNestedObjects method', () => {
    const utils = useBackendAICommonUtils();
    expect(typeof utils.mergeNestedObjects).toBe('function');
  });
});

describe('Hook singleton identity across multiple calls', () => {
  it('useBackendAISettingsStore returns the same instance on each call', () => {
    expect(useBackendAISettingsStore()).toBe(useBackendAISettingsStore());
  });

  it('useBackendAIMetadataStore returns the same instance on each call', () => {
    expect(useBackendAIMetadataStore()).toBe(useBackendAIMetadataStore());
  });

  it('useBackendAITasker returns the same instance on each call', () => {
    expect(useBackendAITasker()).toBe(useBackendAITasker());
  });

  it('useBackendAICommonUtils returns the same instance on each call', () => {
    expect(useBackendAICommonUtils()).toBe(useBackendAICommonUtils());
  });
});
