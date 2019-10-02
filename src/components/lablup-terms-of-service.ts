/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */
import {css, customElement, html, LitElement, property} from "lit-element";

import 'weightless/button';
import 'weightless/icon';
import 'weightless/card';
import 'weightless/dialog';
import 'weightless/title';
import 'weightless/checkbox';

import {BackendAiStyles} from "./backend-ai-console-styles";
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from "../plastics/layout/iron-flex-layout-classes";
import {default as PainKiller} from "./backend-ai-painkiller";

@customElement("lablup-terms-of-service")
export default class LablupTermsOfService extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({type: String}) tosEntryURL = '/resources/documents/terms-of-service.html';
  @property({type: String}) tosContent = '';
  @property({type: String}) title = '';
  @property({type: Boolean}) show = false;
  @property({type: Boolean}) approved = false;
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
              wl-dialog.terms-of-service-dialog {
                  --dialog-width: 80% !important;
                  --dialog-height: 80vh;
              }
          }

          @media screen and (min-width: 670px) {
              wl-dialog.terms-of-service-dialog {
                  --dialog-width: 650px !important;
                  --dialog-height: 80vh;
              }
          }

          wl-button {
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
      <wl-dialog id="terms-of-service-dialog" class="terms-of-service-dialog" fixed blockscrolling scrollable>
        <wl-title level="3" slot="header">${this.title}</wl-title>
        <div slot="content">
          <div id="terms-of-service-dialog-content"></div>
        </div>
        <div slot="footer">
          <wl-button class="fg green" id="dismiss-button" outlined type="button" @click="${() => {
      this.close();
    }}">
              Dismiss
          </wl-button>
        </div>
      </wl-dialog>
    `;
  }

  firstUpdated() {
    this.notification = window.lablupNotification;
    this.dialog = this.shadowRoot.querySelector('#terms-of-service-dialog');
    //this.approveCheckbox = this.shadowRoot.querySelector('#approve-terms-of-service');
    //this.approveCheckbox.addEventListener('iron-change', this._changeApproved.bind(this));
    if (this.show) {
      this._showTOSdialog();
    }
  }

  async open() {
    await this.updateComplete;
    this._showTOSdialog();
  }

  close() {
    this.show = false;
    this._hideTOSdialog();
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
  _showTOSdialog() {
    if (this.tosContent == "") {
      let rqst = {
        method: 'GET',
        uri: this.tosEntryURL,
        body: JSON.stringify({'mode': 'dialog'})
      };
      this.sendRequest(rqst).then((response) => {
        console.log(response);
        if (typeof response !== 'undefined') {
          this.tosContent = response;
          //this.approveCheckbox.style.display = 'block';
        } else {
          this.tosContent = '';
        }
        this.shadowRoot.querySelector('#terms-of-service-dialog-content').innerHTML = this.tosContent;
        this.show = true;
        this.dialog.show();
      }).catch((err) => {
        console.log(err);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.message);
          this.notification.detail = err.message;
          this.notification.show(true);
        }
      });
    } else {
      this.show = true;
      this.dialog.show();
    }
  }

  _hideDialog(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-dialog');
    dialog.hide();
  }

  _hideTOSdialog() {
    this.show = false;
    this.dialog.hide();
  }

  _changeApproved() {
    if (this.approveCheckbox.checked == true) {
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
