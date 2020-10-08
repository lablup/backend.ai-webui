/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-item/paper-item';

import '@material/mwc-select';
import '../plastics/mwc/mwc-multi-select';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-icon-button';
import '@material/mwc-textfield/mwc-textfield';

import 'weightless/card';
import 'weightless/checkbox';
import 'weightless/icon';
import 'weightless/label';
import 'weightless/progress-bar';

import '@material/mwc-linear-progress';

import './lablup-slider';
import './backend-ai-dialog';

import {default as PainKiller} from "./backend-ai-painkiller";

import '../plastics/lablup-shields/lablup-shields';
import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

@customElement("backend-ai-resource-monitor")
export default class BackendAiResourceMonitor extends BackendAIPage {
  @property({type: Boolean}) is_connected = false;
  @property({type: String}) direction = "horizontal";
  @property({type: String}) location = '';
  @property({type: Object}) aliases = Object();
  @property({type: Object}) total_slot;
  @property({type: Object}) total_resource_group_slot;
  @property({type: Object}) total_project_slot;
  @property({type: Object}) used_slot;
  @property({type: Object}) used_resource_group_slot;
  @property({type: Object}) used_project_slot;
  @property({type: Object}) available_slot;
  @property({type: Number}) concurrency_used;
  @property({type: Number}) concurrency_max;
  @property({type: Number}) concurrency_limit;
  @property({type: Object}) used_slot_percent;
  @property({type: Object}) used_resource_group_slot_percent;
  @property({type: Object}) used_project_slot_percent;
  @property({type: String}) default_language;
  @property({type: Boolean}) _status;
  @property({type: Number}) num_sessions;
  @property({type: String}) scaling_group;
  @property({type: Array}) scaling_groups;
  @property({type: Array}) sessions_list;
  @property({type: Boolean}) metric_updating;
  @property({type: Boolean}) metadata_updating;
  @property({type: Boolean}) aggregate_updating = false;
  @property({type: Object}) scaling_group_selection_box;
  @property({type: Object}) resourceGauge = Object();
  @property({type: Boolean}) project_resource_monitor = false;
  @property({type: Object}) resourceBroker;

  constructor() {
    super();
    this.active = false;
    this.resourceBroker = globalThis.resourceBroker;
    this.notification = globalThis.lablupNotification;
    this.init_resource();
  }

  static get is() {
    return 'backend-ai-resource-monitor';
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
        mwc-linear-progress {
          height: 5px;
          --mdc-theme-primary: #98be5a;
        }

        wl-progress-bar {
          --progress-bar-height: 17px;
          --progress-bar-bg: #e8e8e8;
          border-radius: 3px;
          margin: 3px auto;
        }

        .horizontal-panel wl-progress-bar {
          width: 90px;
        }

        .vertical-panel wl-progress-bar {
          width: 186px;
        }

        wl-progress-bar.start-bar,
        .full-bar {
          --progress-bar-color: linear-gradient(to left, #722cd7, #5c7cfa);
        }

        wl-progress-bar.end-bar {
          --progress-bar-color: linear-gradient(to left, #18aa7c, #60bb43),
                             linear-gradient(to left, #722cd7, #5c7cfa);
        }

        .horizontal-card {
          width: auto;
        }

        .vertical-card {
          margin: 20px;
        }

        .horizontal-panel mwc-linear-progress {
          width: 90px;
        }

        .vertical-panel mwc-linear-progress {
          width: 186px;
        }

        #scaling-group-select-box {
          min-height: 100px;
          padding-top: 20px;
          padding-left: 20px;
          background-color: #F6F6F6;
        }

        .vertical-panel #resource-gauges {
          min-height: 200px;
        }

        mwc-linear-progress.project-bar {
          height: 15px;
        }

        mwc-linear-progress.start-bar {
          border-top-left-radius: 3px;
          border-top-right-radius: 3px;
          --mdc-theme-primary: #3677eb;
        }

        mwc-linear-progress.middle-bar {
          --mdc-theme-primary: #4f8b46;
        }

        mwc-linear-progress.end-bar {
          border-bottom-left-radius: 3px;
          border-bottom-right-radius: 3px;
          --mdc-theme-primary: #98be5a;
        }

        mwc-linear-progress.full-bar {
          border-radius: 3px;
          height: 10px;
        }

        .resources.horizontal .short-indicator mwc-linear-progress {
          width: 50px;
        }

        .resources.horizontal .short-indicator {
          width: 50px;
        }
        span.caption {
          width: 30px;
          display: block;
          font-size: 12px;
          padding-left: 10px;
        }

        div.caption {
          font-size: 12px;
          width: 100px;
        }

        #resource-gauges.horizontal {
          /* left: 160px; */
          /* width: 420px; */
          width: auto;
          height: auto;
          background-color: transparent;
        }

        wl-icon {
          --icon-size: 24px;
        }

        img.resource-type-icon {
          width: 24px;
          height: 24px;
        }

        @media screen and (max-width: 749px) {
          #resource-gauge-toggle.horizontal {
            display: flex;
          }

          #resource-gauge-toggle.vertical {
            display: none;
          }

