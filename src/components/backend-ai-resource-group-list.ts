/**
 @license
 Copyright (c) 2015-2018 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html, render} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {BackendAIPage} from './backend-ai-page';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-column';
import '@vaadin/vaadin-item/vaadin-item';

import '../plastics/lablup-shields/lablup-shields';

import 'weightless/button';
import 'weightless/card';
import 'weightless/icon';
import 'weightless/label';
import 'weightless/select';
import 'weightless/switch';
import 'weightless/textarea';
import 'weightless/textfield';
import 'weightless/title';
import {Expansion} from 'weightless/expansion';

import {Switch} from '@material/mwc-switch/mwc-switch';
import '@material/mwc-button/mwc-button';
import {Select} from '@material/mwc-select/mwc-select';
import '@material/mwc-list/mwc-list-item';
import {TextField} from '@material/mwc-textfield/mwc-textfield';
import {TextArea} from '@material/mwc-textarea/mwc-textarea';

import './backend-ai-dialog';
import {default as PainKiller} from './backend-ai-painkiller';
import {BackendAiStyles} from './backend-ai-general-styles';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type BackendAIDialog = HTMLElementTagNameMap['backend-ai-dialog'];

/**
 Backend AI Resource Group List

 `backend-ai-resource-group-list` manages resource group(scaling group).

 Example:

 <backend-ai-resource-group-list active></backend-ai-resource-group-list>

@group Backend.AI Web UI
 @element backend-ai-resource-group-list
 */

@customElement('backend-ai-resource-group-list')
export default class BackendAIResourceGroupList extends BackendAIPage {
  @property({type: Object}) _boundControlRenderer = this._controlRenderer.bind(this);
  @property({type: Array}) domains;
  @property({type: Object}) resourceGroupInfo;
  @property({type: Array}) resourceGroups;
  @property({type: Array}) schedulerTypes;
  @property({type: Object}) schedulerOpts;
  @property({type: Object}) allowedSessionTypesObjects = {
    'interactive': 'interactive',
    'batch': 'batch',
    'both': 'both (interactive, batch)'
  };
  @property({type: Boolean}) enableSchedulerOpts = false;
  @property({type: Boolean}) enableWSProxyAddr = false;
  @property({type: Number}) functionCount = 0;
  @query('#resource-group-name') resourceGroupNameInput!: TextField;
  @query('#resource-group-description') resourceGroupDescriptionInput!: TextArea;
  @query('#resource-group-domain') resourceGroupDomainSelect!: Select;
  @query('#resource-group-scheduler') resourceGroupSchedulerSelect!: Select;
  @query('#resource-group-active') resourceGroupActiveSwitch!: Switch;
  @query('#resource-group-wsproxy-address') resourceGroupWSProxyaddressInput!: TextField;
  @query('#allowed-session-types') allowedSessionTypesSelect!: Select;
  @query('#num-retries-to-skip') numberOfRetriesToSkip!: TextField;
  @query('#pending-timeout') timeoutInput!: TextField;
  @query('#delete-resource-group') deleteResourceGroupInput!: TextField;

  constructor() {
    super();
    this.active = false;
    this.schedulerTypes = ['fifo', 'lifo', 'drf'];
    this.resourceGroups = [];
    this.resourceGroupInfo = {};
    this.domains = [];
  }

  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        h4 {
          font-weight: 200;
          font-size: 14px;
          margin: 0px;
          padding: 5px 15px 5px 20px;
        }

        wl-button {
          --button-bg: var(--paper-light-blue-50);
          --button-bg-hover: var(--paper-blue-100);
          --button-bg-active: var(--paper-blue-600);
        }

        wl-button.delete {
          --button-bg: var(--paper-red-50);
          --button-bg-hover: var(--paper-red-100);
          --button-bg-active: var(--paper-red-600);
          margin-top: 20px;
        }

        backend-ai-dialog {
          --component-min-width: 350px;
        }

        backend-ai-dialog wl-textarea,
        backend-ai-dialog wl-select {
          margin-bottom: 20px;
          --input-font-family: var(--general-font-family);
        }

        backend-ai-dialog mwc-textfield,
        backend-ai-dialog mwc-textarea {
          width: 100%;
          margin: 5px auto 5px auto;
          --mdc-typography-font-family: var(--general-font-family);
          --mdc-theme-primary: var(--general-textfield-selected-color);
        }

