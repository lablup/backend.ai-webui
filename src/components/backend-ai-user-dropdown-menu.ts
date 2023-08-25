/**
 @license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
 */
import { navigate } from '../backend-ai-app';
import QR from '../lib/qr';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import { store } from '../store';
import BackendAIDialog from './backend-ai-dialog';
import { BackendAIWebUIStyles } from './backend-ai-webui-styles';
import '@material/mwc-icon-button';
import '@material/mwc-select';
import { Switch } from '@material/mwc-switch';
import { TextField } from '@material/mwc-textfield';
import { LitElement, html, CSSResultGroup } from 'lit';
import { translate as _t } from 'lit-translate';
import { get as _text } from 'lit-translate/util';
import { customElement, property, query } from 'lit/decorators.js';

/**
 Backend AI User dropdown menu

 Example:

 <backend-ai-user-dropdown-menu></backend-ai-user-dropdown-menu>

 @group Backend.AI Web UI
 @element backend-ai-user-dropdown-menu
 */
@customElement('backend-ai-user-dropdown-menu')
export default class BackendAiUserDropdownMenu extends LitElement {
  @property({ type: String }) userId = 'DISCONNECTED';
  @property({ type: String }) fullName = 'DISCONNECTED';
  @property({ type: String }) domain = 'CLICK TO CONNECT';
  @property({ type: Object }) loggedAccount = Object();
  @property({ type: Object }) roleInfo = Object();
  @property({ type: Object }) keyPairInfo = Object();
  @property({ type: Array }) groups = [];
  @property({ type: Object }) notification;
  @property({ type: Boolean }) isUserInfoMaskEnabled = true;
  @property({ type: Boolean }) totpSupported = false;
  @property({ type: Boolean }) totpActivated = false;
  @property({ type: Boolean }) forceTotp = false;
  @property({ type: Boolean }) isOpenUserPrefDialog = false;
  @property({ type: String }) totpKey = '';
  @property({ type: String }) totpUri = '';

