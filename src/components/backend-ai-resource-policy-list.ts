/**
 @license
Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
*/

import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html, render} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';

import {BackendAIPage} from './backend-ai-page';

import '@material/mwc-textfield/mwc-textfield';
import '@material/mwc-button/mwc-button';
import '@material/mwc-select/mwc-select';
import '@material/mwc-list/mwc-list';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column';
import '@vaadin/vaadin-icons/vaadin-icons';
import '@vaadin/vaadin-item/vaadin-item';

import 'weightless/button';
import 'weightless/icon';
import 'weightless/card';
import 'weightless/checkbox';
import 'weightless/label';

import './backend-ai-dialog';
import './backend-ai-multi-select';
import '../plastics/lablup-shields/lablup-shields';

import {default as PainKiller} from './backend-ai-painkiller';
import {BackendAiStyles} from './backend-ai-general-styles';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

@customElement('backend-ai-resource-policy-list')
export default class BackendAIResourcePolicyList extends BackendAIPage {
  @property({type: Boolean}) visible = false;
  @property({type: Object}) keypairs = {};
  @property({type: Array}) resourcePolicy = [];
  @property({type: Object}) keypairInfo = {};
  @property({type: Boolean}) active = false;
  @property({type: String}) condition = 'active';
  @property({type: Object}) cpu_resource = {};
  @property({type: Object}) ram_resource = {};
  @property({type: Object}) gpu_resource = {};
  @property({type: Object}) fgpu_resource = {};
  @property({type: Object}) concurrency_limit = {};
  @property({type: Object}) idle_timeout = {};
  @property({type: Object}) session_lifetime = {};
  @property({type: Object}) vfolder_capacity = {};
  @property({type: Object}) vfolder_max_limit= {};
  @property({type: Object}) container_per_session_limit = {};
  @property({type: Array}) resource_policy_names;
  @property({type: String}) current_policy_name = '';
  @property({type: Number}) selectAreaHeight;
  @property({type: Boolean}) enableSessionLifetime = false;
  @property({type: Object}) _boundResourceRenderer = Object();
  @property({type: Object}) _boundConcurrencyRenderer = this.concurrencyRenderer.bind(this);
  @property({type: Object}) _boundControlRenderer = this.controlRenderer.bind(this);
  @property({type: Object}) _boundPolicyNameRenderer = this.policyNameRenderer.bind(this);
  @property({type: Object}) _boundClusterSizeRenderer = this.clusterSizeRenderer.bind(this);
  @property({type: Object}) _boundStorageNodesRenderer = this.storageNodesRenderer.bind(this);
  @query('#allowed-vfolder-hosts') private allowedVfolderHostsSelect;
  @state() private all_vfolder_hosts;
  @state() private allowed_vfolder_hosts;
  @state() private is_super_admin = false;

  constructor() {
    super();
    this.all_vfolder_hosts = [];
    this.allowed_vfolder_hosts = [];
    this.resource_policy_names = [];
    this._boundResourceRenderer = this.resourceRenderer.bind(this);
  }

