/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */
import {customElement, html, LitElement, property} from "lit-element";
import {get as _text, translate as _t} from "lit-translate";

import 'weightless/dialog';
import 'weightless/banner';
import 'weightless/progress-bar';
import 'weightless/title';

import './backend-ai-indicator';

/**
 Backend.AI Indicator pool for Console

 `backend-ai-indicator-pool` is a global indicator pool for web UI.

 Example:

 <backend-ai-indicator-pool id="indicator"></backend-ai-indicator-pool>

@group Backend.AI Web UI
 @element backend-ai-indicator-pool
 */
@customElement("backend-ai-indicator-pool")
export default class BackendAIIndicatorPool extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({type: Number}) value = 0;
  @property({type: Number}) step = 0;

  @property({type: String}) text = '';
  @property({type: String}) mode = 'determinate';
  @property({type: Object}) dialog;
  @property({type: Array}) pool = Array();

  constructor() {
    super();
  }

  static get styles() {
    return [];
  }

  firstUpdated() {
    this.dialog = this.shadowRoot.querySelector('#app-progress-dialog');
  }

  connectedCallback() {
    super.connectedCallback();
  }

  /**
   *  Spawn a new indicator and return it.
   *
   * @param {string} mode - mode for indicator. Default value is 'determinate'.
   */
  async start(mode = 'determinate') {
    this.gc();
    let indicator = document.createElement('backend-ai-indicator');
    indicator.value = 0;
    indicator.text = _text('notification.Initializing');
    indicator.mode = mode;
    indicator.style.bottom = (20 + 90 * this.step) + 'px';
    document.body.appendChild(indicator);
    this.pool.push(indicator);
    this.step = this.pool.length;
    await this.updateComplete;
    await indicator.start();
    return indicator;
  }

  /**
   *  Remove indicator instance from indicator pool.
   *
   * @param {backend-ai-indicator} indicator - Indicator to remove.
   */
  removeIndicator(indicator) {
    let result = this.pool.filter(obj => {
      return obj === indicator;
    });
    if (result.length > 0) {
      let index = this.pool.indexOf(result[0]);
      if (index > -1) {
        this.pool.splice(index, 1);
      }
      document.body.removeChild(result[0]);
      result[0].remove();
      console.log('deleted');
    }
  }

  gc() {
    let finished: Array<any> = [];
    this.pool.forEach((indicator) => {
      console.log(indicator.value);
      if (indicator.value >= 1) {
        finished.push(indicator);
      }
    });
    finished.forEach((indicator) => {
      setTimeout(() => {
        this.removeIndicator(indicator);
      }, indicator.delay + 500);
    });
  }

  render() {
    // language=HTML
    return html`
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-indicator-pool": BackendAIIndicatorPool;
  }
}
