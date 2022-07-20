/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t, translateUnsafeHTML as _tr} from 'lit-translate';
import {css, CSSResultGroup, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

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

import '@material/mwc-button/mwc-button';

import './lablup-activity-panel';
import {default as PainKiller} from './backend-ai-painkiller';

/**
 Backend.AI Maintenance View

 Example:

 <backend-ai-maintenance-view class="page" name="maintenance" ?active="${0}">
 ... content ...
 </backend-ai-maintenance-view>

@group Backend.AI Web UI
 @element backend-ai-maintenance-view
 */

@customElement('backend-ai-maintenance-view')
export default class BackendAiMaintenanceView extends BackendAIPage {
  @property({type: Object}) images = Object();
  @property({type: Boolean}) scanning = false;
  @property({type: Boolean}) recalculating = false;
  @property({type: Object}) notification = Object();
  @property({type: Object}) indicator = Object();

  constructor() {
    super();
  }

  static get styles(): CSSResultGroup | undefined {
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

        div.title {
          font-size: 14px;
          font-weight: bold;
        }

        div.description,
        span.description {
          font-size: 13px;
          margin-top: 5px;
          margin-right: 5px;
        }

        .setting-item {
          margin: 15px auto;
        }

        .setting-desc {
          width: 100%;
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

        mwc-button[outlined] {
          width: 100%;
          margin: 10px auto;
          background-image: none;
          --mdc-button-outline-width: 2px;
          --mdc-button-disabled-outline-color: var(--general-sidebar-color);
          --mdc-button-disabled-ink-color: var(--general-sidebar-color);
          --mdc-theme-primary: #38bd73;
          --mdc-theme-on-primary: #38bd73;
        }

        lablup-activity-panel {
          color: #000;
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <div class="horizontal wrap layout">
        <lablup-activity-panel title="${_t('maintenance.Fix')}">
          <div slot="message" class="vertical flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div class="title">${_t('maintenance.MatchDatabase')}</div>
              <div class="description">${_tr('maintenance.DescMatchDatabase')}
              </div>
            </div>
            <mwc-button
                  outlined
                  id="recalculate_usage-button-desc"
                  ?disabled="${this.recalculating}"
                  label="${_t('maintenance.RecalculateUsage')}"
                  icon="refresh"
                  @click="${() => this.recalculate_usage()}">
            </mwc-button>
          </div>
        </lablup-activity-panel>
        <lablup-activity-panel title="${_t('maintenance.ImagesEnvironment')}">
          <div slot="message">
            <div class="horizontal flex layout wrap setting-item">
              <div class="vertical center-justified layout setting-desc">
                <div class="title">${_t('maintenance.RescanImageList')}</div>
                <div class="description">${_tr('maintenance.DescRescanImageList')}
                </div>
              </div>
              <mwc-button
                  outlined
                  id="rescan-image-button-desc"
                  ?disabled="${this.scanning}"
                  label="${_t('maintenance.RescanImages')}"
                  icon="refresh"
                  @click="${() => this.rescan_images()}">
              </mwc-button>
            </div>
            <div class="horizontal flex layout wrap setting-item temporarily-hide">
              <div class="vertical center-justified layout setting-desc">
                <div class="title">${_t('maintenance.CleanupOldImages')}</div>
                <div class="description">${_t('maintenance.DescCleanupOldImages')}
                </div>
              </div>
              <mwc-button
                  outlined
                  disabled
                  label="${_t('maintenance.CleanupImages')}"
                  icon="delete">
              </mwc-button>
            </div>
          </div>
        </lablup-activity-panel>
      </div>
    `;
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    this.indicator = globalThis.lablupIndicator;

    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null) {
      document.addEventListener('backend-ai-connected', () => {
        return true;
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
    this.shadowRoot.querySelector('#rescan-image-button-desc').label = _text('maintenance.RescanImageScanning');
    this.scanning = true;
    // this.notification.text = 'Rescan image started.';
    // this.notification.show();
    const indicator = await this.indicator.start('indeterminate');
    indicator.set(0, _text('maintenance.Scanning'));
    globalThis.tasker.add(
      _text('maintenance.RescanImages'),
      globalThis.backendaiclient.maintenance.rescan_images().then(({rescan_images}) => {
        const sse: EventSource = globalThis.backendaiclient.maintenance.attach_background_task(rescan_images.task_id);
        sse.addEventListener('bgtask_updated', (e) => {
          const data = JSON.parse(e['data']);
          const ratio = data.current_progress/data.total_progress;
          indicator.set(100 * ratio, _text('maintenance.Scanning'));
        });
        sse.addEventListener('bgtask_done', (e) => {
          const event = new CustomEvent('image-rescanned');
          document.dispatchEvent(event);
          indicator.set(100, _text('maintenance.RescanImageFinished'));
          sse.close();
        });
        sse.addEventListener('bgtask_failed', (e) => {
          console.log('task_failed', e['data']);
          sse.close();
          throw new Error('Background Image scanning task has failed');
        });
        sse.addEventListener('bgtask_cancelled', (e) => {
          sse.close();
          throw new Error('Background Image scanning task has been cancelled');
        });
        this.shadowRoot.querySelector('#rescan-image-button-desc').label = _text('maintenance.RescanImages');
        this.scanning = false;
      }).catch((err) => {
        this.scanning = false;
        this.shadowRoot.querySelector('#rescan-image-button-desc').label = _text('maintenance.RescanImages');
        console.log(err);
        indicator.set(50, _text('maintenance.RescanFailed'));
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
    this.shadowRoot.querySelector('#recalculate_usage-button-desc').label = _text('maintenance.Recalculating');
    this.recalculating = true;
    const indicator = await this.indicator.start('indeterminate');
    indicator.set(10, _text('maintenance.Recalculating'));
    this.tasker.add(
      _text('maintenance.RecalculateUsage'),
      globalThis.backendaiclient.maintenance.recalculate_usage().then((response) => {
        this.shadowRoot.querySelector('#recalculate_usage-button-desc').label = _text('maintenance.RecalculateUsage');
        this.recalculating = false;
        indicator.set(100, _text('maintenance.RecalculationFinished'));
      }).catch((err) => {
        this.recalculating = false;
        this.shadowRoot.querySelector('#recalculate_usage-button-desc').label = _text('maintenance.RecalculateUsage');
        console.log(err);
        indicator.set(50, _text('maintenance.RecalculationFailed'));
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
    'backend-ai-maintenance-view': BackendAiMaintenanceView;
  }
}
