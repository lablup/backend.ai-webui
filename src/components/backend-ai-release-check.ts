/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
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
  }

  checkRelease() {
    fetch(this.releaseURL).then(
      response => response.json()
    ).then(
      json => {
        this.remoteVersion = json.package;
        this.remoteBuild = json.build;
        this.remoteRevision = json.revision;
      }
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-release-check": BackendAiReleaseCheck;
  }
}
