/**
 @license
 Copyright (c) 2015-2018 Lablup Inc. All rights reserved.
 */

import {html, PolymerElement} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/iron-ajax/iron-ajax';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/hardware-icons';
import '@vaadin/vaadin-grid/vaadin-grid.js';
import '@polymer/paper-toast';
import './lablup-shields.js';
import '@vaadin/vaadin-progress-bar/vaadin-progress-bar.js';

import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';


class BackendAIAgentList extends PolymerElement {
  static get is() {
    return 'backend-ai-agent-list';
  }

  static get properties() {
    return {
      condition: {
        type: String,
        default: 'running'  // finished, running, archived
      },
      jobs: {
        type: Object,
        value: {}
      },
      visible: {
        type: Boolean,
        value: false
      }
    };
  }

  ready() {
    super.ready();
  }

  connectedCallback() {
    super.connectedCallback();
    afterNextRender(this, function () {
    });
  }

  static get observers() {
    return [
      '_menuChanged(visible)'
    ]
  }

  _menuChanged(visible) {
    if (!visible) {
      return;
    }
    // If disconnected
    if (window.backendaiclient == undefined || window.backendaiclient == null) {
      document.addEventListener('backend-ai-connected', () => {
        let status = 'ALIVE';
        this._loadAgentList(status);
      }, true);
    } else { // already connected
      let status = 'ALIVE';
      this._loadAgentList(status);
    }
  }

  _loadAgentList(status = 'running') {
    if (this.visible !== true) {
      return;
    }

    switch (this.condition) {
      case 'running':
        status = 'ALIVE';
        break;
      case 'finished':
        status = 'TERMINATED';
        break;
      case 'archived':
      default:
        status = 'ALIVE';
    }
    let fields = ['id',
      'addr',
      'status',
      'first_contact',
      'occupied_slots',
      'available_slots'];
    let q = `query($status: String) {` +
      `  agents(status: $status) {` +
      `     ${fields.join(" ")}` +
      `  }` +
      `}`;

    let v = {'status': status};

    window.backendaiclient.gql(q, v).then(response => {
      var agents = response.agents;
      if (agents !== undefined && agents.length != 0) {
        Object.keys(agents).map((objectKey, index) => {
          var agent = agents[objectKey];
          var occupied_slots = JSON.parse(agent.occupied_slots);
          var available_slots = JSON.parse(agent.available_slots);

          agents[objectKey].cpu_slots = parseInt(available_slots.cpu);
          agents[objectKey].used_cpu_slots = parseInt(occupied_slots.cpu);
          agents[objectKey].mem_slots = parseInt(window.backendaiclient.utils.changeBinaryUnit(available_slots.mem, 'g'));
          agents[objectKey].used_mem_slots = parseInt(window.backendaiclient.utils.changeBinaryUnit(occupied_slots.mem, 'g'));
          if ('cuda.device' in available_slots) {
            agents[objectKey].gpu_slots = parseInt(available_slots['cuda.device']);
          }
          if ('cuda.shares' in available_slots) {
            agents[objectKey].vgpu_slots = parseInt(available_slots['cuda.shares']);
          }
          if ('cuda.device' in occupied_slots) {
            agents[objectKey].used_gpu_slots = parseInt(occupied_slots['cuda.device']);
          }
          if ('cuda.shares' in occupied_slots) {
            agents[objectKey].used_vgpu_slots = parseInt(occupied_slots['cuda.shares']);
          }
        });
      }
      this.agents = agents;
      console.log(agents);
      if (this.visible == true) {
        setTimeout(() => {
          this._loadAgentList(status)
        }, 5000);
      }
    }).catch(err => {
      if (err && err.message) {
        this.$.notification.text = err.message;
        this.$.notification.show();
      }
    });
  }

  _isRunning() {
    return this.condition === 'running';
  }

  _byteToMB(value) {
    return Math.floor(value / 1000000);
  }

  _MBtoGB(value) {
    return Math.floor(value / 1024);
  }

  _slotToCPU(value) {
    return Math.floor(value / 1);
  }

  _slotToGPU(value) {
    return Math.floor(value / 3.75);
  }

