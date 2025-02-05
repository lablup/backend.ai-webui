/**
 @license
Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
*/
import { navigate } from '../backend-ai-app';
import {
  IronFlex,
  IronFlexAlignment,
} from '../plastics/layout/iron-flex-layout-classes';
import { store } from '../store';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import { css, CSSResultGroup, html } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
Backend.AI Storage Host Settings View

Example:

<backend-ai-storage-host-settings-view class="page" name="storage-host-settings" ?active="${0}">
... content ...
</backend-ai-storage-host-settings-view>

@group Backend.AI Web UI
@element backend-ai-storage-host-settings-view
*/

@customElement('backend-ai-storage-host-settings-view')
export default class BackendAIStorageHostSettingsView extends BackendAIPage {
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
      <backend-ai-react-storage-host-settings
        value="${window.location.pathname.split('/')[2]}"
        @moveTo="${(e: CustomEvent) => {
          const path = e.detail.path;
          globalThis.history.pushState({}, '', path);
          store.dispatch(navigate(decodeURIComponent(path), {}));
        }}"
      ></backend-ai-react-storage-host-settings>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-storage-host-settings-view': BackendAIStorageHostSettingsView;
  }
}
