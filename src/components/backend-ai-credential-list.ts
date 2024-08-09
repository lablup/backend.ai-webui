/**
 @license
 Copyright (c) 2015-2024 Lablup Inc. All rights reserved.
 */
import '../plastics/lablup-shields/lablup-shields';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import BackendAIDialog from './backend-ai-dialog';
import { BackendAiStyles } from './backend-ai-general-styles';
import BackendAIListStatus, { StatusCondition } from './backend-ai-list-status';
import './backend-ai-list-status';
import { BackendAIPage } from './backend-ai-page';
import { default as PainKiller } from './backend-ai-painkiller';
import './lablup-grid-sort-filter-column';
import '@material/mwc-button/mwc-button';
import '@material/mwc-list/mwc-list-item';
import { Select } from '@material/mwc-select/mwc-select';
import { TextField } from '@material/mwc-textfield/mwc-textfield';
import '@vaadin/grid/vaadin-grid';
import '@vaadin/grid/vaadin-grid-filter-column';
import '@vaadin/grid/vaadin-grid-sort-column';
import '@vaadin/icons/vaadin-icons';
import '@vaadin/item/vaadin-item';
import { css, CSSResultGroup, html, render } from 'lit';
import { get as _text, translate as _t } from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';

/**
 Backend.AI Credential List

 @group Backend.AI Web UI
 @element backend-ai-credential-list
 */

class UnableToDeleteKeypairException extends Error {
  public title: string;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, UnableToDeleteKeypairException.prototype);
    this.title = 'Unable to delete keypair';
  }
}

@customElement('backend-ai-credential-list')
export default class BackendAICredentialList extends BackendAIPage {
  @property({ type: Object }) notification;
  @property({ type: Object }) keypairInfo = {
    user_id: '1',
    access_key: 'ABC',
    secret_key: 'ABC',
    last_used: '',
    is_admin: false,
    resource_policy: '',
    rate_limit: 5000,
    concurrency_used: 0,
    num_queries: 0,
    created_at: '',
  };
  @property({ type: Boolean }) isAdmin = false;
  @property({ type: String }) condition = 'active';
  @property({ type: Array }) keypairs = [];
  @property({ type: Object }) resourcePolicy = Object();
  @property({ type: Object }) indicator = Object();
  @property({ type: Object }) _boundKeyageRenderer =
    this.keyageRenderer.bind(this);
  @property({ type: Object }) _boundControlRenderer =
    this.controlRenderer.bind(this);
  @property({ type: Object }) _boundAccessKeyRenderer =
    this.accessKeyRenderer.bind(this);
  @property({ type: Object }) _boundPermissionRenderer =
    this.permissionRenderer.bind(this);
  @property({ type: Object }) _boundResourcePolicyRenderer =
    this.resourcePolicyRenderer.bind(this);
  @property({ type: Object }) _boundAllocationRenderer =
    this.allocationRenderer.bind(this);
  @property({ type: Object }) _boundUserIdRenderer =
    this.userIdRenderer.bind(this);
  @property({ type: Object }) keypairGrid = Object();
  @property({ type: String }) listCondition: StatusCondition = 'loading';
  @property({ type: Number }) _totalCredentialCount = 0;
  @property({ type: Boolean }) isUserInfoMaskEnabled = false;
  @property({ type: String }) deleteKeyPairUserName = '';
  @property({ type: String }) deleteKeyPairAccessKey = '';
  @property({ type: Boolean }) supportMainAccessKey = false;
  @property({ type: Array }) _mainAccessKeyList: string[] = [];
  @query('#keypair-info-dialog') keypairInfoDialog!: BackendAIDialog;
  @query('#keypair-modify-dialog') keypairModifyDialog!: BackendAIDialog;
  @query('#delete-keypair-dialog') deleteKeyPairDialog!: BackendAIDialog;
  @query('#policy-list') policyListSelect!: Select;
  @query('#rate-limit') rateLimit!: TextField;
  @query('#list-status') private _listStatus!: BackendAIListStatus;

