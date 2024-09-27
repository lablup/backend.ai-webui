/**
 @license
 Copyright (c) 2015-2024 Lablup Inc. All rights reserved.
 */
import {
  IronFlex,
  IronFlexAlignment,
} from '../plastics/layout/iron-flex-layout-classes';
import '@material/mwc-icon-button';
import { IconButton } from '@material/mwc-icon-button';
import { css, CSSResultGroup, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

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
  @property({ type: String }) title = '';
  @property({ type: String }) message = '';
  @property({ type: String }) panelId = '';
  @property({ type: String }) horizontalsize = '';
  @property({ type: String }) headerColor = '';
  @property({ type: Number }) elevation = 1;
  @property({ type: Boolean }) autowidth = false;
  @property({ type: Number }) width = 350;
  @property({ type: Number }) widthpct = 0;
  @property({ type: Number }) height = 0;
  @property({ type: Number }) marginWidth = 14;
  @property({ type: Number }) minwidth = 0;
  @property({ type: Number }) maxwidth = 0;
  @property({ type: Boolean }) pinned = false;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) narrow = false;
  @property({ type: Boolean }) noheader = false;
  @property({ type: Boolean }) scrollableY = false;

  static get styles(): CSSResultGroup {
    return [
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        div.card {
          display: block;
          background: var(
            --token-colorBgContainer,
            --general-background-color,
            #ffffff
          );
          box-sizing: border-box;
          margin: 0 !important;
          padding: 0;
          border-radius: 5px;
          width: 280px;
          line-height: 1.1;
          color: var(--token-colorText);
          border: 1px solid var(--token-colorBorder, #424242);
        }

        div.card > h4 {
          background-color: var(--token-colorBgContainer, #ffffff);
          color: var(--token-colorText, #000000);
          font-size: var(--token-fontSize, 14px);
          font-weight: 400;
          height: 48px;
          padding: 5px 15px 5px 20px;
          margin: 0 0 10px 0;
          border-radius: 5px 5px 0 0;
          border-bottom: 1px solid var(--token-colorBorder, #ddd);
          display: flex;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        div.card[disabled] {
          background-color: var(
            --token-colorBgContainerDisabled,
            rgba(0, 0, 0, 0.1)
          );
        }

        div.card > div {
          margin: 20px;
          padding-bottom: 0.5rem;
          font-size: 12px;
          overflow-wrap: break-word;
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
      `,
    ];
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css" />
      <div
        class="card"
        id="activity"
        elevation="${this.elevation}"
        ?disabled="${this.disabled}"
      >
        <h4
          id="header"
          class="horizontal center justified layout"
          style="font-weight:bold"
        >
          <span>${this.title}</span>
          <div class="flex"></div>
          <mwc-icon-button
            id="button"
            class="fg"
            icon="close"
            @click="${() => this._removePanel()}"
          ></mwc-icon-button>
        </h4>
        <div class="content ${this.disabled ? `disabled` : `enabled`}">
          <slot name="message"></slot>
        </div>
      </div>
    `;
  }

  firstUpdated() {
    if (this.pinned || this.panelId == undefined) {
      const button = this.shadowRoot?.getElementById('button') as IconButton;
      this.shadowRoot?.querySelector('h4')?.removeChild(button);
    }

    const card = this.shadowRoot?.querySelector('.card') as HTMLDivElement;
    const content = this.shadowRoot?.querySelector(
      '.content',
    ) as HTMLDivElement;
    const header = this.shadowRoot?.querySelector(
      '#header',
    ) as HTMLHeadingElement;

    if (this.autowidth) {
      card.style.width = 'auto';
    } else {
      card.style.width =
        this.widthpct !== 0 ? this.widthpct + '%' : this.width + 'px';
    }

    if (this.minwidth) {
      card.style.minWidth = this.minwidth + 'px';
    }

    if (this.maxwidth) {
      card.style.minWidth = this.maxwidth + 'px';
    }

    if (this.horizontalsize === '2x') {
      card.style.width = this.width * 2 + 28 + 'px';
    } else if (this.horizontalsize === '3x') {
      card.style.width = this.width * 3 + 56 + 'px';
    } else if (this.horizontalsize == '4x') {
      card.style.width = this.width * 4 + 84 + 'px';
    }

    card.style.margin = this.marginWidth + 'px';
    if (this.headerColor !== '') {
      header.style.backgroundColor = this.headerColor;
    }

    if (this.narrow) {
      (
        this.shadowRoot?.querySelector('div.card > div') as HTMLDivElement
      ).style.margin = '0';
      header.style.marginBottom = '0';
    }

    if (this.height > 0) {
      if (this.height == 130) {
        card.style.height = 'fit-content';
      } else {
        content.style.height = this.height - 70 + 'px';
        card.style.height = this.height + 'px';
      }
    }

    if (this.noheader) {
      header.style.display = 'none';
    }

    if (this.scrollableY) {
      content.style.overflowY = 'auto';
      content.style.overflowX = 'hidden';
    }
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
