/**
 @license
Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
*/
import { navigate } from '../backend-ai-app';
import {
  IronFlex,
  IronFlexAlignment,
} from '../plastics/layout/iron-flex-layout-classes';
import { store } from '../store';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import '@material/mwc-circular-progress';
import { css, CSSResultGroup, html } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
Backend.AI Serving List View

Example:

<backend-ai-serving-list class="page" name="serving" ?active="${0}">
... content ...
</backend-ai-serving-list>

@group Backend.AI Web UI
@element backend-ai-serving-list
*/

@customElement('backend-ai-serving-list')
export default class BackendAIServingList extends BackendAIPage {
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
          globalThis.history.pushState(
            {},
            '',
            path + '?folder=' + params.folder,
          );
          store.dispatch(navigate(decodeURIComponent(path), params));
        }}"
      ></backend-ai-react-serving-list>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-serving-list': BackendAIServingList;
  }
}