  @query('#totp-setup-dialog') totpSetupDialog: BackendAIDialog | undefined;
  @query('#totp-removal-confirm-dialog') totpRemovalConfirmDialog:
    | BackendAIDialog
    | undefined;
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
    ];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          this._refreshUserInfoPanel();
          this.isUserInfoMaskEnabled =
            globalThis.backendaiclient._config.maskUserInfo;
        },
        true,
      );
    } else {
      this._refreshUserInfoPanel();
      this.isUserInfoMaskEnabled =
        globalThis.backendaiclient._config.maskUserInfo;
    }
  }

  /**
   * Refresh the user information panel.
   */
  _refreshUserInfoPanel(): void {
    this.userId = globalThis.backendaiclient.email;
    this.fullName = globalThis.backendaiclient.full_name;
    this.domain = globalThis.backendaiclient._config.domainName;
    this.loggedAccount.access_key =
      globalThis.backendaiclient._config.accessKey;
    this._showRole();
    this._showTotpActivated();
  }

  /**
   * Check Fullname exists, and if not then use user_id instead.
   *
   * @return {string} Name from full name or user ID
   */
  _getUsername() {
    let name =
      this.fullName?.replace(/\s+/g, '').length > 0
        ? this.fullName
        : this.userId;
    // mask username only when the configuration is enabled
    if (this.isUserInfoMaskEnabled) {
      const maskStartIdx = 2;
      const emailPattern =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      const isEmail: boolean = emailPattern.test(name);
      const maskLength = isEmail
        ? name.split('@')[0].length - maskStartIdx
        : name.length - maskStartIdx;
      name = globalThis.backendaiutils._maskString(
        name,
        '*',
        maskStartIdx,
        maskLength,
      );
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
      userId = globalThis.backendaiutils._maskString(
        userId,
        '*',
        maskStartIdx,
        maskLength,
      );
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
    this.totpSupported =
      globalThis.backendaiclient?.supports('2FA') &&
      (await globalThis.backendaiclient?.isManagerSupportingTOTP());
    if (this.totpSupported) {
      const userInfo = await globalThis.backendaiclient?.user.get(
        globalThis.backendaiclient.email,
        ['totp_activated'],
      );
      this.totpActivated = userInfo.user.totp_activated;
      this.forceTotp =
        globalThis.backendaiclient?.supports('force2FA') &&
        globalThis.backendaiclient?._config.force2FA;
      const properties = [
        'open',
        'noclosebutton',
        'persistent',
        'escapeKeyAction',
        'scrimClickAction',
      ];
      if (this.forceTotp && !this.totpActivated) {
        properties.forEach((property) => {
          this.totpSetupDialog?.setAttribute(property, '');
        });
        this._openTotpSetupDialog();
      } else {
        this.totpSetupDialog?.removeAttribute(properties.join(' '));
      }
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

  async _updateUserFullName(newFullName: string) {
    this.fullName = globalThis.backendaiclient.full_name = newFullName;
  }
  /**
   * Open the user preference dialog.
   */
  async _openUserPrefDialog() {
    this.isOpenUserPrefDialog = true;
  }

  /**
   * Hide the user preference dialog.
   */
  _hideUserPrefDialog() {
    this.isOpenUserPrefDialog = false;
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
    store.dispatch(
      navigate(decodeURIComponent('/usersettings'), { tab: 'logs' }),
    );
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
    store.dispatch(
      navigate(decodeURIComponent('/usersettings'), { tab: 'general' }),
    );
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

  async _startActivatingTotp() {
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
      if (!this.forceTotp) {
        this._openUserPrefDialog();
      }
    } catch (e) {
      this.notification.text = _text('totp.InvalidTotpCode');
      this.notification.show();
    }
  }

  _confirmRemovingTotp() {
    this._hideUserPrefDialog();
    this.totpRemovalConfirmDialog?.show();
  }

  render() {
    return html`
      <link rel="stylesheet" href="resources/custom.css">
      <div class="horizontal flex center layout">
        <span class="full_name user-name" style="font-size:14px;text-align:right;-webkit-font-smoothing:antialiased;margin:auto 0 auto 10px;">
          ${this._getUsername()}
        </span>
        <backend-ai-react-user-dropdown-menu
          @open="${() => this._openUserPrefDialog()}"
          @moveToLogPage="${() => this._moveToLogPage()}"
          @moveToUserSettingPage="${() => this._moveToUserSettingsPage()}"
        >
        </backend-ai-react-user-dropdown-menu>
      </div>
    </div>
    <backend-ai-dialog id="totp-setup-dialog" fixed backdrop>
      <span slot="title">${_t('webui.menu.SetupTotp')}</span>
      <div slot="content" class="layout vertical" style="width: 300px; align-items: center;">
        <p>${_t('totp.ScanQRToEnable')}</p>
        <img id="totp-uri-qrcode" style="width: 150px; height: 150px;" alt="QR" />
        <p>${_t('totp.TypeInAuthKey')}</p>
        <backend-ai-react-copyable-code-text value="${
          this.totpKey
        }"></backend-ai-react-copyable-code-text>
      </div>
      <div slot="content" class="layout vertical" style="width: 300px">
        <p style="flex-grow: 1;">${_t('totp.EnterConfirmationCode')}</p>
        <mwc-textfield id="totp-confirm-otp" type="number" no-label-float placeholder="000000"
          min="0" max="999999" style="margin-left:1em;width:120px;">
          </mwc-textfield>
      </div>
      <div slot="footer" class="horizontal end-justified flex layout">
        <mwc-button unelevated @click="${(e) => this._confirmOtpSetup(e)}">${_t(
          'button.Confirm',
        )}</mwc-button>
      </div>
    </backend-ai-dialog>
    <backend-ai-dialog id="totp-removal-confirm-dialog" fixed backdrop>
      <span slot="title">${_t('button.Confirm')}</span>
      <div slot="content" class="layout vertical" style="width: 300px; align-items: center;">
        <p>${_t('totp.ConfirmTotpRemovalBody')}</p>
      </div>
      <div slot="footer" class="horizontal end-justified flex layout">
        <mwc-button unelevated @click="${(e) => this._stopUsingTotp(e)}">${_t(
          'button.Confirm',
        )}</mwc-button>
      </div>
    </backend-ai-dialog>
    <backend-ai-react-user-profile-dialog
      value="${JSON.stringify({
        isOpenUserPrefDialog: this.isOpenUserPrefDialog,
      })}"
      @cancel="${() => this._hideUserPrefDialog()}"
      @updateFullName="${(e) => this._updateUserFullName(e.detail.newFullName)}"
      @confirmRemovingTotp="${() => this._confirmRemovingTotp()}"
      @startActivatingTotp="${() => this._startActivatingTotp()}"
    >
    </backend-ai-react-user-profile-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-user-dropdown-menu': BackendAiUserDropdownMenu;
  }
}
