/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';
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
import '@polymer/paper-icon-button/paper-icon-button';

import '@polymer/app-layout/app-scroll-effects/effects/waterfall';
import '@polymer/app-layout/app-scroll-effects/effects/blend-background';
import '@polymer/iron-pages/iron-pages';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';
import '@vaadin/vaadin-icons/vaadin-icons.js';

import './backend.ai-client-es6.js';

import './backend-ai-styles.js';
import './backend-ai-login.js';
import './backend-ai-summary-view.js';
import './backend-ai-job-view';
import './backend-ai-credential-view';
import './backend-ai-agent-view';
import './backend-ai-data-view';

class BackendAiWebConsole extends PolymerElement {
  static get properties() {
    return {
      route: {
        type: Object,
        notify: true
      },
      routeData: {
        type: Object,
        notify: true
      },
      menuTitle: {
        type: String,
        value: 'Default'
      },
      user_id: {
        type: String,
        value: 'DISCONNECTED'
      },
      api_endpoint: {
        type: String,
        value: 'CLICK TO CONNECT'
      },
      is_connected: {
        type: Boolean,
        value: false
      },
      is_admin: {
        type: Boolean,
        value: false
      }
    }
  }

  constructor() {
    super();
    setPassiveTouchGestures(true);
  }

  ready() {
    super.ready();
    if (window.backendaiclient == undefined || window.backendaiclient == null) {
      document.querySelector('#login-panel').login();
    }
    this.$['sign-button'].addEventListener('tap', this.logout);
    document.addEventListener('backend-ai-connected', () => {
      this.$['sign-button'].icon = 'icons:exit-to-app';
      this.is_connected = true;
      if (window.backendaiclient != undefined && window.backendaiclient != null && window.backendaiclient.is_admin != undefined && window.backendaiclient.is_admin == true) {
        this.is_admin = true;
      } else {
        this.is_admin = false;
      }
      this._viewChanged(this.route);
      this._refreshUserInfoPanel();
    });
  }

  static get observers() {
    return [
      '_routeChanged(route.*)',
      '_viewChanged(routeData.view)'
    ]
  }

  _refreshUserInfoPanel() {
    this.user_id = window.backendaiclient.email;
    this.api_endpoint = window.backendaiclient._config.endpoint;
  }

  _routeChanged(changeRecord) {
    if (changeRecord.path === "route" && changeRecord.value.path == '/') {
      console.log('Path changed!');
    }
  }

