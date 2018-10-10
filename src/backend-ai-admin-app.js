/**
 * Backend.AI-admin-app 
 */

import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings';
import '@polymer/app-layout/app-layout.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-styles/typography.js';
import '@polymer/paper-styles/color.js';
import '@polymer/paper-material/paper-material.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-image/iron-image.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import './backend-ai-styles.js';

class BackendAiAdminApp extends PolymerElement {
  static get properties() {
    return {
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
  }

  static get template() {
    return html`
<style is="custom-style" include="backend-ai-styles iron-flex-layout">
    paper-icon-button {
        --paper-icon-button-ink-color: white;
    }

    app-drawer-layout:not([narrow]) [drawer-toggle] {
        display: none;
    }
</style>
<app-drawer-layout id="app-body" responsive-width="900px" drawer-width="200px">
    <app-drawer swipe-open slot="drawer" class="drawer-menu">
        <app-header-layout has-scrolling-region class="vertical layout">
            <app-header id="portrait-bar" slot="header" effects="waterfall" fixed>
                <div class="horizontal layout flex center bar">
                    <div class="portrait-canvas">
                        <iron-image width=43 height=43 style="width:43px; height:43px;" src="img/logo-black.svg"
                                    sizing="contain"></iron-image>
                    </div>
                    <span class="site-name">cloud.<span class="bold">backend</span>.ai</span>
                    <span class="flex"></span>
                </div>
            </app-header>
            <paper-listbox id="sidebar-menu" class="sidebar list" selected="0">
                <paper-item link>
                    <iron-icon id="activities-icon" class="orange" icon="icons:view-quilt"></iron-icon>
                    Summary
                </paper-item>
                <paper-item link>
                    <iron-icon class="fg red" icon="icons:subject"></iron-icon>
                    Jobs
                </paper-item>
                <paper-item link>
                    <iron-icon class="fg green" icon="icons:pageview"></iron-icon>
                    Experiments
                </paper-item>
                <paper-item disabled>
                    <iron-icon icon="icons:assessment"></iron-icon>
                    Statistics
                </paper-item>
                <paper-item link>
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
                    Alpha
                </address>
            </div>
        </app-header-layout>
    </app-drawer>
    <app-header-layout main id="main-panel">
        <app-header slot="header" id="main-toolbar" condenses reveals
                    effects="waterfall blend-background"
                    effects-config='{"resize-snapped-title": {"startsAt": 0.8, "duration": "100ms"}, "parallax-background": {"scalar": 0.5}}'>
            <app-toolbar primary style="height:80px;" class="bar">
                <paper-icon-button icon="menu" drawer-toggle></paper-icon-button>
                <span title id="main-panel-toolbar-title">Title</span>
                <span class="flex"></span>
            </app-toolbar>
        </app-header>
        <div class="content">
            <div id="navbar-top" class="navbar-top horizontal flex layout wrap">
            </div>
            <section id="content" class="container layout vertical center">
            <paper-material class="item" elevation="1">
            <h3 class="paper-material-title">Menu title</h3>

TEST</paper-material>
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
