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
 `<backend-ai-permission-denied-view>` is a blank panel of backend.ai web UI.

 Example:
 <backend-ai-permission-denied-view active></backend-ai-permission-denied-view>

 @group Lablup Elements
 @element backend-ai-permission-denied-view
 */

@customElement('backend-ai-permission-denied-view')
export default class BackendAIPermissionDeniedView extends BackendAIPage {
  @property({ type: Number }) error_code = 401;

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

        img#unauthorized-access {
          width: 400px;
          margin: 20px;
        }

        div.page-layout {
          display: flex;
          -ms-flex-direction: row;
          -webkit-flex-direction: row;
          flex-direction: row;
          align-items: center;
          margin: 20px;
        }

        div.desc {
          width: 100%;
        }

        @media screen and (max-width: 1015px) {
          div.page-layout {
            -ms-flex-direction: column;
            -webkit-flex-direction: column;
            flex-direction: column;
            align-content: center;
          }

          div.desc {
            align-items: center;
          }
        }

        @media screen and (max-width: 440px) {
          img#unauthorized-access {
            width: 330px;
            margin: 20px;
          }

          div.desc > p.description {
            max-width: 330px;
            font-size: 13px;
          }
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
    const page = url !== '' ? url : 'chat';
    globalThis.history.pushState({}, '', '/chat');
    store.dispatch(navigate(decodeURIComponent('/' + page), {}));
  }

  render() {
    // language=HTML
    return html`
      <div class="page-layout">
        <img
          id="unauthorized-access"
          src="/resources/images/401_unauthorized_access.svg"
        />
        <div class="vertical layout desc">
          <div class="title">${_tr('webui.UnauthorizedAccess')}</div>
          <p class="description">${_tr('webui.AdminOnlyPage')}</p>
          <div>
            <mwc-button
              unelevated
              fullwidth
              id="go-to-summary"
              label="${_t('button.GoBackToSummaryPage')}"
              @click="${() => this._moveTo('start')}"
            ></mwc-button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-permission-denied-view': BackendAIPermissionDeniedView;
  }
}
