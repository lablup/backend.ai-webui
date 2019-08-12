import {css, html, LitElement} from "lit-element";
import '@polymer/paper-icon-button/paper-icon-button';
import 'weightless/card';

import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

class LablupActivityPanel extends LitElement {
	public title: any;
	public elevation: any;
	public message: any;
	public panelId: any;
	public width: any;
	public horizontalsize: any;
	public marginWidth: any;
	public pinned: any;
	public shadowRoot: any;
	public minwidth: any;
	public maxwidth: any;

  constructor() {
    super();
    this.title = '';
    this.elevation = 1;
    this.message = '';
    this.panelId = '';
    this.width = 280;
    this.horizontalsize = '';
    this.marginWidth = 16;
  }

  static get is() {
    return 'lablup-activity-panel';
  }

  static get styles() {
    return [
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        wl-card {
          display: block;
          background: white;
          box-sizing: border-box;
          margin: 16px;
          padding: 0;
          border-radius: 5px;
        }

        wl-card > h4 {
          border-left: 3px solid var(--paper-green-900);
          background-color: var(--paper-green-500);
          color: #eee;
          font-size: 14px;
          font-weight: 400;
          height: 32px;
          padding: 5px 15px 5px 20px;
          margin: 0 0 10px 0;
          border-bottom: 1px solid #DDD;
          @apply --layout-justified;
          display: flex;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        wl-card > div {
          margin: 20px;
          padding-bottom: 20px;
          font-size: 12px;
          padding-left: 3px;
        }

        wl-card > h4 > paper-icon-button {
          display: flex;
        }

        wl-card > h4 > paper-icon-button,
        wl-card > h4 > paper-icon-button #icon {
          width: 15px;
          height: 15px;
          padding: 0;
        }

        ul {
          padding-inline-start: 0;
        }

        #button {
          display: none;
        }
      `];
  }

  static get properties() {
    return {
      title: {
        type: String
      },
      elevation: {
        type: Number
      },
      message: {
        type: String
      },
      panelId: {
        type: String
      },
      pinned: {
        type: Boolean
      },
      minwidth: {
        type: Number
      },
      maxwidth: {
        type: Number
      },
      width: {
        type: Number,
        value: 280
      },
      horizontalsize: {
        type: String
      },
      marginWidth: {
        type: Number,
        value: 16
      }
    }
  }

  render() {
    // language=HTML
    return html`
      <wl-card id="activity" elevation="${this.elevation}">
        <h4 class="layout flex justified center">${this.title}
          <paper-icon-button id="button" icon="close"></paper-icon-button>
        </h4>
        <div>
          <slot name="message"></slot>
        </div>
      </wl-card>
    `;
  }

  firstUpdated() {
    if (this.pinned || this.panelId == undefined) {
      const button = this.shadowRoot.getElementById('button');
      this.shadowRoot.querySelector('h4').removeChild(button);
    } else {
      this.shadowRoot.querySelector('#button').addEventListener('tap', this._removePanel.bind(this));
    }
    this.shadowRoot.querySelector('wl-card').style.width = this.width + "px";
    if (this.minwidth) {
      this.shadowRoot.querySelector('wl-card').style.minWidth = this.minwidth + "px";
    }
    if (this.maxwidth) {
      this.shadowRoot.querySelector('wl-card').style.minWidth = this.maxwidth + "px";
    }
    if (this.horizontalsize) {
      if (this.horizontalsize == '2x') {
        this.shadowRoot.querySelector('wl-card').style.width = (this.width * 2 + 32) + "px";
      }
      if (this.horizontalsize == '3x') {
        this.shadowRoot.querySelector('wl-card').style.width = (this.width * 3 + 32) + "px";
      }
    }
    this.shadowRoot.querySelector('wl-card').style.margin = this.marginWidth + "px";
  }

  connectedCallback() {
    super.connectedCallback();
  }

  _removePanel() {
  }
}

customElements.define(LablupActivityPanel.is, LablupActivityPanel);
