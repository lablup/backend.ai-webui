/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {css, CSSResultGroup, html, LitElement} from 'lit';
import {BackendAiStyles} from './backend-ai-general-styles';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';
import {customElement, property, state, query} from 'lit/decorators.js';
import '@material/mwc-icon-button';

type windowInfo = {
  posX: number,
  posY: number,
  width: number,
  height: number
}
type windowType = 'win' | 'widget';

/**
 Backend AI Window Shell

 This component encapsulates another component as a window form.
 Also, this component communicates with backend-ai-window-manager to implement window composition.

 @group Backend.AI Web UI
 @element backend-ai-window
 */
@customElement('backend-ai-window')
export default class BackendAIWindow extends LitElement {
 // Can be set when initializing window
  @property({type: String}) name = '';
  @property({type: Boolean, reflect: true}) active = false;
  @property({type: Number}) posX = 0;
  @property({type: Number}) posY = 0;
  @property({type: Number}) posZ = 1000;
  @property({type: String}) defaultWidth = '80%';
  @property({type: String}) defaultHeight = '';
  @property({type: String}) type : windowType = 'win';
  @property({type: String}) group = '';
  @property({type: String}) groupColor = '';
  @property({type: String}) title = '';
  @property({type: String}) icon = '';
  @property({type: Boolean}) isFullScreen = false;
  @property({type: Boolean}) isMinimized = false;
  @property({type: Boolean}) isChangingSizeByButton = false;
  @property({type: Boolean}) isTop = false;
  @property({type: URL}) url;

  @state() protected lastWindowInfo: windowInfo = {
    posX: 0,
    posY: 0,
    width: 0,
    height: 0
  };
  @state() protected mousePosX: number = 0;
  @state() protected mousePosY: number = 0;
  @state() protected distX: number = 0;
  @state() protected distY: number = 0;

  @query('#window') win!: HTMLDivElement;
  @query('#titlebar') titlebar!: HTMLDivElement;
  @query('#titlebar-center') titlebarCenter!: HTMLDivElement;
  @query('#ribbon') ribbon!: HTMLDivElement;
  @query('#content') contents!: HTMLDivElement;
  @query('#mock') mock!: HTMLDivElement;
  @query('#resize-guide') resizeGuide!: HTMLDivElement;

  constructor() {
    super();
    this.active = false;
  }

  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        div.window {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          border-radius: 5px;
          /*box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;*/
          /*box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;*/
          /*box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;*/
          box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px;
          position:absolute;
          resize: both;
          overflow: hidden;
          /*transition: visibility 1s, opacity 0.5s linear;*/
          animation: fadeIn 0.3s;
        }

        div.mock {
          position:absolute;
          z-index: 2000;
        }

        div.window > h4 {
          color: #000000;
          font-size: 14px;
          font-weight: 400;
          height: 32px;
          padding: 5px 0 0 0;
          margin: 0 0 0 0;
          border-radius: 5px 5px 0 0;
          border-bottom: 0; /*1px solid #DDD;*/
          display: flex;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          cursor: move;
          background: var(--card-background-color, #ffffff);
        }

        #titlebarCenter {
          background-color: transparent!important;
        }
        div.window > h4 > img,
        div.window > h4 > span {
          margin-left: 15px;
          z-index:2;
        }
        .button-area {
          margin-left: 15px;
          margin-right: 15px;
        }

        mwc-icon-button {
          --mdc-icon-size: 16px;
          --mdc-icon-button-size: 24px;
        }

        #content {
          background: var(--card-background-color, #ffffff);
          box-sizing: border-box;
          overflow-y:scroll;
          overflow-x:hidden;
          position:relative;
          height: calc(100% - 142px);
          border-radius: 0 0 5px 5px;
        }

