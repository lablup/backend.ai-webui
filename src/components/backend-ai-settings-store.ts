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
      desktop_notification: true,
      compact_sidebar: false,
      preserve_login: false,
      language: "default",
      beta_feature: false,
    }
    this.readUserSettings();
  }

  firstUpdated() {
  }

  readUserSettings() {
    this._readUserSettings();
  }

  _readUserSettings() { // Read all user settings.
    for (let i = 0, len = localStorage.length; i < len; ++i) {
      if (localStorage.key(i)!.startsWith('backendaiconsole.usersetting.')) {
        let key = localStorage.key(i)!.replace('backendaiconsole.usersetting.', '');
        this._readUserSetting(key);
      }
    }
  }

  get(name) {
    return this.options[name];
  }

  _readUserSetting(name, default_value = true) {
    let value: string | null = localStorage.getItem('backendaiconsole.usersetting.' + name);
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

  _writeUserSetting(name, value) {
    if (value === false) {
      localStorage.setItem('backendaiconsole.usersetting.' + name, "false");
    } else if (value === true) {
      localStorage.setItem('backendaiconsole.usersetting.' + name, "true");
    } else {
      localStorage.setItem('backendaiconsole.usersetting.' + name, value);
    }
    this.options[name] = value;
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
