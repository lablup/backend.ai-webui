/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */

import {css, CSSResultArray, CSSResultOrNative, customElement, html, LitElement, property} from "lit-element";

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

@group Backend.AI Web UI
 @element lablup-progress-bar
 */

@customElement("lablup-progress-bar")
export default class LablupProgressBar extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({type: Object}) progressBar;
  @property({type: Object}) frontDesc;
  @property({type: Object}) backDesc;
  @property({type: Number}) progress = 0;
  @property({type: String}) description = ''

  static get styles(): CSSResultOrNative | CSSResultArray {
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
          <div id="back" class="back"></div>
          <div id="front" class="front"></div>
      </div>
      <slot name="right-desc"></slot>
    </div>
    `;
  }

  firstUpdated() {
    this.progressBar = this.shadowRoot.querySelector('#front');
    this.frontDesc = this.shadowRoot.querySelector('#front');
    this.backDesc = this.shadowRoot.querySelector('#back');
    this.progressBar.style.clipPath = 'inset(0 0 0 0%)';
  }


  async changePct(pct) {
    await this.updateComplete;
    this.progressBar.style.clipPath = 'inset(0 0 0 ' + (pct * 100) + '%)';
  }

  async changeDesc(description) {
    await this.updateComplete;
    this.frontDesc.innerHTML = '&nbsp;' + description;
    this.backDesc.innerHTML = '&nbsp;' + description;
  }


  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  updated(changedProperties) {
  }

  attributeChangedCallback(name, oldval, newval) {
    if (name == 'progress' && newval !== null && !isNaN(newval)) {
      this.changePct(newval);
    }
    if (name == 'description' && newval !== null && !newval.startsWith('undefined')) {
      this.changeDesc(newval);
    }
    super.attributeChangedCallback(name, oldval, newval);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lablup-progressbar": LablupProgressBar;
  }
}
