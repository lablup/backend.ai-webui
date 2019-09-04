/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, property, LitElement} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';

import {BackendAiStyles} from './backend-ai-console-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';

import 'weightless/card';
import 'weightless/switch';

@customElement("backend-ai-settings-view")
class BackendAiSettingsView extends BackendAIPage {
  @property({type: Object}) images = Object();
  @property({type: Boolean}) active = false;

  constructor() {
    super();
    setPassiveTouchGestures(true);
  }

  static get is() {
    return 'backend-ai-settings-view';
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
          div.indicator,
          span.indicator {
              font-size: 9px;
              margin-right: 5px;
          }

          div.description,
          span.description {
              font-size: 11px;
              margin-top: 5px;
              margin-right: 5px;
          }

          .setting-item {
              margin: 15px 10px;
              width: 340px;
          }

          .setting-desc {
              width: 300px;
          }

          .setting-button {
              width: 35px;
          }

          wl-card > div {
              padding: 15px;
          }
      `];
  }

  render() {
    // language=HTML
    return html`
        <wl-card elevation="1">
            <h3 class="horizontal center layout">
                <span>General</span>
                <span class="flex"></span>
            </h3>
            <div class="horizontal wrap layout">
                <div class="horizontal layout wrap setting-item">
                    <div class="vertical center-justified layout setting-desc">
                        <div>Register new images from repository</div>
                        <div class="description">Register new environments from repository.
                        </div>
                    </div>
                    <div class="vertical center-justified layout setting-button">
                        <wl-switch id="register-new-image-switch" disabled></wl-switch>
                    </div>
                </div>
                <div class="horizontal layout wrap setting-item">
                    <div class="vertical center-justified layout setting-desc">
                        <div>Automatic image update from repository</div>
                        <div class="description">Allow automatic image update from registered registries.
                        </div>
                    </div>
                    <div class="vertical center-justified layout setting-button">
                        <wl-switch id="allow-image-update-switch" disabled></wl-switch>
                    </div>
                </div>
                <div class="horizontal layout wrap setting-item">
                    <div class="vertical center-justified layout setting-desc">
                        <div>Use Backend.AI CLI on GUI</div>
                        <div class="description">Provide Backend.AI CLI on GUI app/web.<br/>Requires Backend.AI CLI image.
                        </div>
                    </div>
                    <div class="vertical center-justified layout setting-button">
                        <wl-switch id="use-cli-on-gui-switch" disabled></wl-switchdisabled>
                    </div>
                </div>
                <div class="horizontal layout wrap setting-item">
                    <div class="vertical center-justified layout setting-desc">
                        <div>Use Backend.AI GUI on Web</div>
                        <div class="description">Provide Backend.AI GUI as a web service.<br/>Requires Backend.AI Console image.
                        </div>
                    </div>
                    <div class="vertical center-justified layout setting-button">
                        <wl-switch id="use-gui-on-web-switch" disabled></wl-switch>
                    </div>
                </div>
            </div>
            <h3 class="horizontal center layout">
                <span>Scaling</span>
                <span class="flex"></span>
            </h3>
            <div class="horizontal wrap layout">
                <div class="horizontal layout wrap setting-item">
                    <div class="vertical center-justified layout setting-desc">
                        <div>Allow agent-side registration</div>
                        <div class="description">Allow agent to register itself to manager.<br/>Use only if Backend.AI cluster is
                            managed on secure location.
                        </div>
                    </div>
                    <div class="vertical center-justified layout setting-button">
                        <wl-switch id="allow-agent-registration-switch" checked disabled></wl-switch>
                    </div>
                </div>
            </div>
            <h3 class="horizontal center layout">
                <span>Plugins</span>
                <span class="flex"></span>
            </h3>
            <div class="horizontal wrap layout">
                <div class="horizontal layout wrap setting-item">
                    <div class="vertical center-justified layout setting-desc">
                        <div>CUDA GPU support</div>
                        <div class="description">NVidia CUDA GPU support. <br/>Requires Backend.AI CUDA Plugin.
                        </div>
                    </div>
                    <div class="vertical center-justified layout setting-button">
                        <wl-switch id="cuda-gpu-support-switch" checked disabled></wl-switch>
                    </div>
                </div>
                <div class="horizontal layout wrap setting-item">
                    <div class="vertical center-justified layout setting-desc">
                        <div>ROCm GPU support</div>
                        <div class="description">AMD ROCm GPU support. <br/>Requires Backend.AI ROCm Plugin. <br/>
                            Requires Backend.AI 19.09 beta or above.
                        </div>
                    </div>
                    <div class="vertical center-justified layout setting-button">
                        <wl-switch id="rocm-gpu-support-switch" checked disabled></wl-switch>
                    </div>
                </div>
            </div>
            <h3 class="horizontal center layout">
                <span>Enterprise features</span>
                <span class="flex"></span>
            </h3>
            <div class="horizontal wrap layout">
                <div class="horizontal layout wrap setting-item">
                    <div class="vertical center-justified layout setting-desc">
                        <div>Fractional GPU</div>
                        <div class="description">Use Fractional GPU feature with GPU virtualization. <br/>Requires Backend.AI Virtual CUDA API Layer Plugin.
                        </div>
                    </div>
                    <div class="vertical center-justified layout setting-button">
                        <wl-switch id="fractional-gpu-switch" checked disabled></wl-switch>
                    </div>
                </div>
                <div class="horizontal layout wrap setting-item">
                    <div class="vertical center-justified layout setting-desc">
                        <div>TPU</div>
                        <div class="description">Use TPU accelerator. <br/>Requires resource nodes on Google Cloud with Cloud TPU
                            enabled.
                        </div>
                    </div>
                    <div class="vertical center-justified layout setting-button">
                        <wl-switch id="tpu-switch" disabled></wl-switch>
                    </div>
                </div>
                <div class="horizontal layout wrap setting-item">
                    <div class="vertical center-justified layout setting-desc">
                        <div>Precise Statistics</div>
                        <div class="description">Use precise statistics module. Requires Backend.AI 19.06 or above. <br/>
                        </div>
                    </div>
                    <div class="vertical center-justified layout setting-button">
                        <wl-switch id="precise-statistics-switch" disabled></wl-switch>
                    </div>
                </div>
                <div class="horizontal layout wrap setting-item">
                    <div class="vertical center-justified layout setting-desc">
                        <div>Detailed Logging</div>
                        <div class="description">Use detailed logging module. Requires Backend.AI 19.06 or above.<br/>
                        </div>
                    </div>
                    <div class="vertical center-justified layout setting-button">
                        <wl-switch id="detailed-logging-switch" disabled></wl-switch>
                    </div>
                </div>
            </div>


        </wl-card>
    `;
  }

  firstUpdated() {
    if (window.backendaiclient === undefined || window.backendaiclient === null) {
      document.addEventListener('backend-ai-connected', () => {
      }, true);
    } else { // already connected
    }
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {

    }
  }

  _indexFrom1(index) {
    return index + 1;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-settings-view": BackendAiSettingsView;
  }
}
