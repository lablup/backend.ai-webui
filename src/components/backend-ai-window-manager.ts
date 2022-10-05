/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {LitElement} from 'lit';
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
  @state() protected zOrder : string[] = [];

  count() {
    return Object.keys(this.windows).length;
  }

  has(name) {
    return Object.keys(this.windows).includes(name);
  }

  showWindow(name) {
    if (Object.keys(this.windows).includes(name)) {
      this.windows[name].show_window();
    }
  }

  hideWindow(name) {
    if (Object.keys(this.windows).includes(name)) {
      this.windows[name].hide_window();
    }
  }

  addWindowWithURL(url: string, title: string | undefined, group = '', icon: string | undefined) {
    const div = document.createElement('div');
    const winTemplate = `<backend-ai-window active=true></backend-ai-window>`;
    div.innerHTML = winTemplate;
    const win : BackendAIWindow | null = div.querySelector('backend-ai-window');
    if (title) {
      win?.setAttribute('title', title);
    }
    if (icon) {
      win?.setAttribute('icon', icon);
    }
    win?.setAttribute('group', group);
    const urlContent = document.createElement('IFRAME');
    urlContent.setAttribute('src', url);
    urlContent.setAttribute('width', '100%');
    urlContent.setAttribute('height', '100%');
    win?.appendChild(urlContent);
    const event = new CustomEvent('backend-ai-window-append', {'detail': div});
    document.dispatchEvent(event);
  }

  addWindow(win: BackendAIWindow) {
    if (!Object.keys(this.windows).includes(win.name)) {
      this.windows[win.name] = win;
      this.zOrder.push(win.name);
      const event = new CustomEvent('backend-ai-window-added', {'detail': win.name});
      document.dispatchEvent(event);
    }
    console.log('Active windows:', this.windows);
  }

  removeWindow(win: BackendAIWindow) {
    if (Object.keys(this.windows).includes(win.name)) {
      delete this.windows[win.name];
      const index = this.zOrder.indexOf(win.name);
      if (index > -1) {
        this.zOrder.splice(index, 1);
      }
      const event = new CustomEvent('backend-ai-window-removed', {'detail': win.name});
      document.dispatchEvent(event);
    }
  }

  annotateWindow(win: BackendAIWindow) {
    if (Object.keys(this.windows).includes(win.name)) {
      // @ts-ignore
      for (const [index, name] of this.zOrder.entries()) {
        if (name === win.name) {
          this.windows[name].win.style.opacity = '1';
        } else {
          this.windows[name].win.style.opacity = '0.1';
        }
      }
    }
  }

  deannotateWindow() {
    // @ts-ignore
    for (const [index, name] of this.zOrder.entries()) {
      this.windows[name].win.style.opacity = '1';
    }
  }

  reorderWindow(e) {
    const name = e.detail;
    const index = this.zOrder.indexOf(name);
    if (index > -1) {
      this.zOrder.splice(index, 1);
    }
    this.zOrder.push(name);
    for (const [index, name] of this.zOrder.entries()) {
      this.windows[name]?.setPosZ(index);
      this.windows[name]?.removeAttribute('isTop');
    }
    this.windows[name]?.setAttribute('isTop', '');
  }
  constructor() {
    super();
    // @ts-ignore
    document.addEventListener('backend-ai-window-reorder', (e: CustomEvent) => {
      this.reorderWindow(e);
    });
  }
}

