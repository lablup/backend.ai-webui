/**
 @license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
 */
import '../plastics/lablup-shields/lablup-shields';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import './backend-ai-dialog';
import { BackendAiStyles } from './backend-ai-general-styles';
import './backend-ai-list-status';
import BackendAIListStatus, { StatusCondition } from './backend-ai-list-status';
import { BackendAIPage } from './backend-ai-page';
import { default as PainKiller } from './backend-ai-painkiller';
import './lablup-grid-sort-filter-column';
import '@material/mwc-button';
import '@material/mwc-icon-button';
import { Select } from '@material/mwc-select';
import '@material/mwc-switch';
import '@material/mwc-textarea';
import '@material/mwc-textfield';
import '@vaadin/grid/vaadin-grid';
import '@vaadin/grid/vaadin-grid-filter-column';
import '@vaadin/grid/vaadin-grid-sort-column';
import '@vaadin/icons/vaadin-icons';
import '@vaadin/item/vaadin-item';
import { css, CSSResultGroup, html, render } from 'lit';
import { get as _text, translate as _t } from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type TextArea = HTMLElementTagNameMap['mwc-textarea'];
type TextField = HTMLElementTagNameMap['mwc-textfield'];
type VaadinGrid = HTMLElementTagNameMap['vaadin-grid'];
type LablupLoadingSpinner = HTMLElementTagNameMap['lablup-loading-spinner'];
type BackendAIDialog = HTMLElementTagNameMap['backend-ai-dialog'];

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
  @property({ type: Boolean }) isAdmin = false;
  @property({ type: Boolean }) editMode = false;
  @property({ type: Array }) users = [];
  @property({ type: Object }) userInfo = Object();
  @property({ type: Array }) userInfoGroups = [];
  @property({ type: String }) userEmail = '';
  @property({ type: Boolean }) openUserInfoModal = false;
  @property({ type: Boolean }) openUserSettingModal = false;
  @property({ type: String }) condition = '';
  @property({ type: Object }) _boundControlRenderer =
    this.controlRenderer.bind(this);
  @property({ type: Object }) _userIdRenderer = this.userIdRenderer.bind(this);
  @property({ type: Object }) _userNameRenderer =
    this.userNameRenderer.bind(this);
  @property({ type: Object }) _userStatusRenderer =
    this.userStatusRenderer.bind(this);
  @property({ type: Object }) _totpActivatedRenderer =
    this.totpActivatedRenderer.bind(this);
  @property({ type: Object }) keypairs;
  @property({ type: Object }) notification = Object();
  @property({ type: String }) listCondition: StatusCondition = 'loading';
  @property({ type: Number }) _totalUserCount = 0;
  @property({ type: Boolean }) isUserInfoMaskEnabled = false;
  @property({ type: Boolean }) totpSupported = false;
  @property({ type: Boolean }) totpActivated = false;
  @property({ type: Boolean }) supportMainAccessKey = false;
  @property({ type: Object }) userStatus = {
    active: 'Active',
    inactive: 'Inactive',
    'before-verification': 'Before Verification',
    deleted: 'Deleted',
  };
  @query('#user-grid') userGrid!: VaadinGrid;
  @query('#loading-spinner') spinner!: LablupLoadingSpinner;
  @query('#list-status') private _listStatus!: BackendAIListStatus;
  @query('#password') passwordInput!: TextField;
  @query('#confirm') confirmInput!: TextField;
  @query('#username') usernameInput!: TextField;
  @query('#full_name') fullNameInput!: TextField;
  @query('#description') descriptionInput!: TextArea;
  @query('#status') statusSelect!: Select;
  @query('#signout-user-dialog') signoutUserDialog!: BackendAIDialog;

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
          height: calc(100vh - 229px);
        }

        backend-ai-dialog h4 {
          font-size: 14px;
          padding: 5px 15px 5px 12px;
          margin: 0 0 10px 0;
          display: block;
          height: 20px;
          border-bottom: 1px solid #ddd;
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

        mwc-textfield.display-textfield {
          --mdc-text-field-disabled-ink-color: var(--general-text-color);
        }

        backend-ai-dialog li {
          font-family: var(--general-font-family);
          font-size: 16px;
        }

        mwc-button,
        mwc-button[unelevated],
        mwc-button[outlined] {
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

        mwc-textfield,
        mwc-textarea {
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

        mwc-icon.totp {
          --mdc-icon-size: 24px;
        }
      `,
    ];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
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
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        async () => {
          this.totpSupported =
            globalThis.backendaiclient?.supports('2FA') &&
            (await globalThis.backendaiclient?.isManagerSupportingTOTP());
          this.supportMainAccessKey =
            globalThis.backendaiclient?.supports('main-access-key');
          this._refreshUserData();
          this.isAdmin = globalThis.backendaiclient.is_admin;
          this.isUserInfoMaskEnabled =
            globalThis.backendaiclient._config.maskUserInfo;
        },
        true,
      );
    } else {
      // already connected
      this.totpSupported =
        globalThis.backendaiclient?.supports('2FA') &&
        (await globalThis.backendaiclient?.isManagerSupportingTOTP());
      this.supportMainAccessKey =
        globalThis.backendaiclient?.supports('main-access-key');
      this._refreshUserData();
      this.isAdmin = globalThis.backendaiclient.is_admin;
      this.isUserInfoMaskEnabled =
        globalThis.backendaiclient._config.maskUserInfo;
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
    this._listStatus?.show();
    const fields = [
      'email',
      'username',
      'need_password_change',
      'full_name',
      'description',
      'is_active',
      'domain_name',
      'role',
      'groups {id name}',
      'status',
      'main_access_key',
    ];
    if (this.totpSupported) {
      fields.push('totp_activated');
    }
    return globalThis.backendaiclient.user
      .list(is_active, fields)
      .then((response) => {
        const users = response.users;
        // Object.keys(users).map((objectKey, index) => {
        // var user = users[objectKey];
        // Blank for the next impl.
        // });
        this.users = users;
        if (this.users.length == 0) {
          this.listCondition = 'no-data';
        } else {
          this._listStatus?.hide();
        }
        // setTimeout(() => { this._refreshKeyData(status) }, 5000);
      })
      .catch((err) => {
        this._listStatus?.hide();
        console.log(err);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      });
  }

  async _openUserSettingModal(userEmail) {
    this.userEmail = userEmail;
    this.openUserSettingModal = true;
  }

  async _openUserInfoModal(userEmail) {
    this.userEmail = userEmail;
    this.openUserInfoModal = true;
  }

  _signoutUserDialog(userEmail) {
    this.userEmail = userEmail;
    this.signoutUserDialog.show();
  }

  _signoutUser() {
    globalThis.backendaiclient.user
      .delete(this.userEmail)
      .then((response) => {
        this.notification.text = _text(
          'credential.SignoutSeccessfullyFinished',
        );
        this.notification.show();
        this._refreshUserData();
        this.signoutUserDialog.hide();
      })
      .catch((err) => {
        // Signout failed
        console.log(err);
        if (typeof err.message !== 'undefined') {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
        } else {
          this.notification.text = PainKiller.relieve(
            'Signout failed. Check your permission and try again.',
          );
        }
        this.notification.show();
      });
  }

  async _getUserData(user_id) {
    const fields = [
      'email',
      'username',
      'need_password_change',
      'full_name',
      'description',
      'status',
      'domain_name',
      'role',
      'groups {id name}',
      'main_access_key',
    ];
    if (this.totpSupported) {
      fields.push('totp_activated');
    }
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
    const seconds = Math.floor(
      (endDate.getTime() - startDate.getTime()) / 1000,
    );
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
   * Get user id according to configuration
   *
   * @param {string} userId
   * @return {string}
   */
  _getUserId(userId = '') {
    if (userId && this.isUserInfoMaskEnabled) {
      const maskStartIdx = 2;
      const maskLength = userId.split('@')[0].length - maskStartIdx;
      userId = globalThis.backendaiutils._maskString(
        userId,
        '*',
        maskStartIdx,
        maskLength,
      );
    }
    return userId;
  }

  _getUsername(username = '') {
    if (username && this.isUserInfoMaskEnabled) {
      const maskStartIdx = 2;
      const maskLength = username.length - maskStartIdx;
      username = globalThis.backendaiutils._maskString(
        username,
        '*',
        maskStartIdx,
        maskLength,
      );
    }
    return username;
  }

  async _setTotpActivated() {
    if (this.totpSupported) {
      const userInfo = await globalThis.backendaiclient.user.get(
        globalThis.backendaiclient.email,
        ['totp_activated'],
      );
      this.totpActivated = userInfo.user.totp_activated;
    }
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
      root,
    );
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
          user-id="${rowData.item.email}"
        >
          <mwc-icon-button
            class="fg green"
            icon="assignment"
            @click="${() => this._openUserInfoModal(rowData.item.email)}"
          ></mwc-icon-button>
          <mwc-icon-button
            class="fg blue"
            icon="settings"
            @click="${() => this._openUserSettingModal(rowData.item.email)}"
          ></mwc-icon-button>
          ${globalThis.backendaiclient.is_superadmin && this._isActive()
            ? html`
                <mwc-icon-button
                  class="fg red controls-running"
                  icon="delete_forever"
                  @click="${() => this._signoutUserDialog(rowData.item.email)}"
                ></mwc-icon-button>
              `
            : html``}
        </div>
      `,
      root,
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
      `,
      root,
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
      `,
      root,
    );
  }

  /**
   * Render current status of user
   * - active
   * - inactive
   * - before-verification
   * - deleted
   *
   * @param {Element} root
   * @param {Element} column
   * @param {Object} rowData
   */
  userStatusRenderer(root, column?, rowData?) {
    const color = rowData.item.status === 'active' ? 'green' : 'lightgrey';
    render(
      html`
        <lablup-shields
          app=""
          color="${color}"
          description="${rowData.item.status}"
          ui="flat"
        ></lablup-shields>
      `,
      root,
    );
  }

  /**
   * Render current status of user
   * - active
   * - inactive
   * - before-verification
   * - deleted
   *
   * @param {Element} root
   * @param {Element} column
   * @param {Object} rowData
   */
  totpActivatedRenderer(root, column?, rowData?) {
    render(
      html`
        <div class="layout horizontal center center-justified wrap">
          ${rowData.item?.totp_activated
            ? html`
                <mwc-icon class="fg green totp">check_circle</mwc-icon>
              `
            : html`
                <mwc-icon class="fg red totp">block</mwc-icon>
              `}
        </div>
      `,
      root,
    );
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css" />
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <div class="list-wrapper">
        <vaadin-grid
          theme="row-stripes column-borders compact"
          aria-label="User list"
          id="user-grid"
          .items="${this.users}"
        >
          <vaadin-grid-column
            width="40px"
            flex-grow="0"
            header="#"
            text-align="center"
            .renderer="${this._indexRenderer.bind(this)}"
          ></vaadin-grid-column>
          <lablup-grid-sort-filter-column
            auto-width
            path="email"
            header="${_t('credential.UserID')}"
            resizable
            .renderer="${this._userIdRenderer.bind(this)}"
          ></lablup-grid-sort-filter-column>
          <lablup-grid-sort-filter-column
            auto-width
            path="username"
            header="${_t('credential.Name')}"
            resizable
            .renderer="${this._userNameRenderer}"
          ></lablup-grid-sort-filter-column>
          ${this.totpSupported
            ? html`
                <vaadin-grid-sort-column
                  auto-width
                  flex-grow="0"
                  path="totp_activated"
                  header="${_t('webui.menu.TotpActivated')}"
                  resizable
                  .renderer="${this._totpActivatedRenderer.bind(this)}"
                ></vaadin-grid-sort-column>
              `
            : html``}
          ${this.condition !== 'active'
            ? html`
                <lablup-grid-sort-filter-column
                  auto-width
                  path="status"
                  header="${_t('credential.Status')}"
                  resizable
                  .renderer="${this._userStatusRenderer}"
                ></lablup-grid-sort-filter-column>
              `
            : html``}
          ${this.supportMainAccessKey
            ? html`
                <vaadin-grid-filter-column
                  auto-width
                  path="main_access_key"
                  resizable
                  header="${_t('credential.MainAccessKey')}"
                ></vaadin-grid-filter-column>
              `
            : html``}
          <vaadin-grid-column
            frozen-to-end
            width="160px"
            resizable
            header="${_t('general.Control')}"
            .renderer="${this._boundControlRenderer}"
          ></vaadin-grid-column>
        </vaadin-grid>
        <backend-ai-list-status
          id="list-status"
          statusCondition="${this.listCondition}"
          message="${_text('credential.NoUserToDisplay')}"
        ></backend-ai-list-status>
      </div>
      <backend-ai-dialog id="signout-user-dialog" fixed backdrop>
        <span slot="title">${_t('dialog.title.LetsDouble-Check')}</span>
        <div slot="content">
          <p>
            You are inactivating the user
            <span style="color:red">${this.userEmail}</span>
            .
          </p>
          <p>${_t('dialog.ask.DoYouWantToProceed')}</p>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
            label="${_t('button.Cancel')}"
            @click="${(e) => this._hideDialog(e)}"
          ></mwc-button>
          <mwc-button
            id="deleteOk"
            unelevated
            label="${_t('button.Okay')}"
            @click="${() => this._signoutUser()}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
      ${this.openUserInfoModal
        ? html`
            <backend-ai-react-user-info-dialog
              value="${JSON.stringify({
                open: this.openUserInfoModal,
                userEmail: this.userEmail,
              })}"
              @cancel="${() => (this.openUserInfoModal = false)}"
            ></backend-ai-react-user-info-dialog>
          `
        : html``}
      ${this.openUserSettingModal
        ? html`
            <backend-ai-react-user-setting-dialog
              value="${JSON.stringify({
                open: this.openUserSettingModal,
                userEmail: this.userEmail,
              })}"
              @ok="${() => {
                this.openUserSettingModal = false;
                this.refresh();
              }}"
              @cancel="${() => (this.openUserSettingModal = false)}"
            ></backend-ai-react-user-setting-dialog>
          `
        : html``}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-user-list': BackendAIUserList;
  }
}
