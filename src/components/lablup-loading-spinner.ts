/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import '@material/mwc-circular-progress';
import { css, CSSResultGroup, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 Lablup Loading Spinner

 `lablup-loading-spinner` is loading spinner.

 Example:

 <lablup-loading-spinner></lablup-loading-spinner>

 @group Backend.AI Web UI
 @element lablup-loading-spinner
 */

@customElement('lablup-loading-spinner')
export default class LablupLoadingSpinner extends LitElement {
  @property({ type: Object }) spinner;
  @property({ type: Boolean, reflect: true }) active = false;

  static get styles(): CSSResultGroup | undefined {
    return [
      // language=CSS
      css`
        mwc-circular-progress {
          width: 48px;
          height: 48px;
          position: fixed;
          --mdc-theme-primary: #e91e63;
          top: calc(50vh - 24px);
        }
      `,
    ];
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css" />
      <mwc-circular-progress id="spinner" indeterminate></mwc-circular-progress>
    `;
  }

  shouldUpdate() {
    return this.active;
  }

  firstUpdated() {
    this.spinner = this.shadowRoot?.querySelector('#spinner');
    this.active = true;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  /**
   * Set up active state and spinner style to show the loading spinner.
   * */
  async show() {
    this.active = true;
    await this.updateComplete;
    this.spinner.style.display = 'block';
  }

  /**
   * Set up active state and spinner style to hide the loading spinner.
   * */
  async hide() {
    this.active = true;
    await this.updateComplete;
    this.spinner.style.display = 'none';
    this.active = false;
  }

  /**
   * Change whether spinner is visible or not.
   * */
  async toggle() {
    await this.updateComplete;
    if (this.spinner.active === true) {
      this.active = true;
      this.spinner.style.display = 'none';
      this.active = false;
    } else {
      this.active = true;
      this.spinner.style.display = 'block';
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lablup-loading-spinner': LablupLoadingSpinner;
  }
}
