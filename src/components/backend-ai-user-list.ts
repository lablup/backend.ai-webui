/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html, render} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {BackendAIPage} from './backend-ai-page';

import './backend-ai-list-status';
import './backend-ai-dialog';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-filter-column';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column';
import '@vaadin/vaadin-icons/vaadin-icons';
import '@vaadin/vaadin-item/vaadin-item';

import '../plastics/lablup-shields/lablup-shields';

import 'weightless/button';
import 'weightless/card';
import 'weightless/snackbar';
import 'weightless/switch';
import 'weightless/textarea';
import 'weightless/textfield';

import '@material/mwc-button/mwc-button';
import '@material/mwc-textfield/mwc-textfield';
import '@material/mwc-textarea/mwc-textarea';
import '@material/mwc-switch/mwc-switch';

import {default as PainKiller} from './backend-ai-painkiller';
import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

/**
 Backend AI User List

 `backend-ai-user-list` is list of user details.
 Through this, user information can be read or modified, and the user can be logged out.

 Example:

 <backend-ai-user-list>
 ...
 </backend-ai-user-list>

@group Backend.AI Web UI
 @element backend-ai-user-list
 */

@customElement('backend-ai-user-list')
export default class BackendAIUserList extends BackendAIPage {
  @property({type: Boolean}) isAdmin = false;
  @property({type: Boolean}) editMode = false;
  @property({type: Array}) users = [];
  @property({type: Object}) userInfo = Object();
  @property({type: Array}) userInfoGroups = [];
  @property({type: String}) condition = '';
  @property({type: Object}) _boundControlRenderer = this.controlRenderer.bind(this);
  @property({type: Object}) listStatus = Object();
  @property({type: Object}) _userIdRenderer = this.userIdRenderer.bind(this);
  @property({type: Object}) _userNameRenderer = this.userNameRenderer.bind(this);
  @property({type: Object}) _userStatusRenderer = this.userStatusRenderer.bind(this);
  @property({type: Object}) spinner;
  @property({type: Object}) keypairs;
  @property({type: Object}) signoutUserDialog = Object();
  @property({type: String}) signoutUserName = '';
  @property({type: Object}) notification = Object();
  @property({type: Object}) userGrid = Object();
  @property({type: String}) listCondition = 'loading';
  @property({type: Number}) _totalUserCount = 0;
  @property({type: Boolean}) isUserInfoMaskEnabled = false;
  @property({type: Object}) userStatus = {
    'active': 'Active',
    'inactive': 'Inactive',
    'before-verification': 'Before Verification',
    'deleted': 'Deleted',
  };

  constructor() {
    super();
  }

  static get styles(): CSSResultGroup | undefined {
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
        }

