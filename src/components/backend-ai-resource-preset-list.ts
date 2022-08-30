/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html, render} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {BackendAIPage} from './backend-ai-page';
import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column';
import '@vaadin/vaadin-icons/vaadin-icons';
import '@vaadin/vaadin-item/vaadin-item';

import '@material/mwc-textfield';
import '@material/mwc-button/mwc-button';

import 'weightless/button';
import 'weightless/card';
import 'weightless/icon';

import './backend-ai-dialog';
import './backend-ai-list-status';
import '../plastics/lablup-shields/lablup-shields';
import {default as PainKiller} from './backend-ai-painkiller';
import {BackendAiStyles} from './backend-ai-general-styles';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';
import BackendAIListStatus from './backend-ai-list-status';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type TextField = HTMLElementTagNameMap['mwc-textfield'];
type BackendAIDialog = HTMLElementTagNameMap['backend-ai-dialog'];
type BackendAIListStatus = HTMLElementTagNameMap['backend-ai-list-status'];

@customElement('backend-ai-resource-preset-list')
class BackendAiResourcePresetList extends BackendAIPage {
  @property({type: Array}) resourcePolicy = {};
  @property({type: Boolean}) is_admin = false;
  @property({type: Boolean}) active = false;
  @property({type: Boolean}) gpu_allocatable = false;
  @property({type: String}) gpuAllocationMode = 'device';
  @property({type: String}) condition = '';
  @property({type: String}) presetName = '';
  @property({type: Object}) resourcePresets;
  @property({type: String}) listCondition = 'loading';
  @property({type: Array}) _boundResourceRenderer = this.resourceRenderer.bind(this);
  @property({type: Array}) _boundControlRenderer = this.controlRenderer.bind(this);
  @query('#create-preset-name') createPresetNameInput!: TextField;
  @query('#create-cpu-resource') createCpuResourceInput!: TextField;
  @query('#create-ram-resource') createRamResourceInput!: TextField;
  @query('#create-gpu-resource') createGpuResourceInput!: TextField;
  @query('#create-fgpu-resource') createFGpuResourceInput!: TextField;
  @query('#create-shmem-resource') createSharedMemoryResourceInput!: TextField;
  @query('#cpu-resource') cpuResourceInput!: TextField;
  @query('#ram-resource') ramResourceInput!: TextField;
  @query('#gpu-resource') gpuResourceInput!: TextField;
  @query('#fgpu-resource') fgpuResourceInput!: TextField;
  @query('#shmem-resource') sharedMemoryResourceInput!: TextField;
  @query('#id-preset-name') presetNameInput!: TextField;
  @query('#create-preset-dialog') createPresetDialog!: BackendAIDialog;
  @query('#modify-template-dialog') modifyTemplateDialog!: BackendAIDialog;
  @query('#delete-resource-preset-dialog') deleteResourcePresetDialog!: BackendAIDialog;
  @query('#list-status') private _listStatus!: BackendAIListStatus;

  constructor() {
    super();
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
        }

        wl-button > wl-icon {
          --icon-size: 24px;
          padding: 0;
        }

