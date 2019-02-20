/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

//import {PolymerElement, html} from '@polymer/polymer';
import {css, html, LitElement} from "lit-element";
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';
// PWA components
import {connect} from 'pwa-helpers/connect-mixin.js';
import {installMediaQueryWatcher} from 'pwa-helpers/media-query.js';
import {installOfflineWatcher} from 'pwa-helpers/network.js';
import {installRouter} from 'pwa-helpers/router.js';
import {store} from '../store.js';

import {navigate, updateOffline} from '../backend-ai-app.js';

import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/app-layout/app-layout';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-styles/typography';
import '@polymer/paper-styles/color';
import '@polymer/paper-material/paper-material';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/hardware-icons';
import '@polymer/iron-image/iron-image';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-toast/paper-toast';

import '@polymer/app-layout/app-scroll-effects/effects/waterfall';
import '@polymer/app-layout/app-scroll-effects/effects/blend-background';
import '@polymer/iron-pages/iron-pages';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';
import '@vaadin/vaadin-icons/vaadin-icons.js';

import '../backend.ai-client-es6.js';


import {BackendAiStyles} from '../backend-ai-console-styles.js';
import {IronFlex, IronFlexAlignment, IronPositioning, IronFlexFactors} from '../layout/iron-flex-layout-classes';
import '../backend-ai-offline-indicator.js';
import '../backend-ai-login.js';


class BackendAiConsole extends connect(store)(LitElement) {
  static get is() {
    return 'backend-ai-console';
  }

  static get properties() {
    return {
      menuTitle: {
        type: String
      },
      user_id: {
        type: String
      },
      api_endpoint: {
        type: String
      },
      is_connected: {
        type: Boolean
      },
      is_admin: {
        type: Boolean
      },
      _page: {type: String},
      _drawerOpened: {type: Boolean},
      _offlineIndicatorOpened: {type: Boolean},
      _offline: {type: Boolean}
    }
  }

  constructor() {
    super();
    setPassiveTouchGestures(true);
    this.menuTitle = 'LOGIN REQUIRED';
    this.user_id = 'DISCONNECTED';
    this.api_endpoint = 'CLICK TO CONNECT';
    this.is_connected = false;
    this.is_admin = false;
  }

  firstUpdated() {
    installRouter((location) => store.dispatch(navigate(decodeURIComponent(location.pathname))));
    installOfflineWatcher((offline) => store.dispatch(updateOffline(offline)));
    if (window.backendaiclient == undefined || window.backendaiclient == null) {
      document.querySelector('#login-panel').login();
    }
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
    console.log('attribute change: ', name, newval);
    super.attributeChangedCallback(name, oldval, newval);
  }

  refreshPage() {
    this.shadowRoot.getElementById('sign-button').icon = 'icons:exit-to-app';
    this.is_connected = true;
    if (window.backendaiclient != undefined && window.backendaiclient != null && window.backendaiclient.is_admin != undefined && window.backendaiclient.is_admin == true) {
      this.is_admin = true;
    } else {
      this.is_admin = false;
    }
    this._refreshUserInfoPanel();
  }

  _refreshUserInfoPanel() {
    this.user_id = window.backendaiclient.email;
    this.api_endpoint = window.backendaiclient._config.endpoint;
  }

  _routeChanged(changeRecord) {
    if (changeRecord.path === "route" && changeRecord.value.path == '/') {
    }
  }

  updated(changedProps) {
    if (changedProps.has('_page')) {
      let view = this._page;
      // load data for view
      /*if (['summary', 'job', 'agent', 'credential', 'data'].includes(view) != true) { // Fallback for Windows OS
        view = this.route.path.split(/[\/]+/).pop();
        this.routeData.view = view;
        this.route.path = '/' + view;
        this.$['app-page'].selected = view;
      }*/
      console.log(view);
      switch (view) {
        case 'summary':
          this.menuTitle = 'Summary';
          break;
        case 'job':
          this.menuTitle = 'Sessions';
          break;
        case 'agent':
          this.menuTitle = 'Computation Resources';
          break;
        case 'credential':
          this.menuTitle = 'Credentials & Policies';
          break;
        case 'data':
          this.menuTitle = 'Data';
          break;
        default:
          this.menuTitle = 'LOGIN REQUIRED';
      }
    }
  }