        backend-ai-dialog h4,
        backend-ai-dialog wl-label {
          font-size: 14px;
          padding: 5px 15px 5px 12px;
          margin: 0 0 10px 0;
          display: block;
          height: 20px;
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

        div.password-area {
          width: 100%;
          max-width: 322px;
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

        mwc-button, mwc-button[unelevated], mwc-button[outlined] {
          background-image: none;
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-theme-on-primary: var(--general-button-color);
          --mdc-typography-font-family: var(--general-font-family);
        }

        mwc-select.full-width {
          width: 100%;
          /* Need to be set when fixedMenuPosition attribute is enabled */
          --mdc-menu-max-width: 330px;
          --mdc-menu-min-width: 330px;
        }

        mwc-textfield, mwc-textarea {
          width: 100%;
          --mdc-typography-font-family: var(--general-font-family);
          --mdc-typography-textfield-font-size: 14px;
          --mdc-typography-textarea-font-size: 14px;
          --mdc-text-field-fill-color: transparent;
          --mdc-theme-primary: var(--general-textfield-selected-color);
        }

        p.label {
          font-size: 16px;
          font-family: var(--general-font-family);
          color: var(--general-sidebar-color);
          width: 270px;
        }
      `];
  }

  firstUpdated() {
    this.listStatus = this.shadowRoot.querySelector('#list-status');
    this.notification = globalThis.lablupNotification;
    this.signoutUserDialog = this.shadowRoot.querySelector('#signout-user-dialog');
    this.addEventListener('user-list-updated', () => {
      this.refresh();
    });
  }

  /**
   * If active is true, change view state
   *
   * @param {Boolean} active - boolean value that determines whether view state is changed or not
   * */
  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    // If disconnected
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._refreshUserData();
        this.isAdmin = globalThis.backendaiclient.is_admin;
        this.isUserInfoMaskEnabled = globalThis.backendaiclient._config.maskUserInfo;
        this.userGrid = this.shadowRoot.querySelector('#user-grid');
      }, true);
    } else { // already connected
      this._refreshUserData();
      this.isAdmin = globalThis.backendaiclient.is_admin;
      this.isUserInfoMaskEnabled = globalThis.backendaiclient._config.maskUserInfo;
      this.userGrid = this.shadowRoot.querySelector('#user-grid');
    }
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
    this.listCondition = 'loading';
    this.listStatus?.show();
    const fields = ['email', 'username', 'need_password_change', 'full_name', 'description', 'is_active', 'domain_name', 'role', 'groups {id name}', 'status'];
    return globalThis.backendaiclient.user.list(is_active, fields).then((response) => {
      const users = response.users;
      // Object.keys(users).map((objectKey, index) => {
      // var user = users[objectKey];
      // Blank for the next impl.
      // });
      this.users = users;
      if (this.users.length == 0) {
        this.listCondition = 'no-data';
      } else {
        this.listStatus?.hide();
      }
      // setTimeout(() => { this._refreshKeyData(status) }, 5000);
    }).catch((err) => {
      this.listStatus?.hide();
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
    globalThis.backendaiclient.user.delete(this.signoutUserName).then((response) => {
      this.notification.text = PainKiller.relieve('Signout finished.');
      this._refreshUserData();
      this.signoutUserDialog.hide();
    }).catch((err) => { // Signout failed
      console.log(err);
      if (typeof err.message !== 'undefined') {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
      } else {
        this.notification.text = PainKiller.relieve('Signout failed. Check your permission and try again.');
      }
      this.notification.show();
    });
  }

  async _getUserData(user_id) {
    const fields = ['email', 'username', 'need_password_change', 'full_name', 'description', 'status', 'domain_name', 'role', 'groups {id name}'];
    return globalThis.backendaiclient.user.get(user_id, fields);
  }

  refresh() {
    this._refreshUserData();
    // update current grid to new data
    this.userGrid.clearCache();
  }

  _isActive() {
    return this.condition === 'active';
  }

  /**
   * Return elapsed time
   *
   * @param {Date} start
   * @param {Date} end
   * @return {number} Days since start till end
   * */
  _elapsed(start, end) {
    const startDate = new Date(start);
    let endDate: Date;
    if (this.condition == 'active') {
      endDate = new Date();
    } else {
      endDate = new Date();
    }
    const seconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
    const days = Math.floor(seconds / 86400);
    return days;
  }

  /**
   * Date to UTC string
   *
   * @param {Date} d - date
   * @return {string} UTC string
   * */
  _humanReadableTime(d) {
    return new Date(d).toUTCString();
  }

  /**
   * Render index to root element.
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  _indexRenderer(root, column, rowData) {
    const idx = rowData.index + 1;
    render(
      html`
        <div>${idx}</div>
      `,
      root
    );
  }

  /**
   * If value includes unlimited contents, mark as unlimited.
   *
   * @param {string} value - string value
   * @return {string} ∞ when value contains -, 0, 'Unlimited', Infinity, 'Infinity'
   */
  _markIfUnlimited(value) {
    if (['-', 0, 'Unlimited', Infinity, 'Infinity'].includes(value)) {
      return '∞';
    } else {
      return value;
    }
  }

  /**
   * Control rendering - showUserDetail, editUserDetail, signoutUserDialog.
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   */
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

  /**
   * Render UserId according to configuration
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   */
  userIdRenderer(root, column?, rowData?) {
    render(
      html`
        <span>${this._getUserId(rowData.item.email)}</span>
      `, root
    );
  }

  /**
   * Render Username according to configuration
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   */
  userNameRenderer(root, column?, rowData?) {
    render(
      html`
        <span>${this._getUsername(rowData.item.username)}</span>
      `, root
    );
  }

  /**
   * Render current status of user
   * - active
   * - inactive
   * - before-verification
   * - deleted
   *
   * @param root
   * @param column
   * @param rowData
   */
  userStatusRenderer(root, column?, rowData?) {
    const color = (rowData.item.status === 'active') ? 'green' : 'lightgrey';
    render(
      html`
        <lablup-shields app="" color="${color}" description="${rowData.item.status}" ui="flat"></lablup-shields>
      `, root
    );
  }

  /**
   * Toggle password visible/invisible mode.
   *
   * @param {HTMLElement} element - password visibility toggle component
   */
  _togglePasswordVisibility(element) {
    const isVisible = element.__on;
    const password = element.closest('div').querySelector('mwc-textfield');
    isVisible ? password.setAttribute('type', 'text') : password.setAttribute('type', 'password');
  }

  /**
   * Toggle password and confirm input field is required or not.
   *
   */
  _togglePasswordInputRequired() {
    const passwordEl = this.shadowRoot.querySelector('#password');
    const password = passwordEl.value;
    const confirmEl = this.shadowRoot.querySelector('#confirm');
    const confirm = confirmEl.value;
    passwordEl.required = (password === '' && confirm !== '') ? true : false;
    confirmEl.required = (password !== '' && confirm === '') ? true : false;
    passwordEl.reportValidity();
    confirmEl.reportValidity();
  }

  /**
   * Save any changes. - username, full_name, password, etc.
   *
   * @param {Event} event - click SaveChanges button
   * */
  _saveChanges(event) {
    const username = this.shadowRoot.querySelector('#username').value;
    const full_name = this.shadowRoot.querySelector('#full_name').value;
    const passwordEl = this.shadowRoot.querySelector('#password');
    const password = passwordEl.value;
    const confirmEl = this.shadowRoot.querySelector('#confirm');
    const confirm = confirmEl.value;
    const description = this.shadowRoot.querySelector('#description').value;
    const status = this.shadowRoot.querySelector('#status').value;
    const need_password_change = this.shadowRoot.querySelector('#need_password_change').selected;

    this._togglePasswordInputRequired();

    if (!passwordEl.checkValidity() || !confirmEl.checkValidity()) {
      return;
    }

    if (password !== confirm) {
      this.notification.text = _text('environment.PasswordsDoNotMatch');
      this.notification.show();
      return;
    }

    const input: any = Object();

    if (password !== '') {
      input.password = password;
    }

    if (username !== this.userInfo.username) {
      input.username = username;
    }

    if (full_name !== this.userInfo.full_name) {
      input.full_name = full_name;
    }

    if (description !== this.userInfo.description) {
      input.description = description;
    }

    if (need_password_change !== this.userInfo.need_password_change) {
      input.need_password_change = need_password_change;
    }

    if (status !== this.userInfo.status) {
      input.status = status;
    }

    if (Object.entries(input).length === 0) {
      this._hideDialog(event);

      this.notification.text = _text('environment.NoChangeMade');
      this.notification.show();

      return;
    }

    // globalThis.backendaiclient.user.modify(this.userInfo.email, input)
    globalThis.backendaiclient.user.update(this.userInfo.email, input)
      .then((res) => {
        if (res.modify_user.ok) {
          this.shadowRoot.querySelector('#user-info-dialog').hide();

          this.notification.text = _text('environment.SuccessfullyModified');
          this.userInfo = {...this.userInfo, ...input, password: null};
          this._refreshUserData();
          this.shadowRoot.querySelector('#password').value = '';
          this.shadowRoot.querySelector('#confirm').value = '';
        } else {
          this.notification.text = PainKiller.relieve(res.modify_user.msg);
          this.shadowRoot.querySelector('#username').value = this.userInfo.username;
          this.shadowRoot.querySelector('#description').value = this.userInfo.description;
        }
        this.notification.show();
        this.refresh();
      }).catch((err) => {
        console.log(err);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      });

    // if updated user info is current user, then apply it right away
    if (this.userInfo.email === globalThis.backendaiclient.email) {
      const event = new CustomEvent('current-user-info-changed', {detail: input});
      document.dispatchEvent(event);
    }
  }

  /**
   * Get user id according to configuration
   *
   * @param {string} userId
   * @return {string}
   */
  _getUserId(userId = '') {
    if (userId && this.isUserInfoMaskEnabled) {
      const maskStartIdx = 2;
      const maskLength = userId.split('@')[0].length - maskStartIdx;
      userId = globalThis.backendaiutils._maskString(userId, '*', maskStartIdx, maskLength);
    }
    return userId;
  }

  _getUsername(username = '') {
    if (username && this.isUserInfoMaskEnabled) {
      const maskStartIdx = 2;
      const maskLength = username.length - maskStartIdx;
      username = globalThis.backendaiutils._maskString(username, '*', maskStartIdx, maskLength);
    }
    return username;
  }

  render() {
    // language=HTML
    return html`
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <div class="list-wrapper">
        <vaadin-grid theme="row-stripes column-borders compact"
                    aria-label="User list" id="user-grid" .items="${this.users}">
          <vaadin-grid-column width="40px" flex-grow="0" header="#" text-align="center"
                              .renderer="${this._indexRenderer.bind(this)}"></vaadin-grid-column>
          <vaadin-grid-filter-column auto-width path="email" header="${_t('credential.UserID')}" resizable
                              .renderer="${this._userIdRenderer.bind(this)}"></vaadin-grid-filter-column>
          <vaadin-grid-filter-column auto-width path="username" header="${_t('credential.Name')}" resizable
                              .renderer="${this._userNameRenderer}"></vaadin-grid-filter-column>
          ${this.condition !== 'active' ? html`
            <vaadin-grid-filter-column auto-width path="status" header="${_t('credential.Status')}" resizable
                              .renderer="${this._userStatusRenderer}"></vaadin-grid-filter-column>` : html``}
          <vaadin-grid-column resizable header="${_t('general.Control')}"
              .renderer="${this._boundControlRenderer}"></vaadin-grid-column>
        </vaadin-grid>
        <backend-ai-list-status id="list-status" statusCondition="${this.listCondition}" message="${_text('credential.NoUserToDisplay')}"></backend-ai-list-status>
      </div>
      <backend-ai-dialog id="signout-user-dialog" fixed backdrop>
        <span slot="title">${_t('dialog.title.LetsDouble-Check')}</span>
        <div slot="content">
          <p>You are inactivating the user <span style="color:red">${this.signoutUserName}</span>.</p>
          <p>${_t('dialog.ask.DoYouWantToProceed')}</p>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
              label="${_t('button.Cancel')}"
              @click="${(e) => this._hideDialog(e)}"></mwc-button>
          <mwc-button
              unelevated
              label="${_t('button.Okay')}"
              @click="${() => this._signoutUser()}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="user-info-dialog" fixed backdrop narrowLayout>
        <div slot="title" class="horizontal center layout">
          <span style="margin-right:15px;">${_t('credential.UserDetail')}</span>
          <lablup-shields app="" description="user" ui="flat"></lablup-shields>
        </div>
        <div slot="content" class="horizontal layout" style="overflow-x:hidden;">
          <div>
            <h4>${_text('credential.Information')}</h4>
            <div role="listbox" class="center vertical layout">
              <mwc-textfield
                  disabled
                  label="${_text('credential.UserID')}"
                  pattern="^[a-zA-Z0-9_-]+$"
                  value="${this.userInfo.email}"
                  maxLength="64"
                  helper="${_text('maxLength.64chars')}"></mwc-textfield>
              <mwc-textfield
                  ?disabled=${!this.editMode}
                  label="${_text('credential.UserName')}"
                  id="username"
                  value="${this.userInfo.username}"
                  maxLength="64"
                  helper="${_text('maxLength.64chars')}"></mwc-textfield>
              <mwc-textfield
                  ?disabled=${!this.editMode}
                  label="${_text('credential.FullName')}"
                  id="full_name"
                  value="${this.userInfo.full_name ? this.userInfo.full_name : ' '}"
                  maxLength="64"
                  helper="${_text('maxLength.64chars')}"></mwc-textfield>
              ${this.editMode ? html`
                <div class="horizontal layout password-area">
                  <mwc-textfield
                      type="password"
                      id="password"
                      autoValidate
                      validationMessage="${_t('webui.menu.InvalidPasswordMessage')}"
                      pattern="^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$"
                      maxLength="64"
                      label="${_text('general.NewPassword')}"
                      @change=${() => this._togglePasswordInputRequired()}></mwc-textfield>
                  <mwc-icon-button-toggle off onIcon="visibility" offIcon="visibility_off"
                      @click="${(e) => this._togglePasswordVisibility(e.target)}">
                  </mwc-icon-button-toggle>
                </div>
                <div class="horizontal layout password-area">
                  <mwc-textfield
                      type="password"
                      id="confirm"
                      autoValidate
                      validationMessage="${_t('webui.menu.InvalidPasswordMessage')}"
                      pattern="^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$"
                      maxLength="64"
                      @change=${() => this._togglePasswordInputRequired()}
                      label="${_text('webui.menu.NewPasswordAgain')}"></mwc-textfield>
                  <mwc-icon-button-toggle off onIcon="visibility" offIcon="visibility_off"
                      @click="${(e) => this._togglePasswordVisibility(e.target)}">
                  </mwc-icon-button-toggle>
                </div>
                <mwc-textarea
                    type="text"
                    id="description"
                    label="${_text('credential.Description')}"
                    placeholder="${_text('maxLength.500chars')}"
                    value="${this.userInfo.description}"
                    id="description"></mwc-textfield>`: html``}
              ${this.editMode ? html`
                <mwc-select class="full-width" id="status" label="${_text('credential.UserStatus')}" fixedMenuPosition>
                  ${Object.keys(this.userStatus).map((item) => html`
                    <mwc-list-item value="${item}" ?selected="${item === this.userInfo.status}">${this.userStatus[item]}</mwc-list-item>
                  `)}
                </mwc-select>
                <div class="horizontal layout center" style="margin:10px;">
                  <p class="label">${_text('credential.DescRequirePasswordChange')}</p>
                  <mwc-switch
                      id="need_password_change"
                      ?selected=${this.userInfo.need_password_change}></mwc-switch>
                </div>` : html`
                    <mwc-textfield
                        disabled
                        label="${_text('credential.DescActiveUser')}"
                        value="${(this.userInfo.status === 'active') ? `${_text('button.Yes')}` : `${_text('button.No')}`}"></mwc-textfield>
                    <mwc-textfield
                        disabled
                        label="${_text('credential.DescRequirePasswordChange')}"
                        value="${this.userInfo.need_password_change ? `${_text('button.Yes')}` : `${_text('button.No')}`}"></mwc-textfield>
            `}
          </div>
        </div>
        ${this.editMode ? html`` : html`
          <div>
            <h4>${_text('credential.Association')}</h4>
            <div role="listbox" style="margin: 0;">
              <wl-textfield
                label="${_t('credential.Domain')}"
                disabled
                value="${this.userInfo.domain_name}">
              </wl-textfield>
              <wl-textfield
                label="${_t('credential.Role')}"
                disabled
                value="${this.userInfo.role}">
              </wl-textfield>
            </div>
            <h4>${_text('credential.ProjectAndGroup')}</h4>
            <div role="listbox" style="margin: 0;">
              <ul>
              ${this.userInfoGroups.map((item) => html`
                <li>${item}</li>
              `)}
              </ul>
            </div>
          </div>
        `}
        </div>
        <div slot="footer" class="horizontal center-justified flex layout distancing">
        ${this.editMode ? html`
          <mwc-button
              unelevated
              fullwidth
              label="${_t('button.SaveChanges')}"
              icon="check"
              @click=${(e) => this._saveChanges(e)}></mwc-button>`:html``}
        </div>
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-user-list': BackendAIUserList;
  }
}