  _elapsed(start, end) {
    var startDate = new Date(start);
    if (this.condition == 'running') {
      var endDate = new Date();
    } else {
      var endDate = new Date(end);
    }
    var seconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000, -1);
    if (this.condition == 'running') {
      return 'Running ' + seconds + 'sec.';
    } else {
      return 'Reserved for ' + seconds + 'sec.';
    }
    return seconds;
  }

  _humanReadableDate(start) {
    var startDate = new Date(start);
    return startDate.toLocaleString('ko-KR');

  }

  _indexFrom1(index) {
    return index + 1;
  }

  _heartbeatStatus(state) {
    return state;
  }

  _heartbeatColor(state) {
    switch (state) {
      case 'ALIVE':
        return 'green';
      case 'TERMINATED':
        return 'red';
      default:
        return 'blue';
    }
    ;
  }

  static get template() {
    // language=HTML
    return html`
      <style include="iron-flex iron-flex-alignment">
        vaadin-grid {
          border: 0;
          font-size: 14px;
        }

        paper-item {
          height: 30px;
          --paper-item-min-height: 30px;
        }

        iron-icon {
          width: 16px;
          height: 16px;
          min-width: 16px;
          min-height: 16px;
          padding: 0;
        }

        paper-icon-button {
          --paper-icon-button: {
            width: 25px;
            height: 25px;
            min-width: 25px;
            min-height: 25px;
            padding: 3px;
            margin-right: 5px;
          };
        }

        div.indicator,
        span.indicator {
          font-size: 9px;
          margin-right: 5px;
        }

        vaadin-progress-bar {
          width: 100px;
          height: 6px;
        }
      </style>
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Job list" items="[[agents]]">
        <vaadin-grid-column width="40px" flex-grow="0" resizable>
          <template class="header">#</template>
          <template>[[_indexFrom1(index)]]</template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">Endpoint</template>
          <template>
            <div class="indicator">[[item.addr]]</div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">Starts</template>
          <template>
            <div class="layout vertical">
              <span>[[_humanReadableDate(item.first_contact)]]</span>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">Resources</template>
          <template>
            <div class="layout flex">
              <div class="layout horizontal center flex">
                <iron-icon class="fg green" icon="hardware:developer-board"></iron-icon>
                <span>[[ item.cpu_slots ]]</span>
                <span class="indicator">cores</span>
                <span class="flex"></span>
                <vaadin-progress-bar id="cpu-bar" value="[[item.used_cpu_slots]]"
                                     max="[[item.cpu_slots]]"></vaadin-progress-bar>
              </div>
              <div class="layout horizontal center flex">
                <iron-icon class="fg green" icon="hardware:memory"></iron-icon>
                <span>[[item.mem_slots]]</span>
                <span class="indicator">GB</span>
                <span class="flex"></span>
                <vaadin-progress-bar id="mem-bar" value="[[item.used_mem_slots]]"
                                     max="[[item.mem_slots]]"></vaadin-progress-bar>
              </div>
              <template is="dom-if" if="[[item.gpu_slots]]">
                <div class="layout horizontal center flex">
                  <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                  <span>[[item.gpu_slots]]</span>
                  <span class="indicator">GPU</span>
                  <span class="flex"></span>
                  <vaadin-progress-bar id="gpu-bar" value="[[item.used_gpu_slots]]"
                                       max="[[item.gpu_slots]]"></vaadin-progress-bar>
                </div>
              </template>
              <template is="dom-if" if="[[item.vgpu_slots]]">
                <div class="layout horizontal center flex">
                  <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                  <span>[[item.vgpu_slots]]</span>
                  <span class="indicator">vGPU</span>
                  <span class="flex"></span>
                  <vaadin-progress-bar id="vgpu-bar" value="[[item.used_vgpu_slots]]"
                                       max="[[item.vgpu_slots]]"></vaadin-progress-bar>
                </div>
              </template>
            </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column width="80px" flex-grow="0" resizable>
          <template class="header">Status</template>
          <template>
            <div>
              <lablup-shields app="" color="[[_heartbeatColor(item.status)]]"
                              description="[[_heartbeatStatus(item.status)]]" ui="flat"></lablup-shields>
            </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column resizable>
          <template class="header">Control</template>
          <template>
            <div id="controls" class="layout horizontal flex center"
                 kernel-id="[[item.sess_id]]">
              <paper-icon-button disabled class="fg"
                                 icon="assignment"></paper-icon-button>
              <template is="dom-if" if="[[_isRunning()]]">
                <paper-icon-button disabled class="fg controls-running"
                                   icon="build"></paper-icon-button>
                <paper-icon-button disabled class="fg controls-running"
                                   icon="alarm-add"></paper-icon-button>
                <paper-icon-button disabled class="fg controls-running"
                                   icon="av:pause"></paper-icon-button>
                <paper-icon-button disabled class="fg red controls-running" icon="delete"
                                   on-tap="_terminateAgent"></paper-icon-button>
              </template>
            </div>
          </template>
        </vaadin-grid-column>
      </vaadin-grid>
    `;
  }
}

customElements.define(BackendAIAgentList.is, BackendAIAgentList);
