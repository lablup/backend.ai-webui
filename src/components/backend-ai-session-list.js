/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, html, LitElement} from "lit-element";
import {render} from 'lit-html';


import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/hardware-icons';
import '@polymer/iron-icons/av-icons';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-icon-button/paper-icon-button';
import './lablup-loading-indicator.js';
import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column.js';
import '@vaadin/vaadin-icons/vaadin-icons.js';
import '@vaadin/vaadin-progress-bar/vaadin-progress-bar';

import {default as AnsiUp} from '../lib/ansiup.js';
import 'weightless/card';
import 'weightless/dialog';

import './lablup-notification.js';
import {BackendAiStyles} from './backend-ai-console-styles';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';
import '../plastics/lablup-shields/lablup-shields';
import './backend-ai-indicator.js';

class BackendAiSessionList extends LitElement {
  constructor() {
    super();
    this.active = false;
    this.condition = 'running';
    this.jobs = {};
    this.compute_sessions = {};
    this.terminationQueue = [];
    this.filterAccessKey = '';
    this.appSupportList = [];
    this.appTemplate = {};
    this._boundControlRenderer = this.controlRenderer.bind(this);
    this._boundSessionInfoRenderer = this.sessionIDRenderer.bind(this);
  }

  static get is() {
    return 'backend-ai-session-list';
  }

  static get properties() {
    return {
      active: {
        type: Boolean
      },
      condition: {
        type: String
      },
      jobs: {
        type: Object
      },
      compute_sessions: {
        type: Object
      },
      terminationQueue: {
        type: Array
      },
      filterAccessKey: {
        type: String
      },
      appSupportList: {
        type: Array
      },
      appTemplate: {
        type: Object
      },
      notification: {
        type: Object
      },
      loadingIndicator: {
        type: Object
      }
    };
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        vaadin-grid {
          border: 0;
          font-size: 14px;
          height: calc(100vh - 300px);
        }

        paper-item {
          height: 30px;
          --paper-item-min-height: 30px;
        }

        iron-icon {
          width: 16px;
          height: 16px;
          min-width: 16px;
          min-height: 16px;
          padding: 0;
        }

        wl-button > wl-icon {
          --icon-size: 24px;
          padding: 0;
        }

        wl-icon {
          --icon-size: 16px;
          padding: 0;
        }

        paper-icon-button.controls-running {
          --paper-icon-button: {
            width: 25px;
            height: 25px;
            min-width: 25px;
            min-height: 25px;
            padding: 3px;
            margin-right: 5px;
          };
        }

        paper-icon-button.apps {
          --paper-icon-button: {
            width: 50px;
            height: 50px;
            min-width: 50px;
            min-height: 50px;
            padding: 3px;
            margin-right: 5px;
          };
        }

        #work-dialog {
          --dialog-height: calc(100vh - 130px);
          right: 0;
          top: 50px;
        }

