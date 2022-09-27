/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import BackendAIWindow from './backend-ai-window';
import './backend-ai-window';

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

  has(name) {
    return Object.keys(this.windows).includes(name);
  }

  addWindowWithURL(url: string) {
    //this.shadowRoot.appendChild();
    console.log('Add window with URL:', url);
    let div = document.createElement('div');
    let winTemplate = `<backend-ai-window active=true title="test"></backend-ai-window>`;
    div.innerHTML = winTemplate;
    let win : BackendAIWindow | null = div.querySelector('backend-ai-window');
    win?.setAttribute('title',"test3");
    let urlContent = document.createElement("IFRAME");
    urlContent.setAttribute("src", url);
    urlContent.setAttribute("width", '100%');
    urlContent.setAttribute("height", '100%');

    win?.appendChild(urlContent);

    //win?.loadURL(url);
    const event = new CustomEvent('backend-ai-window-append', {'detail': div});
    document.dispatchEvent(event);

    //document.body.appendChild(div); //document.body.insertAdjacentHTML("beforeend" , html);
    //win.loadURL(url);
    //win.active = true;
    //win.title = "test";
    //console.log( win);
    //this.addWindow(win);
  }

  addWindow(win: BackendAIWindow) {
    if(!Object.keys(this.windows).includes(win.name)) {
      this.windows[win.name] = win;
      const event = new CustomEvent('backend-ai-window-added', {'detail': win.name});
      document.dispatchEvent(event);
    }
    console.log("Active windows:", this.windows);
  }

  removeWindow(win: BackendAIWindow) {
    if(Object.keys(this.windows).includes(win.name)) {
      delete this.windows[win.name];
      const event = new CustomEvent('backend-ai-window-removed', {'detail': win.name});
      document.dispatchEvent(event);
    }
  }
  render() {
    // language=HTML
    return html`
    `;
  }
}

