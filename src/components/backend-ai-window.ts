import {css, CSSResultGroup, html, LitElement} from 'lit';
import {BackendAiStyles} from './backend-ai-general-styles';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';
import {customElement, property, query} from 'lit/decorators.js';
import '@material/mwc-icon-button';

/**
 Backend AI Window

 @group Backend.AI Web UI
 @element backend-ai-window
 */

@customElement('backend-ai-window')
export default class BackendAIWindow extends LitElement {
  @property({type: Boolean}) active = false;
  @property({type: Number}) posX = 0;
  @property({type: Number}) posY = 0;
  @property({type: Number}) distX = 0;
  @property({type: Number}) distY = 0;
  @property({type: Number}) posZ = 1000;

  @query('#window') win!: HTMLDivElement;

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
          z-index: 1000;
        }

        div.window > h4 {
          background-color: #FFFFFF;
          color: #000000;
          font-size: 14px;
          font-weight: 400;
          height: 32px;
          padding: 5px 0;
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
      `]
  };

  dragStart(event) {
    this.posX = event.pageX;
    this.posY = event.pageY;
    this.distX = event.target.offsetLeft - this.posX;
    this.distY = event.target.offsetTop - this.posY;
  }

  drop(event) {
    event.stopPropagation();
    event.preventDefault();
    this.posX = event.pageX;
    this.posY = event.pageY;
    this.win.style.marginLeft = Math.max(this.posX + this.distX, -50) + 'px';
    this.win.style.marginTop = Math.max(this.posY + this.distY, 10) + 'px';
  }

  dragover(e) {
    e.stopPropagation();
    e.preventDefault();
    return false;
  }
  close_window() {

  }
  minimize_window() {

  }
  maximize_window() {

  }

  load_window_position() {

  }

  save_window_position() {
  }

  firstUpdated() {
    this.win.addEventListener('dragstart', this.dragStart.bind(this));
    this.win.addEventListener('dragover', this.dragover.bind(this));
    this.win.addEventListener('dragend', this.drop.bind(this));
    if (this.posX !== 0) {
      this.win.style.marginLeft = this.posX + 'px';
    }
    if (this.posY !== 0) {
      this.win.style.marginTop = this.posY + 'px';
    }
    this.win.style.zIndex = this.posZ.toString();
  }

  render() {
    // language=HTML
    return html`
      <div id="window" class="window" draggable="true">
        <h4 id="header" class="horizontal center justified layout" style="font-weight:bold">
          <div class="button-area">
            <mwc-icon-button id="button" icon="close"></mwc-icon-button>
            <mwc-icon-button icon="minimize"></mwc-icon-button>
            <mwc-icon-button icon="fullscreen"></mwc-icon-button>
          </div>
          <span><slot name="title"></slot></span>
          <div class="flex"></div>
        </h4>
        <div class="content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
