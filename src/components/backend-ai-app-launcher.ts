/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";

import 'weightless/button';
import 'weightless/card';
import 'weightless/checkbox';
import 'weightless/icon';
import 'weightless/textfield';
import 'weightless/title';
import '@material/mwc-icon-button';
import '@material/mwc-button';

import './lablup-loading-spinner';
import './backend-ai-dialog';

import {BackendAiStyles} from './backend-ai-general-styles';
import {BackendAIPage} from './backend-ai-page';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

/**
 Backend.AI App Launcher

 Example:

 <backend-ai-app-launcher id="app-launcher"></backend-ai-app-launcher>

 @group Backend.AI Console
 @element backend-ai-app-launcher
 */

@customElement("backend-ai-app-launcher")
export default class BackendAiAppLauncher extends BackendAIPage {
  public shadowRoot: any;

  @property({type: Boolean}) active = true;
  @property({type: String}) condition = 'running';
  @property({type: Object}) jobs = Object();
  @property({type: Array}) appSupportList = Array();
  @property({type: Object}) appTemplate = Object();
  @property({type: Object}) imageInfo = Object();
  @property({type: Array}) _selected_items = Array();
  @property({type: Boolean}) refreshing = false;
  @property({type: Object}) notification = Object();
  @property({type: Object}) spinner = Object();
  @property({type: Object}) refreshTimer = Object();
  @property({type: Object}) kernel_labels = Object();
  @property({type: Object}) indicator = Object();
  @property({type: Number}) sshPort = 0;
  @property({type: Number}) vncPort = 0;

  constructor() {
    super();
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        mwc-icon-button.apps {
          --mdc-icon-button-size: 48px;
          --mdc-icon-size: 36px;
          padding: 3px;
        }

        #app-dialog {
          --component-width: 330px;
          --component-width: auto;
          --component-max-width: 70%;
        }

