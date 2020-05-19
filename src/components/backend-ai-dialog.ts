/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
//import {get as _text, registerTranslateConfig, translate as _t, use as setLanguage} from "lit-translate";
import {css, customElement, html, LitElement, property} from "lit-element";
import {BackendAiStyles} from "./backend-ai-general-styles";
import 'weightless/button';
import 'weightless/card';
import 'weightless/dialog';
import 'weightless/icon';
import {IronFlex, IronFlexAlignment} from "../plastics/layout/iron-flex-layout-classes";

/**
 Backend.AI Dialog

 `backend-ai-dialog` is a dialog with close button

 Example:

 <backend-ai-dialog>
 ...
 </backend-ai-dialog>

 @group Backend.AI Console
 @element backend-ai-dialog
 */
@customElement("backend-ai-dialog")
export default class BackendAiDialog extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({type: Object}) dialog = Object();

  constructor() {
    super();
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
      `];
  }

  firstUpdated() {
    this.dialog = this.shadowRoot.querySelector('#dialog');
  }

  connectedCallback() {
    super.connectedCallback();
  }

  _hideDialog() {
    this.dialog.hide();
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
      <wl-dialog id="dialog" fixed backdrop blockscrolling
                    style="padding:0;">
        <wl-card elevation="1" class="intro" style="margin: 0; height: 100%;">
          <h3 class="horizontal center layout" style="font-weight:bold">
            <span><slot name="title"></slot></span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${() => this._hideDialog()}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <div style="padding:15px;" class="horizontal layout wrap center center-justified">
            <slot name="content"></slot>
          </div>
          <slot name="footer"></slot>
        </wl-card>
      </wl-dialog>
      `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-dialog": BackendAiDialog;
  }
}