        @media screen and (max-width: 899px) {
          #work-dialog {
            left: 0;
            --dialog-width: 100%;
          }
        }

        @media screen and (min-width: 900px) {
          #work-dialog {
            left: 100px;
            --dialog-width: calc(100% - 220px);
          }
        }

        #work-area {
          width: 100%;
          height: calc(100vh - 120px);
          background-color: #222;
          color: #efefef;
        }

        div.indicator,
        span.indicator {
          font-size: 9px;
          margin-right: 5px;
        }

        div.label,
        span.label {
          font-size: 12px;
        }

        .app-icon {
          margin-left: 5px;
          margin-right: 5px;
        }

        div.configuration {
          width: 70px !important;
        }

        div.configuration iron-icon {
          padding-right: 5px;
        }

        paper-icon-button.apps {
          width: 48px;
          height: 48px;
        }

        .app-icon .label {
          display: block;
          width: 60px;
          text-align: center;
          height: 25px;
        }

        div.filters #access-key-filter {
          --paper-input-container-input: {
            font-size: small;
          };
          --paper-input-container-label: {
            font-size: small;
          };
        }
      `];
  }

  get _isRunning() {
    return this.condition === 'running';
  }

  firstUpdated() {
    this.loadingIndicator = this.shadowRoot.querySelector('#loading-indicator');
    this._initializeAppTemplate();
    this.refreshTimer = null;
    if (!window.backendaiclient ||
      !window.backendaiclient.is_admin) {
      this.shadowRoot.querySelector('#access-key-filter').parentNode.removeChild(this.shadowRoot.querySelector('#access-key-filter'));
    }
    this.notification = this.shadowRoot.querySelector('#notification');
  }

  connectedCallback() {
    super.connectedCallback();
  }

  shouldUpdate() {
    return this.active;
  }

  is_admin() {
    return window.backendaiclient.is_admin;
  }

  attributeChangedCallback(name, oldval, newval) {
    if (name == 'active' && newval !== null) {
      this._menuChanged(true);
    } else {
      this._menuChanged(false);
    }
    super.attributeChangedCallback(name, oldval, newval);
  }

  async _menuChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    // If disconnected
    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._refreshJobData();
      }, true);
    } else { // already connected
      this._refreshJobData();
    }
  }

  _initializeAppTemplate() {
    let jupyterBase = [
      {
        'name': 'jupyter',
        'title': 'Jupyter Notebook',
        'redirect': "&redirect=/tree",
        'src': './resources/icons/jupyter.png'
      },
      {
        'name': 'jupyterlab',
        'title': 'JupyterLab',
        'redirect': "&redirect=/lab",
        'src': './resources/icons/jupyterlab.png',
        'icon': 'vaadin:flask'
      }];
    let TFBase = jupyterBase.concat(
      {
        'name': 'tensorboard',
        'title': 'TensorBoard',
        'redirect': "&redirect=/",
        'src': './resources/icons/tensorflow.png'
      });
    let FFBase = TFBase.concat(
      {
        'name': 'jupyter',
        'title': 'Jupyter Extension',
        'redirect': "&redirect=/nbextensions",
        'src': './resources/icons/jupyter.png',
        'icon': 'vaadin:clipboard-pulse'
      });
    this.appTemplate = {
      'tensorflow': TFBase,
      'python': jupyterBase,
      'python-tensorflow': TFBase,
      'python-ff': FFBase,
      'python-pytorch': TFBase,
      'ngc-digits':
        TFBase.concat(
          {
            'name': 'digits',
            'title': 'DIGITS',
            'redirect': "&redirect=/",
            'src': './resources/icons/nvidia.png'
          }),
      'ngc-tensorflow': TFBase,
      'ngc-pytorch': TFBase,
      'julia': jupyterBase,
      'r': jupyterBase
    };
  }

  refreshList() {
    return this._refreshJobData(true);
  }

  async _refreshJobData(refresh = false) {
    await this.updateComplete;
    if (this.active !== true) {
      return;
    }
    this.loadingIndicator.show();
    let status = 'RUNNING';
    switch (this.condition) {
      case 'running':
        status = 'RUNNING';
        break;
      case 'finished':
        status = 'TERMINATED';
        break;
      case 'archived':
      default:
        status = 'RUNNING';
    }

    let fields = [
      "sess_id", "lang", "created_at", "terminated_at", "status",
      "occupied_slots", "cpu_used", "io_read_bytes", "io_write_bytes", "access_key"
    ];
    window.backendaiclient.computeSession.list(fields, status,
      this.filterAccessKey).then((response) => {
      this.loadingIndicator.hide();

      var sessions = response.compute_sessions;
      if (sessions !== undefined && sessions.length != 0) {
        Object.keys(sessions).map((objectKey, index) => {
          var session = sessions[objectKey];
          var occupied_slots = JSON.parse(session.occupied_slots);
          const kernelImage = sessions[objectKey].lang.split('/')[2];
          sessions[objectKey].cpu_slot = parseInt(occupied_slots.cpu);
          sessions[objectKey].mem_slot = parseFloat(window.backendaiclient.utils.changeBinaryUnit(occupied_slots.mem, 'g'));
          sessions[objectKey].mem_slot = sessions[objectKey].mem_slot.toFixed(2);
          // Readable text
          sessions[objectKey].cpu_used_sec = this._msecToSec(sessions[objectKey].cpu_used);
          sessions[objectKey].elapsed = this._elapsed(sessions[objectKey].created_at, sessions[objectKey].terminated_at);
          sessions[objectKey].created_at_hr = this._humanReadableTime(sessions[objectKey].created_at);
          sessions[objectKey].io_read_bytes_mb = this._byteToMB(sessions[objectKey].io_read_bytes);
          sessions[objectKey].io_write_bytes_mb = this._byteToMB(sessions[objectKey].io_write_bytes);
          sessions[objectKey].appSupport = this._isAppRunning(sessions[objectKey].lang);
          if (this.condition === 'running') {
            sessions[objectKey].running = true;
          } else {
            sessions[objectKey].running = false;
          }
          if ('cuda.device' in occupied_slots) {
            sessions[objectKey].gpu_slot = parseInt(occupied_slots['cuda.device']);
          }
          if ('cuda.shares' in occupied_slots) {
            //sessions[objectKey].fgpu_slot = parseFloat(occupied_slots['cuda.shares']);
            sessions[objectKey].fgpu_slot = parseFloat(parseFloat(occupied_slots['cuda.shares']) * (1.0 / 1.0)).toFixed(2);
          }
          sessions[objectKey].kernel_image = kernelImage;
          sessions[objectKey].sessionTags = this._getKernelInfo(session.lang);
        });
      }
      this.compute_sessions = sessions;
      //this.jobs = response;
      let refreshTime;
      if (this.active === true) {
        if (refresh === true) {
          var event = new CustomEvent("backend-ai-resource-refreshed", {"detail": {}});
          document.dispatchEvent(event);
        }
        if (this.condition === 'running') {
          refreshTime = 5000;
        } else {
          refreshTime = 30000;
        }
        this.refreshTimer = setTimeout(() => {
          this._refreshJobData()
        }, refreshTime);
      }
    }).catch(err => {
      this.loadingIndicator.hide();
      console.log(err);
      if (err && err.message) {
        this.notification.text = err.message;
        this.notification.show();
      }
    });
  }

  _startProgressDialog() {
    this.shadowRoot.querySelector('#app-progress').value = 0;
    this.shadowRoot.querySelector('#app-progress-text').textContent = 'Initializing...';
    this.shadowRoot.querySelector('#app-progress-dialog').open();
  }

  _setProgressDialog(value, text = '') {
    this.shadowRoot.querySelector('#app-progress-text').textContent = text;
    this.shadowRoot.querySelector('#app-progress').value = value;
  }

  _endProgressDialog() {
    this.shadowRoot.querySelector('#app-progress-dialog').close();
  }

  _humanReadableTime(d) {
    var d = new Date(d);
    return d.toLocaleString();
  }

  _isAppRunning(lang) {
    if (this.condition != 'running') return false;
    let support_kernels = [
      'python',
      'python-ff',
      'python-tensorflow',
      'python-pytorch',
      'ngc-digits',
      'ngc-tensorflow',
      'ngc-pytorch',
      'julia',
      'r',
    ];
    //let support_kernels = this.appTemplate.keys;
    //console.log(support_kernels);
    lang = lang.split('/')[2].split(':')[0];
    //lang = lang.split('/')[3].split(':')[0];
    return this.condition === 'running' && support_kernels.includes(lang);
  }

  _getKernelInfo(lang) {
    const kernel_alias = {
      'python': [
        {'category': 'Env', 'tag': 'Python', 'color': 'yellow'}],
      'python-ff': [
        {'category': 'Env', 'tag': 'Lablup Research', 'color': 'yellow'},
        {'tag':'NVidia GPU Cloud', 'color': 'green'}],
      'python-tensorflow': [
        {'category': 'Env', 'tag': 'TensorFlow', 'color': 'yellow'}],
      'python-pytorch':[
        {'category': 'Env', 'tag': 'PyTorch', 'color': 'yellow'}],
      'ngc-digits': [
        {'category': 'Env', 'tag': 'DIGITS', 'color': 'yellow'},
        {'tag':'NVidia GPU Cloud', 'color': 'green'}],
      'ngc-tensorflow': [
        {'category': 'Env', 'tag': 'TensorFlow', 'color': 'yellow'},
        {'tag':'NVidia GPU Cloud', 'color': 'green'}],
      'ngc-pytorch':[
        {'category': 'Env', 'tag': 'PyTorch', 'color': 'yellow'},
        {'tag':'NVidia GPU Cloud', 'color': 'green'}],
      'julia': [
        {'category': 'Env', 'tag': 'Julia', 'color': 'yellow'}],
      'r': [
        {'category': 'Env', 'tag': 'R', 'color': 'yellow'}],
    };
    let tags = [];
    if (lang === undefined) return [];
    let name = lang.split('/')[2].split(':')[0];
    if (name in kernel_alias) {
      tags.push(kernel_alias[name]);
    } else {
      tags = [
        {'tag': lang, 'color': 'green'}
      ]
    }
    return tags;
  }

  _byteToMB(value) {
    return Math.floor(value / 1000000);
  }

  _byteToGB(value) {
    return Math.floor(value / 1000000000);
  }

  _MBToGB(value) {
    return value / 1024;
  }

  _msecToSec(value) {
    return Number(value / 1000).toFixed(2);
  }

  _elapsed(start, end) {
    return window.backendaiclient.utils.elapsedTime(start, end);
  }

  _indexRenderer(root, column, rowData) {
    let idx = rowData.index + 1;
    render(
      html`
        <div>${idx}</div>
      `,
      root
    );
  }

  _terminateKernel(e) {
    const controls = e.target.closest('#controls');
    const kernelId = controls['kernel-id'];
    const accessKey = controls['access-key'];

    if (this.terminationQueue.includes(kernelId)) {
      this.notification.text = 'Already terminating the session.';
      this.notification.show();
      return false;
    }
    this.notification.text = 'Terminating session...';
    this.notification.show();
    this.terminationQueue.push(kernelId);
    this._terminateApp(kernelId).then(() => {
      window.backendaiclient.destroyKernel(kernelId, accessKey).then((req) => {
        setTimeout(() => {
          this.terminationQueue = [];
          this.refreshList();
        }, 1000);
      }).catch((err) => {
        this.notification.text = 'Problem occurred during termination.';
        this.notification.show();
      });
    }).catch((err) => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = err.message;
        this.notification.show();
      }
    });
  }

  async sendRequest(rqst) {
    let resp, body;
    try {
      if (rqst.method == 'GET') {
        rqst.body = undefined;
      }
      resp = await fetch(rqst.uri, rqst);
      let contentType = resp.headers.get('Content-Type');
      if (contentType.startsWith('application/json') ||
        contentType.startsWith('application/problem+json')) {
        body = await resp.json();
      } else if (contentType.startsWith('text/')) {
        body = await resp.text();
      } else {
        if (resp.blob === undefined)
          body = await resp.buffer();  // for node-fetch
        else
          body = await resp.blob();
      }
      if (!resp.ok) {
        throw body;
      }
    } catch (e) {
      console.log(e);
    }
    return body;
  }

  _terminateApp(kernelId) {
    let accessKey = window.backendaiclient._config.accessKey;
    let rqst = {
      method: 'GET',
      uri: this._getProxyURL() + 'proxy/' + accessKey + "/" + kernelId
    };
    return this.sendRequest(rqst)
      .then((response) => {
        let accessKey = window.backendaiclient._config.accessKey;
        if (response !== undefined && response.code !== 404) {
          let rqst = {
            method: 'GET',
            uri: this._getProxyURL() + 'proxy/' + accessKey + "/" + kernelId + '/delete'
          };
          return this.sendRequest(rqst);
        }
      }).catch((err) => {
        console.log(err);
        if (err && err.message) {
          this.notification.text = err.message;
          this.notification.show();
        }
      });
  }

  _getProxyURL() {
    let url = 'http://127.0.0.1:5050/';
    if (window.__local_proxy !== undefined) {
      url = window.__local_proxy;
    } else if (window.backendaiclient._config.proxyURL !== undefined) {
      url = window.backendaiclient._config.proxyURL;
    }
    return url;
  }

  _showLogs(e) {
    const controls = e.target.closest('#controls');
    const kernelId = controls['kernel-id'];
    const accessKey = controls['access-key'];

    window.backendaiclient.getLogs(kernelId, accessKey).then((req) => {
      const ansi_up = new AnsiUp();
      let logs = ansi_up.ansi_to_html(req.result.logs);
      setTimeout(() => {
        this.shadowRoot.querySelector('#work-title').innerHTML = `${kernelId}`;
        this.shadowRoot.querySelector('#work-area').innerHTML = `<pre>${logs}</pre>` || 'No logs.';
        this.shadowRoot.querySelector('#work-dialog').show();
      }, 100);
    }).catch((err) => {
      if (err && err.message) {
        this.notification.text = err.message;
        this.notification.show();
      } else if (err && err.title) {
        this.notification.text = err.title;
        this.notification.show();
      }
    });
  }

  _showAppLauncher(e) {
    const controller = e.target;
    const controls = controller.closest('#controls');
    const kernelId = controls['kernel-id'];
    const accessKey = controls['access-key'];
    const kernelImage = controls['kernel-image'];
    let imageName = kernelImage.split(":")[0];
    if (imageName in this.appTemplate) {
      this.appSupportList = this.appTemplate[imageName];
    } else {
      this.appSupportList = [];
    }
    let dialog = this.shadowRoot.querySelector('#app-dialog');
    dialog.setAttribute('kernel-id', kernelId);
    dialog.setAttribute('access-key', accessKey);
    dialog.positionTarget = e.target;

    this.shadowRoot.querySelector('#app-dialog').show();
  }

  _hideAppLauncher() {
    this.shadowRoot.querySelector('#app-dialog').hide();
  }

  async _open_wsproxy(kernelId, app = 'jupyter') {
    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      return false;
    }

    let param = {
      access_key: window.backendaiclient._config.accessKey,
      secret_key: window.backendaiclient._config.secretKey,
      endpoint: window.backendaiclient._config.endpoint
    };
    let rqst = {
      method: 'PUT',
      body: JSON.stringify(param),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      uri: this._getProxyURL() + 'conf'
    };
    try {
      let response = await this.sendRequest(rqst);
      let token = response.token;
      this.shadowRoot.querySelector('#indicator').set(50, 'Adding kernel to socket queue...');
      rqst = {
        method: 'GET',
        app: app,
        uri: this._getProxyURL() + 'proxy/' + token + "/" + kernelId + "/add?app=" + app
      };
      return await this.sendRequest(rqst);
    } catch (err) {
      throw err;
    }
  }

  _runApp(e) {
    const controller = e.target;
    let controls = controller.closest('#app-dialog');
    let kernelId = controls.getAttribute('kernel-id');
    let urlPostfix = controller['url-postfix'];
    let appName = controller['app-name'];
    if (appName === undefined || appName === null) {
      return;
    }
    if (urlPostfix === undefined || urlPostfix === null) {
      urlPostfix = '';
    }

    if (window.backendaiwsproxy == undefined || window.backendaiwsproxy == null) {
      this._hideAppLauncher();
      this.shadowRoot.querySelector('#indicator').start();
      this._open_wsproxy(kernelId, appName)
        .then((response) => {
          if (response.url) {
            this.shadowRoot.querySelector('#indicator').set(100, 'Prepared.');
            setTimeout(() => {
              window.open(response.url + urlPostfix, '_blank');
              this.shadowRoot.querySelector('#indicator').end();
              console.log(appName + " proxy loaded: ");
              console.log(kernelId);
            }, 1000);
          }
        });
    }
  }

  _runJupyterTerminal(e) {
    const controller = e.target;
    const controls = controller.closest('#controls');
    const kernelId = controls['kernel-id'];
    let accessKey = window.backendaiclient._config.accessKey;
    if (window.backendaiwsproxy == undefined || window.backendaiwsproxy == null) {
      this.shadowRoot.querySelector('#indicator').start();
      this._open_wsproxy(kernelId, 'jupyter')
        .then((response) => {
          if (response.url) {
            this.shadowRoot.querySelector('#indicator').set(100, 'Prepared.');
            setTimeout(() => {
              window.open(response.url + "&redirect=/terminals/1", '_blank');
              this.shadowRoot.querySelector('#indicator').end();
              console.log("Jupyter terminal proxy loaded: ");
              console.log(kernelId);
            }, 1000);
          }
        });
    }
  }

  _hideDialog(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-dialog');
    dialog.hide();
  }

  _updateFilterAccessKey(e) {
    this.filterAccessKey = e.target.value;
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this._refreshJobData();
    }
  }

  sessionIDRenderer(root, column, rowData) {
    render(
      html`
        <div class="layout vertical start">
            <div>${rowData.item.sess_id}</div>
              ${rowData.item.sessionTags.map(item => html`
${item.map(item => html`
            <lablup-shields app="${item.category === undefined ? '' : item.category}" color="${item.color}" description="${item.tag}"></lablup-shields>
            `)}
                `)}
        </div>`, root
    );
  }
  controlRenderer(root, column, rowData) {
    render(
      html`
        <div id="controls" class="layout horizontal flex center"
             .kernel-id="${rowData.item.sess_id}"
             .access-key="${rowData.item.access_key}"
             .kernel-image="${rowData.item.kernel_image}">
             ${this._isRunning ? html`
            <paper-icon-button class="fg blue controls-running" icon="assignment"
                               @click="${(e) => this._showLogs(e)}"
                               on-tap="_showLogs"></paper-icon-button>
             ` : html`
            <paper-icon-button disabled class="fg controls-running" icon="assignment"
            ></paper-icon-button>
             `}
             ${rowData.item.appSupport ? html`
            <paper-icon-button class="fg controls-running green"
                               @click="${(e) => this._showAppLauncher(e)}"
                               icon="vaadin:package"></paper-icon-button>
            <paper-icon-button class="fg controls-running"
                               @click="${(e) => this._runJupyterTerminal(e)}"
                               icon="vaadin:terminal"></paper-icon-button>
                               ` : html``}
             ${this.condition === 'running' ? html`
            <paper-icon-button class="fg red controls-running"
                               @click="${(e) => this._terminateKernel(e)}"
                               icon="delete"></paper-icon-button>
                               ` : html``}
        </div>`, root
    );
  }

  render() {
    // language=HTML
    return html`
      <lablup-notification id="notification"></lablup-notification>
      <lablup-loading-indicator id="loading-indicator"></lablup-loading-indicator>
      <div class="layout horizontal center filters">
        <span class="flex"></span>
        <paper-input id="access-key-filter" type="search" size=30
                     label="access key" no-label-float .value="${this.filterAccessKey}"
                     on-change="_updateFilterAccessKey">
        </paper-input>
      </div>
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Session list" 
         .items="${this.compute_sessions}">
        <vaadin-grid-column width="40px" flex-grow="0" header="#" .renderer="${this._indexRenderer}"></vaadin-grid-column>
        ${this.is_admin ? html`
          <vaadin-grid-sort-column resizable width="100px" header="API Key" flex-grow="0" path="access_key">
            <template>
              <div class="layout vertical">
                <span class="indicator">{{item.access_key}}</span>
              </div>
            </template>
          </vaadin-grid-sort-column>
        ` : html``}
        <vaadin-grid-column resizable header="Session Info" .renderer="${this._boundSessionInfoRenderer}">
        </vaadin-grid-column>
        <vaadin-grid-column width="190px" header="Control" .renderer="${this._boundControlRenderer}"></vaadin-grid-column>
        <vaadin-grid-column width="160px" flex-grow="0" header="Configuration" resizable>
          <template>
            <div class="layout horizontal center flex">
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="hardware:developer-board"></iron-icon>
                <span>[[item.cpu_slot]]</span>
                <span class="indicator">core</span>
              </div>
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="hardware:memory"></iron-icon>
                <span>[[item.mem_slot]]</span>
                <span class="indicator">GB</span>
              </div>
            </div>
            <div class="layout horizontal center flex">
              <div class="layout horizontal configuration">
                <template is="dom-if" if="[[item.gpu_slot]]">
                  <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                  <span>[[item.gpu_slot]]</span>
                  <span class="indicator">GPU</span>
                </template>
                <template is="dom-if" if="[[!item.gpu_slot]]">
                  <template is="dom-if" if="[[item.fgpu_slot]]">
                    <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                    <span>[[item.fgpu_slot]]</span>
                    <span class="indicator">GPU</span>
                  </template>
                </template>
                <template is="dom-if" if="[[!item.gpu_slot]]">
                  <template is="dom-if" if="[[!item.fgpu_slot]]">
                    <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                    <span>-</span>
                    <span class="indicator">GPU</span>
                  </template>
                </template>
              </div>
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="icons:cloud-queue"></iron-icon>
                <!-- <iron-icon class="fg yellow" icon="device:storage"></iron-icon> -->
                <!-- <span>[[item.storage_capacity]]</span> -->
                <!-- <span class="indicator">[[item.storage_unit]]</span> -->
              </div>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column width="100px" flex-grow="0" resizable header="Usage">
          <template>
            <div class="layout horizontal center flex">
              <iron-icon class="fg blue" icon="hardware:developer-board"></iron-icon>
              <div class="vertical start layout">
                <span>[[item.cpu_used_sec]]</span>
                <span class="indicator">sec.</span>
              </div>
              <iron-icon class="fg blue" icon="hardware:device-hub"></iron-icon>
              <div class="vertical start layout">
                <span style="font-size:8px">[[item.io_read_bytes_mb]]<span class="indicator">MB</span></span>
                <span style="font-size:8px">[[item.io_write_bytes_mb]]<span class="indicator">MB</span></span>
              </div>
            </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-sort-column resizable header="Starts" path="created_at">
          <template>
            <div class="layout vertical">
              <span>[[item.created_at_hr]]</span>
            </div>
          </template>
        </vaadin-grid-sort-column>
        <vaadin-grid-column width="100px" flex-grow="0" resizable header="Reservation">
          <template>
            <div class="layout vertical">
              <span>[[item.elapsed]]</span>
            </div>
          </template>
        </vaadin-grid-column>
      </vaadin-grid>
      <backend-ai-indicator id="indicator"></backend-ai-indicator>
      <wl-dialog id="work-dialog" fixed blockscrolling scrollable
                    style="padding:0;">
        <wl-card elevation="1" class="intro" style="margin: 0; box-shadow: none; height: 100%;">
          <h3 class="horizontal center layout" style="font-weight:bold">
            <span id="work-title"></span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <paper-dialog-scrollable id="work-area" style="overflow:scroll;"></paper-dialog-scrollable>
          <iframe id="work-page" frameborder="0" border="0" cellspacing="0"
                  style="border-style: none;width: 100%;"></iframe>

        </wl-card>
      </wl-dialog>
      <wl-dialog id="app-dialog" fixed backdrop blockscrolling
                    style="padding:0;">
        <wl-card elevation="1" class="intro" style="margin: 0; height: 100%;">
          <h4 class="horizontal center layout" style="font-weight:bold">
            <span>App</span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h4>
          <div style="padding:15px;" class="horizontal layout wrap center center-justified">
              ${this.appSupportList.map(item => html`
                <div class="vertical layout center center-justified app-icon">
                  <paper-icon-button class="fg apps green" .app="${item.name}" .app-name="${item.name}"
                                     .url-postfix="${item.redirect}"
                                     @click="${(e) => this._runApp(e)}"
                                     src="${item.src}"></paper-icon-button>
                  <span class="label">${item.title}</span>
                </div>
                `)}
            </div>
          </wl-card>
        </wl-dialog>
`;
  }
}

customElements.define(BackendAiSessionList.is, BackendAiSessionList);
