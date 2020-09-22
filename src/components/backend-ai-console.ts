/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {get as _text, registerTranslateConfig, translate as _t, use as setLanguage} from "lit-translate";
import {css, customElement, html, LitElement, property} from "lit-element";
// PWA components
import {connect} from 'pwa-helpers/connect-mixin';
import {installOfflineWatcher} from 'pwa-helpers/network';
import {installRouter} from 'pwa-helpers/router';
import {store} from '../store';

import {navigate, updateOffline} from '../backend-ai-app';

import '../plastics/mwc/mwc-drawer';
import '../plastics/mwc/mwc-top-app-bar-fixed';
import '@material/mwc-icon';
import '@material/mwc-icon-button';
import '@material/mwc-icon-button-toggle';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-menu';
import '@material/mwc-select';
import '@material/mwc-circular-progress';

import toml from 'markty-toml';

import 'weightless/popover';
import 'weightless/popover-card';

import './backend-ai-settings-store';
import './backend-ai-splash';
import './backend-ai-help-button';
import './lablup-notification';
import './backend-ai-indicator-pool';
import './lablup-terms-of-service';
import './backend-ai-dialog';
import './backend-ai-sidepanel-task';
import './backend-ai-sidepanel-notification';
import './backend-ai-app-launcher';
import './backend-ai-resource-broker';
import {BackendAiConsoleStyles} from './backend-ai-console-styles';
import '../lib/backend.ai-client-es6';

import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';
import '../plastics/mwc/mwc-multi-select';

import './backend-ai-offline-indicator';
import './backend-ai-login';

import BackendAiSettingsStore from "./backend-ai-settings-store";
import BackendAiTasker from "./backend-ai-tasker";

registerTranslateConfig({
  loader: lang => fetch(`/resources/i18n/${lang}.json`).then(res => res.json())
});
globalThis.backendaioptions = new BackendAiSettingsStore;
globalThis.tasker = new BackendAiTasker;

/**
 Backend.AI GUI Console

 `backend-ai-console` is a shell of Backend.AI GUI console (web / app).

 Example:

 <backend-ai-console>
 ... content ...
 </backend-ai-console>lablup-terms-of-service

 @group Backend.AI Console
 @element backend-ai-console
 */

@customElement("backend-ai-console")
export default class BackendAIConsole extends connect(store)(LitElement) {
  public shadowRoot: any; // ShadowRoot
  @property({type: Boolean}) hasLoadedStrings = false;
  @property({type: String}) menuTitle = 'LOGIN REQUIRED';
  @property({type: String}) siteDescription = '';
  @property({type: String}) user_id = 'DISCONNECTED';
  @property({type: String}) full_name = 'DISCONNECTED';
  @property({type: String}) domain = 'CLICK TO CONNECT';
  @property({type: Boolean}) is_connected = false;
  @property({type: Boolean}) is_admin = false;
  @property({type: Boolean}) is_superadmin = false;
  @property({type: Boolean}) allow_signout = false;
  @property({type: String}) proxy_url = '';
  @property({type: String}) connection_mode = 'API';
  @property({type: String}) connection_server = '';
  @property({type: String}) edition = 'Open Source';
  @property({type: String}) validUntil = '';
  @property({type: Array}) groups = Array();
  @property({type: String}) current_group = '';
  @property({type: Object}) plugins = Object();
  @property({type: Object}) notification = Object();
  @property({type: Object}) splash = Object();
  @property({type: Object}) loginPanel = Object();
  @property({type: String}) _page = '';
  @property({type: Object}) _pageParams = {};
  @property({type: String}) _sidepanel = '';
  @property({type: Boolean}) _drawerOpened = false;
  @property({type: Boolean}) _offlineIndicatorOpened = false;
  @property({type: Boolean}) _offline = false;
  @property({type: Object}) config = Object();
  @property({type: Object}) appBody;
  @property({type: Object}) appPage;
  @property({type: Object}) contentBody;
  @property({type: Object}) mainToolbar;
  @property({type: Object}) drawerToggleButton;
  @property({type: Object}) sidebarMenu;
  @property({type: Object}) TOSdialog = Object();
  @property({type: Boolean}) mini_ui = false;
  @property({type: String}) lang = 'default';
  @property({type: Array}) supportLanguageCodes = ["en", "ko"];
  @property({type: Array}) blockedMenuitem;

  constructor() {
    super();
    this.blockedMenuitem = [];
  }

