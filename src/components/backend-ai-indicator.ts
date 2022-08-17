/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {css, CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import 'weightless/dialog';
import 'weightless/banner';
import 'weightless/progress-bar';
import 'weightless/title';

/**
 Backend.AI Indicator

@group Backend.AI Web UI
 @element backend-ai-indicator
 */

@customElement('backend-ai-indicator')
export default class BackendAIIndicator extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({type: Number}) value = 0;
  @property({type: Number}) delay = 1000;
  @property({type: String}) text = '';
  @property({type: String}) mode = 'determinate';
  @property({type: Object}) dialog;

  constructor() {
    super();
  }

  static get styles(): CSSResultGroup | undefined {
    return [
      // language=CSS
      css`
        wl-dialog {
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 9000;
          --dialog-height: auto;
          --dialog-width: 250px;
          --dialog-content-padding: 15px;
        }
      `];
  }

  firstUpdated() {
    this.dialog = this.shadowRoot.querySelector('#app-progress-dialog');
  }

  connectedCallback() {
    super.connectedCallback();
  }

  async start(mode = 'determinate') {
    this.value = 0;
    this.mode = mode;
    await this.updateComplete;
    this.dialog.show();
  }

  set(value, text = '') {
    this.value = value / 100.0;
    this.text = text;
    if (this.value >= 1) {
      this.end(this.delay);
    }
  }

  end(delay = 1000) {
    if (delay !== 0) {
      this.delay = delay;
    }
    setTimeout(() => {
      this.dialog.hide();
    }, delay);
  }

  render() {
    // language=HTML
    return html`
      <wl-dialog id="app-progress-dialog" blockscrolling>
        <wl-title level="5" id="app-progress-text" slot="header" style="word-break: keep-all;">${this.text}</wl-title>
        <div slot="content">
        <wl-progress-bar .mode="${this.mode}" id="app-progress" .value="${this.value}"></wl-progress-bar>
        </div>
      </wl-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-indicator': BackendAIIndicator;
  }
}
