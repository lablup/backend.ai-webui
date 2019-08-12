/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, html} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';

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

import {default as PainKiller} from "./backend-ai-painkiller";
import './lablup-loading-indicator';
import './backend-ai-indicator';

class BackendAiMaintenanceView extends BackendAIPage {
	public images: any;
	public scanning: any;
	public recalculating: any;
	public notification: any;
	public shadowRoot: any;
	public indicator: any;
	public updateComplete: any;

  constructor() {
    super();
    setPassiveTouchGestures(true);
    this.images = {};
    this.active = false;
    this.scanning = false;
    this.recalculating = false;
  }

  static get is() {
    return 'backend-ai-maintenance-view';
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

  static get properties() {
    return {
      active: {
        type: Boolean
      },
      scanning: {
        type: Boolean
      },
      recalculating: {
        type: Boolean
      },
      images: {
        type: Object,
        hasChanged: () => true
      },
      notification: {
        type: Object
      },
      indicator: {
        type: Object
      }
    }
  }

  render() {
    // language=HTML
    return html`
      <lablup-notification id="notification"></lablup-notification>
      <backend-ai-indicator id="indicator"></backend-ai-indicator>
      <wl-card elevation="1">
        <h3 class="horizontal center layout">
          <span>General</span>
          <span class="flex"></span>
        </h3>

        <h4>Fix</h4>
        <div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Match usage database with current state</div>
              <div class="description">Recalculate usage database with current state.<br/>
                Useful if docker fails by accident, or some sessions have been forcibly terminated.
              </div>
            </div>
            <div class="vertical center-justified layout">
              <wl-button class="fg red" ?disabled="${this.recalculating}" outlined label="Recalculate usage" icon="refresh" @click="${() => this.recalculate_usage()}">
                <wl-icon>refresh</wl-icon>
                <span id="recalculate_usage-button-desc">Recalculate usage</span>
              </wl-button>
            </div>
          </div>
        </div>
        <h4>Images / Environment</h4>
        <div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Rescan image list from repository</div>
              <div class="description">Rescan image list from registered repositories.<br />
              It may take a long time, so please wait after execution.
              </div>
            </div>
            <div class="vertical center-justified layout">
              <wl-button class="fg red" ?disabled="${this.scanning}" outlined label="Rescan images" icon="refresh" @click="${() => this.rescan_images()}">
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
    this.notification = this.shadowRoot.querySelector('#notification');
    this.indicator = this.shadowRoot.querySelector('#indicator');

    if (window.backendaiclient === undefined || window.backendaiclient === null) {
      document.addEventListener('backend-ai-connected', () => {
      }, true);
    } else { // already connected
    }
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {

    }
  }

  async rescan_images() {
    this.shadowRoot.querySelector('#rescan-image-button-desc').textContent = 'Scanning...';
    this.scanning = true;
    //this.notification.text = 'Rescan image started.';
    //this.notification.show();
    this.indicator.start('indeterminate');
    this.indicator.set(10, 'Scanning...');
    window.backendaiclient.maintenance.rescan_images().then((response) => {
      this.shadowRoot.querySelector('#rescan-image-button-desc').textContent = 'Rescan images';
      this.scanning = false;
      this.indicator.set(100, 'Rescan image finished.');
      this.indicator.end(1000);
    }).catch(err => {
      this.scanning = false;
      this.shadowRoot.querySelector('#rescan-image-button-desc').textContent = 'Rescan images';
      console.log(err);
      this.indicator.set(50, 'Rescan failed.');
      this.indicator.end(1000);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.message);
        this.notification.show();
      }
    });
  }

  async recalculate_usage() {
    this.shadowRoot.querySelector('#recalculate_usage-button-desc').textContent = 'Recalculating...';
    this.recalculating = true;
    this.indicator.start('indeterminate');
    this.indicator.set(10, 'Recalculating...');
    window.backendaiclient.maintenance.recalculate_usage().then((response) => {
      this.shadowRoot.querySelector('#recalculate_usage-button-desc').textContent = 'Recalculate usage';
      this.recalculating = false;
      this.indicator.set(100, 'Recalculation finished.');
      this.indicator.end(1000);
    }).catch(err => {
      this.recalculating = false;
      this.shadowRoot.querySelector('#recalculate_usage-button-desc').textContent = 'Recalculate usage';
      console.log(err);
      this.indicator.set(50, 'Recalculation failed.');
      this.indicator.end(1000);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.message);
        this.notification.show();
      }
    });
  }
}

customElements.define(BackendAiMaintenanceView.is, BackendAiMaintenanceView);
