/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import {render} from 'lit-html';

import './lablup-loading-spinner';
import './backend-ai-dialog';

import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column';
import '@vaadin/vaadin-icons/vaadin-icons';
import '@vaadin/vaadin-item/vaadin-item';

import '../plastics/lablup-shields/lablup-shields';

import 'weightless/button';
import 'weightless/card';
import 'weightless/dialog';
import 'weightless/snackbar';
import 'weightless/switch';
import 'weightless/textarea';
import 'weightless/textfield';
import {default as PainKiller} from "./backend-ai-painkiller";
import {BackendAiStyles} from "./backend-ai-general-styles";
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from "../plastics/layout/iron-flex-layout-classes";

@customElement("backend-ai-user-list")
export default class BackendAIUserList extends BackendAIPage {
  @property({type: Boolean}) isAdmin = false;
  @property({type: Boolean}) editMode = false;
  @property({type: Object}) users = Object();
  @property({type: Object}) userView = Object();
  @property({type: Object}) userInfo = Object();
  @property({type: Array}) userInfoGroups = Array();
  @property({type: String}) condition = 'active';
  @property({type: Object}) _boundControlRenderer = this.controlRenderer.bind(this);
  @property({type: Object}) spinner;
  @property({type: Object}) keypairs;
  @property({type: Object}) signoutUserDialog = Object();
  @property({type: String}) signoutUserName = '';
  @property({type: Object}) notification = Object();
  @property({type: Number}) _pageSize = 20;
  @property({type: Object}) userGrid = Object();
  @property({type: Number}) _currentPage = 1;
  @property({type: Number}) _totalUserCount = 0;

  constructor() {
    super();
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
          height: calc(100vh - 275px);
        }

        backend-ai-dialog h4,
        backend-ai-dialog wl-label {
          font-size: 14px;
          padding: 5px 15px 5px 12px;
          margin: 0 0 10px 0;
          display: block;
          height: 20px;
        }

