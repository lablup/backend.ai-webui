/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import {render} from 'lit-html';
import '@material/mwc-textfield/mwc-textfield';
import '@material/mwc-button/mwc-button';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
import '@vaadin/vaadin-icons/vaadin-icons';
import '@vaadin/vaadin-item/vaadin-item';
import 'weightless/button';
import 'weightless/icon';
import 'weightless/card';
import 'weightless/checkbox';
import 'weightless/label';

import './backend-ai-dialog';
import '../plastics/lablup-shields/lablup-shields';

import {default as PainKiller} from './backend-ai-painkiller';
import {BackendAiStyles} from "./backend-ai-general-styles";
import {IronFlex, IronFlexAlignment} from "../plastics/layout/iron-flex-layout-classes";

@customElement("backend-ai-resource-policy-list")
export default class BackendAIResourcePolicyList extends BackendAIPage {
  @property({type: Boolean}) visible = false;
  @property({type: Object}) keypairs = {};
  @property({type: Object}) resourcePolicy = {};
  @property({type: Object}) keypairInfo = {};
  @property({type: Boolean}) is_admin = false;
  @property({type: Boolean}) active = false;
  @property({type: String}) condition = 'active';
  @property({type: Object}) cpu_resource = {};
  @property({type: Object}) ram_resource = {};
  @property({type: Object}) gpu_resource = {};
  @property({type: Object}) fgpu_resource = {};
  @property({type: Object}) concurrency_limit = {};
  @property({type: Object}) idle_timeout = {};
  @property({type: Object}) vfolder_capacity = {};
  @property({type: Object}) vfolder_max_limit= {};
  @property({type: Object}) container_per_session_limit = {};
  @property({type: Array}) allowed_vfolder_hosts = [];
  @property({type: String}) default_vfolder_host = '';
  @property({type: Array}) resource_policy_names = Array();
  @property({type: String}) current_policy_name = '';
  @property({type: Number}) selectAreaHeight;
  @property({type: Object}) _boundResourceRenderer = this.resourceRenderer.bind(this);
  @property({type: Object}) _boundConcurrencyRenderer = this.concurrencyRenderer.bind(this);
  @property({type: Object}) _boundControlRenderer = this.controlRenderer.bind(this);

  constructor() {
    super();
  }

