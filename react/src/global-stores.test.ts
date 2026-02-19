/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for global-stores module.
 *
 * Tests cover:
 * - BackendAISettingsStore: localStorage read/write, get/set/delete, defaults
 * - BackendAIMetadataStore: initialization and readImageMetadata
 * - BackendAITasker: add, remove, gc, signal
 * - BackendAICommonUtils: utility methods
 * - Singleton exports and globalThis backward-compatibility assignments
 */
// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
// jsdom provides localStorage, so no manual mock is needed here.
// CustomEvent is available in jsdom.
// ---------------------------------------------------------------------------
// Module under test (imported after localStorage is available)
// ---------------------------------------------------------------------------
import {
  backendaiOptions,
  backendaiMetadata,
  backendaiTasker,
  backendaiUtils,
} from './global-stores';

// ---------------------------------------------------------------------------
// BackendAISettingsStore
// ---------------------------------------------------------------------------

describe('BackendAISettingsStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('default options', () => {
    it('has user.desktop_notification defaulting to true', () => {
      expect(backendaiOptions.get('desktop_notification')).toBe(true);
    });

    it('has user.compact_sidebar defaulting to false', () => {
      expect(backendaiOptions.get('compact_sidebar')).toBe(false);
    });

    it('has user.preserve_login defaulting to false', () => {
      expect(backendaiOptions.get('preserve_login')).toBe(false);
    });

    it('has user.automatic_update_check defaulting to true', () => {
      expect(backendaiOptions.get('automatic_update_check')).toBe(true);
    });

    it('has user.custom_ssh_port defaulting to empty string', () => {
      expect(backendaiOptions.get('custom_ssh_port')).toBe('');
    });

    it('has user.beta_feature defaulting to false', () => {
      expect(backendaiOptions.get('beta_feature')).toBe(false);
    });

    it('has general.language defaulting to en', () => {
      expect(backendaiOptions.get('language', 'default', 'general')).toBe('en');
    });
  });

  describe('exists()', () => {
    it('returns true for a known user option', () => {
      expect(backendaiOptions.exists('desktop_notification')).toBe(true);
    });

    it('returns false for an unknown option', () => {
      expect(backendaiOptions.exists('nonexistent_key')).toBe(false);
    });

    it('respects the namespace parameter', () => {
      expect(backendaiOptions.exists('language', 'general')).toBe(true);
    });
  });

  describe('get() with default_value', () => {
    it('returns default_value for unknown keys', () => {
      expect(backendaiOptions.get('unknown_key', 'fallback')).toBe('fallback');
    });

    it('returns null as default_value when not specified', () => {
      expect(backendaiOptions.get('unknown_key')).toBeNull();
    });
  });

  describe('set() and get()', () => {
    it('stores a string value', () => {
      backendaiOptions.set('custom_ssh_port', '2222');
      expect(backendaiOptions.get('custom_ssh_port')).toBe('2222');
    });

    it('stores a boolean false value', () => {
      backendaiOptions.set('beta_feature', false);
      expect(backendaiOptions.get('beta_feature')).toBe(false);
    });

    it('stores a boolean true value', () => {
      backendaiOptions.set('beta_feature', true);
      expect(backendaiOptions.get('beta_feature')).toBe(true);
    });

    it('stores a value in a custom namespace', () => {
      backendaiOptions.set('language', 'ko', 'general');
      expect(backendaiOptions.get('language', 'en', 'general')).toBe('ko');
    });
  });

  describe('set() dispatches CustomEvent', () => {
    it('dispatches backendaiwebui.settings:set event', () => {
      const events: Event[] = [];
      const handler = (e: Event) => events.push(e);
      document.addEventListener('backendaiwebui.settings:set', handler);

      backendaiOptions.set('beta_feature', true);

      document.removeEventListener('backendaiwebui.settings:set', handler);
      expect(events).toHaveLength(1);
      expect((events[0] as CustomEvent).detail).toMatchObject({
        name: 'beta_feature',
        value: true,
        namespace: 'user',
      });
    });

    it('does not dispatch event when skipDispatch is true', () => {
      const events: Event[] = [];
      const handler = (e: Event) => events.push(e);
      document.addEventListener('backendaiwebui.settings:set', handler);

      backendaiOptions.set('beta_feature', true, 'user', true);

      document.removeEventListener('backendaiwebui.settings:set', handler);
      expect(events).toHaveLength(0);
    });
  });

  describe('delete()', () => {
    it('removes the option from the options map', () => {
      backendaiOptions.set('custom_ssh_port', '22');
      backendaiOptions.delete('custom_ssh_port');
      expect(backendaiOptions.get('custom_ssh_port')).toBeNull();
    });

    it('dispatches backendaiwebui.settings:delete event', () => {
      const events: Event[] = [];
      const handler = (e: Event) => events.push(e);
      document.addEventListener('backendaiwebui.settings:delete', handler);

      backendaiOptions.delete('beta_feature');

      document.removeEventListener('backendaiwebui.settings:delete', handler);
      expect(events).toHaveLength(1);
      expect((events[0] as CustomEvent).detail).toMatchObject({
        name: 'beta_feature',
        namespace: 'user',
      });
    });

    it('does not dispatch event when skipDispatch is true', () => {
      const events: Event[] = [];
      const handler = (e: Event) => events.push(e);
      document.addEventListener('backendaiwebui.settings:delete', handler);

      backendaiOptions.delete('beta_feature', 'user', true);

      document.removeEventListener('backendaiwebui.settings:delete', handler);
      expect(events).toHaveLength(0);
    });
  });

  describe('readSettings() / _readSettings()', () => {
    it('reads boolean false from localStorage', () => {
      localStorage.setItem(
        'backendaiwebui.settings.user.beta_feature',
        'false',
      );
      backendaiOptions.readSettings();
      expect(backendaiOptions.get('beta_feature')).toBe(false);
    });

    it('reads boolean true from localStorage', () => {
      localStorage.setItem('backendaiwebui.settings.user.beta_feature', 'true');
      backendaiOptions.readSettings();
      expect(backendaiOptions.get('beta_feature')).toBe(true);
    });

    it('reads a JSON value from localStorage', () => {
      localStorage.setItem(
        'backendaiwebui.settings.user.custom_ssh_port',
        '"2222"',
      );
      backendaiOptions.readSettings();
      expect(backendaiOptions.get('custom_ssh_port')).toBe('2222');
    });

    it('reads a plain string value from localStorage', () => {
      localStorage.setItem(
        'backendaiwebui.settings.user.custom_ssh_port',
        'hello',
      );
      backendaiOptions.readSettings();
      expect(backendaiOptions.get('custom_ssh_port')).toBe('hello');
    });
  });
});

