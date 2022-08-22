/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */

import {css, CSSResultGroup, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {BackendAIPage} from './backend-ai-page';

import {BackendAiStyles} from './backend-ai-general-styles';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

import './lablup-loading-dots';

/**
 Backend AI List Status

 `backend-ai-list-status` shows the status such as empty data or loading situation of list component.

 Example:

 <backend-ai-list-status></backend-ai-list-status>

 @group Backend.AI Web UI
 @element backend-ai-list-status
 */

@customElement('backend-ai-list-status')
export default class BackendAIListStatus extends BackendAIPage {
  public shadowRoot: any; // ShadowRoot
  @property({type: Object}) list_status = Object();
  @property({type: String}) message = 'There is nothing to display';
  @property({type: String}) status_condition = 'loading';
  @property({type: Object}) dots = Object();
  @property({type: Boolean}) active = true;

  constructor() {
    super();
  }

  static get styles(): CSSResultGroup | undefined {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        #status {
          position: absolute;
          top: 55%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <div class="vertical layout center flex" id="status">
        ${this.status_condition == 'loading' ? html`
          <lablup-loading-dots id="loading-dots"></lablup-loading-dots>
        ` : html`
          ${this.status_condition == 'no-data' ? html`
            <span class="list-message">${this.message}</span>
          ` : html``}
        `}
      </div>
    `;
  }

  shouldUpdate() {
    return this.active;
  }

  firstUpdated() {
    this.list_status = this.shadowRoot.querySelector('#status');
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
    this.list_status.style.display = 'flex';
  }

  /**
   * Set up active state and dots style to hide the loading dots.
   * */
  async hide() {
    this.active = true;
    await this.updateComplete;
    this.list_status.style.display = 'none';
    this.active = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-list-status': BackendAIListStatus;
  }
}
