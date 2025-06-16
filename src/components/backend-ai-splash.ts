/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import './backend-ai-dialog';
import BackendAIDialog from './backend-ai-dialog';
import '@material/mwc-icon-button';
import { css, CSSResultGroup, html, LitElement } from 'lit';
import { get as _text } from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';

/**
 Backend.AI Splash component

 `backend-ai-splash` shows simple summary about current app / web application.

 Example:

 ```
 <backend-ai-splash></backend-ai-splash>
 ...
 this.shadowRoot.querySelector('backend-ai-splash').show()
 ```
 @group Backend.AI Web UI
 @element backend-ai-splash
 */
@customElement('backend-ai-splash')
export default class BackendAISplash extends LitElement {
  @property({ type: String }) edition = 'Open Source';
  @property({ type: String }) license = 'Subscription';
  @property({ type: String }) validUntil = '';
  @property({ type: String }) version = '';
  @property({ type: String }) managerVersion = '';
  @query('backend-ai-dialog') dialog!: BackendAIDialog;
  @property({ type: Boolean }) isDarkMode;

  constructor() {
    super();
    this.isDarkMode = globalThis.isDarkMode;
  }

  themeHandler = (event: any) => {
    this.isDarkMode = event.detail;
  };
  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener(
      'change:backendaiwebui.setting.isDarkMode',
      this.themeHandler,
    );
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener(
      'change:backendaiwebui.setting.isDarkMode',
      this.themeHandler,
    );
  }

  static get styles(): CSSResultGroup {
    return [
      // language=CSS
      css`
        :host > *,
        html {
          font-family: var(--token-fontFamily);
        }

        a,
        a:visited {
          color: var(--token-colorLink, #222222);
        }

        a:hover {
          color: var(--token-colorLinkHover, #3e872d);
        }

        #splash-panel {
          --component-width: 350px;
          --component-height: 320px;
        }

        .splash-header {
          height: 50px;
          width: 280px;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: left top;
        }

        ul {
          list-style-type: none;
          padding-left: 20px;
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
      `,
    ];
  }

  show() {
    this.edition = globalThis.packageEdition;
    this.validUntil = globalThis.packageValidUntil;
    this.version = globalThis.packageVersion;
    this.managerVersion = globalThis.backendaiclient.managerVersion;
    if (this.edition !== 'Open Source') {
      if (
        globalThis.packageValidUntil === '2099-12-31' ||
        this.validUntil === '""' ||
        this.validUntil == ''
      ) {
        this.license = _text('license.Perpetual');
      } else {
        this.license = _text('license.Subscription');
      }
    } else {
      this.license = _text('license.OpenSource');
    }
    this.dialog.show();
  }

  hide() {
    this.dialog.hide();
  }

  render() {
    // language=HTML
    return html`
    <backend-ai-dialog id="splash-panel" fixed backdrop blockscrolling persistent narrowLayout hideActions>
        <div class="splash-header" slot="title"
          style="background-image:url(${
            this.isDarkMode
              ? 'manifest/backend.ai-text-bgdark.svg'
              : 'manifest/backend.ai-text.svg'
          });"
        >
        </div>
        <div class="splash-information" slot="content">
          <ul>
            <li>Backend.AI Web UI <span id="version-detail" class="detail">${
              globalThis.packageVersion
            }</span></li>
            <li><span id="license-detail">${this.edition} Edition</span></li>
            <li><span id="valid-until" class="detail">
              ${
                this.license === 'Subscription'
                  ? html`
                      Subscription is active until ${this.validUntil}
                    `
                  : html``
              }
              ${
                this.license === 'Perpetual'
                  ? html`
                      Perpetual License
                    `
                  : html``
              }
              </span></li>
            <li style="margin-top:15px;"><span id="mode-detail" class="detail">Backend.AI Cluster</span> <span id="manager-build-detail" class="detail">${
              this.managerVersion
            }</span></li>
            <li><span id="mode-detail" class="detail">${
              globalThis.isElectron ? 'App' : 'WebServer'
            }</span> <span id="build-detail" class="detail">Build ${
              globalThis.buildVersion
            }</span></li>
          </ul>
          <ul>
            <li>Powered by <a target="_blank" href="https://github.com/lablup/backend.ai/blob/main/LICENSE">open-source software</a></li>
            <li class="copyright">Copyright &copy; 2015-2025 Lablup Inc.</li>
            <li class="release-note">
              <a target="_blank" href="https://github.com/lablup/backend.ai-webui/releases/tag/v${
                this.version
              }">Release Note</a>
              <a target="_blank" href="https://github.com/lablup/backend.ai-webui/blob/main/LICENSE">License</a>
            </li>
            </ul>
          </ul>
        </div>
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-splash': BackendAISplash;
  }
}
