/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

import {BackendAIPage} from './backend-ai-page';

import '@material/mwc-select';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-icon-button';
import '@material/mwc-textfield/mwc-textfield';
import '@material/mwc-linear-progress';
import '@material/mwc-switch';

import 'weightless/card';
import 'weightless/checkbox';
import {Expansion} from 'weightless/expansion';
import 'weightless/icon';
import 'weightless/label';

import './lablup-progress-bar';
import './lablup-slider';
import './backend-ai-dialog';

import {default as PainKiller} from './backend-ai-painkiller';

import '../plastics/lablup-shields/lablup-shields';
import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type Switch = HTMLElementTagNameMap['mwc-switch'];

@customElement('backend-ai-resource-monitor')
export default class BackendAiResourceMonitor extends BackendAIPage {
  @property({type: Boolean}) is_connected = false;
  @property({type: String}) direction = 'horizontal';
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
  @property({type: Boolean}) project_resource_monitor = false;
  @property({type: Object}) resourceBroker;
  @query('#resource-gauges') resourceGauge!: HTMLDivElement;
  @query('#scaling-group-select-box') scalingGroupSelectBox!: HTMLDivElement;

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

  static get styles(): CSSResultGroup {
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

        .horizontal-panel lablup-progress-bar {
          --progress-bar-width: 90px;
        }

        .vertical-panel lablup-progress-bar {
          --progress-bar-width: 186px;
        }

        .horizontal-card {
          width: auto;
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
          margin-bottom: 15px;
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
          height: 58px;
          border: 0.1em solid #ccc;
          font-family: var(--general-font-family);
          --mdc-typography-subtitle1-font-family: var(--general-font-family);
          --mdc-typography-subtitle1-font-size: 14px;
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
          --mdc-select-hover-line-color: transparent;
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
          margin-right: 20px;
          margin-bottom: 15px;
        }

        .resources.vertical .monitor,
        .resources.horizontal .monitor {
          margin-bottom: 10px;
        }

        mwc-select {
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

        .vertical-card > #resource-gauges > .monitor > .resource-name {
          width: 60px;
        }

        .horizontal-card > #resource-gauges {
          display: grid !important;
          grid-auto-flow: row;
          grid-template-columns: repeat(auto-fill, 320px);
          justify-content: center;
        }

