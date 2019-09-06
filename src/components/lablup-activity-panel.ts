/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */
import {css, customElement, html, LitElement, property} from "lit-element";
import '@polymer/paper-icon-button/paper-icon-button';
import 'weightless/card';

import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

@customElement("lablup-activity-panel")
export default class LablupActivityPanel extends LitElement {
  @property({type: String}) title = '';
  @property({type: String}) message = '';
  @property({type: String}) panelId = '';
  @property({type: String}) horizontalsize = '';
  @property({type: Number}) elevation = 1;
  @property({type: Number}) width = 280;
  @property({type: Number}) marginWidth = 16;
  @property({type: Number}) minwidth = 0;
  @property({type: Number}) maxwidth = 0;
  @property({type: Boolean}) pinned = false;

  constructor() {
    super();
  }

  static get styles() {
    return [
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
          wl-card {
              display: block;
              background: white;
              box-sizing: border-box;
              margin: 16px;
              padding: 0;
              border-radius: 5px;
          }

          wl-card > h4 {
              border-left: 3px solid var(--paper-green-900);
              background-color: var(--paper-green-500);
              color: #eee;
              font-size: 14px;
              font-weight: 400;
              height: 32px;
              padding: 5px 15px 5px 20px;
              margin: 0 0 10px 0;
              border-bottom: 1px solid #DDD;
              @apply --layout-justified;
              display: flex;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
          }

          wl-card > div {
              margin: 20px;
              padding-bottom: 20px;
              font-size: 12px;
              padding-left: 3px;
          }

          wl-card > h4 > paper-icon-button {
              display: flex;
          }

          wl-card > h4 > paper-icon-button,
          wl-card > h4 > paper-icon-button #icon {
              width: 15px;
              height: 15px;
              padding: 0;
          }

          ul {
              padding-inline-start: 0;
          }

          #button {
              display: none;
          }
      `];
  }

  render() {
    // language=HTML
    return html`
      <wl-card id="activity" elevation="${this.elevation}">
        <h4 class="layout flex justified center">${this.title}
          <paper-icon-button id="button" icon="close"></paper-icon-button>
        </h4>
        <div>
          <slot name="message"></slot>
        </div>
      </wl-card>
    `;
  }

  firstUpdated() {
    if (this.pinned || this.panelId == undefined) {
      const button = this.shadowRoot.getElementById('button');
      this.shadowRoot.querySelector('h4').removeChild(button);
    } else {
      this.shadowRoot.querySelector('#button').addEventListener('tap', this._removePanel.bind(this));
    }
    this.shadowRoot.querySelector('wl-card').style.width = this.width + "px";
    if (this.minwidth) {
      this.shadowRoot.querySelector('wl-card').style.minWidth = this.minwidth + "px";
    }
    if (this.maxwidth) {
      this.shadowRoot.querySelector('wl-card').style.minWidth = this.maxwidth + "px";
    }
    if (this.horizontalsize) {
      if (this.horizontalsize == '2x') {
        this.shadowRoot.querySelector('wl-card').style.width = (this.width * 2 + 32) + "px";
      }
      if (this.horizontalsize == '3x') {
        this.shadowRoot.querySelector('wl-card').style.width = (this.width * 3 + 32) + "px";
      }
    }
    this.shadowRoot.querySelector('wl-card').style.margin = this.marginWidth + "px";
  }

  connectedCallback() {
    super.connectedCallback();
  }

  _removePanel() {
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lablup-activity-panel": LablupActivityPanel;
  }
}
