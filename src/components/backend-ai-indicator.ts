/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {css, customElement, html, LitElement, property} from "lit-element";

import 'weightless/dialog';
import 'weightless/banner';
import 'weightless/progress-bar';
import 'weightless/title';

@customElement("backend-ai-indicator")
export default class BackendAIIndicator extends LitElement {
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
    return [
      // language=CSS
      css`
        wl-dialog {
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 9000;
          --dialog-height: 80px;
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

  async add() {
    let indicator = document.createElement('wl-dialog');
    indicator.setAttribute('blockscrolling', '');
    let indicatorTitle = document.createElement('wl-title');
    indicatorTitle.setAttribute('level', '5');
    indicatorTitle.setAttribute('slot', 'header');
    indicatorTitle.innerHTML = this.text;
    let indicatorDiv = document.createElement('div');
    indicatorDiv.setAttribute("slot", "content");
    let progress = document.createElement('wl-progress-bar');
    progress.setAttribute("mode", this.mode);
    progress.value = this.value;
    indicatorDiv.appendChild(progress);
    indicator.appendChild(indicatorTitle);
    indicator.appendChild(indicatorDiv);
    indicator.style.bottom = (20 + 55 * this.step) + 'px';
    indicator.style.position = 'fixed';
    indicator.style.right = '20px';
    indicator.style.fontSize = '16px';
    indicator.style.fontWeight = '400';
    indicator.style.fontFamily = "'Quicksand', Roboto, sans-serif";
    indicator.style.setProperty('--dialog-height', '80px');
    indicator.style.setProperty('--dialog-width', '250px');
    indicator.style.setProperty('--dialog-content-padding', '15px');
    indicator.style.zIndex = "9000";
    document.body.appendChild(indicator);
    this.dialog = indicator;
    await this.updateComplete;
    indicator.show();
  }

  start(mode = 'determinate') {
    this.value = 0;
    this.text = 'Initializing...';
    this.mode = mode;
    this.add();
    //console.log(this.dialog);
    //this.dialog.show();
  }

  set(value, text = '') {
    this.value = value / 100.0;
    this.text = text;
  }

  end(delay = 0) {
    setTimeout(() => {
      this.dialog.hide();
    }, delay);
  }

  render() {
    // language=HTML
    return html`
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-indicator": BackendAIIndicator;
  }
}
