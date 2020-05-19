/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {get as _text, registerTranslateConfig, translate as _t, use as setLanguage} from "lit-translate";
import {customElement, html, LitElement, property} from "lit-element";
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
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-menu';

import toml from 'markty-toml';

import 'weightless/progress-spinner';
import 'weightless/popover';
import 'weightless/popover-card';

import './backend-ai-settings-store';
import './backend-ai-splash';
import './backend-ai-help-button';
import './lablup-notification';
import './backend-ai-indicator-pool';
import './lablup-terms-of-service';

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
  @property({type: Boolean}) _drawerOpened = false;
  @property({type: Boolean}) _offlineIndicatorOpened = false;
  @property({type: Boolean}) _offline = false;
  @property({type: Object}) config = Object();
  @property({type: Object}) appBody;
  @property({type: Object}) mainToolbar;
  @property({type: Object}) drawerToggleButton;
  @property({type: Object}) sidebarMenu;
  @property({type: Object}) TOSdialog = Object();
  @property({type: Boolean}) mini_ui = false;
  @property({type: String}) lang = 'default';
  @property({type: Array}) supportLanguageCodes = ["en", "ko"];

  constructor() {
    super();
  }

  static get styles() {
    return [
      BackendAiConsoleStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning];
  }

  firstUpdated() {
    globalThis.lablupNotification = this.shadowRoot.querySelector('#notification');
    globalThis.lablupIndicator = this.shadowRoot.querySelector('#indicator');
    this.notification = globalThis.lablupNotification;
    this.appBody = this.shadowRoot.querySelector('#app-body');
    this.mainToolbar = this.shadowRoot.querySelector('#main-toolbar');
    this.drawerToggleButton = this.shadowRoot.querySelector('#drawer-toggle-button');
    this.sidebarMenu = this.shadowRoot.getElementById('sidebar-menu');
    this.splash = this.shadowRoot.querySelector('#about-panel');
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
      document.addEventListener('backend-ai-logout', this.logout.bind(this, true));
      document.addEventListener('backend-ai-app-close', this.close_app_window.bind(this, true));
      document.addEventListener('backend-ai-show-splash', this.splash.show.bind(this));
    } else {
      configPath = '../../config.toml';
      document.addEventListener('backend-ai-logout', this.logout.bind(this, false));
    }
    this._parseConfig(configPath).then(() => {
      this.loadConfig(this.config);
      if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
        this.loginPanel.login();
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
    document.addEventListener('backend-ai-connected', this.refreshPage.bind(this));
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
  }

  disconnectedCallback() {
    document.removeEventListener('backend-ai-connected', this.refreshPage.bind(this));
    super.disconnectedCallback();
  }

  attributeChangedCallback(name, oldval, newval) {
    super.attributeChangedCallback(name, oldval, newval);
  }

  shouldUpdate(changedProperties) {
    return this.hasLoadedStrings && super.shouldUpdate(changedProperties);
  }

  loadConfig(config) {
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
      //console.log(this.edition);
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

  refreshPage() {
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
  }

  showUpdateNotifier() {
    let indicator = <any>this.shadowRoot.getElementById('backend-ai-indicator');
    indicator.innerHTML = 'New console available. Please <a onclick="globalThis.location.reload()">reload</a> to update.';
    indicator.show();
  }

  _parseConfig(fileName) {
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

  toggleSidebarUI() {
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

  _changeDrawerLayout(width, height) {
    if (width < 700) {  // Close drawer
      this.appBody.style.setProperty('--mdc-drawer-width', '190px');
      this.appBody.type = 'modal';
      this.appBody.open = false;
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
      } else {
        this.appBody.style.setProperty('--mdc-drawer-width', '190px');
        this.mainToolbar.style.setProperty('--mdc-drawer-width', '190px');
      }
      this.appBody.type = 'dismissible';
      this.appBody.open = true;
      this.drawerToggleButton.style.display = 'none';
    }
  }

  _refreshUserInfoPanel() {
    this.user_id = globalThis.backendaiclient.email;
    this.domain = globalThis.backendaiclient._config.domainName;
    this.current_group = this._readRecentProjectGroup();
    globalThis.backendaiclient.current_group = this.current_group;
    this.groups = globalThis.backendaiclient.groups;
    let groupSelectionBox: HTMLElement = this.shadowRoot.getElementById('group-select-box');
    // Detached from template to support live-update after creating new group (will need it)
    if (groupSelectionBox.hasChildNodes()) {
      groupSelectionBox.removeChild(groupSelectionBox.firstChild as ChildNode);
    }
    let select = document.createElement('mwc-multi-select');
    select.label = _text("console.menu.Project");
    select.id = 'group-select';
    select.value = this.current_group;
    //select.setAttribute('naturalMenuWidth', 'true');
    select.setAttribute('fullwidth', 'true');
    select.addEventListener('selected', this.changeGroup.bind(this));
    let opt = document.createElement('mwc-list-item');
    opt.setAttribute('disabled', 'true');
    opt.innerHTML = _text("console.menu.SelectProject");
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

  _loadPageElement() {
    if (this._page === 'index.html' || this._page === '') {
      this._page = 'summary';
      navigate(decodeURIComponent('/'));
    }
  }

  _openUserPrefDialog() {
    const dialog = this.shadowRoot.querySelector('#user-preference-dialog');
    dialog.show();
  }

  _hideUserPrefDialog() {
    this.shadowRoot.querySelector('#user-preference-dialog').hide();
  }

  _updateUserPassword() {
    const dialog = this.shadowRoot.querySelector('#user-preference-dialog');
    const oldPassword = dialog.querySelector('#pref-original-password').value;
    const newPassword = dialog.querySelector('#pref-new-password').value;
    const newPassword2 = dialog.querySelector('#pref-new-password2').value;
    if (!oldPassword) {
      this.notification.text = 'Enter old password';
      this.notification.show();
      return;
    }
    if (!newPassword) {
      this.notification.text = 'Enter new password';
      this.notification.show();
      return;
    }
    if (newPassword !== newPassword2) {
      this.notification.text = 'Two new passwords do not match';
      this.notification.show();
      return;
    }
    const p = globalThis.backendaiclient.updatePassword(oldPassword, newPassword, newPassword2);
    p.then((resp) => {
      this.notification.text = 'Password updated';
      this.notification.show();
      this._hideUserPrefDialog();
      this.shadowRoot.querySelector('#prefj-original-password').value = '';
      this.shadowRoot.querySelector('#prefj-new-password').value = '';
      this.shadowRoot.querySelector('#prefj-new-password2').value = '';
    }).catch((err) => {
      if (err && err.title) {
        this.notification.text = err.title;
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  _menuSelected(e) {
    // Reserved for future use.
  }

  updated(changedProps: any) {
    if (changedProps.has('_page')) {
      let view: string = this._page;
      // load data for view
      if (['summary', 'job', 'agent', 'credential', 'data', 'usersettings', 'environment', 'settings', 'maintenance', 'information', 'statistics'].includes(view) !== true) { // Fallback for Windows OS
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

  _updateSidebar(view) {
    switch (view) {
      case 'summary':
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
      case 'pipeline':
        this.menuTitle = _text("console.menu.Pipeline");
        this.updateTitleColor('var(--paper-light-blue-800)', '#efefef');
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
      default:
        this._page = 'error';
        this.menuTitle = _text("console.NOTFOUND");
        this.updateTitleColor('var(--paper-grey-800)', '#efefef');
    }
  }

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

  updateTitleColor(backgroundColorVal: string, colorVal: string) {
    (this.shadowRoot.querySelector('#main-toolbar') as HTMLElement).style.setProperty('--mdc-theme-primary', backgroundColorVal);
    (this.shadowRoot.querySelector('#main-toolbar') as HTMLElement).style.color = colorVal;
  }

  changeGroup(e) {
    globalThis.backendaiclient.current_group = e.target.value;
    this.current_group = globalThis.backendaiclient.current_group;
    this._writeRecentProjectGroup(globalThis.backendaiclient.current_group);
    let event = new CustomEvent("backend-ai-group-changed", {"detail": globalThis.backendaiclient.current_group});
    document.dispatchEvent(event);
  }

  toggleDrawer() {
    let drawer = this.shadowRoot.querySelector('mwc-drawer');
    if (drawer.open === true) {
      drawer.open = false;
    } else {
      drawer.open = true;
    }
  }

  _toggleDropdown() {
    let menu = this.shadowRoot.querySelector("#dropdown-menu");
    let menu_icon = this.shadowRoot.querySelector('#dropdown-button');
    menu.anchor = menu_icon;
    menu.open = !menu.open;
  }

  showTOSAgreement() {
    if (this.TOSdialog.show === false) {
      this.TOSdialog.tosContent = "";
      this.TOSdialog.tosLanguage = this.lang;
      this.TOSdialog.title = _t("console.menu.TermsOfService");
      this.TOSdialog.tosEntry = 'terms-of-service';
      this.TOSdialog.open();
    }
  }

  showPPAgreement() {
    if (this.TOSdialog.show === false) {
      this.TOSdialog.tosContent = "";
      this.TOSdialog.tosLanguage = this.lang;
      this.TOSdialog.title = _t("console.menu.PrivacyPolicy");
      this.TOSdialog.tosEntry = 'privacy-policy';
      this.TOSdialog.open();
    }
  }

  _moveTo(url) {
    globalThis.history.pushState({}, '', url);
    store.dispatch(navigate(decodeURIComponent(url), {}));
  }

  _moveToLogPage() {
    let currentPage = globalThis.location.toString().split(/[\/]+/).pop();
    globalThis.history.pushState({}, '', '/usersettings');
    store.dispatch(navigate(decodeURIComponent('/usersettings'), {tab: 'logs'}));
    if (currentPage && currentPage === 'usersettings') {
      let event = new CustomEvent('backend-ai-usersettings-logs', {});
      document.dispatchEvent(event);
    }
  }

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

  _writeRecentProjectGroup(value: string) {
    let endpointId = globalThis.backendaiclient._config.endpointHost.replace(/\./g, '_'); // dot is used for namespace divider
    globalThis.backendaioptions.set('projectGroup.' + endpointId, value ? value : globalThis.backendaiclient.current_group);
  }

  _deleteRecentProjectGroupInfo() {
    let endpointId = globalThis.backendaiclient._config.endpointHost.replace(/\./g, '_'); // dot is used for namespace divider
    globalThis.backendaioptions.delete('projectGroup.' + endpointId);
  }

  _moveToUserSettingsPage() {
    let currentPage = globalThis.location.toString().split(/[\/]+/).pop();
    globalThis.history.pushState({}, '', '/usersettings');
    store.dispatch(navigate(decodeURIComponent('/usersettings'), {tab: 'general'}));
    if (currentPage && currentPage === 'usersettings') {
      let event = new CustomEvent('backend-ai-usersettings', {});
      document.dispatchEvent(event);
    }
  }

  protected render() {
    // language=HTML
    return html`
      <div id="loading-curtain" class="loading-background"></div>
      <mwc-drawer id="app-body" class="${this.mini_ui ? "mini-ui" : ""}" style="visibility:hidden;">
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
          <div class="horizontal start-justified layout">
            <mwc-icon-button id="mini-ui-toggle-button" style="color:#fff;padding-left:5px;" icon="menu" slot="navigationIcon" @click="${() => this.toggleSidebarUI()}"></mwc-icon-button>
            <div id="group-select-box" class="full-menu" style="height:50px;"></div>
          </div>
          <mwc-list id="sidebar-menu" class="sidebar list" @selected="${(e) => this._menuSelected(e)}">
            <mwc-list-item graphic="icon" ?selected="${this._page === 'summary'}" @click="${() => this._moveTo('/summary')}">
              <mwc-icon id="summary-menu-icon" slot="graphic" id="activities-icon" class="fg green">widgets</mwc-icon>
              <span class="full-menu">${_t("console.menu.Summary")}</span>
            </mwc-list-item>
            <mwc-list-item graphic="icon" ?selected="${this._page === 'job'}" @click="${() => this._moveTo('/job')}">
              <mwc-icon id="sessions-menu-icon" slot="graphic" class="fg red">ballot</mwc-icon>
              <span class="full-menu">${_t("console.menu.Sessions")}</span>
            </mwc-list-item>
            ${false ? html`
            <mwc-list-item graphic="icon" ?selected="${this._page === 'experiment'}" @click="${() => this._moveTo('/experiment')}">
              <mwc-icon slot="graphic" class="fg blue">pageview</mwc-icon>
              <span class="full-menu">${_t("console.menu.Experiments")}</span>
            </mwc-list-item>` : html``}
            <mwc-list-item graphic="icon" ?selected="${this._page === 'data'}" @click="${() => this._moveTo('/data')}">
              <mwc-icon id="data-menu-icon" slot="graphic" class="fg orange">cloud_upload</mwc-icon>
              <span class="full-menu">${_t("console.menu.Data&Storage")}</span>
            </mwc-list-item>
            ${true ? html`
            <mwc-list-item graphic="icon" ?selected="${this._page === 'pipeline'}" @click="${() => this._moveTo('/pipeline')}">
              <mwc-icon slot="graphic" class="fg blue">pageview</mwc-icon>
              <span class="full-menu">${_t("console.menu.Pipeline")}</span>
            </mwc-list-item>` : html``}
            <mwc-list-item graphic="icon" ?selected="${this._page === 'statistics'}" @click="${() => this._moveTo('/statistics')}">
              <mwc-icon id="statistics-menu-icon" slot="graphic" class="fg cyan" icon="icons:assessment">assessment</mwc-icon>
              <span class="full-menu">${_t("console.menu.Statistics")}</span>
            </mwc-list-item>
            <mwc-list-item graphic="icon" ?selected="${this._page === 'usersettings'}" @click="${() => this._moveTo('/usersettings')}">
              <mwc-icon id="usersettings-menu-icon" slot="graphic" class="fg teal" icon="icons:settings">settings</mwc-icon>
              <span class="full-menu">${_t("console.menu.Settings")}</span>
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
              <mwc-icon id="configurations-menu-icon" slot="graphic" class="fg green" icon="icons:settings">settings</mwc-icon>
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
            <div class="terms-of-use" style="margin-bottom:50px;">
              <small style="font-size:11px;">
                <a @click="${() => this.showTOSAgreement()}">${_t("console.menu.TermsOfService")}</a>
                ·
                <a style="color:forestgreen;" @click="${() => this.showPPAgreement()}">${_t("console.menu.PrivacyPolicy")}</a>
                ·
                <a @click="${() => this.splash.show()}">${_t("console.menu.About")}</a>
                ${this.allow_signout === true ? html`
                ·
                <a @click="${() => this.loginPanel.signout()}">${_t("console.menu.LeaveService")}</a>
                ` : html``}
              </small>
            </div>
          </footer>
          <div id="sidebar-navbar-footer" class="vertical center center-justified layout full-menu">
            <address>
              <small class="sidebar-footer">Lablup Inc.</small>
              <small class="sidebar-footer" style="font-size:9px;">20.05.3.200515</small>
            </address>
          </div>
        </div>
        <div class="mini-menu">
          <wl-popover anchor="#summary-menu-icon" .anchorOpenEvents="${["mouseover"]}" fixed disablefocustrap
             anchororiginx="right" anchororiginy="center" transformoriginx="left" transformOriginY="center">
             <wl-popover-card><div style="padding:5px">${_t("console.menu.Summary")}</div></wl-popover-card>
          </wl-popover>
          <wl-popover anchor="#sessions-menu-icon" .anchorOpenEvents="${["mouseover"]}" fixed disablefocustrap
             anchororiginx="right" anchororiginy="center" transformoriginx="left" transformOriginY="center">
             <wl-popover-card><div style="padding:5px">${_t("console.menu.Sessions")}</div></wl-popover-card>
          </wl-popover>
          <wl-popover anchor="#data-menu-icon" .anchorOpenEvents="${["mouseover"]}" fixed disablefocustrap
             anchororiginx="right" anchororiginy="center" transformoriginx="left" transformOriginY="center">
             <wl-popover-card><div style="padding:5px">${_t("console.menu.Data&Storage")}</div></wl-popover-card>
          </wl-popover>
          <wl-popover anchor="#statistics-menu-icon" .anchorOpenEvents="${["mouseover"]}" fixed disablefocustrap
             anchororiginx="right" anchororiginy="center" transformoriginx="left" transformOriginY="center">
             <wl-popover-card><div style="padding:5px">${_t("console.menu.Statistics")}</div></wl-popover-card>
          </wl-popover>
          <wl-popover anchor="#usersettings-menu-icon" .anchorOpenEvents="${["mouseover"]}" fixed disablefocustrap
             anchororiginx="right" anchororiginy="center" transformoriginx="left" transformOriginY="center">
             <wl-popover-card><div style="padding:5px">${_t("console.menu.Settings")}</div></wl-popover-card>
          </wl-popover>
          ${this.is_admin ? html`
            <wl-popover anchor="#user-menu-icon" .anchorOpenEvents="${["mouseover"]}" fixed disablefocustrap
               anchororiginx="right" anchororiginy="center" transformoriginx="left" transformOriginY="center">
               <wl-popover-card><div style="padding:5px">${_t("console.menu.Users")}</div></wl-popover-card>
            </wl-popover>
          `: html``}
          ${this.is_superadmin ? html`
            <wl-popover anchor="#resources-menu-icon" .anchorOpenEvents="${["mouseover"]}" fixed disablefocustrap
               anchororiginx="right" anchororiginy="center" transformoriginx="left" transformOriginY="center">
               <wl-popover-card><div style="padding:5px">${_t("console.menu.Resources")}</div></wl-popover-card>
            </wl-popover>
            <wl-popover anchor="#environments-menu-icon" .anchorOpenEvents="${["mouseover"]}" fixed disablefocustrap
               anchororiginx="right" anchororiginy="center" transformoriginx="left" transformOriginY="center">
               <wl-popover-card><div style="padding:5px">${_t("console.menu.Environments")}</div></wl-popover-card>
            </wl-popover>
            <wl-popover anchor="#configurations-menu-icon" .anchorOpenEvents="${["mouseover"]}" fixed disablefocustrap
               anchororiginx="right" anchororiginy="center" transformoriginx="left" transformOriginY="center">
               <wl-popover-card><div style="padding:5px">${_t("console.menu.Configurations")}</div></wl-popover-card>
            </wl-popover>
            <wl-popover anchor="#maintenance-menu-icon" .anchorOpenEvents="${["mouseover"]}" fixed disablefocustrap
               anchororiginx="right" anchororiginy="center" transformoriginx="left" transformOriginY="center">
               <wl-popover-card><div style="padding:5px">${_t("console.menu.Maintenance")}</div></wl-popover-card>
            </wl-popover>
            <wl-popover anchor="#information-menu-icon" .anchorOpenEvents="${["mouseover"]}" fixed disablefocustrap
               anchororiginx="right" anchororiginy="center" transformoriginx="left" transformOriginY="center">
               <wl-popover-card><div style="padding:5px">${_t("console.menu.Information")}</div></wl-popover-card>
            </wl-popover>
          `: html``}
        </div>
        <div slot="appContent">
          <mwc-top-app-bar-fixed prominent id="main-toolbar" class="draggable">
            <mwc-icon-button id="drawer-toggle-button" icon="menu" slot="navigationIcon" @click="${() => this.toggleDrawer()}"></mwc-icon-button>
            <h2 style="font-size:24px!important;" slot="title">${this.menuTitle}</h2>
            <div slot="actionItems" class="vertical end-justified flex layout">
              <span class="email" style="margin-top:4px;font-size: 14px;text-align:right">${this.user_id}</span>
              <div style="font-size: 12px;text-align:right">${this.domain}</div>
            </div>
            <backend-ai-help-button slot="actionItems" active></backend-ai-help-button>
            <mwc-icon-button slot="actionItems" id="dropdown-button"
                             icon="account_circle"
                             @click="${() => this._toggleDropdown()}">
            </mwc-icon-button>
            <mwc-menu id="dropdown-menu" class="user-menu" absolute x=-10 y=40>
              <mwc-list-item class="horizontal layout start center" @click="${() => this.splash.show()}">
                  <mwc-icon style="color:#242424;padding-right:10px;">info</mwc-icon>
                  ${_t("console.menu.About")}
              </mwc-list-item>
              <mwc-list-item class="horizontal layout start center" @click="${() => this._openUserPrefDialog()}">
                  <mwc-icon style="color:#242424;padding-right:10px;">lock</mwc-icon>
                  ${_t("console.menu.ChangePassword")}
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
                <backend-ai-summary-view class="page" name="summary" ?active="${this._page === 'summary'}"><wl-progress-spinner active></wl-progress-spinner></backend-ai-summary-view>
                <backend-ai-session-view class="page" name="job" ?active="${this._page === 'job'}"><wl-progress-spinner active></wl-progress-spinner></backend-ai-session-view>
                <backend-ai-pipeline-view class="page" name="pipeline" ?active="${this._page === 'pipeline'}"><wl-progress-spinner active></wl-progress-spinner></backend-ai-pipeline-view>
                <backend-ai-experiment-view class="page" name="experiment" ?active="${this._page === 'experiment'}"><wl-progress-spinner active></wl-progress-spinner></backend-ai-experiment-view>
                <backend-ai-usersettings-view class="page" name="usersettings" ?active="${this._page === 'usersettings'}"><wl-progress-spinner active></wl-progress-spinner></backend-ai-usersettings-view>
                <backend-ai-credential-view class="page" name="credential" ?active="${this._page === 'credential'}"><wl-progress-spinner active></wl-progress-spinner></backend-ai-credential-view>
                <backend-ai-agent-view class="page" name="agent" ?active="${this._page === 'agent'}"><wl-progress-spinner active></wl-progress-spinner></backend-ai-agent-view>
                <backend-ai-data-view class="page" name="data" ?active="${this._page === 'data'}"><wl-progress-spinner active></wl-progress-spinner></backend-ai-data-view>
                <backend-ai-environment-view class="page" name="environment" ?active="${this._page === 'environment'}"><wl-progress-spinner active></wl-progress-spinner></backend-ai-environment-view>
                <backend-ai-settings-view class="page" name="settings" ?active="${this._page === 'settings'}"><wl-progress-spinner active></wl-progress-spinner></backend-ai-settings-view>
                <backend-ai-maintenance-view class="page" name="maintenance" ?active="${this._page === 'maintenance'}"><wl-progress-spinner active></wl-progress-spinner></backend-ai-maintenance-view>
                <backend-ai-information-view class="page" name="information" ?active="${this._page === 'information'}"><wl-progress-spinner active></wl-progress-spinner></backend-ai-information-view>
                <backend-ai-statistics-view class="page" name="statistics" ?active="${this._page === 'statistics'}"><wl-progress-spinner active></wl-progress-spinner></backend-ai-statistics-view>
                <backend-ai-error-view class="page" name="error" ?active="${this._page === 'error'}"><wl-progress-spinner active></wl-progress-spinner></backend-ai-error-view>
              </div>
            </section>
          </div>
        </div>
      </mwc-drawer>
      <backend-ai-offline-indicator ?active="${this._offlineIndicatorOpened}">
        ${this._offline ? _t("console.YouAreOffline") : _t("console.YouAreOnline")}.
      </backend-ai-offline-indicator>
      <backend-ai-login active id="login-panel"></backend-ai-login>
      <backend-ai-splash id="about-panel"></backend-ai-splash>
      <lablup-notification id="notification"></lablup-notification>
      <backend-ai-indicator-pool id="indicator"></backend-ai-indicator-pool>
      <lablup-terms-of-service id="terms-of-service" block></lablup-terms-of-service>
      <wl-dialog id="user-preference-dialog" fixed backdrop blockscrolling>
       <wl-title level="3" slot="header">${_t("console.menu.ChangePassword")}</wl-title>
       <div slot="content">
        <wl-textfield id="pref-original-password" type="password" label="${_t("console.menu.OriginalPassword")}" maxLength="30"></wl-textfield>
        <wl-textfield id="pref-new-password" type="password" label="${_t("console.menu.NewPassword")}" maxLength="30"></wl-textfield>
        <wl-textfield id="pref-new-password2" type="password" label="${_t("console.menu.NewPasswordAgain")}" maxLength="30"></wl-textfield>
       </div>
       <div slot="footer">
        <wl-button class="cancel" inverted flat @click="${this._hideUserPrefDialog}">${_t("console.menu.Cancel")}</wl-button>
        <wl-button class="ok" @click="${this._updateUserPassword}">${_t("console.menu.Update")}</wl-button>
       </div>
      </wl-dialog>
    `;
  }

  stateChanged(state) {
    this._page = state.app.page;
    this._offline = state.app.offline;
    this._offlineIndicatorOpened = state.app.offlineIndicatorOpened;
    this._drawerOpened = state.app.drawerOpened;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-console": BackendAIConsole;
  }
}
