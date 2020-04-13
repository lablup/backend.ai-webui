/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {customElement, html, property} from "lit-element";
import {BackendAIPage} from "./backend-ai-page";

/**
 Backend.AI Setting Storage

 `backend-ai-settings-store` is a general setting storage.
 @group Backend.AI Console
 */
@customElement("backend-ai-settings-store")
export default class BackendAiSettingsStore extends BackendAIPage {
  @property({type: Object}) options = Object();


  constructor() {
    super();
    this.options = {  // Default option.
      'user.desktop_notification': true,
      'user.compact_sidebar': false,
      'user.preserve_login': false,
      'user.language': "default",
      'user.beta_feature': false,
    }
    this.readSettings();
  }

  firstUpdated() {
  }

  readSettings() {
    this._readSettings();
  }

  _readSettings() { // Read all user settings.
    for (let i = 0, len = localStorage.length; i < len; ++i) {
      if (localStorage.key(i)!.startsWith('backendaiconsole.settings')) {
        let key = localStorage.key(i)!.replace('backendaiconsole.settings.', '');
        this._readSetting(key);
      }
    }
    console.log(this.options);
  }

  get(name, namespace = "user") {
    return this.options[namespace + '.' + name];
  }

  set(name, value, namespace = "user") {
    return this._writeUserSetting(name, value, namespace);
  }

  _readSetting(name, default_value = true, namespace = "user") {
    let value: string | null = localStorage.getItem('backendaiconsole.settings.' + name);
    if (value !== null && value != '' && value != '""') {
      if (value === "false") {
        this.options[name] = false;
      } else if (value === "true") {
        this.options[name] = true;
      } else {
        this.options[name] = value;
      }
    } else {
      this.options[name] = default_value;
    }
  }

  _writeUserSetting(name, value, namespace) {
    if (value === false) {
      localStorage.setItem('backendaiconsole.settings.' + namespace + '.' + name, "false");
    } else if (value === true) {
      localStorage.setItem('backendaiconsole.settings.' + namespace + '.' + name, "true");
    } else {
      localStorage.setItem('backendaiconsole.settings.' + namespace + '.' + name, value);
    }
    this.options[namespace + '.' + name] = value;
  }

  render() {
    // language=HTML
    return html`
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-settings-store": BackendAiSettingsStore;
  }
}
