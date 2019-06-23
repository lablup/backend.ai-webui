/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, html, LitElement} from 'lit-element';
import '@polymer/paper-spinner/paper-spinner-lite';

class LablupLoadingIndicator extends LitElement {
  static get is() {
    return 'lablup-loading-indicator';
  }

  static get styles() {
    return [
      // language=CSS
      css`
        paper-spinner-lite {
          --paper-spinner-layer-1-color: #9c27b0;
          --paper-spinner-layer-2-color: #00bcd4;
          --paper-spinner-layer-3-color: #607d8b;
          --paper-spinner-layer-4-color: #ffc107;
          --paper-spinner-stroke-width: 6px;
          width: 48px;
          height: 48px;
          position: fixed;
          /*top: calc(50vh - 24px);*/
          bottom: 60px;
          right: 60px;
        }

        /*
                @media screen and (max-width: 899px) {
                  paper-spinner-lite {
                    left: calc(50% - 24px);
                  }
                }
        
                @media screen and (min-width: 900px) {
                  paper-spinner-lite {
                    left: calc(50% + 71px);
                  }
                }*/
      `];
  }

  render() {
    // language=HTML
    return html`
      <paper-spinner-lite></paper-spinner-lite>
    `;
  }

  static get properties() {
    return {
      active: {
        type: Boolean
      }
    };
  }

  constructor() {
    super();
    this.active = true;
  }

  shouldUpdate() {
    return this.active;
  }

  firstUpdated() {
    this.indicator = this.shadowRoot.querySelector('paper-spinner-lite');
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  async getMoreState() {

  }

  async show() {
    await this.updateComplete;
    this.indicator.active = true;
  }

  async hide() {
    await this.updateComplete;
    this.indicator.active = false;
  }

  async toggle() {
    await this.updateComplete;
    if (this.indicator.active === true) {
      this.indicator.active = false;
    } else {
      this.indicator.active = true;
    }
  }

}

customElements.define(LablupLoadingIndicator.is, LablupLoadingIndicator);