        #resize-guide {
          position:absolute;
          bottom:0;
          right:0;
          color: #666666;
          z-index: 1;
          --mdc-icon-size: 24px;
          --mdc-icon-button-size: 32px;
        }

        #ribbon {
          width: 8px;
          height: 37px;
          background-color: transparent;
          position: absolute;
          border-radius: 0 5px 0 0;
          top: 0;
          right: 0px;
          z-index:1;
          /*transition: all 0.2s;*/
          cursor: pointer;
          /*right: 100px;
          border-bottom: solid 10px transparent;*/
        }

        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes fadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `]
  };

  // D&D support
  dragStart(e) {
    e.stopPropagation();
    this.mousePosX = e.pageX;
    this.mousePosY = e.pageY;
    this.distX = this.win.offsetLeft - this.mousePosX; /* Diff between mouse axis and window axis */
    this.distY = this.win.offsetTop - this.mousePosY;
    if (!this.isMinimized) {
      this.keepLastWindowInfo();
    }
    console.log("Window location: "+ (this.mousePosX + this.distX), this.mousePosY + this.distY);
    console.log("Window offset location: " + this.win.offsetLeft, this.win.offsetTop);

    /*
    this.win.style.border = '0'; //3px dotted #ccc";
    this.titlebar.style.opacity = '0';
    e.dataTransfer.effectAllowed = 'move';
    this.contents.style.opacity = '0';
    this.win.style.backgroundColor = 'transparent';*/
    this.win.style.opacity = '0';

    /* Reserved for future animated windows. */
    this.mock.style.width = this.win.offsetWidth.toString() + 'px';
    this.mock.style.height = this.win.offsetHeight.toString() + 'px';
    this.mock.style.border = '3px dotted #ccc';
    this.mock.style.position = 'absolute';
    this.moveMock(this.mousePosX + this.distX, this.mousePosY + this.distY);
    this.mock.style.display = 'block';
  }

  dragend(e) {
    e.stopPropagation();
    e.preventDefault();
    this.mousePosX = e.pageX;
    this.mousePosY = e.pageY;
    this.win.style.left = Math.max(this.mousePosX + this.distX, 1) + 'px';
    this.win.style.top = Math.max(this.mousePosY + this.distY, 1) + 'px';
    /*
    this.win.style.border = 'none';
    this.titlebar.style.opacity = '1';
    this.contents.style.opacity = '1';
    this.win.style.background = 'var(--card-background-color, #ffffff)';*/
    this.win.style.opacity = '1';
    this.mock.style.display = 'none';
  }

  dragover(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  dragleave(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  drag(e) {
    e.stopPropagation();
    e.preventDefault();
    if (this.mousePosX != e.pageX && this.mousePosY != e.pageY) {
      this.mousePosX = e.pageX;
      this.mousePosY = e.pageY;
      this.moveMock(this.mousePosX + this.distX, this.mousePosY + this.distY);
    }
  }

  moveMock(xPos, yPos) {
    // this.mock.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    this.mock.style.left = Math.max(xPos, 1) + 'px';
    this.mock.style.top = Math.max(yPos, 1) + 'px';
  }

  moveWin(xPos, yPos) {
    this.win.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
  }

  // Activation observer
  updated(changedProperties: Map<any, any>) {
    changedProperties.forEach((oldVal, propName) => {
      if (['active'].includes(propName)) {
        if (this.active === true){  // Show window
          this.activate_window();
          this.setToTop();
          this.show_window();
        } else if (this.active === false) {  // Hide window
          this.hide_window();
        }
      }
    });
  }
  // Window visualization. Do not handle manually.
  /**
   *  Show current window.
   *  This method only shows window, without changing internal workflow, including background jobs.
   */
  show_window() {
    this.win.style.visibility = 'visible';
  }

  /**
   *  Hide current window.
   *  This method only hides window, without changing internal workflow, including background jobs.
   */
  hide_window() {
    this.win.style.visibility = 'hidden';
  }

  // Window activation
  /**
   *  Activate current window.
   *
   *  This method activates window. Activation includes
   *    - Turn on `active` flag
   *    - Emit `backend-ai-active-changed` event
   *    - Register current window to window manager.
   */
  activate_window() {
    this.active = true;
    const event = new CustomEvent('backend-ai-active-changed', {'detail': this.active});
    this.dispatchEvent(event);
    globalThis.backendaiwindowmanager.addWindow(this);
  }

  /**
   *  Deactivate current window.
   *
   *  This method deactivates window. Deactivation includes
   *    - Turn off `active` flag
   *    - Emit `backend-ai-active-changed` event
   *    - Remove current window from window manager.
   */
  deactivate_window() {
    this.active = false;
    const event = new CustomEvent('backend-ai-active-changed', {'detail': this.active});
    this.dispatchEvent(event);
    globalThis.backendaiwindowmanager.removeWindow(this);
  }

  // Button controls
  close_window() {
    this.deactivate_window();
  }

  minimize_window() {
    if (this.isMinimized) {
      this.setWindow(this.lastWindowInfo['posX'] + 'px', this.lastWindowInfo['posY'] + 'px', this.lastWindowInfo['width'] + 'px', this.lastWindowInfo['height'] + 'px');
      this.isMinimized = false;
    } else {
      this.keepLastWindowInfo();
      this.hide_window();
      // this.win.style.height = '37px';
      // this.win.style.width = '200px';
      this.isMinimized = true;
    }
  }

  maximize_window() {
    console.log(this.isFullScreen);
    if (!this.isFullScreen) {
      console.log('is not a full screen');
      this.keepLastWindowInfo();
      this.contents.style.visibility = 'visible';
      console.log('is now a full screen', this.isFullScreen);
      this.setWindow('0px', '0px', '100%', 'calc(100vh - 100px)');
      this.isFullScreen = true;
    } else {
      this.setWindow(this.lastWindowInfo['posX'] + 'px', this.lastWindowInfo['posY'] + 'px', this.lastWindowInfo['width'] + 'px', this.lastWindowInfo['height'] + 'px');
      this.isFullScreen = false;
    }
  }
  // Window dimension
  setWindow(posX: string, posY: string, width: string | undefined, height: string | undefined) {
    this.win.style.left = posX;
    this.win.style.top = posY;
    if (width) {
      this.win.style.width = width;
    }
    if (height) {
      this.win.style.height = height;
    }
    return true;
  }

  get currentWindowInfo() : windowInfo {
    return {
      posX: this.win.offsetLeft,
      posY: this.win.offsetTop,
      width: this.win.offsetWidth,
      height: this.win.offsetHeight
    };
  }

  get ribbonColor() {
    const stringUniqueHash = [...this.group].reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return `hsl(${stringUniqueHash % 360}, 95%, 35%)`;
  }

  keepLastWindowInfo() {
    this.lastWindowInfo = this.currentWindowInfo;
    return true;
  }

  load_window_position() {

  }

  save_window_position() {
  }

  /**
   *  Callback when window is resized.
   *
   */
  resized() {
    /* if (this.isFullScreen) { // when shrinking from full screen to window
      this.isFullScreen = false;
      this.keepLastWindowInfo();
    }*/
    if (this.win.offsetHeight < 38) {
      this.contents.style.display = 'none';
      this.resizeGuide.style.display = 'none';
    } else {
      this.contents.style.display = 'block';
      this.resizeGuide.style.display = 'block';
    }
    this.contents.style.height = 'calc('+ this.win.offsetHeight + 'px - 38px)';
  }

  firstUpdated() {
    this.win.addEventListener('dragstart', this.dragStart.bind(this));
    this.win.addEventListener('dragover', this.dragover.bind(this));
    this.win.addEventListener('drag', this.drag.bind(this));
    this.win.addEventListener('dragleave', this.dragleave.bind(this));
    this.win.addEventListener('dragend', this.dragend.bind(this));
    new ResizeObserver((obj) => this.resized()).observe(this.win);
    if (this.posX !== 0) {
      this.win.style.left = this.posX + 'px';
    } else {
      this.win.style.left = globalThis.backendaiwindowmanager.count() * 30 + 'px';
    }
    if (this.posY !== 0) {
      this.win.style.top = this.posY + 'px';
    } else {
      this.win.style.top = globalThis.backendaiwindowmanager.count() * 30 + 'px';
    }
    this.win.style.height = 'calc(100vh - 100px - ' + this.win.offsetTop + 'px)';
    if (this.posZ !== 1000) {
      this.win.style.zIndex = this.posZ.toString();
    } else {
      this.win.style.zIndex = (globalThis.backendaiwindowmanager.count() * 10).toString();
    }
    this.win.style.width = this.defaultWidth;
    if (this.defaultHeight !== '') {
      this.win.style.height = this.defaultHeight;
    } else {
      this.contents.style.height = 'calc('+ this.win.offsetHeight + 'px - 38px)';
    }
    if (this.name === '') {
      this.name = this.setName();
    }
    this.groupColor = this.ribbonColor;
    if (this.group === '') {
      this.ribbon.style.display = 'none';
    } else {
      //this.ribbon.style.display = 'none';
      //this.ribbon.style.border = 'solid 10px ' + this.groupColor;

      this.ribbon.style.background = this.groupColor;

      //this.titlebar.style.backgroundColor = this.groupColor;
      //this.titlebar.style.borderBottom = 'solid 5px ' + this.groupColor;
    }
    globalThis.backendaiwindowmanager.addWindow(this);
  }

  setPosZ(value) {
    this.posZ = 1000 + (value * 10);
    this.win.style.zIndex = this.posZ.toString();
  }

  setName() {
    let result: string = '';
    const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength: number = characters.length;
    for ( let i = 0; i < 8; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  setToTop() {
    if (!this.isTop) {
      const event = new CustomEvent('backend-ai-window-reorder', {'detail': this.name});
      document.dispatchEvent(event);
    }
  }

  render() {
    // language=HTML
    return html`
      <div id="window" class="window" draggable="true" @click="${()=>{this.setToTop()}}">
        <h4 id="titlebar" class="horizontal center justified layout" style="font-weight:bold;"  @click="${()=>{this.setToTop()}}">
          ${this.icon ? html`
            <img src="${this.icon}" style="width: 24px; height: 24px;"/>
          `: html``}
          <span id="title"><slot name="title">${this.title}</slot></span>
          <div id="titlebar-center" class="flex"></div>
          <div id="ribbon" class="ribbon"></div>
          <div class="button-area">
            <mwc-icon-button icon="remove" @click="${()=>this.minimize_window()}"></mwc-icon-button>
            <mwc-icon-button icon="fullscreen"  @click="${()=>this.maximize_window()}"></mwc-icon-button>
            <mwc-icon-button icon="close" @click="${()=>this.close_window()}"></mwc-icon-button>
          </div>
        </h4>
        <mwc-icon-button id="resize-guide" icon="south_east" disabled></mwc-icon-button>
        <div id="content" class="content flex" draggable="false">
          <slot></slot>
        </div>
      </div>
      <div id="mock" style="display:none;"></div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-window': BackendAIWindow;
  }
}
