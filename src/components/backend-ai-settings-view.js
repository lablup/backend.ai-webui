/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, html, LitElement} from 'lit-element';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';

import {BackendAiStyles} from './backend-ai-console-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';

import 'weightless/card';
import 'weightless/switch';

class BackendAiSettingsView extends LitElement {
  constructor() {
    super();
    setPassiveTouchGestures(true);
    this.images = {};
    this.active = false;
  }

  static get is() {
    return 'backend-ai-settings-view';
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
      `];
  }

  static get properties() {
    return {
      active: {
        type: Boolean
      },
      images: {
        type: Object,
        hasChanged: () => true
      }
    };
  }

  render() {
    // language=HTML
    return html`
      <wl-card elevation="1">
        <h3 class="horizontal center layout">
          <span>General</span>
          <span class="flex"></span>
        </h3>
        <div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Register new images from repository</div>
              <div class="description">Register new environments from repository.
              </div>
            </div>
            <div class="vertical center-justified layout">
              <wl-switch disabled></wl-switch>
            </div>
          </div>

          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Automatic image update from repository</div>
              <div class="description">Allow automatic image update from registered registries.
              </div>
            </div>
            <div class="vertical center-justified layout">
              <wl-switch disabled></wl-switch>
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Use Backend.AI CLI on GUI</div>
              <div class="description">Provide Backend.AI CLI on GUI app.<br/>Requires Backend.AI CLI image.
              </div>
            </div>
            <div class="vertical center-justified layout">
              <wl-switch disabled></wl-switchdisabled>
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Use Backend.AI GUI on Web</div>
              <div class="description">Provide Backend.AI GUI as a web service.<br/>Requires Backend.AI Console image.
              </div>
            </div>
            <div class="vertical center-justified layout">
              <wl-switch disabled></wl-switch>
            </div>
          </div>
        </div>
        <h3 class="horizontal center layout">
          <span>Scaling</span>
          <span class="flex"></span>
        </h3>
        <div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Allow agent-side registration</div>
              <div class="description">Allow agent to register itself to manager.<br/>Use only if Backend.AI cluster is
                managed on secure location.
              </div>
            </div>
            <div class="vertical center-justified layout">
              <wl-switch checked disabled></wl-switch>
            </div>
          </div>
        </div>

        <h3 class="horizontal center layout">
          <span>Plugin</span>
          <span class="flex"></span>
        </h3>
        <div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Virtual GPU</div>
              <div class="description">Use Virtual GPU feature. <br/>Requires Backend.AI Virtual CUDA API Layer Plugin.
              </div>
            </div>
            <div class="vertical center-justified layout">
              <wl-switch checked disabled></wl-switch>
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>TPU</div>
              <div class="description">Use TPU accelerator. <br/>Requires resource nodes on Google Cloud with Cloud TPU
                enabled.
              </div>
            </div>
            <div class="vertical center-justified layout">
              <wl-switch disabled></wl-switch>
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Statistics</div>
              <div class="description">Use precise statistics module. <br/>
              </div>
            </div>
            <div class="vertical center-justified layout">
              <wl-switch disabled></wl-switch>
            </div>
          </div>
        </div>


      </wl-card>
    `;
  }

  shouldUpdate() {
    return this.active;
  }

  firstUpdated() {
    if (window.backendaiclient === undefined || window.backendaiclient === null) {
      document.addEventListener('backend-ai-connected', () => {
      }, true);
    } else { // already connected
    }
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  _indexFrom1(index) {
    return index + 1;
  }
}

customElements.define(BackendAiSettingsView.is, BackendAiSettingsView);
