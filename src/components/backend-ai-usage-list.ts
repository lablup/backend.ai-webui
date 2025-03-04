/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import './backend-ai-chart';
import './backend-ai-dialog';
import { BackendAiStyles } from './backend-ai-general-styles';
import './backend-ai-monthly-usage-panel';
import { BackendAIPage } from './backend-ai-page';
import '@vaadin/select';
import type { Select } from '@vaadin/select';
import { css, CSSResultGroup, html } from 'lit';
import { get as _text, translate as _t } from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type BackendAIDialog = HTMLElementTagNameMap['backend-ai-dialog'];

/**
 Backend AI Usage List

 `backend-ai-usage-list` is usage list of resources.

 Example:

 <backend-ai-usage-list>
 ...
 </backend-ai-usage-list>

@group Backend.AI Web UI
 @element backend-ai-usage-list
 */

@customElement('backend-ai-usage-list')
export default class BackendAIUsageList extends BackendAIPage {
  @property({ type: Object }) _map = {
    num_sessions: 'Sessions',
    cpu_allocated: 'CPU',
    mem_allocated: 'Memory',
    gpu_allocated: 'GPU',
    io_read_bytes: 'IO-Read',
    io_write_bytes: 'IO-Write',
  };
  @property({ type: Object }) templates = {
    '1D': {
      interval: 15 / 15,
      length: 4 * 24,
    },
    '1W': {
      interval: 15 / 15,
      length: 4 * 24 * 7,
    },
  };
  @property({ type: Array }) periodSelectItems = new Array<object>();
  @property({ type: Object }) collection = Object();
  @property({ type: String }) period = '1D';
  @property({ type: Boolean }) updating = false;
  @property({ type: Number }) elapsedDays = 0;
  @property({ type: String }) _helpDescription = '';
  @property({ type: String }) _helpDescriptionTitle = '';
  @property({ type: String }) _helpDescriptionIcon = '';
  @query('#period-selector') periodSelec!: Select;
  @query('#help-description') helpDescriptionDialog!: BackendAIDialog;

  public data: any;

  constructor() {
    super();
    this.data = [];
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
        vaadin-select {
          font-size: 14px;
        }

        vaadin-select-item {
          font-size: 14px;
          --lumo-font-family: var(--token-fontFamily) !important;
        }

        #select-period {
          font-size: 12px;
          color: #8c8484;
          padding-left: 20px;
          padding-right: 8px;
        }