        @media screen and (min-width: 750px) {
          div#resource-gauges {
            display: flex !important;
          }
        }

        @media screen and (max-width: 1015px) {
          .horizontal-panel lablup-progress-bar {
            --progress-bar-width: 8rem;
          }

          div#resource-gauges {
            justify-content: center;
          }
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
    const resourceGaugeResizeObserver = new ResizeObserver(() => {
      this._updateToggleResourceMonitorDisplay();
    });
    resourceGaugeResizeObserver.observe(this.resourceGauge);
    document.addEventListener('backend-ai-group-changed', (e) => {
      this.scaling_group = '';
      this._updatePageVariables(true);
    });
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.is_connected = true;
        setInterval(() => {
          this._periodicUpdateResourcePolicy();
        }, 20000);
      }, {once: true});
    } else {
      this.is_connected = true;
    }
    document.addEventListener('backend-ai-session-list-refreshed', () => {
      this._updatePageVariables(true);
    });
  }

  async _periodicUpdateResourcePolicy() {
    // refresh resource monitor every 10sec
    if (this.active) {
      await this._refreshResourcePolicy();
      this.aggregateResource('refresh-resource-policy');
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  /**
   * @deprecated it does not used now
   */
  _updateSelectedScalingGroup() {
    const Sgroups = this.shadowRoot?.querySelector('#scaling-groups') as any;
    const selectedSgroup = Sgroups.items.find((item) => item.value === this.resourceBroker.scaling_group);
    const idx = Sgroups.items.indexOf(selectedSgroup);
    Sgroups.select(idx);
  }

  async updateScalingGroup(forceUpdate = false, e) {
    await this.resourceBroker.updateScalingGroup(forceUpdate, e.target.value);
    if (this.active) {
      if (this.direction === 'vertical') {
        if (this.scalingGroupSelectBox.firstChild) {
          // TODO clarify element type
          (this.scalingGroupSelectBox.firstChild as any).value = this.resourceBroker.scaling_group;
        }
      }
      if (forceUpdate === true) {
        await this._refreshResourcePolicy();
        this.aggregateResource('update-scaling-group');
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

  _updateToggleResourceMonitorDisplay() {
    const legend = this.shadowRoot?.querySelector('#resource-legend') as HTMLDivElement;
    const toggleButton = this.shadowRoot?.querySelector('#resource-gauge-toggle-button') as Switch;
    if (document.body.clientWidth > 750 && this.direction == 'horizontal') {
      legend.style.display = 'flex';
      Array.from(this.resourceGauge.children).forEach((elem) => {
        (elem as HTMLElement).style.display = 'flex';
      });
    } else {
      if (toggleButton.selected) {
        legend.style.display = 'flex';
        if (document.body.clientWidth < 750) {
          this.resourceGauge.style.left = '20px';
          this.resourceGauge.style.right = '20px';
        }
        Array.from(this.resourceGauge.children).forEach((elem) => {
          (elem as HTMLElement).style.display = 'flex';
        });
      } else {
        Array.from(this.resourceGauge.children).forEach((elem) => {
          (elem as HTMLElement).style.display = 'none';
        });
        legend.style.display = 'none';
      }
    }
  }

  _updateScalingGroupSelector() {
    // Detached from template to support live-update after creating new group (will need it)
    if (this.scalingGroupSelectBox.hasChildNodes() && this.scalingGroupSelectBox.firstChild) {
      this.scalingGroupSelectBox.removeChild(this.scalingGroupSelectBox.firstChild);
    }
    const scaling_select = document.createElement('mwc-select');
    scaling_select.label = _text('session.launcher.ResourceGroup');
    scaling_select.id = 'scaling-group-select';
    scaling_select.value = this.scaling_group;
    scaling_select.setAttribute('fullwidth', 'true');
    scaling_select.style.margin= '1px solid #ccc';
    // scaling_select.setAttribute('outlined', 'true');
    scaling_select.addEventListener('selected', this.updateScalingGroup.bind(this, true));
    let opt = document.createElement('mwc-list-item');
    opt.setAttribute('disabled', 'true');
    opt.innerHTML = _text('session.launcher.SelectResourceGroup');
    opt.style.borderBottom = '1px solid #ccc';
    scaling_select.appendChild(opt);
    const currentSelectedResourceGroup = scaling_select.value ? scaling_select.value : this.resourceBroker.scaling_group;
    this.resourceBroker.scaling_groups.map((group) => {
      opt = document.createElement('mwc-list-item');
      opt.value = group.name;
      opt.setAttribute('graphic', 'icon');
      if (currentSelectedResourceGroup === group.name) {
        opt.selected = true;
      } else {
        opt.selected = false;
      }
      opt.innerHTML = group.name;
      scaling_select.appendChild(opt);
    });
    // scaling_select.updateOptions();
    this.scalingGroupSelectBox.appendChild(scaling_select);
  }

  /**
   *  If bot refreshOnly and active are true, refresh resource monitor indicator
   *
   * @param {boolean} refreshOnly
   *
   */
  async _refreshResourcePolicy(refreshOnly = false) {
    if (!this.active) {
      return Promise.resolve(true);
    }
    return this.resourceBroker._refreshResourcePolicy().then(() => {
      this.concurrency_used = this.resourceBroker.concurrency_used;
      // this.userResourceLimit = this.resourceBroker.userResourceLimit;
      this.concurrency_max = this.concurrency_used > this.resourceBroker.concurrency_max ? this.concurrency_used : this.resourceBroker.concurrency_max;
      // this.updateResourceAllocationPane('refresh resource policy');
      return Promise.resolve(true);
    }).catch((err) => {
      this.metadata_updating = false;
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      } else if (err && err.title) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.show(true, err);
      }
      return Promise.resolve(false); // Cannot use reject due to the blocking happens.
    });
  }

  _aliasName(value) {
    const alias = this.resourceBroker.imageTagAlias;
    const tagReplace = this.resourceBroker.imageTagReplace;
    for (const [key, replaceString] of Object.entries(tagReplace)) {
      const pattern = new RegExp(key);
      if (pattern.test(value)) {
        return value.replace(pattern, replaceString);
      }
    }
    if (value in alias) {
      return alias[value];
    } else {
      return value;
    }
  }

  async _aggregateResourceUse(from = '') {
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
      // this.requestUpdate();
      return Promise.resolve(true);
      // return this.available_slot;
    }).then(() => {
      return Promise.resolve(true);
    }).catch((err) => {
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
  aggregateResource(from = '') {
    // console.log('aggregate resource called - ', from);
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._aggregateResourceUse(from);
      }, true);
    } else {
      this._aggregateResourceUse(from);
    }
  }

  _disableEnterKey() {
    this.shadowRoot?.querySelectorAll<Expansion>('wl-expansion').forEach((element) => {
      // remove protected property assignment
      (element as any).onKeyDown = (e) => {
        const enterKey = 13;
        if (e.keyCode === enterKey) {
          e.preventDefault();
        }
      };
    });
  }

  _numberWithPostfix(str, postfix = '') {
    if (isNaN(parseInt(str))) {
      return '';
    } else {
      return parseInt(str) + postfix;
    }
  }

  render() {
    // language=HTML
    return html`
      <div id="scaling-group-select-box" class="layout horizontal start-justified"></div>
      <div class="layout ${this.direction}-card flex wrap">
        <div id="resource-gauges" class="layout ${this.direction} ${this.direction}-panel resources flex wrap">
          <div class="layout horizontal center-justified monitor">
            <div class="layout vertical center center-justified resource-name">
              <div class="gauge-name">CPU</div>
            </div>
            <div class="layout vertical start-justified wrap">
              <lablup-progress-bar id="cpu-usage-bar" class="start"
                progress="${this.used_resource_group_slot_percent.cpu / 100.0}"
                description="${this.used_resource_group_slot.cpu}/${this.total_resource_group_slot.cpu}"></lablup-progress-bar>
              <lablup-progress-bar id="cpu-usage-bar-2" class="end"
                progress="${this.used_slot_percent.cpu / 100.0}"
                description="${this.used_slot.cpu}/${this.total_slot.cpu}"></lablup-progress-bar>
            </div>
            <div class="layout vertical center center-justified">
              <span class="percentage start-bar">${this._numberWithPostfix(this.used_resource_group_slot_percent.cpu, '%')}</span>
              <span class="percentage end-bar">${this._numberWithPostfix(this.used_slot_percent.cpu, '%')}</span>
            </div>
          </div>
          <div class="layout horizontal center-justified monitor">
            <div class="layout vertical center center-justified resource-name">
              <span class="gauge-name">RAM</span>
            </div>
            <div class="layout vertical start-justified wrap">
              <lablup-progress-bar id="mem-usage-bar" class="start"
                progress="${this.used_resource_group_slot_percent.mem / 100.0}"
                description="${this.used_resource_group_slot.mem}/${this.total_resource_group_slot.mem}GB"></lablup-progress-bar>
              <lablup-progress-bar id="mem-usage-bar-2" class="end"
                progress="${this.used_slot_percent.mem / 100.0}"
                description="${this.used_slot.mem}/${this.total_slot.mem}GB"
              ></lablup-progress-bar>
            </div>
            <div class="layout vertical center center-justified">
              <span class="percentage start-bar">${this._numberWithPostfix(this.used_resource_group_slot_percent.mem, '%')}</span>
              <span class="percentage end-bar">${this._numberWithPostfix(this.used_slot_percent.mem, '%')}</span>
            </div>
          </div>
          ${this.total_slot.cuda_device ?
    html`
          <div class="layout horizontal center-justified monitor">
            <div class="layout vertical center center-justified resource-name">
              <span class="gauge-name">GPU</span>
            </div>
            <div class="layout vertical center-justified wrap">
              <lablup-progress-bar id="gpu-usage-bar" class="start"
                progress="${this.used_resource_group_slot.cuda_device / this.total_resource_group_slot.cuda_device}"
                description="${this.used_resource_group_slot.cuda_device}/${this.total_resource_group_slot.cuda_device}"
              ></lablup-progress-bar>
              <lablup-progress-bar id="gpu-usage-bar-2" class="end"
                progress="${this.used_slot.cuda_device}/${this.total_slot.cuda_device}"
                description="${this.used_slot.cuda_device}/${this.total_slot.cuda_device}"
              ></lablup-progress-bar>
            </div>
            <div class="layout vertical center center-justified">
              <span class="percentage start-bar">${this._numberWithPostfix(this.used_resource_group_slot.cuda_device / this.total_resource_group_slot.cuda_device, '%')}</span>
              <span class="percentage end-bar">${this._numberWithPostfix(this.used_slot.cuda_device / this.total_slot.cuda_device, '%')}</span>
            </div>
          </div>` :
    html``}
          ${ ((this.resourceBroker.total_slot.cuda_shares) && (this.resourceBroker.total_slot.cuda_shares > 0)) ?
    html`
          <div class="layout horizontal center-justified monitor">
            <div class="layout vertical center center-justified resource-name">
              <span class="gauge-name">FGPU</span>
            </div>
            <div class="layout vertical start-justified wrap">
              <lablup-progress-bar id="fgpu-usage-bar" class="start"
                progress="${this.used_resource_group_slot.cuda_shares / this.total_resource_group_slot.cuda_shares}"
                description="${this.used_resource_group_slot.cuda_shares}/${this.total_resource_group_slot.cuda_shares}"
              ></lablup-progress-bar>
              <lablup-progress-bar id="fgpu-usage-bar-2" class="end"
                progress="${this.used_slot.cuda_shares / this.total_slot.cuda_shares}"
                description="${this.used_slot.cuda_shares}/${this.total_slot.cuda_shares}"
              ></lablup-progress-bar>
            </div>
            <div class="layout vertical center center-justified">
              <span class="percentage start-bar">${this._numberWithPostfix(this.used_resource_group_slot_percent.cuda_shares, '%')}</span>
              <span class="percentage end-bar">${this._numberWithPostfix(this.used_slot_percent.cuda_shares, '%')}</span>
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
            <div class="layout vertical center-justified wrap">
            <lablup-progress-bar id="rocm-gpu-usage-bar" class="start"
              progress="${this.used_resource_group_slot_percent.rocm_device_slot / 100.0}"
              description="${this.used_resource_group_slot.rocm_device_slot}/${this.total_resource_group_slot.rocm_device_slot}"
            ></lablup-progress-bar>
            <lablup-progress-bar id="rocm-gpu-usage-bar-2" class="end"
              progress="${this.used_slot_percent.rocm_device_slot / 100.0}" buffer="${this.used_slot_percent.rocm_device_slot / 100.0}"
              description="${this.used_slot.rocm_device_slot}/${this.total_slot.rocm_device_slot}"
            ></lablup-progress-bar>
            </div>
            <div class="layout vertical center center-justified">
              <span class="percentage start-bar">${this._numberWithPostfix(this.used_resource_group_slot_percent.rocm_device_slot, '%')}</span>
              <span class="percentage end-bar">${this._numberWithPostfix(this.used_slot_percent.rocm_device_slot, '%')}</span>
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
              <lablup-progress-bar id="tpu-usage-bar" class="start"
                progress="${this.used_resource_group_slot_percent.tpu_device_slot / 100.0}"
                description="${this.used_resource_group_slot.tpu_device_slot}/${this.total_resource_group_slot.tpu_device_slot}"
              ></lablup-progress-bar>
              <lablup-progress-bar id="tpu-usage-bar-2" class="end"
                progress="${this.used_slot_percent.tpu_device_slot / 100.0}" buffer="${this.used_slot_percent.tpu_device_slot / 100.0}"
                description="${this.used_slot.tpu_device_slot}/${this.total_slot.tpu_device_slot}"
              ></lablup-progress-bar>
            </div>
            <div class="layout vertical center center-justified">
              <span class="percentage start-bar">${this._numberWithPostfix(this.used_resource_group_slot_percent.tpu_device_slot, '%')}</span>
              <span class="percentage end-bar">${this._numberWithPostfix(this.used_slot_percent.tpu_device_slot, '%')}</span>
            </div>
          </div>` :
    html``}
          <div class="layout horizontal center-justified monitor">
            <div class="layout vertical center center-justified resource-name">
              <span class="gauge-name">${_t('session.launcher.Sessions')}</span>
            </div>
            <div class="layout vertical center-justified wrap">
              <lablup-progress-bar id="concurrency-usage-bar" class="start"
                progress="${this.used_slot_percent.concurrency / 100.0}"
                description="${this.concurrency_used}/${this.concurrency_max === 1000000 ? '∞' : parseInt(this.concurrency_max)}"
                ></lablup-progress-bar>
            </div>
            <div class="layout vertical center center-justified">
              <span class="percentage end-bar" style="margin-top:0px;">${this._numberWithPostfix(this.used_slot_percent.concurrency, '%')}</span>
            </div>
          </div>
        </div>
        <div class="layout horizontal center end-justified" id="resource-gauge-toggle">
          <p style="font-size:12px;color:#242424;margin-right:10px;">
            ${_t('session.launcher.ResourceMonitorToggle')}
          </p>
          <mwc-switch selected class="${this.direction}" id="resource-gauge-toggle-button" @click="${() => this._updateToggleResourceMonitorDisplay()}">
          </mwc-switch>
        </div>
      </div>
      ${this.direction === 'vertical' ? html`
      <div class="vertical start-justified layout ${this.direction}-card" id="resource-legend">
        <div class="layout horizontal center start-justified resource-legend-stack">
          <div class="resource-legend-icon start"></div>
          <span class="resource-legend">${_t('session.launcher.CurrentResourceGroup')} (${this.scaling_group})</span>
        </div>
        <div class="layout horizontal center start-justified">
          <div class="resource-legend-icon end"></div>
          <span class="resource-legend">${_t('session.launcher.UserResourceLimit')}</span>
        </div>
      </div>` : html`
      <div class="vertical start-justified layout ${this.direction}-card" id="resource-legend">
        <div class="layout horizontal center end-justified resource-legend-stack">
          <div class="resource-legend-icon start"></div>
          <span class="resource-legend">${_t('session.launcher.CurrentResourceGroup')} (${this.scaling_group})</span>
        </div>
        <div class="layout horizontal center end-justified">
          <div class="resource-legend-icon end"></div>
          <span class="resource-legend">${_t('session.launcher.UserResourceLimit')}</span>
        </div>
      </div>`}
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
              <lablup-progress-bar id="cpu-project-usage-bar" class="start"
                progress="${this.used_project_slot_percent.cpu / 100.0}"
                description="${this.used_project_slot.cpu}/${this.total_project_slot.cpu === Infinity ? '∞' : this.total_project_slot.cpu}"></lablup-progress-bar>
              <div class="layout vertical center center-justified">
                <span class="percentage start-bar">${this._numberWithPostfix(this.used_project_slot_percent.cpu, '%')}</span>
                <span class="percentage end-bar">${this._numberWithPostfix(this.total_project_slot.cpu, '%')}</span>
              </div>
            </div>
            <div class="layout horizontal">
              <span style="width:35px;margin-left:5px; margin-right:5px;">RAM</span>
              <lablup-progress-bar id="mem-project-usage-bar" class="end"
                progress="${this.used_project_slot_percent.mem / 100.0}"
                description=">${this.used_project_slot.mem}/${this.total_project_slot.mem === Infinity ? '∞' : this.total_project_slot.mem}"
              ></lablup-progress-bar>
              <div class="layout vertical center center-justified">
                <span class="percentage start-bar">${this._numberWithPostfix(this.used_project_slot_percent.mem, '%')}</span>
                <span class="percentage end-bar">${this._numberWithPostfix(this.total_project_slot.mem, '%')}</span>
              </div>
            </div>
            ${this.total_project_slot.cuda_device ? html`
            <div class="layout horizontal">
              <span style="width:35px;margin-left:5px; margin-right:5px;">GPU</span>
              <lablup-progress-bar id="gpu-project-usage-bar" class="end"
                progress="${this.used_project_slot_percent.cuda_device / 100.0}"
                description="${this.used_project_slot.cuda_device}/${this.total_project_slot.cuda_device === 'Infinity' ? '∞' : this.total_project_slot.cuda_device}"
              ></lablup-progress-bar>
              <div class="layout vertical center center-justified">
                <span class="percentage start-bar">${this._numberWithPostfix(this.used_project_slot_percent.cuda_device, '%')}</span>
                <span class="percentage end-bar">${this._numberWithPostfix(this.total_project_slot.cuda_device, '%')}</span>
              </div>
            </div>` : html``}
            ${this.total_project_slot.cuda_shares ? html`
            <div class="layout horizontal">
              <span style="width:35px;margin-left:5px; margin-right:5px;">FGPU</span>
              <lablup-progress-bar id="fgpu-project-usage-bar" class="end"
                progress="${this.used_project_slot_percent.cuda_shares / 100.0}"
                description="${this.used_project_slot.cuda_shares}/${this.total_project_slot.cuda_shares === 'Infinity' ? '∞' : this.total_project_slot.cuda_shares}"
              ></lablup-progress-bar>
              <div class="layout vertical center center-justified">
                <span class="percentage start-bar">${this._numberWithPostfix(this.used_project_slot_percent.cuda_shares, '%')}</span>
                <span class="percentage end-bar">${this._numberWithPostfix(this.total_project_slot.cuda_shares, '%')}</span>
              </div>
            </div>` : html``}
            ${this.total_project_slot.rocm_device ? html`
            <div class="layout horizontal">
              <span style="width:35px;margin-left:5px; margin-right:5px;">GPU</span>
              <lablup-progress-bar id="rocm-project-usage-bar" class="end"
                progress="${this.used_project_slot_percent.rocm_device / 100.0}"
                description="${this.used_project_slot.rocm_device}/${this.total_project_slot.rocm_device === 'Infinity' ? '∞' : this.total_project_slot.rocm_device}"
              ></lablup-progress-bar>
              <div class="layout vertical center center-justified">
                <span class="percentage start-bar">${this._numberWithPostfix(this.used_project_slot_percent.rocm_device, '%')}</span>
                <span class="percentage end-bar">${this._numberWithPostfix(this.total_project_slot.rocm_device, '%')}</span>
              </div>
            </div>` : html``}
            ${this.total_project_slot.tpu_device ? html`
            <div class="layout horizontal">
              <span style="width:35px;margin-left:5px; margin-right:5px;">GPU</span>
              <lablup-progress-bar id="tpu-project-usage-bar" class="end"
                progress="${this.used_project_slot_percent.tpu_device / 100.0}"
                description="${this.used_project_slot.tpu_device}/${this.total_project_slot.tpu_device === 'Infinity' ? '∞' : this.total_project_slot.cuda_device}"
              ></lablup-progress-bar>
              <div class="layout vertical center center-justified">
                <span class="percentage start-bar">${this._numberWithPostfix(this.used_project_slot_percent.tpu_device, '%')}</span>
                <span class="percentage end-bar">${this._numberWithPostfix(this.total_project_slot.tpu_device, '%')}</span>
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
    'backend-ai-resource-monitor': BackendAiResourceMonitor;
  }
}