        backend-ai-dialog h4 {
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

        backend-ai-dialog wl-textfield,
        backend-ai-dialog wl-textarea {
          padding-left: 15px;
          --input-font-family: var(--general-font-family);
          --input-color-disabled: #222;
          --input-label-color-disabled: #222;
          --input-label-font-size: 12px;
          --input-border-style-disabled: 1px solid #ccc;
        }

        backend-ai-dialog li {
          font-family: var(--general-font-family);
          font-size: 16px;
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

        wl-icon.pagination {
          color: var(--paper-grey-700);
        }

        wl-button.pagination {
          width: 15px;
          height: 15px;
          padding: 10 10px;
          box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.2);
          --button-bg: transparent;
          --button-bg-hover: var(--paper-red-100);
          --button-bg-active: var(--paper-red-600);
          --button-bg-active-flat: var(--paper-red-600);
        }
      `];
  }

  firstUpdated() {
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this.notification = globalThis.lablupNotification;
    this.signoutUserDialog = this.shadowRoot.querySelector('#signout-user-dialog');
    }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    this._updatePageItemSize();
    // If disconnected
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._refreshUserData();
        this.isAdmin = globalThis.backendaiclient.is_admin;
        this.userGrid = this.shadowRoot.querySelector('#user-grid');
        this._currentPage = 1;
      }, true);
    } else { // already connected
      this._refreshUserData();
      this.isAdmin = globalThis.backendaiclient.is_admin;
      this.userGrid = this.shadowRoot.querySelector('#user-grid');
      this._currentPage = 1;
    }
  }

  _updatePageItemSize() {
    let tableSize = window.innerHeight - 275 - 30;
    this._pageSize = Math.floor(tableSize / 50);
  }

  _refreshUserData() {
    let is_active = true;
    switch (this.condition) {
      case 'active':
        is_active = true;
        break;
      default:
        is_active = false;
    }
    this.spinner.hide();
    this._updatePageItemSize();
    let fields = ['email', 'username', 'password', 'need_password_change', 'full_name', 'description', 'is_active', 'domain_name', 'role', 'groups {id name}'];
    return globalThis.backendaiclient.user.list(is_active, fields).then((response) => {
      let users = response.users;
      //Object.keys(users).map((objectKey, index) => {
      //var user = users[objectKey];
      // Blank for the next impl.
      //});
      this.users = users;
      this._totalUserCount = this.users.length;
      this._updateItemsFromPage(1);
      //setTimeout(() => { this._refreshKeyData(status) }, 5000);
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
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
      groupNames = this.userInfo.groups.map((item) => {
        return item.name;
      });
      this.userInfoGroups = groupNames;
      this.shadowRoot.querySelector('#user-info-dialog').show();
    } catch (err) {
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    }
  }

  _signoutUserDialog(e) {
    const controls = e.target.closest('#controls');
    const user_id = controls['user-id'];
    this.signoutUserName = user_id;
    this.signoutUserDialog.show();
  }

  _signoutUser() {
    globalThis.backendaiclient.user.delete(this.signoutUserName).then(response => {
      this.notification.text = PainKiller.relieve('Signout finished.');
    }).catch((err) => {   // Signout failed
      console.log(err);
      if (typeof err.message !== "undefined") {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
      } else {
        this.notification.text = PainKiller.relieve('Signout failed. Check your permission and try again.');
      }
      this.notification.show();
    });
  }

  async _getUserData(user_id) {
    let fields = ['email', 'username', 'password', 'need_password_change', 'full_name', 'description', 'is_active', 'domain_name', 'role', 'groups {id name}'];
    return globalThis.backendaiclient.user.get(user_id, fields);
  }

  refresh() {
    this._refreshUserData();
  }

  _isActive() {
    return this.condition === 'active';
  }

  _elapsed(start, end) {
    var startDate = new Date(start);
    if (this.condition == 'active') {
      var endDate = new Date();
    } else {
      var endDate = new Date();
    }
    var seconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
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
    if (['-', 0, 'Unlimited', Infinity, 'Infinity'].includes(value)) {
      return '∞';
    } else {
      return value;
    }
  }

  _updateItemsFromPage(page) {
    if (typeof page !== 'number') {
      let page_action = page.target;
      if (page_action['role'] !== 'button') {
        page_action = page.target.closest('wl-button');
      }
      if (page_action.id === 'previous-page') {
        this._currentPage -= 1;
      } else {
        this._currentPage += 1;
      }
    }
    let start = (this._currentPage - 1) * this.userGrid.pageSize;
    let end = this._currentPage * this.userGrid.pageSize;
    this.userView = this.users.slice(start, end);
  }

  controlRenderer(root, column?, rowData?) {
    render(
      html`
        <div
          id="controls"
          class="layout horizontal flex center"
          .user-id="${rowData.item.email}">
          <wl-button fab flat inverted
            class="fg green"
            icon="assignment"
            @click="${(e) => this._showUserDetail(e)}">
            <wl-icon>assignment</wl-icon>
          </wl-button>
          <wl-button fab flat inverted
            class="fg blue"
            icon="settings"
            @click="${(e) => this._editUserDetail(e)}">
            <wl-icon>settings</wl-icon>
          </wl-button>

          ${globalThis.backendaiclient.is_superadmin && this._isActive() ? html`
            <wl-button fab flat inverted class="fg red controls-running"
                               @click="${(e) => this._signoutUserDialog(e)}">
                               <wl-icon>delete_forever</wl-icon>
            </wl-button>
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

  _saveChanges(event) {
    const username = this.shadowRoot.querySelector('#username').value,
      full_name = this.shadowRoot.querySelector('#full_name').value,
      password = this.shadowRoot.querySelector('#password').value,
      confirm = this.shadowRoot.querySelector('#confirm').value,
      description = this.shadowRoot.querySelector('#description').value,
      is_active = this.shadowRoot.querySelector('#is_active').checked,
      need_password_change = this.shadowRoot.querySelector('#need_password_change').checked;

    if (password !== confirm) {
      this.notification.text = "Password and Confirmation do not match.";
      this.notification.show();
      return;
    }
    let input: any = Object();

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
      this._hideDialog(event);

      this.notification.text = "No Changes Made";
      this.notification.show();

      return;
    }

    globalThis.backendaiclient.user.modify(this.userInfo.email, input)
      .then(res => {
        if (res.modify_user.ok) {
          this.shadowRoot.querySelector("#user-info-dialog").hide();

          this.notification.text = "Successfully Modified";
          this.userInfo = {...this.userInfo, ...input, password: null};
          this._refreshUserData();
          this.shadowRoot.querySelector("#password").value = "";
          this.shadowRoot.querySelector("#confirm").value = "";
        } else {
          this.notification.text = `Error: ${res.modify_user.msg}`;

          this.shadowRoot.querySelector("#username").value = this.userInfo.username;
          this.shadowRoot.querySelector("#description").value = this.userInfo.description;
        }

        this.notification.show();
      })

  }

  render() {
    // language=HTML
    return html`
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <vaadin-grid page-size="${this._pageSize}" theme="row-stripes column-borders compact"
                   aria-label="User list" id="user-grid" .items="${this.userView}">
        <vaadin-grid-column width="40px" flex-grow="0" header="#" text-align="center"
                            .renderer="${this._indexRenderer}"></vaadin-grid-column>
        <vaadin-grid-sort-column resizable header="${_t("credential.UserID")}" path="email">
          <template>
            <div class="layout horizontal center flex">
              <div>[[item.email]]</div>
            </div>
          </template>
        </vaadin-grid-sort-column>
        <vaadin-grid-sort-column resizable header="${_t("credential.Name")}" path="username">
          <template>
            <div class="layout horizontal center flex">
              <div>[[item.username]]</div>
            </div>
          </template>
        </vaadin-grid-sort-column>
        <vaadin-grid-column resizable header="${_t("general.Control")}" .renderer="${this._boundControlRenderer}">
        </vaadin-grid-column>
      </vaadin-grid>
      <div class="horizontal center-justified layout flex" style="padding: 10px;border-top:1px solid #ccc;">
        <wl-button class="pagination" id="previous-page"
                   ?disabled="${this._currentPage === 1}"
                   @click="${(e) => {
      this._updateItemsFromPage(e)
    }}">
          <wl-icon class="pagination">navigate_before</wl-icon>
        </wl-button>
        <wl-label style="padding: 5px 15px 0px 15px;">
        ${this._currentPage} / ${Math.ceil(this._totalUserCount / this._pageSize)}</wl-label>
        <wl-button class="pagination" id="next-page"
                   ?disabled="${this._totalUserCount <= this._pageSize * this._currentPage}"
                   @click="${(e) => {
      this._updateItemsFromPage(e)
    }}">
          <wl-icon class="pagination">navigate_next</wl-icon>
        </wl-button>
      </div>
      <backend-ai-dialog id="signout-user-dialog" backdrop>
        <span slot="title">Let's double-check</span>
        <div slot="content">
          <p>You are inactivating the user <span style="color:red">${this.signoutUserName}</span>.</p>
          <p>${_t("dialog.ask.DoYouWantToProceed")}</p>
        </div>
        <div slot="footer" class="horizontal layout">
          <div class="flex"></div>
          <wl-button class="cancel" inverted flat @click="${(e) => this._hideDialog(e)}">${_t("button.Cancel")}</wl-button>
          <wl-button class="ok" outlined @click="${() => this._signoutUser()}">${_t("button.Okay")}</wl-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="user-info-dialog" backdrop narrowLayout>
        <div slot="title" class="horizontal center layout">
          <span style="margin-right:15px;">${_t("credential.UserDetail")}</span>
          <lablup-shields app="" description="user" ui="flat"></lablup-shields>
        </div>
        <div slot="content" class="horizontal layout">
          <div style="width:335px;">
            <h4>${_t("credential.Information")}</h4>
            <div role="listbox" style="margin: 0;">
              <wl-textfield
                label="${_t("credential.UserID")}"
                disabled
                value="${this.userInfo.email}">
              </wl-textfield>
              <wl-textfield
                label="${_t("credential.UserName")}"
                id="username"
                ?disabled=${!this.editMode}
                value="${this.userInfo.username}">
              </wl-textfield>
              <wl-textfield
                label="${_t("credential.FullName")}"
                id="full_name"
                ?disabled=${!this.editMode}
                value="${this.userInfo.full_name ? this.userInfo.full_name : ' '}">
              </wl-textfield>
              ${this.editMode ? html`
                <wl-textfield type="password" label="${_t("general.NewPassword")}" id="password"></wl-textfield>
                <wl-textfield type="password" label="${_t("general.ConfirmPassword")}" id="confirm"></wl-textfield>`
      : html``}
              <wl-textarea label="${_t("credential.Description")}" id="description"
                           value="${this.userInfo.description ? this.userInfo.description : ' '}"
                           ?disabled=${!this.editMode}>
              </wl-textarea>
              ${this.editMode ? html`
                <wl-label label for="is_active_label" style="margin-bottom: auto">
                 ${_t("credential.DescActiveUser")}
                </wl-label>
                <wl-label label id="is_active_label">
                  <wl-switch
                    id="is_active"
                    ?checked=${this.userInfo.is_active}>
                  </wl-switch>
                </wl-label>
                <wl-label label for="need_password_change_label" style="margin-bottom: auto">
                  ${_t("credential.DescRequirePasswordChange")}
                </wl-label>
                <wl-label label id="need_password_change_label">
                  <wl-switch id="need_password_change" ?checked=${this.userInfo.need_password_change}></wl-switch>
                </wl-label>
                <wl-button
                  class="fg green"
                  type="button"
                  outlined
                  @click=${e => this._saveChanges(e)}
                  style="width: 305px; margin: 0 15px 10px 15px; box-sizing: border-box;">
                  <wl-icon>check</wl-icon>
                  ${_t("button.SaveChanges")}
                </wl-button>` : html`
                    <wl-textfield label="${_t("credential.DescActiveUser")}" disabled
                                  value="${this.userInfo.is_active ? `Yes` : `No`}">
                    </wl-textfield>
                    <wl-textfield label="${_t("credential.DescRequirePasswordChange")}" disabled
                                  value="${this.userInfo.need_password_change ? `Yes` : `No`}">
                    </wl-textfield>
            `}
          </div>
        </div>
        ${this.editMode ? html`` : html`
          <div style="width:270px;">
            <h4>${_t("credential.Association")}</h4>
            <div role="listbox" style="margin: 0;">
              <wl-textfield
                label="${_t("credential.Domain")}"
                disabled
                value="${this.userInfo.domain_name}">
              </wl-textfield>
              <wl-textfield
                label="${_t("credential.Role")}"
                disabled
                value="${this.userInfo.role}">
              </wl-textfield>
            </div>
            <h4>${_t("credential.ProjectAndGroup")}</h4>
            <div role="listbox" style="margin: 0;">
              <ul>
              ${this.userInfoGroups.map(item => html`
                <li>${item}</li>
              `)}
              </ul>
            </div>
          </div>
        `}
        </div>
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-user-list": BackendAIUserList;
  }
}
