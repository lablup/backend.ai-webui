/**
 * Backend.AI-credential-view
 */

import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import '@material/mwc-textfield/mwc-textfield';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-icon-button/mwc-icon-button';
import '@material/mwc-menu/mwc-menu';
import '@material/mwc-tab-bar/mwc-tab-bar';
import '@material/mwc-tab/mwc-tab';
import '@material/mwc-button/mwc-button';
import '@material/mwc-select/mwc-select';

import 'weightless/tab';
import 'weightless/tab-group';
import 'weightless/expansion';
import 'weightless/checkbox';
import 'weightless/label';

import './lablup-activity-panel';
import './backend-ai-credential-list';
import './backend-ai-dialog';
import './backend-ai-resource-policy-list';
import './backend-ai-user-list';
import {default as PainKiller} from './backend-ai-painkiller';

import JsonToCsv from '../lib/json_to_csv';
import {BackendAIPage} from './backend-ai-page';
import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

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
  @property({type: Object}) cpu_resource = {};
  @property({type: Object}) ram_resource = {};
  @property({type: Object}) gpu_resource = {};
  @property({type: Object}) fgpu_resource = {};
  @property({type: Object}) concurrency_limit = {};
  @property({type: Object}) idle_timeout = {};
  @property({type: Object}) session_lifetime = {};
  @property({type: Object}) vfolder_capacity = {};
  @property({type: Object}) vfolder_max_limit= {};
  @property({type: Object}) container_per_session_limit = {};
  @property({type: Array}) rate_metric = [1000, 2000, 3000, 4000, 5000, 10000, 50000];
  @property({type: Object}) resource_policies = Object();
  @property({type: Array}) resource_policy_names;
  @property({type: Boolean}) isAdmin = false;
  @property({type: Boolean}) isSuperAdmin = false;
  @property({type: String}) _status = 'inactive';
  @property({type: Array}) allowed_vfolder_hosts = [];
  @property({type: String}) default_vfolder_host = '';
  @property({type: String}) new_access_key = '';
  @property({type: String}) new_secret_key = '';
  @property({type: String}) _activeTab = 'users';
  @property({type: Object}) notification = Object();
  @property({type: Object}) exportToCsvDialog = Object();
  @property({type: String}) _defaultFileName = '';
  @property({type: Number}) selectAreaHeight;
  @property({type: Boolean}) enableSessionLifetime = false;

  constructor() {
    super();
    this.resource_policy_names = [];
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
        #new-keypair-dialog {
          min-width: 350px;
          height: 100%;
        }

        div.card > h4 {
          margin-bottom: 0px;
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

        wl-tab-group {
          border-radius: 5px 5px 0 0;
          --tab-group-indicator-bg: var(--general-tabbar-button-color);
        }

        wl-tab {
          border-radius: 5px 5px 0 0;
          --tab-color: var(--general-sidepanel-color);
          --tab-color-hover: #26272a;
          --tab-color-hover-filled: var(--general-tabbar-button-color);
          --tab-color-active:var(--general-tabbar-button-color);
          --tab-color-active-hover: var(--general-tabbar-button-color);
          --tab-color-active-filled: var(--general-tabbar-button-color);
          --tab-bg-active: #535457;
          --tab-bg-filled: #26272a;
          --tab-bg-active-hover: #535457;
        }

        h3.tab {
          background-color: var(--general-tabbar-background-color);
          border-radius: 5px 5px 0 0;
          margin: 0 auto;
        }

        mwc-tab-bar {
          --mdc-theme-primary: var(--general-sidebar-selected-color);
          --mdc-text-transform: none;
          --mdc-tab-color-default: var(--general-tabbar-background-color);
          --mdc-tab-text-label-color-default: var(--general-tabbar-tab-disabled-color);
        }


        mwc-list-item {
          height: auto;
          font-size: 12px;
          --mdc-theme-primary: var(--general-sidebar-color);
        }

        wl-expansion {
          --expansion-elevation: 0;
          --expansion-elevation-open: 0;
          --expansion-elevation-hover: 0;
          --expansion-margin-open: 0;
          --expansion-content-padding: 0;
        }

        wl-expansion {
          font-weight: 200;
        }

        wl-label {
          width: 100%;
          min-width: 60px;
          font-size: 10px; // 11px;
          --label-font-family: 'Ubuntu', Roboto;
        }

        wl-label.folders {
          margin: 3px 0px 7px 0px;
        }

        wl-label.unlimited {
          margin: 4px 0px 0px 0px;
        }

        wl-label.unlimited > wl-checkbox {
          border-width: 1px;
        }

        wl-list-item {
          width: 100%;
        }

        wl-checkbox {
          --checkbox-size: 10px;
          --checkbox-border-radius: 2px;
          --checkbox-bg-checked: var(--general-checkbox-color);
          --checkbox-checkmark-stroke-color: white;
          --checkbox-color-checked: white;
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
          --mdc-theme-surface: #f1f1f1;
          --mdc-menu-item-height : auto;
        }

        mwc-menu#dropdown-menu {
          position: relative;
          left: -10px;
          top: 50px;
        }

        mwc-list-item {
          font-size : 14px;
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
          border-bottom: 1px solid #DDD;
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
          mwc-tab, mwc-button {
            --mdc-typography-button-font-size: 10px;
          }

          wl-tab {
            width: 5px;
          }
        }
      `];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    document.addEventListener('backend-ai-credential-refresh', () => {
      this.shadowRoot.querySelector('#active-credential-list').refresh();
      this.shadowRoot.querySelector('#inactive-credential-list').refresh();
    }, true);

    this.shadowRoot.querySelectorAll('wl-expansion').forEach((element) => {
      element.addEventListener('keydown', (event) => {
        event.stopPropagation();
      }, true);
    });
    const userIdInput = this.shadowRoot.querySelector('#id_new_user_id');
    this._addInputValidator(userIdInput);
    // monkeypatch for height calculation.
    this.selectAreaHeight = this.shadowRoot.querySelector('#dropdown-area').offsetHeight ? this.shadowRoot.querySelector('#dropdown-area').offsetHeight : '123px';
  }

  /**
   * If admin comes, prepare the user list page.
   */
  _preparePage() {
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
    this._updateInputStatus(this.vfolder_capacity);
    if (this.enableSessionLifetime) {
      this._updateInputStatus(this.session_lifetime);
    }
    this.vfolder_max_limit['value'] = 10;
    this.exportToCsvDialog = this.shadowRoot.querySelector('#export-to-csv');
    this._defaultFileName = this._getDefaultCSVFileName();
  }

  /**
   * Change resource policy list's active state and user list's active state.
   *
   * @param {Boolean} active
   */
  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      this.shadowRoot.querySelector('#resource-policy-list').active = false;
      this.shadowRoot.querySelector('#active-user-list').active = false;
      this._status = 'inactive';
      return;
    }
    this.shadowRoot.querySelector('#resource-policy-list').active = true;
    this.shadowRoot.querySelector('#active-user-list').active = true;
    this._status = 'active';
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.enableSessionLifetime = globalThis.backendaiclient.supports('session-lifetime');
        this._preparePage();
      });
    } else { // already connected
      this.enableSessionLifetime = globalThis.backendaiclient.supports('session-lifetime');
      this._preparePage();
    }
  }

  /**
   * Launch a keypair dialog.
   */
  async _launchKeyPairDialog() {
    await this._getResourcePolicies();
    this.shadowRoot.querySelector('#new-keypair-dialog').show();

    // initialize user_id
    this.shadowRoot.querySelector('#id_new_user_id').value = '';
  }

  /**
   * Read the vfolder host information.
   */
  _readVFolderHostInfo() {
    globalThis.backendaiclient.vfolder.list_hosts().then((response) => {
      this.allowed_vfolder_hosts = response.allowed;
      this.default_vfolder_host = response.default;
      this.shadowRoot.querySelector('#allowed_vfolder-hosts').layout(true).then(()=>{
        this.shadowRoot.querySelector('#allowed_vfolder-hosts').select(0);
      });
    }).catch((err) => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  /**
   * Launch a resouce policy dialog.
   */
  async _launchResourcePolicyDialog() {
    await this._getResourcePolicies();
    this._readVFolderHostInfo();
    this.shadowRoot.querySelector('#id_new_policy_name').mdcFoundation.setValid(true);
    this.shadowRoot.querySelector('#id_new_policy_name').isUiValid = true;
    this.shadowRoot.querySelector('#id_new_policy_name').value = '';
    this.shadowRoot.querySelector('#new-policy-dialog').show();
  }

  /**
   * Launch a modify resource policy dialog.
   */
  _launchModifyResourcePolicyDialog() {
    this._readVFolderHostInfo();
    this.shadowRoot.querySelector('#new-policy-dialog').show();
  }

  /**
   * Launch an user add dialog.
   */
  _launchUserAddDialog() {
    this.shadowRoot.querySelector('#new-user-dialog').show();
  }

  /**
   * Get resource policies from backend client.
   */
  async _getResourcePolicies() {
    const fields = ['name', 'default_for_unspecified',
      'total_resource_slots',
      'max_concurrent_sessions',
      'max_containers_per_session',
    ];
    if (this.enableSessionLifetime) {
      fields.push('max_session_lifetime');
    }
    return globalThis.backendaiclient.resourcePolicy.get(null, fields).then((response) => {
      const policies = globalThis.backendaiclient.utils.gqlToObject(response.keypair_resource_policies, 'name');
      const policyNames = globalThis.backendaiclient.utils.gqlToList(response.keypair_resource_policies, 'name');
      this.resource_policies = policies;
      this.resource_policy_names = policyNames;
      this.shadowRoot.querySelector('#resource-policy').layout(true).then(()=>{
        this.shadowRoot.querySelector('#resource-policy').select(0);
      });
      this.shadowRoot.querySelector('#rate-limit').layout(true).then(()=>{
        this.shadowRoot.querySelector('#rate-limit').select(0);
      });
    });
  }

  /**
   * Create a keypair to the user.
   */
  _addKeyPair() {
    const is_active = true;
    const is_admin = false;
    const user_idEl = this.shadowRoot.querySelector('#id_new_user_id');
    let user_id = '';

    if (!user_idEl.checkValidity()) {
      return;
    } else {
      user_id = user_idEl.value;
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

    const resource_policy = this.shadowRoot.querySelector('#resource-policy').value;
    const rate_limit = this.shadowRoot.querySelector('#rate-limit').value;
    // Read resources
    globalThis.backendaiclient.keypair.add(user_id, is_active, is_admin,
      resource_policy, rate_limit).then((response) => {
      if (response.create_keypair.ok) {
        this.shadowRoot.querySelector('#new-keypair-dialog').hide();
        this.notification.text = _text('credential.KeypairCreated');
        this.notification.show();
        this.shadowRoot.querySelector('#active-credential-list').refresh();
      } else if (response.create_keypair.msg) {
        const id_requested = response.create_keypair.msg.split(':')[1];
        this.notification.text = _text('credential.UserNotFound') + id_requested;
        this.notification.show();
      } else {
        this.notification.text = _text('dialog.ErrorOccurred');
        this.notification.show();
      }
    }).catch((err) => {
      console.log(err);
      if (err && err.message) {
        this.shadowRoot.querySelector('#new-keypair-dialog').hide();
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
    const vfolder_hosts: Array<string|null> = [];
    vfolder_hosts.push(this.shadowRoot.querySelector('#allowed_vfolder-hosts').value);
    this._validateUserInput(this.cpu_resource);
    this._validateUserInput(this.ram_resource);
    this._validateUserInput(this.gpu_resource);
    this._validateUserInput(this.fgpu_resource);
    this._validateUserInput(this.concurrency_limit);
    this._validateUserInput(this.idle_timeout);
    this._validateUserInput(this.container_per_session_limit);
    this._validateUserInput(this.vfolder_capacity);
    this._validateUserInput(this.vfolder_max_limit);

    total_resource_slots['cpu'] = this.cpu_resource['value'];
    total_resource_slots['mem'] = this.ram_resource['value'] + 'g';
    total_resource_slots['cuda.device'] = parseInt(this.gpu_resource['value']);
    total_resource_slots['cuda.shares'] = parseFloat(this.fgpu_resource['value']);

    this.concurrency_limit['value'] = this.concurrency_limit['value'] === '' ? 0 : parseInt(this.concurrency_limit['value']);
    this.idle_timeout['value'] = this.idle_timeout['value'] === '' ? 0 : parseInt(this.idle_timeout['value']);
    this.container_per_session_limit['value'] = this.container_per_session_limit['value'] === '' ? 0 : parseInt(this.container_per_session_limit['value']);
    this.vfolder_capacity['value'] = this.vfolder_capacity['value'] === '' ? 0 : parseFloat(this.vfolder_capacity['value']);
    this.vfolder_max_limit['value'] = this.vfolder_max_limit['value'] === '' ? 0 : parseInt(this.vfolder_max_limit['value']);

    Object.keys(total_resource_slots).map((resource) => {
      if (isNaN(parseFloat(total_resource_slots[resource]))) {
        delete total_resource_slots[resource];
      }
    });

    const input = {
      'default_for_unspecified': 'UNLIMITED',
      'total_resource_slots': JSON.stringify(total_resource_slots),
      'max_concurrent_sessions': this.concurrency_limit['value'],
      'max_containers_per_session': this.container_per_session_limit['value'],
      'idle_timeout': this.idle_timeout['value'],
      'max_vfolder_count': this.vfolder_max_limit['value'],
      'max_vfolder_size': this._gBToByte(this.vfolder_capacity['value']),
      'allowed_vfolder_hosts': vfolder_hosts
    };

    if (this.enableSessionLifetime) {
      this._validateUserInput(this.session_lifetime);
      this.session_lifetime['value'] = this.session_lifetime['value'] === '' ? 0 : parseInt(this.session_lifetime['value']);
      input['max_session_lifetime'] = this.session_lifetime['value'];
    }

    return input;
  }

  _checkResourcePolicyInputValidity() {
    let isValid = true;
    const resourceIds = ['cpu-resource', 'ram-resource', 'gpu-resource', 'fgpu-resource', 'container-per-session-limit',
      'idle-timeout', 'concurrency-limit', 'session-lifetime', 'vfolder-capacity-limit', 'vfolder-count-limit'];
    for (let i = 0; i < resourceIds.length; i++) {
      const textfield = this.shadowRoot.querySelector('#' + resourceIds[i]);
      const checkboxEl = textfield.closest('div').querySelector('wl-label.unlimited');
      const checkbox = checkboxEl ? checkboxEl.querySelector('wl-checkbox') : null;
      if (!textfield.checkValidity()) {
        if (checkbox && checkbox.checked) {
          continue;
        }
        isValid = false;
        break;
      }
    }
    return isValid;
  }

  /**
   * Add a new resource policy.
   */
  _addResourcePolicy() {
    const policy_info = this.shadowRoot.querySelector('#id_new_policy_name');
    if (!policy_info.checkValidity()) {
      policy_info.reportValidity();
      return;
    }
    try {
      const name_field = this.shadowRoot.querySelector('#id_new_policy_name');
      name_field.checkValidity();
      const name = name_field.value;
      if (name === '') {
        throw new Error(_text('resourcePolicy.PolicyNameEmpty'));
      }
      const input = this._readResourcePolicyInput();
      if (!this._checkResourcePolicyInputValidity()) {
        return;
      }
      globalThis.backendaiclient.resourcePolicy.add(name, input).then((response) => {
        this.shadowRoot.querySelector('#new-policy-dialog').hide();
        this.notification.text = _text('resourcePolicy.SuccessfullyCreated');
        this.notification.show();
        this.shadowRoot.querySelector('#resource-policy-list').refresh();
      }).catch((err) => {
        console.log(err);
        if (err && err.message) {
          this.shadowRoot.querySelector('#new-policy-dialog').hide();
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
    const emailEl = this.shadowRoot.querySelector('#id_user_email');
    const nameEl = this.shadowRoot.querySelector('#id_user_name');
    const passwordEl = this.shadowRoot.querySelector('#id_user_password');
    const confirmEl = this.shadowRoot.querySelector('#id_user_confirm');

    const email = emailEl.value;
    // if name value is empty, it will be covered by the username of email address.
    const name = nameEl.value !== '' ? nameEl.value : email.split('@')[0];
    const password = passwordEl.value;

    // if any input value is invalid, it returns.
    if (!emailEl.checkValidity() || !passwordEl.checkValidity() || !confirmEl.checkValidity()) {
      return;
    }

    // all values except 'username', and 'password' are arbitrarily designated default values
    const input = {
      'username': name,
      'password': password,
      'need_password_change': false,
      'full_name': name,
      'description': `${name}'s Account`,
      'is_active': true,
      'domain_name': 'default',
      'role': 'user'
    };

    globalThis.backendaiclient.group.list()
      .then((res) => {
        const default_id = res.groups.find((x) => x.name === 'default').id;
        return Promise.resolve(globalThis.backendaiclient.user.create(email, {...input, 'group_ids': [default_id]}));
      })
      .then((res) => {
        this.shadowRoot.querySelector('#new-user-dialog').hide();
        if (res['create_user'].ok) {
          this.notification.text = _text('credential.UserAccountCreated');

          this.shadowRoot.querySelector('#active-user-list').refresh();
        } else {
          // console.error(res['create_user'].msg);
          this.notification.text = _text('credential.UserAccountCreatedError');
        }
        this.notification.show();

        this.shadowRoot.querySelector('#id_user_email').value = '';
        this.shadowRoot.querySelector('#id_user_name').value = '';
        this.shadowRoot.querySelector('#id_user_password').value = '';
        this.shadowRoot.querySelector('#id_user_confirm').value = '';
      });
  }

  /**
   * Modify a resouce policy.
   */
  _modifyResourcePolicy() {
    const name = this.shadowRoot.querySelector('#id_new_policy_name').value;
    try {
      const input = this._readResourcePolicyInput();

      globalThis.backendaiclient.resourcePolicy.mutate(name, input).then((response) => {
        this.shadowRoot.querySelector('#new-policy-dialog').close();
        this.notification.text = _text('resourcePolicy.SuccessfullyUpdated');
        this.notification.show();
        this.shadowRoot.querySelector('#resource-policy-list').refresh();
      }).catch((err) => {
        console.log(err);
        if (err && err.message) {
          this.shadowRoot.querySelector('#new-policy-dialog').close();
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
   * Disable the page.
   */
  disablePage() {
    const els = this.shadowRoot.querySelectorAll('.admin');
    for (let x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
  }

  /**
   * Display the tab.
   *
   * @param {any} tab - Tab webcomponent
   */
  _showTab(tab) {
    const els = this.shadowRoot.querySelectorAll('.tab-content');
    for (let x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    this._activeTab = tab.title;
    this.shadowRoot.querySelector('#' + tab.title).style.display = 'block';
    let tabKeyword;
    let innerTab;
    // show inner tab(active) after selecting outer tab
    switch (this._activeTab) {
    case 'user-lists':
    case 'credential-lists':
      tabKeyword = this._activeTab.substring(0, this._activeTab.length - 1); // to remove '-s'.
      innerTab = this.shadowRoot.querySelector('wl-tab[value=active-' + tabKeyword + ']');
      innerTab.checked = true;
      this._showList(innerTab);
      break;
    default:
      break;
    }
  }

  /**
   * Display the list.
   *
   * @param {any} list - List webcomponent
   */
  _showList(list) {
    const els = this.shadowRoot.querySelectorAll('.list-content');
    for (let x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    this.shadowRoot.querySelector('#' + list.value).style.display = 'block';
    const event = new CustomEvent('user-list-updated', {});
    this.shadowRoot.querySelector('#' + list.value).dispatchEvent(event);
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
    const checkbox_el = textfield.closest('div').querySelector('wl-label.unlimited');
    const checkbox = checkbox_el ? checkbox_el.querySelector('wl-checkbox') : null;
    const countDecimals = (value: number) => {
      return value % 1 ? value.toString().split('.')[1].length : 0;
    };

    if (textfield.classList.contains('discrete')) {
      textfield.value = Math.round(textfield.value);
    }

    if (textfield.value <= 0) {
      // concurrency job and container-per-session limit must be upper than 0.
      textfield.value = ((textfield.id === 'concurrency-limit') || (textfield.id === 'container-per-session-limit')) ? 1 : 0;
    }

    if (!textfield.valid) {
      const decimal_point: number = (textfield.step) ? countDecimals(textfield.step) : 0;
      textfield.value = (decimal_point > 0) ? parseFloat(textfield.value).toFixed(decimal_point) : Math.min(Math.round(textfield.value), (textfield.value < 0) ? textfield.min : textfield.max);
    }
    // automatically check when textfield is min
    if (checkbox) {
      textfield.disabled = checkbox.checked = (textfield.value == parseFloat(textfield.min));
    }
  }

  _updateUnlimitedValue(value) {
    return ['-', 0, '0', 'Unlimited', Infinity, 'Infinity'].includes(value) ? '' : value;
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
    const policy_info = this.shadowRoot.querySelector('#id_new_policy_name');
    policy_info.validityTransform = (value, nativeValidity) => {
      if (!nativeValidity) {
        policy_info.validationMessage = _text('credential.validation.PolicyName');
        return {
          valid: false,
          valueMissing: true
        };
      }
      if (!nativeValidity.valid) {
        if (nativeValidity.patternMismatch) {
          policy_info.validationMessage = _text('credential.validation.LetterNumber-_dot');
          return {
            valid: nativeValidity.valid,
            patternMismatch: !nativeValidity.valid
          };
        } else if (nativeValidity.valueMissing) {
          policy_info.validationMessage = _text('credential.validation.PolicyName');
          return {
            valid: nativeValidity.valid,
            valueMissing: !nativeValidity.valid
          };
        } else {
          policy_info.validationMessage = _text('credential.validation.LetterNumber-_dot');
          return {
            valid: nativeValidity.valid,
            patternMismatch: !nativeValidity.valid,
          };
        }
      } else {
        const isValid = !this.resource_policy_names.includes(value);
        if (!isValid) {
          policy_info.validationMessage = _text('credential.validation.NameAlreadyExists');
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
    const checkbox = textfield.closest('div').querySelector('wl-checkbox');
    if (textfield.value === '' || textfield.value === '0' ) {
      textfield.disabled = true;
      checkbox.checked = true;
    } else {
      textfield.disabled = false;
      checkbox.checked = false;
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
    const fileNameEl = this.shadowRoot.querySelector('#export-file-name');
    if (!fileNameEl.validity.valid) {
      return;
    }
    let users; let credential_active; let credential_inactive; let credential; let resource_policy;
    switch (this._activeTab) {
    case 'user-lists':
      users = this.shadowRoot.querySelector('#active-user-list')['users'];
      users.map((obj) => { // filtering unnecessary key
        ['password', 'need_password_change'].forEach((key) => delete obj[key]);
      });
      JsonToCsv.exportToCsv(fileNameEl.value, users);
      break;
    case 'credential-lists':
      credential_active = this.shadowRoot.querySelector('#active-credential-list')['keypairs'];
      credential_inactive = this.shadowRoot.querySelector('#inactive-credential-list')['keypairs'];
      credential = credential_active.concat(credential_inactive);
      credential.map((obj)=> { // filtering unnecessary key
        ['is_admin'].forEach((key) => delete obj[key]);
      });
      JsonToCsv.exportToCsv(fileNameEl.value, credential);
      break;
    case 'resource-policy-lists':
      resource_policy = this.shadowRoot.querySelector('#resource-policy-list')['resourcePolicy'];
      JsonToCsv.exportToCsv(fileNameEl.value, resource_policy);
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
    this.cpu_resource = this.shadowRoot.querySelector('#cpu-resource');
    this.ram_resource = this.shadowRoot.querySelector('#ram-resource');
    this.gpu_resource = this.shadowRoot.querySelector('#gpu-resource');
    this.fgpu_resource = this.shadowRoot.querySelector('#fgpu-resource');
    this.concurrency_limit = this.shadowRoot.querySelector('#concurrency-limit');
    this.idle_timeout = this.shadowRoot.querySelector('#idle-timeout');
    this.container_per_session_limit = this.shadowRoot.querySelector('#container-per-session-limit');
    this.vfolder_capacity = this.shadowRoot.querySelector('#vfolder-capacity-limit');
    this.vfolder_max_limit = this.shadowRoot.querySelector('#vfolder-count-limit');
    if (this.enableSessionLifetime) {
      this.session_lifetime = this.shadowRoot.querySelector('#session-lifetime');
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
    return date+'_'+time;
  }

  /**
   * Control a dropdown menu's open state.
   *
   * @param {Event} e - event from dropdown component.
   */
  _toggleDropdown(e) {
    const menu = this.shadowRoot.querySelector('#dropdown-menu');
    const button = e.target;
    menu.anchor = button;
    if (!menu.open) {
      menu.show();
    }
  }

  _validatePassword1() {
    const passwordInput = this.shadowRoot.querySelector('#id_user_password');
    const password2Input = this.shadowRoot.querySelector('#id_user_confirm');
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
    const password2Input = this.shadowRoot.querySelector('#id_user_confirm');
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
        const passwordInput = this.shadowRoot.querySelector('#id_user_password');
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

  _validatePassword() {
    this._validatePassword1();
    this._validatePassword2();
  }

  _togglePasswordVisibility(element) {
    const isVisible = element.__on;
    const password = element.closest('div').querySelector('mwc-textfield');
    isVisible ? password.setAttribute('type', 'text') : password.setAttribute('type', 'password');
  }

  /**
   *
   * Expand or Shrink the dialog height by the number of items in the dropdown.
   *
   * @param {boolean} isOpened - notify whether the dialog is opened or not.
   */
  _controlHeightByVfolderHostCount(isOpened = false) {
    if (!isOpened) {
      this.shadowRoot.querySelector('#dropdown-area').style.height = this.selectAreaHeight;
      return;
    }
    const itemCount = this.shadowRoot.querySelector('#allowed_vfolder-hosts').items.length;
    const actualHeight = this.shadowRoot.querySelector('#dropdown-area').offsetHeight;
    if (itemCount > 0) {
      this.shadowRoot.querySelector('#dropdown-area').style.height = (actualHeight + itemCount * 14) +'px';
    }
  }

  _gBToByte(value = 0) {
    const gigabyte = Math.pow(2, 30);
    return Math.round(gigabyte * value);
  }

  render() {
    // language=HTML
    return html`
      <lablup-activity-panel noheader narrow autowidth>
        <div slot="message">
          <h3 class="tab horizontal wrap layout">
           <mwc-tab-bar>
            <mwc-tab title="user-lists" label="${_t('credential.Users')}"
                @click="${(e) => this._showTab(e.target)}"></mwc-tab>
            <mwc-tab title="credential-lists" label="${_t('credential.Credentials')}"
                @click="${(e) => this._showTab(e.target)}"></mwc-tab>
            <mwc-tab title="resource-policy-lists" label="${_t('credential.ResourcePolicies')}"
                @click="${(e) => this._showTab(e.target)}"></mwc-tab>
           </mwc-tab-bar>
            ${this.isAdmin ? html`
                <span class="flex"></span>
                <div style="position: relative;">
                  <mwc-icon-button id="dropdown-menu-button" icon="more_horiz" raised
                                  @click="${(e) => this._toggleDropdown(e)}"></mwc-icon-button>
                  <mwc-menu id="dropdown-menu">
                      <mwc-list-item>
                        <a class="horizontal layout start center" @click="${this._openExportToCsvDialog}">
                          <mwc-icon style="color:#242424;padding-right:10px;">get_app</mwc-icon>
                          ${_t('credential.exportCSV')}
                        </a>
                      </mwc-list-item>
                    </mwc-menu>
                </div>
              ` : html``}
          </h3>
          <div id="user-lists" class="admin item tab-content card">
            <h4 class="horizontal flex center center-justified layout">
              <wl-tab-group style="margin-bottom:-8px;">
                <wl-tab value="active-user-list" checked @click="${(e) => this._showList(e.target)}">${_t('credential.Active')}</wl-tab>
                <wl-tab value="inactive-user-list" @click="${(e) => this._showList(e.target)}">${_t('credential.Inactive')}</wl-tab>
              </wl-tab-group>
              <span class="flex"></span>
              <mwc-button raised id="add-user" icon="add" label="${_t('credential.CreateUser')}"
                  @click="${this._launchUserAddDialog}"></mwc-button>
            </h4>
            <div>
              <backend-ai-user-list class="list-content" id="active-user-list" condition="active" ?active="${this._activeTab === 'user-lists'}"></backend-ai-user-list>
              <backend-ai-user-list class="list-content" id="inactive-user-list" style="display:none;" ?active="${this._activeTab === 'user-lists'}"></backend-ai-user-list>
            </div>
          </div>
          <div id="credential-lists" class="item tab-content card" style="display:none;">
            <h4 class="horizontal flex center center-justified layout">
              <wl-tab-group style="margin-bottom:-8px;">
                <wl-tab value="active-credential-list" checked @click="${(e) => this._showList(e.target)}">${_t('credential.Active')}</wl-tab>
                <wl-tab value="inactive-credential-list" @click="${(e) => this._showList(e.target)}">${_t('credential.Inactive')}</wl-tab>
              </wl-tab-group>
              <div class="flex"></div>
              <mwc-button raised id="add-keypair" icon="add" label="${_t('credential.AddCredential')}"
                  @click="${this._launchKeyPairDialog}"></mwc-button>
            </h4>
            <backend-ai-credential-list class="list-content" id="active-credential-list" condition="active" ?active="${this._activeTab === 'credential-lists'}"></backend-ai-credential-list>
            <backend-ai-credential-list class="list-content" style="display:none;" id="inactive-credential-list" condition="inactive" ?active="${this._activeTab === 'credential-lists'}"></backend-ai-credential-list>
          </div>
          <div id="resource-policy-lists" class="admin item tab-content card" style="display:none;">
            <h4 class="horizontal flex center center-justified layout">
              <span>${_t('credential.PolicyGroup')}</span>
              <span class="flex"></span>
              <mwc-button raised id="add-policy" icon="add" label="${_t('credential.CreatePolicy')}"
                          ?disabled="${!this.isSuperAdmin}"
                          @click="${this._launchResourcePolicyDialog}"></mwc-button>
            </h4>
            <div>
              <backend-ai-resource-policy-list id="resource-policy-list" ?active="${this._activeTab === 'resource-policy-lists'}"></backend-ai-resource-policy-list>
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

            <mwc-select outlined id="resource-policy" label="${_t('credential.ResourcePolicy')}" style="width:100%;margin:10px 0;">
              ${this.resource_policy_names.map((item) => html`
                <mwc-list-item value="${item}">${item}</mwc-list-item>
              `)}
            </mwc-select>
            <mwc-select outlined id="rate-limit" label="${_t('credential.RateLimitFor15min')}" style="width:100%;margin:10px 0;">
              ${this.rate_metric.map((item) => html`
                  <mwc-list-item value="${item}">${item}</mwc-list-item>
              `)}
            </mwc-select>
            <!--<wl-expansion name="advanced-keypair-info" style="width:100%;">
              <span slot="title">${_t('general.Advanced')}</span>
              <span slot="description"></span>
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
            </wl-expansion>-->
          </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button raised id="create-keypair-button" icon="add" label="${_t('general.Add')}" fullwidth
          @click="${this._addKeyPair}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="new-policy-dialog" fixed backdrop blockscrolling narrowLayout>
        <span slot="title">${_t('credential.CreateResourcePolicy')}</span>
        <div slot="content">
          <mwc-textfield id="id_new_policy_name" label="${_t('resourcePolicy.PolicyName')}"
                         validationMessage="${_t('data.explorer.ValueRequired')}"
                         maxLength="64"
                         placeholder="${_t('maxLength.64chars')}"
                         required></mwc-textfield>
          <h4>${_t('resourcePolicy.ResourcePolicy')}</h4>
          <div class="horizontal center layout distancing">
            <div class="vertical layout popup-right-margin">
              <wl-label>CPU</wl-label>
              <mwc-textfield class="discrete resource-input" id="cpu-resource" type="number" min="0" max="512"
                            @change="${(e) => this._validateResourceInput(e)}"></mwc-textfield>
                <wl-label class="unlimited">
                  <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}"></wl-checkbox>
                  ${_t('resourcePolicy.Unlimited')}
                </wl-label>
            </div>
            <div class="vertical layout popup-both-margin">
              <wl-label>RAM(GB)</wl-label>
              <mwc-textfield class="resource-input" id="ram-resource" type="number" min="0" max="1024" step="0.01"
                            @change="${(e) => this._validateResourceInput(e)}"></mwc-textfield>
              <wl-label class="unlimited">
                <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}"></wl-checkbox>
                ${_t('resourcePolicy.Unlimited')}
              </wl-label>
            </div>
            <div class="vertical layout popup-both-margin">
              <wl-label>GPU</wl-label>
              <mwc-textfield class="resource-input" id="gpu-resource" type="number" min="0" max="64"
                            @change="${(e) => this._validateResourceInput(e)}"></mwc-textfield>
              <wl-label class="unlimited">
                <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}"></wl-checkbox>
                ${_t('resourcePolicy.Unlimited')}
              </wl-label>
            </div>
            <div class="vertical layout popup-left-margin">
              <wl-label>fGPU</wl-label>
              <mwc-textfield class="resource-input" id="fgpu-resource" type="number" min="0" max="256" step="0.1"
                            @change="${(e) => this._validateResourceInput(e)}"></mwc-textfield>
              <wl-label class="unlimited">
                <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}"></wl-checkbox>
                ${_t('resourcePolicy.Unlimited')}
              </wl-label>
            </div>
          </div>
          <h4>${_t('resourcePolicy.Sessions')}</h4>
          <div class="horizontal justified layout distancing wrap">
            <div class="vertical left layout ${this.enableSessionLifetime ? 'sessions-section' : ''}">
                <wl-label>${_t('resourcePolicy.ContainerPerSession')}</wl-label>
                <mwc-textfield class="discrete" id="container-per-session-limit" type="number" min="0" max="100"
                    @change="${(e) => this._validateResourceInput(e)}"></mwc-textfield>
                <wl-label class="unlimited">
                  <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}"></wl-checkbox>
                  ${_t('resourcePolicy.Unlimited')}
                </wl-label>
              </div>
              <div class="vertical left layout ${this.enableSessionLifetime ? 'sessions-section' : ''}">
                <wl-label>${_t('resourcePolicy.IdleTimeoutSec')}</wl-label>
                <mwc-textfield class="discrete" id="idle-timeout" type="number" min="0" max="1552000"
                  @change="${(e) => this._validateResourceInput(e)}"></mwc-textfield>
                <wl-label class="unlimited">
                  <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}"></wl-checkbox>
                  ${_t('resourcePolicy.Unlimited')}
                </wl-label>
              </div>
              <div class="vertical left layout ${this.enableSessionLifetime ? 'sessions-section' : ''}">
                  <wl-label>${_t('resourcePolicy.ConcurrentJobs')}</wl-label>
                  <mwc-textfield class="discrete" id="concurrency-limit" type="number" min="0" max="100"
                      @change="${(e) => this._validateResourceInput(e)}"></mwc-textfield>
                  <wl-label class="unlimited">
                    <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}"></wl-checkbox>
                   ${_t('resourcePolicy.Unlimited')}
                  </wl-label>
              </div>
              <div class="vertical left layout ${this.enableSessionLifetime ? 'sessions-section' : ''}"
                style="${this.enableSessionLifetime ? '' : 'display:none;'}">
                <wl-label>${_t('resourcePolicy.MaxSessionLifeTime')}</wl-label>
                <mwc-textfield class="discrete" id="session-lifetime" type="number" min="0" max="100"
                    @change="${(e) => this._validateResourceInput(e)}"></mwc-textfield>
                <wl-label class="unlimited">
                  <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}"></wl-checkbox>
                  ${_t('resourcePolicy.Unlimited')}
                </wl-label>
              </div>
          </div>
          <h4 style="margin-bottom:0px;">${_t('resourcePolicy.Folders')}</h4>
          <div class="vertical center layout distancing" id="dropdown-area">
            <mwc-select id="allowed_vfolder-hosts" label="${_t('resourcePolicy.AllowedHosts')}" style="width:100%;"
              @opened="${() => this._controlHeightByVfolderHostCount(true)}"
              @closed="${() => this._controlHeightByVfolderHostCount()}">
              ${this.allowed_vfolder_hosts.map((item) => html`
                <mwc-list-item class="owner-group-dropdown"
                               id="${item}"
                               value="${item}">
                  ${item}
                </mwc-list-item>
              `)}
            </mwc-select>
            <div class="horizontal layout justified" style="width:100%;">
              <div class="vertical layout flex popup-right-margin">
                <wl-label class="folders">${_t('resourcePolicy.Capacity')}(GB)</wl-label>
                <mwc-textfield id="vfolder-capacity-limit" type="number" min="0" max="1024" step="0.1"
                    @change="${(e) => this._validateResourceInput(e)}"></mwc-textfield>
                <wl-label class="unlimited">
                  <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}"></wl-checkbox>
                  ${_t('resourcePolicy.Unlimited')}
                </wl-label>
              </div>
              <div class="vertical layout flex popup-left-margin">
                <wl-label class="folders">${_t('credential.Max#')}</wl-label>
                <mwc-textfield class="discrete" id="vfolder-count-limit" type="number" min="0" max="50"
                    @change="${(e) => this._validateResourceInput(e)}"></mwc-textfield>
              </div>
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
              validationMessage="${_text('credential.validation.InvalidEmailAddress')}">
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
                pattern="^(?=.*?[a-zA-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
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
                pattern="^(?=.*?[a-zA-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
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
          <mwc-button raised id="create-user-button" icon="add" label="${_t('credential.CreateUser')}" fullwidth
          @click="${this._addUser}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="export-to-csv" fixed backdrop blockscrolling>
        <span slot="title">${_t('credential.ExportCSVFile')} (${this._activeTab})</span>

        <div slot="content" class="intro centered login-panel">
          <mwc-textfield id="export-file-name" label="${_text('credential.FileName')}"
                          validationMessage="${_text('credential.validation.LetterNumber-_dot')}"
                          value="${this._activeTab + '_' + this._defaultFileName}" required
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
