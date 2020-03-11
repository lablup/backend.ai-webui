/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
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
import '@material/mwc-menu';
import '@material/mwc-list/mwc-list-item';

import toml from 'markty-toml';

import 'weightless/select';
import 'weightless/progress-spinner';

import './backend-ai-splash';
import './lablup-notification';
import './lablup-terms-of-service';

import '../lib/backend.ai-client-es6';
import {BackendAiStyles} from './backend-ai-general-styles';
import {BackendAiConsoleStyles} from './backend-ai-console-styles';

import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';
import './backend-ai-offline-indicator';
import './backend-ai-login';

/**
 Backend.AI GUI Console

 `backend-ai-console` is a shell of Backend.AI GUI console (web / app).

 Example:

 <backend-ai-console>
 ... content ...
 </backend-ai-console>

 @group Backend.AI Console
 @element backend-ai-console
 */

declare global {
  interface Window {
    backendaiclient: any;
    backendaiconsole: any;
    backendaiwsproxy: any;
    isElectron: boolean;
    buildVersion: string;
    packageVersion: string;
    packageEdition: string;
    packageValidUntil: string;
    __local_proxy: string;
    lablupNotification: any;
    mini_ui: boolean;
    process: any;
  }

  interface ai {
    backend: any;
  }
}

@customElement("backend-ai-console")
export default class BackendAIConsole extends connect(store)(LitElement) {
  public shadowRoot: any; // ShadowRoot
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
  @property({type: Object}) options = Object();

  constructor() {
    super();
    this.options = {
      compact_sidebar: false,
      preserve_login: false,
      beta_feature: false
    }
  }

  static get styles() {
    return [
      BackendAiStyles,
      BackendAiConsoleStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning];
  }

  firstUpdated() {
    window.lablupNotification = this.shadowRoot.querySelector('#notification');
    this.notification = window.lablupNotification;
    this.appBody = this.shadowRoot.querySelector('#app-body');
    this.mainToolbar = this.shadowRoot.querySelector('#main-toolbar');
    this.drawerToggleButton = this.shadowRoot.querySelector('#drawer-toggle-button');
    this.sidebarMenu = this.shadowRoot.getElementById('sidebar-menu');
    this.splash = this.shadowRoot.querySelector('#about-panel');
    this.loginPanel = this.shadowRoot.querySelector('#login-panel');
    this.TOSdialog = this.shadowRoot.querySelector('#terms-of-service');
    if (window.isElectron && navigator.platform.indexOf('Mac') >= 0) { // For macOS
      (this.shadowRoot.querySelector('.portrait-canvas') as HTMLElement).style.visibility = 'hidden';
    }
    installRouter((location) => store.dispatch(navigate(decodeURIComponent(location.pathname))));
    installOfflineWatcher((offline) => store.dispatch(updateOffline(offline)));
    let configPath;
    if (window.isElectron) {
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
      if (typeof window.backendaiclient === "undefined" || window.backendaiclient === null || window.backendaiclient.ready === false) {
        this.loginPanel.login();
      }
    }).catch(err => {
      console.log("Initialization failed.");
      if (typeof window.backendaiclient === "undefined" || window.backendaiclient === null || window.backendaiclient.ready === false) {
        this.loginPanel.block('Configuration is not loaded.', 'Error');
      }
    });
    this._readUserSettings();
    this.mini_ui = this.options['compact_sidebar'];
    window.mini_ui = this.mini_ui;

