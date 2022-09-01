/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

import '@material/mwc-button';
import '@material/mwc-icon';
import {IconButton} from '@material/mwc-icon-button';
import '@material/mwc-list/mwc-list-item';
import {Menu} from '@material/mwc-menu';
import '@material/mwc-select';
import {TextField} from '@material/mwc-textfield';

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

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type BackendAIDialog = HTMLElementTagNameMap['backend-ai-dialog'];
type BackendAISignup = HTMLElementTagNameMap['backend-ai-signup'];

declare global {
  const ai: any;
}

type ConnectionMode = 'SESSION' | 'API';

type ConfigValueType = 'boolean' | 'number' | 'string' | 'array';

type ConfigValueObject = {
  valueType: ConfigValueType;
  defaultValue: boolean | number | string | Array<string>;
  value: boolean | number | string | Array<string>;
};

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
  shadowRoot!: ShadowRoot | null;

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
  @property({type: String}) connection_mode = 'SESSION' as ConnectionMode;
  @property({type: Number}) login_attempt_limit = 500;
  @property({type: Number}) login_block_time = 180;
  @property({type: String}) user;
  @property({type: String}) email;
  @property({type: Object}) config = Object();
  @property({type: Boolean}) is_connected = false;
  @property({type: Object}) clientConfig: ai.ClientConfig | undefined;
  @property({type: Object}) client: ai.Client | undefined;
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
  @property({type: Array}) singleSignOnVendors: string[] = [];
  @property({type: Array}) allow_image_list;
  @property({type: Array}) endpoints;
  @property({type: Object}) logoutTimerBeforeOneMin;
  @property({type: Object}) logoutTimer;
  private _enableContainerCommit = false;
  private _enablePipeline = false;
  @query('#login-panel') loginPanel!: HTMLElementTagNameMap['backend-ai-dialog'];
  @query('#signout-panel') signoutPanel!: HTMLElementTagNameMap['backend-ai-dialog'];
  @query('#block-panel') blockPanel!: HTMLElementTagNameMap['backend-ai-dialog'];
  @query('#id_api_endpoint_container') apiEndpointContainer!: HTMLDivElement;
  @query('#id_api_endpoint') apiEndpointInput!: TextField;
  @query('#id_api_endpoint_humanized') apiEndpointHumanizedInput!: TextField;
  @query('#id_user_id') userIdInput!: TextField;
  @query('#id_password') passwordInput!: TextField;
  @query('#id_api_key') apiKeyInput!: TextField;
  @query('#id_secret_key') secretKeyInput!: TextField;

  constructor() {
    super();
    globalThis.backendaiwebui = {};
    this.endpoints = [];
  }

  static get styles(): CSSResultGroup {
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
          --mdc-text-field-idle-line-color: rgba(0, 0, 0, 0);
          --mdc-text-field-hover-line-color:rgba(0, 0, 0, 0);
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

        .title-img {
          height: 35px;
          padding: 15px 0 15px 5px;
        }

        #change-signin-area > #change-signin-message {
          font-size: 12px;
          margin: 5px 10px;
          text-align: center;
          font-weight: 400;
        }

        #session-login-form.block {
          display: block;
        }

        #session-login-form.none {
          display: none;
        }

        #api-login-form.block {
          display: block;
        }

        #api-login-form.none {
          display: none;
        }

        #endpoint-button {
          padding-left: 3px;
          background-color: rgb(250, 250, 250);
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

        #additional-action-area {
          margin-top: 2em;
        }

        #additional-action-area > #signup-area {
          width: 100%;
        }

        #signup-area > #signup-message {
          font-size: 12px;
          margin: 0 10px;
          text-align: center;
        }

        #additional-action-area > span {
          min-width: 1em;
        }

        #change-password-area {
          width: 100%;
        }

        #change-password-area > #change-password-message {
          font-size: 12px;
          margin:0 10px;
          text-align: center;
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
    this.notification = globalThis.lablupNotification;
    this.endpoints = globalThis.backendaioptions.get('endpoints', []);
  }


  /**
   * Change the signin mode with SESSION or API
   * */
  private _changeSigninMode() {
    if (this.change_signin_support === true) {
      if (this.connection_mode === 'SESSION') {
        this.connection_mode = 'API';
        localStorage.setItem('backendaiwebui.connection_mode', 'API');
      } else {
        this.connection_mode = 'SESSION';
        localStorage.setItem('backendaiwebui.connection_mode', 'SESSION');
      }
      this.requestUpdate();
    }
  }

  private _getConfigValueByExists(parentsKey, valueObj: ConfigValueObject) {
    const defaultConditions: boolean = (parentsKey === undefined ||
                                        valueObj.value === undefined ||
                                        typeof valueObj.value === 'undefined' ||
                                        valueObj.value === '' ||
                                        valueObj.value === null);
    let extraConditions;
    switch (typeof valueObj.defaultValue) {
      case 'number':
        extraConditions = isNaN(valueObj.value as number);
        // if any condition check fails return value will be defaultValue
        return (defaultConditions || extraConditions) ? valueObj.defaultValue : valueObj.value;
      case 'boolean':
      case 'string':
      default: // includes array
        return defaultConditions ? valueObj.defaultValue : valueObj.value;
        break;
    }
  }

  /**
   * Refresh global value used in Backend.Ai WebUI read from config file with keys
   *
   * @param {object} config
   */
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

    /**
     * Assign Configuration as global value from config file (config.toml)
     * - ends with flag means the value is true or false (usually use `false` as a default)
     * - ends with number means the value is positive number with zero
     * - ends with value means the value is string
     * - ends with array means the value is array of string
     */
    this._initGeneralConfigWithKeys(config.general);
    this._initWSProxyConfigWithKeys(config.wsproxy);
    this._initResourcesConfigWithKeys(config.resources);
    this._initEnvironmentsConfigWithKeys(config.environments);
  }

  /**
   * Initialize global key with value from general section in config file
   *
   * @param {object} generalConfig
   */
  private _initGeneralConfigWithKeys(generalConfig) {
    // Debug flag
    globalThis.backendaiwebui.debug = this._getConfigValueByExists(generalConfig,
     {
       valueType: 'boolean',
       defaultValue: false,
       value: generalConfig?.debug,
     } as ConfigValueObject) as boolean;
   if (globalThis.backendaiwebui.debug) {
     console.log('Debug flag is set to true');
   }

   // Signup support flag
   this.signup_support = this._getConfigValueByExists(generalConfig,
     {
       valueType: 'boolean',
       defaultValue: false,
       value: generalConfig?.signupSupport,
     } as ConfigValueObject) as boolean;
   // Signup support flag
   if (this.signup_support) {
     (this.shadowRoot?.querySelector('#signup-dialog') as HTMLElementTagNameMap['backend-ai-signup']).active = true;
   }

   // Signup support flag
   this.allowAnonymousChangePassword = this._getConfigValueByExists(generalConfig,
     {
       valueType: 'boolean',
       defaultValue: false,
       value: generalConfig?.allowAnonymousChangePassword,
     } as ConfigValueObject) as boolean;

   // Allow change Sign-in mode flag
   this.allowAnonymousChangePassword = this._getConfigValueByExists(generalConfig,
     {
       valueType: 'boolean',
       defaultValue: false,
       value: generalConfig?.allowChangeSigninMode,
     } as ConfigValueObject) as boolean;

   // Allow change Sign-in mode flag
   this.allow_project_resource_monitor = this._getConfigValueByExists(generalConfig,
     {
       valueType: 'boolean',
       defaultValue: false,
       value: generalConfig?.allowProjectResourceMonitor,
     } as ConfigValueObject) as boolean;

   // Allow manual image name for session flag
   this.allow_manual_image_name_for_session = this._getConfigValueByExists(generalConfig,
     {
       valueType: 'boolean',
       defaultValue: false,
       value: generalConfig?.allowManualImageNameForSession,
     } as ConfigValueObject) as boolean;

   // Always enqueue compute session flag
   this.always_enqueue_compute_session = this._getConfigValueByExists(generalConfig,
     {
       valueType: 'boolean',
       defaultValue: false,
       value: generalConfig?.alwaysEnqueueComputeSession,
     } as ConfigValueObject) as boolean;

   // Allow Sign out flag
   this.allow_signout = this._getConfigValueByExists(generalConfig,
     {
       valueType: 'boolean',
       defaultValue: false,
       value: generalConfig?.allowSignout,
     } as ConfigValueObject) as boolean;

   // Login attempt limit number
   this.login_attempt_limit = this._getConfigValueByExists(generalConfig,
     {
       valueType: 'number',
       defaultValue: this.login_attempt_limit, // default value has been already assigned in property declaration
       value: parseInt(generalConfig?.loginAttemptLimit),
     } as ConfigValueObject) as number;

   // Login block time number
   this.login_block_time = this._getConfigValueByExists(generalConfig,
     {
       valueType: 'number',
       defaultValue: this.login_block_time, // default value has been already assigned in property declaration
       value: parseInt(generalConfig?.loginBlockTime),
     } as ConfigValueObject) as number;

   // API endpoint value with additional styles
   this.api_endpoint = this._getConfigValueByExists(generalConfig,
     {
       valueType: 'string',
       defaultValue: '',
       value: generalConfig?.apiEndpoint
     } as ConfigValueObject) as string;
   if (this.api_endpoint === '') {
     this.apiEndpointContainer.style.display = 'flex';
     this.apiEndpointHumanizedInput.style.display = 'none';
   } else {
     // API endpoint text value with additional styles
     const apiEndpointText = this._getConfigValueByExists(generalConfig,
       {
         valueType: 'string',
         defaultValue: '',
         value: generalConfig?.apiEndpointText
       } as ConfigValueObject) as string;
     if (apiEndpointText === '') {
       this.apiEndpointContainer.style.display = 'flex';
       this.apiEndpointHumanizedInput.style.display = 'none';
       (this.shadowRoot?.querySelector('#endpoint-button') as IconButton).disabled = true;
     } else {
       this.apiEndpointInput.disabled = true;
       this.apiEndpointHumanizedInput.disabled = true;
     }
   }

   // Allow signup without confirmation flag
   this.allowSignupWithoutConfirmation = this._getConfigValueByExists(generalConfig,
     {
       valueType: 'boolean',
       defaultValue: false,
       value: generalConfig?.allowSignupWithoutConfirmation,
     } as ConfigValueObject) as boolean;

   // Default session environment value
   this.default_session_environment = this._getConfigValueByExists(generalConfig,
     {
       valueType: 'string',
       defaultValue: '',
       value: generalConfig?.defaultSessionEnvironment,
     } as ConfigValueObject) as string;

   // Default session environment value
   this.default_import_environment = this._getConfigValueByExists(generalConfig,
     {
       valueType: 'string',
       defaultValue: 'cr.backend.ai/stable/python', // 'index.docker.io/lablup/python:3.8-ubuntu18.04'
       value: generalConfig?.defaultImportEnvironment,
     } as ConfigValueObject) as string;

   // Mask user info flag
   this.maskUserInfo = this._getConfigValueByExists(generalConfig,
     {
       valueType: 'boolean',
       defaultValue: false,
       value: generalConfig?.maskUserInfo,
     } as ConfigValueObject) as boolean;

   // Single sign-on vendors array
   this.singleSignOnVendors = this._getConfigValueByExists(generalConfig,
     {
       valueType: 'array',
       defaultValue: [] as string[],
       // sanitize whitespace on user-input after splitting
       value: (generalConfig?.singleSignOnVendors) ? generalConfig?.singleSignOnVendors.split(',').map(el => el.trim()) : [],
     } as ConfigValueObject) as string[];

   // Enable container commit flag
   this._enableContainerCommit = this._getConfigValueByExists(generalConfig,
     {
       valueType: 'boolean',
       defaultValue: false,
       value: (generalConfig?.enableContainerCommit),
     } as ConfigValueObject) as boolean;

   // Enable pipeline flag
   // FIXME: temporally disable pipeline feature in manual
   this._enablePipeline = this._getConfigValueByExists(generalConfig,
     {
       valueType: 'boolean',
       defaultValue: false,
       value: false, // (generalConfig?.enablePipeline),
     } as ConfigValueObject) as boolean;

   // Connection mode value depending on Electron mode and default configuration value
   const connection_mode: string | null = localStorage.getItem('backendaiwebui.connection_mode');
   if (globalThis.isElectron && connection_mode !== null && connection_mode !== '' && connection_mode !== '""') {
     this.connection_mode = (connection_mode === 'SESSION') ? 'SESSION' : 'API';
   } else {
     this.connection_mode = this._getConfigValueByExists(generalConfig,
       {
         valueType: 'boolean',
         defaultValue: this.connection_mode,
         value: (generalConfig?.connectionMode ?? 'SESSION').toUpperCase() as ConnectionMode,
       } as ConfigValueObject) as ConnectionMode;
   }
 }

  /**
   * Initialize global key with value from wsproxy section in config file
   *
   * @param {object} wsproxyConfig
   */
 private _initWSProxyConfigWithKeys(wsproxyConfig) {
   // wsproxy url value
   this.proxy_url = this._getConfigValueByExists(wsproxyConfig,
     {
       valueType: 'string',
       defaultValue: 'http://127.0.0.1:5050/',
       value: wsproxyConfig?.proxyURL,
     } as ConfigValueObject) as string;
 }

  /**
   * Initialize global key with value from resources section in config file
   *
   * @param {object} resourcesConfig
   */
 private _initResourcesConfigWithKeys(resourcesConfig) {
   // Open port to public flag
   this.openPortToPublic = this._getConfigValueByExists(resourcesConfig,
     {
       valueType: 'boolean',
       defaultValue: false,
       value: resourcesConfig?.openPortToPublic,
     } as ConfigValueObject) as boolean;

   // Max CPU cores per container number
   this.maxCPUCoresPerContainer = this._getConfigValueByExists(resourcesConfig,
     {
       valueType: 'number',
       defaultValue: 64,
       value: parseInt(resourcesConfig?.maxCPUCoresPerContainer ?? ''),
     } as ConfigValueObject) as number;

   // Max Memory per container number
   this.maxMemoryPerContainer = this._getConfigValueByExists(resourcesConfig,
     {
       valueType: 'number',
       defaultValue: 16,
       value: parseInt(resourcesConfig?.maxMemoryPerContainer),
     } as ConfigValueObject) as number;

   // Max CUDA devices per container number
   this.maxCUDADevicesPerContainer = this._getConfigValueByExists(resourcesConfig,
     {
       valueType: 'number',
       defaultValue: 16,
       value: parseInt(resourcesConfig?.maxCUDADevicesPerContainer),
     } as ConfigValueObject) as number;

   // Max CUDA shares per container number
   this.maxCUDASharesPerContainer = this._getConfigValueByExists(resourcesConfig,
     {
       valueType: 'number',
       defaultValue: 16,
       value: parseInt(resourcesConfig?.maxCUDASharesPerContainer),
     } as ConfigValueObject) as number;

   // Max CUDA shares per container number
   this.maxShmPerContainer = this._getConfigValueByExists(resourcesConfig,
     {
       valueType: 'number',
       defaultValue: 2,
       value: parseFloat(resourcesConfig?.maxShmPerContainerr),
     } as ConfigValueObject) as number;

   // Max File Upload size number
   const unlimitedValueOnFileUpload: number = -1;
   this.maxFileUploadSize = this._getConfigValueByExists(resourcesConfig,
     {
       valueType: 'number',
       defaultValue: unlimitedValueOnFileUpload,
       value: parseInt(resourcesConfig?.maxFileUploadSize),
     } as ConfigValueObject) as number;
 }

  /**
   * Initialize global key with value from environments section in config file
   *
   * @param {object} environmentsConfig
   */
 private _initEnvironmentsConfigWithKeys(environmentsConfig) {
   // Allow image list array
   this.allow_image_list = this._getConfigValueByExists(environmentsConfig,
     {
       valueType: 'array',
       defaultValue: [] as string[],
       // sanitize whitespace on user-input after splitting
       value: (environmentsConfig?.allowlist) ? environmentsConfig?.allowlist.split(',').map(el => el.trim()) : [],
     } as ConfigValueObject) as string[];
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

  /**
   * Load configuration file from the WebServer when using Session mode.
   *
   * */
  private _loadConfigFromWebServer() {
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
      const api_endpoint = localStorage.getItem('backendaiwebui.api_endpoint');
      if (api_endpoint !== null) {
        this.api_endpoint = api_endpoint.replace(/^"+|"+$/g, '');
      }
    }
    this.api_endpoint = this.api_endpoint.trim();
    if (this.connection_mode === 'SESSION' as ConnectionMode) {
      if (globalThis.isElectron) {
        this._loadConfigFromWebServer();
      }
      this._connectUsingSession(showError);
    } else if (this.connection_mode === 'API' as ConnectionMode) {
      // this.block(_text('login.PleaseWait'), _text('login.ConnectingToCluster'));
      await this._connectUsingAPI(showError);
    } else {
      this.open();
    }
  }

  async check_login(showError = true) {
    if (this.api_endpoint === '') {
      const api_endpoint: any = localStorage.getItem('backendaiwebui.api_endpoint');
      if (api_endpoint !== null) {
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
  private async _checkLoginUsingSession(showError = true) {
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
      const isLogon = await this.client?.check_login();
      return Promise.resolve(isLogon);
    });
  }

  /**
   * Logout current session.
   *
   * @param {boolean} showError
   * */
  async _logoutSession(showError = true) {
    return this.client?.logout();
  }

  signout() {
    this.signoutPanel.show();
  }

  async loginWithSAML() {
    const rqst = this.client?.newUnsignedRequest('POST', '/saml/login', null);
    const form = document.createElement('form');
    const redirect_to = document.createElement('input');
    form.appendChild(redirect_to);
    document.body.appendChild(form);
    form.setAttribute('method', 'POST');
    form.setAttribute('action', rqst?.uri as string); // TODO: need to check its behavior.
    redirect_to.setAttribute('type', 'hidden');
    redirect_to.setAttribute('name', 'redirect_to');
    redirect_to.setAttribute('value', window.location.href);
    form.submit();
  }

  /**
   * Show signup dialog. And notify message if API Endpoint is empty.
   * */
  private _showSignupDialog() {
    this.api_endpoint = this.api_endpoint.trim();
    if (this.api_endpoint === '') {
      this.notification.text = _text('error.APIEndpointIsEmpty');
      this.notification.show();
      return;
    }
    const signupDialog = this.shadowRoot?.querySelector('#signup-dialog') as BackendAISignup;
    signupDialog.endpoint = this.api_endpoint;
    signupDialog.allowSignupWithoutConfirmation = this.allowSignupWithoutConfirmation;
    signupDialog.open();
  }

  private _showChangePasswordEmailDialog() {
    (this.shadowRoot?.querySelector('#change-password-confirm-dialog') as BackendAIDialog).show();
  }

  private async _sendChangePasswordEmail() {
    const emailEl = this.shadowRoot?.querySelector('#password-change-email') as TextField;
    if (!emailEl.value || !emailEl.validity.valid) return;
    try {
      // Create an anonymous client.
      const clientConfig = new ai.backend.ClientConfig('', '', this.api_endpoint, 'SESSION');
      const client = new ai.backend.Client(
        clientConfig,
        'Backend.AI Console.',
      );

      await client.cloud.send_password_change_email(emailEl.value);
      (this.shadowRoot?.querySelector('#change-password-confirm-dialog') as BackendAIDialog).hide();
      this.notification.text = _text('signup.EmailSent');
      this.notification.show();
    } catch (e) {
      console.error(e);
      this.notification.text = e.message || _text('signup.SendError');
      this.notification.show();
    }
  }

  private _cancelLogin(e) {
    this._hideDialog(e);
    this.open();
  }

  private _submitIfEnter(e) {
    if (e.keyCode === 13) this._login();
  }

  private _signoutIfEnter(e) {
    if (e.keyCode === 13) this._signout();
  }

  private _signout() {
    const user_id = (this.shadowRoot?.querySelector('#id_signout_user_id') as TextField).value;
    const password = (this.shadowRoot?.querySelector('#id_signout_password') as TextField).value;
    this.client?.signout(user_id, password).then((response) => {
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

  async _token_login(sToken) {
    // If token is delivered as a querystring, just save it as cookie.
    document.cookie = `sToken=${sToken}; expires=Session; path=/`;
    try {
      const loginSuccess = await this.client?.token_login();
      if (!loginSuccess) {
        this.notification.text = _text('eduapi.CannotAuthorizeSessionByToken');
        this.notification.show(true);
      }
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      this.notification.text = _text('eduapi.CannotAuthorizeSessionByToken');
      this.notification.show(true, err);
      window.location.href = '/';
    }
  }

  private _login() {
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

    this.api_endpoint = this.apiEndpointInput.value.replace(/\/+$/, '');
    if (this.api_endpoint === '') {
      this.notification.text = _text('login.APIEndpointEmpty');
      this.notification.show();
      return;
    }

    this._disableUserInput();
    if (this.connection_mode === 'SESSION') {
      this.user_id = this.userIdInput.value;
      this.password = this.passwordInput.value;

      // show error message when id or password input is empty
      if (!this.user_id || this.user_id === 'undefined' || !this.password || this.password === 'undefined') {
        this.notification.text = _text('login.PleaseInputLoginInfo');
        this.notification.show();
        this._enableUserInput();
      } else {
        this._connectUsingSession(true);
      }
    } else {
      this.api_key = this.apiKeyInput.value;
      this.secret_key = this.secretKeyInput.value;

      if (!this.api_key || this.api_key === 'undefined' || !this.secret_key || this.secret_key === 'undefined') {
        this.notification.text = _text('login.PleaseInputLoginInfo');
        this.notification.show();
        this._enableUserInput();
      } else {
        this._connectUsingAPI(true);
      }
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
    return this.client.get_manager_version().then(async () => {
      const isLogon = await this.client?.check_login();
      if (isLogon === false) { // Not authenticated yet.
        this.block(_text('login.PleaseWait'), _text('login.ConnectingToCluster'));

        // TODO: This is a temporary solution to automatically logs a user in
        // via SSO response.
        // If token is delivered as a querystring, login with the token.
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const sToken = urlParams.get('sToken') || null;
        if (sToken !== null) {
          this._token_login(sToken);
          return;
        }

        this.client?.login().then((response) => {
          if (response === false) {
            this.open();
            if (this.user_id !== '' && this.password !== '') {
              this.notification.text = PainKiller.relieve('Login information mismatch. Please check your login information.');
              this.notification.show();
            }
            return Promise.resolve(false);
          } else if (response.fail_reason) {
            this.open();
            if (this.user_id !== '' && this.password !== '') {
              this.notification.text = PainKiller.relieve(response.fail_reason);
              this.notification.show();
            }
            return Promise.resolve(false);
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
   * @return {Promise}
   * */
  private _connectUsingAPI(showError = true) {
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
    return this.client.get_manager_version().then((response) => {
      return this._connectGQL(showError);
    }).catch((err) => {
      // FIXME need error handling logic and message prompt
      console.log(err);
      this._enableUserInput();
    });
  }

  /**
   * Call _connectViaGQL() to connect to GQL.
   *
   * @param {boolean} showError
   * @return {Promise}
   * */
  private _connectGQL(showError = true) {
    // Test connection
    if (this.loginPanel.open !== true) {
      this.block();
    }
    return new Promise(() => {
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
  private _connectViaGQL() {
    const fields = ['user_id', 'resource_policy', 'user'];
    const q = `query { keypair { ${fields.join(' ')} } }`;
    const v = {};
    return this.client?.query(q, v).then(async (response) => {
      this.is_connected = true;
      globalThis.backendaiclient = this.client;
      const resource_policy = response['keypair'].resource_policy;
      globalThis.backendaiclient.resource_policy = resource_policy;
      this.user = response['keypair'].user;
      const fields = ['username', 'email', 'full_name', 'is_active', 'role', 'domain_name', 'groups {name, id}', 'need_password_change'];
      const q = `query { user{ ${fields.join(' ')} } }`;
      const v = {'uuid': this.user};

      /**
       * FIXME:
       * - Pipeline Login after WebUI Login
       * - Temporally disable pipeline login
       */
      if (this._enablePipeline) {
        const pipelineToken = globalThis.backendaiclient.getPipelineToken();
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
      globalThis.backendaiclient._config.singleSignOnVendors = this.singleSignOnVendors;
      globalThis.backendaiclient._config.enableContainerCommit = this._enableContainerCommit;
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

        // Only request pipeline logout when pipeline value is enabled
        if (this._enablePipeline) {
          globalThis.backendaiclient.pipeline.logout();
        }
        this.client?.logout();
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

  private _toggleEndpoint() {
    const endpoint_list = this.shadowRoot?.querySelector('#endpoint-list') as Menu;
    const endpoint_button = this.shadowRoot?.querySelector('#endpoint-button') as IconButton;
    endpoint_list.anchor = endpoint_button;
    endpoint_list.open = !endpoint_list.open;
  }

  private _updateEndpoint() {
    const endpoint_list = this.shadowRoot?.querySelector('#endpoint-list') as Menu;
    if (endpoint_list.selected && !(endpoint_list.selected instanceof Array)) {
      this.api_endpoint = endpoint_list.selected.value;
    }
  }

  private _deleteEndpoint(endpoint) {
    const idx = this.endpoints.indexOf(endpoint);
    if (idx > -1) {
      this.endpoints.splice(idx, 1);
    }
    globalThis.backendaioptions.set('endpoints', this.endpoints);
    this.requestUpdate();
  }

  private _disableUserInput() {
    if (this.connection_mode === 'SESSION') {
      this.userIdInput.disabled = true;
      this.passwordInput.disabled = true;
    } else {
      this.apiKeyInput.disabled = true;
      this.secretKeyInput.disabled = true;
    }
    (this.shadowRoot?.querySelector('.waiting-animation') as HTMLDivElement).style.display = 'flex';
  }

  private _enableUserInput() {
    this.userIdInput.disabled = false;
    this.passwordInput.disabled = false;
    this.apiKeyInput.disabled = false;
    this.secretKeyInput.disabled = false;
    (this.shadowRoot?.querySelector('.waiting-animation') as HTMLDivElement).style.display = 'none';
  }

  protected render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css">
      <backend-ai-dialog id="login-panel" noclosebutton fixed blockscrolling persistent disablefocustrap escapeKeyAction>
        <div slot="title">
          <div id="login-title-area"></div>
          <div class="horizontal center layout">
            <img class="title-img" src="manifest/backend.ai-text.svg" alt="backend.ai" />
          </div>
        </div>
        <div slot="content" class="login-panel intro centered">
          <h3 class="horizontal center layout" style="margin: 0 25px;font-weight:700;min-height:40px;">
            <div>${this.connection_mode === 'SESSION' ? _t('login.LoginWithE-mail') : _t('login.LoginWithIAM')}</div>
            <div class="flex"></div>
            ${this.change_signin_support ? html`
                <div id="change-signin-area" class="vertical center-justified layout">
                  <div id="change-signin-message">${_t('login.LoginAnotherway')}</div>
                  <mwc-button outlined class="change-login-mode-button"
                      label="${this.connection_mode === 'SESSION' ? _t('login.ClickToUseIAM') : _t('login.ClickToUseID')}"
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
            <form id="session-login-form" class="${this.connection_mode === 'SESSION' ? 'block' : 'none'}">
              <fieldset>
                  <mwc-textfield type="email" id="id_user_id" maxlength="64" autocomplete="username"
                      label="${_t('login.E-mail')}" icon="email"
                      value="${this.user_id}"
                      @keyup="${this._submitIfEnter}">
                  </mwc-textfield>
                  <mwc-textfield type="password" id="id_password" autocomplete="current-password"
                      label="${_t('login.Password')}" icon="vpn_key"
                      value="${this.password}"
                      @keyup="${this._submitIfEnter}">
                  </mwc-textfield>
              </fieldset>
            </form>
            <form id="api-login-form" class="${this.connection_mode === 'SESSION' ? 'none' : 'block'}">
              <fieldset>
                <mwc-textfield type="text" id="id_api_key" maxLength="20"
                    label="${_t('login.APIKey')}" icon="lock"
                    value="${this.api_key}"
                    @keyup="${this._submitIfEnter}">
                </mwc-textfield>
                <mwc-textfield type="password" id="id_secret_key" maxLength="40"
                    label="${_t('login.SecretKey')}" icon="vpn_key"
                    value="${this.secret_key}"
                    @keyup="${this._submitIfEnter}">
                </mwc-textfield>
              </fieldset>
            </form>
            <form>
              <fieldset>
                <div class="horizontal layout" id="id_api_endpoint_container" style="display:none;">
                  <mwc-icon-button id="endpoint-button" icon="cloud_queue"
                      @click="${() => this._toggleEndpoint()}">
                  </mwc-icon-button>
                  <mwc-menu id="endpoint-list" @selected="${() => this._updateEndpoint()}">
                    <mwc-list-item disabled>${_t('login.EndpointHistory')}</mwc-list-item>
                    ${this.endpoints.length === 0 ? html`
                      <mwc-list-item value="">${_t('login.NoEndpointSaved')}</mwc-list-item>
                    ` : html``}

                    ${this.endpoints.map((item) => html`
                      <mwc-list-item value="${item}">
                        <div class="horizontal justified center flex layout" style="width:365px;">
                          <span>${item}</span><span class="flex"></span>
                          <mwc-icon-button class="endpoint-control-button" icon="delete"
                              @click="${() => this._deleteEndpoint(item)}">
                          </mwc-icon-button>
                        </div>
                      </mwc-list-item>
                    `)}
                  </mwc-menu>
                  <mwc-textfield class="endpoint-text" type="text" id="id_api_endpoint"
                      maxLength="2048" label="${_t('login.Endpoint')}"
                      value="${this.api_endpoint}"
                      @keyup="${this._submitIfEnter}">
                  </mwc-textfield>
                </div>
                <mwc-textfield class="endpoint-text" type="text" id="id_api_endpoint_humanized"
                    maxLength="2048" style="display:none;"
                    label="${_t('login.Endpoint')}" icon="cloud" value="">
                </mwc-textfield>
                <mwc-button unelevated fullwidth id="login-button" icon="check"
                    label="${_t('login.Login')}"
                    @click="${() => this._login()}">
                </mwc-button>
                ${this.singleSignOnVendors.includes('saml') ? html`
                  <mwc-button
                    id="sso-login-saml-button"
                    label="${_t('login.SingleSignOn.LoginWithSAML')}"
                    fullwidth
                    @click="${() => this.loginWithSAML()}"
                  ></mwc-button>
                ` : html``}
                <div id="additional-action-area" class="layout horizontal">
                  ${this.signup_support ? html`
                    <div id="signup-area" class="vertical center-justified layout">
                      <div id="signup-message">${_t('login.NotAUser')}</div>
                      <mwc-button outlined label="${_t('login.SignUp')}"
                          @click="${() => this._showSignupDialog()}">
                      </mwc-button>
                    </div>
                  `: html``}
                  ${this.signup_support && this.allowAnonymousChangePassword ? html`
                    <span class="flex"></span>
                  `: html``}
                  ${this.allowAnonymousChangePassword ? html`
                    <div id="change-password-area" class="vertical center-justified layout">
                      <div id="change-password-message">${_t('login.ForgotPassword')}</div>
                      <mwc-button outlined label="${_t('login.ChangePassword')}"
                          @click="${() => this._showChangePasswordEmailDialog()}">
                      </mwc-button>
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
          <mwc-textfield type="email" name="signout_user_id" id="id_signout_user_id"
              maxLength="64" label="E-mail" value=""
              @keyup="${this._signoutIfEnter}">
          </mwc-textfield>
          <mwc-textfield type="password" name="signout_password" id="id_signout_password"
              maxLength="64" label="Password" value=""
              @keyup="${this._signoutIfEnter}">
          </mwc-textfield>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button outlined fullwidth id="signout-button"
              icon="check" label="${_t('login.LeaveService')}"
              @click="${() => this._signout()}">
          </mwc-button>
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
        ${this.blockMessage !== '' ? html`
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
              @click="${(e) => this._cancelLogin(e)}">
            </mwc-button>
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
