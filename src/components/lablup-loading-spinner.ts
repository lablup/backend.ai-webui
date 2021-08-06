/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */

import {css, CSSResultArray, CSSResultOrNative, customElement, html, LitElement, property} from 'lit-element';

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
  public shadowRoot: any; // ShadowRoot
  @property({type: Object}) spinner;
  @property({type: Boolean}) active = false;

  constructor() {
    super();
  }

  static get styles(): CSSResultOrNative | CSSResultArray {
    return [
      // language=CSS
      css`
      .spinner-box {
        width: 100px;
        background-color: transparent;
      }
      .pulse-container {
        width: 100px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .pulse-bubble {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: rgba(114, 235, 81, 0.8);
      }
      .pulse-bubble-1 {
          animation: pulse .4s ease 0s infinite alternate;
      }
      .pulse-bubble-2 {
          animation: pulse .4s ease .2s infinite alternate;
      }
      .pulse-bubble-3 {
          animation: pulse .4s ease .4s infinite alternate;
      }
      @keyframes pulse {
        from {
          opacity: 1;
          transform: scale(1);
        }
        to {
          opacity: .25;
          transform: scale(.75);
        }
      }
      `];
  }

  render() {
    // language=HTML
    return html`
      <div class="spinner-box" id="spinner">
        <div class="pulse-container">  
          <div class="pulse-bubble pulse-bubble-1"></div>
          <div class="pulse-bubble pulse-bubble-2"></div>
          <div class="pulse-bubble pulse-bubble-3"></div>
        </div>
      </div>
    `;
  }

  shouldUpdate() {
    return this.active;
  }

  firstUpdated() {
    this.spinner = this.shadowRoot.querySelector('#spinner');
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

  async is_active() {
    return this.spinner.active;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lablup-loading-spinner': LablupLoadingSpinner;
  }
}
