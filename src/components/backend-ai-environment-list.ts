/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';
import {render} from 'lit-html';

import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';
import '../plastics/lablup-shields/lablup-shields';
import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-selection-column';
import '@vaadin/vaadin-grid/vaadin-grid-filter-column';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
import './lablup-loading-spinner';
import './backend-ai-dialog';

import 'weightless/button';
import 'weightless/icon';
import 'weightless/select';
import 'weightless/textfield';
import 'weightless/label';

import {default as PainKiller} from "./backend-ai-painkiller";

/**
 Backend.AI Environment List

 @group Backend.AI Console
 @element backend-ai-environment-list
 */

@customElement("backend-ai-environment-list")
export default class BackendAIEnvironmentList extends BackendAIPage {
  @property({type: Array}) images = Array();
  @property({type: Array}) allowed_registries = Array();
  @property({type: Object}) _boundRequirementsRenderer = this.requirementsRenderer.bind(this);
  @property({type: Object}) _boundControlsRenderer = this.controlsRenderer.bind(this);
  @property({type: Object}) _boundCheckboxRenderer = this.checkboxRenderer.bind(this);
  @property({type: Object}) _boundInstallRenderer = this.installRenderer.bind(this);
  @property({type: Array}) servicePorts = Array();
  @property({type: Number}) selectedIndex = 0;
  @property({type: Object}) selectedIndices = Object();
  @property({type: Boolean}) _cuda_gpu_disabled = false;
  @property({type: Boolean}) _cuda_fgpu_disabled = false;
  @property({type: Boolean}) _rocm_gpu_disabled = false;
  @property({type: Boolean}) _tpu_disabled = false;
  @property({type: Object}) alias = Object();
  @property({type: Object}) spinner = Object();
  @property({type: Object}) indicator = Object();
  @property({type: Object}) installImageDialog = Object();
  @property({type: String}) installImageName = '';
  @property({type: Object}) installImageResource = Object();
  @property({type: Object}) selectedCheckbox = Object();
  @property({type: Object}) _grid = Object();

  constructor() {
    super();
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        vaadin-grid {
          border: 0;
          font-size: 14px;
          height: calc(100vh - 150px);
        }

        wl-button > wl-icon {
          --icon-size: 24px;
          padding: 0;
        }

        wl-icon {
          --icon-size: 16px;
          padding: 0;
        }

        wl-label {
          --label-font-size: 13px;
          --label-font-family: 'Ubuntu', 'Quicksand', Roboto;
          -webkit-border-radius: 3px;
          -moz-border-radius: 3px;
          border-radius: 3px;
          -moz-background-clip: padding;
          -webkit-background-clip: padding-box;
          background-clip: padding-box;
          border: 1px solid #ccc;
          background-color: #f9f9f9;
          padding: 0px 3px;
          display: inline-block;
          margin: 0px;
        }

        wl-label.installed {
          --label-color: #52595d;
        }

        wl-label.installing {
          --label-color: var(--paper-orange-700);
        }

        img.indicator-icon {
          width: 16px;
          height: 16px;
        }

        div.indicator,
        span.indicator {
          font-size: 9px;
          margin-right: 5px;
        }

        wl-button {
          --button-bg: var(--paper-orange-50);
          --button-bg-hover: var(--paper-orange-100);
          --button-bg-active: var(--paper-orange-600);
          --button-color: #242424;
          color: var(--paper-orange-900);
        }

        wl-button.operation {
          margin: auto 10px;
          padding: auto 10px;
        }

        backend-ai-dialog {
          --component-min-width: 350px;
        }

        backend-ai-dialog#modify-image-dialog wl-select,
        backend-ai-dialog#modify-image-dialog wl-textfield {
          margin-bottom: 20px;
        }

        wl-select, wl-textfield {
          --input-font-family: var(--general-font-family);
        }

        backend-ai-dialog wl-textfield {
          --input-font-size: 14px;
        }

