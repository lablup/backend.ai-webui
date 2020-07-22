/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import './lablup-loading-spinner';

import 'weightless/card';

import '@material/mwc-icon';
import '@material/mwc-icon-button';
import '@material/mwc-textfield';
import '@material/mwc-textarea';
import '@material/mwc-button';

import './lablup-activity-panel';
import './backend-ai-chart';
import './backend-ai-resource-monitor';
import './backend-ai-session-launcher';
import '../plastics/lablup-shields/lablup-shields';
import {BackendAiStyles} from "./backend-ai-general-styles";
import {IronFlex, IronFlexAlignment, IronPositioning} from "../plastics/layout/iron-flex-layout-classes";
import {default as PainKiller} from "./backend-ai-painkiller";

/**
 `<backend-ai-import-view>` is a import feature of backend.ai console.

 Example:
 <backend-ai-import-view active></backend-ai-import-view>

 @group Lablup Elements
 @element backend-ai-import-view
 */

@customElement("backend-ai-import-view")
export default class BackendAIImport extends BackendAIPage {
  @property({type: String}) condition = 'running';
  @property({type: Boolean}) authenticated = false;
  @property({type: Object}) spinner = Object();
  @property({type: Object}) indicator = Object();
  @property({type: Object}) notification = Object();
  @property({type: Object}) sessionLauncher = Object();
  @property({type: Object}) resourcePolicy;
  @property({type: String}) requestURL = '';
  @property({type: String}) queryString = '';
  @property({type: String}) environment = 'python';
  @property({type: String}) importMessage = '';

