/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from "lit-translate";
import {css, customElement, html, LitElement, property} from "lit-element";

import 'weightless/button';
import 'weightless/icon';
import 'weightless/card';
import 'weightless/title';
import 'weightless/checkbox';

import './backend-ai-dialog';
import {BackendAiStyles} from "./backend-ai-general-styles";
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from "../plastics/layout/iron-flex-layout-classes";
import {default as PainKiller} from "./backend-ai-painkiller";

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

@customElement("lablup-terms-of-service")
export default class LablupTermsOfService extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({type: String}) tosEntryURL = '/resources/documents/terms-of-service.en.html';
  @property({type: String}) tosEntry = 'terms-of-service';
  @property({type: String}) tosContent = '';
  @property({type: String}) tosLanguage = 'en';
  @property({type: Array}) tosLanguages = [
    {code: 'ko', text: _text("language.Korean")},
    {code: 'en', text: _text("language.English")}
  ];
  @property({type: String}) title = '';
  @property({type: Boolean}) show = false;
  @property({type: Boolean}) approved = false;
  @property({type: Boolean}) block = false;
  @property({type: Object}) notification;
  @property({type: Object}) approveCheckbox = Object();
  @property({type: Object}) dialog = Object();

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
        @media screen and (max-width: 669px) {
          backend-ai-dialog.terms-of-service-dialog {
            --component-width: 85% !important;
            --component-height: 80vh;
          }
        }

        @media screen and (min-width: 670px) {
          backend-ai-dialog.terms-of-service-dialog {
            --component-width: 650px !important;
            --component-height: 80vh;
          }
        }

        wl-button.language {
          --button-bg: transparent;
          --button-bg-hover: var(--paper-lightblue-300);
          --button-bg-active: var(--paper-lightblue-300);
        }

        wl-button.language[active] {
          --button-bg: var(--paper-lightblue-300);
        }

        wl-button.dismiss {
          --button-bg: transparent;
          --button-bg-hover: var(--paper-green-300);
          --button-bg-active: var(--paper-green-300);
        }
      `];
  }

  tos_contents() {
    // language=HTML
    return html`
    `;
  }

  render() {
    // language=HTML
    return html`
      <backend-ai-dialog id="terms-of-service-dialog" class="terms-of-service-dialog" fixed blockscrolling persistent scrollable>
        <span slot="title">${this.title}</span>
        <div slot="action" class="horizontal end-justified center flex layout">
          ${this.tosLanguages ? html`
            <span style="font-size:14px;">${_t("language.Language")}</span>
            ${this.tosLanguages.map(item => html`
            <wl-button class="fg blue language" outlined type="button" ?active="${this.tosLanguage === item.code}" @click="${() => {
      this.changeLanguage(item.code)
    }}">
                ${item.text}
            </wl-button>`)}
          ` : html``}
        </div>
        <div slot="content">
          <div id="terms-of-service-dialog-content"></div>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <div class="flex"></div>
          <wl-button class="fg green dismiss" id="dismiss-button" outlined type="button" @click="${() => {
      this.close();
    }}">
              ${_t("button.Dismiss")}
          </wl-button>
        </div>
      </backend-ai-dialog>
    `;
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    this.dialog = this.shadowRoot.querySelector('#terms-of-service-dialog');
    this.dialog.addEventListener('didShow', () => {
      this._syncOpenState()
    });
    this.dialog.addEventListener('didHide', () => {
      this._syncOpenState()
    });
    if (this.block) {
      this.dialog.backdrop = true;
    }
    //this.approveCheckbox = this.shadowRoot.querySelector('#approve-terms-of-service');
    //this.approveCheckbox.addEventListener('iron-change', this._changeApproved.bind(this));
    if (this.show) {
      this._showTOSdialog();
    }
  }

  attributeChangedCallback(name, oldval, newval) {
    super.attributeChangedCallback(name, oldval, newval);
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

  changeLanguage(lang) {
    this.tosContent = "";
    this.tosLanguage = lang;
    this._showTOSdialog(true);
  }

  async sendRequest(rqst) {
    let resp, body;
    try {
      if (rqst.method == 'GET') {
        rqst.body = undefined;
      }
      resp = await fetch(rqst.uri, rqst);
      let contentType = resp.headers.get('Content-Type');
      if (contentType.startsWith('application/json') ||
        contentType.startsWith('application/problem+json')) {
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
      console.log(e);
    }
    return body;
  }

  // Terms of service dialog
  _showTOSdialog(reuseDialog = false) {
    if (this.tosLanguage === 'default' && globalThis.backendaioptions.exists('current_language')) {
      this.tosLanguage = globalThis.backendaioptions.get('current_language');
    }
    if (!['ko', 'en'].includes(this.tosLanguage)) {
      this.tosLanguage = 'en';
    }
    this.tosEntryURL = '/resources/documents/' + this.tosEntry + '.' + this.tosLanguage + '.html';
    if (this.tosContent == "") {
      let rqst = {
        method: 'GET',
        uri: this.tosEntryURL,
        body: JSON.stringify({'mode': 'dialog'})
      };
      this.sendRequest(rqst).then((response) => {
        if (typeof response !== 'undefined') {
          this.tosContent = response;
          //this.approveCheckbox.style.display = 'block';
        } else {
          this.tosContent = '';
        }
        this.shadowRoot.querySelector('#terms-of-service-dialog-content').innerHTML = this.tosContent;
        this.show = true;
        if (reuseDialog === false) {
          this.dialog.show();
        }
      }).catch((err) => {
        console.log(err);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
        this.shadowRoot.querySelector('#terms-of-service-dialog-content').innerHTML = "Problem found while loading contents. Please try again later.";
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
    "lablup-terms-of-service": LablupTermsOfService;
  }
}
