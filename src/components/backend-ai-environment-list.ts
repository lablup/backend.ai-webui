/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, html} from "lit-element";
import {BackendAIPage} from './backend-ai-page';
import {render} from 'lit-html';

import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';

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

import 'weightless/button';
import 'weightless/card';
import 'weightless/checkbox';
import 'weightless/icon';
import 'weightless/select';
import 'weightless/textfield';

import './backend-ai-resource-template-list';

class BackendAiEnvironmentList extends BackendAIPage {
  public images: any;
  public indicator: any;
  public shadowRoot: any;
  public updateComplete: any;
  public alias: any;
  public allowed_registries: any;
  public _boundRequirementsRenderer: any;
  public _boundControlsRenderer : any;
  public selectedIndex: any;
  public disabled: any;

  constructor() {
    super();
    setPassiveTouchGestures(true);
    this.images = [];
    this.active = false;
    this.allowed_registries = [];
    this._boundRequirementsRenderer = this.requirementsRenderer.bind(this);
    this._boundControlsRenderer = this.controlsRenderer.bind(this);
    this.selectedIndex = 0;
    this.disabled = false;
  }

  static get is() {
    return 'backend-ai-environment-list';
  }

  _markIfUnlimited(value) {
    if (['-', 0, 'Unlimited', Infinity, 'Infinity'].includes(value)) {
      return '∞';
    } else {
      return value;
    }
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
          --button-bg: var(--paper-yellow-50);
          --button-bg-hover: var(--paper-yellow-100);
          --button-bg-active: var(--paper-yellow-600);
        }

        wl-dialog {
          --dialog-min-width: 350px;
        }

        wl-dialog wl-select {
          --input-font-family: Quicksand, Roboto;
          margin-bottom: 20px;
        }

      `];
  }

  static get properties() {
    return {
      active: {
        type: Boolean
      },
      images: {
        type: Object,
        hasChanged: () => true
      },
      indicator: {
        type: Object
      },
      allowed_registries: {
        type: Array
      }
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
          gpu = this.shadowRoot.querySelector("#modify-image-gpu").value,
         fgpu = this.shadowRoot.querySelector("#modify-image-fgpu").value;

    let input = {
      "cpu": {
        "min": cpu
      },
      "mem": {
        "min": mem
      }
    }
    if (this.images[this.selectedIndex].resource_limits.filter(e => e.key === "cuda_device").length !== 0) input["cuda.device"] = { "min": gpu };
    if (this.images[this.selectedIndex].resource_limits.filter(e => e.key === "cuda_shares").length !== 0) input["cuda.shares"] = { "min": fgpu };

    const image = this.images[this.selectedIndex];

    window.backendaiclient.image.modify(image.registry, image.name.replace("/", "%2F"), image.tag, input)
    .then(res => {
      this._getImages();
      this.requestUpdate();
      this._hideDialogById("#modify-image-dialog");
    })
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

  controlsRenderer(root, column, rowData) {
    render (
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
              console.log(this.images);
              this._launchDialogById("#modify-image-dialog")
              this.requestUpdate();
            }}
          ></paper-icon-button>
        </div>
      `,
      root
    )
  }

  render() {
    // language=HTML
    return html`
      <lablup-loading-indicator id="loading-indicator"></lablup-loading-indicator>
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Environments" id="testgrid" .items="${this.images}">
        <vaadin-grid-column width="40px" flex-grow="0" text-align="center">
          <template class="header">
            <vaadin-grid-sorter path="installed"></vaadin-grid-sorter>
          </template>
          <template>
            <div "layout horizontal center center-justified"  style="margin:0; padding:0;">
              <template is="dom-if" if="[[item.installed]]">
                <wl-checkbox style="--checkbox-size:12px;" checked></wl-checkbox>
              </template>
              <template is="dom-if" if="[[!item.installed]]">
                <wl-checkbox style="--checkbox-size:12px;"></wl-checkbox>
              </template>
            </div>
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
        <wl-card elevation="1" class="login-panel intro">
          <h3 class="horizontal center layout">
            <span>Modify Image</span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <form id="login-form">
            <fieldset>
              <div style="display: flex">
                <div style="flex: 1">
                  <wl-select
                    label="CPU"
                    id="modify-image-cpu"
                  >
                    ${[1, 2, 3, 4, 5, 6, 7, 8].map(item => html`
                      <option
                        value=${item}
                      >${item}</option>
                    `)}
                  </wl-select>
                  <wl-select
                    label="GPU"
                    id="modify-image-gpu"
                    ?disabled=${this.images.length !== 0 && this.images[this.selectedIndex].resource_limits.filter(e => e.key === "cuda_device").length === 0}
                  >
                    ${[0, 1, 2, 3, 4].map(item => html`
                      <option value=${item}>${item}</option>
                    `)}
                  </wl-select>
                </div>
                <div style="flex: 1">
                  <wl-select
                    label="RAM"
                    id="modify-image-mem"
                  >
                    ${["256m", "512m", "1g", "2g", "4g", "8g", "16g"].map(item => html`
                      <option value=${item}>${item}</option>
                    `)}
                  </wl-select>
                  <wl-select
                    label="fGPU"
                    id="modify-image-fgpu"
                    ?disabled=${this.images.length !== 0 && this.images[this.selectedIndex].resource_limits.filter(e => e.key === "cuda_shares").length === 0}
                  >
                    ${[0.1, 0.2, 0.5, 1.0, 2.0].map(item => html`
                      <option value=${item}>${item}</option>
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
    `;
  }

  firstUpdated() {
    this.indicator = this.shadowRoot.querySelector('#loading-indicator');
    if (window.backendaiclient === undefined || window.backendaiclient === null) {
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
    this.indicator.show();

    window.backendaiclient.domain.get(window.backendaiclient._config.domainName, ['allowed_docker_registries']).then((response) => {
      this.allowed_registries = response.domain.allowed_docker_registries;
      return window.backendaiclient.image.list();
    }).then((response) => {
      let images = response.images;
      let domainImages = [];
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
          domainImages.push(image);
        }
      });
      let image_keys = Object.keys(domainImages);
      //console.log(image_keys);
      //let sorted_images = {};
      //image_keys.sort();
      this.images = domainImages;
      this.indicator.hide();
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
      'digits': 'DIGITS',
      'py3': 'Python 3',
      'py2': 'Python 2',
      'py27': 'Python 2.7',
      'py35': 'Python 3.5',
      'py36': 'Python 3.6',
      'py37': 'Python 3.7',
      'ubuntu16.04': 'Ubuntu 16.04',
      'ubuntu18.04': 'Ubuntu 18.04',
      'anaconda2018.12': 'Anaconda 2018.12',
      'alpine3.8': 'Alpine Lunux 3.8',
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

customElements.define(BackendAiEnvironmentList.is, BackendAiEnvironmentList);

