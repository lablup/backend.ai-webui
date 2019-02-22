define(["exports","./components/backend-ai-console.js"],function(_exports,_backendAiConsole){"use strict";Object.defineProperty(_exports,"__esModule",{value:!0});_exports.OverlayElement=_exports.FocusablesHelper=_exports.DialogElement=_exports.PaperCheckedElementBehavior=_exports.PaperCheckedElementBehaviorImpl=_exports.IronCheckedElementBehavior=_exports.IronCheckedElementBehaviorImpl=_exports.$vaadinOverlay=_exports.$vaadinFocusablesHelper=_exports.$vaadinDialog=_exports.$paperCheckedElementBehavior=_exports.$ironCheckedElementBehavior=void 0;var _Mathmin=Math.min,_Mathmax=Math.max,_Mathfloor=Math.floor;const IronCheckedElementBehaviorImpl={properties:{checked:{type:Boolean,value:!1,reflectToAttribute:!0,notify:!0,observer:"_checkedChanged"},toggles:{type:Boolean,value:!0,reflectToAttribute:!0},value:{type:String,value:"on",observer:"_valueChanged"}},observers:["_requiredChanged(required)"],created:function(){this._hasIronCheckedElementBehavior=!0},_getValidity:function(_value){return this.disabled||!this.required||this.checked},_requiredChanged:function(){if(this.required){this.setAttribute("aria-required","true")}else{this.removeAttribute("aria-required")}},_checkedChanged:function(){this.active=this.checked;this.fire("iron-change")},_valueChanged:function(){if(this.value===void 0||null===this.value){this.value="on"}}};_exports.IronCheckedElementBehaviorImpl=IronCheckedElementBehaviorImpl;const IronCheckedElementBehavior=[_backendAiConsole.IronFormElementBehavior,_backendAiConsole.IronValidatableBehavior,IronCheckedElementBehaviorImpl];_exports.IronCheckedElementBehavior=IronCheckedElementBehavior;var ironCheckedElementBehavior={IronCheckedElementBehaviorImpl:IronCheckedElementBehaviorImpl,IronCheckedElementBehavior:IronCheckedElementBehavior};_exports.$ironCheckedElementBehavior=ironCheckedElementBehavior;(0,_backendAiConsole.Polymer)({_template:_backendAiConsole.html$2`
    <style>
      :host {
        display: block;
        transition-duration: var(--iron-collapse-transition-duration, 300ms);
        /* Safari 10 needs this property prefixed to correctly apply the custom property */
        -webkit-transition-duration: var(--iron-collapse-transition-duration, 300ms);
        overflow: visible;
      }

      :host(.iron-collapse-closed) {
        display: none;
      }

      :host(:not(.iron-collapse-opened)) {
        overflow: hidden;
      }
    </style>

    <slot></slot>
`,is:"iron-collapse",behaviors:[_backendAiConsole.IronResizableBehavior],properties:{horizontal:{type:Boolean,value:!1,observer:"_horizontalChanged"},opened:{type:Boolean,value:!1,notify:!0,observer:"_openedChanged"},transitioning:{type:Boolean,notify:!0,readOnly:!0},noAnimation:{type:Boolean},_desiredSize:{type:String,value:""}},get dimension(){return this.horizontal?"width":"height"},get _dimensionMax(){return this.horizontal?"maxWidth":"maxHeight"},get _dimensionMaxCss(){return this.horizontal?"max-width":"max-height"},hostAttributes:{role:"group","aria-hidden":"true"},listeners:{transitionend:"_onTransitionEnd"},toggle:function(){this.opened=!this.opened},show:function(){this.opened=!0},hide:function(){this.opened=!1},updateSize:function(size,animated){size="auto"===size?"":size;var willAnimate=animated&&!this.noAnimation&&this.isAttached&&this._desiredSize!==size;this._desiredSize=size;this._updateTransition(!1);if(willAnimate){var startSize=this._calcSize();if(""===size){this.style[this._dimensionMax]="";size=this._calcSize()}this.style[this._dimensionMax]=startSize;this.scrollTop=this.scrollTop;this._updateTransition(!0);willAnimate=size!==startSize}this.style[this._dimensionMax]=size;if(!willAnimate){this._transitionEnd()}},enableTransition:function(enabled){_backendAiConsole.Base._warn("`enableTransition()` is deprecated, use `noAnimation` instead.");this.noAnimation=!enabled},_updateTransition:function(enabled){this.style.transitionDuration=enabled&&!this.noAnimation?"":"0s"},_horizontalChanged:function(){this.style.transitionProperty=this._dimensionMaxCss;var otherDimension="maxWidth"===this._dimensionMax?"maxHeight":"maxWidth";this.style[otherDimension]="";this.updateSize(this.opened?"auto":"0px",!1)},_openedChanged:function(){this.setAttribute("aria-hidden",!this.opened);this._setTransitioning(!0);this.toggleClass("iron-collapse-closed",!1);this.toggleClass("iron-collapse-opened",!1);this.updateSize(this.opened?"auto":"0px",!0);if(this.opened){this.focus()}},_transitionEnd:function(){this.style[this._dimensionMax]=this._desiredSize;this.toggleClass("iron-collapse-closed",!this.opened);this.toggleClass("iron-collapse-opened",this.opened);this._updateTransition(!1);this.notifyResize();this._setTransitioning(!1)},_onTransitionEnd:function(event){if((0,_backendAiConsole.dom)(event).rootTarget===this){this._transitionEnd()}},_calcSize:function(){return this.getBoundingClientRect()[this.dimension]+"px"}});const PaperCheckedElementBehaviorImpl={_checkedChanged:function(){IronCheckedElementBehaviorImpl._checkedChanged.call(this);if(this.hasRipple()){if(this.checked){this._ripple.setAttribute("checked","")}else{this._ripple.removeAttribute("checked")}}},_buttonStateChanged:function(){_backendAiConsole.PaperRippleBehavior._buttonStateChanged.call(this);if(this.disabled){return}if(this.isAttached){this.checked=this.active}}};_exports.PaperCheckedElementBehaviorImpl=PaperCheckedElementBehaviorImpl;const PaperCheckedElementBehavior=[_backendAiConsole.PaperInkyFocusBehavior,IronCheckedElementBehavior,PaperCheckedElementBehaviorImpl];_exports.PaperCheckedElementBehavior=PaperCheckedElementBehavior;var paperCheckedElementBehavior={PaperCheckedElementBehaviorImpl:PaperCheckedElementBehaviorImpl,PaperCheckedElementBehavior:PaperCheckedElementBehavior};_exports.$paperCheckedElementBehavior=paperCheckedElementBehavior;const template=_backendAiConsole.html$2`<style>
  :host {
    display: inline-block;
    white-space: nowrap;
    cursor: pointer;
    --calculated-paper-checkbox-size: var(--paper-checkbox-size, 18px);
    /* -1px is a sentinel for the default and is replaced in \`attached\`. */
    --calculated-paper-checkbox-ink-size: var(--paper-checkbox-ink-size, -1px);
    @apply --paper-font-common-base;
    line-height: 0;
    -webkit-tap-highlight-color: transparent;
  }

  :host([hidden]) {
    display: none !important;
  }

  :host(:focus) {
    outline: none;
  }

  .hidden {
    display: none;
  }

  #checkboxContainer {
    display: inline-block;
    position: relative;
    width: var(--calculated-paper-checkbox-size);
    height: var(--calculated-paper-checkbox-size);
    min-width: var(--calculated-paper-checkbox-size);
    margin: var(--paper-checkbox-margin, initial);
    vertical-align: var(--paper-checkbox-vertical-align, middle);
    background-color: var(--paper-checkbox-unchecked-background-color, transparent);
  }

  #ink {
    position: absolute;

    /* Center the ripple in the checkbox by negative offsetting it by
     * (inkWidth - rippleWidth) / 2 */
    top: calc(0px - (var(--calculated-paper-checkbox-ink-size) - var(--calculated-paper-checkbox-size)) / 2);
    left: calc(0px - (var(--calculated-paper-checkbox-ink-size) - var(--calculated-paper-checkbox-size)) / 2);
    width: var(--calculated-paper-checkbox-ink-size);
    height: var(--calculated-paper-checkbox-ink-size);
    color: var(--paper-checkbox-unchecked-ink-color, var(--primary-text-color));
    opacity: 0.6;
    pointer-events: none;
  }

  #ink:dir(rtl) {
    right: calc(0px - (var(--calculated-paper-checkbox-ink-size) - var(--calculated-paper-checkbox-size)) / 2);
    left: auto;
  }

  #ink[checked] {
    color: var(--paper-checkbox-checked-ink-color, var(--primary-color));
  }

  #checkbox {
    position: relative;
    box-sizing: border-box;
    height: 100%;
    border: solid 2px;
    border-color: var(--paper-checkbox-unchecked-color, var(--primary-text-color));
    border-radius: 2px;
    pointer-events: none;
    -webkit-transition: background-color 140ms, border-color 140ms;
    transition: background-color 140ms, border-color 140ms;

    -webkit-transition-duration: var(--paper-checkbox-animation-duration, 140ms);
    transition-duration: var(--paper-checkbox-animation-duration, 140ms);
  }

  /* checkbox checked animations */
  #checkbox.checked #checkmark {
    -webkit-animation: checkmark-expand 140ms ease-out forwards;
    animation: checkmark-expand 140ms ease-out forwards;

    -webkit-animation-duration: var(--paper-checkbox-animation-duration, 140ms);
    animation-duration: var(--paper-checkbox-animation-duration, 140ms);
  }

  @-webkit-keyframes checkmark-expand {
    0% {
      -webkit-transform: scale(0, 0) rotate(45deg);
    }
    100% {
      -webkit-transform: scale(1, 1) rotate(45deg);
    }
  }

  @keyframes checkmark-expand {
    0% {
      transform: scale(0, 0) rotate(45deg);
    }
    100% {
      transform: scale(1, 1) rotate(45deg);
    }
  }

  #checkbox.checked {
    background-color: var(--paper-checkbox-checked-color, var(--primary-color));
    border-color: var(--paper-checkbox-checked-color, var(--primary-color));
  }

  #checkmark {
    position: absolute;
    width: 36%;
    height: 70%;
    border-style: solid;
    border-top: none;
    border-left: none;
    border-right-width: calc(2/15 * var(--calculated-paper-checkbox-size));
    border-bottom-width: calc(2/15 * var(--calculated-paper-checkbox-size));
    border-color: var(--paper-checkbox-checkmark-color, white);
    -webkit-transform-origin: 97% 86%;
    transform-origin: 97% 86%;
    box-sizing: content-box; /* protect against page-level box-sizing */
  }

  #checkmark:dir(rtl) {
    -webkit-transform-origin: 50% 14%;
    transform-origin: 50% 14%;
  }

  /* label */
  #checkboxLabel {
    position: relative;
    display: inline-block;
    vertical-align: middle;
    padding-left: var(--paper-checkbox-label-spacing, 8px);
    white-space: normal;
    line-height: normal;
    color: var(--paper-checkbox-label-color, var(--primary-text-color));
    @apply --paper-checkbox-label;
  }

  :host([checked]) #checkboxLabel {
    color: var(--paper-checkbox-label-checked-color, var(--paper-checkbox-label-color, var(--primary-text-color)));
    @apply --paper-checkbox-label-checked;
  }

  #checkboxLabel:dir(rtl) {
    padding-right: var(--paper-checkbox-label-spacing, 8px);
    padding-left: 0;
  }

  #checkboxLabel[hidden] {
    display: none;
  }

  /* disabled state */

  :host([disabled]) #checkbox {
    opacity: 0.5;
    border-color: var(--paper-checkbox-unchecked-color, var(--primary-text-color));
  }

  :host([disabled][checked]) #checkbox {
    background-color: var(--paper-checkbox-unchecked-color, var(--primary-text-color));
    opacity: 0.5;
  }

  :host([disabled]) #checkboxLabel  {
    opacity: 0.65;
  }

  /* invalid state */
  #checkbox.invalid:not(.checked) {
    border-color: var(--paper-checkbox-error-color, var(--error-color));
  }
</style>

<div id="checkboxContainer">
  <div id="checkbox" class$="[[_computeCheckboxClass(checked, invalid)]]">
    <div id="checkmark" class$="[[_computeCheckmarkClass(checked)]]"></div>
  </div>
</div>

<div id="checkboxLabel"><slot></slot></div>`;template.setAttribute("strip-whitespace","");(0,_backendAiConsole.Polymer)({_template:template,is:"paper-checkbox",behaviors:[PaperCheckedElementBehavior],hostAttributes:{role:"checkbox","aria-checked":!1,tabindex:0},properties:{ariaActiveAttribute:{type:String,value:"aria-checked"}},attached:function(){(0,_backendAiConsole.afterNextRender)(this,function(){var inkSize=this.getComputedStyleValue("--calculated-paper-checkbox-ink-size").trim();if("-1px"===inkSize){var checkboxSizeText=this.getComputedStyleValue("--calculated-paper-checkbox-size").trim(),units="px",unitsMatches=checkboxSizeText.match(/[A-Za-z]+$/);if(null!==unitsMatches){units=unitsMatches[0]}var checkboxSize=parseFloat(checkboxSizeText),defaultInkSize=8/3*checkboxSize;if("px"===units){defaultInkSize=_Mathfloor(defaultInkSize);if(defaultInkSize%2!==checkboxSize%2){defaultInkSize++}}this.updateStyles({"--paper-checkbox-ink-size":defaultInkSize+units})}})},_computeCheckboxClass:function(checked,invalid){var className="";if(checked){className+="checked "}if(invalid){className+="invalid"}return className},_computeCheckmarkClass:function(checked){return checked?"":"hidden"},_createRipple:function(){this._rippleContainer=this.$.checkboxContainer;return _backendAiConsole.PaperInkyFocusBehaviorImpl._createRipple.call(this)}});const template$1=_backendAiConsole.html$1`
  <style>
    :host {
      @apply --layout;
      @apply --layout-justified;
      @apply --layout-center;
      width: 200px;
      cursor: default;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      --paper-progress-active-color: var(--paper-slider-active-color, var(--google-blue-700));
      --paper-progress-secondary-color: var(--paper-slider-secondary-color, var(--google-blue-300));
      --paper-progress-disabled-active-color: var(--paper-slider-disabled-active-color, var(--paper-grey-400));
      --paper-progress-disabled-secondary-color: var(--paper-slider-disabled-secondary-color, var(--paper-grey-400));
      --calculated-paper-slider-height: var(--paper-slider-height, 2px);
    }

    /* focus shows the ripple */
    :host(:focus) {
      outline: none;
    }

    /**
      * NOTE(keanulee): Though :host-context is not universally supported, some pages
      * still rely on paper-slider being flipped when dir="rtl" is set on body. For full
      * compatibility, dir="rtl" must be explicitly set on paper-slider.
      */
    :dir(rtl) #sliderContainer {
      -webkit-transform: scaleX(-1);
      transform: scaleX(-1);
    }

    /**
      * NOTE(keanulee): This is separate from the rule above because :host-context may
      * not be recognized.
      */
    :host([dir="rtl"]) #sliderContainer {
      -webkit-transform: scaleX(-1);
      transform: scaleX(-1);
    }

    /**
      * NOTE(keanulee): Needed to override the :host-context rule (where supported)
      * to support LTR sliders in RTL pages.
      */
    :host([dir="ltr"]) #sliderContainer {
      -webkit-transform: scaleX(1);
      transform: scaleX(1);
    }

    #sliderContainer {
      position: relative;
      width: 100%;
      height: calc(30px + var(--calculated-paper-slider-height));
      margin-left: calc(15px + var(--calculated-paper-slider-height)/2);
      margin-right: calc(15px + var(--calculated-paper-slider-height)/2);
    }

    #sliderContainer:focus {
      outline: 0;
    }

    #sliderContainer.editable {
      margin-top: 12px;
      margin-bottom: 12px;
    }

    .bar-container {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      overflow: hidden;
    }

    .ring > .bar-container {
      left: calc(5px + var(--calculated-paper-slider-height)/2);
      transition: left 0.18s ease;
    }

    .ring.expand.dragging > .bar-container {
      transition: none;
    }

    .ring.expand:not(.pin) > .bar-container {
      left: calc(8px + var(--calculated-paper-slider-height)/2);
    }

    #sliderBar {
      padding: 15px 0;
      width: 100%;
      background-color: var(--paper-slider-bar-color, transparent);
      --paper-progress-container-color: var(--paper-slider-container-color, var(--paper-grey-400));
      --paper-progress-height: var(--calculated-paper-slider-height);
    }

    .slider-markers {
      position: absolute;
      /* slider-knob is 30px + the slider-height so that the markers should start at a offset of 15px*/
      top: 15px;
      height: var(--calculated-paper-slider-height);
      left: 0;
      right: -1px;
      box-sizing: border-box;
      pointer-events: none;
      @apply --layout-horizontal;
    }

    .slider-marker {
      @apply --layout-flex;
    }
    .slider-markers::after,
    .slider-marker::after {
      content: "";
      display: block;
      margin-left: -1px;
      width: 2px;
      height: var(--calculated-paper-slider-height);
      border-radius: 50%;
      background-color: var(--paper-slider-markers-color, #000);
    }

    .slider-knob {
      position: absolute;
      left: 0;
      top: 0;
      margin-left: calc(-15px - var(--calculated-paper-slider-height)/2);
      width: calc(30px + var(--calculated-paper-slider-height));
      height: calc(30px + var(--calculated-paper-slider-height));
    }

    .transiting > .slider-knob {
      transition: left 0.08s ease;
    }

    .slider-knob:focus {
      outline: none;
    }

    .slider-knob.dragging {
      transition: none;
    }

    .snaps > .slider-knob.dragging {
      transition: -webkit-transform 0.08s ease;
      transition: transform 0.08s ease;
    }

    .slider-knob-inner {
      margin: 10px;
      width: calc(100% - 20px);
      height: calc(100% - 20px);
      background-color: var(--paper-slider-knob-color, var(--google-blue-700));
      border: 2px solid var(--paper-slider-knob-color, var(--google-blue-700));
      border-radius: 50%;

      -moz-box-sizing: border-box;
      box-sizing: border-box;

      transition-property: -webkit-transform, background-color, border;
      transition-property: transform, background-color, border;
      transition-duration: 0.18s;
      transition-timing-function: ease;
    }

    .expand:not(.pin) > .slider-knob > .slider-knob-inner {
      -webkit-transform: scale(1.5);
      transform: scale(1.5);
    }

    .ring > .slider-knob > .slider-knob-inner {
      background-color: var(--paper-slider-knob-start-color, transparent);
      border: 2px solid var(--paper-slider-knob-start-border-color, var(--paper-grey-400));
    }

    .slider-knob-inner::before {
      background-color: var(--paper-slider-pin-color, var(--google-blue-700));
    }

    .pin > .slider-knob > .slider-knob-inner::before {
      content: "";
      position: absolute;
      top: 0;
      left: 50%;
      margin-left: -13px;
      width: 26px;
      height: 26px;
      border-radius: 50% 50% 50% 0;

      -webkit-transform: rotate(-45deg) scale(0) translate(0);
      transform: rotate(-45deg) scale(0) translate(0);
    }

    .slider-knob-inner::before,
    .slider-knob-inner::after {
      transition: -webkit-transform .18s ease, background-color .18s ease;
      transition: transform .18s ease, background-color .18s ease;
    }

    .pin.ring > .slider-knob > .slider-knob-inner::before {
      background-color: var(--paper-slider-pin-start-color, var(--paper-grey-400));
    }

    .pin.expand > .slider-knob > .slider-knob-inner::before {
      -webkit-transform: rotate(-45deg) scale(1) translate(17px, -17px);
      transform: rotate(-45deg) scale(1) translate(17px, -17px);
    }

    .pin > .slider-knob > .slider-knob-inner::after {
      content: attr(value);
      position: absolute;
      top: 0;
      left: 50%;
      margin-left: -16px;
      width: 32px;
      height: 26px;
      text-align: center;
      color: var(--paper-slider-font-color, #fff);
      font-size: 10px;

      -webkit-transform: scale(0) translate(0);
      transform: scale(0) translate(0);
    }

    .pin.expand > .slider-knob > .slider-knob-inner::after {
      -webkit-transform: scale(1) translate(0, -17px);
      transform: scale(1) translate(0, -17px);
    }

    /* paper-input */
    .slider-input {
      width: 50px;
      overflow: hidden;
      --paper-input-container-input: {
        text-align: center;
        @apply --paper-slider-input-container-input;
      };
      @apply --paper-slider-input;
    }

    /* disabled state */
    #sliderContainer.disabled {
      pointer-events: none;
    }

    .disabled > .slider-knob > .slider-knob-inner {
      background-color: var(--paper-slider-disabled-knob-color, var(--paper-grey-400));
      border: 2px solid var(--paper-slider-disabled-knob-color, var(--paper-grey-400));
      -webkit-transform: scale3d(0.75, 0.75, 1);
      transform: scale3d(0.75, 0.75, 1);
    }

    .disabled.ring > .slider-knob > .slider-knob-inner {
      background-color: var(--paper-slider-knob-start-color, transparent);
      border: 2px solid var(--paper-slider-knob-start-border-color, var(--paper-grey-400));
    }

    paper-ripple {
      color: var(--paper-slider-knob-color, var(--google-blue-700));
    }
  </style>

  <div id="sliderContainer" class\$="[[_getClassNames(disabled, pin, snaps, immediateValue, min, expand, dragging, transiting, editable)]]">
    <div class="bar-container">
      <paper-progress disabled\$="[[disabled]]" id="sliderBar" aria-hidden="true" min="[[min]]" max="[[max]]" step="[[step]]" value="[[immediateValue]]" secondary-progress="[[secondaryProgress]]" on-down="_bardown" on-up="_resetKnob" on-track="_bartrack" on-tap="_barclick">
      </paper-progress>
    </div>

    <template is="dom-if" if="[[snaps]]">
      <div class="slider-markers">
        <template is="dom-repeat" items="[[markers]]">
          <div class="slider-marker"></div>
        </template>
      </div>
    </template>

    <div id="sliderKnob" class="slider-knob" on-down="_knobdown" on-up="_resetKnob" on-track="_onTrack" on-transitionend="_knobTransitionEnd">
        <div class="slider-knob-inner" value\$="[[immediateValue]]"></div>
    </div>
  </div>

  <template is="dom-if" if="[[editable]]">
    <paper-input id="input" type="number" step="[[step]]" min="[[min]]" max="[[max]]" class="slider-input" disabled\$="[[disabled]]" value="[[immediateValue]]" on-change="_changeValue" on-keydown="_inputKeyDown" no-label-float>
    </paper-input>
  </template>
`;template$1.setAttribute("strip-whitespace","");(0,_backendAiConsole.Polymer)({_template:template$1,is:"paper-slider",behaviors:[_backendAiConsole.IronA11yKeysBehavior,_backendAiConsole.IronFormElementBehavior,_backendAiConsole.PaperInkyFocusBehavior,_backendAiConsole.IronRangeBehavior],properties:{value:{type:Number,value:0},snaps:{type:Boolean,value:!1,notify:!0},pin:{type:Boolean,value:!1,notify:!0},secondaryProgress:{type:Number,value:0,notify:!0,observer:"_secondaryProgressChanged"},editable:{type:Boolean,value:!1},immediateValue:{type:Number,value:0,readOnly:!0,notify:!0},maxMarkers:{type:Number,value:0,notify:!0},expand:{type:Boolean,value:!1,readOnly:!0},ignoreBarTouch:{type:Boolean,value:!1},dragging:{type:Boolean,value:!1,readOnly:!0,notify:!0},transiting:{type:Boolean,value:!1,readOnly:!0},markers:{type:Array,readOnly:!0,value:function(){return[]}}},observers:["_updateKnob(value, min, max, snaps, step)","_valueChanged(value)","_immediateValueChanged(immediateValue)","_updateMarkers(maxMarkers, min, max, snaps)"],hostAttributes:{role:"slider",tabindex:0},keyBindings:{left:"_leftKey",right:"_rightKey","down pagedown home":"_decrementKey","up pageup end":"_incrementKey"},ready:function(){if(this.ignoreBarTouch){(0,_backendAiConsole.setTouchAction)(this.$.sliderBar,"auto")}},increment:function(){this.value=this._clampValue(this.value+this.step)},decrement:function(){this.value=this._clampValue(this.value-this.step)},_updateKnob:function(value,min,max,snaps,step){this.setAttribute("aria-valuemin",min);this.setAttribute("aria-valuemax",max);this.setAttribute("aria-valuenow",value);this._positionKnob(100*this._calcRatio(value))},_valueChanged:function(){this.fire("value-change",{composed:!0})},_immediateValueChanged:function(){if(this.dragging){this.fire("immediate-value-change",{composed:!0})}else{this.value=this.immediateValue}},_secondaryProgressChanged:function(){this.secondaryProgress=this._clampValue(this.secondaryProgress)},_expandKnob:function(){this._setExpand(!0)},_resetKnob:function(){this.cancelDebouncer("expandKnob");this._setExpand(!1)},_positionKnob:function(ratio){this._setImmediateValue(this._calcStep(this._calcKnobPosition(ratio)));this._setRatio(100*this._calcRatio(this.immediateValue));this.$.sliderKnob.style.left=this.ratio+"%";if(this.dragging){this._knobstartx=this.ratio*this._w/100;this.translate3d(0,0,0,this.$.sliderKnob)}},_calcKnobPosition:function(ratio){return(this.max-this.min)*ratio/100+this.min},_onTrack:function(event){event.stopPropagation();switch(event.detail.state){case"start":this._trackStart(event);break;case"track":this._trackX(event);break;case"end":this._trackEnd();break;}},_trackStart:function(event){this._setTransiting(!1);this._w=this.$.sliderBar.offsetWidth;this._x=this.ratio*this._w/100;this._startx=this._x;this._knobstartx=this._startx;this._minx=-this._startx;this._maxx=this._w-this._startx;this.$.sliderKnob.classList.add("dragging");this._setDragging(!0)},_trackX:function(event){if(!this.dragging){this._trackStart(event)}var direction=this._isRTL?-1:1,dx=_Mathmin(this._maxx,_Mathmax(this._minx,event.detail.dx*direction));this._x=this._startx+dx;var immediateValue=this._calcStep(this._calcKnobPosition(100*(this._x/this._w)));this._setImmediateValue(immediateValue);var translateX=this._calcRatio(this.immediateValue)*this._w-this._knobstartx;this.translate3d(translateX+"px",0,0,this.$.sliderKnob)},_trackEnd:function(){var s=this.$.sliderKnob.style;this.$.sliderKnob.classList.remove("dragging");this._setDragging(!1);this._resetKnob();this.value=this.immediateValue;s.transform=s.webkitTransform="";this.fire("change",{composed:!0})},_knobdown:function(event){this._expandKnob();event.preventDefault();this.focus()},_bartrack:function(event){if(this._allowBarEvent(event)){this._onTrack(event)}},_barclick:function(event){this._w=this.$.sliderBar.offsetWidth;var rect=this.$.sliderBar.getBoundingClientRect(),ratio=100*((event.detail.x-rect.left)/this._w);if(this._isRTL){ratio=100-ratio}var prevRatio=this.ratio;this._setTransiting(!0);this._positionKnob(ratio);if(prevRatio===this.ratio){this._setTransiting(!1)}this.async(function(){this.fire("change",{composed:!0})});event.preventDefault();this.focus()},_bardown:function(event){if(this._allowBarEvent(event)){this.debounce("expandKnob",this._expandKnob,60);this._barclick(event)}},_knobTransitionEnd:function(event){if(event.target===this.$.sliderKnob){this._setTransiting(!1)}},_updateMarkers:function(maxMarkers,min,max,snaps){if(!snaps){this._setMarkers([])}var steps=Math.round((max-min)/this.step);if(steps>maxMarkers){steps=maxMarkers}if(0>steps||!isFinite(steps)){steps=0}this._setMarkers(Array(steps))},_mergeClasses:function(classes){return Object.keys(classes).filter(function(className){return classes[className]}).join(" ")},_getClassNames:function(){return this._mergeClasses({disabled:this.disabled,pin:this.pin,snaps:this.snaps,ring:this.immediateValue<=this.min,expand:this.expand,dragging:this.dragging,transiting:this.transiting,editable:this.editable})},_allowBarEvent:function(event){return!this.ignoreBarTouch||event.detail.sourceEvent instanceof MouseEvent},get _isRTL(){if(this.__isRTL===void 0){this.__isRTL="rtl"===window.getComputedStyle(this).direction}return this.__isRTL},_leftKey:function(event){if(this._isRTL)this._incrementKey(event);else this._decrementKey(event)},_rightKey:function(event){if(this._isRTL)this._decrementKey(event);else this._incrementKey(event)},_incrementKey:function(event){if(!this.disabled){if("end"===event.detail.key){this.value=this.max}else{this.increment()}this.fire("change");event.preventDefault()}},_decrementKey:function(event){if(!this.disabled){if("home"===event.detail.key){this.value=this.min}else{this.decrement()}this.fire("change");event.preventDefault()}},_changeValue:function(event){this.value=event.target.value;this.fire("change",{composed:!0})},_inputKeyDown:function(event){event.stopPropagation()},_createRipple:function(){this._rippleContainer=this.$.sliderKnob;return _backendAiConsole.PaperInkyFocusBehaviorImpl._createRipple.call(this)},_focusedChanged:function(receivedFocusFromKeyboard){if(receivedFocusFromKeyboard){this.ensureRipple()}if(this.hasRipple()){if(receivedFocusFromKeyboard){this._ripple.style.display=""}else{this._ripple.style.display="none"}this._ripple.holdDown=receivedFocusFromKeyboard}}});const template$2=_backendAiConsole.html$2`

    <style>
      :host {
        display: inline-block;
        @apply --layout-horizontal;
        @apply --layout-center;
        @apply --paper-font-common-base;
      }

      :host([disabled]) {
        pointer-events: none;
      }

      :host(:focus) {
        outline:none;
      }

      .toggle-bar {
        position: absolute;
        height: 100%;
        width: 100%;
        border-radius: 8px;
        pointer-events: none;
        opacity: 0.4;
        transition: background-color linear .08s;
        background-color: var(--paper-toggle-button-unchecked-bar-color, #000000);

        @apply --paper-toggle-button-unchecked-bar;
      }

      .toggle-button {
        position: absolute;
        top: -3px;
        left: 0;
        height: 20px;
        width: 20px;
        border-radius: 50%;
        box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.6);
        transition: -webkit-transform linear .08s, background-color linear .08s;
        transition: transform linear .08s, background-color linear .08s;
        will-change: transform;
        background-color: var(--paper-toggle-button-unchecked-button-color, var(--paper-grey-50));

        @apply --paper-toggle-button-unchecked-button;
      }

      .toggle-button.dragging {
        -webkit-transition: none;
        transition: none;
      }

      :host([checked]:not([disabled])) .toggle-bar {
        opacity: 0.5;
        background-color: var(--paper-toggle-button-checked-bar-color, var(--primary-color));

        @apply --paper-toggle-button-checked-bar;
      }

      :host([disabled]) .toggle-bar {
        background-color: #000;
        opacity: 0.12;
      }

      :host([checked]) .toggle-button {
        -webkit-transform: translate(16px, 0);
        transform: translate(16px, 0);
      }

      :host([checked]:not([disabled])) .toggle-button {
        background-color: var(--paper-toggle-button-checked-button-color, var(--primary-color));

        @apply --paper-toggle-button-checked-button;
      }

      :host([disabled]) .toggle-button {
        background-color: #bdbdbd;
        opacity: 1;
      }

      .toggle-ink {
        position: absolute;
        top: -14px;
        left: -14px;
        right: auto;
        bottom: auto;
        width: 48px;
        height: 48px;
        opacity: 0.5;
        pointer-events: none;
        color: var(--paper-toggle-button-unchecked-ink-color, var(--primary-text-color));

        @apply --paper-toggle-button-unchecked-ink;
      }

      :host([checked]) .toggle-ink {
        color: var(--paper-toggle-button-checked-ink-color, var(--primary-color));

        @apply --paper-toggle-button-checked-ink;
      }

      .toggle-container {
        display: inline-block;
        position: relative;
        width: 36px;
        height: 14px;
        /* The toggle button has an absolute position of -3px; The extra 1px
        /* accounts for the toggle button shadow box. */
        margin: 4px 1px;
      }

      .toggle-label {
        position: relative;
        display: inline-block;
        vertical-align: middle;
        padding-left: var(--paper-toggle-button-label-spacing, 8px);
        pointer-events: none;
        color: var(--paper-toggle-button-label-color, var(--primary-text-color));
      }

      /* invalid state */
      :host([invalid]) .toggle-bar {
        background-color: var(--paper-toggle-button-invalid-bar-color, var(--error-color));
      }

      :host([invalid]) .toggle-button {
        background-color: var(--paper-toggle-button-invalid-button-color, var(--error-color));
      }

      :host([invalid]) .toggle-ink {
        color: var(--paper-toggle-button-invalid-ink-color, var(--error-color));
      }
    </style>

    <div class="toggle-container">
      <div id="toggleBar" class="toggle-bar"></div>
      <div id="toggleButton" class="toggle-button"></div>
    </div>

    <div class="toggle-label"><slot></slot></div>

  `;template$2.setAttribute("strip-whitespace","");(0,_backendAiConsole.Polymer)({_template:template$2,is:"paper-toggle-button",behaviors:[PaperCheckedElementBehavior],hostAttributes:{role:"button","aria-pressed":"false",tabindex:0},properties:{},listeners:{track:"_ontrack"},attached:function(){(0,_backendAiConsole.afterNextRender)(this,function(){(0,_backendAiConsole.setTouchAction)(this,"pan-y")})},_ontrack:function(event){var track=event.detail;if("start"===track.state){this._trackStart(track)}else if("track"===track.state){this._trackMove(track)}else if("end"===track.state){this._trackEnd(track)}},_trackStart:function(track){this._width=this.$.toggleBar.offsetWidth/2;this._trackChecked=this.checked;this.$.toggleButton.classList.add("dragging")},_trackMove:function(track){var dx=track.dx;this._x=_Mathmin(this._width,_Mathmax(0,this._trackChecked?this._width+dx:dx));this.translate3d(this._x+"px",0,0,this.$.toggleButton);this._userActivate(this._x>this._width/2)},_trackEnd:function(track){this.$.toggleButton.classList.remove("dragging");this.transform("",this.$.toggleButton)},_createRipple:function(){this._rippleContainer=this.$.toggleButton;var ripple=_backendAiConsole.PaperRippleBehavior._createRipple();ripple.id="ink";ripple.setAttribute("recenters","");ripple.classList.add("circle","toggle-ink");return ripple}});const p=Element.prototype,matches=p.matches||p.matchesSelector||p.mozMatchesSelector||p.msMatchesSelector||p.oMatchesSelector||p.webkitMatchesSelector,FocusablesHelper={getTabbableNodes:function(node){const result=[],needsSortByTabIndex=this._collectTabbableNodes(node,result);if(needsSortByTabIndex){return this._sortByTabIndex(result)}return result},isFocusable:function(element){if(matches.call(element,"input, select, textarea, button, object")){return matches.call(element,":not([disabled])")}return matches.call(element,"a[href], area[href], iframe, [tabindex], [contentEditable]")},isTabbable:function(element){return this.isFocusable(element)&&matches.call(element,":not([tabindex=\"-1\"])")&&this._isVisible(element)},_normalizedTabIndex:function(element){if(this.isFocusable(element)){const tabIndex=element.getAttribute("tabindex")||0;return+tabIndex}return-1},_collectTabbableNodes:function(node,result){if(node.nodeType!==Node.ELEMENT_NODE||!this._isVisible(node)){return!1}const element=node,tabIndex=this._normalizedTabIndex(element);let needsSort=0<tabIndex;if(0<=tabIndex){result.push(element)}let children;if("slot"===element.localName){children=element.assignedNodes({flatten:!0})}else{children=(element.shadowRoot||element).children}for(let i=0;i<children.length;i++){needsSort=this._collectTabbableNodes(children[i],result)||needsSort}return needsSort},_isVisible:function(element){let style=element.style;if("hidden"!==style.visibility&&"none"!==style.display){style=window.getComputedStyle(element);return"hidden"!==style.visibility&&"none"!==style.display}return!1},_sortByTabIndex:function(tabbables){const len=tabbables.length;if(2>len){return tabbables}const pivot=Math.ceil(len/2),left=this._sortByTabIndex(tabbables.slice(0,pivot)),right=this._sortByTabIndex(tabbables.slice(pivot));return this._mergeSortByTabIndex(left,right)},_mergeSortByTabIndex:function(left,right){const result=[];while(0<left.length&&0<right.length){if(this._hasLowerTabOrder(left[0],right[0])){result.push(right.shift())}else{result.push(left.shift())}}return result.concat(left,right)},_hasLowerTabOrder:function(a,b){const ati=_Mathmax(a.tabIndex,0),bti=_Mathmax(b.tabIndex,0);return 0===ati||0===bti?bti>ati:ati>bti}};_exports.FocusablesHelper=FocusablesHelper;var vaadinFocusablesHelper={FocusablesHelper:FocusablesHelper};_exports.$vaadinFocusablesHelper=vaadinFocusablesHelper;let overlayContentCounter=0;const createOverlayContent=cssText=>{overlayContentCounter++;const is=`vaadin-overlay-content-${overlayContentCounter}`,styledTemplate=document.createElement("template"),style=document.createElement("style");style.textContent=":host { display: block; }"+cssText;styledTemplate.content.appendChild(style);if(window.ShadyCSS){window.ShadyCSS.prepareTemplate(styledTemplate,is)}const klass=(()=>class extends HTMLElement{static get is(){return is}connectedCallback(){if(window.ShadyCSS){window.ShadyCSS.styleElement(this)}if(!this.shadowRoot){this.attachShadow({mode:"open"});this.shadowRoot.appendChild(document.importNode(styledTemplate.content,!0))}}})();customElements.define(klass.is,klass);return document.createElement(is)};class OverlayElement extends(0,_backendAiConsole.ThemableMixin)(_backendAiConsole.PolymerElement){static get template(){return _backendAiConsole.html$2`
    <style>
      :host {
        z-index: 200;
        position: fixed;

        /*
          Despite of what the names say, <vaadin-overlay> is just a container
          for position/sizing/alignment. The actual overlay is the overlay part.
        */

        /*
          Default position constraints: the entire viewport. Note: themes can
          override this to introduce gaps between the overlay and the viewport.
        */
        top: 0;
        right: 0;
        bottom: var(--vaadin-overlay-viewport-bottom);
        left: 0;

        /* Use flexbox alignment for the overlay part. */
        display: flex;
        flex-direction: column; /* makes dropdowns sizing easier */
        /* Align to center by default. */
        align-items: center;
        justify-content: center;

        /* Allow centering when max-width/max-height applies. */
        margin: auto;

        /* The host is not clickable, only the overlay part is. */
        pointer-events: none;

        /* Remove tap highlight on touch devices. */
        -webkit-tap-highlight-color: transparent;

        /* CSS API for host */
        --vaadin-overlay-viewport-bottom: 0;
      }

      :host([hidden]),
      :host(:not([opened]):not([closing])) {
        display: none !important;
      }

      [part="overlay"] {
        -webkit-overflow-scrolling: touch;
        overflow: auto;
        pointer-events: auto;

        /* Prevent overflowing the host in MSIE 11 */
        max-width: 100%;
        box-sizing: border-box;

        -webkit-tap-highlight-color: initial; /* reenable tap highlight inside */
      }

      [part="backdrop"] {
        z-index: -1;
        content: "";
        background: rgba(0, 0, 0, 0.5);
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        pointer-events: auto;
      }
    </style>

    <div id="backdrop" part="backdrop" hidden\$="{{!withBackdrop}}"></div>
    <div part="overlay" id="overlay" tabindex="0">
      <div part="content" id="content">
        <slot></slot>
      </div>
    </div>
`}static get is(){return"vaadin-overlay"}static get properties(){return{opened:{type:Boolean,notify:!0,observer:"_openedChanged",reflectToAttribute:!0},owner:Element,renderer:Function,template:{type:Object,notify:!0},instanceProps:{type:Object},content:{type:Object,notify:!0},withBackdrop:{type:Boolean,value:!1,reflectToAttribute:!0},model:Object,modeless:{type:Boolean,value:!1,reflectToAttribute:!0,observer:"_modelessChanged"},hidden:{type:Boolean,reflectToAttribute:!0,observer:"_hiddenChanged"},focusTrap:{type:Boolean,value:!1},restoreFocusOnClose:{type:Boolean,value:!1},_mouseDownInside:{type:Boolean},_mouseUpInside:{type:Boolean},_instance:{type:Object},_originalContentPart:Object,_contentNodes:Array,_oldOwner:Element,_oldModel:Object,_oldTemplate:Object,_oldInstanceProps:Object,_oldRenderer:Object,_oldOpened:Boolean}}static get observers(){return["_templateOrRendererChanged(template, renderer, owner, model, instanceProps, opened)"]}constructor(){super();this._boundMouseDownListener=this._mouseDownListener.bind(this);this._boundMouseUpListener=this._mouseUpListener.bind(this);this._boundOutsideClickListener=this._outsideClickListener.bind(this);this._boundKeydownListener=this._keydownListener.bind(this);this._observer=new _backendAiConsole.FlattenedNodesObserver(this,info=>{this._setTemplateFromNodes(info.addedNodes)});this._boundIronOverlayCanceledListener=this._ironOverlayCanceled.bind(this);if(/iPad|iPhone|iPod/.test(navigator.userAgent)){this._boundIosResizeListener=()=>this._detectIosNavbar()}}ready(){super.ready();this._observer.flush();this.addEventListener("click",()=>{});this.$.backdrop.addEventListener("click",()=>{})}_detectIosNavbar(){if(!this.opened){return}const innerHeight=window.innerHeight,innerWidth=window.innerWidth,landscape=innerWidth>innerHeight,clientHeight=document.documentElement.clientHeight;if(landscape&&clientHeight>innerHeight){this.style.setProperty("--vaadin-overlay-viewport-bottom",clientHeight-innerHeight+"px")}else{this.style.setProperty("--vaadin-overlay-viewport-bottom","0")}}_setTemplateFromNodes(nodes){this.template=nodes.filter(node=>node.localName&&"template"===node.localName)[0]||this.template}close(sourceEvent){var evt=new CustomEvent("vaadin-overlay-close",{bubbles:!0,cancelable:!0,detail:{sourceEvent:sourceEvent}});this.dispatchEvent(evt);if(!evt.defaultPrevented){this.opened=!1}}connectedCallback(){super.connectedCallback();if(this._boundIosResizeListener){this._detectIosNavbar();window.addEventListener("resize",this._boundIosResizeListener)}}disconnectedCallback(){super.disconnectedCallback();this._boundIosResizeListener&&window.removeEventListener("resize",this._boundIosResizeListener)}_ironOverlayCanceled(event){event.preventDefault()}_mouseDownListener(event){this._mouseDownInside=0<=event.composedPath().indexOf(this.$.overlay)}_mouseUpListener(event){this._mouseUpInside=0<=event.composedPath().indexOf(this.$.overlay)}_outsideClickListener(event){if(-1!==event.composedPath().indexOf(this.$.overlay)||this._mouseDownInside||this._mouseUpInside){this._mouseDownInside=!1;this._mouseUpInside=!1;return}if(!this._last){return}const evt=new CustomEvent("vaadin-overlay-outside-click",{bubbles:!0,cancelable:!0,detail:{sourceEvent:event}});this.dispatchEvent(evt);if(this.opened&&!evt.defaultPrevented){this.close(event)}}_keydownListener(event){if(!this._last){return}if("Tab"===event.key&&this.focusTrap){this._cycleTab(event.shiftKey?-1:1);event.preventDefault()}else if("Escape"===event.key||"Esc"===event.key){const evt=new CustomEvent("vaadin-overlay-escape-press",{bubbles:!0,cancelable:!0,detail:{sourceEvent:event}});this.dispatchEvent(evt);if(this.opened&&!evt.defaultPrevented){this.close(event)}}}_ensureTemplatized(){this._setTemplateFromNodes(Array.from(this.children))}_openedChanged(opened,wasOpened){if(!this._instance){this._ensureTemplatized()}if(opened){this.__restoreFocusNode=this._getActiveElement();this._animatedOpening();(0,_backendAiConsole.afterNextRender)(this,()=>{if(this.focusTrap&&!this.contains(document._activeElement||document.activeElement)){this._cycleTab(0,0)}const evt=new CustomEvent("vaadin-overlay-open",{bubbles:!0});this.dispatchEvent(evt)});if(!this.modeless){this._addGlobalListeners()}}else if(wasOpened){this._animatedClosing();if(!this.modeless){this._removeGlobalListeners()}}}_hiddenChanged(hidden){if(hidden&&this.hasAttribute("closing")){this._flushAnimation("closing")}}_shouldAnimate(){const name=getComputedStyle(this).getPropertyValue("animation-name"),hidden="none"===getComputedStyle(this).getPropertyValue("display");return!hidden&&name&&"none"!=name}_enqueueAnimation(type,callback){const handler=`__${type}Handler`,listener=()=>{callback();this.removeEventListener("animationend",listener);delete this[handler]};this[handler]=listener;this.addEventListener("animationend",listener)}_flushAnimation(type){const handler=`__${type}Handler`;if("function"===typeof this[handler]){this[handler]()}}_animatedOpening(){if(this.parentNode===document.body&&this.hasAttribute("closing")){this._flushAnimation("closing")}this._attachOverlay();this.setAttribute("opening","");const finishOpening=()=>{this.removeAttribute("opening");document.addEventListener("iron-overlay-canceled",this._boundIronOverlayCanceledListener);if(!this.modeless){this._enterModalState()}};if(this._shouldAnimate()){this._enqueueAnimation("opening",finishOpening)}else{finishOpening()}}_attachOverlay(){this._placeholder=document.createComment("vaadin-overlay-placeholder");this.parentNode.insertBefore(this._placeholder,this);document.body.appendChild(this)}_animatedClosing(){if(this.hasAttribute("opening")){this._flushAnimation("opening")}if(this._placeholder){this.setAttribute("closing","");const finishClosing=()=>{this.shadowRoot.querySelector("[part=\"overlay\"]").style.removeProperty("pointer-events");this._exitModalState();document.removeEventListener("iron-overlay-canceled",this._boundIronOverlayCanceledListener);this._detachOverlay();this.removeAttribute("closing");if(this.restoreFocusOnClose&&this.__restoreFocusNode){const activeElement=this._getActiveElement();if(activeElement===document.body||this._deepContains(activeElement)){this.__restoreFocusNode.focus()}this.__restoreFocusNode=null}};if(this._shouldAnimate()){this._enqueueAnimation("closing",finishClosing)}else{finishClosing()}}}_detachOverlay(){this._placeholder.parentNode.insertBefore(this,this._placeholder);this._placeholder.parentNode.removeChild(this._placeholder)}static get __attachedInstances(){return Array.from(document.body.children).filter(el=>el instanceof OverlayElement)}get _last(){return this===OverlayElement.__attachedInstances.pop()}_modelessChanged(modeless){if(!modeless){if(this.opened){this._addGlobalListeners();this._enterModalState()}}else{this._removeGlobalListeners();this._exitModalState()}}_addGlobalListeners(){document.addEventListener("mousedown",this._boundMouseDownListener);document.addEventListener("mouseup",this._boundMouseUpListener);document.documentElement.addEventListener("click",this._boundOutsideClickListener,!0);document.addEventListener("keydown",this._boundKeydownListener)}_enterModalState(){if("none"!==document.body.style.pointerEvents){this._previousDocumentPointerEvents=document.body.style.pointerEvents;document.body.style.pointerEvents="none"}OverlayElement.__attachedInstances.forEach(el=>{if(el!==this){el.shadowRoot.querySelector("[part=\"overlay\"]").style.pointerEvents="none"}})}_removeGlobalListeners(){document.removeEventListener("mousedown",this._boundMouseDownListener);document.removeEventListener("mouseup",this._boundMouseUpListener);document.documentElement.removeEventListener("click",this._boundOutsideClickListener,!0);document.removeEventListener("keydown",this._boundKeydownListener)}_exitModalState(){if(this._previousDocumentPointerEvents!==void 0){document.body.style.pointerEvents=this._previousDocumentPointerEvents;delete this._previousDocumentPointerEvents}const instances=OverlayElement.__attachedInstances;let el;while(el=instances.pop()){if(el===this){continue}el.shadowRoot.querySelector("[part=\"overlay\"]").style.removeProperty("pointer-events");if(!el.modeless){break}}}_removeOldContent(){if(!this.content||!this._contentNodes){return}this._observer.disconnect();this._contentNodes.forEach(node=>{if(node.parentNode===this.content){this.content.removeChild(node)}});if(this._originalContentPart){this.$.content.parentNode.replaceChild(this._originalContentPart,this.$.content);this.$.content=this._originalContentPart;this._originalContentPart=void 0}this._observer.connect();this._contentNodes=void 0;this.content=void 0}_stampOverlayTemplate(template,instanceProps){this._removeOldContent();if(!template._Templatizer){template._Templatizer=(0,_backendAiConsole.templatize)(template,this,{instanceProps:instanceProps,forwardHostProp:function(prop,value){if(this._instance){this._instance.forwardHostProp(prop,value)}}})}this._instance=new template._Templatizer({});this._contentNodes=Array.from(this._instance.root.childNodes);const templateRoot=template._templateRoot||(template._templateRoot=template.getRootNode()),_isScoped=templateRoot!==document;if(_isScoped){if(!this.$.content.shadowRoot){this.$.content.attachShadow({mode:"open"})}let scopeCssText=Array.from(templateRoot.querySelectorAll("style")).reduce((result,style)=>result+style.textContent,"");if(window.ShadyCSS&&!window.ShadyCSS.nativeShadow){const styleInfo=window.ShadyCSS.ScopingShim._styleInfoForNode(templateRoot.host);if(styleInfo){scopeCssText+=styleInfo._getStyleRules().parsedCssText;scopeCssText+="}"}}scopeCssText=scopeCssText.replace(/:host/g,":host-nomatch");if(scopeCssText){if(window.ShadyCSS&&!window.ShadyCSS.nativeShadow){const contentPart=createOverlayContent(scopeCssText);contentPart.id="content";contentPart.setAttribute("part","content");this.$.content.parentNode.replaceChild(contentPart,this.$.content);contentPart.className=this.$.content.className;this._originalContentPart=this.$.content;this.$.content=contentPart}else{const style=document.createElement("style");style.textContent=scopeCssText;this.$.content.shadowRoot.appendChild(style);this._contentNodes.unshift(style)}}this.$.content.shadowRoot.appendChild(this._instance.root);this.content=this.$.content.shadowRoot}else{this.appendChild(this._instance.root);this.content=this}}_removeNewRendererOrTemplate(template,oldTemplate,renderer,oldRenderer){if(template!==oldTemplate){this.template=void 0}else if(renderer!==oldRenderer){this.renderer=void 0}}render(){if(this.renderer){this.renderer.call(this.owner,this.content,this.owner,this.model)}}_templateOrRendererChanged(template,renderer,owner,model,instanceProps,opened){if(template&&renderer){this._removeNewRendererOrTemplate(template,this._oldTemplate,renderer,this._oldRenderer);throw new Error("You should only use either a renderer or a template for overlay content")}const ownerOrModelChanged=this._oldOwner!==owner||this._oldModel!==model;this._oldModel=model;this._oldOwner=owner;const templateOrInstancePropsChanged=this._oldInstanceProps!==instanceProps||this._oldTemplate!==template;this._oldInstanceProps=instanceProps;this._oldTemplate=template;const rendererChanged=this._oldRenderer!==renderer;this._oldRenderer=renderer;const openedChanged=this._oldOpened!==opened;this._oldOpened=opened;if(template&&templateOrInstancePropsChanged){this._stampOverlayTemplate(template,instanceProps)}else if(renderer&&(rendererChanged||openedChanged||ownerOrModelChanged)){this.content=this;if(rendererChanged){while(this.content.firstChild){this.content.removeChild(this.content.firstChild)}}if(opened){this.render()}}}_isFocused(element){return element&&element.getRootNode().activeElement===element}_focusedIndex(elements){elements=elements||this._getFocusableElements();return elements.indexOf(elements.filter(this._isFocused).pop())}_cycleTab(increment,index){const focusableElements=this._getFocusableElements();if(index===void 0){index=this._focusedIndex(focusableElements)}index+=increment;if(index>=focusableElements.length){index=0}else if(0>index){index=focusableElements.length-1}focusableElements[index].focus()}_getFocusableElements(){return FocusablesHelper.getTabbableNodes(this.$.overlay)}_getActiveElement(){let active=document._activeElement||document.activeElement;if(!active||active===document.documentElement||!1===active instanceof Element){active=document.body}while(active.shadowRoot&&active.shadowRoot.activeElement){active=active.shadowRoot.activeElement}return active}_deepContains(node){if(this.contains(node)){return!0}let n=node;const doc=node.ownerDocument;while(n&&n!==doc&&n!==this){n=n.parentNode||n.host}return n===this}}_exports.OverlayElement=OverlayElement;customElements.define(OverlayElement.is,OverlayElement);var vaadinOverlay={OverlayElement:OverlayElement};_exports.$vaadinOverlay=vaadinOverlay;const $_documentContainer=document.createElement("template");$_documentContainer.innerHTML=`<dom-module id="vaadin-dialog-overlay-styles" theme-for="vaadin-dialog-overlay">
  <template>
    <style>
      /*
        NOTE(platosha): Make some min-width to prevent collapsing of the content
        taking the parent width, e. g., <vaadin-grid> and such.
      */
      [part="content"] {
        min-width: 12em; /* matches the default <vaadin-text-field> width */
      }
    </style>
  </template>
</dom-module>`;document.head.appendChild($_documentContainer.content);class DialogOverlayElement extends OverlayElement{static get is(){return"vaadin-dialog-overlay"}}customElements.define(DialogOverlayElement.is,DialogOverlayElement);class DialogElement extends(0,_backendAiConsole.ThemePropertyMixin)((0,_backendAiConsole.ElementMixin)(_backendAiConsole.PolymerElement)){static get template(){return _backendAiConsole.html$2`
    <style>
      :host {
        display: none;
      }
    </style>

    <vaadin-dialog-overlay id="overlay" on-opened-changed="_onOverlayOpened" with-backdrop="" theme\$="[[theme]]" focus-trap="">
    </vaadin-dialog-overlay>
`}static get is(){return"vaadin-dialog"}static get version(){return"2.2.1"}static get properties(){return{opened:{type:Boolean,value:!1,notify:!0},noCloseOnOutsideClick:{type:Boolean,value:!1},noCloseOnEsc:{type:Boolean,value:!1},ariaLabel:{type:String},theme:String,_contentTemplate:Object,renderer:Function,_oldTemplate:Object,_oldRenderer:Object}}static get observers(){return["_openedChanged(opened)","_ariaLabelChanged(ariaLabel)","_templateOrRendererChanged(_contentTemplate, renderer)"]}ready(){super.ready();this.$.overlay.setAttribute("role","dialog");this.$.overlay.addEventListener("vaadin-overlay-outside-click",this._handleOutsideClick.bind(this));this.$.overlay.addEventListener("vaadin-overlay-escape-press",this._handleEscPress.bind(this));this._observer=new _backendAiConsole.FlattenedNodesObserver(this,info=>{this._setTemplateFromNodes(info.addedNodes)})}_setTemplateFromNodes(nodes){this._contentTemplate=nodes.filter(node=>node.localName&&"template"===node.localName)[0]||this._contentTemplate}_removeNewRendererOrTemplate(template,oldTemplate,renderer,oldRenderer){if(template!==oldTemplate){this._contentTemplate=void 0}else if(renderer!==oldRenderer){this.renderer=void 0}}render(){this.$.overlay.render()}_templateOrRendererChanged(template,renderer){if(template&&renderer){this._removeNewRendererOrTemplate(template,this._oldTemplate,renderer,this._oldRenderer);throw new Error("You should only use either a renderer or a template for dialog content")}this._oldTemplate=template;this._oldRenderer=renderer;if(renderer){this.$.overlay.setProperties({owner:this,renderer:renderer})}}disconnectedCallback(){super.disconnectedCallback();this.opened=!1}_openedChanged(opened){if(opened){this.$.overlay.template=this.querySelector("template")}this.$.overlay.opened=opened}_ariaLabelChanged(ariaLabel){if(ariaLabel!==void 0&&null!==ariaLabel){this.$.overlay.setAttribute("aria-label",ariaLabel)}else{this.$.overlay.removeAttribute("aria-label")}}_onOverlayOpened(e){if(!1===e.detail.value){this.opened=!1}}_handleOutsideClick(e){if(this.noCloseOnOutsideClick){e.preventDefault()}}_handleEscPress(e){if(this.noCloseOnEsc){e.preventDefault()}}}_exports.DialogElement=DialogElement;customElements.define(DialogElement.is,DialogElement);var vaadinDialog={DialogElement:DialogElement};_exports.$vaadinDialog=vaadinDialog;const $_documentContainer$1=document.createElement("template");$_documentContainer$1.innerHTML=`<dom-module id="lumo-overlay">
  <template>
    <style>
      :host {
        top: var(--lumo-space-m);
        right: var(--lumo-space-m);
        bottom: var(--lumo-space-m);
        left: var(--lumo-space-m);
        /* Workaround for Edge issue (only on Surface), where an overflowing vaadin-list-box inside vaadin-select-overlay makes the overlay transparent */
        /* stylelint-disable-next-line */
        outline: 0px solid transparent;
      }

      [part="overlay"] {
        background-color: var(--lumo-base-color);
        background-image: linear-gradient(var(--lumo-tint-5pct), var(--lumo-tint-5pct));
        border-radius: var(--lumo-border-radius-m);
        box-shadow: 0 0 0 1px var(--lumo-shade-5pct), var(--lumo-box-shadow-m);
        color: var(--lumo-body-text-color);
        font-family: var(--lumo-font-family);
        font-size: var(--lumo-font-size-m);
        font-weight: 400;
        line-height: var(--lumo-line-height-m);
        letter-spacing: 0;
        text-transform: none;
        -webkit-text-size-adjust: 100%;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      [part="content"] {
        padding: var(--lumo-space-xs);
      }

      [part="backdrop"] {
        background-color: var(--lumo-shade-20pct);
        animation: 0.2s lumo-overlay-backdrop-enter both;
        will-change: opacity;
      }

      @keyframes lumo-overlay-backdrop-enter {
        0% {
          opacity: 0;
        }
      }

      :host([closing]) [part="backdrop"] {
        animation: 0.2s lumo-overlay-backdrop-exit both;
      }

      @keyframes lumo-overlay-backdrop-exit {
        100% {
          opacity: 0;
        }
      }

      @keyframes lumo-overlay-dummy-animation {
        0% { opacity: 1; }
        100% { opacity: 1; }
      }
    </style>
  </template>
</dom-module>`;document.head.appendChild($_documentContainer$1.content);const $_documentContainer$2=_backendAiConsole.html$2`<dom-module id="lumo-dialog" theme-for="vaadin-dialog-overlay">
  <template>
    <style include="lumo-overlay">
      /* Optical centering */
      :host::before,
      :host::after {
        content: "";
        flex-basis: 0;
        flex-grow: 1;
      }

      :host::after {
        flex-grow: 1.1;
      }

      [part="overlay"] {
        box-shadow: 0 0 0 1px var(--lumo-shade-5pct), var(--lumo-box-shadow-xl);
        background-image: none;
        outline: none;
        -webkit-tap-highlight-color: transparent;
      }

      [part="content"] {
        padding: var(--lumo-space-l);
      }

      /* Animations */

      :host([opening]),
      :host([closing]) {
        animation: 0.25s lumo-overlay-dummy-animation;
      }

      :host([opening]) [part="overlay"] {
        animation: 0.12s 0.05s vaadin-dialog-enter cubic-bezier(.215, .61, .355, 1) both;
      }

      @keyframes vaadin-dialog-enter {
        0% {
          opacity: 0;
          transform: scale(0.95);
        }
      }

      :host([closing]) [part="overlay"] {
        animation: 0.1s 0.03s vaadin-dialog-exit cubic-bezier(.55, .055, .675, .19) both;
      }

      :host([closing]) [part="backdrop"] {
        animation-delay: 0.05s;
      }

      @keyframes vaadin-dialog-exit {
        100% {
          opacity: 0;
          transform: scale(1.02);
        }
      }
    </style>
  </template>
</dom-module>`;document.head.appendChild($_documentContainer$2.content);class BackendAIIndicator extends _backendAiConsole.PolymerElement{static get is(){return"backend-ai-indicator"}static get properties(){return{value:{type:Number,value:0},text:{type:String,default:""}}}ready(){super.ready()}connectedCallback(){super.connectedCallback();(0,_backendAiConsole.afterNextRender)(this,function(){})}start(){this.value=0;this.text="Initializing...";this.$["app-progress-dialog"].open()}set(value,text=""){this.value=value;this.text=text}end(){this.$["app-progress-dialog"].close()}static get template(){return _backendAiConsole.html`
      <paper-dialog id="app-progress-dialog">
        <div id="app-progress-text">[[text]]</div>
        <paper-progress id="app-progress" value="[[value]]"></paper-progress>
      </paper-dialog>
    `}}customElements.define(BackendAIIndicator.is,BackendAIIndicator);class BackendAIJobList extends _backendAiConsole.PolymerElement{static get is(){return"backend-ai-job-list"}static get properties(){return{active:{type:Boolean,value:!1},condition:{type:String,default:"running"},jobs:{type:Object,value:{}},compute_sessions:{type:Object,value:{}},terminationQueue:{type:Array,value:[]}}}ready(){super.ready()}connectedCallback(){super.connectedCallback();(0,_backendAiConsole.afterNextRender)(this,function(){})}shouldUpdate(){return this.active}static get observers(){return["_menuChanged(active)"]}_menuChanged(active){if(!active){return}if(window.backendaiclient==void 0||null==window.backendaiclient){document.addEventListener("backend-ai-connected",()=>{this._refreshJobData()},!0)}else{this._refreshJobData()}}refreshList(){return this._refreshJobData()}_refreshJobData(){if(!0!==this.active){return}let status="RUNNING";switch(this.condition){case"running":status="RUNNING";break;case"finished":status="TERMINATED";break;case"archived":default:status="RUNNING";}let fields=["sess_id","lang","created_at","terminated_at","status","occupied_slots","cpu_used","io_read_bytes","io_write_bytes"];window.backendaiclient.computeSession.list(fields,status).then(response=>{var sessions=response.compute_sessions;if(sessions!==void 0&&0!=sessions.length){Object.keys(sessions).map((objectKey,index)=>{var session=sessions[objectKey],occupied_slots=JSON.parse(session.occupied_slots);const kernelImage=sessions[objectKey].lang.split("/")[2];sessions[objectKey].cpu_slot=parseInt(occupied_slots.cpu);sessions[objectKey].mem_slot=parseFloat(window.backendaiclient.utils.changeBinaryUnit(occupied_slots.mem,"g"));if("cuda.device"in occupied_slots){sessions[objectKey].gpu_slot=parseInt(occupied_slots["cuda.device"])}if("cuda.shares"in occupied_slots){sessions[objectKey].vgpu_slot=parseFloat(occupied_slots["cuda.shares"])}sessions[objectKey].kernel_image=kernelImage})}this.compute_sessions=sessions;let refreshTime;if(!0===this.active){if("running"===this.condition){refreshTime=5e3;setTimeout(()=>{this._refreshJobData(status)},refreshTime)}else{refreshTime=15e3}}}).catch(err=>{console.log(err);if(err&&err.message){this.$.notification.text=err.message;this.$.notification.show()}})}_startProgressDialog(){this.$["app-progress"].value=0;this.$["app-progress-text"].textContent="Initializing...";this.$["app-progress-dialog"].open()}_setProgressDialog(value,text=""){this.$["app-progress-text"].textContent=text;this.$["app-progress"].value=value}_endProgressDialog(){this.$["app-progress-dialog"].close()}_isRunning(){return"running"===this.condition}_humanReadableTime(d){var d=new Date(d);return d.toUTCString()}_isAppRunning(lang){if("running"!=this.condition)return!1;let support_kernels=["python","python-tensorflow","python-pytorch","ngc-digits","ngc-tensorflow","ngc-pytorch","julia","r"];lang=lang.split("/")[2].split(":")[0];return"running"===this.condition&&support_kernels.includes(lang)}_byteToMB(value){return _Mathfloor(value/1e6)}_byteToGB(value){return _Mathfloor(value/1e9)}_MBToGB(value){return value/1024}_msecToSec(value){return(+(value/1e3)).toFixed(2)}_elapsed(start,end){return window.backendaiclient.utils.elapsedTime(start,end)}_indexFrom1(index){return index+1}_terminateKernel(e){const termButton=e.target,controls=e.target.closest("#controls"),kernelId=controls.kernelId;if(this.terminationQueue.includes(kernelId)){this.$.notification.text="Already terminating the session.";this.$.notification.show();return!1}this.$.notification.text="Terminating session...";this.$.notification.show();this.terminationQueue.push(kernelId);this._terminateApp(kernelId).then(()=>{window.backendaiclient.destroyKernel(kernelId).then(req=>{setTimeout(()=>{this.terminationQueue=[];this.refreshList()},1e3)}).catch(err=>{this.$.notification.text="Problem occurred during termination.";this.$.notification.show()})}).catch(err=>{console.log(err);if(err&&err.message){this.$.notification.text=err.message;this.$.notification.show()}})}_open_wsproxy(){var _this=this;return babelHelpers.asyncToGenerator(function*(){if(window.backendaiclient==void 0||null==window.backendaiclient){return!1}let param={access_key:window.backendaiclient._config.accessKey,secret_key:window.backendaiclient._config.secretKey,endpoint:window.backendaiclient._config.endpoint},rqst={method:"PUT",body:JSON.stringify(param),headers:{Accept:"application/json","Content-Type":"application/json"},uri:window.backendaiclient.proxyURL+"conf"};return _this.sendRequest(rqst)})()}sendRequest(rqst){return babelHelpers.asyncToGenerator(function*(){let resp,body;try{if("GET"==rqst.method){rqst.body=void 0}resp=yield fetch(rqst.uri,rqst);let contentType=resp.headers.get("Content-Type");if(contentType.startsWith("application/json")||contentType.startsWith("application/problem+json")){body=yield resp.json()}else if(contentType.startsWith("text/")){body=yield resp.text()}else{if(resp.blob===void 0)body=yield resp.buffer();else body=yield resp.blob()}if(!resp.ok){throw body}}catch(e){console.log(e)}return body})()}_terminateApp(kernelId){let accessKey=window.backendaiclient._config.accessKey,rqst={method:"GET",uri:window.backendaiclient.proxyURL+"proxy/"+accessKey+"/"+kernelId};return this.sendRequest(rqst).then(response=>{let accessKey=window.backendaiclient._config.accessKey;if(404!==response.code){let rqst={method:"GET",uri:window.backendaiclient.proxyURL+"proxy/"+accessKey+"/"+kernelId+"/delete"};return this.sendRequest(rqst)}}).catch(err=>{console.log(err);if(err&&err.message){this.$.notification.text=err.message;this.$.notification.show()}})}_runJupyter(e){const termButton=e.target,controls=e.target.closest("#controls"),kernelId=controls.kernelId;if(window.backendaiwsproxy==void 0||null==window.backendaiwsproxy){this.$.indicator.start();this._open_wsproxy().then(response=>{this.$.indicator.set(40,"Preparing connection...");let accessKey=window.backendaiclient._config.accessKey,rqst={method:"GET",uri:window.backendaiclient.proxyURL+"proxy/"+accessKey+"/"+kernelId};return this.sendRequest(rqst)}).then(response=>{this.$.indicator.set(80,"Adding kernel to socket queue...");let accessKey=window.backendaiclient._config.accessKey,rqst={method:"GET",uri:window.backendaiclient.proxyURL+"proxy/"+accessKey+"/"+kernelId+"/add"};return this.sendRequest(rqst)}).then(response=>{if(response.proxy){console.log("http://"+response.proxy+"/tree");this.$.indicator.set(100,"Prepared.");setTimeout(()=>{window.open("http://"+response.proxy+"/tree","_blank");this.$.indicator.end()},1e3)}});console.log("Jupyter proxy loaded: ");console.log(kernelId)}}_runJupyterTerminal(e){const termButton=e.target,controls=e.target.closest("#controls"),kernelId=controls.kernelId;let accessKey=window.backendaiclient._config.accessKey;if(window.backendaiwsproxy==void 0||null==window.backendaiwsproxy){this.$.indicator.start();this._open_wsproxy().then(response=>{this.$.indicator.set(40,"Preparing connection...");let rqst={method:"GET",uri:window.backendaiclient.proxyURL+"proxy/"+accessKey+"/"+kernelId};return this.sendRequest(rqst)}).then(response=>{this.$.indicator.set(80,"Adding kernel to socket queue...");let rqst={method:"GET",uri:window.backendaiclient.proxyURL+"proxy/"+accessKey+"/"+kernelId+"/add"};return this.sendRequest(rqst)}).then(response=>{if(response.proxy){console.log("http://"+response.proxy+"/terminals/1");this.$.indicator.set(100,"Prepared.");setTimeout(()=>{this.$.indicator.end();window.open("http://"+response.proxy+"/terminals/1","_blank")},1e3)}});console.log("Jupyter proxy loaded: ");console.log(kernelId)}}static get template(){return _backendAiConsole.html`
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
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Job list" items="[[compute_sessions]]">
        <vaadin-grid-column width="40px" flex-grow="0" resizable>
          <template class="header">#</template>
          <template>[[_indexFrom1(index)]]</template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">Job ID</template>
          <template>
            <div class="indicator">[[item.sess_id]]</div>
            <div class="indicator">([[item.kernel_image]])</div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">
            <vaadin-grid-sorter path="created_at">Starts</vaadin-grid-sorter>
          </template>
          <template>
            <div class="layout vertical">
              <span>[[_humanReadableTime(item.created_at)]]</span>
            </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column width="100px" flex-grow="0" resizable>
          <template class="header">
            Reservation
          </template>
          <template>
            <div class="layout vertical">
              <span>[[_elapsed(item.created_at, item.terminated_at)]]</span>
            </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column width="150px" flex-grow="0" resizable>
          <template class="header">Configuration</template>
          <template>
            <div class="layout horizontal center flex">
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="hardware:developer-board"></iron-icon>
                <span>[[item.cpu_slot]]</span>
                <span class="indicator">core</span>
              </div>
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="hardware:memory"></iron-icon>
                <span>[[item.mem_slot]]</span>
                <span class="indicator">GB</span>
              </div>
            </div>
            <div class="layout horizontal center flex">
              <div class="layout horizontal configuration">
                <template is="dom-if" if="[[item.gpu_slot]]">
                  <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                  <span>[[item.gpu_slot]]</span>
                  <span class="indicator">GPU</span>
                </template>
                <template is="dom-if" if="[[!item.gpu_slot]]">
                  <template is="dom-if" if="[[item.vgpu_slot]]">
                    <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                    <span>[[item.vgpu_slot]]</span>
                    <span class="indicator">vGPU</span>
                  </template>
                </template>
                <template is="dom-if" if="[[!item.gpu_slot]]">
                  <template is="dom-if" if="[[!item.vgpu_slot]]">
                    <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                    <span>-</span>
                    <span class="indicator">GPU</span>
                  </template>
                </template>
              </div>
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="icons:cloud-queue"></iron-icon>
                <!-- <iron-icon class="fg yellow" icon="device:storage"></iron-icon> -->
                <!-- <span>[[item.storage_capacity]]</span> -->
                <!-- <span class="indicator">[[item.storage_unit]]</span> -->
              </div>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column width="100px" flex-grow="0" resizable>
          <template class="header">Usage</template>
          <template>
            <div class="layout horizontal center flex">
              <iron-icon class="fg blue" icon="hardware:developer-board"></iron-icon>
              <div class="vertical start layout">
                <span>[[_msecToSec(item.cpu_used)]]</span>
                <span class="indicator">sec.</span>
              </div>
              <iron-icon class="fg blue" icon="hardware:device-hub"></iron-icon>
              <div class="vertical start layout">
                <span style="font-size:8px">[[_byteToMB(item.io_read_bytes)]]<span class="indicator">MB</span></span>
                <span style="font-size:8px">[[_byteToMB(item.io_write_bytes)]]<span class="indicator">MB</span></span>
              </div>
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
              <template is="dom-if" if="[[_isAppRunning(item.lang)]]">
                <paper-icon-button class="fg controls-running orange"
                                   on-tap="_runJupyter" icon="vaadin:notebook"></paper-icon-button>
                <paper-icon-button class="fg controls-running"
                                   on-tap="_runJupyterTerminal" icon="vaadin:terminal"></paper-icon-button>
              </template>
              <template is="dom-if" if="[[_isRunning()]]">
                <paper-icon-button disabled class="fg controls-running"
                                   icon="av:pause"></paper-icon-button>
                <paper-icon-button class="fg red controls-running"
                                   on-tap="_terminateKernel" icon="delete"></paper-icon-button>
              </template>
            </div>
          </template>
        </vaadin-grid-column>
      </vaadin-grid>
      <backend-ai-indicator id="indicator"></backend-ai-indicator>
    `}}customElements.define(BackendAIJobList.is,BackendAIJobList);class BackendAIDropdownMenu extends _backendAiConsole.PolymerElement{static get is(){return"backend-ai-dropdown-menu"}ready(){super.ready()}constructor(){super();(0,_backendAiConsole.setPassiveTouchGestures)(!0)}static get properties(){return{alwaysFloatLabel:{type:Boolean},label:{type:String},placeholder:{type:String},value:{type:String,computed:"_computeInputValue(selectedItems)",notify:!0},readonly:{type:Boolean,value:!1},invalid:{type:Boolean,notify:!0,value:!1},errorMessage:{type:String,notify:!0,value:""},noLabelFloat:{type:Boolean,value:!1},attrForSelected:{type:String},multi:{type:Boolean},selected:{type:String,notify:!0},selectedItem:{type:Object,notify:!0},selectedItems:{type:Array,notify:!0},selectedValues:{type:Array,notify:!0},horizontalAlign:{type:String,value:"right"},horizontalOffset:{type:Number},verticalAlign:{type:String,value:"top"},verticalOffset:{type:Number},closeOnActivate:{type:Boolean,value:!1}}}select(){this.$.listbox.select()}selectIndex(){this.$.listbox.selectIndex()}selectNext(){this.$.listbox.selectNext()}selectPrevious(){this.$.listbox.selectPrevious()}open(){if(!this.readonly){this.$.dropdown.open()}}close(){this.$.dropdown.close()}_onIronActivate(event){if(this.closeOnActivate){this.close()}}_computeInputValue(selectedItems){for(var selectedLabels=[],i=0,label;i<selectedItems.length;i++){label=selectedItems[i].label||selectedItems[i].getAttribute("label")||selectedItems[i].textContent.trim();selectedLabels.push(label)}return selectedLabels.join(", ")}static get template(){return _backendAiConsole.html`
      <style>
        :host {
          display: block;
        }

        paper-input iron-icon {
          color: var(--secondary-text-color);
        }

        :host([readonly]) paper-input iron-icon {
          color: var(--disabled-text-color);
        }

        paper-listbox {
          @apply --shadow-elevation-2dp;
          position: relative;
          border-radius: 2px;
          background-color: var(--primary-background-color);
        }
      </style>

      <paper-input
        id="input"
        always-float-label="[[ alwaysFloatLabel ]]"
        label="[[ label ]]"
        no-label-float="[[ noLabelFloat ]]"
        placeholder="[[ placeholder ]]"
        value="[[ value ]]"
        on-tap="open"
        on-click="open"
        invalid="[[ invalid ]]"
        error-message="[[ errorMessage ]]"
        no-label-float="[[noLabelFloat]]"
        readonly>
        <iron-icon icon="arrow-drop-down" slot="suffix"></iron-icon>
      </paper-input>

      <iron-dropdown
        id="dropdown"
        horizontal-align="[[ horizontalAlign ]]"
        horizontal-offset="[[ horizontalOffset ]]"
        vertical-align="[[ verticalAlign ]]"
        vertical-offset="[[ verticalOffset ]]">

        <paper-listbox
          id="listbox"
          slot="dropdown-content"
          attr-for-selected="[[ attrForSelected ]]"
          multi="[[ multi ]]"
          selected="{{ selected }}"
          selected-item="{{ selectedItem }}"
          selected-items="{{ selectedItems }}"
          selected-values="{{ selectedValues }}"
          on-iron-activate="_onIronActivate">

          <slot></slot>

        </paper-listbox>
      </iron-dropdown>
    `}}customElements.define(BackendAIDropdownMenu.is,BackendAIDropdownMenu);class BackendAIJobView extends(0,_backendAiConsole.OverlayPatchMixin)(_backendAiConsole.PolymerElement){static get is(){return"backend-ai-job-view"}constructor(){super();(0,_backendAiConsole.setPassiveTouchGestures)(!0)}static get properties(){return{active:{type:Boolean,value:!1},supports:{type:Object,value:{}},resourceLimits:{type:Object,value:{}},aliases:{type:Object,value:{TensorFlow:"python-tensorflow",Python:"python",PyTorch:"python-pytorch",Chainer:"chainer",R:"r",Julia:"julia",Lua:"lua"}},versions:{type:Array,value:["3.6"]},languages:{type:Array,value:[]},gpu_mode:{type:String,value:"gpu"},gpu_step:{type:Number,value:.1},cpu_metric:{type:Object,value:{min:"1",max:"1"}},mem_metric:{type:Object,value:{min:"1",max:"1"}},gpu_metric:{type:Object,value:{min:"0",max:"0"}},tpu_metric:{type:Object,value:{min:"1",max:"1"}},images:{type:Object,value:{}}}}ready(){super.ready();this.$["launch-session"].addEventListener("tap",this._launchSessionDialog.bind(this));this.$["launch-button"].addEventListener("tap",this._newSession.bind(this));this.$.environment.addEventListener("selected-item-label-changed",this.updateLanguage.bind(this));this.$.version.addEventListener("selected-item-label-changed",this.updateMetric.bind(this));this._initAliases();document.addEventListener("backend-ai-connected",()=>{},!0);var gpu_resource=this.$["gpu-resource"];this.$["gpu-value"].textContent=gpu_resource.value;gpu_resource.addEventListener("value-change",()=>{this.$["gpu-value"].textContent=gpu_resource.value;if(0<gpu_resource.value){this.$["use-gpu-checkbox"].checked=!0}else{this.$["use-gpu-checkbox"].checked=!1}});this.$["use-gpu-checkbox"].addEventListener("change",()=>{if(!0===this.$["use-gpu-checkbox"].checked){this.$["gpu-resource"].disabled=!1}else{this.$["gpu-resource"].disabled=!0}})}_initAliases(){for(let item in this.aliases){this.aliases[this.aliases[item]]=item}}connectedCallback(){super.connectedCallback();(0,_backendAiConsole.afterNextRender)(this,function(){})}shouldUpdate(){return this.active}static get observers(){return["_routeChanged(route.*)","_viewChanged(routeData.view)","_menuChanged(active)"]}_menuChanged(active){if(!active){this.$["running-jobs"].active=!1;this.$["finished-jobs"].active=!1;return}this._refreshResourcePolicy();this.$["running-jobs"].active=!0;this.$["finished-jobs"].active=!0;if(window.backendaiclient==void 0||null==window.backendaiclient){document.addEventListener("backend-ai-connected",()=>{this._refreshResourceValues()},!0)}else{this._refreshResourceValues()}}_refreshResourcePolicy(){window.backendaiclient.keypair.info(window.backendaiclient._config.accessKey,["resource_policy"]).then(response=>{let policyName=response.keypair.resource_policy;return window.backendaiclient.resourcePolicy.get(policyName,["default_for_unspecified","total_resource_slots","max_concurrent_sessions","max_containers_per_session"])}).then(response=>{let resource_policy=response.keypair_resource_policy;if("UNLIMITED"===resource_policy.default_for_unspecified){}})}_refreshResourceValues(){this._refreshImageList();this._updateGPUMode();this._updateVirtualFolderList();this.updateMetric();var cpu_resource=this.$["cpu-resource"];this.$["cpu-value"].textContent=cpu_resource.value;cpu_resource.addEventListener("value-change",()=>{this.$["cpu-value"].textContent=cpu_resource.value});var ram_resource=this.$["ram-resource"];this.$["ram-value"].textContent=ram_resource.value;ram_resource.addEventListener("value-change",()=>{this.$["ram-value"].textContent=ram_resource.value});var gpu_resource=this.$["gpu-resource"];this.$["gpu-value"].textContent=gpu_resource.value}_launchSessionDialog(){var gpu_resource=this.$["gpu-resource"];this.$["gpu-value"].textContent=gpu_resource.value;if(0<gpu_resource.value){this.$["use-gpu-checkbox"].checked=!0}else{this.$["use-gpu-checkbox"].checked=!1}this.$["new-session-dialog"].open()}_updateGPUMode(){window.backendaiclient.getResourceSlots().then(response=>{let results=response;if("cuda.device"in results){this.gpu_mode="gpu";this.gpu_step=1}if("cuda.shares"in results){this.gpu_mode="vgpu";this.gpu_step=.1}})}_generateKernelIndex(kernel,version){if(kernel in this.aliases){return this.aliases[kernel]+":"+version}return kernel+":"+version}_newSession(){let kernel=this.$.environment.value,version=this.$.version.value,sessionName=this.$["session-name"].value,vfolder=this.$.vfolder.selectedValues,config={};config.cpu=this.$["cpu-resource"].value;if("vgpu"==this.gpu_mode){config.vgpu=this.$["gpu-resource"].value}else{config.gpu=this.$["gpu-resource"].value}config.mem=this.$["ram-resource"].value+""+"g";if(!0!==this.$["use-gpu-checkbox"].checked){if("vgpu"==this.gpu_mode){config.vgpu=0}else{config.gpu=0}}if(4>sessionName.length){sessionName=void 0}if(0!==vfolder.length){config.mounts=vfolder}const kernelName=this._generateKernelIndex(kernel,version);this.$["launch-button"].disabled=!0;this.$["launch-button-msg"].textContent="Preparing...";this.$.notification.text="Preparing session...";this.$.notification.show();window.backendaiclient.createKernel(kernelName,sessionName,config).then(req=>{this.$["running-jobs"].refreshList();this.$["new-session-dialog"].close();this.$["launch-button"].disabled=!1;this.$["launch-button-msg"].textContent="Launch"}).catch(err=>{console.log(err);if(err&&err.message){this.$.notification.text=err.message;this.$.notification.show()}else if(err&&err.title){this.$.notification.text=err.title;this.$.notification.show()}this.$["launch-button"].disabled=!1;this.$["launch-button-msg"].textContent="Launch"})}_guessHumanizedNames(kernelName){const candidate={cpp:"C++",gcc:"C",go:"Go",haskell:"Haskell",java:"Java",julia:"Julia",lua:"Lua","ngc-digits":"DIGITS (NGC)","ngc-pytorch":"PyTorch (NGC)","ngc-tensorflow":"TensorFlow (NGC)",nodejs:"Node.js",octave:"Octave",php:"PHP",python:"Python","python-cntk":"CNTK","python-pytorch":"PyTorch","python-tensorflow":"TensorFlow","r-base":"R",rust:"Rust",scala:"Scala",scheme:"Scheme"};let humanizedName=null,matchedString="abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()";Object.keys(candidate).forEach((item,index)=>{if(kernelName.endsWith(item)&&item.length<matchedString.length){humanizedName=candidate[item];matchedString=item}});return humanizedName}_updateEnvironment(){const langs=Object.keys(this.supports);if(langs===void 0)return;langs.sort();this.languages=[];langs.forEach((item,index)=>{if(!Object.keys(this.aliases).includes(item)){const humanizedName=this._guessHumanizedNames(item);if(null!==humanizedName){this.aliases[item]=humanizedName}}const alias=this.aliases[item];if(alias!==void 0){this.languages.push({name:item,alias:alias})}});this._initAliases()}_updateVersions(lang){if(this.aliases[lang]in this.supports){this.versions=this.supports[this.aliases[lang]];this.versions=this.versions.sort()}if(this.versions!==void 0){this.$.version.value=this.versions[0];this.updateMetric()}}_updateVirtualFolderList(){let l=window.backendaiclient.vfolder.list();l.then(value=>{this.vfolders=value})}_supportLanguages(){return Object.keys(this.supports)}_supportVersions(){let lang=this.$.environment.value;return this.supports[lang]}updateMetric(){if(this.$.environment.value in this.aliases){let currentLang=this.aliases[this.$.environment.value],currentVersion=this.$.version.value,kernelName=currentLang+":"+currentVersion,currentResource=this.resourceLimits[kernelName];if(!currentResource)return;currentResource.forEach(item=>{if("cpu"===item.key){let cpu_metric=item;cpu_metric.min=parseInt(cpu_metric.min);cpu_metric.max=parseInt(cpu_metric.max);if(cpu_metric.min>cpu_metric.max){}this.cpu_metric=cpu_metric}if("cuda.device"===item.key){let gpu_metric=item;gpu_metric.min=parseInt(gpu_metric.min);gpu_metric.max=parseInt(gpu_metric.max);if(gpu_metric.min>gpu_metric.max){}this.gpu_metric=gpu_metric}if("cuda.shares"===item.key){let vgpu_metric=item;vgpu_metric.min=parseInt(vgpu_metric.min);vgpu_metric.max=parseInt(vgpu_metric.max);if(vgpu_metric.min>vgpu_metric.max){}this.vgpu_metric=vgpu_metric;if(0<vgpu_metric.max){this.gpu_metric=vgpu_metric}}if("tpu"===item.key){let tpu_metric=item;tpu_metric.min=parseInt(tpu_metric.min);tpu_metric.max=parseInt(tpu_metric.max);if(tpu_metric.min>tpu_metric.max){}this.tpu_metric=tpu_metric}if("mem"===item.key){let mem_metric=item;mem_metric.min=window.window.backendaiclient.utils.changeBinaryUnit(mem_metric.min,"g","g");mem_metric.max=window.window.backendaiclient.utils.changeBinaryUnit(mem_metric.max,"g","g");if(mem_metric.min>mem_metric.max){}this.mem_metric=mem_metric}});if({}===this.gpu_metric){this.gpu_metric={min:0,max:0};this.$["use-gpu-checkbox"].checked=!1;this.$["gpu-resource"].disabled=!0;this.$["gpu-resource"].value=0}else{this.$["use-gpu-checkbox"].checked=!0;this.$["gpu-resource"].disabled=!1;this.$["gpu-resource"].value=this.gpu_metric.max}this.$["gpu-value"].textContent=this.$["gpu-resource"].value}}updateLanguage(){this._updateVersions(this.$.environment.selectedItemLabel)}_refreshImageList(){const fields=["name","humanized_name","tag","registry","digest","installed","resource_limits { key min max }"];window.backendaiclient.image.list(fields).then(response=>{const images=[];Object.keys(response.images).map((objectKey,index)=>{const item=response.images[objectKey];if(!0===item.installed){images.push(item)}});if(0===images.length){return}this.images=images;this.supports={};Object.keys(this.images).map((objectKey,index)=>{const item=this.images[objectKey],supportsKey=`${item.registry}/${item.name}`;if(!(supportsKey in this.supports)){this.supports[supportsKey]=[]}this.supports[supportsKey].push(item.tag);this.resourceLimits[`${supportsKey}:${item.tag}`]=item.resource_limits});this._updateEnvironment()}).catch(err=>{if(err&&err.message){this.$.notification.text=err.message;this.$.notification.show()}})}changed(e){console.log(e)}static get template(){return _backendAiConsole.html`
      <style is="custom-style" include="backend-ai-styles iron-flex iron-flex-alignment iron-positioning">
        paper-button.launch-button {
          width: 100%;
        }

        paper-material h4 {
          padding: 5px 20px;
          border-bottom: 1px solid #ddd;
          font-weight: 100;
        }

        span.caption {
          width: 30px;
          padding-left: 10px;
        }

        div.caption {
          width: 100px;
        }

        .indicator {
          font-family: monospace;
        }

        backend-ai-dropdown-menu {
          width: 100%;
        }
      </style>
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>
      <paper-material class="item" elevation="1">
        <h4 class="horizontal center layout">
          <span>Running</span>
          <mwc-button class="fg red" id="launch-session" outlined label="Launch" icon="add"></mwc-button>
        </h4>
        <div>
          <backend-ai-job-list id="running-jobs" condition="running"></backend-ai-job-list>
        </div>
        <h4>Finished</h4>
        <div>
          <backend-ai-job-list id="finished-jobs" condition="finished"></backend-ai-job-list>
        </div>
      </paper-material>
      <paper-dialog id="new-session-dialog" with-backdrop
                    entry-animation="scale-up-animation" exit-animation="fade-out-animation"
                    style="padding:0;">
        <paper-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Start a new session</span>
            <div class="flex"></div>
            <paper-icon-button icon="close" class="blue close-button" dialog-dismiss>
              Close
            </paper-icon-button>
          </h3>
          <form id="launch-session-form" onSubmit="this._launchSession()">
            <fieldset>
              <div class="horizontal center layout">
                <paper-dropdown-menu id="environment" label="Environments">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="[[ languages ]]">
                      <paper-item id="[[ item.name ]]" label="[[ item.alias ]]">[[ item.alias ]]</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="version" label="Version">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="[[ versions ]]">
                      <paper-item id="[[ item ]]" label="[[ item ]]">[[ item ]]</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
              <div>
                <paper-checkbox id="use-gpu-checkbox">Use GPU</paper-checkbox>
              </div>
              <div class="layout vertical">
                <paper-input id="session-name" label="Session name (optional)"
                             value="" pattern="[a-zA-Z0-9_-]{4,}" auto-validate
                             error-message="4 or more characters">
                </paper-input>
                <backend-ai-dropdown-menu id="vfolder" multi attr-for-selected="value" label="Virtual folders">
                  <template is="dom-repeat" items="[[ vfolders ]]">
                    <paper-item value$="[[ item.name ]]">[[ item.name ]]</paper-item>
                  </template>
                </backend-ai-dropdown-menu>
              </div>
            </fieldset>
            <h4>Resource allocation</h4>
            <fieldset>
              <div class="horizontal center layout">
                <span>CPU</span>
                <div class="horizontal end-justified layout caption">
                  <span class="indicator" id="cpu-value"></span>
                  <span class="caption">Core</span>
                </div>
                <paper-slider id="cpu-resource" pin snaps expand
                              min="[[ cpu_metric.min ]]" max="[[ cpu_metric.max ]]"
                              value="[[ cpu_metric.max ]]"></paper-slider>
              </div>
              <div class="horizontal center layout">
                <span>RAM</span>
                <div class="horizontal end-justified layout caption">
                  <span class="indicator" id="ram-value"></span>
                  <span class="caption">GB</span>
                </div>
                <paper-slider id="ram-resource" pin snaps step=0.1
                              min="[[ mem_metric.min ]]" max="[[ mem_metric.max ]]"
                              value="[[ mem_metric.max ]]"></paper-slider>
              </div>
              <div class="horizontal center layout">
                <span>GPU</span>
                <div class="horizontal end-justified layout caption">
                  <span class="indicator" id="gpu-value"></span>
                  <span class="caption">GPU</span>
                </div>
                <paper-slider id="gpu-resource" pin snaps step="[[gpu_step]]"
                              min="0" max="[[gpu_metric.max]]" value="1"></paper-slider>
              </div>
              <br/>
              <paper-button class="blue launch-button" type="submit" id="launch-button">
                <iron-icon icon="rowing"></iron-icon>
                <span id="launch-button-msg">Launch</span>
              </paper-button>
            </fieldset>
          </form>
        </paper-material>
      </paper-dialog>
    `}}customElements.define(BackendAIJobView.is,BackendAIJobView)});