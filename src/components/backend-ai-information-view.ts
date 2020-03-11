/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

import 'weightless/button';
import 'weightless/icon';
import 'weightless/card';

import './lablup-loading-indicator';
import './backend-ai-indicator';

@customElement("backend-ai-information-view")
export default class BackendAiInformationView extends BackendAIPage {

  @property({type: Object}) notification = Object();
  @property({type: Object}) indicator = Object();
  @property({type: String}) manager_version = '';
  @property({type: String}) manager_version_latest = '';
  @property({type: String}) console_version = '';
  @property({type: String}) api_version = '';
  @property({type: String}) docker_version = '';
  @property({type: String}) pgsql_version = '';
  @property({type: String}) redis_version = '';
  @property({type: String}) etcd_version = '';
  @property({type: Boolean}) account_changed = true;
  @property({type: Boolean}) use_ssl = true;

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
        div.indicator,
        span.indicator {
          font-size: 9px;
          margin-right: 5px;
        }

        div.description,
        span.description {
          font-size: 11px;
          margin-top: 5px;
          margin-right: 5px;
        }

        .setting-item {
          margin: 15px auto;
        }

        .setting-desc {
          width: 300px;
        }

        wl-card > div {
          padding: 15px;
        }

        wl-button {
          --button-bg: transparent;
          --button-bg-hover: var(--paper-red-100);
          --button-bg-active: var(--paper-red-100);
          --button-bg-disabled: #ccc;
          --button-color: var(--paper-red-100);
          --button-color-hover: var(--paper-red-100);
          --button-color-disabled: #ccc;
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <backend-ai-indicator id="indicator"></backend-ai-indicator>
      <wl-card elevation="1">
        <h3 class="horizontal center layout">
          <span>System</span>
          <span class="flex"></span>
        </h3>

        <h4>Core</h4>
        <div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Manager version</div>
            </div>
            <div class="vertical center-justified layout">
              Backend.AI ${this.manager_version}
              <lablup-shields app="Installation" color="darkgreen" description="${this.manager_version}" ui="flat"></lablup-shields>
              <lablup-shields app="Latest Release" color="darkgreen" description="${this.manager_version_latest}" ui="flat"></lablup-shields>
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>API version</div>
            </div>
            <div class="vertical center-justified layout">
              ${this.api_version}
            </div>
          </div>
        </div>
        <h4>Components</h4>
        <div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Docker version</div>
              <div class="description">Docker version on the cluster
              </div>
            </div>
            <div class="vertical center-justified layout">
              ${this.docker_version}
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>PostgreSQL version</div>
              <div class="description">Database system for Backend.AI
              </div>
            </div>
            <div class="vertical center-justified layout">
              ${this.pgsql_version}
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>ETCD version</div>
              <div class="description">Settings registry for Backend.AI
              </div>
            </div>
            <div class="vertical center-justified layout">
              ${this.etcd_version}
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Redis version</div>
              <div class="description">Cache / temporary storage for Backend.AI. <br />Also uses as asynchronous communication along agents.
              </div>
            </div>
            <div class="vertical center-justified layout">
              ${this.redis_version}
            </div>
          </div>
        </div>
        <h4>Security</h4>
        <div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Default administrator account changed</div>
              <div class="description">SHOULD change the default account / password for production use.
              </div>
            </div>
            <div class="vertical center-justified layout">
            ${this.account_changed ? html`<wl-icon>done</wl-icon>` : html`<wl-icon>warning</wl-icon>`}
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Uses SSL</div>
              <div class="description">HTTPS with proper SSL setup helps system
              </div>
            </div>
            <div class="vertical center-justified layout">
            ${this.use_ssl ? html`<wl-icon>done</wl-icon>` : html`<wl-icon>warning</wl-icon>`}
            </div>
          </div>
        </div>
      </wl-card>
    `;
  }

  firstUpdated() {
    this.notification = window.lablupNotification;
    this.indicator = this.shadowRoot.querySelector('#indicator');

    if (typeof window.backendaiclient === "undefined" || window.backendaiclient === null) {
      document.addEventListener('backend-ai-connected', () => {
        this.updateInformation();
      }, true);
    } else { // already connected
      this.updateInformation();
    }
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (!active) {
      return;
    }
  }
  updateInformation() {
    this.manager_version = window.backendaiclient.managerVersion;
    this.console_version = window.packageVersion;
    this.api_version = window.backendaiclient.apiVersion;
    this.docker_version = 'Compatible'; // It uses 20.03 API.
    this.pgsql_version = 'Compatible';
    this.redis_version = 'Compatible';
    this.etcd_version = 'Compatible';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-information-view": BackendAiInformationView;
  }
}
