/**
 @license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
 */

import {css, CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

import 'weightless/expansion';

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
  static get styles(): CSSResultGroup | undefined {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        wl-expansion {
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css">
      <wl-expansion ?name="${this.name}">
        <slot name="title"></slot>
        <slot></slot>
      </wl-expansion>
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lablup-expansion': LablupExpansion;
  }
}
