/**
 @license
 Copyright (c) 2015-2024 Lablup Inc. All rights reserved.
 */
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import './backend-ai-resource-monitor';
import './backend-ai-session-launcher';
import './backend-ai-session-list';
import './lablup-activity-panel';
import '@material/mwc-button';
import '@material/mwc-checkbox';
import '@material/mwc-formfield';
import '@material/mwc-icon-button';
import '@material/mwc-list';
import { Menu } from '@material/mwc-menu';
import '@material/mwc-tab';
import '@material/mwc-tab-bar';
import '@material/mwc-textfield';
import { TextField } from '@material/mwc-textfield';
import { css, CSSResultGroup, html } from 'lit';
import { translate as _t } from 'lit-translate';
import { customElement, property, query, queryAll } from 'lit/decorators.js';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type BackendAISessionList = HTMLElementTagNameMap['backend-ai-session-list'];
type BackendAIResourceMonitor =
  HTMLElementTagNameMap['backend-ai-resource-monitor'];

/**
 Backend AI Session View

 Example:

 <backend-ai-session-view active>
 ...
 </backend-ai-settings-view>

 @group Backend.AI Web UI
 @element backend-ai-storage-list
 */

@customElement('backend-ai-session-view')
export default class BackendAISessionView extends BackendAIPage {
  @property({ type: String }) _status = 'inactive';
  @property({ type: Boolean, reflect: true }) active = false;
  @property({ type: Boolean }) is_admin = false;
  @property({ type: Boolean }) enableInferenceWorkload = false;
  @property({ type: Boolean }) enableSFTPSession = false;
  @property({ type: String }) filterAccessKey = '';
  @property({ type: String }) _connectionMode = 'API';
  @property({ type: Object }) _defaultFileName = '';
  @property({ type: Object }) resourceBroker;
  @queryAll('backend-ai-session-list')
  sessionList!: NodeListOf<BackendAISessionList>;
  @query('#running-jobs') runningJobs!: BackendAISessionList;
  @query('#resource-monitor') resourceMonitor!: BackendAIResourceMonitor;
  @query('#export-file-name') exportFileNameInput!: TextField;
  @query('#date-from') dateFromInput!: TextField;
  @query('#date-to') dateToInput!: TextField;
  @query('#dropdown-menu') dropdownMenu!: Menu;

  constructor() {
    super();
    this.active = false;
    this._status = 'inactive';
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
        mwc-menu {
          --mdc-menu-item-height: auto;
        }

        mwc-menu#dropdown-menu {
          position: relative;
          left: -170px;
          top: 50px;
        }

        mwc-list-item {
          font-size: 14px;
        }

        mwc-icon-button {
          --mdc-icon-size: 20px;
          color: var(--paper-grey-700);
        }

