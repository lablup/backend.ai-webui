/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import {render} from 'lit-html';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/hardware-icons';
import '@polymer/iron-icons/av-icons';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';

import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
import '@vaadin/vaadin-icons/vaadin-icons';
import '@vaadin/vaadin-item/vaadin-item';
import 'weightless/button';
import 'weightless/icon';
import 'weightless/dialog';
import 'weightless/card';
import 'weightless/checkbox';
import 'weightless/label';

import '../plastics/lablup-shields/lablup-shields';

import {default as PainKiller} from './backend-ai-painkiller';
import {BackendAiStyles} from "./backend-ai-console-styles";
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
  @property({type: Object}) unlimited_resource_status = {
    cpu : Boolean,
    mem : Boolean,
    cuda_device : Boolean,
    cuda_shares : Boolean
  };
  @property({type: Boolean}) unlimited_container_per_session = false;
  @property({type: Boolean}) unlimited_idle_timeout = false;
  @property({type: Boolean}) unlimited_concurrency = false;
  @property({type: Array}) allowed_vfolder_hosts = [] as any;
  @property({type: String}) default_vfolder_host = '';
  @property({type: Object}) _boundResourceRenderer = this.resourceRenderer.bind(this);
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
          height: calc(100vh - 260px);
        }

        paper-item {
          height: 30px;
          --paper-item-min-height: 30px;
        }

        iron-icon {
          width: 16px;
          height: 16px;
          min-width: 16px;
          min-height: 16px;
          padding: 0;
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

        div.configuration iron-icon {
          padding-right: 5px;
        }

        wl-button.create-button {
          width: calc(100% - 40px);
        }

        paper-dialog paper-input {
          padding-left: 20px;
          padding-right: 20px;
        }

        paper-dialog h4 {
          margin: 10px 0 5px 0;
          font-weight: 400;
          font-size: 13px;
          padding-left: 20px;
          border-bottom: 1px solid #ccc;
        }

        wl-button.create-button {
          width: 335px;
          --button-bg: white;
          --button-bg-hover: var(--paper-green-100);
          --button-bg-active: var(--paper-green-600);
        }

        wl-label {
          width: 100%;
          min-width: 60px;
          font-size: 11px;
          --label-font-family	: Roboto, Noto, sans-serif;
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
          --input-padding-top-bottom : 0px;
          --input-font-family	: Roboto, Noto, sans-serif;
        }

        wl-checkbox {
          --checkbox-size : 10px;
          --checkbox-border-radius : 2px;
          --checkbox-bg-checked	: var(--paper-green-800);
          --checkbox-checkmark-stroke-color : var(--paper-lime-100);
          --checkbox-color-checked : var(--paper-green-800);
          }
        }

      `];
  }

  render() {
    // language=HTML
    return html`
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Resource Policy list"
                   .items="${this.resourcePolicy}">
        <vaadin-grid-column width="40px" flex-grow="0" header="#" .renderer="${this._indexRenderer}"></vaadin-grid-column>
        <vaadin-grid-column resizable>
          <template class="header">
            <vaadin-grid-sorter path="name">Name</vaadin-grid-sorter>
          </template>
          <template>
            <div class="layout horizontal center flex">
              <div>[[item.name]]</div>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column width="150px" resizable header="Resources" .renderer="${this._boundResourceRenderer}">
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">
            <vaadin-grid-sorter path="max_concurrent_sessions">Concurrency</vaadin-grid-sorter>
          </template>
          <template>
            <div>[[item.max_concurrent_sessions]]
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">
            <vaadin-grid-sorter path="max_containers_per_session">Cluster size</vaadin-grid-sorter>
          </template>
          <template>
            <div>[[item.max_containers_per_session]]</div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">Storage Nodes</template>
          <template>
            <div class="layout horizontal center flex">
              <div class="vertical start layout">
                <div>[[item.allowed_vfolder_hosts]]
                </div>
              </div>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable header="Control" .renderer="${this._boundControlRenderer}">
        </vaadin-grid-column>

      </vaadin-grid>
      <wl-dialog id="modify-policy-dialog" fixed backdrop blockscrolling>
        <wl-card elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Update resource policy</span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <form id="login-form">
            <fieldset>
              <paper-input type="text" name="new_policy_name" id="id_new_policy_name" label="Policy Name"
                           required
                           error-message="Policy name only accepts letters and numbers" style="width:100%;"></paper-input>
              <h4>Resource Policy</h4>
              <div class="horizontal center layout">
                  <div class="vertical layout" style="width:75px; margin: 0px 10px 0px 0px;">
                    <wl-label>CPU</wl-label>
                    <wl-textfield id="cpu-resource" type="number" @change="${(e) =>this._validateResourceInput(e)}" ?disabled="${this.unlimited_resource_status['cpu']}"></wl-textfield>
                      <wl-label class="unlimited">
                        <wl-checkbox @change="${(e) =>this._toggleCheckbox(e)}" style="border-width: 1px;" ?checked="${this.unlimited_resource_status['cpu']}"></wl-checkbox>
                        Unlimited
                      </wl-label>
                  </div>
                  <div class="vertical layout" style="width:75px; margin: 0px 10px 0px 10px;">
                    <wl-label>RAM(GB)</wl-label>
                    <wl-textfield id="ram-resource" type="number" @change="${(e) =>this._validateResourceInput(e)}" ?disabled="${this.unlimited_resource_status['mem']}"></wl-textfield>
                    <wl-label class="unlimited">
                      <wl-checkbox @change="${(e) =>this._toggleCheckbox(e)}" style="border-width: 1px;" ?checked="${this.unlimited_resource_status['mem']}"></wl-checkbox>
                      Unlimited
                    </wl-label>
                  </div>
                  <div class="vertical layout" style="width:75px; margin: 0px 10px 0px 10px;">
                    <wl-label>GPU</wl-label>
                    <wl-textfield id="gpu-resource" type="number" @change="${(e) =>this._validateResourceInput(e)}" ?disabled="${this.unlimited_resource_status['cuda_device']}"></wl-textfield>
                    <wl-label class="unlimited">
                      <wl-checkbox @change="${(e) =>this._toggleCheckbox(e)}" style="border-width: 1px;" ?checked="${this.unlimited_resource_status['cuda_device']}"></wl-checkbox>
                      Unlimited
                    </wl-label>
                  </div>
                  <div class="vertical layout" style="width:75px; margin: 0px 0px 0px 10px;">
                    <wl-label>fgpu</wl-label>
                    <wl-textfield id="fgpu-resource" type="number" @change="${(e) =>this._validateResourceInput(e)}" ?disabled="${this.unlimited_resource_status['cuda_shares']}"></wl-textfield>
                    <wl-label class="unlimited">
                      <wl-checkbox @change="${(e) =>this._toggleCheckbox(e)}" style="border-width: 1px;" ?checked="${this.unlimited_resource_status['cuda_shares']}"></wl-checkbox>
                      Unlimited
                    </wl-label>
                  </div>
              </div>
                <h4>Sessions</h4>
              <div class="horizontal center layout">
                <div class="vertical left layout" style="width: 110px;">
                    <wl-label>Container per session</wl-label>
                    <wl-textfield id="container-per-session-limit" type="number" @change="${(e) =>this._validateResourceInput(e)}" ?disabled="${this.unlimited_container_per_session}"></wl-textfield>
                    <wl-label class="unlimited">
                      <wl-checkbox @change="${(e) =>this._toggleCheckbox(e)}" style="border-width: 1px;" ?checked="${this.unlimited_container_per_session}"></wl-checkbox>
                      Unlimited
                    </wl-label>
                  </div>
                  <div class="vertical left layout" style="width: 110px; margin: 0px 15px;">
                    <wl-label>Idle timeout (sec.)</wl-label>
                    <wl-textfield id="idle-timeout" type="number" @change="${(e) =>this._validateResourceInput(e)}" ?disabled="${this.unlimited_idle_timeout}"></wl-textfield>
                    <wl-label class="unlimited">
                      <wl-checkbox @change="${(e) =>this._toggleCheckbox(e)}" style="border-width: 1px;" ?checked="${this.unlimited_idle_timeout}"></wl-checkbox>
                      Unlimited
                    </wl-label>
                  </div>
                  <div class="vertical left layout" style="width: 110px;"> 
                      <wl-label>Concurrent Jobs</wl-label>
                      <wl-textfield id="concurrency-limit" type="number" @change="${(e) =>this._validateResourceInput(e)}" ?disabled="${this.unlimited_concurrency}"></wl-textfield>
                      <wl-label class="unlimited">
                        <wl-checkbox @change="${(e) =>this._toggleCheckbox(e)}" style="border-width: 1px;" ?checked="${this.unlimited_concurrency}"></wl-checkbox>
                        Unlimited
                      </wl-label>
                  </div>
              </div>
              <h4>Folders</h4>
              <div class="horizontal center layout">
                <div class="vertical layout" style="width: 110px;">
                <paper-dropdown-menu id="allowed_vfolder-hosts" label="Allowed hosts">
                  <paper-listbox slot="dropdown-content" selected="0">
                    ${this.allowed_vfolder_hosts.map(item => html`
                      <paper-item value="${item}" style="margin: 0px 0px 1px 0px;">${item}</paper-item>
                    `)}
                  </paper-listbox>
                </paper-dropdown-menu>
                </div>
                <div class="vertical layout" style="width: 110px; margin: 0px 15px;">
                  <wl-label class="folders">Capacity</wl-label>
                  <wl-textfield id="vfolder-capacity-limit" type="number" @change="${(e) =>this._validateResourceInput(e)}"></wl-textfield>
                </div>
                <div class="vertical layout" style="width: 110px;">
                  <wl-label class="folders">Max.#</wl-label>
                  <wl-textfield id="vfolder-count-limit" type="number" @change="${(e) =>this._validateResourceInput(e)}"></wl-textfield>
                </div>
              </div>

              <br/><br/>
              <wl-button class="fg blue create-button" id="create-policy-button" type="button"
                outlined @click="${() => this._modifyResourcePolicy()}">
                <wl-icon>add</wl-icon>
                Update
              </wl-button>

            </fieldset>
          </form>
        </wl-card>
      </wl-dialog>
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

  _hideDialog(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-dialog');
    dialog.hide();
  }

  resourceRenderer(root, column?, rowData?) {
    render(
      html`
        <div class="layout horizontal wrap center">
          <div class="layout horizontal configuration">
            <iron-icon class="fg green" icon="hardware:developer-board"></iron-icon>
            <span>${this._markIfUnlimited(rowData.item.total_resource_slots.cpu)}</span>
            <span class="indicator">cores</span>
          </div>
          <div class="layout horizontal configuration">
            <iron-icon class="fg green" icon="hardware:memory"></iron-icon>
            <span>${this._markIfUnlimited(rowData.item.total_resource_slots.mem)}</span>
            <span class="indicator">GB</span>
          </div>
        </div>
        <div class="layout horizontal wrap center">
        ${rowData.item.total_resource_slots['cuda_device'] ?
        html`
          <div class="layout horizontal configuration">
            <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
            <span>${this._markIfUnlimited(rowData.item.total_resource_slots.cuda_device)}</span>
            <span class="indicator">GPU</span>
          </div>
` : html``}
        ${rowData.item.total_resource_slots['cuda_shares'] ?
        html`
          <div class="layout horizontal configuration">
            <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
            <span>${this._markIfUnlimited(rowData.item.total_resource_slots.cuda_shares)}</span>
            <span class="indicator">fGPU</span>
          </div>
` : html``}
        </div>
        <div class="layout horizontal wrap center">
          <div class="layout horizontal configuration">
            <iron-icon class="fg green" icon="icons:cloud-queue"></iron-icon>
            <span>${this._markIfUnlimited(rowData.item.max_vfolder_size)}</span>
            <span class="indicator">GB</span>
          </div>
          <div class="layout horizontal configuration">
            <iron-icon class="fg green" icon="icons:folder"></iron-icon>
            <span>${this._markIfUnlimited(rowData.item.max_vfolder_count)}</span>
            <span class="indicator">Folders</span>
          </div>
        </div>
      `, root
    );
  }

  controlRenderer(root, column?, rowData?) {
    render(
      html`
        <div id="controls" class="layout horizontal flex center"
             .policy-name="${rowData.item.name}">
        ${this.is_admin ? html`
              <paper-icon-button class="fg green controls-running" icon="settings"
                                 @click="${(e) => this._launchResourcePolicyDialog(e)}"></paper-icon-button>
                                 ` : html``}
        </div>
    `, root
    );
  }

  firstUpdated() {
    this.notification = window.lablupNotification;
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    if (typeof window.backendaiclient === "undefined" || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._refreshPolicyData();
        this.is_admin = window.backendaiclient.is_admin;
      }, true);
    } else { // already connected
      this._refreshPolicyData();
      this.is_admin = window.backendaiclient.is_admin;
    }
  }

  _launchResourcePolicyDialog(e) {
    this.updateCurrentPolicyToDialog(e);
    this.shadowRoot.querySelector('#modify-policy-dialog').show();
  }

  updateCurrentPolicyToDialog(e) {
    const controls = e.target.closest('#controls');
    const policyName = controls['policy-name'];
    let resourcePolicies = window.backendaiclient.utils.gqlToObject(this.resourcePolicy, 'name');
    let resourcePolicy = resourcePolicies[policyName];
    this.shadowRoot.querySelector('#id_new_policy_name').value = policyName;
    this.shadowRoot.querySelector('#cpu-resource').value = resourcePolicy.total_resource_slots.cpu;
    this.shadowRoot.querySelector('#gpu-resource').value = resourcePolicy.total_resource_slots.gpu;
    this.shadowRoot.querySelector('#fgpu-resource').value = resourcePolicy.total_resource_slots.fgpu;
    this.shadowRoot.querySelector('#ram-resource').value = resourcePolicy.total_resource_slots['mem'];
    
    this.shadowRoot.querySelector('#concurrency-limit').value = resourcePolicy.max_concurrent_sessions;
    this.shadowRoot.querySelector('#container-per-session-limit').value = resourcePolicy.max_containers_per_session;
    this.shadowRoot.querySelector('#vfolder-count-limit').value = resourcePolicy.max_vfolder_count;
    this.shadowRoot.querySelector('#vfolder-capacity-limit').value = resourcePolicy.max_vfolder_size;
    this.shadowRoot.querySelector('#idle-timeout').value = resourcePolicy.idle_timeout;
    this.shadowRoot.querySelector('#allowed_vfolder-hosts').value = resourcePolicy.allowed_vfolder_hosts[0]; /* TODO: multiple vfolder hosts */

    Object.keys(resourcePolicy.total_resource_slots).map( (resource_name) => {
      if (resourcePolicy.total_resource_slots[resource_name] === 'Unlimited') {
        this.unlimited_resource_status[resource_name] = true;
      } else {
        this.unlimited_resource_status[resource_name] = false;
      }
    });

    if (resourcePolicy.max_concurrent_sessions === 0) {
      this.unlimited_concurrency = true;
    } else {
      this.unlimited_concurrency = false;
    }
    if (resourcePolicy.max_containers_per_session === 0) {
      this.unlimited_container_per_session = true;
    } else {
      this.unlimited_container_per_session = false;
    }
    if (resourcePolicy.idle_timeout === 0) {
      this.unlimited_idle_timeout = true;
    } else {
      this.unlimited_idle_timeout = false;
    }
    
  }

  _refreshPolicyData() {
    return window.backendaiclient.resourcePolicy.get().then((response) => {
      let rp = response.keypair_resource_policies;
      //let resourcePolicy = window.backendaiclient.utils.gqlToObject(rp, 'name');
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
          policy['total_resource_slots'].mem = parseFloat(window.backendaiclient.utils.changeBinaryUnit(policy['total_resource_slots'].mem, 'g'));
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
        this.notification.show(true);
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
    let cpu_resource = this.shadowRoot.querySelector('#cpu-resource');
    let ram_resource = this.shadowRoot.querySelector('#ram-resource');
    let gpu_resource = this.shadowRoot.querySelector('#gpu-resource');
    let fgpu_resource = this.shadowRoot.querySelector('#fgpu-resource');
    let vfolder_hosts: Array<object> = [];
    vfolder_hosts.push(this.shadowRoot.querySelector('#allowed_vfolder-hosts').value);
    if (!cpu_resource.disabled || cpu_resource.value !== '') {
      total_resource_slots['cpu'] = cpu_resource.value;
    }
    if (!ram_resource.disabled || ram_resource.value !== '') {
      total_resource_slots['mem'] = ram_resource.value + 'g';
    } 
    if (!gpu_resource.disabled || gpu_resource.value !== '') {
      total_resource_slots['cuda.device'] = parseInt(gpu_resource.value).toString();
    } 
    if (!fgpu_resource.disabled || fgpu_resource.value !== '') {
      total_resource_slots['cuda.shares'] = parseFloat(fgpu_resource.value).toString();
    } 
    let concurrency_limit = this.shadowRoot.querySelector('#concurrency-limit');
    let containers_per_session_limit = this.shadowRoot.querySelector('#container-per-session-limit');
    let idle_timeout = this.shadowRoot.querySelector('#idle-timeout');

    if (concurrency_limit.disabled || concurrency_limit.value === '') {
      concurrency_limit.value = 0;
    }
    if (containers_per_session_limit.disabled || containers_per_session_limit.value === '') {
      concurrency_limit.value = 0;
    }
    if (idle_timeout.disabled || idle_timeout.value === '') {
      idle_timeout.value = 0;
    }

    let vfolder_count_limit = this.shadowRoot.querySelector('#vfolder-count-limit').value;
    let vfolder_capacity_limit = this.shadowRoot.querySelector('#vfolder-capacity-limit').value;
    let input = {
      'default_for_unspecified': 'UNLIMITED',
      'total_resource_slots': JSON.stringify(total_resource_slots),
      'max_concurrent_sessions': parseInt(concurrency_limit.value),
      'max_containers_per_session': parseInt(containers_per_session_limit.value),
      'idle_timeout': parseInt(idle_timeout.value),
      'max_vfolder_count': vfolder_count_limit,
      'max_vfolder_size': vfolder_capacity_limit,
      'allowed_vfolder_hosts': vfolder_hosts
    };
    return input;
  }

  _modifyResourcePolicy() {
    let name = this.shadowRoot.querySelector('#id_new_policy_name').value;
    let input = this._readResourcePolicyInput();

    window.backendaiclient.resourcePolicy.mutate(name, input)
      .then(({modify_keypair_resource_policy}) => {
        if (modify_keypair_resource_policy.ok) {
          this.shadowRoot.querySelector('#modify-policy-dialog').hide();
          this.notification.text = "Resource policy successfully updated.";
          this.notification.show();
          this.refresh();
        }
      }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.shadowRoot.querySelector('#modify-policy-dialog').hide();
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true);
      }
    });
  }

  _deleteKey(e) {
    const controls = e.target.closest('#controls');
    const accessKey = controls.accessKey;
    window.backendaiclient.keypair.delete(accessKey).then(response => {
      this.refresh();
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true);
      }
    });
  }

  _toggleCheckbox(e) {
    const checkEl = e.target;
    console.log(checkEl);
    const checked = checkEl.checked;
    const wlTextEl = checkEl.closest('div').querySelector('wl-textfield');
    console.log(wlTextEl);
    wlTextEl.disabled = checked;
  }

  _validateResourceInput(e) {
    const resource_name = e.target.closest('wl-textfield');
    if (resource_name.value < 0) {
      resource_name.value = 0;
    }
  }

  _markIfUnlimited(value) {
    if (['-', 0, 'Unlimited', Infinity, 'Infinity'].includes(value)) {
      return '∞';
    } else if (['NaN', NaN].includes(value)) {
      return '-';
    } else {
      return value;
    }
  }
}


declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-resource-policy-list": BackendAIResourcePolicyList;
  }
}

