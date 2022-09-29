/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {LitElement, CSSResultGroup, html, css} from 'lit';
import {customElement, state, property, query} from 'lit/decorators.js';
import BackendAIWindow from './backend-ai-window';
import {BackendAiStyles} from './backend-ai-general-styles';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

/**
 Backend AI Dock

 @group Backend.AI Web UI
 @element backend-ai-dock
 */
@customElement('backend-ai-dock')
export default class BackendAIDock extends LitElement {
  @state() protected windows : Record<string, BackendAIWindow> = {};
  @property({type: Boolean, reflect: true}) active = false;
  @query('#dock') dock!: HTMLDivElement;

  constructor() {
    super();
  }

  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        #dock {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          color: #efefef;
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          border-radius: 15px;
          box-shadow: rgba(0, 0, 0, 0.25) 0 14px 28px, rgba(0, 0, 0, 0.22) 0 10px 10px;
          position:absolute;
          right: 10px;
          bottom: 10px;
          height: 80px;
          width: 0;
          overflow: hidden;
          z-index: 9999;
        }

        mwc-icon-button {
          --mdc-icon-size: 48px;
          --mdc-icon-button-size: 64px;
          padding: 8px;
        }
      `]
  };

  firstUpdated() {
    this.active = true;
    // @ts-ignore
    document.addEventListener('backend-ai-window-reorder', () => {
      let count = 0;
      globalThis.backendaiwindowmanager.zOrder.forEach(name => {
        if (globalThis.backendaiwindowmanager.windows[name]?.icon) {
          count = count + 1;
        }
      });
      this.dock.style.width = count * 80 + 'px';
      this.requestUpdate();
    });
  }
  render() {
    // language=HTML
    return html`
      <div id="dock" class="dock">
        ${globalThis.backendaiwindowmanager.zOrder.map(name =>
          globalThis.backendaiwindowmanager.windows[name]?.icon ?
            html`<mwc-icon-button><img src="${globalThis.backendaiwindowmanager.windows[name].icon}" /></mwc-icon-button>` : html``
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-dock': BackendAIDock;
  }
}
