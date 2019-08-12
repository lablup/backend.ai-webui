/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */
import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import 'weightless/button';
import 'weightless/icon';
import 'weightless/card';
import 'weightless/dialog';
import 'weightless/title';
import 'weightless/checkbox';
import './lablup-notification';
import {BackendAiStyles} from "./backend-ai-console-styles";
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from "../plastics/layout/iron-flex-layout-classes";
import {default as PainKiller} from "./backend-ai-painkiller";

@customElement("lablup-terms-of-service")
class LablupTermsOfService extends BackendAIPage {

  @property({type: String}) tosEntryURL = '/@lablupinc/terms-of-service-payment';
  @property({type: String}) tosContent = '';
  @property({type: Boolean}) show = false;
  @property({type: Boolean}) approved = false;
  @property({type: Object}) notification = Object();
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
            width: 80% !important;
          }
        }

        @media screen and (min-width: 670px) {
          wl-dialog.terms-of-service-dialog {
            width: 650px !important;
          }
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <lablup-notification id="notification"></lablup-notification>
      <wl-dialog id="terms-of-service-dialog" class="terms-of-service-dialog" fixed blockscrolling scrollable>
        <wl-title level="3" slot="header">Terms of Service</wl-title>
        <div slot="content">
            <div id="terms-of-service-dialog-content">${this.tosContent}</div>
        </div>
        <div slot="footer">
            <wl-button id="dismiss-button" invert flat>
                Dismiss
            </wl-button>
            <wl-checkbox id="approve-terms-of-service" autofocus>
                Read
            </wl-checkbox>
        </div>
      </wl-dialog>
    `;
  }

  firstUpdated() {
    this.notification = this.shadowRoot.querySelector('#notification');
    this.dialog = this.shadowRoot.querySelector('#terms-of-service-dialog');
    this.approveCheckbox = this.shadowRoot.querySelector('#approve-terms-of-service');
    this.approveCheckbox.addEventListener('iron-change', this._changeApproved.bind(this));
    if (this.show) {
      this._showTOSdialog();
    }
  }

  open() {
    this._showTOSdialog();
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
      this.sendRequest(rqst)
        .then((response) => {
          if (typeof response !== 'undefined') {
            if (response.success === 1) {
              this.tosContent = response.content;
              this.approveCheckbox.style.display = 'block';
            } else {
              if (typeof response.error_msg !== 'undefined') {
                this.tosContent = response.error_msg;
                this.approveCheckbox.style.display = 'none';
              } else {
                this.tosContent = "Load failed.";
                this.approveCheckbox.style.display = 'none';
              }
            }
          }
        }).catch((err) => {
          console.log(err);
          if (err && err.message) {
            this.notification.text = PainKiller.relieve(err.message);
            this.notification.show();
          }
        });
    } else {
      this.dialog.show();
    }
  }

  _changeApproved() {
    if (this.approveCheckbox.checked == true) {
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
