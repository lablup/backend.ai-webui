/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import './backend-ai-dialog';
import { BackendAiStyles } from './backend-ai-general-styles';
import { default as PainKiller } from './backend-ai-painkiller';
import '@material/mwc-select';
import { Select } from '@material/mwc-select';
import DOMPurify from 'dompurify';
import { css, CSSResultGroup, html, LitElement } from 'lit';
import { get as _text, translate as _t } from 'lit-translate';
import { customElement, property } from 'lit/decorators.js';

/**
 Lablup Terms of Service dialog

 `lablup-terms-of-service` is a dialog that shows the specific terms of service with optional approve checkbox.

 Example:

 <lablup-terms-of-service>
 ... content ...
 </lablup-terms-of-service>

 @group Lablup-WebComponents
 @element lablup-terms-of-service
 */

@customElement('lablup-terms-of-service')
export default class LablupTermsOfService extends LitElement {
  @property({ type: String }) tosEntryURL =
    '/resources/documents/terms-of-service.en.html';
  @property({ type: String }) tosEntry = 'terms-of-service';
  @property({ type: String }) tosContent = '';
  @property({ type: String }) tosLanguage = 'en';
  @property({ type: Array }) tosLanguages = [
    { code: 'ko', text: _text('language.Korean') },
    { code: 'en', text: _text('language.English') },
  ];
  @property({ type: String }) title = '';
  @property({ type: Boolean }) show = false;
  @property({ type: Boolean }) approved = false;
  @property({ type: Boolean }) block = false;
  @property({ type: Object }) notification;
  @property({ type: Object }) approveCheckbox = Object();
  @property({ type: Object }) dialog = Object();

  constructor() {
    super();
  }

  static get styles(): CSSResultGroup | undefined {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        @media screen and (max-width: 669px) {
          backend-ai-dialog.terms-of-service-dialog {
            --component-width: auto !important;
            --component-height: 80vh;
          }
        }

        @media screen and (min-width: 670px) {
          backend-ai-dialog.terms-of-service-dialog {
            --component-width: 650px !important;
            --component-height: 80vh;
          }
        }

        mwc-select {
          width: 135px;
          --mdc-list-side-padding: 25px;
          --mdc-list-item__primary-text: {
            height: 20px;
          };
        }

        #terms-of-service-dialog-content h1 {
          line-height: 1.2em;
        }
      `,
    ];
  }

  tos_contents() {
    // language=HTML
    return html``;
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css" />
      <backend-ai-dialog
        id="terms-of-service-dialog"
        class="terms-of-service-dialog"
        fixed
        blockscrolling
        persistent
        scrollable
        @dialog-closed=${() => this.close()}
      >
        <span slot="title">${this.title}</span>
        <div slot="action" class="horizontal end-justified center flex layout">
          ${this.tosLanguages
            ? html`
                <mwc-select
                  id="select-language"
                  label="${_text('language.Language')}"
                  @change=${() => this.changeLanguage()}
                >
                  ${this.tosLanguages.map(
                    (item) => html`
                      <mwc-list-item
                        value="${item.text}"
                        ?selected="${this.tosLanguage === item.code}"
                      >
                        ${item.text}
                      </mwc-list-item>
                    `,
                  )}
                </mwc-select>
              `
            : html``}
        </div>
        <div slot="content">
          <div id="terms-of-service-dialog-content"></div>
          <div class="horizontal end-justified flex layout">
            <div class="flex"></div>
            <mwc-button
              unelevated
              id="dismiss-button"
              label=${_t('button.Close')}
              @click="${() => {
                this.close();
              }}"
            ></mwc-button>
          </div>
        </div>
      </backend-ai-dialog>
    `;
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    this.dialog = this.shadowRoot?.querySelector('#terms-of-service-dialog');
    this.dialog.addEventListener('didShow', () => {
      this._syncOpenState();
    });
    this.dialog.addEventListener('didHide', () => {
      this._syncOpenState();
    });
    if (this.block) {
      this.dialog.backdrop = true;
    }
    // this.approveCheckbox = this.shadowRoot.querySelector('#approve-terms-of-service');
    // this.approveCheckbox.addEventListener('iron-change', this._changeApproved.bind(this));
    if (this.show) {
      this._showTOSdialog();
    }
  }

  _syncOpenState() {
    this.show = this.dialog.open;
  }

  async open() {
    await this.updateComplete;
    this._showTOSdialog();
  }

  close() {
    this.show = false;
    this._hideTOSdialog();
  }

  changeLanguage() {
    const language = (
      this.shadowRoot?.querySelector('#select-language') as Select
    ).value;
    this.tosContent = '';
    this.tosLanguage = this.tosLanguages
      .filter((item) => item.text === language)
      .map((item) => item.code)
      .toString();
    this._showTOSdialog(true);
  }

  async sendRequest(rqst) {
    let resp;
    let body;
    try {
      if (rqst.method == 'GET') {
        rqst.body = undefined;
      }
      resp = await fetch(rqst.uri, rqst);
      const contentType = resp.headers.get('Content-Type');
      if (
        contentType.startsWith('application/json') ||
        contentType.startsWith('application/problem+json')
      ) {
        body = await resp.json();
      } else if (contentType.startsWith('text/')) {
        body = await resp.text();
      } else {
        body = await resp.blob();
      }
      if (!resp.ok) {
        throw body;
      }
    } catch (e) {
      return undefined;
    }
    return body;
  }

  // Terms of service dialog
  _showTOSdialog(reuseDialog = false) {
    if (
      this.tosLanguage === 'default' &&
      globalThis.backendaioptions.exists('language')
    ) {
      this.tosLanguage = globalThis.backendaioptions.get(
        'language',
        'default',
        'general',
      );
    }
    if (!['ko', 'en'].includes(this.tosLanguage)) {
      this.tosLanguage = 'en';
    }
    this.tosEntryURL =
      '/resources/documents/' +
      this.tosEntry +
      '.' +
      this.tosLanguage +
      '.html';
    if (this.tosContent == '') {
      const rqst = {
        method: 'GET',
        uri: this.tosEntryURL,
        body: JSON.stringify({ mode: 'dialog' }),
      };
      this.sendRequest(rqst)
        .then((response) => {
          if (typeof response !== 'undefined') {
            this.tosContent = response;
            // this.approveCheckbox.style.display = 'block';
          } else {
            this.tosContent = '';
          }
          (
            this.shadowRoot?.querySelector(
              '#terms-of-service-dialog-content',
            ) as HTMLDivElement
          ).innerHTML = DOMPurify.sanitize(this.tosContent);
          this.show = true;
          if (reuseDialog === false) {
            this.dialog.show();
          }
        })
        .catch((err) => {
          // console.log(err);
          if (err && err.message) {
            this.notification.text = PainKiller.relieve(err.title);
            this.notification.detail = err.message;
            this.notification.show(true, err);
          }
          (
            this.shadowRoot?.querySelector(
              '#terms-of-service-dialog-content',
            ) as HTMLDivElement
          ).innerHTML = DOMPurify.sanitize(
            'Problem found while loading contents. Please try again later.',
          );
        });
    } else {
      this.show = true;
      if (reuseDialog === false) {
        this.dialog.show();
      }
    }
  }

  _hideTOSdialog() {
    this.show = false;
    this.dialog.hide();
  }

  _changeApproved() {
    if (this.approveCheckbox.checked === true) {
      this.show = false;
      this.dialog.hide();
      this.approved = true;
      return;
    } else {
      this.approved = false;
      return;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lablup-terms-of-service': LablupTermsOfService;
  }
}
