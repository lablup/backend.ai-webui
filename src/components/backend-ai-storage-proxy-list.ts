/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import { navigate } from '../backend-ai-app';
import '../plastics/lablup-shields/lablup-shields';
import {
  IronFlex,
  IronFlexAlignment,
} from '../plastics/layout/iron-flex-layout-classes';
import { store } from '../store';
import './backend-ai-dialog';
import { BackendAiStyles } from './backend-ai-general-styles';
import BackendAIListStatus, { StatusCondition } from './backend-ai-list-status';
import './backend-ai-list-status';
import { BackendAIPage } from './backend-ai-page';
import { default as PainKiller } from './backend-ai-painkiller';
import './lablup-progress-bar';
import '@material/mwc-icon-button';
import '@material/mwc-icon/mwc-icon';
import '@material/mwc-linear-progress';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@vaadin/grid/vaadin-grid';
import '@vaadin/grid/vaadin-grid-column';
import '@vaadin/grid/vaadin-grid-sort-column';
import { css, CSSResultGroup, html, render } from 'lit';
import { get as _text, translate as _t } from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type BackendAIDialog = HTMLElementTagNameMap['backend-ai-dialog'];

/**
 Backend.AI Storage Proxy List

 Example:

 <backend-ai-storage-proxy-list active=true>
 ... content ...
 </backend-ai-storage-proxy-list>

 @group Backend.AI Web UI
 @element backend-ai-storage-proxy-list
 */

@customElement('backend-ai-storage-proxy-list')
export default class BackendAIStorageProxyList extends BackendAIPage {
  @property({ type: String }) condition = 'running';
  @property({ type: Array }) storages;
  @property({ type: String }) listCondition: StatusCondition = 'loading';
  @property({ type: Object }) storagesObject = Object();
  @property({ type: Object }) storageProxyDetail = Object();
  @property({ type: Object }) notification = Object();
  @property({ type: Object }) _boundEndpointRenderer =
    this.endpointRenderer.bind(this);
  @property({ type: Object }) _boundTypeRenderer = this.typeRenderer.bind(this);
  @property({ type: Object }) _boundResourceRenderer =
    this.resourceRenderer.bind(this);
  @property({ type: Object }) _boundCapabilitiesRenderer =
    this.capabilitiesRenderer.bind(this);
  @property({ type: Object }) _boundControlRenderer =
    this.controlRenderer.bind(this);
  @property({ type: String }) filter = '';
  @query('#storage-proxy-detail') storageProxyDetailDialog!: BackendAIDialog;
  @query('#list-status') private _listStatus!: BackendAIListStatus;

  constructor() {
    super();
    this.storages = [];
  }

  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        vaadin-grid {
          border: 0;
          font-size: 14px;
          height: var(--list-height, calc(100vh - 182px));
        }

        mwc-icon {
          --mdc-icon-size: 16px;
        }

        img.indicator-icon {
          width: 16px !important;
          height: 16px !important;
        }

        paper-icon-button {
          --paper-icon-button: {
            width: 25px;
            height: 25px;
            min-width: 25px;
            min-height: 25px;
            padding: 3px;
            margin-right: 5px;
          };
        }

        div.indicator,
        span.indicator {
          font-size: 9px;
          margin-right: 5px;
        }

