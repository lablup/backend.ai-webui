
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

  constructor() {
    super();
  }

  static get properties() {
    return {
      notification: {
        type: Object
      }
    }
  }

  static get is() {
    return 'backend-ai-registry-list'
  }

  firstUpdated() {
    this.notification = this.shadowRoot.querySelector('#notification');
  }

  render() {
    // language=HTML
    return html`
      <lablup-notification id="notification"></lablup-notification>

    `
  }
}

customElements.define(BackendAIRegistryList.is, BackendAIRegistryList);
