/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */
import {css, CSSResultArray, CSSResultOrNative, customElement, html, LitElement, property} from 'lit-element';
import 'weightless/button';
import 'weightless/card';
import 'weightless/icon';

import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

/**
 Lablup Activitiy Panel

 `lablup-activity-panel` is activity panel with close button.

 Example:

 <lablup-activity-panel>
 ...
 </lablup-activity-panel>

@group Backend.AI Web UI
 @element lablup-activity-panel
 */

@customElement('lablup-activity-panel')
export default class LablupActivityPanel extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({type: String}) title = '';
  @property({type: String}) message = '';
  @property({type: String}) panelId = '';
  @property({type: String}) horizontalsize = '';
  @property({type: String}) headerColor = '';
  @property({type: Number}) elevation = 1;
  @property({type: Boolean}) autowidth = false;
  @property({type: Number}) width = 350;
  @property({type: Number}) widthpct = 0;
  @property({type: Number}) height = 0;
  @property({type: Number}) marginWidth = 16;
  @property({type: Number}) minwidth = 0;
  @property({type: Number}) maxwidth = 0;
  @property({type: Boolean}) pinned = false;
  @property({type: Boolean}) disabled = false;
  @property({type: Boolean}) narrow = false;
  @property({type: Boolean}) noheader = false;
  @property({type: Boolean}) scrollableY = false;

  constructor() {
    super();
  }

  static get styles(): CSSResultOrNative | CSSResultArray {
    return [
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        div.card {
          display: block;
          background: var(--card-background-color, #ffffff);
          box-sizing: border-box;
          margin: 16px;
          padding: 0;
          border-radius: 5px;
          box-shadow: rgba(4, 7, 22, 0.7) 0px 0px 4px -2px;
          width: 280px;
        }

        div.card > h4 {
          background-color: #FFFFFF;
          color: #000000;
          font-size: 14px;
          font-weight: 400;
          height: 48px;
          padding: 5px 15px 5px 20px;
          margin: 0 0 10px 0;
          border-radius: 5px 5px 0 0;
          border-bottom: 1px solid #DDD;
          display: flex;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        div.card[disabled] {
          background-color: rgba(0, 0, 0, 0.1);
        }

        div.card > div {
          margin: 20px;
          padding-bottom: .5rem;
          font-size: 12px;
          overflow-wrap:break-word;
        }

        ul {
          padding-inline-start: 0;
        }

        #button {
          display: none;
        }

        @media screen and (max-width: 1015px) {
          div.card {
            max-width: 700px;
          }
        }

        @media screen and (max-width: 750px) {
          div.card {
            width: auto;
            height: auto !important;
          }
        }

        @media screen and (max-width: 375px) {
          div.card {
            width: 350px;
          }
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <div class="card" id="activity" elevation="${this.elevation}" ?disabled="${this.disabled}">
        <h4 id="header" class="horizontal center justified layout" style="font-weight:bold">
          <span>${this.title}</span>
          <div class="flex"></div>
          <wl-button id="button" fab flat inverted @click="${() => this._removePanel()}">
            <wl-icon>close</wl-icon>
          </wl-button>
        </h4>
        <div class="${this.disabled ? `disabled` : `enabled`}" id="content">
          <slot name="message"></slot>
        </div>
      </div>
    `;
  }

  firstUpdated() {
    if (this.pinned || this.panelId == undefined) {
      const button = this.shadowRoot.getElementById('button');
      this.shadowRoot.querySelector('h4').removeChild(button);
    }
    if (this.autowidth) {
      (this.shadowRoot.querySelector('.card') as any).style.width = 'auto';
    } else {
      (this.shadowRoot.querySelector('.card') as any).style.width = this.widthpct !== 0 ? this.widthpct + '%' : this.width + 'px';
    }


    if (this.minwidth) {
      (this.shadowRoot.querySelector('.card') as any).style.minWidth = this.minwidth + 'px';
    }
    if (this.maxwidth) {
      (this.shadowRoot.querySelector('.card') as any).style.minWidth = this.maxwidth + 'px';
    }
    if (this.horizontalsize) {
      if (this.horizontalsize == '2x') {
        (this.shadowRoot.querySelector('.card') as any).style.width = (this.width * 2 + 32) + 'px';
      }
      if (this.horizontalsize == '3x') {
        (this.shadowRoot.querySelector('.card') as any).style.width = (this.width * 3 + 64) + 'px';
      }
      if (this.horizontalsize == '4x') {
        (this.shadowRoot.querySelector('.card') as any).style.width = (this.width * 4 + 96) + 'px';
      }
    }
    (this.shadowRoot.querySelector('.card') as any).style.margin = this.marginWidth + 'px';
    if (this.headerColor !== '') {
      this.shadowRoot.querySelector('#header').style.backgroundColor = this.headerColor;
    }
    if (this.narrow === true) {
      this.shadowRoot.querySelector('div.card > div').style.margin = '0';
      this.shadowRoot.querySelector('div.card > h4').style.marginBottom = '0';
    }
    if (this.height > 0) {
      this.height == 130 ?
        this.shadowRoot.querySelector('div.card').style.height = 'fit-content' :
        this.shadowRoot.querySelector('div.card').style.height = this.height + 'px';
    }
    if (this.noheader === true) {
      this.shadowRoot.querySelector('#header').style.display = 'none';
    }
    if (this.scrollableY) {
      this.shadowRoot.querySelector('#content').style.overflowY = 'auto';
    }
  }

  connectedCallback() {
    super.connectedCallback();
  }

  _removePanel() {
    return;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lablup-activity-panel': LablupActivityPanel;
  }
}
