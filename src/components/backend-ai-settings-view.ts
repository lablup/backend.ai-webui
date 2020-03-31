/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {translate as _t, translateUnsafeHTML as _tr, get as _text} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import {BackendAiStyles} from './backend-ai-general-styles';
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
import {default as PainKiller} from "./backend-ai-painkiller";

@customElement("backend-ai-settings-view")
export default class BackendAiSettingsView extends BackendAIPage {
  @property({type: Object}) images = Object();
  @property({type: Object}) options = Object();
  @property({type: Object}) notification = Object();

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

        .setting-desc-pulldown {
          width: 265px;
        }

        .setting-pulldown {
          width: 70px;
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
          <span>${_t("settings.General")}</span>
          <span class="flex"></span>
        </h3>
        <div class="horizontal wrap layout">
          <div class="horizontal layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("settings.RegisterNewImagesFromRepo")}</div>
              <div class="description">${_t("settings.DescRegisterNewImagesFromRepo")}
              </div>
            </div>
            <div class="vertical center-justified layout setting-button">
              <wl-switch id="register-new-image-switch" disabled></wl-switch>
            </div>
          </div>
          <div class="horizontal layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("settings.AutomaticImageUpdateFromRepo")}</div>
              <div class="description">${_tr("settings.DescAutomaticImageUpdateFromRepo")}
              </div>
            </div>
            <div class="vertical center-justified layout setting-button">
              <wl-switch id="allow-image-update-switch" @change="${(e) => this.toggleImageUpdate(e)}" ?checked="${this.options['automatic_image_update']}"></wl-switch>
            </div>
          </div>
          <div class="horizontal layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("settings.UseCLIonGUI")}</div>
              <div class="description">${_tr("settings.DescUseCLIonGUI")}
              </div>
            </div>
            <div class="vertical center-justified layout setting-button">
              <wl-switch id="use-cli-on-gui-switch" disabled></wl-switchdisabled>
            </div>
          </div>
          <div class="horizontal layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("settings.UseGUIonWeb")}</div>
              <div class="description">${_tr("settings.DescUseGUIonWeb")}
              </div>
            </div>
            <div class="vertical center-justified layout setting-button">
              <wl-switch id="use-gui-on-web-switch" disabled></wl-switch>
            </div>
          </div>
        </div>
        <div class="horizontal wrap layout" style="background-color:#FFFBE7;padding: 5px 15px;">
          ${_t("settings.NoteAboutFixedSetup")}
        </div>
        <h3 class="horizontal center layout">
            <span>${_t("settings.Scaling")}</span>
            <span class="flex"></span>
        </h3>
        <div class="horizontal wrap layout">
          <div class="horizontal layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("settings.AllowAgentSideRegistration")}</div>
              <div class="description">${_tr("settings.DescAllowAgentSideRegistration")}
              </div>
            </div>
            <div class="vertical center-justified layout setting-button">
              <wl-switch id="allow-agent-registration-switch" checked disabled></wl-switch>
            </div>
          </div>
        </div>
        <h3 class="horizontal center layout">
            <span>${_t("settings.Plugins")}</span>
            <span class="flex"></span>
        </h3>
        <div class="horizontal wrap layout">
          <div class="horizontal layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("settings.CUDAGPUsupport")}</div>
              <div class="description">${_tr("settings.DescCUDAGPUsupport")}
              ${this.options['cuda_fgpu'] ? html`<br />${_t("settings.CUDAGPUdisabledByFGPUsupport")}` : html``}
              </div>
            </div>
            <div class="vertical center-justified layout setting-button">
              <wl-switch id="cuda-gpu-support-switch" ?checked="${this.options['cuda_gpu']}" disabled></wl-switch>
            </div>
          </div>
          <div class="horizontal layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("settings.ROCMGPUsupport")}</div>
              <div class="description">${_tr("settings.DescROCMGPUsupport")}<br />${_t("settings.Require1912orAbove")}
              </div>
            </div>
            <div class="vertical center-justified layout setting-button">
              <wl-switch id="rocm-gpu-support-switch" ?checked="${this.options['rocm_gpu']}" disabled></wl-switch>
            </div>
          </div>
          <div class="horizontal layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc-pulldown">
              <div>${_t("settings.Scheduler")}</div>
              <div class="description">${_t("settings.JobScheduler")}<br/>
                  ${_t("settings.Require1912orAbove")}
              </div>
            </div>
            <div class="vertical layout setting-pulldown">
              <wl-select name="scheduler-switch" id="scheduler-switch" required @change="${(e) => this.changeScheduler(e)}">
                <option value="fifo" ?selected="${this.options['scheduler'] === "fifo"}">FIFO</option>
                <option value="lifo" ?selected="${this.options['scheduler'] === "lifo"}">LIFO</option>
                <option value="drf" ?selected="${this.options['scheduler'] === "drf"}">DRF</option>
              </wl-select>
            </div>
          </div>
        </div>
        <h3 class="horizontal center layout">
          <span>${_t("settings.EnterpriseFeatures")}</span>
          <span class="flex"></span>
        </h3>
        <div class="horizontal wrap layout">
          <div class="horizontal layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("settings.FractionalGPU")}</div>
              <div class="description">${_t("settings.DescFractionalGPU")} <br/> ${_t("settings.RequireFGPUPlugin")}
              </div>
            </div>
            <div class="vertical center-justified layout setting-button">
              <wl-switch id="fractional-gpu-switch" ?checked="${this.options['cuda_fgpu']}" disabled></wl-switch>
            </div>
          </div>
          <div class="horizontal layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("settings.TPU")}</div>
              <div class="description">${_t("settings.DescTPU")} <br/>${_t("settings.RequireTPUPlugin")}
              </div>
            </div>
            <div class="vertical center-justified layout setting-button">
              <wl-switch id="tpu-switch" ?checked="${this.options['tpu']}" disabled></wl-switch>
            </div>
          </div>
        </div>
      </wl-card>
    `;
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null) {
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
    globalThis.backendaiclient.setting.get('docker/image/auto_pull').then((response) => {
      if (response['result'] === null || response['result'] === 'digest') { // digest mode
        this.options['automatic_image_update'] = true;
      } else if (response['result'] === 'tag' || response['result'] === 'none') {
        this.options['automatic_image_update'] = false;
      }
      this.update(this.options);
    });
    globalThis.backendaiclient.setting.get('plugins/scheduler').then((response) => {
      if (response['result'] === null || response['result'] === 'fifo') { // digest mode
        this.options['scheduler'] = 'fifo';
      } else {
        this.options['scheduler'] = response['result'];
      }
      this.update(this.options);
    });
    globalThis.backendaiclient.getResourceSlots().then((response) => {
      if ('cuda.device' in response) {
        this.options['cuda_gpu'] = true;
      }
      if ('cuda.shares' in response) {
        this.options['cuda_fgpu'] = true;
      }
      if ('rocm.device' in response) {
        this.options['rocm_gpu'] = true;
      }
      if ('tpu.device' in response) {
        this.options['tpu'] = true;
      }
      this.update(this.options);
    });
  }

  toggleImageUpdate(e) {
    if (e.target.checked === false) {
      globalThis.backendaiclient.setting.set('docker/image/auto_pull', 'none').then((response) => {
        console.log(response);
      });
    } else {
      globalThis.backendaiclient.setting.set('docker/image/auto_pull', 'digest').then((response) => {
        console.log(response);
      });
    }
  }

  changeScheduler(e) {
    if (['fifo', 'lifo', 'drf'].includes(e.target.value)) {
      let scheduler = `{${e.target.value}}`;
      globalThis.backendaiclient.setting.set('plugins/scheduler', scheduler).then((response) => {
        console.log(response);
      }).catch(err => {
        this.notification.text = PainKiller.relieve('Couldn\'t update scheduler setting.');
        this.notification.detail = err;
        this.notification.show(true, err);
      });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-settings-view": BackendAiSettingsView;
  }
}
