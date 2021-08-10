/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */

import {translate as _t, translateUnsafeHTML as _tr} from 'lit-translate';
import {css, CSSResultArray, CSSResultOrNative, customElement, html, property} from 'lit-element';
import {BackendAIPage} from './backend-ai-page';

import 'weightless/card';
import '@material/mwc-button';
import {BackendAiStyles} from './backend-ai-general-styles';
import {IronFlex, IronFlexAlignment, IronPositioning} from '../plastics/layout/iron-flex-layout-classes';
import {store} from '../store';
import {navigate} from '../backend-ai-app';

/**
 `<backend-ai-error-view>` is a blank panel of backend.ai Web UI.

 Example:
 <backend-ai-error-view active></backend-ai-error-view>

 @group Lablup Elements
 @element backend-ai-error-view
 */

@customElement('backend-ai-error-view')
export default class BackendAIErrorView extends BackendAIPage {
  @property({type: Number}) error_code = 404;

  constructor() {
    super();
  }

  static get styles(): CSSResultOrNative | CSSResultArray {
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

  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
  }

  /**
   *
   * @param {string} url - page to redirect from the current page.
   */
  _moveTo(url = '') {
    const page = url !== '' ? url : 'summary';
    globalThis.history.pushState({}, '', '/summary');
    store.dispatch(navigate(decodeURIComponent('/' + page), {}));
  }

  render() {
    // language=HTML
    return html`
    <div class="horizontal center flex layout" style="margin:20px;">
      <img src="/resources/images/404_not_found.svg" style="width:500px;margin:20px;"/>
      <div class="vertical layout" style="width:100%;">
        <div class="title">${_tr('webui.NOTFOUND')}</div>
        <p class="description">${_t('webui.DescNOTFOUND')}</p>
        <div>
          <mwc-button
              unelevated
              fullwidth
              id="go-to-summary"
              label="${_t('button.GoBackToSummaryPage')}"
              @click="${() => this._moveTo('summary')}"></mwc-button>
        </div>
      </div>
    </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-error-view': BackendAIErrorView;
  }
}
