define(["../node_modules/@polymer/polymer/polymer-element.js","../node_modules/@polymer/polymer/lib/elements/dom-if.js","../node_modules/@polymer/polymer/lib/utils/settings.js","../node_modules/@polymer/paper-icon-button/paper-icon-button.js","../node_modules/@polymer/paper-styles/typography.js","../node_modules/@polymer/paper-styles/color.js","../node_modules/@polymer/paper-material/paper-material.js","../node_modules/@polymer/iron-icon/iron-icon.js","../node_modules/@polymer/iron-icons/iron-icons.js","../node_modules/@polymer/iron-image/iron-image.js","../node_modules/@polymer/iron-flex-layout/iron-flex-layout.js","./backend-ai-styles.js"],function(_polymerElement,_domIf,_settings,_paperIconButton,_typography,_color,_paperMaterial,_ironIcon,_ironIcons,_ironImage,_ironFlexLayout,_backendAiStyles){"use strict";class BackendAIJobView extends _polymerElement.PolymerElement{static get properties(){return{}}constructor(){super();(0,_settings.setPassiveTouchGestures)(!0)}ready(){super.ready()}static get observers(){return["_routeChanged(route.*)","_viewChanged(routeData.view)"]}_routeChanged(changeRecord){if("path"===changeRecord.path){console.log("Path changed!")}}_viewChanged(view){}static get template(){return _polymerElement.html`
    <style is="custom-style" include="backend-ai-styles">
    </style>
    <paper-material class="item" elevation="1">
        <h3 class="paper-material-title">Menu title</h3>
        <div>
            TEST
        </div>
    </paper-material>
    `}}customElements.define("backend-ai-job-view",BackendAIJobView)});