        #modify-app-dialog {
          --component-height: 500px;
          --component-max-height: 550px;
          --component-min-width: 600px;
        }

        backend-ai-dialog vaadin-grid {
          margin: 0px 20px;
        }

        .gutterBottom {
          margin-bottom: 20px;
        }

        div.container {
          display: flex;
          flex-direction: column;
          padding: 0px 30px;
        }

        div.row {
          display: grid;
          grid-template-columns: 4fr 4fr 4fr 1fr;
          margin-bottom: 10px;
        }
      `];
  }

  /**
   * If value includes unlimited contents, mark as unlimited.
   *
   * @param value
   */
  _markIfUnlimited(value) {
    if (['-', 0, 'Unlimited', Infinity, 'Infinity'].includes(value)) {
      return '∞';
    } else {
      return value;
    }
  }

  /**
   * Hide a backend.ai dialog.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  _hideDialog(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('backend-ai-dialog');
    dialog.hide();
  }

  /**
   * Hide a dialog by id.
   *
   * @param id
   */
  _hideDialogById(id) {
    return this.shadowRoot.querySelector(id).hide();
  }

  /**
   * Display a dialog by id.
   *
   * @param id
   */
  _launchDialogById(id) {
    return this.shadowRoot.querySelector(id).show();
  }

  /**
   * Modify images of cpu, memory, cuda-gpu, cuda-fgpu, rocm-gpu and tpu.
   */
  modifyImage() {
    const cpu = this.shadowRoot.querySelector("#modify-image-cpu").value,
      mem = this.shadowRoot.querySelector("#modify-image-mem").value,
      gpu = this.shadowRoot.querySelector("#modify-image-cuda-gpu").value,
      fgpu = this.shadowRoot.querySelector("#modify-image-cuda-fgpu").value,
      rocm_gpu = this.shadowRoot.querySelector("#modify-image-rocm-gpu").value,
      tpu = this.shadowRoot.querySelector("#modify-image-tpu").value;

    const {resource_limits} = this.images[this.selectedIndex];

    let input = {};

    // TODO : index modification
    const mem_idx = this._cuda_gpu_disabled ? (this._cuda_fgpu_disabled ? 1 : 2) : (this._cuda_fgpu_disabled ? 2 : 3);
    if (cpu !== resource_limits[0].min) input["cpu"] = {"min": cpu};
    let memory = this._symbolicUnit(mem);
    if (memory !== resource_limits[mem_idx].min) input["mem"] = {"min": memory};

    if (!this._cuda_gpu_disabled && gpu !== resource_limits[1].min) input["cuda.device"] = {"min": gpu};
    if (!this._cuda_fgpu_disabled && fgpu !== resource_limits[2].min) input["cuda.shares"] = {"min": fgpu};
    if (!this._rocm_gpu_disabled && rocm_gpu !== resource_limits[3].min) input["rocm.device"] = {"min": rocm_gpu};
    if (!this._tpu_disabled && tpu !== resource_limits[4].min) input["tpu.device"] = {"min": tpu};

    const image = this.images[this.selectedIndex];

    if (Object.keys(input).length === 0) {
      this.notification.text = "No changes made";
      this.notification.show();
      this._hideDialogById("#modify-image-dialog");
      return;
    }

    globalThis.backendaiclient.image.modifyResource(image.registry, image.name, image.tag, input)
      .then(res => {
        const ok = res.reduce((acc, cur) => acc && cur.result === "ok", true);

        if (ok) {
          this._getImages();
          this.requestUpdate();
          this.notification.text = "Successfully modified";
        } else {
          this.notification.text = "Problem occurred";
        }

        this.notification.show();
        this._hideDialogById("#modify-image-dialog");
      })
  }

  // /**
  //  * Open the selected image.
  //  *
  //  * @param {object} index - Selected image's digest.
  //  */
  // openInstallImageDialog(digest) {
  //   this.selectedIndices = this._grid.selectedItems;
  //   console.log(this._grid);
  //   console.dir(this._grid);
  //   console.log(this.selectedIndices);
  //   this.selectedIndex = this.images.findIndex(image => image.digest === digest);
  //   let chosenImage = this.images[this.selectedIndex];
  //   this.installImageName = chosenImage['registry'] + '/' + chosenImage['name'] + ':' + chosenImage['tag'];
  //   this.installImageResource = {};
  //   chosenImage['resource_limits'].forEach(elm => {
  //     this.installImageResource[elm['key'].replace("_", ".")] = elm.min;
  //   });
  //   this.installImageDialog.show();
  // }

  openInstallImageDialog() {
    this.selectedIndices = this._grid.selectedItems;
    
  }

  async _installImage() {
    this.installImageDialog.hide();
    if ('cuda.device' in this.installImageResource && 'cuda.shares' in this.installImageResource) {
      this.installImageResource['gpu'] = 0;
      this.installImageResource['fgpu'] = this.installImageResource['cuda.shares'];
    } else if ('cuda.device' in this.installImageResource) {
      this.installImageResource['gpu'] = this.installImageResource['cuda.device'];
    }
    // Add 256m to run the image.
    if (this.installImageResource['mem'].endsWith('g')) {
      this.installImageResource['mem'] = this.installImageResource['mem'].replace('g', '.5g');
    } else if (this.installImageResource['mem'].endsWith('m')) {
      this.installImageResource['mem'] = Number(this.installImageResource['mem'].slice(0, -1)) + 256 + 'm';
    }
    this.installImageResource['domain'] = globalThis.backendaiclient._config.domainName;
    this.installImageResource['group_name'] = globalThis.backendaiclient.current_group;

    this.notification.text = "Installing " + this.installImageName + ". It takes time so have a cup of coffee!";
    this.notification.show();
    let indicator = await this.indicator.start('indeterminate');
    indicator.set(10, 'Downloading...');
    globalThis.backendaiclient.get_resource_slots().then((response) => {
      let results = response;
      if ('cuda.device' in results && 'cuda.shares' in results) { // Can be possible after 20.03
        if ('fgpu' in this.installImageResource && 'gpu' in this.installImageResource) { // Keep fgpu only.
          delete this.installImageResource['gpu'];
          delete this.installImageResource['cuda.device'];
        }
      } else if ('cuda.device' in results) { // GPU mode
        delete this.installImageResource['fgpu'];
        delete this.installImageResource['cuda.shares'];
      } else if ('cuda.shares' in results) { // Fractional GPU mode
        delete this.installImageResource['gpu'];
        delete this.installImageResource['cuda.device'];
      }
      return globalThis.backendaiclient.image.install(this.installImageName, this.installImageResource);
    }).then((response) => {
      indicator.set(100, 'Install finished.');
      indicator.end(1000);
      this._getImages();
    }).catch(err => {
      this._uncheckSelectedRow();
      this.notification.text = PainKiller.relieve(err.title);
      this.notification.detail = err.message;
      this.notification.show(true, err);
      indicator.set(100, _t('environment.DescProblemOccurred'));
      indicator.end(1000);
    });
  }

  /**
   * Render requirments such as cpu limit, memoty limit
   * cuda share limit, rocm device limit and tpu limit.
   *
   * @param {DOM element} root
   * @param {<vaadin-grid-column> element} column
   * @param {object} rowData
   */
  requirementsRenderer(root, column?, rowData?) {
    render(
      html`
          <div class="layout horizontal center flex">
            <div class="layout horizontal configuration">
              <wl-icon class="fg green">developer_board</wl-icon>
              <span>${rowData.item.cpu_limit_min}</span> ~
              <span>${this._markIfUnlimited(rowData.item.cpu_limit_max)}</span>
              <span class="indicator">${_t("general.cores")}</span>
            </div>
          </div>
          <div class="layout horizontal center flex">
            <div class="layout horizontal configuration">
              <wl-icon class="fg green">memory</wl-icon>
              <span>${rowData.item.mem_limit_min}</span> ~
              <span>${this._markIfUnlimited(rowData.item.mem_limit_max)}</span>
            </div>
          </div>
        ${rowData.item.cuda_device_limit_min ? html`
           <div class="layout horizontal center flex">
              <div class="layout horizontal configuration">
                <img class="indicator-icon fg green" src="/resources/icons/file_type_cuda.svg" />
                <span>${rowData.item.cuda_device_limit_min}</span> ~
                <span>${this._markIfUnlimited(rowData.item.cuda_device_limit_max)}</span>
                <span class="indicator">CUDA GPU</span>
              </div>
            </div>
            ` : html``}
        ${rowData.item.cuda_shares_limit_min ? html`
            <div class="layout horizontal center flex">
              <div class="layout horizontal configuration">
                <wl-icon class="fg green">apps</wl-icon>
                <span>${rowData.item.cuda_shares_limit_min}</span> ~
                <span>${this._markIfUnlimited(rowData.item.cuda_shares_limit_max)}</span>
                <span class="indicator">CUDA fGPU</span>
              </div>
            </div>
            ` : html``}
        ${rowData.item.rocm_device_limit_min ? html`
           <div class="layout horizontal center flex">
              <div class="layout horizontal configuration">
                <img class="indicator-icon fg green" src="/resources/icons/ROCm.png" />
                <span>${rowData.item.rocm_device_limit_min}</span> ~
                <span>${this._markIfUnlimited(rowData.item.rocm_device_limit_max)}</span>
                <span class="indicator">ROCm GPU</span>
              </div>
            </div>
            ` : html``}
        ${rowData.item.tpu_device_limit_min ? html`
           <div class="layout horizontal center flex">
              <div class="layout horizontal configuration">
                <img class="indicator-icon fg green" src="/resources/icons/tpu.svg" />
                <span>${rowData.item.tpu_device_limit_min}</span> ~
                <span>${this._markIfUnlimited(rowData.item.tpu_device_limit_max)}</span>
                <span class="indicator">TPU</span>
              </div>
            </div>
            ` : html``}

      `, root
    );
  }

  /**
   * Set resource limits to default value.
   *
   * @param {object} resource_limits
   */
  _setPulldownDefaults(resource_limits) {
    this._cuda_gpu_disabled = resource_limits.filter(e => e.key === "cuda_device").length === 0;
    this._cuda_fgpu_disabled = resource_limits.filter(e => e.key === "cuda_shares").length === 0;
    this._rocm_gpu_disabled = resource_limits.filter(e => e.key === "rocm_device").length === 0;
    this._tpu_disabled = resource_limits.filter(e => e.key === "tpu_device").length === 0;
    this.shadowRoot.querySelector("#modify-image-cpu").value = resource_limits[0].min;
    if (!this._cuda_gpu_disabled) {
      this.shadowRoot.querySelector("#modify-image-cuda-gpu").value = resource_limits[1].min;
    }
    if (!this._cuda_fgpu_disabled) {
      this.shadowRoot.querySelector("#modify-image-cuda-fgpu").value = resource_limits[2].min;
    }
    if (!this._rocm_gpu_disabled) {
      this.shadowRoot.querySelector("#modify-image-rocm-gpu").value = resource_limits[3].min;
    }
    if (!this._tpu_disabled) {
      this.shadowRoot.querySelector("#modify-image-tpu").value = resource_limits[4].min;
    }

    const mem_idx = this._cuda_gpu_disabled ? (this._cuda_fgpu_disabled ? 1 : 2) : (this._cuda_fgpu_disabled ? 2 : 3);
    this.shadowRoot.querySelector("#modify-image-mem").value = this._addUnit(resource_limits[mem_idx].min);
  }

  /**
   * Decode backend.ai service ports.
   */
  _decodeServicePort() {
    if (this.images[this.selectedIndex].labels["ai.backend.service-ports"] === "") {
      this.servicePorts = [];
    } else {
      this.servicePorts =
        this.images[this.selectedIndex].labels["ai.backend.service-ports"]
          .split(",")
          .map(e => {
            const sp = e.split(":");
            return {
              "app": sp[0],
              "protocol": sp[1],
              "port": sp[2]
            };
          });
    }
  }

  /**
   * Parse backend.ai service ports.
   */
  _parseServicePort() {
    const container = this.shadowRoot.querySelector("#modify-app-container");
    const rows = container.querySelectorAll(".row:not(.header)");

    const valid = row => Array.prototype.filter.call(
      row.querySelectorAll("wl-textfield"),
      (tf, idx) => tf.value === "" || (idx === 1 && !["http", "tcp", "pty"].includes(tf.value))
    ).length === 0;
    const encodeRow = row => Array.prototype.map.call(row.querySelectorAll("wl-textfield"), tf => tf.value).join(":");

    return Array.prototype.filter.call(rows, row => valid(row)).map(row => encodeRow(row)).join(",");
  }

  /**
   * Modify backend.ai service ports.
   */
  modifyServicePort() {
    const value = this._parseServicePort();
    const image = this.images[this.selectedIndex];
    globalThis.backendaiclient.image.modifyLabel(image.registry, image.name, image.tag, "ai.backend.service-ports", value)
      .then(({result}) => {
        if (result === "ok") {
          this.notification.text = _text("environment.DescServicePortModified");
        } else {
          this.notification.text = _text("dialog.ErrorOccurred");
        }
        this._getImages();
        this.requestUpdate();
        this._clearRows();
        this.notification.show();
        this._hideDialogById("#modify-app-dialog");
      })
  }

  /**
   * Render controllers.
   *
   * @param {DOM element} root
   * @param {<vaadin-grid-column> element} column
   * @param {object} rowData
   */
  controlsRenderer(root, column, rowData) {
    render(
      html`
        <div
          id="controls"
          class="layout horizontal flex center"
        >
          <wl-button fab flat inverted
            class="fg blue controls-running"
            @click=${() => {
        this.selectedIndex = rowData.index;
        this._setPulldownDefaults(this.images[this.selectedIndex].resource_limits);
        this._launchDialogById("#modify-image-dialog");
        this.requestUpdate();
      }}>
            <wl-icon>settings</wl-icon>
          </wl-button>
          <wl-button fab flat inverted
            class="fg pink controls-running"
            @click=${() => {
        if (this.selectedIndex !== rowData.index) this._clearRows();
        this.selectedIndex = rowData.index;
        this._decodeServicePort();
        this._launchDialogById("#modify-app-dialog");
        this.requestUpdate();
      }}>
            <wl-icon>apps</wl-icon>
          </wl-button>
        </div>
      `,
      root
    )
  }

  /**
   * Render an install dialog.
   *
   * @param {DOM element} root
   * @param {<vaadin-grid-column> element} column
   * @param {object} rowData
   */
  checkboxRenderer(root, column, rowData) {
    render(
      // language=HTML
      html`
        <div class="layout horizontal center center-justified" style="margin:0; padding:0;">
          <wl-checkbox id="${rowData.item.name}" style="--checkbox-size:12px;"
              @click="${(e) => {
                if (e.target.checked) {
                  this.selectedCheckbox =  e.target;
                }
              }}">
          </wl-checkbox>
        </div>
      `, root);
  }

/**
 * Render an installed tag for each image.
 * 
 * @param {DOM element} root 
 * @param {<vaadin-grid-column> element} column 
 * @param {object} rowData 
 */
  installRenderer(root, column, rowData) {
    render(
      // language=HTML
      html`
        <div class="layout horizontal center center-justified">
          ${rowData.item.installed ? html`<wl-label class="installed">installed</wl-label>` : html``}
        </div>
      `
    , root);
  }

  render() {
    // language=HTML
    return html`
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <div class="horizontal layout flex end-justified" style="margin:10px;">
        <wl-button outlined class="operation" id="install-image" @click="${this.openInstallImageDialog}">
          <wl-icon>get_app</wl-icon>
          Install
        </wl-button>
        <wl-button outlined class="operation" id="delete-image">
          <wl-icon>delete</wl-icon>
          Delete
        </wl-button>
      </div>
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Environments" id="testgrid" .items="${this.images}">
        <vaadin-grid-selection-column flex-grow="0" text-align="center" auto-select>
        </vaadin-grid-selection-column>
        <vaadin-grid-column path="installed" flex-grow="0" .renderer="${this._boundInstallRenderer}">
            <template class="header">
              <vaadin-grid-sorter path="installed">${_t('environment.Status')}</vaadin-grid-sorter>
            </template>
          </vaadin-grid-column>
        <vaadin-grid-filter-column path="registry" width="80px" resizable
            header="${_t('environment.Registry')}"></vaadin-grid-filter-column>
        <vaadin-grid-filter-column path="namespace" width="60px" resizable
            header="${_t('environment.Namespace')}"></vaadin-grid-filter-column>
        <vaadin-grid-filter-column path="lang" resizable
            header="${_t('environment.Language')}"></vaadin-grid-filter-column>
        <vaadin-grid-filter-column path="baseversion" resizable
            header="${_t('environment.Version')}"></vaadin-grid-filter-column>

        <vaadin-grid-column width="60px" resizable>
          <template class="header">${_t("environment.Base")}</template>
          <template>
            <template is="dom-repeat" items="[[ item.baseimage ]]">
              <lablup-shields app="" color="blue" description="[[item]]"></lablup-shields>
            </template>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column width="50px" resizable>
          <template class="header">${_t("environment.Constraint")}</template>
          <template>
            <template is="dom-if" if="[[item.additional_req]]">
              <lablup-shields app="" color="green" description="[[item.additional_req]]"></lablup-shields>
            </template>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-filter-column path="digest" resizable
            header="${_t('environment.Digest')}">
          <template>
            <div class="layout vertical">
              <span class="indicator monospace">[[item.digest]]</span>
            </div>
          </template>
        </vaadin-grid-filter-column>

        <vaadin-grid-column width="150px" flex-grow="0" resizable header="${_t("environment.ResourceLimit")}" .renderer="${this._boundRequirementsRenderer}">
        </vaadin-grid-column>
        <vaadin-grid-column resizable header="${_t("general.Control")}" .renderer=${this._boundControlsRenderer}>
        </vaadin-grid-column>
      </vaadin-grid>
      <backend-ai-dialog id="modify-image-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t("environment.ModifyImage")}</span>
        <div slot="content" style="margin: 0;">
              <div style="display: flex; flex-direction: column;">
                <div style="display: flex;">
                  <wl-select
                    label="CPU Core"
                    id="modify-image-cpu"
                    style="flex: 1"
                  >
                    ${[1, 2, 3, 4, 5, 6, 7, 8].map(item => html`
                      <option
                        value=${item}
                      >${item}</option>
                    `)}
                  </wl-select>
                  <wl-select
                    label="RAM"
                    id="modify-image-mem"
                    style="flex: 1"
                  >
                    ${["64MB", "128MB", "256MB", "512MB", "1GB", "2GB", "4GB", "8GB", "16GB", "32GB", "256GB", "512GB"].map(item => html`
                      <option
                        value=${item}
                      >${item}</option>
                    `)}
                  </wl-select>
                </div>
                <div style="display: flex;">
                  <wl-select
                    label="CUDA GPU"
                    id="modify-image-cuda-gpu"
                    style="flex: 1"
                    ?disabled=${this._cuda_gpu_disabled}
                  >
                    ${[0, 1, 2, 3, 4, 5, 6, 7].map(item => html`
                      <option
                        value=${item}
                      >${item}</option>
                    `)}
                  </wl-select>
                  <wl-select
                    label="CUDA fractional GPU"
                    id="modify-image-cuda-fgpu"
                    ?disabled=${this._cuda_fgpu_disabled}
                    style="flex: 1"
                  >
                    ${[0, 0.1, 0.2, 0.5, 1.0, 2.0].map(item => html`
                      <option
                        value=${item}
                      >${item}</option>
                    `)}
                  </wl-select>
                </div>
                <div style="display: flex;">
                  <wl-select
                    label="ROCm GPU"
                    id="modify-image-rocm-gpu"
                    style="flex: 1"
                    ?disabled=${this._rocm_gpu_disabled}
                  >
                    ${[0, 1, 2, 3, 4, 5, 6, 7].map(item => html`
                      <option
                        value=${item}
                      >${item}</option>
                    `)}
                  </wl-select>
                  <wl-select
                    label="TPU"
                    id="modify-image-tpu"
                    ?disabled=${this._tpu_disabled}
                    style="flex: 1"
                  >
                    ${[0, 1, 2].map(item => html`
                      <option
                        value=${item}
                      >${item}</option>
                    `)}
                  </wl-select>
                </div>
              </div>
              <wl-button
                class="fg orange create-button"
                outlined
                type="button"
                style="box-sizing: border-box; width: 100%"
                @click=${() => this.modifyImage()}
              >
                <wl-icon>check</wl-icon>
                ${_t("button.SaveChanges")}
              </wl-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="modify-app-dialog" fixed backdrop>
        <span slot="title">${_t("environment.ManageApps")}</span>
        <div slot="content" id="modify-app-container" class="container">
          <div class="row header">
            <div> ${_t("environment.AppName")} </div>
            <div> ${_t("environment.Protocol")} </div>
            <div> ${_t("environment.Port")} </div>
            <div> ${_t("environment.Action")} </div>
          </div>
          ${this.servicePorts.map((item, index) => html`
          <div class="row">
            <wl-textfield
              type="text"
              value=${item.app}
            ></wl-textfield>
            <wl-textfield
              type="text"
              value=${item.protocol}
            ></wl-textfield>
            <wl-textfield
              type="number"
              value=${item.port}
            ></wl-textfield>
            <wl-button
              fab flat
              class="fg pink"
              @click=${e => this._removeRow(e)}
            >
              <wl-icon>remove</wl-icon>
            </wl-button>
          </div>
          `)}
          <div class="row">
            <wl-textfield type="text"></wl-textfield>
            <wl-textfield type="text"></wl-textfield>
            <wl-textfield type="number"></wl-textfield>
            <wl-button
              fab flat
              class="fg pink"
              @click=${this._addRow}
            >
              <wl-icon>add</wl-icon>
            </wl-button>
          </div>
        </div>
        <wl-button slot="footer"
          class="fg orange"
          outlined
          type="button"
          style="box-sizing: border-box; width: 100%;"
          @click=${this.modifyServicePort}
        >
          <wl-icon>check</wl-icon>
          ${_t("button.Finish")}
        </wl-button>
      </backend-ai-dialog>
      <backend-ai-dialog id="install-image-dialog" fixed backdrop persistent>
        <span slot="title">Let's double-check</span>
        <div slot="content">
          <p>${_t("environment.DescDownloadImage")} <span style="color:blue;">${this.installImageName}</span></p>
          <p>${_t("environment.DescSignificantDownloadTime")} ${_t("dialog.ask.DoYouWantToProceed")}</p>
        </div>
        <div slot="footer" class="horizontal flex layout">
          <div class="flex"></div>
          <wl-button class="cancel" inverted flat
              @click="${(e) => {
      this._hideDialog(e)
      this._uncheckSelectedRow();
    }}">
            ${_t("button.Cancel")}
          </wl-button>
          <wl-button class="ok" @click="${() => this._installImage()}">${_t("button.Okay")}</wl-button>
        </div>
      </backend-ai-dialog>
    `;
  }

  /**
   * Remove a row in the environment list.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  _removeRow(e) {
    const path = e.composedPath();
    let i = 0;
    while (path[i].localName !== "div") i++;
    path[i].remove();
  }

  /**
   * Add a row to the environment list.
   */
  _addRow() {
    const container = this.shadowRoot.querySelector("#modify-app-container");
    const lastChild = container.children[container.children.length - 1];
    const div = this._createRow();
    container.insertBefore(div, lastChild);
  }

  /**
   * Create a row in the environment list.
   */
  _createRow() {
    const div = document.createElement("div");
    div.setAttribute("class", "row extra");

    const app = document.createElement("wl-textfield");
    app.setAttribute("type", "text");

    const protocol = document.createElement("wl-textfield");
    app.setAttribute("type", "text");

    const port = document.createElement("wl-textfield");
    app.setAttribute("type", "number");

    const button = document.createElement("wl-button");
    button.setAttribute("class", "fg pink");
    button.setAttribute("fab", "");
    button.setAttribute("flat", "");
    button.addEventListener("click", e => this._removeRow(e));

    const icon = document.createElement("wl-icon");
    icon.innerHTML = "remove";
    button.appendChild(icon);

    div.appendChild(port);
    div.appendChild(protocol);
    div.appendChild(app);
    div.appendChild(button);

    return div;
  }

  /**
   * Clear rows from the environment list.
   */
  _clearRows() {
    const container = this.shadowRoot.querySelector("#modify-app-container");
    const rows = container.querySelectorAll(".row");
    const lastRow = rows[rows.length - 1];

    lastRow.querySelectorAll("wl-textfield").forEach(tf => {
      tf.value = "";
    });
    container.querySelectorAll(".row.extra").forEach(e => {
      e.remove();
    });
  }

  /**
   * Deselect the selected row from the environment list.
   */
  _uncheckSelectedRow() {
    this.selectedCheckbox.checked = false;
  }

  firstUpdated() {
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this.indicator = globalThis.lablupIndicator;
    this.notification = globalThis.lablupNotification;
    this.installImageDialog = this.shadowRoot.querySelector('#install-image-dialog');

    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._getImages();
      }, true);

    } else { // already connected
      this._getImages();
    }
    this._grid = this.shadowRoot.querySelector('#testgrid');
    this._grid.addEventListener('sorter-changed', (e) => {
      this._refreshSorter(e)
    });
  }

  /**
   * Refresh the sorter.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  _refreshSorter(e) {
    let sorter = e.target;
    let sorterPath = sorter.path.toString();
    if (sorter.direction) {
      if (sorter.direction === 'asc') {
        this._grid.items.sort((a, b) => {
          return a[sorterPath] < b[sorterPath] ? -1 : a[sorterPath] > b[sorterPath] ? 1 : 0;
        });
      } else {
        this._grid.items.sort((a, b) => {
          return a[sorterPath] > b[sorterPath] ? -1 : a[sorterPath] < b[sorterPath] ? 1 : 0;
        });
      }
    }
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {

    }
  }

  /**
   * Get backend.ai client images.
   */
  _getImages() {
    this.spinner.show();

    globalThis.backendaiclient.domain.get(globalThis.backendaiclient._config.domainName, ['allowed_docker_registries']).then((response) => {
      this.allowed_registries = response.domain.allowed_docker_registries;
      return globalThis.backendaiclient.image.list(["name", "tag", "registry", "digest", "installed", "labels { key value }", "resource_limits { key min max }"], false, true);
    }).then((response) => {
      let images = response.images;
      let domainImages: any = [];
      images.forEach((image) => {
        if (this.allowed_registries.includes(image.registry)) {
          let tags = image.tag.split('-');
          if (tags[1] !== undefined) {
            image.baseversion = tags[0];
            image.baseimage = tags[1];
            if (tags[2] !== undefined) {
              image.additional_req = tags[2].toUpperCase();
            }
          } else {
            image.baseversion = image.tag;
          }
          let names = image.name.split('/');
          if (names[1] !== undefined) {
            image.namespace = names[0];
            image.lang = names.slice(1).join('');
          } else {
            image.namespace = '';
            image.lang = names[0];
          }
          let langs = image.lang.split('-');
          let baseimage = [this._humanizeName(image.baseimage)];
          if (langs[1] !== undefined) {
            image.lang = langs[1];
            baseimage.push(this._humanizeName(langs[0]));
            //image.baseimage = this._humanizeName(image.baseimage) + ', ' + this._humanizeName(langs[0]);
          }
          image.baseimage = baseimage;//this._humanizeName(image.baseimage);
          image.lang = this._humanizeName(image.lang);

          var resource_limit = image.resource_limits;
          resource_limit.forEach((resource) => {
            if (resource.max == 0) {
              resource.max = '∞';
            }
            if (resource.key == 'cuda.device') {
              resource.key = 'cuda_device';
            }
            if (resource.key == 'cuda.shares') {
              resource.key = 'cuda_shares';
            }
            if (resource.key == 'rocm.device') {
              resource.key = 'rocm_device';
            }
            if (resource.key == 'tpu.device') {
              resource.key = 'tpu_device';
            }
            image[resource.key + '_limit_min'] = this._addUnit(resource.min);
            image[resource.key + '_limit_max'] = this._addUnit(resource.max);
          });

          image.labels = image.labels.reduce((acc, cur) => ({...acc, [cur.key]: cur.value}), {});
          domainImages.push(image);
        }
      });
      //let image_keys = Object.keys(domainImages);
      //console.log(image_keys);
      //let sorted_images = {};
      //image_keys.sort();
      this.images = domainImages;
      this.spinner.hide();
    }).catch((err) => {
      console.log(err);
      if (typeof err.message !== 'undefined') {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
      } else {
        this.notification.text = PainKiller.relieve('Problem occurred during image metadata loading.');
      }
      this.notification.show(true, err);
      this.spinner.hide();
    });
  }

  /**
   * Add unit to the value.
   *
   * @param {string} value
   */
  _addUnit(value) {
    let unit = value.substr(-1);
    if (unit == 'm') {
      return value.slice(0, -1) + 'MB';
    }
    if (unit == 'g') {
      return value.slice(0, -1) + 'GB';
    }
    if (unit == 't') {
      return value.slice(0, -1) + 'TB';
    }
    return value;
  }

  /**
   * Change unit to symbol.
   *
   * @param {string} value
   */
  _symbolicUnit(value) {
    let unit = value.substr(-2);
    if (unit == 'MB') {
      return value.slice(0, -2) + 'm';
    }
    if (unit == 'GB') {
      return value.slice(0, -2) + 'g';
    }
    if (unit == 'TB') {
      return value.slice(0, -2) + 't';
    }
    return value;
  }

  /**
   * Humanize the value.
   *
   * @param {string} value
   */
  _humanizeName(value) {
    this.alias = {
      'python': 'Python',
      'tensorflow': 'TensorFlow',
      'pytorch': 'PyTorch',
      'lua': 'Lua',
      'r': 'R',
      'r-base': 'R',
      'julia': 'Julia',
      'rust': 'Rust',
      'cpp': 'C++',
      'gcc': 'GCC',
      'go': 'Go',
      'tester': 'Tester',
      'haskell': 'Haskell',
      'matlab': 'MATLAB',
      'sagemath': 'Sage',
      'texlive': 'TeXLive',
      'java': 'Java',
      'php': 'PHP',
      'octave': 'Octave',
      'nodejs': 'Node',
      'caffe': 'Caffe',
      'scheme': 'Scheme',
      'scala': 'Scala',
      'base': 'Base',
      'cntk': 'CNTK',
      'h2o': 'H2O.AI',
      'digits': 'DIGITS',
      'ubuntu-linux': 'Ubuntu Linux',
      'tf1': 'TensorFlow 1',
      'tf2': 'TensorFlow 2',
      'py3': 'Python 3',
      'py2': 'Python 2',
      'py27': 'Python 2.7',
      'py35': 'Python 3.5',
      'py36': 'Python 3.6',
      'py37': 'Python 3.7',
      'py38': 'Python 3.8',
      'py39': 'Python 3.9',
      'lxde': 'LXDE',
      'lxqt': 'LXQt',
      'xfce': 'XFCE',
      'gnome': 'GNOME',
      'kde': 'KDE',
      'ubuntu16.04': 'Ubuntu 16.04',
      'ubuntu18.04': 'Ubuntu 18.04',
      'ubuntu20.04': 'Ubuntu 20.04',
      'intel': 'Intel MKL',
      '2018': '2018',
      '2019': '2019',
      '2020': '2020',
      '2021': '2021',
      '2022': '2022',
      'rocm': 'GPU:ROCm',
      'cuda9': 'GPU:CUDA9',
      'cuda10': 'GPU:CUDA10',
      'cuda10.0': 'GPU:CUDA10',
      'cuda10.1': 'GPU:CUDA10.1',
      'cuda10.2': 'GPU:CUDA10.2',
      'cuda10.3': 'GPU:CUDA10.3',
      'cuda11': 'GPU:CUDA11',
      'cuda11.0': 'GPU:CUDA11',
      'miniconda': 'Miniconda',
      'anaconda2018.12': 'Anaconda 2018.12',
      'anaconda2019.12': 'Anaconda 2019.12',
      'alpine3.8': 'Alpine Linux 3.8',
      'ngc': 'NVidia GPU Cloud',
      'ff': 'Research Env.',
    };
    if (value in this.alias) {
      return this.alias[value];
    } else {
      return value;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-environment-list": BackendAIEnvironmentList;
  }
}
