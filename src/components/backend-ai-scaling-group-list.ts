/**
 @license
 Copyright (c) 2015-2018 Lablup Inc. All rights reserved.
 */

import {css, html} from "lit-element";
import {render} from 'lit-html';
import {BackendAIPage} from './backend-ai-page';

import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/hardware-icons';
import '@polymer/iron-icons/av-icons';
import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid';
import '../plastics/lablup-shields/lablup-shields';
import '@vaadin/vaadin-progress-bar/vaadin-progress-bar';
import '@polymer/paper-progress/paper-progress';

import 'weightless/button';
import 'weightless/icon';
import 'weightless/card';
import './lablup-notification';

import {default as PainKiller} from "./backend-ai-painkiller";
import {BackendAiStyles} from "./backend-ai-console-styles";
import {IronFlex, IronFlexAlignment} from "../plastics/layout/iron-flex-layout-classes";

class BackendAIScalingGroupList extends BackendAIPage {
  public agents: any;
  public notification: any;
  public shadowRoot: any;
  public updateComplete: any;

  constructor() {
    super();
    this.active = false;
    this.agents = ["hello", "world"];
  }

  static get is() {
    return 'backend-ai-scaling-group-list';
  }

  static get properties() {
    return {
      active: {
        type: Boolean
      },
      agents: {
        type: Array
      },
      notification: {
        type: Object
      }
    };
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      css`
        h4 {
          font-weight: 200;
          font-size: 14px;
          margin: 0px;
          padding: 5px 15px 5px 20px;
        }

        wl-button {
          --button-bg: var(--paper-light-blue-50);
          --button-bg-hover: var(--paper-blue-100);
          --button-bg-active: var(--paper-blue-600);
        }

      `
    ];
  }

  firstUpdated() {
    this.notification = this.shadowRoot.querySelector('#notification');
  }

  connectedCallback() {
    super.connectedCallback();
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    // If disconnected
    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
      }, true);
    } else { // already connected
      window.backendaiclient.scalingGroup.list(window.backendaiclient.current_group)
        .then(res => {
          console.log(res);
        })
    }
  }


  render() {
    // language=HTML
    return html`
      <lablup-notification id="notification"></lablup-notification>
      <h4 class="horizontal flex center center-justified layout">
        <span>Scaling Groups</span>
        <span class="flex"></span>
        <wl-button class="fg blue" id="add-scaling-group" outlined>
          <wl-icon>add</wl-icon>
          Create Scaling Group
        </wl-button>
      </h4>
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Job list" .items="${this.agents}">
        <vaadin-grid-column width="40px" flex-grow="0" header="#">
          <template>
            <div> [[item]] </div>
          </template>
        </vaadin-grid-column>
      </vaadin-grid>
    `;
  }
}

customElements.define(BackendAIScalingGroupList.is, BackendAIScalingGroupList);
