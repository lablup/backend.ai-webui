/**
 @license
 Copyright (c) 2015-2024 Lablup Inc. All rights reserved.
 */
import { BackendAIPage } from './backend-ai-page';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 Backend.AI Setting Storage

 `backend-ai-settings-store` is a general setting storage.
  @group Backend.AI Web UI
 */
@customElement('backend-ai-settings-store')
export default class BackendAiSettingsStore extends BackendAIPage {
  @property({ type: Object }) options = Object();
  @property({ type: Object }) imageInfo = Object();
  @property({ type: Object }) imageNames = Object();
  @property({ type: Object }) imageTagAlias = Object();
  @property({ type: Object }) imageTagReplace = Object();

  constructor() {
    super();
    this.options = {
      // Default option.
      'user.desktop_notification': true,
      'user.compact_sidebar': false,
      'user.preserve_login': false,
      'user.automatic_update_check': true,
      'user.custom_ssh_port': '',
      'user.beta_feature': false,
      'general.language': 'en',
    };
    this.readSettings();
  }

  readSettings() {
    this._readSettings();
  }

  _readSettings() {
    // Read all user settings.
    for (let i = 0, len = localStorage.length; i < len; ++i) {
      if (localStorage.key(i)!.startsWith('backendaiwebui.settings')) {
        const key = localStorage
          .key(i)!
          .replace('backendaiwebui.settings.', '');
        this._readSetting(key);
      }
    }
  }

  exists(name, namespace = 'user') {
    return namespace + '.' + name in this.options;
  }

  get(name: string, default_value: any = null, namespace = 'user') {
    if (namespace + '.' + name in this.options) {
      return this.options[namespace + '.' + name];
    } else {
      return default_value;
    }
  }

  set(name, value, namespace = 'user', skipDispatch = false) {
    if (!skipDispatch) {
      const event = new CustomEvent('backendaiwebui.settings:set', {
        detail: {
          name: name,
          value: value,
          namespace: namespace,
        },
      });
      document.dispatchEvent(event);
    }
    this.options[namespace + '.' + name] = value;
  }

  delete(name, namespace = 'user', skipDispatch = false) {
    if (!skipDispatch) {
      const event = new CustomEvent('backendaiwebui.settings:delete', {
        detail: {
          name: name,
          namespace: namespace,
        },
      });
      document.dispatchEvent(event);
    }
    delete this.options[namespace + '.' + name];
  }

  _readSetting(name, default_value = true, namespace = 'user') {
    const value: string | null = localStorage.getItem(
      'backendaiwebui.settings.' + name,
    );
    if (value !== null && value != '' && value != '""') {
      if (value === 'false') {
        this.options[name] = false;
      } else if (value === 'true') {
        this.options[name] = true;
      } else if (this.isJson(value)) {
        this.options[name] = JSON.parse(value);
      } else {
        this.options[name] = value;
      }
    } else {
      this.options[name] = default_value;
    }
  }

  isJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  render() {
    // language=HTML
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-settings-store': BackendAiSettingsStore;
  }
}
