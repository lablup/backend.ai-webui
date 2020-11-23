/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {translate as _t, translateUnsafeHTML as _tr} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import 'weightless/card';
import '@material/mwc-button';
import {BackendAiStyles} from "./backend-ai-general-styles";
import {IronFlex, IronFlexAlignment, IronPositioning} from "../plastics/layout/iron-flex-layout-classes";
import {store} from '../store';
import {navigate} from '../backend-ai-app';

/**
 `<backend-ai-permission-denied-view>` is a blank panel of backend.ai console.

 Example:
 <backend-ai-permission-denied-view active></backend-ai-permission-denied-view>

 @group Lablup Elements
 @element backend-ai-permission-denied-view
 */

@customElement("backend-ai-permission-denied-view")
export default class BackendAIPermissionDeniedView extends BackendAIPage {
  @property({type: Number}) error_code = 401;

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
      .title {
        font-size: 2em;
        font-weight: bolder;
        color: var(--general-navbar-footer-color, #424242);
        line-height: 1em;
      }
      
      .description {
        font-size: 1em;
        font-weight: normal;
        color: var(--general-sidebar-color, #949494);
      }

      mwc-button {
        width: auto;
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

  /**
   * 
   * @param url - page to redirect from the current page.
   */
  _moveTo(url = '') {
    let page = url !== '' ? url : 'summary';
    globalThis.history.pushState({}, '', '/summary');
    store.dispatch(navigate(decodeURIComponent('/' + page), {}));
  }

  render() {
    // language=HTML
    return html`
    <div class="horizontal center flex layout center-justified" style="margin:20px;">
      <img src="/resources/images/401_unauthorized_access.svg" style="width:400px;margin:20px;"/>
      <div class="vertical layout" style="width:100%;">
        <div class="title">${_tr('console.UNAUTHORIZEDACCESS')}</div>
        <p class="description">${_tr('console.AdminOnlyPage')}</p>
        <div style="width:auto;">
          <mwc-button
              unelevated
              id="go-to-summary"
              label="${_t("button.GoBackToSummaryPage")}"
              @click="${() => this._moveTo('summary')}"></mwc-button>
        </div>
      </div>
    </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-permission-denied-view": BackendAIPermissionDeniedView;
  }
}
