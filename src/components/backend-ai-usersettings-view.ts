/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

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
import 'weightless/select';

@customElement("backend-ai-usersettings-view")
export default class BackendAiUserSettingsView extends BackendAIPage {
  @property({type: Object}) images = Object();
  @property({type: Boolean}) options = Object();

  constructor() {
    super();
    this.options = {
      automatic_image_update: false,
      cuda_gpu: false,
      cuda_fgpu: false,
      rocm_gpu: false,
      tpu: false,
      scheduler: 'fifo'
    }
  }

  static get is() {
    return 'backend-ai-usersettings-view';
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
                        <div>TEST1</div>
                        <div class="description">This is description.
                        </div>
                    </div>
                    <div class="vertical center-justified layout setting-button">
                        <wl-switch id="register-new-image-switch" disabled></wl-switch>
                    </div>
                </div>
            </div>
            <h3 class="horizontal center layout">
                <span>Shell Environments</span>
                <span class="flex"></span>
            </h3>
            <div class="horizontal wrap layout">
                <div class="horizontal layout wrap setting-item">
                    <div class="vertical center-justified layout setting-desc">
                        <div>TEST1</div>
                        <div class="description">This is description.
                        </div>
                    </div>
                    <div class="vertical center-justified layout setting-button">
                        <wl-switch id="register-new-image-switch" disabled></wl-switch>
                    </div>
                </div>
            </div>
            <h3 class="horizontal center layout">
                <span>Package Installation</span>
                <span class="flex"></span>
            </h3>
            <div class="horizontal wrap layout">
                <div class="horizontal layout wrap setting-item">
                    <div class="vertical center-justified layout setting-desc">
                        <div>TEST1</div>
                        <div class="description">This is description.
                        </div>
                    </div>
                    <div class="vertical center-justified layout setting-button">
                        <wl-switch id="register-new-image-switch" disabled></wl-switch>
                    </div>
                </div>
            </div>
        </wl-card>
    `;
  }

  firstUpdated() {
    if (typeof window.backendaiclient === "undefined" || window.backendaiclient === null) {
      document.addEventListener('backend-ai-connected', () => {
        this.updateSettings();
      }, true);
    } else { // already connected
      this.updateSettings();
    }
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
    }
  }

  updateSettings() {
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-usersettings-view": BackendAiUserSettingsView;
  }
}
