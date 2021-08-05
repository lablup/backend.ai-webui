/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */

import {CSSResultArray, CSSResultOrNative, customElement, html, LitElement, property} from 'lit-element';

import './lablup-loading-dots';

import { BackendAiStyles } from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

/**
 Backend AI List Loading dots

 `backend-ai-list-loading-dots` is loading dots of list component.

 Example:

 <backend-ai-list-loading-dots></backend-ai-list-loading-dots>

@group Backend.AI Web UI
 @element backend-ai-list-loading-dots
 */

@customElement('backend-ai-list-loading-dots')
export default class BackendAIListLoadingdots extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({type: Object}) list_dots;
  @property({type: Boolean}) active = false;

  constructor() {
    super();
  }

  static get styles(): CSSResultOrNative | CSSResultArray {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      ];
  }

  render() {
    // language=HTML
    return html`
      <div class="vertical layout center flex blank-box-large">
        <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      </div>
    `;
  }

  shouldUpdate() {
    return this.active;
  }

  firstUpdated() {
    this.list_dots = this.shadowRoot.querySelector('#list-dots');
    this.active = true;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  /**
   * Set up active state and dots style to show the loading dots.
   * */
  async show() {
    this.active = true;
    await this.updateComplete;
    this.list_dots.style.display = 'block';
  }

  /**
   * Set up active state and dots style to hide the loading dots.
   * */
  async hide() {
    this.active = true;
    await this.updateComplete;
    this.list_dots.style.display = 'none';
    this.active = false;
  }

  /**
   * Change whether dots is visible or not.
   * */
  async toggle() {
    await this.updateComplete;
    if (this.list_dots.active === true) {
      this.active = true;
      this.list_dots.style.display = 'none';
      this.active = false;
    } else {
      this.active = true;
      this.list_dots.style.display = 'block';
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-list-loading-dots': BackendAIListLoadingdots;
  }
}
