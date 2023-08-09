/**
 @license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t, translateUnsafeHTML as _tr} from 'lit-translate';
import {css, CSSResultGroup, html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

import {BackendAIPage} from './backend-ai-page';

import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

import {Button} from '@material/mwc-button/mwc-button';

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
  @query('#recalculate_usage-button-desc') recalculateUsageButton!: Button;
  @query('#rescan-image-button-desc') rescanImageButton!: Button;

  static get styles(): CSSResultGroup {
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
      <link rel="stylesheet" href="resources/custom.css">
      <backend-ai-react-maintenance-view
        value="${JSON.stringify({
          recalculating: this.recalculating,
          scanning: this.scanning
        })}"
        @recalculate="${(e)=> this.recalculate_usage()}"
        @rescan="${(e)=> this.rescan_images()}"
      >
      </backend-ai-react-maintenance-view>
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

  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (active === false) {

    }
  }

  /**
   * rescan the image
   */
  async rescan_images() {
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
        this.scanning = false;
      }).catch((err) => {
        this.scanning = false;
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
    this.recalculating = true;
    const indicator = await this.indicator.start('indeterminate');
    indicator.set(10, _text('maintenance.Recalculating'));
    this.tasker.add(
      _text('maintenance.RecalculateUsage'),
      globalThis.backendaiclient.maintenance.recalculate_usage().then((response) => {
        this.recalculating = false;
        indicator.set(100, _text('maintenance.RecalculationFinished'));
      }).catch((err) => {
        this.recalculating = false;
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
