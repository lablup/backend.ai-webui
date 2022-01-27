/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import '@material/mwc-button';
import '@material/mwc-checkbox';
import '@material/mwc-icon-button';
import '@material/mwc-textfield';
import 'macro-carousel';

import './lablup-loading-spinner';
import './backend-ai-dialog';

import {BackendAiStyles} from './backend-ai-general-styles';
import {BackendAIPage} from './backend-ai-page';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

/**
 Backend.AI App Launcher

 Example:

 <backend-ai-app-launcher id="app-launcher"></backend-ai-app-launcher>

 @group Backend.AI Web UI
 @element backend-ai-app-launcher
 */

@customElement('backend-ai-app-launcher')
export default class BackendAiAppLauncher extends BackendAIPage {
  public shadowRoot: any;

  @property({type: Boolean}) active = true;
  @property({type: String}) condition = 'running';
  @property({type: Object}) jobs = Object();
  @property({type: Array}) appSupportList;
  @property({type: Array}) appSupportOption;
  @property({type: Object}) appTemplate = Object();
  @property({type: Object}) imageInfo = Object();
  @property({type: Array}) _selected_items = [];
  @property({type: Boolean}) refreshing = false;
  @property({type: Object}) notification = Object();
  @property({type: Object}) spinner = Object();
  @property({type: Object}) refreshTimer = Object();
  @property({type: Object}) kernel_labels = Object();
  @property({type: Object}) indicator = Object();
  @property({type: Number}) sshPort = 0;
  @property({type: Number}) vncPort = 0;
  @property({type: Number}) xrdpPort = 0;
  @property({type: String}) tensorboardPath = '';
  @property({type: Boolean}) isPathConfigured = false;
  @property({type: Array}) appLaunchBeforeTunneling = ['nniboard', 'mlflow-ui'];
  @property({type: Object}) appController = Object();
  @property({type: Object}) openPortToPublic = false;
  @property({type: Array}) appOrder;
  @property({type: Array}) appSupportWithCategory = [];
  @property({type: Object}) appEnvs = Object();
  @property({type: Object}) appArgs = Object();

  constructor() {
    super();
    this.appSupportList = [];
    this.appSupportOption = [];
  }

  static get styles(): CSSResultGroup | undefined {
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

        mwc-icon-button#tensorboard-button {
          background-color: #e9852e;
          color: white;
          --mdc-icon-button-size: 24px;
          --mdc-icon-size: 24px;
          padding: 10px;
          margin-left: 10px;
          border-radius: 10px;
        }