    this._changeDrawerLayout(document.body.clientWidth, document.body.clientHeight);
    window.addEventListener("resize", (event) => {
      this._changeDrawerLayout(document.body.clientWidth, document.body.clientHeight);
    });
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('backend-ai-connected', this.refreshPage.bind(this));
  }

  disconnectedCallback() {
    document.removeEventListener('backend-ai-connected', this.refreshPage.bind(this));
    super.disconnectedCallback();
  }

  attributeChangedCallback(name, oldval, newval) {
    super.attributeChangedCallback(name, oldval, newval);
  }

  loadConfig(config) {
    if (typeof config.general !== "undefined" && 'siteDescription' in config.general) {
      this.siteDescription = config.general.siteDescription;
    }
    if (typeof config.general !== "undefined" && 'connectionMode' in config.general) {
      this.connection_mode = config.general.connectionMode;
      console.log(this.connection_mode);
    }
    if (typeof config.general !== "undefined" && 'connectionServer' in config.general) {
      this.connection_server = config.general.connectionServer;
      console.log(this.connection_server);
    }
    if (typeof config.license !== "undefined" && 'edition' in config.license) {
      this.edition = config.license.edition;
      console.log(this.edition);
    }
    window.packageEdition = this.edition;
    if (typeof config.license !== "undefined" && 'validUntil' in config.license) {
      this.validUntil = config.license.validUntil;
      console.log(this.validUntil);
    }
    window.packageValidUntil = this.validUntil;
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
        // TODO : multiple sidebar plugins
        this.plugins['page'] = config.plugin.page;
      }
      if ('sidebar' in config.plugin) {
        // TODO : multiple sidebar plugins
        this.plugins['sidebar'] = config.plugin.sidebar;
      }
    }
    this.loginPanel.refreshWithConfig(config);
  }

  _readUserSettings() { // Read all user settings.
    for (let i = 0, len = localStorage.length; i < len; ++i) {
      if (localStorage.key(i)!.startsWith('backendaiconsole.usersetting.')) {
        let key = localStorage.key(i)!.replace('backendaiconsole.usersetting.', '');
        this._readUserSetting(key);
      }
    }
  }

  _readUserSetting(name, default_value = true) {
    let value: string | null = localStorage.getItem('backendaiconsole.usersetting.' + name);
    if (value !== null && value != '' && value != '""') {
      if (value === "false") {
        this.options[name] = false;
      } else if (value === "true") {
        this.options[name] = true;
      } else {
        this.options[name] = value;
      }
    } else {
      this.options[name] = default_value;
    }
  }

  refreshPage() {
    (this.shadowRoot.getElementById('sign-button') as any).icon = 'exit_to_app';
    this.is_connected = true;
    window.backendaiclient.proxyURL = this.proxy_url;
    if (typeof window.backendaiclient !== "undefined" && window.backendaiclient != null
      && typeof window.backendaiclient.is_admin !== "undefined" && window.backendaiclient.is_admin === true) {
      this.is_admin = true;
    } else {
      this.is_admin = false;
    }
    if (typeof window.backendaiclient !== "undefined" && window.backendaiclient != null
      && typeof window.backendaiclient.is_superadmin !== "undefined" && window.backendaiclient.is_superadmin === true) {
      this.is_superadmin = true;
    } else {
      this.is_superadmin = false;
    }
    this._refreshUserInfoPanel();
    this._writeRecentProjectGroup(this.current_group);
  }

  showUpdateNotifier() {
    let indicator = <any>this.shadowRoot.getElementById('backend-ai-indicator');
    indicator.innerHTML = 'New console available. Please <a onclick="window.location.reload()">reload</a> to update.';
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
    window.mini_ui = this.mini_ui;
    let event = new CustomEvent('backend-ai-ui-changed', {"detail": {"mini-ui": this.mini_ui}});
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
        window.mini_ui = this.mini_ui;
      }
    } else { // Open drawer
      if (this.mini_ui) {
        this.appBody.style.setProperty('--mdc-drawer-width', '71px');
        this.mainToolbar.style.setProperty('--mdc-drawer-width', '71px');
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
    this.user_id = window.backendaiclient.email;
    this.domain = window.backendaiclient._config.domainName;
    this.current_group = this._readRecentProjectGroup();
    window.backendaiclient.current_group = this.current_group;
    this.groups = window.backendaiclient.groups;
    let groupSelectionBox = this.shadowRoot.getElementById('group-select-box');
    if (window.backendaiclient.isAPIVersionCompatibleWith('v4.20190601') === false) {
      (this.shadowRoot.getElementById('group-select') as any).disabled = true;
      (this.shadowRoot.getElementById('group-select') as any).label = 'No Project';
    }
    // Detached from template to support live-update after creating new group (will need it)
    if (groupSelectionBox.hasChildNodes()) {
      groupSelectionBox.removeChild(groupSelectionBox.firstChild);
    }
    let select = document.createElement('wl-select');
    select.label = "Project";
    select.name = 'group-select';
    select.id = 'group-select';
    select.value = this.current_group;
    select.addEventListener('input', this.changeGroup.bind(this));
    let opt = document.createElement('option');
    opt.setAttribute('disabled', 'true');
    opt.innerHTML = 'Select Project';
    select.appendChild(opt);
    this.groups.map(group => {
      opt = document.createElement('option');
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
    const p = window.backendaiclient.updatePassword(oldPassword, newPassword, newPassword2);
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
      console.log(view);
      this._updateSidebar(view);
    }
  }

  _updateSidebar(view) {
    switch (view) {
      case 'summary':
        this.menuTitle = 'Summary';
        this.updateTitleColor('var(--paper-green-800)', '#efefef');
        break;
      case 'job':
        this.menuTitle = 'Sessions';
        this.updateTitleColor('var(--paper-red-800)', '#efefef');
        break;
      case 'experiment':
        this.menuTitle = 'Experiments';
        this.updateTitleColor('var(--paper-light-blue-800)', '#efefef');
        break;
      case 'data':
        this.menuTitle = 'Data & Storage';
        this.updateTitleColor('var(--paper-orange-800)', '#efefef');
        break;
      case 'statistics':
        this.menuTitle = 'Statistics';
        this.updateTitleColor('var(--paper-cyan-800)', '#efefef');
        break;
      case 'usersettings':
        this.menuTitle = 'Settings & Logs';
        this.updateTitleColor('var(--paper-teal-800)', '#efefef');
        break;
      case 'credential':
        this.menuTitle = 'User Credentials & Policies';
        this.updateTitleColor('var(--paper-lime-800)', '#efefef');
        break;
      case 'environment':
        this.menuTitle = 'Environments & Presets';
        this.updateTitleColor('var(--paper-yellow-800)', '#efefef');
        break;
      case 'agent':
        this.menuTitle = 'Computation Resources';
        this.updateTitleColor('var(--paper-light-blue-800)', '#efefef');
        break;
      case 'settings':
        this.menuTitle = 'Configurations';
        this.updateTitleColor('var(--paper-green-800)', '#efefef');
        break;
      case 'maintenance':
        this.menuTitle = 'Maintenance';
        this.updateTitleColor('var(--paper-pink-800)', '#efefef');
        break;
      case 'information':
        this.menuTitle = 'Information';
        this.updateTitleColor('var(--paper-purple-800)', '#efefef');
        break;
      case 'logs':
        this.menuTitle = 'Logs';
        this.updateTitleColor('var(--paper-deep-orange-800)', '#efefef');
        break;
      default:
        this.menuTitle = 'LOGIN REQUIRED';
    }
  }

  async close_app_window(performClose = false) {
    this._readUserSetting('preserve_login', false); // Refresh the option. (it can be changed during the session)
    if (this.options['preserve_login'] === false) { // Delete login information.
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
    if (typeof window.backendaiclient != 'undefined' && window.backendaiclient !== null) {
      if (window.backendaiclient._config.connectionMode === 'SESSION') {
        await window.backendaiclient.logout();
      }
      window.backendaiclient = null;
    }
  }

  async logout(performClose = false) {
    console.log('also close the app:', performClose);
    if (typeof window.backendaiclient != 'undefined' && window.backendaiclient !== null) {
      this.notification.text = 'Clean up now...';
      this.notification.show();
      if (window.backendaiclient._config.connectionMode === 'SESSION') {
        await window.backendaiclient.logout();
      }
      this.is_admin = false;
      this.is_superadmin = false;
      window.backendaiclient = null;
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
      } else if (window.isElectron) {
        this.user_id = '';
        this.domain = '';
        this._page = 'summary';
        window.history.pushState({}, '', '/summary');
        store.dispatch(navigate(decodeURIComponent('/')));
        this.loginPanel.login();
      } else {
        window.location.reload();
      }
    }
  }

  updateTitleColor(backgroundColorVal: string, colorVal: string) {
    (this.shadowRoot.querySelector('#main-toolbar') as HTMLElement).style.setProperty('--mdc-theme-primary', backgroundColorVal);
    (this.shadowRoot.querySelector('#main-toolbar') as HTMLElement).style.color = colorVal;
  }

  changeGroup(e) {
    window.backendaiclient.current_group = e.target.value;
    this.current_group = window.backendaiclient.current_group;
    this._writeRecentProjectGroup(window.backendaiclient.current_group);
    let event = new CustomEvent("backend-ai-group-changed", {"detail": window.backendaiclient.current_group});
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
      this.TOSdialog.title = "Terms of Service";
      this.TOSdialog.tosEntryURL = '/resources/documents/terms-of-service.html';
      this.TOSdialog.open();
    }
  }

  showPPAgreement() {
    if (this.TOSdialog.show === false) {
      this.TOSdialog.tosContent = "";
      this.TOSdialog.title = "Privacy Policy";
      this.TOSdialog.tosEntryURL = '/resources/documents/privacy-policy.html';
      this.TOSdialog.open();
    }
  }

  _moveTo(url) {
    window.history.pushState({}, '', url);
    store.dispatch(navigate(decodeURIComponent(url), {}));
  }

  _moveToLogPage() {
    let currentPage = window.location.toString().split(/[\/]+/).pop();
    window.history.pushState({}, '', '/usersettings');
    store.dispatch(navigate(decodeURIComponent('/usersettings'), {tab: 'logs'}));
    if (currentPage && currentPage === 'usersettings') {
      let event = new CustomEvent('backend-ai-usersettings-logs', {});
      document.dispatchEvent(event);
    }
  }

  _readRecentProjectGroup() {
    let value: string | null = sessionStorage.getItem('backendaiconsole.projectGroup');
    return value ? value : window.backendaiclient.current_group;
  }

  _writeRecentProjectGroup(value: string) {
    sessionStorage.setItem('backendaiconsole.projectGroup', value ? value : window.backendaiclient.current_group);
  }

  _moveToUserSettingsPage() {
    let currentPage = window.location.toString().split(/[\/]+/).pop();
    window.history.pushState({}, '', '/usersettings');
    store.dispatch(navigate(decodeURIComponent('/usersettings'), {tab: 'general'}));
    if (currentPage && currentPage === 'usersettings') {
      let event = new CustomEvent('backend-ai-usersettings', {});
      document.dispatchEvent(event);
    }
  }

  render() {
    // language=HTML
    return html`
      <mwc-drawer id="app-body" class="${this.mini_ui ? "mini-ui" : ""}">
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
              <mwc-icon slot="graphic" id="activities-icon" class="fg green">view_quilt</mwc-icon>
              <span class="full-menu">Summary</span>
            </mwc-list-item>
            <mwc-list-item graphic="icon" ?selected="${this._page === 'job'}" @click="${() => this._moveTo('/job')}">
              <mwc-icon slot="graphic" class="fg red">subject</mwc-icon>
              <span class="full-menu">Sessions</span>
            </mwc-list-item>
            ${false ? html`
            <mwc-list-item graphic="icon" ?selected="${this._page === 'experiment'}" @click="${() => this._moveTo('/experiment')}">
              <mwc-icon slot="graphic" class="fg blue">pageview</mwc-icon>
              <span class="full-menu">Experiments</span>
            </mwc-list-item>` : html``}
            <mwc-list-item graphic="icon" ?selected="${this._page === 'data'}" @click="${() => this._moveTo('/data')}">
              <mwc-icon slot="graphic" class="fg orange">cloud_upload</mwc-icon>
              <span class="full-menu">Data &amp; Storage</span>
            </mwc-list-item>
            <mwc-list-item graphic="icon" ?selected="${this._page === 'statistics'}" @click="${() => this._moveTo('/statistics')}">
              <mwc-icon slot="graphic" class="fg cyan" icon="icons:assessment">assessment</mwc-icon>
              <span class="full-menu">Statistics</span>
            </mwc-list-item>
            <mwc-list-item graphic="icon" ?selected="${this._page === 'usersettings'}" @click="${() => this._moveTo('/usersettings')}">
              <mwc-icon  slot="graphic" class="fg teal" icon="icons:settings">settings</mwc-icon>
              <span class="full-menu">Settings</span>
            </mwc-list-item>
            ${this.is_admin ?
      html`
            <h3 class="full-menu">Administration</h3>
            <mwc-list-item graphic="icon" ?selected="${this._page === 'credential'}" @click="${() => this._moveTo('/credential')}" ?disabled="${!this.is_admin}">
              <mwc-icon  slot="graphic" class="fg lime" icon="icons:face">face</mwc-icon>
              <span class="full-menu">Users</span>
            </mwc-list-item>
            <mwc-list-item graphic="icon" ?selected="${this._page === 'environment'}" @click="${() => this._moveTo('/environment')}" ?disabled="${!this.is_admin}">
              <mwc-icon slot="graphic" class="fg orange" icon="icons:extension">extension</mwc-icon>
              <span class="full-menu">Environments</span>
            </mwc-list-item>
    ` : html``}
            ${this.is_superadmin ?
      html`
            <mwc-list-item graphic="icon" ?selected="${this._page === 'agent'}" @click="${() => this._moveTo('/agent')}" ?disabled="${!this.is_superadmin}">
              <mwc-icon slot="graphic" class="fg blue" icon="hardware:device-hub">device_hub</mwc-icon>
              <span class="full-menu">Resources</span>
            </mwc-list-item>
            <mwc-list-item graphic="icon" ?selected="${this._page === 'settings'}" @click="${() => this._moveTo('/settings')}" ?disabled="${!this.is_superadmin}">
              <mwc-icon slot="graphic" class="fg green" icon="icons:settings">settings</mwc-icon>
              <span class="full-menu">Configurations</span>
            </mwc-list-item>
            <mwc-list-item graphic="icon" ?selected="${this._page === 'maintenance'}" @click="${() => this._moveTo('/maintenance')}" ?disabled="${!this.is_superadmin}">
              <mwc-icon slot="graphic" class="fg pink" icon="icons:build">build</mwc-icon>
              <span class="full-menu">Maintenance</span>
            </mwc-list-item>
            <mwc-list-item graphic="icon" ?selected="${this._page === 'information'}" @click="${() => this._moveTo('/information')}" ?disabled="${!this.is_superadmin}">
              <mwc-icon slot="graphic" class="fg purple">info</mwc-icon>
              <span class="full-menu">Information</span>
            </mwc-list-item>
    ` : html``}
          </mwc-list>
          <footer class="full-menu">
            <div class="terms-of-use" style="margin-bottom:50px;">
              <small style="font-size:11px;">
                <a @click="${() => this.showTOSAgreement()}">Terms of Service</a>
                ·
                <a style="color:forestgreen;" @click="${() => this.showPPAgreement()}">Privacy Policy</a>
                ·
                <a @click="${() =>this.splash.show()}">About</a>
                ${this.allow_signout === true ? html`
                ·
                <a @click="${() => this.loginPanel.signout()}">Leave service</a>
                ` : html``}
              </small>
            </div>
          </footer>
          <div id="sidebar-navbar-footer" class="vertical center center-justified layout full-menu">
            <address>
              <small class="sidebar-footer">Lablup Inc.</small>
              <small class="sidebar-footer" style="font-size:9px;">20.03.1.200309</small>
            </address>
          </div>
        </div>
        <div slot="appContent">
          <mwc-top-app-bar-fixed prominent id="main-toolbar" class="draggable">
            <mwc-icon-button id="drawer-toggle-button" icon="menu" slot="navigationIcon" @click="${() => this.toggleDrawer()}"></mwc-icon-button>
            <h2 style="font-size:24px!important;" slot="title">${this.menuTitle}</h2>
            <div slot="actionItems" class="vertical end-justified flex layout">
              <span class="email" style="margin-top:4px;font-size: 14px;text-align:right">${this.user_id}</span>
              <div style="font-size: 12px;text-align:right">${this.domain}</div>
            </div>
              <mwc-icon-button slot="actionItems" id="dropdown-button"
                               icon="account_circle"
                               @click="${() => this._toggleDropdown()}">
              </mwc-icon-button>
              <mwc-menu id="dropdown-menu" class="user-menu" absolute x=-50 y=40>
                <mwc-list-item class="horizontal layout start center" @click="${() => this._openUserPrefDialog()}">
                    <mwc-icon style="color:#242424;padding-right:10px;">lock</mwc-icon>
                    Change Password
                </mwc-list-item>
                <mwc-list-item class="horizontal layout start center" @click="${() => this._moveToUserSettingsPage()}">
                    <mwc-icon style="color:#242424;padding-right:10px;">drag_indicator</mwc-icon>
                    Preferences
                </mwc-list-item>
                <mwc-list-item class="horizontal layout start center" @click="${() => this._moveToLogPage()}">
                    <mwc-icon style="color:#242424;padding-right:10px;">assignment</mwc-icon>
                    Logs / Errors
                </mwc-list-item>
                <mwc-list-item class="horizontal layout start center" id="sign-button" @click="${() => this.logout()}">
                    <mwc-icon style="color:#242424;padding-right:10px;">logout</mwc-icon>
                    Log Out
                </mwc-list-item>
              </mwc-menu>
          </mwc-top-app-bar-fixed>

          <div class="content">
            <div id="navbar-top" class="navbar-top horizontal flex layout wrap"></div>
            <section role="main" id="content" class="container layout vertical center">
              <div id="app-page">
                <backend-ai-summary-view class="page" name="summary" ?active="${this._page === 'summary'}"><wl-progress-spinner active></wl-progress-spinner></backend-ai-summary-view>
                <backend-ai-session-view class="page" name="job" ?active="${this._page === 'job'}"><wl-progress-spinner active></wl-progress-spinner></backend-ai-session-view>
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
              </div>
            </section>
          </div>
        </div>
      </mwc-drawer>
      <backend-ai-offline-indicator ?active="${this._offlineIndicatorOpened}">
        You are now ${this._offline ? 'offline' : 'online'}.
      </backend-ai-offline-indicator>
      <backend-ai-login active id="login-panel"></backend-ai-login>
      <backend-ai-splash id="about-panel"></backend-ai-splash>
      <lablup-notification id="notification"></lablup-notification>
      <lablup-terms-of-service id="terms-of-service" block></lablup-terms-of-service>

      <wl-dialog id="user-preference-dialog" fixed backdrop blockscrolling>
       <wl-title level="3" slot="header">Change password</wl-title>
       <div slot="content">
        <wl-textfield id="pref-original-password" type="password" label="Original password" maxLength="30"></wl-textfield>
        <wl-textfield id="pref-new-password" type="password" label="New password" maxLength="30"></wl-textfield>
        <wl-textfield id="pref-new-password2" type="password" label="New password (again)" maxLength="30"></wl-textfield>
       </div>
       <div slot="footer">
        <wl-button class="cancel" inverted flat @click="${this._hideUserPrefDialog}">Cancel</wl-button>
        <wl-button class="ok" @click="${this._updateUserPassword}">Update</wl-button>
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
