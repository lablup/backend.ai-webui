/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import { BackendAiStyles } from './backend-ai-general-styles';
import '@material/mwc-linear-progress';
import { css, CSSResultGroup, html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

/**
 Backend.AI Indicator

 @group Backend.AI Web UI
 @element backend-ai-indicator
 */

@customElement('backend-ai-indicator')
export default class BackendAIIndicator extends LitElement {
  @property({ type: Number }) value = 0;
  @property({ type: Number }) delay = 1000;
  @property({ type: String }) text = '';
  @property({ type: String }) mode = 'determinate';
  @query('#app-progress-dialog') dialog;
  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      // language=CSS
      css`
        #app-progress-dialog {
          position: fixed;
          right: 20px !important;
          bottom: 20px;
          z-index: 9000;
          height: auto;
          width: 250px;
          padding: 15px;
          display: none;
          background-color: #ffffff;
          border-radius: 3px;
          box-shadow:
            0 1px 3px -1px rgba(0, 0, 0, 60%),
            0 3px 12px -1px rgb(200, 200, 200, 80%);
        }
        #app-progress-dialog h3 {
          font-size: 14px;
        }
        mwc-linear-progress {
          --mdc-theme-primary: var(--general-select-color, #333);
        }
      `,
    ];
  }

  firstUpdated() {
    //this.dialog = this.shadowRoot?.querySelector('#app-progress-dialog');
  }

  connectedCallback() {
    super.connectedCallback();
  }

  async start(mode = 'determinate') {
    this.value = 0;
    this.mode = mode;
    await this.updateComplete;
    this.dialog.style.display = 'block';
  }

  set(value, text = '') {
    this.value = value / 100.0;
    this.text = text;
    if (this.value >= 1) {
      this.end(this.delay);
    }
  }

  end(delay = 1000) {
    if (delay !== 0) {
      this.delay = delay;
    }
    setTimeout(() => {
      this.dialog.style.display = 'none';
    }, delay);
  }

  render() {
    // language=HTML
    return html`
      <div id="app-progress-dialog">
        <h3>${this.text}</h3>
        <mwc-linear-progress
          ?indeterminate="${this.mode != 'determinate'}"
          id="app-progress"
          .progress="${this.value}"
        ></mwc-linear-progress>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-indicator': BackendAIIndicator;
  }
}
