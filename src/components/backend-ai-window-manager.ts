/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import BackendAIWindow from './backend-ai-window';

/**
 Backend AI Window Manager

 @group Backend.AI Web UI
 @element backend-ai-window-manager
 */
@customElement('backend-ai-window-manager')
export default class BackendAIWindowManager extends LitElement {
  @state() protected windows : Record<string, BackendAIWindow> = {};

  count() {
    return Object.keys(this.windows).length;
  }

  addWindow(win: BackendAIWindow) {
    if(!Object.keys(this.windows).includes(win.name)) {
      this.windows[win.name] = win;
    }
    console.log(this.windows);
  }

  removeWindow(win: BackendAIWindow) {
    if(Object.keys(this.windows).includes(win.name)) {
      delete this.windows[win.name];
    }
  }
}