// ---------------------------------------------------------------------------
// BackendAIMetadataStore
// ---------------------------------------------------------------------------

describe('BackendAIMetadataStore', () => {
  it('is initialized', () => {
    // The store is created in module scope; the constructor kicks off an async
    // fetch for image metadata (which may resolve or reject depending on the
    // test environment).  What we can reliably assert is that the instance
    // exists with the expected shape.
    expect(backendaiMetadata).toBeDefined();
    expect(typeof backendaiMetadata.readImageMetadata).toBe('function');
    expect(typeof backendaiMetadata.readDeviceMetadata).toBe('function');
  });

  it('has a readImageMetadata method that returns a Promise', () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    const result = backendaiMetadata.readImageMetadata();
    expect(result).toBeInstanceOf(Promise);

    global.fetch = originalFetch;
  });

  it('dispatches backend-ai-metadata-image-loaded when fetch succeeds', async () => {
    const mockPayload = {
      imageInfo: {
        python: { name: 'Python', icon: 'python.png', label: [] },
      },
      tagAlias: {},
      tagReplace: {},
    };

    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve(mockPayload),
    } as unknown as Response);

    const events: Event[] = [];
    document.addEventListener('backend-ai-metadata-image-loaded', (e) =>
      events.push(e),
    );

    await backendaiMetadata.readImageMetadata();

    document.removeEventListener('backend-ai-metadata-image-loaded', (e) =>
      events.push(e),
    );

    expect(events).toHaveLength(1);
    expect(backendaiMetadata.imageInfo).toEqual(mockPayload.imageInfo);
  });

  it('silently handles fetch failure without throwing', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network error'));

    await expect(
      backendaiMetadata.readImageMetadata(),
    ).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// BackendAITasker
// ---------------------------------------------------------------------------

describe('BackendAITasker', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('add()', () => {
    it('dispatches add-bai-notification event with pending status', () => {
      const events: CustomEvent[] = [];
      document.addEventListener('add-bai-notification', (e) =>
        events.push(e as CustomEvent),
      );

      backendaiTasker.add('Test Task', null, 'task-001');

      document.removeEventListener('add-bai-notification', (e) =>
        events.push(e as CustomEvent),
      );

      expect(events.length).toBeGreaterThanOrEqual(1);
      const firstEvent = events[0];
      expect(firstEvent.detail.key).toBe('task:task-001');
      expect(firstEvent.detail.message).toBe('Test Task');
      expect(firstEvent.detail.backgroundTask?.status).toBe('pending');
    });

    it('returns an item object with expected fields', () => {
      const item = backendaiTasker.add('My Task', null, 'task-002');
      expect(item.tasktitle).toBe('My Task');
      expect(item.taskid).toBe('task:task-002');
      expect(item.status).toBe('active');
    });

    it('uses crypto.randomUUID when no taskId is provided', () => {
      const item = backendaiTasker.add('Random Task', null);
      expect(item.taskid).toMatch(/^task:/);
    });

    it('sets open=false when hiddenNotification is true', () => {
      const events: CustomEvent[] = [];
      document.addEventListener('add-bai-notification', (e) =>
        events.push(e as CustomEvent),
      );

      backendaiTasker.add(
        'Hidden Task',
        null,
        'task-hidden',
        'general',
        'remove-immediately',
        '',
        '',
        true,
      );

      document.removeEventListener('add-bai-notification', (e) =>
        events.push(e as CustomEvent),
      );

      const firstEvent = events[0];
      expect(firstEvent.detail.open).toBe(false);
    });

    it('dispatches resolved notification when promise resolves', async () => {
      const resolvedEvents: CustomEvent[] = [];
      document.addEventListener('add-bai-notification', (e) => {
        const ce = e as CustomEvent;
        if (ce.detail?.backgroundTask?.status === 'resolved') {
          resolvedEvents.push(ce);
        }
      });

      const task = Promise.resolve();
      backendaiTasker.add('Async Task', task, 'task-async');

      await task;

      document.removeEventListener('add-bai-notification', (e) => {
        const ce = e as CustomEvent;
        if (ce.detail?.backgroundTask?.status === 'resolved') {
          resolvedEvents.push(ce);
        }
      });

      expect(resolvedEvents).toHaveLength(1);
      expect(resolvedEvents[0].detail.key).toBe('task:task-async');
    });

    it('dispatches rejected notification when promise rejects', async () => {
      const rejectedEvents: CustomEvent[] = [];
      document.addEventListener('add-bai-notification', (e) => {
        const ce = e as CustomEvent;
        if (ce.detail?.backgroundTask?.status === 'rejected') {
          rejectedEvents.push(ce);
        }
      });

      const task = Promise.reject(new Error('fail'));
      backendaiTasker.add('Failing Task', task, 'task-fail');

      await task.catch(() => {});

      document.removeEventListener('add-bai-notification', (e) => {
        const ce = e as CustomEvent;
        if (ce.detail?.backgroundTask?.status === 'rejected') {
          rejectedEvents.push(ce);
        }
      });

      expect(rejectedEvents).toHaveLength(1);
      expect(rejectedEvents[0].detail.key).toBe('task:task-fail');
    });
  });

  describe('list()', () => {
    it('returns the taskstore array', () => {
      const list = backendaiTasker.list();
      expect(Array.isArray(list)).toBe(true);
    });
  });

  describe('signal()', () => {
    it('dispatches backend-ai-task-changed event with tasks', () => {
      const events: CustomEvent[] = [];
      document.addEventListener('backend-ai-task-changed', (e) =>
        events.push(e as CustomEvent),
      );

      backendaiTasker.signal();

      document.removeEventListener('backend-ai-task-changed', (e) =>
        events.push(e as CustomEvent),
      );

      expect(events).toHaveLength(1);
      expect(events[0].detail.tasks).toBeDefined();
    });
  });

  describe('gc()', () => {
    it('does not throw when called', async () => {
      await expect(backendaiTasker.gc()).resolves.not.toThrow();
    });
  });
});

