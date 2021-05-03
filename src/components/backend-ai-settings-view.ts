/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t, translateUnsafeHTML as _tr} from 'lit-translate';
import {css, CSSResultArray, CSSResultOrNative, customElement, html, property} from 'lit-element';
import {BackendAIPage} from './backend-ai-page';

import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';

import '@material/mwc-switch/mwc-switch';
import '@material/mwc-select';
import '@material/mwc-list/mwc-list-item';

import './lablup-activity-panel';
import {default as PainKiller} from './backend-ai-painkiller';

/**
 Backend AI Settings View

 Example:

 <backend-ai-settings-view active>
 ...
 </backend-ai-settings-view>

@group Backend.AI Web UI
 @element backend-ai-storage-list
 */

@customElement('backend-ai-settings-view')
export default class BackendAiSettingsView extends BackendAIPage {
  @property({type: Object}) images = Object();
  @property({type: Object}) options = Object();
  @property({type: Object}) notification = Object();
  @property({type: Array}) imagePullingBehavior = [
    {name: _text('settings.image.digest'), behavior: 'digest'},
    {name: _text('settings.image.tag'), behavior: 'tag'},
    {name: _text('settings.image.none'), behavior: 'none'}
  ];
  @property({type: Array}) jobschedulerType = [
    'fifo', 'lifo', 'drf'];
  @property({type: String}) scheduler = 'fifo';

  constructor() {
    super();
    try {
      this.scheduler = localStorage.getItem('backendaiclient.settings.scheduler') || 'fifo';
    } catch (e) {
      console.log(e);
      localStorage.removeItem('backendaiclient.settings.scheduler');
    }

    this.options = {
      image_pulling_behavior: 'digest',
      cuda_gpu: false,
      cuda_fgpu: false,
      rocm_gpu: false,
      tpu: false,
      scheduler: this.scheduler,
      num_retries_to_skip: '0'
    };
  }

  static get is() {
    return 'backend-ai-settings-view';
  }

