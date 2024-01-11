/**
 @license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
 */
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import { default as PainKiller } from './backend-ai-painkiller';
import './lablup-activity-panel';
import { Button } from '@material/mwc-button/mwc-button';
import { css, CSSResultGroup, html } from 'lit';
import {
  get as _text,
  translate as _t,
  translateUnsafeHTML as _tr,
} from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';

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
  @property({ type: Object }) images = Object();
  @property({ type: Boolean }) scanning = false;
  @property({ type: Boolean }) recalculating = false;
  @property({ type: Object }) notification = Object();
  @property({ type: Object }) indicator = Object();
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
      `,
    ];
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css" />
      <div class="horizontal wrap layout" style="gap:24px;">
        <lablup-activity-panel title="${_t('maintenance.Fix')}">
          <div slot="message" class="vertical flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div class="title">${_t('maintenance.MatchDatabase')}</div>
              <div class="description">
                ${_tr('maintenance.DescMatchDatabase')}
              </div>
            </div>
            <mwc-button
              outlined
              id="recalculate_usage-button-desc"
              ?disabled="${this.recalculating}"
              label="${_t('maintenance.RecalculateUsage')}"
              icon="refresh"
              @click="${() => this.recalculate_usage()}"
            ></mwc-button>
          </div>
        </lablup-activity-panel>
        <lablup-activity-panel title="${_t('maintenance.ImagesEnvironment')}">
          <div slot="message">
            <div class="horizontal flex layout wrap setting-item">
              <div class="vertical center-justified layout setting-desc">
                <div class="title">${_t('maintenance.RescanImageList')}</div>
                <div class="description">
                  ${_tr('maintenance.DescRescanImageList')}
                </div>
              </div>
              <mwc-button
                outlined
                id="rescan-image-button-desc"
                ?disabled="${this.scanning}"
                label="${_t('maintenance.RescanImages')}"
                icon="refresh"
                @click="${() => this.rescan_images()}"
              ></mwc-button>
            </div>
            <div
              class="horizontal flex layout wrap setting-item temporarily-hide"
            >
              <div class="vertical center-justified layout setting-desc">
                <div class="title">${_t('maintenance.CleanupOldImages')}</div>
                <div class="description">
                  ${_t('maintenance.DescCleanupOldImages')}
                </div>
              </div>
              <mwc-button
                outlined
                disabled
                label="${_t('maintenance.CleanupImages')}"
                icon="delete"
              ></mwc-button>
            </div>
          </div>
        </lablup-activity-panel>
      </div>
    `;
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    this.indicator = globalThis.lablupIndicator;

    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          return true;
        },
        true,
      );
    } else {
      // already connected
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
    let taskId;
    this.tasker.add(
      _text('maintenance.RescanImages'),
      new Promise((resolve, reject) => {
        return globalThis.backendaiclient.maintenance
          .rescan_images()
          .then(({ rescan_images }) => {
            const sse: EventSource =
              globalThis.backendaiclient.maintenance.attach_background_task(
                rescan_images.task_id,
              );
            taskId = rescan_images.task_id;
            sse.addEventListener('bgtask_updated', (e) => {
              // TODO: update progress bar
              // const data = JSON.parse(e['data']);
              // const ratio = data.current_progress / data.total_progress;
              // this.tasker.updateNotification(taskId, {
              //   description: _text('maintenance.Scanning'),
              //   progress: {
              //     percent: 100 * ratio,
              //     status: 'normal',
              //   },
              // });
            });
            sse.addEventListener('bgtask_done', (e) => {
              const event = new CustomEvent('image-rescanned');
              document.dispatchEvent(event);
              sse.close();
              resolve({
                description: _text('maintenance.RescanImageFinished'),
                progress: {
                  percent: 100,
                  status: 'success',
                },
              });
            });
            sse.addEventListener('bgtask_failed', (e) => {
              console.log('task_failed', e['data']);
              sse.close();
              const data = JSON.parse(e['data']);
              const ratio = data.current_progress / data.total_progress;
              reject({
                description: _text('maintenance.RescanImageFailed'),
                progress: {
                  percent: ratio * 100,
                  status: 'exception',
                },
              });
              throw new Error('Background Image scanning task has failed');
            });
            sse.addEventListener('bgtask_cancelled', (e) => {
              sse.close();
              const data = JSON.parse(e['data']);
              const ratio = data.current_progress / data.total_progress;
              reject({
                description: _text('maintenance.RescanImageCancelled'),
                progress: {
                  percent: ratio * 100,
                  status: 'exception',
                },
              });
              throw new Error(
                'Background Image scanning task has been cancelled',
              );
            });
            this.scanning = false;
          })
          .catch((err) => {
            this.scanning = false;
            console.log(err);
            let message = _text('maintenance.RescanFailed');
            let description;
            if (err && err.message) {
              message = PainKiller.relieve(err.title);
              description = err.message;
            }
            reject({
              message: message,
              description: description,
              progress: {
                percent: 50,
                status: 'exception',
              },
            });
          });
      }),
      taskId,
      'image',
      '',
      _text('maintenance.Scanning'),
    );
  }

  /**
   * recalculate the usage
   */
  async recalculate_usage() {
    this.recalculateUsageButton.label = _text('maintenance.Recalculating');
    this.recalculating = true;
    this.tasker.add(
      _text('maintenance.RecalculateUsage'),
      new Promise((resolve, reject) => {
        return globalThis.backendaiclient.maintenance
          .recalculate_usage()
          .then((response) => {
            this.recalculateUsageButton.label = _text(
              'maintenance.RecalculateUsage',
            );
            this.recalculating = false;
            resolve({
              description: _text('maintenance.RecalculationFinished'),
              progress: {
                percent: 100,
                status: 'success',
              },
            });
          })
          .catch((err) => {
            this.recalculating = false;
            this.recalculateUsageButton.label = _text(
              'maintenance.RecalculateUsage',
            );
            console.log(err);
            let message = _text('maintenance.RecalculationFailed');
            let description;
            if (err && err.message) {
              message = PainKiller.relieve(err.title);
              description = err.message;
            }
            reject({
              message: message,
              description: description,
              progress: {
                percent: 50,
                status: 'exception',
              },
            });
          });
      }),
      '',
      'database',
      '',
      _text('maintenance.Recalculating'),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-maintenance-view': BackendAiMaintenanceView;
  }
}
