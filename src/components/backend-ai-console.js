/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */
import {css, html, LitElement} from "lit-element";
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';
// PWA components
import {connect} from 'pwa-helpers/connect-mixin.js';
import {installOfflineWatcher} from 'pwa-helpers/network.js';
import {installRouter} from 'pwa-helpers/router.js';
import {store} from '../store.js';

import {navigate, updateOffline} from '../backend-ai-app.js';

import '@polymer/app-layout/app-layout';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-spinner/paper-spinner-lite';

import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/hardware-icons';
import '@polymer/iron-image/iron-image';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall';
import '@polymer/app-layout/app-scroll-effects/effects/blend-background';
import '@polymer/app-layout/app-scroll-effects/effects/resize-title';
import '@vaadin/vaadin-icons/vaadin-icons.js';

import 'weightless/select';

import '../lib/backend.ai-client-es6.js';
import {BackendAiStyles} from './backend-ai-console-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';
import './backend-ai-offline-indicator.js';
import './backend-ai-login.js';
/**
 Backend.AI GUI Console

 `backend-ai-console` is a shell of Backend.AI GUI console (web / app).

 Example:

 <backend-ai-console>
 ... content ...
 </backend-ai-console>

 @group Backend.AI Console
 */
class BackendAiConsole extends connect(store)(LitElement) {
  constructor() {
    super();
    setPassiveTouchGestures(true);
    this.menuTitle = 'LOGIN REQUIRED';
    this.user_id = 'DISCONNECTED';
    this.domain = 'CLICK TO CONNECT';
    this.is_connected = false;
    this.is_admin = false;
    this._page = '';
    this.groups = [];
    this.connection_mode = 'API';
  }

  static get is() {
    return 'backend-ai-console';
  }

