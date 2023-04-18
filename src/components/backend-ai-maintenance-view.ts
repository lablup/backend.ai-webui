/**
 @license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
 */

import {css, CSSResultGroup, html} from 'lit';
import {customElement} from 'lit/decorators.js';

import {BackendAIPage} from './backend-ai-page';

import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
} from '../plastics/layout/iron-flex-layout-classes';

/**
 Backend.AI Maintenance View

 Example:

 <backend-ai-maintenance-view class="page" name="maintenance" ?active="${0}">
 ... content ...
 </backend-ai-maintenance-view>

@group Backend.AI Web UI
 @element backend-ai-maintenance-view
 */

@customElement('backend-ai-maintenance-view')
export default class BackendAIMaintenanceView extends BackendAIPage {
  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
      `];
  }

  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
  }

  render() {
    // language=HTML
    return html`
      <backend-ai-react-maintenance></backend-ai-react-maintenance>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-maintenance-view': BackendAIMaintenanceView;
  }
}
