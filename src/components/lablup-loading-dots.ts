/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */

import {css, CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';


/**
 Lablup Loading Dots

 `lablup-loading-dots` is loading dots.

 Example:

 <lablup-loading-dots></lablup-loading-dots>

 @group Backend.AI Web UI
 @element lablup-loading-dots
 */

@customElement('lablup-loading-dots')
export default class LablupLoadingdots extends LitElement {
  @property({type: Boolean}) active = true;
  @query('#dots') dots!: HTMLDivElement;

  static get styles(): CSSResultGroup {
    return [
      // language=CSS
      css`
        .dots-box {
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
      <div class="dots-box" id="dots">
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
    // this.dots = this.shadowRoot.querySelector('#dots');
    this.active = true;
  }

  /**
   * Set up active state and dots style to show the loading dots.
   * */
  async show() {
    this.active = true;
    await this.updateComplete;
    this.dots.style.display = 'block';
  }

  /**
   * Set up active state and dots style to hide the loading dots.
   * */
  async hide() {
    this.active = true;
    await this.updateComplete;
    this.dots.style.display = 'none';
    this.active = false;
  }

  /**
   * Change whether dots are visible or not.
   * */
  async toggle() {
    await this.updateComplete;
    if (this.dots.style.display === 'block') {
      await this.hide();
    } else {
      await this.show();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lablup-loading-dots': LablupLoadingdots;
  }
}
