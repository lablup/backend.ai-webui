/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import { css, html, LitElement } from 'lit';
import { translate as _t } from 'lit-translate';
import { customElement, property } from 'lit/decorators.js';

/**
 Backend.AI Monthly Usage Panel

 @group Backend.AI Console
 @element backend-ai-monthly-usage-panel
 */

@customElement('backend-ai-monthly-usage-panel')
export default class BackendAIMonthlyUsagePanel extends LitElement {
  @property({ type: Number }) num_sessions = 0;
  @property({ type: String }) used_time = '0:00:00.00';
  @property({ type: String }) cpu_used_time = '0:00:00.00';
  @property({ type: String }) gpu_used_time = '0:00:00.00';
  @property({ type: Number }) disk_used = 0;
  @property({ type: Number }) traffic_used = 0;

  constructor() {
    super();
  }

  static get styles() {
    return [
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        .value {
          padding: 15px;
          font-size: 25px;
          font-weight: bold;
        }

        .desc {
          padding: 0px 15px 20px 15px;
        }
      `,
    ];
  }

  firstUpdated() {
    this.formatting();
  }

  formatting() {
    this.used_time = this.usedTimeFormatting(this.used_time);
    this.cpu_used_time = this.usedTimeFormatting(this.cpu_used_time);
    this.gpu_used_time = this.usedTimeFormatting(this.gpu_used_time);

    this.disk_used = Math.floor(this.disk_used / 10 ** 9); // bytes to GB
    this.traffic_used = Math.floor(this.traffic_used / 2 ** 20); // bytes to MiB
  }

  /**
   * Time formatting for statistics panel
   *
   * @param {string} time - [days]:[hours]:[minutes].[seconds]
   * @return {string} [hours]h [minutes]m
   * */
  usedTimeFormatting(time) {
    const days = parseInt(time.substring(0, time.indexOf(':')));
    let hours = parseInt(
      time.substring(time.indexOf(':') + 1, time.lastIndexOf(':')),
    );
    const minutes = time.substring(
      time.lastIndexOf(':') + 1,
      time.indexOf('.'),
    );
    hours = days * 24 + hours;
    return hours + 'h ' + minutes + 'm';
  }

  render() {
    // language=HTML
    return html`
      <div class="card">
        <h3>${_t('usagePanel.StatisticsForThisMonth')}</h3>
        <div class="horizontal layout">
          <div class="vertical center layout">
            <span class="value">${this.num_sessions}</span>
            <span class="desc">${_t('usagePanel.NumSessions')}</span>
          </div>
          <div class="vertical center layout">
            <span class="value">${this.used_time}</span>
            <span class="desc">${_t('usagePanel.UsedTime')}</span>
          </div>
          <div class="vertical center layout">
            <span class="value">${this.cpu_used_time}</span>
            <span class="desc">${_t('usagePanel.CpuUsedTime')}</span>
          </div>
          <div class="vertical center layout">
            <span class="value">${this.gpu_used_time}</span>
            <span class="desc">${_t('usagePanel.GpuUsedTime')}</span>
          </div>
          <div class="vertical center layout">
            <span class="value">${this.disk_used}GB</span>
            <span class="desc">${_t('usagePanel.DiskUsed')}</span>
          </div>
          <div class="vertical center layout">
            <span class="value">${this.traffic_used}MiB</span>
            <span class="desc">${_t('usagePanel.TrafficUsed')}</span>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-monthly-usage-panel': BackendAIMonthlyUsagePanel;
  }
}
