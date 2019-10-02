/**
 @license
 Copyright (c) 2015-2018 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, property} from "lit-element";
import {render} from 'lit-html';
import {BackendAIPage} from './backend-ai-page';

import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/hardware-icons';
import '@polymer/iron-icons/av-icons';

import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid';
import '@vaadin/vaadin-progress-bar/vaadin-progress-bar';
import '@polymer/paper-progress/paper-progress';
import '../plastics/lablup-shields/lablup-shields';

import 'weightless/button';
import 'weightless/card';
import 'weightless/dialog';
import 'weightless/icon';
import 'weightless/label';
import 'weightless/select';
import 'weightless/switch';
import 'weightless/textarea';
import 'weightless/textfield';
import 'weightless/title';


import {default as PainKiller} from "./backend-ai-painkiller";
import {BackendAiStyles} from "./backend-ai-console-styles";
import {IronFlex, IronFlexAlignment} from "../plastics/layout/iron-flex-layout-classes";

@customElement("backend-ai-scaling-group-list")
export default class BackendAIScalingGroupList extends BackendAIPage {
  @property({type: Object}) _boundControlRenderer = this._controlRenderer.bind(this);
  @property({type: Number}) selectedIndex = 0;
  @property({type: Array}) domains = Array();
  @property({type: Array}) scalingGroups = Array();

  constructor() {
    super();
    this.active = false;
  }

  static get properties() {
    return {
      active: {
        type: Boolean
      },
      scalingGroups: {
        type: Array
      },
      notification: {
        type: Object
      },
      domain: {
        type: Array
      },
      selectedIndex: {
        type: Number
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

        wl-button.delete {
          --button-bg: var(--paper-red-50);
          --button-bg-hover: var(--paper-red-100);
          --button-bg-active: var(--paper-red-600);
          margin-top: 20px;
        }

        wl-dialog wl-textfield,
        wl-dialog wl-textarea,
        wl-dialog wl-select {
          margin-bottom: 20px;
          --input-font-family: Roboto, Noto, sans-serif;
        }

        wl-dialog wl-label {
          --label-font-family: Roboto, Noto, sans-serif;
          --label-color: #282828;
          margin-bottom: 5px;
        }

        wl-dialog wl-switch {
          margin-bottom: 20px;
          --switch-color-checked: #29b6f6;
          --switch-bg-checked: #bbdefb;
        }

        wl-select {
          --input-color-disabled: #222;
          --input-label-color-disabled: #222;
          --input-label-font-size: 12px;
          --input-border-style-disabled: 1px solid #ccc;
        }

        wl-dialog {
          --dialog-min-width: 350px;
        }
      `
    ];
  }

  firstUpdated() {
    this.notification = window.lablupNotification;
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
      window.backendaiclient.scalingGroup.list_all()
        .then(res => {
          this.scalingGroups = res.scaling_groups;
        });

      window.backendaiclient.domain.list()
        .then(({domains}) => {
          this.domains = domains;
          this.requestUpdate(); // without this render is called beforehands, so update is required
        })

    }
  }

  _activeStatusRenderer(root, column, rowData) {
    render(
      html`
        <lablup-shields
          app=""
          color=${rowData.item.is_active ? "green" : "red"}
          description=${rowData.item.is_active ? "active" : "inactive"}
          ui="flat"
        ></lablup-shields>
    `,
      root
    )
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

  _launchDialogById(id) {
    this.shadowRoot.querySelector(id).show();
  }

  _hideDialogById(id) {
    this.shadowRoot.querySelector(id).hide();
  }

  _controlRenderer(root, column, rowData) {
    render(
      html`
        <div
          id="controls"
          class="layout horizontal flex center"
        >
          <paper-icon-button
            icon="settings"
            class="fg blue"
            @click=${() => {
        this.selectedIndex = rowData.index;
        this.shadowRoot.querySelector("#modify-scaling-group-active").checked = this.scalingGroups[rowData.index].is_active;
        this._launchDialogById("#modify-scaling-group-dialog")
      }}
          ></paper-icon-button>
          <paper-icon-button
            icon="delete"
            class="fg red"
            @click=${() => {
        this.selectedIndex = rowData.index;
        this._launchDialogById("#delete-scaling-group-dialog")
      }}
          ></paper-icon-button>
        </div>
      `, root
    )
  }

  _hideDialog(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-dialog');
    dialog.hide();
  }

  _createScalingGroup() {
    const scalingGroup = this.shadowRoot.querySelector("#scaling-group-name").value,
      description = this.shadowRoot.querySelector("#scaling-group-description").value,
      domain = this.shadowRoot.querySelector("#scaling-group-domain").value;

    if (scalingGroup === "") {
      this.notification.text = "Enter valid scaling group name";
      this.notification.show();
      this._hideDialogById("#create-scaling-group-dialog");
      return;
    }

    window.backendaiclient.scalingGroup.create(scalingGroup, description)
      .then(({create_scaling_group: res}) => {
        if (res.ok) {
          return window.backendaiclient.scalingGroup.associateWithDomain(domain, scalingGroup);
        } else {
          this.notification.text = PainKiller.relieve(res.msg);
          this.notification.detail = res.msg;
          this.notification.show();

          return Promise.reject(res.msg);
        }
      })
      .then(({associate_scaling_group_with_domain: res}) => {
        if (res.ok) {
          this.notification.text = "Scaling group succesfully created";
          this._refreshList();
          this.shadowRoot.querySelector("#scaling-group-name").value = "";
          this.shadowRoot.querySelector("#scaling-group-description").value = "";
        } else {
          this.notification.text = PainKiller.relieve(res.msg);
          this.notification.detail = res.msg;
        }
        this._hideDialogById("#create-scaling-group-dialog");
        this.notification.show();
      })
      .catch(err => {
        this.notification.text = PainKiller.relieve(err);
        this._hideDialogById("#create-scaling-group-dialog");
        this.notification.show(true);
      })
  }

  _modifyScalingGroup() {
    const description = this.shadowRoot.querySelector("#modify-scaling-group-description").value,
      is_active = this.shadowRoot.querySelector("#modify-scaling-group-active").checked,
      name = this.scalingGroups[this.selectedIndex].name;

    let input = {};
    if (description !== this.scalingGroups[this.selectedIndex].description) input["description"] = description;
    if (is_active !== this.scalingGroups[this.selectedIndex].is_active) input["is_active"] = is_active;

    if (Object.keys(input).length === 0) {
      this.notification.text = "No changes made";
      this.notification.show();

      return;
    }

    window.backendaiclient.scalingGroup.modify(name, input)
      .then(({modify_scaling_group}) => {
        if (modify_scaling_group.ok) {
          this.notification.text = "Scaling group successfully modified";
          this._refreshList();
        } else {
          this.notification.text = PainKiller.relieve(modify_scaling_group.msg);
        }
        this._hideDialogById("#modify-scaling-group-dialog");
        this.notification.show();
      })
  }

  _deleteScalingGroup() {
    const name = this.scalingGroups[this.selectedIndex].name;

    if (this.shadowRoot.querySelector("#delete-scaling-group").value !== name) {
      this.notification.text = "Scaling group name does not match!";
      this._hideDialogById("#delete-scaling-group-dialog");
      this.notification.show();
      return;
    }

    window.backendaiclient.scalingGroup.delete(name)
      .then(({delete_scaling_group}) => {
        if (delete_scaling_group.ok) {
          this.notification.text = "Scaling group successfully deleted";
          this._refreshList();
          this.shadowRoot.querySelector("#delete-scaling-group").value = "";
        } else {
          this.notification.text = PainKiller.relieve(delete_scaling_group.msg);
        }

        this._hideDialogById("#delete-scaling-group-dialog");
        this.notification.show();
      })
  }

  _refreshList() {
    window.backendaiclient.scalingGroup.list()
      .then(({scaling_groups}) => {
        this.scalingGroups = scaling_groups;
        this.requestUpdate(); // without this render is called beforehands, so update is required
      })
  }

  render() {
    // languate=HTML
    return html`
      <h4 class="horizontal flex center center-justified layout">
        <span>Scaling Groups</span>
        <span class="flex"></span>
        <wl-button
          class="fg blue"
          id="add-scaling-group"
          outlined
          @click=${() => this._launchDialogById("#create-scaling-group-dialog")}
        >
          <wl-icon>add</wl-icon>
          Create
        </wl-button>
      </h4>
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Job list" .items="${this.scalingGroups}">
        <vaadin-grid-column flex-grow="0" header="#" width="40px" .renderer=${this._indexRenderer}>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="Name">
          <template>
            <div> [[item.name]] </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow"1" header="Description">
          <template>
            <div> [[item.description]] </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow"1" header="Active Status" .renderer=${this._activeStatusRenderer}>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow"1" header="Driver">
          <template>
            <div> [[item.driver]] </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow"1" header="Driver Options">
          <template>
            <div> [[item.driver_opts]] </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow"1" header="Scheduler">
          <template>
            <div> [[item.scheduler]] </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow"1" header="Scheduler Options">
          <template>
            <div> [[item.scheduler_opts]] </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow"1" header="Controls" .renderer=${this._boundControlRenderer}>
        </vaadin-grid-column>
      </vaadin-grid>
      <wl-dialog id="create-scaling-group-dialog" fixed backdrop blockscrolling>
        <wl-card elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Create Scaling Group</span>
            <div class="flex"></div>
            <wl-button class="fab" fab flat inverted @click=${e => this._hideDialog(e)}>
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <form>
            <fieldset>
              <wl-textfield
                type="text"
                id="scaling-group-name"
                label="Scaling Group Name"
              ></wl-textfield>
              <wl-textarea
                name="description"
                id="scaling-group-description"
                label="Description"
              ></wl-textarea>
              <wl-select
                id="scaling-group-domain"
                label="Select Domain"
              >
                <option disabled>Select Domain</option>
                ${this.domains.map(e => html`
                    <option value="${e.name}">
                      ${e.name}
                    </option>
                  `
    )}
              </wl-select>
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
      <wl-dialog id="modify-scaling-group-dialog" fixed backdrop blockscrolling>
        <wl-card elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Modify Scaling Group</span>
            <div class="flex"></div>
            <wl-button class="fab" fab flat inverted @click="${e => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <form>
            <fieldset>
              <wl-textarea
                id="modify-scaling-group-description"
                type="text"
                label="Description"
                value=${this.scalingGroups.length === 0 ? "" : this.scalingGroups[this.selectedIndex].description}
              ></wl-textarea>
              <wl-label for="switch">
                Active Status
              </wl-label>
              <div id="switch">
                <wl-switch
                  id="modify-scaling-group-active"
                ></wl-switch>
              </div>
              <wl-button
                class="fg blue"
                type="button"
                outlined
                style="width: 100%; box-sizing: border-box;"
                @click=${this._modifyScalingGroup}
              >
                <wl-icon>check</wl-icon>
                Save Changes
              </wl-button>
            </fieldset>
          </form>
        </wl-card>
      </wl-dialog>
      <wl-dialog id="delete-scaling-group-dialog" fixed backdrop blockscrolling>
        <wl-title slot="header" level="3" style="color: #EF1320">Warning: this cannot be undone!</wl-title>
        <div slot="content">
          <wl-textfield
            id="delete-scaling-group"
            type="text"
            label="Type Scaling Group name to delete"
          ></wl-textfield>
          <wl-button
            class="fg red delete"
            type="button"
            outlined
            style="width: 100%; box-sizing: border-box;"
            @click=${this._deleteScalingGroup}
          >
            <wl-icon>delete</wl-icon>
            Delete
          </wl-button>
        </div>
      </wl-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-scaling-group-list": BackendAIScalingGroupList;
  }
}
