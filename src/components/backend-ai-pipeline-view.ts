/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, customElement, html} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';

import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-slider/paper-slider';
import '@polymer/paper-item/paper-item';

import '@vaadin/vaadin-dialog/vaadin-dialog';
import './backend-ai-session-list';
import './backend-ai-dropdown-menu';
import 'weightless/button';
import 'weightless/icon';
import 'weightless/dialog';
import 'weightless/expansion';
import 'weightless/card';
import 'weightless/tab';
import 'weightless/tab-group';
import 'weightless/list-item';
import 'weightless/divider';

import {BackendAiStyles} from './backend-ai-console-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

@customElement("backend-ai-pipeline-view")
export default class BackendAIPipelineView extends BackendAIPage {
  public supports: any;
  public resourceLimits: any;
  public userResourceLimit: any;
  public aliases: any;
  public versions: any;
  public languages: any;
  public gpu_mode: any;
  public gpu_step: any;
  public cpu_metric: any;
  public mem_metric: any;
  public gpu_metric: any;
  public tpu_metric: any;
  public images: any;
  public defaultResourcePolicy: any;
  public total_slot: any;
  public used_slot: any;
  public available_slot: any;
  public resource_info: any;
  public used_slot_percent: any;
  public resource_templates: any;
  public vfolders: any;
  public default_language: any;
  public launch_ready: any;
  public concurrency_used: any;
  public concurrency_max: any;
  public _status: any;
  public notification: any;
  public shadowRoot: any;
  public updateComplete: any;
  public vgpu_metric: any;
  public $: any;

  private pipelineComponents: any[];
  private scalingGroup: string;
  private allowedScalingGroups: any[];

  constructor() {
    super();
    setPassiveTouchGestures(true);
    this.active = false;
    this.supports = {};
    this.resourceLimits = {};
    this.userResourceLimit = {};
    this.aliases = {
      'TensorFlow': 'python-tensorflow',
      'Lablup ResearchEnv.': 'python-ff',
      'Python': 'python',
      'PyTorch': 'python-pytorch',
      'Chainer': 'chainer',
      'R': 'r',
      'Julia': 'julia',
      'Lua': 'lua',
    };
    this.versions = ['3.6'];
    this.languages = [];
    this.gpu_mode = 'no';
    this.gpu_step = 0.05;
    this.cpu_metric = {
      'min': '1',
      'max': '1'
    };
    this.mem_metric = {
      'min': '1',
      'max': '1'
    };
    this.gpu_metric = {
      'min': '0',
      'max': '0'
    };
    this.tpu_metric = {
      'min': '1',
      'max': '1'
    };
    this.images = {};
    this.defaultResourcePolicy = 'UNLIMITED';
    this.total_slot = {};
    this.used_slot = {};
    this.available_slot = {};
    this.resource_info = {};
    this.used_slot_percent = {};
    this.resource_templates = [];
    this.vfolders = [];
    this.default_language = '';
    this.launch_ready = false;
    this.concurrency_used = 0;
    this.concurrency_max = 0;
    this._status = 'inactive';

    this.scalingGroup = '';
    this.allowedScalingGroups = [];
    this.pipelineComponents = [
      {
        'title': 'Backend.AI Data Uploader',
        'description': 'Backend.AI data uploader helps users uploading the data to experiment store',
        'cpu': 1,
        'mem': 1,
        'gpu': 0
      },
      {
        'title': 'Facet',
        'description': 'Facets contains two robust visualizations to aid in understanding and analyzing',
        'cpu': 1,
        'mem': 1,
        'gpu': 0
      },
      {
        'title': 'TensorFlow',
        'description': 'TensorFlow is an end-to-end open source platform for machine learning',
        'cpu': 4,
        'mem': 16,
        'gpu': 1.5
      },
      {
        'title': 'TensorFlow Validate',
        'description': 'TensorFlow is an end-to-end open source platform for machine learning',
        'cpu': 4,
        'mem': 16,
        'gpu': 1.5
      },
      {
        'title': 'TensorFlow Serving',
        'description': 'TensorFlow is an end-to-end open source platform for machine learning',
        'cpu': 1,
        'mem': 1,
        'gpu': 0
      },
    ];
  }

  static get is() {
    return 'backend-ai-pipeline-view';
  }