        #help-description {
          --component-width: 70vw;
          --component-padding: 20px 40px;
        }

        .card > div,
        .usage-title {
          color: var(--token-colorText);
          background-color: var(--token-colorBgContainer);
        }
      `,
    ];
  }

  attributeChangedCallback(name, oldval, newval) {
    if (name === 'active' && newval !== null) {
      if (!this.active) this._menuChanged(true);
      this.active = true;
    } else {
      this.active = false;
      this._menuChanged(false);
      // TODO define clear type for component
      this.shadowRoot
        ?.querySelectorAll('backend-ai-chart')
        .forEach((e: any) => {
          e.wipe();
        });
    }

    super.attributeChangedCallback(name, oldval, newval);
  }

  /**
   * Wipe all of backend-ai-chart if active is false. Else, initialize the backend-ai-chart.
   *
   * @param {Boolean} active - flag to decide whether to change menu or not
   * */
  async _menuChanged(active) {
    await this.updateComplete;
    if (active === false) {
      // TODO define clear type for component
      this.shadowRoot
        ?.querySelectorAll('backend-ai-chart')
        .forEach((e: any) => {
          e.wipe();
        });
      return;
    }
    this.init();
  }

  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (active === false) {
      return;
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
          this._getUserInfo();
          this.init();
        },
        true,
      );
    } else {
      // already connected
      this._getUserInfo();
      this.init();
    }
  }

  _getUserInfo() {
    const msec_to_sec = 1000;
    const seconds_to_day = 86400;
    globalThis.backendaiclient.keypair
      .info(globalThis.backendaiclient._config.accessKey, ['created_at'])
      .then((response) => {
        const created_at = response.keypair.created_at;
        const start_time = new Date(created_at);
        const current_time = new Date();
        const seconds = Math.floor(
          (current_time.getTime() - start_time.getTime()) / msec_to_sec,
        );
        const days = Math.floor(seconds / seconds_to_day);
        this.elapsedDays = days;
        const periodSelectItems = [
          {
            label: _text('statistics.1Day'),
            value: '1D',
          },
        ];
        if (this.elapsedDays > 7) {
          periodSelectItems.push({
            label: _text('statistics.1Week'),
            value: '1W',
          });
        }
        this.periodSelectItems = periodSelectItems;
        this.periodSelec.value = '1D';
      });
  }

  /**
   * Initialize backend-ai-chart
   * */
  init() {
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          if (this.updating) {
            return;
          }
          this.updating = true;
          this.readUserStat()
            .then((res) => {
              // TODO define clear type for component
              this.shadowRoot
                ?.querySelectorAll('backend-ai-chart')
                .forEach((chart: any) => {
                  chart.init();
                });
              this.updating = false;
            })
            .catch((e) => {
              this.updating = false;
            });
        },
        true,
      );
    } else {
      if (this.updating) {
        return;
      }
      this.updating = true;
      this.readUserStat()
        .then((res) => {
          // TODO define clear type for component
          this.shadowRoot
            ?.querySelectorAll('backend-ai-chart')
            .forEach((chart: any) => {
              chart.init();
            });
          this.updating = false;
        })
        .catch((e) => {
          this.updating = false;
        });
    }
  }

  /**
   * Read user stats that belongs to specific period
   *
   * @return {void}
   * */
  readUserStat() {
    return globalThis.backendaiclient.resources
      .user_stats()
      .then((res) => {
        const { period, templates } = this;
        this.data = res;
        const collection = {};
        collection[period] = {};
        Object.keys(this._map).forEach((key) => {
          collection[period][key] = {
            data: [
              res
                .filter((e, i) => res.length - templates[period].length <= i)
                .map((e) => ({
                  x: new Date(1000 * e['date']),
                  y: e[key]['value'],
                })),
              // .map(e => ({x: 1000 * e["date"], y: e[key]["value"]})),
            ],
            labels: [
              res
                .filter((e, i) => res.length - templates[period].length <= i)
                .map((e) => new Date(1000 * e['date']).toString()),
              // .map(e => ({x: 1000 * e["date"], y: e[key]["value"]})),
            ],
            axisTitle: {
              x: 'Date',
              y: this._map[key],
            },
            period,
            unit_hint: res[0][key].unit_hint,
          };
        });
        this.collection = collection;
        return this.updateComplete;
      })
      .catch((e) => {
        console.log(e);
      });
  }

  /**
   * Change the data according to the item selected in the pull down menu.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   * */
  pulldownChange(e) {
    this.period = e.target.value;
    const { data, period, collection, _map, templates } = this;

    if (!(period in collection)) {
      collection[period] = {};
      Object.keys(_map).forEach((key) => {
        collection[period][key] = {
          data: [
            data
              .filter((e, i) => data.length - templates[period].length <= i)
              .map((e) => ({
                x: new Date(1000 * e['date']),
                y: e[key]['value'],
              })),
            // .map(e => ({x: 1000 * e["date"], y: e[key]["value"]})),
          ],
          axisTitle: {
            x: 'Date',
            y: _map[key],
          },
          period,
          unit_hint: data[data.length - 1][key].unit_hint,
        };
      });
    }
  }

  _launchUsageHistoryInfoDialog() {
    this._helpDescriptionTitle = _text('statistics.UsageHistory');
    this._helpDescription = `
      <div class="note-container">
        <div class="note-title">
          <mwc-icon class="fg white">info</mwc-icon>
          <div>Note</div>
        </div>
        <div class="note-contents">${_text('statistics.UsageHistoryNote')}</div>
      </div>
      <p>${_text('statistics.UsageHistoryDesc')}</p>
      <strong>Sessions</strong>
      <p>${_text('statistics.SessionsDesc')}</p>
      <strong>CPU</strong>
      <p>${_text('statistics.CPUDesc')}</p>
      <strong>Memory</strong>
      <p>${_text('statistics.MemoryDesc')}</p>
      <strong>GPU</strong>
      <p>${_text('statistics.GPUDesc')}</p>
      <strong>IO-Read</strong>
      <p>${_text('statistics.IOReadDesc')}</p>
      <strong>IO-Write</strong>
      <p>${_text('statistics.IOWriteDesc')}</p>
    `;
    this.helpDescriptionDialog.show();
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css" />
      <div class="card" elevation="0">
        <!--<backend-ai-monthly-usage-panel></backend-ai-monthly-usage-panel>-->
        <div class="horizontal layout center">
          <p id="select-period">${_t('statistics.SelectPeriod')}</p>
          <vaadin-select
            id="period-selector"
            theme="dark"
            .items="${this.periodSelectItems}"
            @change="${(e) => this.pulldownChange(e)}"
          ></vaadin-select>
          <mwc-icon-button
            class="fg green"
            icon="info"
            @click="${() => this._launchUsageHistoryInfoDialog()}"
          ></mwc-icon-button>
        </div>
        ${Object.keys(this.collection).length > 0
          ? Object.keys(this._map).map(
              (key, idx) => html`
                <h3 class="horizontal center layout usage-title">
                  <span>${this._map[key]}</span>
                  <span class="flex"></span>
                </h3>
                <div style="width:100%;min-height:180px;">
                  <backend-ai-chart
                    idx=${idx}
                    .collection=${this.collection[this.period][key]}
                  ></backend-ai-chart>
                </div>
              `,
            )
          : html``}
      </div>
      <backend-ai-dialog id="help-description" fixed backdrop>
        <span slot="title">${this._helpDescriptionTitle}</span>
        <div
          slot="content"
          class="horizontal layout center"
          style="margin:5px;"
        >
          ${this._helpDescriptionIcon == ''
            ? html``
            : html`
                <img
                  slot="graphic"
                  alt="help icon"
                  src="resources/icons/${this._helpDescriptionIcon}"
                  style="width:64px;height:64px;margin-right:10px;"
                />
              `}
          <div style="font-size:14px;">
            ${unsafeHTML(this._helpDescription)}
          </div>
        </div>
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-usage-list': BackendAIUsageList;
  }
}
