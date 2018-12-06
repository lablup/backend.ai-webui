/**
 * Backend.AI-admin-app
 */

import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings';
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
import 'iron-lazy-pages/iron-lazy-pages';
import './backend.ai-client-es6.js';

import './backend-ai-styles.js';
import './backend-ai-login.js';

class BackendAiAdminConsole extends PolymerElement {
  static get properties() {
    return {
      menuTitle: {
          type: String,
          value: 'Default'
      }
    };
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
    this.$['logout-button'].addEventListener('tap', this.logout);
  }
  static get observers() {
    return [
      '_routeChanged(route.*)',
      '_viewChanged(routeData.view)'
    ]
  }

  _routeChanged(changeRecord) {
    if (changeRecord.path === 'path') {
      console.log('Path changed!');
    }
  }
  _viewChanged(view) {
    // load data for view
    switch(view) {
      case 'summary':
        this.menuTitle = 'Summary';
        this.$['sidebar-menu'].selected = 0;
        break;
      case 'job':
        this.menuTitle = 'Jobs';
        this.$['sidebar-menu'].selected = 1;
        break;
      case 'credential':
        this.menuTitle = 'Credentials';
        this.$['sidebar-menu'].selected = 3;
        break;
      case 'agent':
        this.menuTitle = 'Agents';
        this.$['sidebar-menu'].selected = 2;
        break;

      default:
        this.menuTitle = 'Summary';
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
            <span class="site-name" style="font-size:13px;">webconsole</span>
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
        <a href="/agent" tabindex="-1" role="menuitem">
          <paper-item link>
            <iron-icon class="fg blue" icon="hardware:device-hub"></iron-icon>
            Agents
          </paper-item>
        </a>
        <a href="/credential" tabindex="-1" role="menuitem">
          <paper-item link>
            <iron-icon class="fg lime" icon="icons:fingerprint"></iron-icon>
            Credentials
          </paper-item>
        </a>
        <paper-item disabled>
          <iron-icon class="fg green" icon="icons:pageview"></iron-icon>
          Experiments
        </paper-item>
        <paper-item disabled>
          <iron-icon icon="icons:assessment"></iron-icon>
          Statistics
        </paper-item>
        <paper-item disabled>
          <iron-icon class="fg lime" icon="icons:build"></iron-icon>
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
          <small class="sidebar-footer">WebConsole (Alpha)</small>
          <small class="sidebar-footer" style="font-size:9px;">0.4.20181127</small>
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
          <div style="font-size: 10px;text-align:right">test@example.com</div>
          <div style="font-size: 8px;text-align:right">http://127.0.0.1:8081</div>
        </div>
        <paper-icon-button id="logout-button" icon="icons:exit-to-app"></paper-icon-button>
      </app-toolbar>
    </app-header>
    <div class="content">
      <div id="navbar-top" class="navbar-top horizontal flex layout wrap"></div>
      <section id="content" class="container layout vertical center">
        <iron-lazy-pages selected="[[routeData.view]]" attr-for-selected="name">
          <backend-ai-summary-view name="summary" route="{{subroute}}" data-path='src/backend-ai-summary-view.js'></backend-ai-summary-view>
          <backend-ai-job-view name="job" route="{{subroute}}" data-path='src/backend-ai-job-view.js'></backend-ai-job-view>
          <backend-ai-credential-view name="credential" route="{{subroute}}" data-path='src/backend-ai-credential-view.js'></backend-ai-credential-view>
          <backend-ai-agent-view name="agent" route="{{subroute}}" data-path='src/backend-ai-agent-view.js'></backend-ai-agent-view>
        </iron-lazy-pages>
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

customElements.define('backend-ai-admin-console', BackendAiAdminConsole);
