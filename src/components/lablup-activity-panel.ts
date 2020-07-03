/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {css, customElement, html, LitElement, property} from "lit-element";
import 'weightless/button';
import 'weightless/card';
import 'weightless/icon';

import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

@customElement("lablup-activity-panel")
export default class LablupActivityPanel extends LitElement {
  public shadowRoot: any; // ShadowRoot
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
  @property({type: Boolean}) disabled = false;

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
          border-radius: 10px;
          --card-elevation: rgba(4, 7, 22, 0.15) 0px 5px 10px -2px;
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
          border-radius: 10px 10px 0 0;
          border-bottom: 1px solid #DDD;
          @apply --layout-justified;
          display: flex;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        wl-card[disabled] {
          background-color: rgba(0, 0, 0, 0.1);
        }

        wl-card > div {
          margin: 20px;
          padding-bottom: 20px;
          font-size: 12px;
          padding-left: 3px;
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
      <wl-card id="activity" elevation="${this.elevation}" ?disabled="${this.disabled}">
        <h4 class="horizontal center layout" style="font-weight:bold">
          <span>${this.title}</span>
          <div class="flex"></div>
          <wl-button id="button" fab flat inverted @click="${() => this._removePanel()}">
            <wl-icon>close</wl-icon>
          </wl-button>
        </h4>
        <div class="${this.disabled ? `disabled` : `enabled`}">
          <slot name="message"></slot>
        </div>
      </wl-card>
    `;
  }

  firstUpdated() {
    if (this.pinned || this.panelId == undefined) {
      const button = this.shadowRoot.getElementById('button');
      this.shadowRoot.querySelector('h4').removeChild(button);
    }
    (this.shadowRoot.querySelector('wl-card') as any).style.width = this.width + "px";
    if (this.minwidth) {
      (this.shadowRoot.querySelector('wl-card') as any).style.minWidth = this.minwidth + "px";
    }
    if (this.maxwidth) {
      (this.shadowRoot.querySelector('wl-card') as any).style.minWidth = this.maxwidth + "px";
    }
    if (this.horizontalsize) {
      if (this.horizontalsize == '2x') {
        (this.shadowRoot.querySelector('wl-card') as any).style.width = (this.width * 2 + 32) + "px";
      }
      if (this.horizontalsize == '3x') {
        (this.shadowRoot.querySelector('wl-card') as any).style.width = (this.width * 3 + 32) + "px";
      }
    }
    (this.shadowRoot.querySelector('wl-card') as any).style.margin = this.marginWidth + "px";
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
