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
/**
 Backend AI Window

 @group Backend.AI Web UI
 @element backend-ai-window
 */

@customElement('backend-ai-window')
export default class BackendAIWindow extends LitElement {
  @property({type: String}) name = '';
  @property({type: Boolean, reflect: true}) active = false;
  @property({type: Number}) posX = 0;
  @property({type: Number}) posY = 0;
  @property({type: Number}) posZ = 1000;
  @property({type: String}) defaultWidth = '80%';
  @property({type: Boolean}) isFullScreen = false;

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
  @query('#content') content!: HTMLDivElement;
  @query('#mock') mock!: HTMLDivElement;

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
          background: var(--card-background-color, #ffffff);
          box-sizing: border-box;
          margin: 14px;
          padding: 0;
          border-radius: 5px;
          /*box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;*/
          box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
          position:absolute;
          resize: both;
          overflow: hidden;
          z-index: 1000;
        }

        div.mock {
          position:absolute;
          z-index: 2000;
        }
        div.window > h4 {
          background-color: #FFFFFF;
          color: #000000;
          font-size: 14px;
          font-weight: 400;
          height: 32px;
          padding: 5px 0 0 0;
          margin: 0 0 10px 0;
          border-radius: 5px 5px 0 0;
          border-bottom: 1px solid #DDD;
          display: flex;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          cursor: move;
        }

        .button-area {
          margin-left: 15px;
          margin-right: 15px;
        }