        wl-icon {
          --icon-size: 16px;
          padding: 0;
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

        mwc-textfield {
          width: 100%;
          --mdc-theme-primary: #242424;
          --mdc-text-field-fill-color: transparent;
        }

        mwc-textfield.yellow {
          --mdc-theme-primary: var(--paper-yellow-600) !important;
        }

        mwc-button, mwc-button[unelevated] {
          background-image: none;
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-theme-on-primary: var(--general-button-color);
          --mdc-typography-font-family: var(--general-font-family);
        }

        h4 {
          font-weight: 200;
          font-size: 14px;
          margin: 0px;
          padding: 5px 15px 5px 20px;
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

  resourceRenderer(root, column?, rowData?) {
    render(
      html`
        <div class="layout horizontal wrap center">
          <div class="layout horizontal configuration">
            <wl-icon class="fg green">developer_board</wl-icon>
            <span>${this._markIfUnlimited(rowData.item.resource_slots.cpu)}</span>
            <span class="indicator">${_t('general.cores')}</span>
          </div>
          <div class="layout horizontal configuration">
            <wl-icon class="fg green">memory</wl-icon>
            <span>${this._markIfUnlimited(rowData.item.resource_slots.mem_gb)}</span>
            <span class="indicator">GB</span>
          </div>
        </div>
        <div class="layout horizontal wrap center">
        ${rowData.item.resource_slots['cuda.device'] ?
    html`
          <div class="layout horizontal configuration">
            <wl-icon class="fg green">view_module</wl-icon>
            <span>${this._markIfUnlimited(rowData.item.resource_slots['cuda.device'])}</span>
            <span class="indicator">GPU</span>
          </div>
        ` : html``}
        ${rowData.item.resource_slots['cuda.shares'] ?
    html`
          <div class="layout horizontal configuration">
            <wl-icon class="fg green">view_module</wl-icon>
            <span>${this._markIfUnlimited(rowData.item.resource_slots['cuda.shares'])}</span>
            <span class="indicator">GPU</span>
          </div>
        ` : html``}
        ${rowData.item.shared_memory ?
    html`
          <div class="layout horizontal configuration">
            <wl-icon class="fg blue">memory</wl-icon>
            <span>${rowData.item.shared_memory_gb}</span>
            <span class="indicator">GB</span>
          </div>
        ` : html``}
        </div>
      `, root
    );
  }

  controlRenderer(root, column?, rowData?) {
    render(
      html`
        <div id="controls" class="layout horizontal flex center"
            .preset-name="${rowData.item.name}">
          ${this.is_admin ? html`
            <wl-button class="fg blue controls-running" fab flat inverted
              @click="${(e) => this._launchResourcePresetDialog(e)}">
                <wl-icon>settings</wl-icon>
            </wl-button>
            <wl-button class="fg red controls-running" fab flat inverted
              @click="${(e) => this._launchDeleteResourcePresetDialog(e)}">
                <wl-icon>delete</wl-icon>
            </wl-button>
          ` : html``}
        </div>
      `, root
    );
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

  render() {
    // language=HTML
    return html`
      <div style="margin:0px;">
        <h4 class="horizontal flex center center-justified layout">
          <span>${_t('resourcePreset.ResourcePresets')}</span>
          <span class="flex"></span>
          <mwc-button raised id="add-resource-preset" icon="add" label="${_t('resourcePreset.CreatePreset')}" @click="${() => this._launchPresetAddDialog()}"></mwc-button>
        </h4>
        <div class="list-wrapper">
          <vaadin-grid theme="row-stripes column-borders compact" height-by-rows aria-label="Resource Policy list"
                      .items="${this.resourcePresets}">
            <vaadin-grid-column width="40px" flex-grow="0" header="#" text-align="center" .renderer="${this._indexRenderer}"></vaadin-grid-column>
            <vaadin-grid-sort-column resizable path="name" header="${_t('resourcePreset.Name')}">
            </vaadin-grid-sort-column>
            <vaadin-grid-column width="150px" resizable header="${_t('resourcePreset.Resources')}" .renderer="${this._boundResourceRenderer}">
            </vaadin-grid-column>
            <vaadin-grid-column resizable header="${_t('general.Control')}" .renderer="${this._boundControlRenderer}">
            </vaadin-grid-column>
          </vaadin-grid>
          <backend-ai-list-status id="list-status" statusCondition="${this.listCondition}" message="${_text('resourcePreset.NoResourcePresetToDisplay')}"></backend-ai-list-status>
        </div>
      </div>
      <backend-ai-dialog id="modify-template-dialog" fixed backdrop blockscrolling narrowLayout>
        <span slot="title">${_t('resourcePreset.ModifyResourcePreset')}</span>
        <div slot="content">
          <form id="login-form">
            <fieldset>
              <mwc-textfield type="text" name="preset_name" class="modify" id="id-preset-name"
                          label="${_t('resourcePreset.PresetName')}"
                          auto-validate required
                          disabled
                          error-message="${_t('data.Allowslettersnumbersand-_dot')}"></mwc-textfield>
              <h4>${_t('resourcePreset.ResourcePreset')}</h4>
              <div class="horizontal center layout">
                <mwc-textfield id="cpu-resource" class="modify" type="number" label="CPU"
                    min="1" value="1" required validationMessage="${_t('resourcePreset.MinimumCPUUnit')}"></mwc-textfield>
                <mwc-textfield id="ram-resource" class="modify" type="number" label="${_t('resourcePreset.RAM')}"
                    min="1" value="1" required validationMessage="${_t('resourcePreset.MinimumMemUnit')}"></mwc-textfield>
              </div>
              <div class="horizontal center layout">
                <mwc-textfield id="gpu-resource" class="modify" type="number" label="GPU"
                    min="0" value="0" ?disabled=${this.gpuAllocationMode === 'fractional'}></mwc-textfield>
                <mwc-textfield id="fgpu-resource" class="modify" type="number" label="fGPU"
                    min="0" value="0" step="0.01" ?disabled=${this.gpuAllocationMode !== 'fractional'}></mwc-textfield>
              </div>
              <div class="horizontal center layout">
                <mwc-textfield id="shmem-resource" class="modify" type="number"
                    label="${_t('resourcePreset.SharedMemory')}" min="0" step="0.01"
                    validationMessage="${_t('resourcePreset.MinimumShmemUnit')}"></mwc-textfield>
              </div>
            </fieldset>
          </form>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout distancing">
          <mwc-button
              unelevated
              fullwidth
              icon="check"
              label="${_t('button.SaveChanges')}"
              @click="${() => this._modifyResourceTemplate()}">
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="create-preset-dialog" fixed backdrop blockscrolling narrowLayout>
        <span slot="title">${_t('resourcePreset.CreateResourcePreset')}</span>
        <div slot="content">
          <mwc-textfield
            type="text"
            name="preset_name"
            id="create-preset-name"
            class="create"
            label="Preset Name"
            auto-validate
            required
            maxLength="255"
            placeholder="${_t('maxLength.255chars')}"
            error-message="${_t('data.Allowslettersnumbersand-_')}"
          ></mwc-textfield>
          <h4>${_t('resourcePreset.ResourcePreset')}</h4>
          <div class="horizontal center layout">
            <mwc-textfield id="create-cpu-resource" class="create" type="number" label="CPU"
                min="1" value="1" required validationMessage="${_t('resourcePreset.MinimumCPUUnit')}"></mwc-textfield>
            <mwc-textfield id="create-ram-resource" class="create" type="number" label="${_t('resourcePreset.RAM')}"
                min="1" value="1" required validationMessage="${_t('resourcePreset.MinimumMemUnit')}"></mwc-textfield>
          </div>
          <div class="horizontal center layout">
            <mwc-textfield id="create-gpu-resource" class="create" type="number" label="GPU"
                min="0" value="0" ?disabled=${this.gpuAllocationMode === 'fractional'}></mwc-textfield>
            <mwc-textfield id="create-fgpu-resource" class="create" type="number" label="fGPU"
                min="0" value="0" step="0.01" ?disabled=${this.gpuAllocationMode !== 'fractional'}></mwc-textfield>
          </div>
          <div class="horizontal center layout">
            <mwc-textfield id="create-shmem-resource" class="create" type="number"
                label="${_t('resourcePreset.SharedMemory')}" min="0" step="0.01"
                validationMessage="${_t('resourcePreset.MinimumShmemUnit')}"></mwc-textfield>
          </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout distancing">
          <mwc-button
              unelevated
              fullwidth
              id="create-policy-button"
              icon="add"
              label="${_t('button.Add')}"
              @click="${this._createPreset}">
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="delete-resource-preset-dialog" fixed backdrop blockscrolling>
         <span slot="title">${_t('dialog.title.LetsDouble-Check')}</span>
         <div slot="content">
            <p>${_t('resourcePreset.AboutToDeletePreset')}</p>
            <p style="text-align:center;">${this.presetName}</p>
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
              @click="${() => this._deleteResourcePresetWithCheck()}"></mwc-button>
         </div>
      </backend-ai-dialog>
    `;
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    const textfields = this.shadowRoot?.querySelectorAll('mwc-textfield');
    textfields?.forEach((textfield) => {
      this._addInputValidator(textfield);
    });
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._refreshTemplateData();
        this.is_admin = globalThis.backendaiclient.is_admin;
      }, true);
    } else { // already connected
      this._refreshTemplateData();
      this.is_admin = globalThis.backendaiclient.is_admin;
      globalThis.backendaiclient.get_resource_slots()
        .then((res) => {
          this.gpu_allocatable = (Object.keys(res).length !== 2);
          if (Object.keys(res).includes('cuda.shares')) {
            this.gpuAllocationMode = 'fractional';
          } else {
            this.gpuAllocationMode = 'device';
          }
        });
    }
  }

