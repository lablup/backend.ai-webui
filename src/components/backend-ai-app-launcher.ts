/**
 @license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
 */
import {
  IronFlex,
  IronFlexAlignment,
} from '../plastics/layout/iron-flex-layout-classes';
import BackendAIDialog from './backend-ai-dialog';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import { default as PainKiller } from './backend-ai-painkiller';
import './lablup-expansion';
import '@material/mwc-button';
import { Checkbox } from '@material/mwc-checkbox';
import '@material/mwc-icon-button';
import { TextField } from '@material/mwc-textfield';
import { css, CSSResultGroup, html } from 'lit';
import {
  get as _text,
  translate as _t,
  translateUnsafeHTML as _tr,
} from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';
import 'macro-carousel';

/**
 Backend.AI App Launcher

 Example:

 <backend-ai-app-launcher id="app-launcher"></backend-ai-app-launcher>

 @group Backend.AI Web UI
 @element backend-ai-app-launcher
 */

@customElement('backend-ai-app-launcher')
export default class BackendAiAppLauncher extends BackendAIPage {
  @property({ type: Boolean, reflect: true }) active = true;
  @property({ type: String }) condition = 'running';
  @property({ type: Object }) jobs = Object();
  @property({ type: Object }) controls = Object();
  @property({ type: Array }) appSupportList;
  @property({ type: Array }) preOpenedPortList;
  @property({ type: Array }) appSupportOption;
  @property({ type: Object }) appTemplate = Object();
  @property({ type: Object }) imageInfo = Object();
  @property({ type: Array }) _selected_items = [];
  @property({ type: Boolean }) refreshing = false;
  @property({ type: Object }) notification = Object();
  @property({ type: Object }) refreshTimer = Object();
  @property({ type: Object }) kernel_labels = Object();
  @property({ type: Object }) indicator = Object();
  @property({ type: String }) sshHost = '127.0.0.1';
  @property({ type: String }) sshPort = '';
  @property({ type: Number }) vncPort = 0;
  @property({ type: Number }) xrdpPort = 0;
  @property({ type: String }) mountedVfolderName = '';
  @property({ type: Number }) vscodeDesktopPort = 0;
  @property({ type: String }) tensorboardPath = '';
  @property({ type: String }) endpointURL = '';
  @property({ type: Boolean }) isPathConfigured = false;
  @property({ type: Array }) appLaunchBeforeTunneling = [
    'nniboard',
    'mlflow-ui',
  ];
  @property({ type: Object }) appController = Object();
  @property({ type: Boolean }) openPortToPublic = false;
  @property({ type: Boolean }) allowPreferredPort = false;
  @property({ type: Array }) appOrder;
  @property({ type: Object }) appEnvs = Object();
  @property({ type: Object }) appArgs = Object();
  @property({ type: String }) vscodeDesktopPassword = '';
  @query('#app-dialog') dialog!: BackendAIDialog;
  @query('#app-port') appPort!: TextField;
  @query('#custom-subdomain') customSubdomain!: TextField;
  @query('#chk-open-to-public') checkOpenToPublic!: Checkbox;
  @query('#chk-preferred-port') checkPreferredPort!: Checkbox;
  @query('#force-use-v1-proxy') forceUseV1Proxy!: Checkbox;
  @query('#force-use-v2-proxy') forceUseV2Proxy!: Checkbox;
  @query('#app-launch-confirmation-dialog')
  appLaunchConfirmationDialog!: BackendAIDialog;
  @query('#ssh-dialog') sshDialog!: BackendAIDialog;
  @query('#tensorboard-dialog') tensorboardDialog!: BackendAIDialog;
  @query('#terminal-guide') terminalGuideDialog!: BackendAIDialog;
  @query('#vnc-dialog') vncDialog!: BackendAIDialog;
  @query('#xrdp-dialog') xrdpDialog!: BackendAIDialog;
  @query('#vscode-desktop-dialog') vscodeDesktopDialog!: BackendAIDialog;

  constructor() {
    super();
    this.appSupportList = [];
    this.preOpenedPortList = [];
    this.appSupportOption = [];
  }

  static get styles(): CSSResultGroup {
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

        mwc-icon-button {
          color: var(--general-button-background-color);
        }

        mwc-icon-button.sftp-session-connection-copy {
          --mdc-icon-size: 20px;
        }

        #ssh-dialog {
          --component-width: 375px;
        }

        .app-icon {
          margin-left: 15px;
          margin-right: 5px;
          margin-bottom: 15px;
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

        #vscode-desktop-dialog {
          --component-width: 450px;
        }

        #allowed-client-ips-container {
          margin-left: 2em;
          margin-bottom: 1em;
          display: none;
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

