/**
 @license
 Copyright (c) 2015-2018 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {render} from 'lit';
import {BackendAIPage} from './backend-ai-page';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-template-renderer';

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
          margin: 10px auto 20px auto;
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
          height: 150px;
        }

        mwc-select {
          width:100%;
          --mdc-typography-font-family: var(--general-font-family);
          --mdc-theme-primary: var(--general-textfield-selected-color);
          --mdc-select-fill-color: transparent;
        }

        backend-ai-dialog {
          --component-min-width: 350px;
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
          });

        globalThis.backendaiclient.domain.list()
          .then(({domains}) => {
            this.domains = domains;
            this.requestUpdate(); // without this render is called beforehands, so update is required
          });
      }, true);
    } else { // already connected
      globalThis.backendaiclient.scalingGroup.list_available()
        .then((res) => {
          this.scalingGroups = res.scaling_groups;
        });

      globalThis.backendaiclient.domain.list()
        .then(({domains}) => {
          this.domains = domains;
          this.requestUpdate(); // without this render is called beforehands, so update is required
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
    render(
      html`
        <div
          id="controls"
          class="layout horizontal flex center"
        >
          <wl-button fab flat inverted
            icon="settings"
            class="fg blue"
            @click=${() => {
    this.selectedIndex = rowData.index;
    this.shadowRoot.querySelector('#modify-scaling-group-active').checked = this.scalingGroups[rowData.index].is_active;
    this._launchDialogById('#modify-scaling-group-dialog');
  }}
          ><wl-icon>settings</wl-icon></wl-button>
          <wl-button fab flat inverted
            icon="delete"
            class="fg red"
            @click=${() => {
    this.selectedIndex = rowData.index;
    this._launchDialogById('#delete-scaling-group-dialog');
  }}><wl-icon>delete</wl-icon></wl-button>
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
    if (scalingGroupEl.checkValidity()) {
      const scalingGroup = this.shadowRoot.querySelector('#scaling-group-name').value;
      const description = this.shadowRoot.querySelector('#scaling-group-description').value;
      const domain = this.shadowRoot.querySelector('#scaling-group-domain').value;
      globalThis.backendaiclient.scalingGroup.create(scalingGroup, description)
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
    const description = this.shadowRoot.querySelector('#modify-scaling-group-description').value;
    const scheduler = this.shadowRoot.querySelector('#modify-scaling-group-scheduler').value;
    const is_active = this.shadowRoot.querySelector('#modify-scaling-group-active').checked;
    const name = this.scalingGroups[this.selectedIndex].name;

    const input = {};
    if (description !== this.scalingGroups[this.selectedIndex].description) input['description'] = description;
    if (scheduler !== this.scalingGroups[this.selectedIndex].scheduler) input['scheduler'] = scheduler;
    if (is_active !== this.scalingGroups[this.selectedIndex].is_active) input['is_active'] = is_active;

    if (Object.keys(input).length === 0) {
      this.notification.text = _text('resourceGroup.NochangesMade');
      this.notification.show();
      return;
    }

    globalThis.backendaiclient.scalingGroup.update(name, input)
      .then(({modify_scaling_group}) => {
        if (modify_scaling_group.ok) {
          this.notification.text = _text('resourceGroup.ResourceGroupCreated');
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
              @click=${() => this._launchDialogById('#create-scaling-group-dialog')}>
          </mwc-button>
      </h4>
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Job list" .items="${this.scalingGroups}">
        <vaadin-grid-column flex-grow="0" header="#" width="40px" .renderer=${this._indexRenderer}>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t('resourceGroup.Name')}">
          <template>
            <div> [[item.name]] </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t('resourceGroup.Description')}">
          <template>
            <div> [[item.description]] </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t('resourceGroup.ActiveStatus')}" .renderer=${this._activeStatusRenderer}>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t('resourceGroup.Driver')}">
          <template>
            <div> [[item.driver]] </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t('resourceGroup.DriverOptions')}">
          <template>
            <div> [[item.driver_opts]] </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t('resourceGroup.Scheduler')}">
          <template>
            <div> [[item.scheduler]] </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t('resourceGroup.SchedulerOptions')}">
          <template>
            <div> [[item.scheduler_opts]] </div>
          </template>
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
              <mwc-list-item style="height:auto;" value="${e.name}">
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
            @input="${() => this._validateResourceGroupName()}"
          ></mwc-textfield>
          <mwc-textarea
            name="description"
            id="scaling-group-description"
            label="${_t('resourceGroup.Description')}"
            maxLength="512"
            placeholder="${_t('maxLength.512chars')}"
          ></mwc-textarea>
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
        <div slot="content">
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
            value=${this.scalingGroups.length === 0 ? '' : this.scalingGroups[this.selectedIndex].description}
          ></mwc-textarea>
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
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-scaling-group-list': BackendAIScalingGroupList;
  }
}
