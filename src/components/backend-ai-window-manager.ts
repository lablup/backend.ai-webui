/**
 @license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
 */
import BackendAIWindow from './backend-ai-window';
import './backend-ai-window';
import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export type viewType = 'win' | 'tab' | 'spa'; // SPA: single-page application, legacy mode.
export type windowType = 'win' | 'widget' | 'page';

/**
 Backend AI Window Manager

 @group Backend.AI Web UI
 @element backend-ai-window-manager
 */
@customElement('backend-ai-window-manager')
export default class BackendAIWindowManager extends LitElement {
  @state() protected windows: Record<string, BackendAIWindow> = {};
  @state() protected zOrder: string[] = [];
  // @state() protected viewMode : viewType = 'win';
  @property({ type: String }) viewMode: viewType = 'win';

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

  makeTopWindow(name) {
    if (Object.keys(this.windows).includes(name)) {
      this.windows[name].setToTop();
    }
  }

  get topWindowName(): string | null {
    // TODO: it lazy loads. Therefore it is not a newest value.
    console.log(
      'top Window: ',
      this.zOrder.length == 0 ? null : this.zOrder[this.zOrder.length - 1],
    );
    return this.zOrder.length == 0 ? null : this.zOrder[this.zOrder.length - 1];
  }

  createWindowWithURL(
    url: string,
    title: string | undefined,
    group = '',
    icon: string | undefined,
  ) {
    // const div = document.createElement('div');
    // const winTemplate = document.createElement('backend-ai-window');
    const win: BackendAIWindow = document.createElement('backend-ai-window');
    //const winTemplate = `<backend-ai-window active=true></backend-ai-window>`;
    //div.innerHTML = winTemplate;
    // const win = div.querySelector('backend-ai-window');
    if (title) {
      win.setAttribute('title', title);
    }
    if (icon) {
      win.setAttribute('icon', icon);
    }
    win.setAttribute('group', group);
    win.setAttribute('name', win.setName());
    const urlContent = document.createElement('IFRAME');
    urlContent.setAttribute('src', url);
    urlContent.setAttribute('width', '100%');
    urlContent.setAttribute('height', '100%');
    win.appendChild(urlContent);
    win.setAttribute('active', 'true');
    return win;
  }

  addWindowWithURL(
    url: string,
    title: string | undefined,
    group = '',
    icon: string | undefined,
  ) {
    const win = this.createWindowWithURL(url, title, group, icon);
    // backend-ai-window-append event let WebUI shell to add newly created window to the DOM.
    const event = new CustomEvent('backend-ai-window-append', { detail: win });
    document.dispatchEvent(event);
  }

  addWindow(win: BackendAIWindow) {
    if (!Object.keys(this.windows).includes(win.name)) {
      this.windows[win.name] = win;
      this.zOrder.push(win.name);
      // backend-ai-window-added event let window manager to add its own.
      const event = new CustomEvent('backend-ai-window-added', {
        detail: win.name,
      });
      document.dispatchEvent(event);
    }
    if (this.viewMode === 'spa' && Object.keys(this.windows).length > 1) {
      // Legacy single-page application mode closes other windows.
      this.removeOtherWindows(win);
    }
    this.reorderWindow({ detail: win.name });
  }

  removeWindow(win: BackendAIWindow) {
    if (Object.keys(this.windows).includes(win.name)) {
      if (
        this.windows[win.name].group !== '' &&
        this.windows[win.name].group !== 'system'
      ) {
        win.active = false;
        win.isTop = false;
        this.windows[win.name].remove();
      }
      // this.windows[win.name].remove();
      // win.active = false;
      win.isTop = false;
      delete this.windows[win.name];
      const index = this.zOrder.indexOf(win.name);
      if (index > -1) {
        this.zOrder.splice(index, 1);
      }
      this.syncZOrder();
      const event = new CustomEvent('backend-ai-window-removed', {
        detail: win.name,
      });
      document.dispatchEvent(event);
    }
  }
  syncZOrder() {
    let zOrder = this.zOrder;
    for (const [index, name] of this.zOrder.entries()) {
      if (!(name in this.windows)) {
        zOrder.splice(index, 1);
      }
    }
    let uniqueZOrder: Set<string> = new Set(zOrder);
    this.zOrder = Array.from(uniqueZOrder);
  }

  removeOtherWindows(win: BackendAIWindow) {
    for (const index in this.windows) {
      if (index !== win.name) {
        // this.windows[index].hide_window();
        this.windows[index].deactivate_window();
        //this.removeWindow(this.windows[index]);
      }
    }
  }

  annotateWindow(win: BackendAIWindow) {
    if (Object.keys(this.windows).includes(win.name)) {
      // @ts-ignore
      for (const [index, name] of this.zOrder.entries()) {
        if (name === win.name) {
          this.windows[name].win.style.opacity = '1';
        } else if (name in this.windows) {
          this.windows[name].win.style.opacity = '0.1';
        }
      }
    }
  }

  deannotateWindow() {
    // @ts-ignore
    for (const [index, name] of this.zOrder.entries()) {
      if (name in this.windows) {
        this.windows[name].win.style.opacity = '1';
      }
    }
  }

  reorderWindow(e) {
    const name = e.detail;
    const index = this.zOrder.indexOf(name);
    if (index > -1) {
      this.zOrder.splice(index, 1);
    }
    this.syncZOrder();
    this.zOrder.push(name);
    for (const [index, name] of this.zOrder.entries()) {
      this.windows[name]?.setPosZ(index);
      this.windows[name]?.setTabOrder(index);
      this.windows[name]?.removeAttribute('isTop');
    }
    this.windows[name]?.setAttribute('isTop', '');
  }

  setViewType(viewType: viewType = 'win') {
    // @ts-ignore
    for (const [index, name] of this.zOrder.entries()) {
      this.windows[name]?.setViewType(viewType);
    }
    this.viewMode = viewType;
  }

  constructor() {
    super();
    // @ts-ignore
    document.addEventListener('backend-ai-window-reorder', (e: CustomEvent) => {
      this.reorderWindow(e);
    });
  }
}
