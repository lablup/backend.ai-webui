define(["exports","./backend-ai-console.js"],function(_exports,_backendAiConsole){"use strict";Object.defineProperty(_exports,"__esModule",{value:!0});_exports.$foundationDefault=_exports.strings=_exports.cssClasses=_exports.$adapterDefault=_exports.Switch=_exports.style=_exports.$foundation=_exports.$constants=_exports.$adapter=_exports.$mwcSwitch=_exports.$mwcSwitchCss=void 0;const style=_backendAiConsole.css`@keyframes mdc-ripple-fg-radius-in{from{animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1)}to{transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}}@keyframes mdc-ripple-fg-opacity-in{from{animation-timing-function:linear;opacity:0}to{opacity:var(--mdc-ripple-fg-opacity, 0)}}@keyframes mdc-ripple-fg-opacity-out{from{animation-timing-function:linear;opacity:var(--mdc-ripple-fg-opacity, 0)}to{opacity:0}}.mdc-ripple-surface--test-edge-var-bug{--mdc-ripple-surface-test-edge-var: 1px solid #000;visibility:hidden}.mdc-ripple-surface--test-edge-var-bug::before{border:var(--mdc-ripple-surface-test-edge-var)}.mdc-switch{display:inline-block;position:relative;outline:none;user-select:none}.mdc-switch.mdc-switch--checked .mdc-switch__track{background-color:#018786;background-color:var(--mdc-theme-secondary, #018786);border-color:#018786;border-color:var(--mdc-theme-secondary, #018786)}.mdc-switch.mdc-switch--checked .mdc-switch__thumb{background-color:#018786;background-color:var(--mdc-theme-secondary, #018786);border-color:#018786;border-color:var(--mdc-theme-secondary, #018786)}.mdc-switch:not(.mdc-switch--checked) .mdc-switch__track{background-color:#000;border-color:#000}.mdc-switch:not(.mdc-switch--checked) .mdc-switch__thumb{background-color:#fff;border-color:#fff}.mdc-switch:not(.mdc-switch--checked) .mdc-switch__thumb-underlay::before,.mdc-switch:not(.mdc-switch--checked) .mdc-switch__thumb-underlay::after{background-color:#9e9e9e}.mdc-switch:not(.mdc-switch--checked) .mdc-switch__thumb-underlay:hover::before{opacity:.08}.mdc-switch:not(.mdc-switch--checked) .mdc-switch__thumb-underlay:not(.mdc-ripple-upgraded):focus::before,.mdc-switch:not(.mdc-switch--checked) .mdc-switch__thumb-underlay.mdc-ripple-upgraded--background-focused::before{transition-duration:75ms;opacity:.24}.mdc-switch:not(.mdc-switch--checked) .mdc-switch__thumb-underlay:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-switch:not(.mdc-switch--checked) .mdc-switch__thumb-underlay:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:.32}.mdc-switch:not(.mdc-switch--checked) .mdc-switch__thumb-underlay.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: 0.32}.mdc-switch__native-control{left:0;right:initial;position:absolute;top:0;width:68px;height:48px;margin:0;opacity:0;cursor:pointer;pointer-events:auto}[dir=rtl] .mdc-switch__native-control,.mdc-switch__native-control[dir=rtl]{left:initial;right:0}.mdc-switch__track{box-sizing:border-box;width:32px;height:14px;transition:opacity 90ms cubic-bezier(0.4, 0, 0.2, 1),background-color 90ms cubic-bezier(0.4, 0, 0.2, 1),border-color 90ms cubic-bezier(0.4, 0, 0.2, 1);border:1px solid;border-radius:7px;opacity:.38}.mdc-switch__thumb-underlay{left:-18px;right:initial;--mdc-ripple-fg-size: 0;--mdc-ripple-left: 0;--mdc-ripple-top: 0;--mdc-ripple-fg-scale: 1;--mdc-ripple-fg-translate-end: 0;--mdc-ripple-fg-translate-start: 0;-webkit-tap-highlight-color:rgba(0,0,0,0);will-change:transform,opacity;display:flex;position:absolute;top:-17px;align-items:center;justify-content:center;width:48px;height:48px;transform:translateX(0);transition:transform 90ms cubic-bezier(0.4, 0, 0.2, 1),background-color 90ms cubic-bezier(0.4, 0, 0.2, 1),border-color 90ms cubic-bezier(0.4, 0, 0.2, 1)}[dir=rtl] .mdc-switch__thumb-underlay,.mdc-switch__thumb-underlay[dir=rtl]{left:initial;right:-18px}.mdc-switch__thumb-underlay::before,.mdc-switch__thumb-underlay::after{position:absolute;border-radius:50%;opacity:0;pointer-events:none;content:""}.mdc-switch__thumb-underlay::before{transition:opacity 15ms linear,background-color 15ms linear;z-index:1}.mdc-switch__thumb-underlay.mdc-ripple-upgraded::before{transform:scale(var(--mdc-ripple-fg-scale, 1))}.mdc-switch__thumb-underlay.mdc-ripple-upgraded::after{top:0;left:0;transform:scale(0);transform-origin:center center}.mdc-switch__thumb-underlay.mdc-ripple-upgraded--unbounded::after{top:var(--mdc-ripple-top, 0);left:var(--mdc-ripple-left, 0)}.mdc-switch__thumb-underlay.mdc-ripple-upgraded--foreground-activation::after{animation:225ms mdc-ripple-fg-radius-in forwards,75ms mdc-ripple-fg-opacity-in forwards}.mdc-switch__thumb-underlay.mdc-ripple-upgraded--foreground-deactivation::after{animation:150ms mdc-ripple-fg-opacity-out;transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}.mdc-switch__thumb-underlay::before,.mdc-switch__thumb-underlay::after{top:calc(50% - 50%);left:calc(50% - 50%);width:100%;height:100%}.mdc-switch__thumb-underlay.mdc-ripple-upgraded::before,.mdc-switch__thumb-underlay.mdc-ripple-upgraded::after{top:var(--mdc-ripple-top, calc(50% - 50%));left:var(--mdc-ripple-left, calc(50% - 50%));width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}.mdc-switch__thumb-underlay.mdc-ripple-upgraded::after{width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}.mdc-switch__thumb-underlay::before,.mdc-switch__thumb-underlay::after{background-color:#018786}@supports not (-ms-ime-align: auto){.mdc-switch__thumb-underlay::before,.mdc-switch__thumb-underlay::after{background-color:var(--mdc-theme-secondary, #018786)}}.mdc-switch__thumb-underlay:hover::before{opacity:.04}.mdc-switch__thumb-underlay:not(.mdc-ripple-upgraded):focus::before,.mdc-switch__thumb-underlay.mdc-ripple-upgraded--background-focused::before{transition-duration:75ms;opacity:.12}.mdc-switch__thumb-underlay:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-switch__thumb-underlay:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:.16}.mdc-switch__thumb-underlay.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: 0.16}.mdc-switch__thumb{box-shadow:0px 3px 1px -2px rgba(0, 0, 0, 0.2),0px 2px 2px 0px rgba(0, 0, 0, 0.14),0px 1px 5px 0px rgba(0,0,0,.12);box-sizing:border-box;width:20px;height:20px;border:10px solid;border-radius:50%;pointer-events:none;z-index:1}.mdc-switch--checked .mdc-switch__track{opacity:.54}.mdc-switch--checked .mdc-switch__thumb-underlay{transform:translateX(20px)}[dir=rtl] .mdc-switch--checked .mdc-switch__thumb-underlay,.mdc-switch--checked .mdc-switch__thumb-underlay[dir=rtl]{transform:translateX(-20px)}.mdc-switch--checked .mdc-switch__native-control{transform:translateX(-20px)}[dir=rtl] .mdc-switch--checked .mdc-switch__native-control,.mdc-switch--checked .mdc-switch__native-control[dir=rtl]{transform:translateX(20px)}.mdc-switch--disabled{opacity:.38;pointer-events:none}.mdc-switch--disabled .mdc-switch__thumb{border-width:1px}.mdc-switch--disabled .mdc-switch__native-control{cursor:default;pointer-events:none}:host{outline:none}`;_exports.style=style;var mwcSwitchCss={style:style};_exports.$mwcSwitchCss=mwcSwitchCss;class MDCSwitchAdapter{addClass(className){}removeClass(className){}setNativeControlChecked(checked){}setNativeControlDisabled(disabled){}}_exports.$adapterDefault=MDCSwitchAdapter;var adapter={default:MDCSwitchAdapter};_exports.$adapter=adapter;const cssClasses={CHECKED:"mdc-switch--checked",DISABLED:"mdc-switch--disabled"};_exports.cssClasses=cssClasses;const strings={NATIVE_CONTROL_SELECTOR:".mdc-switch__native-control",RIPPLE_SURFACE_SELECTOR:".mdc-switch__thumb-underlay"};_exports.strings=strings;var constants={cssClasses:cssClasses,strings:strings};_exports.$constants=constants;class MDCSwitchFoundation extends _backendAiConsole.$foundationDefault{static get strings(){return strings}static get cssClasses(){return cssClasses}static get defaultAdapter(){return{addClass:()=>{},removeClass:()=>{},setNativeControlChecked:()=>{},setNativeControlDisabled:()=>{}}}constructor(adapter){super(Object.assign(MDCSwitchFoundation.defaultAdapter,adapter))}setChecked(checked){this.adapter_.setNativeControlChecked(checked);this.updateCheckedStyling_(checked)}setDisabled(disabled){this.adapter_.setNativeControlDisabled(disabled);if(disabled){this.adapter_.addClass(cssClasses.DISABLED)}else{this.adapter_.removeClass(cssClasses.DISABLED)}}handleChange(evt){this.updateCheckedStyling_(evt.target.checked)}updateCheckedStyling_(checked){if(checked){this.adapter_.addClass(cssClasses.CHECKED)}else{this.adapter_.removeClass(cssClasses.CHECKED)}}}_exports.$foundationDefault=MDCSwitchFoundation;var foundation={default:MDCSwitchFoundation};_exports.$foundation=foundation;var __decorate=void 0||function(decorators,target,key,desc){var c=arguments.length,r=3>c?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc,d;if("object"===typeof Reflect&&"function"===typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;0<=i;i--)if(d=decorators[i])r=(3>c?d(r):3<c?d(target,key,r):d(target,key))||r;return 3<c&&r&&Object.defineProperty(target,key,r),r};let Switch=class Switch extends _backendAiConsole.FormElement{constructor(){super(...arguments);this.checked=!1;this.disabled=!1;this.mdcFoundationClass=MDCSwitchFoundation}_changeHandler(e){this.mdcFoundation.handleChange(e);this.checked=this.formElement.checked}createAdapter(){return Object.assign({},super.createAdapter(),{setNativeControlChecked:checked=>{this.formElement.checked=checked},setNativeControlDisabled:disabled=>{this.formElement.disabled=disabled}})}get ripple(){return this.rippleNode.ripple}render(){return _backendAiConsole.html$3`
      <div class="mdc-switch">
        <div class="mdc-switch__track"></div>
        <div class="mdc-switch__thumb-underlay" .ripple="${(0,_backendAiConsole.ripple)()}">
          <div class="mdc-switch__thumb">
            <input type="checkbox" id="basic-switch" class="mdc-switch__native-control" role="switch" @change="${this._changeHandler}">
          </div>
        </div>
      </div>
      <slot></slot>`}};_exports.Switch=Switch;Switch.styles=style;__decorate([(0,_backendAiConsole.property)({type:Boolean}),(0,_backendAiConsole.observer)(function(value){this.mdcFoundation.setChecked(value)})],Switch.prototype,"checked",void 0);__decorate([(0,_backendAiConsole.property)({type:Boolean}),(0,_backendAiConsole.observer)(function(value){this.mdcFoundation.setDisabled(value)})],Switch.prototype,"disabled",void 0);__decorate([(0,_backendAiConsole.query)(".mdc-switch")],Switch.prototype,"mdcRoot",void 0);__decorate([(0,_backendAiConsole.query)("input")],Switch.prototype,"formElement",void 0);__decorate([(0,_backendAiConsole.query)(".mdc-switch__thumb-underlay")],Switch.prototype,"rippleNode",void 0);_exports.Switch=Switch=__decorate([(0,_backendAiConsole.customElement)("mwc-switch")],Switch);var mwcSwitch={get Switch(){return Switch}};_exports.$mwcSwitch=mwcSwitch;class BackendAiSettingsView extends _backendAiConsole.LitElement{static get is(){return"backend-ai-settings-view"}static get styles(){return[_backendAiConsole.BackendAiStyles,_backendAiConsole.IronFlex,_backendAiConsole.IronFlexAlignment,_backendAiConsole.IronFlexFactors,_backendAiConsole.IronPositioning,_backendAiConsole.css$1`
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

        paper-material > div {
          padding: 15px;
        }
      `]}render(){return _backendAiConsole.html$4`
      <paper-material elevation="1">
        <h3 class="horizontal center layout">
          <span>General</span>
          <span class="flex"></span>
        </h3>
        <div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Register new images from repository</div>
              <div class="description">Register new environments from repository.
              </div>
            </div>
            <div class="vertical center-justified layout">
              <mwc-switch></mwc-switch>
            </div>
          </div>

          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Automatic image update from repository</div>
              <div class="description">Allow automatic image update from registered registries.
              </div>
            </div>
            <div class="vertical center-justified layout">
              <mwc-switch></mwc-switch>
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Use Backend.AI CLI on GUI</div>
              <div class="description">Provide Backend.AI CLI on GUI app.<br/>Requires Backend.AI CLI image.
              </div>
            </div>
            <div class="vertical center-justified layout">
              <mwc-switch></mwc-switch>
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Use Backend.AI GUI on Web</div>
              <div class="description">Provide Backend.AI GUI as a web service.<br/>Requires Backend.AI Console image.
              </div>
            </div>
            <div class="vertical center-justified layout">
              <mwc-switch></mwc-switch>
            </div>
          </div>
        </div>
        <h3 class="horizontal center layout">
          <span>Scaling</span>
          <span class="flex"></span>
        </h3>
        <div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Allow agent-side registration</div>
              <div class="description">Allow agent to register itself to manager.<br/>Use only if Backend.AI cluster is
                managed on secure location.
              </div>
            </div>
            <div class="vertical center-justified layout">
              <mwc-switch checked></mwc-switch>
            </div>
          </div>
        </div>

        <h3 class="horizontal center layout">
          <span>Plugin</span>
          <span class="flex"></span>
        </h3>
        <div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Virtual GPU</div>
              <div class="description">Use Virtual GPU feature. <br/>Requires Backend.AI Virtual CUDA API Layer Plugin.
              </div>
            </div>
            <div class="vertical center-justified layout">
              <mwc-switch checked></mwc-switch>
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>TPU</div>
              <div class="description">Use TPU accelerator. <br/>Requires nodes on Google Cloud with TPU enabled.
              </div>
            </div>
            <div class="vertical center-justified layout">
              <mwc-switch checked></mwc-switch>
            </div>
          </div>

        </div>


      </paper-material>
    `}static get properties(){return{active:{type:Boolean},images:{type:Object,hasChanged:()=>!0}}}constructor(){super();(0,_backendAiConsole.setPassiveTouchGestures)(!0);this.images={};this.active=!1}shouldUpdate(){return this.active}firstUpdated(){if(window.backendaiclient===void 0||null===window.backendaiclient){document.addEventListener("backend-ai-connected",()=>{},!0)}else{}}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback()}_indexFrom1(index){return index+1}}customElements.define(BackendAiSettingsView.is,BackendAiSettingsView)});