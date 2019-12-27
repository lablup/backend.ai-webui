/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';
import {render} from 'lit-html';

import {BackendAiStyles} from './backend-ai-console-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';
import '../plastics/lablup-shields/lablup-shields';
import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
import './lablup-loading-indicator';
import './backend-ai-indicator';

import 'weightless/button';
import 'weightless/card';
import 'weightless/checkbox';
import 'weightless/divider';
import 'weightless/icon';
import 'weightless/select';
import 'weightless/textfield';

import './backend-ai-resource-preset-list';

@customElement("backend-ai-environment-list")
export default class BackendAIEnvironmentList extends BackendAIPage {
  @property({type: Array}) images = Array();
  @property({type: Array}) allowed_registries = Array();
  @property({type: Object}) _boundRequirementsRenderer = this.requirementsRenderer.bind(this);
  @property({type: Object}) _boundControlsRenderer = this.controlsRenderer.bind(this);
  @property({type: Object}) _boundInstallRenderer = this.installRenderer.bind(this);
  @property({type: Array}) servicePorts = Array();
  @property({type: Number}) selectedIndex = 0;
  @property({type: Boolean}) _cuda_gpu_disabled = false;
  @property({type: Boolean}) _cuda_fgpu_disabled = false;
  @property({type: Boolean}) _rocm_gpu_disabled = false;
  @property({type: Boolean}) _tpu_disabled = false;
  @property({type: Object}) alias = Object();
  @property({type: Object}) loadingIndicator = Object();
  @property({type: Object}) indicator = Object();
  @property({type: Object}) installImageDialog = Object();
  @property({type: String}) installImageName = '';

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
            height: calc(100vh - 200px);
        }

        wl-button > wl-icon {
          --icon-size: 24px;
          padding: 0;
        }

        wl-icon {
          --icon-size: 16px;
          padding: 0;
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

        wl-dialog {
          --dialog-min-width: 350px;
        }

        wl-dialog#modify-image-dialog wl-select,
        wl-dialog#modify-image-dialog wl-textfield {
          margin-bottom: 20px;
        }

        wl-select, wl-textfield {
          --input-font-family: Quicksand, Roboto;
        }

        wl-dialog wl-textfield {
          --input-font-size: 14px;
        }

        #modify-app-dialog {
          --dialog-height: 500px;
          --dialog-max-height: 550px;
          --dialog-min-width: 600px;
        }

        wl-dialog vaadin-grid {
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

  _markIfUnlimited(value) {
    if (['-', 0, 'Unlimited', Infinity, 'Infinity'].includes(value)) {
      return '∞';
    } else {
      return value;
    }
  }

  _hideDialog(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-dialog');
    dialog.hide();
  }

  _hideDialogById(id) {
    return this.shadowRoot.querySelector(id).hide();
  }

  _launchDialogById(id) {
    return this.shadowRoot.querySelector(id).show();
  }

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
    // TODO : let add options for ROCm devices
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

    window.backendaiclient.image.modifyResource(image.registry, image.name, image.tag, input)
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

  openInstallImageDialog(index) {
    this.selectedIndex = index;
    let chosenImage = this.images[this.selectedIndex];
    this.installImageName = chosenImage['registry'] + '/' + chosenImage['name'] + ':' + chosenImage['tag'];
    this.installImageDialog.show();
  }

  _installImage() {
    this.notification.text = "Installing " + this.installImageName + ". It takes time so have a cup of coffee!";
    this.notification.show();
    this.installImageDialog.hide();
    this.indicator.start('indeterminate');
    this.indicator.set(10, 'Downloading...');
    window.backendaiclient.image.install(this.installImageName).then((response) => {
      this.indicator.set(100, 'Install finished.');
      this.indicator.end(1000);
      this._getImages();
    }).catch(err => {
      this.indicator.set(100, 'Problem occurred during installation.');
      this.indicator.end(1000);
    });
  }

  requirementsRenderer(root, column?, rowData?) {
    render(
      html`
          <div class="layout horizontal center flex">
            <div class="layout horizontal configuration">
              <iron-icon class="fg green" icon="hardware:developer-board"></iron-icon>
              <span>${rowData.item.cpu_limit_min}</span> ~
              <span>${this._markIfUnlimited(rowData.item.cpu_limit_max)}</span>
              <span class="indicator">core</span>
            </div>
          </div>
          <div class="layout horizontal center flex">
            <div class="layout horizontal configuration">
              <iron-icon class="fg green" icon="hardware:memory"></iron-icon>
              <span>${rowData.item.mem_limit_min}</span> ~
              <span>${this._markIfUnlimited(rowData.item.mem_limit_max)}</span>
            </div>
          </div>
        ${rowData.item.cuda_device_limit_min ? html`
           <div class="layout horizontal center flex">
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="hardware:icons:view-module"></iron-icon>
                <span>${rowData.item.cuda_device_limit_min}</span> ~
                <span>${this._markIfUnlimited(rowData.item.cuda_device_limit_max)}</span>
                <span class="indicator">GPU</span>
              </div>
            </div>
            ` : html``}
        ${rowData.item.cuda_shares_limit_min ? html`
            <div class="layout horizontal center flex">
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="icons:apps"></iron-icon>
                <span>${rowData.item.cuda_shares_limit_min}</span> ~
                <span>${this._markIfUnlimited(rowData.item.cuda_shares_limit_max)}</span>
                <span class="indicator">fGPU</span>
              </div>
            </div>
            ` : html``}
      `, root
    );
  }

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

  modifyServicePort() {
    const value = this._parseServicePort();
    const image = this.images[this.selectedIndex];
    window.backendaiclient.image.modifyLabel(image.registry, image.name, image.tag, "ai.backend.service-ports", value)
      .then(({result}) => {
        if (result === "ok") {
          this.notification.text = "Service port successfully modified";
        } else {
          this.notification.text = "Error Occurred";
        }
        this._getImages();
        this.requestUpdate();
        this._clearRows();
        this.notification.show();
        this._hideDialogById("#modify-app-dialog");
      })
  }

  controlsRenderer(root, column, rowData) {
    render(
      html`
        <div
          id="controls"
          class="layout horizontal flex center"
          kernel-id="[[item.digest]]"
        >
          <paper-icon-button
            class="fg blue controls-running"
            on-tap="_modifyImage"
            icon="icons:settings"
            @click=${() => {
        this.selectedIndex = rowData.index;
        this._setPulldownDefaults(this.images[this.selectedIndex].resource_limits);
        this._launchDialogById("#modify-image-dialog");
        this.requestUpdate();
      }}
          ></paper-icon-button>
          <paper-icon-button
            class="fg pink controls-running"
            icon="icons:apps"
            @click=${() => {
        if (this.selectedIndex !== rowData.index) this._clearRows();
        this.selectedIndex = rowData.index;
        this._decodeServicePort();
        this._launchDialogById("#modify-app-dialog");
        this.requestUpdate();
      }}
          ></paper-icon-button>
        </div>
      `,
      root
    )
  }

  installRenderer(root, column, rowData) {
    render(
      // language=HTML
      html`
        <div class="layout horizontal center center-justified" style="margin:0; padding:0;">
          <wl-checkbox style="--checkbox-size:12px;" ?checked="${rowData.item.installed}" ?disabled="${rowData.item.installed}" @click="${(e) => {
        this.openInstallImageDialog(rowData.index)
      }}"></wl-checkbox>
        </div>
      `, root);
  }

  render() {
    // language=HTML
    return html`
      <lablup-loading-indicator id="loading-indicator"></lablup-loading-indicator>
      <backend-ai-indicator id="indicator"></backend-ai-indicator>
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Environments" id="testgrid" .items="${this.images}">
        <vaadin-grid-column width="40px" flex-grow="0" text-align="center" .renderer="${this._boundInstallRenderer}">
          <template class="header">
            <vaadin-grid-sorter path="installed"></vaadin-grid-sorter>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column width="80px" resizable>
          <template class="header">
            <vaadin-grid-sorter path="registry">Registry</vaadin-grid-sorter>
          </template>
          <template>
            <div class="layout vertical">
              <span>[[item.registry]]</span>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column width="50px" resizable>
          <template class="header">Namespace</template>
          <template>
            <div>[[item.namespace]]</div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column resizable>
          <template class="header">Language</template>
          <template>
            <div>[[item.lang]]</div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column width="40px" resizable>
          <template class="header">Version</template>
          <template>
            <div>[[item.baseversion]]</div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column width="60px" resizable>
          <template class="header">Base</template>
          <template>
            <template is="dom-repeat" items="[[ item.baseimage ]]">
              <lablup-shields app="" color="blue" description="[[item]]"></lablup-shields>
            </template>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column width="50px" resizable>
          <template class="header">Constraint</template>
          <template>
            <template is="dom-if" if="[[item.additional_req]]">
              <lablup-shields app="" color="green" description="[[item.additional_req]]"></lablup-shields>
            </template>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column width="150px" flex-grow="0" resizable>
          <template class="header">
            Digest
          </template>
          <template>
            <div class="layout vertical">
              <span class="indicator">[[item.digest]]</span>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column width="150px" flex-grow="0" resizable header="Resource Limit" .renderer="${this._boundRequirementsRenderer}">
        </vaadin-grid-column>
        <vaadin-grid-column resizable header="Control" .renderer=${this._boundControlsRenderer}>
        </vaadin-grid-column>
      </vaadin-grid>
      <wl-dialog id="modify-image-dialog" fixed backdrop blockscrolling>
        <wl-card elevation="1" class="login-panel intro" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Modify Image</span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <form>
            <fieldset>
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
                    ${[0, 1, 2, 3, 4].map(item => html`
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
                    ${[0.1, 0.2, 0.5, 1.0, 2.0].map(item => html`
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
                    ${[0, 1, 2, 3, 4].map(item => html`
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
                @click=${this.modifyImage}
              >
                <wl-icon>check</wl-icon>
                Save Changes
              </wl-button>
            </fieldset>
          </form>
        </wl-card>
      </wl-dialog>
      <wl-dialog id="modify-app-dialog" fixed backdrop blockscrolling>
        <div slot="header" class="gutterBottom">
          <div class="horizontal center layout">
            <span style="font-family: Quicksand, Roboto; font-size: 20px;">Manage Apps</span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${e => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </div>
          <wl-divider></wl-divider>
        </div>
        <div slot="content" id="modify-app-container" class="container">
          <div class="row header">
            <div> App Name </div>
            <div> Protocol </div>
            <div> Port </div>
            <div> Action </div>
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
              <wl-icon> remove </wl-icon>
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
        <div slot="footer">
          <wl-button
            class="fg orange"
            outlined
            type="button"
            style="box-sizing: border-box; width: 100%;"
            @click=${this.modifyServicePort}
          >
            <wl-icon>check</wl-icon>
            Finish
          </wl-button>
        </div>
      </wl-dialog>
      <wl-dialog id="install-image-dialog" fixed backdrop blockscrolling>
         <wl-title level="3" slot="header">Let's double-check</wl-title>
         <div slot="content">
            <p>You are about to install the image <span style="color:blue;">${this.installImageName}</span>.</p>
            <p>This process requires significant download time. Do you want to proceed?</p>
         </div>
         <div slot="footer">
            <wl-button class="cancel" inverted flat @click="${(e) => this._hideDialog(e)}">Cancel</wl-button>
            <wl-button class="ok" @click="${() => this._installImage()}">Okay</wl-button>
         </div>
      </wl-dialog>
    `;
  }

  _removeRow(e) {
    const path = e.composedPath();
    let i = 0;
    while (path[i].localName !== "div") i++;
    path[i].remove();
  }

  _addRow() {
    const container = this.shadowRoot.querySelector("#modify-app-container");
    const lastChild = container.children[container.children.length - 1];
    const div = this._createRow();
    container.insertBefore(div, lastChild);
  }

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

  firstUpdated() {
    this.loadingIndicator = this.shadowRoot.querySelector('#loading-indicator');
    this.indicator = this.shadowRoot.querySelector('#indicator');
    this.notification = window.lablupNotification;
    this.installImageDialog = this.shadowRoot.querySelector('#install-image-dialog');
    if (typeof window.backendaiclient === "undefined" || window.backendaiclient === null) {
      document.addEventListener('backend-ai-connected', () => {
        this._getImages();
      }, true);
    } else { // already connected
      this._getImages();
    }
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {

    }
  }

  _getImages() {
    this.loadingIndicator.show();

    window.backendaiclient.domain.get(window.backendaiclient._config.domainName, ['allowed_docker_registries']).then((response) => {
      this.allowed_registries = response.domain.allowed_docker_registries;
      return window.backendaiclient.image.list(["name", "tag", "registry", "digest", "installed", "labels { key value }", "resource_limits { key min max }"], false, true);
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
            image.lang = names[1];
          } else {
            image.lang = image.names;
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
      this.loadingIndicator.hide();
    });
  }

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
      'py3': 'Python 3',
      'py2': 'Python 2',
      'py27': 'Python 2.7',
      'py35': 'Python 3.5',
      'py36': 'Python 3.6',
      'py37': 'Python 3.7',
      'py38': 'Python 3.8',
      'ubuntu16.04': 'Ubuntu 16.04',
      'ubuntu18.04': 'Ubuntu 18.04',
      'anaconda2018.12': 'Anaconda 2018.12',
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
