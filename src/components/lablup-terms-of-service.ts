import {css, html} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import '@polymer/paper-input/paper-input';
import '@polymer/paper-item/paper-item';
import 'weightless/button';
import 'weightless/icon';
import 'weightless/card';
import 'weightless/dialog';
import 'weightless/title';
import 'weightless/textfield';
import 'weightless/expansion';
import 'weightless/checkbox';
import './lablup-notification';

import './backend-ai-credential-list';
import './backend-ai-resource-policy-list';
import './backend-ai-user-list';

import {BackendAiStyles} from "./backend-ai-console-styles";
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from "../plastics/layout/iron-flex-layout-classes";
import {default as PainKiller} from "./backend-ai-painkiller";


class LablupTermsOfService extends BackendAIPage {
	public tosEntryURL: string;
	public tosContent: string;
	public show: boolean;
	public approved: boolean;
	public notification: object;

  constructor() {
    super();
    this.tosEntryURL = '/@lablupinc/terms-of-service-payment';
    this.tosContent = "";
    this.approved = false;
    this.show = false;
  }

  static get is() {
    return 'lablup-terms-of-service';
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

  static get properties() {
    return {
      // Terms of service entry id
      tosEntryURL: {
        type: String
      },
      tosContent: {
        type: String
      },
      approved: {
        type: Boolean
      },
      show: {
        type: Boolean
      },
      notification: {
        type: Object
      }
    }
  }

  render() {
    // language=HTML
    return html`
      <lablup-notification id="notification"></lablup-notification>
      <wl-dialog id="terms-of-service-dialog" class="terms-of-service-dialog" fixed blockscrolling scrollable>
        <wl-title level="3" slot="header">Terms of Service</wl-title>
        <div slot="content">
            <div id="terms-of-service-dialog-content"></div>
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
    this.shadowRoot.querySelector('#approve-terms-of-service').addEventListener('iron-change', this._changeApproved.bind(this));
    if (this.show) {
      this._showTOSdialog();
    }
  }

  connectedCallback() {
    super.connectedCallback();
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
              this.shadowRoot.querySelector('#terms-of-service-dialog-content').innerHTML = this.tosContent;
              this.shadowRoot.querySelector('#approve-terms-of-service').style.display = 'block';
            } else {
              if (typeof response.error_msg !== 'undefined') {
                this.shadowRoot.querySelector('#terms-of-service-dialog-content').innerHTML = response.error_msg;
                this.shadowRoot.querySelector('#approve-terms-of-service').style.display = 'none';
              } else {
                this.shadowRoot.querySelector('#terms-of-service-dialog-content').innerHTML = "Load failed.";
                this.shadowRoot.querySelector('#approve-terms-of-service').style.display = 'none';
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
      this.shadowRoot.querySelector('#terms-of-service-dialog').show();
    }
  }

  _changeApproved() {
    if (this.shadowRoot.querySelector('#approve-terms-of-service').checked == true) {
      this.shadowRoot.querySelector('#terms-of-service-dialog').hide();
      this.approved = true;
      return;
    } else {
      this.approved = false;
      return;
    }
  }
}

customElements.define(LablupTermsOfService.is, LablupTermsOfService);