  _viewChanged(view) {
    // load data for view
    if (['summary', 'job', 'agent', 'credential', 'data'].includes(view) != true) { // Fallback for Windows OS
      view = this.route.path.split(/[\/]+/).pop();
      this.routeData.view = view;
      this.route.path = '/' + view;
      this.$['app-page'].selected = view;
    }
    switch (view) {
      case 'summary':
        this.menuTitle = 'Summary';
        this.$['sidebar-menu'].selected = 0;
        break;
      case 'job':
        this.menuTitle = 'Jobs';
        this.$['sidebar-menu'].selected = 1;
        break;
      case 'agent':
        this.menuTitle = 'Agents';
        if (this.is_admin) {
          this.$['sidebar-menu'].selected = 2;
        } else {
          this.$['sidebar-menu'].selected = 0;
        }
        break;
      case 'credential':
        this.menuTitle = 'Credentials';
        if (this.is_admin) {
          this.$['sidebar-menu'].selected = 3;
        } else {
          this.$['sidebar-menu'].selected = 2;
        }
        break;
      case 'data':
        this.menuTitle = 'Data';
        if (this.is_admin) {
          this.$['sidebar-menu'].selected = 5;
        } else {
          this.$['sidebar-menu'].selected = 4;
        }
        break;
      default:
        this.menuTitle = 'Summary';
        this.$['sidebar-menu'].selected = 0;
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

  static get template() {
    // language=HTML
    return html`
      <style is="custom-style" include="backend-ai-styles iron-flex iron-flex-alignment iron-positioning">
        paper-icon-button {
          --paper-icon-button-ink-color: white;
        }

        app-drawer-layout:not([narrow]) [drawer-toggle] {
          display: none;
        }
      </style>
      <app-location route="{{route}}"></app-location>
      <app-route
        route="{{route}}"
        pattern="/:view"
        data="{{routeData}}"
        tail="{{subroute}}"></app-route>
      <app-drawer-layout id="app-body" responsive-width="900px" drawer-width="200px">
        <app-drawer swipe-open slot="drawer" class="drawer-menu">
          <app-header-layout has-scrolling-region class="vertical layout">
            <app-header id="portrait-bar" slot="header" effects="waterfall" fixed>
              <div class="horizontal center layout flex bar">
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
              <a href="/summary" tabindex="-1">
                <paper-item link role="menuitem">
                  <iron-icon id="activities-icon" class="fg orange" icon="icons:view-quilt"></iron-icon>
                  Summary
                </paper-item>
              </a>
              <a href="/job" tabindex="-1" role="menuitem">
                <paper-item link>
                  <iron-icon class="fg red" icon="icons:subject"></iron-icon>
                  Jobs
                </paper-item>
              </a>
              <template is="dom-if" if="{{is_admin}}">
                <a href="/agent" tabindex="-1" role="menuitem">
                  <paper-item link>
                    <iron-icon class="fg blue" icon="hardware:device-hub"></iron-icon>
                    Agents
                  </paper-item>
                </a>
              </template>
              <template is="dom-if" if="{{is_admin}}">
                <a href="/credential" tabindex="-1" role="menuitem">
                  <paper-item link>
                    <iron-icon class="fg lime" icon="icons:fingerprint"></iron-icon>
                    Credentials
                  </paper-item>
                </a>
              </template>
              <paper-item disabled>
                <iron-icon icon="icons:pageview"></iron-icon>
                Experiments
              </paper-item>
              <a href="/data" tabindex="-1">
                <paper-item link>
                  <iron-icon class="fg red" icon="vaadin:folder-open-o"></iron-icon>
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
                <small class="sidebar-footer" style="font-size:9px;">0.8.20190125</small>
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
              <span title id="main-panel-toolbar-title">[[menuTitle]]</span>
              <span class="flex"></span>
              <div style="vertical end-justified flex layout">
                <div style="font-size: 10px;text-align:right">{{user_id}}</div>
                <div style="font-size: 8px;text-align:right">{{api_endpoint}}</div>
              </div>
              <paper-icon-button id="sign-button" icon="icons:launch"></paper-icon-button>
            </app-toolbar>
          </app-header>
          <div class="content">
            <div id="navbar-top" class="navbar-top horizontal flex layout wrap"></div>
            <section id="content" class="container layout vertical center">
              <iron-pages id="app-page" selected="[[routeData.view]]" attr-for-selected="name"
                          selected-attribute="visible" fallback-selection="summary">
                <backend-ai-summary-view name="summary" route="{{subroute}}"
                                         data-path='src/backend-ai-summary-view.js'></backend-ai-summary-view>
                <backend-ai-job-view name="job" route="{{subroute}}"
                                     data-path='src/backend-ai-job-view.js'></backend-ai-job-view>
                <backend-ai-credential-view name="credential" route="{{subroute}}"
                                            data-path='src/backend-ai-credential-view.js'></backend-ai-credential-view>
                <backend-ai-agent-view name="agent" route="{{subroute}}"
                                       data-path='src/backend-ai-agent-view.js'></backend-ai-agent-view>
                <backend-ai-data-view name="data" route="{{subroute}}"
                                      data-path='src/backend-ai-data-view.js'></backend-ai-data-view>
              </iron-pages>
            </section>
            <app-toolbar id="app-navbar-footer" style="height:45px;" class="bar layout flex horizontal">
              <paper-icon-button icon="menu" drawer-toggle></paper-icon-button>
              <paper-icon-button id="back-button" icon="icons:arrow-back"></paper-icon-button>
              <div id="lablup-notification-navbar" style="color: #999999; font-size:10px;"></div>
            </app-toolbar>
          </div>
        </app-header-layout>
      </app-drawer-layout>
    `;
  }
}

customElements.define('backend-ai-web-console', BackendAiWebConsole);
