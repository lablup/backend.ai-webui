/**
 @license
Copyright (c) 2015-2024 Lablup Inc. All rights reserved.
*/
import { navigate } from '../backend-ai-app';
import {
  IronFlex,
  IronFlexAlignment,
} from '../plastics/layout/iron-flex-layout-classes';
import { store } from '../store';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import './backend-ai-session-launcher';
import './backend-ai-session-view';
import '@material/mwc-circular-progress';
import { css, CSSResultGroup, html } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
Backend.AI Maintenance View

Example:

<backend-ai-session-view2 class="page" name="maintenance" ?active="${0}">
... content ...
</backend-ai-session-view2>

@group Backend.AI Web UI
@element backend-ai-session-view-next
*/

@customElement('backend-ai-session-view-next')
export default class BackendAISessionView2 extends BackendAIPage {
  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css``,
    ];
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
      <backend-ai-react-session-list
        @moveTo="${(e: CustomEvent) => {
          const path = e.detail.path;
          globalThis.history.pushState({}, '', path);
          store.dispatch(navigate(decodeURIComponent(path), {}));
        }}"
      ></backend-ai-react-session-list>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-session-view-next': BackendAISessionView2;
  }
}
