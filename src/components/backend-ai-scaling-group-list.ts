/**
 @license
 Copyright (c) 2015-2018 Lablup Inc. All rights reserved.
 */

import {translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {render} from 'lit-html';
import {BackendAIPage} from './backend-ai-page';

import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid';
import '../plastics/lablup-shields/lablup-shields';

import 'weightless/button';
import 'weightless/card';
import 'weightless/icon';
import 'weightless/label';
import 'weightless/select';
import 'weightless/switch';
import 'weightless/textarea';
import 'weightless/textfield';
import 'weightless/title';

import './backend-ai-dialog';
import {default as PainKiller} from "./backend-ai-painkiller";
import {BackendAiStyles} from "./backend-ai-general-styles";
import {IronFlex, IronFlexAlignment} from "../plastics/layout/iron-flex-layout-classes";

/**
 Backend AI Scaling Group List

 `backend-ai-scaling-group-list` manages scaling group.

 Example:

 <backend-ai-scaling-group-list active></backend-ai-scaling-group-list>

 @group Backend.AI Console
 @element backend-ai-scaling-group-list
 */

@customElement("backend-ai-scaling-group-list")
export default class BackendAIScalingGroupList extends BackendAIPage {
  @property({type: Object}) _boundControlRenderer = this._controlRenderer.bind(this);
  @property({type: Number}) selectedIndex = 0;
  @property({type: Array}) domains = Array();
  @property({type: Array}) scalingGroups = Array();
  @property({type: Array}) schedulerTypes = Array();

  constructor() {
    super();
    this.active = false;
    this.schedulerTypes = ['fifo', 'lifo', 'drf'];
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

        backend-ai-dialog wl-textfield,
        backend-ai-dialog wl-textarea,
        backend-ai-dialog wl-select {
          margin-bottom: 20px;
          --input-font-family: Roboto, Noto, sans-serif;
        }

        backend-ai-dialog wl-label {
          --label-font-family: Roboto, Noto, sans-serif;
          --label-color: #282828;
          margin-bottom: 5px;
        }

        backend-ai-dialog wl-switch {
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

        backend-ai-dialog {
          --component-min-width: 350px;
        }
      `
    ];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
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
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        globalThis.backendaiclient.scalingGroup.list_avaiable()
          .then(res => {
            this.scalingGroups = res.scaling_groups;
          });

        globalThis.backendaiclient.domain.list()
          .then(({domains}) => {
            this.domains = domains;
            this.requestUpdate(); // without this render is called beforehands, so update is required
          })
      }, true);
    } else { // already connected
      globalThis.backendaiclient.scalingGroup.list_avaiable()
        .then(res => {
          this.scalingGroups = res.scaling_groups;
        });

      globalThis.backendaiclient.domain.list()
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

  /**
   * Render control units - settings (modify-scaling-group), delete (delete-scaling-group)
   * */
  _controlRenderer(root, column, rowData) {
    render(
      html`
        <div
          id="controls"
          class="layout horizontal flex center"
        >
          <wl-button fab flat inverted
            icon="settings"
            class="fg blue"
            @click=${() => {
        this.selectedIndex = rowData.index;
        this.shadowRoot.querySelector("#modify-scaling-group-active").checked = this.scalingGroups[rowData.index].is_active;
        this._launchDialogById("#modify-scaling-group-dialog")
      }}
          ><wl-icon>settings</wl-icon></wl-button>
          <wl-button fab flat inverted
            icon="delete"
            class="fg red"
            @click=${() => {
        this.selectedIndex = rowData.index;
        this._launchDialogById("#delete-scaling-group-dialog")
      }}><wl-icon>delete</wl-icon></wl-button>
        </div>
      `, root
    )
  }

  /**
   * Create scaling group and associate scaling group with domain.
   * */
  _createScalingGroup() {
    const scalingGroup = this.shadowRoot.querySelector("#scaling-group-name").value,
      description = this.shadowRoot.querySelector("#scaling-group-description").value,
      domain = this.shadowRoot.querySelector("#scaling-group-domain").value;

    if (scalingGroup === "") {
      this.notification.text = "Enter valid Resource group name";
      this.notification.show();
      this._hideDialogById("#create-scaling-group-dialog");
      return;
    }

    globalThis.backendaiclient.scalingGroup.create(scalingGroup, description)
      .then(({create_scaling_group: res}) => {
        if (res.ok) {
          return globalThis.backendaiclient.scalingGroup.associate_domain(domain, scalingGroup);
        } else {
          this.notification.text = PainKiller.relieve(res.title);
          this.notification.detail = res.msg;
          this.notification.show();
          return Promise.reject(res.msg);
        }
      })
      .then(({associate_scaling_group_with_domain: res}) => {
        if (res.ok) {
          this.notification.text = "Resource group succesfully created";
          this._refreshList();
          this.shadowRoot.querySelector("#scaling-group-name").value = "";
          this.shadowRoot.querySelector("#scaling-group-description").value = "";
        } else {
          this.notification.text = PainKiller.relieve(res.title);
          this.notification.detail = res.msg;
        }
        this._hideDialogById("#create-scaling-group-dialog");
        this.notification.show();
      })
      .catch(err => {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err;
        this._hideDialogById("#create-scaling-group-dialog");
        this.notification.show(true, err);
      })
  }

  /**
   * Modify scaling group such as description, scheduler, is_active, and name.
   * */
  _modifyScalingGroup() {
    const description = this.shadowRoot.querySelector("#modify-scaling-group-description").value,
      scheduler = this.shadowRoot.querySelector("#modify-scaling-group-scheduler").value,
      is_active = this.shadowRoot.querySelector("#modify-scaling-group-active").checked,
      name = this.scalingGroups[this.selectedIndex].name;

    let input = {};
    if (description !== this.scalingGroups[this.selectedIndex].description) input["description"] = description;
    if (scheduler !== this.scalingGroups[this.selectedIndex].scheduler) input["scheduler"] = scheduler;
    if (is_active !== this.scalingGroups[this.selectedIndex].is_active) input["is_active"] = is_active;

    if (Object.keys(input).length === 0) {
      this.notification.text = "No changes made";
      this.notification.show();
      return;
    }

    globalThis.backendaiclient.scalingGroup.update(name, input)
      .then(({modify_scaling_group}) => {
        if (modify_scaling_group.ok) {
          this.notification.text = "Resource group successfully modified";
          this._refreshList();
        } else {
          this.notification.text = PainKiller.relieve(modify_scaling_group.msg);
          this.notification.detail = modify_scaling_group.msg;
        }
        this._hideDialogById("#modify-scaling-group-dialog");
        this.notification.show();
      })
  }

  _deleteScalingGroup() {
    const name = this.scalingGroups[this.selectedIndex].name;

    if (this.shadowRoot.querySelector("#delete-scaling-group").value !== name) {
      this.notification.text = "Resource group name does not match!";
      this._hideDialogById("#delete-scaling-group-dialog");
      this.notification.show();
      return;
    }

    globalThis.backendaiclient.scalingGroup.delete(name)
      .then(({delete_scaling_group}) => {
        if (delete_scaling_group.ok) {
          this.notification.text = "Resource group successfully deleted";
          this._refreshList();
          this.shadowRoot.querySelector("#delete-scaling-group").value = "";
        } else {
          this.notification.text = PainKiller.relieve(delete_scaling_group.msg);
          this.notification.detail = delete_scaling_group.msg;
        }

        this._hideDialogById("#delete-scaling-group-dialog");
        this.notification.show();
      })
  }

  _refreshList() {
    globalThis.backendaiclient.scalingGroup.list_avaiable()
      .then(({scaling_groups}) => {
        this.scalingGroups = scaling_groups;
        this.requestUpdate(); // without this render is called beforehands, so update is required
      })
  }

  render() {
    // languate=HTML
    return html`
      <h4 class="horizontal flex center center-justified layout">
        <span>${_t("resourceGroup.ResourceGroups")}</span>
        <span class="flex"></span>
        <wl-button
          class="fg blue"
          id="add-scaling-group"
          outlined
          @click=${() => this._launchDialogById("#create-scaling-group-dialog")}
        >
          <wl-icon>add</wl-icon>
          ${_t("button.Add")}
        </wl-button>
      </h4>
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Job list" .items="${this.scalingGroups}">
        <vaadin-grid-column flex-grow="0" header="#" width="40px" .renderer=${this._indexRenderer}>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t("resourceGroup.Name")}">
          <template>
            <div> [[item.name]] </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t("resourceGroup.Description")}">
          <template>
            <div> [[item.description]] </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t("resourceGroup.ActiveStatus")}" .renderer=${this._activeStatusRenderer}>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t("resourceGroup.Driver")}">
          <template>
            <div> [[item.driver]] </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t("resourceGroup.DriverOptions")}">
          <template>
            <div> [[item.driver_opts]] </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t("resourceGroup.Scheduler")}">
          <template>
            <div> [[item.scheduler]] </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t("resourceGroup.SchedulerOptions")}">
          <template>
            <div> [[item.scheduler_opts]] </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t("general.Control")}" .renderer=${this._boundControlRenderer}>
        </vaadin-grid-column>
      </vaadin-grid>
      <backend-ai-dialog id="create-scaling-group-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t("resourceGroup.CreateResourceGroup")}</span>

        <div slot="content" class="login-panel intro centered">
          <wl-textfield
            type="text"
            id="scaling-group-name"
            label="${_t("resourceGroup.ResourceGroupName")}"
          ></wl-textfield>
          <wl-textarea
            name="description"
            id="scaling-group-description"
            label="${_t("resourceGroup.Description")}"
          ></wl-textarea>
          <wl-select
            id="scaling-group-domain"
            label="${_t("resourceGroup.SelectDomain")}"
          >
            <option disabled>${_t("resourceGroup.SelectDomain")}</option>
            ${this.domains.map(e => html`
                <option value="${e.name}">
                  ${e.name}
                </option>
              `
    )}
          </wl-select>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <wl-button class="fg blue create-button" id="create-user-button" outlined type="button"
            @click="${this._createScalingGroup}">
            <wl-icon>add</wl-icon>
            ${_t("button.Create")}
          </wl-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="modify-scaling-group-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t("resourceGroup.ModifyResourceGroup")}</span>

        <div slot="content" class="login-panel intro centered">
          <wl-textarea
            id="modify-scaling-group-description"
            type="text"
            label="Description"
            value=${this.scalingGroups.length === 0 ? "" : this.scalingGroups[this.selectedIndex].description}
          ></wl-textarea>
          <wl-select id="modify-scaling-group-scheduler" label="Select scheduler"
              value="${this.scalingGroups.length === 0 ? "" : this.scalingGroups[this.selectedIndex].scheduler}">
            <option disabled>Select Scheduler</option>
            ${this.schedulerTypes.map(sched => html`
              <option value="${sched}">${sched}</option>
            `)}
          </wl-select>
          <wl-label for="switch">
            ${_t("resourceGroup.ActiveStatus")}
          </wl-label>
          <div id="switch">
            <wl-switch
              id="modify-scaling-group-active"
            ></wl-switch>
          </div>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <wl-button
            class="fg blue"
            type="button"
            outlined
            style="width: 100%; box-sizing: border-box;"
            @click=${this._modifyScalingGroup}
          >
            <wl-icon>check</wl-icon>
            ${_t("button.Save")}
          </wl-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="delete-scaling-group-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t("dialog.warning.CannotBeUndone")}</span>
        <div slot="content">
          <wl-textfield
            id="delete-scaling-group"
            type="text"
            label="${_t("resourceGroup.TypeResourceGroupNameToDelete")}"
          ></wl-textfield>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <wl-button
            class="fg red delete"
            type="button"
            outlined
            style="width: 100%; box-sizing: border-box;"
            @click=${this._deleteScalingGroup}
          >
            <wl-icon>delete</wl-icon>
            ${_t("button.Delete")}
          </wl-button>
        </div>
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-scaling-group-list": BackendAIScalingGroupList;
  }
}
