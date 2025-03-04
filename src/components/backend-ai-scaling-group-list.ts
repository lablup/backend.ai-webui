/**
 @license
 Copyright (c) 2015-2018 Lablup Inc. All rights reserved.
 */
import '../plastics/lablup-shields/lablup-shields';
import {
  IronFlex,
  IronFlexAlignment,
} from '../plastics/layout/iron-flex-layout-classes';
import './backend-ai-dialog';
import { BackendAiStyles } from './backend-ai-general-styles';
import './backend-ai-list-status';
import BackendAIListStatus, { StatusCondition } from './backend-ai-list-status';
import { BackendAIPage } from './backend-ai-page';
import { default as PainKiller } from './backend-ai-painkiller';
import '@material/mwc-button/mwc-button';
import '@material/mwc-list/mwc-list-item';
import { Select } from '@material/mwc-select';
import { Switch } from '@material/mwc-switch';
import { TextArea } from '@material/mwc-textarea';
import { TextField } from '@material/mwc-textfield';
import '@vaadin/grid/vaadin-grid';
import { css, CSSResultGroup, html, render } from 'lit';
import { get as _text, translate as _t } from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';

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
  @property({ type: Object }) _boundControlRenderer =
    this._controlRenderer.bind(this);
  @property({ type: Number }) selectedIndex = 0;
  @property({ type: String }) listCondition: StatusCondition = 'loading';
  @property({ type: Array }) domains;
  @property({ type: Array }) scalingGroups;
  @property({ type: Array }) schedulerTypes;
  @property({ type: Number }) _totalScalingGroupCount = 0;

  @property({ type: Object }) _boundNameRenderer =
    this._nameRenderer.bind(this);
  @property({ type: Object }) _boundDescriptionRenderer =
    this._descriptionRenderer.bind(this);
  @property({ type: Object }) _boundDriverRenderer =
    this._driverRenderer.bind(this);
  @property({ type: Object }) _boundDriverOptsRenderer =
    this._driverOptsRenderer.bind(this);
  @property({ type: Object }) _boundSchedulerRenderer =
    this._schedulerRenderer.bind(this);
  @property({ type: Object }) _boundSchedulerOptsRenderer =
    this._schedulerOptsRenderer.bind(this);

  @query('#scaling-group-name') scalingGroupName!: TextField;
  @query('#scaling-group-description') scalingGroupDescription!: TextArea;
  @query('#scaling-group-domain') scalingGroupDomain!: Select;
  @query('#modify-scaling-group-active') modifyScalingGroupActive!: Switch;
  @query('#list-status') private _listStatus!: BackendAIListStatus;

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
        vaadin-grid {
          border: 0;
          font-size: 14px;
          height: calc(100vh - 225px);
        }

        h4 {
          font-weight: 200;
          font-size: 14px;
          margin: 0px;
          padding: 5px 15px 5px 20px;
        }

        backend-ai-dialog mwc-textfield,
        backend-ai-dialog mwc-textarea {
          width: 100%;
          margin: 10px auto 20px auto;
          --mdc-typography-font-family: var(--token-fontFamily);
          --mdc-theme-primary: var(--general-textfield-selected-color);
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
          width: 100%;
        }

        backend-ai-dialog {
          --component-min-width: 350px;
        }
      `,
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
    this.listCondition = 'loading';
    this._listStatus?.show();
    // If disconnected
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          globalThis.backendaiclient.scalingGroup
            .list_available()
            .then((res) => {
              this.scalingGroups = res.scaling_groups;
              if (this.scalingGroups.length == 0) {
                this.listCondition = 'no-data';
              } else {
                this._listStatus?.hide();
              }
            });

          globalThis.backendaiclient.domain.list().then(({ domains }) => {
            this.domains = domains;
            this.requestUpdate(); // without this render is called beforehands, so update is required
          });
        },
        true,
      );
    } else {
      // already connected
      globalThis.backendaiclient.scalingGroup.list_available().then((res) => {
        this.scalingGroups = res.scaling_groups;
        this._totalScalingGroupCount =
          this.scalingGroups.length > 0 ? this.scalingGroups.length : 1;
        this._listStatus?.hide();
      });

      globalThis.backendaiclient.domain.list().then(({ domains }) => {
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
      root,
    );
  }

  _indexRenderer(root, column, rowData) {
    const idx = rowData.index + 1;
    render(
      html`
        <div>${idx}</div>
      `,
      root,
    );
  }

  _nameRenderer(root, column, rowData) {
    render(
      html`
        <div>${rowData.item.name}</div>
      `,
      root,
    );
  }

  _descriptionRenderer(root, column, rowData) {
    render(
      html`
        <div>${rowData.item.description}</div>
      `,
      root,
    );
  }
  _driverRenderer(root, column, rowData) {
    render(
      html`
        <div>${rowData.item.driver}</div>
      `,
      root,
    );
  }
  _driverOptsRenderer(root, column, rowData) {
    render(
      html`
        <div>${rowData.item.driver_opts}</div>
      `,
      root,
    );
  }

  _schedulerRenderer(root, column, rowData) {
    render(
      html`
        <div>${rowData.item.scheduler}</div>
      `,
      root,
    );
  }

  _schedulerOptsRenderer(root, column, rowData) {
    render(
      html`
        <div>${rowData.item.scheduler_opts}</div>
      `,
      root,
    );
  }

  _launchDialogById(id) {
    this.shadowRoot?.querySelector(id).show();
  }

  _hideDialogById(id) {
    this.shadowRoot?.querySelector(id).hide();
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
        <div id="controls" class="layout horizontal flex center">
          <mwc-icon-button
            class="fg blue"
            icon="settings"
            @click=${() => {
              this.selectedIndex = rowData.index;
              this.modifyScalingGroupActive.selected =
                this.scalingGroups[rowData.index].is_active;
              this._launchDialogById('#modify-scaling-group-dialog');
            }}
          ></mwc-icon-button>
          <mwc-icon-button
            class="fg red"
            icon="delete"
            @click=${() => {
              this.selectedIndex = rowData.index;
              this._launchDialogById('#delete-scaling-group-dialog');
            }}
          ></mwc-icon-button>
        </div>
      `,
      root,
    );
  }

  _validateResourceGroupName() {
    const scalingGroupNames = this.scalingGroups.map(
      (scalingGroup) => scalingGroup['name'],
    );
    const scalingGroupInfo = this.scalingGroupName;
    scalingGroupInfo.validityTransform = (value, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          scalingGroupInfo.validationMessage = _text(
            'resourceGroup.ResourceGroupNameRequired',
          );
          return {
            valid: nativeValidity.valid,
            valueMissing: !nativeValidity.valid,
          };
        } else {
          scalingGroupInfo.validationMessage = _text(
            'resourceGroup.EnterValidResourceGroupName',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        }
      } else {
        const isValid = !scalingGroupNames.includes(value);
        if (!isValid) {
          scalingGroupInfo.validationMessage = _text(
            'resourceGroup.ResourceGroupAlreadyExist',
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
   * Create scaling group and associate scaling group with domain.
   * */
  _createScalingGroup() {
    const scalingGroupEl = this.scalingGroupName;
    if (scalingGroupEl.checkValidity()) {
      const scalingGroup = this.scalingGroupName.value;
      const description = this.scalingGroupDescription.value;
      const domain = this.scalingGroupDomain.value;
      globalThis.backendaiclient.scalingGroup
        .create(scalingGroup, description)
        .then(({ create_scaling_group: res }) => {
          if (res.ok) {
            return globalThis.backendaiclient.scalingGroup.associate_domain(
              domain,
              scalingGroup,
            );
          } else {
            /* error message will be handled in catch statement */
            // this.notification.text = PainKiller.relieve(res.title);
            // this.notification.detail = res.msg;
            // this.notification.show();
            return Promise.reject(res.msg);
          }
        })
        .then(({ associate_scaling_group_with_domain: res }) => {
          if (res.ok) {
            this.notification.text = _text(
              'resourceGroup.ResourceGroupCreated',
            );
            this._refreshList();
            this.scalingGroupName.value = '';
            this.scalingGroupDescription.value = '';
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
    const description = (
      this.shadowRoot?.querySelector(
        '#modify-scaling-group-description',
      ) as TextArea
    ).value;
    const scheduler = (
      this.shadowRoot?.querySelector(
        '#modify-scaling-group-scheduler',
      ) as Select
    ).value;
    const is_active = this.modifyScalingGroupActive.selected;
    const name = this.scalingGroups[this.selectedIndex].name;

    const input = {};
    if (description !== this.scalingGroups[this.selectedIndex].description) {
      input['description'] = description;
    }
    if (scheduler !== this.scalingGroups[this.selectedIndex].scheduler) {
      input['scheduler'] = scheduler;
    }
    if (is_active !== this.scalingGroups[this.selectedIndex].is_active) {
      input['is_active'] = is_active;
    }

    if (Object.keys(input).length === 0) {
      this.notification.text = _text('resourceGroup.NoChangesMade');
      this.notification.show();
      return;
    }

    globalThis.backendaiclient.scalingGroup
      .update(name, input)
      .then(({ modify_scaling_group }) => {
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
    if (
      (this.shadowRoot?.querySelector('#delete-scaling-group') as TextField)
        .value !== name
    ) {
      this.notification.text = _text('resourceGroup.ResourceGroupNameNotMatch');
      this._hideDialogById('#delete-scaling-group-dialog');
      this.notification.show();
      return;
    }

    globalThis.backendaiclient.scalingGroup
      .delete(name)
      .then(({ delete_scaling_group }) => {
        if (delete_scaling_group.ok) {
          this.notification.text = _text('resourceGroup.ResourceGroupDeleted');
          this._refreshList();
          (
            this.shadowRoot?.querySelector('#delete-scaling-group') as TextField
          ).value = '';
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
    this.listCondition = 'loading';
    this._listStatus?.show();
    globalThis.backendaiclient.scalingGroup
      .list_available()
      .then(({ scaling_groups }) => {
        this.scalingGroups = scaling_groups;
        if (this.scalingGroups.length == 0) {
          this.listCondition = 'no-data';
        } else {
          this._listStatus?.hide();
        }
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
          @click=${() => this._launchDialogById('#create-scaling-group-dialog')}
        ></mwc-button>
      </h4>
      <div class="list-wrapper">
        <vaadin-grid
          theme="row-stripes column-borders compact dark"
          height-by-rows
          aria-label="Job list"
          .items="${this.scalingGroups}"
        >
          <vaadin-grid-column
            flex-grow="0"
            header="#"
            width="40px"
            .renderer=${this._indexRenderer}
          ></vaadin-grid-column>
          <vaadin-grid-column
            flex-grow="1"
            header="${_t('resourceGroup.Name')}"
            .renderer=${this._boundNameRenderer}
          ></vaadin-grid-column>
          <vaadin-grid-column
            flex-grow="1"
            header="${_t('resourceGroup.Description')}"
            .renderer=${this._boundDescriptionRenderer}
          ></vaadin-grid-column>
          <vaadin-grid-column
            flex-grow="1"
            header="${_t('resourceGroup.ActiveStatus')}"
            .renderer=${this._activeStatusRenderer}
          ></vaadin-grid-column>
          <vaadin-grid-column
            flex-grow="1"
            header="${_t('resourceGroup.Driver')}"
            .renderer=${this._boundDriverRenderer}
          ></vaadin-grid-column>
          <vaadin-grid-column
            flex-grow="1"
            header="${_t('resourceGroup.DriverOptions')}"
            .renderer=${this._boundDriverOptsRenderer}
          ></vaadin-grid-column>
          <vaadin-grid-column
            flex-grow="1"
            header="${_t('resourceGroup.Scheduler')}"
            .renderer=${this._boundSchedulerRenderer}
          ></vaadin-grid-column>
          <vaadin-grid-column
            flex-grow="1"
            header="${_t('resourceGroup.SchedulerOptions')}"
            .renderer=${this._boundSchedulerOptsRenderer}
          ></vaadin-grid-column>
          <vaadin-grid-column
            flex-grow="1"
            header="${_t('general.Control')}"
            .renderer=${this._boundControlRenderer}
          ></vaadin-grid-column>
        </vaadin-grid>
        <backend-ai-list-status
          id="list-status"
          statusCondition="${this.listCondition}"
          message="${_text('resourceGroup.NoGroupToDisplay')}"
        ></backend-ai-list-status>
      </div>
      <backend-ai-dialog
        id="create-scaling-group-dialog"
        fixed
        backdrop
        blockscrolling
      >
        <span slot="title">${_t('resourceGroup.CreateResourceGroup')}</span>

        <div slot="content" class="login-panel intro centered">
          <mwc-select
            id="scaling-group-domain"
            label="${_t('resourceGroup.SelectDomain')}"
          >
            ${this.domains.map(
              (e) => html`
                <mwc-list-item style="height:auto;" value="${e.name}">
                  ${e.name}
                </mwc-list-item>
              `,
            )}
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
            @click="${this._createScalingGroup}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog
        id="modify-scaling-group-dialog"
        fixed
        backdrop
        blockscrolling
      >
        <span slot="title">${_t('resourceGroup.ModifyResourceGroup')}</span>
        <div slot="content">
          <div class="horizontal layout flex wrap center justified">
            <p style="margin-left: 18px;color:rgba(0, 0, 0, 0.6);">
              ${_t('resourceGroup.Active')}
            </p>
            <mwc-switch
              id="modify-scaling-group-active"
              style="margin-right:10px;"
            ></mwc-switch>
          </div>
          <mwc-select
            id="modify-scaling-group-scheduler"
            label="${_t('resourceGroup.SelectScheduler')}"
            value="${this.scalingGroups.length === 0
              ? ''
              : this.scalingGroups[this.selectedIndex].scheduler}"
          >
            ${this.schedulerTypes.map(
              (sched) => html`
                <mwc-list-item value="${sched}">${sched}</mwc-list-item>
              `,
            )}
          </mwc-select>
          <mwc-textarea
            id="modify-scaling-group-description"
            type="text"
            label="${_t('resourceGroup.Description')}"
            value=${this.scalingGroups.length === 0
              ? ''
              : this.scalingGroups[this.selectedIndex].description}
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
      <backend-ai-dialog
        id="delete-scaling-group-dialog"
        fixed
        backdrop
        blockscrolling
      >
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
            @click="${this._deleteScalingGroup}"
          ></mwc-button>
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
