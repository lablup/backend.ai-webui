/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, LitElement} from "lit-element";

import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from "../plastics/layout/iron-flex-layout-classes";
import {BackendAiStyles} from "./backend-ai-general-styles";

/**
 Lablup Progress Bar

 `lablup-progress-bar` is a static progress-bar for resource monitor.

 Example:

 <lablup-progress-bar></lablup-progress-bar>

 @group Backend.AI Console
 @element lablup-progress-bar
 */

@customElement("lablup-progress-bar")
export default class LablupProgressBar extends LitElement {
  public shadowRoot: any; // ShadowRoot

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
      .progress {
          position: relative;
          display: flex;
          height: var(--progress-bar-height, 20px);
          width: var(--progress-bar-width, 186px);
          border: var(--progress-bar-border, 0px);
          border-radius: var(--progress-bar-border-radius, 5px);
          font-size: var(--progress-bar-font-size, 10px);
          font-family: var(--progress-bar-font-family, var(--general-font-family));
          overflow: hidden;
      }

      .back {
          display: flex;
          justify-content: left;
          align-items: center;
          width: 100%;
          background: var(--progress-bar-background, var(--paper-green-500));
          color: var(--progress-bar-font-color-inverse, white);
      }

      .front {
          position: absolute;
          display: flex;
          justify-content: left;
          align-items: center;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          background: var(--general-progress-bar-bg, #e8e8e8);
          color: var(--progress-bar-font-color, black);
          clip-path: inset(0 0 0 100%);
          -webkit-clip-path: inset(0 0 0 100%);
          transition: clip-path 1s linear;
      }

      .front[slot=description-2] {
        color: var(--progress-bar-font-color, black);
      }

      `];
  }

  render() {
    // language=HTML
    return html`
    <div class="horizontal layout flex">
      <slot name="left-desc"></slot>
      <div class="progress">
          <div class="back"></div>
          <div class="front"></div>
      </div>
      <slot name="right-desc"></slot>
    </div>
    `;
  }

  firstUpdated() {
  }

  change(pct, description='') {
    let progressBar = this.shadowRoot.querySelector('.front');
    progressBar.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
    this.shadowRoot.querySelector('.front').innerHTML = '&nbsp;' + description;
    this.shadowRoot.querySelector('.back').innerHTML = '&nbsp;' + description;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lablup-progressbar": LablupProgressBar;
  }
}
