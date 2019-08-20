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
import '../plastics/lablup-shields/lablup-shields';
import '@vaadin/vaadin-progress-bar/vaadin-progress-bar';
import '@polymer/paper-progress/paper-progress';

import 'weightless/button';
import 'weightless/card';
import 'weightless/dialog';
import 'weightless/icon';
import 'weightless/textarea';
import 'weightless/textfield';
import './lablup-notification';

import { default as PainKiller } from "./backend-ai-painkiller";
import { BackendAiStyles } from "./backend-ai-console-styles";
import { IronFlex, IronFlexAlignment } from "../plastics/layout/iron-flex-layout-classes";

class BackendAIScalingGroupList extends BackendAIPage {
  public scaling_groups: any;
  public notification: any;
  public shadowRoot: any;
  public updateComplete: any;

  constructor() {
    super();
    this.active = false;
    this.scaling_groups = []
  }

  static get is() {
    return 'backend-ai-scaling-group-list';
  }

  static get properties() {
    return {
      active: {
        type: Boolean
      },
      scaling_groups: {
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

        wl-dialog wl-textfield,
        wl-dialog wl-textarea {
          margin-bottom: 20px;
          --input-font-family: Roboto, Noto, sans-serif;
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
        this.scaling_groups = res.scaling_groups;
        console.log(this.scaling_groups);
      })
    }
  }

  _indexRenderer(root, column, rowData) {
    let idx = rowData.index + 1;
    render(
      html`
        <div>${idx}</div>
      `,
      root
    );
  }

  _launchCreateDialog() {
    this.shadowRoot.querySelector("#create-scaling-group-dialog").show();
  }

  _hideDialog(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-dialog');
    dialog.hide();
  }

  _createScalingGroup() {
    const name = this.shadowRoot.querySelector("#scaling-group-name").value;
    const description = this.shadowRoot.querySelector("#scaling-group-description").value;

    window.backendaiclient.scalingGroup.create(name, description)
    .then(res => {
      console.log(res);
      if (res.ok) {
        this.notification.text = "Scaling Group Successfully Created";
      } else {
        this.notification.text = PainKiller.relieve(res.msg);
      }
      this.notification.show();
    })


  }


  render() {
    // language=HTML
    return html`
      <lablup-notification id="notification"></lablup-notification>
      <h4 class="horizontal flex center center-justified layout">
        <span>Scaling Groups</span>
        <span class="flex"></span>
        <wl-button
          class="fg blue"
          id="add-scaling-group"
          outlined
          @click=${this._launchCreateDialog}
        >
          <wl-icon>add</wl-icon>
          Create
        </wl-button>
      </h4>
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Job list" .items="${this.scaling_groups}">
        <vaadin-grid-column flex-grow="0" header="#" .renderer=${this._indexRenderer}>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="name">
          <template>
            <div> [[item.name]] </div>
          </template>
        </vaadin-grid-column>
      </vaadin-grid>
      <wl-dialog id="create-scaling-group-dialog" fixed backdrop blockscrolling>
        <wl-card elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Create Scaling Group</span>
            <div class="flex"></div>
            <wl-button class="fab" fab flat inverted @click="${e => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <form>
            <fieldset>
              <wl-textfield
                type="text"
                name="name"
                id="scaling-group-name"
                label="Scaling Group Name"
              > </wl-textfield>
              <wl-textarea
                name="description"
                id="scaling-group-description"
                label="Description"
              > </wl-textarea>
              <div class="horizontal layout center-justified">
                <wl-button class="fg blue create-button" id="create-user-button" outlined type="button"
                  @click="${this._createScalingGroup}">
                  <wl-icon>add</wl-icon>
                  Create Scaling Group
                </wl-button>
              </div>
            </fieldset>
          </form>
        </wl-card>
      </wl-dialog>
    `;
  }
}

customElements.define(BackendAIScalingGroupList.is, BackendAIScalingGroupList);
