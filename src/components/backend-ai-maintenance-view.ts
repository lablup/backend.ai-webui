/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t, translateUnsafeHTML as _tr} from "lit-translate";
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

import {default as PainKiller} from "./backend-ai-painkiller";

/**
 Backend.AI Maintenance View

 Example:

 <backend-ai-maintenance-view class="page" name="maintenance" ?active="${0}">
 ... content ...
 </backend-ai-maintenance-view>

 @group Backend.AI Console
 @element backend-ai-maintenance-view
 */

@customElement("backend-ai-maintenance-view")
export default class BackendAiMaintenanceView extends BackendAIPage {

  @property({type: Object}) images = Object();
  @property({type: Boolean}) scanning = false;
  @property({type: Boolean}) recalculating = false;
  @property({type: Object}) notification = Object();
  @property({type: Object}) indicator = Object();

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
      <wl-card elevation="1">
        <h3 class="horizontal center layout">
          <span>${_t("maintenance.General")}</span>
          <span class="flex"></span>
        </h3>

        <h4>${_t("maintenance.Fix")}</h4>
        <div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("maintenance.MatchDatabase")}</div>
              <div class="description">${_tr("maintenance.DescMatchDatabase")}
              </div>
            </div>
            <div class="vertical center-justified layout">
              <wl-button class="fg red" ?disabled="${this.recalculating}" outlined label="Recalculate usage" icon="refresh" @click="${() => this.recalculate_usage()}">
                <wl-icon>refresh</wl-icon>
                <span id="recalculate_usage-button-desc">${_t("maintenance.RecalculateUsage")}</span>
              </wl-button>
            </div>
          </div>
        </div>
        <h4>${_t("maintenance.ImagesEnvironment")}</h4>
        <div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("maintenance.RescanImageList")}</div>
              <div class="description">${_tr("maintenance.DescRescanImageList")}
              </div>
            </div>
            <div class="vertical center-justified layout">
              <wl-button class="fg red" ?disabled="${this.scanning}" outlined label="Rescan images" icon="refresh" @click="${() => this.rescan_images()}">
                <wl-icon>refresh</wl-icon>
                <span id="rescan-image-button-desc">${_t("maintenance.RescanImages")}</span>
              </wl-button>
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("maintenance.CleanupOldImages")}</div>
              <div class="description">${_t("maintenance.DescCleanupOldImages")}
              </div>
            </div>
            <div class="vertical center-justified layout">
              <wl-button class="fg red" disabled outlined label="Clean up images" icon="delete">
                <wl-icon>delete</wl-icon>
                ${_t("maintenance.CleanupImages")}
              </wl-button>
            </div>
          </div>
        </div>
      </wl-card>
    `;
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    this.indicator = globalThis.lablupIndicator;

    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null) {
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

  /**
   * rescan the image
   */
  async rescan_images() {
    this.shadowRoot.querySelector('#rescan-image-button-desc').textContent = _text("maintenance.RescanImageScanning");
    this.scanning = true;
    //this.notification.text = 'Rescan image started.';
    //this.notification.show();
    let indicator = await this.indicator.start('indeterminate');
    indicator.set(10, 'Scanning...');
    globalThis.tasker.add(
      _text("maintenance.RescanImages"),
      globalThis.backendaiclient.maintenance.rescan_images().then((response) => {
        this.shadowRoot.querySelector('#rescan-image-button-desc').textContent = _text("maintenance.RescanImages");
        this.scanning = false;
        indicator.set(100, 'Rescan image finished.');
      }).catch(err => {
        this.scanning = false;
        this.shadowRoot.querySelector('#rescan-image-button-desc').textContent = _text("maintenance.RescanImages");
        console.log(err);
        indicator.set(50, 'Rescan failed.');
        indicator.end(1000);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      }), '', 'image');
  }

  /**
   * recalculate the usage
   */
  async recalculate_usage() {
    this.shadowRoot.querySelector('#recalculate_usage-button-desc').textContent = _text('maintenance.Recalculating');
    this.recalculating = true;
    let indicator = await this.indicator.start('indeterminate');
    indicator.set(10, 'Recalculating...');
    this.tasker.add(
      _text('maintenance.RecalculateUsage'),
      globalThis.backendaiclient.maintenance.recalculate_usage().then((response) => {
        this.shadowRoot.querySelector('#recalculate_usage-button-desc').textContent = _text('maintenance.RecalculateUsage');
        this.recalculating = false;
        indicator.set(100, 'Recalculation finished.');
      }).catch(err => {
        this.recalculating = false;
        this.shadowRoot.querySelector('#recalculate_usage-button-desc').textContent = _text('maintenance.RecalculateUsage');
        console.log(err);
        indicator.set(50, 'Recalculation failed.');
        indicator.end(1000);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      }), '', 'database');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-maintenance-view": BackendAiMaintenanceView;
  }
}
