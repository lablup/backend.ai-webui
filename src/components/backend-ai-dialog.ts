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
  @property({type: Boolean}) fixed = false;
  @property({type: Boolean}) narrowLayout = false;
  @property({type: Boolean}) scrollable = false;
  @property({type: Boolean}) backdrop = false;
  @property({type: Boolean}) noclosebutton = false;
  @property({type: Boolean}) persistent = false;
  @property({type: Boolean}) blockscrolling = false;
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
        wl-dialog {
          --dialog-min-width: var(--component-min-width);
          --dialog-max-width: var(--component-max-width);
          --dialog-max-height: var(--component-max-height);
          --dialog-width: var(--component-width);
          --dialog-height: var(--component-height);
        }

        wl-dialog wl-card,
        wl-dialog wl-expansion {
          background: var(--general-dialog-background-color) !important;
          color: var(--general-dialog-color) !important;
        }


        wl-dialog > wl-card {
          --card-elevation: 0;
        }

        wl-dialog > wl-card > h3 {
          background-color: var(--general-dialog-background-color, #ffffff);
        }

        wl-dialog.warning h3 {
          color: red;
        }

        wl-dialog h3 > wl-button {
        }

        wl-dialog div.content {
          padding: var(--component-padding, 15px);
          font-size: var(--component-font-size, 14px);
          word-break: keep-all;
        }

        wl-dialog div.footer {
          padding: 5px 15px 10px 15px;
        }

        wl-dialog wl-button.cancel {
          margin-right: 5px;
        }

        wl-dialog wl-button.ok {
          margin-right: 5px;
        }

        wl-dialog[narrow] div.content,
        wl-dialog[narrow] div.footer {
          padding: 0;
          margin: 0;
        }

        wl-dialog[scrollable]::slotted([slot="content"]),
        wl-dialog[scrollable] div.content-area {
          overflow-y: scroll; /* Has to be scroll (not auto) to get smooth scrolling on iOS */
          -webkit-overflow-scrolling: touch;
          height: calc(var(--component-height) - 90px);
        }
      `];
  }

  firstUpdated() {
    this.dialog = this.shadowRoot.querySelector('#dialog');
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

  _hideDialog() {
    this.dialog.hide();
    this.open = this.dialog.open;
  }

  show() {
    this.dialog.show();
    this.open = this.dialog.open;
  }

  hide() {
    this.dialog.hide();
    this.open = this.dialog.open;
  }

  render() {
    // language=HTML
    return html`
      <wl-dialog id="dialog"
                    ?fixed="${(this.fixed)}"
                    ?narrow="${(this.narrowLayout)}"
                    ?backdrop="${this.backdrop}"
                    ?persistent="${this.persistent}"
                    ?scrollable="${this.scrollable}"
                    blockscrolling="${this.blockscrolling}"
                    style="padding:0;" class="${this.type}">
        <wl-card elevation="1" class="intro panel" style="margin: 0; height: 100%;">
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
            <slot name="footer"></slot>
          </div>
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
