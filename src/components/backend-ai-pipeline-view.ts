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

import Sortable from 'sortablejs';
import '@vaadin/vaadin-dialog/vaadin-dialog';
import 'weightless/button';
import 'weightless/icon';
import 'weightless/dialog';
import 'weightless/expansion';
import 'weightless/card';
import 'weightless/tab';
import 'weightless/tab-group';
import 'weightless/list-item';
import 'weightless/divider';
import 'weightless/textfield';

import {BackendAiStyles} from './backend-ai-console-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';
import {default as PainKiller} from './backend-ai-painkiller';
import './backend-ai-session-list';
import './backend-ai-dropdown-menu';
import './lablup-codemirror';
import './lablup-loading-indicator';

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

  public indicator: any;

  // private scalingGroup: string;
  private allowedScalingGroups: any[];
  private vhost: string;
  private vhosts: string[];
  private pipelineList: any[];
  private pipelineComponents: any[];
  // private pipelineSortable: object;

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

    // this.scalingGroup = '';
    this.allowedScalingGroups = [];
    this.vhost = '';
    this.vhosts = [];
    this.pipelineList = [];
    this.pipelineComponents = [
      {
        'title': 'Backend.AI Data Uploader',
        'description': 'Backend.AI data uploader helps users uploading the data to experiment store',
        'code': 'import tensorflow as tf\nprint(tf.__version__)',
        'cpu': 1,
        'mem': 1,
        'gpu': 0
      },
      {
        'title': 'Facet',
        'description': 'Facets contains two robust visualizations to aid in understanding and analyzing',
        'code': 'print("Facet")',
        'cpu': 1,
        'mem': 1,
        'gpu': 0
      },
      {
        'title': 'TensorFlow',
        'description': 'TensorFlow is an end-to-end open source platform for machine learning',
        'code': 'print("TensorFlow")',
        'cpu': 4,
        'mem': 16,
        'gpu': 1.5
      },
      {
        'title': 'TensorFlow Validate',
        'code': 'print("TensorFlow Validate")',
        'description': 'TensorFlow is an end-to-end open source platform for machine learning',
        'cpu': 4,
        'mem': 16,
        'gpu': 1.5
      },
      {
        'title': 'TensorFlow Serving',
        'description': 'TensorFlow is an end-to-end open source platform for machine learning',
        'code': 'print("TensorFlow Serving")',
        'cpu': 1,
        'mem': 1,
        'gpu': 0
      },
    ];
    // this.pipelineSortable = {};
  }

  static get is() {
    return 'backend-ai-pipeline-view';
  }

  static get properties() {
    return {
      pipelineList: Array,
      pipelineComponent: Array,
      vhost: String,
      vhosts: Array,
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

        wl-card h3.tab {
          padding-top: 0;
          padding-bottom: 0;
          padding-left: 0;
        }

        .indicator {
          font-family: monospace;
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

        #exp-sidebar {
          weight: 300px;
          border-right: 1px solid #ccc;
          height: calc(100vh - 235px);
        }

        .sidebar-item {
          width: 300px;
        }

        #pipeline-create-dialog {
          --dialog-min-width: 400px;
        }

        #codemirror-dialog {
          --dialog-min-width: calc(100vw - 200px);
          --dialog-max-width: calc(100vw - 200px);
          --dialog-min-height: calc(100vh - 100px);
          --dialog-max-height: calc(100vh - 100px);
        }
      `];
  }

  firstUpdated() {
    this.notification = window.lablupNotification;
    this.indicator = this.shadowRoot.querySelector('#loading-indicator');

    this._fetchPipelineFolders();
    this._makeSortablePipelineComponents();
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    if (typeof window.backendaiclient === "undefined" || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._fetchPipelineFolders();
        this._makeSortablePipelineComponents();
      }, true);
    } else {
      this._fetchPipelineFolders();
      this._makeSortablePipelineComponents();
    }
  }

  _fetchPipelineFolders() {
    this.indicator.show();
    window.backendaiclient.vfolder.list()
        .then((folders) => {
          const pipelines: Array<object> = [];
          folders.forEach((folder) => {
            if (folder.name.startsWith('pipeline-')) pipelines.push(folder);
          });
          this.pipelineList = pipelines;
          this.indicator.hide();
        });
  }

  _openPipelineCreateDialog() {
    window.backendaiclient.vfolder.list_hosts()
        .then((resp) => {
          const listbox = this.shadowRoot.querySelector('#folder-host paper-listbox');
          this.vhosts = resp.allowed.slice();
          this.vhost = resp.default;
          listbox.selected = this.vhost;
        })
        .catch((err) => {
          if (err && err.message) {
            this.notification.text = PainKiller.relieve(err.title);
            this.notification.detail = err.message;
            this.notification.show(true);
          }
        });
    this.shadowRoot.querySelector('#pipeline-create-dialog').show();
  }

  _hidePipelineCreateDialog() {
    const dialog = this.shadowRoot.querySelector('#pipeline-create-dialog');
    dialog.hide();
  }

  _createPipeline() {
    const pipelineName = this.shadowRoot.querySelector('#pipeline-name').value;
    // const pipelineDescription = this.shadowRoot.querySelector('#pipeline-description').value;
    const vhost = this.shadowRoot.querySelector('#folder-host').value;
    const vfname = `pipeline-${window.backendaiclient.slugify(pipelineName)}-${window.backendaiclient.generateSessionId(8, true)}`;
    if (!pipelineName || !vhost) {
      this.notification.text = 'Name and folder host should not be empty';
      this.notification.show();
      return;
    }
    this.indicator.show();
    window.backendaiclient.vfolder.create(vfname, vhost)
        .then((resp) => {
          this.notification.text = 'Pipeline created';
          this.notification.show();
          this._fetchPipelineFolders();
          this._hidePipelineCreateDialog();
          this.indicator.hide();
        })
        .catch((err) => {
          if (err && err.message) {
            this.notification.text = PainKiller.relieve(err.title);
            this.notification.detail = err.message;
            this.notification.show(true);
          }
          this.indicator.hide();
        });
  }

  _showTab(tab) {
    var els = this.shadowRoot.querySelectorAll(".tab-content");
    for (var x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    this.shadowRoot.querySelector('#' + tab.value).style.display = 'block';
  }

  _makeSortablePipelineComponents() {
    const el = this.shadowRoot.querySelector('#pipeline-component-list');
    // this.pipelineSortable = Sortable.create(el);
    Sortable.create(el);
  }

  _editCode(pipelineComponent) {
    const editor = this.shadowRoot.querySelector('#codemirror-editor');
    editor.setValue(pipelineComponent.code);
    const dialog = this.shadowRoot.querySelector('#codemirror-dialog');
    dialog.querySelector('div[slot="header"]').textContent = pipelineComponent.title;
    dialog.show();
  }

  _hideCodeDialog() {
    const codemirrorEl = this.shadowRoot.querySelector('#codemirror-dialog');
    codemirrorEl.hide();
  }

  _runComponentCode() {
    console.log('# _runComponentCode');
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
          <wl-button class="fg blue button" id="add-experiment" outlined
              @click="${this._openPipelineCreateDialog}">
            <wl-icon>add</wl-icon>
            Add pipeline
          </wl-button>
        </h3>
        <div id="exp-lists" class="tab-content" style="margin:0;padding:0;height:calc(100vh - 235px);">
          <div class="horizontal wrap layout" style="margin:0;padding:0;">
            <div id="exp-sidebar">
              <h4>Pipeline</h4>
              ${this.pipelineList.map((item) => html`
                <wl-list-item class="sidebar-item">
                  <iron-icon icon="vaadin:flask" slot="before"></iron-icon>
                  <span slot="after">5<br/><span style="font-size:9px">components</span></span>
                  <wl-title level="4" style="margin: 0">${item.name}</wl-title>
                  <span style="font-size: 11px;">Test experiment</span>
                </wl-list-item>
              `)}
              ${this.pipelineList.length < 1 ? html`<div style="margin-left:1em;">No pipeline.</span>` : ''}
              <h4>Templates</h4>
              <wl-list-item class="sidebar-item">
                <iron-icon icon="vaadin:flask" slot="before"></iron-icon>
                  <span slot="after">5<br/><span style="font-size:9px">components</span></span>
                  <wl-title level="4" style="margin: 0">Example Experiment (TensorFlow)</wl-title>
                  <span style="font-size: 11px;">Basic experiment example using TensorFlow</span>
              </wl-list-item>
              <wl-list-item class="sidebar-item">
                <iron-icon icon="vaadin:flask" slot="before"></iron-icon>
                  <span slot="after">4<br/><span style="font-size:9px">components</span></span>
                  <wl-title level="4" style="margin: 0">Example Experiment (PyTorch)</wl-title>
                  <span style="font-size: 11px;">Basic experiment example using Pytorch</span>
              </wl-list-item>
              <wl-list-item class="sidebar-item">
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
                        <div class="layout horizontal center" style="width:100px;">
                            <paper-icon-button class="fg black" icon="vaadin:edit" @click="${() => this._editCode(item)}"></paper-icon-button>
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
                    <div style="font-size:11px;max-width:400px;">${item.description}</div>
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

      <wl-dialog id="pipeline-create-dialog" fixed blockscrolling backdrop persistent>
        <div slot="header">Create new pipeline</div>
        <div slot="content">
          <wl-textfield id="pipeline-name" label="Pipeline title" maxLength="30"></wl-textfield>
          <wl-textfield id="pipeline-description" label="Pipeline description" maxLength="300"></wl-textfield>
          <paper-dropdown-menu id="folder-host" label="Folder host" style="width:100%">
            <paper-listbox slot="dropdown-content" attr-for-selected='label'>
              ${this.vhosts.map(item => html`
                <paper-item label="${item}">${item}</paper-item>
              `)}
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
        <div slot="footer">
          <wl-button inverted flat id="" @click="${this._hidePipelineCreateDialog}">Cancel</wl-button>
          <wl-button type="submit" id="create-pipeline-button" @click="${this._createPipeline}">Create</wl-button>
        </div>
      </wl-dialog>

      <wl-dialog id="codemirror-dialog" fixed backdrop scrollable blockScrolling persistent>
        <div slot="header"></div>
        <div slot="content">
          <lablup-codemirror id="codemirror-editor"></lablup-codemirror>
        </div>
        <div slot="footer">
          <wl-button inverted flat id="discard-code" @click="${this._hideCodeDialog}">Cancel</wl-button>
          <wl-button id="save-code" disabled>Save</wl-button>
        </div>
      </wl-dialog>

      <lablup-loading-indicator id="loading-indicator"></lablup-loading-indicator>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-pipeline-view": BackendAIPipelineView;
  }
}
