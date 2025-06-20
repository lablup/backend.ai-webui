/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import { navigate } from '../backend-ai-app';
import {
  IronFlex,
  IronFlexAlignment,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import { store } from '../store';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import '@material/mwc-button';
import { css, CSSResultGroup, html } from 'lit';
import { translate as _t, translateUnsafeHTML as _tr } from 'lit-translate';
import { customElement, property } from 'lit/decorators.js';

/**
 `<backend-ai-error-view>` is a blank panel of backend.ai Web UI.

 Example:
 <backend-ai-error-view active></backend-ai-error-view>

 @group Lablup Elements
 @element backend-ai-error-view
 */

@customElement('backend-ai-error-view')
export default class BackendAIErrorView extends BackendAIPage {
  @property({ type: Number }) error_code = 404;

  static get styles(): CSSResultGroup {
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
      `,
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
    const isPALIEnabled = globalThis.backendaioptions(
      'user.experimental_PALI',
      false,
    );
    const page = url !== '' ? url : isPALIEnabled ? 'model-store' : 'start';
    globalThis.history.pushState(
      {},
      '',
      isPALIEnabled ? 'model-store' : 'start',
    );
    store.dispatch(navigate(decodeURIComponent('/' + page), {}));
    document.dispatchEvent(
      new CustomEvent('react-navigate', {
        detail: url,
      }),
    );
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css" />
      <div class="horizontal center flex layout" style="margin:20px;">
        <img
          src="/resources/images/404_not_found.svg"
          style="width:500px;margin:20px;"
        />
        <div class="vertical layout" style="width:100%;">
          <div class="title">${_tr('webui.NotFound')}</div>
          <p class="description">${_t('webui.DescNotFound')}</p>
          <div>
            <mwc-button
              unelevated
              fullwidth
              id="go-to-summary"
              label="${globalThis.backendaioptions(
                'user.experimental_PALI',
                false,
              )
                ? _t('button.GoBackToSummaryPage')
                : _t('button.GoBackToModelServicesPage')}"
              @click="${() =>
                this._moveTo(
                  globalThis.backendaioptions('user.experimental_PALI', false)
                    ? 'start'
                    : 'chat',
                )}"
            ></mwc-button>
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