  static get styles(): CSSResultGroup | undefined {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        vaadin-grid {
          border: 0;
          font-size: 14px;
          height: calc(100vh - 300px);
        }

        wl-icon.indicator {
          width: 16px;
          height: 16px;
          --icon-size: 16px;
          min-width: 16px;
          min-height: 16px;
          padding: 0;
        }

        wl-button {
          --button-fab-size: 40px;
          margin-right: 5px;
        }

        wl-button[disabled].fg {
          color: rgba(0,0,0,0.4) !important;
        }

        vaadin-item {
          font-size: 13px;
          font-weight: 100;
        }

        div.indicator,
        span.indicator {
          font-size: 9px;
          margin-right: 5px;
        }

        div.configuration {
          width: 70px !important;
        }

        div.configuration wl-icon {
          padding-right: 5px;
        }

        div.sessions-section {
          width: 167px;
          margin-bottom: 10px;
        }

        wl-label {
          width: 100%;
          min-width: 60px;
          font-size: 10px; // 11px;
          --label-font-family: 'Ubuntu', Roboto;
        }

        wl-label.folders {
          margin: 3px 0px 7px 0px;
        }

        wl-label.unlimited {
          margin: 4px 0px 0px 0px;
        }

        wl-label.unlimited > wl-checkbox {
          border-width: 1px;
        }

        wl-list-item {
          width: 100%;
        }

        wl-checkbox {
          --checkbox-size: 10px;
          --checkbox-border-radius: 2px;
          --checkbox-bg-checked: var(--general-checkbox-color);
          --checkbox-checkmark-stroke-color: white;
          --checkbox-color-checked: white;
        }

        mwc-textfield {
          width: 100%;
          --mdc-text-field-fill-color: transparent;
          --mdc-theme-primary: var(--general-textfield-selected-color);
          --mdc-typography-font-family: var(--general-font-family);
        }

        mwc-textfield.resource-input {
          width: 5rem;
        }

        mwc-button, mwc-button[unelevated] {
          background-image: none;
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-theme-on-primary: var(--general-button-color);
          --mdc-typography-font-family: var(--general-font-family);
        }

        mwc-list-item {
          --mdc-menu-item-height: auto;
          font-size : 14px;
        }

        backend-ai-dialog {
          --component-min-width: 350px;
          --component-max-width: 390px;
        }
        backend-ai-dialog h4 {
          font-size: 14px;
          padding: 5px 15px 5px 12px;
          margin: 0 0 10px 0;
          display: block;
          height: 20px;
          border-bottom: 1px solid #DDD;
        }
        div.popup-right-margin {
          margin-right: 5px;
        }
        div.popup-left-margin {
          margin-left: 5px;
        }
        div.popup-both-margin {
          margin-left: 5px;
          margin-right: 5px;
        }
      `];
  }

  render() {
    // language=HTML
    // FIXME: Need a proper reason to limit cpu/mem/gpu resources, leaving MAX_INT32 for now...
    return html`
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Resource Policy list"
                  .items="${this.resourcePolicy}">
        <vaadin-grid-column width="40px" flex-grow="0" header="#" text-align="center" .renderer="${this._indexRenderer}"></vaadin-grid-column>
        <vaadin-grid-sort-column resizable header="${_t('resourcePolicy.Name')}" path="name" .renderer="${this._boundPolicyNameRenderer}"></vaadin-grid-sort-column>
        <vaadin-grid-column width="150px" resizable header="${_t('resourcePolicy.Resources')}" .renderer="${this._boundResourceRenderer}">
        </vaadin-grid-column>
        <vaadin-grid-column resizable header="${_t('resourcePolicy.Concurrency')}" .renderer="${this._boundConcurrencyRenderer}">
        </vaadin-grid-column>
        <vaadin-grid-sort-column resizable header="${_t('resourcePolicy.ClusterSize')}" path="max_containers_per_session"
            .renderer="${this._boundClusterSizeRenderer}"></vaadin-grid-sort-column>
        <vaadin-grid-column resizable header="${_t('resourcePolicy.StorageNodes')}" .renderer="${this._boundStorageNodesRenderer}">
        </vaadin-grid-column>
        <vaadin-grid-column resizable header="${_t('general.Control')}" .renderer="${this._boundControlRenderer}">
        </vaadin-grid-column>
      </vaadin-grid>
      <backend-ai-dialog id="modify-policy-dialog" fixed backdrop blockscrolling narrowLayout>
        <span slot="title">${_t('resourcePolicy.UpdateResourcePolicy')}</span>
        <div slot="content">
          <mwc-textfield id="id_new_policy_name" label="${_t('resourcePolicy.PolicyName')}" disabled></mwc-textfield>
          <h4>${_t('resourcePolicy.ResourcePolicy')}</h4>
          <div class="horizontal justified layout distancing">
            <div class="vertical layout popup-right-margin">
              <wl-label>CPU</wl-label>
              <mwc-textfield class="discrete resource-input" id="cpu-resource" type="number" min="0" max=${BackendAIResourcePolicyList.MAX_INT32}
                            @change="${(e) => this._validateResourceInput(e)}"></mwc-textfield>
                <wl-label class="unlimited">
                  <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}"></wl-checkbox>
                  ${_t('resourcePolicy.Unlimited')}
                </wl-label>
            </div>
            <div class="vertical layout popup-both-margin">
              <wl-label>RAM(GB)</wl-label>
              <mwc-textfield class="resource-input" id="ram-resource" type="number" min="0" max=${BackendAIResourcePolicyList.MAX_INT32} step="0.01"
                            @change="${(e) => this._validateResourceInput(e)}"></mwc-textfield>
              <wl-label class="unlimited">
                <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}"></wl-checkbox>
                ${_t('resourcePolicy.Unlimited')}
              </wl-label>
            </div>
            <div class="vertical layout popup-both-margin">
              <wl-label>GPU</wl-label>
              <mwc-textfield class="discrete resource-input" id="gpu-resource" type="number" min="0" max=${BackendAIResourcePolicyList.MAX_INT32}
                            @change="${(e) => this._validateResourceInput(e)}"></mwc-textfield>
              <wl-label class="unlimited">
                <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}"></wl-checkbox>
                ${_t('resourcePolicy.Unlimited')}
              </wl-label>
            </div>
            <div class="vertical layout popup-left-margin">
              <wl-label>fGPU</wl-label>
              <mwc-textfield class="resource-input" id="fgpu-resource" type="number" min="0" max=${BackendAIResourcePolicyList.MAX_INT32} step="0.1"
                            @change="${(e) => this._validateResourceInput(e)}"></mwc-textfield>
              <wl-label class="unlimited">
                <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}"></wl-checkbox>
                ${_t('resourcePolicy.Unlimited')}
              </wl-label>
            </div>
          </div>
          <h4>${_t('resourcePolicy.Sessions')}</h4>
          <div class="horizontal layout justified distancing wrap">
            <div class="vertical left layout ${this.enableSessionLifetime ? 'sessions-section' : ''}">
              <wl-label>${_t('resourcePolicy.ContainerPerSession')}</wl-label>
              <mwc-textfield class="discrete" id="container-per-session-limit" type="number" min="0" max=${BackendAIResourcePolicyList.MAX_INT32}
                  @change="${(e) => this._validateResourceInput(e)}"></mwc-textfield>
              <wl-label class="unlimited">
                <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}"></wl-checkbox>
                ${_t('resourcePolicy.Unlimited')}
              </wl-label>
            </div>
            <div class="vertical left layout ${this.enableSessionLifetime ? 'sessions-section' : ''}">
              <wl-label>${_t('resourcePolicy.IdleTimeoutSec')}</wl-label>
              <mwc-textfield class="discrete" id="idle-timeout" type="number" min="0" max=${Number.MAX_SAFE_INTEGER}
                  @change="${(e) => this._validateResourceInput(e)}"></mwc-textfield>
              <wl-label class="unlimited">
                <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}"></wl-checkbox>
                ${_t('resourcePolicy.Unlimited')}
              </wl-label>
            </div>
            <div class="vertical left layout ${this.enableSessionLifetime ? 'sessions-section' : ''}">
              <wl-label>${_t('resourcePolicy.ConcurrentJobs')}</wl-label>
              <mwc-textfield class="discrete" id="concurrency-limit" type="number" min="0" max=${BackendAIResourcePolicyList.MAX_INT32}
                  @change="${(e) => this._validateResourceInput(e)}"></mwc-textfield>
              <wl-label class="unlimited">
                <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}"></wl-checkbox>
                ${_t('resourcePolicy.Unlimited')}
              </wl-label>
            </div>
            <div class="vertical left layout ${this.enableSessionLifetime ? 'sessions-section' : ''}"
                style="${this.enableSessionLifetime ? '' : 'display:none;'}">
              <wl-label>${_t('resourcePolicy.MaxSessionLifeTime')}</wl-label>
              <mwc-textfield class="discrete" id="session-lifetime" type="number" min="0" max=${BackendAIResourcePolicyList.MAX_INT32}
                  @change="${(e) => this._validateResourceInput(e)}"></mwc-textfield>
              <wl-label class="unlimited">
                <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}"></wl-checkbox>
                ${_t('resourcePolicy.Unlimited')}
              </wl-label>
            </div>
          </div>
          <h4 style="margin-bottom:0px;">${_t('resourcePolicy.Folders')}</h4>
          <div class="vertical center layout distancing" id="dropdown-area">
            <backend-ai-multi-select open-up id="allowed-vfolder-hosts" label="${_t('resourcePolicy.AllowedHosts')}" style="width:100%;"></backend-ai-multi-select>
            <div class="horizontal layout justified" style="width:100%;">
              <div class="vertical layout flex popup-right-margin">
                <wl-label class="folders">${_t('resourcePolicy.Capacity')}(GiB)</wl-label>
                <mwc-textfield id="vfolder-capacity-limit" type="number" min="0" max=${BackendAIResourcePolicyList.MAX_INT_CONVERTED_TO_GIB} step="0.1"
                    @change="${(e) => this._validateResourceInput(e)}"></mwc-textfield>
                <wl-label class="unlimited">
                  <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}"></wl-checkbox>
                  ${_t('resourcePolicy.Unlimited')}
                </wl-label>
              </div>
              <div class="vertical layout flex popup-left-margin">
                <wl-label class="folders">${_t('credential.Max#')}</wl-label>
                <mwc-textfield class="discrete" id="vfolder-count-limit" type="number" min="0" max=${BackendAIResourcePolicyList.MAX_INT32}
                    @change="${(e) => this._validateResourceInput(e)}"></mwc-textfield>
              </div>
            </div>
          </div>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout distancing">
          <mwc-button
              unelevated
              fullwidth
              id="create-policy-button"
              icon="check"
              label="${_t('button.Update')}"
              @click="${() => this._modifyResourcePolicy()}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="delete-policy-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t('dialog.title.LetsDouble-Check')}</span>
        <div slot="content">
          <p>${_t('resourcePolicy.AboutToDeleteResourcePolicy')}</p>
          <p style="text-align:center;color:blue;">${this.current_policy_name}</p>
          <p>${_t('dialog.warning.CannotBeUndone')} ${_t('dialog.ask.DoYouWantToProceed')}</p>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
                class="operation"
                label="${_t('button.Cancel')}"
                @click="${(e) => this._hideDialog(e)}"></mwc-button>
            <mwc-button
                unelevated
                class="operation"
                label="${_t('button.Okay')}"
                @click="${() => this._deleteResourcePolicy()}"></mwc-button>
        </div>
      </backend-ai-dialog>
    `;
  }

  _indexRenderer(root, column, rowData) {
    const idx = rowData.index + 1;
    render(
      html`
        <div>${idx}</div>
      `,
      root
    );
  }

  resourceRenderer(root, column?, rowData?) {
    let maxVfolderSizeUnit = 'GiB';
    let maxVfolderSize = this._markIfUnlimited(rowData.item.max_vfolder_size);
    if (typeof maxVfolderSize === 'number') { // FIXME: need better idea to branch number and infinity character
      [maxVfolderSize, maxVfolderSizeUnit] = globalThis.backendaiutils._humanReadableFileSize(maxVfolderSize).split(' ');
    }
    render(
      html`
        <div class="layout horizontal wrap center">
          <div class="layout horizontal configuration">
            <wl-icon class="fg green indicator">developer_board</wl-icon>
            <span>${this._markIfUnlimited(rowData.item.total_resource_slots.cpu)}</span>
            <span class="indicator">cores</span>
          </div>
          <div class="layout horizontal configuration">
            <wl-icon class="fg green indicator">memory</wl-icon>
            <span>${this._markIfUnlimited(rowData.item.total_resource_slots.mem)}</span>
            <span class="indicator">GB</span>
          </div>
        </div>
        <div class="layout horizontal wrap center">
        ${rowData.item.total_resource_slots['cuda_device'] ?
    html`
          <div class="layout horizontal configuration">
            <wl-icon class="fg green indicator">view_module</wl-icon>
            <span>${this._markIfUnlimited(rowData.item.total_resource_slots.cuda_device)}</span>
            <span class="indicator">GPU</span>
          </div>
` : html``}
        ${rowData.item.total_resource_slots['cuda_shares'] ?
    html`
          <div class="layout horizontal configuration">
            <wl-icon class="fg green indicator">view_module</wl-icon>
            <span>${this._markIfUnlimited(rowData.item.total_resource_slots.cuda_shares)}</span>
            <span class="indicator">fGPU</span>
          </div>
` : html``}
        </div>
        <div class="layout horizontal wrap center">
          <div class="layout horizontal configuration">
            <wl-icon class="fg green indicator">cloud_queue</wl-icon>
            <span>${maxVfolderSize}</span>
            <span class="indicator">${maxVfolderSizeUnit}</span>
          </div>
          <div class="layout horizontal configuration">
            <wl-icon class="fg green indicator">folder</wl-icon>
            <span>${this._markIfUnlimited(rowData.item.max_vfolder_count)}</span>
            <span class="indicator">Folders</span>
          </div>
        </div>
      `, root
    );
  }

  concurrencyRenderer(root, column?, rowData?) {
    // FIXME: need to distinguish zero and infinity not only in client-side but also server-side.
    render(
      html`
        <div>${(rowData.item.max_concurrent_sessions <= 0) ? '∞' : rowData.item.max_concurrent_sessions}</div>
    `, root
    );
  }

  controlRenderer(root, column?, rowData?) {
    render(
      html`
        <div id="controls" class="layout horizontal flex center" .policy-name="${rowData.item.name}">
          <wl-button fab flat inverted class="fg blue controls-running" ?disabled=${!this.is_super_admin}
                      @click="${(e) => this._launchResourcePolicyDialog(e)}">
            <wl-icon>settings</wl-icon>
          </wl-button>
          <wl-button fab flat inverted class="fg red controls-running" ?disabled=${!this.is_super_admin}
                      @click="${(e) => this._openDeleteResourcePolicyListDialog(e)}">
            <wl-icon>delete</wl-icon>
          </wl-button>
      `, root
    );
  }

  policyNameRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
      <div class="layout horizontal center flex">
        <div>${rowData.item.name}</div>
      </div>
      `, root
    );
  }

  clusterSizeRenderer(root, column?, rowData?) {
    // FIXME: need to distinguish zero and infinity not only in client-side but also server-side.
    render(
      // language=HTML
      html`
      <div>${(rowData.item.max_containers_per_session <= 0) ? '∞' : rowData.item.max_containers_per_session}</div>
      `, root
    );
  }

  storageNodesRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
      <div class="layout horizontal center flex">
        <div class="vertical start layout around-justified">
          ${rowData.item.allowed_vfolder_hosts.map((host) => html`
            <lablup-shields app="" color="darkgreen" ui="round" description="${host}" style="margin-bottom:3px;"></lablup-shields>`
          )}
        </div>
      </div>
      `, root
    );
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    // monkeypatch for height calculation.
    this.selectAreaHeight = this.shadowRoot.querySelector('#dropdown-area').offsetHeight ? this.shadowRoot.querySelector('#dropdown-area').offsetHeight : '123px';
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.enableSessionLifetime = globalThis.backendaiclient.supports('session-lifetime');
        this.is_super_admin = globalThis.backendaiclient.is_superadmin;
        this._refreshPolicyData();
        this._getResourceInfo();
      }, true);
    } else { // already connected
      this.enableSessionLifetime = globalThis.backendaiclient.supports('session-lifetime');
      this.is_super_admin = globalThis.backendaiclient.is_superadmin;
      this._refreshPolicyData();
      this._getResourceInfo();
    }
  }

  _launchResourcePolicyDialog(e) {
    this.updateCurrentPolicyToDialog(e);
    this._getAllStorageHostsInfo().then(() => {
      this.allowedVfolderHostsSelect.items = this.all_vfolder_hosts;
      this.allowedVfolderHostsSelect.selectedItemList = this.allowed_vfolder_hosts;
      this.shadowRoot.querySelector('#modify-policy-dialog').show();
    }).catch((err) => {
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  _openDeleteResourcePolicyListDialog(e) {
    this.updateCurrentPolicyToDialog(e);
    this.shadowRoot.querySelector('#delete-policy-dialog').show();
  }

  updateCurrentPolicyToDialog(e) {
    const controls = e.target.closest('#controls');
    const policyName = controls['policy-name'];
    const resourcePolicies = globalThis.backendaiclient.utils.gqlToObject(this.resourcePolicy, 'name');
    const resourcePolicy = resourcePolicies[policyName];

    this.resource_policy_names = Object.keys(resourcePolicies);
    this.shadowRoot.querySelector('#id_new_policy_name').value = policyName;
    this.current_policy_name = policyName;
    this.cpu_resource['value'] = this._updateUnlimitedValue(resourcePolicy.total_resource_slots['cpu']);
    this.ram_resource['value'] = this._updateUnlimitedValue(resourcePolicy.total_resource_slots['mem']);
    this.gpu_resource['value'] = this._updateUnlimitedValue(resourcePolicy.total_resource_slots['cuda_device']);
    this.fgpu_resource['value'] = this._updateUnlimitedValue(resourcePolicy.total_resource_slots['cuda_shares']);
    this.concurrency_limit['value'] = this._updateUnlimitedValue(resourcePolicy.max_concurrent_sessions);
    this.idle_timeout['value'] = this._updateUnlimitedValue(resourcePolicy.idle_timeout);
    this.container_per_session_limit['value'] = this._updateUnlimitedValue(resourcePolicy.max_containers_per_session);
    this.vfolder_capacity['value'] = this._byteToGiB(this._updateUnlimitedValue(resourcePolicy.max_vfolder_size), this._countDecimals(this.vfolder_capacity['step'])); // starts from GiB

    if (this.enableSessionLifetime) {
      this.session_lifetime['value'] = this._updateUnlimitedValue(resourcePolicy.max_session_lifetime);
      this._updateInputStatus(this.session_lifetime);
    }

    this._updateInputStatus(this.cpu_resource);
    this._updateInputStatus(this.ram_resource);
    this._updateInputStatus(this.gpu_resource);
    this._updateInputStatus(this.fgpu_resource);
    this._updateInputStatus(this.concurrency_limit);
    this._updateInputStatus(this.idle_timeout);
    this._updateInputStatus(this.container_per_session_limit);
    this._updateInputStatus(this.vfolder_capacity);
    this.shadowRoot.querySelector('#vfolder-count-limit').value = resourcePolicy.max_vfolder_count;
    this.allowed_vfolder_hosts = resourcePolicy.allowed_vfolder_hosts;
  }

  _refreshPolicyData() {
    return globalThis.backendaiclient.resourcePolicy.get().then((response) => {
      const rp = response.keypair_resource_policies;
      // let resourcePolicy = globalThis.backendaiclient.utils.gqlToObject(rp, 'name');
      return rp;
    }).then((response) => {
      const resourcePolicies = response;
      Object.keys(resourcePolicies).map((objectKey, index) => {
        const policy = resourcePolicies[objectKey];
        policy['total_resource_slots'] = JSON.parse(policy['total_resource_slots']);
        if ('cpu' in policy['total_resource_slots']) {
        } else if (policy['default_for_unspecified'] === 'UNLIMITED') {
          policy['total_resource_slots'].cpu = 'Unlimited';
        }
        if ('mem' in policy['total_resource_slots']) {
          policy['total_resource_slots'].mem = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(policy['total_resource_slots'].mem, 'g'));
        } else if (policy['default_for_unspecified'] === 'UNLIMITED') {
          policy['total_resource_slots'].mem = 'Unlimited';
        }
        if ('cuda.device' in policy['total_resource_slots']) {
          if (policy['total_resource_slots']['cuda.device'] === 0 && policy['default_for_unspecified'] === 'UNLIMITED') {
            policy['total_resource_slots'].cuda_device = 'Unlimited';
          } else {
            policy['total_resource_slots'].cuda_device = policy['total_resource_slots']['cuda.device'];
          }
        } else if (policy['default_for_unspecified'] === 'UNLIMITED') {
          policy['total_resource_slots'].cuda_device = 'Unlimited';
        }
        if ('cuda.shares' in policy['total_resource_slots']) {
          if (policy['total_resource_slots']['cuda.shares'] === 0 && policy['default_for_unspecified'] === 'UNLIMITED') {
            policy['total_resource_slots'].cuda_shares = 'Unlimited';
          } else {
            policy['total_resource_slots'].cuda_shares = policy['total_resource_slots']['cuda.shares'];
          }
        } else if (policy['default_for_unspecified'] === 'UNLIMITED') {
          policy['total_resource_slots'].cuda_shares = 'Unlimited';
        }
      });
      this.resourcePolicy = resourcePolicies;
    }).catch((err) => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  refresh() {
    this._refreshPolicyData();
  }

  _isActive() {
    return this.condition === 'active';
  }

  _byteToGiB(value: number, decimals=0) {
    const gigabyte = Math.pow(2, 30);
    const unitToFix = Math.pow(10, decimals);
    return (Math.round(value / gigabyte * unitToFix) / unitToFix).toFixed(decimals);
  }

  _giBToByte(value: number, decimals = 0) {
    const gigabyte = Math.pow(2, 30);
    return Math.round(value * gigabyte);
  }

  _readResourcePolicyInput() {
    const total_resource_slots = {};
    const vfolder_hosts = this.allowedVfolderHostsSelect.selectedItemList;
    try {
      this._validateUserInput(this.cpu_resource);
      this._validateUserInput(this.ram_resource);
      this._validateUserInput(this.gpu_resource);
      this._validateUserInput(this.fgpu_resource);

      // Integer (4byte)
      this._validateUserInput(this.concurrency_limit);
      this._validateUserInput(this.container_per_session_limit);
      this._validateUserInput(this.vfolder_max_limit);

      // BigInt
      this._validateUserInput(this.vfolder_capacity);
      this._validateUserInput(this.idle_timeout);
    } catch (err) {
      throw err;
    }

    total_resource_slots['cpu'] = this.cpu_resource['value'];
    total_resource_slots['mem'] = this.ram_resource['value'] + 'g';
    total_resource_slots['cuda.device'] = parseInt(this.gpu_resource['value']);
    total_resource_slots['cuda.shares'] = parseFloat(this.fgpu_resource['value']);

    this.concurrency_limit['value'] = ['', 0].includes(this.concurrency_limit['value']) ? 0 : parseInt(this.concurrency_limit['value']);
    this.container_per_session_limit['value'] = ['', 0].includes(this.container_per_session_limit['value']) ? 0 : parseInt(this.container_per_session_limit['value']);
    this.vfolder_max_limit['value'] = (this.vfolder_max_limit['value'] === '') ? 0 : parseInt(this.vfolder_max_limit['value']);

    this.idle_timeout['value'] = (this.idle_timeout['value'] === '') ? 0 : parseInt(this.idle_timeout['value']);
    this.vfolder_capacity['value'] = (this.vfolder_capacity['value'] === '') ? 0 : parseFloat(this.vfolder_capacity['value']);

    Object.keys(total_resource_slots).map((resource) => {
      if (isNaN(parseFloat(total_resource_slots[resource]))) {
        delete total_resource_slots[resource];
      }
    });
    const input = {
      'default_for_unspecified': 'UNLIMITED',
      'total_resource_slots': JSON.stringify(total_resource_slots),
      'max_concurrent_sessions': this.concurrency_limit['value'],
      'max_containers_per_session': this.container_per_session_limit['value'],
      'idle_timeout': this.idle_timeout['value'],
      'max_vfolder_count': this.vfolder_max_limit['value'],
      'max_vfolder_size': this._giBToByte(this.vfolder_capacity['value']),
      'allowed_vfolder_hosts': vfolder_hosts
    };
    if (this.enableSessionLifetime) {
      this._validateUserInput(this.session_lifetime);
      this.session_lifetime['value'] = (this.session_lifetime['value'] === '') ? 0 : parseInt(this.session_lifetime['value']);
      input['max_session_lifetime'] = this.session_lifetime['value'];
    }

    return input;
  }

  _modifyResourcePolicy() {
    try {
      const input = this._readResourcePolicyInput();
      globalThis.backendaiclient.resourcePolicy.mutate(this.current_policy_name, input)
        .then(({modify_keypair_resource_policy}) => {
          if (modify_keypair_resource_policy.ok) {
            this.shadowRoot.querySelector('#modify-policy-dialog').hide();
            this.notification.text = _text('resourcePolicy.SuccessfullyUpdated');
            this.notification.show();
            this.refresh();
          } else if (modify_keypair_resource_policy.msg) {
            this.shadowRoot.querySelector('#modify-policy-dialog').hide();
            this.notification.text = PainKiller.relieve(modify_keypair_resource_policy.msg);
            this.notification.show();
            this.refresh();
          }
        })
        .catch((err) => {
          console.log(err);
          if (err && err.message) {
            this.shadowRoot.querySelector('#modify-policy-dialog').hide();
            this.notification.text = PainKiller.relieve(err.title);
            this.notification.detail = err.message;
            this.notification.show(true, err);
          }
        });
    } catch (err) {
      this.notification.text = err.message;
      this.notification.show();
    }
  }

  _deleteResourcePolicy() {
    const name = this.current_policy_name;
    globalThis.backendaiclient.resourcePolicy.delete(name).then(({delete_keypair_resource_policy}) => {
      if (delete_keypair_resource_policy.ok) {
        this.shadowRoot.querySelector('#delete-policy-dialog').hide();
        this.notification.text = _text('resourcePolicy.SuccessfullyDeleted');
        this.notification.show();
        this.refresh();
      } else if (delete_keypair_resource_policy.msg) {
        this.shadowRoot.querySelector('#delete-policy-dialog').hide();
        this.notification.text = PainKiller.relieve(delete_keypair_resource_policy.msg);
        this.notification.show();
        this.refresh();
      }
    })
      .catch((err) => {
        console.log(err);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      });
  }

  /**
   * Set a textEl value according to toggle checkbox checked state.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  _toggleCheckbox(e) {
    const checkEl = e.target;
    const checked = checkEl.checked;
    const textEl = checkEl.closest('div').querySelector('mwc-textfield');
    textEl.disabled = checked;
    if (!textEl.disabled) {
      if (textEl.value === '') {
        textEl.value = textEl.min ?? 0;
      }
    }
  }

  /**
   * Returns the number of decimal places of input value
   * 
   * @param {number} value 
   * @returns {number}
   */
  _countDecimals(value: number) {
    return value % 1 ? value.toString().split('.')[1].length : 0;
  }

  /**
  * Check validation of resource input.
  *
  * @param {Event} e - Dispatches from the native input event each time the input changes.
  */
  _validateResourceInput(e) {
    const textfield = e.target.closest('mwc-textfield');
    const checkboxEl = textfield.closest('div').querySelector('wl-label.unlimited');
    const checkbox = checkboxEl ? checkboxEl.querySelector('wl-checkbox') : null;

    if (textfield.classList.contains('discrete')) {
      textfield.value = Math.round(textfield.value);
    }

    if (!textfield.checkValidity()) {
      const decimal_point: number = (textfield.step) ? this._countDecimals(textfield.step) : 0;
      if (decimal_point > 0) {
        textfield.value = Math.min(textfield.value, (textfield.value < 0) ? textfield.min : textfield.max).toFixed(decimal_point);
      } else {
        textfield.value = Math.min(Math.round(textfield.value), (textfield.value < 0) ? textfield.min : textfield.max);
      }
    }

    // automatically check when textfield is min or max
    if (checkbox) {
      textfield.disabled = checkbox.checked = (textfield.value <= parseFloat(textfield.min)) || (textfield.value >= parseFloat(textfield.max));
      textfield.value = textfield.disabled ? textfield.min : textfield.value;
    }
  }

  _updateUnlimitedValue(value) {
    return ['-', 0, '0', 'Unlimited', Infinity, 'Infinity', BackendAIResourcePolicyList.MAX_INT32, Number.MAX_SAFE_INTEGER].includes(value) ? '' : value;
  }

  /**
  * Check validation of user input.
  *
  * @param {object} resource
  */
  _validateUserInput(resource) {
    if (resource.disabled) {
      resource.value = '';
    } else {
      if (resource.value === '') {
        resource.reportValidity();
        throw new Error(_text('resourcePolicy.CannotCreateResourcePolicy'));
      }
    }
  }

  _updateInputStatus(resource) {
    const textfield = resource;
    const maxIntUsingResources: string[] = ['concurrency-limit', 'container-per-session-limit', 'session-lifetime', 'vfolder-capacity-limit'];
    const maxBigIntUsingResources: string = 'idle-timeout';
    const checkbox = textfield.closest('div').querySelector('wl-checkbox');
    if (Number(textfield.value) === 0) {
      textfield.disabled = true;
      checkbox.checked = true;
    } else if (
      (maxIntUsingResources.includes(textfield.id) && textfield.value === BackendAIResourcePolicyList.MAX_INT32) ||
      (maxBigIntUsingResources.includes(textfield.id) && textfield.value === Number.MAX_SAFE_INTEGER)) {
      textfield.value = '';
      textfield.disabled = true;
      checkbox.checked = true;
    } else {
      textfield.disabled = false;
      checkbox.checked = false;
    }
  }

  /**
  * Returns human-readable value according to certain conditions
  *
  * @param {string} value - raw value
  * @param {boolean} enableUnitConvert - if true it enable unit conversion
  * @return if number then returns number, else if then string
  */
  _markIfUnlimited(value, enableUnitConvert = false) {
    if (['-', 0, '0', 'Unlimited', Infinity, 'Infinity', BackendAIResourcePolicyList.MAX_INT32, Number.MAX_SAFE_INTEGER].includes(value)) {
      return '∞';
    } else if (['NaN', NaN].includes(value)) {
      return '-';
    } else {
      return enableUnitConvert ? this._byteToGiB(value, 1) : value;
    }
  }

  _getResourceInfo() {
    this.cpu_resource = this.shadowRoot.querySelector('#cpu-resource');
    this.ram_resource = this.shadowRoot.querySelector('#ram-resource');
    this.gpu_resource = this.shadowRoot.querySelector('#gpu-resource');
    this.fgpu_resource = this.shadowRoot.querySelector('#fgpu-resource');
    this.concurrency_limit = this.shadowRoot.querySelector('#concurrency-limit');
    this.idle_timeout = this.shadowRoot.querySelector('#idle-timeout');
    this.container_per_session_limit = this.shadowRoot.querySelector('#container-per-session-limit');
    this.vfolder_capacity = this.shadowRoot.querySelector('#vfolder-capacity-limit');
    this.vfolder_max_limit = this.shadowRoot.querySelector('#vfolder-count-limit');
    if (this.enableSessionLifetime) {
      this.session_lifetime = this.shadowRoot.querySelector('#session-lifetime');
    }
  }

  /**
  * Get All Storage host information (superadmin-only)
  */
  _getAllStorageHostsInfo() {
    return globalThis.backendaiclient.vfolder.list_all_hosts().then((res) => {
      this.all_vfolder_hosts = res.allowed;
    }).catch((err) => {
      throw err;
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-resource-policy-list': BackendAIResourcePolicyList;
  }
}
