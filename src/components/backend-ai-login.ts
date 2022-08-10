/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import 'weightless/button';
import 'weightless/icon';
import 'weightless/card';

import '@material/mwc-button';
import '@material/mwc-icon';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-icon-button';
import '@material/mwc-menu';
import '@material/mwc-select';
import '@material/mwc-textfield';

import '../plastics/lablup-shields/lablup-shields';
import './backend-ai-dialog';
import './backend-ai-signup';
import {default as PainKiller} from './backend-ai-painkiller';

// import * as aiSDK from '../lib/backend.ai-client-es6';
import * as ai from '../lib/backend.ai-client-esm';

import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';
import {BackendAiStyles} from './backend-ai-general-styles';
import {BackendAIPage} from './backend-ai-page';

declare global {
  const ai: any;
}

/**
 Backend.AI Login for GUI Console

 `backend-ai-login` is a login UI / Model to provide both API and session-based login.

 Example:

 <backend-ai-login>
 ... content ...
 </backend-ai-login>

@group Backend.AI Web UI
 */
@customElement('backend-ai-login')
export default class BackendAILogin extends BackendAIPage {
  @property({type: String}) api_key = '';
  @property({type: String}) secret_key = '';
  @property({type: String}) user_id = '';
  @property({type: String}) password = '';
  @property({type: String}) proxy_url = 'http://127.0.0.1:5050/';
  @property({type: String}) api_endpoint = '';
  @property({type: String}) domain_name = '';
  @property({type: String}) default_session_environment = '';
  @property({type: String}) default_import_environment = '';
  @property({type: String}) blockType = '';
  @property({type: String}) blockMessage = '';
  @property({type: String}) connection_mode = 'SESSION';
  @property({type: Number}) login_attempt_limit = 500;
  @property({type: Number}) login_block_time = 180;
  @property({type: String}) user;
  @property({type: String}) email;
  @property({type: Object}) config = Object();
  @property({type: Object}) loginPanel;
  @property({type: Object}) signoutPanel;
  @property({type: Object}) blockPanel;
  @property({type: Boolean}) is_connected = false;
  @property({type: Object}) clientConfig;
  @property({type: Object}) client;
  @property({type: Object}) notification;
  @property({type: Object}) user_groups;
  @property({type: Boolean}) signup_support = false;
  @property({type: Boolean}) allowAnonymousChangePassword = false;
  @property({type: Boolean}) change_signin_support = false;
  @property({type: Boolean}) allow_signout = false;
  @property({type: Boolean}) allow_project_resource_monitor = false;
  @property({type: Boolean}) allow_manual_image_name_for_session = false;
  @property({type: Boolean}) always_enqueue_compute_session = false;
  @property({type: Boolean}) allowSignupWithoutConfirmation = false;
  @property({type: Boolean}) openPortToPublic = false;
  @property({type: Boolean}) maxCPUCoresPerContainer = 64;
  @property({type: Boolean}) maxMemoryPerContainer = 16;
  @property({type: Number}) maxCUDADevicesPerContainer = 16;
  @property({type: Number}) maxCUDASharesPerContainer = 16;
  @property({type: Boolean}) maxShmPerContainer = 2;
  @property({type: Boolean}) maxFileUploadSize = -1;
  @property({type: Boolean}) maskUserInfo = false;
  @property({type: Array}) allow_image_list;
  @property({type: Array}) endpoints;
  @property({type: Object}) logoutTimerBeforeOneMin;
  @property({type: Object}) logoutTimer;

  constructor() {
    super();
    globalThis.backendaiwebui = {};
    this.endpoints = [];
  }

  static get styles(): CSSResultGroup | undefined {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        .warning {
          color: red;
        }

        backend-ai-dialog {
          --component-width: 400px;
          --component-padding: 0;
        }

        fieldset input {
          width: 100%;
          border: 0;
          margin: 15px 0 0 0;
          font: inherit;
          font-size: 16px;
          outline: none;
        }

        mwc-textfield {
          font-family: var(--general-font-family);
          --mdc-theme-primary: black;
          --mdc-text-field-fill-color: rgb(250, 250, 250);
          width: 100%;
        }

        .endpoint-text {
          --mdc-text-field-disabled-line-color: rgba(0, 0, 0, 0.0);
        }

        mwc-icon-button {
          /*color: rgba(0, 0, 0, 0.54); Matched color with above icons*/
          color: var(--paper-blue-600);
          --mdc-icon-size: 24px;
        }

        mwc-icon-button.endpoint-control-button {
          --mdc-icon-size: 16px;
          --mdc-icon-button-size: 24px;
          color: red;
        }

        mwc-menu {
          font-family: var(--general-font-family);
          --mdc-menu-min-width: 400px;
          --mdc-menu-max-width: 400px;
        }

        mwc-list-item[disabled] {
          --mdc-menu-item-height: 30px;
          border-bottom: 1px solid #ccc;
        }

        mwc-button {
          background-image: none;
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-theme-on-primary: var(--general-button-color);
        }

        mwc-button[unelevated] {
          background-image: none;
          --mdc-theme-primary: var(--general-button-background-color);
        }

        mwc-button[outlined] {
          background-image: none;
          --mdc-button-outline-width: 2px;
          --mdc-button-disabled-outline-color: var(--general-button-background-color);
          --mdc-button-disabled-ink-color: var(--general-button-background-color);
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-theme-on-primary: var(--general-button-color);
        }

        h3 small {
          --button-font-size: 12px;
        }

        wl-icon {
          --icon-size: 16px;
          padding: 0;
        }

        .login-input {
          background-color: #FAFAFA;
          border-bottom: 1px solid #ccc;
          height: 50px;
        }

        .login-input mwc-icon {
          margin: 5px 15px 5px 15px;
          color: #737373;
        }

        .login-input input {
          width: 100%;
          background-color: #FAFAFA;
          margin-bottom: 5px;
          font-size: 18px;
          margin-top: 5px;
        }

        #login-title-area {
          height: var(--login-banner-height, 0);
          width: var(--login-banner-width, 0);
          background: var(--login-banner-background, none);
        }

        .login-form {
          position: relative;
        }

        .waiting-animation {
          top: 20%;
          left: 40%;
          position: absolute;
          z-index: 2;
        }