  static get properties() {
    return {
      active: {
        type: Boolean
      },
      supports: {
        type: Object
      },
      resourceLimits: {
        type: Object
      },
      userResourceLimit: {
        type: Object
      },
      aliases: {
        type: Object
      },
      versions: {
        type: Array
      },
      languages: {
        type: Array
      },
      gpu_mode: {
        type: String
      },
      gpu_step: {
        type: Number
      },
      cpu_metric: {
        type: Object
      },
      mem_metric: {
        type: Object
      },
      gpu_metric: {
        type: Object
      },
      tpu_metric: {
        type: Object
      },
      images: {
        type: Object
      },
      defaultResourcePolicy: {
        type: String
      },
      total_slot: {
        type: Object
      },
      used_slot: {
        type: Object
      },
      available_slot: {
        type: Object
      },
      concurrency_used: {
        type: Number
      },
      concurrency_max: {
        type: Number
      },
      vfolders: {
        type: Array
      },
      resource_info: {
        type: Object
      },
      used_slot_percent: {
        type: Object
      },
      resource_templates: {
        type: Array
      },
      default_language: {
        type: String
      },
      launch_ready: {
        type: Boolean
      },
      _status: {
        type: Boolean
      },
      notification: {
        type: Object
      }
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
        wl-card h4 {
          padding: 5px 20px;
          border-bottom: 1px solid #dddddd;
          font-weight: 100;
        }

        paper-slider {
          width: 285px;
          --paper-slider-input: {
            width: 70px;
          };
          --paper-slider-height: 3px;
        }

        paper-slider.mem {
          --paper-slider-knob-color: var(--paper-orange-400);
          --paper-slider-active-color: var(--paper-orange-400);
        }

        paper-slider.cpu {
          --paper-slider-knob-color: var(--paper-light-green-400);
          --paper-slider-active-color: var(--paper-light-green-400);
        }

        paper-slider.gpu {
          --paper-slider-knob-color: var(--paper-cyan-400);
          --paper-slider-active-color: var(--paper-cyan-400);
        }

        paper-progress {
          width: 100px;
          border-radius: 3px;
          --paper-progress-height: 10px;
          --paper-progress-active-color: #3677eb;
          --paper-progress-secondary-color: #98be5a;
          --paper-progress-transition-duration: 0.08s;
          --paper-progress-transition-timing-function: ease;
          --paper-progress-transition-delay: 0s;
        }

        .short-indicator paper-progress {
          width: 50px;
        }

        .short-indicator .gauge-label {
          width: 80px;
        }

        .custom {
          color: var(--paper-red-800);
        }

        span.caption {
          width: 30px;
          padding-left: 10px;
        }

        div.caption {
          width: 100px;
        }

        .gauge-name {
          font-size: 10px;
        }

        .gauge-label {
          width: 120px;
          font-weight: 300;
          font-size: 12px;
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

        .resource-button h4 {
          padding: 5px 0;
          margin: 0;
          font-weight: 400;
        }

        .resource-button ul {
          padding: 0;
          list-style-type: none;
        }

        backend-ai-dropdown-menu {
          width: 100%;
        }

        wl-button.button {
          --button-bg: var(--paper-blue-50);
          --button-bg-hover: var(--paper-blue-100);
          --button-bg-active: var(--paper-blue-600);
        }

        wl-button.launch-button {
          width: 335px;
          --button-bg: var(--paper-blue-50);
          --button-bg-hover: var(--paper-blue-100);
          --button-bg-active: var(--paper-blue-600);
        }

        wl-button.resource-button {
          --button-bg: white;
          --button-bg-active: var(--paper-blue-600);
          --button-bg-hover: var(--paper-blue-600);
          --button-bg-active-flat: var(--paper-blue-50);
          --button-color: #8899aa;
          --button-color-active: blue;
          --button-color-hover: blue;
        }

        wl-card h3.tab {
          padding-top: 0;
          padding-bottom: 0;
          padding-left: 0;
        }

        wl-expansion {
          --expansion-elevation: 0;
          --expansion-elevation-open: 0;
          --expansion-elevation-hover: 0;
          --expansion-margin-open: 0;
        }
      `];
  }

  firstUpdated() {
    this.notification = window.lablupNotification;
  }

  _showTab(tab) {
    var els = this.shadowRoot.querySelectorAll(".tab-content");
    for (var x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    this.shadowRoot.querySelector('#' + tab.value).style.display = 'block';
  }

  _hideDialog(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-dialog');
    dialog.hide();
  }

  render() {
    // language=HTML
    return html`
      <wl-card class="item" elevation="1">
        <h3 class="tab horizontal center layout">
          <wl-tab-group>
            <wl-tab value="exp-lists" checked @click="${(e) => this._showTab(e.target)}">List</wl-tab>
            <wl-tab value="running-lists" @click="${(e) => this._showTab(e.target)}">Running</wl-tab>
            <wl-tab value="finished-lists" @click="${(e) => this._showTab(e.target)}">Finished</wl-tab>
          </wl-tab-group>
          <span class="flex"></span>
          <wl-button class="fg blue button" id="add-experiment" outlined>
           <wl-icon>add</wl-icon>
            Add pipeline
          </wl-button>
        </h3>
        <div id="exp-lists" class="tab-content" style="margin:0;padding:0;height:calc(100vh - 235px);">
          <div class="horizontal wrap layout" style="margin:0;padding:0;">
            <div style="weight: 300px;border-right:1px solid #ccc;height:calc(100vh - 235px);">
              <wl-list-item active style="width:300px;">
                <iron-icon icon="vaadin:flask" slot="before"></iron-icon>
                <span slot="after">5<br/><span style="font-size:9px">components</span></span>
                <wl-title level="4" style="margin: 0">Test experiment</wl-title>
                <span style="font-size: 11px;">Test experiment</span>
              </wl-list-item>
              <wl-list-item style="width:300px;">
                <iron-icon icon="vaadin:flask" slot="before"></iron-icon>
                  <span slot="after">4<br/><span style="font-size:9px">components</span></span>
                  <wl-title level="4" style="margin: 0">Fashion MNIST</wl-title>
                  <span style="font-size: 11px;">Fashion MNIST serving test</span>
              </wl-list-item>
              <wl-list-item style="width:300px;">
                <iron-icon icon="vaadin:flask" slot="before"></iron-icon>
                  <span slot="after">4<br/><span style="font-size:9px">components</span></span>
                  <wl-title level="4" style="margin: 0">Test experiment2</wl-title>
                  <span style="font-size: 11px;">Test experiment2</span>
              </wl-list-item>
              <h4>Templates</h4>
              <wl-list-item style="width:300px;">
                <iron-icon icon="vaadin:flask" slot="before"></iron-icon>
                  <span slot="after">5<br/><span style="font-size:9px">components</span></span>
                  <wl-title level="4" style="margin: 0">Example Experiment (TensorFlow)</wl-title>
                  <span style="font-size: 11px;">Basic experiment example using TensorFlow</span>
              </wl-list-item>
              <wl-list-item style="width:300px;">
                <iron-icon icon="vaadin:flask" slot="before"></iron-icon>
                  <span slot="after">4<br/><span style="font-size:9px">components</span></span>
                  <wl-title level="4" style="margin: 0">Example Experiment (PyTorch)</wl-title>
                  <span style="font-size: 11px;">Basic experiment example using Pytorch</span>
              </wl-list-item>
              <wl-list-item style="width:300px;">
                <iron-icon icon="vaadin:flask" slot="before"></iron-icon>
                  <span slot="after">4<br/><span style="font-size:9px">components</span></span>
                  <wl-title level="4" style="margin: 0">Facet data cleaner</wl-title>
                  <span style="font-size: 11px;">Data preprocessing using Facet</span>
              </wl-list-item>
            </div>
            <div class="layout vertical">
              <div style="margin-left:1em; margin-right:1em;">
                <paper-dropdown-menu id="environment" label="Environments" horizontal-align="left">
                  <paper-listbox slot="dropdown-content" attr-for-selected="id"
                                 selected="${this.default_language}">
                    ${this.languages.map(item => html`
                      <paper-item id="${item.name}" label="${item.alias}">${item.basename}
                        ${item.tags ? item.tags.map(item => html`
                          <lablup-shields style="margin-left:5px;" description="${item}"></lablup-shields>
                        `) : ''}
                      </paper-item>
                    `)}
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="version" label="Version">
                  <paper-listbox slot="dropdown-content" selected="0">
                    ${this.versions.map(item => html`
                      <paper-item id="${item}" label="${item}">${item}</paper-item>
                    `)}
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="scaling-groups" label="Resource Group" horizontal-align="left">
                  <paper-listbox selected="0" slot="dropdown-content">
                    ${this.allowedScalingGroups.map(item => html`
                      <paper-item id="${item.name}" label="${item.name}">${item.name}</paper-item>
                    `)}
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
              <div id="pipeline-component-list">
                ${this.pipelineComponents.map((item) => html`
                  <wl-list-item style="width:calc(100%-55px); height:80px">
                    <iron-icon icon="vaadin:puzzle-piece" slot="before"></iron-icon>
                    <div slot="after">
                      <div class="horizontal layout">
                        <div class="layout vertical center center-justified flex" style="width:50px;">
                            <paper-icon-button class="fg black" icon="vaadin:controller"></paper-icon-button>
                        </div>
                        <div class="layout vertical start flex" style="width:80px!important;">
                          <div class="layout horizontal configuration">
                            <iron-icon class="fg blue" icon="hardware:developer-board"></iron-icon>
                            <span>${item.cpu}</span>
                            <span class="indicator">core</span>
                          </div>
                          <div class="layout horizontal configuration">
                            <iron-icon class="fg blue" icon="hardware:memory"></iron-icon>
                            <span>${item.mem}</span>
                            <span class="indicator">GB</span>
                          </div>
                          <div class="layout horizontal configuration">
                            <iron-icon class="fg blue" icon="icons:view-module"></iron-icon>
                            <span>${item.gpu}</span>
                            <span class="indicator">GPU</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <wl-title level="4" style="margin: 0">${item.title}</wl-title>
                    <div style="font-size:11px;max-width:450px;">${item.description}</div>
                  </wl-list-item>
                `)}
              </div>
              <wl-button class="fg blue button" id="add-component" outlined>
                <wl-icon>add</wl-icon>
                Add component
              </wl-button>
            </div>
          </div>
        </div>
        <div id="running-lists" class="tab-content" style="display:none;">
          <backend-ai-session-list id="running-jobs" condition="running" ?active="${this._status === 'active'}"></backend-ai-session-list>
        </div>
        <div id="finished-lists" class="tab-content" style="display:none;">
          <backend-ai-session-list id="finished-jobs" condition="finished" ?active="${this._status === 'active'}"></backend-ai-session-list>
        </div>
      </wl-card>

`;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-pipeline-view": BackendAIPipelineView;
  }
}
