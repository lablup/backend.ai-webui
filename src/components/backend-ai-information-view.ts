/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import {BackendAiStyles} from './backend-ai-console-styles';
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
        </div>
        <div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>API version</div>
            </div>
            <div class="vertical center-justified layout">
              Backend.AI API
            </div>
          </div>
        </div>
        <h4>System</h4>
        <div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Rescan image list from repository</div>
              <div class="description">Rescan image list from registered repositories.<br />
              It may take a long time, so please wait after execution.
              </div>
            </div>
            <div class="vertical center-justified layout">
              <wl-button class="fg red" outlined label="Rescan images" icon="refresh">
                <wl-icon>refresh</wl-icon>
                <span id="rescan-image-button-desc">Rescan images</span>
              </wl-button>
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Clean up old images</div>
              <div class="description">Clean up old images from docker image list.
              </div>
            </div>
            <div class="vertical center-justified layout">
              <wl-button class="fg red" disabled outlined label="Clean up images" icon="delete">
                <wl-icon>delete</wl-icon>
                Clean up images
              </wl-button>
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
    if (active === false) {

    }
  }
  updateInformation() {
    this.manager_version = window.backendaiclient.managerVersion;
    this.console_version = window.packageVersion;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-information-view": BackendAiInformationView;
  }
}
