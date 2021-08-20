/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultArray, CSSResultOrNative, customElement, html, property} from 'lit-element';

import {render} from 'lit-html';
import {BackendAIPage} from './backend-ai-page';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-filter-column';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
import '@vaadin/vaadin-icons/vaadin-icons';
import '@vaadin/vaadin-item/vaadin-item';

import '@material/mwc-textfield/mwc-textfield';
import '@material/mwc-button/mwc-button';
import '@material/mwc-select/mwc-select';
import '@material/mwc-list/mwc-list-item';

import './backend-ai-list-status';
import './backend-ai-dialog';
import '../plastics/lablup-shields/lablup-shields';

import {default as PainKiller} from './backend-ai-painkiller';
import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

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
  @property({type: Object}) notification;
  @property({type: Object}) keypairInfo = {
    user_id: '1',
    access_key: 'ABC',
    secret_key: 'ABC',
    last_used: '',
    is_admin: false,
    resource_policy: '',
    rate_limit: 5000,
    concurrency_used: 0,
    num_queries: 0,
    created_at: ''
  };
  @property({type: Boolean}) isAdmin = false;
  @property({type: String}) condition = 'active';
  @property({type: Object}) list_status;
  @property({type: Object}) keypairs = Object();
  @property({type: Object}) resourcePolicy = Object();
  @property({type: Object}) indicator = Object();
  @property({type: Object}) _boundKeyageRenderer = this.keyageRenderer.bind(this);
  @property({type: Object}) _boundControlRenderer = this.controlRenderer.bind(this);
  @property({type: Object}) keypairGrid = Object();
  @property({type: String}) list_condition = 'loading';

  constructor() {
    super();
  }

  static get styles(): CSSResultOrNative | CSSResultArray {
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

        div.indicator,
        span.indicator {
          font-size: 9px;
          margin-right: 5px;
        }

        div.configuration {
          width: 70px !important;
        }

        div.configuration mwc-icon {
          padding-right: 5px;
        }

        #keypair-modify-save {
          --button-bg: var(--paper-light-green-50);
          --button-bg-hover: var(--paper-green-100);
          --button-bg-active: var(--paper-green-600);
        }

        #policy-list {
          width: 100%;
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
          border-bottom: 1px solid #DDD;
        }

        mwc-button, mwc-button[unelevated], mwc-button[outlined] {
          background-image: none;
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-on-theme-primary: var(--general-button-background-color);
          --mdc-typography-font-family: var(--general-font-family);
        }

        mwc-select {
          --mdc-theme-primary: var(--general-sidebar-color);
        }
      `];
  }

  firstUpdated() {
    this.list_status = this.shadowRoot.querySelector('#list-status');
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
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._refreshKeyData();
        this.isAdmin = globalThis.backendaiclient.is_admin;
        this.keypairGrid = this.shadowRoot.querySelector('#keypair-grid');
      }, true);
    } else { // already connected
      this._refreshKeyData();
      this.isAdmin = globalThis.backendaiclient.is_admin;
      this.keypairGrid = this.shadowRoot.querySelector('#keypair-grid');
    }
  }

  /**
   * Refresh key datas when user id is null.
   *
   * @param {string} user_id
   * @return {void}
   */
  _refreshKeyData(user_id: null|string = null) {
    let is_active = true;
    switch (this.condition) {
    case 'active':
      is_active = true;
      break;
    default:
      is_active = false;
    }
    this.list_condition = 'loading';
    this.list_status.show();
    return globalThis.backendaiclient.resourcePolicy.get().then((response) => {
      const rp = response.keypair_resource_policies;
      this.resourcePolicy = globalThis.backendaiclient.utils.gqlToObject(rp, 'name');
    }).then(() => {
      const fields = ['access_key', 'is_active', 'is_admin', 'user_id', 'created_at', 'last_used',
        'concurrency_limit', 'concurrency_used', 'rate_limit', 'num_queries', 'resource_policy'];
      return globalThis.backendaiclient.keypair.list(user_id, fields, is_active);
    }).then((response) => {
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
              keypair['total_resource_slots'] = JSON.parse(this.resourcePolicy[keypair.resource_policy][k]);
            }
          }
          keypair['created_at_formatted'] = this._humanReadableTime(keypair['created_at']);
          keypair['elapsed'] = this._elapsed(keypair['created_at']);
          if ('cpu' in keypair['total_resource_slots']) {
          } else if (keypair['default_for_unspecified'] === 'UNLIMITED') {
            keypair['total_resource_slots'].cpu = '-';
          }
          if ('mem' in keypair['total_resource_slots']) {
            keypair['total_resource_slots'].mem = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(keypair['total_resource_slots'].mem, 'g'));
            // keypair['total_resource_slots'].mem = parseFloat(keypair['total_resource_slots'].mem);
          } else if (keypair['default_for_unspecified'] === 'UNLIMITED') {
            keypair['total_resource_slots'].mem = '-';
          }
          if ('cuda.device' in keypair['total_resource_slots']) {
            keypair['total_resource_slots'].cuda_device = keypair['total_resource_slots']['cuda.device'];
          }
          if ('cuda.shares' in keypair['total_resource_slots']) {
            keypair['total_resource_slots'].cuda_shares = keypair['total_resource_slots']['cuda.shares'];
          }
          if (('cuda_device' in keypair['total_resource_slots']) === false &&
            ('cuda_shares' in keypair['total_resource_slots']) === false &&
            keypair['default_for_unspecified'] === 'UNLIMITED') {
            keypair['total_resource_slots'].cuda_shares = '-';
            keypair['total_resource_slots'].cuda_device = '-';
          }
          if ('rocm.device' in keypair['total_resource_slots']) {
            keypair['total_resource_slots'].rocm_device = keypair['total_resource_slots']['rocm.device'];
          }

          if (('rocm_device' in keypair['total_resource_slots']) === false &&
            keypair['default_for_unspecified'] === 'UNLIMITED') {
            keypair['total_resource_slots'].rocm_device = '-';
          }
          if ('tpu.device' in keypair['total_resource_slots']) {
            keypair['total_resource_slots'].tpu_device = keypair['total_resource_slots']['tpu.device'];
          }
          if (('tpu_device' in keypair['total_resource_slots']) === false &&
            keypair['default_for_unspecified'] === 'UNLIMITED') {
            keypair['total_resource_slots'].tpu_device = '-';
          }
          ['cpu', 'mem', 'cuda_shares', 'cuda_device', 'rocm_device', 'tpu_device'].forEach((slot) => {
            keypair['total_resource_slots'][slot] = this._markIfUnlimited(keypair['total_resource_slots'][slot]);
          });
        }
      });
      this.keypairs = keypairs;
      if (this.keypairs.length == 0) {
        this.list_condition = 'no-data';
      } else {
        this.list_status.hide();
      }
      // setTimeout(() => { this._refreshKeyData(status) }, 5000);
    }).catch((err) => {
      this.list_status.hide();
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
      this.shadowRoot.querySelector('#keypair-info-dialog').show();
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

      this.shadowRoot.querySelector('#policy-list').value = this.keypairInfo.resource_policy;

      this.shadowRoot.querySelector('#keypair-modify-dialog').show();
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
    const fields = ['access_key', 'secret_key', 'is_active', 'is_admin', 'user_id', 'created_at', 'last_used',
      'concurrency_limit', 'concurrency_used', 'rate_limit', 'num_queries', 'resource_policy'];
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
   * Delete the access key.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  _deleteKey(e) {
    const controls = e.target.closest('#controls');
    const accessKey = controls['access-key'];
    globalThis.backendaiclient.keypair.delete(accessKey).then((response) => {
      if (response.delete_keypair && !response.delete_keypair.ok) {
        throw new UnableToDeleteKeypairException(response.delete_keypair.msg);
      }
      this.refresh();
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
  _mutateKey(e, is_active) {
    const controls = e.target.closest('#controls');
    const accessKey = controls['access-key'];
    const original = this.keypairs.find(this._findKeyItem, accessKey);
    const input = {
      'is_active': is_active,
      'is_admin': original.is_admin,
      'resource_policy': original.resource_policy,
      'rate_limit': original.rate_limit,
      'concurrency_limit': original.concurrency_limit,
    };
    globalThis.backendaiclient.keypair.mutate(accessKey, input).then((response) => {
      const event = new CustomEvent('backend-ai-credential-refresh', {'detail': this});
      document.dispatchEvent(event);
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
   * Find the access key.
   *
   * @param {Record<string, unknown>} element
   * @return {boolean} - Return whether the access key is same as this credential list's or not.
   */
  _findKeyItem(element) {
    return element.access_key = this;
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
    const seconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
    const days = Math.floor(seconds / 86400);
    return days;
  }

  /**
   * Change d of any type to human readable date time.
   *
   * @param {any} d   - string or DateTime object to convert
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
      root
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
      `, root
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
            <div id="controls" class="layout horizontal flex center"
                 .access-key="${rowData.item.access_key}">
              <mwc-icon-button class="fg green" icon="assignment" fab flat inverted @click="${(e) => this._showKeypairDetail(e)}">
              </mwc-icon-button>
              <mwc-icon-button class="fg blue" icon="settings" fab flat inverted @click="${(e) => this._modifyResourcePolicy(e)}">
              </mwc-icon-button>
              ${this.isAdmin && this._isActive() ? html`
                <mwc-icon-button class="fg blue" icon="delete" fab flat inverted @click="${(e) => this._revokeKey(e)}">
                </mwc-icon-button>
                <mwc-icon-button class="fg red" icon="delete_forever" fab flat inverted @click="${(e) => this._deleteKey(e)}">
                </mwc-icon-button>
              ` : html``}
              ${this._isActive() === false ? html`
                <mwc-icon-button class="fg blue" icon="redo" fab flat inverted @click="${(e) => this._reuseKey(e)}">
                </mwc-icon-button>
              ` : html``}
            </div>
      `, root
    );
  }

  /**
   * Save a keypair modification.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  _saveKeypairModification(e) {
    const resource_policy = this.shadowRoot.querySelector('#policy-list').value;
    const rate_limit_element = this.shadowRoot.querySelector('#rate-limit');
    const rate_limit = rate_limit_element.value;

    if (!rate_limit_element.checkValidity()) {
      return;
    }

    let input = {};
    if (resource_policy !== this.keypairInfo.resource_policy) {
      input = {...input, resource_policy};
    }
    if (rate_limit !== this.keypairInfo.rate_limit) {
      input = {...input, rate_limit};
    }

    if (Object.entries(input).length === 0) {
      this.notification.text = _text('credential.NoChanges');
      this.notification.show();
    } else {
      globalThis.backendaiclient.keypair.mutate(this.keypairInfo.access_key, input)
        .then((res) => {
          if (res.modify_keypair.ok) {
            if (this.keypairInfo.resource_policy === resource_policy && this.keypairInfo.rate_limit === parseInt(rate_limit)) {
              this.notification.text = _text('credential.NoChanges');
            } else {
              this.notification.text = _text('environment.SuccessfullyModified');
            }
            this.refresh();
          } else {
            this.notification.text = _text('dialog.ErrorOccurred');
          }
          this.notification.show();
        });
    }

    this._hideDialog(e);
  }

  /**
   * Adjust Rate Limit value below the maximum value (50000) and also upper than zero.
   *
   */
  _adjustRateLimit() {
    const maximum_rate_limit = 50000; // the maximum value of rate limit value
    const rate_limit = this.shadowRoot.querySelector('#rate-limit').value;
    if (rate_limit > maximum_rate_limit) {
      this.shadowRoot.querySelector('#rate-limit').value = maximum_rate_limit;
    }
    if (rate_limit <= 0 ) {
      this.shadowRoot.querySelector('#rate-limit').value = 1;
    }
  }

  render() {
    // language=HTML
    return html`
      <div class="list-wrapper">
        <vaadin-grid theme="row-stripes column-borders compact" aria-label="Credential list" height-by-rows
                     id="keypair-grid" .items="${this.keypairs}">
          <vaadin-grid-column width="40px" flex-grow="0" header="#" text-align="center" .renderer="${this._indexRenderer.bind(this)}"></vaadin-grid-column>

          <vaadin-grid-filter-column path="user_id" header="${_t('credential.UserID')}" resizable></vaadin-grid-filter-column>
          <vaadin-grid-filter-column path="access_key" header="${_t('general.AccessKey')}" resizable>
            <template>
              <div class="monospace">[[item.access_key]]</div>
            </template>
          </vaadin-grid-filter-column>

          <vaadin-grid-column resizable>
            <template class="header">
              <vaadin-grid-sorter path="is_admin">${_t('credential.Permission')}</vaadin-grid-sorter>
            </template>
            <template>
              <div class="layout horizontal center flex">
                <template is="dom-if" if="[[item.is_admin]]">
                  <lablup-shields app="" color="red" description="admin" ui="flat"></lablup-shields>
                </template>
                <lablup-shields app="" description="user" ui="flat"></lablup-shields>
              </div>
            </template>
          </vaadin-grid-column>

          <vaadin-grid-sort-column resizable header="${_t('credential.KeyAge')}" path="created_at" .renderer="${this._boundKeyageRenderer}">
          </vaadin-grid-sort-column>

          <vaadin-grid-column width="150px" resizable>
            <template class="header">${_t('credential.ResourcePolicy')}</template>
            <template>
              <div class="layout horizontal wrap center">
                <span>[[item.resource_policy]]</span>
              </div>
              <div class="layout horizontal wrap center">
                <div class="layout horizontal configuration">
                  <mwc-icon class="fg green">developer_board</mwc-icon>
                  <span>[[item.total_resource_slots.cpu]]</span>
                  <span class="indicator">${_t('general.cores')}</span>
                </div>
                <div class="layout horizontal configuration">
                  <mwc-icon class="fg green">memory</mwc-icon>
                  <span>[[item.total_resource_slots.mem]]</span>
                  <span class="indicator">GB</span>
                </div>
              </div>
              <div class="layout horizontal wrap center">
                <template is="dom-if" if="[[item.total_resource_slots.cuda_device]]">
                  <div class="layout horizontal configuration">
                    <mwc-icon class="fg green">view_module</mwc-icon>
                    <span>[[item.total_resource_slots.cuda_device]]</span>
                    <span class="indicator">GPU</span>
                  </div>
                </template>
                <template is="dom-if" if="[[item.total_resource_slots.cuda_shares]]">
                  <div class="layout horizontal configuration">
                    <mwc-icon class="fg green">view_module</mwc-icon>
                    <span>[[item.total_resource_slots.cuda_shares]]</span>
                    <span class="indicator">fGPU</span>
                  </div>
                </template>
              </div>
              <div class="layout horizontal wrap center">
                <div class="layout horizontal configuration">
                  <mwc-icon class="fg green">cloud_queue</mwc-icon>
                  <span>[[item.max_vfolder_size]]</span>
                  <span class="indicator">GB</span>
                </div>
                <div class="layout horizontal configuration">
                  <mwc-icon class="fg green">folder</mwc-icon>
                  <span>[[item.max_vfolder_count]]</span>
                  <span class="indicator">${_t('general.Folders')}</span>
                </div>
              </div>
            </template>
          </vaadin-grid-column>

          <vaadin-grid-column resizable>
            <template class="header">${_t('credential.Allocation')}</template>
            <template>
              <div class="layout horizontal center flex">
                <div class="vertical start layout">
                  <div style="font-size:11px;width:40px;">[[item.concurrency_used]] /
                    [[item.concurrency_limit]]
                  </div>
                  <span class="indicator">Sess.</span>
                </div>
                <div class="vertical start layout">
                  <span style="font-size:8px">[[item.rate_limit]] <span class="indicator">req./15m.</span></span>
                  <span style="font-size:8px">[[item.num_queries]] <span class="indicator">queries</span></span>
                </div>
              </div>
            </template>
          </vaadin-grid-column>
          <vaadin-grid-column width="150px" resizable header="${_t('general.Control')}" .renderer="${this._boundControlRenderer}">
          </vaadin-grid-column>
        </vaadin-grid>
        <backend-ai-list-status id="list-status" status_condition="${this.list_condition}" message="${_text('credential.NoCredentialToDisplay')}"></backend-ai-list-status>
      </div>
      <backend-ai-dialog id="keypair-info-dialog" fixed backdrop blockscrolling container="${document.body}">
        <span slot="title">Keypair Detail</span>
        <div slot="action" class="horizontal end-justified flex layout">
        ${this.keypairInfo.is_admin ? html`
          <lablup-shields app="" color="red" description="admin" ui="flat"></lablup-shields>
          ` : html``}
          <lablup-shields app="" description="user" ui="flat"></lablup-shields>
        </div>
        <div slot="content" class="intro">
          <div class="horizontal layout">
            <div style="width:335px;">
              <h4>${_t('credential.Information')}</h4>
              <div role="listbox" style="margin: 0;">
                <vaadin-item>
                  <div><strong>User ID</strong></div>
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
                  <div><strong>${_t('credential.NumberOfQueries')}</strong></div>
                  <div secondary>${this.keypairInfo.num_queries}</div>
                </vaadin-item>
                <vaadin-item>
                  <div><strong>${_t('credential.ConcurrentSessions')}</strong></div>
                  <div secondary>${this.keypairInfo.concurrency_used} ${_t('credential.active')} /
                    ${this.keypairInfo.concurrency_used} ${_t('credential.concurrentsessions')}.
                  </div>
                </vaadin-item>
                <vaadin-item>
                  <div><strong>${_t('credential.RateLimit')}</strong></div>
                  <div secondary>${this.keypairInfo.rate_limit} ${_t('credential.for900seconds')}.</div>
                </vaadin-item>
              </div>
            </div>
          </div>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="keypair-modify-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t('credential.ModifyKeypairResourcePolicy')}</span>

        <div slot="content" class="vertical layout">
          <div class="vertical layout center-justified">
              <mwc-select
                  id="policy-list"
                  label="${_t('credential.SelectPolicy')}">
                  ${Object.keys(this.resourcePolicy).map((rp) =>
    html`
                      <mwc-list-item value=${this.resourcePolicy[rp].name}>
                        ${this.resourcePolicy[rp].name}
                      </mwc-list-item>`
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
                @change=${() => this._adjustRateLimit()}
                value="${this.keypairInfo.rate_limit}"></mwc-textfield>
          </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
              unelevated
              fullwidth
              id="keypair-modify-save"
              icon="check"
              label="${_t('button.SaveChanges')}"
              @click="${(e) => this._saveKeypairModification(e)}"></mwc-button>
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
