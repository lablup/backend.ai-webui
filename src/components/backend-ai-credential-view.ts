/**
 * Backend.AI-credential-view
 */
import JsonToCsv from '../lib/json_to_csv';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import BackendAiCommonUtils from './backend-ai-common-utils';
import './backend-ai-credential-list';
import './backend-ai-dialog';
import { BackendAiStyles } from './backend-ai-general-styles';
import './backend-ai-multi-select';
import { BackendAIPage } from './backend-ai-page';
import { default as PainKiller } from './backend-ai-painkiller';
import './backend-ai-user-list';
import './lablup-activity-panel';
import './lablup-expansion';
import '@material/mwc-button';
import '@material/mwc-checkbox';
import '@material/mwc-formfield';
import '@material/mwc-icon-button';
import '@material/mwc-list';
import { Menu } from '@material/mwc-menu';
import { Select } from '@material/mwc-select';
import '@material/mwc-tab';
import '@material/mwc-tab-bar';
import { TextField } from '@material/mwc-textfield';
import { css, CSSResultGroup, html } from 'lit';
import { get as _text, translate as _t } from 'lit-translate';
import { customElement, property, query, state } from 'lit/decorators.js';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type BackendAICredentialList =
  HTMLElementTagNameMap['backend-ai-credential-list'];
type BackendAIUserList = HTMLElementTagNameMap['backend-ai-user-list'];
type BackendAIDialog = HTMLElementTagNameMap['backend-ai-dialog'];

/**
 Backend.AI Credential view page

 Example:

 <backend-ai-credential-view active=true>
 ... content ...
 </backend-ai-credential-view>

@group Backend.AI Web UI
 */
@customElement('backend-ai-credential-view')
export default class BackendAICredentialView extends BackendAIPage {
  @property({ type: Object }) vfolder_max_limit = {};
  @property({ type: Array }) rate_metric = [
    1000, 2000, 3000, 4000, 5000, 10000, 50000,
  ];
  @property({ type: Object }) resource_policies = Object();
  @property({ type: Array }) resource_policy_names;
  @property({ type: Boolean }) isAdmin = false;
  @property({ type: Boolean }) isSuperAdmin = false;
  @property({ type: String }) _status = 'inactive';
  @property({ type: String }) new_access_key = '';
  @property({ type: String }) new_secret_key = '';
  @property({ type: String }) _activeTab = 'users';
  @property({ type: Object }) notification = Object();
  @property({ type: String }) _defaultFileName = '';
  @property({ type: Boolean }) enableSessionLifetime = false;
  @property({ type: String }) activeUserInnerTab = 'active';
  @property({ type: String }) activeCredentialInnerTab = 'active';
  @query('#active-credential-list')
  activeCredentialList!: BackendAICredentialList;
  @query('#inactive-credential-list')
  inactiveCredentialList!: BackendAICredentialList;
  @query('#active-user-list') activeUserList!: BackendAIUserList;
  @query('#rate-limit') rateLimit!: Select;
  @query('#resource-policy') resourcePolicy!: Select;
  @query('#id_user_email') userEmailInput!: TextField;
  @query('#id_new_user_id') userIdInput!: TextField;
  @query('#id_user_confirm') userPasswordConfirmInput!: TextField;
  @query('#id_user_name') userNameInput!: TextField;
  @query('#id_user_password') userPasswordInput!: TextField;
  @query('#new-keypair-dialog') newKeypairDialog!: BackendAIDialog;
  @query('#new-user-dialog') newUserDialog!: BackendAIDialog;
  @query('#export-to-csv') exportToCsvDialog!: BackendAIDialog;
  @query('#export-file-name') exportFileNameInput!: TextField;

