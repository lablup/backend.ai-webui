/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
// import {get as _text, registerTranslateConfig, translate as _t, use as setLanguage} from "lit-translate";
import {
  IronFlex,
  IronFlexAlignment,
} from '../plastics/layout/iron-flex-layout-classes';
import { BackendAiStyles } from './backend-ai-general-styles';
import '@material/mwc-dialog';
import '@material/mwc-icon-button';
import { css, CSSResultGroup, html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

/**
 Backend.AI Dialog

 `backend-ai-dialog` is a dialog with close button

 Example:

 <backend-ai-dialog>
 ...
 </backend-ai-dialog>

@group Backend.AI Web UI
 @element backend-ai-dialog
 */
@customElement('backend-ai-dialog')
export default class BackendAIDialog extends LitElement {
  @property({ type: Boolean }) fixed = false;
  @property({ type: Boolean }) narrowLayout = false;
  @property({ type: Boolean }) scrollable = false;
  @property({ type: Boolean }) backdrop = false;
  @property({ type: Boolean }) noclosebutton = false;
  @property({ type: Boolean }) persistent = false;
  @property({ type: Boolean }) blockscrolling = false;
  @property({ type: Boolean }) hideActions = true;
  @property({ type: Boolean }) open = false;
  @property({ type: Boolean }) closeWithConfirmation = false;
  @property({ type: Boolean }) stickyTitle = false;
  @property({ type: String }) type = 'normal';
  @property({ type: String }) escapeKeyAction = 'close';
  @property({ type: String }) scrimClickAction = 'close';
  @property({ type: String }) sessionUuid; // Reserved for session list
  @property({ type: String }) sessionName; // Reserved for session list
  @property({ type: String }) sessionId; // Reserved for session list
  @property({ type: String }) filename; // Reserved for file list dialog
  @property({ type: Array }) files; // Reserved for file list dialog

  @query('#dialog') protected dialog;

  constructor() {
    super();
  }

  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        mwc-dialog {
          --mdc-dialog-min-width: var(--component-min-width, auto);
          --mdc-dialog-max-width: var(--component-max-width, 100%);
          --mdc-dialog-min-height: var(--component-min-height, auto);
          --mdc-dialog-max-height: var(
            --component-max-height,
            calc(100vh - 45px)
          );
          --mdc-dialog-width: var(--component-width, auto);
          --mdc-dialog-height: var(--component-height, auto);
          --mdc-typography-body1-font-family: var(--token-fontFamily);
          --mdc-typography-body1-font-color: var(--token-colorText, black);
          --mdc-typography-headline6-font-family: var(--token-fontFamily);
          --mdc-typography-headline6-font-color: var(--token-colorText, black);
          --mdc-shape-medium: 10px;
          --mdc-dialog-z-index: 1001;
          --mdc-dialog-heading-ink-color: var(--token-colorText, black);
          --mdc-theme-surface: var(--token-colorBgElevated);
        }

        mwc-dialog > div.card {
          padding: 0;
          margin: 0;
        }

        mwc-dialog > div.card > h3 {
          background-color: var(
            --header-background-color,
            --token-colorBgElevated,
            --general-dialog-background-color,
            #ffffff
          );
        }

        mwc-dialog.warning h3 {
          color: red;
        }

        mwc-dialog span.title {
          color: var(--token-colorText);
          background-color: var(--token-colorBgElevated);
        }

        mwc-dialog div.content {
          padding: var(--component-padding, 15px);
          font-size: var(--component-font-size, 14px);
          word-break: keep-all;
          overflow-x: hidden;
          color: var(--token-colorText);
          background-color: var(--token-colorBgElevated);
        }

        mwc-dialog div.footer {
          padding: 5px 15px 15px 15px;
          color: var(--token-colorText);
          background-color: var(--token-colorBgElevated);
        }

        mwc-dialog.ticker {
          right: 20px !important;
          bottom: 20px;
          background-color: red;
        }

        mwc-dialog[narrow] div.content,
        mwc-dialog[narrow] div.footer {
          padding: 0;
          margin: 0;
        }

        mwc-dialog[scrollable]::slotted([slot='content']),
        mwc-dialog[scrollable] div.content-area {
          overflow-y: scroll; /* Has to be scroll (not auto) to get smooth scrolling on iOS */
          -webkit-overflow-scrolling: touch;
          max-height: calc(80vh - 127px);
        }

        mwc-dialog div.content h4 {
          font-size: var(--token-fontSize, 14px);
          padding: 5px 15px 5px 12px;
          margin: 0 0 10px 0;
          display: block;
          height: 20px;
          border-bottom: 1px solid var(--token-colorBorder, #ccc) !important;
        }

        mwc-icon-button {
          color: var(--token-colorTextSecondary);
        }

        .sticky {
          position: sticky;
          position: -webkit-sticky;
          position: -moz-sticky;
          position: -ms-sticky;
          position: -o-sticky;
          top: 0;
          z-index: 10;
        }
      `,
    ];
  }

  firstUpdated() {
    this.open = this.dialog.open;
    if (this.persistent) {
      this.dialog.scrimClickAction = '';
    }
    if (this.stickyTitle) {
      (this.shadowRoot?.querySelector('h3') as HTMLElement).classList.add(
        'sticky',
      );
    }
    this.dialog.addEventListener('opened', () => {
      this.open = this.dialog.open;
    });
    this.dialog.addEventListener('closed', (e) => {
      // execute action only if the event target is dialog
      if (
        e.target.id === 'dialog' &&
        'action' in e.detail &&
        e.detail.action === 'persistent'
      ) {
        this.show();
      } else {
        this.open = this.dialog.open;
      }

      /**
       * custom event for bubbling event of closing dialog
       */
      if (
        e.target.id === 'dialog' &&
        'action' in e.detail &&
        e.detail.action === 'close'
      ) {
        const closeEvent = new CustomEvent('dialog-closed', { detail: '' });
        this.dispatchEvent(closeEvent);
      }
    });
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('locationPath:changed', this.hide);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('locationPath:changed', this.hide);
  }

  /**
   * Hide a dialog.
   */
  _hideDialog() {
    this.hide();
  }

  /**
   * Open a dialog.
   */
  show() {
    this.dialog.show();
  }

  /**
   * Hide a dialog.
   */
  hide = () => {
    if (this.closeWithConfirmation) {
      const closeEvent = new CustomEvent('dialog-closing-confirm', {
        detail: '',
      });
      this.dispatchEvent(closeEvent);
    } else {
      this.dialog.close();
      this._resetScroll();
    }
  };

  /**
   * Move to top of the dialog.
   */
  _resetScroll() {
    const content = this.shadowRoot?.querySelector('.content-area');
    content?.scrollTo(0, 0);
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css" />
      <mwc-dialog
        id="dialog"
        ?fixed="${this.fixed}"
        ?narrow="${this.narrowLayout}"
        ?backdrop="${this.backdrop}"
        ?persistent="${this.persistent}"
        ?scrollable="${this.scrollable}"
        escapeKeyAction="${this.escapeKeyAction}"
        blockscrolling="${this.blockscrolling}"
        hideActions="${this.hideActions}"
        scrimClickAction="${this.scrimClickAction}"
        style="padding:0;"
        class="${this.type}"
      >
        <div elevation="1" class="card" style="margin: 0;padding:0;">
          <h3 class="horizontal justified layout" style="font-weight:bold">
            <span class="title vertical center-justified layout">
              <slot name="title"></slot>
            </span>
            <div class="flex"></div>
            <slot name="action"></slot>
            ${this.noclosebutton
              ? html``
              : html`
                  <mwc-icon-button
                    icon="close"
                    fab
                    flat
                    inverted
                    @click="${() => this._hideDialog()}"
                  ></mwc-icon-button>
                `}
          </h3>
          <div class="content content-area">
            <slot name="content"></slot>
          </div>
          <div class="footer horizontal flex layout">
            <slot name="footer"></slot>
          </div>
        </div>
      </mwc-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-dialog': BackendAIDialog;
  }
}