        #storage-proxy-detail {
          --component-max-width: 90%;
        }

        lablup-progress-bar {
          width: 100px;
          border-radius: 3px;
          height: 10px;
          --mdc-theme-primary: #3677eb;
          --mdc-linear-progress-buffer-color: #98be5a;
        }

        lablup-progress-bar.cpu {
          --progress-bar-height: 5px;
          margin-bottom: 0;
        }

        lablup-progress-bar.cuda {
          --progress-bar-height: 15px;
          margin-bottom: 5px;
        }

        lablup-progress-bar.mem {
          --progress-bar-height: 15px;
          width: 100px;
          margin-bottom: 0;
        }

        lablup-shields {
          margin: 1px;
        }

        .resource-indicator {
          width: 100px !important;
        }
      `,
    ];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
  }

  /**
   * Change state to 'ALIVE' when backend.ai client connected.
   *
   * @param {Boolean} active - The component will work if active is true.
   */
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
          this._loadStorageProxyList();
        },
        true,
      );
    } else {
      // already connected
      this._loadStorageProxyList();
    }
  }

  /**
   * Load an storage proxy informations.
   *
   */
  _loadStorageProxyList() {
    if (this.active !== true) {
      return;
    }
    this.listCondition = 'loading';
    this._listStatus?.show();
    globalThis.backendaiclient.storageproxy
      .list([
        'id',
        'backend',
        'capabilities',
        'path',
        'fsprefix',
        'performance_metric',
        'usage',
      ])
      .then((response) => {
        const storage_volumes = response.storage_volume_list.items;
        const storages: Array<any> = [];
        if (storage_volumes !== undefined && storage_volumes.length > 0) {
          Object.keys(storage_volumes).map((objectKey, index) => {
            const storage: any = storage_volumes[objectKey];
            if (this.filter !== '') {
              const filter = this.filter.split(':');
              if (filter[0] in storage && storage[filter[0]] === filter[1]) {
                storages.push(storage);
              }
            } else {
              storages.push(storage);
            }
          });
        }
        this.storages = storages;
        if (this.storages.length == 0) {
          this.listCondition = 'no-data';
        } else {
          this._listStatus?.hide();
        }
        const event = new CustomEvent('backend-ai-storage-proxy-updated', {});
        this.dispatchEvent(event);
        if (this.active === true) {
          setTimeout(() => {
            this._loadStorageProxyList();
          }, 15000);
        }
      })
      .catch((err) => {
        this._listStatus?.hide();
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      });
  }

  /**
   *
   * @param {string} url - page to redirect from the current page.
   */
  _moveTo(url = '') {
    const page = url !== '' ? url : 'start';
    // globalThis.history.pushState({}, '', page);
    store.dispatch(navigate(decodeURIComponent(page), {}));

    document.dispatchEvent(
      new CustomEvent('react-navigate', {
        detail: url,
      }),
    );
  }

  /**
   * Render endpoint with IP and name.
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
  endpointRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div>${rowData.item.id}</div>
        <div class="indicator monospace">${rowData.item.path}</div>
      `,
      root,
    );
  }

  /**
   * Render regions by platforms and locations.
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
  typeRenderer(root, column?, rowData?) {
    const platform: string = rowData.item.backend;
    let color: string;
    let icon: string;
    switch (platform) {
      case 'xfs':
        color = 'blue';
        icon = 'local';
        break;
      case 'ceph':
      case 'cephfs':
        color = 'lightblue';
        icon = 'ceph';
        break;
      case 'vfs':
      case 'nfs':
        color = 'green';
        icon = 'local';
        break;
      case 'purestorage':
        color = 'red';
        icon = 'purestorage';
        break;
      case 'dgx':
      case 'spectrumscale':
        color = 'green';
        icon = 'local';
        break;
      case 'weka':
        color = 'purple';
        icon = 'local';
        break;
      default:
        color = 'yellow';
        icon = 'local';
    }
    render(
      // language=HTML
      html`
        <div class="horizontal start-justified center layout">
          <img
            src="/resources/icons/${icon}.png"
            style="width:32px;height:32px;"
          />
          <lablup-shields
            app="Backend"
            color="${color}"
            description="${rowData.item.backend}"
            ui="round"
          ></lablup-shields>
        </div>
      `,
      root,
    );
  }

  /**
   * Render a resource.
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
  resourceRenderer(root, column?, rowData?) {
    const usage = JSON.parse(rowData.item.usage);
    const usageRatio =
      usage.capacity_bytes > 0 ? usage.used_bytes / usage.capacity_bytes : 0;
    const usagePercent = (usageRatio * 100).toFixed(3);
    const totalBuffer = 100;
    render(
      // language=HTML
      html`
        <div class="layout flex">
          <div class="layout horizontal center flex">
            <div class="layout horizontal start resource-indicator">
              <mwc-icon class="fg green">data_usage</mwc-icon>
              <span class="indicator" style="padding-left:5px;">
                ${_t('session.Usage')}
              </span>
            </div>
            <span class="flex"></span>
            <div class="layout vertical center">
              <lablup-progress-bar
                id="volume-usage-bar"
                progress="${usageRatio}"
                buffer="${totalBuffer}"
                description="${usagePercent}%"
              ></lablup-progress-bar>
              <div class="indicator" style="margin-top:3px;">
                ${globalThis.backendaiutils._humanReadableFileSize(
                  usage.used_bytes,
                )}
                /
                ${globalThis.backendaiutils._humanReadableFileSize(
                  usage.capacity_bytes,
                )}
              </div>
            </div>
          </div>
        </div>
      `,
      root,
    );
  }

  /**
   * Render a heartbeat status.
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
  capabilitiesRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="layout vertical start justified wrap">
          ${rowData.item.capabilities
            ? rowData.item.capabilities.map(
                (item) => html`
                  <lablup-shields
                    app=""
                    color="blue"
                    description="${item}"
                    ui="round"
                  ></lablup-shields>
                `,
              )
            : html``}
        </div>
      `,
      root,
    );
  }

  /**
   * Show storage proxy detailed dialog.
   *
   * @param {string} storageProxyId - storage proxy ID
   * @return {void}
   */
  showStorageProxyDetailDialog(storageProxyId) {
    const event = new CustomEvent('backend-ai-selected-storage-proxy', {
      detail: storageProxyId,
    });
    document.dispatchEvent(event);
    // this.storageProxyDetail = this.storagesObject[storageProxyId];
    // this.storageProxyDetailDialog.show();
    return;
  }

  /**
   * Render control buttons such as assignment, build, add an alarm, pause and delete.
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
  controlRenderer(root, column?, rowData?) {
    let perfMetricDisabled;
    try {
      const perfMetric = JSON.parse(rowData.item.performance_metric);
      perfMetricDisabled = Object.keys(perfMetric).length > 0 ? false : true;
    } catch {
      perfMetricDisabled = true;
    }
    render(
      // language=HTML
      html`
        <div
          id="controls"
          class="layout horizontal flex center"
          agent-id="${rowData.item.id}"
        >
          <mwc-icon-button
            class="fg green controls-running"
            icon="assignment"
            ?disabled="${perfMetricDisabled}"
            @click="${(e) =>
              this.showStorageProxyDetailDialog(rowData.item.id)}"
          ></mwc-icon-button>
          <mwc-icon-button
            class="fg blue controls-running"
            icon="settings"
            @click="${() =>
              this._moveTo(`/storage-settings/${rowData.item.id}`)}"
          ></mwc-icon-button>
        </div>
      `,
      root,
    );
  }

  /**
   * Convert the value bytes to MB
   *
   * @param {number} value
   * @param {number} decimalPoint decimal point to show
   * @return {number} converted value from bytes to MB
   */
  static bytesToMB(value, decimalPoint = 1) {
    return Number(value / 10 ** 6).toFixed(decimalPoint);
  }

  render() {
    // language=HTML
    return html`
      <div class="list-wrapper">
        <vaadin-grid
          class="${this.condition}"
          theme="row-stripes column-borders compact dark"
          aria-label="Job list"
          .items="${this.storages}"
        >
          <vaadin-grid-column
            resizable
            width="80px"
            header="${_t('agent.Endpoint')}"
            .renderer="${this._boundEndpointRenderer}"
          ></vaadin-grid-column>
          <vaadin-grid-column
            width="100px"
            resizable
            header="${_t('agent.BackendType')}"
            .renderer="${this._boundTypeRenderer}"
          ></vaadin-grid-column>
          <vaadin-grid-column
            resizable
            width="60px"
            header="${_t('agent.Resources')}"
            .renderer="${this._boundResourceRenderer}"
          ></vaadin-grid-column>
          <vaadin-grid-column
            width="130px"
            flex-grow="0"
            resizable
            header="${_t('agent.Capabilities')}"
            .renderer="${this._boundCapabilitiesRenderer}"
          ></vaadin-grid-column>
          <vaadin-grid-column
            resizable
            header="${_t('general.Control')}"
            .renderer="${this._boundControlRenderer}"
          ></vaadin-grid-column>
        </vaadin-grid>
        <backend-ai-list-status
          id="list-status"
          statusCondition="${this.listCondition}"
          message="${_text('agent.NoAgentToDisplay')}"
        ></backend-ai-list-status>
      </div>
      <backend-ai-dialog
        id="storage-proxy-detail"
        fixed
        backdrop
        blockscrolling
        persistent
        scrollable
      >
        <span slot="title">${_t('agent.DetailedInformation')}</span>
        <div slot="content">
          <div class="horizontal start start-justified layout">
            ${'cpu_util_live' in this.storageProxyDetail
              ? html`
                  <div>
                    <h3>CPU</h3>
                    <div
                      class="horizontal wrap layout"
                      style="max-width:600px;"
                    >
                      ${this.storageProxyDetail.cpu_util_live.map(
                        (item) => html`
                          <div
                            class="horizontal start-justified center layout"
                            style="padding:0 5px;"
                          >
                            <div style="font-size:8px;width:35px;">
                              CPU${item.num}
                            </div>
                            <lablup-progress-bar
                              class="cpu"
                              progress="${item.pct / 100.0}"
                              description=""
                            ></lablup-progress-bar>
                          </div>
                        `,
                      )}
                    </div>
                  </div>
                `
              : html``}
            <div style="margin-left:10px;">
              <h3>Memory</h3>
              <div>
                <lablup-progress-bar
                  class="mem"
                  progress="${this.storageProxyDetail.mem_current_usage_ratio}"
                  description="${this.storageProxyDetail
                    .current_mem} GiB / ${this.storageProxyDetail
                    .mem_slots} GiB"
                ></lablup-progress-bar>
              </div>
              <h3>Network</h3>
              ${'live_stat' in this.storageProxyDetail &&
              'node' in this.storageProxyDetail.live_stat
                ? html`
                    <div>
                      TX:
                      ${BackendAIStorageProxyList.bytesToMB(
                        this.storageProxyDetail.live_stat.node.net_tx.current,
                      )}
                      MB
                    </div>
                    <div>
                      RX:
                      ${BackendAIStorageProxyList.bytesToMB(
                        this.storageProxyDetail.live_stat.node.net_rx.current,
                      )}
                      MB
                    </div>
                  `
                : html``}
            </div>
          </div>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
            unelevated
            id="close-button"
            icon="check"
            label="${_t('button.Close')}"
            @click="${(e) => this._hideDialog(e)}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-storage-proxy-list': BackendAIStorageProxyList;
  }
}