        mwc-icon-button {
          --mdc-icon-size: 16px;
          --mdc-icon-button-size: 24px;
        }
        .frame {
          cursor: move;
          background-color: red;
        }
        #content {
          box-sizing: border-box;
          overflow:scroll;
          position:relative;
          border-radius: 0 0 5px 5px;
        }
        #resize-guide {
          position:absolute;
          bottom:0;
          right:0;
          color: #666666;
        }
      `]
  };

  dragStart(e) {
    e.stopPropagation();
    this.mousePosX = e.pageX;
    this.mousePosY = e.pageY;
    this.distX = this.win.offsetLeft - this.mousePosX;
    this.distY = this.win.offsetTop - this.mousePosY;
    this.keepLastWindowInfo();
    console.log(this.mousePosX + this.distX, this.mousePosY + this.distY);
    console.log(this.win.offsetLeft, this.win.offsetTop);

    this.win.style.border = "3px dotted #ccc";
    e.dataTransfer.effectAllowed = 'move';
    this.content.style.opacity = '0';
    /*
    this.mock.style.width = this.winWidth.toString() + 'px';
    this.mock.style.height = this.winHeight.toString() + 'px';
    this.mock.style.border = "none";
    this.moveMock(this.mousePosX + this.distX, this.mousePosY + this.distY);
    this.mock.style.display = 'block';*/
  }

  dragend(e) {
    e.stopPropagation();
    e.preventDefault();
    this.mousePosX = e.pageX;
    this.mousePosY = e.pageY;
    //this.moveWin(Math.max(this.mousePosX + this.distX, 10), Math.max(this.mousePosY + this.distY, 10));
    this.win.style.marginLeft = Math.max(this.mousePosX + this.distX, 10) + 'px';
    this.win.style.marginTop = Math.max(this.mousePosY + this.distY, 10) + 'px';
    //console.log(this.mousePosX + this.distX, this.mousePosY + this.distY);
    //console.log(this.win.offsetLeft, this.win.offsetTop);
    this.content.style.opacity = '1';
    this.win.style.border = "none";
  }

  dragover(e) {
    e.preventDefault();
  }

  dragleave(e) {
    e.preventDefault();
  }

  drag(e) {
    e.preventDefault();
    //console.log(e.clientX,e.clientY);
    this.moveMock(this.win.offsetLeft, this.win.offsetTop);
    //this.moveWin(e.pageX + this.distX, e.pageY - this.distY);
  }

  moveMock(xPos, yPos) {
    this.mock.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
  }

  moveWin(xPos, yPos) {
      this.win.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
  }

  close_window() {
    //globalThis.backendaiwindowmanager.removeWindow(this);
    //let slots = this.shadowRoot?.querySelectorAll('slot');
    //if (slots) {
    //  console.log((slots[1] as HTMLSlotElement).assignedElements());
    //}
  }

  activate_window() {
    this.active = true;
  }

  deactivate_window() {
    this.active = false;
  }

  minimize_window() {
    this.active = false;
    console.log('minimize');
  }

  maximize_window() {
    if (this.isFullScreen === false) {
      this.keepLastWindowInfo();
      this.setWindow('0px', '0px', '100%', 'calc(100vh - 100px)');
      this.isFullScreen = true;
    } else {
      this.setWindow(this.lastWindowInfo['posX'] + 'px', this.lastWindowInfo['posY'] + 'px', this.lastWindowInfo['width'] + 'px', this.lastWindowInfo['height'] + 'px');
      this.isFullScreen = false;
    }
  }
  setWindow(posX: string, posY: string, width: string | undefined, height: string | undefined) {
    this.win.style.marginLeft = posX;
    this.win.style.marginTop = posY;
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

  keepLastWindowInfo() {
    this.lastWindowInfo = this.currentWindowInfo;
    return true;
  }

  load_window_position() {

  }

  save_window_position() {
  }

  firstUpdated() {
    this.win.addEventListener('dragstart', this.dragStart.bind(this));
    this.win.addEventListener('dragover', this.dragover.bind(this));
    this.win.addEventListener('drag', this.drag.bind(this));
    this.win.addEventListener('dragleave', this.dragleave.bind(this));
    this.win.addEventListener('dragend', this.dragend.bind(this));
    if (this.posX !== 0) {
      this.win.style.marginLeft = this.posX + 'px';
    } else {
      this.win.style.marginLeft = globalThis.backendaiwindowmanager.count() * 30 + 'px';
    }
    if (this.posY !== 0) {
      this.win.style.marginTop = this.posY + 'px';
    } else {
      this.win.style.marginTop = globalThis.backendaiwindowmanager.count() * 30 + 'px';
    }
    this.win.style.height = 'calc(100vh - 100px - ' + this.win.offsetTop + 'px)';
    if (this.posZ !== 1000) {
      this.win.style.zIndex = this.posZ.toString();
    } else {
      this.win.style.zIndex = (globalThis.backendaiwindowmanager.count() * 10).toString();
    }
    console.log(this.win.style.zIndex);
    this.win.style.width = this.defaultWidth;
    this.content.style.height = 'calc(100vh - 152px - ' + this.win.offsetTop + 'px)';
    this.name = this.setName();
    //console.log(globalThis.backendaiwindowmanager);
    globalThis.backendaiwindowmanager.addWindow(this);
    // @ts-ignore
    document.addEventListener('backend-ai-window-reorder', (e: CustomEvent) => {
      if(e.detail !== this.name) {
        this.posZ = this.posZ - (this.posZ % 10);
        this.win.style.zIndex = this.posZ.toString();
      }
    });
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
    const event = new CustomEvent('backend-ai-window-reorder', {'detail': this.name});
    document.dispatchEvent(event);
    this.posZ = globalThis.backendaiwindowmanager.count() * 10 + 1;
    this.win.style.zIndex = this.posZ.toString();
    console.log(this.posZ);
  }

  render() {
    // language=HTML
    return html`
      <div id="window" class="window" draggable="true">
        <h4 id="header" class="horizontal center justified layout" style="font-weight:bold;"  @click="${()=>{this.setToTop()}}">
          <div class="button-area">
            <mwc-icon-button id="button" icon="close" @click="${()=>this.close_window()}"></mwc-icon-button>
            <mwc-icon-button icon="minimize" @click="${()=>this.minimize_window()}"></mwc-icon-button>
            <mwc-icon-button icon="fullscreen"  @click="${()=>this.maximize_window()}"></mwc-icon-button>
          </div>
          <span><slot name="title"></slot></span>
          <div class="flex"></div>
        </h4>
        <mwc-icon-button id="resize-guide" icon="south_east"></mwc-icon-button>
        <div id="content" class="content flex" draggable="false">
          <slot></slot>
        </div>
      </div>
      <div id="mock" style="display:none;"></div>
    `;
  }
}
