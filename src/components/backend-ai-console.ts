/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
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
//import '@material/mwc-drawer';

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
          --mdc-drawer-width: 190px;
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
          width: 190px !important;
        }

        wl-select {
          --input-bg: transparent;
          --input-color: rgb(221, 221, 221);
          --input-color-disabled: rgb(221, 221, 221);
          --input-label-color: rgb(221, 221, 221);
          --input-label-font-size: 10px;
          --input-padding-left-right: 20px;
          --input-border-style: 0;
          --input-font-family: 'Quicksand', Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", AppleSDGothic, "Apple SD Gothic Neo", NanumGothic, "NanumGothicOTF", "Nanum Gothic", "Malgun Gothic", sans-serif;
        }

        paper-item {
          font-family: 'Quicksand', Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", AppleSDGothic, "Apple SD Gothic Neo", NanumGothic, "NanumGothicOTF", "Nanum Gothic", "Malgun Gothic", sans-serif;
          font-weight: 400;
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
    })
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
    if (typeof config.plugin !== "undefined" && 'login' in config.plugin) {
      this.plugins['login'] = config.plugin.login;
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

  _changeDrawerLayout(width, height) {
    if (width < 700) {  // Close drawer
      this.appBody.type = 'modal';
      this.appBody.open = false;
      this.mainToolbar.style.setProperty('--mdc-drawer-width', '0px');
      this.drawerToggleButton.style.display = 'block';
    } else { // Open drawer
      this.appBody.type = 'dismissible';
      this.appBody.open = true;
      this.mainToolbar.style.setProperty('--mdc-drawer-width', '190px');
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

  updated(changedProps: any) {
    if (changedProps.has('_page')) {
      let view: string = this._page;
      // load data for view
      if (['summary', 'job', 'agent', 'credential', 'data', 'environment', 'settings', 'maintenance', 'statistics'].includes(view) !== true) { // Fallback for Windows OS
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
          this.menuTitle = 'Storage';
          this.sidebarMenu.selected = 2;
          this.updateTitleColor('var(--paper-orange-800)', '#efefef');
          break;
        case 'statistics':
          this.menuTitle = 'Statistics';
          this.sidebarMenu.selected = 3;
          this.updateTitleColor('var(--paper-cyan-800)', '#efefef');
          break;
        case 'credential':
          this.menuTitle = 'User Credentials & Policies';
          this.sidebarMenu.selected = 5;
          this.updateTitleColor('var(--paper-lime-800)', '#efefef');
          break;
        case 'environment':
          this.menuTitle = 'Environments & Presets';
          this.sidebarMenu.selected = 6;
          this.updateTitleColor('var(--paper-yellow-800)', '#efefef');
          break;
        case 'agent':
          this.menuTitle = 'Computation Resources';
          this.sidebarMenu.selected = 7;
          this.updateTitleColor('var(--paper-light-blue-800)', '#efefef');
          break;
        case 'settings':
          this.menuTitle = 'Settings';
          this.sidebarMenu.selected = 8;
          this.updateTitleColor('var(--paper-green-800)', '#efefef');
          break;
        case 'maintenance':
          this.menuTitle = 'Maintenance';
          this.sidebarMenu.selected = 9;
          this.updateTitleColor('var(--paper-pink-800)', '#efefef');
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
        if (/^(backendaiconsole\.)/.test(key)) localStorage.removeItem(key);
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

  render() {
    // language=HTML
    return html`
      <mwc-drawer id="app-body">
        <div class="drawer-content drawer-menu" style="height:100vh;position:fixed;">
            <div id="portrait-bar" class="draggable">
              <div class="horizontal center layout flex bar draggable" style="cursor:pointer;">
                <div class="portrait-canvas">
                  <iron-image width=43 height=43 style="width:43px; height:43px;" src="manifest/backend.ai-brand-white.svg"
                    sizing="contain"></iron-image>
                </div>
                <div class="vertical start-justified layout" style="margin-left:10px;margin-right:10px;">
                  <div class="site-name"><span class="bold">Backend</span>.AI</div>
                  ${this.siteDescription ?
      html`<div class="site-name" style="font-size:13px;text-align:right;">${this.siteDescription}</div>` :
      html``
    }
                </div>
                <span class="flex"></span>
              </div>
            </div>
            <div id="group-select-box" style="height:50px;">
            </div>
            <paper-listbox id="sidebar-menu" class="sidebar list" selected="0">
              <a ?selected="${this._page === 'summary'}" href="/summary" tabindex="-1" role="menuitem">
                <paper-item link>
                  <iron-icon id="activities-icon" class="fg green" icon="icons:view-quilt"></iron-icon>
                  Summary
                </paper-item>
              </a>
              <a ?selected="${this._page === 'job'}" href="/job" tabindex="-1" role="menuitem">
                <paper-item link>
                  <iron-icon class="fg red" icon="icons:subject"></iron-icon>
                  Sessions
                </paper-item>
              </a>
              ${false ? html`
              <paper-item disabled>
                <iron-icon class="fg blue" icon="icons:pageview"></iron-icon>
                Experiments
              </paper-item>` : html``}
              <a ?selected="${this._page === 'data'}" href="/data" tabindex="-1" role="menuitem">
                <paper-item link>
                  <iron-icon class="fg orange" icon="vaadin:folder-open-o"></iron-icon>
                  Storage
                </paper-item>
              </a>
              <a ?selected="${this._page === 'statistics'}" href="/statistics" tabindex="-1" role="menuItem">
                <paper-item link>
                  <iron-icon class="fg cyan" icon="icons:assessment"></iron-icon>
                  Statistics
                </paper-item>
              </a>
              ${this.is_admin ?
      html`
              <h4 style="font-size:10px;font-weight:100;border-top:1px solid #444;padding-top: 10px;padding-left:20px;">Administration</h4>

              <a ?selected="${this._page === 'credential'}" href="/credential" tabindex="-1" role="menuitem">
                <paper-item link ?disabled="${!this.is_admin}">
                  <iron-icon class="fg lime" icon="icons:face"></iron-icon>
                  Users
                </paper-item>
              </a>
              <a ?selected="${this._page === 'environment'}" href="/environment" tabindex="-1" role="menuitem">
                <paper-item link>
                  <iron-icon class="fg orange" icon="icons:extension"></iron-icon>
                  Environments
                </paper-item>
              </a>
      ` : html``}
              ${this.is_superadmin ?
      html`
              <a ?selected="${this._page === 'agent'}" href="/agent" tabindex="-1" role="menuitem">
                <paper-item link ?disabled="${!this.is_admin}">
                  <iron-icon class="fg blue" icon="hardware:device-hub"></iron-icon>
                  Resources
                </paper-item>
              </a>
              <a ?selected="${this._page === 'settings'}" href="/settings" tabindex="-1" role="menuitem">
                <paper-item link>
                  <iron-icon class="fg green" icon="icons:settings"></iron-icon>
                  Settings
                  <span class="flex"></span>
                </paper-item>
              </a>
              <a ?selected="${this._page === 'maintenance'}" href="/maintenance" tabindex="-1" role="menuitem">
                <paper-item link>
                  <iron-icon class="fg pink" icon="icons:build"></iron-icon>
                  Maintenance
                  <span class="flex"></span>
                </paper-item>
              </a>
      ` : html``}
            </paper-listbox>
            <footer>
              <div class="terms-of-use" style="margin-bottom:50px;">
                <small style="font-size:11px;">
                  <a href="https://cloud.backend.ai/@lablupinc/terms-of-service-payment">Terms of Service</a>
                  ·
                  <a href="https://cloud.backend.ai/@lablupinc/privacy-policy">Privacy Policy</a>
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
            <div id="sidebar-navbar-footer" class="vertical center center-justified layout">
              <address>
                <small class="sidebar-footer">Lablup Inc.</small>
                <small class="sidebar-footer" style="font-size:9px;">19.10.2.191014</small>
              </address>
            </div>
        </div>
        <div slot="appContent">
          <mwc-top-app-bar-fixed prominent id="main-toolbar" class="draggable">
            <mwc-icon-button id="drawer-toggle-button" icon="menu" slot="navigationIcon" @click="${() => this.toggleDrawer()}"></mwc-icon-button>
            <h2 style="font-size:24px!important;" slot="title">${this.menuTitle}</h2>
            <div slot="actionItems" class="vertical end-justified flex layout">
              <div style="margin-top:4px;font-size: 14px;text-align:right">${this.user_id}</div>
              <div style="font-size: 12px;text-align:right">${this.domain}</div>
            </div>
            <mwc-icon-button slot="actionItems" id="sign-button" icon="launch" on @click="${() => this.logout()}"></mwc-icon-button>
          </mwc-top-app-bar-fixed>

          <div class="content">
            <div id="navbar-top" class="navbar-top horizontal flex layout wrap"></div>
            <section role="main" id="content" class="container layout vertical center">
              <div id="app-page">
                <backend-ai-summary-view class="page" name="summary" ?active="${this._page === 'summary'}"><wl-progress-spinner active></wl-progress-spinner></backend-ai-summary-view>
                <backend-ai-session-view class="page" name="job" ?active="${this._page === 'job'}"><wl-progress-spinner active></wl-progress-spinner></backend-ai-session-view>
                <backend-ai-experiment-view class="page" name="experiment" ?active="${this._page === 'experiment'}"><wl-progress-spinner active></wl-progress-spinner></backend-ai-experiment-view>
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