        mwc-icon-button#dropdown-menu-button {
          margin-left: 10px;
        }

        mwc-textfield {
          width: 100%;
          --mdc-text-field-fill-color: transparent;
          --mdc-theme-primary: var(--paper-green-600);
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        backend-ai-resource-monitor {
          margin: 10px 50px;
        }

        backend-ai-session-launcher#session-launcher {
          --component-width: 100px;
          --component-shadow-color: transparent;
        }
        @media screen and (max-width: 805px) {
          mwc-tab {
            --mdc-typography-button-font-size: 10px;
          }
        }
      `,
    ];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    document.addEventListener('backend-ai-session-list-refreshed', () => {
      this.runningJobs.refreshList(true, false);
    });
    this.resourceBroker = globalThis.resourceBroker;
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          this.is_admin = globalThis.backendaiclient.is_admin;
          this._connectionMode =
            globalThis.backendaiclient._config._connectionMode;
        },
        true,
      );
    } else {
      this.is_admin = globalThis.backendaiclient.is_admin;
      this._connectionMode = globalThis.backendaiclient._config._connectionMode;
    }
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      this.resourceMonitor.removeAttribute('active');
      this._status = 'inactive';
      for (let x = 0; x < this.sessionList.length; x++) {
        this.sessionList[x].removeAttribute('active');
      }
      return;
    }

    const _init = () => {
      this.enableInferenceWorkload =
        globalThis.backendaiclient.supports('inference-workload');
      this.enableSFTPSession =
        globalThis.backendaiclient.supports('sftp-scaling-group');
      this.resourceMonitor.setAttribute('active', 'true');
      this.runningJobs.setAttribute('active', 'true');
      this._status = 'active';
    };
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          _init();
        },
        true,
      );
    } else {
      _init();
    }
  }

  _triggerClearTimeout() {
    const event = new CustomEvent('backend-ai-clear-timeout');
    document.dispatchEvent(event);
  }

  _showTab(tab) {
    const els = this.shadowRoot?.querySelectorAll(
      '.tab-content',
    ) as NodeListOf<HTMLDivElement>;
    for (let x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    (
      this.shadowRoot?.querySelector('#' + tab.title + '-lists') as HTMLElement
    ).style.display = 'block';
    for (let x = 0; x < this.sessionList.length; x++) {
      this.sessionList[x].removeAttribute('active');
    }
    this._triggerClearTimeout();
    (
      this.shadowRoot?.querySelector('#' + tab.title + '-jobs') as HTMLElement
    ).setAttribute('active', 'true');
  }

  _getFirstDateOfMonth() {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 2)
      .toISOString()
      .substring(0, 10);
  }

  /**
   * Check date-to < date-from.
   * */
  _validateDateRange() {
    const dateTo = this.dateToInput;
    const dateFrom = this.dateFromInput;

    if (dateTo.value && dateFrom.value) {
      const to = new Date(dateTo.value).getTime();
      const from = new Date(dateFrom.value).getTime();
      if (to < from) {
        dateTo.value = dateFrom.value;
      }
    }
  }

  /**
   * Scale the time in units of D, H, M, S, and MS.
   *
   * @param {number} value - time to want to scale
   * @return {Record<string, unknown>} result - data containing the scaled time
   * */
  static _automaticScaledTime(value: number) {
    // number: msec.
    let result = Object();
    const unitText = ['D', 'H', 'M', 'S'];
    const unitLength = [1000 * 60 * 60 * 24, 1000 * 60 * 60, 1000 * 60, 1000];

    for (let i = 0; i < unitLength.length; i++) {
      if (Math.floor(value / unitLength[i]) > 0) {
        result[unitText[i]] = Math.floor(value / unitLength[i]);
        value = value % unitLength[i];
      }
    }
    if (Object.keys(result).length === 0) {
      // only prints msec. when time is shorter than 1sec.
      if (value > 0) {
        result = { MS: value };
      } else {
        // No data.
        result = { NODATA: 1 };
      }
    }
    return result;
  }

  /**
   * Convert the value bytes to MiB with decimal point to 1 as a default
   *
   * @param {number} value
   * @return {string} converted value from Bytes to MiB
   */
  static bytesToMiB(value) {
    return Number(value / 2 ** 20).toFixed(1);
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css" />
      <div class="vertical layout" style="gap:24px;">
        <lablup-activity-panel
          title="${_t('summary.ResourceStatistics')}"
          elevation="1"
          autowidth
        >
          <div slot="message">
            <backend-ai-resource-monitor
              location="session"
              id="resource-monitor"
              ?active="${this.active === true}"
            ></backend-ai-resource-monitor>
          </div>
        </lablup-activity-panel>
        <lablup-activity-panel
          title="${_t('summary.Announcement')}"
          elevation="1"
          horizontalsize="2x"
          style="display:none;"
        ></lablup-activity-panel>
        <lablup-activity-panel elevation="1" autowidth narrow noheader>
          <div slot="message">
            <h3
              class="tab horizontal center layout"
              style="margin-top:0;margin-bottom:0;"
            >
              <div class="scroll hide-scrollbar">
                <div
                  class="horizontal layout flex start-justified"
                  style="width:70%;"
                >
                  <mwc-tab-bar>
                    <mwc-tab
                      title="running"
                      label="${_t('session.Running')}"
                      @click="${(e) => this._showTab(e.target)}"
                    ></mwc-tab>
                    <mwc-tab
                      title="interactive"
                      label="${_t('session.Interactive')}"
                      @click="${(e) => this._showTab(e.target)}"
                    ></mwc-tab>
                    <mwc-tab
                      title="batch"
                      label="${_t('session.Batch')}"
                      @click="${(e) => this._showTab(e.target)}"
                    ></mwc-tab>
                    ${this.enableInferenceWorkload
                      ? html`
                          <mwc-tab
                            title="inference"
                            label="${_t('session.Inference')}"
                            @click="${(e) => this._showTab(e.target)}"
                          ></mwc-tab>
                        `
                      : html``}
                    ${this.enableSFTPSession
                      ? html`
                          <mwc-tab
                            title="system"
                            label="${_t('session.System')}"
                            @click="${(e) => this._showTab(e.target)}"
                          ></mwc-tab>
                        `
                      : html``}
                    <mwc-tab
                      title="finished"
                      label="${_t('session.Finished')}"
                      @click="${(e) => this._showTab(e.target)}"
                    ></mwc-tab>
                  </mwc-tab-bar>
                </div>
              </div>
              <div
                class="horizontal layout flex end-justified"
                style="margin-right:20px;"
              >
                <backend-ai-session-launcher
                  location="session"
                  id="session-launcher"
                  ?active="${this.active === true}"
                  ?allowNEOSessionLauncher="${true}"
                ></backend-ai-session-launcher>
              </div>
            </h3>
            <div id="running-lists" class="tab-content">
              <backend-ai-session-list
                id="running-jobs"
                condition="running"
              ></backend-ai-session-list>
            </div>
            <div
              id="interactive-lists"
              class="tab-content"
              style="display:none;"
            >
              <backend-ai-session-list
                id="interactive-jobs"
                condition="interactive"
              ></backend-ai-session-list>
            </div>
            <div id="batch-lists" class="tab-content" style="display:none;">
              <backend-ai-session-list
                id="batch-jobs"
                condition="batch"
              ></backend-ai-session-list>
            </div>
            ${this.enableInferenceWorkload
              ? html`
                  <div
                    id="inference-lists"
                    class="tab-content"
                    style="display:none;"
                  >
                    <backend-ai-session-list
                      id="inference-jobs"
                      condition="inference"
                    ></backend-ai-session-list>
                  </div>
                `
              : html``}
            ${this.enableSFTPSession
              ? html`
                  <div
                    id="system-lists"
                    class="tab-content"
                    style="display:none;"
                  >
                    <backend-ai-session-list
                      id="system-jobs"
                      condition="system"
                    ></backend-ai-session-list>
                  </div>
                `
              : html``}
            <div id="finished-lists" class="tab-content" style="display:none;">
              <backend-ai-session-list
                id="finished-jobs"
                condition="finished"
              ></backend-ai-session-list>
            </div>
            <div id="others-lists" class="tab-content" style="display:none;">
              <backend-ai-session-list
                id="others-jobs"
                condition="others"
              ></backend-ai-session-list>
            </div>
          </div>
        </lablup-activity-panel>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-session-view': BackendAISessionView;
  }
}