  static get styles() {
    return [
      BackendAiConsoleStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        mwc-textfield {
          width: 100%;
          --mdc-text-field-fill-color: transparent;
        }
      `
    ];
  }

  firstUpdated() {
    globalThis.lablupNotification = this.shadowRoot.querySelector('#notification');
    globalThis.lablupIndicator = this.shadowRoot.querySelector('#indicator');
    globalThis.appLauncher = this.shadowRoot.querySelector('#app-launcher');
    globalThis.resourceBroker = this.shadowRoot.querySelector('#resource-broker');
    globalThis.currentPage = this._page;
    globalThis.currentPageParams = this._pageParams;
    this.notification = globalThis.lablupNotification;
    this.appBody = this.shadowRoot.querySelector('#app-body');
    this.appPage = this.shadowRoot.querySelector('#app-page');
    this.contentBody = this.shadowRoot.querySelector('#content-body');
    this.contentBody.type = 'dismissible';
    this.mainToolbar = this.shadowRoot.querySelector('#main-toolbar');
    //this.mainToolbar.scrollTarget = this.appPage;
    this.drawerToggleButton = this.shadowRoot.querySelector('#drawer-toggle-button');
    this.sidebarMenu = this.shadowRoot.getElementById('sidebar-menu');
    this.splash = this.shadowRoot.querySelector('#about-backendai-panel');
    this.loginPanel = this.shadowRoot.querySelector('#login-panel');
    this.TOSdialog = this.shadowRoot.querySelector('#terms-of-service');
    if (globalThis.isElectron && navigator.platform.indexOf('Mac') >= 0) { // For macOS
      (this.shadowRoot.querySelector('.portrait-canvas') as HTMLElement).style.visibility = 'hidden';
    }
    installRouter((location) => store.dispatch(navigate(decodeURIComponent(location.pathname))));
    installOfflineWatcher((offline) => store.dispatch(updateOffline(offline)));
    let configPath;
    if (globalThis.isElectron) {
      configPath = './config.toml';
      document.addEventListener('backend-ai-logout', () => this.logout(true));
      document.addEventListener('backend-ai-app-close', () => this.close_app_window(true));
      document.addEventListener('backend-ai-show-splash', () => this.splash.show());
    } else {
      configPath = '../../config.toml';
      document.addEventListener('backend-ai-logout', () => this.logout(false));
    }
    this._parseConfig(configPath).then(() => {
      this.loadConfig(this.config);
      if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
        if (this._page === 'verify-email') {
          const emailVerifyView = this.shadowRoot.querySelector('backend-ai-email-verification-view');
          window.setTimeout(() => {
            emailVerifyView.verify(this.loginPanel.api_endpoint);
          }, 1000);
        } else if (this._page === 'change-password') {
          const changePasswordView = this.shadowRoot.querySelector('backend-ai-change-forgot-password-view');
          window.setTimeout(() => {
            changePasswordView.open(this.loginPanel.api_endpoint);
          }, 1000);
        } else {
          this.loginPanel.login();
        }
      }
    }).catch(err => {
      console.log("Initialization failed.");
      if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
        this.loginPanel.block('Configuration is not loaded.', 'Error');
      }
    });
    this.mini_ui = globalThis.backendaioptions.get('compact_sidebar');
    globalThis.mini_ui = this.mini_ui;

    this._changeDrawerLayout(document.body.clientWidth, document.body.clientHeight);
    globalThis.addEventListener("resize", (event) => {
      this._changeDrawerLayout(document.body.clientWidth, document.body.clientHeight);
    });
  }

  async connectedCallback() {
    super.connectedCallback();
    document.addEventListener('backend-ai-connected', () => this.refreshPage());
    if (globalThis.backendaioptions.get('language') === "default" && this.supportLanguageCodes.includes(globalThis.navigator.language)) { // Language is not set and
      this.lang = globalThis.navigator.language;
    } else if (this.supportLanguageCodes.includes(globalThis.backendaioptions.get('language'))) {
      this.lang = globalThis.backendaioptions.get('language');
    } else {
      this.lang = "en";
    }
    globalThis.backendaioptions.set('current_language', this.lang);
    await setLanguage(this.lang);
    this.hasLoadedStrings = true;
    // this._initClient();
  }

  disconnectedCallback() {
    document.removeEventListener('backend-ai-connected', () => this.refreshPage());
    super.disconnectedCallback();
  }

  attributeChangedCallback(name, oldval, newval) {
    super.attributeChangedCallback(name, oldval, newval);
  }

  shouldUpdate(changedProperties) {
    return this.hasLoadedStrings && super.shouldUpdate(changedProperties);
  }

  loadConfig(config): void {
    if (typeof config.general !== "undefined" && 'siteDescription' in config.general) {
      this.siteDescription = config.general.siteDescription;
    }
    if (typeof config.general !== "undefined" && 'connectionMode' in config.general) {
      this.connection_mode = config.general.connectionMode;
      //console.log(this.connection_mode);
    }
    if (typeof config.general !== "undefined" && 'connectionServer' in config.general) {
      this.connection_server = config.general.connectionServer;
      //console.log(this.connection_server);
    }
    if (typeof config.license !== "undefined" && 'edition' in config.license) {
      this.edition = config.license.edition;
    }
    if (typeof config.menu !== "undefined" && 'blocklist' in config.menu) {
      this.blockedMenuitem = config.menu.blocklist.split(",");
    }

    globalThis.packageEdition = this.edition;
    if (typeof config.license !== "undefined" && 'validUntil' in config.license) {
      this.validUntil = config.license.validUntil;
      //console.log(this.validUntil);
    }
    globalThis.packageValidUntil = this.validUntil;
    if (typeof config.general === "undefined" || typeof config.general.allowSignout === "undefined" || config.general.allowSignout === '' || config.general.allowSignout == false) {
      this.allow_signout = false;
    } else {
      this.allow_signout = true;
    }
    if (typeof config.plugin !== "undefined") { // Store plugin informations
      if ('login' in config.plugin) {
        this.plugins['login'] = config.plugin.login;
      }
      if ('page' in config.plugin) {
        //for (let [key, item] of Object.entries(config.plugin.page)) {
        //  console.log(key, item);
        //}
        this.plugins['page'] = config.plugin.page;
        globalThis.backendaiPages = config.plugin.page;
      }
      if ('sidebar' in config.plugin) {
        // TODO : multiple sidebar plugins
        this.plugins['sidebar'] = config.plugin.sidebar;
      }
    }
    this.loginPanel.refreshWithConfig(config);
  }

  refreshPage(): void {
    (this.shadowRoot.getElementById('sign-button') as any).icon = 'exit_to_app';
    globalThis.backendaiclient.proxyURL = this.proxy_url;
    if (typeof globalThis.backendaiclient !== "undefined" && globalThis.backendaiclient != null
      && typeof globalThis.backendaiclient.is_admin !== "undefined" && globalThis.backendaiclient.is_admin === true) {
      this.is_admin = true;
    } else {
      this.is_admin = false;
    }
    if (typeof globalThis.backendaiclient !== "undefined" && globalThis.backendaiclient != null
      && typeof globalThis.backendaiclient.is_superadmin !== "undefined" && globalThis.backendaiclient.is_superadmin === true) {
      this.is_superadmin = true;
    } else {
      this.is_superadmin = false;
    }
    this._refreshUserInfoPanel();
    this._writeRecentProjectGroup(this.current_group);
    document.body.style.backgroundImage = 'none';
    this.appBody.style.visibility = 'visible';
    let curtain: HTMLElement = this.shadowRoot.getElementById('loading-curtain');
    curtain.classList.add('visuallyhidden');
    curtain.addEventListener('transitionend', () => {
      curtain.classList.add('hidden');
      this.is_connected = true;
    }, {
      capture: false,
      once: true,
      passive: false
    });
    this.addTooltips();
  }

  showUpdateNotifier(): void {
    let indicator = <any>this.shadowRoot.getElementById('backend-ai-indicator');
    indicator.innerHTML = 'New console available. Please <a onclick="globalThis.location.reload()">reload</a> to update.';
    indicator.show();
  }

  _parseConfig(fileName): Promise<void> {
    return fetch(fileName)
      .then(res => {
        if (res.status == 200) {
          return res.text();
        }
        return '';
      })
      .then(res => {
        this.config = toml(res);
      }).catch(err => {
        console.log("Configuration file missing.");
      });
  }

  /**
   * Display the toggle sidebar when this.mini_ui is true.
   */
  toggleSidebarUI(): void {
    if (!this.mini_ui) {
      this.mini_ui = true;
    } else {
      this.mini_ui = false;
    }
    globalThis.mini_ui = this.mini_ui;
    let event: CustomEvent = new CustomEvent('backend-ai-ui-changed', {"detail": {"mini-ui": this.mini_ui}});
    document.dispatchEvent(event);
    this._changeDrawerLayout(document.body.clientWidth, document.body.clientHeight);
  }

  /**
   * Set the drawer width by browser size.
   */
  toggleSidePanelUI(): void {
    if (this.contentBody.open) {
      this.contentBody.open = false;
      if (this.mini_ui) {
        this.mainToolbar.style.setProperty('--mdc-drawer-width', '54px');// 54
      } else {
        this.mainToolbar.style.setProperty('--mdc-drawer-width', '190px');// 190
      }
    } else {
      this.contentBody.open = true;
      this.contentBody.style.setProperty('--mdc-drawer-width', '250px');
      if (this.mini_ui) {
        this.mainToolbar.style.setProperty('--mdc-drawer-width', '304px');// 54+250
      } else {
        this.mainToolbar.style.setProperty('--mdc-drawer-width', '440px');// 190+250
      }
    }
  }

  /**
   * Set the toggle side pannel type.
   */
  toggleSidePanelType() {
    if (this.contentBody.type === 'dismissible') {
      this.contentBody.type === 'modal';
    } else {
      this.contentBody.type === 'dismissible';
    }
  }

  /**
   * Control the side panel by panel's state.
   *
   * @param {string} panel
   */
  _openSidePanel(panel): void {
    if (this.contentBody.open === true) {
      if (panel != this._sidepanel) { // change panel only.
        this._sidepanel = panel;
      } else { // just close panel. (disable icon amp.)
        this._sidepanel = '';
        this.toggleSidePanelUI();
      }
    } else { // open new panel.
      this._sidepanel = panel;
      this.toggleSidePanelUI();
    }
  }

  /**
   * Change the drawer layout according to browser size.
   *
   * @param {number} width
   * @param {number} height
   */
  _changeDrawerLayout(width, height): void {
    this.mainToolbar.style.setProperty('--mdc-drawer-width', '0px');
    if (width < 700) {  // Close drawer
      this.appBody.style.setProperty('--mdc-drawer-width', '190px');
      this.appBody.type = 'modal';
      this.appBody.open = false;
      //this.contentBody.style.width = 'calc('+width+'px - 190px)';
      this.mainToolbar.style.setProperty('--mdc-drawer-width', '0px');
      this.drawerToggleButton.style.display = 'block';
      if (this.mini_ui) {
        this.mini_ui = false;
        globalThis.mini_ui = this.mini_ui;
      }
    } else { // Open drawer
      if (this.mini_ui) {
        this.appBody.style.setProperty('--mdc-drawer-width', '54px');
        this.mainToolbar.style.setProperty('--mdc-drawer-width', '54px');
        this.contentBody.style.width = 'calc('+width+'px - 54px)';
        if (this.contentBody.open) {
          this.mainToolbar.style.setProperty('--mdc-drawer-width', '304px');// 54+250
        }
      } else {
        this.appBody.style.setProperty('--mdc-drawer-width', '190px');
        this.mainToolbar.style.setProperty('--mdc-drawer-width', '190px');
        this.contentBody.style.width = 'calc('+width+'px - 190px)';
        if (this.contentBody.open) {
          this.mainToolbar.style.setProperty('--mdc-drawer-width', '440px'); // 190+250
        }
      }
      this.appBody.type = 'dismissible';
      this.appBody.open = true;
      this.drawerToggleButton.style.display = 'none';
    }
    if (this.contentBody.open) {
      this.contentBody.style.setProperty('--mdc-drawer-width', '250px');
    }
  }

  /**
   * Refresh the user information panel.
   */
  _refreshUserInfoPanel(): void {
    this.user_id = globalThis.backendaiclient.email;
    this.full_name = globalThis.backendaiclient.full_name;
    this.domain = globalThis.backendaiclient._config.domainName;
    this.current_group = this._readRecentProjectGroup();
    globalThis.backendaiclient.current_group = this.current_group;
    this.groups = globalThis.backendaiclient.groups;
    let groupSelectionBox: HTMLElement = this.shadowRoot.getElementById('group-select-box');
    // Detached from template to support live-update after creating new group (will need it)
    if (groupSelectionBox.hasChildNodes()) {
      groupSelectionBox.removeChild(groupSelectionBox.firstChild as ChildNode);
    }
    let select = document.createElement('mwc-multi-select') as any;
    select.label = _text("console.menu.Project");
    select.id = 'group-select';
    select.value = this.current_group;
    //select.setAttribute('naturalMenuWidth', 'true');
    //select.setAttribute('fullwidth', 'true');
    select.addEventListener('selected', (e) => this.changeGroup(e));
    let opt = document.createElement('mwc-list-item');
    opt.setAttribute('disabled', 'true');
    opt.innerHTML = _text("console.menu.SelectProject");
    opt.style.borderBottom = "1px solid #ccc";
    select.appendChild(opt);
    this.groups.map(group => {
      opt = document.createElement('mwc-list-item');
      opt.value = group;
      if (this.current_group === group) {
        opt.selected = true;
      } else {
        opt.selected = false;
      }
      opt.innerHTML = group;
      select.appendChild(opt);
    });
    //select.updateOptions();
    groupSelectionBox.appendChild(select);
  }

  /**
   * Load the page element.
   */
  _loadPageElement() {
    if (this._page === 'index.html' || this._page === '') {
      this._page = 'summary';
      navigate(decodeURIComponent('/'));
    }
  }

  /**
   * Open the user preference dialog.
   */
  _openUserPrefDialog() {
    const dialog = this.shadowRoot.querySelector('#user-preference-dialog');
    dialog.show();
  }

  /**
   * Hide the user preference dialog.
   */
  _hideUserPrefDialog() {
    this.shadowRoot.querySelector('#user-preference-dialog').hide();
  }

  _togglePasswordVisibility(element) {
    const isVisible = element.__on;
    const password = element.closest('div').querySelector('mwc-textfield');
    isVisible ? password.setAttribute('type', 'text') : password.setAttribute('type', 'password');
  }

  _validatePassword1() {
    const passwordInput = this.shadowRoot.querySelector('#pref-new-password');
    const password2Input = this.shadowRoot.querySelector('#pref-new-password2');
    password2Input.reportValidity();
    passwordInput.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          passwordInput.validationMessage = _text('signup.PasswordInputRequired');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          }
        } else {
          passwordInput.validationMessage = _text('signup.PasswordInvalid');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          }
        }
      } else {
        return {
          valid: nativeValidity.valid,
          customError: !nativeValidity.valid
        }
      }
    }
  }

  _validatePassword2() {
    const password2Input = this.shadowRoot.querySelector('#pref-new-password2');
    password2Input.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          password2Input.validationMessage = _text('signup.PasswordInputRequired');
          return {
            valid: nativeValidity.valid, 
            customError: !nativeValidity.valid
          }
        } else {
          password2Input.validationMessage = _text('signup.PasswordInvalid');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          } 
        }
      } else {
        // custom validation for password input match
        const passwordInput = this.shadowRoot.querySelector('#pref-new-password');
        let isMatched = (passwordInput.value === password2Input.value);
        if (!isMatched) {
          password2Input.validationMessage = _text('signup.PasswordNotMatched');         
        }
        return {
          valid: isMatched,
          customError: !isMatched
        }
      }
    }
  }

  /**
   * Validate User input in password automatically, and show error message if any input error occurs.
   */
  _validatePassword() {
    this._validatePassword1();
    this._validatePassword2();
  }

  /**
   * Update the user information including full_name of user and password
   */
  _updateUserInformation() {
    this._updateFullname();
    this._updateUserPassword();
  }

  /**
   * Update the full_name of user information
   */
  async _updateFullname() {
    const newFullname = this.shadowRoot.querySelector('#pref-original-name').value;
    // if user input in full name is not null and not same as the original full name, then it updates.
    if (newFullname && (newFullname !== this.full_name)) {
      globalThis.backendaiclient.user.update(this.user_id, {'full_name': newFullname}).then((resp) => {
        this.notification.text = _text('console.menu.FullnameUpdated');
        this.notification.show();
        this.full_name = globalThis.backendaiclient.full_name = newFullname;
        this.shadowRoot.querySelector('#pref-original-name').value = this.full_name;
      }).catch((err) => {
        if (err && err.message) {
          this.notification.text = err.message;
          this.notification.detail = err.message;
          this.notification.show(true, err);
          return;
        }
        else if (err && err.title) {
          this.notification.text = err.title;
          this.notification.detail = err.message;
          this.notification.show(true, err);
          return;
        }
      });
    }
  }

  /**
   * Update the user password.
   */
  async _updateUserPassword() {
    const dialog = this.shadowRoot.querySelector('#user-preference-dialog');
    const oldPassword = dialog.querySelector('#pref-original-password').value;
    const newPassword1El = dialog.querySelector('#pref-new-password');
    const newPassword2El = dialog.querySelector('#pref-new-password2');

    // no update in user's password
    if (!oldPassword && !newPassword1El.value && !newPassword2El.value) {
      this._hideUserPrefDialog();
      return;
    }

    if (!oldPassword) {
      this.notification.text = _text('console.menu.InputOriginalPassword');
      this.notification.show();
      return;
    }
    if (!newPassword1El.value || !newPassword1El.validity.valid) {
      this.notification.text = _text('console.menu.InvalidPasswordMessage');
      this.notification.show();
      return;
    }
    if (newPassword1El.value !== newPassword2El.value) {
      this.notification.text = _text('console.menu.NewPasswordMismatch');
      this.notification.show();
      return;
    }

    globalThis.backendaiclient.update_password(oldPassword, newPassword1El.value, newPassword2El.value).then((resp) => {
      this.notification.text = _text('console.menu.PasswordUpdated');
      this.notification.show();
      this._hideUserPrefDialog();
    }).catch((err) => {
      if (err && err.message) {
        this.notification.text = err.message;
        this.notification.detail = err.message;
        this.notification.show(true, err);
        return;
      }
      else if (err && err.title) {
        this.notification.text = err.title;
        this.notification.detail = err.message;
        this.notification.show(true, err);
        return;
      }
    }).finally(() => { // remove input value again
      this.shadowRoot.querySelector('#pref-original-password').value = '';
      this.shadowRoot.querySelector('#pref-new-password').value = '';
      this.shadowRoot.querySelector('#pref-new-password2').value = '';
    });
  }

  _menuSelected(e) {
    // Reserved for future use.
  }

  updated(changedProps: any) {
    if (changedProps.has('_page')) {
      let view: string = this._page;
      // load data for view
      if (['summary', 'job', 'agent', 'credential', 'data', 'usersettings', 'environment', 'settings', 'maintenance', 'information', 'statistics', 'github', 'import'].includes(view) !== true) { // Fallback for Windows OS
        let modified_view: (string | undefined) = view.split(/[\/]+/).pop();
        if (typeof modified_view != 'undefined') {
          view = modified_view;
        } else {
          view = 'summary';
        }
        this._page = view;
      }
      this._updateSidebar(view);
    }
  }

  /**
   * Update the sidebar menu title according to view.
   *
   * @param {string} view - Sidebar menu title string.
   */
  _updateSidebar(view) {
    switch (view) {
      case 'summary':
      case 'verify-email':
      case 'change-password':
        this.menuTitle = _text("console.menu.Summary");
        this.updateTitleColor('var(--paper-green-800)', '#efefef');
        break;
      case 'job':
        this.menuTitle = _text("console.menu.Sessions");
        this.updateTitleColor('var(--paper-red-800)', '#efefef');
        break;
      case 'experiment':
        this.menuTitle = _text("console.menu.Experiments");
        this.updateTitleColor('var(--paper-light-blue-800)', '#efefef');
        break;
      case 'data':
        this.menuTitle = _text("console.menu.Data&Storage");
        this.updateTitleColor('var(--paper-orange-800)', '#efefef');
        break;
      case 'statistics':
        this.menuTitle = _text("console.menu.Statistics");
        this.updateTitleColor('var(--paper-cyan-800)', '#efefef');
        break;
      case 'usersettings':
        this.menuTitle = _text("console.menu.Settings&Logs");
        this.updateTitleColor('var(--paper-teal-800)', '#efefef');
        break;
      case 'credential':
        this.menuTitle = _text("console.menu.UserCredentials&Policies");
        this.updateTitleColor('var(--paper-lime-800)', '#efefef');
        break;
      case 'environment':
        this.menuTitle = _text("console.menu.Environments&Presets");
        this.updateTitleColor('var(--paper-yellow-800)', '#efefef');
        break;
      case 'agent':
        this.menuTitle = _text("console.menu.ComputationResources");
        this.updateTitleColor('var(--paper-light-blue-800)', '#efefef');
        break;
      case 'settings':
        this.menuTitle = _text("console.menu.Configurations");
        this.updateTitleColor('var(--paper-green-800)', '#efefef');
        break;
      case 'maintenance':
        this.menuTitle = _text("console.menu.Maintenance");
        this.updateTitleColor('var(--paper-pink-800)', '#efefef');
        break;
      case 'information':
        this.menuTitle = _text("console.menu.Information");
        this.updateTitleColor('var(--paper-purple-800)', '#efefef');
        break;
      case 'logs':
        this.menuTitle = _text("console.menu.Logs");
        this.updateTitleColor('var(--paper-deep-orange-800)', '#efefef');
        break;
      case 'github':
      case 'import':
        this.menuTitle = _text("console.menu.Import&Run");
        this.updateTitleColor('var(--paper-blue-800)', '#efefef');
        break;
      default:
        this._page = 'error';
        this.menuTitle = _text("console.NOTFOUND");
        this.updateTitleColor('var(--paper-grey-800)', '#efefef');
    }
  }

  /**
   * When user close the app window, delete login information.
   *
   * @param {Boolean} performClose
   */
  async close_app_window(performClose = false) {
    if (globalThis.backendaioptions.get('preserve_login') === false) { // Delete login information.
      this.notification.text = 'Clean up login session...';
      this.notification.show();
      const keys = Object.keys(localStorage);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (/^(backendaiconsole\.login\.)/.test(key)) {
          localStorage.removeItem(key);
        }
      }
      // remove data in sessionStorage
      sessionStorage.clear();
    }
    if (typeof globalThis.backendaiclient != 'undefined' && globalThis.backendaiclient !== null) {
      if (globalThis.backendaiclient._config.connectionMode === 'SESSION') {
        await globalThis.backendaiclient.logout();
      }
      globalThis.backendaiclient = null;
    }
  }

  /**
   * Logout from the backend.ai client.
   *
   * @param {Boolean} performClose
   */
  async logout(performClose = false) {
    console.log('also close the app:', performClose);
    this._deleteRecentProjectGroupInfo();
    if (typeof globalThis.backendaiclient != 'undefined' && globalThis.backendaiclient !== null) {
      this.notification.text = 'Clean up now...';
      this.notification.show();
      if (globalThis.backendaiclient._config.connectionMode === 'SESSION') {
        await globalThis.backendaiclient.logout();
      }
      this.is_admin = false;
      this.is_superadmin = false;
      globalThis.backendaiclient = null;
      const keys = Object.keys(localStorage);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (/^(backendaiconsole\.login\.)/.test(key)) {
          localStorage.removeItem(key);
        }
      }
      // remove data in sessionStorage
      sessionStorage.clear();

      if (performClose === true) {
        // Do nothing. this window will be closed.
      } else if (globalThis.isElectron) {
        this.user_id = '';
        this.domain = '';
        this._page = 'summary';
        globalThis.history.pushState({}, '', '/summary');
        store.dispatch(navigate(decodeURIComponent('/')));
        this.loginPanel.login();
      } else {
        globalThis.location.reload();
      }
    }
  }

  /**
   * Update the title color.
   *
   * @param {string} backgroundColorVal
   * @param {string} colorVal
   */
  updateTitleColor(backgroundColorVal: string, colorVal: string) {
    (this.shadowRoot.querySelector('#main-toolbar') as HTMLElement).style.setProperty('--mdc-theme-primary', backgroundColorVal);
    (this.shadowRoot.querySelector('#main-toolbar') as HTMLElement).style.color = colorVal;
  }

  /**
   * Change the backend.ai client's current group.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  changeGroup(e) {
    globalThis.backendaiclient.current_group = e.target.value;
    this.current_group = globalThis.backendaiclient.current_group;
    this._writeRecentProjectGroup(globalThis.backendaiclient.current_group);
    let event = new CustomEvent("backend-ai-group-changed", {"detail": globalThis.backendaiclient.current_group});
    document.dispatchEvent(event);
  }

  /**
   * Control the mwc-drawer.
   */
  toggleDrawer() {
    let drawer = this.shadowRoot.querySelector('mwc-drawer');
    if (drawer.open === true) {
      drawer.open = false;
    } else {
      drawer.open = true;
    }
  }

  /**
   * Control the dropdown menu.
   */
  _toggleDropdown() {
    let menu = this.shadowRoot.querySelector("#dropdown-menu");
    let menu_icon = this.shadowRoot.querySelector('#dropdown-button');
    menu.anchor = menu_icon;
    menu.open = !menu.open;
  }

  /**
   * Display the ToS(terms of service) agreement.
   */
  showTOSAgreement() {
    if (this.TOSdialog.show === false) {
      this.TOSdialog.tosContent = "";
      this.TOSdialog.tosLanguage = this.lang;
      this.TOSdialog.title = _text("console.menu.TermsOfService");
      this.TOSdialog.tosEntry = 'terms-of-service';
      this.TOSdialog.open();
    }
  }

  /**
   * Display the PP(privacy policy) agreement.
   */
  showPPAgreement() {
    if (this.TOSdialog.show === false) {
      this.TOSdialog.tosContent = "";
      this.TOSdialog.tosLanguage = this.lang;
      this.TOSdialog.title = _text("console.menu.PrivacyPolicy");
      this.TOSdialog.tosEntry = 'privacy-policy';
      this.TOSdialog.open();
    }
  }

  /**
   * Move to input url.
   *
   * @param {string} url
   */
  _moveTo(url) {
    globalThis.history.pushState({}, '', url);
    store.dispatch(navigate(decodeURIComponent(url), {}));
  }

  /**
   * Move to user's log page.
   */
  _moveToLogPage() {
    let currentPage = globalThis.location.toString().split(/[\/]+/).pop();
    globalThis.history.pushState({}, '', '/usersettings');
    store.dispatch(navigate(decodeURIComponent('/usersettings'), {tab: 'logs'}));
    if (currentPage && currentPage === 'usersettings') {
      let event = new CustomEvent('backend-ai-usersettings-logs', {});
      document.dispatchEvent(event);
    }
  }

  /**
   * Read recent project group according to endpoint id.
   */
  _readRecentProjectGroup() {
    let endpointId = globalThis.backendaiclient._config.endpointHost.replace(/\./g, '_'); // dot is used for namespace divider
    let value: string | null = globalThis.backendaioptions.get('projectGroup.' + endpointId);
    if (value) { // Check if saved group has gone between logins / sessions
      if (globalThis.backendaiclient.groups.length > 0 && globalThis.backendaiclient.groups.includes(value)) {
        return value; // value is included. So it is ok.
      } else {
        this._deleteRecentProjectGroupInfo();
        return globalThis.backendaiclient.current_group;
      }
    }
    return globalThis.backendaiclient.current_group;
  }

  /**
   * Set the project group according to current group.
   *
   * @param {string} value
   */
  _writeRecentProjectGroup(value: string) {
    let endpointId = globalThis.backendaiclient._config.endpointHost.replace(/\./g, '_'); // dot is used for namespace divider
    globalThis.backendaioptions.set('projectGroup.' + endpointId, value ? value : globalThis.backendaiclient.current_group);
  }

  /**
   * Delete the recent project group information.
   */
  _deleteRecentProjectGroupInfo() {
    let endpointId = globalThis.backendaiclient._config.endpointHost.replace(/\./g, '_'); // dot is used for namespace divider
    globalThis.backendaioptions.delete('projectGroup.' + endpointId);
  }

  /**
   * Move to user settings page.
   */
  _moveToUserSettingsPage() {
    let currentPage = globalThis.location.toString().split(/[\/]+/).pop();
    globalThis.history.pushState({}, '', '/usersettings');
    store.dispatch(navigate(decodeURIComponent('/usersettings'), {tab: 'general'}));
    if (currentPage && currentPage === 'usersettings') {
      let event = new CustomEvent('backend-ai-usersettings', {});
      document.dispatchEvent(event);
    }
  }

  /**
   * Add tool tips by create popovers.
   */
  async addTooltips() {
    this._createPopover("#summary-menu-icon", _text("console.menu.Summary"));
    this._createPopover("#sessions-menu-icon", _text("console.menu.Sessions"));
    this._createPopover("#data-menu-icon", _text("console.menu.Data&Storage"));
    this._createPopover("#statistics-menu-icon", _text("console.menu.Statistics"));
    this._createPopover("#usersettings-menu-icon", _text("console.menu.Settings"));
    if (this.is_admin) {
      this._createPopover("#user-menu-icon", _text("console.menu.Users"));
    }
    if (this.is_superadmin) {
      this._createPopover("#resources-menu-icon", _text("console.menu.Resources"));
      this._createPopover("#environments-menu-icon", _text("console.menu.Environments"));
      this._createPopover("#configurations-menu-icon", _text("console.menu.Configurations"));
      this._createPopover("#maintenance-menu-icon", _text("console.menu.Maintenance"));
      this._createPopover("#information-menu-icon", _text("console.menu.Information"));
      //this._createPopover("#admin-menu-icon", _text("console.menu.Administration"));
    }
  }

  /**
   * Create a popover.
   *
   * @param {string} anchor
   * @param {string} title
   */
  _createPopover(anchor: string, title: string) {
    let popover = document.createElement('wl-popover');
    popover.anchor = anchor;
    popover.setAttribute('fixed', '');
    popover.setAttribute('disablefocustrap', '');
    popover.setAttribute('anchororiginx', 'right');
    popover.setAttribute('anchororiginy', 'center');
    popover.setAttribute('transformoriginx', 'left');
    popover.setAttribute('transformoriginy', 'center');
    popover.anchorOpenEvents = ["mouseover"];
    popover.anchorCloseEvents = ["mouseout"];
    let card = document.createElement('wl-popover-card');
    let carddiv = document.createElement('div');
    carddiv.style.padding = '5px';
    carddiv.innerText = title;
    card.appendChild(carddiv);
    popover.appendChild(card);
    let tooltipBox = this.shadowRoot.querySelector('#mini-tooltips');
    tooltipBox.appendChild(popover);
  }

  protected render() {
    // language=HTML
    return html`
      <div id="loading-curtain" class="loading-background"></div>
      <mwc-drawer id="app-body" class="${this.mini_ui ? "mini-ui" : ""}" style="position:fixed;visibility:hidden;">
        <div class="drawer-content drawer-menu" style="height:100vh;position:fixed;">
          <div id="portrait-bar" class="draggable">
            <div class="horizontal center layout flex bar draggable" style="cursor:pointer;">
              <div class="portrait-canvas">
                <img style="width:43px; height:43px;" src="manifest/backend.ai-brand-white.svg"
                  sizing="contain" />
              </div>
              <div class="vertical start-justified layout full-menu" style="margin-left:10px;margin-right:10px;">
                <div class="site-name"><span class="bold">Backend</span>.AI</div>
                ${this.siteDescription ?
      html`<div class="site-name" style="font-size:13px;text-align:right;">${this.siteDescription}</div>` :
      html``
    }
              </div>
              <span class="flex"></span>
            </div>
          </div>
          <div class="horizontal start-justified center layout flex" style="max-height:40px;">
            <mwc-icon-button id="mini-ui-toggle-button" style="color:#fff;margin-left:4px;" icon="menu" slot="navigationIcon" @click="${() => this.toggleSidebarUI()}"></mwc-icon-button>
            <mwc-icon-button disabled class="full-menu side-menu fg ${this.contentBody && this.contentBody.open === true && this._sidepanel === 'feedback' ? 'yellow' : 'white'}" id="feedback-icon" icon="question_answer"></mwc-icon-button>
            <mwc-icon-button class="full-menu side-menu fg ${this.contentBody && this.contentBody.open === true && this._sidepanel === 'notification' ? 'yellow' : 'white'}" id="notification-icon" icon="notification_important" @click="${() => this._openSidePanel('notification')}"></mwc-icon-button>
            <mwc-icon-button class="full-menu side-menu fg ${this.contentBody && this.contentBody.open === true && this._sidepanel === 'task' ? 'yellow' : 'white'}" id="task-icon" icon="ballot" @click="${() => this._openSidePanel('task')}"></mwc-icon-button>
          </div>
          <mwc-list id="sidebar-menu" class="sidebar list" @selected="${(e) => this._menuSelected(e)}">
            <mwc-list-item graphic="icon" ?selected="${this._page === 'summary'}" @click="${() => this._moveTo('/summary')}" ?disabled="${this.blockedMenuitem.includes('summary')}">
              <mwc-icon id="summary-menu-icon" slot="graphic" id="activities-icon" class="fg green">widgets</mwc-icon>
              <span class="full-menu">${_t("console.menu.Summary")}</span>
            </mwc-list-item>
            <mwc-list-item graphic="icon" ?selected="${this._page === 'job'}" @click="${() => this._moveTo('/job')}" ?disabled="${this.blockedMenuitem.includes('job')}">
              <mwc-icon id="sessions-menu-icon" slot="graphic" class="fg red">ballot</mwc-icon>
              <span class="full-menu">${_t("console.menu.Sessions")}</span>
            </mwc-list-item>
            ${false ? html`
            <mwc-list-item graphic="icon" ?selected="${this._page === 'experiment'}" @click="${() => this._moveTo('/experiment')}" ?disabled="${this.blockedMenuitem.includes('experiment')}">
              <mwc-icon slot="graphic" class="fg blue">pageview</mwc-icon>
              <span class="full-menu">${_t("console.menu.Experiments")}</span>
            </mwc-list-item>` : html``}
            <mwc-list-item graphic="icon" ?selected="${this._page === 'github' || this._page === 'import'}" @click="${() => this._moveTo('/import')}" ?disabled="${this.blockedMenuitem.includes('import')}">
              <mwc-icon id="import-menu-icon" slot="graphic" class="fg blue">play_arrow</mwc-icon>
              <span class="full-menu">${_t("console.menu.Import&Run")}</span>
            </mwc-list-item>
            <mwc-list-item graphic="icon" ?selected="${this._page === 'data'}" @click="${() => this._moveTo('/data')}" ?disabled="${this.blockedMenuitem.includes('data')}">
              <mwc-icon id="data-menu-icon" slot="graphic" class="fg orange">cloud_upload</mwc-icon>
              <span class="full-menu">${_t("console.menu.Data&Storage")}</span>
            </mwc-list-item>
            <mwc-list-item graphic="icon" ?selected="${this._page === 'statistics'}" @click="${() => this._moveTo('/statistics')}" ?disabled="${this.blockedMenuitem.includes('statistics')}">
              <mwc-icon id="statistics-menu-icon" slot="graphic" class="fg cyan" icon="icons:assessment">assessment</mwc-icon>
              <span class="full-menu">${_t("console.menu.Statistics")}</span>
            </mwc-list-item>
            ${this.is_admin ?
      html`
            <h3 class="full-menu">${_t("console.menu.Administration")}</h3>
            <mwc-list-item graphic="icon" ?selected="${this._page === 'credential'}" @click="${() => this._moveTo('/credential')}" ?disabled="${!this.is_admin}">
              <mwc-icon id="user-menu-icon" slot="graphic" class="fg lime" icon="icons:face">face</mwc-icon>
              <span class="full-menu">${_t("console.menu.Users")}</span>
            </mwc-list-item>
            <mwc-list-item graphic="icon" ?selected="${this._page === 'environment'}" @click="${() => this._moveTo('/environment')}" ?disabled="${!this.is_admin}">
              <mwc-icon id="environments-menu-icon" slot="graphic" class="fg orange" icon="icons:extension">extension</mwc-icon>
              <span class="full-menu">${_t("console.menu.Environments")}</span>
            </mwc-list-item>
    ` : html``}
            ${this.is_superadmin ?
      html`
            <mwc-list-item graphic="icon" ?selected="${this._page === 'agent'}" @click="${() => this._moveTo('/agent')}" ?disabled="${!this.is_superadmin}">
              <mwc-icon id="resources-menu-icon" slot="graphic" class="fg blue" icon="hardware:device-hub">device_hub</mwc-icon>
              <span class="full-menu">${_t("console.menu.Resources")}</span>
            </mwc-list-item>
            <mwc-list-item graphic="icon" ?selected="${this._page === 'settings'}" @click="${() => this._moveTo('/settings')}" ?disabled="${!this.is_superadmin}">
              <mwc-icon id="configurations-menu-icon" slot="graphic" class="fg green" icon="icons:settings">settings_input_component</mwc-icon>
              <span class="full-menu">${_t("console.menu.Configurations")}</span>
            </mwc-list-item>
            <mwc-list-item graphic="icon" ?selected="${this._page === 'maintenance'}" @click="${() => this._moveTo('/maintenance')}" ?disabled="${!this.is_superadmin}">
              <mwc-icon id="maintenance-menu-icon" slot="graphic" class="fg pink" icon="icons:build">build</mwc-icon>
              <span class="full-menu">${_t("console.menu.Maintenance")}</span>
            </mwc-list-item>
            <mwc-list-item graphic="icon" ?selected="${this._page === 'information'}" @click="${() => this._moveTo('/information')}" ?disabled="${!this.is_superadmin}">
              <mwc-icon id="information-menu-icon" slot="graphic" class="fg purple">info</mwc-icon>
              <span class="full-menu">${_t("console.menu.Information")}</span>
            </mwc-list-item>
    ` : html``}
          </mwc-list>
          <footer class="full-menu">
            <div class="terms-of-use" style="margin-bottom:10px;">
              <small style="font-size:11px;">
                <a @click="${() => this.showTOSAgreement()}">${_t("console.menu.TermsOfService")}</a>
                ·
                <a style="color:forestgreen;" @click="${() => this.showPPAgreement()}">${_t("console.menu.PrivacyPolicy")}</a>
                ·
                <a @click="${() => this.splash.show()}">${_t("console.menu.AboutBackendAI")}</a>
                ${this.allow_signout === true ? html`
                ·
                <a @click="${() => this.loginPanel.signout()}">${_t("console.menu.LeaveService")}</a>
                ` : html``}
              </small>
            </div>
            <address>
              <small class="sidebar-footer">Lablup Inc.</small>
              <small class="sidebar-footer" style="font-size:9px;">20.9.0.200918</small>
            </address>
          </footer>
          <div id="sidebar-navbar-footer" class="vertical start end-justified layout">
            <backend-ai-help-button active style="margin-left:4px;"></backend-ai-help-button>
            <mwc-icon-button id="usersettings-menu-icon" icon="settings" slot="graphic" class="fg ${this._page === 'usersettings' ? 'yellow' : 'white'}" style="margin-left:4px;" @click="${() => this._moveTo('/usersettings')}"></mwc-icon-button>
          </div>
        </div>
        <div id="app-content" slot="appContent">
          <mwc-drawer id="content-body">
            <div class="sidepanel-drawer">
              <backend-ai-sidepanel-notification class="sidepanel" ?active="${this._sidepanel === 'notification'}"></backend-ai-sidepanel-notification>
              <backend-ai-sidepanel-task class="sidepanel" ?active="${this._sidepanel === 'task'}"></backend-ai-sidepanel-task>
            </div>
            <div slot="appContent">
              <mwc-top-app-bar-fixed prominent id="main-toolbar" class="draggable">
                <mwc-icon-button id="drawer-toggle-button" icon="menu" slot="navigationIcon" @click="${() => this.toggleDrawer()}"></mwc-icon-button>
                <h2 style="font-size:24px!important;" slot="title">${this.menuTitle}</h2>
                <div slot="actionItems">
                  <div id="group-select-box" style="height:48px;"></div>
                </div>
                <div slot="actionItems">
                  <div class="vertical center-justified flex layout" style="height:48px;">
                    <span class="email" style="font-size: 11px;line-height:22px;text-align:left;-webkit-font-smoothing:antialiased;">${_t("console.menu.FullName")}</span>
                    <span class="full_name" style="font-size: 14px;text-align:right;-webkit-font-smoothing:antialiased;">${this.full_name}</span>
                    <!--<div style="font-size: 12px;text-align:right">${this.domain !== 'default' && this.domain !== '' ? html`${this.domain}` : html``}</div>-->
                  </div>
                </div>
                <mwc-icon-button slot="actionItems" id="dropdown-button" style="margin-top:4px;"
                                 icon="more_vert"
                                 @click="${() => this._toggleDropdown()}">
                </mwc-icon-button>
                <mwc-menu id="dropdown-menu" class="user-menu" absolute x=-10 y=55>
                  ${this.domain !== 'default' && this.domain !== '' ? html`
                  <mwc-list-item class="horizontal layout start center" disabled style="border-bottom:1px solid #ccc;">
                      ${this.domain}
                  </mwc-list-item>
                  ` : html``}
                  <mwc-list-item class="horizontal layout start center" disabled style="border-bottom:1px solid #ccc;">
                      ${this.user_id}
                  </mwc-list-item>
                  <mwc-list-item class="horizontal layout start center" @click="${() => this.splash.show()}">
                      <mwc-icon style="color:#242424;padding-right:10px;">info</mwc-icon>
                      ${_t("console.menu.AboutBackendAI")}
                  </mwc-list-item>
                  <mwc-list-item class="horizontal layout start center" @click="${() => this._openUserPrefDialog()}">
                      <mwc-icon style="color:#242424;padding-right:10px;">lock</mwc-icon>
                      ${_t("console.menu.ChangeUserInformation")}
                  </mwc-list-item>
                  <mwc-list-item class="horizontal layout start center" @click="${() => this._moveToUserSettingsPage()}">
                      <mwc-icon style="color:#242424;padding-right:10px;">drag_indicator</mwc-icon>
                      ${_t("console.menu.Preferences")}
                  </mwc-list-item>
                  <mwc-list-item class="horizontal layout start center" @click="${() => this._moveToLogPage()}">
                      <mwc-icon style="color:#242424;padding-right:10px;">assignment</mwc-icon>
                      ${_t("console.menu.LogsErrors")}
                  </mwc-list-item>
                  <mwc-list-item class="horizontal layout start center" id="sign-button" @click="${() => this.logout()}">
                      <mwc-icon style="color:#242424;padding-right:10px;">logout</mwc-icon>
                      ${_t("console.menu.LogOut")}
                  </mwc-list-item>
                </mwc-menu>
              </mwc-top-app-bar-fixed>

              <div class="content">
                <div id="navbar-top" class="navbar-top horizontal flex layout wrap"></div>
                <section role="main" id="content" class="container layout vertical center">
                  <div id="app-page">
                    <backend-ai-summary-view class="page" name="summary" ?active="${this._page === 'summary'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-summary-view>
                    <backend-ai-import-view class="page" name="import" ?active="${this._page === 'github' || this._page === 'import'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-import-view>
                    <backend-ai-session-view class="page" name="job" ?active="${this._page === 'job'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-session-view>
                    <backend-ai-experiment-view class="page" name="experiment" ?active="${this._page === 'experiment'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-experiment-view>
                    <backend-ai-usersettings-view class="page" name="usersettings" ?active="${this._page === 'usersettings'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-usersettings-view>
                    <backend-ai-credential-view class="page" name="credential" ?active="${this._page === 'credential'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-credential-view>
                    <backend-ai-agent-view class="page" name="agent" ?active="${this._page === 'agent'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-agent-view>
                    <backend-ai-data-view class="page" name="data" ?active="${this._page === 'data'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-data-view>
                    <backend-ai-environment-view class="page" name="environment" ?active="${this._page === 'environment'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-environment-view>
                    <backend-ai-settings-view class="page" name="settings" ?active="${this._page === 'settings'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-settings-view>
                    <backend-ai-maintenance-view class="page" name="maintenance" ?active="${this._page === 'maintenance'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-maintenance-view>
                    <backend-ai-information-view class="page" name="information" ?active="${this._page === 'information'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-information-view>
                    <backend-ai-statistics-view class="page" name="statistics" ?active="${this._page === 'statistics'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-statistics-view>
                    <backend-ai-email-verification-view class="page" name="email-verification" ?active="${this._page === 'verify-email'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-email-verification-view>
                    <backend-ai-change-forgot-password-view class="page" name="change-forgot-password" ?active="${this._page === 'change-password'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-change-forgot-password-view>
                    <backend-ai-error-view class="page" name="error" ?active="${this._page === 'error'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-error-view>
                  </div>
                </section>
              </div>
            </div>
          </mwc-drawer>
        </div>
      </mwc-drawer>
      <div id="mini-tooltips" style="display:${this.mini_ui ? "block" : "none"};">
        <wl-popover anchor="#mini-ui-toggle-button" .anchorOpenEvents="${["mouseover"]}" fixed disablefocustrap
           anchororiginx="right" anchororiginy="center" transformoriginx="left" transformOriginY="center">
          <wl-popover-card>
            <div style="padding:5px">
              <mwc-icon-button disabled class="side-menu fg ${this.contentBody && this.contentBody.open === true && this._sidepanel === 'feedback' ? 'red' : 'black'}" id="feedback-icon-popover" icon="question_answer"></mwc-icon-button>
              <mwc-icon-button class="side-menu fg ${this.contentBody && this.contentBody.open === true && this._sidepanel === 'notification' ? 'red' : 'black'}" id="notification-icon-popover" icon="notification_important" @click="${() => this._openSidePanel('notification')}"></mwc-icon-button>
              <mwc-icon-button class="side-menu fg ${this.contentBody && this.contentBody.open === true && this._sidepanel === 'task' ? 'red' : 'black'}" id="task-icon-popover" icon="ballot" @click="${() => this._openSidePanel('task')}"></mwc-icon-button>
            </div>
          </wl-popover-card>
        </wl-popover>
      </div>
      <backend-ai-offline-indicator ?active="${this._offlineIndicatorOpened}">
        ${this._offline ? _t("console.YouAreOffline") : _t("console.YouAreOnline")}.
      </backend-ai-offline-indicator>
      <backend-ai-login active id="login-panel"></backend-ai-login>
      <backend-ai-splash id="about-backendai-panel"></backend-ai-splash>
      <lablup-notification id="notification"></lablup-notification>
      <backend-ai-indicator-pool id="indicator"></backend-ai-indicator-pool>
      <lablup-terms-of-service id="terms-of-service" block></lablup-terms-of-service>
      <backend-ai-dialog id="user-preference-dialog" fixed backdrop>
        <span slot="title">${_t("console.menu.ChangeUserInformation")}</span>
        <div slot="content" class="layout vertical" style="width:300px;">
          <mwc-textfield id="pref-original-name" type="text"
              label="${_t('console.menu.FullName')}" max-length="30" autofocus
              style="margin-bottom:20px;" value="${this.full_name}">
          </mwc-text-field>
        </div>
        <div slot="content" class="layout vertical" style="width:300px;">
          <mwc-textfield id="pref-original-password" type="password"
              label="${_t('console.menu.OriginalPassword')}" max-length="30"
              style="margin-bottom:20px;">
          </mwc-textfield>
          <div class="horizontal flex layout">
            <mwc-textfield id="pref-new-password" label="${_t('console.menu.NewPassword')}"
                type="password" min-length="8" max-length="30"
                auto-validate validationMessage="${_t('console.menu.InvalidPasswordMessage')}"
                pattern="^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$"
                @change="${this._validatePassword}">
            </mwc-textfield>
            <mwc-icon-button-toggle off onIcon="visibility" offIcon="visibility_off"
                                      @click="${(e) => this._togglePasswordVisibility(e.target)}">
            </mwc-icon-button-toggle>   
          </div>
          <div class="horizontal flex layout">
            <mwc-textfield id="pref-new-password2" label="${_t('console.menu.NewPasswordAgain')}"
                type="password" min-length="8" max-length="30"
                @change="${this._validatePassword}">
            </mwc-textfield>
            <mwc-icon-button-toggle off onIcon="visibility" offIcon="visibility_off"
                                      @click="${(e) => this._togglePasswordVisibility(e.target)}">
              </mwc-icon-button-toggle>   
          </div>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <div class="flex"></div>
          <wl-button class="cancel" inverted flat @click="${this._hideUserPrefDialog}">${_t("console.menu.Cancel")}</wl-button>
          <wl-button class="ok" @click="${() => this._updateUserInformation()}">${_t("console.menu.Update")}</wl-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-app-launcher id="app-launcher"></backend-ai-app-launcher>
      <backend-ai-resource-broker id="resource-broker" ?active="${this.is_connected}"></backend-ai-resource-broker>
    `;
  }

  /**
   * Change the state.
   *
   * @param {object} state
   */
  stateChanged(state) {
    this._page = state.app.page;
    this._pageParams = state.app.params;
    this._offline = state.app.offline;
    this._offlineIndicatorOpened = state.app.offlineIndicatorOpened;
    this._drawerOpened = state.app.drawerOpened;
    globalThis.currentPage = this._page;
    globalThis.currentPageParams = this._pageParams;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-console": BackendAIConsole;
  }
}