        mwc-textfield#tensorboard-path {
          width: 100%;
          --mdc-text-field-fill-color: transparent;
          --mdc-theme-primary: var(--general-textfield-selected-color);
          --mdc-typography-font-family: var(--general-font-family);
        }

        #ssh-dialog {
          --component-width: 330px;
        }

        .app-icon {
          margin-left: 15px;
          margin-right: 5px;
        }

        .app-icon .label {
          display: block;
          width: 80px;
          text-align: center;
          line-height: 15px;
          height: 25px;
          font-size: 13px;
        }

        #app-launch-confirmation-dialog {
          --component-width: 400px;
          --component-font-size: 14px;
        }
        #tensorboard-dialog {
          --component-width: 400px;
        }

        #app-dialog {
          --component-width: 400px;
        }

        #allowed-client-ips-container {
          margin-left: 2em;
          margin-bottom: 1em;
          display:none;
        }

        mwc-textfield {
          --mdc-shape-small: 14px;
        }

        macro-carousel {
          max-width: 700px;
          height: 450px;
          padding: 0 30px;
          margin: 0 10px;
        }

        .slide {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .slide > span {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-repeat: no-repeat;
          background-size: contain;
          background-position: top center;
        }

        .slide > p {
          font-size: 14px;
        }

        macro-carousel-pagination-indicator {
          /* Change the dots color */
          --macro-carousel-pagination-color: var(--paper-grey-400);
          /* Change the aspect of the selected dot */
          --macro-carousel-pagination-color-selected: var(--paper-green-400);
          /* Change the dots size */
          --macro-carousel-pagination-size-clickable: 32px;
          --macro-carousel-pagination-size-dot: 10px;
        }

        span.keyboard {
          font-family: Menlo, Courier, "Courier New";
          padding: 20px;
          background-color: var(--paper-grey-200);
          border-radius: 10px;
          margin: 0px 10px;
        }

        span.invert {
          font-size: 26px;
          color: var(--paper-grey-200);
          background-color: transparent;
          margin: 0px 10px;
        }

        span.one-key {
          text-align: center;
          width: 24px;
        }

        mwc-checkbox#hide-guide {
          margin-right: 10px;
        }

        p code {
          font: 12px Monaco, "Courier New", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", monospace;
          color: #52595d;
          -webkit-border-radius: 3px;
          -moz-border-radius: 3px;
          border-radius: 3px;
          -moz-background-clip: padding;
          -webkit-background-clip: padding-box;
          background-clip: padding-box;
          border: 1px solid #cccccc;
          background-color: #f9f9f9;
          padding: 0px 3px;
          display: inline-block;
        }

        @media screen and (max-width: 810px) {
          #terminal-guide {
            --component-width: calc(100% - 50px);
          }
        }
      `];
  }

  firstUpdated() {
    this._initializeAppTemplate();
    this.refreshTimer = null;
    fetch('resources/image_metadata.json').then(
      (response) => response.json()
    ).then(
      (json) => {
        this.imageInfo = json.imageInfo;
        for (const key in this.imageInfo) {
          if ({}.hasOwnProperty.call(this.imageInfo, key)) {
            this.kernel_labels[key] = [];
            if ('label' in this.imageInfo[key]) {
              this.kernel_labels[key] = this.imageInfo[key].label;
            } else {
              this.kernel_labels[key] = [];
            }
          }
        }
      }
    );
    // add WebTerminalGuide UI dynamically
    this._createTerminalGuide();
    // add DonotShowOption dynamically
    this._createDonotShowOption();
    this.notification = globalThis.lablupNotification;
    const checkbox = this.shadowRoot.querySelector('#hide-guide');
    checkbox.addEventListener('change', (event) => {
      if (!event.target.checked) {
        localStorage.setItem('backendaiwebui.terminalguide', 'true');
      } else {
        localStorage.setItem('backendaiwebui.terminalguide', 'false');
      }
    });
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
  }

  _initializeAppTemplate() {
    fetch('resources/app_template.json').then(
      (response) => response.json()
    ).then(
      (json) => {
        this.appTemplate = json.appTemplate;
        const apps = Object.keys(this.appTemplate);
        apps.sort((a, b) => (this.appTemplate[a][0].category > this.appTemplate[b][0].category) ? 1 : -1);
        this.appOrder = apps;
      }
    );
  }

  /**
   * Send a request with a get method.
   *
   * @param {Request} rqst : request object
   */
  async sendRequest(rqst) {
    let resp; let body;
    try {
      if (rqst.method == 'GET') {
        rqst.body = undefined;
      }
      resp = await fetch(rqst.uri, rqst);
      const contentType = resp.headers.get('Content-Type');
      if (contentType === null) {
        body = resp.ok;
        if (!resp.ok) {
          throw new Error(resp);
        }
      } else if (contentType.startsWith('application/json') ||
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
      return resp;
    }
    return body;
  }

  /**
   * Get a proxy url by checking local proxy and config proxy url.
   *
   * @return {string} url - Proxy URL
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
   * @param {Object} detail
   *
   */
  showLauncher(detail) {
    this._showAppLauncher(detail);
  }

  /**
   * Display the app launcher.
   *
   * @param {object} controls
   * @return {void}
   */
  _showAppLauncher(controls) {
    const sessionUuid = controls['session-uuid'];
    const accessKey = controls['access-key'];
    const appServices = controls['app-services'];
    const appServicesOption: Record<string, unknown> = ('app-services-option' in controls) ? controls['app-services-option'] : {};
    if ('runtime' in controls) {
      const param: Record<string, unknown> = {};
      param['session-uuid'] = sessionUuid;
      param['app-name'] = controls['runtime'];
      param['url-postfix'] = '';
      param['file-name'] = controls['filename'];
      if (param['app-name'] === 'jupyter') {
        param['url-postfix'] = '&redirect=/notebooks/' + param['file-name'];
      }
      if ('arguments' in controls) {
        param['args'] = controls['arguments'];
      }
      return this._runAppWithParameters(param);
    }
    this.appSupportList = [];
    if (!appServices.includes('ttyd')) {
      this.appSupportList.push({ // Force push terminal
        'name': 'ttyd',
        'title': 'Console',
        'category': '0.Default',
        'redirect': '',
        'src': './resources/icons/terminal.svg'
      });
    }
    /* if (!appServices.includes('filebrowser')) {
      this.appSupportList.push({ // Force push filebrowser
        'name' : 'filebrowser',
        'title': 'FileBrowser',
        'category': '1.Utilities',
        'redirect': '',
        'src': './resources/icons/filebrowser.svg'
      });
    }*/
    appServices.forEach((elm) => {
      if (!(elm in this.appTemplate)) {
        this.appTemplate[elm] = [];
        this.appTemplate[elm].push({
          'name': elm,
          'title': elm,
          'category': '99.',
          'redirect': '',
          'src': './resources/icons/default_app.svg'
        });
      }
    });
    appServices.sort((a, b) => (this.appTemplate[a][0].category > this.appTemplate[b][0].category) ? 1 : -1);
    let interText = '';
    if (Object.keys(appServicesOption).length > 0) {
      this.appSupportOption = appServicesOption;
    }
    appServices.forEach((elm) => {
      if (elm in this.appTemplate) {
        if (elm !== 'sshd' || (elm === 'sshd' && globalThis.isElectron)) {
          if (interText !== this.appTemplate[elm][0].category) {
            this.appSupportList.push({
              'name': this.appTemplate[elm][0].category.substring(2),
              'title': this.appTemplate[elm][0].category.substring(2),
              'category': 'divider',
              'redirect': '',
              'src': ''
            });
            interText = this.appTemplate[elm][0].category;
          }
          this.appTemplate[elm].forEach((app) => {
            this.appSupportList.push(app);
          });
        }
      } else {
        if (!['ttyd', 'ipython'].includes(elm)) { // They are default apps from Backend.AI agent.
          this.appSupportList.push({
            'name': elm,
            'title': elm,
            'category': 'Default',
            'redirect': '',
            'src': './resources/icons/default_app.svg'
          });
        }
      }
    });
    this.openPortToPublic = globalThis.backendaiclient._config.openPortToPublic;
    this._toggleChkOpenToPublic();
    const dialog = this.shadowRoot.querySelector('#app-dialog');
    dialog.setAttribute('session-uuid', sessionUuid);
    dialog.setAttribute('access-key', accessKey);
    this.shadowRoot.querySelector('#app-dialog').show();
    return;
  }

  /**
   * Hide the app launcher.
   */
  _hideAppLauncher() {
    this.shadowRoot.querySelector('#app-dialog').hide();
  }

  async _resolveV1ProxyUri(sessionUuid: string, app: string): Promise<string | undefined> {
    const param = {
      endpoint: globalThis.backendaiclient._config.endpoint
    };
    if (globalThis.backendaiclient._config.connectionMode === 'SESSION') {
      param['mode'] = 'SESSION';
      param['session'] = globalThis.backendaiclient._config._session_id;
    } else {
      param['mode'] = 'API';
      param['access_key'] = globalThis.backendaiclient._config.accessKey;
      param['secret_key'] = globalThis.backendaiclient._config.secretKey;
    }
    param['api_version'] = globalThis.backendaiclient.APIMajorVersion;
    if (globalThis.isElectron && globalThis.__local_proxy === undefined) {
      this.indicator.end();
      this.notification.text = _text('session.launcher.ProxyNotReady');

      this.notification.show();
      return;
    }
    const rqst = {
      method: 'PUT',
      body: JSON.stringify(param),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      uri: this._getProxyURL() + 'conf'
    };
    this.indicator.set(20, _text('session.launcher.SettingUpProxyForApp'));
    const response = await this.sendRequest(rqst);
    if (response === undefined) {
      this.indicator.end();
      this.notification.text = _text('session.launcher.ProxyConfiguratorNotResponding');
      this.notification.show();
      return;
    }
    const token = response.token;
    return new URL(`proxy/${token}/${sessionUuid}/add?app=${app}`, this._getProxyURL()).href;
  }

  /**
   * Open V2 WsProxy (direct connection) with session and app and port number.
   *
   * @param {string} sessionUuid
   * @param {string} app
   * @param {number} port
   * @param {object | null} envs
   * @param {object | null} args
   */
  async _resolveV2ProxyUri(sessionUuid: string, app: string, port: number | null = null, envs: Record<string, unknown> | null = null, args: Record<string, unknown> | null = null): Promise<string | undefined> {
    const tokenResponse = await globalThis.backendaiclient.computeSession.startService(
      sessionUuid, app, port, envs, args
    );
    if (tokenResponse === undefined) {
      this.indicator.end();
      this.notification.text = _text('session.launcher.ProxyConfiguratorNotResponding');
      this.notification.show();
      return;
    }
    const token = tokenResponse.token;
    return new URL(`v2/proxy/${token}/${sessionUuid}/add?app=${app}`, tokenResponse.wsproxy_addr).href;
  }

  /**
   * Open a WsProxy with session and app and port number.
   *
   * @param {string} sessionUuid
   * @param {string} app
   * @param {number} port
   * @param {object | null} envs
   * @param {object | null} args
   */
  async _open_wsproxy(sessionUuid, app = 'jupyter', port: number | null = null, envs: Record<string, unknown> | null = null, args: Record<string, unknown> | null = null) {
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      return false;
    }

    const kInfo = await globalThis.backendaiclient.computeSession.get(['scaling_group', 'service_ports'], sessionUuid);
    if (kInfo === undefined) {
      this.indicator.end();
      this.notification.text = _text('session.CreationFailed'); // TODO: Change text

      this.notification.show();
      return Promise.resolve(false);
    }
    const servicePortInfo = JSON.parse(kInfo.compute_session.service_ports).find(({name}) => name === app)
    if (servicePortInfo === undefined) {
      this.indicator.end();
      this.notification.text = _text('session.CreationFailed'); // TODO: Change text

      this.notification.show();
      return Promise.resolve(false);      
    }

    const scalingGroupId = kInfo.compute_session.scaling_group;
    // Apply v1 when executing in electron mode
    const wsproxyVersion = (globalThis.isElectron) ? 'v1' : (await globalThis.backendaiclient.scalingGroup.getWsproxyVersion(scalingGroupId)).version;
    let uri = (wsproxyVersion == 'v1') ? await this._resolveV1ProxyUri(sessionUuid, app) : await this._resolveV2ProxyUri(sessionUuid, app, port, envs, args);
    if (!uri) {
      return Promise.resolve(false);
    }
    const openToPublicCheckBox = this.shadowRoot.querySelector('#chk-open-to-public');
    const allowedClientIps = this.shadowRoot.querySelector('#allowed-client-ips')?.value;
    let openToPublic = false;
    if (openToPublicCheckBox == null) { // Null or undefined
    } else {
      openToPublic = openToPublicCheckBox.checked;
      openToPublicCheckBox.checked = false;
    }

    if (port !== null && port > 1024 && port < 65535) {
      uri += `&port=${port}`;
    }
    if (openToPublic) {
      uri += '&open_to_public=true';
    }
    if (openToPublic && allowedClientIps?.length > 0) {
      uri += '&allowed_client_ips=' + allowedClientIps.replace(/\s/g, '');
    }
    if (envs !== null && Object.keys(envs).length > 0) {
      uri = uri + '&envs=' + encodeURI(JSON.stringify(envs));
    }
    if (args !== null && Object.keys(args).length > 0) {
      uri = uri + '&args=' + encodeURI(JSON.stringify(args));
    }
    uri += '&protocol=' + (servicePortInfo.protocol || 'tcp');
    this.indicator.set(50, _text('session.launcher.AddingKernelToSocketQueue'));
    const rqst_proxy = {
      method: 'GET',
      app: app,
      uri: uri
    };
    return await this.sendRequest(rqst_proxy);
  }

  /**
   * Close a WsProxy with session and app.
   *
   * @param {string} sessionUuid
   * @param {string} app
   * @param {number} port
   * @param {object | null} envs
   * @param {object | null} args
   */
  async _close_wsproxy(sessionUuid, app = 'jupyter') {
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      return false;
    }
    const token = globalThis.backendaiclient._config.accessKey;
    const uri = this._getProxyURL() + `proxy/${token}/${sessionUuid}/delete?app=${app}`;
    const rqst_proxy = {
      method: 'GET',
      app: app,
      uri: uri,
      credentials: 'include',
      mode: 'cors'
    };
    return await this.sendRequest(rqst_proxy);
  }

  /**
   * Run backend.ai app.
   *
   * @param {Record<string, unknown>} param - Dispatches from the native input event each time the input changes.
   */
  async _runAppWithParameters(param) {
    const sessionUuid = param['session-uuid'];
    let urlPostfix = param['url-postfix'];
    const appName = param['app-name'];
    const envs = null;
    let args = null;
    if (appName === undefined || appName === null) {
      return;
    }

    if (urlPostfix === undefined || urlPostfix === null) {
      urlPostfix = '';
    }
    if ('args' in param) {
      args = param['args'];
    }

    if (appName === 'tensorboard') {
      this._openTensorboardDialog();
      return;
    }

    if (typeof globalThis.backendaiwsproxy === 'undefined' || globalThis.backendaiwsproxy === null) {
      this._hideAppLauncher();
      this.indicator = await globalThis.lablupIndicator.start();
      let port = null;
      if (globalThis.isElectron && appName === 'sshd') {
        port = globalThis.backendaioptions.get('custom_ssh_port', 0);
        if (port === '0' || port === 0) { // setting store does not accept null.
          port = null;
        }
      }
      this._open_wsproxy(sessionUuid, appName, port, envs, args)
        .then(async (response) => {
          if (response.url) {
            await this._connectToProxyWorker(response.url, urlPostfix);
            this.indicator.set(100, _text('session.applauncher.Prepared'));
            setTimeout(() => {
              globalThis.open(response.url + urlPostfix, '_blank');
              // console.log(appName + " proxy loaded: ");
              // console.log(sessionUuid);
            }, 1000);
          }
        });
    }
  }

  async _connectToProxyWorker(url, urlPostfix) {
    const rqst_proxy = {
      method: 'GET',
      uri: url + urlPostfix,
      mode: 'no-cors',
      redirect: 'follow', // 'manual'
      credentials: 'include'
    };
    let count = 0;
    while (count < 5) {
      const result = await this.sendRequest(rqst_proxy);
      if (typeof result === 'object' && 'status' in result && [500, 501, 502].includes(result.status)) {
        await this._sleep(1000);
        count = count + 1;
      } else {
        count = 6;
      }
    }
  }

  async _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async _runThisAppWithConfirmationIfNeeded(e) {
    const controller = e.target;
    const appName = controller['app-name'];
    if (this.appLaunchBeforeTunneling.includes(appName)) {
      const controller = e.target;
      this.appController['app-name'] = controller['app-name'];
      const controls = controller.closest('#app-dialog');
      this.appController['session-uuid'] = controls.getAttribute('session-uuid');
      this.appController['url-postfix'] = controller['url-postfix'];
      this._openAppLaunchConfirmationDialog(e);
    } else {
      return this._runThisApp(e);
    }
  }

  /**
   * Run backend.ai app from the event
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  async _runThisApp(e) {
    const controller = e.target.closest('mwc-icon-button');
    this.appController['app-name'] = controller['app-name'];
    const controls = controller.closest('#app-dialog');
    this.appController['session-uuid'] = controls.getAttribute('session-uuid');
    this.appController['url-postfix'] = controller['url-postfix'];
    return this._runApp(this.appController);
  }

  /**
   * Run backend.ai app with config
   *
   * @param {Object} config - Configuration to run app. It should contain `app-name`, 'session-uuid` and `url-postfix`.
   */
  async _runApp(config) {
    const appName = config['app-name'];
    const sessionUuid = config['session-uuid'];
    let urlPostfix = config['url-postfix'];
    const envs = null;
    const args = null;
    if (appName === undefined || appName === null) {
      return;
    }

    if (urlPostfix === undefined || urlPostfix === null) {
      urlPostfix = '';
    }

    if (appName === 'tensorboard') {
      this._openTensorboardDialog();
      return;
    }
    if (appName === 'ttyd') {
      const isVisible = localStorage.getItem('backendaiwebui.terminalguide');
      if (!isVisible || isVisible === 'true') {
        this._openTerminalGuideDialog();
      }
    }

    if (typeof globalThis.backendaiwsproxy === 'undefined' || globalThis.backendaiwsproxy === null) {
      this._hideAppLauncher();
      this.indicator = await globalThis.lablupIndicator.start();
      let port;
      if (globalThis.isElectron && appName === 'sshd') {
        port = globalThis.backendaioptions.get('custom_ssh_port', 0);
        if (port === '0' || port === 0) { // setting store does not accept null.
          port = null;
        }
      }
      const usePreferredPort = this.shadowRoot.querySelector('#chk-preferred-port').checked;
      const userPort = parseInt(this.shadowRoot.querySelector('#app-port').value);
      if (usePreferredPort && userPort) {
        port = userPort;
      }
      this._open_wsproxy(sessionUuid, appName, port, envs, args)
        .then(async (response) => {
          await this._connectToProxyWorker(response.url, urlPostfix);
          if (appName === 'sshd') {
            this.indicator.set(100, _text('session.applauncher.Prepared'));
            this.sshPort = response.port;
            this._readSSHKey(sessionUuid);
            this._openSSHDialog();
            setTimeout(() => {
              this.indicator.end();
            }, 1000);
          } else if (appName === 'vnc') {
            this.indicator.set(100, _text('session.applauncher.Prepared'));
            this.vncPort = response.port;
            this._openVNCDialog();
          } else if (appName === 'xrdp') {
            this.indicator.set(100, _text('session.applauncher.Prepared'));
            this.xrdpPort = response.port;
            this._openXRDPDialog();
          } else if (response.url) {
            this.indicator.set(100, _text('session.applauncher.Prepared'));
            setTimeout(() => {
              globalThis.open(response.url + urlPostfix, '_blank');
              // console.log(appName + " proxy loaded: ");
              // console.log(sessionUuid);
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
    const isVisible = localStorage.getItem('backendaiwebui.terminalguide');
    if (!isVisible || isVisible === 'true') {
      this._openTerminalGuideDialog();
    }
    if (globalThis.backendaiwsproxy == undefined || globalThis.backendaiwsproxy == null) {
      this.indicator = await globalThis.lablupIndicator.start();
      this._open_wsproxy(sessionUuid, 'ttyd')
        .then(async (response) => {
          await this._connectToProxyWorker(response.url, '');
          if (response.url) {
            this.indicator.set(100, _text('session.applauncher.Prepared'));
            setTimeout(() => {
              globalThis.open(response.url, '_blank');
              this.indicator.end();
              // console.log("Terminal proxy loaded: ");
              // console.log(sessionUuid);
            }, 1000);
          }
        });
    }
  }

  /**
   * Open a confirmation dialog.
   *
   * @param{Event} e
   */
  _openAppLaunchConfirmationDialog(e) {
    const dialog = this.shadowRoot.querySelector('#app-launch-confirmation-dialog');
    dialog.show();
  }

  /**
   * Open a SSH dialog.
   */
  _openSSHDialog() {
    const dialog = this.shadowRoot.querySelector('#ssh-dialog');
    dialog.show();
  }

  /**
   * Open a VNC dialog.
   */
  _openVNCDialog() {
    const dialog = this.shadowRoot.querySelector('#vnc-dialog');
    dialog.show();
  }

  /**
   * Open a XRDP dialog.
   */
  _openXRDPDialog() {
    const dialog = this.shadowRoot.querySelector('#xrdp-dialog');
    dialog.show();
  }

  /**
   * Open a Tensorboard dialog for path input.
   */
  _openTensorboardDialog() {
    const dialog = this.shadowRoot.querySelector('#tensorboard-dialog');
    dialog.show();
  }

  /**
   * Close a Tensorboard dialog.
   */
  _hideTensorboardDialog() {
    const dialog = this.shadowRoot.querySelector('#tensorboard-dialog');
    dialog.hide();
  }

  /**
   * add Tensorboard path and dispatch the event
   */

  async _addTensorboardPath(e) {
    this.tensorboardPath = this.shadowRoot.querySelector('#tensorboard-path').value;
    const button = e.target;
    button.setAttribute('disabled', true);
    try {
      const port = null;
      const appName = this.appController['app-name'];
      const sessionUuid = this.appController['session-uuid'];
      const urlPostfix = this.appController['url-postfix'];
      this.indicator = await globalThis.lablupIndicator.start();
      this.indicator.set(50, 'Shutdown TensorBoard instance if exist...');
      await globalThis.backendaiclient.shutdown_service(sessionUuid, 'tensorboard');
      this.indicator.set(70, 'Clean up TensorBoard proxy...');
      await this._close_wsproxy(sessionUuid, 'tensorboard');
      this.indicator.set(100, 'Proxy is ready.');
      // if tensorboard path is empty, --logdir will be '/home/work/logs'
      this.tensorboardPath = this.tensorboardPath === '' ? '/home/work/logs' : this.tensorboardPath;
      const path: Record<string, unknown> = {'--logdir': this.tensorboardPath};
      this._open_wsproxy(sessionUuid, appName, port, null, path).then(async (response) => {
        await this._connectToProxyWorker(response.url, urlPostfix);
        this._hideAppLauncher();
        this._hideTensorboardDialog();
        button.removeAttribute('disabled');
        setTimeout(() => {
          globalThis.open(response.url + urlPostfix, '_blank');
          console.log(appName + ' proxy loaded: ');
          console.log(sessionUuid);
        }, 1000);
      });
    } catch (e) {
      button.removeAttribute('disabled');
    }
  }

  /**
   * Open a guide for terminal
   */
  _openTerminalGuideDialog() {
    const dialog = this.shadowRoot.querySelector('#terminal-guide');
    dialog.show();
  }

  /**
   * Dynamically add Do not show Option
   */
  _createDonotShowOption() {
    const dialog = this.shadowRoot.querySelector('#terminal-guide');
    const lastChild = dialog.children[dialog.children.length - 1];
    const div: HTMLElement = document.createElement('div');
    div.setAttribute('class', 'horizontal layout flex center');

    const checkbox = document.createElement('mwc-checkbox');
    checkbox.setAttribute('id', 'hide-guide');
    const checkboxMsg = document.createElement('span');
    checkboxMsg.innerHTML = `${_text('dialog.hide.DonotShowThisAgain')}`;

    div.appendChild(checkbox);
    div.appendChild(checkboxMsg);
    lastChild.appendChild(div);
  }

  /**
   * Adjust port number in range of the starting number of port to the last number of the port.
   *
   * @param {Event} e -
   */
  _adjustPreferredAppPortNumber(e) {
    const preferredPortNumber = e.target.value;
    const defaultPreferredPortNumber = 10250;
    const minPortNumber = 1025;
    const maxPortNumber = 65534;
    if (preferredPortNumber) {
      if (preferredPortNumber < minPortNumber || preferredPortNumber > maxPortNumber) {
        this.shadowRoot.querySelector('#app-port').value = defaultPreferredPortNumber;
      }
    } else {
      this.shadowRoot.querySelector('#app-port').value = defaultPreferredPortNumber;
    }
  }

  /**
   * Dynamically add Web Terminal Guide Carousel
   */
  _createTerminalGuide() {
    const dialog = this.shadowRoot.querySelector('#terminal-guide');
    const content = dialog.children[1];
    const div: HTMLElement = document.createElement('div');
    div.setAttribute('class', 'vertical layout flex');
    let lang = globalThis.backendaioptions.get('current_language');
    // if current_language is OS default, then link to English docs
    if (!['en', 'ko', 'ru', 'fr', 'mn', 'id'].includes(lang)) {
      lang = 'en';
    }
    div.innerHTML = `
      <macro-carousel pagination navigation selected="0" auto-focus reduced-motion disable-drag>
        <article class="slide vertical layout center">
          <span class="flex" style="background-image:url(/resources/images/web-terminal-guide-1.png); border:none;">
            <span class="keyboard">Ctrl</span>
            <span class="keyboard invert">+</span>
            <span class="keyboard one-key">B</span>
          </span>
          <p>${_text('webTerminalUsageGuide.CopyGuideOne')}</p>
        </article>
        <article class="slide vertical layout center">
          <span style="background-image:url(/resources/images/web-terminal-guide-2.png);"></span>
          <p>${_text('webTerminalUsageGuide.CopyGuideTwo')}</p>
        </article>
        <article class="slide vertical layout center">
          <span style="background-image:url(/resources/images/web-terminal-guide-3.png);"></span>
          <p>${_text('webTerminalUsageGuide.CopyGuideThree')}</p>
        </article>
        <article class="slide vertical layout center">
          <span style="background-image:url(/resources/images/web-terminal-guide-4.png);">
            <span class="keyboard">Ctrl</span>
            <span class="keyboard invert">+</span>
            <span class="keyboard one-key">B</span>
          </span>
          <div class="flex layout center-justified vertical center">
            <p>${_text('webTerminalUsageGuide.CopyGuideFour')}</p>
            <a href="https://console.docs.backend.ai/${lang}/latest/sessions_all/sessions_all.html#advanced-web-terminal-usage"
               target="_blank" style="width:100%;text-align:right;">
              <p>${_text('webTerminalUsageGuide.LearnMore')}</p>
            </a>
          </div>
        </article>
      </macro-carousel>`;
    content.appendChild(div);
  }

  _toggleChkOpenToPublic() {
    const checkbox = this.shadowRoot.querySelector('#chk-open-to-public');
    const allowedClientIpsContainer = this.shadowRoot.querySelector('#allowed-client-ips-container');
    if (!checkbox || !allowedClientIpsContainer) return;
    if (checkbox.checked) {
      allowedClientIpsContainer.style.display = 'block';
    } else {
      allowedClientIpsContainer.style.display = 'none';
    }
  }

  render() {
    // language=HTML
    return html`
      <backend-ai-dialog id="app-dialog" fixed backdrop narrowLayout>
        <div slot="title" class="horizontal layout center">
          <span>App</span>
        </div>
        <div slot="content">
          <div style="padding:15px 0;" class="horizontal layout wrap center start-justified">
            ${this.appSupportList.map((item) => html`
              ${item.category === 'divider' ? html`
                <h3 style="width:100%;padding-left:15px;border-bottom:1px solid #ccc;">${item.title}</h3>
              ` : html`
                <div class="vertical layout center center-justified app-icon">
                  <mwc-icon-button class="fg apps green" .app="${item.name}" .app-name="${item.name}"
                                   .url-postfix="${item.redirect}"
                                   @click="${(e) => this._runThisAppWithConfirmationIfNeeded(e)}">
                    <img src="${item.src}"/>
                  </mwc-icon-button>
                  <span class="label">${item.title}</span>
                </div>`}
            `)}
          </div>
          <div style="padding:10px 20px 15px 20px">
            ${globalThis.isElectron || !this.openPortToPublic ? `` : html`
              <div class="horizontal layout center">
                <mwc-checkbox id="chk-open-to-public" style="margin-right:0.5em;"
                              @change="${this._toggleChkOpenToPublic}"></mwc-checkbox>
                ${_t('session.OpenToPublic')}
              </div>
              <div class="horizontal layout center" id="allowed-client-ips-container">
                ${_t('session.AllowedClientIps')}
                <mwc-textfield id="allowed-client-ips" style="margin-left:1em;" helperPersistent
                               .helper="(${_t('session.CommaSeparated')})"></mwc-textfield>
              </div>
            `}
            <div class="horizontal layout center">
              <mwc-checkbox id="chk-preferred-port" style="margin-right:0.5em;"></mwc-checkbox>
              ${_t('session.TryPreferredPort')}
              <mwc-textfield id="app-port" type="number" no-label-float value="10250"
                             min="1025" max="65534" style="margin-left:1em;width:90px;"
                             @change="${(e) => this._adjustPreferredAppPortNumber(e)}"></mwc-textfield>
            </div>
          </div>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="ssh-dialog" fixed backdrop>
        <span slot="title">SSH / SFTP connection</span>
        <div slot="content" style="padding:15px;">
          <div style="padding:15px 0;">${_t('session.SFTPDescription')}</div>
          <section class="vertical layout wrap start start-justified">
            <h4>${_t('session.ConnectionInformation')}</h4>
            <div><span>SSH URL:</span> <a href="ssh://127.0.0.1:${this.sshPort}">ssh://127.0.0.1:${this.sshPort}</a>
            </div>
            <div><span>SFTP URL:</span> <a href="sftp://127.0.0.1:${this.sshPort}">sftp://127.0.0.1:${this.sshPort}</a>
            </div>
            <div><span>Port:</span> ${this.sshPort}</div>
          </section>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <a id="sshkey-download-link" style="margin-top:15px;width:100%;" href="">
            <mwc-button unelevated fullwidth>${_t('DownloadSSHKey')}</mwc-button>
          </a>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="tensorboard-dialog" fixed>
        <span slot="title">${_t('session.TensorboardPath')}</span>
        <div slot="content" class="vertical layout">
          <div>${_t('session.InputTensorboardPath')}</div>
          <mwc-textfield id="tensorboard-path" value="${_t('session.DefaultTensorboardPath')}"></mwc-textfield>
        </div>
        <div slot="footer" class="horizontal end-justified center flex layout">
          <mwc-button unelevated fullwidth
              icon="rowing" class="bg green" @click="${(e) => this._addTensorboardPath(e)}">
            ${_t('session.UseThisPath')}
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="argument-dialog" fixed>
        <span slot="title">${_t('session.Arguments')}</span>
        <div slot="content" class="vertical layout" style="padding:15px 10px;">
          <div>${_t('session.ModifyArguments')}</div>
          <mwc-textfield value=""></mwc-textfield>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button unelevated fullwidth class="fg apps green" @click="${(e) => this._addTensorboardPath(e)}">
            ${_t('session.UseThisArguments')}
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="vnc-dialog" fixed backdrop>
        <span slot="title">${_t('session.VNCconnection')}</span>
        <div slot="content" style="padding:15px;">
          <div style="padding:15px 0;">${_t('session.UseYourFavoriteVNCApp')}</div>
          <section class="vertical layout wrap start start-justified">
            <h4>${_t('session.ConnectionInformation')}</h4>
            <div><span>VNC URL:</span> <a href="ssh://127.0.0.1:${this.vncPort}">vnc://127.0.0.1:${this.vncPort}</a>
            </div>
          </section>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="xrdp-dialog" fixed backdrop>
        <span slot="title">${_t('session.XRDPconnection')}</span>
        <div slot="content" style="padding:15px;">
          <div style="padding:15px 0;">${_t('session.UseYourFavoriteMSTSCApp')}</div>
          <section class="vertical layout wrap start start-justified">
            <h4>${_t('session.ConnectionInformation')}</h4>
            <div><span>RDP URL:</span> <a href="rdp://127.0.0.1:${this.xrdpPort}">rdp://127.0.0.1:${this.xrdpPort}</a>
            </div>
          </section>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="app-launch-confirmation-dialog" warning fixed backdrop>
        <span slot="title">${_t('session.applauncher.AppMustBeRun')}</span>
        <div slot="content" class="vertical layout">
          <p>${_t('session.applauncher.AppMustBeRunDialog')}</p>
          <p>${_t('dialog.ask.DoYouWantToProceed')}</p>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
            raised
            id="app-launch-confirmation-button"
            icon="rowing"
            label="${_t('session.applauncher.ConfirmAndRun')}"
            fullwidth
            @click="${() => this._runApp(this.appController)}">
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="terminal-guide" fixed backdrop>
        <span slot="title">${_t('webTerminalUsageGuide.CopyGuide')}</span>
        <div slot="content"></div>
        <div slot="footer"></div>
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-app-launcher': BackendAiAppLauncher;
  }
}
