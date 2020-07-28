/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, LitElement, property} from "lit-element";

import 'weightless/title';

import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from "../plastics/layout/iron-flex-layout-classes";

/**
 Backend.AI Monthly Usage Panel

 @group Backend.AI Console
 @element backend-ai-monthly-usage-panel
 */

@customElement("backend-ai-monthly-usage-panel")
export default class BackendAIMonthlyUsagePanel extends LitElement {
  @property({type: Number}) num_sessions = 0;
  @property({type: String}) used_time = '0:00:00.00';
  @property({type: String}) cpu_used_time = '0:00:00.00';
  @property({type: String}) gpu_used_time = '0:00:00.00';
  @property({type: Number}) disk_used = 0;
  @property({type: Number}) traffic_used = 0;

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
        wl-card {
          padding: 20px;
        }

        .value {
          padding: 15px;
          font-size: 25px;
          font-weight: bold;
        }

        .desc {
          padding: 0px 15px 20px 15px;
        }
      `
    ]
  }

  firstUpdated() {
    this.formatting();
  }

  formatting() {
    this.used_time = this.usedTimeFormatting(this.used_time);
    this.cpu_used_time = this.usedTimeFormatting(this.cpu_used_time);
    this.gpu_used_time = this.usedTimeFormatting(this.gpu_used_time);

    this.disk_used = Math.floor(this.disk_used / (1024 * 1024 * 1024)); // bytes to GB
    this.traffic_used = Math.floor(this.traffic_used / (1024 * 1024));  // bytes to MB
  }

  /**
   * @param {String} t - [days]:[hours]:[minutes].[seconds]
   * */
  usedTimeFormatting(t) {
    let days = parseInt(t.substring(0, t.indexOf(':')));
    let hours = parseInt(t.substring(t.indexOf(':') + 1, t.lastIndexOf(':')));
    let minutes = t.substring(t.lastIndexOf(':') + 1, t.indexOf('.'));
    hours = days * 24 + hours;

    return hours + '시간' + minutes + '분';
  }

  render() {
    // language=HTML
    return html`
      <wl-card>
        <wl-title level="3">이번달 통계</wl-title>
        <div class="horizontal layout">
          <div class="vertical center layout">
            <span class="value">${this.num_sessions}</span>
            <span class="desc">실행 세션 수</span>
          </div>
          <div class="vertical center layout">
            <span class="value">${this.used_time}</span>
            <span class="desc">사용 시간</span>
          </div>
          <div class="vertical center layout">
            <span class="value">${this.cpu_used_time}</span>
            <span class="desc">CPU 사용량</span>
          </div>
          <div class="vertical center layout">
            <span class="value">${this.gpu_used_time}</span>
            <span class="desc">GPU 사용량</span>
          </div>
          <div class="vertical center layout">
            <span class="value">${this.disk_used}GB</span>
            <span class="desc">디스크 사용량</span>
          </div>
          <div class="vertical center layout">
            <span class="value">${this.traffic_used}MB</span>
            <span class="desc">트래픽 사용량</span>
          </div>
        </div>
      </wl-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-monthly-usage-panel": BackendAIMonthlyUsagePanel;
  }
}
