/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import '../plastics/lablup-shields/lablup-shields';
import {
  IronFlex,
  IronFlexAlignment,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import { default as PainKiller } from './backend-ai-painkiller';
import BackendAiResourceMonitor from './backend-ai-resource-monitor';
import './backend-ai-resource-monitor';
import BackendAiSessionLauncher from './backend-ai-session-launcher';
import './backend-ai-session-launcher';
import './lablup-activity-panel';
import LablupLoadingSpinner from './lablup-loading-spinner';

/**
 * FIXME: Repeated import statement(s) is/are needed
 *        when using custom elements and type casting of the component at other components
 */
import '@material/mwc-icon-button';
import '@material/mwc-select';
import { Select } from '@material/mwc-select';
import '@material/mwc-textarea';
import { TextArea } from '@material/mwc-textarea';
import '@material/mwc-textfield';
import { TextField } from '@material/mwc-textfield';
import { css, CSSResultGroup, html } from 'lit';
import { get as _text, translate as _t } from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
// type LablupLoadingSpinner = HTMLElementTagNameMap['lablup-loading-spinner'];
// type BackendAIResourceMonitor = HTMLElementTagNameMap['backend-ai-resource-monitor'];
// type BackendAISessionLauncher = HTMLElementTagNameMap['backend-ai-session-launcher'];

/**
 `<backend-ai-import-view>` is a import feature of backend.ai web UI.

 Example:
 <backend-ai-import-view active></backend-ai-import-view>

 @group Lablup Elements
 @element backend-ai-import-view
 */

@customElement('backend-ai-import-view')
export default class BackendAIImport extends BackendAIPage {
  @property({ type: String }) condition = 'running';
  @property({ type: Boolean }) authenticated = false;
  @property({ type: Object }) indicator = Object();
  @property({ type: Object }) notification = Object();
  @property({ type: String }) requestURL = '';
  @property({ type: String }) queryString = '';
  @property({ type: String }) environment = 'python';
  @property({ type: String }) importNotebookMessage = '';
  @property({ type: String }) importGithubMessage = '';
  @property({ type: String }) importGitlabMessage = '';
  @property({ type: Array }) allowedGroups = [];
  @property({ type: Array }) allowed_folder_type = [];
  @property({ type: String }) vhost = '';
  @property({ type: Array }) vhosts = [];
  @property({ type: Object }) storageInfo = Object();
  @property({ type: String }) _helpDescription = '';
  @property({ type: String }) _helpDescriptionTitle = '';
  @property({ type: String }) _helpDescriptionIcon = '';
  @property({ type: String }) sessionLauncherType = 'neo';
  @query('#loading-spinner') spinner!: LablupLoadingSpinner;
  @query('#resource-monitor') resourceMonitor!: BackendAiResourceMonitor;
  @query('#session-launcher') sessionLauncher!: BackendAiSessionLauncher;
  @query('#notebook-url') notebookUrlInput!: TextField;
  @query('#notebook-badge-code') notebookBadgeCodeInput!: TextArea;
  @query('#notebook-badge-code-markdown')
  notebookBadgeCodeMarkdownInput!: TextArea;

  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronPositioning,
      // language=CSS
      css`
        div.description {
          font-size: 14px;
          color: var(--token-colorTextSecondary, --general-sidebar-color);
        }

        #session-launcher {
          --component-width: 235px;
        }

        mwc-textfield,
        mwc-textarea {
          width: 100%;
          margin: 5px auto;
        }

        mwc-textfield#notebook-url {
          width: 75%;
        }
        mwc-textfield.repo-url {
          width: 100%;
        }
        mwc-textfield#gitlab-default-branch-name {
          margin: inherit;
          width: 30%;
          margin-bottom: 10px;
        }

        mwc-button {
          background-image: none;
          --mdc-theme-primary: #38bd73 !important;
        }

        mwc-button.left-align {
          margin-left: auto;
        }

        mwc-select {
          margin: auto;
          width: 35%;
          margin-bottom: 10px;
        }
        mwc-select.github-select {
          margin: inherit;
          width: 440px;
          margin-bottom: 10px;
        }

        @media screen and (max-width: 1015px) {
          mwc-textfield#notebook-url {
            width: 85%;
            margin: 10px 0px;
          }
          mwc-textfield.repo-url {
            width: 85%;
            margin: 10px 0px;
          }
          mwc-textfield#gitlab-default-branch-name {
            width: 25%;
            margin: inherit;
          }
          mwc-button {
            width: 36px;
          }
          mwc-button > span {
            display: none;
          }
        }
      `,
    ];
  }

  firstUpdated() {
    this.indicator = globalThis.lablupIndicator;
    this.notification = globalThis.lablupNotification;
  }

  async _initStorageInfo() {
    this.allowed_folder_type =
      await globalThis.backendaiclient.vfolder.list_allowed_types();
    await this._getFolderList();
    await fetch('resources/storage_metadata.json')
      .then((response) => response.json())
      .then((json) => {
        const storageInfo = Object();
        for (const key in json.storageInfo) {
          if ({}.hasOwnProperty.call(json.storageInfo, key)) {
            storageInfo[key] = {};
            if ('name' in json.storageInfo[key]) {
              storageInfo[key].name = json.storageInfo[key].name;
            }
            if ('description' in json.storageInfo[key]) {
              storageInfo[key].description = json.storageInfo[key].description;
            } else {
              storageInfo[key].description = _text(
                'data.NoStorageDescriptionFound',
              );
            }
            if ('icon' in json.storageInfo[key]) {
              storageInfo[key].icon = json.storageInfo[key].icon;
            } else {
              storageInfo[key].icon = 'local.png';
            }
            if ('dialects' in json.storageInfo[key]) {
              json.storageInfo[key].dialects.forEach((item) => {
                storageInfo[item] = storageInfo[key];
              });
            }
          }
        }
        this.storageInfo = storageInfo;
      });
  }

  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (active === false) {
      this.resourceMonitor.removeAttribute('active');
      return;
    }
    this.resourceMonitor.setAttribute('active', 'true');
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          this._initStorageInfo();
          this.authenticated = true;
          if (this.activeConnected) {
            this.requestUpdate();
          }
        },
        true,
      );
    } else {
      this._initStorageInfo();
      this.authenticated = true;
      this.requestUpdate();
    }
    // Given URL via URL path parameter.
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    this.queryString = url.search;
    const queryString = this.queryString.substring(
      this.queryString.indexOf('?') + 1,
    );
    this.importNotebookMessage = this.queryString;
    this.environment = this.guessEnvironment(this.queryString);
    if (queryString !== '') {
      let downloadURL = 'https://raw.githubusercontent.com/' + this.queryString;
      downloadURL = downloadURL.replace('/blob/', '/');
      this.fetchNotebookURLResource(downloadURL);
    }
  }

  getNotebookFromURL() {
    const url = this.notebookUrlInput.value;
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
    this.notebookUrlInput.value = downloadURL;
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          this._fetchNotebookURLResource(downloadURL);
        },
        true,
      );
    } else {
      // already connected
      this._fetchNotebookURLResource(downloadURL);
    }
  }

  _fetchNotebookURLResource(downloadURL) {
    fetch(downloadURL)
      .then(() => {
        this.notification.text = _text('import.ReadyToImport');
        this.importNotebookMessage = this.notification.text;
        this.notification.show();
        this.sessionLauncher.selectDefaultLanguage(true, this.environment);
        this.sessionLauncher.importScript = '#!/bin/sh\ncurl -O ' + downloadURL;
        this.sessionLauncher.importFilename = downloadURL.split('/').pop();
        this.sessionLauncher._launchSessionDialog();
      })
      .catch(() => {
        this.notification.text = _text(
          'import.NoSuitableResourceFoundOnGivenURL',
        );
        this.importNotebookMessage = this.notification.text;
        this.notification.show();
      });
  }

  getGitHubRepoFromURL() {
    let url = (this.shadowRoot?.querySelector('#github-repo-url') as TextField)
      .value;
    let tree = 'master';
    let name = '';
    // if contains .git extension, then remove it.
    if (url.substring(url.length - 4, url.length) === '.git') {
      url = url.split('.git')[0];
    }

    if (url.includes('/tree')) {
      // Branch.
      const version = (/\/tree\/[.a-zA-Z.0-9_-]+/.exec(url) || [''])[0];
      const nameWithVersion = (/\/[.a-zA-Z0-9_-]+\/tree\//.exec(url) || [
        '',
      ])[0];
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
        this.importNotebookMessage = this.notification.text;
        this.notification.show();
        return false;
      }
    } else {
      name = url.split('/').slice(-1)[0]; // TODO: can be undefined.
      const repoUrl = `https://api.github.com/repos` + new URL(url).pathname;
      const getRepoUrl = async () => {
        // TODO need refactor
        try {
          const response = await fetch(repoUrl);
          if (response.status === 200) {
            const responseJson = await response.json();
            return responseJson.default_branch;
          } else if (response.status === 404) {
            throw 'WrongURLType';
          } else if (response.status === 403 || response.status === 429) {
            // forbidden & Too Many Requests
            const limitCnt = response.headers.get('x-ratelimit-limit');
            const limitUsedCnt = response.headers.get('x-ratelimit-used');
            const limitRemainingCnt = response.headers.get(
              'x-ratelimit-remaining',
            );
            console.log(
              `used count: ${limitUsedCnt}, remaining count: ${limitRemainingCnt}/total count: ${limitCnt}\nerror body: ${response.text}`,
            );
            if (limitRemainingCnt === '0') {
              throw (
                'GithubAPILimitError|' + limitUsedCnt + '|' + limitRemainingCnt
              );
            } else {
              throw 'GithubAPIEtcError';
            }
          } else if (response.status === 500) {
            throw 'GithubInternalError';
          } else {
            console.log(
              `error statusCode: ${response.status}, body: ${response.text}`,
            );
            throw 'GithubAPIEtcError';
          }
        } catch (error) {
          throw error;
        }
      };
      return getRepoUrl()
        .then((result) => {
          tree = result;
          url = url.replace(
            'https://github.com',
            'https://codeload.github.com',
          );
          url = url + '/zip/' + tree;
          const protocol = (/^https?(?=:\/\/)/.exec(url) || [''])[0];
          if (['http', 'https'].includes(protocol)) {
            return this.importRepoFromURL(url, name);
          } else {
            this.notification.text = _text('import.WrongURLType');
            this.importNotebookMessage = this.notification.text;
            this.notification.show();
            return false;
          }
        })
        .catch((e) => {
          // check exception
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
          this.importNotebookMessage = this.notification.text;
          this.notification.show();
          return false;
        });
    }
  }

  getGitlabRepoFromURL() {
    let url = (this.shadowRoot?.querySelector('#gitlab-repo-url') as TextField)
      .value;
    let tree = 'master';
    const getBranchName = (
      this.shadowRoot?.querySelector('#gitlab-default-branch-name') as TextField
    ).value;
    if (getBranchName.length > 0) {
      tree = getBranchName;
    }
    let name = '';
    // if contains .git extension, then remove it.
    if (url.substring(url.length - 4, url.length) === '.git') {
      url = url.split('.git')[0];
    }

    if (url.includes('/tree')) {
      // Branch.
      const pathname = new URL(url).pathname;
      const splitPaths = pathname.split('/');
      name = splitPaths[2];
      tree = splitPaths[splitPaths.length - 1];
      url = url.replace('/tree/', '/archive/');
      url += '/' + name + '-' + tree + '.zip';
      const protocol = (/^https?(?=:\/\/)/.exec(url) || [''])[0];
      if (['http', 'https'].includes(protocol)) {
        return this.importRepoFromURL(url, name);
      } else {
        this.notification.text = _text('import.WrongURLType');
        this.importNotebookMessage = this.notification.text;
        this.notification.show();
        return false;
      }
    } else {
      name = url.split('/').slice(-1)[0];
      url = url + '/-/archive/' + tree + '/' + name + '-' + tree + '.zip';
      const protocol = (/^https?(?=:\/\/)/.exec(url) || [''])[0];
      if (['http', 'https'].includes(protocol)) {
        return this.importRepoFromURL(url, name);
      } else {
        this.notification.text = _text('import.WrongURLType');
        this.importGitlabMessage = this.notification.text;
        this.notification.show();
        return false;
      }
    }
  }

  async importRepoFromURL(url, folderName) {
    const defaultImage =
      globalThis.backendaiclient._config.default_import_environment;
    const [kernelName, architecture] = defaultImage.split('@');
    // Create folder to
    const imageResource: Record<string, unknown> = {};
    imageResource['cpu'] = 1;
    imageResource['mem'] = '0.5g';
    imageResource['domain'] = globalThis.backendaiclient._config.domainName;
    imageResource['group_name'] = globalThis.backendaiclient.current_group;
    const indicator = await this.indicator.start('indeterminate');
    indicator.set(10, _text('import.Preparing'));
    folderName = await this._checkFolderNameAlreadyExists(folderName, url);
    await this._addFolderWithName(folderName, url);
    indicator.set(20, _text('import.FolderCreated'));
    imageResource['mounts'] = [folderName];
    imageResource['bootstrap_script'] =
      '#!/bin/sh\ncurl -o repo.zip ' +
      url +
      '\ncd /home/work/' +
      folderName +
      '\nunzip -u /home/work/repo.zip';
    return globalThis.backendaiclient
      .get_resource_slots()
      .then(() => {
        // let results = response;
        indicator.set(50, _text('import.Downloading'));
        return globalThis.backendaiclient.createIfNotExists(
          kernelName,
          null,
          imageResource,
          60000,
          architecture || 'x86_64',
        );
      })
      .then(async (response) => {
        indicator.set(80, _text('import.CleanUpImportTask'));
        await globalThis.backendaiclient.destroy(response.sessionId);
        indicator.set(100, _text('import.ImportFinished'));
        indicator.end(1000);
      })
      .catch((err) => {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
        indicator.end(1000);
      });
  }

  async _addFolderWithName(name, url) {
    const permission = 'rw';
    const usageMode = 'general';
    const group = ''; // user ownership
    const vhost_info = await globalThis.backendaiclient.vfolder.list_hosts();
    let host = vhost_info.default;
    if (new URL(url).host === 'github.com') {
      host = (
        this.shadowRoot?.querySelector('#github-add-folder-host') as Select
      ).value;
    } else {
      host = (
        this.shadowRoot?.querySelector('#gitlab-add-folder-host') as Select
      ).value;
    }
    name = await this._checkFolderNameAlreadyExists(name, url);
    return globalThis.backendaiclient.vfolder
      .create(name, host, group, usageMode, permission)
      .then((value) => {
        if (new URL(url).host === 'github.com') {
          this.importNotebookMessage = _text('import.FolderName') + name;
        } else {
          this.importGitlabMessage = _text('import.FolderName') + name;
        }
      })
      .catch((err) => {
        console.log(err);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      });
  }

  async _checkFolderNameAlreadyExists(name, url) {
    const vfolderObj = await globalThis.backendaiclient.vfolder.list();
    const vfolders = vfolderObj.map(function (value) {
      return value.name;
    });
    if (vfolders.includes(name)) {
      this.notification.text = _text('import.FolderAlreadyExists');
      if (new URL(url).host === 'github.com') {
        this.importNotebookMessage = this.notification.text;
      } else {
        this.importGitlabMessage = this.notification.text;
      }
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
    if (
      url.includes('tensorflow') ||
      url.includes('keras') ||
      url.includes('Keras')
    ) {
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
    const url = (
      this.shadowRoot?.querySelector('#notebook-badge-url') as TextField
    ).value;
    const rawURL = this.regularizeGithubURL(url);
    const badgeURL = rawURL.replace('https://raw.githubusercontent.com/', '');
    let baseURL = '';

    if (url === '') {
      this.notification.text = _text('import.NoNotebookCode');
      this.notification.show();
      this.notebookBadgeCodeInput.value = '';
      this.notebookBadgeCodeMarkdownInput.value = '';
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
      const fullText = `<a href="${
        baseURL + badgeURL
      }"><img src="https://www.backend.ai/assets/badge.svg" /></a>`;
      const fullTextMarkdown = `[![Run on Backend.AI](https://www.backend.ai/assets/badge.svg)](${
        baseURL + badgeURL
      })`;
      this.notebookBadgeCodeInput.value = fullText;
      this.notebookBadgeCodeMarkdownInput.value = fullTextMarkdown;
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
        if (navigator?.clipboard !== undefined) {
          // for Chrome, Safari
          navigator.clipboard.writeText?.(copyText).then(
            () => {
              this.notification.text = _text('import.NotebookBadgeCodeCopied');
              this.notification.show();
            },
            (err) => {
              console.error(_text('import.CouldNotCopyText'), err);
            },
          );
        } else {
          // other browsers
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

  async _getFolderList() {
    const vhost_info = await globalThis.backendaiclient.vfolder.list_hosts();
    this.vhosts = vhost_info.allowed;
    this.vhost = vhost_info.default;
    if ((this.allowed_folder_type as string[]).includes('group')) {
      const group_info = await globalThis.backendaiclient.group.list();
      this.allowedGroups = group_info.groups;
    }
  }

  urlTextfieldChanged(e, buttonIdValue, message?) {
    const button = this.shadowRoot?.querySelector(
      `#${buttonIdValue}`,
    ) as TextField;
    if (e.target.value !== '' && e.currentTarget.checkValidity()) {
      button.removeAttribute('disabled');
      this.setAttribute(message, '');
    } else {
      this.notification.text = _text('import.WrongURLType');
      button.setAttribute('disabled', 'true');
      this.setAttribute(
        message,
        e.target.value === '' ? '' : _text('import.WrongURLType'),
      );
      this.notification.show();
    }
    this.requestUpdate();
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css" />
      ${this.sessionLauncherType !== 'neo'
        ? html`
            <div class="horizontal wrap layout" style="margin-bottom:24px;">
              <lablup-activity-panel
                title="${_t('import.ImportNotebook')}"
                elevation="1"
                horizontalsize="2x"
              >
                <div slot="message">
                  <div class="horizontal wrap layout center">
                    <mwc-textfield
                      id="notebook-url"
                      label="${_t('import.NotebookURL')}"
                      autoValidate
                      validationMessage="${_text('import.WrongURLType')}"
                      pattern="^(https?)://([\\w./-]{1,}).ipynb$"
                      maxLength="2048"
                      placeholder="${_t('maxLength.2048chars')}"
                      @change="${(e) =>
                        this.urlTextfieldChanged(
                          e,
                          'import-notebook-button',
                          'importNotebookMessage',
                        )}"
                    ></mwc-textfield>
                    <mwc-button
                      id="import-notebook-button"
                      disabled
                      icon="cloud_download"
                      @click="${() => this.getNotebookFromURL()}"
                    >
                      <span>${_t('import.GetAndRunNotebook')}</span>
                    </mwc-button>
                  </div>
                  ${this.importNotebookMessage}
                </div>
              </lablup-activity-panel>
            </div>
          `
        : html``}
      <backend-ai-session-launcher
        mode="import"
        location="import"
        hideLaunchButton
        id="session-launcher"
        ?active="${this.active === true}"
        .newSessionDialogTitle="${_t('session.launcher.StartImportedNotebook')}"
      ></backend-ai-session-launcher>
      <div class="horizontal wrap layout" style="gap:24px">
        <lablup-activity-panel
          title="${_t('summary.ResourceStatistics')}"
          elevation="1"
          width="352"
          height="490"
          narrow
          scrollableY
        >
          <div slot="message">
            <backend-ai-resource-monitor
              location="summary"
              id="resource-monitor"
              ?active="${this.active === true}"
              direction="vertical"
            ></backend-ai-resource-monitor>
          </div>
        </lablup-activity-panel>
        <lablup-activity-panel
          title="${_t('import.CreateNotebookButton')}"
          elevation="1"
          width="352"
          height="490"
        >
          <div slot="message">
            <div class="vertical wrap layout center description">
              ${_t('import.YouCanCreateNotebookCode')}
              <img
                src="/resources/badge.svg"
                style="margin-top:5px;margin-bottom:5px;"
                width="147"
              />
              <mwc-textfield
                id="notebook-badge-url"
                label="${_t('import.NotebookBadgeURL')}"
                autoValidate
                validationMessage="${_text('import.WrongURLType')}"
                pattern="^(https?)://([\\w./-]{1,}).ipynb$"
                maxLength="2048"
                placeholder="${_t('maxLength.2048chars')}"
                @change="${(e) =>
                  this.urlTextfieldChanged(e, 'create-notebook-button')}"
              ></mwc-textfield>
              <mwc-button
                id="create-notebook-button"
                disabled
                fullwidth
                @click="${() => this.createNotebookBadge()}"
                icon="code"
              >
                ${_t('import.CreateButtonCode')}
              </mwc-button>
              <mwc-textarea
                id="notebook-badge-code"
                label="${_t('import.NotebookBadgeCodeHTML')}"
                @click="${(e) => this._copyTextArea(e)}"
              ></mwc-textarea>
              <mwc-textarea
                id="notebook-badge-code-markdown"
                label="${_t('import.NotebookBadgeCodeMarkdown')}"
                @click="${(e) => this._copyTextArea(e)}"
              ></mwc-textarea>
            </div>
          </div>
        </lablup-activity-panel>
      </div>
      <div class="horizontal wrap layout" style="margin-top:24px;">
        <lablup-activity-panel
          title="${_t('import.ImportGithubRepo')}"
          elevation="1"
          horizontalsize="2x"
        >
          <div slot="message">
            <div class="description">
              <p>${_t('import.RepoWillBeFolder')}</p>
            </div>
            <div class="horizontal wrap layout center">
              <mwc-textfield
                id="github-repo-url"
                class="repo-url"
                label="${_t('import.GitHubURL')}"
                autoValidate
                validationMessage="${_text('import.WrongURLType')}"
                pattern="^(https?)://github.com/([\\w./-]{1,})$"
                maxLength="2048"
                placeholder="${_t('maxLength.2048chars')}"
                @change="${(e) =>
                  this.urlTextfieldChanged(
                    e,
                    'import-github-repo-button',
                    'importGithubMessage',
                  )}"
              ></mwc-textfield>
              <mwc-select
                class="github-select"
                id="github-add-folder-host"
                label="${_t('data.Host')}"
              >
                ${this.vhosts.map(
                  (item, idx) => html`
                    <mwc-list-item
                      hasMeta
                      value="${item}"
                      ?selected="${item === this.vhost}"
                    >
                      <span>${item}</span>
                    </mwc-list-item>
                  `,
                )}
              </mwc-select>
              <mwc-button
                id="import-github-repo-button"
                disabled
                class="left-align"
                icon="cloud_download"
                @click="${() => this.getGitHubRepoFromURL()}"
              >
                <span>${_t('import.GetToFolder')}</span>
              </mwc-button>
            </div>
            ${this.importGithubMessage}
          </div>
        </lablup-activity-panel>
      </div>
      <div class="horizontal wrap layout" style="margin-top:24px;">
        <lablup-activity-panel
          title="${_t('import.ImportGitlabRepo')}"
          elevation="1"
          horizontalsize="2x"
        >
          <div slot="message">
            <div class="description">
              <p>${_t('import.GitlabRepoWillBeFolder')}</p>
            </div>
            <div class="horizontal wrap layout center">
              <mwc-textfield
                id="gitlab-repo-url"
                class="repo-url"
                label="${_t('import.GitlabURL')}"
                autoValidate
                validationMessage="${_text('import.WrongURLType')}"
                pattern="^(https?)://gitlab.com/([\\w./-]{1,})$"
                maxLength="2048"
                placeholder="${_t('maxLength.2048chars')}"
                @change="${(e) =>
                  this.urlTextfieldChanged(
                    e,
                    'import-gitlab-repo-button',
                    'importGitlabMessage',
                  )}"
              ></mwc-textfield>
              <mwc-textfield
                id="gitlab-default-branch-name"
                label="${_t('import.GitlabDefaultBranch')}"
                maxLength="200"
                placeholder="${_t('maxLength.200chars')}"
              ></mwc-textfield>
              <mwc-select
                id="gitlab-add-folder-host"
                label="${_t('data.Host')}"
              >
                ${this.vhosts.map(
                  (item, idx) => html`
                    <mwc-list-item
                      hasMeta
                      value="${item}"
                      ?selected="${item === this.vhost}"
                    >
                      <span>${item}</span>
                    </mwc-list-item>
                  `,
                )}
              </mwc-select>
              <mwc-button
                id="import-gitlab-repo-button"
                disabled
                class="left-align"
                icon="cloud_download"
                @click="${() => this.getGitlabRepoFromURL()}"
              >
                <span>${_t('import.GetToFolder')}</span>
              </mwc-button>
            </div>
            ${this.importGitlabMessage}
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
