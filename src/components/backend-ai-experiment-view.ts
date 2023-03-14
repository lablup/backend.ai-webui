/**
 @license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
 */

import {css, CSSResultGroup, html} from 'lit';
import {customElement} from 'lit/decorators.js';

import {BackendAIPage} from './backend-ai-page';

import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';

import './backend-ai-session-list';
import 'weightless/button';
import 'weightless/icon';
import 'weightless/dialog';
import 'weightless/expansion';
import 'weightless/card';
import 'weightless/tab';
import 'weightless/tab-group';
import 'weightless/list-item';
import 'weightless/divider';

import '@material/mwc-button';

import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

/**
 Backend.AI Experiment View

 Example:

 <backend-ai-experiment-view class="page" name="experiment" ?active="${0}">
 ... content ...
 </backend-ai-experiment-view>

@group Backend.AI Web UI
 @element backend-ai-experiment-view
 */

@customElement('backend-ai-experiment-view')
export default class BackendAIExperimentView extends BackendAIPage {
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
  public vgpu_metric: any;
  public $: any;

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
  }

  static get is() {
    return 'backend-ai-experiment-view';
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
        wl-card h4 {
          padding: 5px 20px;
          border-bottom: 1px solid #dddddd;
          font-weight: 100;
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
    this.notification = globalThis.lablupNotification;
  }

  /**
   * Dislplay tabs.
   *
   * @param {HTMLElement} tab - tab element
   */
  _showTab(tab) {
    const els = this.shadowRoot?.querySelectorAll<HTMLDivElement>('.tab-content') as NodeListOf<HTMLDivElement>;
    for (let x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    (this.shadowRoot?.querySelector('#' + tab.value) as HTMLElement).style.display = 'block';
  }

  /**
   * Hide a wl dialog.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  _hideDialog(e) {
    const hideButton = e.target;
    const dialog = hideButton.closest('wl-dialog');
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
            Add experiment
          </wl-button>
        </h3>
        <div id="exp-lists" class="tab-content" style="margin:0;padding:0;height:calc(100vh - 235px);">
            <div class="horizontal wrap layout" style="margin:0;padding:0;">
              <div style="weight: 300px;border-right:1px solid #ccc;height:calc(100vh - 235px);">
                <wl-list-item active style="width:300px;">
                  <wl-icon icon="vaadin:flask" slot="before"></wl-icon>
                  <span slot="after">5<br/><span style="font-size:9px">components</span></span>
                  <wl-title level="4" style="margin: 0">Test experiment</wl-title>
                  <span style="font-size: 11px;">Test experiment</span>
                </wl-list-item>
                <wl-list-item style="width:300px;">
                  <wl-icon icon="vaadin:flask" slot="before"></wl-icon>
                   <span slot="after">4<br/><span style="font-size:9px">components</span></span>
                   <wl-title level="3" style="margin: 0">Fashion MNIST</wl-title>
                   <span style="font-size: 11px;">Fashion MNIST serving test</span>
                </wl-list-item>
                <wl-list-item style="width:300px;">
                  <wl-icon icon="vaadin:flask" slot="before"></wl-icon>
                   <span slot="after">4<br/><span style="font-size:9px">components</span></span>
                   <wl-title level="4" style="margin: 0">Test experiment2</wl-title>
                   <span style="font-size: 11px;">Test experiment2</span>
                </wl-list-item>
                <h4>Templates</h4>
                <wl-list-item style="width:300px;">
                  <wl-icon icon="vaadin:flask" slot="before"></wl-icon>
                   <span slot="after">5<br/><span style="font-size:9px">components</span></span>
                   <wl-title level="2" style="margin: 0">Example Experiment (TensorFlow)</wl-title>
                   <span style="font-size: 11px;">Basic experiment example using TensorFlow</span>
                </wl-list-item>
                <wl-list-item style="width:300px;">
                  <wl-icon icon="vaadin:flask" slot="before"></wl-icon>
                   <span slot="after">4<br/><span style="font-size:9px">components</span></span>
                   <wl-title level="2" style="margin: 0">Example Experiment (PyTorch)</wl-title>
                   <span style="font-size: 11px;">Basic experiment example using Pytorch</span>
                </wl-list-item>
                <wl-list-item style="width:300px;">
                  <wl-icon icon="vaadin:flask" slot="before"></wl-icon>
                   <span slot="after">4<br/><span style="font-size:9px">components</span></span>
                   <wl-title level="2" style="margin: 0">Facet data cleaner</wl-title>
                   <span style="font-size: 11px;">Data preprocessing using Facet</span>
                </wl-list-item>
              </div>
              <div class="layout vertical">
                <wl-list-item active style="width:calc(100% - 55px);height:80px;">
                  <wl-icon icon="vaadin:puzzle-piece" slot="before"></wl-icon>
                  <div slot="after">
                    <div class="horizontal layout">
                      <div class="layout vertical center center-justified flex" style="width:50px;">
                          <wl-button fab flat inverted class="fg black" icon="vaadin:controller"></wl-button>
                      </div>
                      <div class="layout vertical start flex" style="width:80px!important;">
                        <div class="layout horizontal configuration">
                          <wl-icon class="fg blue" icon="hardware:developer-board"></wl-icon>
                          <span>1</span>
                          <span class="indicator">core</span>
                        </div>
                        <div class="layout horizontal configuration">
                          <wl-icon class="fg blue" icon="hardware:memory"></wl-icon>
                          <span>1</span>
                          <span class="indicator">GB</span>
                        </div>
                        <div class="layout horizontal configuration">
                          <wl-icon class="fg blue" icon="icons:view-module"></wl-icon>
                          <span>-</span>
                          <span class="indicator">GPU</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <wl-title level="4" style="margin: 0">Backend.AI Data Uploader</wl-title>
                  <div style="font-size:11px;max-width:450px;">Backend.AI data uploader helps users uploading the data to experiment store.</div>
                </wl-list-item>
                <wl-list-item style="width:calc(100% - 55px);height:80px;">
                  <wl-icon icon="vaadin:puzzle-piece" slot="before"></wl-icon>
                  <div slot="after">
                    <div class="horizontal layout">
                      <div class="layout vertical center center-justified flex" style="width:50px;">
                          <wl-button fab flat inverted class="fg black" icon="vaadin:controller"></wl-button>
                      </div>
                      <div class="layout vertical start flex" style="width:80px!important;">
                        <div class="layout horizontal configuration">
                          <wl-icon class="fg blue" icon="hardware:developer-board"></wl-icon>
                          <span>1</span>
                          <span class="indicator">core</span>
                        </div>
                        <div class="layout horizontal configuration">
                          <wl-icon class="fg blue" icon="hardware:memory"></wl-icon>
                          <span>2</span>
                          <span class="indicator">GB</span>
                        </div>
                        <div class="layout horizontal configuration">
                          <wl-icon class="fg blue" icon="icons:view-module"></wl-icon>
                          <span>-</span>
                          <span class="indicator">GPU</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <wl-title level="4" style="margin: 0">Facet</wl-title>
                  <div style="font-size:11px;max-width:450px;">Facets contains two robust visualizations to aid in understanding and analyzing machine learning datasets.</div>
                </wl-list-item>
                <wl-list-item style="width:calc(100% - 55px);height:80px;">
                  <wl-icon icon="vaadin:puzzle-piece" slot="before"></wl-icon>
                  <div slot="after">
                  <div class="horizontal layout">
                    <div class="layout vertical center center-justified flex" style="width:50px;">
                        <wl-button fab flat inverted class="fg black" icon="vaadin:controller"></wl-button>
                    </div>
                      <div class="layout vertical start flex" style="width:80px!important;">
                        <div class="layout horizontal configuration">
                          <wl-icon class="fg blue" icon="hardware:developer-board"></wl-icon>
                          <span>4</span>
                          <span class="indicator">core</span>
                        </div>
                        <div class="layout horizontal configuration">
                          <wl-icon class="fg blue" icon="hardware:memory"></wl-icon>
                          <span>16</span>
                          <span class="indicator">GB</span>
                        </div>
                        <div class="layout horizontal configuration">
                          <wl-icon class="fg blue" icon="icons:view-module"></wl-icon>
                          <span>1.5</span>
                          <span class="indicator">GPU</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <wl-title level="4" style="margin: 0">TensorFlow</wl-title>
                  <div style="font-size:11px;max-width:450px;">TensorFlow is an end-to-end open source platform for machine learning.</div>
                </wl-list-item>
                <wl-list-item style="width:calc(100% - 55px);height:80px;">
                  <wl-icon icon="vaadin:puzzle-piece" slot="before"></wl-icon>
                  <div slot="after">
                  <div class="horizontal layout">
                    <div class="layout vertical center center-justified flex" style="width:50px;">
                        <wl-button fab flat inverted class="fg black" icon="vaadin:controller"></wl-button>
                    </div>
                      <div class="layout vertical start flex" style="width:80px!important;">
                        <div class="layout horizontal configuration">
                          <wl-icon class="fg blue" icon="hardware:developer-board"></wl-icon>
                          <span>4</span>
                          <span class="indicator">core</span>
                        </div>
                        <div class="layout horizontal configuration">
                          <wl-icon class="fg blue" icon="hardware:memory"></wl-icon>
                          <span>16</span>
                          <span class="indicator">GB</span>
                        </div>
                        <div class="layout horizontal configuration">
                          <wl-icon class="fg blue" icon="icons:view-module"></wl-icon>
                          <span>1.5</span>
                          <span class="indicator">GPU</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <wl-title level="4" style="margin: 0">TensorFlow Validate</wl-title>
                  <div style="font-size:11px;max-width:450px;">TensorFlow is an end-to-end open source platform for machine learning.</div>
                </wl-list-item>
                <wl-list-item style="width:calc(100% - 55px);height:80px;">
                  <wl-icon icon="vaadin:puzzle-piece" slot="before"></wl-icon>
                  <div slot="after">
                    <div class="horizontal layout">
                      <div class="layout vertical center center-justified flex" style="width:50px;">
                          <wl-button fab flat inverted class="fg black" icon="vaadin:controller"></wl-button>
                      </div>
                      <div class="layout vertical start flex" style="width:80px!important;">
                        <div class="layout horizontal configuration">
                          <wl-icon class="fg blue" icon="hardware:developer-board"></wl-icon>
                          <span>1</span>
                          <span class="indicator">core</span>
                        </div>
                        <div class="layout horizontal configuration">
                          <wl-icon class="fg blue" icon="hardware:memory"></wl-icon>
                          <span>1</span>
                          <span class="indicator">GB</span>
                        </div>
                        <div class="layout horizontal configuration">
                          <wl-icon class="fg blue" icon="icons:view-module"></wl-icon>
                          <span>-</span>
                          <span class="indicator">GPU</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <wl-title level="4" style="margin: 0">TensorFlow Serving</wl-title>
                  <div style="font-size: 11px;max-width:450px;">TensorFlow Serving is a flexible, high-performance serving system for machine learning models, designed for production environments.</div>
                </wl-list-item>
                <mwc-button
                    outliend
                    id="launch-session"
                    icon="add"
                    label="Add component"></mwc-button>
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
    'backend-ai-experiment-view': BackendAIExperimentView;
  }
}
