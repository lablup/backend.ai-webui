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
import { BackendAIWebUIStyles } from './backend-ai-webui-styles';
import '@material/mwc-icon-button';
import '@material/mwc-select';
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

  render() {
    return html`
      <link rel="stylesheet" href="resources/custom.css" />
      <backend-ai-react-user-dropdown-menu
        @moveToLogPage="${() => this._moveToLogPage()}"
        @moveToUserSettingPage="${() => this._moveToUserSettingsPage()}"
      ></backend-ai-react-user-dropdown-menu>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-user-dropdown-menu': BackendAiUserDropdownMenu;
  }
}
