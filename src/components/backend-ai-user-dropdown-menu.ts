/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */


import {customElement, property, query} from 'lit/decorators.js';
import {css, LitElement, html, CSSResultGroup} from 'lit';
import {translate as _t} from 'lit-translate';
import '@material/mwc-select';
import '@material/mwc-icon-button';

import BackendAiCommonUtils from './backend-ai-common-utils';
import {BackendAIWebUIStyles} from './backend-ai-webui-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';
import {get as _text} from 'lit-translate/util';
import {Menu} from '@material/mwc-menu';
import {IconButton} from '@material/mwc-icon-button';
import {Switch} from '@material/mwc-switch';
import {store} from '../store';
import {navigate} from '../backend-ai-app';
import BackendAIDialog from './backend-ai-dialog';
import {TextField} from '@material/mwc-textfield';
import QR from '../lib/qr';

/**
 Backend AI User dropdown menu

 Example:

 <backend-ai-user-dropdown-menu></backend-ai-user-dropdown-menu>

 @group Backend.AI Web UI
 @element backend-ai-user-dropdown-menu
 */
@customElement('backend-ai-user-dropdown-menu')
export default class BackendAiUserDropdownMenu extends LitElement {
  @property({type: String}) userId = 'DISCONNECTED';
  @property({type: String}) fullName = 'DISCONNECTED';
  @property({type: String}) domain = 'CLICK TO CONNECT';
  @property({type: Object}) loggedAccount = Object();
  @property({type: Object}) roleInfo = Object();
  @property({type: Object}) keyPairInfo = Object();
  @property({type: Array}) groups = [];
  @property({type: Object}) notification;
  @property({type: Boolean}) isUserInfoMaskEnabled = true;
  @property({type: Boolean}) totpSupported = false;
  @property({type: Boolean}) totpActivated = false;
  @property({type: String}) totpKey = '';
  @property({type: String}) totpUri = '';

  @query('#dropdown-button') _dropdownMenuIcon!: IconButton;
  @query('#dropdown-menu') dropdownMenu: Menu | undefined;
  @query('#user-preference-dialog') userPreferenceDialog: BackendAIDialog | undefined;
  @query('#totp-setup-dialog') totpSetupDialog: BackendAIDialog | undefined;
  @query('#totp-removal-confirm-dialog') totpRemovalConfirmDialog: BackendAIDialog | undefined;
  @query('#totp-uri-qrcode') totpUriQrImage: HTMLImageElement | undefined;
  @query('#totp-confirm-otp') confirmOtpTextfield: TextField | undefined;
  @query('#totp-activation') totpActivationSwitch: Switch | undefined;

  constructor() {
    super();
  }

