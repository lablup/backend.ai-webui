/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

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
import {BackendAiStyles} from './backend-ai-general-styles';
import {IronFlex, IronFlexAlignment, IronPositioning} from '../plastics/layout/iron-flex-layout-classes';
import {default as PainKiller} from './backend-ai-painkiller';

/**
 `<backend-ai-import-view>` is a import feature of backend.ai web UI.

 Example:
 <backend-ai-import-view active></backend-ai-import-view>

 @group Lablup Elements
 @element backend-ai-import-view
 */

@customElement('backend-ai-import-view')
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

  static get styles(): CSSResultGroup | undefined {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronPositioning,
      // language=CSS
      css`
        div.description {
          font-size: 14px;
          color: var(--general-sidebar-color);
        }

        #session-launcher {
          --component-width: 235px;
        }

        mwc-textfield, mwc-textarea {
          --mdc-theme-primary: var(--general-textfield-selected-color);
          width: 100%;
          margin: 10px auto;
        }

        mwc-textfield#notebook-url,
        mwc-textfield#github-repo-url {
          width: 75%;
        }

        mwc-button {
          background-image: none;
          --mdc-theme-primary: #38bd73 !important;
        }

        @media screen and (max-width: 1015px) {
          mwc-textfield#notebook-url,
          mwc-textfield#github-repo-url {
            width: 85%;
            margin: 10px 0px;
          }
          mwc-button {
            width: 36px;
          }
          mwc-button > span {
            display: none;
          }
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
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
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
    queryString = queryString.substring(queryString.indexOf('?') + 1);
    this.queryString = queryString;
    this.importMessage = this.queryString;
    this.environment = this.guessEnvironment(this.queryString);
    if (queryString !== '') {
      let downloadURL = 'https://raw.githubusercontent.com/' + this.queryString;
      downloadURL = downloadURL.replace('/blob/', '/');
      this.fetchNotebookURLResource(downloadURL);
    }
  }

  getNotebookFromURL() {
    const url = this.shadowRoot.querySelector('#notebook-url').value;
    if (url !== '') {
      this.queryString = this.regularizeGithubURL(url);
      this.fetchNotebookURLResource(this.queryString);
    }
  }

  regularizeGithubURL(url) {
    url = url.replace('/blob/', '/');
    url = url.replace('github.com', 'raw.githubusercontent.com');
    return url;
  }

  fetchNotebookURLResource(downloadURL): void {
    this.shadowRoot.querySelector('#notebook-url').value = downloadURL;
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._fetchNotebookURLResource(downloadURL);
      }, true);
    } else { // already connected
      this._fetchNotebookURLResource(downloadURL);
    }
  }

  _fetchNotebookURLResource(downloadURL) {
    fetch(downloadURL).then((res) => {
      this.notification.text = _text('import.ReadyToImport');
      this.importMessage = this.notification.text;
      this.notification.show();
      this.sessionLauncher.selectDefaultLanguage(true, this.environment);
      this.sessionLauncher.importScript = '#!/bin/sh\ncurl -O ' + downloadURL;
      this.sessionLauncher.importFilename = downloadURL.split('/').pop();
      this.sessionLauncher._launchSessionDialog();
    }).catch((err) => {
      this.notification.text = _text('import.NoSuitableResourceFoundOnGivenURL');
      this.importMessage = this.notification.text;
      this.notification.show();
    });
  }

  getGitHubRepoFromURL() {
    let url = this.shadowRoot.querySelector('#github-repo-url').value;
    let tree = 'master';
    let name = '';
    // if contains .git extension, then remove it.
    if (url.substring(url.length - 4, url.length) === '.git') {
      url = url.split('.git')[0];
    }

    if (url.includes('/tree')) { // Branch.
      const version = (/\/tree\/[.a-zA-Z.0-9_-]+/.exec(url) || [''])[0];
      const nameWithVersion = (/\/[.a-zA-Z0-9_-]+\/tree\//.exec(url) || [''])[0];
      url = url.replace(version, '');
      tree = version.replace('/tree/', '');
      name = nameWithVersion.replace('/tree/', '').substring(1);
      url = url.replace('https://github.com', 'https://codeload.github.com');
      url = url + '/zip/' + tree;
      const protocol = (/^https?(?=:\/\/)/.exec(url) || [''])[0];
      if (['http', 'https'].includes(protocol)) {
        return this.importRepoFromURL(url, name);
      } else {
        this.notification.text = _text('import.WrongURLType');
        this.importMessage = this.notification.text;
        this.notification.show();
        return false;
      }
    } else {
      name = url.split('/').slice(-1)[0]; // TODO: can be undefined.
      var repoUrl = `https://api.github.com/repos` + new URL(url).pathname;
      const getRepoUrl = async() => {
        try {
          const response = await fetch(repoUrl);
          if (response.status === 200) {
            const responseJson = await response.json();
            return responseJson.default_branch;
          } else if (response.status === 404) {
            throw 'WrongURLType';
          } else if (response.status === 403 || response.status === 429) { //forbidden & Too Many Requests
            const limitCnt = response.headers.get('x-ratelimit-limit');
            const limitUsedCnt = response.headers.get('x-ratelimit-used')
            const limitRemainingCnt = response.headers.get('x-ratelimit-remaining')
            console.log(`used count: ${limitUsedCnt}, remaining count: ${limitRemainingCnt}/total count: ${limitCnt}\nerror body: ${response.text}`);
            if (limitRemainingCnt === '0') {
              throw 'GithubAPILimitError|' + limitUsedCnt + '|' + limitRemainingCnt;
            } else {
              throw 'GithubAPIEtcError';
            }
          } else if (response.status === 500) {
            throw 'GithubInternalError';
          } else {
            console.log(`error statusCode: ${response.status}, body: ${response.text}`);
            throw 'GithubAPIEtcError';
          }
        } catch (error) {
          throw error;
        }
      }
      return getRepoUrl().then((result) => {
        tree = result;
        url = url.replace('https://github.com', 'https://codeload.github.com');
        url = url + '/zip/' + tree;
        const protocol = (/^https?(?=:\/\/)/.exec(url) || [''])[0];
        if (['http', 'https'].includes(protocol)) {
          return this.importRepoFromURL(url, name);
        } else {
          this.notification.text = _text('import.WrongURLType');
          this.importMessage = this.notification.text;
          this.notification.show();
          return false;
        }
      }).catch((e) => { // check exception
        switch (e) {
          case 'WrongURLType':
            this.notification.text = _text('import.WrongURLType');
            break;
          case 'GithubInternalError':
            this.notification.text = _text('import.GithubInternalError');
            break;
          default:
            if (e.indexOf('|') !== -1) {
              this.notification.text = _text('import.GithubAPILimitError');
            } else {
              this.notification.text = _text('import.GithubAPIEtcError');
            }
            break;
        }
        this.importMessage = this.notification.text;
        this.notification.show();
        return false;
      });
    }
  }

  async importRepoFromURL(url, folderName) {
    // Create folder to
    const imageResource: Record<string, unknown> = {};
    imageResource['cpu'] = 1;
    imageResource['mem'] = '0.5g';
    imageResource['domain'] = globalThis.backendaiclient._config.domainName;
    imageResource['group_name'] = globalThis.backendaiclient.current_group;
    const indicator = await this.indicator.start('indeterminate');
    indicator.set(10, _text('import.Preparing'));
    folderName = await this._checkFolderNameAlreadyExists(folderName);
    await this._addFolderWithName(folderName);
    indicator.set(20, _text('import.FolderCreated'));
    imageResource['mounts'] = [folderName];
    imageResource['bootstrap_script'] = '#!/bin/sh\ncurl -o repo.zip ' + url + '\ncd /home/work/' + folderName + '\nunzip -u /home/work/repo.zip';
    return globalThis.backendaiclient.get_resource_slots().then((response) => {
      // let results = response;
      indicator.set(50, _text('import.Downloading'));
      return globalThis.backendaiclient.createIfNotExists(globalThis.backendaiclient._config.default_import_environment, null, undefined, imageResource, 60000);
    }).then(async (response) => {
      indicator.set(80, _text('import.CleanUpImportTask'));
      await globalThis.backendaiclient.destroy(response.sessionId);
      indicator.set(100, _text('import.ImportFinished'));
      indicator.end(1000);
    }).catch((err) => {
      this.notification.text = PainKiller.relieve(err.title);
      this.notification.detail = err.message;
      this.notification.show(true, err);
      indicator.end(1000);
    });
  }

  async _addFolderWithName(name) {
    const permission = 'rw';
    const usageMode = 'general';
    const group = ''; // user ownership
    const vhost_info = await globalThis.backendaiclient.vfolder.list_hosts();
    const host = vhost_info.default;
    name = await this._checkFolderNameAlreadyExists(name);
    return globalThis.backendaiclient.vfolder.create(name, host, group, usageMode, permission).then((value) => {
      this.importMessage = _text('import.FolderName') + name;
    }).catch((err) => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  async _checkFolderNameAlreadyExists(name) {
    const vfolderObj = await globalThis.backendaiclient.vfolder.list();
    const vfolders = vfolderObj.map(function(value) {
      return value.name;
    });
    if (vfolders.includes(name)) {
      this.notification.text = _text('import.FolderAlreadyExists');
      this.importMessage = this.notification.text;
      this.notification.show();
      let i = 1;
      let newName: string = name;
      while (vfolders.includes(newName)) {
        newName = name + '_' + i;
        i++;
      }
      name = newName;
    }
    return name;
  }

  guessEnvironment(url) {
    if (url.includes('tensorflow') || url.includes('keras') || url.includes('Keras')) {
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
    const url = this.shadowRoot.querySelector('#notebook-badge-url').value;
    const rawURL = this.regularizeGithubURL(url);
    const badgeURL = rawURL.replace('https://raw.githubusercontent.com/', '');
    let baseURL = '';

    if (url === '') {
      this.notification.text = _text('import.NoNotebookCode');
      this.notification.show();
      this.shadowRoot.querySelector('#notebook-badge-code').value = '';
      this.shadowRoot.querySelector('#notebook-badge-code-markdown').value = '';
    } else {
      if (globalThis.isElectron) {
        baseURL = 'https://cloud.backend.ai/github?';
      } else {
        baseURL = window.location.protocol + '//' + window.location.hostname;
        if (window.location.port) {
          baseURL = baseURL + ':' + window.location.port;
        }
        baseURL = baseURL + '/github?';
      }
      const fullText = `<a href="${baseURL + badgeURL}"><img src="https://www.backend.ai/assets/badge.svg" /></a>`;
      const fullTextMarkdown = `[![Run on Backend.AI](https://www.backend.ai/assets/badge.svg)](${baseURL + badgeURL})`;
      this.shadowRoot.querySelector('#notebook-badge-code').value = fullText;
      this.shadowRoot.querySelector('#notebook-badge-code-markdown').value = fullTextMarkdown;
    }
  }

  /**
   * Copy textarea when user clicks the element.
   *
   * @param {Event} e - Click event. e.target points text-area htmlElement for copying
   */
  _copyTextArea(e) {
    let copyText = '';
    if ('value' in e.target) {
      copyText = e.target.value;
    }
    if (copyText !== '') {
      // let copyText: string = this.shadowRoot.querySelector(id).value;
      if (copyText.length === 0) {
        this.notification.text = _text('import.NoNotebookCode');
        this.notification.show();
      } else {
        if (navigator.clipboard !== undefined) { // for Chrome, Safari
          navigator.clipboard.writeText(copyText).then( () => {
            this.notification.text = _text('import.NotebookBadgeCodeCopied');
            this.notification.show();
          }, (err) => {
            console.error(_text('import.CouldNotCopyText'), err);
          });
        } else { // other browsers
          const tmpInputElement = document.createElement('input');
          tmpInputElement.type = 'text';
          tmpInputElement.value = copyText;

          document.body.appendChild(tmpInputElement);
          tmpInputElement.select();
          document.execCommand('copy'); // copy operation
          document.body.removeChild(tmpInputElement);
          this.notification.text = _text('import.NotebookBadgeCodeCopied');
          this.notification.show();
        }
      }
    }
  }

  render() {
    // language=HTML
    return html`
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <lablup-activity-panel title="${_t('import.ImportNotebook')}" elevation="1" horizontalsize="2x">
        <div slot="message">
          <div class="horizontal wrap layout center">
            <mwc-textfield id="notebook-url" label="${_t('import.NotebookURL')}"
                           maxLength="2048" placeholder="${_t('maxLength.2048chars')}"></mwc-textfield>
            <mwc-button icon="cloud_download" @click="${() => this.getNotebookFromURL()}">
              <span>${_t('import.GetAndRunNotebook')}</span>
            </mwc-button>
          </div>
          ${this.importMessage}
        </div>
      </lablup-activity-panel>
      <backend-ai-session-launcher mode="import" location="import" hideLaunchButton
      id="session-launcher" ?active="${this.active === true}"
      .newSessionDialogTitle="${_t('session.launcher.StartImportedNotebook')}"></backend-ai-session-launcher>
      <div class="horizontal wrap layout">
        <lablup-activity-panel title="${_t('summary.ResourceStatistics')}" elevation="1" width="350" height="490" narrow>
          <div slot="message">
              <backend-ai-resource-monitor location="summary" id="resource-monitor" ?active="${this.active === true}" direction="vertical"></backend-ai-resource-monitor>
          </div>
        </lablup-activity-panel>
        <lablup-activity-panel title="${_t('import.CreateNotebookButton')}" elevation="1" height="490">
          <div slot="message">
            <div class="vertical wrap layout center description">
              ${_t('import.YouCanCreateNotebookCode')}
              <img src="/resources/badge.svg" style="margin-top:5px;margin-bottom:5px;"/>
              <mwc-textfield id="notebook-badge-url" label="${_t('import.NotebookBadgeURL')}"
                             maxLength="2048" placeholder="${_t('maxLength.2048chars')}"></mwc-textfield>
              <mwc-button fullwidth @click="${() => this.createNotebookBadge()}" icon="code">${_t('import.CreateButtonCode')}</mwc-button>
              <mwc-textarea id="notebook-badge-code" label="${_t('import.NotebookBadgeCodeHTML')}" @click="${(e) => this._copyTextArea(e)}"></mwc-textarea>
              <mwc-textarea id="notebook-badge-code-markdown" label="${_t('import.NotebookBadgeCodeMarkdown')}" @click="${(e) => this._copyTextArea(e)}"></mwc-textarea>
            </div>
          </div>
        </lablup-activity-panel>
      </div>
      <div class="horizontal wrap layout">
        <lablup-activity-panel title="${_t('import.ImportGithubRepo')}" elevation="1" horizontalsize="2x">
          <div slot="message">
            <div class="description">
              <p>${_t('import.RepoWillBeFolder')}</p>
            </div>
            <div class="horizontal wrap layout center">
              <mwc-textfield id="github-repo-url" label="${_t('import.GitHubURL')}"
                             maxLength="2048" placeholder="${_t('maxLength.2048chars')}"></mwc-textfield>
              <mwc-button icon="cloud_download" @click="${() => this.getGitHubRepoFromURL()}">
                <span>${_t('import.GetToFolder')}</span>
              </mwc-button>
            </div>
            ${this.importMessage}
          </div>
        </lablup-activity-panel>
      </div>
`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-import-view': BackendAIImport;
  }
}
