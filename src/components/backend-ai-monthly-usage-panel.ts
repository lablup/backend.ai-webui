/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, LitElement, property} from "lit-element";

import 'weightless/title';
import format from 'date-fns/format';

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
  @property({type: Date}) used_time = '00시간 00분';
  @property({type: Date}) cpu_used_time = '00시간 00분';
  @property({type: Date}) gpu_used_time = '00시간 00분';
  @property({type: String}) disk_used = '0GB';
  @property({type: String}) traffic_used = '0GB';

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
    this.used_time = format(new Date(this.used_time), 'HH시간 mm분');
    this.cpu_used_time = format(new Date(this.cpu_used_time), 'HH시간 mm분');
    this.gpu_used_time = format(new Date(this.gpu_used_time), 'HH시간 mm분');
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
            <span class="value">${this.disk_used}</span>
            <span class="desc">디스크 사용량</span>
          </div>
          <div class="vertical center layout">
            <span class="value">${this.traffic_used}</span>
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
