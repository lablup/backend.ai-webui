/**
 * Global store initialization for Backend.AI WebUI.
 *
 * This module creates the four singleton stores (previously initialized
 * in the now-removed Lit shell).
 * The store classes here are plain TypeScript reimplementations of the
 * original Lit custom-element classes, preserving the same public API
 * so that both React and remaining Lit components can use them.
 *
 * Importing this module guarantees the stores are instantiated exactly
 * once and assigned to globalThis for backward compatibility.
 *
 * React code should prefer the typed re-exports (or the hooks in
 * hooks/useGlobalStores.ts) instead of touching globalThis directly.
 */
// ---------------------------------------------------------------------------
// Backend.AI client classes on globalThis.
// Must be available before any component calls createBackendAIClient().
// ---------------------------------------------------------------------------
// @ts-ignore - resolved via craco webpack alias to dist/lib/backend.ai-client-esm.js
import * as ai from 'backend.ai-client-esm';

(globalThis as any).BackendAIClient = ai.backend.Client;
(globalThis as any).BackendAIClientConfig = ai.backend.ClientConfig;

// ---------------------------------------------------------------------------
// BackendAISettingsStore
// Wraps localStorage with typed getters/setters for user and general settings.
// ---------------------------------------------------------------------------

class BackendAISettingsStore {
  options: Record<string, any> = {
    'user.desktop_notification': true,
    'user.compact_sidebar': false,
    'user.preserve_login': false,
    'user.automatic_update_check': true,
    'user.custom_ssh_port': '',
    'user.beta_feature': false,
    'general.language': 'en',
  };
  imageInfo: Record<string, any> = {};
  imageNames: Record<string, any> = {};
  imageTagAlias: Record<string, any> = {};
  imageTagReplace: Record<string, any> = {};

  constructor() {
    this._readSettings();
  }

  readSettings() {
    this._readSettings();
  }

  _readSettings() {
    for (let i = 0, len = localStorage.length; i < len; ++i) {
      const storageKey = localStorage.key(i);
      if (storageKey && storageKey.startsWith('backendaiwebui.settings')) {
        const key = storageKey.replace('backendaiwebui.settings.', '');
        this._readSetting(key);
      }
    }
  }

  exists(name: string, namespace = 'user') {
    return namespace + '.' + name in this.options;
  }

  get(name: string, default_value: any = null, namespace = 'user') {
    if (namespace + '.' + name in this.options) {
      return this.options[namespace + '.' + name];
    } else {
      return default_value;
    }
  }

  set(name: string, value: any, namespace = 'user', skipDispatch = false) {
    if (!skipDispatch) {
      const event = new CustomEvent('backendaiwebui.settings:set', {
        detail: { name, value, namespace },
      });
      document.dispatchEvent(event);
    }
    this.options[namespace + '.' + name] = value;
  }

  delete(name: string, namespace = 'user', skipDispatch = false) {
    if (!skipDispatch) {
      const event = new CustomEvent('backendaiwebui.settings:delete', {
        detail: { name, namespace },
      });
      document.dispatchEvent(event);
    }
    delete this.options[namespace + '.' + name];
  }

  _readSetting(name: string, default_value: any = true, _namespace = 'user') {
    const value: string | null = localStorage.getItem(
      'backendaiwebui.settings.' + name,
    );
    if (value !== null && value !== '' && value !== '""') {
      if (value === 'false') {
        this.options[name] = false;
      } else if (value === 'true') {
        this.options[name] = true;
      } else if (this._isJson(value)) {
        this.options[name] = JSON.parse(value);
      } else {
        this.options[name] = value;
      }
    } else {
      this.options[name] = default_value;
    }
  }

  _isJson(str: string) {
    try {
      JSON.parse(str);
    } catch {
      return false;
    }
    return true;
  }
}

// ---------------------------------------------------------------------------
// BackendAIMetadataStore
// Holds metadata about the connected Backend.AI cluster (images, tags, etc.).
// ---------------------------------------------------------------------------

class BackendAIMetadataStore {
  options: Record<string, any> = {};
  imageInfo: Record<string, any> = {};
  imageNames: Record<string, any> = {};
  imageTagAlias: Record<string, any> = {};
  imageTagReplace: Record<string, any> = {};
  kernel_labels: Record<string, any> = {};
  aliases: Record<string, any> = {};
  tags: Record<string, any> = {};
  icons: Record<string, any> = {};
  deviceInfo: Record<string, any> = {};

  constructor() {
    this.readImageMetadata();
  }

