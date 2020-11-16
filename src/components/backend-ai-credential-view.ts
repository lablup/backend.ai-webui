/**
 * Backend.AI-credential-view
 */

import {get as _text, translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";


import '@material/mwc-textfield/mwc-textfield';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-icon-button/mwc-icon-button';
import '@material/mwc-menu/mwc-menu';
import '@material/mwc-tab-bar/mwc-tab-bar';
import '@material/mwc-tab/mwc-tab';
import '@material/mwc-button/mwc-button';
import '@material/mwc-select/mwc-select';

import 'weightless/button';
import 'weightless/icon';
import 'weightless/card';
import 'weightless/textfield';
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
import {default as PainKiller} from "./backend-ai-painkiller";

import JsonToCsv from '../lib/json_to_csv';
import {BackendAIPage} from './backend-ai-page';
import {BackendAiStyles} from "./backend-ai-general-styles";
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from "../plastics/layout/iron-flex-layout-classes";

/**
 Backend.AI Credential view page

 Example:

 <backend-ai-credential-view active=true>
 ... content ...
 </backend-ai-credential-view>

 @group Backend.AI Console
 */
@customElement("backend-ai-credential-view")
export default class BackendAICredentialView extends BackendAIPage {
  @property({type: Object}) cpu_resource = {};
  @property({type: Object}) ram_resource = {};
  @property({type: Object}) gpu_resource = {};
  @property({type: Object}) fgpu_resource = {};
  @property({type: Object}) concurrency_limit = {};
  @property({type: Object}) idle_timeout = {};
  @property({type: Object}) vfolder_capacity = {};
  @property({type: Object}) vfolder_max_limit= {};
  @property({type: Object}) container_per_session_limit = {};
  @property({type: Array}) rate_metric = [1000, 2000, 3000, 4000, 5000, 10000, 50000];
  @property({type: Object}) resource_policies = Object();
  @property({type: Array}) resource_policy_names = Array();
  @property({type: Boolean}) isAdmin = false;
  @property({type: String}) _status = 'inactive';
  @property({type: Array}) allowed_vfolder_hosts = Array();
  @property({type: String}) default_vfolder_host = '';
  @property({type: String}) new_access_key = '';
  @property({type: String}) new_secret_key = '';
  @property({type: String}) _activeTab = 'users';
  @property({type: Object}) notification = Object();
  @property({type: Object}) exportToCsvDialog = Object();
  @property({type: String}) _defaultFileName = '';
  @property({type: Number}) selectAreaHeight;

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
        #new-keypair-dialog {
          min-width: 350px;
          height: 100%;
        }

        wl-button {
          --button-bg: var(--paper-light-green-50);
          --button-bg-hover: var(--paper-green-100);
          --button-bg-active: var(--paper-green-600);
        }

        wl-button.fab {
          --button-bg: var(--paper-light-green-600);
          --button-bg-hover: var(--paper-green-600);
          --button-bg-active: var(--paper-green-900);
        }

        wl-icon.close {
          color: black;
        }

        wl-card > h4 {
          margin-bottom: 0px;
        }

        wl-card h3 {
          padding-top: 0;
          padding-right: 15px;
          padding-bottom: 0;
        }

        wl-card wl-card {
          margin: 0;
          padding: 0;
          --card-elevation: 0;
        }

        wl-tab-group {
          border-radius: 5px 5px 0px 0px;
          --tab-group-indicator-bg: var(--general-tabbar-button-color);
        }

        wl-tab {
          border-radius: 5px 5px 0px 0px;
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
          border-radius: 5px 5px 0px 0px;
          margin: 0px auto;
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
          font-size: 11px;
          --label-font-family: Roboto, Noto, sans-serif;
        }

        wl-label.folders {
          margin: 3px 0px 7px 0px;
        }

        wl-label.unlimited {
          margin: 4px 0px 0px 0px;
        }

        wl-list-item {
          width: 100%;
        }

        wl-textfield {
          width: 100%;
          --input-state-color-invalid: red;
          --input-padding-top-bottom: 0px;
          --input-font-family: Roboto, Noto, sans-serif;
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

        mwc-textfield#export-file-name {
          margin-bottom: 10px;
        }

        #new-user-dialog wl-textfield {
          margin-bottom: 15px;
        }

        mwc-menu {
          --mdc-theme-surface: #f1f1f1;
          --mdc-menu-item-height : auto;
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
      `];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    document.addEventListener('backend-ai-credential-refresh', () => {
      this.shadowRoot.querySelector('#active-credential-list').refresh();
      this.shadowRoot.querySelector('#inactive-credential-list').refresh();
    }, true);

    this.shadowRoot.querySelectorAll('wl-expansion').forEach(element => {
      element.addEventListener("keydown", event => {
        event.stopPropagation();
      }, true);
    });

    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._preparePage();
      });
    } else {
      this._preparePage();
    }
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
      this.shadowRoot.querySelector('#user-list').active = false;
      this._status = 'inactive';
      return;
    }
    this.shadowRoot.querySelector('#resource-policy-list').active = true;
    this.shadowRoot.querySelector('#user-list').active = true;
    this._status = 'active';
  }

  /**
   * Launch a keypair dialog.
   */
  async _launchKeyPairDialog() {
    await this._getResourcePolicies();
    this.shadowRoot.querySelector('#new-keypair-dialog').show();
  }

  /**
   * Read the vfolder host information.
   */
  _readVFolderHostInfo() {
    globalThis.backendaiclient.vfolder.list_hosts().then(response => {
      this.allowed_vfolder_hosts = response.allowed;
      this.default_vfolder_host = response.default;
      this.shadowRoot.querySelector('#allowed_vfolder-hosts').layout(true).then(()=>{
        this.shadowRoot.querySelector('#allowed_vfolder-hosts').select(0);
      });
    }).catch(err => {
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
  _launchResourcePolicyDialog() {
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
    return globalThis.backendaiclient.resourcePolicy.get(null, ['name', 'default_for_unspecified',
      'total_resource_slots',
      'max_concurrent_sessions',
      'max_containers_per_session',
    ]).then((response) => {
      let policies = globalThis.backendaiclient.utils.gqlToObject(response.keypair_resource_policies, 'name');
      let policyNames = globalThis.backendaiclient.utils.gqlToList(response.keypair_resource_policies, 'name');
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
    let is_active = true;
    let is_admin = false;
    let user_idEl = this.shadowRoot.querySelector('#id_new_user_id');
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

    let resource_policy = this.shadowRoot.querySelector('#resource-policy').value;
    let rate_limit = this.shadowRoot.querySelector('#rate-limit').value;
    // Read resources
      globalThis.backendaiclient.keypair.add(user_id, is_active, is_admin,
        resource_policy, rate_limit).then(response => {
      this.shadowRoot.querySelector('#new-keypair-dialog').hide();
      this.notification.text = _text('credential.KeypairCreated');
      this.notification.show();
      this.shadowRoot.querySelector('#active-credential-list').refresh();
    }).catch(err => {
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
   */
  _readResourcePolicyInput() {
    let total_resource_slots = {};
    let vfolder_hosts: Array<object> = [];
    vfolder_hosts.push(this.shadowRoot.querySelector('#allowed_vfolder-hosts').value);
    try {
      this._validateUserInput(this.cpu_resource);
      this._validateUserInput(this.ram_resource);
      this._validateUserInput(this.gpu_resource);
      this._validateUserInput(this.fgpu_resource);
      this._validateUserInput(this.concurrency_limit);
      this._validateUserInput(this.idle_timeout);
      this._validateUserInput(this.container_per_session_limit);
      this._validateUserInput(this.vfolder_capacity);
      this._validateUserInput(this.vfolder_max_limit);
    } catch (err) {
      throw err;
    }

    total_resource_slots['cpu'] = this.cpu_resource['value'];
    total_resource_slots['mem'] = this.ram_resource['value'] + 'g';
    total_resource_slots['cuda.device'] = parseInt(this.gpu_resource['value']);
    total_resource_slots['cuda.shares'] = parseFloat(this.fgpu_resource['value']);

    this.concurrency_limit['value'] = this.concurrency_limit['value'] === '' ? 0 : parseInt(this.concurrency_limit['value']);
    this.idle_timeout['value'] = this.idle_timeout['value'] === '' ? 0 : parseInt(this.idle_timeout['value']);
    this.container_per_session_limit['value'] = this.container_per_session_limit['value'] === '' ? 0 : parseInt(this.container_per_session_limit['value']);
    this.vfolder_capacity['value'] = this.vfolder_capacity['value'] === '' ? 0 : parseInt(this.vfolder_capacity['value']);
    this.vfolder_max_limit['value'] = this.vfolder_max_limit['value'] === '' ? 0 : parseInt(this.vfolder_max_limit['value']);

    Object.keys(total_resource_slots).map((resource) => {
      if (isNaN(parseFloat(total_resource_slots[resource]))) {
        delete total_resource_slots[resource];
      }
    });

    let input = {
      'default_for_unspecified': 'UNLIMITED',
      'total_resource_slots': JSON.stringify(total_resource_slots),
      'max_concurrent_sessions': this.concurrency_limit['value'],
      'max_containers_per_session': this.container_per_session_limit['value'],
      'idle_timeout': this.idle_timeout['value'],
      'max_vfolder_count': this.vfolder_max_limit['value'],
      'max_vfolder_size': this.vfolder_capacity['value'],
      'allowed_vfolder_hosts': vfolder_hosts
    };
    return input;
  }

  /**
   * Add a new resource policy.
   */
  _addResourcePolicy() {
    let policy_info = this.shadowRoot.querySelector('#id_new_policy_name');
    if(!policy_info.checkValidity()) {
      policy_info.reportValidity();
      return;
    }
    try {
      let name_field = this.shadowRoot.querySelector('#id_new_policy_name');
      name_field.checkValidity();
      let name = name_field.value;
      if (name === '') {
        throw {"message": "Policy name should not be empty"};
      }
      let input = this._readResourcePolicyInput();
      globalThis.backendaiclient.resourcePolicy.add(name, input).then(response => {
        this.shadowRoot.querySelector('#new-policy-dialog').hide();
        this.notification.text = "Resource policy successfully created.";
        this.notification.show();
        this.shadowRoot.querySelector('#resource-policy-list').refresh();
      }).catch(err => {
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
    const emailEl = this.shadowRoot.querySelector('#id_user_email'),
      nameEl = this.shadowRoot.querySelector('#id_user_name'),
      passwordEl = this.shadowRoot.querySelector('#id_user_password'),
      confirmEl = this.shadowRoot.querySelector('#id_user_confirm');
    
    const email = emailEl.value,
      // if name value is empty, it will be covered by the username of email address.
      name = nameEl.value !== '' ? nameEl.value : email.split('@')[0],
      password = passwordEl.value;

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
      .then(res => {
        const default_id = res.groups.find(x => x.name === 'default').id;
        return Promise.resolve(globalThis.backendaiclient.user.create(email, {...input, 'group_ids': [default_id]}));
      })
      .then(res => {
        this.shadowRoot.querySelector('#new-user-dialog').hide();
        if (res['create_user'].ok) {
          this.notification.text = _text('credential.UserAccountCreated');

          this.shadowRoot.querySelector('#user-list').refresh();
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
    let name = this.shadowRoot.querySelector('#id_new_policy_name').value;
    try {
      let input = this._readResourcePolicyInput();

      globalThis.backendaiclient.resourcePolicy.mutate(name, input).then(response => {
        this.shadowRoot.querySelector('#new-policy-dialog').close();
        this.notification.text = _text("resourcePolicy.SuccessfullyUpdated");
        this.notification.show();
        this.shadowRoot.querySelector('#resource-policy-list').refresh();
      }).catch(err => {
        console.log(err);
        if (err && err.message) {
          this.shadowRoot.querySelector('#new-policy-dialog').close();
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      });
    } catch(err){
      this.notification.text = err.message;
      this.notification.show();
    }
  }

  /**
   * Disable the page.
   */
  disablePage() {
    var els = this.shadowRoot.querySelectorAll(".admin");
    for (var x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
  }

  /**
   * Display the tab.
   *
   * @param button
   */
  _showTab(tab) {
    var els = this.shadowRoot.querySelectorAll(".tab-content");
    for (var x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    this._activeTab = tab.title;
    this.shadowRoot.querySelector('#' + tab.title).style.display = 'block';
  }

  /**
   * Display the list.
   *
   * @param button
   */
  _showList(list) {
    var els = this.shadowRoot.querySelectorAll(".list-content");
    for (var x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    this.shadowRoot.querySelector('#' + list.value).style.display = 'block';
  }

  /**
   * Set a wlTextEl value according to toggle checkbox checked state.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  _toggleCheckbox(e) {
    const checkEl = e.target;
    const checked = checkEl.checked;
    const wlTextEl = checkEl.closest('div').querySelector('wl-textfield');
    wlTextEl.disabled = checked;
    if (!wlTextEl.disabled) {
      if (wlTextEl.value === '') {
        wlTextEl.value = 0;
      }
    }
  }

  /**
   * Check validation of resource input.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  _validateResourceInput(e) {
    const textfield = e.target.closest('wl-textfield');
    const checkbox_el = textfield.closest('div').querySelector('.unlimited');
    let checkbox;
    if (checkbox_el) {
      checkbox = checkbox_el.querySelector('wl-checkbox');
    } else {
      checkbox = null;
    }

    if (textfield.value < 0) {
      textfield.value = 0;
    }

    if (textfield.value === '') {
      try {
        if (!checkbox || !checkbox['checked']) {
          textfield['required'] = true;
          textfield.focus();
          throw { "message" : _text("resourcePolicy.PleaseInputValue") };
        }
        else {
          textfield['required'] = false;
          textfield.value = '';
        }
      } catch (err) {
        this.notification.text = err.message;
        this.notification.show();
      }
    }
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
          throw {"message" : _text("resourcePolicy.CannotCreateResourcePolicy") };
      }
    }
  }

  /**
   * Add validator to policy input.
   */
  _addValidatorToPolicyInput() {
    let policy_info = this.shadowRoot.querySelector('#id_new_policy_name');
    policy_info.validityTransform = (value, nativeValidity) => {
      if (!nativeValidity) {
        policy_info.validationMessage = _text("credential.validation.PolicyName");
        return {
          valid: false,
          valueMissing: true
        };
      }
      if (!nativeValidity.valid) {
        if (nativeValidity.patternMismatch) {
          policy_info.validationMessage = _text("credential.validation.LetterNumber-_dot");
          return {
            valid: nativeValidity.valid,
            patternMismatch: !nativeValidity.valid
          };
        }
        else if (nativeValidity.valueMissing) {
          policy_info.validationMessage = _text("credential.validation.PolicyName");
          return {
            valid: nativeValidity.valid,
            valueMissing: !nativeValidity.valid
          }
        }
        else {
          policy_info.validationMessage = _text("credential.validation.LetterNumber-_dot");
          return {
            valid: nativeValidity.valid,
            patternMismatch: !nativeValidity.valid,
          }
        }
      } else {
        const isValid = !this.resource_policy_names.includes(value);
        if (!isValid) {
          policy_info.validationMessage = _text("credential.validation.NameAlreadyExists");
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
    let textfield = resource;
    let checkbox = textfield.closest('div').querySelector('wl-checkbox');
    if (textfield.value === '' || textfield.value === "0" ) {
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
    let fileNameEl = this.shadowRoot.querySelector('#export-file-name');
    if (!fileNameEl.validity.valid) {
      return;
    }
    switch(this._activeTab) {
      case 'user-lists':
        let users = this.shadowRoot.querySelector('#user-list')['users'];
        users.map((obj) => { // filtering unnecessary key
          ['password', 'need_password_change'].forEach(key => delete obj[key]);
        });
        JsonToCsv.exportToCsv(fileNameEl.value, users);
        break;
      case 'credential-lists':
        let credential_active = this.shadowRoot.querySelector('#active-credential-list')['keypairs'];
        let credential_inactive = this.shadowRoot.querySelector('#inactive-credential-list')['keypairs'];
        let credential = credential_active.concat(credential_inactive);
        credential.map((obj)=> { // filtering unnecessary key
          ['is_admin'].forEach(key => delete obj[key]);
        });
        JsonToCsv.exportToCsv(fileNameEl.value, credential);
        break;
      case 'resource-policy-lists':
        let resource_policy = this.shadowRoot.querySelector('#resource-policy-list')['resourcePolicy'];
        JsonToCsv.exportToCsv(fileNameEl.value, resource_policy);
        break;
    }
    this.notification.text = _text("session.DownloadingCSVFile");
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
  }

  /**
   * Get default csv file name according to local time.
   */
  _getDefaultCSVFileName() {
    let date = new Date().toISOString().substring(0, 10);
    let time = new Date().toTimeString().slice(0,8).replace(/:/gi, '-');
    return date+'_'+time;
  }

  /**
   * Control a dropdown menu's open state.
   */
  _toggleDropdown() {
    let menu = this.shadowRoot.querySelector("#dropdown-menu");
    menu.open = !menu.open;
    if(this.exportToCsvDialog.open) {
      menu.open = false;
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
          }
        } else {
          passwordInput.validationMessage = _text('signup.PasswordInvalid');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          }
        }
      } else {
        return {
          valid: nativeValidity.valid,
          customError: !nativeValidity.valid
        }
      }
    }
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
          }
        } else {
          password2Input.validationMessage = _text('signup.PasswordInvalid');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          }
        }
      } else {
        // custom validation for password input match
        const passwordInput = this.shadowRoot.querySelector('#id_user_password');
        let isMatched = (passwordInput.value === password2Input.value);
        if (!isMatched) {
          password2Input.validationMessage = _text('signup.PasswordNotMatched');
        }
        return {
          valid: isMatched,
          customError: !isMatched
        }
      }
    }
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
   * @param isOpened
   */
  _controlHeightByVfolderHostCount(isOpened = false) {
    if (!isOpened) {
      this.shadowRoot.querySelector('#dropdown-area').style.height = this.selectAreaHeight;
      console.log(this.selectAreaHeight);
      return;
    }
    let itemCount = this.shadowRoot.querySelector('#allowed_vfolder-hosts').items.length;
    let actualHeight = this.shadowRoot.querySelector('#dropdown-area').offsetHeight;
    if (itemCount > 0) {
    this.shadowRoot.querySelector('#dropdown-area').style.height = (actualHeight + itemCount * 14) +'px';
    }
  }

  render() {
    // language=HTML
    return html`
      <lablup-activity-panel noheader narrow autowidth>
        <div slot="message">
          <h3 class="tab horizontal wrap layout">
           <mwc-tab-bar>
            <mwc-tab title="user-lists" label="${_t("credential.Users")}"
                @click="${(e) => this._showTab(e.target)}"></mwc-tab>
            <mwc-tab title="credential-lists" label="${_t("credential.Credentials")}"
                @click="${(e) => this._showTab(e.target)}"></mwc-tab>
            <mwc-tab title="resource-policy-lists" label="${_t("credential.ResourcePolicies")}"
                @click="${(e) => this._showTab(e.target)}"></mwc-tab>
           </mwc-tab-bar>
            ${this.isAdmin ? html`
                <span class="flex"></span>
                <mwc-icon-button id="dropdown-menu-button" icon="more_horiz" raised
                                @click="${this._toggleDropdown}">
                  <mwc-menu id="dropdown-menu" absolute x="-50" y="25">
                    <mwc-list-item>
                      <a class="horizontal layout start center" @click="${this._openExportToCsvDialog}">
                        <mwc-icon style="color:#242424;padding-right:10px;">get_app</mwc-icon>
                        ${_t("credential.exportCSV")}
                      </a>
                    </mwc-list-item>
                  </mwc-menu>
                </mwc-icon-button>
              ` : html``}
          </h3>
          <wl-card id="user-lists" class="admin item tab-content">
            <h4 class="horizontal flex center center-justified layout">
              <span>${_t("credential.Users")}</span>
              <span class="flex"></span>
              <mwc-button raised id="add-user" icon="add" label="${_t("credential.CreateUser")}"
                  @click="${this._launchUserAddDialog}"></mwc-button>
            </h4>
            <div>
              <backend-ai-user-list id="user-list" ?active="${this._status === 'active'}"></backend-ai-user-list>
            </div>
          </wl-card>
          <wl-card id="credential-lists" class="item tab-content" style="display:none;">
            <h4 class="horizontal flex center center-justified layout">
              <wl-tab-group style="margin-bottom:-8px;">
                <wl-tab value="active-credential-list" checked @click="${(e) => this._showList(e.target)}">${_t("credential.Active")}</wl-tab>
                <wl-tab value="inactive-credential-list" @click="${(e) => this._showList(e.target)}">${_t("credential.Inactive")}</wl-tab>
              </wl-tab-group>
              <div class="flex"></div>
              <mwc-button raised id="add-user" icon="add" label="${_t("credential.AddCredential")}"
                  @click="${this._launchKeyPairDialog}"></mwc-button>
            </h4>
            <backend-ai-credential-list class="list-content" id="active-credential-list" condition="active" ?active="${this._activeTab === 'credential-lists'}"></backend-ai-credential-list>
            <backend-ai-credential-list class="list-content" style="display:none;" id="inactive-credential-list" condition="inactive" ?active="${this._activeTab === 'credential-lists'}"></backend-ai-credential-list>
          </wl-card>
          <wl-card id="resource-policy-lists" class="admin item tab-content" style="display:none;">
            <h4 class="horizontal flex center center-justified layout">
              <span>${_t("credential.PolicyGroup")}</span>
              <span class="flex"></span>
              <mwc-button raised id="add-user" icon="add" label="${_t("credential.CreatePolicy")}"
              @click="${this._launchResourcePolicyDialog}"></mwc-button>
            </h4>
            <div>
              <backend-ai-resource-policy-list id="resource-policy-list" ?active="${this._activeTab === 'resource-policy-lists'}"></backend-ai-resource-policy-list>
            </div>
          </wl-card>
        </div>
      </lablup-activity-panel>
      <backend-ai-dialog id="new-keypair-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t("credential.AddCredential")}</span>
        <div slot="content">
          <div class="vertical center-justified layout center">
            <mwc-textfield
                type="email"
                name="new_user_id"
                id="id_new_user_id" 
                label="${_t("credential.UserIDAsEmail")}"
                validationMessage="${_t('credential.UserIDRequired')}"
                required
                autoValidate></mwc-textfield>
           
            <mwc-select outlined id="resource-policy" label="${_t("credential.ResourcePolicy")}" style="width:100%;">
              ${this.resource_policy_names.map(item => html`
                <mwc-list-item value="${item}">${item}</mwc-list-item>
              `)}
            </mwc-select>
            <mwc-select outlined id="rate-limit" label="${_t("credential.RateLimitFor15min")}" style="width:100%;">
              ${this.rate_metric.map(item => html`
                  <mwc-list-item value="${item}">${item}</mwc-list-item>
              `)}
            </mwc-select>
            <!--<wl-expansion name="advanced-keypair-info" style="width:100%;">
              <span slot="title">${_t("general.Advanced")}</span>
              <span slot="description"></span>
              <div class="vertical layout center">
              <mwc-textfield
                  type="text"
                  name="new_access_key"
                  id="id_new_access_key"
                  label="${_t("credential.UserIDAsEmail")}"
                  autoValidate></mwc-textfield>
              <mwc-textfield
                  type="text"
                  name="new_access_key"
                  id="id_new_secret_key"
                  label="${_t("credential.AccessKeyOptional")}"
                  autoValidate
                  .value="${this.new_access_key}"><mwc-textfield>
              </div>
            </wl-expansion>-->
          </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button raised id="create-keypair-button" icon="add" label="${_t("general.Add")}" style="width:100%;"
          @click="${this._addKeyPair}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="new-policy-dialog" fixed backdrop blockscrolling narrowLayout>
        <span slot="title">${_t("credential.CreateResourcePolicy")}</span>
        <div slot="content">
          <mwc-textfield id="id_new_policy_name" label="${_t("resourcePolicy.PolicyName")}" pattern="^[a-zA-Z0-9_-]+$"
                         validationMessage="${_t('explorer.ValueRequired')}"
                         required></mwc-textfield>
          <h4>${_t("resourcePolicy.ResourcePolicy")}</h4>
          <div class="horizontal center layout distancing">
            <div class="vertical layout" style="margin: 0 10px 0 0;">
              <wl-label>CPU</wl-label>
              <wl-textfield id="cpu-resource" type="number"
                            @change="${(e) => this._validateResourceInput(e)}"></wl-textfield>
                <wl-label class="unlimited">
                  <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}" style="border-width: 1px;"></wl-checkbox>
                  ${_t("resourcePolicy.Unlimited")}
                </wl-label>
            </div>
            <div class="vertical layout" style="margin: 0px 10px 0px 10px;">
              <wl-label>RAM(GB)</wl-label>
              <wl-textfield id="ram-resource" type="number"
                            @change="${(e) => this._validateResourceInput(e)}"></wl-textfield>
              <wl-label class="unlimited">
                <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}" style="border-width: 1px;"></wl-checkbox>
                ${_t("resourcePolicy.Unlimited")}
              </wl-label>
            </div>
            <div class="vertical layout" style="margin: 0px 10px 0px 10px;">
              <wl-label>GPU</wl-label>
              <wl-textfield id="gpu-resource" type="number"
                            @change="${(e) => this._validateResourceInput(e)}"></wl-textfield>
              <wl-label class="unlimited">
                <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}" style="border-width: 1px;"></wl-checkbox>
                ${_t("resourcePolicy.Unlimited")}
              </wl-label>
            </div>
            <div class="vertical layout" style="margin: 0px 0px 0px 10px;">
              <wl-label>fGPU</wl-label>
              <wl-textfield id="fgpu-resource" type="number"
                            @change="${(e) => this._validateResourceInput(e)}"></wl-textfield>
              <wl-label class="unlimited">
                <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}" style="border-width: 1px;"></wl-checkbox>
                ${_t("resourcePolicy.Unlimited")}
              </wl-label>
            </div>
          </div>
          <h4>${_t("resourcePolicy.Sessions")}</h4>
          <div class="horizontal center layout distancing">
            <div class="vertical left layout">
                <wl-label>${_t("resourcePolicy.ContainerPerSession")}</wl-label>
                <wl-textfield id="container-per-session-limit" type="number" @change="${(e) => this._validateResourceInput(e)}"></wl-textfield>
                <wl-label class="unlimited">
                  <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}" style="border-width: 1px;"></wl-checkbox>
                  ${_t("resourcePolicy.Unlimited")}
                </wl-label>
              </div>
              <div class="vertical left layout" style="margin: 0px 15px;">
                <wl-label>${_t("resourcePolicy.IdleTimeoutSec")}</wl-label>
                <wl-textfield id="idle-timeout" type="number" @change="${(e) => this._validateResourceInput(e)}"></wl-textfield>
                <wl-label class="unlimited">
                  <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}" style="border-width: 1px;"></wl-checkbox>
                  ${_t("resourcePolicy.Unlimited")}
                </wl-label>
              </div>
              <div class="vertical left layout">
                  <wl-label>${_t("resourcePolicy.ConcurrentJobs")}</wl-label>
                  <wl-textfield id="concurrency-limit" type="number" @change="${(e) => this._validateResourceInput(e)}"></wl-textfield>
                  <wl-label class="unlimited">
                    <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}" style="border-width: 1px;"></wl-checkbox>
                   ${_t("resourcePolicy.Unlimited")}
                  </wl-label>
              </div>
          </div>
          <h4 style="margin-bottom:0px;">${_t("resourcePolicy.Folders")}</h4>
          <div class="vertical center layout distancing" id="dropdown-area">
            <mwc-select id="allowed_vfolder-hosts" label="${_t("resourcePolicy.AllowedHosts")}" style="width:100%;"
              @opened="${() => this._controlHeightByVfolderHostCount(true)}"
              @closed="${() => this._controlHeightByVfolderHostCount()}">
              ${this.allowed_vfolder_hosts.map(item => html`
                <mwc-list-item class="owner-group-dropdown"
                               id="${item}"
                               value="${item}">
                  ${item}
                </mwc-list-item>
              `)}
            </mwc-select>
            <div class="horizontal layout">
              <div class="vertical layout" style="margin-right: 10px;">
                <wl-label class="folders">${_t("resourcePolicy.Capacity")}(GB)</wl-label>
                <wl-textfield id="vfolder-capacity-limit" type="number" @change="${(e) => this._validateResourceInput(e)}"></wl-textfield>
                <wl-label class="unlimited">
                  <wl-checkbox @change="${(e) => this._toggleCheckbox(e)}" style="border-width: 1px;"></wl-checkbox>
                  ${_t("resourcePolicy.Unlimited")}
                </wl-label>
              </div>
              <div class="vertical layout" style="margin-left: 10px;">
                <wl-label class="folders">${_t("credential.Max#")}</wl-label>
                <wl-textfield id="vfolder-count-limit" type="number" @change="${(e) => this._validateResourceInput(e)}"></wl-textfield>
              </div>
            </div>
          </div>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout distancing">
          <mwc-button
              unelevated
              outlined
              id="create-policy-button"
              icon="check"
              label="${_t("credential.Create")}"
              style="width:100%;"
              @click="${() => this._addResourcePolicy()}"></mwc-button>
        </div>
      </backend-ai-dialog>
      </backend-ai-dialog>
      <backend-ai-dialog id="new-user-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t("credential.CreateUser")}</span>
        <div slot="content">
          <mwc-textfield
              type="email"
              name="user_email"
              id="id_user_email"
              label="${_t("general.E-Mail")}"
              autoValidate
              required
              validationMessage="${_text('credential.validation.InvalidEmailAddress')}">
          </mwc-textfield>
          <mwc-textfield
              type="text"
              name="user_name"
              id="id_user_name"
              label="${_t("general.Username")}">
          </mwc-textfield>
          <div class="horizontal flex layout">
            <mwc-textfield
                type="password"
                name="user_password"
                id="id_user_password"
                label="${_t("general.Password")}"
                autoValidate
                required
                pattern="^(?=.*?[a-zA-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
                validationMessage="${_text('signup.PasswordInvalid')}"
                @change="${() => this._validatePassword()}">
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
                label="${_t("general.ConfirmPassword")}"
                autoValidate
                required
                pattern="^(?=.*?[a-zA-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
                validationMessage="${_text('signup.PasswordNotMatched')}"
                @change="${() => this._validatePassword()}">
            </mwc-textfield>
            <mwc-icon-button-toggle off onIcon="visibility" offIcon="visibility_off"
                @click="${(e) => this._togglePasswordVisibility(e.target)}">
            </mwc-icon-button-toggle>
          </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button raised id="create-user-button" icon="add" label="${_t("credential.CreateUser")}" style="width:100%;"
          @click="${this._addUser}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="export-to-csv" fixed backdrop blockscrolling>
        <span slot="title">${_t("credential.ExportCSVFile")} (${this._activeTab})</span>

        <div slot="content" class="intro centered login-panel">
          <mwc-textfield id="export-file-name" label="File name" pattern="^[a-zA-Z0-9_-]+$"
                          validationMessage="${_text('credential.validation.LetterNumber-_dot')}"
                          value="${this._activeTab + '_' + this._defaultFileName}" required
          ></mwc-textfield>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
              unelevated
              style="width:100%;"
              icon="get_app"
              label="${_t("credential.ExportCSVFile")}"
              @click="${this._exportToCSV}"></mwc-button>
        </div>
      </backend-ai-dialog>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-credential-view": BackendAICredentialView;
  }
}
