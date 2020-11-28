/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import '@material/mwc-icon';
import '@material/mwc-icon-button';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-tab-bar/mwc-tab-bar';
import '@material/mwc-textfield';

import 'weightless/list-item';

import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';
import {default as PainKiller} from './backend-ai-painkiller';
import './backend-ai-dialog';
import './backend-ai-pipeline-create';
import './backend-ai-pipeline-list';
import './backend-ai-session-list';
import './lablup-codemirror';
import './lablup-loading-spinner';

@customElement("backend-ai-pipeline-view")
export default class BackendAIPipelineView extends BackendAIPage {
  // Elements
  @property({type: Object}) notification = Object();
  @property({type: Object}) indicator = Object();
  @property({type: Object}) pipelineCreate = Object();
  @property({type: Object}) pipelineList = Object();

  @property({type: String}) _status = 'inactive';
  @property({type: String}) componentCreateMode = 'create';
  // Properties for selected pipeline
  @property({type: String}) pipelineFolderName = '';
  @property({type: Object}) pipelineConfig = Object();
  @property({type: Array}) pipelineComponents = Array();
  @property({type: Number}) selectedComponentIndex = -1;
  @property({type: Array}) componentsToBeRun = Array();

  @property({type: Object}) _dragSource = Object();
  @property({type: Object}) _dragTarget = Object();