  _launchPresetAddDialog() {
    this.createPresetDialog.show();
  }

  _launchResourcePresetDialog(e) {
    this.updateCurrentPresetToDialog(e);
    this.modifyTemplateDialog.show();
  }

  _launchDeleteResourcePresetDialog(e) {
    const controls = e.target.closest('#controls');
    const preset_name = controls['preset-name'];
    this.presetName = preset_name;
    this.deleteResourcePresetDialog.show();
  }

  _deleteResourcePresetWithCheck() {
    globalThis.backendaiclient.resourcePreset.delete(this.presetName).then((response) => {
      this.deleteResourcePresetDialog.hide();
      this.notification.text = _text('resourcePreset.Deleted');
      this.notification.show();
      this._refreshTemplateData();
    }).catch((err) => {
      console.log(err);
      if (err && err.message) {
        this.deleteResourcePresetDialog.hide();
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  updateCurrentPresetToDialog(e) {
    const controls = e.target.closest('#controls');
    const preset_name = controls['preset-name'];
    const resourcePresets = globalThis.backendaiclient.utils.gqlToObject(this.resourcePresets, 'name');
    const resourcePreset = resourcePresets[preset_name];
    // resourcePolicy['total_resource_slots'] = JSON.parse(resourcePolicy['total_resource_slots']);
    this.presetNameInput.value = preset_name;
    this.cpuResourceInput.value = resourcePreset.resource_slots.cpu;
    this.gpuResourceInput.value = 'cuda.device' in resourcePreset.resource_slots ? resourcePreset.resource_slots['cuda.device'] : '';
    this.fgpuResourceInput.value = 'cuda.shares' in resourcePreset.resource_slots ? resourcePreset.resource_slots['cuda.shares'] : '';
    this.ramResourceInput.value = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(resourcePreset.resource_slots['mem'], 'g')).toString();
    this.sharedMemoryResourceInput.value = resourcePreset.shared_memory ? parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(resourcePreset.shared_memory, 'g')).toFixed(2) : '';
  }

  _refreshTemplateData() {
    const param = {
      'group': globalThis.backendaiclient.current_group
    };
    this.listCondition = 'loading';
    this._listStatus?.show();
    return globalThis.backendaiclient.resourcePreset.check(param).then((response) => {
      const resourcePresets = response.presets;
      Object.keys(resourcePresets).map((objectKey, index) => {
        const preset = resourcePresets[objectKey];
        preset.resource_slots.mem_gb = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(preset.resource_slots.mem, 'g'));
        if (preset.shared_memory) {
          preset.shared_memory_gb = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(preset.shared_memory, 'g')).toFixed(2);
        } else {
          preset.shared_memory_gb = null;
        }
      });
      this.resourcePresets = resourcePresets;
      if (this.resourcePresets.length == 0) {
        this.listCondition = 'no-data';
      } else {
        this._listStatus?.hide();
      }
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
    this._refreshTemplateData();
  }

  _isActive() {
    return this.condition === 'active';
  }

  _readResourcePresetInput() {
    const wrapper = (v) => v !== undefined && v.includes('Unlimited') ? 'Infinity' : v;
    const cpu = wrapper(this.cpuResourceInput.value);
    const mem = wrapper(this.ramResourceInput.value + 'g');
    const gpu_resource = wrapper(this.gpuResourceInput.value);
    const fgpu_resource = wrapper(this.fgpuResourceInput.value);
    let sharedMemory = this.sharedMemoryResourceInput.value;
    if (sharedMemory) sharedMemory = sharedMemory + 'g';

    const resource_slots = {cpu, mem};
    if (gpu_resource !== undefined && gpu_resource !== null && gpu_resource !== '' && gpu_resource !== '0') {
      resource_slots['cuda.device'] = parseInt(gpu_resource);
    }
    if (fgpu_resource !== undefined && fgpu_resource !== null && fgpu_resource !== '' && fgpu_resource !== '0') {
      resource_slots['cuda.shares'] = parseFloat(fgpu_resource);
    }

    const input = {
      resource_slots: JSON.stringify(resource_slots),
      shared_memory: sharedMemory
    };

    return input;
  }

  _modifyResourceTemplate() {
    // continue only if all input is valid
    if (!this._checkFieldValidity('modify')) {
      return;
    }
    const name = this.presetNameInput.value;
    const wrapper = (v) => v !== undefined && v.includes('Unlimited') ? 'Infinity' : v;
    const mem = wrapper(this.ramResourceInput.value + 'g');
    if (!name) {
      this.notification.text = _text('resourcePreset.NoPresetName');
      this.notification.show();
      return;
    }
    const input = this._readResourcePresetInput();
    if (parseInt(input.shared_memory) >= parseInt(mem)) {
      this.notification.text = _text('resourcePreset.MemoryShouldBeLargerThanSHMEM');
      this.notification.show();
      return;
    }
    globalThis.backendaiclient.resourcePreset.mutate(name, input).then((response) => {
      this.modifyTemplateDialog.hide();
      this.notification.text = _text('resourcePreset.Updated');
      this.notification.show();
      this._refreshTemplateData();
    }).catch((err) => {
      console.log(err);
      if (err && err.message) {
        this.modifyTemplateDialog.hide();
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  _deleteKey(e) {
    const controls = e.target.closest('#controls');
    const accessKey = controls.accessKey;
    globalThis.backendaiclient.keypair.delete(accessKey).then((response) => {
      this.refresh();
    }).catch((err) => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  _findKeyItem(element) {
    return element.access_key = this;
  }

  _elapsed(start, end) {
    const startDate = new Date(start);
    let endDate: Date;
    if (this.condition == 'active') {
      endDate = new Date();
    } else {
      endDate = new Date();
    }
    const seconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
    const days = Math.floor(seconds / 86400);
    return days;
  }

  _humanReadableTime(d: any) {
    d = new Date(d);
    return d.toUTCString();
  }

  _indexFrom1(index) {
    return index + 1;
  }

  _markIfUnlimited(value) {
    if (['-', 0, 'Unlimited', Infinity, 'Infinity'].includes(value)) {
      return '∞';
    } else {
      return value;
    }
  }

  /**
   * Check Validity of input value in a dialog
   *
   * @param {string} prefix - same prefix used in input field of each dialog
   * (e.g. 'create' : create-preset-dialog, 'modify' : modify-template-dialog)
   * @return {boolean} true if valid. false otherwise.
   */
  _checkFieldValidity(prefix = '') {
    const query = 'mwc-textfield[class^="'.concat(prefix).concat('"]');
    const createDialogTextfields = this.shadowRoot?.querySelectorAll<TextField>(query) as NodeListOf<TextField>;
    let isValid = true;
    for (const textfield of Array.from(createDialogTextfields)) {
      isValid = textfield.checkValidity();
      if (!isValid) {
        return textfield.checkValidity();
      }
    }
    return isValid;
  }

  _createPreset() {
    // continue only if all input is valid
    if (!this._checkFieldValidity('create')) {
      return;
    }
    const wrapper = (v) => {
      v = v.toString();
      return typeof (v) !== 'undefined' && v.includes('Unlimited') ? 'Infinity' : v;
    };
    const preset_name = wrapper(this.createPresetNameInput.value);
    const cpu = wrapper(this.createCpuResourceInput.value);
    const mem = wrapper(this.createRamResourceInput.value + 'g');
    const gpu_resource = wrapper(this.createGpuResourceInput.value);
    const fgpu_resource = wrapper(this.createFGpuResourceInput.value);
    let sharedMemory = this.createSharedMemoryResourceInput.value;
    if (sharedMemory) sharedMemory = sharedMemory + 'g';
    if (!preset_name) {
      this.notification.text = _text('resourcePreset.NoPresetName');
      this.notification.show();
      return;
    }
    if (parseInt(sharedMemory) >= parseInt(mem)) {
      this.notification.text = _text('resourcePreset.MemoryShouldBeLargerThanSHMEM');
      this.notification.show();
      return;
    }

    const resource_slots = {cpu, mem};
    if (gpu_resource !== undefined && gpu_resource !== null && gpu_resource !== '' && gpu_resource !== '0') {
      resource_slots['cuda.device'] = parseInt(gpu_resource);
    }
    if (fgpu_resource !== undefined && fgpu_resource !== null && fgpu_resource !== '' && fgpu_resource !== '0') {
      resource_slots['cuda.shares'] = parseFloat(fgpu_resource);
    }

    const input = {
      resource_slots: JSON.stringify(resource_slots),
      shared_memory: sharedMemory
    };

    globalThis.backendaiclient.resourcePreset.add(preset_name, input)
      .then((res) => {
        this.createPresetDialog.hide();
        if (res.create_resource_preset.ok) {
          this.notification.text = _text('resourcePreset.Created');
          this.refresh();

          // reset values
          this.createPresetNameInput.value = '';
          this.createCpuResourceInput.value = '1';
          this.createRamResourceInput.value = '1';
          this.createGpuResourceInput.value = '0';
          this.createFGpuResourceInput.value = '0';
          this.createSharedMemoryResourceInput.value = '';
        } else {
          this.notification.text = PainKiller.relieve(res.create_resource_preset.msg);
        }
        this.notification.show();
      });
  }
}


declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-resource-preset-list': BackendAiResourcePresetList;
  }
}
