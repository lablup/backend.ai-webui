/**
 @license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
 */
import {
  IronFlex,
  IronFlexAlignment,
} from '../plastics/layout/iron-flex-layout-classes';
import './backend-ai-dialog';
import './backend-ai-environment-list';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import './backend-ai-registry-list';
import './backend-ai-resource-preset-list';
import './lablup-activity-panel';
import '@material/mwc-button';
import { Tab } from '@material/mwc-tab';
import '@material/mwc-tab-bar/mwc-tab-bar';
import { css, CSSResultGroup, html } from 'lit';
import { translate as _t } from 'lit-translate';
import { customElement, property } from 'lit/decorators.js';

/**
 Backend.AI Environment View

 Example:

 <backend-ai-environment-view class="page" name="environment" ?active="${0}">
 ... content ...
 </backend-ai-environment-view>

@group Backend.AI Web UI
 @element backend-ai-environment-view
 */

@customElement('backend-ai-environment-view')
export default class BackendAIEnvironmentView extends BackendAIPage {
  @property({ type: String }) images = Object();
  @property({ type: Boolean }) is_superadmin = false;
  @property({ type: String }) _activeTab = 'image-lists';

  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        h3.tab {
          background-color: var(--general-tabbar-background-color);
          border-radius: 5px 5px 0px 0px;
          margin: 0px auto;
        }

        mwc-tab-bar {
          --mdc-theme-primary: var(--general-sidebar-selected-color);
          --mdc-text-transform: none;
          --mdc-tab-color-default: var(--general-tabbar-background-color);
          --mdc-tab-text-label-color-default: var(
            --general-tabbar-tab-disabled-color
          );
        }

        div h4 {
          margin: 0;
          font-weight: 100;
          font-size: 16px;
          padding-left: 20px;
          border-bottom: 1px solid #ccc;
          width: 100%;
        }

        @media screen and (max-width: 805px) {
          mwc-tab,
          mwc-button {
            --mdc-typography-button-font-size: 10px;
          }
        }
      `,
    ];
  }

  static get properties() {
    return {
      active: {
        type: Boolean,
      },
      _activeTab: {
        type: String,
      },
    };
  }

  /**
   * Set backend.ai client to super admin.
   *
   * @param {Boolean} active
   */
  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (active === false) {
      return true;
    }
    // If disconnected
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          this.is_superadmin = globalThis.backendaiclient.is_superadmin;
        },
        true,
      );
    } else {
      // already connected
      this.is_superadmin = globalThis.backendaiclient.is_superadmin;
    }
    return false;
  }

  /**
   * Display the tab.
   *
   * @param {mwc-tab} tab - tab webcomponent that has 'title' property
   */
  _showTab(tab: Tab) {
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

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css" />
      <lablup-activity-panel noheader narrow autowidth>
        <div slot="message">
          <h3 class="tab horizontal center layout">
            <mwc-tab-bar>
              <mwc-tab
                title="image-lists"
                label="${_t('environment.Images')}"
                @click="${(e) => this._showTab(e.target)}"
              ></mwc-tab>
              <mwc-tab
                title="resource-template-lists"
                label="${_t('environment.ResourcePresets')}"
                @click="${(e) => this._showTab(e.target)}"
              ></mwc-tab>
              ${this.is_superadmin
                ? html`
                    <mwc-tab
                      title="registry-lists"
                      label="${_t('environment.Registries')}"
                      @click="${(e) => this._showTab(e.target)}"
                    ></mwc-tab>
                  `
                : html``}
            </mwc-tab-bar>
            <div class="flex"></div>
          </h3>
          <div id="image-lists" class="tab-content">
            <backend-ai-environment-list
              ?active="${this._activeTab === 'image-lists'}"
            ></backend-ai-environment-list>
          </div>
          <backend-ai-resource-preset-list
            id="resource-template-lists"
            class="admin item tab-content"
            style="display: none"
            ?active="${this._activeTab === 'resource-template-lists'}"
          ></backend-ai-resource-preset-list>
          <div id="registry-lists" class="tab-content">
            <backend-ai-registry-list
              ?active="${this._activeTab === 'registry-lists'}"
            >
            </backend-ai-registry-list>
          </div>
        </div>
      </lablup-activity-panel>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-environment-view': BackendAIEnvironmentView;
  }
}
