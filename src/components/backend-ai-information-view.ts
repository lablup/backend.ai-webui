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
Backend.AI Information View

Example:

<backend-ai-information-view class="page" name="information" ?active="${0}">
... content ...
</backend-ai-information-view>

@group Backend.AI Web UI
@element backend-ai-information-view
*/

@customElement('backend-ai-information-view')
export default class BackendAIInformationView extends BackendAIPage {
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
      <backend-ai-react-information></backend-ai-react-information>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-information-view': BackendAIInformationView;
  }
}
