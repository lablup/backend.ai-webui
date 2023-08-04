/**
 @license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
 */

import {css, CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

import '@material/mwc-ripple';

import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';
import {BackendAiStyles} from './backend-ai-general-styles';

/**
 Lablup Expansion

 `lablup-expansion` is accordion to expand / collapse content area.

 Example:

 <lablup-expansion></lablup-expansion>

 @group Backend.AI Web UI
 @element lablup-expansion
 */

@customElement('lablup-expansion')
export default class LablupExpansion extends LitElement {
  @property({type: String}) name = '';
  @property({type: Boolean}) open = false;

  @query('#accordion') ExpansionShell;
  @query('#expand_icon') ExpandIcon;
  @query('div.content') ContentArea;

  static get styles(): CSSResultGroup | undefined {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        div.card {
          padding:0;
          margin:0;
        }

        #accordion > div.card > h3 {
          background-color: var(--general-dialog-background-color, #ffffff);
          padding: var(--expansion-header-padding, 0);
          font-size: var(--expansion-header-font-size, 12px);
          font-weight: var(--expansion-header-font-weight, 600);
          font-family: var(--general-font-family);
          transition: all .35s;
        }
        #accordion > div.card > h3 > mwc-icon-button {
          --mdc-icon-button-size: 16px;
        }

        div.content {
          font-size: var(--expansion-content-font-size, 14px);
          word-break: keep-all;
          overflow-x: hidden;
        }

        #accordion div.content {
          max-height: 0;
          transition: all .35s;
          padding: 0;
          margin: 0;
        }

        #accordion[open] div.content {
          margin: var(--expansion-content-margin, 0);
          padding: var(--expansion-content-padding, 0);
          max-height: 100vh;
        }

        #accordion #expand_icon {
          transition: all .35s;
          transform: rotate(0deg);
        }

        #accordion[open] #expand_icon {
          transition: all .35s;
          transform: rotate(-180deg);
        }

        div[narrow] div.content {
          padding: 0;
          margin: 0;
        }

        div.content h4 {
          font-size: 14px;
          padding: 5px 15px 5px 12px;
          margin: 0 0 10px 0;
          display: block;
          height: 20px;
          border-bottom: 1px solid #DDD !important;
        }
      `];
  }
  _toggleAccordion() {
    if (this.ExpansionShell.hasAttribute('open')) {
      this.ExpansionShell.removeAttribute('open');
      //this.ExpandIcon.icon = 'expand_more';
    } else {
      this.ExpansionShell.setAttribute('open', 'true');
      //this.ExpandIcon.icon = 'expand_less';
    }
  }
  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css">
      <div .name="${this.name}" id="accordion" ${this.open ? 'open' : ''}>
        <div elevation="1" class="card" style="margin: 0;padding:0;">
          <h3 class="horizontal justified layout" style="font-weight:bold" @click="${() => this._toggleAccordion()}">
            <span class="vertical center-justified layout">
              <slot name="title"></slot>
            </span>
            <div class="flex"></div>
            <slot name="action"></slot>
            <mwc-icon-button id="expand_icon" icon="expand_more">
            </mwc-icon-button>
          </h3>
          <div class="content">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    if (this.open) {
      this.ExpansionShell.setAttribute('open', 'true');
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lablup-expansion': LablupExpansion;
  }
}
