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
  @property({type: String}) selectedSchedulerType = 'fifo';
  @property({type: String}) _helpDescriptionTitle = '';
  @property({type: String}) _helpDescription = '';

  constructor() {
    super();

    this.options = {
      image_pulling_behavior: 'digest',
      cuda_gpu: false,
      cuda_fgpu: false,
      rocm_gpu: false,
      tpu: false,
      scheduler: 'fifo',
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

        .session-item-title {
          font-size: 12px;
          color: #404040;
          font-weight: 400;
        }

        .subheading {
          width: 100%;
          margin-top: 20px;
          padding-left: 15px;
        }

        #help-description {
          --component-width: 350px;
        }

        #env-dialog {
          --component-max-height: 800px;
          --component-width: 400px;
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
                      <div class="description-shrink">${_t('settings.SchedulerConfiguration')}<br/>
                          ${_t('settings.Require1912orAbove')}
                      </div>
                    </div>
                    <div class="vertical center-justified layout">
                      <mwc-button
                        unelevated
                        icon="rule"
                        label="${_t('settings.Config')}"
                        style="float:right; width:85px;"
                        @click="${()=>this._showDialog()}"></mwc-button>
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
        <backend-ai-dialog id="env-dialog" fixed backdrop persistent>
          <span slot="title" class="horizontal layout center">${_t('settings.SchedulerDefault')}</span>
          <span slot="action">
            <mwc-icon-button icon="info" @click="${(e) => this._showConfigDescription(e, 'default')}" style="pointer-events:auto;"></mwc-icon-button>
          </span>
          <div slot="content" class="vertical layout" style="width: 100%;">
            <mwc-select id="scheduler-switch" required label="${_t('settings.SchedulerType')}" 
              style="margin-bottom: 10px;" @selected="${(e) => this.changeSelectedScheduleType(e)}">
              ${this.jobschedulerType.map((item) => html`
                <mwc-list-item value="${item}">
                  ${item}
                </mwc-list-item>`)}
            </mwc-select>
            <h4>${_t('settings.SchedulerOptions')}</h4>
            <div class="horizontal center layout flex">
              <span slot="title">${_t('settings.SessionCreationRetries')}</span>
              <mwc-icon-button icon="info" @click="${(e) => this._showConfigDescription(e, 'retries')}" style="pointer-events:auto;"></mwc-icon-button>
              <mwc-textfield  id="num-retries"
                              outlined
                              charCounter
                              autoValidate
                              maxLength="3"
                              value="${this.options['num_retries_to_skip']}"
                              pattern="[0-9]+"
                              style="margin-left:auto;">
              </mwc-textfield>
            </div>
            <div slot="footer" class="horizontal end-justified flex layout" style="margin-top: 20px;">
              <mwc-button
                  unelevated
                  id="config-cancel-button"
                  style="width:auto;margin-right:10px;"
                  @click="${() => this._closeDialog()}">
                <span>${_t('button.Cancel')}</span>
              </mwc-button>
              <mwc-button
                  outlined
                  id="config-save-button"
                  style="width:auto;"
                  @click="${() => this.saveAndCloseDialog()}">
                <span>${_t('button.Save')}</span>
              </mwc-button>
            </div>
          </div>
        </backend-ai-dialog>
        <backend-ai-dialog id="help-description" fixed backdrop>
          <span slot="title">${this._helpDescriptionTitle}</span>
          <div slot="content" class="horizontal layout">${this._helpDescription}</div>
        </backend-ai-dialog>
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

  _showDialog() {
    const modifyEnvDialog = this.shadowRoot.querySelector('#env-dialog');
    modifyEnvDialog.show();
  }

  _closeDialog() {
    const modifyEnvDialog = this.shadowRoot.querySelector('#env-dialog');
    modifyEnvDialog.hide();
  }

  _showConfigDescription(e, item) {
    e.stopPropagation();
    const schedulerConfigDescription = {
      'default': {
        'title': _text('settings.SchedulerDefault'),
        'desc': _text('settings.SchedulerDefaultDescription')
      },
      'retries': {
        'title': _text('settings.SessionCreationRetries'),
        'desc': _text('settings.SessionCreationRetriesDescription')
      }
    };
    if (item in schedulerConfigDescription) {
      this._helpDescriptionTitle = schedulerConfigDescription[item].title;
      this._helpDescription = schedulerConfigDescription[item].desc;
      const desc = this.shadowRoot.querySelector('#help-description');
      desc.show();
    }
  }

  /**
   * Update etcd scheduler options(num_retries_to_skip) and close the dialog.
   */
  saveAndCloseDialog() {
    let tempNumRetries = this.shadowRoot.querySelector('#num-retries').value;
    tempNumRetries = tempNumRetries === '' ? '0' : tempNumRetries;
    if (['fifo', 'lifo', 'drf'].includes(this.selectedSchedulerType) && tempNumRetries.match(/^[0-9]*$/)) {
      // currently, only support when scheduler type is fifo.
      if (this.selectedSchedulerType === 'fifo' || (this.selectedSchedulerType !== 'fifo' && tempNumRetries === '0')) {
        const numRetries = parseInt(tempNumRetries).toString();
        globalThis.backendaiclient.setting.set(`plugins/scheduler/${this.selectedSchedulerType}/num_retries_to_skip`, numRetries)
        .then((response) => {
          this.notification.text = _text('notification.SuccessfullyUpdated');
          this.notification.show();
          this.options['scheduler'] = this.selectedSchedulerType;
          this.options['num_retries_to_skip'] = numRetries;
          this.update(this.options);
          this._closeDialog();
        })
        .catch((err) => {
          this.notification.text = PainKiller.relieve('Couldn\'t update scheduler setting.');
          this.notification.detail = err;
          this.notification.show(true, err);
        })
      } else if (tempNumRetries !== '0') {
        this.notification.text = _text('settings.FifoOnly');
        this.notification.show();
        this.shadowRoot.querySelector('#num-retries').value = '0';
      }
    } else {
      this.notification.text = _text('settings.InvalidValue');
      this.notification.show();
    }
  }

  /**
   * Change this.selectedSchedulerType value and 
   * 
   * @param {HTMLElement} e - scheduler setting component
   */
  changeSelectedScheduleType(e) {
    this.selectedSchedulerType = e.target.value;
    globalThis.backendaiclient.setting.get(`plugins/scheduler/${this.selectedSchedulerType}/num_retries_to_skip`).then((response) => { 
      if (response['result'] === null) {
        this.shadowRoot.querySelector('#num-retries').value = '0';
      } else {
        this.shadowRoot.querySelector('#num-retries').value = response['result'];
      }
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-settings-view': BackendAiSettingsView;
  }
}