        #ssh-dialog {
          --component-width: 330px;
        }

        .app-icon {
          margin-left: 5px;
          margin-right: 5px;
        }

        .app-icon .label {
          display: block;
          width: 80px;
          text-align: center;
          height: 25px;
          font-size: 13px;
        }
      `];
  }


  firstUpdated() {
    this._initializeAppTemplate();
    this.refreshTimer = null;
    fetch('resources/image_metadata.json').then(
      response => response.json()
    ).then(
      json => {
        this.imageInfo = json.imageInfo;
        for (let key in this.imageInfo) {
          this.kernel_labels[key] = [];
          if ("label" in this.imageInfo[key]) {
            this.kernel_labels[key] = this.imageInfo[key].label;
          } else {
            this.kernel_labels[key] = [];
          }
        }
      }
    );
    this.notification = globalThis.lablupNotification;
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
  }

  _initializeAppTemplate() {
    fetch('resources/app_template.json').then(
      response => response.json()
    ).then(
      json => {
        this.appTemplate = json.appTemplate;
      }
    );
  }

  /**
   * Send a request with a get method.
   *
   * @param rqst
   */
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
        body = await resp.blob();
      }
      if (!resp.ok) {
        throw body;
      }
    } catch (e) {
      //console.log(e);
    }
    return body;
  }

  /**
   * Get a proxy url by checking local proxy and config proxy url.
   */
  _getProxyURL() {
    let url = 'http://127.0.0.1:5050/';
    if (globalThis.__local_proxy !== undefined) {
      url = globalThis.__local_proxy;
    } else if (globalThis.backendaiclient._config.proxyURL !== undefined) {
      url = globalThis.backendaiclient._config.proxyURL;
    }
    return url;
  }

  /**
   * Display the app launcher.
   *
   * @param detail
   */
  showLauncher(detail) {
    return this._showAppLauncher(detail);
  }

  /**
   * Display the app launcher.
   *
   * @param detail
   */
  _showAppLauncher(controls) {
    const sessionUuid = controls['session-uuid'];
    const accessKey = controls['access-key'];
    const appServices = controls['app-services'];
    if ('runtime' in controls) {
      let param: Object = {};
      param['session-uuid'] = sessionUuid;
      param['app-name'] = controls['runtime'];
      param['url-postfix'] = '';
      param['file-name'] = controls['filename'];
      if (param['app-name'] === 'jupyter') {
        param['url-postfix'] = '&redirect=/notebooks/' + param['file-name'];
      }
      return this._runAppWithParameters(param);
    }
    this.appSupportList = [];
    this.appSupportList.push({ // Force push terminal
      'name': 'ttyd',
      'title': 'Console',
      'redirect': "",
      'src': './resources/icons/terminal.svg'
    });
    appServices.forEach((elm) => {
      if (elm in this.appTemplate) {
        if (elm !== 'sshd' || (elm === 'sshd' && globalThis.isElectron)) {
          this.appTemplate[elm].forEach((app) => {
            this.appSupportList.push(app);
          });
        }
      } else {
        if (!['ttyd', 'ipython'].includes(elm)) { // They are default apps from Backend.AI agent.
          this.appSupportList.push({
            'name': elm,
            'title': elm,
            'redirect': "",
            'src': './resources/icons/default_app.svg'
          });
        }
      }
    });
    let dialog = this.shadowRoot.querySelector('#app-dialog');
    dialog.setAttribute('session-uuid', sessionUuid);
    dialog.setAttribute('access-key', accessKey);
    //dialog.positionTarget = e.target;
    this.shadowRoot.querySelector('#app-dialog').show();
    return;
  }

  /**
   * Hide the app launcher.
   */
  _hideAppLauncher() {
    this.shadowRoot.querySelector('#app-dialog').hide();
  }

  /**
   * Open a WsProxy with session and app and port number.
   *
   * @param {string} sessionUuid
   * @param {string} app
   * @param {number} port
   */
  async _open_wsproxy(sessionUuid, app = 'jupyter', port: number | null = null) {
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      return false;
    }
    let param = {
      endpoint: globalThis.backendaiclient._config.endpoint
    };
    if (globalThis.backendaiclient._config.connectionMode === 'SESSION') {
      param['mode'] = "SESSION";
      param['session'] = globalThis.backendaiclient._config._session_id;
    } else {
      param['mode'] = "DEFAULT";
      param['access_key'] = globalThis.backendaiclient._config.accessKey;
      param['secret_key'] = globalThis.backendaiclient._config.secretKey;
    }
    param['api_version'] = globalThis.backendaiclient.APIMajorVersion;
    if (globalThis.isElectron && globalThis.__local_proxy === undefined) {
      this.indicator.end();
      this.notification.text = 'Proxy is not ready yet. Check proxy settings for detail.';
      this.notification.show();
      return Promise.resolve(false);
    }
    let rqst = {
      method: 'PUT',
      body: JSON.stringify(param),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      uri: this._getProxyURL() + 'conf'
    };
    this.indicator.set(20, 'Setting up proxy for the app...');
    try {
      let response = await this.sendRequest(rqst);
      if (response === undefined) {
        this.indicator.end();
        this.notification.text = 'Proxy configurator is not responding.';
        this.notification.show();
        return Promise.resolve(false);
      }
      let token = response.token;
      let uri = this._getProxyURL() + `proxy/${token}/${sessionUuid}/add?app=${app}`;
      if (port !== null && port > 1024 && port < 65535) {
        uri += `&port=${port}`;
      }
      this.indicator.set(50, 'Adding kernel to socket queue...');
      let rqst_proxy = {
        method: 'GET',
        app: app,
        uri: uri
      };
      return await this.sendRequest(rqst_proxy);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Run backend.ai app.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  async _runAppWithParameters(param) {
    let sessionUuid = param['session-uuid'];
    let urlPostfix = param['url-postfix'];
    let appName = param['app-name'];
    if (appName === undefined || appName === null) {
      return;
    }

    if (urlPostfix === undefined || urlPostfix === null) {
      urlPostfix = '';
    }

    if (typeof globalThis.backendaiwsproxy === "undefined" || globalThis.backendaiwsproxy === null) {
      this._hideAppLauncher();
      this.indicator = await globalThis.lablupIndicator.start();
      let port = null;
      if (globalThis.isElectron && appName === 'sshd') {
        port = globalThis.backendaioptions.get('custom_ssh_port', 0);
        if (port === '0' || port === 0) { // setting store does not accept null.
          port = null;
        }
      }
      this._open_wsproxy(sessionUuid, appName, port)
        .then((response) => {
          if (response.url) {
            this.indicator.set(100, 'Prepared.');
            setTimeout(() => {
              globalThis.open(response.url + urlPostfix, '_blank');
              console.log(appName + " proxy loaded: ");
              console.log(sessionUuid);
            }, 1000);
          }
        });
    }
  }

  /**
   * Run backend.ai app.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  async _runThisApp(e) {
    const controller = e.target;
    let controls = controller.closest('#app-dialog');
    let sessionUuid = controls.getAttribute('session-uuid');
    let urlPostfix = controller['url-postfix'];
    let appName = controller['app-name'];
    if (appName === undefined || appName === null) {
      return;
    }

    if (urlPostfix === undefined || urlPostfix === null) {
      urlPostfix = '';
    }

    if (typeof globalThis.backendaiwsproxy === "undefined" || globalThis.backendaiwsproxy === null) {
      this._hideAppLauncher();
      this.indicator = await globalThis.lablupIndicator.start();
      let port = null;
      if (globalThis.isElectron && appName === 'sshd') {
        port = globalThis.backendaioptions.get('custom_ssh_port', 0);
        if (port === '0' || port === 0) { // setting store does not accept null.
          port = null;
        }
      }
      this._open_wsproxy(sessionUuid, appName, port)
        .then((response) => {
          if (appName === 'sshd') {
            this.indicator.set(100, 'Prepared.');
            this.sshPort = response.port;
            this._readSSHKey(sessionUuid);
            this._openSSHDialog();
            setTimeout(() => {
              this.indicator.end();
            }, 1000);
          } else if (appName === 'vnc') {
            this.indicator.set(100, 'Prepared.');
            this.vncPort = response.port;
            this._openVNCDialog();
          } else if (response.url) {
            this.indicator.set(100, 'Prepared.');
            setTimeout(() => {
              globalThis.open(response.url + urlPostfix, '_blank');
              console.log(appName + " proxy loaded: ");
              console.log(sessionUuid);
            }, 1000);
          }
        });
    }
  }

  /**
   * Read a SSH key.
   *
   * @param {string} sessionUuid
   */
  async _readSSHKey(sessionUuid) {
    const downloadLinkEl = this.shadowRoot.querySelector('#sshkey-download-link');
    const file = '/home/work/id_container';
    const blob = await globalThis.backendaiclient.download_single(sessionUuid, file);
    // TODO: This blob has additional leading letters in front of key texts.
    //       Manually trim those letters.
    const rawText = await blob.text();
    const index = rawText.indexOf('-----');
    const trimmedBlob = await blob.slice(index, blob.size, blob.type);
    downloadLinkEl.href = globalThis.URL.createObjectURL(trimmedBlob);
    downloadLinkEl.download = 'id_container';
  }

  /**
   * Run terminal with session name.
   *
   * @param {string} sessionUuid
   */
  async runTerminal(sessionUuid: string) {
    if (globalThis.backendaiwsproxy == undefined || globalThis.backendaiwsproxy == null) {
      this.indicator = await globalThis.lablupIndicator.start();
      this._open_wsproxy(sessionUuid, 'ttyd')
        .then((response) => {
          if (response.url) {
            this.indicator.set(100, 'Prepared.');
            setTimeout(() => {
              globalThis.open(response.url, '_blank');
              this.indicator.end();
              console.log("Terminal proxy loaded: ");
              console.log(sessionUuid);
            }, 1000);
          }
        });
    }
  }

  /**
   * Open a SSH dialog.
   */
  _openSSHDialog() {
    let dialog = this.shadowRoot.querySelector('#ssh-dialog');
    dialog.show();
  }

  /**
   * Open a VNC dialog.
   */
  _openVNCDialog() {
    let dialog = this.shadowRoot.querySelector('#vnc-dialog');
    dialog.show();
  }

  render() {
    // language=HTML
    return html`
      <backend-ai-dialog id="app-dialog" fixed backdrop>
        <span slot="title">App</span>
        <div slot="content" style="padding:15px;" class="horizontal layout wrap center start-justified">
        ${this.appSupportList.map(item => html`
          <div class="vertical layout center center-justified app-icon">
            <mwc-icon-button class="fg apps green" .app="${item.name}" .app-name="${item.name}"
                               .url-postfix="${item.redirect}"
                               @click="${(e) => this._runThisApp(e)}">
              <img src="${item.src}" />
            </mwc-icon-button>
            <span class="label">${item.title}</span>
          </div>
        `)}
         </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="ssh-dialog" fixed backdrop>
        <span slot="title">SSH / SFTP connection</span>
        <div slot="content" style="padding:15px;">
          <div style="padding:15px 0;" >Use your favorite SSH/SFTP application to connect.</div>
          <section class="vertical layout wrap start start-justified">
            <h4>${_t("session.ConnectionInformation")}</h4>
            <div><span>SSH URL:</span> <a href="ssh://127.0.0.1:${this.sshPort}">ssh://127.0.0.1:${this.sshPort}</a></div>
            <div><span>SFTP URL:</span> <a href="sftp://127.0.0.1:${this.sshPort}">sftp://127.0.0.1:${this.sshPort}</a></div>
            <div><span>Port:</span> ${this.sshPort}</div>
            <a id="sshkey-download-link" style="margin-top:15px;" href="">
              <mwc-button class="fg apps green">Download SSH key file (id_container)</mwc-button>
            </a>
          </section>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="vnc-dialog" fixed backdrop>
        <span slot="title">${_t("session.VNCconnection")}</span>
        <div slot="content" style="padding:15px;">
          <div style="padding:15px 0;">${_t("session.UseYourFavoriteSSHApp")}</div>
          <section class="vertical layout wrap start start-justified">
            <h4>${_t("session.ConnectionInformation")}</h4>
            <div><span>VNC URL:</span> <a href="ssh://127.0.0.1:${this.vncPort}">vnc://127.0.0.1:${this.vncPort}</a></div>
          </section>
        </div>
      </backend-ai-dialog>
      `;
  }

}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-app-launcher": BackendAiAppLauncher;
  }
}
