/**
 @license
 Copyright (c) 2015-2018 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html, render} from 'lit';
import {customElement, property} from 'lit/decorators.js';
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
import 'weightless/expansion';

import '@material/mwc-switch/mwc-switch';
import '@material/mwc-button/mwc-button';
import '@material/mwc-select/mwc-select';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-textfield/mwc-textfield';
import '@material/mwc-textarea/mwc-textarea';

import './backend-ai-dialog';
import {default as PainKiller} from './backend-ai-painkiller';
import {BackendAiStyles} from './backend-ai-general-styles';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

/**
 Backend AI Scaling Group List

 `backend-ai-scaling-group-list` manages scaling group.

 Example:

 <backend-ai-scaling-group-list active></backend-ai-scaling-group-list>

@group Backend.AI Web UI
 @element backend-ai-scaling-group-list
 */

@customElement('backend-ai-scaling-group-list')
export default class BackendAIScalingGroupList extends BackendAIPage {
  @property({type: Object}) _boundControlRenderer = this._controlRenderer.bind(this);
  @property({type: Number}) selectedIndex = 0;
  @property({type: Array}) domains;
  @property({type: Array}) scalingGroups;
  @property({type: Array}) schedulerTypes;
  @property({type: Object}) schedulerOpts;
  @property({type: Object}) allowedSessionTypesObjects = {
    'interactive': 'interactive',
    'batch': 'batch',
    'both': 'both (interactive, batch)'
  };

  constructor() {
    super();
    this.active = false;
    this.schedulerTypes = ['fifo', 'lifo', 'drf'];
    this.scalingGroups = [];
    this.domains = [];
  }

  static get styles(): CSSResultGroup | undefined {
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
          --mdc-on-theme-primary: #38bd73;
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

        backend-ai-dialog {
          --component-min-width: 350px;
        }

        #resource-group-detail-dialog {
          --component-width: 500px;
        }

