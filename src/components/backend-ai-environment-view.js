/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {html, css, LitElement} from "lit-element";

import {BackendAiStyles} from './backend-ai-console-styles';
import {
  IronFlex,
  IronFlexAlignment
} from '../plastics/layout/iron-flex-layout-classes';
import './lablup-loading-indicator';
import 'weightless/button';
import 'weightless/icon';
import 'weightless/card';
import 'weightless/tab';
import 'weightless/tab-group';

import {default as PainKiller} from "./backend-ai-painkiller";
import './backend-ai-environment-list';
import './backend-ai-resource-template-list';
import './lablup-notification.js';

class BackendAiEnvironmentView extends LitElement {
  constructor() {
    super();
    this.images = {};
    this.active = false;
    this._activeTab = 'image-lists';
  }

  static get is() {
    return 'backend-ai-environment-view';
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        wl-tab-group {
          --tab-group-indicator-bg: var(--paper-yellow-600);
        }

        wl-tab {
          --tab-color: #666;
          --tab-color-hover: #222;
          --tab-color-hover-filled: #222;
          --tab-color-active: var(--paper-yellow-900);
          --tab-color-active-hover: var(--paper-yellow-900);
          --tab-color-active-filled: #ccc;
          --tab-bg-active: var(--paper-yellow-200);
          --tab-bg-filled: var(--paper-yellow-200);
          --tab-bg-active-hover: var(--paper-yellow-200);
        }

        div h4 {
          margin: 0;
          font-weight: 100;
          font-size: 16px;
          padding-left: 20px;
          border-bottom: 1px solid #ccc;
          width: 100%;
        }

        wl-card wl-card {
          margin: 0;
          padding: 0;
          --card-elevation: 0;
        }

        wl-button {
          --button-bg: var(--paper-yellow-50);
          --button-bg-hover: var(--paper-yellow-100);
          --button-bg-active: var(--paper-yellow-600);
        }

        wl-button#create-policy-button {
          width: 100%;
          box-sizing: border-box;
          margin-top: 15px;
        }
      `
    ];
  }

  static get properties() {
    return {
      active: {
        type: Boolean
      },
      _activeTab: {
        type: Boolean
      }
    }
  }

  attributeChangedCallback(name, oldval, newval) {
    if (name == 'active' && newval !== null) {
      this.active = true;
      this._menuChanged(true);
    } else {
      this.active = false;
      this._menuChanged(false);
    }
    super.attributeChangedCallback(name, oldval, newval);
  }

  async _menuChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return true;
    }
  }

  _showTab(tab) {
    var els = this.shadowRoot.querySelectorAll(".tab-content");
    for (var x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    this._activeTab = tab.value;
    this.shadowRoot.querySelector('#' + tab.value).style.display = 'block';
  }

  _hideDialog(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-dialog');
    dialog.hide();
  }

  _launchPresetAddDialog(e) {
    this.shadowRoot.querySelector('#create-preset-dialog').show();
  }

  _createPreset() {
    let preset_name = this.shadowRoot.querySelector('#id_preset_name').value,
          cpu           = this.shadowRoot.querySelector('#cpu-resource').value,
          mem           = this.shadowRoot.querySelector('#ram-resource').value + 'g',
          gpu_resource  = this.shadowRoot.querySelector('#gpu-resource').value,
          fgpu_resource = this.shadowRoot.querySelector('#fgpu-resource').value;
    if (cpu === 'Unlimited') cpu = 'Infinity';
    if (mem === 'Unlimited') mem = 'Infinity';

    let resource_slots = {cpu, mem};
    if (gpu_resource !== undefined && gpu_resource !== null && gpu_resource !== "" && gpu_resource !== '0') {
      resource_slots["cuda.device"] = parseInt(gpu_resource);
    }
    if (fgpu_resource !== undefined && fgpu_resource !== null && fgpu_resource !== "" && fgpu_resource !== '0') {
      resource_slots["cuda.shares"] = parseFloat(fgpu_resource);
    }

    const input = {
      'resource_slots': JSON.stringify(resource_slots)
    };

    window.backendaiclient.resourcePreset.add(preset_name, input)
    .then(res => {
      this.shadowRoot.querySelector('#create-preset-dialog').hide();
      if (res.create_resource_preset.ok) {
        this.shadowRoot.querySelector('#notification').text = "Resource preset successfully created";
        this.shadowRoot.querySelector('#resource-template-list').refresh();

        // reset values
        this.shadowRoot.querySelector('#id_preset_name').value = "";
        this.shadowRoot.querySelector('#cpu-resource').value   = 1;
        this.shadowRoot.querySelector('#ram-resource').value   = 1;
        this.shadowRoot.querySelector('#gpu-resource').value   = 0;
        this.shadowRoot.querySelector('#fgpu-resource').value  = 0;
      } else {
        this.shadowRoot.querySelector('#notification').text = PainKiller.relieve(res.create_resource_preset.msg);
      }
      this.shadowRoot.querySelector('#notification').show();
    })
  }

  render() {
    // language=HTML
    return html`
      <lablup-notification id="notification"></lablup-notification>
      <lablup-loading-indicator id="loading-indicator"></lablup-loading-indicator>
      <wl-card class="item" elevation="1">
        <h3 class="tab horizontal center layout">
          <wl-tab-group>
            <wl-tab value="image-lists" checked @click="${(e) => this._showTab(e.target)}">Images</wl-tab>
            <wl-tab value="resource-template-lists" @click="${(e) => this._showTab(e.target)}">Resource Presets</wl-tab>
          </wl-tab-group>
          <div class="flex"></div>
        </h3>
        <div id="image-lists" class="tab-content">
          <backend-ai-environment-list ?active="${this._activeTab === 'image-lists'}"></backend-ai-environment-list>
        </div>
        <wl-card id="resource-template-lists" class="admin item tab-content" style="display: none">
          <h4 class="horizontal flex center center-justified layout">
            <span>Resource Presets</span>
            <span class="flex"></span>
            <wl-button class="fg orange" id="add-resource-preset" outlined @click="${e => this._launchPresetAddDialog(e)}">
              <wl-icon>add</wl-icon>
              Create Preset
            </wl-button>
          </h4>
          <div>
            <backend-ai-resource-template-list id="resource-template-list" ?active="${this._activeTab === 'resource-template-lists'}"></backend-ai-resource-template-list>
          </div>
        </wl-card>
      </wl-card>
      <wl-dialog id="create-preset-dialog" fixed backdrop blockscrolling>
        <wl-card elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Create resource preset</span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <form id="preset-creation-form">
            <fieldset>
              <paper-input
                type="text"
                name="preset_name"
                id="id_preset_name"
                label="Preset Name"
                auto-validate
                required
                pattern="[a-zA-Z0-9]*"
                error-message="Policy name only accepts letters and numbers"
              ></paper-input>
              <h4>Resource Preset</h4>
              <div class="horizontal center layout">
                <paper-dropdown-menu id="cpu-resource" label="CPU">
                  <paper-listbox slot="dropdown-content" selected="0">
                  ${[1, 2, 3, 4, 8, 16, 24, "Unlimited"].map(item => html`
                    <paper-item value="${item}">${item}</paper-item>
                  `)}
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="ram-resource" label="RAM (GB)">
                  <paper-listbox slot="dropdown-content" selected="0">
                  ${[1, 2, 4, 8, 16, 24, 32, 64, 128, 256, 512, "Unlimited"].map(item => html`
                    <paper-item value="${item}">${item}</paper-item>
                  `)}
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
              <div class="horizontal center layout">
                <paper-dropdown-menu id="gpu-resource" label="GPU">
                  <paper-listbox slot="dropdown-content" selected="0">
                  ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 12, 16, "Unlimited"].map(item => html`
                    <paper-item value="${item}">${item}</paper-item>
                  `)}
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="fgpu-resource" label="fGPU">
                  <paper-listbox slot="dropdown-content" selected="0">
                  ${[0, 0.3, 0.6, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 12, 16, "Unlimited"].map(item => html`
                    <paper-item value="${item}">${item}</paper-item>
                  `)}
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
              <wl-button
                class="fg orange create-button"
                id="create-policy-button"
                outlined
                type="button"
                @click="${this._createPreset}"
              >
                <wl-icon>add</wl-icon>
                Add
              </wl-button>
            </fieldset>
          </form>
        </wl-card>
      </wl-dialog>
    `;
  }

  shouldUpdate() {
    return this.active;
  }

  firstUpdated() {
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

customElements.define(BackendAiEnvironmentView.is, BackendAiEnvironmentView);
