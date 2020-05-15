/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";

import 'weightless/card';
import 'weightless/dialog';

import * as aiSDK from '../lib/backend.ai-client-es6';
declare global {
  const ai: typeof aiSDK;
}

import {BackendAIPage} from './backend-ai-page';
import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';


@customElement("backend-ai-email-verification-view")
export default class BackendAIEmailVerificationView extends BackendAIPage {
  // @property({type: Object}) _lists = Object();

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
      `;
    ];
  }

  firstUpdated() {
    console.log('email-verification-view firstUpdated')
  }

  async verify(apiEndpoint) {
    console.log('apiEndpoint:', apiEndpoint)
    this.clientConfig = new ai.backend.ClientConfig('', '', apiEndpoint, 'SESSION');
    this.client = new ai.backend.Client(
      this.clientConfig,
      'Backend.AI Console.',
    );
    const resp = await this.client.cloud.ping()
    console.log('ping resp:', resp)

    // this.verificationSuccessDialog = this.shadowRoot.querySelector('#verification-success-dialog');
    // console.log(this.verificationSuccessDialog)
    // this.verificationSuccessDialog.show();
  }

  render() {
    // language=HTML
    return html `
      <div>This is email verification view!</div>
      <wl-dialog id="verification-success-dialog" fixed backdrop blockscrolling persistent style="padding:0;">
        <wl-card class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span style="font-size:16px;">Email verified!</span>
            <div class="flex"></div>
            <mwc-icon-button icon="close" class="blue close-button"
              @click="${(e) => this._hideDialog(e)}">
            </mwc-icon-button>
          </h3>
          <div class="horizontal layout center" style="margin:5px;">
            <p style="font-size:14px;width:256px;">Your email is verified! Now you can login with your account.</p>
          </div>
        </wl-card>
      </wl-dialog>
    `;
  }
}
