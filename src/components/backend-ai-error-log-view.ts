/**
 @license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
 */
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import './backend-ai-error-log-list';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import { CSSResultGroup, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 Backend.AI Error Log View

 @group Backend.AI Web UI
 @element backend-ai-error-log-view

 Deprecated for now. Kept for future use (especially for window mode)
 */

@customElement('backend-ai-error-log-view')
export default class BackendAIErrorLogView extends BackendAIPage {
  @property({ type: Object }) _lists = Object();

  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
    ];
  }

  firstUpdated() {
    this._lists = this.shadowRoot?.querySelectorAll('backend-ai-session-list');
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css" />
      <backend-ai-error-log-list active="true"></backend-ai-error-log-list>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-error-log-view': BackendAIErrorLogView;
  }
}
