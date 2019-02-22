define(["./backend-ai-console.js"],function(_backendAiConsole){"use strict";class BackendAiEnvironmentView extends _backendAiConsole.LitElement{static get is(){return"backend-ai-environment-view"}static get styles(){return[_backendAiConsole.BackendAiStyles,_backendAiConsole.IronFlex,_backendAiConsole.IronFlexAlignment,_backendAiConsole.IronFlexFactors,_backendAiConsole.IronPositioning,_backendAiConsole.css`
      `]}render(){return _backendAiConsole.html$3`
      <div>
        <mwc-button class="green wide" label="Preparing now" icon="code"></mwc-button>
      </div>
    `}static get properties(){return{active:{type:Boolean}}}constructor(){super();(0,_backendAiConsole.setPassiveTouchGestures)(!0)}shouldUpdate(){return this.active}firstUpdated(){console.log("loaded")}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback()}}customElements.define(BackendAiEnvironmentView.is,BackendAiEnvironmentView)});