  constructor() {
    super();
    this.active = false;
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
        .pipeline-item,
        .sidebar-item {
          max-width: 300px;
        }

        mwc-textfield {
          width: 100%;
          --mdc-text-field-idle-line-color: rgba(0, 0, 0, 0.42);
          --mdc-text-field-hover-line-color: rgba(0, 0, 255, 0.87);
          --mdc-text-field-fill-color: transparent;
          --mdc-theme-primary: var(--paper-blue-600);
        }

        h3.tab {
          background-color: var(--general-tabbar-background-color);
          border-radius: 5px 5px 0px 0px;
          margin: 0px auto;
        }

        mwc-tab-bar {
          --mdc-theme-primary: var(--general-sidebar-selected-color);
          --mdc-text-transform: none;
          --mdc-tab-color-default: var(--general-tabbar-background-color);
          --mdc-tab-text-label-color-default: var(--general-tabbar-tab-disabled-color);
        }

        mwc-button[outlined] {
          margin: 10px 5px;
          background-image: none;
          --mdc-button-outline-width: 2px;
          --mdc-button-disabled-outline-color: var(--general-sidebar-color);
          --mdc-button-disabled-ink-color: var(--general-sidebar-color);
          --mdc-theme-primary: var(--paper-light-blue-800, #efefef);
          --mdc-on-theme-primary: var(--paper-light-blue-800, #efefef);
        }

        h3 mwc-button[outlined] {
          --mdc-theme-primary: #38bd73;
          --mdc-on-theme-primary: #38bd73;
        }

        #pipeline-environment {
          --mdc-menu-item-height: 40px;
          z-index: 10000;
          max-height: 300px;
        }

        #pipeline-environment-tag {
          --mdc-menu-item-height: 35px;
        }

        .pipeline-item,
        .sidebar-item {
          cursor: pointer;
        }

        #edit-pipeline {
          margin: 5px;
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
    this.pipelineCreate = this.shadowRoot.querySelector('backend-ai-pipeline-create');
    this.pipelineList = this.shadowRoot.querySelector('backend-ai-pipeline-list');

    const dialog = this.shadowRoot.querySelector('#codemirror-dialog');
    dialog.addEventListener('didShow', () => {
      this.shadowRoot.querySelector('#codemirror-editor').refresh();
    });
    this.pipelineCreate.addEventListener('backend-ai-pipeline-created', (e) => {
      const folderName = e.detail;
      this.pipelineList.changePipeline(folderName);
    });
    this.pipelineCreate.addEventListener('backend-ai-pipeline-updated', (e) => {
      const folderName = e.detail;
      this.pipelineList.changePipeline(folderName);
    });
    this.pipelineCreate.addEventListener('backend-ai-pipeline-deleted', (e) => {
      this.pipelineList.deselectPipeline();
    });

    this.notification = globalThis.lablupNotification;
    this.indicator = this.shadowRoot.querySelector('#loading-spinner');
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    if (typeof window.backendaiclient === "undefined" || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', async () => {
      }, true);
    } else {
    }
  }

  _openPipelineCreateDialog() {
    this.pipelineCreate._openPipelineCreateDialog();
  }

  _openPipelineUpdateDialog() {
    this.pipelineCreate._openPipelineUpdateDialog(this.pipelineList.pipelineSelectedName);
  }

  _openPipelineDeleteDialog() {
    this.pipelineCreate._openPipelineDeleteDialog(this.pipelineList.pipelineSelectedName);
  }

  _openComponentAddDialog() {
    if (!this.pipelineFolderName) {
      this.notification.text = 'No pipeline selected';
      this.notification.show();
      return;
    }
    this.componentCreateMode = 'create';
    this._fillComponentAddDialogFields(null);
    this.shadowRoot.querySelector('#component-add-dialog').show();
  }

  _hideComponentAddDialog() {
    this.shadowRoot.querySelector('#component-add-dialog').hide();
  }

  async _addComponent() {
    const id = `pipeline-${window.backendaiclient.generateSessionId(8, true)}`;
    const title = this.shadowRoot.querySelector('#component-title').value;
    const description = this.shadowRoot.querySelector('#component-description').value;
    const path = this.shadowRoot.querySelector('#component-path').value;
    if (!title || !path) {
      this.notification.text = 'Title and path are required';
      this.notification.show();
      return;
    }
    const sluggedPath = window.backendaiclient.slugify(path);
    let cpu = this.shadowRoot.querySelector('#component-cpu').value;
    let mem = this.shadowRoot.querySelector('#component-mem').value;
    let gpu = this.shadowRoot.querySelector('#component-gpu').value;
    if (cpu < 1) {
      this.notification.text = 'CPU should be at least 1';
      this.notification.show();
      return;
    }
    if (mem < 0.1) {
      this.notification.text = 'Memory should be at least 0.1 GiB';
      this.notification.show();
      return;
    }
    if (!gpu) gpu = 0;

    const cinfo = {
      id, title, description, path: sluggedPath,
      cpu, mem, gpu,
      executed: false
    };
    if (this.componentCreateMode === 'create') {
      this.pipelineComponents.push(cinfo);
    } else {
      if (this.selectedComponentIndex < 0) {
        this.notification.text = 'Invalid component';
        this.notification.show();
        return;
      }
      this.pipelineComponents[this.selectedComponentIndex] = cinfo;
      this.selectedComponentIndex = -1;
    }
    this.indicator.show();
    await this._uploadPipelineComponents(this.pipelineFolderName, this.pipelineComponents);
    this.pipelineComponents = this.pipelineComponents.slice();
    this._hideComponentAddDialog();
    this.indicator.hide();
  }

  _openComponentUpdateDialog(info, idx) {
    this.componentCreateMode = 'update';
    this.selectedComponentIndex = idx;
    this._fillComponentAddDialogFields(info);
    this.shadowRoot.querySelector('#component-add-dialog').show();
  }

  _openComponentDeleteDialog(idx) {
    this.selectedComponentIndex = idx;
    this.shadowRoot.querySelector('#component-delete-dialog').show();
  }

  _hideComponentDeleteDialog() {
    this.shadowRoot.querySelector('#component-delete-dialog').hide();
  }

  _deleteComponent() {
    if (this.selectedComponentIndex < 0) {
      this.notification.text = 'Invalid component';
      this.notification.show();
      return;
    }
    this.pipelineComponents.splice(this.selectedComponentIndex, 1);
    this._uploadPipelineComponents(this.pipelineFolderName, this.pipelineComponents);
    this.pipelineComponents = this.pipelineComponents.slice();
    this.shadowRoot.querySelector('#component-delete-dialog').hide();
  }

  _fillComponentAddDialogFields(info) {
    if (!info) info = {};
    const dialog = this.shadowRoot.querySelector('#component-add-dialog');
    dialog.querySelector('#component-title').value = info.title || '';
    dialog.querySelector('#component-description').value = info.description || '';
    dialog.querySelector('#component-path').value = info.path || '';
    dialog.querySelector('#component-cpu').value = info.cpu || '1';
    dialog.querySelector('#component-mem').value = info.mem || '1';
    dialog.querySelector('#component-gpu').value = info.gpu || '0';
  }

  async _uploadPipelineComponents(folderName, cinfo) {
    const vfpath = 'components.json';
    const blob = new Blob([JSON.stringify(cinfo, null, 2)], {type: 'application/json'});
    try {
      this.indicator.show();
      await this._uploadFile(vfpath, blob, folderName);
      this.indicator.hide();
    } catch (err) {
      console.error(err)
      this.indicator.hide();
      this.notification.text = PainKiller.relieve(err.title);
      this.notification.detail = err.message;
      this.notification.show(true);
    }
  }

  async _downloadPipelineComponents(folder_name) {
    const vfpath = 'components.json';
    try {
      this.indicator.show();
      const res = await window.backendaiclient.vfolder.download(vfpath, folder_name, false, true);
      const config = await res.json();
      this.indicator.hide();
      return config;
    } catch (err) {
      console.error(err)
      this.indicator.hide();
      this.notification.text = PainKiller.relieve(err.title);
      this.notification.detail = err.message;
      this.notification.show(true);
    }
  }

  async _ensureComponentFolder(component) {
    const folder = `${component.path}`;
    try {
      await window.backendaiclient.vfolder.mkdir(folder, this.pipelineFolderName, null, true);
    } catch (err) {
      if (err && err.message && err.message.includes('already exists')) {
        // silently pass if the target folder alrady exists
      } else {
        console.error(err)
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true);
      }
    }
  }

  async _ensureComponentMainCode(component) {
    await this._ensureComponentFolder(component);
    const filepath = `${component.path}/main.py`; // TODO: hard-coded file name
    try {
      const res = await window.backendaiclient.vfolder.download(filepath, this.pipelineFolderName, false, true);
      return await res.text();
    } catch (err) {
      console.error(err)
      if (err.title && err.title.split(' ')[0] === '404') {
        // Code file not found. upload empty code.
        const blob = new Blob([''], {type: 'plain/text'});
        await this._uploadFile(filepath, blob, this.pipelineFolderName);
        return '';
      } else {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true);
      }
    }
  }

  async _editCode(idx) {
    if (idx < 0) {
      this.notification.text = 'Invalid component';
      this.notification.show();
      return;
    }
    this.indicator.show();
    this.selectedComponentIndex = idx;
    const component = this.pipelineComponents[idx];
    const code = await this._ensureComponentMainCode(component);
    const dialog = this.shadowRoot.querySelector('#codemirror-dialog');
    const editor = this.shadowRoot.querySelector('#codemirror-editor');
    editor.setValue(code);
    dialog.querySelector('span[slot="title"]').textContent = component.title;
    dialog.show();
    this.indicator.hide();
  }

  async _saveCode() {
    if (this.selectedComponentIndex < 0) {
      this.notification.text = 'Invalid component';
      this.notification.show();
      return;
    }
    this.indicator.show();
    const component = this.pipelineComponents[this.selectedComponentIndex];
    const filepath = `${component.path}/main.py`; // TODO: hard-coded file name
    const editor = this.shadowRoot.querySelector('#codemirror-editor');
    const code = editor.getValue();
    const blob = new Blob([code], {type: 'plain/text'});
    await this._uploadFile(filepath, blob, this.pipelineFolderName);
    this.pipelineComponents[this.selectedComponentIndex].executed = false;
    this.pipelineComponents = this.pipelineComponents.slice();
    await this._uploadPipelineComponents(this.pipelineFolderName, this.pipelineComponents);
    this.indicator.hide();
  }

  _hideCodeDialog() {
    this.selectedComponentIndex = -1;
    const codemirrorEl = this.shadowRoot.querySelector('#codemirror-dialog');
    codemirrorEl.hide();
  }

  async _saveCodeAndCloseDialog() {
    await this._saveCode();
    this._hideCodeDialog();
  }

  _subscribeKernelEventStream(sessionName, idx, component, kernelId) {
    const url = window.backendaiclient._config.endpoint + `/func/events/session?sessionName=${sessionName}`;
    const sse = new EventSource(url, {withCredentials: true});
    let execSuccess;

    this.indicator.show();

    sse.addEventListener('kernel_pulling', (e) => {
      this.notification.text = `Pulling kernel image. This may take several minutes...`;
      this.notification.show();
    });
    sse.addEventListener('session_started', (e) => {
      const data = JSON.parse((<any>e).data);
      this.notification.text = `Session started (${data.sessionName}). Running component...`;
      this.notification.show();
    });
    sse.addEventListener('session_success', async (e) => {
      // Mark component executed.
      component.executed = true;
      this.pipelineComponents[idx] = component;
      await this._uploadPipelineComponents(this.pipelineFolderName, this.pipelineComponents);
      this.pipelineComponents = this.pipelineComponents.slice();

      execSuccess = true;
    })
    sse.addEventListener('session_failure', (e) => {
      execSuccess = false;
    })
    sse.addEventListener('session_terminated', async (e) => {
      const data = JSON.parse((<any>e).data);

      // Store execution logs in the component folder for convenience.
      const logs = await window.backendaiclient.getTaskLogs(kernelId);
      console.log(logs.substring(0, 500)); // for debugging
      const filepath = `${component.path}/execution_logs.txt`;
      const blob = new Blob([logs], {type: 'plain/text'});
      await this._uploadFile(filepath, blob, this.pipelineFolderName);

      // Final handling.
      sse.close();
      if (execSuccess) {
        this.notification.text = `Execution succeed (${data.sessionName})`;
      } else {
        this.notification.text = `Execution error (${data.sessionName})`;
      }
      this.notification.show();
      this.indicator.hide();

      // If there are further components to be run (eg. whole pipeline is ran),
      // run next component from the job queue.
      if (execSuccess && this.componentsToBeRun.length > 0) {
        const nextId = this.componentsToBeRun.shift();
        const allComponentIds = this.pipelineComponents.map((c) => c.id);
        const cidx = allComponentIds.indexOf(nextId);
        if (cidx < 0) {
          this.componentsToBeRun = [];
        } else {
          this._runComponent(cidx);
        }
      }

      execSuccess = undefined;
    });

    return sse;
  }

  async _runComponent(idx) {
    if (idx < 0) {
      this.notification.text = 'Invalid component';
      this.notification.show();
      return;
    }
    for (let i = 0; i < idx; i++) {
      const comp = this.pipelineComponents[i];
      if (!comp.executed) {
        this.notification.text = 'Run previous component(s) first';
        this.notification.show();
        return;
      }
    }

    /* Prepare execution context */
    const pipeline = this.pipelineConfig;
    const component = this.pipelineComponents[idx];
    const image = `${pipeline.environment}:${pipeline.version}`;
    let opts = {
      domain: window.backendaiclient._config.domainName,
      group_name: window.backendaiclient.current_group,
      type: 'batch',
      // startsAt: '1s',
      enqueueOnly: true,
      startupCommand: `
        cd /home/work/${this.pipelineFolderName}/;
        python /home/work/${this.pipelineFolderName}/${component.path}/main.py
      `,
      maxWaitSeconds: 10,
      mounts: [this.pipelineFolderName],
      scaling_group: component.scaling_group,
      cpu: component.cpu,
      mem: component.mem + 'g', // memeory in GiB
      fgpu: component.gpu,
    }
    let sse; // EventSource object for kernel stream

    /* Start batch session and monitor events. */
    this.indicator.show();
    await this._ensureComponentMainCode(component);
    try {
      const kernel = await window.backendaiclient.createKernel(image, undefined, opts);
      const sessionUuid = kernel.sessionId;
      const sessionName = kernel.sessionName;
      let kernelId = undefined;
      for (let i = 0; i < 10; i++) {
        // Wait 10 s for kernel id to make enqueueOnly option work.
        // TODO: make wait time configurable?
        const kinfo = await window.backendaiclient.computeSession.get(['id'], sessionUuid);
        if (kinfo.compute_session && kinfo.compute_session.id) {
          kernelId = kinfo.compute_session.id;
          break;
        }
        await new Promise(r => setTimeout(r, 1000)); // wait 1 second
      }
      if (kernelId) {
        sse = this._subscribeKernelEventStream(sessionName, idx, component, kernelId);
      } else {
        throw new Error('Unable to get information on compute session');
      }
    } catch (err) {
      console.error(err)
      if (sse) sse.close();
      this.componentsToBeRun = [];
      this.indicator.hide();
      this.notification.text = PainKiller.relieve(err.title);
      this.notification.detail = err.message;
      this.notification.show(true);
    }
  }

  async _showComponentLogs(idx) {
    if (idx < 0) {
      this.notification.text = 'Invalid component';
      this.notification.show();
      return;
    }

    const component = this.pipelineComponents[idx];
    const filepath = `${component.path}/execution_logs.txt`; // TODO: hard-coded file name
    try {
      const blob = await window.backendaiclient.vfolder.download(filepath, this.pipelineFolderName);
      const logs = await blob.text();
      const newWindow = window.open('', `Component ${idx} log`, 'width=800,height=600');
      if (newWindow) {
        newWindow.document.body.innerHTML = `<pre style="color:#ccc; background:#222; padding:1em; overflow:auto;">${logs}</pre>`
      }
    } catch (err) {
      console.error(err)
      if (err.title && err.title.split(' ')[0] === '404') {
        this.notification.text = 'No logs for this component';
        this.notification.detail = err.message;
        this.notification.show(true);
      } else {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true);
      }
    }
  }

  async _savePipeline() {
    await this._uploadPipelineComponents(this.pipelineFolderName, this.pipelineComponents);
    this.notification.text = 'Saved pipeline components structure';
    this.notification.show();
  }

  async _runPipeline() {
    // Mark all components not executed
    this.pipelineComponents.forEach((component, i) => {
      component.executed = false;
      this.pipelineComponents[i] = component;
    });
    await this._uploadPipelineComponents(this.pipelineFolderName, this.pipelineComponents);

    this.indicator.show();

    // Push all components in job queue and initiate the first run
    const allComponentIds = this.pipelineComponents.map((c) => c.id);
    this.componentsToBeRun = allComponentIds;
    this.componentsToBeRun.shift();
    await this._runComponent(0); // run the first component
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/fonts/font-awesome-all.min.css">
      <div style="margin:20px">
        <lablup-activity-panel elevation="1" noheader narrow autowidth>
          <div slot="message">
            <h3 class="tab horizontal center layout">
              <mwc-tab-bar>
                <mwc-tab aria-label="exp-lists" label="${_t('pipeline.List')}">
                </mwc-tab>
                <mwc-tab style="display:none" aria-label="running-lists"
                    label="${_t('pipeline.Running')}">
                </mwc-tab>
                <mwc-tab style="display:none" aria-label="finished-lists"
                    label="${_t('pipeline.Finished')}">
                </mwc-tab>
              </mwc-tab-bar>
              <span class="flex"></span>
              <mwc-button outlined id="delete-pipeline" icon="delete"
                  label="${_t('button.Delete')}" @click="${() => this._openPipelineDeleteDialog()}">
              </mwc-button>
              <mwc-button outlined id="edit-pipeline" icon="edit"
                  label="${_t('button.Edit')}" @click="${() => this._openPipelineUpdateDialog()}">
              </mwc-button>
              <mwc-button dense raised id="add-pipeline" icon="add"
                  label="${_t('button.Create')}" style="margin-right:15px"
                  @click="${() => this._openPipelineCreateDialog()}">
              </mwc-button>
            </h3>
            <div class="horizontal wrap layout">
              <backend-ai-pipeline-list ?active="${this.active}"></backend-ai-pipeline-list>
              <backend-ai-pipeline-create ?active="${this.active}"></backend-ai-pipeline-create>

      <!--
              <div id="exp-lists" class="tab-content" style="margin:0;padding:0;height:calc(100vh - 235px);">
                <div class="horizontal wrap layout" style="margin:0;padding:0;">
                  <div class="layout vertical flex">
                    <div class="layout vertical" style="padding:5px 20px">
                      <div class="layout vertical flex" style="margin-bottom:0.5em;">
                        ${this.pipelineConfig.environment && this.pipelineConfig.version ? html`
                          <span>Environment: ${this.pipelineConfig.environment}:${this.pipelineConfig.version}</span>
                        ` : ''}
                        ${this.pipelineConfig.scaling_group ? html`
                          <span>Scaling group: ${this.pipelineConfig.scaling_group}</span>
                        ` : ''}
                        ${this.pipelineConfig.folder_host ? html`
                          <span>Folder: ${this.pipelineFolderName} (${this.pipelineConfig.folder_host})</span>
                        ` : ''}
                      </div>
                      <div class="layout horizontal center">
                        <mwc-button outlined id="add-component" icon="add"
                              label="Add component"
                              @click="${() => this._openComponentAddDialog()}">
                        </mwc-button>
                      </div>
                    </div>
                    <div id="pipeline-component-list">
                      ${this.pipelineComponents.map((item, idx) => html`
                        <wl-list-item data-id="${idx}">
                          <mwc-icon icon="extension" slot="before"></mwc-icon>
                          <div slot="after">
                            <div class="horizontal layout">
                              <div class="layout horizontal center" style="margin-right:1em;">
                                  <mwc-icon-button class="fg black" icon="code" @click="${() => this._editCode(idx)}"></mwc-icon-button>
                                  <mwc-icon-button class="fg ${item.executed ? 'green' : 'black'}" icon="play_arrow" @click="${() => this._runComponent(idx)}"></mwc-icon-button>
                                  <mwc-icon-button class="fg black" icon="assignment" @click="${() => this._showComponentLogs(idx)}"></mwc-icon-button>
                                  <mwc-icon-button class="fg black" icon="edit" @click="${() => this._openComponentUpdateDialog(item, idx)}"></mwc-icon-button>
                                  <mwc-icon-button class="fg black" icon="delete" @click="${() => this._openComponentDeleteDialog(idx)}"></mwc-icon-button>
                              </div>
                              <div class="layout vertical start flex" style="width:80px!important;">
                                <div class="layout horizontal configuration">
                                  <mwc-icon class="fg blue" icon="developer-board"></mwc-icon>
                                  <span>${item.cpu}</span>
                                  <span class="indicator">core</span>
                                </div>
                                <div class="layout horizontal configuration">
                                  <mwc-icon class="fg blue" icon="memory"></mwc-icon>
                                  <span>${item.mem}</span>
                                  <span class="indicator">GB</span>
                                </div>
                                <div class="layout horizontal configuration">
                                  <mwc-icon class="fg blue" icon="view-module"></mwc-icon>
                                  <span>${item.gpu}</span>
                                  <span class="indicator">GPU</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <wl-title level="4" style="margin: 0">${item.title}</wl-title>
                          <div style="font-size:11px;max-width:400px;">${item.description}</div>
                          <div style="font-size:11px;max-width:400px;">${item.path}</div>
                        </wl-list-item>
                      `)}
                    </div>
                    <div class="layout horizontal end-justified" style="margin-bottom:1em">
                      ${this.pipelineComponents.length < 1 ? html`
                        <mwc-list-item>No components.</mwc-list-item>
                      ` : html`
                        <mwc-button id="save-pipeline-button"
                            label="Save pipeline components"
                            @click="${this._savePipeline}"></mwc-button>
                        <mwc-button unelevated id="run-pipeline-button"
                            label="Run pipeline"
                            @click="${this._runPipeline}"></mwc-button>
                      `}
                    </div>
                  </div>
                </div>
              </div>
              <div id="running-lists" class="tab-content" style="display:none;">
                <backend-ai-session-list id="running-jobs" condition="running" ?active="${this._status === 'active'}"></backend-ai-session-list>
              </div>
              <div id="finished-lists" class="tab-content" style="display:none;">
                <backend-ai-session-list id="finished-jobs" condition="finished" ?active="${this._status === 'active'}"></backend-ai-session-list>
              </div>
            </div> -->
          </div>
        </lablup-activity-panel>
      </div>

      <backend-ai-dialog id="component-add-dialog" fixed backdrop>
        <span slot="title">${this.componentCreateMode === 'create' ? 'Add' : 'Update'} component</span>
        <div slot="content" class="layout verticlal" style="width:450px">
          <mwc-textfield id="component-title" type="text" autofocus
              label="Component title" maxLength="30"></mwc-textfield>
          <mwc-textfield id="component-description" type="text"
              label="Component description" maxLength="200"></mwc-textfield>
          <mwc-textfield id="component-path" type="text"
              label="Component path in folder" maxLength="300"></mwc-textfield>
          <div class="layout horizontal">
            <mwc-textfield id="component-cpu" label="CPU" type="number" value="1" min="1"></mwc-textfield>
            <mwc-textfield id="component-mem" label="Memory (GiB)" type="number" value="1" min="0"></mwc-textfield>
            <mwc-textfield id="component-gpu" label="GPU" type="number" value="0" min="0"></mwc-textfield>
          </div>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <div class="flex"></div>
          <mwc-button label="${_t('button.Cancel')}"
              @click="${this._hideComponentAddDialog}"></mwc-button>
          <mwc-button unelevated
              label="${this.componentCreateMode === 'create' ? _t('button.Add') : _t('button.Update')}"
              @click="${this._addComponent}"></mwc-button>
        </div>
      </backend-ai-dialog>

      <backend-ai-dialog id="codemirror-dialog" fixed backdrop scrollable blockScrolling persistent>
        <span slot="title"></span>
        <div slot="content" class="layout vertical">
          <lablup-codemirror id="codemirror-editor" mode="python"></lablup-codemirror>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <div class="flex"></div>
          <mwc-button label="Close without save"
              @click="${this._hideCodeDialog}"></mwc-button>
          <mwc-button label="Save and close"
              @click="${this._saveCodeAndCloseDialog}"></mwc-button>
          <mwc-button unelevated
              label="${_t('button.Save')}"
              @click="${this._saveCode}"></mwc-button>
        </div>
      </backend-ai-dialog>

      <backend-ai-dialog id="component-delete-dialog" fixed backdrop blockscrolling>
        <span slot="title">Delete component?</span>
        <div slot="content" class="layout vertical">
          <p>This action cannot be undone. Do you want to proceed?</p>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <div class="flex"></div>
          <mwc-button label="${_t('button.Cancel')}"
              @click="${this._hideComponentDeleteDialog}"></mwc-button>
          <mwc-button unelevated
              label="${_t('button.Delete')}"
              @click="${this._deleteComponent}"></mwc-button>
        </div>
      </backend-ai-dialog>

      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-pipeline-view": BackendAIPipelineView;
  }
}
