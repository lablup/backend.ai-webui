/**
 @license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
 */
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import { store } from '../store';
import { BackendAiStyles } from './backend-ai-general-styles';
import './backend-ai-list-status';
import { BackendAIPage } from './backend-ai-page';
import './backend-ai-usersettings-general-list';
import './lablup-activity-panel';
import './lablup-codemirror';
import './lablup-loading-spinner';
import '@material/mwc-button';
import { Tab } from '@material/mwc-tab';
import '@material/mwc-tab-bar';
import { css, CSSResultGroup, html } from 'lit';
import { translate as _t } from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type LablupLoadingSpinner = HTMLElementTagNameMap['lablup-loading-spinner'];

/**
 Backend AI Usersettings View

 Example:

 <backend-ai-usersettings-view active>
  ...
 </backend-ai-usersettings-view>

@group Backend.AI Web UI
 @element backend-ai-usersettings-view
 */

@customElement('backend-ai-usersettings-view')
export default class BackendAiUserSettingsView extends BackendAIPage {
  @property({ type: Object }) images = Object();
  @property({ type: Object }) options = Object();
  @property({ type: Object }) _activeTab = Object();
  @property({ type: Object }) logGrid = Object();
  @query('#loading-spinner') spinner!: LablupLoadingSpinner;

  constructor() {
    super();
    this.options = {
      automatic_image_update: false,
      cuda_gpu: false,
      cuda_fgpu: false,
      rocm_gpu: false,
      tpu: false,
      scheduler: 'fifo',
    };
  }

  static get is() {
    return 'backend-ai-usersettings-view';
  }

  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        div.spinner,
        span.spinner {
          font-size: 9px;
          margin-right: 5px;
        }

        mwc-button.log {
          margin: 0px 10px;
        }

        .outer-space {
          margin: 20px;
        }

        @media screen and (max-width: 750px) {
          mwc-button {
            width: auto;
          }
          mwc-button > span {
            display: none;
          }
        }
      `,
    ];
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css" />
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <lablup-activity-panel noheader narrow autowidth>
        <div slot="message">
          <h3 class="tab horizontal wrap layout">
            <mwc-tab-bar>
              <mwc-tab
                title="general"
                label="${_t('usersettings.General')}"
                @click="${(e) => this._showTab(e.target)}"
              ></mwc-tab>
              <mwc-tab
                title="logs"
                label="${_t('usersettings.Logs')}"
                @click="${(e) => this._showTab(e.target)}"
              ></mwc-tab>
            </mwc-tab-bar>
          </h3>
          <div id="general" class="item tab-content outer-space">
            <backend-ai-usersettings-general-list
              active="true"
            ></backend-ai-usersettings-general-list>
          </div>
          <div id="logs" class="item tab-content" style="display:none;">
            <backend-ai-react-error-log-list></backend-ai-react-error-log-list>
          </div>
        </div>
      </lablup-activity-panel>
    `;
  }

  firstUpdated() {
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          this.updateSettings();
        },
        true,
      );
    } else {
      // already connected
      this.updateSettings();
    }
    this.notification = globalThis.lablupNotification;
    // this._activeTab = "general";
    document.addEventListener('backend-ai-usersettings-logs', () => {
      this._viewStateChanged();
    });
    document.addEventListener('backend-ai-usersettings', () => {
      this._viewStateChanged();
    });
  }

  /**
   * Change view state when the user clicks the tab.
   *
   * @param {Boolean} active
   * */
  async _viewStateChanged() {
    const params = store.getState().app.params;
    const tab = params.tab;
    if (tab && tab === 'logs') {
      globalThis.setTimeout(() => {
        const tabEl = this.shadowRoot?.querySelector(
          'mwc-tab[title="logs"]',
        ) as Tab;
        tabEl.click();
      }, 0);
    } else {
      globalThis.setTimeout(() => {
        const tabEl = this.shadowRoot?.querySelector(
          'mwc-tab[title="general"]',
        ) as Tab;
        tabEl.click();
      }, 0);
    }
  }

  updateSettings() {
    return;
  }

  /**
   * Show only one tab clicked by user.
   *
   * @param {EventTarget} tab - clicked tab
   * */
  _showTab(tab) {
    const els = this.shadowRoot?.querySelectorAll(
      '.tab-content',
    ) as NodeListOf<HTMLDivElement>;
    for (let x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    this._activeTab = tab.title;
    (
      this.shadowRoot?.querySelector('#' + tab.title) as HTMLElement
    ).style.display = 'block';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-usersettings-view': BackendAiUserSettingsView;
  }
}
