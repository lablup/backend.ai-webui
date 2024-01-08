/**
 @license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
*/
import {
  IronFlex,
  IronFlexAlignment,
} from '../plastics/layout/iron-flex-layout-classes';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import './backend-ai-window';
import './lablup-activity-panel';
import '@material/mwc-icon/mwc-icon';
import { css, CSSResultGroup, html } from 'lit';
import { translate as _t } from 'lit-translate';
import { customElement } from 'lit/decorators.js';

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
      <backend-ai-window
        ?active="${this.active}"
        title="${_t('webui.menu.Information')}"
        defaultWidth="800px"
        name="information"
        icon="resources/menu_icons/info.svg"
      >
        <link rel="stylesheet" href="resources/custom.css" />
        <backend-ai-react-information></backend-ai-react-information>
      </backend-ai-window>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-information-view': BackendAIInformationView;
  }
}
