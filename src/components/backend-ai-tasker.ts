/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, LitElement, property} from "lit-element";
import './backend-ai-indicator';

@customElement("backend-ai-tasker")
export default class BackendAITasker extends LitElement {
  public shadowRoot: any;
  public updateComplete: any;

  @property({type: Object}) indicator;
  @property({type: Object}) notification;
  @property({type: Object}) taskstore;
  @property({type: Boolean}) active = true;

  constructor() {
    super();
  }

  static get styles() {
    return [
      // language=CSS
      css``];
  }

  render() {
    // language=HTML
    return html`
      <backend-ai-indicator id="indicator"></backend-ai-indicator>
    `;
  }

  shouldUpdate() {
    return this.active;
  }

  firstUpdated() {
    this.taskstore = {};
    this.notification = globalThis.lablupNotification;
    this.indicator = this.shadowRoot.querySelector('#indicator');
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-tasker": BackendAITasker;
  }
}
