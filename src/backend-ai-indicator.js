/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-progress/paper-progress';
import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';


class BackendAIIndicator extends PolymerElement {
  static get is() {
    return 'backend-ai-indicator';
  }

  static get properties() {
    return {
      value: {
        type: Number,
        value: 0
      },
      text: {
        type: String,
        default: ''  // finished, running, archived
      }
    };
  }

  ready() {
    super.ready();
  }

  connectedCallback() {
    super.connectedCallback();
    afterNextRender(this, function () {
    });
  }

  start() {
    this.value = 0;
    this.text = 'Initializing...';
    this.$['app-progress-dialog'].open();
  }

  set(value, text = '') {
    this.value = value;
    this.text = text;
  }

  end() {
    this.$['app-progress-dialog'].close();
  }

  static get template() {
    // language=HTML
    return html`
      <paper-dialog id="app-progress-dialog">
        <div id="app-progress-text">[[text]]</div>
        <paper-progress id="app-progress" value="[[value]]"></paper-progress>
      </paper-dialog>
    `;
  }
}

customElements.define(BackendAIIndicator.is, BackendAIIndicator);