  static get properties() {
    return {
      menuTitle: {
        type: String
      },
      siteDescription: {
        type: String
      },
      user_id: {
        type: String
      },
      domain: {
        type: String
      },
      is_connected: {
        type: Boolean
      },
      is_admin: {
        type: Boolean
      },
      proxy_url: {
        type: String
      },
      connection_mode: {
        type: String
      },
      connection_server: {
        type: String
      },
      groups: {
        type: Array
      },
      current_group: {
        type: String
      },
      _page: {type: String},
      _drawerOpened: {type: Boolean},
      _offlineIndicatorOpened: {type: Boolean},
      _offline: {type: Boolean}
    }
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
        paper-icon-button {
          --paper-icon-button-ink-color: white;
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

        paper-spinner-lite {
          --paper-spinner-layer-1-color: #9c27b0;
          --paper-spinner-layer-2-color: #00bcd4;
          --paper-spinner-layer-3-color: #607d8b;
          --paper-spinner-layer-4-color: #ffc107;
          --paper-spinner-stroke-width: 6px;
          width: 48px;
          height: 48px;
          position: fixed;
          top: calc(50vh - 24px);
        }

        @media screen and (max-width: 899px) {
          paper-spinner-lite {
            left: calc(50% - 24px);
          }
        }

        @media screen and (min-width: 900px) {
          paper-spinner-lite {
            left: calc(50% + 71px);
          }
        }

        .draggable {
          -webkit-user-select: none !important;
          -webkit-app-region: drag !important;
        }

        mwc-tab {
          color: #ffffff;
        }

        wl-select {
          --input-bg: transparent;
          --input-color: rgb(221, 221, 221);
          --input-color-disabled: rgb(221, 221, 221);
          --input-label-color: rgb(221, 221, 221);
          --input-label-font-size: 10px;
          --input-padding-left-right: 20px;
          --input-border-style: 0;
          --input-font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", AppleSDGothic, "Apple SD Gothic Neo", NanumGothic, "NanumGothicOTF", "Nanum Gothic", "Malgun Gothic", sans-serif;
        }
      `];
  }

  firstUpdated() {
    if (window.isElectron && process.platform === 'darwin') { // For macOS (TODO)
      this.shadowRoot.querySelector('.portrait-canvas').style.visibility = 'hidden';
    }
    installRouter((location) => store.dispatch(navigate(decodeURIComponent(location.pathname))));
    installOfflineWatcher((offline) => store.dispatch(updateOffline(offline)));
    let configPath;
    if (window.isElectron) {
      configPath = './config.ini';
    } else {
      configPath = '../../config.ini';
    }
    this._parseConfig(configPath).then(() => {
      this.loadConfig(this.config);
      if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
        this.shadowRoot.querySelector('#login-panel').login();
      }
    }).catch(err => {
      console.log("Initialization failed.");
      if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
        this.shadowRoot.querySelector('#login-panel').block('Configuration is not loaded.');
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
    var loginPanel = this.shadowRoot.querySelector('#login-panel');
    loginPanel.refreshPanel(config);
  }

  refreshPage() {
    this.shadowRoot.getElementById('sign-button').icon = 'icons:exit-to-app';
    this.is_connected = true;
    window.backendaiclient.proxyURL = this.proxy_url;
    if (window.backendaiclient != undefined && window.backendaiclient != null && window.backendaiclient.is_admin != undefined && window.backendaiclient.is_admin == true) {
      this.is_admin = true;
    } else {
      this.is_admin = false;
    }
    this._refreshUserInfoPanel();
    //this._loadPageElement();
  }

  showUpdateNotifier() {
    let indicator = this.shadowRoot.getElementById('backend-ai-indicator');
    indicator.innerHTML = 'New console available. Please <a onclick="window.location.reload()">reload</a> to update.';
    indicator.show();
  }

  _parseConfig(fileName) {
    return fetch(fileName)
      .then(res => {
        if (res.status == 200) {
          return res.text();
        }
      })
      .then(res => {
        var data = res;
        var regex = {
          section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
          param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
          comment: /^\s*;.*$/
        };
        var value = {};
        var lines = data.split(/[\r\n]+/);
        var section = null;
        lines.forEach(function (line) {
          if (regex.comment.test(line)) {

          } else if (regex.param.test(line)) {
            var match = line.match(regex.param);
            if (section) {
              value[section][match[1]] = match[2];
            } else {
              value[match[1]] = match[2];
            }
          } else if (regex.section.test(line)) {
            var match = line.match(regex.section);
            value[match[1]] = {};
            section = match[1];
          } else if (line.length == 0 && section) {
            section = null;
          }
        });
        this.config = value;
      }).catch(err => {
        console.log("Configuration file missing.");
      });
  }

  _refreshUserInfoPanel() {
    this.user_id = window.backendaiclient.email;
    this.domain = window.backendaiclient._config.domainName;
    this.current_group = window.backendaiclient.current_group;
    this.groups = window.backendaiclient.groups;
    if (window.backendaiclient.isAPIVersionCompatibleWith('v4.20190601') === false) {
      this.shadowRoot.getElementById('group-select').disabled = true;
      this.shadowRoot.getElementById('group-select').label = 'No Project';
    }
  }

  _loadPageElement() {
    if (this._page === 'index.html' || this._page === '') {
      this._page = 'summary';
      navigate(decodeURIComponent('/'));
    }
  }

  updated(changedProps) {
    if (changedProps.has('_page')) {
      let view = this._page;
      // load data for view
      if (['summary', 'job', 'agent', 'credential', 'data', 'environment', 'settings', 'maintenance'].includes(view) != true) { // Fallback for Windows OS
        view = view.split(/[\/]+/).pop();
        this._page = view;
      }
      switch (view) {
        case 'summary':
          this.menuTitle = 'Summary';
          this.shadowRoot.getElementById('sidebar-menu').selected = 0;
          this.updateTitleColor('var(--paper-green-800)', '#efefef');
          break;
        case 'job':
          this.menuTitle = 'Sessions';
          this.shadowRoot.getElementById('sidebar-menu').selected = 1;
          this.updateTitleColor('var(--paper-red-800)', '#efefef');
          break;
        case 'experiment':
          this.menuTitle = 'Experiments';
          this.shadowRoot.getElementById('sidebar-menu').selected = 2;
          this.updateTitleColor('var(--paper-light-blue-800)', '#efefef');
          break;
        case 'data':
          this.menuTitle = 'Storage';
          this.shadowRoot.getElementById('sidebar-menu').selected = 3;
          this.updateTitleColor('var(--paper-orange-800)', '#efefef');
          break;
        case 'agent':
          this.menuTitle = 'Computation Resources';
          this.shadowRoot.getElementById('sidebar-menu').selected = 6;
          this.updateTitleColor('var(--paper-light-blue-800)', '#efefef');
          break;
        case 'credential':
          this.menuTitle = 'Credentials & Policies';
          this.shadowRoot.getElementById('sidebar-menu').selected = 7;
          this.updateTitleColor('var(--paper-lime-800)', '#efefef');
          break;
        case 'environment':
          this.menuTitle = 'Environments';
          this.shadowRoot.getElementById('sidebar-menu').selected = 8;
          this.updateTitleColor('var(--paper-yellow-800)', '#efefef');
          break;
        case 'settings':
          this.menuTitle = 'Settings';
          this.shadowRoot.getElementById('sidebar-menu').selected = 9;
          this.updateTitleColor('var(--paper-green-800)', '#efefef');
          break;
        case 'maintenance':
          this.menuTitle = 'Maintenance';
          this.shadowRoot.getElementById('sidebar-menu').selected = 10;
          this.updateTitleColor('var(--paper-pink-800)', '#efefef');
          break;
        default:
          this.menuTitle = 'LOGIN REQUIRED';
          this.shadowRoot.getElementById('sidebar-menu').selected = 0;
      }
    }
  }

  async logout() {
    if (window.backendaiclient._config.connectionMode === 'SESSION') {
      await window.backendaiclient.logout();
    }
    window.backendaiclient = null;
    const keys = Object.keys(localStorage);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (/^(backendaiconsole\.)/.test(key)) localStorage.removeItem(key);
    }
    location.reload();
  }

  updateTitleColor(backgroundColorVal, colorVal) {
    this.shadowRoot.querySelector('#main-toolbar').style.backgroundColor = backgroundColorVal;
    this.shadowRoot.querySelector('#main-toolbar').style.color = colorVal;
  }

  changeGroup(e) {
    window.backendaiclient.current_group = e.target.value;
    this.current_group = window.backendaiclient.current_group;
    let event = new CustomEvent("backend-ai-group-changed", {"detail": window.backendaiclient.current_group});
    document.dispatchEvent(event);
  }

  render() {
    // language=HTML
    return html`
      <app-drawer-layout id="app-body" responsive-width="900px" drawer-width="190px">
        <app-drawer swipe-open slot="drawer" class="drawer-menu">
          <app-header-layout has-scrolling-region class="vertical layout">
            <app-header id="portrait-bar" slot="header" effects="waterfall" fixed class="draggable">
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
            </app-header>
            <wl-select id="group-select" name="group-select" label="Project" 
              @input="${this.changeGroup}" .value="${this.current_group}">
               <option value disabled>Select group</option>
                ${this.groups.map(group => html`
                <option value="${group}" ?selected="${this.current_group === group}">${group}</option>
                `)}
            </wl-select>
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
              <paper-item disabled>
                <iron-icon class="fg blue" icon="icons:pageview"></iron-icon>
                Experiments
              </paper-item>
              <a ?selected="${this._page === 'data'}" href="/data" tabindex="-1" role="menuitem">
                <paper-item link>
                  <iron-icon class="fg orange" icon="vaadin:folder-open-o"></iron-icon>
                  Storage
                </paper-item>
              </a>
              <paper-item disabled>
                <iron-icon icon="icons:assessment"></iron-icon>
                Statistics
              </paper-item>
              ${this.is_admin ?
      html`
              <h4 style="font-size:10px;font-weight:100;border-top:1px solid #444;padding-top: 10px;padding-left:20px;">Administration</h4>
      
              <a ?selected="${this._page === 'agent'}" href="/agent" tabindex="-1" role="menuitem">
                <paper-item link ?disabled="${!this.is_admin}">
                  <iron-icon class="fg blue" icon="hardware:device-hub"></iron-icon>
                  Resources
                </paper-item>
              </a>` :
      html``}
              ${this.is_admin ?
      html`
      
              <a ?selected="${this._page === 'credential'}" href="/credential" tabindex="-1" role="menuitem">
                <paper-item link ?disabled="${!this.is_admin}">
                  <iron-icon class="fg lime" icon="icons:fingerprint"></iron-icon>
                  Credentials
                </paper-item>
              </a>` :
      html``}
              ${this.is_admin ?
      html`
              <a ?selected="${this._page === 'environment'}" href="/environment" tabindex="-1" role="menuitem">
                <paper-item link>
                  <iron-icon class="fg orange" icon="icons:extension"></iron-icon>
                  Environments
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
                </small>
              </div>
            </footer>
            <div id="sidebar-navbar-footer" class="vertical center center-justified layout">
              <address>
                <small class="sidebar-footer">Lablup Inc.</small>
                <small class="sidebar-footer" style="font-size:9px;">19.07.0.190710</small>
              </address>
            </div>
          </app-header-layout>
        </app-drawer>
        <app-header-layout main id="main-panel">
          <app-header slot="header" id="main-toolbar" fixed shadow class="draggable" effects="waterfall resize-title"
            condenses style="height: 96px;" effects-config='{"resize-snapped-title": {"startsAt": 0.8, "duration": "100ms"}, "parallax-background": {"scalar": 0.5}}'>
            <app-toolbar sticky style="height:48px;" class="draggable bar">
              <paper-icon-button icon="menu" drawer-toggle></paper-icon-button>
              <span condensed-title>${this.menuTitle}</span>
              <span class="flex"></span>
              <div style="vertical end-justified flex layout">
                <div style="font-size: 10px;text-align:right">${this.user_id}</div>
                <div style="font-size: 8px;text-align:right">${this.domain}</div>
              </div>
              <paper-icon-button id="sign-button" icon="icons:launch" @click="${this.logout}"></paper-icon-button>
            </app-toolbar>
            <div class="horizontal flex wrap layout">
              <h2 main-title style="width:300px;">${this.menuTitle}</h2>
              <div id="top-tab-menu"></div>
            </div>
          </app-header>
          <div class="content">
            <div id="navbar-top" class="navbar-top horizontal flex layout wrap"></div>
            <section role="main" id="content" class="container layout vertical center">
              <div id="app-page">
                <backend-ai-summary-view class="page" name="summary" ?active="${this._page === 'summary'}"></backend-ai-summary-view>
                <backend-ai-session-view class="page" name="job" ?active="${this._page === 'job'}"><paper-spinner-lite active></paper-spinner-lite></backend-ai-session-view>
                <backend-ai-experiment-view class="page" name="experiment" ?active="${this._page === 'experiment'}"><paper-spinner-lite active></paper-spinner-lite></backend-ai-experiment-view>
                <backend-ai-credential-view class="page" name="credential" ?active="${this._page === 'credential'}"><paper-spinner-lite active></paper-spinner-lite></backend-ai-credential-view>
                <backend-ai-agent-view class="page" name="agent" ?active="${this._page === 'agent'}"><paper-spinner-lite active></paper-spinner-lite></backend-ai-agent-view>
                <backend-ai-data-view class="page" name="data" ?active="${this._page === 'data'}"><paper-spinner-lite active></paper-spinner-lite></backend-ai-data-view>
                <backend-ai-environment-view class="page" name="environment" ?active="${this._page === 'environment'}"><paper-spinner-lite active></paper-spinner-lite></backend-ai-environment-view>
                <backend-ai-settings-view class="page" name="settings" ?active="${this._page === 'settings'}"><paper-spinner-lite active></paper-spinner-lite></backend-ai-settings-view>
                <backend-ai-maintenance-view class="page" name="maintenance" ?active="${this._page === 'maintenance'}"><paper-spinner-lite active></paper-spinner-lite></backend-ai-maintenance-view>
              </div>
            </section>
          </div>
        </app-header-layout>
      </app-drawer-layout>
      <backend-ai-offline-indicator ?active="${this._offlineIndicatorOpened}">
        You are now ${this._offline ? 'offline' : 'online'}.
      </backend-ai-offline-indicator>
      <lablup-notification id="notification"></lablup-notification>
      <backend-ai-login id="login-panel"></backend-ai-login>
    `;
  }

  stateChanged(state) {
    this._page = state.app.page;
    this._offline = state.app.offline;
    this._offlineIndicatorOpened = state.app.offlineIndicatorOpened;
    this._drawerOpened = state.app.drawerOpened;
  }
}

customElements.define(BackendAiConsole.is, BackendAiConsole);
