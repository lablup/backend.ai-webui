/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {get as _text} from "lit-translate";
import {css, customElement, html, LitElement, property} from "lit-element";

import {BackendAiStyles} from "./backend-ai-general-styles";
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from "../plastics/layout/iron-flex-layout-classes";

@customElement("backend-ai-release-check")
export default class BackendAiReleaseCheck extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({type: String}) releaseURL = 'https://raw.githubusercontent.com/lablup/backend.ai-console/release/version.json';
  @property({type: String}) localVersion = '';
  @property({type: String}) localBuild = '';
  @property({type: String}) remoteVersion = '';
  @property({type: String}) remoteBuild = '';
  @property({type: String}) remoteRevision = '';
  @property({type: Object}) notification;

  constructor() {
    super();
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
      `];
  }

  render() {
    // language=HTML
    return html`
    `;
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    this.checkRelease();
  }

  checkRelease() {
    fetch(this.releaseURL).then(
      response => response.json()
    ).then(
      json => {
        this.remoteVersion = json.package;
        this.remoteBuild = json.build;
        this.remoteRevision = json.revision;
        //if (this.compareVersion(globalThis.packageVersion, this.remoteVersion) < 0) { // update needed.
        if (this.compareVersion('20.03.3', this.remoteVersion) < 0) { // For testing
          if (!globalThis.isElectron) {
            this.notification.text = _text("update.NewConsoleVersionAvailable") + ' ' + this.remoteVersion;
            this.notification.detail = _text("update.NewConsoleVersionAvailable");
            this.notification.url = `https://github.com/lablup/backend.ai-console/releases/tag/v${this.remoteVersion}`;
            this.notification.show();
          }
        }
      }
    ).catch((e) => {
      console.log(e);
    });
  }

  compareVersion(v1, v2) {
    if (typeof v1 !== 'string') return false;
    if (typeof v2 !== 'string') return false;
    v1 = v1.split('.');
    v2 = v2.split('.');
    const k = Math.min(v1.length, v2.length);
    for (let i = 0; i < k; ++i) {
      v1[i] = parseInt(v1[i], 10);
      v2[i] = parseInt(v2[i], 10);
      if (v1[i] > v2[i]) return 1;
      if (v1[i] < v2[i]) return -1;
    }
    return v1.length == v2.length ? 0 : (v1.length < v2.length ? -1 : 1);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-release-check": BackendAiReleaseCheck;
  }
}