  logout() {
    window.backendaiclient = null;
    const keys = Object.keys(localStorage);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (/^(backendaiconsole\.)/.test(key)) localStorage.removeItem(key);
    }
    location.reload();
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      css`
        paper-icon-button {
          --paper-icon-button-ink-color: white;
        }

        app-drawer-layout:not([narrow]) [drawer-toggle] {
          display: none;
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <app-drawer-layout id="app-body" responsive-width="900px" drawer-width="200px">
        <app-drawer swipe-open slot="drawer" class="drawer-menu">
          <app-header-layout has-scrolling-region class="vertical layout">
            <app-header id="portrait-bar" slot="header" effects="waterfall" fixed>
              <div class="horizontal center layout flex bar"
                   onclick="location.reload();" style="cursor:pointer;">
                <div class="portrait-canvas">
                  <iron-image width=43 height=43 style="width:43px; height:43px;" src="manifest/backend.ai-brand.svg"
                              sizing="contain"></iron-image>
                </div>
                <div class="vertical start-justified layout">
                  <span class="site-name"><span class="bold">backend</span>.AI</span>
                  <span class="site-name" style="font-size:13px;">console</span>
                </div>
                <span class="flex"></span>
              </div>
            </app-header>
            <paper-listbox id="sidebar-menu" class="sidebar list" selected="0">
              <a ?selected="${this._page === 'summary'}" href="/summary" tabindex="-1">
                <paper-item link role="menuitem">
                  <iron-icon id="activities-icon" class="fg orange" icon="icons:view-quilt"></iron-icon>
                  Summary
                </paper-item>
              </a>
              <a ?selected="${this._page === 'job'}" href="/job" tabindex="-1" role="menuitem">
                <paper-item link>
                  <iron-icon class="fg red" icon="icons:subject"></iron-icon>
                  Sessions
                </paper-item>
              </a>
              ${this.is_admin ?
      html`
              <a ?selected="${this._page === 'agent'}" href="/agent" tabindex="-1" role="menuitem">
                <paper-item link>
                  <iron-icon class="fg blue" icon="hardware:device-hub"></iron-icon>
                  Resources
                </paper-item>
              </a>` :
      html``}
              ${this.is_admin ?
      html`
              <a ?selected="${this._page === 'credential'}" href="/credential" tabindex="-1" role="menuitem">
                <paper-item link>
                  <iron-icon class="fg lime" icon="icons:fingerprint"></iron-icon>
                  Credentials
                </paper-item>
              </a>` :
      html``}
                <paper-item disabled>
                  <iron-icon icon="icons:pageview"></iron-icon>
                  Experiments
                </paper-item>
                <a ?selected="${this._page === 'data'}" href="/data" tabindex="-1" role="menuitem">
                  <paper-item link>
                    <iron-icon class="fg lime" icon="vaadin:folder-open-o"></iron-icon>
                    Data
                  </paper-item>
                </a>
                <paper-item disabled>
                  <iron-icon icon="icons:assessment"></iron-icon>
                  Statistics
                </paper-item>
                <paper-item disabled>
                  <iron-icon icon="icons:build"></iron-icon>
                  Settings
                  <span class="flex"></span>
                </paper-item>
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
                  <small class="sidebar-footer">GUI Console (Alpha)</small>
                  <small class="sidebar-footer" style="font-size:9px;">0.9.20190218</small>
                </address>
              </div>
            </app-header-layout>
          </app-drawer>
          <app-header-layout main id="main-panel">
            <app-header slot="header" id="main-toolbar" condenses reveals
                        effects="waterfall blend-background"
                        effects-config='{"resize-snapped-title": {"startsAt": 0.8, "duration": "100ms"}, "parallax-background": {"scalar": 0.5}}'>
              <app-toolbar primary style="height:48px;" class="bar">
                <paper-icon-button icon="menu" drawer-toggle></paper-icon-button>
                <span title id="main-panel-toolbar-title">${this.menuTitle}</span>
              <span class="flex"></span>
              <div style="vertical end-justified flex layout">
                <div style="font-size: 10px;text-align:right">${this.user_id}</div>
                <div style="font-size: 8px;text-align:right">${this.api_endpoint}</div>
              </div>
              <paper-icon-button id="sign-button" icon="icons:launch" @click="${this.logout}"></paper-icon-button>
            </app-toolbar>
          </app-header>
          <div class="content">
            <div id="navbar-top" class="navbar-top horizontal flex layout wrap"></div>
            <section role="main" id="content" class="container layout vertical center">
                <backend-ai-summary-view name="summary" ?active="${this._page === 'summary'}"></backend-ai-summary-view>
                <backend-ai-job-view name="job" ?active="${this._page === 'job'}"></backend-ai-job-view>
                <backend-ai-credential-view name="credential" ?active="${this._page === 'credential'}"></backend-ai-credential-view>
                <backend-ai-agent-view name="agent" ?active="${this._page === 'agent'}"></backend-ai-agent-view>
                <backend-ai-data-view name="data" ?active="${this._page === 'data'}"></backend-ai-data-view>
            </section>
            <app-toolbar id="app-navbar-footer" style="height:45px;" class="bar layout flex horizontal">
              <paper-icon-button icon="menu" drawer-toggle></paper-icon-button>
              <paper-icon-button id="back-button" icon="icons:arrow-back"></paper-icon-button>
              <div id="lablup-notification-navbar" style="color: #999999; font-size:10px;"></div>
            </app-toolbar>
          </div>
        </app-header-layout>
      </app-drawer-layout>
      <backend-ai-offline-indicator ?active="${this._offlineIndicatorOpened}">
        You are now ${this._offline ? 'offline' : 'online'}.
      </backend-ai-offline-indicator>
    `;
  }

  stateChanged(state) {
    this._page = state.app.page;
    this._offline = state.app.offline;
    this._offlineIndicatorOpened = state.app.offlineIndicatorOpened;
    this._drawerOpened = state.app.drawerOpened;
    console.log("state changed");
    console.log(this._page);
  }
}

customElements.define(BackendAiConsole.is, BackendAiConsole);