  constructor() {
    super();
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
        vaadin-grid {
          border: 0;
          font-size: 14px;
          height: calc(100vh - 229px);
        }

        mwc-icon-button {
          --mdc-icon-size: 24px;
          padding: 0;
        }

        mwc-icon {
          --mdc-icon-size: 16px;
          padding: 0;
        }

        vaadin-item {
          font-size: 13px;
          font-weight: 100;
        }

        vaadin-item div[secondary] {
          font-weight: 400;
        }

        div.indicator,
        span.indicator {
          font-size: 9px;
          margin-right: 5px;
        }

        div.configuration {
          width: 100px !important;
        }

        div.configuration mwc-icon {
          padding-right: 5px;
        }

        mwc-list-item {
          width: var(--token-mwc-select-item-width, 340px);
        }

        backend-ai-dialog {
          --component-min-width: 400px;
        }

        backend-ai-dialog h4 {
          font-size: 14px;
          padding: 5px 15px 5px 12px;
          margin: 0 0 10px 0;
          display: block;
          height: 20px;
          border-bottom: 1px solid var(--token-colorBorder, #ccc);
        }

        mwc-button,
        mwc-button[unelevated],
        mwc-button[outlined] {
          background-image: none;
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-theme-on-primary: var(--general-button-color);
          --mdc-typography-font-family: var(--token-fontFamily);
        }
      `,
    ];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
  }

  /**
   * Check the admin and set the keypair grid when backend.ai client connected.
   *
   * @param {Booelan} active - The component will work if active is true.
   */
  async _viewStateChanged(active: boolean) {
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
        () => {
          this._refreshKeyData();
          this.isAdmin = globalThis.backendaiclient.is_admin;
          this.supportMainAccessKey =
            globalThis.backendaiclient.supports('main-access-key');
          this.isUserInfoMaskEnabled =
            globalThis.backendaiclient._config.maskUserInfo;
          this.keypairGrid = this.shadowRoot?.querySelector('#keypair-grid');
        },
        true,
      );
    } else {
      // already connected
      this._refreshKeyData();
      this.isAdmin = globalThis.backendaiclient.is_admin;
      this.supportMainAccessKey =
        globalThis.backendaiclient.supports('main-access-key');
      this.isUserInfoMaskEnabled =
        globalThis.backendaiclient._config.maskUserInfo;
      this.keypairGrid = this.shadowRoot?.querySelector('#keypair-grid');
    }
  }

  /**
   * Refresh key data when user id is null.
   *
   * @param {string} user_id
   * @return {void}
   */
  _refreshKeyData(user_id: null | string = null) {
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
    return globalThis.backendaiclient.resourcePolicy
      .get()
      .then((response) => {
        const rp = response.keypair_resource_policies;
        this.resourcePolicy = globalThis.backendaiclient.utils.gqlToObject(
          rp,
          'name',
        );
      })
      .then(() => {
        const fields = [
          'access_key',
          'is_active',
          'is_admin',
          'user_id',
          'created_at',
          'last_used',
          'concurrency_limit',
          'concurrency_used',
          'rate_limit',
          'num_queries',
          'resource_policy',
        ];
        return globalThis.backendaiclient.keypair.list(
          user_id,
          fields,
          is_active,
        );
      })
      .then(async (response) => {
        if (this.supportMainAccessKey) {
          try {
            // since accesskey and user account status doesn't match all the time,
            // therefore we need to query from both active and inactive user
            const activeUserMainAccessKeyList =
              await globalThis.backendaiclient.user.list(true, [
                'main_access_key',
              ]);
            const inactiveUserMainAccessKeyList =
              await globalThis.backendaiclient.user.list(false, [
                'main_access_key',
              ]);
            if (
              activeUserMainAccessKeyList.users &&
              inactiveUserMainAccessKeyList.users
            ) {
              this._mainAccessKeyList = [
                ...activeUserMainAccessKeyList.users,
                ...inactiveUserMainAccessKeyList.users,
              ].map((userInfo) => userInfo.main_access_key);
            }
          } catch (err) {
            throw err;
          }
        }
        const keypairs = response.keypairs;
        Object.keys(keypairs).map((objectKey, index) => {
          const keypair = keypairs[objectKey];
          if (keypair.resource_policy in this.resourcePolicy) {
            for (const k in this.resourcePolicy[keypair.resource_policy]) {
              if (k === 'created_at') {
                continue;
              }
              keypair[k] = this.resourcePolicy[keypair.resource_policy][k];
              if (k === 'total_resource_slots') {
                keypair['total_resource_slots'] = JSON.parse(
                  this.resourcePolicy[keypair.resource_policy][k],
                );
              }
            }
            keypair['created_at_formatted'] = this._humanReadableTime(
              keypair['created_at'],
            );
            keypair['elapsed'] = this._elapsed(keypair['created_at']);
            if ('cpu' in keypair['total_resource_slots']) {
            } else if (keypair['default_for_unspecified'] === 'UNLIMITED') {
              keypair['total_resource_slots'].cpu = '-';
            }
            if ('mem' in keypair['total_resource_slots']) {
              keypair['total_resource_slots'].mem = parseFloat(
                globalThis.backendaiclient.utils.changeBinaryUnit(
                  keypair['total_resource_slots'].mem,
                  'g',
                ),
              );
              // keypair['total_resource_slots'].mem = parseFloat(keypair['total_resource_slots'].mem);
            } else if (keypair['default_for_unspecified'] === 'UNLIMITED') {
              keypair['total_resource_slots'].mem = '-';
            }
            if ('cuda.device' in keypair['total_resource_slots']) {
              keypair['total_resource_slots'].cuda_device =
                keypair['total_resource_slots']['cuda.device'];
            }
            if ('cuda.shares' in keypair['total_resource_slots']) {
              keypair['total_resource_slots'].cuda_shares =
                keypair['total_resource_slots']['cuda.shares'];
            }
            if (
              'cuda_device' in keypair['total_resource_slots'] === false &&
              'cuda_shares' in keypair['total_resource_slots'] === false &&
              keypair['default_for_unspecified'] === 'UNLIMITED'
            ) {
              keypair['total_resource_slots'].cuda_shares = '-';
              keypair['total_resource_slots'].cuda_device = '-';
            }
            if ('rocm.device' in keypair['total_resource_slots']) {
              keypair['total_resource_slots'].rocm_device =
                keypair['total_resource_slots']['rocm.device'];
            }

            if (
              'rocm_device' in keypair['total_resource_slots'] === false &&
              keypair['default_for_unspecified'] === 'UNLIMITED'
            ) {
              keypair['total_resource_slots'].rocm_device = '-';
            }
            if ('tpu.device' in keypair['total_resource_slots']) {
              keypair['total_resource_slots'].tpu_device =
                keypair['total_resource_slots']['tpu.device'];
            }
            if (
              'tpu_device' in keypair['total_resource_slots'] === false &&
              keypair['default_for_unspecified'] === 'UNLIMITED'
            ) {
              keypair['total_resource_slots'].tpu_device = '-';
            }
            if ('ipu.device' in keypair['total_resource_slots']) {
              keypair['total_resource_slots'].ipu_device =
                keypair['total_resource_slots']['ipu.device'];
            }
            if (
              'ipu_device' in keypair['total_resource_slots'] === false &&
              keypair['default_for_unspecified'] === 'UNLIMITED'
            ) {
              keypair['total_resource_slots'].ipu_device = '-';
            }
            if ('atom.device' in keypair['total_resource_slots']) {
              keypair['total_resource_slots'].atom_device =
                keypair['total_resource_slots']['atom.device'];
            }
            if (
              'atom_device' in keypair['total_resource_slots'] === false &&
              keypair['default_for_unspecified'] === 'UNLIMITED'
            ) {
              keypair['total_resource_slots'].atom_device = '-';
            }
            if ('atom-plus.device' in keypair['total_resource_slots']) {
              keypair['total_resource_slots'].atom_plus_device =
                keypair['total_resource_slots']['atom-plus.device'];
            }
            if (
              'atom-plus.device' in keypair['total_resource_slots'] === false &&
              keypair['default_for_unspecified'] === 'UNLIMITED'
            ) {
              keypair['total_resource_slots'].atom_plus_device = '-';
            }
            if ('gaudi2.device' in keypair['total_resource_slots']) {
              keypair['total_resource_slots'].gaudi2_device =
                keypair['total_resource_slots']['gaudi2.device'];
            }
            if (
              'gaudi2.device' in keypair['total_resource_slots'] === false &&
              keypair['default_for_unspecified'] === 'UNLIMITED'
            ) {
              keypair['total_resource_slots'].gaudi2_device = '-';
            }
            if ('warboy.device' in keypair['total_resource_slots']) {
              keypair['total_resource_slots'].warboy_device =
                keypair['total_resource_slots']['warboy.device'];
            }
            if (
              'warboy_device' in keypair['total_resource_slots'] === false &&
              keypair['default_for_unspecified'] === 'UNLIMITED'
            ) {
              keypair['total_resource_slots'].warboy_device = '-';
            }
            if ('hyperaccel-lpu.device' in keypair['total_resource_slots']) {
              keypair['total_resource_slots'].hyperaccel_lpu_device =
                keypair['total_resource_slots']['hyperaccel-lpu.device'];
            }
            if (
              'hyperaccel_lpu_device' in keypair['total_resource_slots'] ===
                false &&
              keypair['default_for_unspecified'] === 'UNLIMITED'
            ) {
              keypair['total_resource_slots'].hyperaccel_lpu_device = '-';
            }

            [
              'cpu',
              'mem',
              'cuda_shares',
              'cuda_device',
              'rocm_device',
              'tpu_device',
              'ipu_device',
              'atom_device',
              'atom_plus_device',
              'gaudi2_device',
              'warboy_device',
              'hyperaccel_lpu_device',
            ].forEach((slot) => {
              keypair['total_resource_slots'][slot] = this._markIfUnlimited(
                keypair['total_resource_slots'][slot],
              );
            });
            keypair['max_vfolder_size'] = this._markIfUnlimited(
              BackendAICredentialList.bytesToGB(keypair['max_vfolder_size']),
            );
          }
        });
        this.keypairs = keypairs;
        if (this.keypairs.length == 0) {
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

  /**
   * Display a keypair information dialog.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  async _showKeypairDetail(e) {
    const controls = e.target.closest('#controls');
    const access_key = controls['access-key'];
    try {
      const data = await this._getKeyData(access_key);
      this.keypairInfo = data.keypair;
      this.keypairInfoDialog.show();
    } catch (err) {
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    }
  }

  /**
   * Modify resource policy by displaying keypair modify dialog.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  async _modifyResourcePolicy(e) {
    const controls = e.target.closest('#controls');
    const access_key = controls['access-key'];
    try {
      const data = await this._getKeyData(access_key);
      this.keypairInfo = data.keypair;

      this.policyListSelect.value = this.keypairInfo.resource_policy;
      this.rateLimit.value = this.keypairInfo.rate_limit.toString();

      this.keypairModifyDialog.show();
    } catch (err) {
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    }
  }

  /**
   * Get key data from access key.
   *
   * @param {string} accessKey - access key to query
   */
  async _getKeyData(accessKey) {
    const fields = [
      'access_key',
      'secret_key',
      'is_active',
      'is_admin',
      'user_id',
      'created_at',
      'last_used',
      'concurrency_limit',
      'concurrency_used',
      'rate_limit',
      'num_queries',
      'resource_policy',
    ];
    return globalThis.backendaiclient.keypair.info(accessKey, fields);
  }

  /**
   * Refresh the key data.
   */
  refresh() {
    this._refreshKeyData();
  }

  /**
   * Return the condtion is active.
   *
   * @return {boolean} condition - boolean whether the current component condition is active or not.
   */
  _isActive() {
    return this.condition === 'active';
  }

  /**
   * Show the keypair detail dialog.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  _deleteKeyPairDialog(e) {
    const controls = e.target.closest('#controls');
    const user_id = controls['user-id'];
    const access_key = controls['access-key'];
    this.deleteKeyPairUserName = user_id;
    this.deleteKeyPairAccessKey = access_key;
    this.deleteKeyPairDialog.show();
  }

  /**
   * Delete the access key.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  _deleteKey(e) {
    globalThis.backendaiclient.keypair
      .delete(this.deleteKeyPairAccessKey)
      .then((response) => {
        if (response.delete_keypair && !response.delete_keypair.ok) {
          throw new UnableToDeleteKeypairException(response.delete_keypair.msg);
        }
        this.notification.text = _text('credential.KeySeccessfullyDeleted');
        this.notification.show();
        this.refresh();
        this.deleteKeyPairDialog.hide();
      })
      .catch((err) => {
        console.log(err);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      });
  }

  /**
   * Revoke the access key.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  _revokeKey(e) {
    this._mutateKey(e, false);
  }

  /**
   * Reuse the access key.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  _reuseKey(e) {
    this._mutateKey(e, true);
  }

  /**
   * Mutate the access key.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   * @param {Boolean} is_active
   */
  _mutateKey(e, is_active: boolean) {
    const controls = e.target.closest('#controls');
    const accessKey = controls['access-key'];
    const original: any = this.keypairs.find(this._findKeyItem, accessKey);
    const input = {
      is_active: is_active,
      is_admin: original.is_admin,
      resource_policy: original.resource_policy,
      rate_limit: original.rate_limit,
      concurrency_limit: original.concurrency_limit,
    };
    globalThis.backendaiclient.keypair
      .mutate(accessKey, input)
      .then((response) => {
        const event = new CustomEvent('backend-ai-credential-refresh', {
          detail: this,
        });
        document.dispatchEvent(event);
      })
      .catch((err) => {
        console.log(err);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      });
  }

  /**
   * Find the access key.
   *
   * @param {Record<string, unknown>} element
   * @return {boolean} - Return whether the access key is same as this credential list's or not.
   */
  _findKeyItem(element) {
    return (element.access_key = this);
  }

  /**
   * Return backend.ai client elapsed time.
   *
   * @param {Date} start    - Start time of backend.ai client.
   * @param {Date} end      - End time of backend.ai client.
   * @return {string} days  - Elapsed days
   */
  _elapsed(start, end?) {
    const startDate = new Date(start);
    const endDate = this.condition == 'active' ? new Date() : new Date();
    const seconds = Math.floor(
      (endDate.getTime() - startDate.getTime()) / 1000,
    );
    const days = Math.floor(seconds / 86400);
    return days;
  }

  /**
   * Change d of any type to human readable date time.
   *
   * @param {Date} d   - string or DateTime object to convert
   * @return {Date}   - Formatted date / time to be human-readable text.
   */
  _humanReadableTime(d) {
    return new Date(d).toUTCString();
  }

  /**
   * Render an index.
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
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
   * If value includes unlimited contents, mark as unlimited.
   *
   * @param {string} value  - value to check
   * @return {string}       - Unlimited character is value is unlimited.
   */
  _markIfUnlimited(value) {
    if (['-', 0, 'Unlimited', Infinity, 'Infinity'].includes(value)) {
      return '∞';
    } else {
      return value;
    }
  }

  /**
   * Render a key elasped time.
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
  keyageRenderer(root, column?, rowData?) {
    render(
      html`
        <div class="layout vertical">
          <span>${rowData.item.elapsed} ${_t('credential.Days')}</span>
          <span class="indicator">(${rowData.item.created_at_formatted})</span>
        </div>
      `,
      root,
    );
  }

  /**
   * Render key control buttons.
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
  controlRenderer(root, column?, rowData?) {
    render(
      html`
        <div
          id="controls"
          class="layout horizontal flex center"
          .access-key="${rowData.item.access_key}"
          .user-id="${rowData.item.user_id}"
        >
          <mwc-icon-button
            class="fg green"
            icon="assignment"
            fab
            flat
            inverted
            @click="${(e) => this._showKeypairDetail(e)}"
          ></mwc-icon-button>
          <mwc-icon-button
            class="fg blue"
            icon="settings"
            fab
            flat
            inverted
            @click="${(e) => this._modifyResourcePolicy(e)}"
          ></mwc-icon-button>
          ${this.isAdmin && this._isActive()
            ? html`
                <mwc-icon-button
                  class="fg blue"
                  icon="delete"
                  fab
                  flat
                  inverted
                  @click="${(e) => this._revokeKey(e)}"
                ></mwc-icon-button>
              `
            : html``}
          ${this._isActive() === false
            ? html`
                <mwc-icon-button
                  class="fg blue"
                  icon="redo"
                  fab
                  flat
                  inverted
                  @click="${(e) => this._reuseKey(e)}"
                ></mwc-icon-button>
              `
            : html``}
          ${this.isAdmin && !this._isActive()
            ? html`
                <mwc-icon-button
                  class="fg red"
                  icon="delete_forever"
                  fab
                  ?disabled=${this._mainAccessKeyList.includes(
                    rowData.item?.access_key,
                  )}
                  flat
                  inverted
                  @click="${(e) => this._deleteKeyPairDialog(e)}"
                ></mwc-icon-button>
              `
            : html``}
        </div>
      `,
      root,
    );
  }

  /**
   * Render accesskey column according to configuration
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param rowData
   */
  accessKeyRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="vertical layout flex">
          <div class="monospace">${rowData.item.access_key}</div>
          ${this._mainAccessKeyList.includes(rowData.item?.access_key)
            ? html`
                <lablup-shields
                  app=""
                  color="darkgreen"
                  description="${_t('credential.MainAccessKey')}"
                  ui="flat"
                ></lablup-shields>
              `
            : html``}
        </div>
      `,
      root,
    );
  }

