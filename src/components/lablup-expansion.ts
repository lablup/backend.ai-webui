/**
 @license
 Copyright (c) 2015-2024 Lablup Inc. All rights reserved.
 */
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import { BackendAiStyles } from './backend-ai-general-styles';
import '@material/mwc-ripple';
import { css, CSSResultGroup, html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

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
  @property({ type: String }) name = '';
  @property({ type: Boolean }) open = false;
  @property({ type: String }) leftIconName = '';
  @property({ type: String }) rightIconName = 'expand_more';
  @property({ type: Function, attribute: false }) leftCustomFunction;
  @property({ type: Function, attribute: false }) rightCustomFunction;

  @query('#accordion') expansionShell;
  @query('#left-icon') leftIcon;
  @query('#right-icon') rightIcon;
  @query('div.content') contentArea;

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
          padding: 0;
          margin: 0;
          background-color: var(
            --expansion-background-color,
            --token-colorBgContainer
          );
          color: var(--token-colorText);
        }

        #accordion > div.card > h3 {
          background-color: var(
            --expansion-header-background-color,
            --general-dialog-background-color,
            #ffffff
          );
          padding: var(--expansion-header-padding, 0);
          font-size: var(--expansion-header-font-size, 12px);
          font-weight: var(--expansion-header-font-weight, 600);
          font-family: var(--token-fontFamily);
          transition: all 0.35s;
        }
        #accordion > div.card > h3 > mwc-icon-button {
          --mdc-icon-button-size: 24px;
        }

        div.content {
          font-size: var(--expansion-content-font-size, 14px);
          word-break: keep-all;
          overflow-x: hidden;
        }

        #accordion div.content {
          max-height: 0;
          transition: all 0.35s;
          padding: 0;
          margin: 0;
        }

        #accordion[open] div.content {
          margin: var(--expansion-content-margin, 0);
          padding: var(--expansion-content-padding, 0);
          max-height: 100vh;
        }

        #accordion #left-icon,
        #accordion #right-icon {
          transition: all 0.35s;
          transform: rotate(0deg);
          margin: var(--expansion-icon-margin, 0 5px 0 0);
        }

        #accordion #left-icon {
          margin: var(--expansion-left-icon-margin, 0 5px 0 0);
        }

        #accordion #right-icon {
          margin: var(--expansion-right-icon-margin, 0 5px 0 0);
        }

        #accordion[open] #left-icon:not(.noRotate),
        #accordion[open] #right-icon:not(.noRotate) {
          transition: all 0.35s;
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
          border-bottom: 1px solid var(--token-colorBorder, #ccc) !important;
        }
      `,
    ];
  }
  _toggleAccordion() {
    if (this.expansionShell.hasAttribute('open')) {
      this.expansionShell.removeAttribute('open');
    } else {
      this.expansionShell.setAttribute('open', 'true');
    }
  }
  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css" />
      <div .name="${this.name}" id="accordion" ${this.open ? 'open' : ''}>
        <div elevation="1" class="card" style="margin: 0;padding:0;">
          <h3
            class="horizontal justified layout"
            style="font-weight:bold"
            @click="${() => this._toggleAccordion()}"
          >
            ${this.leftIconName &&
            html`
              <mwc-icon-button
                id="left-icon"
                icon="${this.leftIconName}"
                class="${this.leftCustomFunction ? 'noRotate' : ''}"
                @click="${(e) => {
                  if (this.leftCustomFunction) {
                    e.stopPropagation();
                    this.leftCustomFunction();
                  }
                }}"
              ></mwc-icon-button>
            `}
            <span class="vertical center-justified layout">
              <slot name="title"></slot>
            </span>
            <div class="flex"></div>
            <slot name="action"></slot>
            ${this.rightIconName &&
            html`
              <mwc-icon-button
                id="right-icon"
                icon="${this.rightIconName}"
                class="${this.rightCustomFunction ? 'noRotate' : ''}"
                @click="${(e) => {
                  if (this.rightCustomFunction) {
                    e.stopPropagation();
                    this.rightCustomFunction();
                  }
                }}"
              ></mwc-icon-button>
            `}
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
      this.expansionShell.setAttribute('open', 'true');
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lablup-expansion': LablupExpansion;
  }
}