  static get styles(): CSSResultOrNative | CSSResultArray {
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

        div.title {
          font-size: 14px;
          font-weight: bold;
        }

        div.description,
        span.description {
          font-size: 13px;
          margin-top: 5px;
          margin-right: 5px;
          max-width: 500px;
        }

        div.description-shrink {
          font-size: 13px;
          margin-top: 5px;
          margin-right: 5px;
          width: 260px;
        }

        div.description-extra {
          font-size: 13px;
          margin-top: 5px;
          margin-right: 5px;
          max-width: 500px;
        }

        .setting-item {
          margin: 15px 10px 15px 0px;
          width: auto;
        }

        .setting-desc, .setting-desc-select {
          float: left;
          width: 100%;
        }

        .setting-desc-shrink {
          float: left;
          width: auto;
        }

        .setting-button {
          float: right;
          width: 35px;
        }

        .setting-desc-pulldown {
          width: 265px;
        }

        .setting-pulldown {
          width: 70px;
        }

        lablup-activity-panel {
          color: #000;
        }

        mwc-select {
          font-family: var(--general-font-family);
          --mdc-typography-subtitle1-font-family: var(--general-font-family);
          --mdc-theme-primary: var(--general-sidebar-color);
          --mdc-select-fill-color: transparent;
          --mdc-select-label-ink-color: rgba(0, 0, 0, 0.75);
          --mdc-select-focused-dropdown-icon-color: var(--general-sidebar-color);
          --mdc-select-disabled-dropdown-icon-color: var(--general-sidebar-color);
          --mdc-select-idle-line-color: rgba(0, 0, 0, 0.42);
          --mdc-select-hover-line-color: var(--general-sidebar-color);
          --mdc-select-outlined-idle-border-color: var(--general-sidebar-color);
          --mdc-select-outlined-hover-border-color: var(--general-sidebar-color);
          --mdc-theme-surface: white;
          --mdc-list-vertical-padding: 5px;
          --mdc-list-side-padding: 25px;
          --mdc-list-item__primary-text: {
            height: 20px;
          };
        }

        @media screen and (max-width: 750px) {
          .setting-desc, .setting-desc-shrink {
            width: 275px;
          }

          .setting-desc-select {
            width: 190px;
          }

          div.description-shrink {
            width: auto;
          }

        }

        @media screen and (min-width: 1400px) {
          div.description-extra {
            max-width: 100%;
          }
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <div class="horizontal layout wrap">
        <lablup-activity-panel title="${_t('settings.Image')}" autowidth>
          <div slot="message" class="horizontal wrap layout">
            <div class="horizontal layout setting-item">
              <div class="vertical center-justified layout setting-desc">
                <div class="title">${_t('settings.RegisterNewImagesFromRepo')}</div>
                <div class="description">${_t('settings.DescRegisterNewImagesFromRepo')}
                </div>
              </div>
              <div class="vertical center-justified layout setting-button">
                <mwc-switch id="register-new-image-switch" disabled></mwc-switch>
              </div>
            </div>
            <div class="horizontal layout setting-item">
              <div class="vertical center-justified layout setting-desc-select">
                <div class="title">${_t('settings.ImagePullBehavior')}</div>
                <div class="description-extra">${_tr('settings.DescImagePullBehavior')}<br />
                    ${_t('settings.Require2003orAbove')}
                </div>
              </div>
              <div class="vertical center-justified layout">
                <mwc-select id="ui-image-pulling-behavior"
                            required
                            outlined
                            style="width:120px;"
                            @selected="${(e) => this.setImagePullingBehavior(e)}">
                ${this.imagePullingBehavior.map((item) => html`
                  <mwc-list-item value="${item.behavior}"
                                 ?selected=${this.options['image_pulling_behavior'] === item.behavior}>
                    ${item.name}
                  </mwc-list-item>`)}
                </mwc-select>
              </div>
            </div>
          </div>
        </lablup-activity-panel>
        <lablup-activity-panel title="${_t('settings.GUI')}" autowidth>
          <div slot="message" class="horizontal wrap layout">
            <div class="horizontal layout setting-item">
              <div class="vertical center-justified layout setting-desc-shrink">
                <div class="title">${_t('settings.UseCLIonGUI')}</div>
                <div class="description-shrink">${_tr('settings.DescUseCLIonGUI')}
                </div>
              </div>
              <div class="vertical center-justified layout setting-button">
                <mwc-switch id="use-cli-on-gui-switch" disabled></mwc-switch>
              </div>
            </div>
            <div class="horizontal layout setting-item">
              <div class="vertical center-justified layout setting-desc-shrink">
                <div class="title">${_t('settings.UseGUIonWeb')}</div>
                <div class="description-shrink">${_tr('settings.DescUseGUIonWeb')}
                </div>
              </div>
              <div class="vertical center-justified layout setting-button">
                <mwc-switch id="use-gui-on-web-switch" disabled></mwc-switch>
              </div>
            </div>
          </div>
        </lablup-activity-panel>
        <lablup-activity-panel title="${_t('settings.Scaling')} & ${_t('settings.Plugins')}" narrow autowidth>
          <div slot="message" class="vertical wrap layout">
            <div class="horizontal wrap layout note" style="background-color:#FFFBE7;width:100%;padding:10px 0px;">
              <p style="margin:auto 10px;">
                ${_t('settings.NoteAboutFixedSetup')}
              </p>
            </div>
            <div style="margin:auto 16px;">
                <h3 class="horizontal center layout">
                <span>${_t('settings.Scaling')}</span>
                <span class="flex"></span>
              </h3>
              <div class="horizontal wrap layout">
                <div class="horizontal layout wrap setting-item">
                  <div class="vertical center-justified layout setting-desc-shrink">
                    <div class="title">${_t('settings.AllowAgentSideRegistration')}</div>
                    <div class="description-shrink">${_tr('settings.DescAllowAgentSideRegistration')}
                    </div>
                  </div>
                  <div class="vertical center-justified layout setting-button">
                    <mwc-switch id="allow-agent-registration-switch" checked disabled></mwc-switch>
                  </div>
                </div>
              </div>
              <h3 class="horizontal center layout">
                <span>${_t('settings.Plugins')}</span>
                <span class="flex"></span>
              </h3>
              <div class="vertical layout wrap">
                <div class="horizontal layout wrap start start-justified">
                  <div class="horizontal layout setting-item">
                    <div class="vertical center-justified layout setting-desc-shrink">
                      <div class="title">${_t('settings.CUDAGPUsupport')}</div>
                      <div class="description-shrink">${_tr('settings.DescCUDAGPUsupport')}
                        ${this.options['cuda_fgpu'] ? html`<br />${_t('settings.CUDAGPUdisabledByFGPUsupport')}` : html``}
                      </div>
                    </div>
                    <div class="vertical center-justified layout setting-button">
                      <mwc-switch id="cuda-gpu-support-switch" ?checked="${this.options['cuda_gpu']}" disabled></mwc-switch>
                    </div>
                  </div>
                  <div class="horizontal layout setting-item">
                    <div class="vertical center-justified layout setting-desc-shrink">
                      <div class="title">${_t('settings.ROCMGPUsupport')}</div>
                      <div class="description-shrink">${_tr('settings.DescROCMGPUsupport')}<br />${_t('settings.Require1912orAbove')}
                      </div>
                    </div>
                    <div class="vertical center-justified layout setting-button">
                      <mwc-switch id="rocm-gpu-support-switch" ?checked="${this.options['rocm_gpu']}" disabled></mwc-switch>
                    </div>
                  </div>
                  <div class="horizontal layout setting-item">
                    <div class="vertical center-justified layout setting-desc-select" style="margin: 15px 0px;">
                      <div class="title">${_t('settings.Scheduler')}</div>
                      <div class="description-shrink">${_t('settings.JobScheduler')}<br/>
                          ${_t('settings.Require1912orAbove')}
                      </div>
                    </div>
                    <div class="vertical layout center-justified">
                      <mwc-select id="scheduler-switch"
                                  required
                                  outlined
                                  @selected="${(e) => this.changeScheduler(e)}"
                                  label=""
                                  style="width:130px;">
                        ${this.jobschedulerType.map((item) => html`
                          <mwc-list-item value="${item}"
                                        ?selected=${this.options['scheduler'] === item}>
                            ${item}
                          </mwc-list-item>`)}
                      </mwc-select>
                    </div>
                  </div>
                  <div class="horizontal layout setting-item">
                    <div class="vertical center-justified layout setting-desc-select" style="margin: 15px 0px;">
                      <div class="title">${_t('settings.SessionCreationRetries')}</div>
                      <div class="description-shrink">${_t('settings.SessionCreationRetriesDescription')}<br/>
                        <div style="font-weight: bold">${_t('settings.FifoOnly')}</div>
                      </div>
                    </div>
                    <div class="vertical layout center-justified">
                      <mwc-textfield id="num-retries"
                                    outlined
                                    charCounter
                                    autoValidate
                                    maxLength="3"
                                    value="${this.options['num_retries_to_skip']}"
                                    pattern="[0-9]+"
                                    style="width:130px;"
                                    @blur="${() => this.changeNumRetriesToSkip()}">
                      </mwc-textfield>
                    </div>         
                  </div>
                </div>
                <h3 class="horizontal center layout">
                  <span>${_t('settings.EnterpriseFeatures')}</span>
                  <span class="flex"></span>
                </h3>
                <div class="horizontal wrap layout">
                  <div class="horizontal layout setting-item">
                    <div class="vertical center-justified layout setting-desc-shrink">
                      <div class="title">${_t('settings.FractionalGPU')}</div>
                      <div class="description-shrink">${_t('settings.DescFractionalGPU')} <br/> ${_t('settings.RequireFGPUPlugin')}
                      </div>
                    </div>
                    <div class="vertical center-justified layout setting-button">
                      <mwc-switch id="fractional-gpu-switch" ?checked="${this.options['cuda_fgpu']}" disabled></mwc-switch>
                    </div>
                  </div>
                  <div class="horizontal layout setting-item">
                    <div class="vertical center-justified layout setting-desc-shrink">
                      <div class="title">${_t('settings.TPU')}</div>
                      <div class="description-shrink">${_t('settings.DescTPU')} <br/>${_t('settings.RequireTPUPlugin')}
                      </div>
                    </div>
                    <div class="vertical center-justified layout setting-button">
                      <mwc-switch id="tpu-switch" ?checked="${this.options['tpu']}" disabled></mwc-switch>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </lablup-activity-panel>
      </div>
    `;
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null) {
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

  /**
   * Image pulling behavior, scheduler, and resource slots setting update
   * */
  updateSettings() {
    globalThis.backendaiclient.setting.get('docker/image/auto_pull').then((response) => {
      if (response['result'] === null || response['result'] === 'digest') { // digest mode
        this.options['image_pulling_behavior'] = 'digest';
      } else if (response['result'] === 'tag') {
        this.options['image_pulling_behavior'] = 'tag';
      } else {
        this.options['image_pulling_behavior'] = 'none';
      }
      this.update(this.options);
    });
    globalThis.backendaiclient.setting.list('plugins/scheduler').then((response) => {
      if (response['result'] === null || Object.keys(response['result']).length === 0) { // digest mode
        this.options['scheduler'] = 'fifo';
      } else {
        this.options['scheduler'] = this.scheduler;
      }
      this.update(this.options);
    });
    globalThis.backendaiclient.setting.get(`plugins/scheduler/${this.scheduler}/num_retries_to_skip`)
    .then((response) =>{ 
      if (response['result'] === null) {
        this.options['num_retries_to_skip'] = '0';
      } else {
        this.options['num_retries_to_skip'] = response['result'];
      }
      this.update(this.options);
    })
    globalThis.backendaiclient.get_resource_slots().then((response) => {
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

  /**
   * Set image pulling behavior and notify.
   *
   * @param {HTMLElement} e - component that contains image data for pulling
   * @return {boolean} true when set
   * */
  setImagePullingBehavior(e) {
    if (e.target.selected === null) return false;
    const value = e.target.selected.value;
    if (value !== this.options['image_pulling_behavior'] && ['none', 'digest', 'tag'].includes(value)) {
      globalThis.backendaiclient.setting.set('docker/image/auto_pull', value).then((response) => {
        this.options['image_pulling_behavior'] = value;
        this.notification.text = _text('notification.SuccessfullyUpdated');
        this.notification.show();
        this.update(this.options);
        console.log(response);
      });
    }
    return true;
  }

  /**
   * Change Scheduler and notify.
   *
   * @param {HTMLElement} e - scheduler setting component
   * */
  changeScheduler(e) {
    const scheduler = e.target.value;
    if (['fifo', 'lifo', 'drf'].includes(scheduler)) {
      const detail = {
        'num_retries_to_skip': 0
      };
      globalThis.backendaiclient.setting.set(`plugins/scheduler/${scheduler}`, detail).then((response) => {
        this.notification.text = _text('settings.JobSchedulerUpdated');
        this.notification.show();
        this.scheduler = scheduler;
        localStorage.setItem('backendaiclient.settings.scheduler', this.scheduler);
        // console.log(response);
      }).catch((err) => {
        this.notification.text = PainKiller.relieve('Couldn\'t update scheduler setting.');
        this.notification.detail = err;
        this.notification.show(true, err);
      });
    }
  }

  /**
   * Change numRetriesToSkip.
   * */
  changeNumRetriesToSkip() {
    let num_retries = this.shadowRoot.querySelector('#num-retries').value;
    num_retries = num_retries === '' ? '0' : num_retries;
    // update only when num_retries is Number.
    if (num_retries.match(/^[0-9]*$/)) {
      // currently, only support when scheduler type is fifo.
      if (this.scheduler === 'fifo') {
        num_retries = parseInt(num_retries).toString();
        globalThis.backendaiclient.setting.set(`plugins/scheduler/${this.scheduler}/num_retries_to_skip`, num_retries)
        .then((response) => {
          this.notification.text = _text('notification.SuccessfullyUpdated');
          this.notification.show();
        })
        .catch((err) => {
            this.notification.text = PainKiller.relieve('Couldn\'t update session setting.');
            this.notification.detail = err;
            this.notification.show(true, err);
        })
      } else if (num_retries !== '0') {
        this.notification.text = _text('settings.FifoOnly');
        this.notification.show();
        num_retries = '0';
      }
      this.options['num_retries_to_skip'] = this.shadowRoot.querySelector('#num-retries').value = num_retries;
      this.update(this.options);
    } else {
      this.notification.text = _text('settings.NumbersOnly');
      this.notification.show();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-settings-view': BackendAiSettingsView;
  }
}
