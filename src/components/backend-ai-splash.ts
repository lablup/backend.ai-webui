/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {css, customElement, html, LitElement, property} from "lit-element";

import 'weightless/button';
import 'weightless/dialog';
import 'weightless/icon';

@customElement("backend-ai-splash")
export default class BackendAISplash extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({type: Object}) dialog = Object();
  @property({type: String}) edition = 'Open Source';
  @property({type: String}) validUntil = '';
  @property({type: String}) version = '';

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

        a,
        a:visited {
          color: #222222;
        }

        a:hover {
          color: #3e872d;
        }

        #splash-panel {
          --dialog-width: 345px;
          --dialog-height: 300px;
        }

        .splash-header {
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
    this.edition = window.packageEdition;
    this.validUntil = window.packageValidUntil;
    this.version = window.packageVersion;
    console.log(this.version);
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
              <li><span id="license-detail">${this.edition} Edition</span></li>
              ${this.validUntil !== '' ? html`
              <li><span id="valid-until" class="detail">Subscription is active until ${this.validUntil}</span></li>
              ` : html``}
              <li><span id="mode-detail" class="detail">${window.isElectron ? 'App' : 'WebServer'}</span> <span id="build-detail" class="detail">Build ${window.buildVersion}</span></li>
            </ul>
            <ul>
              <li>Powered by <a target="_blank" href="https://github.com/lablup/backend.ai/blob/master/LICENSE">open-source software</a></li>
              <li class="copyright">Copyright &copy; 2015-2020 Lablup Inc.</li>
              <li class="copyright"><a target="_blank" href="https://github.com/lablup/backend.ai-console/releases/tag/v${this.version}">Release Note</a></li>
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