  /**
   * Render permission(role) column
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param rowData
   */
  permissionRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="layout horizontal center flex">
          ${rowData.item.is_admin
            ? html`
                <lablup-shields
                  app=""
                  color="red"
                  description="admin"
                  ui="flat"
                ></lablup-shields>
              `
            : html``}
          <lablup-shields app="" description="user" ui="flat"></lablup-shields>
        </div>
      `,
      root,
    );
  }

  /**
   * Render resourcePolicy column
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param rowData
   */
  resourcePolicyRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="layout horizontal wrap center">
          <span>${rowData.item.resource_policy}</span>
        </div>
        <div class="layout horizontal wrap center">
          <div class="layout horizontal configuration">
            <mwc-icon class="fg green">developer_board</mwc-icon>
            <span>${rowData.item.total_resource_slots.cpu}</span>
            <span class="indicator">${_t('general.cores')}</span>
          </div>
          <div class="layout horizontal configuration">
            <mwc-icon class="fg green">memory</mwc-icon>
            <span>${rowData.item.total_resource_slots.mem}</span>
            <span class="indicator">GiB</span>
          </div>
        </div>
        <div class="layout horizontal wrap center">
          ${rowData.item.total_resource_slots.cuda_device
            ? html`
                <div class="layout horizontal configuration">
                  <mwc-icon class="fg green">view_module</mwc-icon>
                  <span>${rowData.item.total_resource_slots.cuda_device}</span>
                  <span class="indicator">GPU</span>
                </div>
              `
            : html``}
          ${rowData.item.total_resource_slots.cuda_shares
            ? html`
                <div class="layout horizontal configuration">
                  <mwc-icon class="fg green">view_module</mwc-icon>
                  <span>${rowData.item.total_resource_slots.cuda_shares}</span>
                  <span class="indicator">fGPU</span>
                </div>
              `
            : html``}
        </div>
        ${!globalThis.backendaiclient.supports(
          'deprecated-max-vfolder-count-in-keypair-resource-policy',
        )
          ? html`
              <div class="layout horizontal wrap center">
                <div class="layout horizontal configuration">
                  <mwc-icon class="fg green">cloud_queue</mwc-icon>
                  <span>${rowData.item.max_vfolder_size}</span>
                  <span class="indicator">GB</span>
                </div>
              </div>
              <div class="layout horizontal configuration">
                <mwc-icon class="fg green">folder</mwc-icon>
                <span>${rowData.item.max_vfolder_count}</span>
                <span class="indicator">${_t('general.Folders')}</span>
              </div>
            `
          : html``}
        <!-- TODO: Display max_vfolder_count in user resource policy -->
      `,
      root,
    );
  }

  /**
   * Render allocation column
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param rowData
   */
  allocationRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="layout horizontal center flex">
          <div class="vertical start layout">
            <div style="font-size:11px;width:40px;">
              ${rowData.item.concurrency_used} /
              ${rowData.item.concurrency_limit}
            </div>
            <span class="indicator">Sess.</span>
          </div>
          <div class="vertical start layout">
            <span style="font-size:8px">
              ${rowData.item.rate_limit}
              <span class="indicator">req./15m.</span>
            </span>
            <span style="font-size:8px">
              ${rowData.item.num_queries}
              <span class="indicator">queries</span>
            </span>
          </div>
        </div>
      `,
      root,
    );
  }

  /**
   * Render userId according to configuration
   *
   * @param {DOMelement} root
   * @param {object} column
   * @param {object} rowData
   */
  userIdRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <span>${this._getUserId(rowData.item.user_id)}</span>
      `,
      root,
    );
  }

  _validateRateLimit() {
    // this._adjustRateLimit();
    const warningRateLimit = 100;
    const maximumRateLimit = 50000; // the maximum value of rate limit value

    this.rateLimit.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          this.rateLimit.validationMessage = _text(
            'credential.RateLimitInputRequired',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        } else if (nativeValidity.rangeOverflow) {
          this.rateLimit.value = newValue = maximumRateLimit.toString();
          this.rateLimit.validationMessage = _text(
            'credential.RateLimitValidation',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        } else if (nativeValidity.rangeUnderflow) {
          this.rateLimit.value = newValue = '1';
          this.rateLimit.validationMessage = _text(
            'credential.RateLimitValidation',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        } else {
          this.rateLimit.validationMessage = _text(
            'credential.InvalidRateLimitValue',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        }
      } else {
        if (
          newValue.length !== 0 &&
          !isNaN(Number(newValue)) &&
          Number(newValue) < warningRateLimit
        ) {
          this.rateLimit.validationMessage = _text(
            'credential.WarningLessRateLimit',
          );
          return {
            valid: !nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        }
        return {
          valid: nativeValidity.valid,
          customError: !nativeValidity.valid,
        };
      }
    };
  }

  openDialog(id) {
    (this.shadowRoot?.querySelector('#' + id) as BackendAIDialog).show();
  }

  closeDialog(id) {
    (this.shadowRoot?.querySelector('#' + id) as BackendAIDialog).hide();
  }

  /**
   * Save a keypair modification.
   *
   * @param {boolean} confirm - Save keypair info even if rateLimit is less the warningRateLimit if `confirm` is true.
   */
  _saveKeypairModification(confirm = false) {
    const resourcePolicy = this.policyListSelect.value;
    const rateLimit = Number(this.rateLimit.value);
    const warningRateLimit = 100;

    if (!this.rateLimit.checkValidity()) {
      if (rateLimit < warningRateLimit && confirm) {
        // Do nothing
      } else if (rateLimit < warningRateLimit && !confirm) {
        this.openDialog('keypair-confirmation');
        return;
      } else {
        return;
      }
    }

    let input = {};
    if (resourcePolicy !== this.keypairInfo.resource_policy) {
      input = { ...input, resource_policy: resourcePolicy };
    }
    if (rateLimit !== this.keypairInfo.rate_limit) {
      input = { ...input, rate_limit: rateLimit };
    }

    if (Object.entries(input).length === 0) {
      this.notification.text = _text('credential.NoChanges');
      this.notification.show();
    } else {
      globalThis.backendaiclient.keypair
        .mutate(this.keypairInfo.access_key, input)
        .then((res) => {
          if (res.modify_keypair.ok) {
            if (
              this.keypairInfo.resource_policy === resourcePolicy &&
              this.keypairInfo.rate_limit === rateLimit
            ) {
              this.notification.text = _text('credential.NoChanges');
            } else {
              this.notification.text = _text(
                'environment.SuccessfullyModified',
              );
            }
            this.refresh();
          } else {
            this.notification.text = _text('dialog.ErrorOccurred');
          }
          this.notification.show();
        });
    }
    this.closeDialog('keypair-modify-dialog');
  }

  _confirmAndSaveKeypairModification() {
    this.closeDialog('keypair-confirmation');
    this._saveKeypairModification(true);
  }

  /**
   * Adjust Rate Limit value below the maximum value (50000) and also upper than zero.
   *
   */
  _adjustRateLimit() {
    const maximumRateLimit = 50000; // the maximum value of rate limit value
    const rateLimit = Number(this.rateLimit.value);
    if (rateLimit > maximumRateLimit) {
      this.rateLimit.value = maximumRateLimit.toString();
    }
    if (rateLimit <= 0) {
      this.rateLimit.value = '1';
    }
  }

  /**
   * Convert the value bytes to GB with decimal point to 1 as a default
   *
   * @param {number} bytes
   * @param {number} decimalPoint decimal point set to 1 as a default
   * @return {string} converted value with fixed decimal point
   */
  static bytesToGB(bytes, decimalPoint = 1) {
    if (!bytes) return bytes;
    return (bytes / 10 ** 9).toFixed(decimalPoint);
  }

  /**
   * Get user id according to configuration
   *
   * @param {string} userId
   * @return {string}
   */
  _getUserId(userId = '') {
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

  /**
   * Get user access key according to configuration
   *
   * @param {string} accessKey
   * @return {string}
   */
  _getAccessKey(accessKey = '') {
    if (this.isUserInfoMaskEnabled) {
      const maskStartIdx = 4;
      const maskLength = accessKey.length - maskStartIdx;
      accessKey = globalThis.backendaiutils._maskString(
        accessKey,
        '*',
        maskStartIdx,
        maskLength,
      );
    }
    return accessKey;
  }

  render() {
    // language=HTML
    return html`
      <div class="list-wrapper">
        <vaadin-grid
          theme="row-stripes column-borders compact dark"
          aria-label="Credential list"
          id="keypair-grid"
          .items="${this.keypairs}"
        >
          <vaadin-grid-column
            width="40px"
            flex-grow="0"
            header="#"
            text-align="center"
            .renderer="${this._indexRenderer.bind(this)}"
          ></vaadin-grid-column>
          <lablup-grid-sort-filter-column
            path="user_id"
            auto-width
            header="${_t('credential.UserID')}"
            resizable
            .renderer="${this._boundUserIdRenderer}"
          ></lablup-grid-sort-filter-column>
          <lablup-grid-sort-filter-column
            path="access_key"
            auto-width
            header="${_t('general.AccessKey')}"
            resizable
            .renderer="${this._boundAccessKeyRenderer}"
          ></lablup-grid-sort-filter-column>
          <vaadin-grid-sort-column
            resizable
            header="${_t('credential.Permission')}"
            path="admin"
            .renderer="${this._boundPermissionRenderer}"
          ></vaadin-grid-sort-column>
          <vaadin-grid-sort-column
            auto-width
            resizable
            header="${_t('credential.KeyAge')}"
            path="created_at"
            .renderer="${this._boundKeyageRenderer}"
          ></vaadin-grid-sort-column>
          <vaadin-grid-column
            width="200px"
            resizable
            header="${_t('credential.ResourcePolicy')}"
            .renderer="${this._boundResourcePolicyRenderer}"
          ></vaadin-grid-column>
          <vaadin-grid-column
            auto-width
            resizable
            header="${_t('credential.Allocation')}"
            .renderer="${this._boundAllocationRenderer}"
          ></vaadin-grid-column>
          <vaadin-grid-column
            width="208px"
            resizable
            header="${_t('general.Control')}"
            .renderer="${this._boundControlRenderer}"
          ></vaadin-grid-column>
        </vaadin-grid>
        <backend-ai-list-status
          id="list-status"
          statusCondition="${this.listCondition}"
          message="${_text('credential.NoCredentialToDisplay')}"
        ></backend-ai-list-status>
      </div>
      <backend-ai-dialog id="delete-keypair-dialog" fixed backdrop>
        <span slot="title">${_t('dialog.title.LetsDouble-Check')}</span>
        <div slot="content">
          <p>
            You are deleting the credentials of user
            <span style="color:red">${this.deleteKeyPairUserName}</span>
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
            unelevated
            label="${_t('button.Okay')}"
            @click="${(e) => this._deleteKey(e)}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog
        id="keypair-info-dialog"
        fixed
        backdrop
        blockscrolling
        container="${document.body}"
      >
        <span slot="title">${_t('credential.KeypairDetail')}</span>
        <div slot="action" class="horizontal end-justified flex layout">
          ${this.keypairInfo.is_admin
            ? html`
                <lablup-shields
                  class="layout horizontal center"
                  app=""
                  color="red"
                  description="admin"
                  ui="flat"
                ></lablup-shields>
              `
            : html``}
          <lablup-shields
            class="layout horizontal center"
            app=""
            description="user"
            ui="flat"
          ></lablup-shields>
        </div>
        <div slot="content" class="intro">
          <div class="horizontal layout">
            <div style="width:335px;">
              <h4>${_t('credential.Information')}</h4>
              <div role="listbox" style="margin: 0;">
                <vaadin-item>
                  <div><strong>${_t('credential.UserID')}</strong></div>
                  <div secondary>${this.keypairInfo.user_id}</div>
                </vaadin-item>
                <vaadin-item>
                  <div><strong>${_t('general.AccessKey')}</strong></div>
                  <div secondary>${this.keypairInfo.access_key}</div>
                </vaadin-item>
                <vaadin-item>
                  <div><strong>${_t('general.SecretKey')}</strong></div>
                  <div secondary>${this.keypairInfo.secret_key}</div>
                </vaadin-item>
                <vaadin-item>
                  <div><strong>${_t('credential.Created')}</strong></div>
                  <div secondary>${this.keypairInfo.created_at}</div>
                </vaadin-item>
                <vaadin-item>
                  <div><strong>${_t('credential.Lastused')}</strong></div>
                  <div secondary>${this.keypairInfo.last_used}</div>
                </vaadin-item>
              </div>
            </div>
            <div style="width:335px;">
              <h4>${_t('credential.Allocation')}</h4>
              <div role="listbox" style="margin: 0;">
                <vaadin-item>
                  <div><strong>${_t('credential.ResourcePolicy')}</strong></div>
                  <div secondary>${this.keypairInfo.resource_policy}</div>
                </vaadin-item>
                <vaadin-item>
                  <div>
                    <strong>${_t('credential.NumberOfQueries')}</strong>
                  </div>
                  <div secondary>${this.keypairInfo.num_queries}</div>
                </vaadin-item>
                <vaadin-item>
                  <div>
                    <strong>${_t('credential.ConcurrentSessions')}</strong>
                  </div>
                  <div secondary>
                    ${this.keypairInfo.concurrency_used}
                    ${_t('credential.active')} /
                    ${this.keypairInfo.concurrency_used}
                    ${_t('credential.concurrentsessions')}.
                  </div>
                </vaadin-item>
                <vaadin-item>
                  <div><strong>${_t('credential.RateLimit')}</strong></div>
                  <div secondary>
                    ${this.keypairInfo.rate_limit}
                    ${_t('credential.for900seconds')}.
                  </div>
                </vaadin-item>
              </div>
            </div>
          </div>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog
        id="keypair-modify-dialog"
        fixed
        backdrop
        blockscrolling
      >
        <span slot="title">
          ${_t('credential.ModifyKeypairResourcePolicy')}
        </span>

        <div slot="content" class="vertical layout">
          <div class="vertical layout center-justified">
            <mwc-select
              id="policy-list"
              label="${_t('credential.SelectPolicy')}"
              fixedMenuPosition
            >
              ${Object.keys(this.resourcePolicy).map(
                (rp) => html`
                  <mwc-list-item value=${this.resourcePolicy[rp].name}>
                    ${this.resourcePolicy[rp].name}
                  </mwc-list-item>
                `,
              )}
            </mwc-select>
          </div>
          <div class="vertical layout center-justified">
            <mwc-textfield
              type="number"
              id="rate-limit"
              min="1"
              max="50000"
              label="${_t('credential.RateLimit')}"
              validationMessage="${_t('credential.RateLimitValidation')}"
              helper="${_t('credential.RateLimitValidation')}"
              @change="${() => this._validateRateLimit()}"
              value="${this.keypairInfo.rate_limit}"
            ></mwc-textfield>
          </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
            unelevated
            fullwidth
            id="keypair-modify-save"
            icon="check"
            label="${_t('button.SaveChanges')}"
            @click="${() => this._saveKeypairModification()}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="keypair-confirmation" warning fixed>
        <span slot="title">${_t('dialog.title.LetsDouble-Check')}</span>
        <div slot="content">
          <p>${_t('credential.WarningLessRateLimit')}</p>
          <p>${_t('dialog.ask.DoYouWantToProceed')}</p>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
            label="${_text('button.Cancel')}"
            @click="${(e) => this._hideDialog(e)}"
            style="width:auto;margin-right:10px;"
          ></mwc-button>
          <mwc-button
            unelevated
            label="${_text('button.DismissAndProceed')}"
            @click="${() => this._confirmAndSaveKeypairModification()}"
            style="width:auto;"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-credential-list': BackendAICredentialList;
  }
}