  async readImageMetadata() {
    return fetch('resources/image_metadata.json')
      .then((response) => response.json())
      .then((json) => {
        this.imageInfo = json.imageInfo;
        for (const key in this.imageInfo) {
          if ({}.hasOwnProperty.call(this.imageInfo, key)) {
            this.tags[key] = [];
            this.kernel_labels[key] = [];
            if ('name' in this.imageInfo[key]) {
              this.aliases[key] = this.imageInfo[key].name;
              this.imageNames[key] = this.imageInfo[key].name;
            }
            if ('icon' in this.imageInfo[key]) {
              this.icons[key] = this.imageInfo[key].icon;
            } else {
              this.icons[key] = 'default.png';
            }
            if ('label' in this.imageInfo[key]) {
              this.kernel_labels[key] = this.imageInfo[key].label;
              this.imageInfo[key].label.forEach((item: any) => {
                if (!('category' in item)) {
                  this.tags[key].push(item);
                }
              });
            } else {
              this.kernel_labels[key] = [];
            }
          }
        }
        this.imageTagAlias = json.tagAlias;
        this.imageTagReplace = json.tagReplace;
      })
      .then(() => {
        const event = new CustomEvent('backend-ai-metadata-image-loaded', {
          detail: '',
        });
        document.dispatchEvent(event);
      })
      .catch(() => {
        // Silently handle fetch failure -- image metadata is non-critical
        // and the application can continue without it.
        return undefined;
      });
  }

  readDeviceMetadata() {
    fetch('resources/device_metadata.json')
      .then((response) => response.json())
      .then((json) => {
        this.deviceInfo = json.deviceInfo;
      })
      .then(() => {
        const event = new CustomEvent('backend-ai-metadata-device-loaded', {
          detail: '',
        });
        document.dispatchEvent(event);
      })
      .catch(() => {
        // Silently handle fetch failure -- device metadata is non-critical.
        return undefined;
      });
  }
}

// ---------------------------------------------------------------------------
// BackendAITasker
// Manages background task state and dispatches notification events.
// ---------------------------------------------------------------------------

class BackendAITasker {
  taskstore: any[];
  finished: string[];
  pooler: ReturnType<typeof setInterval>;
  active = false;
  isGCworking = false;

  constructor() {
    this.taskstore = [];
    this.finished = [];
    this.pooler = setInterval(() => {
      this.gc();
    }, 10000);
  }

  add(
    title: string,
    task: any,
    taskId = '',
    _tasktype = 'general',
    _additionalRequest = 'remove-immediately',
    pendingDescription = '',
    doneDescription = '',
    hiddenNotification?: boolean,
  ) {
    const key = 'task:' + (taskId || crypto.randomUUID());
    const item = {
      tasktitle: title,
      taskid: key,
      taskobj: task,
      tasktype: _tasktype,
      created_at: Date.now(),
      finished_at: 0,
      status: 'active',
    };

    const event = new CustomEvent('add-bai-notification', {
      detail: {
        key,
        open: hiddenNotification ? false : true,
        message: title,
        description: pendingDescription,
        backgroundTask: {
          status: 'pending',
          statusDescriptions: {
            pending: pendingDescription,
            resolved: doneDescription,
          },
        },
        duration: 0,
      },
    });
    document.dispatchEvent(event);

    if (
      task != null &&
      (typeof task.then === 'function' || task === 'function')
    ) {
      task
        .then(() => {
          const resolvedEvent = new CustomEvent('add-bai-notification', {
            detail: {
              key,
              backgroundTask: { status: 'resolved' },
              duration: 1,
            },
          });
          document.dispatchEvent(resolvedEvent);
        })
        .catch(() => {
          const rejectedEvent = new CustomEvent('add-bai-notification', {
            detail: {
              key,
              backgroundTask: { status: 'rejected' },
              duration: 1,
            },
          });
          document.dispatchEvent(rejectedEvent);
        });
    }

    return item;
  }

  remove(taskid = '') {
    const result = this.taskstore.filter((obj) => obj.taskid === taskid);
    if (result.length > 0) {
      let index = this.taskstore.indexOf(result[0]);
      if (index > -1) {
        delete result[0].taskobj;
        this.taskstore.splice(index, 1);
      }
      index = this.finished.indexOf(taskid);
      if (index > -1) {
        this.finished.splice(index, 1);
      }
      this.signal();
    }
  }

  list() {
    return this.taskstore;
  }

  async gc() {
    if (this.isGCworking) {
      return;
    }
    this.isGCworking = true;
    if (this.finished.length > 0) {
      this.finished.forEach((item) => {
        this.remove(item);
      });
    }
    this.isGCworking = false;
  }

  signal() {
    const event = new CustomEvent('backend-ai-task-changed', {
      detail: { tasks: this.taskstore },
    });
    document.dispatchEvent(event);
  }
}

