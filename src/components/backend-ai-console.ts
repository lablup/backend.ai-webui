/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {css, customElement, html, LitElement, property} from "lit-element";
// PWA components
import {connect} from 'pwa-helpers/connect-mixin';
import {installOfflineWatcher} from 'pwa-helpers/network';
import {installRouter} from 'pwa-helpers/router';
import {store} from '../store';

import {navigate, updateOffline} from '../backend-ai-app';

import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import '../plastics/mwc/mwc-drawer';
import '../plastics/mwc/mwc-top-app-bar-fixed';
import '@material/mwc-icon';
import '@material/mwc-icon-button';

import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/hardware-icons';
import '@polymer/iron-image/iron-image';

import '@vaadin/vaadin-icons/vaadin-icons';
import toml from 'markty-toml';

import 'weightless/select';
import 'weightless/progress-spinner';

import './backend-ai-splash';
import './lablup-notification';
import './lablup-terms-of-service';

import '../lib/backend.ai-client-es6';
import {BackendAiStyles} from './backend-ai-console-styles';
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
 */

declare global {
  interface Window {
    backendaiclient: any;
    backendaiconsole: any;
    backendaiwsproxy: any;
    isElectron: boolean;
    buildVersion: string;
    packageVersion: string;
    __local_proxy: string;
    lablupNotification: any;
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

  constructor() {
    super();
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        .drawer-menu,
        paper-listbox.sidebar,
        .drawer-menu footer,
        #sidebar-navbar-footer {
          background-color: var(--sidebar-background-color, var(--general-sidebar-background-color, #fafafa));
        }

        #portrait-bar .bar {
          background-color: var(--sidebar-topbar-background-color, var(--general-sidebar-topbar-background-color));
        }

        #app-body {
          --mdc-drawer-background-color: var(--sidebar-background-color, var(--general-sidebar-background-color, #fafafa));
          --mdc-drawer-border-left: 0;
          --mdc-drawer-border-right: 0;
        }

        app-drawer-layout:not([narrow]) [drawer-toggle] {
          display: none;
        }

        .page {
          display: none;
        }

        .page[active] {
          display: block;
        }

        wl-progress-spinner {
          --progress-spinner-size: 48px;
          --progress-spinner-stroke-width: 12px;
          width: 48px;
          height: 48px;
          position: fixed;
          top: calc(50vh - 24px);
        }

        @media screen and (max-width: 899px) {
          wl-progress-spinner {
            left: calc(50% - 24px);
          }
        }

        @media screen and (min-width: 900px) {
          wl-progress-spinner {
            left: calc(50% + 71px);
          }
        }

        .draggable {
          -webkit-user-select: none !important;
          -webkit-app-region: drag !important;
        }

        .drawer-menu footer {
          width: 190px;
        }

        mwc-tab {
          color: #ffffff;
        }

        .mdc-drawer {
        }

        wl-select {
          --input-bg: transparent;
          --input-color: rgb(221, 221, 221);
          --input-color-disabled: rgb(221, 221, 221);
          --input-label-color: rgb(221, 221, 221);
          --input-label-font-size: 10px;
          --input-padding-left-right: 0;
          width: 135px;
          --input-border-style: 0;
          --input-font-family: 'Quicksand', Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", AppleSDGothic, "Apple SD Gothic Neo", NanumGothic, "NanumGothicOTF", "Nanum Gothic", "Malgun Gothic", sans-serif;
        }

        wl-dialog wl-textfield {
          --input-font-family: 'Quicksand', Roboto, Noto, sans-serif;
          --input-color-disabled: #222222;
          --input-label-color-disabled: #222222;
          --input-label-font-size: 12px;
          --input-border-style-disabled: 1px solid #cccccc;
        }

        paper-item {
          font-family: 'Quicksand', Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", AppleSDGothic, "Apple SD Gothic Neo", NanumGothic, "NanumGothicOTF", "Nanum Gothic", "Malgun Gothic", sans-serif;
          font-weight: 400;
        }

        a.email:hover {
          color: #29b6f6;
        }

        .dropdown {
          float: right;
          position: relative;
          display: inline-block;
        }

        .dropdown-content {
          display: none;
          position: absolute;
          background-color: #f1f1f1;
          min-width: 160px;
          overflow: auto;
          box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
          right: 0;
          z-index: 1;
        }

        .dropdown-content a {
          color: black;
          padding: 12px 16px;
          text-align: left;
          font-size: 13px;
          display: block;
        }

        .dropdown a:hover {
          background-color: #ddd;
        }

        .dropdown-show {
          display: block;
        }
        .mini-ui .full-menu {
          display:none;
        }

      `];
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
    this._changeDrawerLayout(document.body.clientWidth, document.body.clientHeight);
    window.addEventListener("resize", (event) => {
      this._changeDrawerLayout(document.body.clientWidth, document.body.clientHeight);
    });

    window.addEventListener("click", (event) => {
      let path = event['path'];
      let elements_name = Object.keys(path).map( function(key, index) {
        return path[key]['id'];
      });
      if (!elements_name.includes("dropdown-button")){
        this.shadowRoot.querySelector(".dropdown-content").classList.remove('dropdown-show');
      }
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
      this.appBody.style.setProperty('--mdc-drawer-width', '71px');
      this.mainToolbar.style.setProperty('--mdc-drawer-width', '71px');
    } else {
      this.mini_ui = false;
      this.appBody.style.setProperty('--mdc-drawer-width', '190px');
      this.mainToolbar.style.setProperty('--mdc-drawer-width', '190px');
    }
  }

  _changeDrawerLayout(width, height) {
    if (width < 700) {  // Close drawer
      this.appBody.type = 'modal';
      this.appBody.open = false;
      this.mainToolbar.style.setProperty('--mdc-drawer-width', '0px');
      this.drawerToggleButton.style.display = 'block';
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
    this.current_group = window.backendaiclient.current_group;
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

  updated(changedProps: any) {
    if (changedProps.has('_page')) {
      let view: string = this._page;
      // load data for view
      if (['summary', 'job', 'agent', 'credential', 'data', 'usersettings', 'environment', 'settings', 'maintenance', 'statistics'].includes(view) !== true) { // Fallback for Windows OS
        let modified_view: (string | undefined) = view.split(/[\/]+/).pop();
        if (typeof modified_view != 'undefined') {
          view = modified_view;
        } else {
          view = 'summary';
        }
        this._page = view;
      }
      switch (view) {
        case 'summary':
          this.menuTitle = 'Summary';
          this.sidebarMenu.selected = 0;
          this.updateTitleColor('var(--paper-green-800)', '#efefef');
          break;
        case 'job':
          this.menuTitle = 'Sessions';
          this.sidebarMenu.selected = 1;
          this.updateTitleColor('var(--paper-red-800)', '#efefef');
          break;
        case 'experiment':
          this.menuTitle = 'Experiments';
          this.sidebarMenu.selected = 2;
          this.updateTitleColor('var(--paper-light-blue-800)', '#efefef');
          break;
        case 'data':
          this.menuTitle = 'Data & Storage';
          this.sidebarMenu.selected = 2;
          this.updateTitleColor('var(--paper-orange-800)', '#efefef');
          break;
        case 'statistics':
          this.menuTitle = 'Statistics';
          this.sidebarMenu.selected = 3;
          this.updateTitleColor('var(--paper-cyan-800)', '#efefef');
          break;
        case 'usersettings':
          this.menuTitle = 'Settings & Logs';
          this.sidebarMenu.selected = 4;
          this.updateTitleColor('var(--paper-teal-800)', '#efefef');
          break;
        case 'credential':
          this.menuTitle = 'User Credentials & Policies';
          this.sidebarMenu.selected = 6;
          this.updateTitleColor('var(--paper-lime-800)', '#efefef');
          break;
        case 'environment':
          this.menuTitle = 'Environments & Presets';
          this.sidebarMenu.selected = 7;
          this.updateTitleColor('var(--paper-yellow-800)', '#efefef');
          break;
        case 'agent':
          this.menuTitle = 'Computation Resources';
          this.sidebarMenu.selected = 8;
          this.updateTitleColor('var(--paper-light-blue-800)', '#efefef');
          break;
        case 'settings':
          this.menuTitle = 'Settings';
          this.sidebarMenu.selected = 9;
          this.updateTitleColor('var(--paper-green-800)', '#efefef');
          break;
        case 'maintenance':
          this.menuTitle = 'Maintenance';
          this.sidebarMenu.selected = 10;
          this.updateTitleColor('var(--paper-pink-800)', '#efefef');
          break;
        case 'logs':
          this.menuTitle = 'Logs';
          this.sidebarMenu.selected = null;
          this.updateTitleColor('var(--paper-deep-orange-800)', '#efefef');
          break;
        default:
          this.menuTitle = 'LOGIN REQUIRED';
          this.sidebarMenu.selected = 0;
      }
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
        if (/^(backendaiconsole\.login\.)/.test(key)) localStorage.removeItem(key);
      }
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
    let dropdown = this.shadowRoot.querySelector('.dropdown-content');
    dropdown.classList.toggle('dropdown-show');
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

  _moveToLogPage() {
    let currentPage = window.location.toString().split(/[\/]+/).pop();
    window.history.pushState({}, '', '/usersettings');
    store.dispatch(navigate(decodeURIComponent('/usersettings'), {tab: 'logs'}));
    if (currentPage && currentPage === 'usersettings') {
      let event = new CustomEvent('backend-ai-usersettings-logs', {});
      document.dispatchEvent(event);
    }
  }

  render() {
    // language=HTML
    return html`
      <mwc-drawer id="app-body" class="${this.mini_ui ? "mini-ui": ""}">
        <div class="drawer-content drawer-menu" style="height:100vh;position:fixed;">
            <div id="portrait-bar" class="draggable">
              <div class="horizontal center layout flex bar draggable" style="cursor:pointer;">
                <div class="portrait-canvas">
                  <iron-image width=43 height=43 style="width:43px; height:43px;" src="manifest/backend.ai-brand-white.svg"
                    sizing="contain"></iron-image>
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
            <paper-listbox id="sidebar-menu" class="sidebar list" selected="0">
              <a ?selected="${this._page === 'summary'}" href="/summary" tabindex="-1" role="menuitem">
                <paper-item link>
                  <iron-icon id="activities-icon" class="fg green" icon="icons:view-quilt"></iron-icon>
                  <span class="full-menu">Summary</span>
                </paper-item>
              </a>
              <a ?selected="${this._page === 'job'}" href="/job" tabindex="-1" role="menuitem">
                <paper-item link>
                  <iron-icon class="fg red" icon="icons:subject"></iron-icon>
                  <span class="full-menu">Sessions</span>
                </paper-item>
              </a>
              ${false ? html`
              <paper-item disabled>
                <iron-icon class="fg blue" icon="icons:pageview"></iron-icon>
                <span class="full-menu">Experiments</span>
              </paper-item>` : html``}
              <a ?selected="${this._page === 'data'}" href="/data" tabindex="-1" role="menuitem">
                <paper-item link>
                  <iron-icon class="fg orange" icon="vaadin:folder-open-o"></iron-icon>
                  <span class="full-menu">Data &amp; Storage</span>
                </paper-item>
              </a>
              <a ?selected="${this._page === 'statistics'}" href="/statistics" tabindex="-1" role="menuItem">
                <paper-item link>
                  <iron-icon class="fg cyan" icon="icons:assessment"></iron-icon>
                  <span class="full-menu">Statistics</span>
                </paper-item>
              </a>
              <a ?selected="${this._page === 'usersettings'}" href="/usersettings" tabindex="-1" role="menuitem">
                <paper-item link>
                  <iron-icon class="fg teal" icon="icons:settings"></iron-icon>
                  <span class="full-menu">Settings</span>
                </paper-item>
              </a>

              ${this.is_admin ?
      html`
              <h4 class="full-menu" style="font-size:10px;font-weight:100;border-top:1px solid #444;padding-top: 10px;padding-left:20px;">Administration</h4>

              <a ?selected="${this._page === 'credential'}" href="/credential" tabindex="-1" role="menuitem">
                <paper-item link ?disabled="${!this.is_admin}">
                  <iron-icon class="fg lime" icon="icons:face"></iron-icon>
                  <span class="full-menu">Users</span>
                </paper-item>
              </a>
              <a ?selected="${this._page === 'environment'}" href="/environment" tabindex="-1" role="menuitem">
                <paper-item link>
                  <iron-icon class="fg orange" icon="icons:extension"></iron-icon>
                  <span class="full-menu">Environments</span>
                </paper-item>
              </a>
      ` : html``}
              ${this.is_superadmin ?
      html`
              <a ?selected="${this._page === 'agent'}" href="/agent" tabindex="-1" role="menuitem">
                <paper-item link ?disabled="${!this.is_admin}">
                  <iron-icon class="fg blue" icon="hardware:device-hub"></iron-icon>
                  <span class="full-menu">Resources</span>
                </paper-item>
              </a>
              <a ?selected="${this._page === 'settings'}" href="/settings" tabindex="-1" role="menuitem">
                <paper-item link>
                  <iron-icon class="fg green" icon="icons:settings"></iron-icon>
                  <span class="full-menu">System Settings</span>
                  <span class="flex"></span>
                </paper-item>
              </a>
              <a ?selected="${this._page === 'maintenance'}" href="/maintenance" tabindex="-1" role="menuitem">
                <paper-item link>
                  <iron-icon class="fg pink" icon="icons:build"></iron-icon>
                  <span class="full-menu">Maintenance</span>
                  <span class="flex"></span>
                </paper-item>
              </a>
      ` : html``}
            </paper-listbox>
            <footer class="full-menu">
              <div class="terms-of-use" style="margin-bottom:50px;">
                <small style="font-size:11px;">
                  <a @click="${() => this.showTOSAgreement()}">Terms of Service</a>
                  ·
                  <a style="color:forestgreen;" @click="${() => this.showPPAgreement()}">Privacy Policy</a>
                  ·
                  <a @click="${() => {
      this.splash.show()
    }}">About</a>
                  ${this.allow_signout === true ? html`
                  ·
                  <a @click="${() => {
      this.loginPanel.signout()
    }}">Leave service</a>
                  ` : html``}
                </small>
              </div>
            </footer>
            <div id="sidebar-navbar-footer" class="vertical center center-justified layout full-menu">
              <address>
                <small class="sidebar-footer">Lablup Inc.</small>
                <small class="sidebar-footer" style="font-size:9px;">20.02.4.200219</small>
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
            <div class="dropdown" slot="actionItems">
              <mwc-icon-button slot="actionItems" id="dropdown-button" icon="account_circle" @click="${() => this._toggleDropdown()}"></mwc-icon-button>
              <div class="dropdown-content" slot="actionItems">
                <a class="horizontal layout start center" @click="${() => this._openUserPrefDialog()}">
                  <mwc-icon style="color:#242424;padding-right:10px;">lock</mwc-icon>
                  Change Password
                </a>
                <a class="horizontal layout start center" href="/usersettings">
                  <mwc-icon style="color:#242424;padding-right:10px;">drag_indicator</mwc-icon>
                  Preferences
                </a>
                <a class="horizontal layout start center"  @click="${() => this._moveToLogPage()}">
                  <mwc-icon style="color:#242424;padding-right:10px;">assignment</mwc-icon>
                  Logs / Errors
                </a>
                <a class="horizontal layout start center" id="sign-button" @click="${() => this.logout()}">
                  <mwc-icon style="color:#242424;padding-right:10px;">logout</mwc-icon>
                  Log Out
                </a>
              </div>
            </div>
            <!-- <mwc-icon-button slot="actionItems" id="sign-button" icon="launch" on @click="${() => this.logout()}"></mwc-icon-button> -->
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
                <backend-ai-statistics-view class="page" name="statistics" ?active="${this._page === 'statistics'}"><wl-progress-spinner active></wl-progress-spinner></backend-ai-statistics-view>
              </div>
            </section>
          </div>
          </div>
      </mwc-drawer>
      <backend-ai-offline-indicator ?active="${this._offlineIndicatorOpened}">
        You are now ${this._offline ? 'offline' : 'online'}.
      </backend-ai-offline-indicator>
      <backend-ai-login id="login-panel"></backend-ai-login>
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
