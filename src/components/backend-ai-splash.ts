/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */
import {css, customElement, html, LitElement, property} from "lit-element";

import 'weightless/dialog';
import 'weightless/banner';

import 'weightless/progress-bar';
import 'weightless/title';

@customElement("backend-ai-splash")
export default class BackendAISplash extends LitElement {
  @property({type: Boolean}) show = false;
  @property({type: Object}) dialog = Object();


  constructor() {
    super();
  }

  static get styles() {
    return [
      // language=CSS
      css`
        :host > *, html {
          margin: 0;
          font-family: 'Quicksand', Roboto, sans-serif;
          background-color: rgba(244, 245, 247, 1);
        }

        .splash {
          position: absolute;
          top: calc(50% - 150px);
          left: calc(50% - 170px);
          width: 340px;
          height: 300px;
          border: 1px solid #aaa;
          border-radius: 4px;
          background-color: #ffffff;
          box-shadow: 0px 0px 3px 3px rgba(0, 0, 0, 0.2);
        }

        .splash-header {
          width: 340px;
          height: 120px;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: left top;
          background-color: RGB(246, 253, 247);
          font-size: 28px;
          font-weight: 400;
          line-height: 60px;
        }

        ul {
          list-style-type: none;
        }

        .splash-information .detail {
          font-weight: 400;
          font-size: 13px;
        }

        .loading-message {
          position: absolute;
          top: calc(50% + 100px);
          left: calc(50% - 155px);
          width: 300px;
          text-align: center;
          font-size: 18px;
        }

        .sk-folding-cube {
          margin: 20px auto;
          width: 20px;
          height: 20px;
          position: absolute;
          top: calc(50% + 100px);
          left: calc(50% - 140px);
          margin: auto;
          -webkit-transform: rotateZ(45deg);
          transform: rotateZ(45deg);
        }

        .sk-folding-cube .sk-cube {
          float: left;
          width: 50%;
          height: 50%;
          position: relative;
          -webkit-transform: scale(1.1);
          -ms-transform: scale(1.1);
          transform: scale(1.1);
        }

        .sk-folding-cube .sk-cube:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #3E872D;
          -webkit-animation: sk-foldCubeAngle 2.4s infinite linear both;
          animation: sk-foldCubeAngle 2.4s infinite linear both;
          -webkit-transform-origin: 100% 100%;
          -ms-transform-origin: 100% 100%;
          transform-origin: 100% 100%;
        }

        .sk-folding-cube .sk-cube2 {
          -webkit-transform: scale(1.1) rotateZ(90deg);
          transform: scale(1.1) rotateZ(90deg);
        }

        .sk-folding-cube .sk-cube3 {
          -webkit-transform: scale(1.1) rotateZ(180deg);
          transform: scale(1.1) rotateZ(180deg);
        }

        .sk-folding-cube .sk-cube4 {
          -webkit-transform: scale(1.1) rotateZ(270deg);
          transform: scale(1.1) rotateZ(270deg);
        }

        .sk-folding-cube .sk-cube2:before {
          -webkit-animation-delay: 0.3s;
          animation-delay: 0.3s;
        }

        .sk-folding-cube .sk-cube3:before {
          -webkit-animation-delay: 0.6s;
          animation-delay: 0.6s;
        }

        .sk-folding-cube .sk-cube4:before {
          -webkit-animation-delay: 0.9s;
          animation-delay: 0.9s;
        }

        @-webkit-keyframes sk-foldCubeAngle {
          0%, 10% {
            -webkit-transform: perspective(140px) rotateX(-180deg);
            transform: perspective(140px) rotateX(-180deg);
            opacity: 0;
          }
          25%, 75% {
            -webkit-transform: perspective(140px) rotateX(0deg);
            transform: perspective(140px) rotateX(0deg);
            opacity: 1;
          }
          90%, 100% {
            -webkit-transform: perspective(140px) rotateY(180deg);
            transform: perspective(140px) rotateY(180deg);
            opacity: 0;
          }
        }

        @keyframes sk-foldCubeAngle {
          0%, 10% {
            -webkit-transform: perspective(140px) rotateX(-180deg);
            transform: perspective(140px) rotateX(-180deg);
            opacity: 0;
          }
          25%, 75% {
            -webkit-transform: perspective(140px) rotateX(0deg);
            transform: perspective(140px) rotateX(0deg);
            opacity: 1;
          }
          90%, 100% {
            -webkit-transform: perspective(140px) rotateY(180deg);
            transform: perspective(140px) rotateY(180deg);
            opacity: 0;
          }
        }
      `];
  }

  firstUpdated() {
    this.dialog = this.shadowRoot.querySelector('wl-dialog');
  }

  connectedCallback() {
    super.connectedCallback();
  }

  show() {
    this.dialog.show();
  }

  hide() {
    this.dialog.hide();
  }

  render() {
    // language=HTML
    return html`
      <wl-dialog class="splash" fixed backdrop blockscrolling>
        <div class="splash">
          <div class="splash-header">
            <img src="manifest/backend.ai-text.svg" style="height:50px;padding:35px 20px;">
          </div>
          <div class="splash-information">
            <ul>
              <li>Backend.AI Console <span id="version-detail" class="detail"></span></li>
              <li><span id="license-detail"></span></li>
              <li><span id="mode-detail" class="detail"></span> <span id="build-detail" class="detail"></span></li>
            </ul>
          </div>

          <div class="sk-folding-cube">
            <div class="sk-cube1 sk-cube"></div>
            <div class="sk-cube2 sk-cube"></div>
            <div class="sk-cube4 sk-cube"></div>
            <div class="sk-cube3 sk-cube"></div>
          </div>
          <div class="loading-message">-</div>
        </div>
      </wl-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-splash": BackendAISplash;
  }
}