  static get styles() {
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

        wl-button.create-button {
          width: 330px;
          --button-bg: white;
          --button-bg-hover: var(--paper-green-100);
          --button-bg-active: var(--paper-green-600);
        }

        wl-label {
          width: 100%;
          min-width: 60px;
          font-size: 10px; // 11px;
          --label-font-family: Roboto, Noto, sans-serif;
        }

        wl-label.folders {
          margin: 3px 0px 7px 0px;
        }

        wl-label.unlimited {
          margin: 4px 0px 0px 0px;
        }

        wl-list-item {
          width: 100%;
        }

        wl-textfield {
          width: 100%;
          --input-state-color-invalid: red;
          --input-padding-top-bottom: 0px;
          --input-font-family: Roboto, Noto, sans-serif;
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

        mwc-button, mwc-button[unelevated] {
          background-image: none;
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-on-theme-primary: var(--general-button-background-color);
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
      `];
  }

  render() {
    // language=HTML
    return html`
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Resource Policy list"
                   .items="${this.resourcePolicy}">
        <vaadin-grid-column width="40px" flex-grow="0" header="#" text-align="center" .renderer="${this._indexRenderer}"></vaadin-grid-column>
        <vaadin-grid-column resizable>
          <template class="header">
            <vaadin-grid-sorter path="name">${_t("resourcePolicy.Name")}</vaadin-grid-sorter>
          </template>
          <template>
            <div class="layout horizontal center flex">
              <div>[[item.name]]</div>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column width="150px" resizable header="${_t("resourcePolicy.Resources")}" .renderer="${this._boundResourceRenderer}">
        </vaadin-grid-column>

        <vaadin-grid-column resizable header="${_t("resourcePolicy.Concurrency")}" .renderer="${this._boundConcurrencyRenderer}">
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">
            <vaadin-grid-sorter path="max_containers_per_session">${_t("resourcePolicy.ClusterSize")}</vaadin-grid-sorter>
          </template>
          <template>
            <div>[[item.max_containers_per_session]]</div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">${_t("resourcePolicy.StorageNodes")}</template>
          <template>
            <div class="layout horizontal center flex">
              <div class="vertical start layout">
                <div>[[item.allowed_vfolder_hosts]]
                </div>
              </div>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable header="${_t("general.Control")}" .renderer="${this._boundControlRenderer}">
        </vaadin-grid-column>

      </vaadin-grid>
      <backend-ai-dialog id="modify-policy-dialog" fixed backdrop blockscrolling narrowLayout>
        <span slot="title">${_t("resourcePolicy.UpdateResourcePolicy")}</span>
        <div slot="content">
          <mwc-textfield id="id_new_policy_name" label="${_t("resourcePolicy.PolicyName")}" disabled></mwc-textfield>
          <h4>${_t("resourcePolicy.ResourcePolicy")}</h4>
          <div class="horizontal center layout distancing">
            <div class="vertical layout" style="margin: 0 10px 0 0;">
              <wl-label>CPU</wl-label>
              <wl-textfield class="discrete" id="cpu-resource" type="number" max="512"
                            @change="${(e) => this._validateResourceInput(e)}"></wl-textfield>
                <wl-label class="unlimited">
                  <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}" style="border-width: 1px;"></wl-checkbox>
                  ${_t("resourcePolicy.Unlimited")}
                </wl-label>
            </div>
            <div class="vertical layout" style="margin: 0px 10px 0px 10px;">
              <wl-label>RAM(GB)</wl-label>
              <wl-textfield id="ram-resource" type="number" max="1024"
                            @change="${(e) => this._validateResourceInput(e)}"></wl-textfield>
              <wl-label class="unlimited">
                <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}" style="border-width: 1px;"></wl-checkbox>
                ${_t("resourcePolicy.Unlimited")}
              </wl-label>
            </div>
            <div class="vertical layout" style="margin: 0px 10px 0px 10px;">
              <wl-label>GPU</wl-label>
              <wl-textfield id="gpu-resource" type="number" max="64"
                            @change="${(e) => this._validateResourceInput(e)}"></wl-textfield>
              <wl-label class="unlimited">
                <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}" style="border-width: 1px;"></wl-checkbox>
                ${_t("resourcePolicy.Unlimited")}
              </wl-label>
            </div>
            <div class="vertical layout" style="margin: 0px 0px 0px 10px;">
              <wl-label>fGPU</wl-label>
              <wl-textfield id="fgpu-resource" type="number" max="256"
                            @change="${(e) => this._validateResourceInput(e)}"></wl-textfield>
              <wl-label class="unlimited">
                <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}" style="border-width: 1px;"></wl-checkbox>
                ${_t("resourcePolicy.Unlimited")}
              </wl-label>
            </div>
          </div>
          <h4>${_t("resourcePolicy.Sessions")}</h4>
          <div class="horizontal center layout distancing">
            <div class="vertical left layout">
                <wl-label>${_t("resourcePolicy.ContainerPerSession")}</wl-label>
                <wl-textfield class="discrete" id="container-per-session-limit" type="number" max="100"
                    @change="${(e) => this._validateResourceInput(e)}"></wl-textfield>
                <wl-label class="unlimited">
                  <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}" style="border-width: 1px;"></wl-checkbox>
                  ${_t("resourcePolicy.Unlimited")}
                </wl-label>
              </div>
              <div class="vertical left layout" style="margin: 0px 15px;">
                <wl-label>${_t("resourcePolicy.IdleTimeoutSec")}</wl-label>
                <wl-textfield class="discrete" id="idle-timeout" type="number" max="15552000"
                    @change="${(e) => this._validateResourceInput(e)}"></wl-textfield>
                <wl-label class="unlimited">
                  <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}" style="border-width: 1px;"></wl-checkbox>
                  ${_t("resourcePolicy.Unlimited")}
                </wl-label>
              </div>
              <div class="vertical left layout">
                  <wl-label>${_t("resourcePolicy.ConcurrentJobs")}</wl-label>
                  <wl-textfield class="discrete" id="concurrency-limit" type="number"  max="100"
                      @change="${(e) => this._validateResourceInput(e)}"></wl-textfield>
                  <wl-label class="unlimited">
                    <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}" style="border-width: 1px;"></wl-checkbox>
                   ${_t("resourcePolicy.Unlimited")}
                  </wl-label>
              </div>
          </div>
          <h4 style="margin-bottom:0px;">${_t("resourcePolicy.Folders")}</h4>
          <div class="vertical center layout distancing" id="dropdown-area">
            <mwc-select id="allowed_vfolder-hosts" label="${_t("resourcePolicy.AllowedHosts")}" style="width:100%;"
              @opened="${() => this._controlHeightByVfolderHostCount(true)}"
              @closed="${() => this._controlHeightByVfolderHostCount()}">
              ${this.allowed_vfolder_hosts.map(item => html`
                <mwc-list-item class="owner-group-dropdown"
                               id="${item}"
                               value="${item}">
                  ${item}
                </mwc-list-item>
              `)}
            </mwc-select>
            <div class="horizontal layout">
              <div class="vertical layout" style="margin-right: 10px;">
                <wl-label class="folders">${_t("resourcePolicy.Capacity")}(GB)</wl-label>
                <wl-textfield id="vfolder-capacity-limit" type="number" max="1024"
                    @change="${(e) => this._validateResourceInput(e)}"></wl-textfield>
                <wl-label class="unlimited">
                  <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}" style="border-width: 1px;"></wl-checkbox>
                  ${_t("resourcePolicy.Unlimited")}
                </wl-label>
              </div>
              <div class="vertical layout" style="margin-left: 10px;">
                <wl-label class="folders">${_t("credential.Max#")}</wl-label>
                <wl-textfield id="vfolder-count-limit" type="number" max="50"
                    @change="${(e) => this._validateResourceInput(e)}"></wl-textfield>
              </div>
            </div>
          </div>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout distancing">
          <mwc-button
              unelevated
              outlined
              id="create-policy-button"
              icon="check"
              label="${_t("button.Update")}"
              style="width:100%;"
              @click="${() => this._modifyResourcePolicy()}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="delete-policy-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t("dialog.title.LetsDouble-Check")}</span>
        <div slot="content">
          <p>${_t("resourcePolicy.AboutToDeleteResourcePolicy")}</p>
          <p style="text-align:center;color:blue;">${this.current_policy_name}</p>
          <p>${_t("dialog.warning.CannotBeUndone")} ${_t("dialog.ask.DoYouWantToProceed")}</p>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
                class="operation"
                label="${_t("button.Cancel")}"
                @click="${(e) => this._hideDialog(e)}"></mwc-button>
            <mwc-button
                unelevated
                class="operation"
                label="${_t("button.Okay")}"
                @click="${() => this._deleteResourcePolicy()}"></mwc-button>
        </div>
      </backend-ai-dialog>
    `;
  }

  _indexRenderer(root, column, rowData) {
    let idx = rowData.index + 1;
    render(
      html`
        <div>${idx}</div>
      `,
      root
    );
  }

  resourceRenderer(root, column?, rowData?) {
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
            <span>${this._markIfUnlimited(rowData.item.max_vfolder_size)}</span>
            <span class="indicator">GB</span>
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
    render(
      html`
        <div>${rowData.item.max_concurrent_sessions === 1000000 ? '∞' : rowData.item.max_concurrent_sessions}</div>
    `, root
    );
  }

  controlRenderer(root, column?, rowData?) {
    render(
      html`
        <div id="controls" class="layout horizontal flex center"
             .policy-name="${rowData.item.name}">
        ${this.is_admin ? html`
              <wl-button fab flat inverted class="fg green controls-running" icon="settings"
                                 @click="${(e) => this._launchResourcePolicyDialog(e)}"><wl-icon>settings</wl-icon></wl-button>
                                 ` : html``}
        ${this.is_admin ? html`
              <wl-button fab flat inverted class="fg red controls-running" icon="delete"
                                 @click="${(e) => this._openDeleteResourcePolicyListDialog(e)}"><wl-icon>delete</wl-icon></wl-button>
                                 ` : html``}
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
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._refreshPolicyData();
        this._getResourceInfo();
        this.is_admin = globalThis.backendaiclient.is_admin;
        this._getResourceInfo();
      }, true);
    } else { // already connected
      this._refreshPolicyData();
      this._getResourceInfo();
      this.is_admin = globalThis.backendaiclient.is_admin;
      this._getResourceInfo();
    }
  }

  _launchResourcePolicyDialog(e) {
    this.updateCurrentPolicyToDialog(e);
    this.shadowRoot.querySelector('#modify-policy-dialog').show();
  }

  _openDeleteResourcePolicyListDialog(e) {
    this.updateCurrentPolicyToDialog(e);
    this.shadowRoot.querySelector('#delete-policy-dialog').show();
  }

  updateCurrentPolicyToDialog(e) {
    const controls = e.target.closest('#controls');
    const policyName = controls['policy-name'];
    let resourcePolicies = globalThis.backendaiclient.utils.gqlToObject(this.resourcePolicy, 'name');
    this.resource_policy_names = Object.keys(resourcePolicies);
    let resourcePolicy = resourcePolicies[policyName];
    this.shadowRoot.querySelector('#id_new_policy_name').value = policyName;
    this.current_policy_name = policyName;
    this.cpu_resource['value'] = resourcePolicy.total_resource_slots['cpu'];
    this.ram_resource['value'] = resourcePolicy.total_resource_slots['mem'];
    this.gpu_resource['value'] = resourcePolicy.total_resource_slots['cuda_device'];
    this.fgpu_resource['value'] = resourcePolicy.total_resource_slots['cuda_shares'];
    this.concurrency_limit['value'] = resourcePolicy.max_concurrent_sessions;
    this.idle_timeout['value'] = resourcePolicy.idle_timeout;
    this.container_per_session_limit['value'] = resourcePolicy.max_containers_per_session;
    this.vfolder_capacity['value'] = resourcePolicy.max_vfolder_size;
    this.allowed_vfolder_hosts = resourcePolicy.allowed_vfolder_hosts;

    this._updateInputStatus(this.cpu_resource);
    this._updateInputStatus(this.ram_resource);
    this._updateInputStatus(this.gpu_resource);
    this._updateInputStatus(this.fgpu_resource);
    this._updateInputStatus(this.concurrency_limit);
    this._updateInputStatus(this.idle_timeout);
    this._updateInputStatus(this.container_per_session_limit);
    this._updateInputStatus(this.vfolder_capacity);

    this.shadowRoot.querySelector('#vfolder-count-limit').value = resourcePolicy.max_vfolder_count;
    this.shadowRoot.querySelector('#vfolder-capacity-limit').value = resourcePolicy.max_vfolder_size;
    this.shadowRoot.querySelector('#allowed_vfolder-hosts').layout(true).then( ()=>{
      this.shadowRoot.querySelector('#allowed_vfolder-hosts').select(0);
      this.shadowRoot.querySelector('#allowed_vfolder-hosts').value = resourcePolicy.allowed_vfolder_hosts[0];
    });
    /* TODO: multiple vfolder hosts */
  }

  _refreshPolicyData() {
    return globalThis.backendaiclient.resourcePolicy.get().then((response) => {
      let rp = response.keypair_resource_policies;
      //let resourcePolicy = globalThis.backendaiclient.utils.gqlToObject(rp, 'name');
      return rp;
    }).then((response) => {
      let resourcePolicies = response;
      Object.keys(resourcePolicies).map((objectKey, index) => {
        var policy = resourcePolicies[objectKey];
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
    }).catch(err => {
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

  _readResourcePolicyInput() {
    let total_resource_slots = {};
    let vfolder_hosts: Array<object> = [];
    vfolder_hosts.push(this.shadowRoot.querySelector('#allowed_vfolder-hosts').value);

    try {
      this._validateUserInput(this.cpu_resource);
      this._validateUserInput(this.ram_resource);
      this._validateUserInput(this.gpu_resource);
      this._validateUserInput(this.fgpu_resource);
      this._validateUserInput(this.concurrency_limit);
      this._validateUserInput(this.idle_timeout);
      this._validateUserInput(this.container_per_session_limit);
      this._validateUserInput(this.vfolder_capacity);
      this._validateUserInput(this.vfolder_max_limit);
    } catch (err) {
      throw err;
    }

    total_resource_slots['cpu'] = this.cpu_resource['value'];
    total_resource_slots['mem'] = this.ram_resource['value'] + 'g';
    total_resource_slots['cuda.device'] = parseInt(this.gpu_resource['value']);
    total_resource_slots['cuda.shares'] = parseFloat(this.fgpu_resource['value']);

    this.concurrency_limit['value'] = this.concurrency_limit['value'] === '' ? 1000000 : parseInt(this.concurrency_limit['value']);
    this.idle_timeout['value'] = this.idle_timeout['value'] === '' ? 0 : parseInt(this.idle_timeout['value']);
    this.container_per_session_limit['value'] = this.container_per_session_limit['value'] === '' ? 0 : parseInt(this.container_per_session_limit['value']);
    this.vfolder_capacity['value'] = this.vfolder_capacity['value'] === '' ? 0 : parseInt(this.vfolder_capacity['value']);
    this.vfolder_max_limit['value'] = this.vfolder_max_limit['value'] === '' ? 0 : parseInt(this.vfolder_max_limit['value']);

    Object.keys(total_resource_slots).map((resource) => {
      if (isNaN(parseFloat(total_resource_slots[resource]))) {
        delete total_resource_slots[resource];
      }
    });

    let input = {
      'default_for_unspecified': 'UNLIMITED',
      'total_resource_slots': JSON.stringify(total_resource_slots),
      'max_concurrent_sessions': this.concurrency_limit['value'],
      'max_containers_per_session': this.container_per_session_limit['value'],
      'idle_timeout': this.idle_timeout['value'],
      'max_vfolder_count': this.vfolder_max_limit['value'],
      'max_vfolder_size': this.vfolder_capacity['value'],
      'allowed_vfolder_hosts': vfolder_hosts
    };
    return input;
  }

  _modifyResourcePolicy() {
    try {
      let input = this._readResourcePolicyInput();
      globalThis.backendaiclient.resourcePolicy.mutate(this.current_policy_name, input)
        .then(({modify_keypair_resource_policy}) => {
          if (modify_keypair_resource_policy.ok) {
            this.shadowRoot.querySelector('#modify-policy-dialog').hide();
            this.notification.text = _text("resourcePolicy.SuccessfullyUpdated");
            this.notification.show();
            this.refresh();
          } else if (modify_keypair_resource_policy.msg) {
            this.shadowRoot.querySelector('#modify-policy-dialog').hide();
            this.notification.text = PainKiller.relieve(modify_keypair_resource_policy.msg);
            this.notification.show();
            this.refresh();
          }
        })
        .catch(err => {
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
    let name = this.current_policy_name;
    globalThis.backendaiclient.resourcePolicy.delete(name).then(({delete_keypair_resource_policy}) => {
      if (delete_keypair_resource_policy.ok) {
        this.shadowRoot.querySelector('#delete-policy-dialog').hide();
        this.notification.text = _text("resourcePolicy.SuccessfullyDeleted");
        this.notification.show();
        this.refresh();
      } else if (delete_keypair_resource_policy.msg) {
        this.shadowRoot.querySelector('#delete-policy-dialog').hide();
        this.notification.text = PainKiller.relieve(delete_keypair_resource_policy.msg);
        this.notification.show();
        this.refresh();
      }
    })
    .catch(err => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });

  }

  _toggleCheckbox(e) {
    const checkEl = e.target;
    const checked = checkEl.checked;
    const wlTextEl = checkEl.closest('div').querySelector('wl-textfield');
    wlTextEl.disabled = checked;
    if (!wlTextEl.disabled) {
      if (wlTextEl.value === '') {
        wlTextEl.value = 0;
      }
    }
  }

  _validateResourceInput(e) {
    const textfield = e.target.closest('wl-textfield');
    const checkbox_el = textfield.closest('div').querySelector('.unlimited');
    let checkbox;
    if (checkbox_el) {
      checkbox = checkbox_el.querySelector('wl-checkbox');
    } else {
      checkbox = null;
    }

    if (textfield.className === 'discrete' || !textfield.valid) {
      textfield.value = Math.round(textfield.value);
    }

    if (textfield.value <= 0) {
      // concurrency job and container-per-session limit must be upper than 0.
      textfield.value = ((textfield.id === 'concurrency-limit') || (textfield.id === 'container-per-session-limit')) ? 1 : 0;
    }
    if (textfield.min && textfield.value < textfield.min) {
      textfield.value = textfield.min;
    }
    if (textfield.max && textfield.value > textfield.max) {
      textfield.value = textfield.max;
    }

    if (textfield.value === '') {
      try {
        if (!checkbox || !checkbox['checked']) {
          textfield['required'] = true;
          textfield.focus();
          throw {"message": _text('resourcePolicy.CannotCreateResourcePolicy')};
        } else {
          textfield['required'] = false;
          textfield.value = '';
        }
      } catch (err) {
        this.notification.text = err.message;
        this.notification.show();
      }
    }
  }


  _validateUserInput(resource) {
    if (resource.disabled) {
      resource.value = '';
    } else {
      if (resource.value === '') {
        throw {"message": _text('resourcePolicy.CannotCreateResourcePolicy')};
      }
    }
  }

  _updateInputStatus(resource) {
    let textfield = resource;
    let checkbox = textfield.closest('div').querySelector('wl-checkbox');
    if (textfield.value === '' || textfield.value === "0") {
      textfield.disabled = true;
      checkbox.checked = true;
    } else if (textfield.id === 'concurrency-limit' && textfield.value === "1000000") {
      textfield.disabled = true;
      checkbox.checked = true;
    } else {
      textfield.disabled = false;
      checkbox.checked = false;
    }
  }

  _markIfUnlimited(value) {
    if (['-', 0, '0', 'Unlimited', Infinity, 'Infinity'].includes(value)) {
      return '∞';
    } else if (['NaN', NaN].includes(value)) {
      return '-';
    } else {
      return value;
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
  }

  /**
   *
   * Expand or Shrink the dialog height by the number of items in the dropdown.
   *
   * @param isOpened
   */
  _controlHeightByVfolderHostCount(isOpened = false) {
    if (!isOpened) {
      this.shadowRoot.querySelector('#dropdown-area').style.height = this.selectAreaHeight;
      return;
    }
    let itemCount = this.shadowRoot.querySelector('#allowed_vfolder-hosts').items.length;
    let actualHeight = this.shadowRoot.querySelector('#dropdown-area').offsetHeight;
    if (itemCount > 0) {
    this.shadowRoot.querySelector('#dropdown-area').style.height = (actualHeight + itemCount * 14) +'px';
    }
  }

}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-resource-policy-list": BackendAIResourcePolicyList;
  }
}

