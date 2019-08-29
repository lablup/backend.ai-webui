/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */
import {css, customElement, html, LitElement, property} from "lit-element";

import 'weightless/button';
import 'weightless/dialog';
import 'weightless/icon';

@customElement("backend-ai-splash")
export default class BackendAISplash extends LitElement {
  @property({type: Object}) dialog = Object();

  constructor() {
    super();
  }

  static get styles() {
    return [
      // language=CSS
      css`
        :host > *, html {
          font-family: 'Quicksand', Roboto, sans-serif;
        }

        #splash-panel {
          --dialog-width: 340px;
          --dialog-height: 300px;
        }

        .splash-header {
          width: 340px;
          height: 120px;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: left top;
          background-color: RGB(246, 253, 247);
          font-size: 28px;
          font-weight: 400;
          line-height: 60px;
        }

        ul {
          list-style-type: none;
        }

        .splash-information .detail {
          font-weight: 400;
          font-size: 13px;
        }

        .copyright {
          font-size: 12px;
        }
      `];
  }

  firstUpdated() {
    this.dialog = this.shadowRoot.querySelector('wl-dialog');
  }

  connectedCallback() {
    super.connectedCallback();
  }

  show() {
    this.dialog.show();
  }

  hide() {
    this.dialog.hide();
  }

  render() {
    // language=HTML
    return html`
      <wl-dialog id="splash-panel" fixed backdrop blockscrolling persistent>
          <div class="splash-header">
            <img src="manifest/backend.ai-text.svg" style="height:50px;padding:35px 20px;" />
            <wl-button style="position:absolute;top:0;right:0;" fab flat inverted @click="${() => this.hide()}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </div>
          <div class="splash-information">
            <ul>
              <li>Backend.AI Console <span id="version-detail" class="detail">${window.packageVersion}</span></li>
              <li><span id="license-detail">Enterprise Edition</span></li>
              <li><span id="mode-detail" class="detail">${window.isElectron ? 'App' : 'WebServer'}</span> <span id="build-detail" class="detail">Build ${window.buildVersion}</span></li>
            </ul>
            <ul>
              <li>Powered by open-source software</li>
              <li class="copyright">Copyright &copy; 2015-2019 Lablup Inc.</li>
            </ul>
          </div>
      </wl-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-splash": BackendAISplash;
  }
}
