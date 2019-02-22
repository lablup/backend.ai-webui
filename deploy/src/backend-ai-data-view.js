define(["exports","./components/backend-ai-console.js"],function(_exports,_backendAiConsole){"use strict";Object.defineProperty(_exports,"__esModule",{value:!0});_exports.UploadElement=_exports.UploadFileElement=_exports.ButtonElement=_exports.$vaadinUpload=_exports.$vaadinUploadFile=_exports.$vaadinButton=void 0;var _Mathfloor=Math.floor;(0,_backendAiConsole.Polymer)({is:"slide-from-right-animation",behaviors:[_backendAiConsole.NeonAnimationBehavior],configure:function(config){var node=config.node;this._effect=new KeyframeEffect(node,[{transform:"translateX(100%)"},{transform:"none"}],this.timingFromConfig(config));if(config.transformOrigin){this.setPrefixedProperty(node,"transformOrigin",config.transformOrigin)}else{this.setPrefixedProperty(node,"transformOrigin","0 50%")}return this._effect}});(0,_backendAiConsole.Polymer)({is:"slide-right-animation",behaviors:[_backendAiConsole.NeonAnimationBehavior],configure:function(config){var node=config.node;this._effect=new KeyframeEffect(node,[{transform:"none"},{transform:"translateX(100%)"}],this.timingFromConfig(config));if(config.transformOrigin){this.setPrefixedProperty(node,"transformOrigin",config.transformOrigin)}else{this.setPrefixedProperty(node,"transformOrigin","0 50%")}return this._effect}});class ButtonElement extends(0,_backendAiConsole.ElementMixin)((0,_backendAiConsole.ControlStateMixin)((0,_backendAiConsole.ThemableMixin)((0,_backendAiConsole.GestureEventListeners)(_backendAiConsole.PolymerElement)))){static get template(){return _backendAiConsole.html$2`
    <style>
      :host {
        display: inline-block;
        position: relative;
        outline: none;
        white-space: nowrap;
      }

      :host([hidden]) {
        display: none !important;
      }

      /* Ensure the button is always aligned on the baseline */
      .vaadin-button-container::before {
        content: "\\2003";
        display: inline-block;
        width: 0;
      }

      .vaadin-button-container {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        width: 100%;
        height: 100%;
        min-height: inherit;
        text-shadow: inherit;
        -webkit-user-select: none;
        -moz-user-select: none;
        user-select: none;
      }

      [part="prefix"],
      [part="suffix"] {
        flex: none;
      }

      [part="label"] {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      #button {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: inherit;
      }
    </style>
    <div class="vaadin-button-container">
      <div part="prefix">
        <slot name="prefix"></slot>
      </div>
      <div part="label">
        <slot></slot>
      </div>
      <div part="suffix">
        <slot name="suffix"></slot>
      </div>
    </div>
    <button id="button" type="button" aria-label\$="[[_ariaLabel]]"></button>
`}static get is(){return"vaadin-button"}static get version(){return"2.1.3"}static get properties(){return{_ariaLabel:{type:String}}}static get observedAttributes(){return super.observedAttributes.concat(["aria-label"])}ready(){super.ready();this.setAttribute("role","button");this.$.button.setAttribute("role","presentation");this._addActiveListeners();this._updateAriaLabel(this.getAttribute("aria-label"))}disconnectedCallback(){super.disconnectedCallback();if(this.hasAttribute("active")){this.removeAttribute("active")}}attributeChangedCallback(attr,oldVal,newVal){super.attributeChangedCallback(attr,oldVal,newVal);if("aria-label"===attr){this._updateAriaLabel(newVal)}}_addActiveListeners(){(0,_backendAiConsole.addListener)(this,"down",()=>!this.disabled&&this.setAttribute("active",""));(0,_backendAiConsole.addListener)(this,"up",()=>this.removeAttribute("active"));this.addEventListener("keydown",e=>!this.disabled&&0<=[13,32].indexOf(e.keyCode)&&this.setAttribute("active",""));this.addEventListener("keyup",()=>this.removeAttribute("active"));this.addEventListener("blur",()=>this.removeAttribute("active"))}_updateAriaLabel(ariaLabel){this._ariaLabel=ariaLabel!==void 0&&null!==ariaLabel?ariaLabel:this.innerText}get focusElement(){return this.$.button}}_exports.ButtonElement=ButtonElement;customElements.define(ButtonElement.is,ButtonElement);var vaadinButton={ButtonElement:ButtonElement};_exports.$vaadinButton=vaadinButton;const $_documentContainer=_backendAiConsole.html$2`<dom-module id="lumo-button" theme-for="vaadin-button">
  <template>
    <style>
      :host {
        /* Sizing */
        --lumo-button-size: var(--lumo-size-m);
        min-width: calc(var(--lumo-button-size) * 2);
        height: var(--lumo-button-size);
        padding: 0 calc(var(--lumo-button-size) / 3 + var(--lumo-border-radius) / 2);
        margin: var(--lumo-space-xs) 0;
        box-sizing: border-box;
        /* Style */
        font-family: var(--lumo-font-family);
        font-size: var(--lumo-font-size-m);
        font-weight: 500;
        color: var(--lumo-primary-text-color);
        background-color: var(--lumo-contrast-5pct);
        border-radius: var(--lumo-border-radius);
        cursor: default;
        -webkit-tap-highlight-color: transparent;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* Set only for the internal parts so we don’t affect the host vertical alignment */
      [part="label"],
      [part="prefix"],
      [part="suffix"] {
        line-height: var(--lumo-line-height-xs);
      }

      [part="label"] {
        padding: calc(var(--lumo-button-size) / 6) 0;
      }

      :host([theme~="small"]) {
        font-size: var(--lumo-font-size-s);
        --lumo-button-size: var(--lumo-size-s);
      }

      :host([theme~="large"]) {
        font-size: var(--lumo-font-size-l);
        --lumo-button-size: var(--lumo-size-l);
      }

      /* This needs to be the last selector for it to take priority */
      :host([disabled][disabled]) {
        pointer-events: none;
        color: var(--lumo-disabled-text-color);
        background-color: var(--lumo-contrast-5pct);
      }

      /* For interaction states */
      :host::before,
      :host::after {
        content: "";
        /* We rely on the host always being relative */
        position: absolute;
        z-index: 1;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: currentColor;
        border-radius: inherit;
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
      }

      /* Hover */

      :host(:hover)::before {
        opacity: 0.05;
      }

      /* Disable hover for touch devices */
      @media (pointer: coarse) {
        :host(:not([active]):hover)::before {
          opacity: 0;
        }
      }

      /* Active */

      :host::after {
        transition: opacity 1.4s, transform 0.1s;
        filter: blur(8px);
      }

      :host([active])::before {
        opacity: 0.1;
        transition-duration: 0s;
      }

      :host([active])::after {
        opacity: 0.1;
        transition-duration: 0s, 0s;
        transform: scale(0);
      }

      /* Keyboard focus */

      :host([focus-ring]) {
        box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct);
      }

      /* Types (primary, tertiary, tertiary-inline */

      :host([theme~="tertiary"]),
      :host([theme~="tertiary-inline"]) {
        background-color: transparent !important;
        transition: opacity 0.2s;
        min-width: 0;
      }

      :host([theme~="tertiary"])::before,
      :host([theme~="tertiary-inline"])::before {
        display: none;
      }

      :host([theme~="tertiary"]) {
        padding: 0 calc(var(--lumo-button-size) / 6);
      }

      @media (hover: hover) {
        :host([theme*="tertiary"]:not([active]):hover) {
          opacity: 0.8;
        }
      }

      :host([theme~="tertiary"][active]),
      :host([theme~="tertiary-inline"][active]) {
        opacity: 0.5;
        transition-duration: 0s;
      }

      :host([theme~="tertiary-inline"]) {
        margin: 0;
        height: auto;
        padding: 0;
        line-height: inherit;
        font-size: inherit;
      }

      :host([theme~="tertiary-inline"]) [part="label"] {
        padding: 0;
        overflow: visible;
        line-height: inherit;
      }

      :host([theme~="primary"]) {
        background-color: var(--lumo-primary-color);
        color: var(--lumo-primary-contrast-color);
        font-weight: 600;
        min-width: calc(var(--lumo-button-size) * 2.5);
      }

      :host([theme~="primary"][disabled]) {
        background-color: var(--lumo-primary-color-50pct);
        color: var(--lumo-primary-contrast-color);
      }

      :host([theme~="primary"]:hover)::before {
        opacity: 0.1;
      }

      :host([theme~="primary"][active])::before {
        background-color: var(--lumo-shade-20pct);
      }

      @media (pointer: coarse) {
        :host([theme~="primary"][active])::before {
          background-color: var(--lumo-shade-60pct);
        }

        :host([theme~="primary"]:not([active]):hover)::before {
          opacity: 0;
        }
      }

      :host([theme~="primary"][active])::after {
        opacity: 0.2;
      }

      /* Colors (success, error, contrast) */

      :host([theme~="success"]) {
        color: var(--lumo-success-text-color);
      }

      :host([theme~="success"][theme~="primary"]) {
        background-color: var(--lumo-success-color);
        color: var(--lumo-success-contrast-color);
      }

      :host([theme~="success"][theme~="primary"][disabled]) {
        background-color: var(--lumo-success-color-50pct);
      }

      :host([theme~="error"]) {
        color: var(--lumo-error-text-color);
      }

      :host([theme~="error"][theme~="primary"]) {
        background-color: var(--lumo-error-color);
        color: var(--lumo-error-contrast-color);
      }

      :host([theme~="error"][theme~="primary"][disabled]) {
        background-color: var(--lumo-error-color-50pct);
      }

      :host([theme~="contrast"]) {
        color: var(--lumo-contrast);
      }

      :host([theme~="contrast"][theme~="primary"]) {
        background-color: var(--lumo-contrast);
        color: var(--lumo-base-color);
      }

      :host([theme~="contrast"][theme~="primary"][disabled]) {
        background-color: var(--lumo-contrast-50pct);
      }

      /* Icons */

      [part] ::slotted(iron-icon) {
        display: inline-block;
        width: var(--lumo-icon-size-m);
        height: var(--lumo-icon-size-m);
      }

      /* Vaadin icons are based on a 16x16 grid (unlike Lumo and Material icons with 24x24), so they look too big by default */
      [part] ::slotted(iron-icon[icon^="vaadin:"]) {
        padding: 0.25em;
        box-sizing: border-box !important;
      }

      [part="prefix"] {
        margin-left: -0.25em;
        margin-right: 0.25em;
      }

      [part="suffix"] {
        margin-left: 0.25em;
        margin-right: -0.25em;
      }

      /* Icon-only */

      :host([theme~="icon"]) {
        min-width: var(--lumo-button-size);
        padding-left: calc(var(--lumo-button-size) / 4);
        padding-right: calc(var(--lumo-button-size) / 4);
      }

      :host([theme~="icon"]) [part="prefix"],
      :host([theme~="icon"]) [part="suffix"] {
        margin-left: 0;
        margin-right: 0;
      }
    </style>
  </template>
</dom-module>`;document.head.appendChild($_documentContainer.content);const $_documentContainer$1=document.createElement("template");$_documentContainer$1.innerHTML=`<dom-module id="lumo-field-button">
  <template>
    <style>
      [part\$="button"] {
        flex: none;
        width: 1em;
        height: 1em;
        line-height: 1;
        font-size: var(--lumo-icon-size-m);
        text-align: center;
        color: var(--lumo-contrast-60pct);
        transition: 0.2s color;
        cursor: var(--lumo-clickable-cursor);
      }

      :host(:not([readonly])) [part\$="button"]:hover {
        color: var(--lumo-contrast-90pct);
      }

      :host([disabled]) [part\$="button"],
      :host([readonly]) [part\$="button"] {
        color: var(--lumo-contrast-20pct);
      }

      [part\$="button"]::before {
        font-family: "lumo-icons";
        display: block;
      }
    </style>
  </template>
</dom-module>`;document.head.appendChild($_documentContainer$1.content);const $_documentContainer$2=document.createElement("template");$_documentContainer$2.innerHTML=`<custom-style>
  <style>
    @font-face {
      font-family: 'vaadin-upload-icons';
      src: url(data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAasAAsAAAAABmAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABPUy8yAAABCAAAAGAAAABgDxIF5mNtYXAAAAFoAAAAVAAAAFQXVtKMZ2FzcAAAAbwAAAAIAAAACAAAABBnbHlmAAABxAAAAfQAAAH0bBJxYWhlYWQAAAO4AAAANgAAADYPD267aGhlYQAAA/AAAAAkAAAAJAfCA8tobXR4AAAEFAAAACgAAAAoHgAAx2xvY2EAAAQ8AAAAFgAAABYCSgHsbWF4cAAABFQAAAAgAAAAIAAOADVuYW1lAAAEdAAAAhYAAAIWmmcHf3Bvc3QAAAaMAAAAIAAAACAAAwAAAAMDtwGQAAUAAAKZAswAAACPApkCzAAAAesAMwEJAAAAAAAAAAAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAQAAA6QUDwP/AAEADwABAAAAAAQAAAAAAAAAAAAAAIAAAAAAAAwAAAAMAAAAcAAEAAwAAABwAAwABAAAAHAAEADgAAAAKAAgAAgACAAEAIOkF//3//wAAAAAAIOkA//3//wAB/+MXBAADAAEAAAAAAAAAAAAAAAEAAf//AA8AAQAAAAAAAAAAAAIAADc5AQAAAAABAAAAAAAAAAAAAgAANzkBAAAAAAEAAAAAAAAAAAACAAA3OQEAAAAAAgAA/8AEAAPAABkAMgAAEz4DMzIeAhczLgMjIg4CBycRIScFIRcOAyMiLgInIx4DMzI+AjcXphZGWmo6SH9kQwyADFiGrmJIhXJbIEYBAFoDWv76YBZGXGw8Rn5lRQyADFmIrWBIhHReIkYCWjJVPSIyVnVDXqN5RiVEYTxG/wBa2loyVT0iMlZ1Q16jeUYnRWE5RgAAAAABAIAAAAOAA4AAAgAAExEBgAMAA4D8gAHAAAAAAwAAAAAEAAOAAAIADgASAAAJASElIiY1NDYzMhYVFAYnETMRAgD+AAQA/gAdIyMdHSMjXYADgPyAgCMdHSMjHR0jwAEA/wAAAQANADMD5gNaAAUAACUBNwUBFwHT/jptATMBppMzAU2a4AIgdAAAAAEAOv/6A8YDhgALAAABJwkBBwkBFwkBNwEDxoz+xv7GjAFA/sCMAToBOoz+wAL6jP7AAUCM/sb+xowBQP7AjAE6AAAAAwAA/8AEAAPAAAcACwASAAABFSE1IREhEQEjNTMJAjMRIRECwP6A/sAEAP0AgIACQP7A/sDAAQABQICA/oABgP8AgAHAAUD+wP6AAYAAAAABAAAAAQAAdhiEdV8PPPUACwQAAAAAANX4FR8AAAAA1fgVHwAA/8AEAAPAAAAACAACAAAAAAAAAAEAAAPA/8AAAAQAAAAAAAQAAAEAAAAAAAAAAAAAAAAAAAAKBAAAAAAAAAAAAAAAAgAAAAQAAAAEAACABAAAAAQAAA0EAAA6BAAAAAAAAAAACgAUAB4AagB4AJwAsADSAPoAAAABAAAACgAzAAMAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAADgCuAAEAAAAAAAEAEwAAAAEAAAAAAAIABwDMAAEAAAAAAAMAEwBaAAEAAAAAAAQAEwDhAAEAAAAAAAUACwA5AAEAAAAAAAYAEwCTAAEAAAAAAAoAGgEaAAMAAQQJAAEAJgATAAMAAQQJAAIADgDTAAMAAQQJAAMAJgBtAAMAAQQJAAQAJgD0AAMAAQQJAAUAFgBEAAMAAQQJAAYAJgCmAAMAAQQJAAoANAE0dmFhZGluLXVwbG9hZC1pY29ucwB2AGEAYQBkAGkAbgAtAHUAcABsAG8AYQBkAC0AaQBjAG8AbgBzVmVyc2lvbiAxLjAAVgBlAHIAcwBpAG8AbgAgADEALgAwdmFhZGluLXVwbG9hZC1pY29ucwB2AGEAYQBkAGkAbgAtAHUAcABsAG8AYQBkAC0AaQBjAG8AbgBzdmFhZGluLXVwbG9hZC1pY29ucwB2AGEAYQBkAGkAbgAtAHUAcABsAG8AYQBkAC0AaQBjAG8AbgBzUmVndWxhcgBSAGUAZwB1AGwAYQBydmFhZGluLXVwbG9hZC1pY29ucwB2AGEAYQBkAGkAbgAtAHUAcABsAG8AYQBkAC0AaQBjAG8AbgBzRm9udCBnZW5lcmF0ZWQgYnkgSWNvTW9vbi4ARgBvAG4AdAAgAGcAZQBuAGUAcgBhAHQAZQBkACAAYgB5ACAASQBjAG8ATQBvAG8AbgAuAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==) format('woff');
      font-weight: normal;
      font-style: normal;
    }
  </style>
</custom-style>`;document.head.appendChild($_documentContainer$2.content);class UploadFileElement extends(0,_backendAiConsole.ThemableMixin)(_backendAiConsole.PolymerElement){static get template(){return _backendAiConsole.html$2`
    <style>
      :host {
        display: block;
      }

      [hidden] {
        display: none;
      }
    </style>

    <div part="row">
      <div part="info">
        <div part="done-icon" hidden\$="[[!file.complete]]"></div>
        <div part="warning-icon" hidden\$="[[!file.error]]"></div>

        <div part="meta">
          <div part="name" id="name">[[file.name]]</div>
          <div part="status" hidden\$="[[!file.status]]" id="status">[[file.status]]</div>
          <div part="error" id="error" hidden\$="[[!file.error]]">[[file.error]]</div>
        </div>
      </div>
      <div part="commands">
        <div part="start-button" file-event="file-start" on-click="_fireFileEvent" hidden\$="[[!file.held]]"></div>
        <div part="retry-button" file-event="file-retry" on-click="_fireFileEvent" hidden\$="[[!file.error]]"></div>
        <div part="clear-button" file-event="file-abort" on-click="_fireFileEvent"></div>
      </div>
    </div>

    <vaadin-progress-bar part="progress" id="progress" value\$="[[_formatProgressValue(file.progress)]]" error\$="[[file.error]]" indeterminate\$="[[file.indeterminate]]" uploading\$="[[file.uploading]]" complete\$="[[file.complete]]">
    </vaadin-progress-bar>
`}static get is(){return"vaadin-upload-file"}static get properties(){return{file:Object}}static get observers(){return["_fileAborted(file.abort)","_toggleHostAttribute(file.error, \"error\")","_toggleHostAttribute(file.indeterminate, \"indeterminate\")","_toggleHostAttribute(file.uploading, \"uploading\")","_toggleHostAttribute(file.complete, \"complete\")"]}_fileAborted(abort){if(abort){this._remove()}}_remove(){this.dispatchEvent(new CustomEvent("file-remove",{detail:{file:this.file},bubbles:!0,composed:!0}))}_formatProgressValue(progress){return progress/100}_fireFileEvent(e){e.preventDefault();return this.dispatchEvent(new CustomEvent(e.target.getAttribute("file-event"),{detail:{file:this.file},bubbles:!0,composed:!0}))}_toggleHostAttribute(value,attributeName){const shouldHave=!!value,has=this.hasAttribute(attributeName);if(has!==shouldHave){if(shouldHave){this.setAttribute(attributeName,"")}else{this.removeAttribute(attributeName)}}}}_exports.UploadFileElement=UploadFileElement;customElements.define(UploadFileElement.is,UploadFileElement);var vaadinUploadFile={UploadFileElement:UploadFileElement};_exports.$vaadinUploadFile=vaadinUploadFile;class UploadElement extends(0,_backendAiConsole.ElementMixin)((0,_backendAiConsole.ThemableMixin)(_backendAiConsole.PolymerElement)){static get template(){return _backendAiConsole.html$2`
    <style>
      :host {
        display: block;
        position: relative;
      }

      :host([hidden]) {
        display: none !important;
      }

      [hidden] {
        display: none !important;
      }
    </style>

    <div part="primary-buttons">
      <div id="addFiles" on-touchend="_onAddFilesTouchEnd" on-click="_onAddFilesClick">
        <slot name="add-button">
          <vaadin-button part="upload-button" id="addButton" disabled="[[maxFilesReached]]">
            [[_i18nPlural(maxFiles, i18n.addFiles, i18n.addFiles.*)]]
          </vaadin-button>
        </slot>
      </div>
      <div part="drop-label" hidden\$="[[nodrop]]" id="dropLabelContainer">
        <slot name="drop-label-icon">
          <div part="drop-label-icon"></div>
        </slot>
        <slot name="drop-label" id="dropLabel">
          [[_i18nPlural(maxFiles, i18n.dropFiles, i18n.dropFiles.*)]]
        </slot>
      </div>
    </div>
    <slot name="file-list">
      <div id="fileList" part="file-list">
        <template is="dom-repeat" items="[[files]]" as="file">
          <vaadin-upload-file file="[[file]]"></vaadin-upload-file>
        </template>
      </div>
    </slot>
    <slot></slot>
    <input type="file" id="fileInput" on-change="_onFileInputChange" hidden="" accept\$="{{accept}}" multiple\$="[[_isMultiple(maxFiles)]]" capture\$="[[capture]]">
`}static get is(){return"vaadin-upload"}static get version(){return"4.2.1"}static get properties(){return{nodrop:{type:Boolean,reflectToAttribute:!0,value:function(){try{return!!document.createEvent("TouchEvent")}catch(e){return!1}}},target:{type:String,value:""},method:{type:String,value:"POST"},headers:{type:Object,value:{}},timeout:{type:Number,value:0},_dragover:{type:Boolean,value:!1,observer:"_dragoverChanged"},files:{type:Array,notify:!0,value:function(){return[]}},maxFiles:{type:Number,value:1/0},maxFilesReached:{type:Boolean,value:!1,notify:!0,readOnly:!0,computed:"_maxFilesAdded(maxFiles, files.length)"},accept:{type:String,value:""},maxFileSize:{type:Number,value:1/0},_dragoverValid:{type:Boolean,value:!1,observer:"_dragoverValidChanged"},formDataName:{type:String,value:"file"},noAuto:{type:Boolean,value:!1},withCredentials:{type:Boolean,value:!1},capture:String,i18n:{type:Object,value:function(){return{dropFiles:{one:"Drop file here",many:"Drop files here"},addFiles:{one:"Upload File...",many:"Upload Files..."},cancel:"Cancel",error:{tooManyFiles:"Too Many Files.",fileIsTooBig:"File is Too Big.",incorrectFileType:"Incorrect File Type."},uploading:{status:{connecting:"Connecting...",stalled:"Stalled.",processing:"Processing File...",held:"Queued"},remainingTime:{prefix:"remaining time: ",unknown:"unknown remaining time"},error:{serverUnavailable:"Server Unavailable",unexpectedServerError:"Unexpected Server Error",forbidden:"Forbidden"}},units:{size:["B","kB","MB","GB","TB","PB","EB","ZB","YB"]}}}}}}ready(){super.ready();this.addEventListener("dragover",this._onDragover.bind(this));this.addEventListener("dragleave",this._onDragleave.bind(this));this.addEventListener("drop",this._onDrop.bind(this));this.addEventListener("file-retry",this._onFileRetry.bind(this));this.addEventListener("file-abort",this._onFileAbort.bind(this));this.addEventListener("file-remove",this._onFileRemove.bind(this));this.addEventListener("file-start",this._onFileStart.bind(this))}_formatSize(bytes){var _Mathlog=Math.log;if("function"===typeof this.i18n.formatSize){return this.i18n.formatSize(bytes)}const base=this.i18n.units.sizeBase||1e3,unit=~~(_Mathlog(bytes)/_Mathlog(base)),dec=Math.max(0,Math.min(3,unit-1)),size=parseFloat((bytes/Math.pow(base,unit)).toFixed(dec));return size+" "+this.i18n.units.size[unit]}_splitTimeByUnits(time){const unitSizes=[60,60,24,1/0],timeValues=[0];for(var i=0;i<unitSizes.length&&0<time;i++){timeValues[i]=time%unitSizes[i];time=_Mathfloor(time/unitSizes[i])}return timeValues}_formatTime(seconds,split){if("function"===typeof this.i18n.formatTime){return this.i18n.formatTime(seconds,split)}while(3>split.length){split.push(0)}return split.reverse().map(number=>{return(10>number?"0":"")+number}).join(":")}_formatFileProgress(file){return file.totalStr+": "+file.progress+"% ("+(0<file.loaded?this.i18n.uploading.remainingTime.prefix+file.remainingStr:this.i18n.uploading.remainingTime.unknown)+")"}_maxFilesAdded(maxFiles,numFiles){return 0<=maxFiles&&numFiles>=maxFiles}_onDragover(event){event.preventDefault();if(!this.nodrop&&!this._dragover){this._dragoverValid=!this.maxFilesReached;this._dragover=!0}event.dataTransfer.dropEffect=!this._dragoverValid||this.nodrop?"none":"copy"}_onDragleave(event){event.preventDefault();if(this._dragover&&!this.nodrop){this._dragover=this._dragoverValid=!1}}_onDrop(event){if(!this.nodrop){event.preventDefault();this._dragover=this._dragoverValid=!1;this._addFiles(event.dataTransfer.files)}}_createXhr(){return new XMLHttpRequest}_configureXhr(xhr){if("string"==typeof this.headers){try{this.headers=JSON.parse(this.headers)}catch(e){this.headers=void 0}}for(var key in this.headers){xhr.setRequestHeader(key,this.headers[key])}if(this.timeout){xhr.timeout=this.timeout}xhr.withCredentials=this.withCredentials}_setStatus(file,total,loaded,elapsed){file.elapsed=elapsed;file.elapsedStr=this._formatTime(file.elapsed,this._splitTimeByUnits(file.elapsed));file.remaining=Math.ceil(elapsed*(total/loaded-1));file.remainingStr=this._formatTime(file.remaining,this._splitTimeByUnits(file.remaining));file.speed=~~(total/elapsed/1024);file.totalStr=this._formatSize(total);file.loadedStr=this._formatSize(loaded);file.status=this._formatFileProgress(file)}uploadFiles(files){files=files||this.files;files=files.filter(file=>!file.complete);Array.prototype.forEach.call(files,this._uploadFile.bind(this))}_uploadFile(file){if(file.uploading){return}const ini=Date.now(),xhr=file.xhr=this._createXhr(file);let stalledId,last;xhr.upload.onprogress=e=>{clearTimeout(stalledId);last=Date.now();const elapsed=(last-ini)/1e3,loaded=e.loaded,total=e.total,progress=~~(100*(loaded/total));file.loaded=loaded;file.progress=progress;file.indeterminate=0>=loaded||loaded>=total;if(file.error){file.indeterminate=file.status=void 0}else if(!file.abort){if(100>progress){this._setStatus(file,total,loaded,elapsed);stalledId=setTimeout(()=>{file.status=this.i18n.uploading.status.stalled;this._notifyFileChanges(file)},2e3)}else{file.loadedStr=file.totalStr;file.status=this.i18n.uploading.status.processing;file.uploading=!1}}this._notifyFileChanges(file);this.dispatchEvent(new CustomEvent("upload-progress",{detail:{file,xhr}}))};xhr.onreadystatechange=()=>{if(4==xhr.readyState){clearTimeout(stalledId);file.indeterminate=file.uploading=!1;if(file.abort){this._notifyFileChanges(file);return}file.status="";const evt=this.dispatchEvent(new CustomEvent("upload-response",{detail:{file,xhr},cancelable:!0}));if(!evt){return}if(0===xhr.status){file.error=this.i18n.uploading.error.serverUnavailable}else if(500<=xhr.status){file.error=this.i18n.uploading.error.unexpectedServerError}else if(400<=xhr.status){file.error=this.i18n.uploading.error.forbidden}file.complete=!file.error;this.dispatchEvent(new CustomEvent(`upload-${file.error?"error":"success"}`,{detail:{file,xhr}}));this._notifyFileChanges(file)}};const formData=new FormData;file.uploadTarget=this.target||"";file.formDataName=this.formDataName;const evt=this.dispatchEvent(new CustomEvent("upload-before",{detail:{file,xhr},cancelable:!0}));if(!evt){return}formData.append(file.formDataName,file,file.name);xhr.open(this.method,file.uploadTarget,!0);this._configureXhr(xhr);file.status=this.i18n.uploading.status.connecting;file.uploading=file.indeterminate=!0;file.complete=file.abort=file.error=file.held=!1;xhr.upload.onloadstart=()=>{this.dispatchEvent(new CustomEvent("upload-start",{detail:{file,xhr}}));this._notifyFileChanges(file)};const uploadEvt=this.dispatchEvent(new CustomEvent("upload-request",{detail:{file,xhr,formData},cancelable:!0}));if(uploadEvt){xhr.send(formData)}}_retryFileUpload(file){const evt=this.dispatchEvent(new CustomEvent("upload-retry",{detail:{file,xhr:file.xhr},cancelable:!0}));if(evt){this._uploadFile(file)}}_abortFileUpload(file){const evt=this.dispatchEvent(new CustomEvent("upload-abort",{detail:{file,xhr:file.xhr},cancelable:!0}));if(evt){file.abort=!0;if(file.xhr){file.xhr.abort()}this._notifyFileChanges(file)}}_notifyFileChanges(file){var p="files."+this.files.indexOf(file)+".";for(var i in file){if(file.hasOwnProperty(i)){this.notifyPath(p+i,file[i])}}}_addFiles(files){Array.prototype.forEach.call(files,this._addFile.bind(this))}_addFile(file){if(this.maxFilesReached){this.dispatchEvent(new CustomEvent("file-reject",{detail:{file,error:this.i18n.error.tooManyFiles}}));return}if(0<=this.maxFileSize&&file.size>this.maxFileSize){this.dispatchEvent(new CustomEvent("file-reject",{detail:{file,error:this.i18n.error.fileIsTooBig}}));return}const fileExt=file.name.match(/\.[^\.]*$|$/)[0],re=new RegExp("^("+this.accept.replace(/[, ]+/g,"|").replace(/\/\*/g,"/.*")+")$","i");if(this.accept&&!(re.test(file.type)||re.test(fileExt))){this.dispatchEvent(new CustomEvent("file-reject",{detail:{file,error:this.i18n.error.incorrectFileType}}));return}file.loaded=0;file.held=!0;file.status=this.i18n.uploading.status.held;this.unshift("files",file);if(!this.noAuto){this._uploadFile(file)}}_removeFile(file){if(-1<this.files.indexOf(file)){this.splice("files",this.files.indexOf(file),1)}}_onAddFilesTouchEnd(e){e.preventDefault();this.__resetMouseCanceller();this._onAddFilesClick()}__resetMouseCanceller(){(0,_backendAiConsole.resetMouseCanceller)()}_onAddFilesClick(){if(this.maxFilesReached){return}this.$.fileInput.value="";this.$.fileInput.click()}_onFileInputChange(event){this._addFiles(event.target.files)}_onFileStart(event){this._uploadFile(event.detail.file)}_onFileRetry(event){this._retryFileUpload(event.detail.file)}_onFileAbort(event){this._abortFileUpload(event.detail.file)}_onFileRemove(event){event.stopPropagation();this._removeFile(event.detail.file)}_dragoverChanged(dragover){dragover?this.setAttribute("dragover",dragover):this.removeAttribute("dragover")}_dragoverValidChanged(dragoverValid){dragoverValid?this.setAttribute("dragover-valid",dragoverValid):this.removeAttribute("dragover-valid")}_i18nPlural(value,plural){return 1==value?plural.one:plural.many}_isMultiple(){return 1!=this.maxFiles}}_exports.UploadElement=UploadElement;customElements.define(UploadElement.is,UploadElement);var vaadinUpload={UploadElement:UploadElement};_exports.$vaadinUpload=vaadinUpload;const $_documentContainer$3=document.createElement("template");$_documentContainer$3.innerHTML=`<dom-module id="lumo-upload" theme-for="vaadin-upload">
  <template>
    <style>
      :host {
        line-height: var(--lumo-line-height-m);
      }

      :host(:not([nodrop])) {
        overflow: hidden;
        border: 1px dashed var(--lumo-contrast-20pct);
        border-radius: var(--lumo-border-radius);
        padding: var(--lumo-space-m);
        transition: background-color 0.6s, border-color 0.6s;
      }

      [part="primary-buttons"] > * {
        display: inline-block;
        white-space: nowrap;
      }

      [part="drop-label"] {
        display: inline-block;
        white-space: normal;
        padding: 0 var(--lumo-space-s);
        color: var(--lumo-secondary-text-color);
        font-family: var(--lumo-font-family);
      }

      :host([dragover-valid]) {
        border-color: var(--lumo-primary-color-50pct);
        background: var(--lumo-primary-color-10pct);
        transition: background-color 0.1s, border-color 0.1s;
      }

      :host([dragover-valid]) [part="drop-label"] {
        color: var(--lumo-primary-text-color);
      }

      [part="drop-label-icon"] {
        display: inline-block;
      }

      [part="drop-label-icon"]::before {
        content: var(--lumo-icons-upload);
        font-family: lumo-icons;
        font-size: var(--lumo-icon-size-m);
        line-height: 1;
        vertical-align: -.25em;
      }
    </style>
  </template>
</dom-module><dom-module id="lumo-upload-file" theme-for="vaadin-upload-file">
  <template>
    <style include="lumo-field-button">
      :host {
        padding: var(--lumo-space-s) 0;
      }

      :host(:not(:first-child)) {
        border-top: 1px solid var(--lumo-contrast-10pct);
      }

      [part="row"] {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
      }

      [part="status"],
      [part="error"] {
        color: var(--lumo-secondary-text-color);
        font-size: var(--lumo-font-size-s);
      }

      [part="info"] {
        display: flex;
        align-items: baseline;
        flex: auto;
      }

      [part="meta"] {
        width: 0.001px;
        flex: 1 1 auto;
      }

      [part="name"] {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      [part="commands"] {
        display: flex;
        align-items: baseline;
        flex: none;
      }

      [part="done-icon"],
      [part="warning-icon"] {
        margin-right: var(--lumo-space-xs);
      }

      /* When both icons are hidden, let us keep space for one */
      [part="done-icon"][hidden] + [part="warning-icon"][hidden] {
        display: block !important;
        visibility: hidden;
      }

      [part="done-icon"],
      [part="warning-icon"] {
        font-size: var(--lumo-icon-size-m);
        font-family: 'lumo-icons';
        line-height: 1;
      }

      [part="start-button"],
      [part="retry-button"],
      [part="clear-button"] {
        flex: none;
        margin-left: var(--lumo-space-xs);
      }

      [part="done-icon"]::before,
      [part="warning-icon"]::before,
      [part="start-button"]::before,
      [part="retry-button"]::before,
      [part="clear-button"]::before {
        vertical-align: -.25em;
      }

      [part="done-icon"]::before {
        content: var(--lumo-icons-checkmark);
        color: var(--lumo-primary-text-color);
      }

      [part="warning-icon"]::before {
        content: var(--lumo-icons-error);
        color: var(--lumo-error-text-color);
      }

      [part="start-button"]::before {
        content: var(--lumo-icons-play);
      }

      [part="retry-button"]::before {
        content: var(--lumo-icons-reload);
      }

      [part="clear-button"]::before {
        content: var(--lumo-icons-cross);
      }

      [part="error"] {
        color: var(--lumo-error-text-color);
      }

      [part="progress"] {
        width: auto;
        margin-left: calc(var(--lumo-icon-size-m) + var(--lumo-space-xs));
        margin-right: calc(var(--lumo-icon-size-m) + var(--lumo-space-xs));
      }

      [part="progress"][complete],
      [part="progress"][error] {
        display: none;
      }

    </style>
  </template>
</dom-module>`;document.head.appendChild($_documentContainer$3.content);class BackendAIData extends(0,_backendAiConsole.OverlayPatchMixin)(_backendAiConsole.PolymerElement){static get properties(){return{folders:{type:Object,value:{}},folderInfo:{type:Object,value:{}},is_admin:{type:Boolean,value:!1},authenticated:{type:Boolean,value:!1},deleteFolderId:{type:String,value:""},active:{type:Boolean,value:!1},explorer:{type:Object,value:{}},uploadFiles:{type:Array,value:[]}}}constructor(){super();(0,_backendAiConsole.setPassiveTouchGestures)(!0)}ready(){super.ready();this._addEventListenerDropZone();document.addEventListener("backend-ai-connected",()=>{this.is_admin=window.backendaiclient.is_admin;this.authenticated=!0;this._refreshFolderList()},!0);this.$["add-folder"].addEventListener("tap",this._addFolderDialog.bind(this));this.$["add-button"].addEventListener("tap",this._addFolder.bind(this));this.$["delete-button"].addEventListener("tap",this._deleteFolderWithCheck.bind(this));this._clearExplorer=this._clearExplorer.bind(this);this._mkdir=this._mkdir.bind(this)}static get observers(){return["_routeChanged(route.*)","_viewChanged(routeData.view)","_menuChanged(active)"]}connectedCallback(){super.connectedCallback();(0,_backendAiConsole.afterNextRender)(this,function(){})}shouldUpdate(){return this.active}_refreshFolderList(){let l=window.backendaiclient.vfolder.list();l.then(value=>{this.folders=value})}_menuChanged(active){if(!active){return}else{if(window.backendaiclient==void 0||null==window.backendaiclient){document.addEventListener("backend-ai-connected",()=>{this.is_admin=window.backendaiclient.is_admin;this.authenticated=!0;this._refreshFolderList()},!0)}else{this.is_admin=window.backendaiclient.is_admin;this.authenticated=!0;this._refreshFolderList()}}}_countObject(obj){return Object.keys(obj).length}_addFolderDialog(){this.openDialog("add-folder-dialog")}_folderExplorerDialog(){this.openDialog("folder-explorer-dialog")}_mkdirDialog(){this.$["mkdir-name"].value="";this.openDialog("mkdir-dialog")}openDialog(id){this.$[id].open()}closeDialog(id){this.$[id].close()}_indexFrom1(index){return index+1}_hasPermission(item,perm){if(item.permission.includes(perm)){return!0}if(item.permission.includes("w")&&"r"===perm){return!0}return!1}_addFolder(){let name=this.$["add-folder-name"].value,job=window.backendaiclient.vfolder.create(name);job.then(value=>{this.$.notification.text="Virtual folder is successfully created.";this.$.notification.show();this._refreshFolderList()}).catch(err=>{console.log(err);if(err&&err.message){this.$.notification.text=err.message;this.$.notification.show()}});this.closeDialog("add-folder-dialog")}_getControlId(e){const termButton=e.target,controls=e.target.closest("#controls");return controls.folderId}_infoFolder(e){const folderId=this._getControlId(e);let job=window.backendaiclient.vfolder.info(folderId);job.then(value=>{this.folderInfo=value;this.openDialog("info-folder-dialog")}).catch(err=>{console.log(err);if(err&&err.message){this.$.notification.text=err.message;this.$.notification.show()}})}_deleteFolderDialog(e){this.deleteFolderId=this._getControlId(e);this.$["delete-folder-name"].value="";this.openDialog("delete-folder-dialog")}_deleteFolderWithCheck(){let typedDeleteFolderName=this.$["delete-folder-name"].value;if(typedDeleteFolderName!=this.deleteFolderId){this.$.notification.text="Folder name mismatched. Check your typing.";this.$.notification.show();return}this.closeDialog("delete-folder-dialog");this._deleteFolder(this.deleteFolderId)}_deleteFolder(folderId){let job=window.backendaiclient.vfolder.delete(folderId);job.then(value=>{this.$.notification.text="Virtual folder is successfully deleted.";this.$.notification.show();this._refreshFolderList()}).catch(err=>{console.log(err);if(err&&err.message){this.$.notification.text=err.message;this.$.notification.show()}})}_clearExplorer(path=this.explorer.breadcrumb.join("/"),id=this.explorer.id,dialog=!1){let job=window.backendaiclient.vfolder.list_files(path,id);job.then(value=>{this.set("explorer.files",JSON.parse(value.files));if(dialog){this.openDialog("folder-explorer-dialog")}})}_folderExplorer(e){const folderId=e.target.folderId;let explorer={id:folderId,breadcrumb:["."]};this.set("explorer",explorer);this._clearExplorer(explorer.breadcrumb.join("/"),explorer.id,!0)}_enqueueFolder(e){const fn=e.target.name;this.push("explorer.breadcrumb",fn);this._clearExplorer()}_gotoFolder(e){const dest=e.target.dest;let tempBreadcrumb=this.explorer.breadcrumb;const index=tempBreadcrumb.indexOf(dest);if(-1===index){return}tempBreadcrumb=tempBreadcrumb.slice(0,index+1);this.set("explorer.breadcrumb",tempBreadcrumb);this._clearExplorer(tempBreadcrumb.join("/"),this.explorer.id,!1)}_mkdir(e){const newfolder=this.$["mkdir-name"].value,explorer=this.explorer;let job=window.backendaiclient.vfolder.mkdir([...explorer.breadcrumb,newfolder].join("/"),explorer.id);job.then(res=>{this.closeDialog("mkdir-dialog");this._clearExplorer()})}_isDir(file){return file.mode.startsWith("d")}_addEventListenerDropZone(){const dndZoneEl=this.$["folder-explorer-dialog"],dndZonePlaceholderEl=this.$.dropzone;dndZonePlaceholderEl.addEventListener("dragleave",()=>{dndZonePlaceholderEl.style.display="none"});dndZoneEl.addEventListener("dragover",e=>{e.stopPropagation();e.preventDefault();e.dataTransfer.dropEffect="copy";dndZonePlaceholderEl.style.display="flex";return!1});dndZoneEl.addEventListener("drop",e=>{e.stopPropagation();e.preventDefault();dndZonePlaceholderEl.style.display="none";let temp=[];for(let i=0;i<e.dataTransfer.files.length;i++){const file=e.dataTransfer.files[i];if(1048576<file.size){console.log("File size limit (< 1 MiB)")}else{file.progress=0;file.error=!1;file.complete=!1;temp.push(file);this.push("uploadFiles",file)}}for(let i=0;i<temp.length;i++){this.fileUpload(temp[i]);this._clearExplorer()}})}_uploadFileBtnClick(e){const elem=this.$.fileInput;if(elem&&document.createEvent){const evt=document.createEvent("MouseEvents");evt.initEvent("click",!0,!1);elem.dispatchEvent(evt)}}_uploadFileChange(e){const length=e.target.files.length;for(let i=0;i<length;i++){const file=e.target.files[i];let text="",possible="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(let i=0;5>i;i++)text+=possible.charAt(_Mathfloor(Math.random()*possible.length));file.id=text;file.progress=0;file.error=!1;file.complete=!1;this.push("uploadFiles",file)}for(let i=0;i<length;i++){this.fileUpload(this.uploadFiles[i]);this._clearExplorer()}this.$.fileInput.value=""}fileUpload(fileObj){const fd=new FormData,explorer=this.explorer,path=explorer.breadcrumb.concat(fileObj.name).join("/");fd.append("src",fileObj,path);const index=this.uploadFiles.indexOf(fileObj);let job=window.backendaiclient.vfolder.uploadFormData(fd,explorer.id);job.then(resp=>{this._clearExplorer();this.set("uploadFiles."+index+".complete",!0);setTimeout(()=>{this.splice("uploadFiles",this.uploadFiles.indexOf(fileObj),1)},1e3)})}_downloadFile(e){let fn=e.target.filename,path=this.explorer.breadcrumb.concat(fn).join("/"),job=window.backendaiclient.vfolder.download(path,this.explorer.id);job.then(res=>{const url=window.URL.createObjectURL(res);let a=document.createElement("a");a.addEventListener("click",function(e){e.stopPropagation()});a.href=url;a.download=fn;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)})}_humanReadableTime(d){const date=new Date(1e3*d),offset=date.getTimezoneOffset()/60,hours=date.getHours();date.setHours(hours-offset);return date.toUTCString()}_isDownloadable(file){return 209715200>file.size}static get template(){return _backendAiConsole.html`
      <style is="custom-style" include="backend-ai-styles iron-flex iron-flex-alignment iron-positioning">
        vaadin-grid {
          border: 0 !important;
          font-size: 12px;
        }

        ul {
          padding-left: 0;
        }

        ul li {
          list-style: none;
          font-size: 13px;
        }

        span.indicator {
          width: 100px;
        }

        paper-button.add-button,
        paper-button.delete-button {
          width: 100%;
        }

        paper-icon-button.tiny {
          width: 35px;
          height: 35px;
        }

        .warning {
          color: red;
        }

        vaadin-item {
          font-size: 13px;
          font-weight: 100;
        }

        #folder-explorer-dialog {
          height: calc(100vh - 80px);
          right: 0;
          top: 0;
          position: fixed;
          margin: 70px 0 0 0;
        }

        @media screen and (max-width: 899px) {
          #folder-explorer-dialog {
            left: 0;
            width: 100%;
          }
        }

        @media screen and (min-width: 900px) {
          #folder-explorer-dialog {
            left: 200px;
            width: calc(100% - 200px);
          }
        }

        div.breadcrumb {
          color: #637282;
          font-size: 1em;
        }

        div.breadcrumb span:first-child {
          display: none;
        }

        paper-button.goto {
          margin: 0;
          padding: 5px;
          min-width: 0;
        }

        paper-button.goto:last-of-type {
          color: #000;
          font-weight: bold;
        }

        div#upload {
          margin: 0;
          padding: 0;
        }

        div#dropzone {
          display: none;
          position: absolute;
          top: 0;
          height: 100%;
          width: 100%;
          z-index: 10;
        }

        div#dropzone, div#dropzone p {
          margin: 0;
          padding: 0;
          width: 100%;
          background: rgba(211, 211, 211, .5);
          text-align: center;
        }

        .progress {
          padding: 30px 10px;
          border: 1px solid lightgray;
        }

        .progress-item {
          padding: 10px 30px;
        }

      </style>
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>
      <paper-material class="item" elevation="1" style="padding-bottom:20px;">
        <h4 class="horizontal center layout">
          <span>Virtual Folders</span>
          <mwc-button class="fg red" id="add-folder" outlined label="Add new folder" icon="add"></mwc-button>
        </h4>

        <vaadin-grid theme="row-stripes column-borders compact" aria-label="Folder list" items="[[folders]]">
          <vaadin-grid-column width="40px" flex-grow="0" resizable>
            <template class="header">#</template>
            <template>[[_indexFrom1(index)]]</template>
          </vaadin-grid-column>

          <vaadin-grid-column resizable>
            <template class="header">Folder Name</template>
            <template>
              <div class="indicator" on-tap="_folderExplorer" folder-id="[[item.name]]">[[item.name]]</div>
            </template>
          </vaadin-grid-column>

          <vaadin-grid-column resizable>
            <template class="header">id</template>
            <template>
              <div class="layout vertical">
                <span>[[item.id]]</span>
              </div>
            </template>
          </vaadin-grid-column>

          <vaadin-grid-column resizable>
            <template class="header">Location</template>
            <template>
              <div class="layout vertical">
                <span>[[item.host]]</span>
              </div>
            </template>
          </vaadin-grid-column>

          <vaadin-grid-column width="85px" flex-grow="0" resizable>
            <template class="header">Permission</template>
            <template>
              <div class="horizontal center-justified wrap layout">
                <template is="dom-if" if="[[_hasPermission(item, 'r')]]">
                  <lablup-shields app="" color="green"
                                  description="R" ui="flat"></lablup-shields>
                </template>
                <template is="dom-if" if="[[_hasPermission(item, 'w')]]">
                  <lablup-shields app="" color="blue"
                                  description="W" ui="flat"></lablup-shields>
                </template>
                <template is="dom-if" if="[[_hasPermission(item, 'd')]]">
                  <lablup-shields app="" color="red"
                                  description="D" ui="flat"></lablup-shields>
                </template>
              </div>
            </template>
          </vaadin-grid-column>
          <vaadin-grid-column resizable>
            <template class="header">Control</template>
            <template>
              <div id="controls" class="layout horizontal flex center"
                   folder-id="[[item.name]]">
                <paper-icon-button class="fg green controls-running" icon="vaadin:info-circle-o"
                                   on-tap="_infoFolder"></paper-icon-button>
                <template is="dom-if" if="[[_hasPermission(item, 'r')]]">
                  <paper-icon-button class="fg blue controls-running" icon="folder-open"
                                     on-tap="_folderExplorer" folder-id="[[item.name]]"></paper-icon-button>
                </template>
                <template is="dom-if" if="[[_hasPermission(item, 'w')]]">
                </template>
                <template is="dom-if" if="[[_hasPermission(item, 'd')]]">
                  <paper-icon-button class="fg red controls-running" icon="delete"
                                     on-tap="_deleteFolderDialog"></paper-icon-button>
                </template>
              </div>
            </template>
          </vaadin-grid-column>
        </vaadin-grid>
      </paper-material>
      <paper-material>
        <h4 class="horizontal center layout">
          <span>Public Data</span>
        </h4>
        <div class="horizontal center flex layout" style="padding:15px;">
          <div>No data present.</div>
        </div>
      </paper-material>
      <paper-dialog id="add-folder-dialog" with-backdrop
                    entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <paper-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Create a new virtual folder</span>
            <div class="flex"></div>
            <paper-icon-button icon="close" class="blue close-button" dialog-dismiss>
              Close
            </paper-icon-button>
          </h3>
          <form id="login-form" onSubmit="this._addFolder()">
            <fieldset>
              <paper-input id="add-folder-name" label="Folder name" pattern="[a-zA-Z0-9_-]*"
                           error-message="Allows letters, numbers and -_." auto-validate></paper-input>
              <paper-input id="add-folder-host" label="Host" pattern="[a-zA-Z0-9_-]*" disabled
                           error-message="Allows letters, numbers and -_." auto-validate value="local"></paper-input>
              <br/>
              <paper-button class="blue add-button" type="submit" id="add-button">
                <iron-icon icon="rowing"></iron-icon>
                Create
              </paper-button>
            </fieldset>
          </form>
        </paper-material>
      </paper-dialog>
      <paper-dialog id="delete-folder-dialog" with-backdrop
                    entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <paper-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Delete a virtual folder</span>
            <div class="flex"></div>
            <paper-icon-button icon="close" class="blue close-button" dialog-dismiss>
              Close
            </paper-icon-button>
          </h3>
          <div class="warning">WARNING: this cannot be undone!</div>
          <form id="login-form" onSubmit="this._addFolder()">
            <fieldset>
              <paper-input class="red" id="delete-folder-name" label="Type folder name to delete"
                           pattern="[a-zA-Z0-9_-]*"
                           error-message="Allows letters, numbers and -_." auto-validate></paper-input>
              <br/>
              <paper-button class="blue delete-button" type="submit" id="delete-button">
                <iron-icon icon="close"></iron-icon>
                Delete
              </paper-button>
            </fieldset>
          </form>
        </paper-material>
      </paper-dialog>
      <paper-dialog id="info-folder-dialog" with-backdrop
                    entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <paper-material elevation="1" class="intro centered" style="margin: 0;">
          <h3 class="horizontal center layout" style="border-bottom:1px solid #ddd;">
            <span>[[folderInfo.name]]</span>
            <div class="flex"></div>
            <paper-icon-button icon="close" class="blue close-button" dialog-dismiss>
              Close
            </paper-icon-button>
          </h3>
          <div role="listbox" style="margin: 0;">
            <vaadin-item>
              <div><strong>ID</strong></div>
              <div secondary>[[folderInfo.id]]</div>
            </vaadin-item>
            <vaadin-item>
              <div><strong>Location</strong></div>
              <div secondary>[[folderInfo.host]]</div>
            </vaadin-item>
            <vaadin-item>
              <div><strong>Number of Files</strong></div>
              <div secondary>[[folderInfo.numFiles]]</div>
            </vaadin-item>
            <template is="dom-if" if="[[folderInfo.is_owner]]">
              <vaadin-item>
                <div><strong>Ownership</strong></div>
                <div secondary>You are the owner of this folder.</div>
              </vaadin-item>
            </template>
            <vaadin-item>
              <div><strong>Permission</strong></div>
              <div secondary>[[folderInfo.permission]]</div>
            </vaadin-item>
          </div>
        </paper-material>
      </paper-dialog>
      <paper-dialog id="folder-explorer-dialog"
                    entry-animation="slide-from-right-animation" exit-animation="slide-right-animation">
        <paper-material elevation="1" class="intro" style="margin: 0; box-shadow: none; height: 100%;">
          <h3 class="horizontal center layout" style="font-weight:bold">
            <span>[[explorer.id]]</span>
            <div class="flex"></div>
            <paper-icon-button icon="close" class="blue close-button" dialog-dismiss>
              Close
            </paper-icon-button>
          </h3>

          <div class="breadcrumb">
            <template is="dom-repeat" items="[[explorer.breadcrumb]]">
              <span>&gt;</span>
              <paper-button class="goto" path="item" on-click="_gotoFolder" dest="[[item]]">[[item]]</paper-button>
            </template>
          </div>

          <div>
            <vaadin-button raised id="add-btn" on-tap="_uploadFileBtnClick">Upload Files...</vaadin-button>
            <vaadin-button id="mkdir" on-click="_mkdirDialog">New Directory</vaadin-button>
          </div>

          <div id="upload">
            <div id="dropzone"><p>drag</p></div>
            <input type="file" id="fileInput" on-change="_uploadFileChange" hidden multiple>
            <template is="dom-if" if="[[uploadFiles.length]]">
              <vaadin-grid class="progress" theme="row-stripes compact" aria-label="uploadFiles" items="[[uploadFiles]]"
                           height-by-rows>
                <vaadin-grid-column width="100px" flex-grow="0">
                  <template>
                    <vaadin-item class="progress-item">
                      <div>
                        <template is="dom-if" if="[[item.complete]]">
                          <iron-icon icon="check"></iron-icon>
                        </template>
                      </div>
                    </vaadin-item>
                  </template>
                </vaadin-grid-column>

                <vaadin-grid-column>
                  <template>
                    <vaadin-item>
                      <span>[[item.name]]</span>
                      <template is="dom-if" if="[[!item.complete]]">
                        <div>
                          <vaadin-progress-bar indeterminate value="0"></vaadin-progress-bar>
                        </div>
                      </template>
                    </vaadin-item>
                  </template>
                </vaadin-grid-column>
              </vaadin-grid>
            </template>
          </div>

          <vaadin-grid theme="row-stripes compact" aria-label="Explorer" items="[[explorer.files]]">
            <vaadin-grid-column width="40px" flex-grow="0" resizable>
              <template class="header">#</template>
              <template>[[_indexFrom1(index)]]</template>
            </vaadin-grid-column>

            <vaadin-grid-column flex-grow="2" resizable>
              <template class="header">
                <vaadin-grid-sorter path="filename">Name</vaadin-grid-sorter>
              </template>
              <template>
                <template is="dom-if" if="[[_isDir(item)]]">
                  <div class="indicator" on-click="_enqueueFolder" name="[[item.filename]]">
                    <paper-icon-button class="fg controls-running" icon="folder-open"
                                       name="[[item.filename]]"></paper-icon-button>
                    [[item.filename]]
                  </div>
                </template>

                <template is="dom-if" if="[[!_isDir(item)]]">
                  <div class="indicator">
                    <paper-icon-button class="fg controls-running" icon="insert-drive-file"></paper-icon-button>
                    [[item.filename]]
                  </div>
                </template>
              </template>
            </vaadin-grid-column>

            <vaadin-grid-column flex-grow="2" resizable>
              <template class="header">
                <vaadin-grid-sorter path="ctime">Created</vaadin-grid-sorter>
              </template>
              <template>
                <div class="layout vertical">
                  <span>[[_humanReadableTime(item.ctime)]]</span>
                </div>
              </template>
            </vaadin-grid-column>

            <vaadin-grid-column flex-grow="1" resizable>
              <template class="header">
                <vaadin-grid-sorter path="size">Size</vaadin-grid-sorter>
              </template>
              <template>
                <div class="layout vertical">
                  <span>[[item.size]]</span>
                </div>
              </template>
            </vaadin-grid-column>

            <vaadin-grid-column flex-grow="2" resizable>
              <template class="header">Actions</template>
              <template>
                <template is="dom-if" if="[[!_isDir(item)]]">
                  <template is="dom-if" if="[[_isDownloadable(item)]]">
                    <paper-icon-button id="download-btn" class="tiny fg red" icon="vaadin:download"
                                       filename="[[item.filename]]" on-tap="_downloadFile"></paper-icon-button>
                  </template>
                </template>
              </template>
            </vaadin-grid-column>
          </vaadin-grid>
        </paper-material>
      </paper-dialog>

      <paper-dialog id="mkdir-dialog"
                    entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <paper-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Create a new folder</span>
            <div class="flex"></div>
            <paper-icon-button icon="close" class="blue close-button" dialog-dismiss>
              Close
            </paper-icon-button>
          </h3>
          <form>
            <fieldset>
              <paper-input id="mkdir-name" label="Folder name" pattern="[a-zA-Z0-9_-]*"
                           error-message="Allows letters, numbers and -_." auto-validate></paper-input>
              <br/>
              <paper-button class="blue add-button" type="submit" id="mkdir-btn" on-click="_mkdir">
                <iron-icon icon="rowing"></iron-icon>
                Create
              </paper-button>
            </fieldset>
          </form>
        </paper-material>
      </paper-dialog>
    `}}customElements.define("backend-ai-data-view",BackendAIData)});