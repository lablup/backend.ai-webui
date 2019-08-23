
/**
 @license
 Copyright (c) 2015-2018 Lablup Inc. All rights reserved.
 */

import { css, html } from "lit-element";
import { render } from 'lit-html';
import { BackendAIPage } from './backend-ai-page';

import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/hardware-icons';
import '@polymer/iron-icons/av-icons';

import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid';
import '@vaadin/vaadin-progress-bar/vaadin-progress-bar';
import '@polymer/paper-progress/paper-progress';
import '../plastics/lablup-shields/lablup-shields';

import { default as PainKiller } from "./backend-ai-painkiller";
import { BackendAiStyles } from "./backend-ai-console-styles";
import { IronFlex, IronFlexAlignment } from "../plastics/layout/iron-flex-layout-classes";
import './lablup-notification';

class BackendAIRegistryList extends BackendAIPage {
  public notification: any;
  public active: any;

  constructor() {
    super();

    this.active = false;
  }

  static get properties() {
    return {
      active: {
        type: Boolean
      },
      notification: {
        type: Object
      }
    }
  }

  static get is() {
    return 'backend-ai-registry-list'
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
          --button-bg: var(--paper-yellow-50);
          --button-bg-hover: var(--paper-yellow-100);
          --button-bg-active: var(--paper-yellow-600);
        }
      `
    ];
  }

  firstUpdated() {
    this.notification = this.shadowRoot.querySelector('#notification');
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    // If disconnected
  }

  render() {
    const list = ['a', 'b', 'c'];
    // language=HTML
    return html`
      <lablup-notification id="notification"></lablup-notification>
      <h4 class="horizontal flex center center-justified layout">
        <span>Registries</span>
        <span class="flex"></span>
        <wl-button
          class="fg orange"
          id="add-registry"
          outlined
        >
          <wl-icon>add</wl-icon>
          Create
        </wl-button>
      </h4>

      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Job list" .items="${list}">
        <vaadin-grid-column flex-grow="1" header="#">
          <template>
            <div>
              [[item]]
            </div>
          </template>
        </vaadin-grid-column>
      </vaadin-grid>
    `
  }
}

customElements.define(BackendAIRegistryList.is, BackendAIRegistryList);
