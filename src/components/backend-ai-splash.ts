/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {css, customElement, html, LitElement, property} from "lit-element";

import 'weightless/button';
import 'weightless/dialog';
import 'weightless/icon';
/**
 Backend.AI Splash component

 `backend-ai-splash` shows simple summary about current app / web application.

 Example:

 ```
 <backend-ai-splash></backend-ai-console>
 ...
 this.shadowRoot.querySelector('backend-ai-splash').show()
 ```
 @group Backend.AI Console
 @element backend-ai-splash
 */
@customElement("backend-ai-splash")
export default class BackendAISplash extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({type: Object}) dialog = Object();
  @property({type: String}) edition = 'Open Source';
  @property({type: String}) license = 'Subscription';
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

        .release-note {
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
    this.edition = globalThis.packageEdition;
    this.validUntil = globalThis.packageValidUntil;
    this.version = globalThis.packageVersion;
    if (this.edition !== 'Open Source') {
      if (globalThis.packageValidUntil === "2099-12-31" || this.validUntil === '""' || this.validUntil == "") {
        this.license = "Perpetual";
      } else {
        this.license = "Subscription";
      }
    } else {
      this.license = "Open Source";
    }
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
            <li>Backend.AI Console <span id="version-detail" class="detail">${globalThis.packageVersion}</span></li>
            <li><span id="license-detail">${this.edition} Edition</span></li>
            <li><span id="valid-until" class="detail">
              ${this.license === "Subscription" ? html`Subscription is active until ${this.validUntil}` : html``}
              ${this.license === "Perpetual" ? html`Perpetual License` : html``}
              </span></li>
            <li><span id="mode-detail" class="detail">${globalThis.isElectron ? 'App' : 'WebServer'}</span> <span id="build-detail" class="detail">Build ${globalThis.buildVersion}</span></li>
          </ul>
          <ul>
            <li>Powered by <a target="_blank" href="https://github.com/lablup/backend.ai/blob/master/LICENSE">open-source software</a></li>
            <li class="copyright">Copyright &copy; 2015-2020 Lablup Inc.</li>
            <li class="release-note">
              <a target="_blank" href="https://github.com/lablup/backend.ai-console/releases/tag/v${this.version}">Release Note</a>
              <a target="_blank" href="https://github.com/lablup/backend.ai-console/blob/master/LICENSE">License</a>
            </li>
            </ul>
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