        #collapsible-btn {
          background: none;
          border: none;
          padding: 10px 0px;
          cursor: pointer;
          font-size: 0.9rem;
          font-family: Ubuntu;
          color: #0000ee;
          font-weight: 500;
        }

        #collapsible-btn:hover {
          color: var(--general-button-background-color);
        }

        #expandable-desc {
          // default height for 3line ellpsis
          height: auto;
          max-height: 83px;
          overflow-y: hidden;
        }

        #preopen-ports-expansion {
          --expansion-header-font-size: 1.17em;
          --expansion-header-padding: 0 0 0 15px;
          --expansion-right-icon-margin: 0 10px 0 0;
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
          font-family: Menlo, Courier, 'Courier New';
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

        .ssh-connection-example {
          display: flex;
          background-color: rgba(230, 230, 230, 1);
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 5px;
        }

        @media screen and (max-width: 810px) {
          #terminal-guide {
            --component-width: calc(100% - 50px);
          }
        }
      `,
    ];
  }

  firstUpdated() {
    this.imageInfo = globalThis.backendaimetadata.imageInfo;
    this.kernel_labels = globalThis.backendaimetadata.kernel_labels;
    document.addEventListener(
      'backend-ai-metadata-image-loaded',
      () => {
        this.imageInfo = globalThis.backendaimetadata.imageInfo;
        this.kernel_labels = globalThis.backendaimetadata.kernel_labels;
      },
      { once: true },
    );
    this._initializeAppTemplate();
    this.refreshTimer = null;
    // add WebTerminalGuide UI dynamically
    this._createTerminalGuide();
    // add DonotShowOption dynamically
    this._createDonotShowOption();
    this.notification = globalThis.lablupNotification;
    const checkbox = this.shadowRoot?.querySelector('#hide-guide');
    checkbox?.addEventListener('change', (event) => {
      if (!(event.target as Checkbox).checked) {
        localStorage.setItem('backendaiwebui.terminalguide', 'true');
      } else {
        localStorage.setItem('backendaiwebui.terminalguide', 'false');
      }
    });
    document.addEventListener(
      'read-ssh-key-and-launch-ssh-dialog',
      (e: any) => {
        if (e.detail) {
          this._readSSHKey(e.detail.sessionUuid);
          this.sshPort = e.detail.port;
          this.sshHost = e.detail.host;
          this.mountedVfolderName = e.detail.mounted;
          this._openSSHDialog();
        }
      },
    );
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
  }

  _initializeAppTemplate() {
    fetch('resources/app_template.json')
      .then((response) => response.json())
      .then((json) => {
        this.appTemplate = json.appTemplate;
        const apps = Object.keys(this.appTemplate);
        apps.sort((a, b) =>
          this.appTemplate[a][0].category > this.appTemplate[b][0].category
            ? 1
            : -1,
        );
        this.appOrder = apps;
      });
  }

  /**
   * Send a request with a get method.
   *
   * @param {Request} rqst : request object
   */
  async sendRequest(rqst) {
    let resp;
    let body;
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
      } else if (
        contentType.startsWith('application/json') ||
        contentType.startsWith('application/problem+json')
      ) {
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
   * When `sessionUuid` is given, this will return versioned proxy url
   * by using the session's resource group (scaling group).
   *
   * @param {string} sessionUuid: session's UUID
   * @return {string} Proxy URL
   */
  async _getProxyURL(sessionUuid: string) {
    let url = 'http://127.0.0.1:5050/';
    if (
      globalThis.__local_proxy !== undefined &&
      globalThis.__local_proxy.url != undefined
    ) {
      url = globalThis.__local_proxy.url;
    } else if (globalThis.backendaiclient._config.proxyURL !== undefined) {
      url = globalThis.backendaiclient._config.proxyURL;
    }
    if (sessionUuid) {
      const wsproxyVersion = await this._getWSProxyVersion(sessionUuid);
      if (wsproxyVersion !== 'v1') {
        url = new URL(`${wsproxyVersion}/`, url).href;
      }
    }
    return url;
  }

  /**
   * Get the wsproxy version.
   * The wsproxy version should be determined dynamically since
   * it can be configurable per resource group.
   *
   * @param {string} sessionUuid : session's UUID
   * @return {string} wsproxy version
   */
  async _getWSProxyVersion(sessionUuid) {
    if (globalThis.backendaiwebui.debug === true) {
      if (this.forceUseV1Proxy.checked) return 'v1';
      else if (this.forceUseV2Proxy.checked) return 'v2';
    }

    const kInfo = await globalThis.backendaiclient.computeSession.get(
      ['scaling_group'],
      sessionUuid,
    );
    const scalingGroupId = kInfo.compute_session.scaling_group;
    const groupId = globalThis.backendaiclient.current_group_id();
    const wsproxyVersion = globalThis.isElectron
      ? 'v1'
      : (
          await globalThis.backendaiclient.scalingGroup.getWsproxyVersion(
            scalingGroupId,
            groupId,
          )
        ).wsproxy_version;
    return wsproxyVersion;
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
    this.controls = controls;
    const sessionUuid = controls['session-uuid'];
    const accessKey = controls['access-key'];
    const appServices = controls['app-services'];
    const mode = controls['mode'];
    const appServicesOption: Record<string, unknown> =
      'app-services-option' in controls ? controls['app-services-option'] : {};
    const servicePorts = controls['service-ports'];
    if ('runtime' in controls) {
      const param: Record<string, unknown> = {};
      param['mode'] = mode;
      param['session-uuid'] = sessionUuid;
      param['app-name'] = controls['runtime'];
      param['url-postfix'] = '';
      if ('filename' in controls) {
        param['file-name'] = controls['filename'];
      }
      if (param['app-name'] === 'jupyter') {
        param['url-postfix'] = '&redirect=/notebooks/' + param['file-name'];
      }
      if ('arguments' in controls) {
        param['args'] = controls['arguments'];
      }
      return this._runAppWithParameters(param);
    }
    this.preOpenedPortList = [];
    const preOpenAppNameList = servicePorts
      ?.filter((item) => item.protocol === 'preopen')
      .map((item) => item.name);
    preOpenAppNameList?.forEach((elm) => {
      this.preOpenedPortList.push({
        name: elm,
        title: elm,
        // TODO: change image according to the connected app.
        src: '/resources/icons/default_app.svg',
      });
    });
    const filteredAppServices =
      appServices?.filter((item) => !preOpenAppNameList?.includes(item)) ??
      appServices;
    this.appSupportList = [];
    if (!filteredAppServices?.includes('ttyd')) {
      this.appSupportList.push({
        // Force push terminal
        name: 'ttyd',
        title: 'Console',
        category: '0.Default',
        redirect: '',
        src: './resources/icons/terminal.svg',
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
    filteredAppServices.forEach((elm) => {
      if (!(elm in this.appTemplate)) {
        this.appTemplate[elm] = [];
        this.appTemplate[elm].push({
          name: elm,
          title: elm,
          category: '99.',
          redirect: '',
          src: './resources/icons/default_app.svg',
        });
      }
    });
    filteredAppServices.sort((a, b) =>
      this.appTemplate[a][0].category > this.appTemplate[b][0].category
        ? 1
        : -1,
    );
    let interText = '';
    if (Object.keys(appServicesOption).length > 0) {
      this.appSupportOption = appServicesOption;
    }
    filteredAppServices.forEach((elm) => {
      if (elm in this.appTemplate) {
        if (elm !== 'sshd' || (elm === 'sshd' && globalThis.isElectron)) {
          if (interText !== this.appTemplate[elm][0].category) {
            this.appSupportList.push({
              name: this.appTemplate[elm][0].category.substring(2),
              title: this.appTemplate[elm][0].category.substring(2),
              category: 'divider',
              redirect: '',
              src: '',
            });
            interText = this.appTemplate[elm][0].category;
          }
          this.appTemplate[elm].forEach((app) => {
            this.appSupportList.push(app);
          });
        }
      } else {
        if (!['ttyd', 'ipython'].includes(elm)) {
          // They are default apps from Backend.AI agent.
          this.appSupportList.push({
            name: elm,
            title: elm,
            category: 'Default',
            redirect: '',
            src: './resources/icons/default_app.svg',
          });
        }
      }
    });

    if (
      globalThis.backendaiclient.supports('local-vscode-remote-connection') &&
      globalThis.isElectron &&
      !filteredAppServices.includes('vscode-desktop')
    ) {
      const insertAfterIndex = this.appSupportList.findIndex(
        (item) => item.name === 'vscode',
      );
      this.appSupportList.splice(insertAfterIndex + 1, 0, {
        name: 'vscode-desktop',
        title: 'Visual Studio Code (Desktop)',
        category: '2.Development',
        redirect: '',
        src: './resources/icons/vscode.svg',
      });
    }
    this.openPortToPublic = globalThis.backendaiclient._config.openPortToPublic;
    this.allowPreferredPort =
      globalThis.backendaiclient._config.allowPreferredPort;
    this._toggleChkOpenToPublic();
    this.dialog.setAttribute('session-uuid', sessionUuid);
    this.dialog.setAttribute('access-key', accessKey);
    this.dialog.show();
    return;
  }

  /**
   * Hide the app launcher.
   */
  _hideAppLauncher() {
    this.dialog.hide();
  }

  async _resolveV1ProxyUri(
    sessionUuid: string,
    app: string,
  ): Promise<string | undefined> {
    const param = {
      endpoint: globalThis.backendaiclient._config.endpoint,
    };
    if (globalThis.backendaiclient._config.connectionMode === 'SESSION') {
      param['mode'] = 'SESSION';
      if (globalThis.backendaiclient._loginSessionId) {
        param['auth_mode'] = 'header';
        param['session'] = globalThis.backendaiclient._loginSessionId;
      } else {
        param['auth_mode'] = 'cookie';
        param['session'] = globalThis.backendaiclient._config._session_id;
      }
    } else {
      param['mode'] = 'API';
      param['access_key'] = globalThis.backendaiclient._config.accessKey;
      param['secret_key'] = globalThis.backendaiclient._config.secretKey;
    }
    param['api_version'] = globalThis.backendaiclient.APIMajorVersion;
    if (globalThis.isElectron && globalThis.__local_proxy.url === undefined) {
      this.indicator.end();
      this.notification.text = _text('session.launcher.ProxyNotReady');
      this.notification.show();
      return;
    }
    const proxyURL = await this._getProxyURL(sessionUuid);
    const rqst = {
      method: 'PUT',
      body: JSON.stringify(param),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      uri: new URL('conf', proxyURL).href,
    };
    this.indicator.set(20, _text('session.launcher.SettingUpProxyForApp'));
    const response = await this.sendRequest(rqst);
    if (response === undefined) {
      this.indicator.end();
      this.notification.text = _text(
        'session.launcher.ProxyConfiguratorNotResponding',
      );
      this.notification.show();
      return;
    }
    const token = response.token;
    return new URL(`proxy/${token}/${sessionUuid}/add?app=${app}`, proxyURL)
      .href;
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
  async _resolveV2ProxyUri(
    sessionUuid: string,
    app: string,
    port: number | null = null,
    envs: Record<string, unknown> | null = null,
    args: Record<string, unknown> | null = null,
  ): Promise<string | undefined> {
    const loginSessionToken = globalThis.backendaiclient._config._session_id;
    const tokenResponse =
      await globalThis.backendaiclient.computeSession.startService(
        loginSessionToken,
        sessionUuid,
        app,
        port,
        envs,
        args,
      );
    if (tokenResponse === undefined) {
      this.indicator.end();
      this.notification.text = _text(
        'session.launcher.ProxyConfiguratorNotResponding',
      );
      this.notification.show();
      return;
    }
    const token = tokenResponse.token;
    return new URL(
      `v2/proxy/${token}/${sessionUuid}/add?app=${app}`,
      tokenResponse.wsproxy_addr,
    ).href;
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
  async _open_wsproxy(
    sessionUuid,
    app = 'jupyter',
    port: number | null = null,
    envs: Record<string, unknown> | null = null,
    args: Record<string, unknown> | null = null,
  ) {
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      return false;
    }

    const kInfo = await globalThis.backendaiclient.computeSession.get(
      ['scaling_group', 'service_ports'],
      sessionUuid,
    );
    if (kInfo === undefined) {
      this.indicator.end();
      this.notification.text = _text('session.CreationFailed'); // TODO: Change text

      this.notification.show();
      return Promise.resolve(false);
    }
    const servicePortInfo = JSON.parse(
      kInfo.compute_session.service_ports,
    ).find(({ name }) => name === app);
    if (servicePortInfo === undefined) {
      this.indicator.end();
      this.notification.text = _text('session.CreationFailed'); // TODO: Change text
      if (app !== 'vscode-desktop') {
        this.notification.show();
      }
      return Promise.resolve(false);
    }

    // Apply v1 when executing in electron mode
    const wsproxyVersion = await this._getWSProxyVersion(sessionUuid);
    let uri =
      wsproxyVersion == 'v1'
        ? await this._resolveV1ProxyUri(sessionUuid, app)
        : await this._resolveV2ProxyUri(sessionUuid, app, null, envs, args);
    if (!uri) {
      this.indicator.end();
      return Promise.resolve(false);
    }
    const allowedClientIps = (
      this.shadowRoot?.querySelector('#allowed-client-ips') as TextField
    )?.value;
    let openToPublic = false;
    if (this.checkOpenToPublic == null) {
      // Null or undefined check. When user click console button without app launcher dialog, it will be undefined.
    } else {
      openToPublic = this.checkOpenToPublic.checked;
      this.checkOpenToPublic.checked = false;
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
    if (this.customSubdomain?.value) {
      uri = uri + '&subdomain=' + encodeURI(this.customSubdomain.value);
    }
    if (servicePortInfo.is_inference) {
      uri = uri + '&is_inference=true';
    }
    uri += '&protocol=' + (servicePortInfo.protocol || 'tcp');
    this.indicator.set(50, _text('session.launcher.AddingKernelToSocketQueue'));
    const rqst_proxy = {
      method: 'GET',
      app: app,
      uri: uri,
    };
    return this.sendRequest(rqst_proxy).catch((err) => {
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
      } else {
        this.notification.text = PainKiller.relieve(
          _text('session.launcher.FailedToConnectCoordinator'),
        );
      }
      this.notification.show(true, err);
      throw err;
    });
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
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      return false;
    }
    const token = globalThis.backendaiclient._config.accessKey;
    let uri: string | URL = await this._getProxyURL(sessionUuid);
    uri = new URL(`proxy/${token}/${sessionUuid}/delete?app=${app}`, uri);
    if (localStorage.getItem('backendaiwebui.appproxy-permit-key')) {
      uri.searchParams.set(
        'permit_key',
        localStorage.getItem('backendaiwebui.appproxy-permit-key') || '',
      );
      uri = new URL(uri.href);
    }
    const rqst_proxy = {
      method: 'GET',
      app: app,
      uri: uri.href,
      credentials: 'include',
      mode: 'cors',
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
    const mode = param['mode'];
    let args = null;
    let sendAppName = appName;
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
    if (appName === 'ttyd') {
      const isVisible = localStorage.getItem('backendaiwebui.terminalguide');
      if (!isVisible || isVisible === 'true') {
        this._openTerminalGuideDialog();
      }
    }
    if (appName === 'vscode-desktop') {
      this._openVSCodeDesktopDialog();
      return;
    }

    if (
      typeof globalThis.backendaiwsproxy === 'undefined' ||
      globalThis.backendaiwsproxy === null
    ) {
      this._hideAppLauncher();
      this.indicator = await globalThis.lablupIndicator.start();
      let port = null;
      if (globalThis.isElectron && appName === 'sshd') {
        port = globalThis.backendaioptions.get('custom_ssh_port', 0);
        if (port === '0' || port === 0) {
          // setting store does not accept null.
          port = null;
        }
      }
      if (globalThis.isElectron && appName === 'vscode-desktop') {
        port = globalThis.backendaioptions.get('custom_ssh_port', 0);
        if (port === '0' || port === 0) {
          // setting store does not accept null.
          port = null;
        }
        sendAppName = 'sshd';
      }
      this._open_wsproxy(sessionUuid, sendAppName, port, envs, args).then(
        async (response) => {
          if (response.url) {
            if (mode === 'inference') {
              this.indicator.set(100, _text('session.applauncher.Prepared'));
              this.endpointURL = response.proxy;
              delete this.controls.runtime; // Remove runtime option to prevent dangling loop.
              this._showAppLauncher(this.controls);
            } else {
              const appConnectUrl = await this._connectToProxyWorker(
                response.url,
                urlPostfix,
              );
              this.indicator.set(100, _text('session.applauncher.Prepared'));
              setTimeout(() => {
                globalThis.open(
                  appConnectUrl || response.url + urlPostfix,
                  '_blank',
                );
                // console.log(appName + " proxy loaded: ");
                // console.log(sessionUuid);
              }, 1000);
            }
          }
        },
      );
    }
  }

  async _connectToProxyWorker(url, urlPostfix) {
    // Try to get permit key since it is not possible to get it with the
    // redirect request. This is required to reuse the existing port.
    let rqstUrl = new URL(url + urlPostfix);
    if (localStorage.getItem('backendaiwebui.appproxy-permit-key')) {
      rqstUrl.searchParams.set(
        'permit_key',
        localStorage.getItem('backendaiwebui.appproxy-permit-key') || '',
      );
      rqstUrl = new URL(rqstUrl.href);
    }
    const rqstGetPermitKey = {
      method: 'GET',
      uri: rqstUrl.href,
      headers: { Accept: 'application/json' },
    };
    const resp = await this.sendRequest(rqstGetPermitKey);
    if (resp && resp.redirect_url) {
      // Save permit key to local storage if possible.
      const redirectUrl = new URL(resp.redirect_url);
      const permitKey = redirectUrl.searchParams.get('permit_key');
      if (permitKey && permitKey.length > 0) {
        localStorage.setItem('backendaiwebui.appproxy-permit-key', permitKey);
      }

      if (!resp.reuse) {
        // For the new permit, we need to follow the redirect to open the
        // corresponding port.
        const redirectRqst = {
          method: 'GET',
          uri: redirectUrl.href,
          mode: 'no-cors',
          redirect: 'follow',
          credentials: 'include',
        };
        let count = 0;
        while (count < 5) {
          const result = await this.sendRequest(redirectRqst);
          if (
            typeof result === 'object' &&
            'status' in result &&
            [500, 501, 502].includes(result.status)
          ) {
            await this._sleep(1000);
            count = count + 1;
            console.warn(`Retry connect to proxy worker (${count})...`);
          } else {
            count = 6;
          }
        }
      }
    } else {
      // When there is no redirect_url or encountered an error in fetching the
      // permit key.
      rqstUrl = new URL(url + urlPostfix);
      if (localStorage.getItem('backendaiwebui.appproxy-permit-key')) {
        rqstUrl.searchParams.set(
          'permit_key',
          localStorage.getItem('backendaiwebui.appproxy-permit-key') || '',
        );
        rqstUrl = new URL(rqstUrl.href);
      }
      const rqst_proxy = {
        method: 'GET',
        uri: rqstUrl.href,
        mode: 'no-cors',
        redirect: 'follow', // 'manual'
        credentials: 'include',
      };
      let count = 0;
      while (count < 5) {
        const result = await this.sendRequest(rqst_proxy);
        if (
          typeof result === 'object' &&
          'status' in result &&
          [500, 501, 502].includes(result.status)
        ) {
          await this._sleep(1000);
          count = count + 1;
          console.warn(`Retry connect to proxy worker (${count})...`);
        } else {
          count = 6;
        }
      }
    }

    if (localStorage.getItem('backendaiwebui.appproxy-permit-key')) {
      rqstUrl.searchParams.set(
        'permit_key',
        localStorage.getItem('backendaiwebui.appproxy-permit-key') || '',
      );
      rqstUrl = new URL(rqstUrl.href);
    }
    return rqstUrl.href;
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
      this.appController['session-uuid'] =
        controls.getAttribute('session-uuid');
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
    const defaultPreferredPortNumber = 10250;
    let sendAppName = appName;
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

    if (
      typeof globalThis.backendaiwsproxy === 'undefined' ||
      globalThis.backendaiwsproxy === null
    ) {
      this._hideAppLauncher();
      this.indicator = await globalThis.lablupIndicator.start();
      let port;
      if (globalThis.isElectron && appName === 'sshd') {
        port = globalThis.backendaioptions.get('custom_ssh_port', 0);
        if (port === '0' || port === 0) {
          // setting store does not accept null.
          port = null;
        }
      }
      if (globalThis.isElectron && appName === 'vscode-desktop') {
        port = globalThis.backendaioptions.get('custom_ssh_port', 0);
        if (port === '0' || port === 0) {
          // setting store does not accept null.
          port = null;
        }
        sendAppName = 'sshd';
      }
      const userPort =
        this.appPort === null || this.appPort === undefined
          ? defaultPreferredPortNumber
          : parseInt(this.appPort?.value);
      if (
        this.checkPreferredPort !== null &&
        this.checkPreferredPort?.checked &&
        userPort
      ) {
        port = userPort;
      }
      this._open_wsproxy(sessionUuid, sendAppName, port, envs, args).then(
        async (response) => {
          const appConnectUrl = await this._connectToProxyWorker(
            response.url,
            urlPostfix,
          );
          if (appName === 'sshd') {
            this.indicator.set(100, _text('session.applauncher.Prepared'));
            this.sshHost = '127.0.0.1';
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
          } else if (appName === 'vscode-desktop') {
            this.indicator.set(100, _text('session.applauncher.Prepared'));
            this.vscodeDesktopPort = response.port;
            this._readTempPasswd(sessionUuid);
            this._openVSCodeDesktopDialog();
            setTimeout(() => {
              this.indicator.end();
            }, 1000);
          } else if (response.url) {
            this.indicator.set(100, _text('session.applauncher.Prepared'));
            setTimeout(() => {
              globalThis.open(
                appConnectUrl || response.url + urlPostfix,
                '_blank',
              );
              // console.log(appName + " proxy loaded: ");
              // console.log(sessionUuid);
            }, 1000);
          }
        },
      );
    }
  }

  /**
   * Read a SSH key.
   *
   * @param {string} sessionUuid
   */
  async _readSSHKey(sessionUuid) {
    const downloadLinkEl = this.shadowRoot?.querySelector(
      '#sshkey-download-link',
    ) as HTMLAnchorElement;
    const file = '/home/work/id_container';
    const blob = await globalThis.backendaiclient.download_single(
      sessionUuid,
      file,
    );
    // TODO: This blob has additional leading letters in front of key texts.
    //       Manually trim those letters.
    const rawText = await blob.text();
    const index = rawText.indexOf('-----');
    const trimmedBlob = await blob.slice(index, blob.size, blob.type);
    downloadLinkEl.href = globalThis.URL.createObjectURL(trimmedBlob);
    downloadLinkEl.download = 'id_container';
  }

  /**
   * Read temp password
   *
   * @param {string} sessionUuid
   */
  async _readTempPasswd(sessionUuid) {
    const file = '/home/work/.password';
    const blob = await globalThis.backendaiclient.download_single(
      sessionUuid,
      file,
    );
    const rawText = await blob.text();
    this.vscodeDesktopPassword = rawText;
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
    if (
      globalThis.backendaiwsproxy == undefined ||
      globalThis.backendaiwsproxy == null
    ) {
      this.indicator = await globalThis.lablupIndicator.start();
      this._open_wsproxy(sessionUuid, 'ttyd').then(async (response) => {
        const appConnectUrl = await this._connectToProxyWorker(
          response.url,
          '',
        );
        if (response.url) {
          this.indicator.set(100, _text('session.applauncher.Prepared'));
          setTimeout(() => {
            globalThis.open(appConnectUrl || response.url, '_blank');
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _openAppLaunchConfirmationDialog(e) {
    this.appLaunchConfirmationDialog.show();
  }

  /**
   * Open a SSH dialog.
   */
  _openSSHDialog() {
    this.sshDialog.show();
  }

  /**
   * Open a VNC dialog.
   */
  _openVNCDialog() {
    this.vncDialog.show();
  }

  /**
   * Open a XRDP dialog.
   */
  _openXRDPDialog() {
    this.xrdpDialog.show();
  }

  /**
   * Open a Tensorboard dialog for path input.
   */
  _openTensorboardDialog() {
    this.tensorboardDialog.show();
  }

  /**
   * Close a Tensorboard dialog.
   */
  _hideTensorboardDialog() {
    this.tensorboardDialog.hide();
  }

  /**
   * add Tensorboard path and dispatch the event
   */

  async _addTensorboardPath(e) {
    this.tensorboardPath = (
      this.shadowRoot?.querySelector('#tensorboard-path') as TextField
    ).value;
    const button = e.target;
    button.setAttribute('disabled', true);
    try {
      const port = null;
      const appName = this.appController['app-name'];
      const sessionUuid = this.appController['session-uuid'];
      const urlPostfix = this.appController['url-postfix'];
      this.indicator = await globalThis.lablupIndicator.start();
      this.indicator.set(50, 'Shutdown TensorBoard instance if exist...');
      await globalThis.backendaiclient.shutdown_service(
        sessionUuid,
        'tensorboard',
      );
      this.indicator.set(70, 'Clean up TensorBoard proxy...');
      await this._close_wsproxy(sessionUuid, 'tensorboard');
      this.indicator.set(100, 'Proxy is ready.');
      // if tensorboard path is empty, --logdir will be '/home/work/logs'
      this.tensorboardPath =
        this.tensorboardPath === '' ? '/home/work/logs' : this.tensorboardPath;
      const path: Record<string, unknown> = {
        '--logdir': this.tensorboardPath,
      };
      this._open_wsproxy(sessionUuid, appName, port, null, path).then(
        async (response) => {
          const appConnectUrl = await this._connectToProxyWorker(
            response.url,
            urlPostfix,
          );
          this._hideAppLauncher();
          this._hideTensorboardDialog();
          button.removeAttribute('disabled');
          setTimeout(() => {
            globalThis.open(
              appConnectUrl || response.url + urlPostfix,
              '_blank',
            );
            // console.log(appName + ' proxy loaded: ');
            // console.log(sessionUuid);
          }, 1000);
        },
      );
    } catch (e) {
      button.removeAttribute('disabled');
    }
  }

  /**
   * Open a VS Code dialog.
   */
  _openVSCodeDesktopDialog() {
    this.vscodeDesktopDialog.show();
  }

  /**
   * Open a guide for terminal
   */
  _openTerminalGuideDialog() {
    this.terminalGuideDialog.show();
  }

  /**
   * Dynamically add Do not show Option
   */
  _createDonotShowOption() {
    const lastChild =
      this.terminalGuideDialog.children[
        this.terminalGuideDialog.children.length - 1
      ];
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
      if (
        preferredPortNumber < minPortNumber ||
        preferredPortNumber > maxPortNumber
      ) {
        this.appPort.value = defaultPreferredPortNumber.toString();
      }
    } else {
      this.appPort.value = defaultPreferredPortNumber.toString();
    }
  }

  _adjustCustomSubdomain(e) {
    const subdomain = e.target.value;
    this.customSubdomain.value = subdomain;
  }

  /**
   * Dynamically add Web Terminal Guide Carousel
   */
  _createTerminalGuide() {
    const content = this.terminalGuideDialog.children[1];
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
    const allowedClientIpsContainer = this.shadowRoot?.querySelector(
      '#allowed-client-ips-container',
    ) as HTMLDivElement;
    if (!this.checkOpenToPublic || !allowedClientIpsContainer) return;
    if (this.checkOpenToPublic.checked) {
      allowedClientIpsContainer.style.display = 'block';
    } else {
      allowedClientIpsContainer.style.display = 'none';
    }
  }

  _toggleCollapsibleArea(e) {
    const btn = e.target;
    const isFolded =
      btn.textContent.replace(/\s/g, '') ==
      _text('session.Readmore').replace(/\s/g, '');
    const collapsibleArea = this.shadowRoot?.querySelector(
      '#expandable-desc',
    ) as HTMLElement;
    // FIXME: temporally set maxHeight with hardcoded value
    collapsibleArea.style.maxHeight = isFolded ? '100%' : '83px';
    btn.textContent = isFolded
      ? _text('session.Readless')
      : _text('session.Readmore');
  }
  /**
   * Copy SSH Connection Example to Clipboard
   */

  _copySSHConnectionExample(divSelector) {
    const divElement = this.shadowRoot?.querySelector(divSelector);
    if (divElement) {
      const textToCopy = divElement.textContent;

      if (textToCopy.length === 0) {
        this.notification.text = _text(
          'session.applauncher.NoExistingConnectionExample',
        );
        this.notification.show();
      } else {
        if (navigator.clipboard !== undefined) {
          // for Chrome, Safari
          navigator.clipboard.writeText(textToCopy).then(
            () => {
              this.notification.text = _text(
                'session.applauncher.SSHConnectionExampleClipboardCopy',
              );
              this.notification.show();
            },
            (err) => {
              console.error('Could not copy text: ', err);
            },
          );
        } else {
          // other browsers
          const tmpInputElement = document.createElement('input');
          tmpInputElement.type = 'text';
          tmpInputElement.value = textToCopy;

          document.body.appendChild(tmpInputElement);
          tmpInputElement.select();
          document.execCommand('copy');
          document.body.removeChild(tmpInputElement);
        }
      }
    }
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css">
      <backend-ai-dialog id="app-dialog" fixed backdrop narrowLayout>
        <div slot="title" class="horizontal layout center">
          <span>${_t('session.applauncher.App')}</span>
        </div>
        <div slot="content">
          ${
            this.endpointURL !== ''
              ? html`
                  <div
                    style="padding:15px 0;"
                    class="horizontal layout wrap center start-justified"
                  >
                    <span
                      style="font-weight:600;margin-left:20px;margin-right:15px;"
                    >
                      Endpoint URL:
                    </span>
                    <span style="font-family:monospace;">
                      ${this.endpointURL}
                    </span>
                  </div>
                `
              : html``
          }
          <div style="padding:15px 0;" class="horizontal layout wrap center start-justified">
            ${this.appSupportList.map(
              (item) => html`
                ${item.category === 'divider'
                  ? html`
                      <h3
                        style="width:100%;padding-left:15px;border-bottom:1px solid #ccc;"
                      >
                        ${item.title}
                      </h3>
                    `
                  : html`
                      <div
                        class="vertical layout center center-justified app-icon"
                      >
                        <mwc-icon-button
                          class="fg apps green"
                          .app="${item.name}"
                          .app-name="${item.name}"
                          .url-postfix="${item.redirect}"
                          @click="${(e) =>
                            this._runThisAppWithConfirmationIfNeeded(e)}"
                        >
                          <img src="${item.src}" />
                        </mwc-icon-button>
                        <span class="label">${item.title}</span>
                      </div>
                    `}
              `,
            )}
          </div>
          ${
            this.preOpenedPortList.length > 0
              ? html`
                  <lablup-expansion id="preopen-ports-expansion" open>
                    <span slot="title" class="horizontal layout">
                      ${_t('session.launcher.PreOpenPortTitle')}
                    </span>
                    <div
                      style="padding:15px 0;"
                      class="horizontal layout wrap center start-justified"
                    >
                      ${this.preOpenedPortList.map(
                        (item) => html`
                          <div
                            class="vertical layout center center-justified app-icon"
                          >
                            <mwc-icon-button
                              class="fg apps green"
                              .app="${item.name}"
                              .app-name="${item.name}"
                              @click="${(e) =>
                                this._runThisAppWithConfirmationIfNeeded(e)}"
                            >
                              <img src="${item.src}" />
                            </mwc-icon-button>
                            <span class="label">${item.title}</span>
                          </div>
                        `,
                      )}
                    </div>
                  </lablup-expansion>
                `
              : html``
          }
          <div style="padding:10px 20px 15px 20px">
            ${
              globalThis.isElectron || !this.openPortToPublic
                ? ``
                : html`
                    <div class="horizontal layout center">
                      <mwc-checkbox
                        id="chk-open-to-public"
                        style="margin-right:0.5em;"
                        @change="${this._toggleChkOpenToPublic}"
                      ></mwc-checkbox>
                      ${_t('session.OpenToPublic')}
                    </div>
                    <div
                      class="horizontal layout center"
                      id="allowed-client-ips-container"
                    >
                      ${_t('session.AllowedClientIps')}
                      <mwc-textfield
                        id="allowed-client-ips"
                        style="margin-left:1em;"
                        helperPersistent
                        .helper="(${_t('session.CommaSeparated')})"
                      ></mwc-textfield>
                    </div>
                  `
            }
            ${
              this.allowPreferredPort
                ? html`
                    <div
                      id="preferred-app-port-config-box"
                      class="horizontal layout center"
                    >
                      <mwc-checkbox
                        id="chk-preferred-port"
                        style="margin-right:0.5em;"
                      ></mwc-checkbox>
                      ${_t('session.TryPreferredPort')}
                      <mwc-textfield
                        id="app-port"
                        type="number"
                        no-label-float
                        value="10250"
                        min="1025"
                        max="65534"
                        style="margin-left:1em;width:90px;"
                        @change="${(e) =>
                          this._adjustPreferredAppPortNumber(e)}"
                      ></mwc-textfield>
                    </div>
                  `
                : html``
            }
            <div class="horizontal layout center">
            ${
              globalThis.backendaiwebui.debug === true
                ? html`
                    <mwc-checkbox
                      id="force-use-v1-proxy"
                      style="margin-right:0.5em;"
                    ></mwc-checkbox>
                    Force use of V1
                    <mwc-checkbox
                      id="force-use-v2-proxy"
                      style="margin-right:0.5em;"
                    ></mwc-checkbox>
                    Force use of V2
                  `
                : ``
            }
            </div>
          </div>
          <div style="padding:10px 20px 15px 20px">
            ${
              globalThis.backendaiwebui.debug === true
                ? html`
                    <div class="horizontal layout center">
                      <mwc-checkbox
                        id="chk-custom-subdomain"
                        style="margin-right:0.5em;"
                      ></mwc-checkbox>
                      ${_t('session.UseSubdomain')}
                      <mwc-textfield
                        id="custom-subdomain"
                        type="string"
                        style="margin-left:1em;width:90px;"
                        @change="${(e) => this._adjustCustomSubdomain(e)}"
                      ></mwc-textfield>
                    </div>
                  `
                : ``
            }
          </div>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="ssh-dialog" fixed backdrop>
        <span slot="title">SSH / SFTP connection</span>
        <div slot="content">
          <section class="vertical layout wrap start start-justified">
            <div id="expandable-desc">
              <div style="padding:15px 0;">${_t(
                'session.SFTPDescription',
              )}</div>
              <div style="background-color:var(--paper-blue-200);">
                <div style="background-color:var(--paper-blue-400);padding:5px 15px">
                  <span style="font-weight:700;">${_t(
                    'session.ConnectionNotice',
                  )}</span>
                </div>
              <div style="padding:15px;">${_tr(
                'session.SFTPExtraNotification',
              )}</div>
              </div>
            </div>
            <button id="collapsible-btn" @click="${(e) =>
              this._toggleCollapsibleArea(e)}">
              ${_t('session.Readmore')}
            </button>
            <h4>${_t('session.ConnectionInformation')}</h4>
            <div><span>User:</span> work</div>
            <div><span>SSH URL:</span> <a href="ssh://${this.sshHost}:${
              this.sshPort
            }">ssh://${this.sshHost}</a>
            </div>
            <div><span>SFTP URL:</span> <a href="sftp://${this.sshHost}:${
              this.sshPort
            }">sftp://${this.sshHost}</a>
            </div>
            <div><span>Port:</span> ${this.sshPort}</div>
            <h4>${_t('session.ConnectionExample')}</h4>
                <div class="horizontal layout flex monospace ssh-connection-example">
                <span id="sftp-string">
                  sftp -i ./id_container -P ${this.sshPort} work@${
                    this.sshHost
                  } -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null<br/>
                </span>
                <mwc-icon-button
                class="sftp-session-connection-copy"
                icon="content_copy" @click="${() =>
                  this._copySSHConnectionExample('#sftp-string')}">
                </mwc-icon-button>
                </div>
                <div class="horizontal layout flex monospace ssh-connection-example">
                <span id="scp-string">
                  scp -i ./id_container -o StrictHostKeyChecking=no -P ${
                    this.sshPort
                  } -rp /path/to/source work@${this.sshHost}:~/${
                    this.mountedVfolderName
                  }<br/>
                </span>
                <mwc-icon-button
                class="sftp-session-connection-copy"
                icon="content_copy" @click="${() =>
                  this._copySSHConnectionExample('#scp-string')}">
                </mwc-icon-button>
                </div>
                <div class="horizontal layout flex monospace ssh-connection-example">
                <span id="rsync-string">
                  rsync -av -e "ssh -i ./id_container -o StrictHostKeyChecking=no" /path/to/source/ work@${
                    this.sshHost
                  }:~/${this.mountedVfolderName}/<br/>
                </span>
                <mwc-icon-button
                class="sftp-session-connection-copy"
                icon="content_copy" @click="${() =>
                  this._copySSHConnectionExample('#rsync-string')}">
                </mwc-icon-button>
                </div>
          </section>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <a id="sshkey-download-link" style="margin-top:15px;width:100%;" href="">
            <mwc-button unelevated fullwidth>${_t(
              'DownloadSSHKey',
            )}</mwc-button>
          </a>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="tensorboard-dialog" fixed>
        <span slot="title">${_t('session.TensorboardPath')}</span>
        <div slot="content" class="vertical layout">
        <div>${_t('session.InputTensorboardPath')}</div>
          <mwc-textfield id="tensorboard-path" value="${_t(
            'session.DefaultTensorboardPath',
          )}"></mwc-textfield>
        </div>
        <div slot="footer" class="horizontal end-justified center flex layout">
          <mwc-button unelevated fullwidth
              icon="rowing" class="bg green" @click="${(e) =>
                this._addTensorboardPath(e)}">
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
          <mwc-button unelevated fullwidth class="fg apps green" @click="${(
            e,
          ) => this._addTensorboardPath(e)}">
            ${_t('session.UseThisArguments')}
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="vnc-dialog" fixed backdrop>
        <span slot="title">${_t('session.VNCconnection')}</span>
        <div slot="content" style="padding:15px;">
          <div style="padding:15px 0;">${_t(
            'session.UseYourFavoriteVNCApp',
          )}</div>
          <section class="vertical layout wrap start start-justified">
            <h4>${_t('session.ConnectionInformation')}</h4>
            <div><span>VNC URL:</span> <a href="ssh://127.0.0.1:${
              this.vncPort
            }">vnc://127.0.0.1:${this.vncPort}</a>
            </div>
          </section>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="xrdp-dialog" fixed backdrop>
        <span slot="title">${_t('session.XRDPconnection')}</span>
        <div slot="content" style="padding:15px;">
          <div style="padding:15px 0;">${_t(
            'session.UseYourFavoriteMSTSCApp',
          )}</div>
          <section class="vertical layout wrap start start-justified">
            <h4>${_t('session.ConnectionInformation')}</h4>
            <div><span>RDP URL:</span> <a href="rdp://127.0.0.1:${
              this.xrdpPort
            }">rdp://127.0.0.1:${this.xrdpPort}</a>
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
      <backend-ai-dialog id="vscode-desktop-dialog" fixed backdrop>
        <span slot="title">${_t('session.VSCodeRemoteConnection')}</span>
        <div slot="content">
          <div>${_t('session.VSCodeRemoteDescription')}</div>
          <section class="vertical layout wrap start start-justified">
            <h3>${_t('session.ConnectionInformation')}</h4>
            <span>${_t('session.VSCodeRemotePasswordTitle')}:</span>
            <backend-ai-react-copyable-code-text value="${
              this.vscodeDesktopPassword
            }" style="width:max-content;margin-bottom:10px;"></backend-ai-react-copyable-code-text>
            <div class="horizontal wrap layout note" style="background-color:#FFFBE7;width:100%;padding:10px 0px;">
              <p style="margin:auto 10px;">${_t(
                'session.VSCodeRemoteNoticeSSHConfig',
              )}</p>
              <p style="margin:auto 10px;">
                <pre style="white-space:pre-line; margin:10px 10px 0 10px">
                  Host 127.0.0.1
                  &nbsp;&nbsp;StrictHostKeyChecking no
                  &nbsp;&nbsp;UserKnownHostsFile /dev/null
                </pre>
              </p>
            </div>
          </section>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <a id="vscode-link" style="margin-top:15px;width:100%;" href="vscode://vscode-remote/ssh-remote+work@127.0.0.1%3A${
            this.vscodeDesktopPort
          }/home/work">
            <mwc-button unelevated fullwidth>${_t(
              'OpenVSCodeRemote',
            )}</mwc-button>
          </a>
        </div>
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-app-launcher': BackendAiAppLauncher;
  }
}