        #modify-scaling-group-dialog {
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
          --input-border-width: 0;
          margin-bottom: 0px;
          --input-padding-top-bottom: 0px;
          --textarea-height: 100px;
          --input-padding-left-right: 12px;
        }
      `
    ];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    // If disconnected
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        globalThis.backendaiclient.scalingGroup.list_available()
          .then((res) => {
            this.scalingGroups = res.scaling_groups;
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
      globalThis.backendaiclient.scalingGroup.list_available()
        .then((res) => {
          this.scalingGroups = res.scaling_groups;
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

  _launchDialogById(id) {
    this.shadowRoot.querySelector(id).show();
  }

  _hideDialogById(id) {
    this.shadowRoot.querySelector(id).hide();
  }

  /**
   * Render control units - settings (modify-scaling-group), delete (delete-scaling-group)
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  _controlRenderer(root, column, rowData) {
    const launchDetailDialog = () => {
      this.selectedIndex = rowData.index;
      this._launchDialogById('#resource-group-detail-dialog');
    };

    const launchModifyDialog = () => {
      this.selectedIndex = rowData.index;
      this.shadowRoot.querySelector('#modify-scaling-group-active').selected = this.scalingGroups[rowData.index].is_active;
      Object.entries(JSON.parse(this.scalingGroups[this.selectedIndex].scheduler_opts)).forEach(([key, value]) => {
        this._initializeModifySchedulerOpts(key, value);
      });
      this._launchDialogById('#modify-scaling-group-dialog');
    };

    const launchDeleteDialog = () => {
      this.selectedIndex = rowData.index;
      this._launchDialogById('#delete-scaling-group-dialog');
    };

    render(
      html`
        <div
          id="controls"
          class="layout horizontal flex center"
        >
          <wl-button fab flat inverted
            icon="device_hub"
            class="fg green"
            @click=${launchDetailDialog}
          ><wl-icon>assignment</wl-icon></wl-button>
          <wl-button fab flat inverted
            icon="settings"
            class="fg blue"
            @click=${launchModifyDialog}
          ><wl-icon>settings</wl-icon></wl-button>
          <wl-button fab flat inverted
            icon="delete"
            class="fg red"
            @click=${launchDeleteDialog}
          ><wl-icon>delete</wl-icon></wl-button>
        </div>
      `, root
    );
  }

  _validateResourceGroupName() {
    const scalingGroupNames = this.scalingGroups.map((scalingGroup) => scalingGroup['name']);
    const scalingGroupInfo = this.shadowRoot.querySelector('#scaling-group-name');
    scalingGroupInfo.validityTransform = (value, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          scalingGroupInfo.validationMessage = _text('resourceGroup.ResourceGroupNameRequired');
          return {
            valid: nativeValidity.valid,
            valueMissing: !nativeValidity.valid
          };
        } else {
          scalingGroupInfo.validationMessage = _text('resourceGroup.EnterValidResourceGroupName');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        }
      } else {
        const isValid = !scalingGroupNames.includes(value);
        if (!isValid) {
          scalingGroupInfo.validationMessage = _text('resourceGroup.ResourceGroupAlreadyExist');
        }
        return {
          valid: isValid,
          customError: !isValid
        };
      }
    };
  }

  /**
   * Create scaling group and associate scaling group with domain.
   * */
  _createScalingGroup() {
    const scalingGroupEl = this.shadowRoot.querySelector('#scaling-group-name');
    if (scalingGroupEl.checkValidity() && this._verifyCreateSchedulerOpts()) {
      this._saveCreateSchedulerOpts();
      const scalingGroup = this.shadowRoot.querySelector('#scaling-group-name').value;
      const description = this.shadowRoot.querySelector('#scaling-group-description').value;
      const domain = this.shadowRoot.querySelector('#scaling-group-domain').value;
      const wsproxyAddress = this.shadowRoot.querySelector('#scaling-group-wsproxy-address').value;
      const schedulerOptions = JSON.stringify(this.schedulerOpts);
      globalThis.backendaiclient.scalingGroup.create(scalingGroup, description, schedulerOptions, wsproxyAddress)
        .then(({create_scaling_group: res}) => {
          if (res.ok) {
            return globalThis.backendaiclient.scalingGroup.associate_domain(domain, scalingGroup);
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
            this.shadowRoot.querySelector('#scaling-group-name').value = '';
            this.shadowRoot.querySelector('#scaling-group-description').value = '';
          } else {
            this.notification.text = PainKiller.relieve(res.title);
            this.notification.detail = res.msg;
          }
          this._hideDialogById('#create-scaling-group-dialog');
          this.notification.show();
        })
        .catch((err) => {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err;
          this._hideDialogById('#create-scaling-group-dialog');
          this.notification.show(true, err);
        });
    } else {
      scalingGroupEl.reportValidity();
      return;
    }
  }

  /**
   * Modify scaling group such as description, scheduler, is_active, and name.
   * */
  _modifyScalingGroup() {
    if (this._verifyModifySchedulerOpts() === false) {
      return;
    }
    this._saveModifySchedulerOpts();
    const description = this.shadowRoot.querySelector('#modify-scaling-group-description').value;
    const scheduler = this.shadowRoot.querySelector('#modify-scaling-group-scheduler').value;
    const is_active = this.shadowRoot.querySelector('#modify-scaling-group-active').checked;
    let wsproxy_addr: string = this.shadowRoot.querySelector('#modify-scaling-group-wsproxy-address').value;
    const schedulerOptions = this.schedulerOpts;
    if (wsproxy_addr.endsWith('/')) {
      wsproxy_addr = wsproxy_addr.slice(0, wsproxy_addr.length - 1);
    }
    const name = this.scalingGroups[this.selectedIndex].name;

    const input = {};
    if (description !== this.scalingGroups[this.selectedIndex].description) input['description'] = description;
    if (scheduler !== this.scalingGroups[this.selectedIndex].scheduler) input['scheduler'] = scheduler;
    if (is_active !== this.scalingGroups[this.selectedIndex].is_active) input['is_active'] = is_active;
    if (wsproxy_addr !== this.scalingGroups[this.selectedIndex].wsproxy_addr) input['wsproxy_addr'] = wsproxy_addr;
    if (schedulerOptions !== this.scalingGroups[this.selectedIndex].scheduler_opts) input['scheduler_opts'] = JSON.stringify(schedulerOptions);

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
        this._hideDialogById('#modify-scaling-group-dialog');
        this.notification.show();
      });
  }

  _deleteScalingGroup() {
    const name = this.scalingGroups[this.selectedIndex].name;
    if (this.shadowRoot.querySelector('#delete-scaling-group').value !== name) {
      this.notification.text = _text('resourceGroup.ResourceGroupNameNotMatch');
      this._hideDialogById('#delete-scaling-group-dialog');
      this.notification.show();
      return;
    }

    globalThis.backendaiclient.scalingGroup.delete(name)
      .then(({delete_scaling_group}) => {
        if (delete_scaling_group.ok) {
          this.notification.text = _text('resourceGroup.ResourceGroupDeleted');
          this._refreshList();
          this.shadowRoot.querySelector('#delete-scaling-group').value = '';
        } else {
          this.notification.text = PainKiller.relieve(delete_scaling_group.msg);
          this.notification.detail = delete_scaling_group.msg;
        }

        this._hideDialogById('#delete-scaling-group-dialog');
        this.notification.show();
      });
    /* update selectedIndex to initial value */
    this.selectedIndex = 0;
  }

  _refreshList() {
    globalThis.backendaiclient.scalingGroup.list_available()
      .then(({scaling_groups}) => {
        this.scalingGroups = scaling_groups;
        this.requestUpdate(); // without this render is called beforehands, so update is required
      });
  }

  /**
   * reset all value to default in scheduler option input form in create dialog.
   * */
  _initializeCreateSchedulerOpts() {
    const allowedSessionTypes = this.shadowRoot.querySelector('#create-allowed-session-types');
    const pendingTimeout = this.shadowRoot.querySelector('#create-pending-timeout');
    const schedulerOptsInputForms = this.shadowRoot.querySelector('#create-scheduler-options-input-form');

    allowedSessionTypes.value= 'both';
    schedulerOptsInputForms.checked = false;
    if (pendingTimeout?.value) {
      pendingTimeout.value = '';
    }
  }

  /**
   * set selected scaling group's values to scheduler option input form in modify dialog.
   *
   * @param {String} name - scheduler option key in selected scalingGroup
   * @param {Any} value - scheduler option value in selected scalingGroup
   * */
  _initializeModifySchedulerOpts(name = '', value: any) {
    const allowedSessionTypes = this.shadowRoot.querySelector('#modify-allowed-session-types');
    const pendingTimeout = this.shadowRoot.querySelector('#modify-pending-timeout');

    if ('allowed_session_types' === name) {
      if (value.includes('interactive') && value.includes('batch')) {
        allowedSessionTypes.value = 'both';
      } else {
        allowedSessionTypes.value = value[0];
      }
    } else if ('pending_timeout' === name) {
      pendingTimeout.value = value;
    }
  }

  /**
   * verify create dialog's schedulerOptions key and value.
   *
   * @return {Boolean} key-value is valid => true, key-value is invalid => false
   * */
  _verifyCreateSchedulerOpts() {
    const allowedSessionTypes = this.shadowRoot.querySelector('#create-allowed-session-types');
    const pendingTimeout = this.shadowRoot.querySelector('#create-pending-timeout');

    if (allowedSessionTypes.checkValidity() === false || pendingTimeout.checkValidity() === false) {
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
    const allowedSessionTypes = this.shadowRoot.querySelector('#modify-allowed-session-types');
    const pendingTimeout = this.shadowRoot.querySelector('#modify-pending-timeout');

    if (allowedSessionTypes.checkValidity() === false || pendingTimeout.checkValidity() === false) {
      return false;
    }
    return true;
  }

  /**
   * save create dialog's SchedulerOptsInputForms value to schedulerOpts property.
   * */
  _saveCreateSchedulerOpts() {
    this.schedulerOpts = {};
    const allowedSessionTypes = this.shadowRoot.querySelector('#create-allowed-session-types');
    const pendingTimeout = this.shadowRoot.querySelector('#create-pending-timeout');

    if (allowedSessionTypes.value === 'both') {
      this.schedulerOpts['allowed_session_types'] = ['interactive', 'batch'];
    } else {
      this.schedulerOpts['allowed_session_types'] = [allowedSessionTypes.value];
    }
    if (pendingTimeout.value !== '') {
      this.schedulerOpts['pending_timeout'] = pendingTimeout.value;
    }
  }

  /**
   * save modify dialog's SchedulerOptsInputForms value to schedulerOpts property.
   * */
  _saveModifySchedulerOpts() {
    this.schedulerOpts = {};
    const allowedSessionTypes = this.shadowRoot.querySelector('#modify-allowed-session-types');
    const pendingTimeout = this.shadowRoot.querySelector('#modify-pending-timeout');

    if (allowedSessionTypes.value === 'both') {
      this.schedulerOpts['allowed_session_types'] = ['interactive', 'batch'];
    } else {
      this.schedulerOpts['allowed_session_types'] = [allowedSessionTypes.value];
    }
    if (pendingTimeout.value !== '') {
      this.schedulerOpts['pending_timeout'] = pendingTimeout.value;
    }
  }

  _launchCreateDialog() {
    this._initializeCreateSchedulerOpts();
    this._launchDialogById('#create-scaling-group-dialog');
  }

  render() {
    // languate=HTML
    return html`
      <h4 class="horizontal flex center center-justified layout">
        <span>${_t('resourceGroup.ResourceGroups')}</span>
        <span class="flex"></span>
          <mwc-button
              raised
              id="add-scaling-group"
              icon="add"
              label="${_t('button.Add')}"
              @click=${this._launchCreateDialog}>
          </mwc-button>
      </h4>
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Job list" .items="${this.scalingGroups}">
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
        <vaadin-grid-column flex-grow="1" header="${_t('resourceGroup.WsproxyAddress')}" path="wsproxy_addr">
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t('general.Control')}" .renderer=${this._boundControlRenderer}>
        </vaadin-grid-column>
      </vaadin-grid>
      <backend-ai-dialog id="create-scaling-group-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t('resourceGroup.CreateResourceGroup')}</span>
        <div slot="content" class="login-panel intro centered">
          <mwc-select
            id="scaling-group-domain"
            label="${_t('resourceGroup.SelectDomain')}">
            ${this.domains.map( (e) => html`
              <mwc-list-item value="${e.name}">
                ${e.name}
              </mwc-list-item>
            `)}
          </mwc-select>
          <mwc-textfield
            type="text"
            id="scaling-group-name"
            label="${_t('resourceGroup.ResourceGroupName')}"
            maxLength="64"
            placeholder="${_t('maxLength.64chars')}"
            validationMessage="${_t('data.explorer.ValueRequired')}"
            required
            autoValidate
            @change="${() => this._validateResourceGroupName()}"
          ></mwc-textfield>
          <mwc-textarea
            name="description"
            id="scaling-group-description"
            label="${_t('resourceGroup.Description')}"
            maxLength="512"
            placeholder="${_t('maxLength.512chars')}"
          ></mwc-textarea>
          <mwc-textfield
            id="scaling-group-wsproxy-address"
            type="url"
            label="${_t('resourceGroup.WsproxyAddress')}"
            placeholder="http://localhost:10200"
          ></mwc-textfield>
          <wl-expansion id="create-scheduler-options-input-form">
            <span slot="title">${_t('resourceGroup.SchedulerOptions')}</span>
            <mwc-select
            id="create-allowed-session-types"
            label="allowed session types"
            required>
              ${Object.entries(this.allowedSessionTypesObjects).map(([key, value]) => {
    return html`<mwc-list-item value="${key}">${value}</mwc-list-item>`;
  })}
            </mwc-select>
            <mwc-textfield
              type="number"
              value="0"
              id="create-pending-timeout"
              label="pending timeout"
              placeholder="0"
              suffix="${_t('resourceGroup.TimeoutSeconds')}"
              validationMessage="${_t('settings.InvalidValue')}"
              autoValidate
              min="0"
            ></mwc-textfield>
          </wl-expansion>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
              unelevated
              fullwidth
              id="create-user-button"
              class="create-button"
              icon="add"
              label="${_t('button.Create')}"
              @click="${this._createScalingGroup}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="modify-scaling-group-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t('resourceGroup.ModifyResourceGroup')}</span>
        <div slot="content" class="vertical layout wrap">
          <div class="horizontal layout flex wrap center justified">
            <p style="margin-left: 18px;color:rgba(0, 0, 0, 0.6);">
              ${_t('resourceGroup.Active')}
            </p>
            <mwc-switch id="modify-scaling-group-active" style="margin-right:10px;">
            </mwc-switch>
          </div>
          <mwc-select
            id="modify-scaling-group-scheduler"
            label="${_t('resourceGroup.SelectScheduler')}"
            value="${this.scalingGroups.length === 0 ? '' :
    this.scalingGroups[this.selectedIndex].scheduler}">
            ${this.schedulerTypes.map((sched) => html`
            <mwc-list-item value="${sched}">${sched}</mwc-list-item>
            `)}
          </mwc-select>
          <mwc-textarea
            id="modify-scaling-group-description"
            type="text"
            label="${_t('resourceGroup.Description')}"
            value=${this.scalingGroups.length === 0 ? '' : this.scalingGroups[this.selectedIndex].description ?? ''}
          ></mwc-textarea>
          <mwc-textfield
            id="modify-scaling-group-wsproxy-address"
            type="url"
            label="${_t('resourceGroup.WsproxyAddress')}"
            value=${this.scalingGroups.length === 0 ? '' : this.scalingGroups[this.selectedIndex].wsproxy_addr ?? ''}
          ></mwc-textfield>
          <wl-expansion id="modify-scheduler-options-input-form">
            <span slot="title">${_t('resourceGroup.SchedulerOptions')}</span>
            <mwc-select
            id="modify-allowed-session-types"
            label="allowed session types"
            required>
              ${Object.entries(this.allowedSessionTypesObjects).map(([key, value]) => {
    return html`<mwc-list-item value="${key}">${value}</mwc-list-item>`;
  })}
            </mwc-select>
            <mwc-textfield
              type="number"
              value="0"
              id="modify-pending-timeout"
              label="pending timeout"
              placeholder="0"
              suffix="${_t('resourceGroup.TimeoutSeconds')}"
              validationMessage="${_t('settings.InvalidValue')}"
              autoValidate
              min="0"
            ></mwc-textfield>
          </wl-expansion>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
            unelevated
            fullwidth
            icon="save"
            label="${_t('button.Save')}"
            @click=${this._modifyScalingGroup}
            ></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="delete-scaling-group-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t('dialog.warning.CannotBeUndone')}</span>
        <div slot="content">
          <mwc-textfield
            id="delete-scaling-group"
            type="text"
            label="${_t('resourceGroup.TypeResourceGroupNameToDelete')}"
            maxLength="64"
            placeholder="${_t('maxLength.64chars')}"
          ></mwc-textfield>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
            outlined
            fullwidth
            icon="delete"
            label="${_t('button.Delete')}"
            style="box-sizing: border-box;"
            @click="${this._deleteScalingGroup}">
            </mwc-button>
       </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="resource-group-detail-dialog" fixed backdrop blockscrolling>
        ${this.scalingGroups[this.selectedIndex] ? html`
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
                    <div class="scheduler-option-value">${this.scalingGroups[this.selectedIndex].name}</div>
                  </vaadin-item>
                  <vaadin-item>
                    <div><strong>${_text('resourceGroup.ActiveStatus')}</strong></div>
                    <lablup-shields
                      app=""
                      color=${this.scalingGroups[this.selectedIndex].is_active ? 'green' : 'red'}
                      description=${this.scalingGroups[this.selectedIndex].is_active ? 'active' : 'inactive'}
                      ui="flat"
                    ></lablup-shields>
                  </vaadin-item>
                  <vaadin-item>
                    <div><strong>${_text('resourceGroup.Driver')}</strong></div>
                    <div class="scheduler-option-value">${this.scalingGroups[this.selectedIndex].driver}</div>
                  </vaadin-item>
                  <vaadin-item>
                    <div><strong>${_text('resourceGroup.Scheduler')}</strong></div>
                    <div class="scheduler-option-value">${this.scalingGroups[this.selectedIndex].scheduler}</div>
                  </vaadin-item>
                  <vaadin-item>
                    <div><strong>${_text('resourceGroup.WsproxyAddress')}</strong></div>
                    <div class="scheduler-option-value">${this.scalingGroups[this.selectedIndex].wsproxy_addr ? this.scalingGroups[this.selectedIndex].wsproxy_addr : 'none'}</div>
                  </vaadin-item>
                </div>
              </div>
              <div class="center vertial layout" style="width:250px;">
                <div>
                  <h4 class="horizontal center layout">
                    ${_t('resourceGroup.SchedulerOptions')}
                  </h4>
                  <div role="listbox">
                    ${Object.entries(JSON.parse(this.scalingGroups[this.selectedIndex].scheduler_opts)).map(([key, value]: any) => {
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
    } else {
      return '';
    }
  })}
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
              <wl-textarea
              readonly
              value="${this.scalingGroups[this.selectedIndex].description}">
              </wl-textarea>
            </div>
          </div>` : ''
}
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-scaling-group-list': BackendAIScalingGroupList;
  }
}