  static get styles(): CSSResultGroup {
    return [
      BackendAIWebUIStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      css`
        span.dropdown-menu-name {
          display: inline-block;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          max-width: 135px;
        }

        #dropdown-area {
          position: relative;
          right: 50px;
        }
      `,
    ];
  }
  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._refreshUserInfoPanel();
        this.isUserInfoMaskEnabled = globalThis.backendaiclient._config.maskUserInfo;
      }, true);
    } else {
      this._refreshUserInfoPanel();
      this.isUserInfoMaskEnabled = globalThis.backendaiclient._config.maskUserInfo;
    }
  }
  /**
   * Refresh the user information panel.
   */
  _refreshUserInfoPanel(): void {
    this.userId = globalThis.backendaiclient.email;
    this.fullName = globalThis.backendaiclient.full_name;
    this.domain = globalThis.backendaiclient._config.domainName;
    this.loggedAccount.access_key = globalThis.backendaiclient._config.accessKey;
    this._showRole();
    this._showTotpActivated();
  }

  /**
   * Check Fullname exists, and if not then use user_id instead.
   *
   * @return {string} Name from full name or user ID
   */
  _getUsername() {
    let name = (this.fullName.replace(/\s+/g, "").length > 0) ? this.fullName : this.userId;
      // mask username only when the configuration is enabled
    if (this.isUserInfoMaskEnabled) {
      const maskStartIdx = 2;
      const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      const isEmail: boolean = emailPattern.test(name);
      const maskLength = isEmail ? name.split('@')[0].length - maskStartIdx : name.length - maskStartIdx;
      name = globalThis.backendaiutils._maskString(name, '*', maskStartIdx, maskLength);
    }
    return name;
  }

  /**
   *  Get user id according to configuration
   *
   *  @return {string} userId
   */
  _getUserId() {
    let userId = this.userId;
    // mask user id(email) only when the configuration is enabled
    if (this.isUserInfoMaskEnabled) {
      const maskStartIdx = 2;
      const maskLength = userId.split('@')[0].length - maskStartIdx;
      userId = globalThis.backendaiutils._maskString(userId, '*', maskStartIdx, maskLength);
    }
    return userId;
  }
  _getRole(user_id) {
    const fields = ['role'];
    return globalThis.backendaiclient.user.get(user_id, fields);
  }

  async _showRole() {
    const data = await this._getRole(this.userId);
    this.roleInfo = data.user;
  }

  async _showTotpActivated() {
    this.totpSupported = await globalThis.backendaiclient?.supports('2FA');
    if (this.totpSupported) {
      const userInfo = await globalThis.backendaiclient?.user.get(
        globalThis.backendaiclient.email, ['totp_activated']
      );
      this.totpActivated = userInfo.user.totp_activated;
    }
  }

  _getKeypairInfo(user_id) {
    const fields = ['access_key', 'secret_key'];
    const isActive = true;
    return globalThis.backendaiclient.keypair.list(user_id, fields, isActive);
  }

  async _showKeypairInfo() {
    const data = await this._getKeypairInfo(this.userId);
    this.keyPairInfo = data;
    this.keyPairInfo.keypairs.reverse();
  }

  /**
   * Open the user preference dialog.
   */
  async _openUserPrefDialog() {
    this._showKeypairInfo();
    this.userPreferenceDialog?.show();
  }

  /**
   * Hide the user preference dialog.
   */
  _hideUserPrefDialog() {
    this.userPreferenceDialog?.hide();
  }

  /**
   * Open the TOTP Setup dialog.
   */
  async _openTotpSetupDialog() {
    this._showKeypairInfo();
    this.totpSetupDialog?.show();
    const result = await globalThis.backendaiclient.initialize_totp();
    this.totpKey = result.totp_key;
    this.totpUri = result.totp_uri;
    const pngURL = QR.generatePNG(result.totp_uri, null);
    if (this.totpUriQrImage) {
      this.totpUriQrImage.src = pngURL;
    }
  }

  /**
   * Hide the TOTP Setup dialog.
   */
  _hideTotpSetupDialog() {
    this.totpSetupDialog?.hide();
  }

  async _showSecretKey(e) {
    const secret_key = this.shadowRoot?.querySelector<TextField>('#secretkey')!;
    for (let i = 0; i < this.keyPairInfo.keypairs.length; i++) {
      if (e.target.selected.value == this.keyPairInfo.keypairs[i].access_key) {
        secret_key.value = this.keyPairInfo.keypairs[i].secret_key;
        break;
      }
    }
  }
  /**
   * Update the full_name of user information
   *
   * @param {string} newFullname - Name to be modified
   */
  async _updateFullname(newFullname = '') {
    newFullname = newFullname === '' ? (this.shadowRoot?.querySelector('#pref-original-name') as TextField).value : newFullname;
    if (newFullname.length > 64) {
      this.notification.text = _text('webui.menu.FullNameInvalid');
      this.notification.show();
      return;
    }
    // if user input in full name is not null and not same as the original full name, then it updates.
    if (globalThis.backendaiclient.supports('change-user-name')) {
      if (newFullname && (newFullname !== this.fullName)) {
        globalThis.backendaiclient.update_full_name(this.userId, newFullname).then((resp) => {
          this.notification.text = _text('webui.menu.FullnameUpdated');
          this.notification.show();
          this.fullName = globalThis.backendaiclient.full_name = newFullname;
          (this.shadowRoot?.querySelector('#pref-original-name') as TextField).value = this.fullName;
          const event = new CustomEvent('current-user-info-changed', {'detail': this.fullName});
          document.dispatchEvent(event);
        }).catch((err) => {
          if (err && err.message) {
            this.notification.text = err.message;
            this.notification.detail = err.message;
            this.notification.show(true, err);
            return;
          } else if (err && err.title) {
            this.notification.text = err.title;
            this.notification.detail = err.message;
            this.notification.show(true, err);
            return;
          }
        });
      }
    } else {
      this.notification.text = _text('error.APINotSupported');
      this.notification.show();
    }
  }
  /**
   * Update the user password.
   */
  async _updateUserPassword() {
    const dialog = this.shadowRoot?.querySelector('#user-preference-dialog');
    const oldPassword = (dialog?.querySelector('#pref-original-password') as TextField).value;
    const newPassword1El = dialog?.querySelector('#pref-new-password') as TextField;
    const newPassword2El = dialog?.querySelector('#pref-new-password2') as TextField;

    // no update in user's password
    if (!oldPassword && !newPassword1El.value && !newPassword2El.value) {
      this._hideUserPrefDialog();
      return;
    }

    if (!oldPassword) {
      this.notification.text = _text('webui.menu.InputOriginalPassword');
      this.notification.show();
      return;
    }
    // TODO define type for custom property
    if (!newPassword1El.value || !(newPassword1El as any).validity.valid) {
      this.notification.text = _text('webui.menu.InvalidPasswordMessage');
      this.notification.show();
      return;
    }
    if (newPassword1El.value !== newPassword2El.value) {
      this.notification.text = _text('webui.menu.NewPasswordMismatch');
      this.notification.show();
      return;
    }
    const p = globalThis.backendaiclient.update_password(oldPassword, newPassword1El.value, newPassword2El.value);
    p.then((resp) => {
      this.notification.text = _text('webui.menu.PasswordUpdated');
      this.notification.show();
      this._hideUserPrefDialog();
    }).catch((err) => {
      if (err && err.message) {
        this.notification.text = err.message;
        this.notification.detail = err.message;
        this.notification.show(true, err);
        return;
      } else if (err && err.title) {
        this.notification.text = err.title;
        this.notification.detail = err.message;
        this.notification.show(true, err);
        return;
      }
    }).finally(() => { // remove input value again
      (this.shadowRoot?.querySelector('#pref-original-password') as TextField).value = '';
      (this.shadowRoot?.querySelector('#pref-new-password') as TextField).value = '';
      (this.shadowRoot?.querySelector('#pref-new-password2') as TextField).value = '';
    });
  }

  _showSplash() {
    const event = new CustomEvent('backend-ai-show-splash');
    document.dispatchEvent(event);
  }

  /**
   * Move to user's log page.
   */
  _moveToLogPage() {
    const currentPage = globalThis.location.toString().split(/[/]+/).pop();
    globalThis.history.pushState({}, '', '/usersettings');
    store.dispatch(navigate(decodeURIComponent('/usersettings'), {tab: 'logs'}));
    if (currentPage && currentPage === 'usersettings') {
      const event = new CustomEvent('backend-ai-usersettings-logs', {});
      document.dispatchEvent(event);
    }
  }

  /**
   * Move to user settings page.
   */
  _moveToUserSettingsPage() {
    const currentPage = globalThis.location.toString().split(/[/]+/).pop();
    globalThis.history.pushState({}, '', '/usersettings');
    store.dispatch(navigate(decodeURIComponent('/usersettings'), {tab: 'general'}));
    if (currentPage && currentPage === 'usersettings') {
      const event = new CustomEvent('backend-ai-usersettings', {});
      document.dispatchEvent(event);
    }
  }
  /**
   * Logout from the backend.ai client.
   *
   * @param {Boolean} performClose
   */
  async logout(performClose = false) {
    const event = new CustomEvent('backend-ai-logout');
    document.dispatchEvent(event);
  }

  /**
   * Control the dropdown menu.
   */
  _toggleDropdown() {
    const menu_icon = this._dropdownMenuIcon;
    if (this.dropdownMenu) {
      this.dropdownMenu.anchor = menu_icon;
      this.dropdownMenu.open = !this.dropdownMenu.open;
    }
  }
  _togglePasswordVisibility(element) {
    const isVisible = element.__on;
    const password = element.closest('div').querySelector('mwc-textfield');
    isVisible ? password.setAttribute('type', 'text') : password.setAttribute('type', 'password');
  }

  _validatePassword1() {
    // TODO define type for custom property
    const passwordInput = this.shadowRoot?.querySelector('#pref-new-password') as any;
    const password2Input = this.shadowRoot?.querySelector('#pref-new-password2') as any;
    password2Input.reportValidity();
    passwordInput.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          passwordInput.validationMessage = _text('signup.PasswordInputRequired');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        } else {
          passwordInput.validationMessage = _text('signup.PasswordInvalid');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        }
      } else {
        return {
          valid: nativeValidity.valid,
          customError: !nativeValidity.valid
        };
      }
    };
  }

  _validatePassword2() {
    // TODO define type for custom property
    const password2Input = this.shadowRoot?.querySelector('#pref-new-password2') as any;
    password2Input.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          password2Input.validationMessage = _text('signup.PasswordInputRequired');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        } else {
          password2Input.validationMessage = _text('signup.PasswordInvalid');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        }
      } else {
        // custom validation for password input match
        const passwordInput = this.shadowRoot?.querySelector('#pref-new-password') as TextField;
        const isMatched = (passwordInput.value === password2Input.value);
        if (!isMatched) {
          password2Input.validationMessage = _text('signup.PasswordNotMatched');
        }
        return {
          valid: isMatched,
          customError: !isMatched
        };
      }
    };
  }

  /**
   * Validate User input in password automatically, and show error message if any input error occurs.
   */
  _validatePassword() {
    this._validatePassword1();
    this._validatePassword2();
  }

  /**
   * Update the user information including full_name of user and password
   */
  _updateUserInformation() {
    if (globalThis.backendaiclient.supports('change-user-name')) {
      this._updateFullname();
    }
    this._updateUserPassword();
    this._refreshUserInfoPanel();
  }

  async _startActivatingTotp(e) {
    this._hideUserPrefDialog();
    this._openTotpSetupDialog();
  }

  async _stopUsingTotp(e) {
    await globalThis.backendaiclient.remove_totp();
    this.notification.text = _text('totp.TotpRemoved');
    this.notification.show();
    await this._showTotpActivated();
    this.totpRemovalConfirmDialog?.hide();
    this._openUserPrefDialog();
  }

  async _confirmOtpSetup(e) {
    const validationCode = this.confirmOtpTextfield?.value;
    try {
      await globalThis.backendaiclient.activate_totp(validationCode);
      this.notification.text = _text('totp.TotpSetupCompleted');
      this.notification.show();
      await this._showTotpActivated();
      this._hideTotpSetupDialog();
      this._openUserPrefDialog();
    } catch (e) {
      this.notification.text = _text('totp.InvalidTotpCode');
      this.notification.show();
    }
  }

  _confirmRemovingTotp(e) {
    this._hideUserPrefDialog();
    this.totpRemovalConfirmDialog?.show();
  }

  render() {
    return html`
      <link rel="stylesheet" href="resources/custom.css">
      <div class="horizontal flex center layout">
        <div class="vertical layout center" id="dropdown-area">
          <mwc-menu id="dropdown-menu" class="user-menu">
            ${this.domain !== 'default' && this.domain !== '' ? html`
            <mwc-list-item class="horizontal layout start center" disabled style="border-bottom:1px solid #ccc;pointer-events:none;">
                ${this.domain}
            </mwc-list-item>
            ` : html``}
            <mwc-list-item class="horizontal layout start center" style="pointer-events:none;">
                <mwc-icon class="dropdown-menu">perm_identity</mwc-icon>
                 <span class="dropdown-menu-name">${this._getUsername()}</span>
            </mwc-list-item>
            <mwc-list-item class="horizontal layout start center" disabled style="border-bottom:1px solid #ccc;pointer-events:none;">
                <mwc-icon class="dropdown-menu">email</mwc-icon>
                <span class="dropdown-menu-name">${this._getUserId()}</span>
            </mwc-list-item>
            <mwc-list-item class="horizontal layout start center" disabled style="border-bottom:1px solid #ccc;pointer-events:none;">
                <mwc-icon class="dropdown-menu">admin_panel_settings</mwc-icon>
                <span class="dropdown-menu-name">${this.roleInfo.role}</span>
            </mwc-list-item>
            <mwc-list-item class="horizontal layout start center" @click="${this._showSplash}">
                <mwc-icon class="dropdown-menu">info</mwc-icon>
                <span class="dropdown-menu-name">${_t('webui.menu.AboutBackendAI')}</span>
            </mwc-list-item>
            <mwc-list-item class="horizontal layout start center" @click="${() => this._openUserPrefDialog()}">
                <mwc-icon class="dropdown-menu">lock</mwc-icon>
                <span class="dropdown-menu-name">${_t('webui.menu.MyAccount')}</span>
            </mwc-list-item>
            <mwc-list-item class="horizontal layout start center" @click="${() => this._moveToUserSettingsPage()}">
                <mwc-icon class="dropdown-menu">drag_indicator</mwc-icon>
                <span class="dropdown-menu-name">${_t('webui.menu.Preferences')}</span>
            </mwc-list-item>
            <mwc-list-item class="horizontal layout start center" @click="${() => this._moveToLogPage()}">
                <mwc-icon class="dropdown-menu">assignment</mwc-icon>
                <span class="dropdown-menu-name">${_t('webui.menu.LogsErrors')}</span>
            </mwc-list-item>
            <mwc-list-item class="horizontal layout start center" id="sign-button" @click="${() => this.logout()}">
                <mwc-icon class="dropdown-menu">logout</mwc-icon>
                <span class="dropdown-menu-name">${_t('webui.menu.LogOut')}</span>
            </mwc-list-item>
          </mwc-menu>
        </div>
        <span class="full_name user-name" style="font-size:14px;text-align:right;-webkit-font-smoothing:antialiased;margin:auto 0 auto 10px;">
          ${this._getUsername()}
        </span>
        <mwc-icon-button id="dropdown-button" icon="person" @click="${() => this._toggleDropdown()}" style="color:#8c8584;">
        </mwc-icon-button>
      </div>
    </div>
    <backend-ai-dialog id="totp-setup-dialog" fixed backdrop>
      <span slot="title">${_t('webui.menu.SetupTotp')}</span>
      <div slot="content" class="layout vertical" style="width: 300px; align-items: center;">
        <p>${_t('totp.ScanQRToEnable')}</p>
        <img id="totp-uri-qrcode" style="width: 150px; height: 150px;" alt="QR" />
        <p>${_t('totp.TypeInAuthKey')}</p>
        <blockquote>${this.totpKey}</blockquote>
      </div>
      <div slot="content" class="layout vertical" style="width: 300px">
        <p style="flex-grow: 1;">${_t('totp.EnterConfirmationCode')}</p>
        <mwc-textfield id="totp-confirm-otp" type="number" no-label-float placeholder="000000"
          min="0" max="999999" style="margin-left:1em;width:120px;">
          </mwc-textfield>
      </div>
      <div slot="footer" class="horizontal end-justified flex layout">
        <mwc-button unelevated @click="${(e) => this._confirmOtpSetup(e)}">${_t('button.Confirm')}</mwc-button>
      </div>
    </backend-ai-dialog>
    <backend-ai-dialog id="totp-removal-confirm-dialog" fixed backdrop>
      <span slot="title">${_t('button.Confirm')}</span>
      <div slot="content" class="layout vertical" style="width: 300px; align-items: center;">
        <p>${_t('totp.ConfirmTotpRemovalBody')}</p>
      </div>
      <div slot="footer" class="horizontal end-justified flex layout">
        <mwc-button unelevated @click="${(e) => this._stopUsingTotp(e)}">${_t('button.Confirm')}</mwc-button>
      </div>
    </backend-ai-dialog>
    <backend-ai-dialog id="user-preference-dialog" fixed backdrop>
      <span slot="title">${_t('webui.menu.MyAccountInformation')}</span>
      <div slot="content" class="layout vertical" style="width:300px;">
        <mwc-textfield id="pref-original-name" type="text"
            label="${_t('webui.menu.FullName')}" maxLength="64" autofocus
            value="${this.fullName}"
            helper="${_t('maxLength.64chars')}">
        </mwc-textfield>
      </div>
      <div slot="content" class="layout vertical" style="width:300px">
        <mwc-select id="access-key-select" class="fixed-position" fixedMenuPosition required
                    label="${_t('general.AccessKey')}"
                    @selected="${(e) => this._showSecretKey(e)}">
          ${this.keyPairInfo.keypairs?.map((item) => html`
            <mwc-list-item value="${item.access_key}" ?selected=${this.loggedAccount.access_key === item.access_key}>
              ${item.access_key}
            </mwc-list-item>`)}
        </mwc-select>
        <mwc-textfield id="secretkey" disabled type="text"
            label="${_t('general.SecretKey')}"
            style="margin-bottom:20px; margin-top:20px;" value="" readonly>
        </mwc-textfield>
      </div>
      <div slot="content" class="layout vertical" style="width:300px;">
        <mwc-textfield id="pref-original-password" type="password"
            label="${_t('webui.menu.OriginalPassword')}" maxLength="64"
            style="margin-bottom:20px;">
        </mwc-textfield>
        <div class="horizontal flex layout">
          <mwc-textfield id="pref-new-password" label="${_t('webui.menu.NewPassword')}"
              type="password" maxLength="64"
              auto-validate validationMessage="${_t('webui.menu.InvalidPasswordMessage')}"
              pattern=${BackendAiCommonUtils.passwordRegex}
              @change="${this._validatePassword}">
          </mwc-textfield>
          <mwc-icon-button-toggle off onIcon="visibility" offIcon="visibility_off"
                                    @click="${(e) => this._togglePasswordVisibility(e.target)}">
          </mwc-icon-button-toggle>
        </div>
        <div class="horizontal flex layout">
          <mwc-textfield id="pref-new-password2" label="${_t('webui.menu.NewPasswordAgain')}"
              type="password" maxLength="64"
              @change="${this._validatePassword}">
          </mwc-textfield>
          <mwc-icon-button-toggle off onIcon="visibility" offIcon="visibility_off"
                                    @click="${(e) => this._togglePasswordVisibility(e.target)}">
          </mwc-icon-button-toggle>
        </div>
        ${this.totpSupported ? html`
          <div class="horizontal flex layout">
            <p style="flex-grow: 1;margin-left: 15px;">
              ${_t('webui.menu.TotpActivated')}
            </p>
            <mwc-switch id="totp-activation" .selected="${this.totpActivated}" style="margin-right: 10px;"
                @click="${(e) => this.totpActivated ? this._confirmRemovingTotp(e) : this._startActivatingTotp(e)}">
            </mwc-switch>
          </div>
        `: html``}
      </div>
      <div slot="footer" class="horizontal end-justified flex layout">
        <div class="flex"></div>
        <mwc-button
            label="${_t('webui.menu.Cancel')}"
            @click="${this._hideUserPrefDialog}"></mwc-button>
        <mwc-button
            unelevated
            label="${_t('webui.menu.Update')}"
            @click="${this._updateUserInformation}"></mwc-button>
      </div>
    </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-user-dropdown-menu': BackendAiUserDropdownMenu;
  }
}