// ---------------------------------------------------------------------------
// BackendAICommonUtils
// Provides utility functions (project group, file size, masking, etc.).
// ---------------------------------------------------------------------------

class BackendAICommonUtils {
  options: Record<string, any> = {};

  static get passwordRegex() {
    return '^(?=.*\\d)(?=.*[a-zA-Z])(?=.*[_\\W]).{8,}$';
  }

  _readRecentProjectGroup(): string {
    const endpointId = (
      globalThis as any
    ).backendaiclient._config.endpointHost.replace(/\./g, '_');
    const value: string | null = (globalThis as any).backendaioptions.get(
      'projectGroup.' + endpointId,
    );
    if (value) {
      if (
        (globalThis as any).backendaiclient.groups.length > 0 &&
        (globalThis as any).backendaiclient.groups.includes(value)
      ) {
        return value;
      } else {
        this._deleteRecentProjectGroupInfo();
        return (globalThis as any).backendaiclient.current_group;
      }
    }
    return (globalThis as any).backendaiclient.current_group;
  }

  _writeRecentProjectGroup(value: string) {
    const endpointId = (
      globalThis as any
    ).backendaiclient._config.endpointHost.replace(/\./g, '_');
    (globalThis as any).backendaioptions.set(
      'projectGroup.' + endpointId,
      value ? value : (globalThis as any).backendaiclient.current_group,
    );
  }

  _deleteRecentProjectGroupInfo() {
    const endpointId = (
      globalThis as any
    ).backendaiclient._config.endpointHost.replace(/\./g, '_');
    (globalThis as any).backendaioptions.delete('projectGroup.' + endpointId);
  }

  _humanReadableFileSize(bytes = 0, decimalPoint = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = Math.pow(10, 3);
    decimalPoint = decimalPoint < 0 ? 0 : decimalPoint;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let i = Math.floor(Math.log(Math.round(bytes)) / Math.log(k));
    i = i < 0 ? 0 : i;
    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(decimalPoint)) +
      ' ' +
      sizes[i]
    );
  }

  _maskString(value = '', maskChar = '*', startFrom = 0, maskLength = 0) {
    maskLength =
      startFrom + maskLength > value.length ? value.length : maskLength;
    return (
      value.substring(0, startFrom) +
      maskChar.repeat(maskLength) +
      value.substring(startFrom + maskLength, value.length)
    );
  }

  deleteNestedKeyFromObject(
    obj: Record<string, any>,
    nestedKey: string,
    sep = '.',
  ) {
    if (!obj || obj.constructor !== Object || !nestedKey) {
      return obj;
    }
    const keys = nestedKey.split(sep);
    const lastKey = keys.pop();
    if (lastKey) {
      delete keys.reduce((o: any, k: string) => o[k], obj)[lastKey];
    }
    return obj;
  }

  mergeNestedObjects(obj1: any, obj2: any) {
    if (!obj1 || !obj2) {
      return obj1 || obj2 || {};
    }
    function _merge(a: any, b: any) {
      return Object.entries(b).reduce((o: any, [k, v]: [string, any]) => {
        o[k] =
          v && v.constructor === Object
            ? _merge((o[k] = o[k] || (Array.isArray(v) ? [] : {})), v)
            : v;
        return o;
      }, a);
    }
    return [obj1, obj2].reduce(_merge, {});
  }

  exportToTxt(fileName: string, str: string) {
    if (!str || str.length === 0) {
      return;
    }
    const blob = new Blob([str], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName + '.txt');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  isEmpty(str: any) {
    return (
      str === '' ||
      str === null ||
      str === undefined ||
      typeof str === 'undefined'
    );
  }
}

// ---------------------------------------------------------------------------
// Instantiate stores exactly once.
// ---------------------------------------------------------------------------

const backendaiOptions = new BackendAISettingsStore();
const backendaiMetadata = new BackendAIMetadataStore();
const backendaiTasker = new BackendAITasker();
const backendaiUtils = new BackendAICommonUtils();

// ---------------------------------------------------------------------------
// Backward compatibility: assign to globalThis so that existing Lit
// components (and any code referencing globalThis.*) continue to work.
// ---------------------------------------------------------------------------

(globalThis as any).backendaioptions = backendaiOptions;
(globalThis as any).backendaimetadata = backendaiMetadata;
(globalThis as any).tasker = backendaiTasker;
(globalThis as any).backendaiutils = backendaiUtils;

// ---------------------------------------------------------------------------
// Typed re-exports for React code.
// ---------------------------------------------------------------------------

export type {
  BackendAISettingsStore,
  BackendAIMetadataStore,
  BackendAITasker,
  BackendAICommonUtils,
};

export { backendaiOptions, backendaiMetadata, backendaiTasker, backendaiUtils };
