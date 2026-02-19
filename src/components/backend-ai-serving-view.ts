/**
 @license
Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
*/
import {
  IronFlex,
  IronFlexAlignment,
} from '../plastics/layout/iron-flex-layout-classes';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import '@material/mwc-circular-progress';
import { css, CSSResultGroup, html } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
Backend.AI Serving List View

Example:

<backend-ai-serving-view class="page" name="serving" ?active="${0}">
... content ...
</backend-ai-serving-view>

@group Backend.AI Web UI
@element backend-ai-serving-view
*/

@customElement('backend-ai-serving-view')
export default class BackendAIServingView extends BackendAIPage {
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
      <backend-ai-react-serving-list
        @moveTo="${(e: CustomEvent) => {
          const path = e.detail.path;
          const params = e.detail.params;
          const fullPath = path + '?folder=' + params.folder;
          globalThis.history.pushState({}, '', fullPath);
          document.dispatchEvent(
            new CustomEvent('react-navigate', {
              detail: fullPath,
            }),
          );
        }}"
      ></backend-ai-react-serving-list>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-serving-view': BackendAIServingView;
  }
}