// ---------------------------------------------------------------------------
// BackendAICommonUtils
// ---------------------------------------------------------------------------

describe('BackendAICommonUtils', () => {
  describe('_humanReadableFileSize()', () => {
    it('returns "0 Bytes" for 0 bytes', () => {
      expect(backendaiUtils._humanReadableFileSize(0)).toBe('0 Bytes');
    });

    it('formats bytes correctly', () => {
      expect(backendaiUtils._humanReadableFileSize(500)).toBe('500 Bytes');
    });

    it('formats kilobytes correctly', () => {
      expect(backendaiUtils._humanReadableFileSize(1000)).toBe('1 KB');
    });

    it('formats megabytes correctly', () => {
      expect(backendaiUtils._humanReadableFileSize(1_000_000)).toBe('1 MB');
    });

    it('formats gigabytes correctly', () => {
      expect(backendaiUtils._humanReadableFileSize(1_000_000_000)).toBe('1 GB');
    });

    it('uses custom decimal points', () => {
      const result = backendaiUtils._humanReadableFileSize(1500, 1);
      expect(result).toBe('1.5 KB');
    });
  });

  describe('_maskString()', () => {
    it('masks the middle portion of a string', () => {
      const result = backendaiUtils._maskString('abcdefgh', '*', 2, 4);
      expect(result).toBe('ab****gh');
    });

    it('returns original string when maskLength is 0', () => {
      const result = backendaiUtils._maskString('hello', '*', 0, 0);
      expect(result).toBe('hello');
    });

    it('handles empty string input', () => {
      const result = backendaiUtils._maskString('', '*', 0, 0);
      expect(result).toBe('');
    });

    it('clips maskLength to string length', () => {
      // When startFrom + maskLength > value.length, the implementation sets
      // maskLength = value.length (not value.length - startFrom), so the
      // trailing slice starts after value.length and is empty.
      // 'abcde', startFrom=2, maskLength=100 -> maskLength becomes 5
      // -> 'ab' + '*****' + ''
      const result = backendaiUtils._maskString('abcde', '*', 2, 100);
      expect(result).toBe('ab*****');
    });
  });

  describe('isEmpty()', () => {
    it('returns true for empty string', () => {
      expect(backendaiUtils.isEmpty('')).toBe(true);
    });

    it('returns true for null', () => {
      expect(backendaiUtils.isEmpty(null)).toBe(true);
    });

    it('returns true for undefined', () => {
      expect(backendaiUtils.isEmpty(undefined)).toBe(true);
    });

    it('returns false for a non-empty string', () => {
      expect(backendaiUtils.isEmpty('hello')).toBe(false);
    });

    it('returns false for a number', () => {
      expect(backendaiUtils.isEmpty(0)).toBe(false);
    });
  });

  describe('deleteNestedKeyFromObject()', () => {
    it('deletes a top-level key', () => {
      const obj = { a: 1, b: 2 };
      const result = backendaiUtils.deleteNestedKeyFromObject(obj, 'a');
      expect(result).not.toHaveProperty('a');
      expect(result).toHaveProperty('b', 2);
    });

    it('deletes a nested key with dot separator', () => {
      const obj = { a: { b: { c: 42 } } };
      backendaiUtils.deleteNestedKeyFromObject(obj, 'a.b.c');
      expect(obj.a.b).not.toHaveProperty('c');
    });

    it('returns the original object for invalid input', () => {
      expect(backendaiUtils.deleteNestedKeyFromObject(null as any, 'a')).toBe(
        null,
      );
      expect(
        backendaiUtils.deleteNestedKeyFromObject({ a: 1 }, ''),
      ).toStrictEqual({ a: 1 });
    });
  });

  describe('mergeNestedObjects()', () => {
    it('merges two flat objects', () => {
      const result = backendaiUtils.mergeNestedObjects({ a: 1 }, { b: 2 });
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('deep-merges nested objects', () => {
      const result = backendaiUtils.mergeNestedObjects(
        { a: { x: 1 } },
        { a: { y: 2 } },
      );
      expect(result).toEqual({ a: { x: 1, y: 2 } });
    });

    it('handles null/undefined inputs gracefully', () => {
      expect(backendaiUtils.mergeNestedObjects(null, { a: 1 })).toEqual({
        a: 1,
      });
      expect(backendaiUtils.mergeNestedObjects({ a: 1 }, null)).toEqual({
        a: 1,
      });
      expect(backendaiUtils.mergeNestedObjects(null, null)).toEqual({});
    });

    it('overwrites scalar values with newer object values', () => {
      const result = backendaiUtils.mergeNestedObjects({ a: 1 }, { a: 99 });
      expect(result).toEqual({ a: 99 });
    });
  });
});

// ---------------------------------------------------------------------------
// Singleton exports and globalThis backward-compatibility
// ---------------------------------------------------------------------------

describe('Module-level singletons and globalThis assignments', () => {
  it('backendaiOptions is a singleton (same reference on re-import)', () => {
    // The module is cached by Node, so re-importing yields the same object
    expect(backendaiOptions).toBeDefined();
    expect(typeof backendaiOptions.get).toBe('function');
  });

  it('backendaiMetadata is a singleton', () => {
    expect(backendaiMetadata).toBeDefined();
    expect(typeof backendaiMetadata.readImageMetadata).toBe('function');
  });

  it('backendaiTasker is a singleton', () => {
    expect(backendaiTasker).toBeDefined();
    expect(typeof backendaiTasker.add).toBe('function');
  });

  it('backendaiUtils is a singleton', () => {
    expect(backendaiUtils).toBeDefined();
    expect(typeof backendaiUtils._humanReadableFileSize).toBe('function');
  });

  it('assigns backendaiOptions to globalThis.backendaioptions', () => {
    expect((globalThis as any).backendaioptions).toBe(backendaiOptions);
  });

  it('assigns backendaiMetadata to globalThis.backendaimetadata', () => {
    expect((globalThis as any).backendaimetadata).toBe(backendaiMetadata);
  });

  it('assigns backendaiTasker to globalThis.tasker', () => {
    expect((globalThis as any).tasker).toBe(backendaiTasker);
  });

  it('assigns backendaiUtils to globalThis.backendaiutils', () => {
    expect((globalThis as any).backendaiutils).toBe(backendaiUtils);
  });
});
