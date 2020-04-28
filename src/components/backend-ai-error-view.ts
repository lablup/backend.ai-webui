/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import 'weightless/card';
import {BackendAiStyles} from "./backend-ai-general-styles";
import {IronFlex, IronFlexAlignment, IronPositioning} from "../plastics/layout/iron-flex-layout-classes";

/**
 `<backend-ai-error-view>` is a blank panel of backend.ai console.

 Example:
 <backend-ai-error-view active></backend-ai-error-view>

 @group Lablup Elements
 @element backend-ai-error-view
 */

@customElement("backend-ai-error-view")
export default class BackendAIErrorView extends BackendAIPage {
  @property({type: Number}) error_code = 404;

  constructor() {
    super();
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronPositioning,
      // language=CSS
      css`
        wl-card {
          height: calc(100vh - 150px);
        }
      `
    ];
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
      <wl-card class="item" elevation="1">
        <div class="vertical center-center flex layout">
          <p>${_t('console.NOTFOUND')}</p>
        </div>
      </wl-card>
`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-error-view": BackendAIErrorView;
  }
}