  constructor() {
    super();
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronPositioning,
      // language=CSS
      css`
        #session-launcher {
          --component-width: 235px;
        }

        mwc-button {
          --mdc-theme-primary: var(--paper-blue-600);
        }
      `
    ];
  }

  firstUpdated() {
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this.sessionLauncher = this.shadowRoot.querySelector('#session-launcher');
    this.indicator = globalThis.lablupIndicator;
    this.notification = globalThis.lablupNotification;
  }

  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (active === false) {
      this.shadowRoot.querySelector('#resource-monitor').removeAttribute('active');
      return;
    }
    this.shadowRoot.querySelector('#resource-monitor').setAttribute('active', 'true');
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.authenticated = true;
        if (this.activeConnected) {
          this.requestUpdate();
        }
      }, true);
    } else {
      this.authenticated = true;
      this.requestUpdate();
    }
    // Given URL via URL path parameter.
    this.requestURL = globalThis.currentPageParams.requestURL;
    let queryString = globalThis.currentPageParams.queryString;
    queryString = queryString.substring(queryString.indexOf("?") + 1);
    this.queryString = queryString;
    this.importMessage = this.queryString;
    this.environment = this.guessEnvironment(this.queryString);
    if (queryString !== "") {
      let downloadURL = 'https://raw.githubusercontent.com' + this.queryString;
      this.fetchNotebookURLResource(downloadURL);
    }
  }

  getNotebookFromURL() {
    let url = this.shadowRoot.querySelector("#notebook-url").value;
    if (url !== "") {
      this.queryString = this.regularizeGithubURL(url);
      this.fetchNotebookURLResource(this.queryString);
    }
  }

  regularizeGithubURL(url) {
    url = url.replace('/blob/', '/');
    url = url.replace('github.com', 'raw.githubusercontent.com');
    return url;
  }

  getGitHubRepoFromURL() {
    let url = this.shadowRoot.querySelector("#github-repo-url").value;
    let tree = 'master';
    let name = '';
    if (url.includes('/tree')) { // Branch.
      let version = (/\/tree\/[.a-zA-Z.0-9_-]+/.exec(url) || [''])[0];
      let nameWithVersion = (/\/[.a-zA-Z0-9_-]+\/tree\//.exec(url) || [''])[0];
      url = url.replace(version, '');
      tree = version.replace('/tree/', '');
      name = nameWithVersion.replace('/tree/', '').substring(1);
    } else {
      name = url.split('/').slice(-1)[0]; // TODO: can be undefined.
    }
    url = url.replace('https://github.com', 'https://codeload.github.com');
    url = url + '/zip/' + tree;
    return this.importRepoFromURL(url, name);
    //console.log(url);
  }

  async importRepoFromURL(url, folderName) {
    // Create folder to
    let imageResource: Object = {};
    imageResource['cpu'] = 1;
    imageResource['mem'] = '0.5g';
    imageResource['domain'] = globalThis.backendaiclient._config.domainName;
    imageResource['group_name'] = globalThis.backendaiclient.current_group;
    this.notification.text = "Downloading repository. It takes time so have a cup of coffee!";
    this.notification.show();
    let indicator = await this.indicator.start('indeterminate');
    indicator.set(10, 'Preparing...');
    await this._addFolderWithName(folderName);
    indicator.set(20, 'Folder created');
    imageResource['mounts'] = [folderName];
    imageResource['bootstrap_script'] = "#!/bin/sh\ncurl -o repo.zip " + url + "\ncd /home/work/" + folderName + "\nunzip /home/work/repo.zip";
    globalThis.backendaiclient.getResourceSlots().then((response) => {
      //let results = response;
      indicator.set(50, 'Downloading...');
      return globalThis.backendaiclient.createIfNotExists('index.docker.io/lablup/python:3.8-ubuntu18.04', null, imageResource, 60000);
    }).then((response) => {
      indicator.set(100, 'Download finished.');
      indicator.end(1000);
    }).catch(err => {
      this.notification.text = PainKiller.relieve(err.title);
      this.notification.detail = err.message;
      this.notification.show(true, err);
      indicator.end(1000);
    });
  }

  async _addFolderWithName(name) {
    let permission = 'rw';
    let usageMode = 'general';
    let group = ''; // user ownership
    let vhost_info = await globalThis.backendaiclient.vfolder.list_hosts();
    let host = vhost_info.default;

    let job = globalThis.backendaiclient.vfolder.create(name, host, group, usageMode, permission);
    job.then((value) => {
      this.notification.text = _text('data.folders.FolderCreated');
      this.notification.show();
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  guessEnvironment(url) {
    if (url.includes('tensorflow')) {
      return 'index.docker.io/lablup/python-tensorflow';
    } else if (url.includes('pytorch')) {
      return 'index.docker.io/lablup/python-pytorch';
    } else if (url.includes('mxnet')) {
      return 'index.docker.io/lablup/python-mxnet';
    } else {
      return 'index.docker.io/lablup/python-ff';
    }
  }

  createNotebookBadge() {
    let url = this.shadowRoot.querySelector('#notebook-badge-url').value;
    let rawURL = this.regularizeGithubURL(url);
    let badgeURL = rawURL.replace('https://raw.githubusercontent.com', '');
    let baseURL: string = '';
    if (globalThis.isElectron) {
      baseURL = "https://cloud.backend.ai/github?";
    } else {
      baseURL = window.location.protocol + '//' + window.location.hostname;
      if (window.location.port) {
        baseURL = baseURL + ':' + window.location.port;
      }
      baseURL = baseURL + '/github?';
    }
    let fullText = `<a href="${baseURL + badgeURL}"><img src="https://www.backend.ai/assets/badge.svg" /></a>`;
    this.shadowRoot.querySelector('#notebook-badge-code').value = fullText;
  }

  fetchNotebookURLResource(downloadURL): void {
    this.shadowRoot.querySelector("#notebook-url").value = downloadURL;
    fetch(downloadURL).then((res) => {
      this.notification.text = _text('import.ReadyToImport');
      this.importMessage = this.notification.text;
      this.notification.show();
      this.sessionLauncher.selectDefaultLanguage(true, this.environment);
      this.sessionLauncher.importScript = "#!/bin/sh\ncurl -O " + downloadURL;
      this.sessionLauncher.importFilename = downloadURL.split('/').pop();
      this.sessionLauncher._launchSessionDialog();
    }).catch((err) => {
      this.notification.text = _text('import.NoSuitableResourceFoundOnGivenURL');
      this.importMessage = this.notification.text;
      this.notification.show();
    });
  }

  render() {
    // language=HTML
    return html`
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <wl-card class="item" elevation="1" style="padding-bottom:20px;">
        <h3 class="plastic-material-title">${_t('import.ImportNotebook')}</h3>
        <lablup-activity-panel title="${_t('import.ImportNotebook')}" elevation="1" horizontalsize="2x" headerColor="#3164BA">
          <div slot="message">
            <div class="horizontal wrap layout center">
              <mwc-textfield style="width:75%;" id="notebook-url" label="${_t('import.NotebookURL')}"></mwc-textfield>
              <mwc-button icon="cloud_download" @click="${() => this.getNotebookFromURL()}">${_t('import.GetAndRunNotebook')}</mwc-button>
            </div>
            ${this.importMessage}
          </div>
        </lablup-activity-panel>
        <backend-ai-session-launcher mode="import" location="import" hideLaunchButton
        id="session-launcher" ?active="${this.active === true}"
        .newSessionDialogTitle="${_t('session.launcher.StartImportedNotebook')}"></backend-ai-session-launcher>

        <div class="horizontal wrap layout">
          <lablup-activity-panel title="${_t('summary.ResourceStatistics')}" elevation="1" headerColor="#3164BA">
            <div slot="message">
              <div class="horizontal justified layout wrap">
                <backend-ai-resource-monitor location="summary" id="resource-monitor" ?active="${this.active === true}" direction="vertical"></backend-ai-resource-monitor>
              </div>
            </div>
          </lablup-activity-panel>
          <lablup-activity-panel title="${_t('import.CreateNotebookButton')}" elevation="1" headerColor="#3164BA">
            <div slot="message">
              <div class="vertical wrap layout center" style="font-size:14px;">
                ${_t('import.YouCanCreateNotebookCode')}
                <img src="/resources/badge.svg" style="margin-top:5px;margin-bottom:5px;"/>
                <mwc-textfield style="width:100%;" id="notebook-badge-url" label="${_t('import.NotebookBadgeURL')}"></mwc-textfield>
                <mwc-button style="width:100%;" @click="${() => this.createNotebookBadge()}" icon="code">${_t('import.CreateButtonCode')}</mwc-button>
                <mwc-textarea style="width:100%;" id="notebook-badge-code" label="${_t('import.NotebookBadgeCode')}">></mwc-textarea>
              </div>
            </div>
          </lablup-activity-panel>

        </div>
        <h3 class="plastic-material-title">${_t('import.ImportToStorage')}</h3>
        <div class="horizontal wrap layout">
          <lablup-activity-panel title="${_t('import.ImportGithubRepo')}" elevation="1" horizontalsize="2x" headerColor="#3164BA">
            <div slot="message">
              <div style="font-size:14px;">${_t('import.RepoWillBeFolder')}</div>
              <div class="horizontal wrap layout center">
                <mwc-textfield style="width:75%;" id="github-repo-url" label="${_t('import.GitHubURL')}"></mwc-textfield>
                <mwc-button icon="cloud_download" @click="${() => this.getGitHubRepoFromURL()}">${_t('import.GetToFolder')}</mwc-button>
              </div>
              ${this.importMessage}
            </div>
          </lablup-activity-panel>
        </div>
      </wl-card>
`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-import-view": BackendAIImport;
  }
}