        backend-ai-dialog wl-label {
          --label-font-family: 'Ubuntu', Roboto;
          --label-color: #282828;
          margin-bottom: 5px;
        }

        backend-ai-dialog wl-switch {
          margin-bottom: 20px;
          --switch-color-checked: #29b6f6;
          --switch-bg-checked: #bbdefb;
        }

        wl-select {
          --input-color-disabled: #222;
          --input-label-color-disabled: #222;
          --input-label-font-size: 12px;
          --input-border-style-disabled: 1px solid #ccc;
        }

        mwc-button[outlined] {
          width: 100%;
          margin: 10px auto;
          background-image: none;
          --mdc-button-outline-width: 2px;
          --mdc-theme-primary: #38bd73;
          --mdc-theme-on-primary: #38bd73;
        }

        mwc-textarea {
          height: 135px;
        }

        mwc-select {
          width:100%;
          --mdc-typography-font-family: var(--general-font-family);
          --mdc-theme-primary: var(--general-textfield-selected-color);
          --mdc-select-fill-color: transparent;
        }

        mwc-list-item {
          --mdc-menu-item-height: 20px;
        }

        #resource-group-detail-dialog {
          --component-width: 500px;
        }

        #resource-group-dialog {
          --component-width: 350px;
        }

        wl-expansion {
          --expansion-content-padding: 2px;
          --expansion-elevation: 0;
          --expansion-elevation-open: 0;
          --expansion-elevation-hover: 0;
          --expansion-header-padding: 16px;
          --expansion-margin-open: 0;
        }

        backend-ai-dialog h4 {
          font-weight: 700;
          font-size: 14px;
          padding: 5px 15px 5px 12px;
          margin: 0 0 10px 0;
          display: block;
          height: 20px;
          border-bottom: 1px solid #DDD;
        }

        vaadin-grid {
          border: 0;
          font-size: 14px;
          height: var(--list-height, calc(100vh - 246px));
        }

        vaadin-item {
          padding: 5px 17px 5px 17px;
          font-size: 12px;
          font-weight: 100;
        }

        .scheduler-option-value {
          font-size: 16px;
          font-weight: 700;
        }

        #resource-group-detail-dialog wl-textarea {
          margin-bottom: 0px;
          --input-border-width: 0;
          --input-padding-top-bottom: 0px;
          --input-padding-left-right: 12px;
          --input-font-size: 0.75rem;
          --textarea-height: 100px;
        }
      `
    ];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    // If disconnected
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.enableSchedulerOpts = globalThis.backendaiclient.supports('scheduler-opts');
        this.enableWSProxyAddr = globalThis.backendaiclient.supports('wsproxy-addr');
        globalThis.backendaiclient.scalingGroup.list_available()
          .then((res) => {
            this.resourceGroups = res.scaling_groups;
          }).catch((err) => {
            this.notification.text = PainKiller.relieve(err.title);
            this.notification.detail = err.message;
            this.notification.show(true, err);
          });

        globalThis.backendaiclient.domain.list()
          .then(({domains}) => {
            this.domains = domains;
            this.requestUpdate(); // without this render is called beforehands, so update is required
          }).catch((err) => {
            this.notification.text = PainKiller.relieve(err.title);
            this.notification.detail = err.message;
            this.notification.show(true, err);
          });
      }, true);
    } else { // already connected
      this.enableSchedulerOpts = globalThis.backendaiclient.supports('scheduler-opts');
      this.enableWSProxyAddr = globalThis.backendaiclient.supports('wsproxy-addr');

      globalThis.backendaiclient.scalingGroup.list_available()
        .then((res) => {
          this.resourceGroups = res.scaling_groups;
        }).catch((err) => {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        });

      globalThis.backendaiclient.domain.list()
        .then(({domains}) => {
          this.domains = domains;
          this.requestUpdate(); // without this render is called beforehands, so update is required
        }).catch((err) => {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        });
    }
  }

  _activeStatusRenderer(root, column, rowData) {
    render(
      html`
        <lablup-shields
          app=""
          color=${rowData.item.is_active ? 'green' : 'red'}
          description=${rowData.item.is_active ? 'active' : 'inactive'}
          ui="flat"
        ></lablup-shields>
    `,
      root
    );
  }

  _indexRenderer(root, column, rowData) {
    const idx = rowData.index + 1;
    render(
      html`
        <div>${idx}</div>
      `,
      root
    );
  }

  _launchDialogById(id: string) {
    (this.shadowRoot?.querySelector(id) as BackendAIDialog).show();
  }

  _hideDialogById(id: string) {
    (this.shadowRoot?.querySelector(id) as BackendAIDialog).hide();
  }

  /**
   * Render control units - settings (resource-group), delete (delete-resource-group)
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  _controlRenderer(root, column?, rowData?) {
    render(
      html`
        <div id="controls" class="layout horizontal flex center">
          <wl-button fab flat inverted
            class="fg green"
            @click=${() => this._launchDetailDialog(rowData.item)}
          ><wl-icon>assignment</wl-icon></wl-button>
          <wl-button fab flat inverted
            class="fg blue"
            @click=${() => this._launchModifyDialog(rowData.item)}
          ><wl-icon>settings</wl-icon></wl-button>
          <wl-button fab flat inverted
            class="fg red"
            @click=${() => this._launchDeleteDialog(rowData.item)}
          ><wl-icon>delete</wl-icon></wl-button>
        </div>
      `, root
    );
  }

  _validateResourceGroupName() {
    const resourceGroupNames = this.resourceGroups.map((resourceGroup) => resourceGroup['name']);
    this.resourceGroupNameInput.validityTransform = (value, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          this.resourceGroupNameInput.validationMessage = _text('resourceGroup.ResourceGroupNameRequired');
          return {
            valid: nativeValidity.valid,
            valueMissing: !nativeValidity.valid
          };
        } else {
          this.resourceGroupNameInput.validationMessage = _text('resourceGroup.EnterValidResourceGroupName');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        }
      } else {
        const isValid = !resourceGroupNames.includes(value);
        if (!isValid) {
          this.resourceGroupNameInput.validationMessage = _text('resourceGroup.ResourceGroupAlreadyExist');
        }
        return {
          valid: isValid,
          customError: !isValid
        };
      }
    };
  }

  /**
   * Create resource group(scaling group) and associate resource group(scaling group) with domain.
   * */
  _createResourceGroup() {
    if (this.resourceGroupNameInput.checkValidity() && this._verifyCreateSchedulerOpts()) {
      this._saveSchedulerOpts();
      const resourceGroupName = this.resourceGroupNameInput.value;
      const description = this.resourceGroupDescriptionInput.value;
      const domain = this.resourceGroupDomainSelect.value;
      const input = {
        description: description,
        is_active: true,
        driver: 'static',
        driver_opts: '{}',
        scheduler: 'fifo',
      };

      if (this.enableSchedulerOpts) {
        input['scheduler_opts'] = JSON.stringify(this.schedulerOpts);
      }
      if (this.enableWSProxyAddr) {
        const wsproxyAddress = this.resourceGroupWSProxyaddressInput.value;
        input['wsproxy_addr'] = wsproxyAddress;
      }
      globalThis.backendaiclient.scalingGroup.create(resourceGroupName, input)
        .then(({create_scaling_group: res}) => {
          if (res.ok) {
            return globalThis.backendaiclient.scalingGroup.associate_domain(domain, resourceGroupName);
          } else {
            /* error message will be handled in catch statement */
            // this.notification.text = PainKiller.relieve(res.title);
            // this.notification.detail = res.msg;
            // this.notification.show();
            return Promise.reject(res.msg);
          }
        })
        .then(({associate_scaling_group_with_domain: res}) => {
          if (res.ok) {
            this.notification.text = _text('resourceGroup.ResourceGroupCreated');
            this._refreshList();
            this.resourceGroupNameInput.value = '';
            this.resourceGroupDescriptionInput.value = '';
          } else {
            this.notification.text = PainKiller.relieve(res.title);
            this.notification.detail = res.msg;
          }
          this._hideDialogById('#resource-group-dialog');
          this.notification.show();
        })
        .catch((err) => {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err;
          this._hideDialogById('#resource-group-dialog');
          this.notification.show(true, err);
        });
    } else {
      // ResourceGroupNameEl.reportValidity();
      return;
    }
  }

  /**
   * Modify resource group(scaling group) such as description, scheduler, is_active, and name.
   * */
  _modifyResourceGroup() {
    if (this._verifyModifySchedulerOpts() === false) {
      return;
    }
    this._saveSchedulerOpts();
    const scheduler = this.resourceGroupSchedulerSelect.value;
    const is_active = this.resourceGroupActiveSwitch.selected;
    const schedulerOptions = this.schedulerOpts;
    const name = this.resourceGroupInfo.name;

    const input = {};
    if (this.resourceGroupDescriptionInput !== this.resourceGroupInfo.description) input['description'] = this.resourceGroupDescriptionInput;
    if (scheduler !== this.resourceGroupInfo.scheduler) input['scheduler'] = scheduler;
    if (is_active !== this.resourceGroupInfo.is_active) input['is_active'] = is_active;
    if (this.enableWSProxyAddr) {
      let wsproxy_addr: string = this.resourceGroupWSProxyaddressInput.value;
      if (wsproxy_addr.endsWith('/')) {
        wsproxy_addr = wsproxy_addr.slice(0, wsproxy_addr.length - 1);
      }
      if (wsproxy_addr !== this.resourceGroupInfo.wsproxy_addr) input['wsproxy_addr'] = wsproxy_addr;
    }

    if (this.enableSchedulerOpts) {
      if (schedulerOptions !== this.resourceGroupInfo.scheduler_opts) {
        input['scheduler_opts'] = JSON.stringify(schedulerOptions);
      }
    }

    if (Object.keys(input).length === 0) {
      this.notification.text = _text('resourceGroup.NochangesMade');
      this.notification.show();
      return;
    }

    globalThis.backendaiclient.scalingGroup.update(name, input)
      .then(({modify_scaling_group}) => {
        if (modify_scaling_group.ok) {
          this.notification.text = _text('resourceGroup.ResourceGroupModified');
          this._refreshList();
        } else {
          this.notification.text = PainKiller.relieve(modify_scaling_group.msg);
          this.notification.detail = modify_scaling_group.msg;
        }
        this._hideDialogById('#resource-group-dialog');
        this.notification.show();
      });
  }

  _deleteResourceGroup() {
    const name = this.resourceGroupInfo.name;
    if (this.deleteResourceGroupInput.value !== name) {
      this.notification.text = _text('resourceGroup.ResourceGroupNameNotMatch');
      this._hideDialogById('#delete-resource-group-dialog');
      this.notification.show();
      return;
    }

    globalThis.backendaiclient.scalingGroup.delete(name)
      .then(({delete_scaling_group}) => {
        if (delete_scaling_group.ok) {
          this.notification.text = _text('resourceGroup.ResourceGroupDeleted');
          this._refreshList();
          this.deleteResourceGroupInput.value = '';
        } else {
          this.notification.text = PainKiller.relieve(delete_scaling_group.msg);
          this.notification.detail = delete_scaling_group.msg;
        }

        this._hideDialogById('#delete-resource-group-dialog');
        this.notification.show();
      });
  }

  _refreshList() {
    globalThis.backendaiclient.scalingGroup.list_available()
      .then(({scaling_groups}) => {
        this.resourceGroups = scaling_groups;
        this.requestUpdate(); // without this render is called beforehands, so update is required
      });
  }

  /**
   * reset all value to default in scheduler option input form in create dialog.
   * */
  _initializeCreateSchedulerOpts() {
    const schedulerOptsInputForms = this.shadowRoot?.querySelector('#scheduler-options-input-form') as Expansion;

    this.allowedSessionTypesSelect.value= 'both';
    schedulerOptsInputForms.checked = false;
    if (this.timeoutInput?.value) {
      this.timeoutInput.value = '';
    }
    if (this.numberOfRetriesToSkip?.value) {
      this.numberOfRetriesToSkip.value = '';
    }
  }

  /**
   * set the values of selected resource group(scaling group) to scheduler option input form in modify dialog.
   *
   * @param {String} name - scheduler option key in selected resource group(scaling group)
   * @param {Any} value - scheduler option value in selected resource group(scaling group)
   * */
  _initializeModifySchedulerOpts(name = '', value: any) {
    if ('allowed_session_types' === name) {
      if (value.includes('interactive') && value.includes('batch')) {
        this.allowedSessionTypesSelect.value = 'both';
      } else {
        this.allowedSessionTypesSelect.value = value[0];
      }
    } else if ('pending_timeout' === name) {
      this.timeoutInput.value = value;
    } else if ('config' === name) {
      this,this.numberOfRetriesToSkip.value = value['num_retries_to_skip'] ?? '';
    } else {
      // other scheduler options
    }
  }

  /**
   * verify create dialog's schedulerOptions key and value.
   *
   * @return {Boolean} key-value is valid => true, key-value is invalid => false
   * */
  _verifyCreateSchedulerOpts() {
    const validityCheckResult = [
      this.allowedSessionTypesSelect,
      this.timeoutInput,
      this.numberOfRetriesToSkip
    ].filter((fn) => !fn.checkValidity());

    if (validityCheckResult.length > 0) {
      return false;
    }
    return true;
  }

  /**
   * verify modify dialog's schedulerOptions key and value.
   *
   * @return {Boolean} key-value is valid => true, key-value is invalid => false
   * */
  _verifyModifySchedulerOpts() {
    const validityCheckResult = [
      this.allowedSessionTypesSelect,
      this.timeoutInput,
      this.numberOfRetriesToSkip
    ].filter((fn) => !fn.checkValidity());

    if (validityCheckResult.length > 0) {
      return false;
    }
    return true;
  }

  /**
   * Save SchedulerOptsInputForms value to schedulerOpts property.
   * */
  _saveSchedulerOpts() {
    this.schedulerOpts = {};

    if (this.allowedSessionTypesSelect.value === 'both') {
      this.schedulerOpts['allowed_session_types'] = ['interactive', 'batch'];
    } else {
      this.schedulerOpts['allowed_session_types'] = [this.allowedSessionTypesSelect.value];
    }
    if (this.timeoutInput.value !== '') {
      this.schedulerOpts['pending_timeout'] = this.timeoutInput.value;
    }
    if (this.numberOfRetriesToSkip.value !== '') {
      Object.assign(this.schedulerOpts, {
        config: {
          num_retries_to_skip: this.numberOfRetriesToSkip.value
        }
      });
    }
  }

  _launchCreateDialog() {
    if (this.enableSchedulerOpts) {
      this._initializeCreateSchedulerOpts();
    }
    this.resourceGroupInfo = {};
    this._launchDialogById('#resource-group-dialog');
  }

  /**
   * Open the deleteDialog to remove the resource group(scaling group)
   *
   * @param {Object} resourceGroup - resource group object selected by delete icon click event trigger
   */
  _launchDeleteDialog(resourceGroup: object) {
    this.resourceGroupInfo = resourceGroup;
    this._launchDialogById('#delete-resource-group-dialog');
  }

  /**
   * Open the deleteDialog to remove the resource group(scaling group)
   *
   * @param {Object} resourceGroup - resource group object selected by detail icon click event trigger
   */
  _launchDetailDialog(resourceGroup: object) {
    this.resourceGroupInfo = resourceGroup;
    this._launchDialogById('#resource-group-detail-dialog');
  }

  /**
   * Open the deleteDialog to remove the resource group(scaling group)
   *
   * @param {Object} resourceGroup - resource group object selected by edit icon click event trigger
   */
  _launchModifyDialog(resourceGroup: object) {
    this.resourceGroupInfo = resourceGroup;
    if (this.enableSchedulerOpts) {
      const schedulerOpts= JSON.parse(this.resourceGroupInfo.scheduler_opts);
      Object.entries(schedulerOpts).forEach(([key, value]) => {
        this._initializeModifySchedulerOpts(key, value);
      });
    }
    this._launchDialogById('#resource-group-dialog');
  }

  render() {
    // languate=HTML
    return html`
      <h4 class="horizontal flex center center-justified layout">
        <span>${_t('resourceGroup.ResourceGroups')}</span>
        <span class="flex"></span>
          <mwc-button
              raised
              icon="add"
              label="${_t('button.Add')}"
              @click=${this._launchCreateDialog}>
          </mwc-button>
      </h4>
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Job list" .items="${this.resourceGroups}">
        <vaadin-grid-column flex-grow="0" header="#" width="40px" .renderer=${this._indexRenderer}>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t('resourceGroup.Name')}" path="name">
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t('resourceGroup.Description')}" path="description">
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t('resourceGroup.ActiveStatus')}" .renderer=${this._activeStatusRenderer}>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t('resourceGroup.Driver')}" path="driver">
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t('resourceGroup.Scheduler')}" path="scheduler">
        </vaadin-grid-column>
        ${this.enableWSProxyAddr ? html`
        <vaadin-grid-column resizable header="${_t('resourceGroup.WsproxyAddress')}" path="wsproxy_addr">
        </vaadin-grid-column>
        ` : html``}
        <vaadin-grid-column flex-grow="1" header="${_t('general.Control')}" .renderer=${this._boundControlRenderer}>
        </vaadin-grid-column>
      </vaadin-grid>
      <backend-ai-dialog id="resource-group-dialog" fixed backdrop blockscrolling>
        <span slot="title"> ${this.resourceGroupInfo?.name ? _t('resourceGroup.ModifyResourceGroup'): _t('resourceGroup.CreateResourceGroup')}</span>
        <div slot="content" class="login-panel intro centered">
          ${Object.keys(this.resourceGroupInfo).length > 0 ? html`
            <div class="horizontal layout flex wrap center justified">
              <p style="margin-left: 18px;color:rgba(0, 0, 0, 0.6);">
                ${_t('resourceGroup.Active')}
              </p>
              <mwc-switch id="resource-group-active" style="margin-right:10px;" ?selected="${this.resourceGroupInfo.is_active}">
              </mwc-switch>
            </div>
            <mwc-select
              id="resource-group-scheduler"
              label="${_t('resourceGroup.SelectScheduler')}"
              value="${this.resourceGroupInfo.length === 0 ? '' : this.resourceGroupInfo.scheduler}">
              ${this.schedulerTypes.map((sched) => html`
                <mwc-list-item value="${sched}">${sched}</mwc-list-item>
              `)}
            </mwc-select>
          ` : html`
          <mwc-select required id="resource-group-domain" label="${_t('resourceGroup.SelectDomain')}">
            ${this.domains.map((domain, idx) => html`
              <mwc-list-item value="${domain.name}" ?selected=${idx === 0}>
                ${domain.name}
              </mwc-list-item>
            `)}
          </mwc-select>
          <mwc-textfield
            type="text"
            id="resource-group-name"
            label="${_t('resourceGroup.ResourceGroupName')}"
            maxLength="64"
            placeholder="${_t('maxLength.64chars')}"
            validationMessage="${_t('data.explorer.ValueRequired')}"
            required
            autoValidate
            @change="${() => this._validateResourceGroupName()}"
          ></mwc-textfield>
          `}
          <mwc-textarea
            name="description"
            id="resource-group-description"
            label="${_t('resourceGroup.Description')}"
            maxLength="512"
            placeholder="${_t('maxLength.512chars')}"
            value="${this.resourceGroupInfo?.description ?? ''}"
          ></mwc-textarea>
          ${this.enableWSProxyAddr ? html`
          <mwc-textfield
                id="resource-group-wsproxy-address"
                type="url"
                label="${_t('resourceGroup.WsproxyAddress')}"
                placeholder="http://localhost:10200"
                value="${this.resourceGroupInfo?.wsproxy_addr ?? ''}"
              ></mwc-textfield>
            ` : html``}
          ${this.enableSchedulerOpts ? html`
            <wl-expansion id="scheduler-options-input-form">
              <span slot="title">${_t('resourceGroup.SchedulerOptions')}</span>
              <mwc-select id="allowed-session-types" label="allowed session types" required>
                ${Object.entries(this.allowedSessionTypesObjects).map(([key, value]) => {
    return html`<mwc-list-item value="${key}">${value}</mwc-list-item>`;
  })
}
              </mwc-select>
              <mwc-textfield
                type="number"
                value="0"
                id="pending-timeout"
                label="pending timeout"
                placeholder="0"
                suffix="${_t('resourceGroup.TimeoutSeconds')}"
                validationMessage="${_t('settings.InvalidValue')}"
                autoValidate
                min="0"
                value="${this.resourceGroupInfo?.scheduler_opts?.pending_timeout ?? ''}"
              ></mwc-textfield>
              <mwc-textfield
                  type="number"
                  value="0"
                  id="num-retries-to-skip"
                  label="# retries to skip pending session"
                  placeholder="0"
                  suffix="${_t('resourceGroup.RetriesToSkip')}"
                  validationMessage="${_t('settings.InvalidValue')}"
                  autoValidate
                  min="0"
                  value="${this.resourceGroupInfo?.scheduler_opts?.config?.num_retries_to_skip ?? ''}"
                ></mwc-textfield>
            </wl-expansion>
            ` : html``}
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          ${Object.keys(this.resourceGroupInfo).length > 0 ? html`
          <mwc-button
              unelevated
              icon="save"
              label="${_t('button.Save')}"
              @click="${this._modifyResourceGroup}">
          </mwc-button>
          `: html`
          <mwc-button
              unelevated
              icon="add"
              label="${_t('button.Create')}"
              @click="${this._createResourceGroup}"></mwc-button>
          `}
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="delete-resource-group-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t('dialog.warning.CannotBeUndone')}</span>
        <div slot="content">
          <mwc-textfield
            id="delete-resource-group"
            type="text"
            label="${_t('resourceGroup.TypeResourceGroupNameToDelete')}"
            maxLength="64"
            placeholder="${_t('maxLength.64chars')}"
          ></mwc-textfield>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
            outlined
            icon="delete"
            label="${_t('button.Delete')}"
            style="box-sizing: border-box;"
            @click="${this._deleteResourceGroup}">
            </mwc-button>
       </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="resource-group-detail-dialog" fixed backdrop blockscrolling>
        ${Object.keys(this.resourceGroupInfo).length > 0 ? html`
          <span slot="title" class="horizontal center layout">
            <span style="margin-right:15px;">${_text('resourceGroup.ResourceGroupDetail')}</span>
          </span>
          <div slot="content" class="intro">
            <div class="horizontal layout" style="margin-bottom:15px;">
              <div style="width:250px;">
                <h4>${_text('credential.Information')}</h4>
                <div role="listbox" class="vertical layout">
                  <vaadin-item>
                    <div><strong>${_text('resourceGroup.Name')}</strong></div>
                    <div class="scheduler-option-value">${this.resourceGroupInfo.name}</div>
                  </vaadin-item>
                  <vaadin-item>
                    <div><strong>${_text('resourceGroup.ActiveStatus')}</strong></div>
                    <lablup-shields
                      app=""
                      color=${this.resourceGroupInfo.is_active ? 'green' : 'red'}
                      description=${this.resourceGroupInfo?.is_active ? 'active' : 'inactive'}
                      ui="flat"
                    ></lablup-shields>
                  </vaadin-item>
                  <vaadin-item>
                    <div><strong>${_text('resourceGroup.Driver')}</strong></div>
                    <div class="scheduler-option-value">${this.resourceGroupInfo?.driver}</div>
                  </vaadin-item>
                  <vaadin-item>
                    <div><strong>${_text('resourceGroup.Scheduler')}</strong></div>
                    <div class="scheduler-option-value">${this.resourceGroupInfo?.scheduler}</div>
                  </vaadin-item>
                  ${this.enableWSProxyAddr ? html`
                  <vaadin-item>
                    <div><strong>${_text('resourceGroup.WsproxyAddress')}</strong></div>
                    <div class="scheduler-option-value">${this.resourceGroupInfo?.wsproxy_addr ?? 'none'}</div>
                  </vaadin-item>
                  ` : html``}
                </div>
              </div>
              <div class="center vertial layout" style="width:250px;">
                <div>
                  <h4 class="horizontal center layout">
                    ${_t('resourceGroup.SchedulerOptions')}
                  </h4>
                  <div role="listbox">
                    ${this.enableSchedulerOpts ? html`
                      ${Object.entries(JSON.parse(this.resourceGroupInfo?.scheduler_opts)).map(([key, value]: any) => {
    if (key === 'allowed_session_types') {
      return html`
                                  <vaadin-item>
                                    <div><strong>allowed session types</strong></div>
                                    <div class="scheduler-option-value">${value.join(', ')}</div>
                                  </vaadin-item>`;
    } else if (key === 'pending_timeout') {
      return html`
      <vaadin-item>
      <div><strong>pending timeout</strong></div>
      <div class="scheduler-option-value">${value + ' ' + _text('resourceGroup.TimeoutSeconds')}</div>
    </vaadin-item>`;
    } else if (key === 'config') {
      if (value['num_retries_to_skip']) {
        return html`
        <vaadin-item>
        <div><strong># retries to skip pending session</strong></div>
        <div class="scheduler-option-value">${value['num_retries_to_skip'] + ' ' + _text('resourceGroup.RetriesToSkip')}</div>
      </vaadin-item>`;
      } else {
        return '';
      }
    } else {
      return '';
    }
  })}
                    ` : html``}
                  </div>
                </div>
                <div>
                  <h4 class="horizontal center layout">
                    ${_t('resourceGroup.DriverOptions')}
                  </h4>
                  <div role="listbox">
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4>
                ${_t('resourceGroup.Description')}
              </h4>
              <wl-textarea readonly value="${this.resourceGroupInfo?.description ?? ''}">
              </wl-textarea>
            </div>
          </div>` : ``
}
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-resource-group-list': BackendAIResourceGroupList;
  }
}