  constructor() {
    super();
    this.resource_policy_names = [];
  }

  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        #new-keypair-dialog {
          min-width: 350px;
          height: 100%;
        }

        div.card > h4 {
          margin-bottom: 0px;
          background-color: var(--token-colorBgContainer);
        }

        div.card h3 {
          padding-top: 0;
          padding-right: 15px;
          padding-bottom: 0;
        }

        div.card div.card {
          margin: 0;
          padding: 0;
          --card-elevation: 0;
        }

        div.sessions-section {
          width: 167px;
          margin-bottom: 10px;
        }

        #user-lists > h4,
        #credential-lists > h4 {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }

        mwc-tab-bar.sub-bar mwc-tab {
          --mdc-tab-height: 46px;
          --mdc-text-transform: none;
        }

        mwc-list-item {
          height: auto;
          font-size: 12px;
          --mdc-theme-primary: var(--general-sidebar-color);
        }

        mwc-checkbox {
          margin-left: 0;
          --mdc-icon-size: 14px;
          --mdc-checkbox-ripple-size: 20px;
          --mdc-checkbox-state-layer-size: 14px;
        }

        mwc-formfield {
          font-size: 8px;
          --mdc-typography-body2-font-size: 10px;
        }

        mwc-textfield {
          width: 100%;
          --mdc-text-field-fill-color: transparent;
          --mdc-theme-primary: var(--general-textfield-selected-color);
          --mdc-typography-font-family: var(--token-fontFamily);
        }

        mwc-textfield#export-file-name {
          margin-bottom: 10px;
        }

        mwc-textfield#id_user_name {
          margin-bottom: 18px;
        }

        mwc-menu {
          --mdc-menu-item-height: auto;
        }

        mwc-menu#dropdown-menu {
          position: relative;
          left: -10px;
          top: 50px;
        }

        mwc-icon-button {
          --mdc-icon-size: 20px;
          color: var(--paper-grey-700);
        }

        mwc-icon-button#dropdown-menu-button {
          margin-left: 10px;
        }

        backend-ai-dialog {
          --component-min-width: 350px;
          --component-max-width: 390px;
        }

        backend-ai-dialog h4 {
          font-size: 14px;
          padding: 5px 15px 5px 12px;
          margin: 0 0 10px 0;
          display: block;
          height: 20px;
          border-bottom: 1px solid #ddd;
        }

        div.popup-right-margin {
          margin-right: 5px;
        }
        div.popup-left-margin {
          margin-left: 5px;
        }
        div.popup-both-margin {
          margin-left: 5px;
          margin-right: 5px;
        }

        @media screen and (max-width: 805px) {
          mwc-tab,
          mwc-button {
            --mdc-typography-button-font-size: 10px;
          }
        }
      `,
    ];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    document.addEventListener(
      'backend-ai-credential-refresh',
      () => {
        this.activeCredentialList.refresh();
        this.inactiveCredentialList.refresh();
      },
      true,
    );

    this._addInputValidator(this.userIdInput);
  }

  /**
   * If admin comes, prepare the user list page.
   */
  async _preparePage() {
    if (globalThis.backendaiclient.is_admin !== true) {
      this.disablePage();
    } else {
      this.isAdmin = true;
      if (globalThis.backendaiclient.is_superadmin === true) {
        this.isSuperAdmin = true;
      }
    }
    this._activeTab = 'user-lists';
    this.vfolder_max_limit['value'] = 10;
    this._defaultFileName = this._getDefaultCSVFileName();
    await this._runAction();
  }

  /**
   * Change resource policy list's active state and user list's active state.
   *
   * @param {Boolean} active
   */
  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      this.activeUserList.active = false;
      this._status = 'inactive';
      return;
    }
    this.activeUserList.active = true;
    this._status = 'active';
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener('backend-ai-connected', () => {
        this.enableSessionLifetime =
          globalThis.backendaiclient.supports('session-lifetime');
        this._preparePage();
      });
    } else {
      // already connected
      this.enableSessionLifetime =
        globalThis.backendaiclient.supports('session-lifetime');
      this._preparePage();
    }
  }

  /**
   * Launch a keypair dialog.
   */
  async _launchKeyPairDialog() {
    await this._getResourcePolicies();
    this.newKeypairDialog.show();

    // initialize user_id
    this.userIdInput.value = '';
  }

  /**
   * Launch an user add dialog.
   */
  _launchUserAddDialog() {
    this.newUserDialog.show();
  }

  /**
   * Get resource policies from backend client.
   */
  async _getResourcePolicies() {
    const fields = [
      'name',
      'default_for_unspecified',
      'total_resource_slots',
      'max_concurrent_sessions',
      'max_containers_per_session',
    ];
    if (this.enableSessionLifetime) {
      fields.push('max_session_lifetime');
    }
    return globalThis.backendaiclient.resourcePolicy
      .get(null, fields)
      .then((response) => {
        const policies = globalThis.backendaiclient.utils.gqlToObject(
          response.keypair_resource_policies,
          'name',
        );
        const policyNames = globalThis.backendaiclient.utils.gqlToList(
          response.keypair_resource_policies,
          'name',
        );
        this.resource_policies = policies;
        this.resource_policy_names = policyNames;
        this.resourcePolicy.layout(true).then(() => {
          this.resourcePolicy.select(0);
        });
        this.rateLimit.layout(true).then(() => {
          this.rateLimit.select(0);
        });
      });
  }

  /**
   * Create a keypair to the user.
   */
  _addKeyPair() {
    const is_active = true;
    const is_admin = false;
    let user_id = '';

    if (!this.userIdInput.checkValidity()) {
      return;
    } else {
      user_id = this.userIdInput.value;
    }
    /* deprecate empty user_id regarded as superadmin email */
    // user_id = globalThis.backendaiclient.email;

    /* access_key and secret_key is auto-generated by the manager */
    /*
      let access_key = this.shadowRoot.querySelector('#id_new_user_id').value;
      let secret_key = this.shadowRoot.querySelector('#id_new_secret_key').value;
      globalThis.backendaiclient.keypair.add(user_id, is_active, is_admin,
        resource_policy, rate_limit, access_key, secret_key).then(response => {
    */

    const resource_policy = this.resourcePolicy.value;
    const rate_limit = parseInt(this.rateLimit.value);
    // Read resources
    globalThis.backendaiclient.keypair
      .add(user_id, is_active, is_admin, resource_policy, rate_limit)
      .then((response) => {
        if (response.create_keypair.ok) {
          this.newKeypairDialog.hide();
          this.notification.text = _text('credential.KeypairCreated');
          this.notification.show();
          this.activeCredentialList.refresh();
        } else if (response.create_keypair.msg) {
          const id_requested = response.create_keypair.msg.split(':')[1];
          this.notification.text =
            _text('credential.UserNotFound') + id_requested;
          this.notification.show();
        } else {
          this.notification.text = _text('dialog.ErrorOccurred');
          this.notification.show();
        }
      })
      .catch((err) => {
        console.log(err);
        if (err && err.message) {
          this.newKeypairDialog.hide();
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      });
  }

  /**
   * Add an user with user information.
   */
  _addUser() {
    const email = this.userEmailInput.value;
    // if name value is empty, it will be covered by the username of email address.
    const name =
      this.userNameInput.value !== ''
        ? this.userNameInput.value
        : email.split('@')[0];
    const password = this.userPasswordInput.value;

    // if any input value is invalid, it returns.
    if (
      !this.userEmailInput.checkValidity() ||
      !this.userPasswordInput.checkValidity() ||
      !this.userPasswordConfirmInput.checkValidity()
    ) {
      return;
    }

    // all values except 'username', and 'password' are arbitrarily designated default values
    const input = {
      username: name,
      password: password,
      need_password_change: false,
      full_name: name,
      description: `${name}'s Account`,
      is_active: true,
      domain_name: 'default',
      role: 'user',
    };

    globalThis.backendaiclient.group
      .list()
      .then((res) => {
        const default_id = res.groups.find((x) => x.name === 'default').id;
        return Promise.resolve(
          globalThis.backendaiclient.user.create(email, {
            ...input,
            group_ids: [default_id],
          }),
        );
      })
      .then((res) => {
        this.newUserDialog.hide();
        if (res['create_user'].ok) {
          this.notification.text = _text('credential.UserAccountCreated');

          this.activeUserList.refresh();
        } else {
          // console.error(res['create_user'].msg);
          this.notification.text = _text('credential.UserAccountCreatedError');
        }
        this.notification.show();

        this.userEmailInput.value = '';
        this.userNameInput.value = '';
        this.userPasswordInput.value = '';
        this.userPasswordConfirmInput.value = '';
      });
  }

  /**
   * Disable the page.
   */
  disablePage() {
    const els = this.shadowRoot?.querySelectorAll<HTMLElement>(
      '.admin',
    ) as NodeListOf<HTMLElement>;
    for (let x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
  }

  /**
   * Display the tab.
   *
   * @param {EventTarget} tab - Tab webcomponent
   */
  _showTab(tab) {
    const els = this.shadowRoot?.querySelectorAll<HTMLDivElement>(
      '.tab-content',
    ) as NodeListOf<HTMLDivElement>;
    for (let x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    this._activeTab = tab.title;
    (
      this.shadowRoot?.querySelector('#' + tab.title) as HTMLElement
    ).style.display = 'block';
    const tabKeyword = this._activeTab.substring(0, this._activeTab.length - 1); // to remove '-s'.
    let innerTab;
    // show inner tab(active) after selecting outer tab
    switch (this._activeTab) {
      case 'user-lists':
        innerTab = this.shadowRoot?.querySelector(
          'mwc-tab[title=' + this.activeUserInnerTab + '-' + tabKeyword + ']',
        );
        this._showList(innerTab);
        break;
      case 'credential-lists':
        innerTab = this.shadowRoot?.querySelector(
          'mwc-tab[title=' +
            this.activeCredentialInnerTab +
            '-' +
            tabKeyword +
            ']',
        );
        this._showList(innerTab);
        break;
      default:
        break;
    }
  }

  /**
   * Display the list.
   *
   * @param {EventTarget} list - List webcomponent
   */
  _showList(list) {
    const els = this.shadowRoot?.querySelectorAll<HTMLElement>(
      '.list-content',
    ) as NodeListOf<HTMLElement>;
    for (let x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    (
      this.shadowRoot?.querySelector('#' + list.title) as HTMLElement
    ).style.display = 'block';
    const splitTitle = list.title.split('-');
    if (splitTitle[1] == 'user') {
      this.activeUserInnerTab = splitTitle[0];
    } else {
      this.activeCredentialInnerTab = splitTitle[0];
    }
    const event = new CustomEvent('user-list-updated', {});
    this.shadowRoot?.querySelector('#' + list.title)?.dispatchEvent(event);
  }

  /**
   * Display a export to csv dialog.
   */
  _openExportToCsvDialog() {
    this._defaultFileName = this._getDefaultCSVFileName();
    this.exportToCsvDialog.show();
  }

  /**
   * Export user list and credential lists and resource policy lists to csv.
   */
  _exportToCSV() {
    if (!this.exportFileNameInput.validity.valid) {
      return;
    }
    let users;
    let credential_active;
    let credential_inactive;
    let credential;
    switch (this._activeTab) {
      case 'user-lists':
        users = this.activeUserList.users;
        users.map((obj) => {
          // filtering unnecessary key
          ['password', 'need_password_change'].forEach(
            (key) => delete obj[key],
          );
        });
        JsonToCsv.exportToCsv(this.exportFileNameInput.value, users);
        break;
      case 'credential-lists':
        credential_active = this.activeCredentialList.keypairs;
        credential_inactive = this.inactiveCredentialList.keypairs;
        credential = credential_active.concat(credential_inactive);
        credential.map((obj) => {
          // filtering unnecessary key
          ['is_admin'].forEach((key) => delete obj[key]);
        });
        JsonToCsv.exportToCsv(this.exportFileNameInput.value, credential);
        break;
    }
    this.notification.text = _text('session.DownloadingCSVFile');
    this.notification.show();
    this.exportToCsvDialog.hide();
  }

  /**
   * Get default csv file name according to local time.
   *
   * @return {string} - Filename with Date and Time.
   */
  _getDefaultCSVFileName() {
    const date = new Date().toISOString().substring(0, 10);
    const time = new Date().toTimeString().slice(0, 8).replace(/:/gi, '-');
    return date + '_' + time;
  }

  /**
   * Control a dropdown menu's open state.
   *
   * @param {Event} e - event from dropdown component.
   */
  _toggleDropdown(e) {
    const menu = this.shadowRoot?.querySelector('#dropdown-menu') as Menu;
    const button = e.target;
    menu.anchor = button;
    if (!menu.open) {
      menu.show();
    }
  }

  _validatePassword1() {
    this.userPasswordConfirmInput.reportValidity();
    this.userPasswordInput.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          this.userPasswordInput.validationMessage = _text(
            'signup.PasswordInputRequired',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        } else {
          this.userPasswordInput.validationMessage = _text(
            'signup.PasswordInvalid',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        }
      } else {
        return {
          valid: nativeValidity.valid,
          customError: !nativeValidity.valid,
        };
      }
    };
  }

  _validatePassword2() {
    this.userPasswordConfirmInput.validityTransform = (
      newValue,
      nativeValidity,
    ) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          this.userPasswordConfirmInput.validationMessage = _text(
            'signup.PasswordInputRequired',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        } else {
          this.userPasswordConfirmInput.validationMessage = _text(
            'signup.PasswordInvalid',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        }
      } else {
        // custom validation for password input match
        const isMatched =
          this.userPasswordInput.value === this.userPasswordConfirmInput.value;
        if (!isMatched) {
          this.userPasswordConfirmInput.validationMessage = _text(
            'signup.PasswordNotMatched',
          );
        }
        return {
          valid: isMatched,
          customError: !isMatched,
        };
      }
    };
  }

  _validatePassword() {
    this._validatePassword1();
    this._validatePassword2();
  }

  _togglePasswordVisibility(element) {
    const isVisible = element.__on;
    const password = element.closest('div').querySelector('mwc-textfield');
    isVisible
      ? password.setAttribute('type', 'text')
      : password.setAttribute('type', 'password');
  }

  static gBToBytes(value = 0) {
    const gigabyte = Math.pow(10, 9);
    return Math.round(gigabyte * value);
  }

  async _runAction() {
    if (location.search.includes('action')) {
      if (location.search.includes('add')) {
        await this._launchKeyPairDialog();
      }
      this._showTab(
        this.shadowRoot?.querySelector('mwc-tab[title=credential-lists]'),
      );
      this.shadowRoot
        ?.querySelector('mwc-tab-bar.main-bar')
        ?.setAttribute('activeindex', '1');
    }
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css" />
      <lablup-activity-panel noheader narrow autowidth>
        <div slot="message">
          <h3 class="tab horizontal wrap layout">
            <mwc-tab-bar class="main-bar">
              <mwc-tab
                title="user-lists"
                label="${_t('credential.Users')}"
                @click="${(e) => this._showTab(e.target)}"
              ></mwc-tab>
              <mwc-tab
                title="credential-lists"
                label="${_t('credential.Credentials')}"
                @click="${(e) => this._showTab(e.target)}"
              ></mwc-tab>
            </mwc-tab-bar>
            ${this.isAdmin
              ? html`
                  <span class="flex"></span>
                  <div style="position: relative;">
                    <mwc-icon-button
                      id="dropdown-menu-button"
                      icon="more_horiz"
                      raised
                      @click="${(e) => this._toggleDropdown(e)}"
                    ></mwc-icon-button>
                    <mwc-menu id="dropdown-menu">
                      <mwc-list-item>
                        <a
                          class="horizontal layout start center export-csv"
                          @click="${this._openExportToCsvDialog}"
                        >
                          <mwc-icon
                            style="color:var(--token-colorTextSecondary);padding-right:10px;"
                          >
                            get_app
                          </mwc-icon>
                          ${_t('credential.exportCSV')}
                        </a>
                      </mwc-list-item>
                    </mwc-menu>
                  </div>
                `
              : html``}
          </h3>
          <div id="user-lists" class="admin item tab-content card">
            <h4 class="horizontal flex center center-justified layout">
              <mwc-tab-bar class="sub-bar">
                <mwc-tab
                  title="active-user-list"
                  label="${_t('credential.Active')}"
                  @click="${(e) => this._showList(e.target)}"
                ></mwc-tab>
                <mwc-tab
                  title="inactive-user-list"
                  label="${_t('credential.Inactive')}"
                  @click="${(e) => this._showList(e.target)}"
                ></mwc-tab>
              </mwc-tab-bar>
              <span class="flex"></span>
              <mwc-button
                raised
                id="add-user"
                icon="add"
                label="${_t('credential.CreateUser')}"
                @click="${this._launchUserAddDialog}"
              ></mwc-button>
            </h4>
            <div>
              <backend-ai-user-list
                class="list-content"
                id="active-user-list"
                condition="active"
                ?active="${this._activeTab === 'user-lists'}"
              ></backend-ai-user-list>
              <backend-ai-user-list
                class="list-content"
                id="inactive-user-list"
                style="display:none;"
                ?active="${this._activeTab === 'user-lists'}"
              ></backend-ai-user-list>
            </div>
          </div>
          <div
            id="credential-lists"
            class="item tab-content card"
            style="display:none;"
          >
            <h4 class="horizontal flex center center-justified layout">
              <mwc-tab-bar class="sub-bar">
                <mwc-tab
                  title="active-credential-list"
                  label="${_t('credential.Active')}"
                  @click="${(e) => this._showList(e.target)}"
                ></mwc-tab>
                <mwc-tab
                  title="inactive-credential-list"
                  label="${_t('credential.Inactive')}"
                  @click="${(e) => this._showList(e.target)}"
                ></mwc-tab>
              </mwc-tab-bar>
              <div class="flex"></div>
              <mwc-button
                raised
                id="add-keypair"
                icon="add"
                label="${_t('credential.AddCredential')}"
                @click="${this._launchKeyPairDialog}"
              ></mwc-button>
            </h4>
            <backend-ai-credential-list
              class="list-content"
              id="active-credential-list"
              condition="active"
              ?active="${this._activeTab === 'credential-lists'}"
            ></backend-ai-credential-list>
            <backend-ai-credential-list
              class="list-content"
              style="display:none;"
              id="inactive-credential-list"
              condition="inactive"
              ?active="${this._activeTab === 'credential-lists'}"
            ></backend-ai-credential-list>
          </div>
        </div>
      </lablup-activity-panel>
      <backend-ai-dialog id="new-keypair-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t('credential.AddCredential')}</span>
        <div slot="content">
          <div class="vertical center-justified layout center">
            <mwc-textfield
              type="email"
              name="new_user_id"
              id="id_new_user_id"
              label="${_t('credential.UserIDAsEmail')}"
              validationMessage="${_t('credential.UserIDRequired')}"
              required
              maxLength="64"
              placeholder="${_t('maxLength.64chars')}"
              autoValidate
            ></mwc-textfield>

            <mwc-select
              id="resource-policy"
              label="${_t('credential.ResourcePolicy')}"
              style="width:100%;margin:10px 0;"
            >
              ${this.resource_policy_names.map(
                (item) => html`
                  <mwc-list-item value="${item}">${item}</mwc-list-item>
                `,
              )}
            </mwc-select>
            <mwc-select
              id="rate-limit"
              label="${_t('credential.RateLimitFor15min')}"
              style="width:100%;margin:10px 0;"
            >
              ${this.rate_metric.map(
                (item) => html`
                  <mwc-list-item value="${item}">${item}</mwc-list-item>
                `,
              )}
            </mwc-select>
            <!--<lablup-expansion name="advanced-keypair-info" summary="${_t(
              'general.Advanced',
            )}" style="width:100%;">
              <div class="vertical layout center">
              <mwc-textfield
                  type="text"
                  name="new_access_key"
                  id="id_new_access_key"
                  label="${_t('credential.UserIDAsEmail')}"
                  autoValidate></mwc-textfield>
              <mwc-textfield
                  type="text"
                  name="new_access_key"
                  id="id_new_secret_key"
                  label="${_t('credential.AccessKeyOptional')}"
                  autoValidate
                  .value="${this.new_access_key}"><mwc-textfield>
              </div>
            </lablup-expansion>-->
          </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
            raised
            id="create-keypair-button"
            icon="add"
            label="${_t('general.Add')}"
            fullwidth
            @click="${this._addKeyPair}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="new-user-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t('credential.CreateUser')}</span>
        <div slot="content">
          <mwc-textfield
            type="email"
            name="user_email"
            id="id_user_email"
            label="${_t('general.E-Mail')}"
            autoValidate
            required
            placeholder="${_text('maxLength.64chars')}"
            maxLength="64"
            validationMessage="${_text(
              'credential.validation.InvalidEmailAddress',
            )}"
          ></mwc-textfield>
          <mwc-textfield
            type="text"
            name="user_name"
            id="id_user_name"
            label="${_t('general.Username')}"
            placeholder="${_text('maxLength.64chars')}"
            maxLength="64"
          ></mwc-textfield>
          <div class="horizontal flex layout">
            <mwc-textfield
              type="password"
              name="user_password"
              id="id_user_password"
              label="${_t('general.Password')}"
              autoValidate
              required
              pattern=${BackendAiCommonUtils.passwordRegex}
              validationMessage="${_text('signup.PasswordInvalid')}"
              @change="${() => this._validatePassword()}"
              maxLength="64"
            ></mwc-textfield>
            <mwc-icon-button-toggle
              off
              onIcon="visibility"
              offIcon="visibility_off"
              @click="${(e) => this._togglePasswordVisibility(e.target)}"
            ></mwc-icon-button-toggle>
          </div>
          <div class="horizontal flex layout">
            <mwc-textfield
              type="password"
              name="user_confirm"
              id="id_user_confirm"
              label="${_t('general.ConfirmPassword')}"
              autoValidate
              required
              pattern=${BackendAiCommonUtils.passwordRegex}
              validationMessage="${_text('signup.PasswordNotMatched')}"
              @change="${() => this._validatePassword()}"
              maxLength="64"
            ></mwc-textfield>
            <mwc-icon-button-toggle
              off
              onIcon="visibility"
              offIcon="visibility_off"
              @click="${(e) => this._togglePasswordVisibility(e.target)}"
            ></mwc-icon-button-toggle>
          </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
            raised
            id="create-user-button"
            icon="add"
            label="${_t('credential.CreateUser')}"
            fullwidth
            @click="${this._addUser}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="export-to-csv" fixed backdrop blockscrolling>
        <span slot="title">
          ${_t('credential.ExportCSVFile')} (${this._activeTab})
        </span>

        <div slot="content" class="intro centered login-panel">
          <mwc-textfield
            id="export-file-name"
            label="${_text('credential.FileName')}"
            validationMessage="${_text(
              'credential.validation.LetterNumber-_dot',
            )}"
            value="${this._activeTab + '_' + this._defaultFileName}"
            required
            placeholder="${_t('maxLength.255chars')}"
            maxLength="255"
          ></mwc-textfield>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
            unelevated
            fullwidth
            icon="get_app"
            label="${_t('credential.ExportCSVFile')}"
            class="export-csv"
            @click="${this._exportToCSV}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-credential-view': BackendAICredentialView;
  }
}
