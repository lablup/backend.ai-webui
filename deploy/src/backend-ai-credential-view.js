define(["./components/backend-ai-console.js"],function(_backendAiConsole){"use strict";var _Mathfloor=Math.floor;class LablupPiechart extends _backendAiConsole.PolymerElement{static get is(){return"lablup-piechart"}static get properties(){return{currentNumber:{type:Number,value:50},maxNumber:{type:Number,value:100},unit:{type:String,value:"%"},url:{type:String},textcolor:{type:String,value:"#888"},chartcolor:{type:String,value:"#F22"},size:{type:Number,value:200},fontsize:{type:Number,value:60},prefix:{type:String,value:""},sizeParam:String}}constructor(){super()}ready(){super.ready();this.sizeParam=this.size+"px";this.chartFontSize=this.fontsize/this.size;if(.5<=this.chartFontSize){this.chartFontSize=.3}this.shadowRoot.querySelector("#chart").setAttribute("fill",this.chartcolor);this.shadowRoot.querySelector("#chart-text").setAttribute("fill",this.textcolor);this.shadowRoot.querySelector("#chart-text").setAttribute("font-size",this.chartFontSize);this.shadowRoot.querySelector("#unit-text").setAttribute("font-size",.3-.05*this.unit.length);this.shadowRoot.querySelector("#chart").setAttribute("width",this.sizeParam);this.shadowRoot.querySelector("#chart").setAttribute("height",this.sizeParam);this.indicatorPath="M 0.5 0.5 L0.5 0 ";var number=100*(this.maxNumber-this.currentNumber)/this.maxNumber;if(12.5<number){this.indicatorPath=this.indicatorPath+"L1 0 "}if(37.5<number){this.indicatorPath=this.indicatorPath+"L1 1 "}if(62.5<number){this.indicatorPath=this.indicatorPath+"L0 1 "}if(87.5<number){this.indicatorPath=this.indicatorPath+"L0 0 "}var th=2*(number/100)*Math.PI,angle=Math.sin(th)/Math.cos(th),x=0,y=0;if(12.5>=number||87.5<number){y=.5;x=y*angle}else if(12.5<number&&37.5>=number){x=.5;y=x/angle}else if(37.5<number&&62.5>=number){y=-.5;x=y*angle}else if(62.5<number&&87.5>=number){x=-.5;y=x/angle}x=x+.5;y=-y+.5;this.indicatorPath=this.indicatorPath+"L"+x+" "+y+" z";this.$.pievalue.setAttribute("d",this.indicatorPath);if(this.url!==void 0&&""!==this.url){this.shadowRoot.querySelector("#chart").addEventListener("tap",this._moveTo.bind(this))}console.log(this.currentNumber);this.updateStyles()}connectedCallback(){super.connectedCallback()}_moveTo(){window.location.href=this.url}static get template(){return _backendAiConsole.html`
      <style is="custom-style" include="iron-flex iron-flex-alignment">
        #chart {
          cursor: pointer;
        }
      </style>
      <svg id="chart"
           xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
           viewBox="0 0 1 1" style="background-color:transparent;">
        <g id="piechart">
          <circle cx="0.5" cy="0.5" r="0.5" />
          <circle cx="0.5" cy="0.5" r="0.40" fill="rgba(255,255,255,0.9)"/>
          <path id="pievalue" stroke="none" fill="rgba(255, 255, 255, 0.75)"/>
          <text id="chart-text" x="0.5" y="0.5" font-family="Roboto" text-anchor="middle"
                dy="0.1">
            <tspan>{{ prefix }}</tspan>
            <tspan>{{ currentNumber }}</tspan>
            <tspan id="unit-text" font-size="0.2" dy="-0.07">{{ unit }}</tspan>
          </text>
        </g>
      </svg>
    `}}customElements.define(LablupPiechart.is,LablupPiechart);class BackendAICredentialList extends _backendAiConsole.PolymerElement{static get is(){return"backend-ai-credential-list"}static get properties(){return{active:{type:Boolean,value:!1},condition:{type:String,default:"active"},keypairs:{type:Object,value:{}},resourcePolicy:{type:Object,value:{}},keypairInfo:{type:Object,value:{}}}}ready(){super.ready()}connectedCallback(){super.connectedCallback();(0,_backendAiConsole.afterNextRender)(this,function(){})}shouldUpdate(){return this.active}static get observers(){return["_menuChanged(active)"]}_menuChanged(active){if(!active){return}if(window.backendaiclient==void 0||null==window.backendaiclient){document.addEventListener("backend-ai-connected",()=>{this._refreshKeyData()},!0)}else{this._refreshKeyData()}}_refreshKeyData(user_id){let status="active",is_active=!0;switch(this.condition){case"active":is_active=!0;break;default:is_active=!1;}return window.backendaiclient.resourcePolicy.get().then(response=>{let rp=response.keypair_resource_policies;this.resourcePolicy=window.backendaiclient.utils.gqlToObject(rp,"name")}).then(()=>{let fields=["access_key","is_active","is_admin","user_id","created_at","last_used","concurrency_limit","concurrency_used","rate_limit","num_queries","resource_policy"];return window.backendaiclient.keypair.list(user_id,fields,is_active)}).then(response=>{let keypairs=response.keypairs;Object.keys(keypairs).map((objectKey,index)=>{var keypair=keypairs[objectKey];if(keypair.resource_policy in this.resourcePolicy){for(var k in this.resourcePolicy[keypair.resource_policy]){keypair[k]=this.resourcePolicy[keypair.resource_policy][k];if("total_resource_slots"===k){keypair.total_resource_slots=JSON.parse(this.resourcePolicy[keypair.resource_policy][k])}}if("cpu"in keypair.total_resource_slots){}else if("UNLIMITED"===keypair.default_for_unspecified){keypair.total_resource_slots.cpu="-"}if("mem"in keypair.total_resource_slots){keypair.total_resource_slots.mem=parseFloat(keypair.total_resource_slots.mem)}else if("UNLIMITED"===keypair.default_for_unspecified){keypair.total_resource_slots.mem="-"}if("cuda.device"in keypair.total_resource_slots){keypair.total_resource_slots.cuda_device=keypair.total_resource_slots["cuda.device"]}if("cuda.shares"in keypair.total_resource_slots){keypair.total_resource_slots.cuda_shares=keypair.total_resource_slots["cuda.shares"]}if(!1==="cuda_device"in keypair.total_resource_slots&&!1==="cuda_shares"in keypair.total_resource_slots&&"UNLIMITED"===keypair.default_for_unspecified){keypair.total_resource_slots.cuda_shares="-";keypair.total_resource_slots.cuda_device="-"}}});this.keypairs=keypairs}).catch(err=>{console.log(err);if(err&&err.message){this.$.notification.text=err.message;this.$.notification.show()}})}_showKeypairDetail(e){var _this=this;return babelHelpers.asyncToGenerator(function*(){const controls=e.target.closest("#controls"),access_key=controls.accessKey;try{const data=yield _this._getKeyData(access_key);_this.keypairInfo=data.keypair;_this.$["keypair-info-dialog"].open()}catch(err){if(err&&err.message){_this.$.notification.text=err.message;_this.$.notification.show()}}})()}_getKeyData(accessKey){return babelHelpers.asyncToGenerator(function*(){let fields=["access_key","secret_key","is_active","is_admin","user_id","created_at","last_used","concurrency_limit","concurrency_used","rate_limit","num_queries","resource_policy"];return window.backendaiclient.keypair.info(accessKey,fields)})()}refresh(){let user_id=null;this._refreshKeyData()}_isActive(){return"active"===this.condition}_revokeKey2(e){const termButton=e.target,controls=e.target.closest("#controls"),accessKey=controls.accessKey}_deleteKey(e){const termButton=e.target,controls=e.target.closest("#controls"),accessKey=controls.accessKey;window.backendaiclient.keypair.delete(accessKey).then(response=>{this.refresh()}).catch(err=>{console.log(err);if(err&&err.message){this.$.notification.text=err.message;this.$.notification.show()}})}_revokeKey(e){this._mutateKey(e,!1)}_reuseKey(e){this._mutateKey(e,!0)}_mutateKey(e,is_active){const termButton=e.target,controls=e.target.closest("#controls"),accessKey=controls.accessKey;let original=this.keypairs.keypairs.find(this._findKeyItem,accessKey),input={is_active:is_active,is_admin:original.is_admin,resource_policy:original.resource_policy,rate_limit:original.rate_limit,concurrency_limit:original.concurrency_limit};window.backendaiclient.keypair.mutate(accessKey,input).then(response=>{let event=new CustomEvent("backend-ai-credential-refresh",{detail:this});document.dispatchEvent(event)}).catch(err=>{console.log(err);if(err&&err.message){this.$.notification.text=err.message;this.$.notification.show()}})}_findKeyItem(element){return element.access_key=this}_byteToMB(value){return _Mathfloor(value/1e6)}_byteToGB(value){return _Mathfloor(value/1e9)}_MBToGB(value){return value/1024}_msecToSec(value){return(+(value/1e3)).toFixed(2)}_elapsed(start,end){var startDate=new Date(start);if("active"==this.condition){var endDate=new Date}else{var endDate=new Date}var seconds=_Mathfloor((endDate.getTime()-startDate.getTime())/1e3,-1),days=_Mathfloor(seconds/86400);return days}_humanReadableTime(d){var d=new Date(d);return d.toUTCString()}_indexFrom1(index){return index+1}_markIfUnlimited(value){if(["-",0].includes(value)){return"\u221E"}else{return value}}static get template(){return _backendAiConsole.html`
      <style include="backend-ai-styles iron-flex iron-flex-alignment">
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

        paper-material h4 {
          font-size: 14px;
          padding: 5px 15px 5px 12px;
          margin: 0 0 10px 0;
          display: block;
          border-bottom: 1px solid #DDD;
        }

        vaadin-item {
          font-size: 13px;
          font-weight: 100;
        }

        div.indicator,
        span.indicator {
          font-size: 9px;
          margin-right: 5px;
        }

        div.configuration {
          width: 70px !important;
        }

        div.configuration iron-icon {
          padding-right: 5px;
        }
      </style>
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>

      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Credential list"
                   items="[[keypairs]]">
        <vaadin-grid-column width="40px" flex-grow="0" resizable>
          <template class="header">#</template>
          <template>[[_indexFrom1(index)]]</template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">
            <vaadin-grid-sorter path="user_id">User ID</vaadin-grid-sorter>
          </template>
          <template>
            <div class="layout horizontal center flex">
              <div class="indicator">[[item.user_id]]</div>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">Access Key</template>
          <template>
            <div class="indicator">[[item.access_key]]</div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">
            <vaadin-grid-sorter path="is_admin">Permission</vaadin-grid-sorter>
          </template>
          <template>
            <div class="layout horizontal center flex">
              <template is="dom-if" if="[[item.is_admin]]">
                <lablup-shields app="" color="red" description="admin" ui="flat"></lablup-shields>
              </template>
              <lablup-shields app="" description="user" ui="flat"></lablup-shields>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">
            <vaadin-grid-sorter path="created_at">Key age</vaadin-grid-sorter>
          </template>
          <template>
            <div class="layout vertical">
              <span>[[_elapsed(item.created_at)]] Days</span>
              <span class="indicator">([[_humanReadableTime(item.created_at)]])</span>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column width="150px" resizable>
          <template class="header">Resource Policy</template>
          <template>
            <div class="layout horizontal wrap center">
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="hardware:developer-board"></iron-icon>
                <span>[[_markIfUnlimited(item.total_resource_slots.cpu)]]</span>
                <span class="indicator">cores</span>
              </div>
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="hardware:memory"></iron-icon>
                <span>[[_markIfUnlimited(item.total_resource_slots.mem)]]</span>
                <span class="indicator">GB</span>
              </div>
            </div>
            <div class="layout horizontal wrap center">
              <template is="dom-if" if="[[item.total_resource_slots.cuda_device]]">
                <div class="layout horizontal configuration">
                  <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                  <span>[[item.total_resource_slots.cuda_device]]</span>
                  <span class="indicator">GPU</span>
                </div>
              </template>
              <template is="dom-if" if="[[item.total_resource_slots.cuda_shares]]">
                <div class="layout horizontal configuration">
                  <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                  <span>[[item.total_resource_slots.cuda_shares]]</span>
                  <span class="indicator">vGPU</span>
                </div>
              </template>
            </div>
            <div class="layout horizontal wrap center">
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="icons:cloud-queue"></iron-icon>
                <span>[[_markIfUnlimited(item.max_vfolder_size)]]</span>
                <span class="indicator">GB</span>
              </div>
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="icons:folder"></iron-icon>
                <span>[[_markIfUnlimited(item.max_vfolder_count)]]</span>
                <span class="indicator">Folders</span>
              </div>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">Allocation</template>
          <template>
            <div class="layout horizontal center flex">
              <div class="vertical start layout">
                <div style="font-size:11px;width:40px;">[[item.concurrency_used]] /
                  [[item.concurrency_limit]]
                </div>
                <span class="indicator">Sess.</span>
              </div>
              <div class="vertical start layout">
                <span style="font-size:8px">[[item.rate_limit]] <span class="indicator">req./15m.</span></span>
                <span style="font-size:8px">[[item.num_queries]] <span class="indicator">queries</span></span>
              </div>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">Control</template>
          <template>
            <div id="controls" class="layout horizontal flex center"
                 access-key="[[item.access_key]]">
              <paper-icon-button class="fg green" icon="assignment"
                                 on-tap="_showKeypairDetail"></paper-icon-button>
              <template is="dom-if" if="[[_isActive()]]">
                <template is="dom-if" if="[[!item.is_admin]]">
                  <paper-icon-button class="fg blue controls-running" icon="delete"
                                     on-tap="_revokeKey"></paper-icon-button>
                  <paper-icon-button class="fg red controls-running" icon="icons:delete-forever"
                                     on-tap="_deleteKey"></paper-icon-button>
                </template>
              </template>
              <template is="dom-if" if="[[!_isActive()]]">
                <paper-icon-button class="fg blue controls-running" icon="icons:redo"
                                   on-tap="_reuseKey"></paper-icon-button>
              </template>
            </div>
          </template>
        </vaadin-grid-column>
      </vaadin-grid>
      <paper-dialog id="keypair-info-dialog">
        <paper-material elevation="0" class="intro" style="margin: 0;">
          <h3 class="horizontal center layout" style="border-bottom:1px solid #ddd;">
            <span style="margin-right:15px;">Keypair Detail</span>
            <template is="dom-if" if="[[keypairInfo.is_admin]]">
              <lablup-shields app="" color="red" description="admin" ui="flat"></lablup-shields>
            </template>
            <lablup-shields app="" description="user" ui="flat"></lablup-shields>
            <div class="flex"></div>
            <paper-icon-button icon="close" class="blue close-button" dialog-dismiss>
              Close
            </paper-icon-button>
          </h3>
          <div class="horizontal layout">
            <div style="width:335px;">
              <h4>Information</h4>
              <div role="listbox" style="margin: 0;">
                <vaadin-item>
                  <div><strong>User ID</strong></div>
                  <div secondary>[[keypairInfo.user_id]]</div>
                </vaadin-item>
                <vaadin-item>
                  <div><strong>Access Key</strong></div>
                  <div secondary>[[keypairInfo.access_key]]</div>
                </vaadin-item>
                <vaadin-item>
                  <div><strong>Secret Key</strong></div>
                  <div secondary>[[keypairInfo.secret_key]]</div>
                </vaadin-item>
                <vaadin-item>
                  <div><strong>Created</strong></div>
                  <div secondary>[[keypairInfo.created_at]]</div>
                </vaadin-item>
                <vaadin-item>
                  <div><strong>Last used</strong></div>
                  <div secondary>[[keypairInfo.last_used]]</div>
                </vaadin-item>
              </div>
            </div>
            <div style="width:335px;">
              <h4>Allocation</h4>
              <div role="listbox" style="margin: 0;">
                <vaadin-item>
                  <div><strong>Resource Policy</strong></div>
                  <div secondary>[[keypairInfo.resource_policy]]</div>
                </vaadin-item>
                <vaadin-item>
                  <div><strong>Number of queries</strong></div>
                  <div secondary>[[keypairInfo.num_queries]]</div>
                </vaadin-item>
                <vaadin-item>
                  <div><strong>Concurrent Sessions</strong></div>
                  <div secondary>[[keypairInfo.concurrency_used]] active / [[keypairInfo.concurrency_used]] concurrent
                    sessions.
                  </div>
                </vaadin-item>
                <vaadin-item>
                  <div><strong>Rate Limit</strong></div>
                  <div secondary>[[keypairInfo.rate_limit]] for 900 seconds.</div>
                </vaadin-item>
              </div>
            </div>
          </div>
        </paper-material>
      </paper-dialog>
    `}}customElements.define(BackendAICredentialList.is,BackendAICredentialList);class BackendAIResourcePolicyList extends _backendAiConsole.PolymerElement{static get is(){return"backend-ai-resource-policy-list"}static get properties(){return{visible:{type:Boolean,value:!1},keypairs:{type:Object,value:{}},resourcePolicy:{type:Object,value:{}},keypairInfo:{type:Object,value:{}}}}ready(){super.ready()}connectedCallback(){super.connectedCallback();(0,_backendAiConsole.afterNextRender)(this,function(){})}static get observers(){return["_menuChanged(visible)"]}_menuChanged(visible){if(!visible){return}if(window.backendaiclient==void 0||null==window.backendaiclient){document.addEventListener("backend-ai-connected",()=>{this._refreshPolicyData()},!0)}else{this._refreshPolicyData()}}_refreshPolicyData(){console.log("read policy");return window.backendaiclient.resourcePolicy.get().then(response=>{console.log(response);let rp=response.keypair_resource_policies,resourcePolicy=window.backendaiclient.utils.gqlToObject(rp,"name");return rp}).then(response=>{let resourcePolicies=response;Object.keys(resourcePolicies).map((objectKey,index)=>{var policy=resourcePolicies[objectKey];policy.total_resource_slots=JSON.parse(policy.total_resource_slots);if("cpu"in policy.total_resource_slots){}else if("UNLIMITED"===policy.default_for_unspecified){policy.total_resource_slots.cpu="-"}if("mem"in policy.total_resource_slots){policy.total_resource_slots.mem=parseFloat(policy.total_resource_slots.mem)}else if("UNLIMITED"===policy.default_for_unspecified){policy.total_resource_slots.mem="-"}if("cuda.device"in policy.total_resource_slots){policy.total_resource_slots.cuda_device=policy.total_resource_slots["cuda.device"]}if("cuda.shares"in policy.total_resource_slots){policy.total_resource_slots.cuda_shares=policy.total_resource_slots["cuda.shares"]}if(!1==="cuda_device"in policy.total_resource_slots&&!1==="cuda_shares"in policy.total_resource_slots&&"UNLIMITED"===policy.default_for_unspecified){policy.total_resource_slots.cuda_shares="-";policy.total_resource_slots.cuda_device="-"}});this.resourcePolicy=resourcePolicies}).catch(err=>{console.log(err);if(err&&err.message){this.$.notification.text=err.message;this.$.notification.show()}})}refresh(){let user_id=null;this._refreshPolicyData()}_isActive(){return"active"===this.condition}_revokeKey2(e){const termButton=e.target,controls=e.target.closest("#controls"),accessKey=controls.accessKey;console.log(accessKey)}_deleteKey(e){const termButton=e.target,controls=e.target.closest("#controls"),accessKey=controls.accessKey;window.backendaiclient.keypair.delete(accessKey).then(response=>{this.refresh()}).catch(err=>{console.log(err);if(err&&err.message){this.$.notification.text=err.message;this.$.notification.show()}})}_findKeyItem(element){return element.access_key=this}_byteToMB(value){return _Mathfloor(value/1e6)}_byteToGB(value){return _Mathfloor(value/1e9)}_MBToGB(value){return value/1024}_msecToSec(value){return(+(value/1e3)).toFixed(2)}_elapsed(start,end){var startDate=new Date(start);if("active"==this.condition){var endDate=new Date}else{var endDate=new Date}var seconds=_Mathfloor((endDate.getTime()-startDate.getTime())/1e3,-1),days=_Mathfloor(seconds/86400);return days}_humanReadableTime(d){var d=new Date(d);return d.toUTCString()}_indexFrom1(index){return index+1}_markIfUnlimited(value){if(["-",0].includes(value)){return"\u221E"}else{return value}}static get template(){return _backendAiConsole.html`
      <style include="backend-ai-styles iron-flex iron-flex-alignment">
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

        vaadin-item {
          font-size: 13px;
          font-weight: 100;
        }

        div.indicator,
        span.indicator {
          font-size: 9px;
          margin-right: 5px;
        }

        div.configuration {
          width: 70px !important;
        }

        div.configuration iron-icon {
          padding-right: 5px;
        }
      </style>
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>

      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Resource Policy list"
                   items="[[resourcePolicy]]">
        <vaadin-grid-column width="40px" flex-grow="0" resizable>
          <template class="header">#</template>
          <template>[[_indexFrom1(index)]]</template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">
            <vaadin-grid-sorter path="name">Name</vaadin-grid-sorter>
          </template>
          <template>
            <div class="layout horizontal center flex">
              <div class="indicator">[[item.name]]</div>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column width="150px" resizable>
          <template class="header">Resources</template>
          <template>
            <div class="layout horizontal wrap center">
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="hardware:developer-board"></iron-icon>
                <span>[[_markIfUnlimited(item.total_resource_slots.cpu)]]</span>
                <span class="indicator">cores</span>
              </div>
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="hardware:memory"></iron-icon>
                <span>[[_markIfUnlimited(item.total_resource_slots.mem)]]</span>
                <span class="indicator">GB</span>
              </div>
            </div>
            <div class="layout horizontal wrap center">
              <template is="dom-if" if="[[item.total_resource_slots.cuda_device]]">
                <div class="layout horizontal configuration">
                  <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                  <span>[[_markIfUnlimited(item.total_resource_slots.cuda_device)]]</span>
                  <span class="indicator">GPU</span>
                </div>
              </template>
              <template is="dom-if" if="[[item.total_resource_slots.cuda_shares]]">
                <div class="layout horizontal configuration">
                  <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                  <span>[[_markIfUnlimited(item.total_resource_slots.cuda_shares)]]</span>
                  <span class="indicator">vGPU</span>
                </div>
              </template>
            </div>
            <div class="layout horizontal wrap center">
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="icons:cloud-queue"></iron-icon>
                <span>[[_markIfUnlimited(item.max_vfolder_size)]]</span>
                <span class="indicator">GB</span>
              </div>
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="icons:folder"></iron-icon>
                <span>[[_markIfUnlimited(item.max_vfolder_count)]]</span>
                <span class="indicator">Folders</span>
              </div>
              <!-- <iron-icon class="fg yellow" icon="device:storage"></iron-icon> -->
              <!-- <span>[[item.storage_capacity]]</span> -->
              <!-- <span class="indicator">[[item.storage_unit]]</span> -->
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">
            <vaadin-grid-sorter path="max_concurrent_sessions">Concurrency</vaadin-grid-sorter>
          </template>
          <template>
            <div class="indicator">[[item.max_concurrent_sessions]]
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">
            <vaadin-grid-sorter path="max_containers_per_session">Bundle limit</vaadin-grid-sorter>
          </template>
          <template>
            <div>[[item.max_containers_per_session]]</div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">Allowed Hosts</template>
          <template>
            <div class="layout horizontal center flex">
              <div class="vertical start layout">
                <div>[[item.allowed_vfolder_hosts]]
                </div>
              </div>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">Control</template>
          <template>
          </template>
        </vaadin-grid-column>
      </vaadin-grid>
    `}}customElements.define(BackendAIResourcePolicyList.is,BackendAIResourcePolicyList);class BackendAICredentialView extends(0,_backendAiConsole.OverlayPatchMixin)(_backendAiConsole.PolymerElement){static get properties(){return{active:{type:Boolean,value:!1},cpu_metric:{type:Array,value:[1,2,3,4,8,16]},ram_metric:{type:Array,value:[1,2,4,8,16]},gpu_metric:{type:Array,value:[0,.3,.6,1,1.5,2]},rate_metric:{type:Array,value:[1e3,2e3,3e3,4e3,5e3,1e4]},concurrency_metric:{type:Array,value:[1,2,3,4,5,10]}}}static get is(){return"backend-ai-credential-view"}shouldUpdate(){return this.active}constructor(){super();(0,_backendAiConsole.setPassiveTouchGestures)(!0)}ready(){super.ready();this.$["add-keypair"].addEventListener("tap",this._launchKeyPairDialog.bind(this));this.$["create-button"].addEventListener("tap",this._addKeyPair.bind(this));document.addEventListener("backend-ai-credential-refresh",()=>{this.$["active-credential-list"].refresh();this.$["inactive-credential-list"].refresh()},!0)}connectedCallback(){super.connectedCallback();(0,_backendAiConsole.afterNextRender)(this,function(){})}static get observers(){return["_routeChanged(route.*)","_viewChanged(routeData.view)","_menuChanged(active)"]}_routeChanged(changeRecord){if("path"===changeRecord.path){console.log("Path changed!")}}_viewChanged(view){}_menuChanged(active){if(!active){this.$["active-credential-list"].active=!1;this.$["inactive-credential-list"].active=!1;this.$["resource-policy-list"].active=!1;return}else{this.$["active-credential-list"].active=!0;this.$["inactive-credential-list"].active=!0;this.$["resource-policy-list"].active=!0}}_launchKeyPairDialog(){this.$["new-keypair-dialog"].open()}_addKeyPair(){let is_active=!0,is_admin=!1,resource_policy="default",rate_limit=5e3,concurrency_limit=1,user_id;if(""!=this.$.id_new_user_id.value){if(!0==this.$.id_new_user_id.invalid){return}user_id=this.$.id_new_user_id.value}else{user_id=window.backendaiclient.email}console.log(user_id);let cpu_resource=this.$["cpu-resource"].value,ram_resource=this.$["ram-resource"].value,gpu_resource=this.$["gpu-resource"].value;concurrency_limit=this.$["concurrency-limit"].value;rate_limit=this.$["rate-limit"].value;window.backendaiclient.keypairs.add(user_id,is_active,is_admin,resource_policy,rate_limit,concurrency_limit).then(response=>{this.$["new-keypair-dialog"].close();this.$.notification.text="Keypair successfully created.";this.$.notification.show();this.$["active-credential-list"].refresh();this.$["inactive-credential-list"].refresh()}).catch(err=>{console.log(err);if(err&&err.message){this.$["new-keypair-dialog"].close();this.$.notification.text=err.message;this.$.notification.show()}})}static get template(){return _backendAiConsole.html`
      <style is="custom-style" include="backend-ai-styles iron-flex iron-flex-alignment iron-positioning">
        paper-button.create-button {
          width: 100%;
        }
      </style>
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>
      <paper-material class="item" elevation="1">
        <h3>Credentials</h3>
        <h4 class="horizontal flex center center-justified layout">
          <span>Active</span>
          <span class="flex"></span>
          <paper-button id="add-keypair" slot="suffix" class="fg red">
            <iron-icon icon="add" class="fg red"></iron-icon>
            Add
          </paper-button>
        </h4>
        <div>
          <backend-ai-credential-list id="active-credential-list" condition="active"></backend-ai-job-list>
        </div>
        <h4>Inactive</h4>
        <div>
          <backend-ai-credential-list id="inactive-credential-list" condition="inactive"></backend-ai-job-list>
        </div>
      </paper-material>

      <paper-material class="item" elevation="1">
        <h3>Resource policies</h3>
        <h4 class="horizontal flex center center-justified layout">
          <span>Policy groups</span>
          <span class="flex"></span>
          <paper-button id="add-policy" slot="suffix" class="fg red">
            <iron-icon icon="add" class="fg red"></iron-icon>
            Add
          </paper-button>
        </h4>
        <div>
          <backend-ai-resource-policy-list id="resource-policy-list" condition="inactive"></backend-ai-resource-policy-list>
        </div>
      </paper-material>


      <paper-dialog id="new-keypair-dialog" with-backdrop
                    entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <paper-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3>Create</h3>
          <form id="login-form" onSubmit="this._addKeyPair()">
            <fieldset>
              <paper-input type="email" name="new_user_id" id="id_new_user_id" label="User ID as E-mail (optional)"
                           auto-validate></paper-input>
              <h4>Resource Policy</h4>
              <div class="horizontal center layout">
                <paper-dropdown-menu id="cpu-resource" label="CPU">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ cpu_metric }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="ram-resource" label="RAM (GB)">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ ram_metric }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="gpu-resource" label="GPU">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ gpu_metric }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
              <div class="horizontal center layout">
                <paper-dropdown-menu id="concurrency-limit" label="Concurrent Jobs">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ concurrency_metric }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="rate-limit" label="Rate Limit (for 15 min.)">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ rate_metric }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
              <br/><br/>
              <paper-button class="blue create-button" type="submit" id="create-button">
                <iron-icon icon="vaadin:key-o"></iron-icon>
                Create credential
              </paper-button>
            </fieldset>
          </form>
        </paper-material>
      </paper-dialog>
    `}}customElements.define(BackendAICredentialView.is,BackendAICredentialView)});