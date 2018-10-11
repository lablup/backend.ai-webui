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
import '@polymer/iron-image/iron-image';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';

import '@polymer/app-layout/app-scroll-effects/effects/waterfall';
import '@polymer/app-layout/app-scroll-effects/effects/blend-background';
import '@polymer/iron-pages/iron-pages';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';

//import * as ai from 'backend.ai-client';
import * as ai from './backend.ai-client'; // Now use internal backend.ai-client version.

import './backend-ai-styles.js';
import './backend-ai-job-view.js';

class BackendAiAdminApp extends PolymerElement {
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
    // Resolve warning about scroll performance 
    // See https://developers.google.com/web/updates/2016/06/passive-event-listeners
    setPassiveTouchGestures(true);
  }

  ready() {
    super.ready();
    this.clientConfig = new ai.backend.ClientConfig(
        'AKIAJHYLTQBDDRYTHBXY',
        '6OAKp_sOZLA99--XcMszRaWNJIqc7vX_7LBnz3qp',
        'https://api.backend.ai'
    );

    this.client = new ai.backend.Client(
      this.clientConfig,
      `Backend.AI Admin App.`,
    );
    this.client.test_gql();
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
        default:
            this.menuTitle = 'Summary';
    }
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
                        <iron-image width=43 height=43 style="width:43px; height:43px;" src="manifest/logo-black.svg"
                                    sizing="contain"></iron-image>
                    </div>
                    <span class="site-name">cloud.<span class="bold">backend</span>.AI</span>
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
                    <paper-item disabled>
                        <iron-icon class="fg green" icon="icons:pageview"></iron-icon>
                        Experiments
                    </paper-item>
                    <paper-item disabled>
                        <iron-icon icon="icons:assessment"></iron-icon>
                        Statistics
                    </paper-item>
                    <paper-item disabled>
                        <iron-icon class="fg blue" icon="icons:build"></iron-icon>
                        Settings
                        <span class="flex"></span>
                    </paper-item>
            </paper-listbox>
            <footer>
                <div class="terms-of-use" style="margin-bottom:50px;">
                    <small>
                        <a href="https://cloud.backend.ai/@lablupinc/terms-of-service-payment">Terms of Service</a>
                        ·
                        <a href="https://cloud.backend.ai/@lablupinc/privacy-policy">Privacy Policy</a>
                    </small>
                </div>
            </footer>
            <div id="sidebar-navbar-footer" class="horizontal center center-justified layout">
                <address>
                    <small>Ultra Alpha</small>
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
            </app-toolbar>
        </app-header>
        <div class="content">
            <div id="navbar-top" class="navbar-top horizontal flex layout wrap">
            </div>
            <section id="content" class="container layout vertical center">
                <iron-pages selected="[[routeData.view]]" attr-for-selected="name">
                    <backend-ai-job-view name="job" route="{{subroute}}"></backend-ai-job-view>
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

customElements.define('backend-ai-admin-app', BackendAiAdminApp);