        .sk-folding-cube {
          margin: 20px auto;
          width: 15px;
          height: 15px;
          position: relative;
          margin: auto;
          -webkit-transform: rotateZ(45deg);
          transform: rotateZ(45deg);
        }

        .sk-folding-cube .sk-cube {
          float: left;
          width: 50%;
          height: 50%;
          position: relative;
          -webkit-transform: scale(1.1);
          -ms-transform: scale(1.1);
          transform: scale(1.1);
        }

        .sk-folding-cube .sk-cube:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #3e872d;
          -webkit-animation: sk-foldCubeAngle 2.4s infinite linear both;
          animation: sk-foldCubeAngle 2.4s infinite linear both;
          -webkit-transform-origin: 100% 100%;
          -ms-transform-origin: 100% 100%;
          transform-origin: 100% 100%;
        }

        .sk-folding-cube .sk-cube2 {
          -webkit-transform: scale(1.1) rotateZ(90deg);
          transform: scale(1.1) rotateZ(90deg);
        }

        .sk-folding-cube .sk-cube3 {
          -webkit-transform: scale(1.1) rotateZ(180deg);
          transform: scale(1.1) rotateZ(180deg);
        }

        .sk-folding-cube .sk-cube4 {
          -webkit-transform: scale(1.1) rotateZ(270deg);
          transform: scale(1.1) rotateZ(270deg);
        }

        .sk-folding-cube .sk-cube2:before {
          -webkit-animation-delay: 0.3s;
          animation-delay: 0.3s;
        }

        .sk-folding-cube .sk-cube3:before {
          -webkit-animation-delay: 0.6s;
          animation-delay: 0.6s;
        }

        .sk-folding-cube .sk-cube4:before {
          -webkit-animation-delay: 0.9s;
          animation-delay: 0.9s;
        }

        @-webkit-keyframes sk-foldCubeAngle {
          0%,
          10% {
            -webkit-transform: perspective(140px) rotateX(-180deg);
            transform: perspective(140px) rotateX(-180deg);
            opacity: 0;
          }
          25%,
          75% {
            -webkit-transform: perspective(140px) rotateX(0deg);
            transform: perspective(140px) rotateX(0deg);
            opacity: 1;
          }
          90%,
          100% {
            -webkit-transform: perspective(140px) rotateY(180deg);
            transform: perspective(140px) rotateY(180deg);
            opacity: 0;
          }
        }

        @keyframes sk-foldCubeAngle {
          0%,
          10% {
            -webkit-transform: perspective(140px) rotateX(-180deg);
            transform: perspective(140px) rotateX(-180deg);
            opacity: 0;
          }
          25%,
          75% {
            -webkit-transform: perspective(140px) rotateX(0deg);
            transform: perspective(140px) rotateX(0deg);
            opacity: 1;
          }
          90%,
          100% {
            -webkit-transform: perspective(140px) rotateY(180deg);
            transform: perspective(140px) rotateY(180deg);
            opacity: 0;
          }
        }

        #loading-message {
          margin-left: 10px;
        }

      `];
  }

  firstUpdated() {
    this.loginPanel = this.shadowRoot.querySelector('#login-panel');
    this.signoutPanel = this.shadowRoot.querySelector('#signout-panel');
    this.blockPanel = this.shadowRoot.querySelector('#block-panel');
    this.notification = globalThis.lablupNotification;
    this.endpoints = globalThis.backendaioptions.get('endpoints', []);
  }


  /**
   * Change the signin mode with SESSION or API
   * */
  _changeSigninMode() {
    if (this.change_signin_support === true) {
      if (this.connection_mode == 'SESSION') {
        this.connection_mode = 'API';
        localStorage.setItem('backendaiwebui.connection_mode', 'API');
      } else {
        this.connection_mode = 'SESSION';
        localStorage.setItem('backendaiwebui.connection_mode', 'SESSION');
      }
      this.requestUpdate();
    }
  }

  refreshWithConfig(config) {
    if (typeof config.plugin === 'undefined' || typeof config.plugin.login === 'undefined' || config.plugin.login === '') {
      this._enableUserInput();
    } else {
      import('../plugins/' + config.plugin.login).then(() => {
        console.log('Plugin loaded.');
      }).catch((err) => { // Connection failed
        if (this.loginPanel.open !== true) {
          if (typeof err.message !== 'undefined') {
            this.notification.text = PainKiller.relieve(err.title);
            this.notification.detail = err.message;
          } else {
            this.notification.text = PainKiller.relieve('Plugin loading failed.');
          }
          this.notification.show(false, err);
          this.open();
        } else {
          this.notification.text = PainKiller.relieve('Login failed. Check login information.');
          this.notification.show(false, err);
        }
      });
    }
    if (typeof config.general === 'undefined' || typeof config.general.debug === 'undefined' || config.general.debug === '') {
      globalThis.backendaiwebui.debug = false;
    } else if (config.general.debug === true) {
      globalThis.backendaiwebui.debug = true;
      console.log('Debug flag is set to true');
    }
    if (typeof config.general === 'undefined' || typeof config.general.signupSupport === 'undefined' || config.general.signupSupport === '' || config.general.signupSupport == false) {
      this.signup_support = false;
    } else {
      this.signup_support = true;
      (this.shadowRoot.querySelector('#signup-dialog') as any).active = true;
    }
    if (typeof config.general === 'undefined' || typeof config.general.allowAnonymousChangePassword === 'undefined' || config.general.allowAnonymousChangePassword === '' || config.general.allowAnonymousChangePassword == false) {
      this.allowAnonymousChangePassword = false;
    } else {
      this.allowAnonymousChangePassword = true;
    }
    if (typeof config.general === 'undefined' || typeof config.general.allowChangeSigninMode === 'undefined' || config.general.allowChangeSigninMode === '' || config.general.allowChangeSigninMode == false) {
      this.change_signin_support = false;
    } else {
      this.change_signin_support = true;
    }
    if (typeof config.general === 'undefined' || typeof config.general.allowProjectResourceMonitor === 'undefined' || config.general.allowProjectResourceMonitor === '' || config.general.allowProjectResourceMonitor == false) {
      this.allow_project_resource_monitor = false;
    } else {
      this.allow_project_resource_monitor = true;
    }
    if (typeof config.general === 'undefined' || typeof config.general.allowManualImageNameForSession === 'undefined' || config.general.allowManualImageNameForSession === '' || config.general.allowManualImageNameForSession == false) {
      this.allow_manual_image_name_for_session = false;
    } else {
      this.allow_manual_image_name_for_session = true;
    }
    if (typeof config.general === 'undefined' || typeof config.general.alwaysEnqueueComputeSession === 'undefined' || config.general.alwaysEnqueueComputeSession === '' || config.general.alwaysEnqueueComputeSession == false) {
      this.always_enqueue_compute_session = false;
    } else {
      this.always_enqueue_compute_session = true;
    }
    if (typeof config.resources === 'undefined' || typeof config.resources.openPortToPublic === 'undefined' || config.resources.openPortToPublic === '' || config.resources.openPortToPublic == false) {
      this.openPortToPublic = false;
    } else {
      this.openPortToPublic = true;
    }
    if (typeof config.resources === 'undefined' || typeof config.resources.maxCPUCoresPerContainer === 'undefined' || isNaN(parseInt(config.resources.maxCPUCoresPerContainer))) {
      this.maxCPUCoresPerContainer = 64;
    } else {
      this.maxCPUCoresPerContainer = parseInt(config.resources.maxCPUCoresPerContainer);
    }
    if (typeof config.resources === 'undefined' || typeof config.resources.maxMemoryPerContainer === 'undefined' || isNaN(parseInt(config.resources.maxMemoryPerContainer))) {
      this.maxMemoryPerContainer = 16;
    } else {
      this.maxMemoryPerContainer = parseInt(config.resources.maxMemoryPerContainer);
    }
    if (typeof config.resources === 'undefined' || typeof config.resources.maxCUDADevicesPerContainer === 'undefined' || isNaN(parseInt(config.resources.maxCUDADevicesPerContainer))) {
      this.maxCUDADevicesPerContainer = 16;
    } else {
      this.maxCUDADevicesPerContainer = parseInt(config.resources.maxCUDADevicesPerContainer);
    }
    if (typeof config.resources === 'undefined' || typeof config.resources.maxCUDASharesPerContainer === 'undefined' || isNaN(parseInt(config.resources.maxCUDASharesPerContainer))) {
      this.maxCUDASharesPerContainer = 16;
    } else {
      this.maxCUDASharesPerContainer = parseInt(config.resources.maxCUDASharesPerContainer);
    }
    if (typeof config.resources === 'undefined' || typeof config.resources.maxShmPerContainer === 'undefined' || isNaN(parseFloat(config.resources.maxShmPerContainer))) {
      this.maxShmPerContainer = 2;
    } else {
      this.maxShmPerContainer = parseFloat(config.resources.maxShmPerContainer);
    }
    if (typeof config.resources === 'undefined' || typeof config.resources.maxFileUploadSize === 'undefined' || config.resources.maxFileUploadSize === '') {
      this.maxFileUploadSize = -1;
    } else {
      this.maxFileUploadSize = parseInt(config.resources.maxFileUploadSize);
    }
    if (typeof config.general === 'undefined' || typeof config.general.allowSignout === 'undefined' || config.general.allowSignout === '' || config.general.allowSignout == false) {
      this.allow_signout = false;
    } else {
      this.allow_signout = true;
    }
    if (typeof config.general === 'undefined' || typeof config.general.loginAttemptLimit === 'undefined' || config.general.loginAttemptLimit === '') {
    } else {
      this.login_attempt_limit = parseInt(config.general.loginAttemptLimit);
    }
    if (typeof config.general === 'undefined' || typeof config.general.loginBlockTime === 'undefined' || config.general.loginBlockTime === '') {
    } else {
      this.login_block_time = parseInt(config.general.loginBlockTime);
    }
    if (typeof config.wsproxy === 'undefined' || typeof config.wsproxy.proxyURL === 'undefined' || config.wsproxy.proxyURL === '') {
      this.proxy_url = 'http://127.0.0.1:5050/';
    } else {
      this.proxy_url = config.wsproxy.proxyURL;
    }
    if (typeof config.general === 'undefined' || typeof config.general.apiEndpoint === 'undefined' || config.general.apiEndpoint === '') {
      (this.shadowRoot.querySelector('#id_api_endpoint_container') as any).style.display = 'flex';
      (this.shadowRoot.querySelector('#id_api_endpoint_humanized') as any).style.display = 'none';
    } else {
      this.api_endpoint = config.general.apiEndpoint;
      if (typeof config.general === 'undefined' || typeof config.general.apiEndpointText === 'undefined' || config.general.apiEndpointText === '') {
        (this.shadowRoot.querySelector('#id_api_endpoint_container') as any).style.display = 'flex';
        (this.shadowRoot.querySelector('#id_api_endpoint_humanized') as any).style.display = 'none';
        (this.shadowRoot.querySelector('#endpoint-button') as any).disabled = 'true';
      } else {
        (this.shadowRoot.querySelector('#id_api_endpoint_container') as any).style.display = 'none';
        (this.shadowRoot.querySelector('#id_api_endpoint_humanized') as any).style.display = 'block';
        (this.shadowRoot.querySelector('#id_api_endpoint_humanized') as any).value = config.general.apiEndpointText;
      }
      (this.shadowRoot.querySelector('#id_api_endpoint') as any).disabled = true;
      (this.shadowRoot.querySelector('#id_api_endpoint_humanized') as any).disabled = true;
    }
    if (typeof config.general === 'undefined' || typeof config.general.allowSignupWithoutConfirmation === 'undefined' || config.general.allowSignupWithoutConfirmation === '' || config.general.allowSignupWithoutConfirmation == false) {
      this.allowSignupWithoutConfirmation = false;
    } else {
      this.allowSignupWithoutConfirmation = true;
    }

    if (typeof config.general === 'undefined' || typeof config.general.defaultSessionEnvironment === 'undefined' || config.general.defaultSessionEnvironment === '') {
      this.default_session_environment = '';
    } else {
      this.default_session_environment = config.general.defaultSessionEnvironment;
    }
    if (typeof config.general === 'undefined' || typeof config.general.defaultImportEnvironment === 'undefined' || config.general.defaultImportEnvironment === '') {
      this.default_import_environment = 'index.docker.io/lablup/python:3.8-ubuntu18.04';
    } else {
      this.default_import_environment = config.general.defaultImportEnvironment;
    }
    if (typeof config.environments === 'undefined' || typeof config.environments.allowlist === 'undefined' || config.environments.allowlist === '') {
      this.allow_image_list = [];
    } else {
      this.allow_image_list = config.environments.allowlist.split(',');
    }
    if (typeof config.general === 'undefined' || typeof config.general.maskUserInfo === 'undefined' || config.general.maskUserInfo === '') {
      this.maskUserInfo = false;
    } else {
      this.maskUserInfo = config.general.maskUserInfo;
    }
    const connection_mode: string | null = localStorage.getItem('backendaiwebui.connection_mode');
    if (globalThis.isElectron && connection_mode !== null && connection_mode != '' && connection_mode != '""') {
      if (connection_mode === 'SESSION') {
        this.connection_mode = 'SESSION';
      } else {
        this.connection_mode = 'API';
      }
    } else {
      if (typeof config.general === 'undefined' || typeof config.general.connectionMode === 'undefined' || config.general.connectionMode === '') {
        this.connection_mode = 'SESSION';
      } else {
        if (config.general.connectionMode.toUpperCase() === 'SESSION') {
          this.connection_mode = 'SESSION';
        } else {
          this.connection_mode = 'API';
        }
      }
    }
  }

  /**
   * Open loginPanel.
   * */
  open() {
    if (this.loginPanel.open !== true) {
      this.loginPanel.show();
    }
    if (this.blockPanel.open === true) {
      this.blockPanel.hide();
    }
  }

  /**
  * Close the loginPanel
  * */
  close() {
    if (this.loginPanel.open === true) {
      this.loginPanel.hide();
    }
    if (this.blockPanel.open === true) {
      this.blockPanel.hide();
    }
  }

  /**
   * Show the blockPanel.
   *
   * @param {string} message - block message
   * @param {string} type - block type
   * */
  block(message = '', type = '') {
    this.blockMessage = message;
    this.blockType = type;
    setTimeout(() => {
      if (this.blockPanel.open === false && this.is_connected === false && this.loginPanel.open === false) {
        this.blockPanel.show();
      }
    }, 2000);
  }

  /**
   * Hide the blockPanel.
   * */
  free() {
    this.blockPanel.hide();
  }

  _trimChar(str, char) {
    return str.replace(/^\|+|\|+$/g, '');
  }

  /**
   * Load configuration file from the WebServer when using Session mode.
   *
   * */
  _loadConfigFromWebServer() {
    if (!window.location.href.startsWith(this.api_endpoint)) {
      // Override configs with Webserver's config.
      const webuiEl = document.querySelector('backend-ai-webui');
      if (webuiEl) {
        const fieldsToExclude = [
          'general.apiEndpoint',
          'general.apiEndpointText',
          'general.siteDescription',
          'wsproxy',
        ];
        const webserverConfigURL = new URL('./config.toml', this.api_endpoint).href;
        webuiEl._parseConfig(webserverConfigURL, true).then((config) => {
          fieldsToExclude.forEach((key) => {
            globalThis.backendaiutils.deleteNestedKeyFromObject(config, key);
          });
          const mergedConfig = globalThis.backendaiutils.mergeNestedObjects(webuiEl.config, config);
          webuiEl.config = mergedConfig;
          this.refreshWithConfig(mergedConfig);
        });
      }
    }
  }

  /**
   * Login according to connection_mode and api_endpoint.
   *
   * @param {boolean} showError
   * */
  async login(showError = true) {
    if (this.api_endpoint === '') {
      const api_endpoint: any = localStorage.getItem('backendaiwebui.api_endpoint');
      if (api_endpoint != null) {
        this.api_endpoint = api_endpoint.replace(/^"+|"+$/g, '');
      }
    }
    this.api_endpoint = this.api_endpoint.trim();
    if (this.connection_mode === 'SESSION') {
      if (globalThis.isElectron) {
        this._loadConfigFromWebServer();
      }
      this._connectUsingSession(showError);
    } else if (this.connection_mode === 'API') {
      // this.block(_text('login.PleaseWait'), _text('login.ConnectingToCluster'));
      await this._connectUsingAPI(showError);
    } else {
      this.open();
    }
  }

  async check_login(showError = true) {
    if (this.api_endpoint === '') {
      const api_endpoint: any = localStorage.getItem('backendaiwebui.api_endpoint');
      if (api_endpoint != null) {
        this.api_endpoint = api_endpoint.replace(/^"+|"+$/g, '');
      }
    }
    this.api_endpoint = this.api_endpoint.trim();
    if (this.connection_mode === 'SESSION') {
      if (globalThis.isElectron) {
        this._loadConfigFromWebServer();
      }
      return this._checkLoginUsingSession();
    } else if (this.connection_mode === 'API') {
      return Promise.resolve(false);
    } else {
      return Promise.resolve(false);
    }
  }

  /**
   * Check login status when SESSION mode.
   *
   * @param {boolean} showError
   * */
  async _checkLoginUsingSession(showError = true) {
    if (this.api_endpoint === '') {
      return Promise.resolve(false);
    }
    this.clientConfig = new ai.backend.ClientConfig(
      this.user_id,
      this.password,
      this.api_endpoint,
      'SESSION'
    );
    this.client = new ai.backend.Client(
      this.clientConfig,
      `Backend.AI Console.`,
    );
    return this.client.get_manager_version().then(async ()=>{
      const isLogon = await this.client.check_login();
      return Promise.resolve(isLogon);
    });
  }

  /**
   * Logout current session.
   *
   * @param {boolean} showError
   * */
  async _logoutSession(showError = true) {
    return this.client.logout();
  }

  signout() {
    this.signoutPanel.show();
  }

  /**
   * Show signup dialog. And notify message if API Endpoint is empty.
   * */
  _showSignupDialog() {
    this.api_endpoint = this.api_endpoint.trim();
    if (this.api_endpoint === '') {
      this.notification.text = _text('error.APIEndpointIsEmpty');
      this.notification.show();
      return;
    }
    const signupDialog = this.shadowRoot.querySelector('#signup-dialog');
    signupDialog.endpoint = this.api_endpoint;
    signupDialog.allowSignupWithoutConfirmation = this.allowSignupWithoutConfirmation;
    signupDialog.open();
  }

  _showChangePasswordEmailDialog() {
    this.shadowRoot.querySelector('#change-password-confirm-dialog').show();
  }

  async _sendChangePasswordEmail() {
    const emailEl = this.shadowRoot.querySelector('#password-change-email');
    if (!emailEl.value || !emailEl.validity.valid) return;
    try {
      // Create an anonymous client.
      const clientConfig = new ai.backend.ClientConfig('', '', this.api_endpoint, 'SESSION');
      const client = new ai.backend.Client(
        clientConfig,
        'Backend.AI Console.',
      );

      await client.cloud.send_password_change_email(emailEl.value);
      this.shadowRoot.querySelector('#change-password-confirm-dialog').hide();
      this.notification.text = _text('signup.EmailSent');
      this.notification.show();
    } catch (e) {
      console.error(e);
      this.notification.text = e.message || _text('signup.SendError');
      this.notification.show();
    }
  }

  _cancelLogin(e) {
    this._hideDialog(e);
    this.open();
  }

  _validate_data(value) {
    if (value != undefined && value != null && value != '') {
      return true;
    }
    return false;
  }

  _submitIfEnter(e) {
    if (e.keyCode == 13) this._login();
  }

  _signoutIfEnter(e) {
    if (e.keyCode == 13) this._signout();
  }

  _signout() {
    const user_id = (this.shadowRoot.querySelector('#id_signout_user_id') as any).value;
    const password = (this.shadowRoot.querySelector('#id_signout_password') as any).value;
    this.client.signout(user_id, password).then((response) => {
      this.notification.text = _text('login.SignoutFinished');
      this.notification.show();
      const event = new CustomEvent('backend-ai-logout', {'detail': ''});
      document.dispatchEvent(event);
    }).catch((err) => { // Signout failed
      this.free();
      if (this.signoutPanel.open !== true) {
        console.log(err);
        if (typeof err.message !== 'undefined') {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
        } else {
          this.notification.text = PainKiller.relieve('Login information mismatch. Check your information and try again.');
        }
        this.notification.show();
      } else {
        this.notification.text = PainKiller.relieve('Signout failed. Check ID/password information.');
        this.notification.show();
      }
    });
  }

  _login() {
    const loginAttempt = globalThis.backendaioptions.get('login_attempt', 0, 'general');
    const lastLogin = globalThis.backendaioptions.get('last_login', Math.floor(Date.now() / 1000), 'general');
    const currentTime = Math.floor(Date.now() / 1000);
    if (loginAttempt >= this.login_attempt_limit && currentTime - lastLogin > this.login_block_time) { // Reset login counter and last login after 180sec.
      globalThis.backendaioptions.set('last_login', currentTime, 'general');
      globalThis.backendaioptions.set('login_attempt', 0, 'general');
    } else if (loginAttempt >= this.login_attempt_limit) { // login count exceeds limit, block login and set the last login.
      globalThis.backendaioptions.set('last_login', currentTime, 'general');
      globalThis.backendaioptions.set('login_attempt', loginAttempt + 1, 'general');
      this.notification.text = _text('login.TooManyAttempt');
      this.notification.show();
      return;
    } else {
      globalThis.backendaioptions.set('login_attempt', loginAttempt + 1, 'general');
    }

    this.api_endpoint = (this.shadowRoot.querySelector('#id_api_endpoint') as any).value;
    this.api_endpoint = this.api_endpoint.replace(/\/+$/, '');
    if (this.api_endpoint === '') {
      this.notification.text = _text('login.APIEndpointEmpty');
      this.notification.show();
      return;
    }
    if (this.connection_mode === 'SESSION') {
      this._disableUserInput();
      this.user_id = (this.shadowRoot.querySelector('#id_user_id') as any).value;
      this.password = (this.shadowRoot.querySelector('#id_password') as any).value;

      // show error message when id or password input is empty
      if (this.user_id === '' || this.user_id === 'undefined' || this.password === '' || this.password === 'undefined') {
        this.notification.text = _text('login.PleaseInputLoginInfo');
        this.notification.show();
        this._enableUserInput();
      } else {
        this._connectUsingSession(true);
        // globalThis.backendaiclient.pipeline.login()
      }
    } else {
      this._disableUserInput();
      this.api_key = (this.shadowRoot.querySelector('#id_api_key') as any).value;
      this.secret_key = (this.shadowRoot.querySelector('#id_secret_key') as any).value;
      this._connectUsingAPI(true);
    }
  }

  /**
   * Connect GQL when SESSION mode.
   *
   * @param {boolean} showError
   * */
  async _connectUsingSession(showError = true) {
    if (this.api_endpoint === '') {
      this.free();
      this.open();
      return Promise.resolve(false);
    }
    this.clientConfig = new ai.backend.ClientConfig(
      this.user_id,
      this.password,
      this.api_endpoint,
      'SESSION'
    );
    this.client = new ai.backend.Client(
      this.clientConfig,
      `Backend.AI Console.`,
    );
    return this.client.get_manager_version().then(async ()=>{
      const isLogon = await this.client.check_login();
      if (isLogon === false) { // Not authenticated yet.
        this.block(_text('login.PleaseWait'), _text('login.ConnectingToCluster'));
        this.client.login().then((response) => {
          if (response === false) {
            this.open();
            if (this.user_id != '' && this.password != '') {
              this.notification.text = PainKiller.relieve('Login information mismatch. Please check your login information.');
              this.notification.show();
            }
          } else if (response.fail_reason) {
            this.open();
            if (this.user_id != '' && this.password != '') {
              this.notification.text = PainKiller.relieve(response.fail_reason);
              this.notification.show();
            }
          } else {
            this.is_connected = true;
            return this._connectGQL();
          }
        }).catch((err) => { // Connection failed
          this.free();
          console.log(err);
          if (showError) {
            if (this.loginPanel.open !== true) {
              if (typeof err.message !== 'undefined') {
                this.notification.text = PainKiller.relieve(err.title);
                this.notification.detail = err.message;
              } else {
                this.notification.text = PainKiller.relieve('Login information mismatch. If the information is correct, logout and login again.');
              }
            } else {
              if (typeof err.message !== 'undefined') {
                this.notification.text = PainKiller.relieve(err.title);
                this.notification.detail = err.message;
              } else {
                this.notification.text = PainKiller.relieve('Login failed. Check login information.');
              }
              console.log(err);
            }
            this.notification.show();
          }
        });
        this.open();
        this._enableUserInput();
      } else { // Login already succeeded.
        this.is_connected = true;
        return this._connectGQL();
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }).catch((err)=>{ // Server is unreachable
      this.free();
      this.open();
      this._enableUserInput();
      if (showError) {
        this.notification.text = PainKiller.relieve('Endpoint is unreachable. Please check the connection or endpoint');
        this.notification.show();
      }
      return Promise.resolve(false);
    });
  }

  /**
   * Connect GQL when API mode.
   *
   * @param {boolean} showError
   * */
  _connectUsingAPI(showError = true) {
    this.clientConfig = new ai.backend.ClientConfig(
      this.api_key,
      this.secret_key,
      this.api_endpoint
    );
    this.client = new ai.backend.Client(
      this.clientConfig,
      `Backend.AI Console.`,
    );
    this.client.ready = false;
    this.client.get_manager_version().then((response) => {
      return this._connectGQL(showError);
    });
  }

  /**
   * Call _connectViaGQL() to connect to GQL.
   *
   * @param {boolean} showError
   * */
  _connectGQL(showError = true) {
    // Test connection
    if (this.loginPanel.open !== true) {
      this.block();
    }
    new Promise(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      globalThis.backendaioptions.set('last_login', currentTime, 'general');
      globalThis.backendaioptions.set('login_attempt', 0, 'general');
      this._connectViaGQL();
    }).catch((err) => { // Connection failed
      this.free();
      if (showError) {
        if (this.loginPanel.open !== true) {
          if (typeof err.message !== 'undefined') {
            if (err.status === 408) { // Failed while loading getManagerVersion
              this.notification.text = _text('error.LoginSucceededManagerNotResponding');
              this.notification.detail = err.message;
            } else {
              this.notification.text = PainKiller.relieve(err.title);
              this.notification.detail = err.message;
            }
          } else {
            this.notification.text = PainKiller.relieve('Login information mismatch. If the information is correct, logout and login again.');
          }
          this.notification.show(false, err);
          this.open();
        } else {
          this.notification.text = PainKiller.relieve('Login failed. Check login information.');
          this.notification.show();
        }
      }
      this.open();
      this._enableUserInput();
    });
  }

  /**
   * Connect client via GQL and set up the globalThis.backendaiclient's attributes.
   *
   * @return {Void}
   * */
  _connectViaGQL() {
    const fields = ['user_id', 'resource_policy', 'user'];
    const q = `query { keypair { ${fields.join(' ')} } }`;
    const v = {};
    return this.client.query(q, v).then(async (response) => {
      this.is_connected = true;
      globalThis.backendaiclient = this.client;
      const resource_policy = response['keypair'].resource_policy;
      globalThis.backendaiclient.resource_policy = resource_policy;
      this.user = response['keypair'].user;
      const fields = ['username', 'email', 'full_name', 'is_active', 'role', 'domain_name', 'groups {name, id}', 'need_password_change'];
      const q = `query { user{ ${fields.join(' ')} } }`;
      const v = {'uuid': this.user};

      /**
       * FIXME: Pipeline Login after WebUI Login
       */
      const pipelineToken = globalThis.backendaiclient.pipeline.getPipelineToken();
      if (!pipelineToken) {
        const res = await globalThis.backendaiclient.keypair.list(this.user_id, ['access_key', 'secret_key'], true);
        const keypairs = res.keypairs;
        const loginInfo = {
          username: this.user_id,
          password: this.password,
          // use first keypair
          access_key: keypairs[0].access_key,
          secret_key: keypairs[0].secret_key,
        };
        await globalThis.backendaiclient.pipeline.login(loginInfo);
      }
      return globalThis.backendaiclient.query(q, v);
    }).then((response) => {
      const email = response['user'].email;
      if (this.email !== email) {
        this.email = email;
      }
      this.user_groups = response['user'].groups;
      const role = response['user'].role;
      this.domain_name = response['user'].domain_name;
      globalThis.backendaiclient.email = this.email;
      globalThis.backendaiclient.full_name = response['user'].full_name;
      globalThis.backendaiclient.is_admin = false;
      globalThis.backendaiclient.is_superadmin = false;
      globalThis.backendaiclient.need_password_change = response['user'].need_password_change;

      if (['superadmin', 'admin'].includes(role)) {
        globalThis.backendaiclient.is_admin = true;
      }
      if (['superadmin'].includes((role))) {
        globalThis.backendaiclient.is_superadmin = true;
      }
      return globalThis.backendaiclient.group.list(true, false, ['id', 'name', 'description', 'is_active']);
    }).then(async (response) => {
      const groups = response.groups;
      const user_group_ids = this.user_groups.map(({id}) => id);
      if (groups !== null) {
        globalThis.backendaiclient.groups = groups.filter((item) => {
          if (user_group_ids.includes(item.id)) {
            return item;
          }
        }).map((item) => {
          return item.name;
        });
        const groupMap = Object();
        groups.forEach(function(element) {
          groupMap[element.name] = element.id;
        });
        globalThis.backendaiclient.groupIds = groupMap;
      } else {
        globalThis.backendaiclient.groups = ['default'];
      }
      const currentGroup = globalThis.backendaiutils._readRecentProjectGroup();
      globalThis.backendaiclient.current_group = currentGroup ? currentGroup : globalThis.backendaiclient.groups[0];
      globalThis.backendaiclient.current_group_id = () => {
        return globalThis.backendaiclient.groupIds[globalThis.backendaiclient.current_group];
      };
      globalThis.backendaiclient._config._proxyURL = this.proxy_url;
      globalThis.backendaiclient._config._proxyToken = '';
      globalThis.backendaiclient._config.domainName = this.domain_name;
      globalThis.backendaiclient._config.default_session_environment = this.default_session_environment;
      globalThis.backendaiclient._config.default_import_environment = this.default_import_environment;
      globalThis.backendaiclient._config.allow_project_resource_monitor = this.allow_project_resource_monitor;
      globalThis.backendaiclient._config.allow_manual_image_name_for_session = this.allow_manual_image_name_for_session;
      globalThis.backendaiclient._config.always_enqueue_compute_session = this.always_enqueue_compute_session;
      globalThis.backendaiclient._config.openPortToPublic = this.openPortToPublic;
      globalThis.backendaiclient._config.maxCPUCoresPerContainer = this.maxCPUCoresPerContainer;
      globalThis.backendaiclient._config.maxMemoryPerContainer = this.maxMemoryPerContainer;
      globalThis.backendaiclient._config.maxCUDADevicesPerContainer = this.maxCUDADevicesPerContainer;
      globalThis.backendaiclient._config.maxCUDASharesPerContainer = this.maxCUDASharesPerContainer;
      globalThis.backendaiclient._config.maxShmPerContainer = this.maxShmPerContainer;
      globalThis.backendaiclient._config.maxFileUploadSize = this.maxFileUploadSize;
      globalThis.backendaiclient._config.allow_image_list = this.allow_image_list;
      globalThis.backendaiclient._config.maskUserInfo = this.maskUserInfo;
      globalThis.backendaiclient.ready = true;
      if (this.endpoints.indexOf(globalThis.backendaiclient._config.endpoint as any) === -1) {
        this.endpoints.push(globalThis.backendaiclient._config.endpoint as any);
        if (this.endpoints.length > 5) { // Keep latest
          this.endpoints = this.endpoints.slice(1, 6);
        }
        globalThis.backendaioptions.set('endpoints', this.endpoints);
      }
      const event = new CustomEvent('backend-ai-connected', {'detail': this.client});
      document.dispatchEvent(event);
      this.close();
      this._saveLoginInfo();
      localStorage.setItem('backendaiwebui.api_endpoint', this.api_endpoint);
      // this.notification.text = 'Connected.';
      // this.notification.show();
    }).catch((err) => { // Connection failed
      if (this.loginPanel.open !== true) {
        if (typeof err.message !== 'undefined') {
          if (typeof err.title !== 'undefined') {
            this.notification.text = PainKiller.relieve(err.title);
            this.notification.detail = err.message;
          } else {
            this.notification.text = PainKiller.relieve(err);
            this.notification.detail = err;
          }
        } else {
          this.notification.text = PainKiller.relieve('Login information mismatch. If the information is correct, logout and login again.');
        }
        this.notification.show(false, err);
        this.open();
      } else {
        this.notification.text = PainKiller.relieve('Login failed. Check login information.');
        this.notification.show(true);
      }
      if (err.statusCode === 401) {
        // When authorization failed, it is highly likely that session cookie
        // is used which tried to use non-existent API keypairs
        console.log('automatic logout ...');
        globalThis.backendaiclient.pipeline.logout();
        this.client.logout();
      }
      this._enableUserInput();
    });
  }

  async _saveLoginInfo() {
    localStorage.removeItem('backendaiwebui.login.api_key');
    localStorage.removeItem('backendaiwebui.login.secret_key');
    localStorage.removeItem('backendaiwebui.login.user_id');
    localStorage.removeItem('backendaiwebui.login.password');
  }

  _toggleEndpoint() {
    const endpoint_list = this.shadowRoot.querySelector('#endpoint-list');
    const endpoint_button = this.shadowRoot.querySelector('#endpoint-button');
    endpoint_list.anchor = endpoint_button;
    endpoint_list.open = !endpoint_list.open;
  }

  _updateEndpoint() {
    const endpoint_list = this.shadowRoot.querySelector('#endpoint-list');
    this.api_endpoint = endpoint_list.selected.value;
  }

  _deleteEndpoint(endpoint) {
    const idx = this.endpoints.indexOf(endpoint);
    if (idx > -1) {
      this.endpoints.splice(idx, 1);
    }
    globalThis.backendaioptions.set('endpoints', this.endpoints);
    this.requestUpdate();
  }

  _disableUserInput() {
    if (this.connection_mode === 'SESSION') {
      this.shadowRoot.querySelector('#id_user_id').disabled = true;
      this.shadowRoot.querySelector('#id_password').disabled = true;
    } else {
      this.shadowRoot.querySelector('#id_user_id').disabled = true;
      this.shadowRoot.querySelector('#id_password').disabled = true;
    }
    this.shadowRoot.querySelector('.waiting-animation').style.display = 'flex';
  }

  _enableUserInput() {
    this.shadowRoot.querySelector('#id_user_id').disabled = false;
    this.shadowRoot.querySelector('#id_password').disabled = false;
    this.shadowRoot.querySelector('#id_user_id').disabled = false;
    this.shadowRoot.querySelector('#id_password').disabled = false;
    this.shadowRoot.querySelector('.waiting-animation').style.display = 'none';
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css">
      <backend-ai-dialog id="login-panel" noclosebutton fixed blockscrolling persistent disablefocustrap escapeKeyAction>
        <div slot="title">
          <div id="login-title-area"></div>
          <div class="horizontal center layout">
            <img src="manifest/backend.ai-text.svg" style="height:35px;padding:15px 0 15px 5px;" />
            <div class="flex"></div>
          </div>
        </div>
        <div slot="content" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout" style="margin: 0 25px;font-weight:700;min-height:40px;">
            <div>${this.connection_mode == 'SESSION' ? _t('login.LoginWithE-mail') : _t('login.LoginWithIAM')}</div>
            <div class="flex"></div>
            ${this.change_signin_support ? html`
                <div class="vertical center-justified layout">
                  <div style="font-size:12px;margin:5px 10px;text-align:center;font-weight:400;">${_t('login.LoginAnotherway')}</div>
                  <mwc-button
                      class="change-login-mode-button"
                      outlined
                      label="${this.connection_mode == 'SESSION' ? _t('login.ClickToUseIAM') : _t('login.ClickToUseID')}"
                      @click="${() => this._changeSigninMode()}">
                  </mwc-button>
                </div>
            ` : html``}
          </h3>
          <div class="login-form">
            <div class="waiting-animation horizontal layout wrap">
              <div class="sk-folding-cube">
                <div class="sk-cube1 sk-cube"></div>
                <div class="sk-cube2 sk-cube"></div>
                <div class="sk-cube4 sk-cube"></div>
                <div class="sk-cube3 sk-cube"></div>
              </div>
              <div id="loading-message">Waiting...</div>
            </div>
            <form id="session-login-form" style="${this.connection_mode == 'SESSION' ? `display:block;` : `display:none;`}">
              <fieldset>
                <div class="horizontal layout start-justified center login-input">
                  <mwc-icon>email</mwc-icon>
                  <input type="email" id="id_user_id" maxlength="64" autocomplete="username"
                              label="${_t('login.E-mail')}" placeholder="${_t('login.E-mail')}" icon="email" value="${this.user_id}" @keyup="${this._submitIfEnter}"></input>
                </div>
                <div class="horizontal layout start-justified center login-input">
                  <mwc-icon>vpn_key</mwc-icon>
                  <input type="password" id="id_password" autocomplete="current-password"
                              label="${_t('login.Password')}" placeholder="${_t('login.Password')}" icon="vpn_key" value="${this.password}" @keyup="${this._submitIfEnter}"></input>
                </div>
              </fieldset>
            </form>
            <form id="api-login-form" style="${this.connection_mode == 'SESSION' ? `display:none;` : `display:block;`}">
              <fieldset>
                <mwc-textfield type="text" id="id_api_key" maxLength="20"
                            label="${_t('login.APIKey')}" icon="lock" value="${this.api_key}" @keyup="${this._submitIfEnter}"></mwc-textfield>
                <mwc-textfield type="password" id="id_secret_key" maxLength="40"
                            label="${_t('login.SecretKey')}" icon="vpn_key" value="${this.secret_key}" @keyup="${this._submitIfEnter}" ></mwc-textfield>
              </fieldset>
            </form>
            <form>
              <fieldset>
                <div class="horizontal layout" id="id_api_endpoint_container" style="display:none;">
                  <mwc-icon-button id="endpoint-button" icon="cloud_queue" style="padding-left: 3px; background-color: rgb(250, 250, 250);" @click="${() => this._toggleEndpoint()}"></mwc-icon-button>
                  <mwc-menu id="endpoint-list" @selected="${() => this._updateEndpoint()}">
                    <mwc-list-item disabled>${_t('login.EndpointHistory')}</mwc-list-item>
                    ${this.endpoints.length === 0 ? html`
                    <mwc-list-item value="">${_t('login.NoEndpointSaved')}</mwc-list-item>
                    ` : html``}

                    ${this.endpoints.map((item) =>
    html`<mwc-list-item value="${item}">
                      <div class="horizontal justified center flex layout" style="width:365px;">
                        <span>${item}</span><span class="flex"></span>
                        <mwc-icon-button icon="delete" @click="${() => this._deleteEndpoint(item)}" class="endpoint-control-button"></mwc-icon-button>
                      </div>
                    </mwc-list-item>`)}
                  </mwc-menu>
                  <mwc-textfield class="endpoint-text" type="text" id="id_api_endpoint" maxLength="2048"
                              style="--mdc-text-field-idle-line-color:rgba(255,255,255,0);--mdc-text-field-hover-line-color:rgba(255,255,255,0);"
                              label="${_t('login.Endpoint')}" value="${this.api_endpoint}" @keyup="${this._submitIfEnter}"></mwc-textfield>
                </div>
                <mwc-textfield class="endpoint-text" type="text" id="id_api_endpoint_humanized" maxLength="2048"
                            style="display:none;--mdc-text-field-idle-line-color:rgba(255,255,255,0);--mdc-text-field-hover-line-color:rgba(255,255,255,0);"
                            label="${_t('login.Endpoint')}" icon="cloud" value=""></mwc-textfield>
                <mwc-button
                      unelevated
                      id="login-button"
                      icon="check"
                      fullwidth
                      label="${_t('login.Login')}"
                      @click="${() => this._login()}"></mwc-button>
                <div class="layout horizontal" style="margin-top:2em;">
                  ${this.signup_support ? html`
                    <div class="vertical center-justified layout" style="width:100%;">
                      <div style="font-size:12px; margin:0 10px; text-align:center;">${_t('login.NotAUser')}</div>
                      <mwc-button
                          outlined
                          label="${_t('login.SignUp')}"
                          @click="${() => this._showSignupDialog()}"></mwc-button>
                    </div>
                  `: html``}
                  ${this.signup_support && this.allowAnonymousChangePassword ? html`
                    <span class="flex" style="min-width:1em;"></span>
                  `: html``}
                  ${this.allowAnonymousChangePassword ? html`
                    <div class="vertical center-justified layout" style="width:100%;">
                      <div style="font-size:12px; margin:0 10px; text-align:center;">${_t('login.ForgotPassword')}</div>
                      <mwc-button
                          outlined
                          label="${_t('login.ChangePassword')}"
                          @click="${() => this._showChangePasswordEmailDialog()}"></mwc-button>
                    </div>
                  ` : html``}
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="signout-panel" fixed backdrop blockscrolling persistent disablefocustrap>
        <span slot="title">${_t('login.LeaveService')}</span>
        <div slot="content">
          <section>
            <div class="warning">${_t('login.DescConfirmLeave')}</div>
          </section>
          <mwc-textfield type="email" name="signout_user_id" id="id_signout_user_id" maxLength="64"
              label="E-mail" value="" @keyup="${this._signoutIfEnter}"></mwc-textfield>
          <mwc-textfield type="password" name="signout_password" id="id_signout_password" maxLength="64"
              label="Password" value="" @keyup="${this._signoutIfEnter}"></mwc-textfield>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
              outlined
              fullwidth
              id="signout-button"
              icon="check"
              label="${_t('login.LeaveService')}"
              @click="${() => this._signout()}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="change-password-confirm-dialog" fixed backdrop blockscrolling persistent disablefocustrap>
        <span slot="title">${_t('login.SendChangePasswordEmail')}</span>
        <div slot="content">
          <section>
            <div style="padding:1em">${_t('login.DescChangePasswordEmail')}</div>
          </section>
          <mwc-textfield type="email" id="password-change-email" maxLength="64"
              label="E-mail" value="" autofocus auto-validate
              validationMessage="${_t('signup.InvalidEmail')}"
              pattern="^[A-Z0-9a-z#-_]+@.+\\..+$"></mwc-textfield>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
              outlined
              fullwidth
              icon="check"
              label="${_t('login.EmailSendButton')}"
              @click="${() => this._sendChangePasswordEmail()}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="block-panel" fixed blockscrolling persistent escapeKeyAction>
        ${this.blockMessage != '' ? html`
          ${this.blockType !== '' ? html`
            <span slot="title" id="work-title">${this.blockType}</span>
          ` : html``}
          <div slot="content" style="text-align:center;padding-top:15px;">
          ${this.blockMessage}
          </div>
          <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
              outlined
              fullwidth
              label="${_t('login.CancelLogin')}"
              @click="${(e) => this._cancelLogin(e)}"></mwc-button>
          </div>
        ` : html``}
      </backend-ai-dialog>
      <backend-ai-signup id="signup-dialog"></backend-ai-signup>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-login': BackendAILogin;
  }
}
