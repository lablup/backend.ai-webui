/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */

import {css, CSSResultGroup, html} from 'lit';
import {BackendAIPage} from './backend-ai-page';
import {customElement} from 'lit/decorators.js';

import {BackendAiStyles} from './backend-ai-general-styles';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';
import '../components-react/dist/hello.js';

/**
 Backend.AI React Test View

 @group Backend.AI Web UI
 @element backend-ai-react-test-view
 */
@customElement('backend-ai-react-test-view')
export default class BackendAiReactTestView extends BackendAIPage {
  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
    `];
  }

  firstUpdated() {
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
      <backend-ai-react-test-internal-view></backend-ai-react-test-internal-view>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-react-test-view': BackendAiReactTestView;
  }
}
