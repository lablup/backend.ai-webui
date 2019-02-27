define(["./components/backend-ai-console.js"],function(_backendAiConsole){"use strict";var _Mathfloor=Math.floor;class BackendAIAgentList extends _backendAiConsole.PolymerElement{static get is(){return"backend-ai-agent-list"}static get properties(){return{condition:{type:String,default:"running"},jobs:{type:Object,value:{}},active:{type:Boolean,value:!1}}}ready(){super.ready()}connectedCallback(){super.connectedCallback();(0,_backendAiConsole.afterNextRender)(this,function(){})}shouldUpdate(){return this.active}static get observers(){return["_menuChanged(active)"]}_menuChanged(active){if(!active){return}if(window.backendaiclient==void 0||null==window.backendaiclient){document.addEventListener("backend-ai-connected",()=>{let status="ALIVE";this._loadAgentList(status)},!0)}else{let status="ALIVE";this._loadAgentList(status)}}_loadAgentList(status="running"){if(!0!==this.active){return}switch(this.condition){case"running":status="ALIVE";break;case"finished":status="TERMINATED";break;case"archived":default:status="ALIVE";}let fields=["id","status","addr","region","first_contact","cpu_cur_pct","mem_cur_bytes","available_slots","occupied_slots"];window.backendaiclient.agent.list(status,fields).then(response=>{let agents=response.agents;if(agents!==void 0&&0!=agents.length){Object.keys(agents).map((objectKey,index)=>{var agent=agents[objectKey],occupied_slots=JSON.parse(agent.occupied_slots),available_slots=JSON.parse(agent.available_slots);agents[objectKey].cpu_slots=parseInt(+available_slots.cpu);agents[objectKey].used_cpu_slots=parseInt(+occupied_slots.cpu);if(null!==agent.cpu_cur_pct){agents[objectKey].current_cpu_percent=agent.cpu_cur_pct;agents[objectKey].cpu_total_usage_ratio=100*(agents[objectKey].used_cpu_slots/agents[objectKey].cpu_slots);agents[objectKey].cpu_current_usage_ratio=agents[objectKey].current_cpu_percent/agents[objectKey].cpu_slots;agents[objectKey].current_cpu_percent=agents[objectKey].current_cpu_percent.toFixed(2)}else{agents[objectKey].current_cpu_percent=0;agents[objectKey].cpu_total_usage_ratio=0;agents[objectKey].cpu_current_usage_ratio=0}if(null!==agent.mem_cur_bytes){agents[objectKey].current_mem_bytes=agent.mem_cur_bytes}else{agents[objectKey].current_mem_bytes=0}agents[objectKey].current_mem=window.backendaiclient.utils.changeBinaryUnit(agent.current_mem_bytes,"g");agents[objectKey].mem_slots=parseInt(window.backendaiclient.utils.changeBinaryUnit(available_slots.mem,"g"));agents[objectKey].used_mem_slots=parseInt(window.backendaiclient.utils.changeBinaryUnit(occupied_slots.mem,"g"));agents[objectKey].mem_total_usage_ratio=100*(agents[objectKey].used_mem_slots/agents[objectKey].mem_slots);agents[objectKey].mem_current_usage_ratio=100*(agents[objectKey].current_mem/agents[objectKey].mem_slots);agents[objectKey].current_mem=agents[objectKey].current_mem.toFixed(2);if("cuda.device"in available_slots){agents[objectKey].gpu_slots=parseInt(+available_slots["cuda.device"])}if("cuda.shares"in available_slots){agents[objectKey].vgpu_slots=parseInt(available_slots["cuda.shares"])}if("cuda.device"in occupied_slots){agents[objectKey].used_gpu_slots=parseInt(+occupied_slots["cuda.device"])}if("cuda.shares"in occupied_slots){agents[objectKey].used_vgpu_slots=parseInt(occupied_slots["cuda.shares"])}})}this.agents=agents;if(!0==this.active){setTimeout(()=>{this._loadAgentList(status)},5e3)}}).catch(err=>{if(err&&err.message){this.$.notification.text=err.message;this.$.notification.show()}})}_isRunning(){return"running"===this.condition}_byteToMB(value){return _Mathfloor(value/1e6)}_MBtoGB(value){return _Mathfloor(value/1024)}_elapsed(start,end){var startDate=new Date(start);if("running"==this.condition){var endDate=new Date}else{var endDate=new Date(end)}var seconds=_Mathfloor((endDate.getTime()-startDate.getTime())/1e3,-1);if("running"==this.condition){return"Running "+seconds+"sec."}else{return"Reserved for "+seconds+"sec."}return seconds}_humanReadableDate(start){var startDate=new Date(start);return startDate.toLocaleString("ko-KR")}_indexFrom1(index){return index+1}_heartbeatStatus(state){return state}_heartbeatColor(state){switch(state){case"ALIVE":return"green";case"TERMINATED":return"red";default:return"blue";}}static get template(){return _backendAiConsole.html`
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

        paper-progress {
          width: 100px;
          border-radius: 3px;
          --paper-progress-height: 10px;
          --paper-progress-active-color: #3677EB;
          --paper-progress-secondary-color: #98BE5A;
          --paper-progress-transition-duration: 0.08s;
          --paper-progress-transition-timing-function: ease;
          --paper-progress-transition-delay: 0s;
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
            <div class="indicator">[[item.region]]</div>
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
                <div class="layout vertical start" style="padding-left:5px;">
                  <div class="layout horizontal start">
                    <span>[[ item.cpu_slots ]]</span>
                    <span class="indicator">cores</span>
                  </div>
                  <div class="layout horizontal start">
                    <span>[[item.current_cpu_percent]]</span>
                    <span class="indicator">%</span>
                  </div>
                </div>
                <span class="flex"></span>
                <paper-progress id="cpu-usage-bar" value="[[item.cpu_current_usage_ratio]]"
                                secondary-progress="[[item.cpu_total_usage_ratio]]"></paper-progress>
              </div>
              <div class="layout horizontal center flex">
                <iron-icon class="fg green" icon="hardware:memory"></iron-icon>
                <div class="layout vertical start" style="padding-left:5px;">
                  <div class="layout horizontal start">
                    <span>[[item.mem_slots]]</span>
                    <span class="indicator">GB</span>
                  </div>
                  <div class="layout horizontal start">
                    <span>[[item.current_mem]]</span>
                    <span class="indicator">GB</span>
                  </div>
                </div>
                <span class="flex"></span>
                <paper-progress id="mem-usage-bar" value="[[item.mem_current_usage_ratio]]"
                                secondary-progress="[[item.mem_total_usage_ratio]]"></paper-progress>

              </div>
              <template is="dom-if" if="[[item.gpu_slots]]">
                <div class="layout horizontal center flex">
                  <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                  <span style="padding-left:5px;">[[item.gpu_slots]]</span>
                  <span class="indicator">GPU</span>
                  <span class="flex"></span>
                  <vaadin-progress-bar id="gpu-bar" value="[[item.used_gpu_slots]]"
                                       max="[[item.gpu_slots]]"></vaadin-progress-bar>
                </div>
              </template>
              <template is="dom-if" if="[[item.vgpu_slots]]">
                <div class="layout horizontal center flex">
                  <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                  <span style="padding-left:5px;">[[item.vgpu_slots]]</span>
                  <span class="indicator">vGPU</span>
                  <span class="flex"></span>
                  <vaadin-progress-bar id="vgpu-bar" value="[[item.used_vgpu_slots]]"
                                       max="[[item.vgpu_slots]]"></vaadin-progress-bar>
                </div>
              </template>
            </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column width="100px" flex-grow="0" resizable>
          <template class="header">Status</template>
          <template>
            <div class="layout horizontal justified wrap">
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
    `}}customElements.define(BackendAIAgentList.is,BackendAIAgentList);class BackendAIAgentView extends _backendAiConsole.PolymerElement{static get properties(){return{active:{type:Boolean,value:!1}}}constructor(){super();(0,_backendAiConsole.setPassiveTouchGestures)(!0)}ready(){super.ready()}shouldUpdate(){return this.active}static get observers(){return["_routeChanged(route.*)","_viewChanged(routeData.view)","_menuChanged(active)"]}_menuChanged(active){if(!active){this.$["running-agents"].active=!1;this.$["finished-agents"].active=!1;return}this.$["running-agents"].active=!0;this.$["finished-agents"].active=!0}static get template(){return _backendAiConsole.html`
      <style is="custom-style" include="backend-ai-styles">
      </style>
      <paper-material class="item" elevation="1">
        <h3 class="paper-material-title">Registered nodes</h3>
        <h4>Connected</h4>
        <div>
          <backend-ai-agent-list id="running-agents" condition="running"></backend-ai-agent-list>
        </div>
        <h4>Terminated</h4>
        <div>
          <backend-ai-agent-list id="finished-agents" condition="finished"></backend-ai-agent-list>
        </div>
      </paper-material>
    `}}customElements.define("backend-ai-agent-view",BackendAIAgentView)});