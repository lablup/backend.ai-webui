/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, html, LitElement} from "lit-element";
import {render} from 'lit-html';

import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/hardware-icons';
import '@polymer/iron-icons/av-icons';
import '@polymer/paper-spinner/paper-spinner-lite';
import './lablup-loading-indicator';

import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column';
import '@vaadin/vaadin-icons/vaadin-icons';
import '@vaadin/vaadin-item/vaadin-item';

import '../plastics/lablup-shields/lablup-shields';

import './lablup-notification.js';
import 'weightless/card';
import 'weightless/dialog';
import 'weightless/snackbar';
import 'weightless/switch';
import 'weightless/textarea';
import 'weightless/textfield';
import {default as PainKiller} from "./backend-ai-painkiller";
import {BackendAiStyles} from "./backend-ai-console-styles";
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from "../plastics/layout/iron-flex-layout-classes";

class BackendAIUserList extends LitElement {

  constructor() {
    super();
    this.active = false;
    this.condition = 'active';
    this.users = {};
    this.isAdmin = false;
    this.userInfo = {};
    this.userInfoGroups = [];
    this._boundControlRenderer = this.controlRenderer.bind(this);
    this.editMode = false;
  }

  static get is() {
    return 'backend-ai-user-list';
  }

  static get properties() {
    return {
      active: {
        type: Boolean
      },
      condition: {
        type: String
      },
      keypairs: {
        type: Object
      },
      resourcePolicy: {
        type: Object
      },
      userInfo: {
        type: Object
      },
      users: {
        type: Object
      },
      isAdmin: {
        type: Boolean
      },
      _status: {
        type: Boolean
      },
      notification: {
        type: Object
      },
      userInfoGroups: {
        type: Object
      },
      editMode: {
        type: Boolean
      }
    };
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        vaadin-grid {
          border: 0;
          font-size: 14px;
          height: calc(100vh - 260px);
        }

        paper-item {
          height: 30px;
          --paper-item-min-height: 30px;
        }

        iron-icon {
          width: 16px;
          height: 16px;
          min-width: 16px;
          min-height: 16px;
          padding: 0;
        }

        paper-icon-button {
          --paper-icon-button: {
            width: 25px;
            height: 25px;
            min-width: 25px;
            min-height: 25px;
            padding: 3px;
            margin-right: 5px;
          };
        }

        wl-card h4,
        wl-card wl-label {
          font-size: 14px;
          padding: 5px 15px 5px 12px;
          margin: 0 0 10px 0;
          display: block;
          height: 20px;
        }

        wl-card h4 {
          border-bottom: 1px solid #DDD;
        }

        wl-label {
          font-family: Roboto;
        }

        wl-switch {
          margin-right: 15px;
        }

        vaadin-item {
          font-size: 13px;
          font-weight: 100;
        }

        div.indicator,
        span.indicator {
          font-size: 9px;
          margin-right: 5px;
        }

        div.configuration {
          width: 70px !important;
        }

        div.configuration iron-icon {
          padding-right: 5px;
        }

        wl-dialog wl-textfield,
        wl-dialog wl-textarea {
          padding-left: 15px;
          --input-font-family: Roboto, Noto, sans-serif;
          --input-color-disabled: #222;
          --input-label-color-disabled: #222;
          --input-label-font-size: 12px;
          --input-border-style-disabled: 1px solid #ccc;
        }

        wl-textfield:not([disabled]),
        wl-textarea:not([disabled]) {
          margin-bottom: 15px;
          width: 280px;
        }

        wl-button {
          --button-bg: var(--paper-light-green-50);
          --button-bg-hover: var(--paper-green-100);
          --button-bg-active: var(--paper-green-600);
          color: var(--paper-green-900);
        }
      `];
  }

  firstUpdated() {
    this.notification = this.shadowRoot.querySelector('#notification');
  }

  connectedCallback() {
    super.connectedCallback();
  }

  shouldUpdate() {
    return this.active;
  }

  attributeChangedCallback(name, oldval, newval) {
    if (name == 'active' && newval !== null) {
      this.active = true;
      this._menuChanged(true);
    } else {
      this.active = false;
      this._menuChanged(false);
    }
    super.attributeChangedCallback(name, oldval, newval);
  }

  async _menuChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    // If disconnected
    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._refreshUserData();
        this.isAdmin = window.backendaiclient.is_admin;
      }, true);
    } else { // already connected
      this._refreshUserData();
      this.isAdmin = window.backendaiclient.is_admin;
    }
  }

  _refreshUserData() {
    let status = 'active';
    let is_active = true;
    switch (this.condition) {
      case 'active':
        is_active = true;
        break;
      default:
        is_active = false;
    }
    this.shadowRoot.querySelector('#loading-indicator').hide();
    let fields = ['email', 'username', 'password', 'need_password_change', 'full_name', 'description', 'is_active', 'domain_name', 'role', 'groups {id name}'];
    return window.backendaiclient.user.list(is_active, fields).then((response) => {
      let users = response.users;
      Object.keys(users).map((objectKey, index) => {
        var user = users[objectKey];
        // Blank for the next impl.
      });
      this.users = users;
      //setTimeout(() => { this._refreshKeyData(status) }, 5000);
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.shadowRoot.querySelector('#notification').text = PainKiller.relieve(err.message);
        this.shadowRoot.querySelector('#notification').show();
      }
    });
  }

  async _editUserDetail(e) {
    this.editMode = true;
    return this._showUserDetailDialog(e);
  }

  async _showUserDetail(e) {
    this.editMode = false;
    return this._showUserDetailDialog(e);
  }

  async _showUserDetailDialog(e) {
    const controls = e.target.closest('#controls');
    const user_id = controls['user-id'];
    let groupNames;
    try {
      const data = await this._getUserData(user_id);
      this.userInfo = data.user;
      if (this.userInfo.groups !== null) {
        groupNames = this.userInfo.groups.map((item) => {
          return item.name;
        });
      } else {
        groupNames = [];
      }
      this.userInfoGroups = groupNames;
      this.shadowRoot.querySelector('#user-info-dialog').show();
    } catch (err) {
      if (err && err.message) {
        this.shadowRoot.querySelector('#notification').text = PainKiller.relieve(err.message);
        this.shadowRoot.querySelector('#notification').show();
      }
    }
  }

  async _getUserData(user_id) {
    let fields = ['email', 'username', 'password', 'need_password_change', 'full_name', 'description', 'is_active', 'domain_name', 'role', 'groups {id name}'];
    return window.backendaiclient.user.get(user_id, fields);
  }

  refresh() {
    //let user_id = window.backendaiclient_email;
    let user_id = null;
    this._refreshUserData();
  }

  _isActive() {
    return this.condition === 'active';
  }

  _deleteKey(e) {
    const termButton = e.target;
    const controls = e.target.closest('#controls');
    const accessKey = controls['access-key'];
    window.backendaiclient.keypair.delete(accessKey).then(response => {
      this.refresh();
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.shadowRoot.querySelector('#notification').text = PainKiller.relieve(err.message);
        this.shadowRoot.querySelector('#notification').show();
      }
    });
  }

  _revokeKey(e) {
    this._mutateKey(e, false);
  }

  _reuseKey(e) {
    this._mutateKey(e, true);
  }

  _mutateKey(e, is_active) {
    const termButton = e.target;
    const controls = e.target.closest('#controls');
    const accessKey = controls['access-key'];
    let original = this.keypairs.find(this._findKeyItem, accessKey);
    let input = {
      'is_active': is_active,
      'is_admin': original.is_admin,
      'resource_policy': original.resource_policy,
      'rate_limit': original.rate_limit,
      'concurrency_limit': original.concurrency_limit,
    };
    window.backendaiclient.keypair.mutate(accessKey, input).then((response) => {
      let event = new CustomEvent("backend-ai-credential-refresh", {"detail": this});
      document.dispatchEvent(event);
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.shadowRoot.querySelector('#notification').text = PainKiller.relieve(err.message);
        this.shadowRoot.querySelector('#notification').show();
      }
    });
  }

  _findKeyItem(element) {
    return element.access_key = this;
  }

  _elapsed(start, end) {
    var startDate = new Date(start);
    if (this.condition == 'active') {
      var endDate = new Date();
    } else {
      var endDate = new Date();
    }
    var seconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000, -1);
    var days = Math.floor(seconds / 86400);
    return days;
  }

  _humanReadableTime(d) {
    return new Date(d).toUTCString();
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

  _markIfUnlimited(value) {
    if (['-', 0].includes(value)) {
      return '∞';
    } else {
      return value;
    }
  }

  controlRenderer(root, column, rowData) {
    render(
      html`
            <div
              id="controls"
              class="layout horizontal flex center"
              .user-id="${rowData.item.email}"
            >
              <paper-icon-button
                class="fg green"
                icon="assignment"
                @click="${(e) => this._showUserDetail(e)}"
              ></paper-icon-button>

              <paper-icon-button
                class="fg blue"
                icon="settings"
                @click="${(e) => this._editUserDetail(e)}"
              ></paper-icon-button>

              ${this.isAdmin && this._isActive() && rowData.item.is_admin ? html`
                    <paper-icon-button class="fg blue controls-running" icon="delete"
                                       @click="${(e) => this._revokeKey(e)}"></paper-icon-button>
                    <paper-icon-button class="fg red controls-running" icon="icons:delete-forever"
                                       @click="${(e) => this._deleteKey(e)}"></paper-icon-button>
              ` : html``}

              ${this._isActive() ? html`
                  <paper-icon-button class="fg blue controls-running" icon="icons:redo"
                                     on-tap="_reuseKey"></paper-icon-button>
              ` : html``}
            </div>
      `, root
    );
  }

  _hideDialog(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-dialog');
    dialog.hide();
  }

  _saveChanges(e) {
    const username             = this.shadowRoot.querySelector('#username').value,
          full_name            = this.shadowRoot.querySelector('#full_name').value,
          password             = this.shadowRoot.querySelector('#password').value,
          confirm              = this.shadowRoot.querySelector('#confirm').value,
          description          = this.shadowRoot.querySelector('#description').value,
          is_active            = this.shadowRoot.querySelector('#is_active').checked,
          need_password_change = this.shadowRoot.querySelector('#need_password_change').checked;

    if (password !== confirm) {
      this.shadowRoot.querySelector("#notification").text = "Password and Confirmation do not match.";
      this.shadowRoot.querySelector("#notification").show();

      return;
    }

    let input = {};

    if (password !== '')
      input.password = password;

    if (username !== this.userInfo.username)
      input.username = username;

    if (full_name !== this.userInfo.full_name)
      input.full_name = full_name;

    if (description !== this.userInfo.description)
      input.description = description;

    if (need_password_change !== this.userInfo.need_password_change)
      input.need_password_change = need_password_change;

    if (is_active !== this.userInfo.is_active)
      input.is_active = is_active;

    if (Object.entries(input).length === 0) {
      this._hideDialog(e);

      this.shadowRoot.querySelector("#notification").text = "No Changes Made";
      this.shadowRoot.querySelector("#notification").show();

      return;
    }

    window.backendaiclient.user.modify(this.userInfo.email, input)
    .then(res => {
      if (res.modify_user.ok) {
        this._hideDialog(e);

        this.shadowRoot.querySelector("#notification").text = "Successfully Modified";
        this.userInfo = {...this.userInfo, ...input, password: null};
        this._refreshUserData();
      } else {
        this.shadowRoot.querySelector("#notification").text = `Error: ${res.modify_user.msg}`;

        this.shadowRoot.querySelector("#username").value = this.userInfo.username;
        this.shadowRoot.querySelector("#description").value = this.userInfo.description;
      }

      this.shadowRoot.querySelector("#notification").show();
    })

  }

  render() {
    // language=HTML
    return html`
      <lablup-notification id="notification"></lablup-notification>
      <lablup-loading-indicator id="loading-indicator"></lablup-loading-indicator>
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="User list"
                   id="user-grid" .items="${this.users}">
        <vaadin-grid-column width="40px" flex-grow="0" header="#" .renderer="${this._indexRenderer}"></vaadin-grid-column>
        <vaadin-grid-sort-column resizable header="User ID" path="email">
          <template>
            <div class="layout horizontal center flex">
              <div class="indicator">[[item.email]]</div>
            </div>
          </template>
        </vaadin-grid-sort-column>
        <vaadin-grid-sort-column resizable header="Name" path="username">
          <template>
            <div class="layout horizontal center flex">
              <div class="indicator">[[item.username]]</div>
            </div>
          </template>
        </vaadin-grid-sort-column>
        <vaadin-grid-column resizable header="Control" .renderer="${this._boundControlRenderer}">
        </vaadin-grid-column>
      </vaadin-grid>
      <wl-dialog id="user-info-dialog" fixed backdrop blockscrolling>
        <wl-card elevation="0" class="intro" style="margin: 0;">
          <h3 class="horizontal center layout" style="border-bottom:1px solid #ddd;">
            <span style="margin-right:15px;">User Detail</span>
            <lablup-shields app="" description="user" ui="flat"></lablup-shields>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <div class="horizontal layout">
            <div style="width:335px;">
              <h4>Information</h4>
              <div role="listbox" style="margin: 0;">
                <wl-textfield
                  label="User ID"
                  disabled
                  value="${this.userInfo.email}"
                ></wl-textfield>
                <wl-textfield
                  label="User name"
                  id="username"
                  ?disabled=${!this.editMode}
                  value="${this.userInfo.username}"
                ></wl-textfield>
                <wl-textfield
                  label="Full name"
                  id="full_name"
                  ?disabled=${!this.editMode}
                  value="${this.userInfo.full_name ? this.userInfo.full_name : ' '}"
                ></wl-textfield>
                ${
                  this.editMode
                  ? html`
                      <wl-textfield type="password" label="New Password" id="password"></wl-textfield>
                      <wl-textfield type="password" label="Confirm" id="confirm"></wl-textfield>
                    `
                  : html``
                }
                <wl-textarea
                  label="Description"
                  id="description"
                  value="${this.userInfo.description ? this.userInfo.description : ' '}"
                  ?disabled=${!this.editMode}
                >
                </wl-textarea>

                ${this.editMode
                  ? html`
                      <wl-label label for="is_active_label" style="margin-bottom: auto">
                        Active user?
                      </wl-label>
                      <wl-label label id="is_active_label">
                        <wl-switch
                          id="is_active"
                          ?checked=${this.userInfo.is_active}
                        ></wl-switch>
                      </wl-label>
                      <wl-label label for="need_password_change_label" style="margin-bottom: auto">
                        Require password change?
                      </wl-label>
                      <wl-label label id="need_password_change_label">
                        <wl-switch id="need_password_change" ?checked=${this.userInfo.need_password_change}></wl-switch>
                      </wl-label>
                      <wl-button
                        class="fg green"
                        type="button"
                        outlined
                        @click=${(e) => this._saveChanges(e)}
                        style="width: 100%; box-sizing: border-box;"
                      >
                        <wl-icon>check</wl-icon>
                        Save Changes
                      </wl-button>
                    `
                  : html`
                      <wl-textfield
                        label="Active user?"
                        disabled
                        value="${this.userInfo.is_active ? `Yes` : `No`}"
                      ></wl-textfield>
                      <wl-textfield
                        label="Require password change?"
                        disabled
                        value="${this.userInfo.need_password_change ? `Yes` : `No`}"
                      ></wl-textfield>
                    `
                }
              </div>
            </div>
            ${this.editMode
              ? html``
              : html`
                <div style="width:270px;">
                  <h4>Association</h4>
                  <div role="listbox" style="margin: 0;">
                    <vaadin-item>
                      <div><strong>Domain</strong></div>
                      <div secondary>${this.userInfo.domain_name}</div>
                    </vaadin-item>
                    <vaadin-item>
                      <div><strong>Role</strong></div>
                      <div secondary>${this.userInfo.role}</div>
                    </vaadin-item>
                    <vaadin-item>
                      <div><strong>Groups</strong></div>
                      <div secondary>
                      <ul>
                      ${this.userInfoGroups.map(item => html`
                        <li>${item}</li>
                      `)}
                      </ul>
                      </div>
                    </vaadin-item>
                  </div>
                </div>
                `
            }
          </div>
        </wl-card>
      </wl-dialog>
    `;
  }
}

customElements.define(BackendAIUserList.is, BackendAIUserList);
