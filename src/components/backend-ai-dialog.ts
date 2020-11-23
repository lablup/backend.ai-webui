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
import '../plastics/mwc/mwc-dialog';

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
  @property({type: Boolean}) fixed = false;
  @property({type: Boolean}) narrowLayout = false;
  @property({type: Boolean}) scrollable = false;
  @property({type: Boolean}) backdrop = false;
  @property({type: Boolean}) noclosebutton = false;
  @property({type: Boolean}) persistent = false;
  @property({type: Boolean}) blockscrolling = false;
  @property({type: Boolean}) hideActions = true;
  @property({type: Boolean}) open = false;
  @property({type: String}) type = 'normal';

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
        mwc-dialog {
          --mdc-dialog-min-width: var(--component-min-width);
          --mdc-dialog-max-width: var(--component-max-width, 100%);
          --mdc-dialog-max-height: var(--component-max-height);
          --mdc-dialog-width: var(--component-width, auto);
          --mdc-dialog-height: var(--component-height, auto);
          --mdc-typography-body1-font-family: var(--general-font-family);
          --mdc-typography-body1-font-color: black;
          --mdc-typography-headline6-font-family: var(--general-font-family);
          --mdc-typography-headline6-font-color: black;
          --mdc-shape-medium: 10px;
        }

        mwc-dialog > div.card {
          padding:0;
          margin:0;
        }

        mwc-dialog > div.card > h3 {
          background-color: var(--general-dialog-background-color, #ffffff);
        }

        mwc-dialog.warning h3 {
          color: red;
        }

        mwc-dialog div.content {
          padding: var(--component-padding, 15px);
          font-size: var(--component-font-size, 14px);
          word-break: keep-all;
          overflow-x: hidden;
        }

        mwc-dialog div.footer {
          padding: 5px 15px 15px 15px;
        }

        mwc-dialog wl-button.cancel {
          margin-right: 5px;
        }

        mwc-dialog wl-button.ok {
          margin-right: 5px;
        }

        mwc-dialog[narrow] div.content,
        mwc-dialog[narrow] div.footer {
          padding: 0;
          margin: 0;
        }

        mwc-dialog[scrollable]::slotted([slot="content"]),
        mwc-dialog[scrollable] div.content-area {
          overflow-y: scroll; /* Has to be scroll (not auto) to get smooth scrolling on iOS */
          -webkit-overflow-scrolling: touch;
          max-height: calc(100vh - 190px);
        }

        mwc-dialog div.content h4 {
          font-size: 14px;
          padding: 5px 15px 5px 12px;
          margin: 0 0 10px 0;
          display: block;
          height: 20px;
          border-bottom: 1px solid #DDD;
        }
      `];
  }

  firstUpdated() {
    this.dialog = this.shadowRoot.querySelector('#dialog');
    let height = this.dialog.style.getPropertyValue('--mdc-dialog-height');
    if (height === '') {
      this.dialog.style.setProperty('--mdc-dialog-height', 'auto');
    }
    let maxheight = this.dialog.style.getPropertyValue('--mdc-dialog-max-height');
    if (maxheight === '') {
      this.dialog.style.setProperty('--mdc-dialog-max-height', 'auto');
    }
    let width = this.dialog.style.getPropertyValue('--mdc-dialog-width');
    if (width === '') {
      this.dialog.style.setProperty('--mdc-dialog-width', 'auto');
    }
    let maxwidth = this.dialog.style.getPropertyValue('--mdc-dialog-max-width');
    if (maxwidth === '') {
      this.dialog.style.setProperty('--mdc-dialog-max-width', 'auto');
    }
    this.open = this.dialog.open;
    this.dialog.addEventListener('didShow', () => {
      this._syncOpenState()
    });
    this.dialog.addEventListener('didHide', () => {
      this._syncOpenState()
    });
  }

  connectedCallback() {
    super.connectedCallback();
  }

  /**
   * Synchronize the open state according to this.open.
   */
  _syncOpenState() {
    this.open = this.dialog.open;
    if (this.open === true) {
      let event = new CustomEvent("didShow", {"detail": ""});
      this.dispatchEvent(event);
    } else {
      let event = new CustomEvent("didHide", {"detail": ""});
      this.dispatchEvent(event);
    }
  }

  /**
   * Hide a dialog.
   */
  _hideDialog() {
    this.dialog.close();
    this.open = this.dialog.open;
  }

  /**
   * Open a dialog.
   */
  show() {
    this.dialog.show();
    this.open = this.dialog.open;
  }

  /**
   * Hide a dialog.
   */
  hide() {
    this.dialog.close();
    this.open = this.dialog.open;
  }

  render() {
    // language=HTML
    return html`
      <mwc-dialog id="dialog"
                    ?fixed="${(this.fixed)}"
                    ?narrow="${(this.narrowLayout)}"
                    ?backdrop="${this.backdrop}"
                    ?persistent="${this.persistent}"
                    ?scrollable="${this.scrollable}"
                    blockscrolling="${this.blockscrolling}"
                    hideActions="${this.hideActions}"
                    style="padding:0;" class="${this.type}">
        <div elevation="1" class="card" style="margin: 0;padding:0;">
          <h3 class="horizontal center layout" style="font-weight:bold">
            <span><slot name="title"></slot></span>
            <div class="flex"></div>
            <slot name="action"></slot>
            ${this.noclosebutton ? html`` : html`
            <wl-button fab flat inverted @click="${() => this._hideDialog()}">
              <wl-icon>close</wl-icon>
            </wl-button>
            `}
          </h3>
          <div class="content content-area">
            <slot name="content"></slot>
          </div>
          <div class="footer horizontal flex layout">
            <slot name="footer">
          </div>
        </div>
      </mwc-dialog>
      `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-dialog": BackendAiDialog;
  }
}