          #resource-gauges.horizontal {
            display: none;
          }

          #resource-gauges.vertical {
            display: flex;
          }

        }

        @media screen and (min-width: 750px) {
          #resource-gauge-toggle {
            display: none;
          }

          #resource-gauges.horizontal,
          #resource-gauges.vertical {
            display: flex;
          }
        }

        div.resource-type {
          font-size: 14px;
          width: 70px;
        }

        .resources.horizontal .monitor.session {
          margin-left: 5px;
        }

        .gauge-name {
          float: right;
          font-size: 14px;
          font-weight: bold;
          color: #2f2f2f;
        }

        div.progress-bar {
          position: relative;
        }

        div.progress-bar > span.gauge-label {
          position: absolute;
          left: 0.5em;
          top: 25%;
          z-index: 1;
          color: #2f2f2f;
        }

        .gauge-label {
          width: inherit;
          font-weight: bold;
          font-size: 10px;
          color: #2f2f2f;
        }

        span.percentage {
          font-size: 10px;
          color: #2f2f2f;
        }

        span.start-bar {
          margin: auto auto 5px 5px;
        }

        span.end-bar {
          margin: 5px auto auto 5px;
        }

        .indicator {
          font-family: monospace;
        }

        .resource-button {
          height: 140px;
          width: 120px;
          margin: 5px;
          padding: 0;
          font-size: 14px;
        }

        #new-session-dialog {
          z-index: 100;
        }

        #scaling-group-select-box mwc-select {
          width: 305px;
          font-family: var(--general-font-family);
          --mdc-typography-subtitle1-font-family: var(--general-font-family);
          --mdc-typography-subtitle1-font-size: 16px;
          --mdc-typography-subtitle1-font-color: rgb(24, 24, 24);
          --mdc-typography-subtitle1-font-weight: 400;
          --mdc-typography-subtitle1-line-height: 16px;
          --mdc-select-fill-color: rgba(255, 255, 255, 1.0);
          --mdc-select-label-ink-color: rgba(24, 24, 24, 1.0);
          --mdc-select-disabled-ink-color: rgba(24, 24, 24, 1.0);
          --mdc-select-dropdown-icon-color: rgba(24, 24, 24, 1.0);
          --mdc-select-focused-dropdown-icon-color: rgba(24, 24, 24, 0.87);
          --mdc-select-disabled-dropdown-icon-color: rgba(24, 24, 24, 0.87);
          --mdc-select-idle-line-color: transparent;
          --mdc-select-hover-line-color: rgba(255, 255, 255, 0.87);
          --mdc-select-ink-color: rgb(24, 24, 24);
          --mdc-select-outlined-idle-border-color: rgba(24, 24, 24, 0.42);
          --mdc-select-outlined-hover-border-color: rgba(24, 24, 24, 0.87);
          --mdc-theme-surface: white;
          --mdc-list-vertical-padding: 5px;
          --mdc-list-side-padding: 10px;
          --mdc-menu-item-height: 28px;
          --mdc-list-item__primary-text: {
            height: 20px;
            color: #222222;
          };
          margin-bottom: 5px;
        }

        #scaling-group-select {
          width: 305px;
          height: 55px;
          --mdc-select-outlined-idle-border-color: #dddddd;
          --mdc-select-outlined-hover-border-color: #dddddd;
         background-color: white!important;
         border-radius: 5px;
        }

        wl-button.resource-button.iron-selected {
          --button-color: var(--paper-red-600);
          --button-bg: var(--paper-red-600);
          --button-bg-active: var(--paper-red-600);
          --button-bg-hover: var(--paper-red-600);
          --button-bg-active-flat: var(--paper-orange-50);
          --button-bg-flat: var(--paper-orange-50);
        }

        .resource-button h4 {
          padding: 5px 0;
          margin: 0;
          font-weight: 400;
        }

        .resource-button ul {
          padding: 0;
          list-style-type: none;
        }

        .resources .monitor {
          margin-right: 5px;
        }

        .resources.vertical .monitor {
          margin-bottom: 10px;
        }

        mwc-select,
        mwc-multi-select {
          width: 100%;
          font-family: var(--general-font-family);
          --mdc-typography-subtitle1-font-family: var(--general-font-family);
          --mdc-theme-primary: var(--general-sidebar-color);
          --mdc-select-fill-color: transparent;
          --mdc-select-label-ink-color: rgba(0, 0, 0, 0.75);
          --mdc-select-dropdown-icon-color: rgba(255, 0, 0, 0.87);
          --mdc-select-focused-dropdown-icon-color: rgba(255, 0, 0, 0.42);
          --mdc-select-disabled-dropdown-icon-color: rgba(255, 0, 0, 0.87);
          --mdc-select-idle-line-color: rgba(0, 0, 0, 0.42);
          --mdc-select-hover-line-color: rgba(255, 0, 0, 0.87);
          --mdc-select-outlined-idle-border-color: rgba(255, 0, 0, 0.42);
          --mdc-select-outlined-hover-border-color: rgba(255, 0, 0, 0.87);
          --mdc-theme-surface: white;
          --mdc-list-vertical-padding: 5px;
          --mdc-list-side-padding: 25px;
          --mdc-list-item__primary-text: {
            height: 20px;
          };
        }

        div.mdc-select__anchor {
          background-color: white !important;
        }

        mwc-textfield {
          width: 100%;
          --mdc-text-field-idle-line-color: rgba(0, 0, 0, 0.42);
          --mdc-text-field-hover-line-color: rgba(255, 0, 0, 0.87);
          --mdc-text-field-fill-color: transparent;
          --mdc-theme-primary: var(--paper-red-600);
        }

        mwc-textfield#session-name {
          width: 50%;
          padding-top: 20px;
          padding-left: 0;
          margin-left: 0;
          margin-bottom: 1px;
        }

        wl-button[fab] {
          --button-fab-size: 70px;
          border-radius: 6px;
        }

        wl-label {
          margin-right: 10px;
          outline: none;
        }

        .resource-name {
          width: 60px;
          text-align: right; 
          display: inline-block !important;
          margin: auto 20px auto 0px;
        }

      `];
  }

  init_resource() {
    this.total_slot = {};
    this.total_resource_group_slot = {};
    this.total_project_slot = {};
    this.used_slot = {};
    this.used_resource_group_slot = {};
    this.used_project_slot = {};
    this.available_slot = {};
    this.used_slot_percent = {};
    this.used_resource_group_slot_percent = {};
    this.used_project_slot_percent = {};
    this.concurrency_used = 0;
    this.concurrency_max = 0;
    this.concurrency_limit = 0;
    this._status = 'inactive';
    this.scaling_groups = [{name: ''}]; // if there is no scaling group, set the name as empty string
    this.scaling_group = '';
    this.sessions_list = [];
    this.metric_updating = false;
    this.metadata_updating = false;
  }

  firstUpdated() {
    this.resourceGauge = this.shadowRoot.querySelector('#resource-gauges');
    if (document.body.clientWidth < 750 && this.direction == 'horizontal') {
      this.resourceGauge.style.display = 'none';
    }
    document.addEventListener("backend-ai-group-changed", (e) => {
      // this.scaling_group = '';
      this._updatePageVariables(true);
    });
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.is_connected = true;
      }, {once: true});
    } else {
      this.is_connected = true;
    }
    document.addEventListener('backend-ai-session-list-refreshed', () => {
      this._updatePageVariables(true);
    });
  }

  _updateSelectedScalingGroup() {
    let Sgroups = this.shadowRoot.querySelector('#scaling-groups');
    let selectedSgroup = Sgroups.items.find(item => item.value === this.resourceBroker.scaling_group);
    let idx = Sgroups.items.indexOf(selectedSgroup);
    Sgroups.select(idx);
  }

  async updateScalingGroup(forceUpdate = false, e) {
    await this.resourceBroker.updateScalingGroup(forceUpdate, e.target.value);
    if (this.active) {
      if (this.direction === 'vertical') {
        const scaling_group_selection_box = this.shadowRoot.querySelector('#scaling-group-select-box');
        scaling_group_selection_box.firstChild.value = this.resourceBroker.scaling_group;
      }
      if (forceUpdate === true) {
        await this._refreshResourcePolicy();
        this.aggregateResource('update-scaling-group');
      } else {
      }
    }
  }

  async _viewStateChanged(active) {
    await this.updateComplete;

    if (!this.active) {
      return;
    }
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.project_resource_monitor = this.resourceBroker.allow_project_resource_monitor;
        this._updatePageVariables(true);
        this._disableEnterKey();
      }, {once: true});
    } else {
      this.project_resource_monitor = this.resourceBroker.allow_project_resource_monitor;
      await this._updatePageVariables(true);
      this._disableEnterKey();
    }
  }

  async _updatePageVariables(isChanged) {
    if (this.active && this.metadata_updating === false) {
      this.metadata_updating = true;
      await this.resourceBroker._updatePageVariables(isChanged);
      setTimeout(() => {
        this._updateScalingGroupSelector();
      }, 1000);
      this.sessions_list = this.resourceBroker.sessions_list;
      await this._refreshResourcePolicy();
      this.aggregateResource('update-page-variable');
      this.metadata_updating = false;
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  _updateScalingGroupSelector() {
    if (this.direction === 'vertical') {
      const scaling_group_selection_box = this.shadowRoot.querySelector('#scaling-group-select-box'); // monitor SG selector
      // Detached from template to support live-update after creating new group (will need it)
      if (scaling_group_selection_box.hasChildNodes()) {
        scaling_group_selection_box.removeChild(scaling_group_selection_box.firstChild);
      }
      const scaling_select = document.createElement('mwc-select');
      scaling_select.label = _text('session.launcher.ResourceGroup');
      scaling_select.id = 'scaling-group-select';
      scaling_select.value = this.scaling_group;
      scaling_select.setAttribute('fullwidth', 'true');
      scaling_select.setAttribute('outlined', 'true');
      scaling_select.addEventListener('selected', this.updateScalingGroup.bind(this, true));
      let opt = document.createElement('mwc-list-item');
      opt.setAttribute('disabled', 'true');
      opt.innerHTML = _text('session.launcher.SelectResourceGroup');
      opt.style.borderBottom = "1px solid #ccc";
      scaling_select.appendChild(opt);
      this.resourceBroker.scaling_groups.map(group => {
        opt = document.createElement('mwc-list-item');
        opt.value = group.name;
        opt.setAttribute('graphic', 'icon');
        if (this.resourceBroker.scaling_group === group.name) {
          opt.selected = true;
        } else {
          opt.selected = false;
        }
        opt.innerHTML = group.name;
        scaling_select.appendChild(opt);
      });
      //scaling_select.updateOptions();
      scaling_group_selection_box.appendChild(scaling_select);
    }
  }

  async _refreshResourcePolicy() {
    return this.resourceBroker._refreshResourcePolicy().then(() => {
      this.concurrency_used = this.resourceBroker.concurrency_used;
      //this.userResourceLimit = this.resourceBroker.userResourceLimit;
      this.concurrency_max = this.resourceBroker.concurrency_max;
      //this.updateResourceAllocationPane('refresh resource policy');
    }).catch((err) => {
      console.log(err);
      this.metadata_updating = false;
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      } else if (err && err.title) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.show(true, err);
      }
    });
  }

  _aliasName(value) {
    let alias = {
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
      'tpu': 'TPU:TPUv3',
      'rocm': 'GPU:ROCm',
      'cuda9': 'GPU:CUDA9',
      'cuda10': 'GPU:CUDA10',
      'cuda10.0': 'GPU:CUDA10',
      'cuda10.1': 'GPU:CUDA10.1',
      'cuda10.2': 'GPU:CUDA10.2',
      'cuda10.3': 'GPU:CUDA10.3',
      'cuda11': 'GPU:CUDA11',
      'cuda11.0': 'GPU:CUDA11',
      'cuda11.1': 'GPU:CUDA11.1',
      'cuda11.2': 'GPU:CUDA11.2',
      'miniconda': 'Miniconda',
      'anaconda2018.12': 'Anaconda 2018.12',
      'anaconda2019.12': 'Anaconda 2019.12',
      'alpine3.8': 'Alpine Linux 3.8',
      'ngc': 'Nvidia GPU Cloud',
      'ff': 'Research Env.',
    };
    if (value in alias) {
      return alias[value];
    } else {
      return value;
    }
  }

  async _aggregateResourceUse(from: string = '') {
    return this.resourceBroker._aggregateCurrentResource(from).then((res) => {
      if (res === false) {
        return setTimeout(() => {
          this._aggregateResourceUse(from);
        }, 1000);
      }
      this.concurrency_used = this.resourceBroker.concurrency_used;
      this.scaling_group = this.resourceBroker.scaling_group;
      this.scaling_groups = this.resourceBroker.scaling_groups;
      this.total_slot = this.resourceBroker.total_slot;
      this.total_resource_group_slot = this.resourceBroker.total_resource_group_slot;
      this.total_project_slot = this.resourceBroker.total_project_slot;
      this.used_slot = this.resourceBroker.used_slot;
      this.used_resource_group_slot = this.resourceBroker.used_resource_group_slot;
      this.used_project_slot = this.resourceBroker.used_project_slot;
      this.used_project_slot_percent = this.resourceBroker.used_project_slot_percent;
      this.concurrency_limit = this.resourceBroker.concurrency_limit;
      this.available_slot = this.resourceBroker.available_slot;
      this.used_slot_percent = this.resourceBroker.used_slot_percent;
      this.used_resource_group_slot_percent = this.resourceBroker.used_resource_group_slot_percent;
      //this.requestUpdate();
      return Promise.resolve(true);
      return this.available_slot;
    }).catch(err => {
      if (err && err.message) {
        console.log(err);
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
      return Promise.resolve(false);
    });
  }

  // Get available / total resources from manager
  aggregateResource(from: string = '') {
    //console.log('aggregate resource called - ', from);
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._aggregateResourceUse(from);
      }, true);
    } else {
      this._aggregateResourceUse(from);
    }
  }

  _toggleResourceGauge() {
    if (this.resourceGauge.style.display == '' || this.resourceGauge.style.display == 'flex' || this.resourceGauge.style.display == 'block') {
      this.resourceGauge.style.display = 'none';
    } else {
      if (document.body.clientWidth < 750) {
        this.resourceGauge.style.left = '20px';
        this.resourceGauge.style.right = '20px';
        this.resourceGauge.style.backgroundColor = 'var(--paper-red-800)';
      } else {
        this.resourceGauge.style.backgroundColor = 'transparent';
      }
      this.resourceGauge.style.display = 'flex';
    }
  }

  _disableEnterKey() {
    this.shadowRoot.querySelectorAll('wl-expansion').forEach(element => {
      element.onKeyDown = (e) => {
        let enterKey = 13;
        if (e.keyCode === enterKey) {
          e.preventDefault();
        }
      }
    });
  }

  render() {
    // language=HTML
    return html`
      ${this.direction === 'vertical' ? html`
      <div id="scaling-group-select-box" class="layout horizontal start-justified">
      </div>
      ` : html``}
      <div class="layout ${this.direction}-card">
        <mwc-icon-button id="resource-gauge-toggle" icon="assessment" class="fg blue ${this.direction}"
          @click="${() => this._toggleResourceGauge()}">
        </mwc-icon-button>
        <div id="resource-gauges" class="layout ${this.direction} ${this.direction}-panel resources flex" style="align-items: flex-start">
        ${this.direction === 'horizontal' ? html`
          <div class="layout vertical end-justified wrap short-indicator">
            <span class="gauge-label">
              <p>
                ${_t('session.launcher.TOTAL')}<br />${_t('session.launcher.RESOURCE')}<br />${_t('session.launcher.MY')}
              </p>
          </div>
          ` : html``}
          <div class="layout horizontal center-justified monitor">
            <div class="layout vertical center center-justified resource-name">
              <div class="gauge-name">CPU</div>
            </div>
            <div class="layout vertical start-justified wrap">
              <div class="progress-bar">
                <span class="gauge-label">${this.used_resource_group_slot.cpu}/${this.total_resource_group_slot.cpu}</span>
                <!-- <mwc-linear-progress id="cpu-usage-bar" class="start-bar" progress="${this.used_resource_group_slot_percent.cpu / 100.0}"></mwc-linear-progress> -->
                <wl-progress-bar id="cpu-usage-bar" class="start-bar" mode="determinate"
                    value="${this.used_resource_group_slot_percent.cpu / 100.0}">
                </wl-progress-bar>
              </div>
              <div class="progress-bar">
                <span class="gauge-label">${this.used_slot.cpu}/${this.total_slot.cpu}</span>
                <!-- <mwc-linear-progress id="cpu-usage-bar-2" class="end-bar" progress="${this.used_slot_percent.cpu / 100.0}"></mwc-linear-progress> -->
                <wl-progress-bar id="cpu-usage-bar-2" class="end-bar" mode="determinate"
                    value="${this.used_slot_percent.cpu / 100.0}">
                </wl-progress-bar>
              </div>
            </div>
            <div class="layout vertical center center-justified">
              <span class="percentage start-bar">${parseInt(this.used_resource_group_slot_percent.cpu) + '%'}</span>
              <span class="percentage end-bar">${parseInt(this.used_slot_percent.cpu) + '%'}</span>
            </div>
          </div>
          <div class="layout horizontal center-justified monitor">
            <div class="layout vertical center center-justified resource-name">
              <span class="gauge-name">RAM</span>
            </div>
            <div class="layout vertical start-justified wrap">
              <div class="progress-bar">
                <span class="gauge-label">${this.used_resource_group_slot.mem}/${this.total_resource_group_slot.mem}GB</span>
                <wl-progress-bar id="mem-usage-bar" class="start-bar" mode="determinate"
                    value="${this.used_resource_group_slot_percent.mem / 100.0}"></wl-progress-bar>
                <!-- <mwc-linear-progress id="mem-usage-bar" class="start-bar" progress="${this.used_resource_group_slot_percent.mem / 100.0}"></mwc-linear-progress> -->
              </div>
              <div class="progress-bar">
                <span class="gauge-label">${this.used_slot.mem}/${this.total_slot.mem}GB</span>
                <wl-progress-bar id="mem-usage-bar-2" class="end-bar" mode="determinate"
                    value="${this.used_slot_percent.mem / 100.0}"></wl-progress-bar>
                <!-- <mwc-linear-progress id="mem-usage-bar-2" class="end-bar" progress="${this.used_slot_percent.mem / 100.0}"></mwc-linear-progress> -->
              </div>
            </div>
            <div class="layout vertical center center-justified">
              <span class="percentage start-bar">${parseInt(this.used_resource_group_slot_percent.mem) + '%'}</span>
              <span class="percentage end-bar">${parseInt(this.used_slot_percent.mem) + '%'}</span>
            </div>
          </div>
          ${this.total_slot.cuda_device ?
      html`
          <div class="layout horizontal center-justified monitor">
            <div class="layout vertical center center-justified resource-name">
              <span class="gauge-name">GPU</span>
            </div>
            <div class="layout vertical center-justified wrap short-indicator">
              <div class="progress-bar">
                <span class="gauge-label">${this.used_resource_group_slot.cuda_device}/${this.total_resource_group_slot.cuda_device}</span>
                <wl-progress-bar id="gpu-usage-bar" class="start-bar" mode="determinate"
                    value="${this.used_resource_group_slot_percent.cuda_device / 100.0}"></wl-progress-bar>
                <!-- <mwc-linear-progress id="gpu-usage-bar" class="start-bar" progress="${this.used_resource_group_slot_percent.cuda_device / 100.0}"></mwc-linear-progress> -->
              </div>
              <div class="progress-bar">
                <span class="gauge-label">${this.used_slot.cuda_device}/${this.total_slot.cuda_device}</span>
                <wl-progress-bar id="gpu-usage-bar-2" class="end-bar" mode="determinate"
                    value="${this.used_slot_percent.cuda_device / 100.0}"></wl-progress-bar>
                <!-- <mwc-linear-progress id="gpu-usage-bar-2" class="end-bar" progress="${this.used_slot_percent.cuda_device / 100.0}"></mwc-linear-progress> -->
              </div>
            </div>
            <div class="layout vertical center center-justified">
              <span class="percentage start-bar">${parseInt(this.used_resource_group_slot_percent.cuda_device) + '%'}</span>
              <span class="percentage end-bar">${parseInt(this.used_slot_percent.cuda_device) + '%'}</span>
            </div>
          </div>` :
      html``}
          ${this.total_slot.cuda_shares && this.total_slot.cuda_shares > 0 ?
      html`
          <div class="layout horizontal center-justified monitor">
            <div class="layout vertical center center-justified resource-name">
              <span class="gauge-name">FGPU</span>
            </div>
            <div class="layout vertical start-justified wrap short-indicator">
              <div class="progress-bar">
                <span class="gauge-label">${this.used_resource_group_slot.cuda_shares}/${this.total_resource_group_slot.cuda_shares}</span>
                <wl-progress-bar id="gpu-usage-bar" class="start-bar" mode="determinate"
                    value="${this.used_resource_group_slot_percent.cuda_shares / 100.0}"></wl-progress-bar>
                <!-- <mwc-linear-progress id="gpu-usage-bar" class="start-bar" progress="${this.used_resource_group_slot_percent.cuda_shares / 100.0}"></mwc-linear-progress> -->
              </div>
              <div class="progress-bar">
                <span class="gauge-label">${this.used_slot.cuda_shares}/${this.total_slot.cuda_shares}</span>
                <wl-progress-bar id="gpu-usage-bar-2" class="end-bar" mode="determinate"
                    value="${this.used_slot_percent.cuda_shares / 100.0}"></wl-progress-bar>
                <!-- <mwc-linear-progress id="gpu-usage-bar-2" class="end-bar" progress="${this.used_slot_percent.cuda_shares / 100.0}"></mwc-linear-progress> -->
              </div>
            </div>
            <div class="layout vertical center center-justified">
              <span class="percentage start-bar">${parseInt(this.used_resource_group_slot_percent.cuda_shares) + '%'}</span>
              <span class="percentage end-bar">${parseInt(this.used_slot_percent.cuda_shares) + '%'}</span>
            </div>
          </div>` :
      html``}
          ${this.total_slot.rocm_device_slot ?
      html`
          <div class="layout horizontal center-justified monitor">
            <div class="layout vertical center center-justified resource-name">
              <img class="resource-type-icon fg green" src="/resources/icons/ROCm.png" />
              <span class="gauge-name">ROCm<br/>GPU</span>
            </div>
            <div class="layout vertical center-justified wrap short-indicator">
              <div class="progress-bar">
                <span class="gauge-label">${this.used_resource_group_slot.rocm_device_slot}/${this.total_resource_group_slot.rocm_device_slot}</span>
                <wl-progress-bar id="gpu-usage-bar" class="start-bar" mode="determinate"
                  value="${this.used_resource_group_slot_percent.rocm_device_slot / 100.0}"></wl-progress-bar>
                <!-- <mwc-linear-progress id="gpu-usage-bar" class="start-bar" progress="${this.used_resource_group_slot_percent.rocm_device_slot / 100.0}" buffer="${this.used_resource_group_slot_percent.rocm_device_slot / 100.0}"></mwc-linear-progress> -->
              </div>
              <div class="progress-bar">
                <span class="gauge-label">${this.used_slot.rocm_device_slot}/${this.total_slot.rocm_device_slot}</span>
                <wl-progress-bar id="gpu-usage-bar-2" class="end-bar" mode="determinate" value="${this.used_slot_percent.rocm_device_slot / 100.0}"></wl-progress-bar>
                <!-- <mwc-linear-progress id="gpu-usage-bar-2" class="end-bar" progress="${this.used_slot_percent.rocm_device_slot / 100.0}" buffer="${this.used_slot_percent.rocm_device_slot / 100.0}"></mwc-linear-progress> -->
              </div>
            </div>
            <div class="layout vertical center center-justified">
              <span class="percentage start-bar">${parseInt(this.used_resource_group_slot_percent.rocm_device_slot) + '%'}</span>
              <span class="percentage end-bar">${parseInt(this.used_slot_percent.rocm_device_slot) + '%'}</span>
            </div>
          </div>` :
      html``}
          ${this.total_slot.tpu_device_slot ?
      html`
          <div class="layout horizontal center-justified monitor">
            <div class="layout vertical center center-justified resource-name">
              <span class="gauge-name">TPU</span>
            </div>
            <div class="layout vertical center-justified wrap short-indicator">
              <div class="progress-bar">
                <span class="gauge-label">${this.used_resource_group_slot.tpu_device_slot}/${this.total_resource_group_slot.tpu_device_slot}</span>
                <wl-progress-bar id="gpu-usage-bar" class="start-bar" mode="determinate"
                    value="${this.used_resource_group_slot_percent.tpu_device_slot / 100.0}"></wl-progress-bar>
                <!-- <mwc-linear-progress id="gpu-usage-bar" class="start-bar" progress="${this.used_resource_group_slot_percent.tpu_device_slot / 100.0}" buffer="${this.used_resource_group_slot_percent.tpu_device_slot / 100.0}"></mwc-linear-progress> -->
              </div>
              <div class="progress-bar">
                <span class="gauge-label">${this.used_slot.tpu_device_slot}/${this.total_slot.tpu_device_slot}</span>
                <wl-progress-bar id="gpu-usage-bar-2" class="end-bar" mode="determinate"
                    value="${this.used_slot_percent.tpu_device_slot / 100.0}"></wl-progress-bar>
                <!-- <mwc-linear-progress id="gpu-usage-bar-2" class="end-bar" progress="${this.used_slot_percent.tpu_device_slot / 100.0}" buffer="${this.used_slot_percent.tpu_device_slot / 100.0}"></mwc-linear-progress> -->
              </div>
            </div>
            <div class="layout vertical center center-justified">
              <span class="percentage start-bar">${parseInt(this.used_resource_group_slot_percent.tpu_device_slot) + '%'}</span>
              <span class="percentage end-bar">${parseInt(this.used_slot_percent.tpu_device_slot) + '%'}</span>
            </div>
          </div>` :
      html``}

          <div class="layout horizontal center-justified monitor session">
            <div class="layout vertical center center-justified resource-name">
              <span class="gauge-name">${_t('session.launcher.Sessions')}</span>
            </div>
            <div class="layout vertical start-justified wrap short-indicator">
              <div class="progress-bar">
                <span class="gauge-label">${this.concurrency_used}/${this.concurrency_max === 1000000 ? html`∞` : this.concurrency_max}</span>
                <span class="gauge-label">&nbsp;</span>
                <wl-progress-bar id="concurrency-usage-bar" class="short full-bar" mode="determinate" value="${this.used_slot_percent.concurrency / 100.0}"></wl-progress-bar>
                <!-- <mwc-linear-progress class="short full-bar" id="concurrency-usage-bar" progress="${this.used_slot_percent.concurrency / 100.0}"></mwc-linear-progress> -->
              </div>
            </div>
            <div class="layout vertical center center-justified">
              <span class="percentage end-bar">${parseInt(this.used_slot_percent.concurrency) + '%'}</span>
            </div>
          </div>
        </div>
      </div>
      ${this.direction === 'vertical' ? html`
      <div class="vertical start-justified layout ${this.direction}-card">
        <div class="layout horizontal center start-justified">
          <div style="width:10px;height:10px;margin-left:10px;margin-right:3px;background-color:#4775E3;border-radius:4px;"></div>
          <span style="margin-right:5px;">${_t('session.launcher.CurrentResourceGroup')} (${this.scaling_group})</span>
        </div>
        <div class="layout horizontal center start-justified">
          <div style="width:10px;height:10px;margin-left:10px;margin-right:3px;background-color:#A0BD67;border-radius:4px;"></div>
          <span style="margin-right:5px;">${_t('session.launcher.UserResourceLimit')}</span>
        </div>
      </div>
      ` : html``}
      ${this.direction === 'vertical' && this.project_resource_monitor === true &&
    (this.total_project_slot.cpu > 0 || this.total_project_slot.cpu === Infinity) ? html`
      <hr />
      <div class="vertical start-justified layout">
        <div class="flex"></div>
        <div class="layout horizontal center-justified monitor">
          <div class="layout vertical center center-justified" style="margin-right:5px;">
            <wl-icon class="fg blue">group_work</wl-icon>
            <span class="gauge-name">${_t('session.launcher.Project')}</span>
          </div>
          <div class="layout vertical start-justified wrap short-indicator">
            <div class="layout horizontal">
              <span style="width:35px; margin-left:5px; margin-right:5px;">CPU</span>
              <div class="progress-bar">
                <wl-progress-bar id="cpu-project-usage-bar" class="start-bar" mode="determinate" value="${this.used_project_slot_percent.cpu / 100.0}"></wl-progress-bar>
                <!-- <mwc-linear-progress id="cpu-project-usage-bar" class="start-bar project-bar" progress="${this.used_project_slot_percent.cpu / 100.0}"></mwc-linear-progress> -->
                <span class="gauge-label">${this.used_project_slot.cpu}/${this.total_project_slot.cpu === Infinity ? '∞' : this.total_project_slot.cpu}</span>
              </div>
              <div class="layout vertical center center-justified">
                <span class="percentage start-bar">${parseInt(this.used_project_slot_percent.cpu) + '%'}</span>
                <span class="percentage end-bar">${parseInt(this.total_project_slot.cpu) + '%'}</span>
              </div>
            </div>
            <div class="layout horizontal">
              <span style="width:35px;margin-left:5px; margin-right:5px;">RAM</span>
              <div class="progress-bar">
                <wl-progress-bar id="mem-project-usage-bar" class="middle-bar project-bar" mode="determinate" value="${this.used_project_slot_percent.mem / 100.0}"></wl-progress-bar>
                <!-- <mwc-linear-progress id="mem-project-usage-bar" class="middle-bar project-bar" progress="${this.used_project_slot_percent.mem / 100.0}"></mwc-linear-progress> -->
                <span class="gauge-label">${this.used_project_slot.mem}/${this.total_project_slot.mem === Infinity ? '∞' : this.total_project_slot.mem}</span>
              </div>
              <div class="layout vertical center center-justified">
                <span class="percentage start-bar">${parseInt(this.used_project_slot_percent.mem) + '%'}</span>
                <span class="percentage end-bar">${parseInt(this.total_project_slot.mem) + '%'}</span>
              </div>
            </div>
            ${this.total_project_slot.cuda_device ? html`
            <div class="layout horizontal">
              <span style="width:35px;margin-left:5px; margin-right:5px;">GPU</span>
              <div class="progress-bar">
                <wl-progress-bar id="gpu-project-usage-bar" class="end-bar project-bar" mode="determinate" value="${this.used_project_slot_percent.cuda_device / 100.0}"></wl-progress-bar>
                <!-- <mwc-linear-progress id="gpu-project-usage-bar" class="end-bar project-bar" progress="${this.used_project_slot_percent.cuda_device / 100.0}"></mwc-linear-progress> -->
                <span class="gauge-label">${this.used_project_slot.cuda_device}/${this.total_project_slot.cuda_device === 'Infinity' ? '∞' : this.total_project_slot.cuda_device}</span>
              </div>
              <div class="layout vertical center center-justified">
                <span class="percentage start-bar">${parseInt(this.used_project_slot_percent.cuda_device) + '%'}</span>
                <span class="percentage end-bar">${parseInt(this.total_project_slot.cuda_device) + '%'}</span>
              </div>
            </div>` : html``}
            ${this.total_project_slot.cuda_shares ? html`
            <div class="layout horizontal">
              <span style="width:35px;margin-left:5px; margin-right:5px;">fGPU</span>
              <div class="progress-bar">
                <wl-progress-bar id="gpu-project-usage-bar" class="end-bar project-bar" mode="determinate" value="${this.used_project_slot_percent.cuda_shares / 100.0}"></wl-progress-bar>
                <!-- <mwc-linear-progress id="gpu-project-usage-bar" class="end-bar project-bar" progress="${this.used_project_slot_percent.cuda_shares / 100.0}"></mwc-linear-progress> -->
                <span class="gauge-label">${this.used_project_slot.cuda_shares}/${this.total_project_slot.cuda_shares === 'Infinity' ? '∞' : this.total_project_slot.cuda_shares}</span>
              </div>
              <div class="layout vertical center center-justified">
                <span class="percentage start-bar">${parseInt(this.used_project_slot_percent.cuda_shares) + '%'}</span>
                <span class="percentage end-bar">${parseInt(this.total_project_slot.cuda_shares) + '%'}</span>
              </div>
            </div>` : html``}
            ${this.total_project_slot.rocm_device ? html`
            <div class="layout horizontal">
              <span style="width:35px;margin-left:5px; margin-right:5px;">GPU</span>
              <div class="progress-bar">
                <wl-progress-bar id="gpu-project-usage-bar" class="end-bar project-bar" mode="determinate" value="${this.used_project_slot_percent.rocm_device / 100.0}"></wl-progress-bar>
                <!-- <mwc-linear-progress id="gpu-project-usage-bar" class="end-bar project-bar" progress="${this.used_project_slot_percent.rocm_device / 100.0}"></mwc-linear-progress> -->
                <span class="gauge-label">${this.used_project_slot.rocm_device}/${this.total_project_slot.rocm_device === 'Infinity' ? '∞' : this.total_project_slot.rocm_device}</span>
              </div>
              <div class="layout vertical center center-justified">
                <span class="percentage start-bar">${parseInt(this.used_project_slot_percent.rocm_device) + '%'}</span>
                <span class="percentage end-bar">${parseInt(this.total_project_slot.rocm_device) + '%'}</span>
              </div>
            </div>` : html``}
            ${this.total_project_slot.tpu_device ? html`
            <div class="layout horizontal">
              <span style="width:35px;margin-left:5px; margin-right:5px;">GPU</span>
              <div class="progress-bar">
                <wl-progress-bar id="gpu-project-usage-bar" class="end-bar project-bar" mode="determinate" value="${this.used_project_slot_percent.tpu_device / 100.0}"></wl-progress-bar>
                <!-- <mwc-linear-progress id="gpu-project-usage-bar" class="end-bar project-bar" progress="${this.used_project_slot_percent.tpu_device / 100.0}"></mwc-linear-progress> -->
                <span class="gauge-label">${this.used_project_slot.tpu_device}/${this.total_project_slot.tpu_device === 'Infinity' ? '∞' : this.total_project_slot.cuda_device}</span>
              </div>
              <div class="layout vertical center center-justified">
                <span class="percentage start-bar">${parseInt(this.used_project_slot_percent.tpu_device) + '%'}</span>
                <span class="percentage end-bar">${parseInt(this.total_project_slot.tpu_device) + '%'}</span>
              </div>
            </div>` : html``}
          </div>
          <div class="flex"></div>
        </div>
      </div>
      ` : html``}
`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-resource-monitor": BackendAiResourceMonitor;
  }
}
