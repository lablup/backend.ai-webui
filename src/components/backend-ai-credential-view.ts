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
import './backend-ai-resource-policy-list';
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
type BackendAIResourcePolicyList =
  HTMLElementTagNameMap['backend-ai-resource-policy-list'];
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
  @property({ type: Object }) cpu_resource!: TextField;
  @property({ type: Object }) ram_resource!: TextField;
  @property({ type: Object }) gpu_resource!: TextField;
  @property({ type: Object }) fgpu_resource!: TextField;
  @property({ type: Object }) concurrency_limit = {};
  @property({ type: Object }) idle_timeout = {};
  @property({ type: Object }) session_lifetime = {};
  @property({ type: Object }) container_per_session_limit = {};
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
  @property({ type: Number }) selectAreaHeight;
  @property({ type: Boolean }) enableSessionLifetime = false;
  @property({ type: Boolean }) enableParsingStoragePermissions = false;
  @property({ type: String }) activeUserInnerTab = 'active';
  @property({ type: String }) activeCredentialInnerTab = 'active';
  @query('#active-credential-list')
  activeCredentialList!: BackendAICredentialList;
  @query('#inactive-credential-list')
  inactiveCredentialList!: BackendAICredentialList;
  @query('#active-user-list') activeUserList!: BackendAIUserList;
  @query('#resource-policy-list')
  resourcePolicyList!: BackendAIResourcePolicyList;
  @query('#dropdown-area') dropdownArea!: HTMLDivElement;
  @query('#rate-limit') rateLimit!: Select;
  @query('#resource-policy') resourcePolicy!: Select;
  @query('#id_user_email') userEmailInput!: TextField;
  @query('#id_new_policy_name') newPolicyNameInput!: TextField;
  @query('#id_new_user_id') userIdInput!: TextField;
  @query('#id_user_confirm') userPasswordConfirmInput!: TextField;
  @query('#id_user_name') userNameInput!: TextField;
  @query('#id_user_password') userPasswordInput!: TextField;
  @query('#new-keypair-dialog') newKeypairDialog!: BackendAIDialog;
  @query('#new-policy-dialog') newPolicyDialog!: BackendAIDialog;
  @query('#new-user-dialog') newUserDialog!: BackendAIDialog;
  @query('#export-to-csv') exportToCsvDialog!: BackendAIDialog;
  @query('#export-file-name') exportFileNameInput!: TextField;
  @query('#allowed-vfolder-hosts') private allowedVfolderHostsSelect;
  @state() private all_vfolder_hosts;
  @state() private default_vfolder_host = '';
  @state() private vfolderPermissions;
  @state() private isSupportMaxVfolderCountInUserResourcePolicy = false;

  constructor() {
    super();
    this.all_vfolder_hosts = [];
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
          background-color: var(--general-color-bg-container);
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
          --mdc-typography-font-family: var(--general-font-family);
        }

        mwc-textfield.resource-input {
          width: 5rem;
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
    // monkeypatch for height calculation.
    this.selectAreaHeight = this.dropdownArea.offsetHeight
      ? this.dropdownArea.offsetHeight
      : '123px';
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
    this._addValidatorToPolicyInput();
    this._getResourceInfo();
    this._getResourcePolicies();
    this._updateInputStatus(this.cpu_resource);
    this._updateInputStatus(this.ram_resource);
    this._updateInputStatus(this.gpu_resource);
    this._updateInputStatus(this.fgpu_resource);
    this._updateInputStatus(this.concurrency_limit);
    this._updateInputStatus(this.idle_timeout);
    this._updateInputStatus(this.container_per_session_limit);
    if (this.enableSessionLifetime) {
      this._updateInputStatus(this.session_lifetime);
    }
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
      this.resourcePolicyList.active = false;
      this.activeUserList.active = false;
      this._status = 'inactive';
      return;
    }
    this.resourcePolicyList.active = true;
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
        this.enableParsingStoragePermissions =
          globalThis.backendaiclient.supports(
            'fine-grained-storage-permissions',
          );
        this.isSupportMaxVfolderCountInUserResourcePolicy =
          globalThis.backendaiclient.supports(
            'max-vfolder-count-in-user-resource-policy',
          );
        this._preparePage();
        if (this.enableParsingStoragePermissions) {
          this._getVfolderPermissions();
        }
      });
    } else {
      // already connected
      this.enableSessionLifetime =
        globalThis.backendaiclient.supports('session-lifetime');
      this.enableParsingStoragePermissions =
        globalThis.backendaiclient.supports('fine-grained-storage-permissions');
      this.isSupportMaxVfolderCountInUserResourcePolicy =
        globalThis.backendaiclient.supports(
          'max-vfolder-count-in-user-resource-policy',
        );
      this._preparePage();
      if (this.enableParsingStoragePermissions) {
        this._getVfolderPermissions();
      }
    }
  }

  /**
   * Get All grantable permissions per action on storage hosts and vfolder
   */
  _getVfolderPermissions() {
    globalThis.backendaiclient.storageproxy.getAllPermissions().then((res) => {
      this.vfolderPermissions = res.vfolder_host_permission_list;
    });
  }

  /**
   * Parse simple allowed vfodler host list with fine-grained permissions
   *
   * @param {Array<string>} storageList - storage list selected in `backend-ai-multi-select`
   * @return {Object<string, array>} - k-v object for storage host based permissions (all-allowed)
   */
  _parseSelectedAllowedVfolderHostWithPermissions(storageList: Array<string>) {
    const obj = {};
    storageList.forEach((storage) => {
      Object.assign(obj, {
        [storage]: this.vfolderPermissions,
      });
    });
    return obj;
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
   * Get All Storage host information (superadmin-only)
   */
  _getAllStorageHostsInfo() {
    return globalThis.backendaiclient.vfolder
      .list_all_hosts()
      .then((res) => {
        this.all_vfolder_hosts = res.allowed;
        this.default_vfolder_host = res.default;
      })
      .catch((err) => {
        throw err;
      });
  }

  /**
   * Launch a resouce policy dialog.
   */
  _launchResourcePolicyDialog() {
    Promise.allSettled([
      this._getAllStorageHostsInfo(),
      this._getResourcePolicies(),
    ])
      .then((res) => {
        // TODO remove protected properties usage
        // @ts-ignore
        this.newPolicyNameInput.mdcFoundation.setValid(true);
        // @ts-ignore
        this.newPolicyNameInput.isUiValid = true;
        this.newPolicyNameInput.value = '';
        this.allowedVfolderHostsSelect.items = this.all_vfolder_hosts;
        this.allowedVfolderHostsSelect.selectedItemList = [
          this.default_vfolder_host,
        ];
        this.newPolicyDialog.show();
      })
      .catch((err) => {
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      });
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
   * Read resource policy and check validation.
   *
   * @return {Record<string, unknown>} input - K-V object for resource policy
   */
  _readResourcePolicyInput() {
    const total_resource_slots = {};
    let vfolder_hosts;
    if (this.enableParsingStoragePermissions) {
      vfolder_hosts = JSON.stringify(
        this._parseSelectedAllowedVfolderHostWithPermissions(
          this.allowedVfolderHostsSelect.selectedItemList,
        ),
      );
    } else {
      vfolder_hosts = this.allowedVfolderHostsSelect.selectedItemList;
    }
    this._validateUserInput(this.cpu_resource);
    this._validateUserInput(this.ram_resource);
    this._validateUserInput(this.gpu_resource);
    this._validateUserInput(this.fgpu_resource);
    this._validateUserInput(this.concurrency_limit);
    this._validateUserInput(this.idle_timeout);
    this._validateUserInput(this.container_per_session_limit);
    this._validateUserInput(this.vfolder_max_limit);

    total_resource_slots['cpu'] = this.cpu_resource['value'];
    total_resource_slots['mem'] = this.ram_resource['value'] + 'g';
    total_resource_slots['cuda.device'] = parseInt(this.gpu_resource['value']);
    total_resource_slots['cuda.shares'] = parseFloat(
      this.fgpu_resource['value'],
    );

    this.concurrency_limit['value'] =
      this.concurrency_limit['value'] === ''
        ? 0
        : parseInt(this.concurrency_limit['value']);
    this.idle_timeout['value'] =
      this.idle_timeout['value'] === ''
        ? 0
        : parseInt(this.idle_timeout['value']);
    this.container_per_session_limit['value'] =
      this.container_per_session_limit['value'] === ''
        ? 0
        : parseInt(this.container_per_session_limit['value']);

    Object.keys(total_resource_slots).map((resource) => {
      if (isNaN(parseFloat(total_resource_slots[resource]))) {
        delete total_resource_slots[resource];
      }
    });
    this.vfolder_max_limit['value'] =
      this.vfolder_max_limit['value'] === ''
        ? 0
        : parseInt(this.vfolder_max_limit['value']);
    const input = {
      default_for_unspecified: 'UNLIMITED',
      total_resource_slots: JSON.stringify(total_resource_slots),
      max_concurrent_sessions: this.concurrency_limit['value'],
      max_containers_per_session: this.container_per_session_limit['value'],
      idle_timeout: this.idle_timeout['value'],
      max_vfolder_count: this.vfolder_max_limit['value'],
      // TODO: remove this after fix graphql schema
      max_vfolder_size: -1,
      allowed_vfolder_hosts: vfolder_hosts,
    };
    if (this.enableSessionLifetime) {
      this._validateUserInput(this.session_lifetime);
      this.session_lifetime['value'] =
        this.session_lifetime['value'] === ''
          ? 0
          : parseInt(this.session_lifetime['value']);
      input['max_session_lifetime'] = this.session_lifetime['value'];
    }
    return input;
  }

  /**
   * Add a new resource policy.
   */
  _addResourcePolicy() {
    if (!this.newPolicyNameInput.checkValidity()) {
      this.newPolicyNameInput.reportValidity();
      return;
    }
    try {
      this.newPolicyNameInput.checkValidity();
      const name = this.newPolicyNameInput.value;
      if (name === '') {
        throw new Error(_text('resourcePolicy.PolicyNameEmpty'));
      }
      const input = this._readResourcePolicyInput();
      globalThis.backendaiclient.resourcePolicy
        .add(name, input)
        .then((response) => {
          this.newPolicyDialog.hide();
          this.notification.text = _text('resourcePolicy.SuccessfullyCreated');
          this.notification.show();
          this.resourcePolicyList.refresh();
        })
        .catch((err) => {
          console.log(err);
          if (err && err.message) {
            this.newPolicyDialog.hide();
            this.notification.text = PainKiller.relieve(err.title);
            this.notification.detail = err.message;
            this.notification.show(true, err);
          }
        });
    } catch (err) {
      this.notification.text = err.message;
      this.notification.show();
    }
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
   * Set a TextEl value according to toggle checkbox checked state.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  _toggleCheckbox(e) {
    const checkEl = e.target;
    const checked = checkEl.checked;
    const TextEl = checkEl.closest('div').querySelector('mwc-textfield');
    TextEl.disabled = checked;
    if (!TextEl.disabled) {
      if (TextEl.value === '') {
        TextEl.value = 0;
      }
    }
  }

  /**
   * Check validation of resource input.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  _validateResourceInput(e) {
    const textfield = e.target.closest('mwc-textfield');
    const checkbox_el = textfield
      .closest('div')
      .querySelector('mwc-formfield.unlimited');
    const checkbox = checkbox_el
      ? checkbox_el.querySelector('mwc-checkbox')
      : null;
    const countDecimals = (value: number) => {
      return value % 1 ? value.toString().split('.')[1].length : 0;
    };

    if (textfield.classList.contains('discrete')) {
      textfield.value = Math.round(textfield.value);
    }

    if (textfield.value <= 0) {
      // concurrency job and container-per-session limit must be upper than 0.
      textfield.value =
        textfield.id === 'concurrency-limit' ||
        textfield.id === 'container-per-session-limit'
          ? 1
          : 0;
    }

    if (!textfield.valid) {
      const decimal_point: number = textfield.step
        ? countDecimals(textfield.step)
        : 0;
      if (decimal_point > 0) {
        textfield.value = Math.min(
          textfield.value,
          textfield.value < 0 ? textfield.min : textfield.max,
        ).toFixed(decimal_point);
      } else {
        textfield.value = Math.min(
          Math.round(textfield.value),
          textfield.value < 0 ? textfield.min : textfield.max,
        );
      }
    }
    // automatically check when textfield is min
    if (checkbox) {
      textfield.disabled = checkbox.checked =
        textfield.value == parseFloat(textfield.min);
    }
  }

  _updateUnlimitedValue(value) {
    return ['-', 0, '0', 'Unlimited', Infinity, 'Infinity'].includes(value)
      ? ''
      : value;
  }

  /**
   * Check validation of user input.
   *
   * @param {object} resource
   */
  _validateUserInput(resource) {
    if (resource.disabled) {
      resource.value = '';
    } else {
      if (resource.value === '') {
        throw new Error(_text('resourcePolicy.CannotCreateResourcePolicy'));
      }
    }
  }

  /**
   * Add validator to policy input.
   */
  _addValidatorToPolicyInput() {
    this.newPolicyNameInput.validityTransform = (value, nativeValidity) => {
      if (!nativeValidity) {
        this.newPolicyNameInput.validationMessage = _text(
          'credential.validation.PolicyName',
        );
        return {
          valid: false,
          valueMissing: true,
        };
      }
      if (!nativeValidity.valid) {
        if (nativeValidity.patternMismatch) {
          this.newPolicyNameInput.validationMessage = _text(
            'credential.validation.LetterNumber-_dot',
          );
          return {
            valid: nativeValidity.valid,
            patternMismatch: !nativeValidity.valid,
          };
        } else if (nativeValidity.valueMissing) {
          this.newPolicyNameInput.validationMessage = _text(
            'credential.validation.PolicyName',
          );
          return {
            valid: nativeValidity.valid,
            valueMissing: !nativeValidity.valid,
          };
        } else {
          this.newPolicyNameInput.validationMessage = _text(
            'credential.validation.LetterNumber-_dot',
          );
          return {
            valid: nativeValidity.valid,
            patternMismatch: !nativeValidity.valid,
          };
        }
      } else {
        const isValid = !this.resource_policy_names.includes(value);
        if (!isValid) {
          this.newPolicyNameInput.validationMessage = _text(
            'credential.validation.NameAlreadyExists',
          );
        }
        return {
          valid: isValid,
          customError: !isValid,
        };
      }
    };
  }

  /**
   * Update the input resource's status.
   *
   * @param {object} resource
   */
  _updateInputStatus(resource) {
    const textfield = resource;
    const checkbox = textfield.closest('div').querySelector('mwc-checkbox');
    if (textfield.value === '' || textfield.value === '0') {
      textfield.disabled = true;
      if (checkbox) checkbox.checked = true;
    } else {
      textfield.disabled = false;
      if (checkbox) checkbox.checked = false;
    }
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
    let resource_policy;
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
      case 'resource-policy-lists':
        resource_policy = this.resourcePolicyList.resourcePolicy;
        JsonToCsv.exportToCsv(this.exportFileNameInput.value, resource_policy);
        break;
    }
    this.notification.text = _text('session.DownloadingCSVFile');
    this.notification.show();
    this.exportToCsvDialog.hide();
  }

  /**
   * Get resource information includes cpu, ram, gpu, fgpu, concurrency limit, idle timeout,
   * container per session limit, vforder capacity and vfolder max limit.
   */
  _getResourceInfo() {
    this.cpu_resource = this.shadowRoot?.querySelector(
      '#cpu-resource',
    ) as TextField;
    this.ram_resource = this.shadowRoot?.querySelector(
      '#ram-resource',
    ) as TextField;
    this.gpu_resource = this.shadowRoot?.querySelector(
      '#gpu-resource',
    ) as TextField;
    this.fgpu_resource = this.shadowRoot?.querySelector(
      '#fgpu-resource',
    ) as TextField;
    this.concurrency_limit = this.shadowRoot?.querySelector(
      '#concurrency-limit',
    ) as TextField;
    this.idle_timeout = this.shadowRoot?.querySelector(
      '#idle-timeout',
    ) as TextField;
    this.container_per_session_limit = this.shadowRoot?.querySelector(
      '#container-per-session-limit',
    ) as TextField;
    this.vfolder_max_limit = this.shadowRoot?.querySelector(
      '#vfolder-count-limit',
    ) as TextField;
    if (this.enableSessionLifetime) {
      this.session_lifetime = this.shadowRoot?.querySelector(
        '#session-lifetime',
      ) as TextField;
    }
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
      <link rel="stylesheet" href="resources/custom.css">
      <lablup-activity-panel noheader narrow autowidth>
        <div slot="message">
          <h3 class="tab horizontal wrap layout">
           <mwc-tab-bar class="main-bar">
            <mwc-tab title="user-lists" label="${_t('credential.Users')}"
                @click="${(e) => this._showTab(e.target)}"></mwc-tab>
            <mwc-tab title="credential-lists" label="${_t(
              'credential.Credentials',
            )}"
                @click="${(e) => this._showTab(e.target)}"></mwc-tab>
            <mwc-tab title="resource-policy-lists" label="${_t(
              'credential.ResourcePolicies',
            )}"
                @click="${(e) => this._showTab(e.target)}"></mwc-tab>
           </mwc-tab-bar>
            ${
              this.isAdmin
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
                            class="horizontal layout start center"
                            @click="${this._openExportToCsvDialog}"
                          >
                            <mwc-icon
                              style="color:var(--general-color-text-secondary);padding-right:10px;"
                            >
                              get_app
                            </mwc-icon>
                            ${_t('credential.exportCSV')}
                          </a>
                        </mwc-list-item>
                      </mwc-menu>
                    </div>
                  `
                : html``
            }
          </h3>
          <div id="user-lists" class="admin item tab-content card">
            <h4 class="horizontal flex center center-justified layout">
              <mwc-tab-bar class="sub-bar">
                <mwc-tab title="active-user-list" label="${_t(
                  'credential.Active',
                )}"
                    @click="${(e) => this._showList(e.target)}"></mwc-tab>
                <mwc-tab title="inactive-user-list" label="${_t(
                  'credential.Inactive',
                )}"
                    @click="${(e) => this._showList(e.target)}"></mwc-tab>
              </mwc-tab-bar>
              <span class="flex"></span>
              <mwc-button raised id="add-user" icon="add" label="${_t(
                'credential.CreateUser',
              )}"
                  @click="${this._launchUserAddDialog}"></mwc-button>
            </h4>
            <div>
              <backend-ai-user-list class="list-content" id="active-user-list" condition="active" ?active="${
                this._activeTab === 'user-lists'
              }"></backend-ai-user-list>
              <backend-ai-user-list class="list-content" id="inactive-user-list" style="display:none;" ?active="${
                this._activeTab === 'user-lists'
              }"></backend-ai-user-list>
            </div>
          </div>
          <div id="credential-lists" class="item tab-content card" style="display:none;">
            <h4 class="horizontal flex center center-justified layout">
              <mwc-tab-bar class="sub-bar">
                <mwc-tab title="active-credential-list" label="${_t(
                  'credential.Active',
                )}"
                    @click="${(e) => this._showList(e.target)}"></mwc-tab>
                <mwc-tab title="inactive-credential-list" label="${_t(
                  'credential.Inactive',
                )}"
                    @click="${(e) => this._showList(e.target)}"></mwc-tab>
              </mwc-tab-bar>
              <div class="flex"></div>
              <mwc-button raised id="add-keypair" icon="add" label="${_t(
                'credential.AddCredential',
              )}"
                  @click="${this._launchKeyPairDialog}"></mwc-button>
            </h4>
            <backend-ai-credential-list class="list-content" id="active-credential-list" condition="active" ?active="${
              this._activeTab === 'credential-lists'
            }"></backend-ai-credential-list>
            <backend-ai-credential-list class="list-content" style="display:none;" id="inactive-credential-list" condition="inactive" ?active="${
              this._activeTab === 'credential-lists'
            }"></backend-ai-credential-list>
          </div>
          <div id="resource-policy-lists" class="admin item tab-content card" style="display:none;">
            <h4 class="horizontal flex center center-justified layout">
              <span>${_t('credential.PolicyGroup')}</span>
              <span class="flex"></span>
              <mwc-button raised id="add-policy" icon="add" label="${_t(
                'credential.CreatePolicy',
              )}"
                          ?disabled="${!this.isSuperAdmin}"
                          @click="${
                            this._launchResourcePolicyDialog
                          }"></mwc-button>
            </h4>
            <div>
              <backend-ai-resource-policy-list id="resource-policy-list" ?active="${
                this._activeTab === 'resource-policy-lists'
              }"></backend-ai-resource-policy-list>
            </div>
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
                autoValidate></mwc-textfield>

            <mwc-select id="resource-policy" label="${_t(
              'credential.ResourcePolicy',
            )}" style="width:100%;margin:10px 0;">
              ${this.resource_policy_names.map(
                (item) => html`
                  <mwc-list-item value="${item}">${item}</mwc-list-item>
                `,
              )}
            </mwc-select>
            <mwc-select id="rate-limit" label="${_t(
              'credential.RateLimitFor15min',
            )}" style="width:100%;margin:10px 0;">
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
          <mwc-button raised id="create-keypair-button" icon="add" label="${_t(
            'general.Add',
          )}" fullwidth
          @click="${this._addKeyPair}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="new-policy-dialog" fixed backdrop blockscrolling narrowLayout>
        <span slot="title">${_t('credential.CreateResourcePolicy')}</span>
        <div slot="content">
          <mwc-textfield id="id_new_policy_name" label="${_t(
            'resourcePolicy.PolicyName',
          )}"
                         validationMessage="${_t(
                           'data.explorer.ValueRequired',
                         )}"
                         maxLength="64"
                         placeholder="${_t('maxLength.64chars')}"
                         required></mwc-textfield>
          <h4>${_t('resourcePolicy.ResourcePolicy')}</h4>
          <div class="horizontal center layout distancing">
            <div class="vertical layout popup-right-margin">
              <mwc-textfield label="CPU" class="discrete resource-input" id="cpu-resource" type="number" min="0" max="512"
                            @change="${(e) =>
                              this._validateResourceInput(e)}"></mwc-textfield>
              <mwc-formfield label="${_t(
                'resourcePolicy.Unlimited',
              )}" class="unlimited">
                  <mwc-checkbox @change="${(e) =>
                    this._toggleCheckbox(e)}"></mwc-checkbox>
              </mwc-formfield>
            </div>
            <div class="vertical layout popup-both-margin">
              <mwc-textfield label="RAM(GB)" class="resource-input" id="ram-resource" type="number" min="0" max="100000" step="0.01"
                            @change="${(e) =>
                              this._validateResourceInput(e)}"></mwc-textfield>
              <mwc-formfield label="${_t(
                'resourcePolicy.Unlimited',
              )}" class="unlimited">
                <mwc-checkbox @change="${(e) =>
                  this._toggleCheckbox(e)}"></mwc-checkbox>
              </mwc-formfield>
            </div>
            <div class="vertical layout popup-both-margin">
              <mwc-textfield label="GPU" class="resource-input" id="gpu-resource" type="number" min="0" max="64"
                            @change="${(e) =>
                              this._validateResourceInput(e)}"></mwc-textfield>
              <mwc-formfield label="${_t(
                'resourcePolicy.Unlimited',
              )}" class="unlimited">
                  <mwc-checkbox @change="${(e) =>
                    this._toggleCheckbox(e)}"></mwc-checkbox>
              </mwc-formfield>
            </div>
            <div class="vertical layout popup-left-margin">
              <mwc-textfield label="fGPU" class="resource-input" id="fgpu-resource" type="number" min="0" max="256" step="0.1"
                            @change="${(e) =>
                              this._validateResourceInput(e)}"></mwc-textfield>
              <mwc-formfield label="${_t(
                'resourcePolicy.Unlimited',
              )}" class="unlimited">
                  <mwc-checkbox @change="${(e) =>
                    this._toggleCheckbox(e)}"></mwc-checkbox>
              </mwc-formfield>
            </div>
          </div>
          <h4>${_t('resourcePolicy.Sessions')}</h4>
          <div class="horizontal justified layout distancing wrap">
            <div class="vertical left layout ${
              this.enableSessionLifetime ? 'sessions-section' : ''
            }">
                <mwc-textfield label="${_t(
                  'resourcePolicy.ContainerPerSession',
                )}" class="discrete" id="container-per-session-limit" type="number" min="0" max="100"
                    @change="${(e) =>
                      this._validateResourceInput(e)}"></mwc-textfield>
                <mwc-formfield label="${_t(
                  'resourcePolicy.Unlimited',
                )}" class="unlimited">
                    <mwc-checkbox @change="${(e) =>
                      this._toggleCheckbox(e)}"></mwc-checkbox>
                </mwc-formfield>
              </div>
              <div class="vertical left layout ${
                this.enableSessionLifetime ? 'sessions-section' : ''
              }">
                <mwc-textfield label="${_t(
                  'resourcePolicy.IdleTimeoutSec',
                )}" class="discrete" id="idle-timeout" type="number" min="0" max="1552000"
                  @change="${(e) =>
                    this._validateResourceInput(e)}"></mwc-textfield>
                <mwc-formfield label="${_t(
                  'resourcePolicy.Unlimited',
                )}" class="unlimited">
                    <mwc-checkbox @change="${(e) =>
                      this._toggleCheckbox(e)}"></mwc-checkbox>
                </mwc-formfield>
              </div>
              <div class="vertical left layout ${
                this.enableSessionLifetime ? 'sessions-section' : ''
              }">
                  <mwc-textfield label="${_t(
                    'resourcePolicy.ConcurrentJobs',
                  )}" class="discrete" id="concurrency-limit" type="number" min="0" max="100"
                      @change="${(e) =>
                        this._validateResourceInput(e)}"></mwc-textfield>
                <mwc-formfield label="${_t(
                  'resourcePolicy.Unlimited',
                )}" class="unlimited">
                    <mwc-checkbox @change="${(e) =>
                      this._toggleCheckbox(e)}"></mwc-checkbox>
                </mwc-formfield>
              </div>
              <div class="vertical left layout ${
                this.enableSessionLifetime ? 'sessions-section' : ''
              }"
                style="${this.enableSessionLifetime ? '' : 'display:none;'}">
                <mwc-textfield label="${_t(
                  'resourcePolicy.MaxSessionLifeTime',
                )}" class="discrete" id="session-lifetime" type="number" min="0" max="100"
                    @change="${(e) =>
                      this._validateResourceInput(e)}"></mwc-textfield>
                <mwc-formfield label="${_t(
                  'resourcePolicy.Unlimited',
                )}" class="unlimited">
                    <mwc-checkbox @change="${(e) =>
                      this._toggleCheckbox(e)}"></mwc-checkbox>
                </mwc-formfield>
              </div>
          </div>
          <h4 style="margin-bottom:0px;">${_t('resourcePolicy.Folders')}</h4>
          <div class="vertical center layout distancing" id="dropdown-area">
            <backend-ai-multi-select open-up id="allowed-vfolder-hosts" label="${_t(
              'resourcePolicy.AllowedHosts',
            )}" style="width:100%;"></backend-ai-multi-select>
            <div
              class="horizontal layout justified"
              style=${
                this.isSupportMaxVfolderCountInUserResourcePolicy
                  ? 'display:none;'
                  : 'width:100%;'
              }
            >
              <mwc-textfield
                label="${_t('credential.Max#')}"
                class="discrete"
                id="vfolder-count-limit"
                type="number"
                min="0"
                max="50"
                @change="${(e) => this._validateResourceInput(e)}"
              ></mwc-textfield>
            </div>
          </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout distancing">
          <mwc-button
              unelevated
              fullwidth
              id="create-policy-button"
              icon="check"
              label="${_t('credential.Create')}"
              @click="${() => this._addResourcePolicy()}"></mwc-button>
        </div>
      </backend-ai-dialog>
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
              )}">
          </mwc-textfield>
          <mwc-textfield
              type="text"
              name="user_name"
              id="id_user_name"
              label="${_t('general.Username')}"
              placeholder="${_text('maxLength.64chars')}"
              maxLength="64">
          </mwc-textfield>
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
                maxLength="64">
            </mwc-textfield>
            <mwc-icon-button-toggle off onIcon="visibility" offIcon="visibility_off"
                @click="${(e) => this._togglePasswordVisibility(e.target)}">
            </mwc-icon-button-toggle>
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
                maxLength="64">
            </mwc-textfield>
            <mwc-icon-button-toggle off onIcon="visibility" offIcon="visibility_off"
                @click="${(e) => this._togglePasswordVisibility(e.target)}">
            </mwc-icon-button-toggle>
          </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button raised id="create-user-button" icon="add" label="${_t(
            'credential.CreateUser',
          )}" fullwidth
          @click="${this._addUser}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="export-to-csv" fixed backdrop blockscrolling>
        <span slot="title">${_t('credential.ExportCSVFile')} (${
          this._activeTab
        })</span>

        <div slot="content" class="intro centered login-panel">
          <mwc-textfield id="export-file-name" label="${_text(
            'credential.FileName',
          )}"
                          validationMessage="${_text(
                            'credential.validation.LetterNumber-_dot',
                          )}"
                          value="${
                            this._activeTab + '_' + this._defaultFileName
                          }" required
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
              @click="${this._exportToCSV}"></mwc-button>
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
