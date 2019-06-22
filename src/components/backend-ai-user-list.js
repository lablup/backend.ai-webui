/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, html, LitElement} from "lit-element";
import {render} from 'lit-html';
import '@polymer/iron-ajax/iron-ajax';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/hardware-icons';
import '@polymer/iron-icons/av-icons';
import '@polymer/paper-spinner/paper-spinner-lite';
import './lablup-loading-indicator';

import '@vaadin/vaadin-grid/vaadin-grid.js';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column';
import '@vaadin/vaadin-icons/vaadin-icons';
import '@vaadin/vaadin-item/vaadin-item';

import '../backend-ai-styles.js';
import '../plastics/lablup-shields/lablup-shields';

import './lablup-notification.js';
import 'weightless/card';
import 'weightless/dialog';
import 'weightless/snackbar';
import 'weightless/switch';
import 'weightless/textfield';

import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';
import {BackendAiStyles} from "./backend-ai-console-styles";
import {IronFlex, IronFlexAlignment, IronFlexFactors, IronPositioning} from "../layout/iron-flex-layout-classes";

class BackendAIUserList extends LitElement {

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
      }
    };
  }

  constructor() {
    super();
    this.active = false;
    this.condition = 'active';
    this.users = {};
    this.isAdmin = false;
    this.userInfo = {};
    this.userInfoGroups = [];
    this._boundControlRenderer = this.controlRenderer.bind(this);
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
      this._menuChanged(true);
    } else {
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
        this.shadowRoot.querySelector('#notification').text = err.message;
        this.shadowRoot.querySelector('#notification').show();
      }
    });
  }

  async _showUserDetail(e) {
    const controls = e.target.closest('#controls');
    const user_id = controls['user-id'];
    let groupNames;
    try {
      const data = await this._getUserData(user_id);
      this.userInfo = data.user;
      groupNames = this.userInfo.groups.map((item) => {
        const parsedItem = JSON.parse(item);
        return parsedItem.name;
      });
      this.userInfoGroups = groupNames;
      this.shadowRoot.querySelector('#user-info-dialog').show();
    } catch (err) {
      if (err && err.message) {
        this.shadowRoot.querySelector('#notification').text = err.message;
        this.shadowRoot.querySelector('#notification').show();
      }
    }
  }

  async _getUserData(user_id) {
    let fields = ['email', 'username', 'password', 'need_password_change', 'full_name', 'description', 'is_active', 'domain_name', 'role', 'groups'];
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
        this.shadowRoot.querySelector('#notification').text = err.message;
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
        this.shadowRoot.querySelector('#notification').text = err.message;
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

  _indexFrom1(index) {
    return index + 1;
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
            <div id="controls" class="layout horizontal flex center"
                 .user-id="${rowData.item.email}">
              <paper-icon-button class="fg green" icon="assignment"
                                 @click="${(e) => this._showUserDetail(e)}"></paper-icon-button>
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
          height: calc(100vh - 365px);
        }

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

        wl-card h4 {
          font-size: 14px;
          padding: 5px 15px 5px 12px;
          margin: 0 0 10px 0;
          display: block;
          border-bottom: 1px solid #DDD;
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

        wl-dialog wl-textfield {
          padding-left: 15px;
          --input-font-family: Roboto, Noto, sans-serif;
          --input-color-disabled: #222;
          --input-label-color-disabled: #222;
          --input-label-font-size: 12px;
          --input-border-style-disabled: 1px solid #ccc;
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <lablup-notification id="notification"></lablup-notification>
      <lablup-loading-indicator id="loading-indicator"></lablup-loading-indicator>
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="User list"
                   id="user-grid" .items="${this.users}">
        <vaadin-grid-column width="40px" flex-grow="0" resizable>
          <template class="header">#</template>
          <template>[[index]]</template>
        </vaadin-grid-column>

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
                <wl-textfield label="User ID" disabled value="${this.userInfo.email}"></wl-textfield>
                <wl-textfield label="User name" disabled value="${this.userInfo.username}"></wl-textfield>
                <wl-textfield label="Full name" disabled value="${this.userInfo.full_name}"></wl-textfield>
                <vaadin-item>
                  <div><strong>Description</strong></div>
                  <div secondary>${this.userInfo.description}</div>
                </vaadin-item>
                <wl-textfield label="Active user?" disabled value="${this.userInfo.is_active ? `Yes`:`No`}"></wl-textfield>
                <wl-textfield label="Require password change?" disabled value="${this.userInfo.need_password_change ? `Yes`:`No`}"></wl-textfield>
              </div>
            </div>
            <div style="width:335px;">
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
          </div>
        </wl-card>
      </wl-dialog>
    `;
  }
}

customElements.define(BackendAIUserList.is, BackendAIUserList);
