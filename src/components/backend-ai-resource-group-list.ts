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
import './backend-ai-multi-select';
import { BackendAIPage } from './backend-ai-page';
import { default as PainKiller } from './backend-ai-painkiller';
import './lablup-expansion';
import LablupExpansion from './lablup-expansion';
import '@material/mwc-button/mwc-button';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-select/mwc-select';
import '@material/mwc-switch/mwc-switch';
import '@material/mwc-textarea/mwc-textarea';
import '@material/mwc-textfield/mwc-textfield';
import '@vaadin/grid/vaadin-grid';
import '@vaadin/grid/vaadin-grid-column';
import '@vaadin/item/vaadin-item';
import { css, CSSResultGroup, html, render } from 'lit';
import { get as _text, translate as _t } from 'lit-translate';
import { customElement, property, query, state } from 'lit/decorators.js';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type BackendAIDialog = HTMLElementTagNameMap['backend-ai-dialog'];
type TextArea = HTMLElementTagNameMap['mwc-textarea'];
type TextField = HTMLElementTagNameMap['mwc-textfield'];
type Switch = HTMLElementTagNameMap['mwc-switch'];
type Select = HTMLElementTagNameMap['mwc-select'];

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
  @property({ type: Object }) _boundControlRenderer =
    this._controlRenderer.bind(this);
  @property({ type: Array }) domains;
  @property({ type: Object }) resourceGroupInfo;
  @property({ type: Array }) resourceGroups;
  @property({ type: Array }) schedulerTypes;
  @property({ type: Object }) schedulerOpts;
  @state() private allowedSessionTypes = ['interactive', 'batch', 'inference'];
  // {
  //   'interactive': 'interactive',
  //   'batch': 'batch',
  //   'inference': 'inference',
  //   'general': 'general (interactive, batch)',
  //   'all': 'all (interactive, batch, inference)'
  // };
  @property({ type: Boolean }) enableSchedulerOpts = false;
  @property({ type: Boolean }) enableWSProxyAddr = false;
  @property({ type: Boolean }) enableIsPublic = false;
  @property({ type: Number }) functionCount = 0;
  @query('#resource-group-name') resourceGroupNameInput!: TextField;
  @query('#resource-group-description')
  resourceGroupDescriptionInput!: TextArea;
  @query('#resource-group-domain') resourceGroupDomainSelect!: Select;
  @query('#resource-group-scheduler') resourceGroupSchedulerSelect!: Select;
  @query('#resource-group-active') resourceGroupActiveSwitch!: Switch;
  @query('#resource-group-public') resourceGroupPublicSwitch!: Switch;
  @query('#resource-group-wsproxy-address')
  resourceGroupWSProxyAddressInput!: TextField;
  @query('#allowed-session-types') private allowedSessionTypesSelect;
  @query('#num-retries-to-skip') numberOfRetriesToSkip!: TextField;
  @query('#pending-timeout') timeoutInput!: TextField;
  @query('#delete-resource-group') deleteResourceGroupInput!: TextField;
  @query('#modify-resource-group')
  modifyResourceGroupButton!: HTMLButtonElement;
  @query('#create-resource-group')
  createResourceGroupButton!: HTMLButtonElement;

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

        backend-ai-dialog {
          --component-min-width: 350px;
        }

        backend-ai-dialog mwc-textfield,
        backend-ai-dialog mwc-textarea {
          width: 100%;
          margin: 5px auto 5px auto;
          --mdc-typography-font-family: var(--token-fontFamily);
          --mdc-theme-primary: var(--general-textfield-selected-color);
        }

        mwc-button[raised] {
          margin-left: var(--token-marginXXS);
        }

        mwc-button.full-size,
        mwc-button.full {
          width: 100%;
          margin: 10px auto;
          background-image: none;
          --mdc-button-outline-width: 2px;
        }

        mwc-textarea {
          height: 135px;
        }

        mwc-select {
          width: 100%;
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

        lablup-expansion {
          --expansion-content-padding: 2px;
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
          border-bottom: 1px solid var(--token-colorBorder, #ddd);
        }

        vaadin-grid {
          border: 0;
          font-size: 14px;
          height: calc(100vh - 228px);
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
      `,
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
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          this.enableSchedulerOpts =
            globalThis.backendaiclient.supports('scheduler-opts');
          this.enableWSProxyAddr =
            globalThis.backendaiclient.supports('wsproxy-addr');
          this.enableIsPublic =
            globalThis.backendaiclient.supports('is-public');
          globalThis.backendaiclient.scalingGroup
            .list_available()
            .then((res) => {
              this.resourceGroups = res.scaling_groups;
            })
            .catch((err) => {
              this.notification.text = PainKiller.relieve(err.title);
              this.notification.detail = err.message;
              this.notification.show(true, err);
            });

          globalThis.backendaiclient.domain
            .list()
            .then(({ domains }) => {
              this.domains = domains;
              this.requestUpdate(); // without this render is called beforehands, so update is required
            })
            .catch((err) => {
              this.notification.text = PainKiller.relieve(err.title);
              this.notification.detail = err.message;
              this.notification.show(true, err);
            });
        },
        true,
      );
    } else {
      // already connected
      this.enableSchedulerOpts =
        globalThis.backendaiclient.supports('scheduler-opts');
      this.enableWSProxyAddr =
        globalThis.backendaiclient.supports('wsproxy-addr');
      this.enableIsPublic = globalThis.backendaiclient.supports('is-public');

      globalThis.backendaiclient.scalingGroup
        .list_available()
        .then((res) => {
          this.resourceGroups = res.scaling_groups;
        })
        .catch((err) => {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        });

      globalThis.backendaiclient.domain
        .list()
        .then(({ domains }) => {
          this.domains = domains;
          this.requestUpdate(); // without this render is called beforehands, so update is required
        })
        .catch((err) => {
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
      root,
    );
  }

  _isPublicRenderer(root, column, rowData) {
    render(
      html`
        <lablup-shields
          app=""
          color=${rowData.item.is_public ? 'blue' : 'darkgreen'}
          description=${rowData.item.is_public ? 'public' : 'private'}
          ui="flat"
        ></lablup-shields>
      `,
      root,
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
          <mwc-icon-button
            class="fg green"
            icon="assignment"
            @click=${() => this._launchDetailDialog(rowData.item)}
          ></mwc-icon-button>
          <mwc-icon-button
            class="fg blue"
            icon="settings"
            @click=${() => this._launchModifyDialog(rowData.item)}
          ></mwc-icon-button>
          <mwc-icon-button
            class="fg red"
            icon="delete"
            @click=${() => this._launchDeleteDialog(rowData.item)}
          ></mwc-icon-button>
        </div>
      `,
      root,
    );
  }

  _validateResourceGroupName() {
    const resourceGroupNames = this.resourceGroups.map(
      (resourceGroup) => resourceGroup['name'],
    );
    this.resourceGroupNameInput.validityTransform = (value, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          this.resourceGroupNameInput.validationMessage = _text(
            'resourceGroup.ResourceGroupNameRequired',
          );
          return {
            valid: nativeValidity.valid,
            valueMissing: !nativeValidity.valid,
          };
        } else if (nativeValidity.patternMismatch) {
          this.resourceGroupNameInput.validationMessage = _text(
            'resourceGroup.EnterValidResourceGroupName',
          );
          return {
            valid: nativeValidity.valid,
            patternMismatch: !nativeValidity.valid,
          };
        } else {
          this.resourceGroupNameInput.validationMessage = _text(
            'resourceGroup.EnterValidResourceGroupName',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        }
      } else {
        const isValid = !resourceGroupNames.includes(value);
        if (!isValid) {
          this.resourceGroupNameInput.validationMessage = _text(
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
   * Create resource group(scaling group) and associate resource group(scaling group) with domain.
   * */
  _createResourceGroup() {
    if (
      this.resourceGroupNameInput.checkValidity() &&
      this._verifyCreateSchedulerOpts()
    ) {
      this._saveSchedulerOpts();
      const resourceGroupName = this.resourceGroupNameInput.value;
      const description = this.resourceGroupDescriptionInput.value;
      const scheduler = this.resourceGroupSchedulerSelect.value;
      const isActive = this.resourceGroupActiveSwitch.selected;
      const domain = this.resourceGroupDomainSelect.value;
      const input = {
        description: description,
        is_active: isActive,
        driver: 'static',
        driver_opts: '{}',
        scheduler: scheduler,
      };

      if (this.enableSchedulerOpts) {
        input['scheduler_opts'] = JSON.stringify(this.schedulerOpts);
      }
      if (this.enableWSProxyAddr) {
        const wsproxyAddress = this.resourceGroupWSProxyAddressInput.value;
        input['wsproxy_addr'] = wsproxyAddress;
      }
      if (this.enableIsPublic) {
        input['is_public'] = this.resourceGroupPublicSwitch?.selected;
      }
      globalThis.backendaiclient.scalingGroup
        .create(resourceGroupName, input)
        .then(({ create_scaling_group: res }) => {
          if (res.ok) {
            return globalThis.backendaiclient.scalingGroup.associate_domain(
              domain,
              resourceGroupName,
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
      this._validateResourceGroupName();
      this.resourceGroupNameInput.reportValidity();
      return;
    }
  }

  /**
   * Modify resource group(scaling group) such as description, scheduler, is_active, is_public and name.
   * */
  _modifyResourceGroup() {
    if (this._verifyModifySchedulerOpts() === false) {
      return;
    }
    this._saveSchedulerOpts();
    const description = this.resourceGroupDescriptionInput.value;
    const scheduler = this.resourceGroupSchedulerSelect.value;
    const isActive = this.resourceGroupActiveSwitch.selected;
    const schedulerOptions = this.schedulerOpts;
    const name = this.resourceGroupInfo.name;

    const input = {};
    if (description !== this.resourceGroupInfo.description) {
      input['description'] = description;
    }
    if (scheduler !== this.resourceGroupInfo.scheduler) {
      input['scheduler'] = scheduler;
    }
    if (isActive !== this.resourceGroupInfo.is_active) {
      input['is_active'] = isActive;
    }
    if (this.enableWSProxyAddr) {
      let wsproxy_addr: string = this.resourceGroupWSProxyAddressInput.value;
      if (wsproxy_addr.endsWith('/')) {
        wsproxy_addr = wsproxy_addr.slice(0, wsproxy_addr.length - 1);
      }
      if (wsproxy_addr !== this.resourceGroupInfo.wsproxy_addr) {
        input['wsproxy_addr'] = wsproxy_addr;
      }
    }

    if (this.enableSchedulerOpts) {
      if (schedulerOptions !== this.resourceGroupInfo.scheduler_opts) {
        input['scheduler_opts'] = JSON.stringify(schedulerOptions);
      }
    }

    if (this.enableIsPublic) {
      const isPublic = this.resourceGroupPublicSwitch?.selected;
      if (isPublic !== this.resourceGroupInfo.is_public) {
        input['is_public'] = isPublic;
      }
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
      this.notification.show();
      return;
    }

    globalThis.backendaiclient.scalingGroup
      .delete(name)
      .then(({ delete_scaling_group }) => {
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
    globalThis.backendaiclient.scalingGroup
      .list_available()
      .then(({ scaling_groups }) => {
        this.resourceGroups = scaling_groups;
        this.requestUpdate(); // without this render is called beforehands, so update is required
      });
  }

  /**
   * reset all value to default in scheduler option input form in create dialog.
   * */
  _initializeCreateSchedulerOpts() {
    const schedulerOptsInputForms = this.shadowRoot?.querySelector(
      '#scheduler-options-input-form',
    ) as LablupExpansion;
    this.allowedSessionTypesSelect.items = this.allowedSessionTypes;
    this.allowedSessionTypesSelect.selectedItemList = ['interactive', 'batch'];
    this.resourceGroupSchedulerSelect.value = 'fifo';
    schedulerOptsInputForms.open = false;
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
    switch (name) {
      case 'allowed_session_types':
        this.allowedSessionTypesSelect.items = this.allowedSessionTypes;
        this.allowedSessionTypesSelect.selectedItemList = value;
        break;
      case 'pending_timeout':
        this.timeoutInput.value = value;
        break;
      case 'config':
        this.numberOfRetriesToSkip.value = value['num_retries_to_skip'] ?? '';

        break;
      default:
        // other scheduler options;
        break;
    }
  }

  /**
   * verify create dialog's schedulerOptions key and value.
   *
   * @return {Boolean} key-value is valid => true, key-value is invalid => false
   * */
  _verifyCreateSchedulerOpts() {
    const validityCheckResult = [
      this.timeoutInput,
      this.numberOfRetriesToSkip,
    ].filter((fn) => !fn.checkValidity());
    // Required items
    validityCheckResult.push(
      ...[this.allowedSessionTypesSelect.selectedItemList].filter(
        (fn) => fn.length === 0,
      ),
    );

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
      this.timeoutInput,
      this.numberOfRetriesToSkip,
    ].filter((fn) => !fn.checkValidity());
    // Required items
    validityCheckResult.push(
      ...[this.allowedSessionTypesSelect.selectedItemList].filter(
        (fn) => fn.length === 0,
      ),
    );

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
    this.schedulerOpts['allowed_session_types'] =
      this.allowedSessionTypesSelect.selectedItemList;
    if (this.timeoutInput.value !== '') {
      this.schedulerOpts['pending_timeout'] = this.timeoutInput.value;
    }
    if (this.numberOfRetriesToSkip.value !== '') {
      Object.assign(this.schedulerOpts, {
        config: {
          num_retries_to_skip: this.numberOfRetriesToSkip.value,
        },
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
    this.deleteResourceGroupInput.value = '';
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
      const schedulerOpts = JSON.parse(this.resourceGroupInfo.scheduler_opts);
      Object.entries(schedulerOpts).forEach(([key, value]) => {
        this._initializeModifySchedulerOpts(key, value);
      });
    }
    this._launchDialogById('#resource-group-dialog');
  }

  _validateWsproxyAddress(obj: any) {
    const submitButton =
      this.modifyResourceGroupButton || this.createResourceGroupButton;

    submitButton.disabled = !obj.checkValidity();
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
          @click=${this._launchCreateDialog}
        ></mwc-button>
      </h4>
      <div class="list-wrapper">
        <vaadin-grid
          theme="row-stripes column-borders compact dark"
          aria-label="Job list"
          .items="${this.resourceGroups}"
        >
          <vaadin-grid-column
            frozen
            flex-grow="1"
            header="${_t('resourceGroup.Name')}"
            path="name"
            resizable
          ></vaadin-grid-column>
          <vaadin-grid-column
            flex-grow="1"
            header="${_t('resourceGroup.Description')}"
            path="description"
            resizable
          ></vaadin-grid-column>
          <vaadin-grid-column
            flex-grow="1"
            header="${_t('resourceGroup.ActiveStatus')}"
            resizable
            .renderer=${this._activeStatusRenderer}
          ></vaadin-grid-column>
          <vaadin-grid-column
            flex-grow="1"
            header="${_t('resourceGroup.PublicStatus')}"
            resizable
            .renderer=${this._isPublicRenderer}
          ></vaadin-grid-column>
          <vaadin-grid-column
            flex-grow="1"
            header="${_t('resourceGroup.Driver')}"
            path="driver"
            resizable
          ></vaadin-grid-column>
          <vaadin-grid-column
            flex-grow="1"
            header="${_t('resourceGroup.Scheduler')}"
            path="scheduler"
            resizable
          ></vaadin-grid-column>
          ${this.enableWSProxyAddr
            ? html`
                <vaadin-grid-column
                  resizable
                  header="${_t('resourceGroup.WsproxyAddress')}"
                  path="wsproxy_addr"
                  resizable
                ></vaadin-grid-column>
              `
            : html``}
          <vaadin-grid-column
            frozen-to-end
            resizable
            width="150px"
            header="${_t('general.Control')}"
            .renderer=${this._boundControlRenderer}
          ></vaadin-grid-column>
        </vaadin-grid>
      </div>
      <backend-ai-dialog
        id="resource-group-dialog"
        fixed
        backdrop
        blockscrolling
      >
        <span slot="title">
          ${this.resourceGroupInfo?.name
            ? _t('resourceGroup.ModifyResourceGroup')
            : _t('resourceGroup.CreateResourceGroup')}
        </span>
        <div slot="content" class="login-panel intro centered">
          ${Object.keys(this.resourceGroupInfo).length === 0
            ? html`
                <mwc-select
                  required
                  id="resource-group-domain"
                  label="${_t('resourceGroup.SelectDomain')}"
                >
                  ${this.domains.map(
                    (domain, idx) => html`
                      <mwc-list-item
                        value="${domain.name}"
                        ?selected=${idx === 0}
                      >
                        ${domain.name}
                      </mwc-list-item>
                    `,
                  )}
                </mwc-select>
                <mwc-textfield
                  type="text"
                  id="resource-group-name"
                  label="${_t('resourceGroup.ResourceGroupName')}"
                  maxLength="64"
                  placeholder="${_t('maxLength.64chars')}"
                  required
                  autoValidate
                  pattern="^[\\p{L}\\p{N}]+(?:[\\-_.][\\p{L}\\p{N}]+)*$"
                  @input="${() => this._validateResourceGroupName()}"
                ></mwc-textfield>
              `
            : html`
                <mwc-textfield
                  type="text"
                  disabled
                  label="${_t('resourceGroup.ResourceGroupName')}"
                  value="${this.resourceGroupInfo?.name}"
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
          <mwc-select
            id="resource-group-scheduler"
            label="${_t('resourceGroup.SelectScheduler')}"
            required
            value="${Object.keys(this.resourceGroupInfo).length === 0
              ? 'fifo'
              : this.resourceGroupInfo.scheduler}"
          >
            ${this.schedulerTypes.map(
              (sched) => html`
                <mwc-list-item value="${sched}">${sched}</mwc-list-item>
              `,
            )}
          </mwc-select>
          <backend-ai-multi-select
            open-up
            required
            id="allowed-session-types"
            label="${_t('resourceGroup.AllowedSessionTypes')}*"
            validation-message="${_t(
              'credential.validation.PleaseSelectOptions',
            )}"
            style="width:100%; --select-title-padding-left: 16px;"
          ></backend-ai-multi-select>
          ${this.enableWSProxyAddr
            ? html`
                <mwc-textfield
                  id="resource-group-wsproxy-address"
                  type="url"
                  label="${_t('resourceGroup.WsproxyAddress')}"
                  placeholder="http://localhost:10200"
                  value="${this.resourceGroupInfo?.wsproxy_addr ?? ''}"
                  autoValidate
                  validationMessage="${_t('registry.DescURLFormat')}"
                  @input="${(e) => {
                    this._addInputValidator(e.target);
                    this._validateWsproxyAddress(e.target);
                  }}"
                ></mwc-textfield>
              `
            : html``}
          <div class="horizontal layout flex wrap center justified">
            <p style="margin-left: 18px;">${_t('resourceGroup.Active')}</p>
            <mwc-switch
              id="resource-group-active"
              style="margin-right:10px;"
              ?selected="${Object.keys(this.resourceGroupInfo).length > 0
                ? this.resourceGroupInfo.is_active
                : true}"
            ></mwc-switch>
            ${this.enableIsPublic
              ? html`
                  <p style="margin-left: 18px;">
                    ${_t('resourceGroup.Public')}
                  </p>
                  <mwc-switch
                    id="resource-group-public"
                    style="margin-right:10px;"
                    ?selected="${Object.keys(this.resourceGroupInfo).length > 0
                      ? this.resourceGroupInfo.is_public
                      : true}"
                  ></mwc-switch>
                `
              : html``}
          </div>
          ${this.enableSchedulerOpts
            ? html`
                <br />
                <lablup-expansion id="scheduler-options-input-form">
                  <span slot="title">
                    ${_t('resourceGroup.SchedulerOptions')}
                  </span>
                  <div class="vertical layout flex">
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
                      value="${this.resourceGroupInfo?.scheduler_opts
                        ?.pending_timeout ?? ''}"
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
                      value="${this.resourceGroupInfo?.scheduler_opts?.config
                        ?.num_retries_to_skip ?? ''}"
                    ></mwc-textfield>
                  </div>
                </lablup-expansion>
              `
            : html``}
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          ${Object.keys(this.resourceGroupInfo).length > 0
            ? html`
                <mwc-button
                  id="modify-resource-group"
                  class="full"
                  unelevated
                  icon="save"
                  label="${_t('button.Save')}"
                  @click="${this._modifyResourceGroup}"
                ></mwc-button>
              `
            : html`
                <mwc-button
                  id="create-resource-group"
                  class="full"
                  unelevated
                  icon="add"
                  label="${_t('button.Create')}"
                  @click="${this._createResourceGroup}"
                ></mwc-button>
              `}
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog
        id="delete-resource-group-dialog"
        fixed
        backdrop
        blockscrolling
      >
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
            label="${_t('button.Cancel')}"
            @click="${(e) => this._hideDialog(e)}"
          ></mwc-button>
          <mwc-button
            raised
            class="warning fg red"
            label="${_t('button.Delete')}"
            @click="${this._deleteResourceGroup}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog
        id="resource-group-detail-dialog"
        fixed
        backdrop
        blockscrolling
      >
        ${Object.keys(this.resourceGroupInfo).length > 0
          ? html`
              <span slot="title" class="horizontal center layout">
                <span style="margin-right:15px;">
                  ${_text('resourceGroup.ResourceGroupDetail')}
                </span>
              </span>
              <div slot="content" class="intro">
                <div class="horizontal layout" style="margin-bottom:15px;">
                  <div style="width:250px;">
                    <h4>${_text('credential.Information')}</h4>
                    <div role="listbox" class="vertical layout">
                      <vaadin-item>
                        <div>
                          <strong>${_text('resourceGroup.Name')}</strong>
                        </div>
                        <div class="scheduler-option-value">
                          ${this.resourceGroupInfo.name}
                        </div>
                      </vaadin-item>
                      <vaadin-item>
                        <div>
                          <strong>
                            ${_text('resourceGroup.ActiveStatus')}
                          </strong>
                        </div>
                        <lablup-shields
                          app=""
                          color=${this.resourceGroupInfo.is_active
                            ? 'green'
                            : 'red'}
                          description=${this.resourceGroupInfo?.is_active
                            ? 'active'
                            : 'inactive'}
                          ui="flat"
                        ></lablup-shields>
                      </vaadin-item>
                      ${this.enableIsPublic
                        ? html`
                            <vaadin-item>
                              <div>
                                <strong>
                                  ${_text('resourceGroup.PublicStatus')}
                                </strong>
                              </div>
                              <lablup-shields
                                app=""
                                color=${this.resourceGroupInfo.is_public
                                  ? 'blue'
                                  : 'darkgreen'}
                                description=${this.resourceGroupInfo?.is_public
                                  ? 'public'
                                  : 'private'}
                                ui="flat"
                              ></lablup-shields>
                            </vaadin-item>
                          `
                        : html``}
                      <vaadin-item>
                        <div>
                          <strong>${_text('resourceGroup.Driver')}</strong>
                        </div>
                        <div class="scheduler-option-value">
                          ${this.resourceGroupInfo?.driver}
                        </div>
                      </vaadin-item>
                      <vaadin-item>
                        <div>
                          <strong>${_text('resourceGroup.Scheduler')}</strong>
                        </div>
                        <div class="scheduler-option-value">
                          ${this.resourceGroupInfo?.scheduler}
                        </div>
                      </vaadin-item>
                      ${this.enableWSProxyAddr
                        ? html`
                            <vaadin-item>
                              <div>
                                <strong>
                                  ${_text('resourceGroup.WsproxyAddress')}
                                </strong>
                              </div>
                              <div class="scheduler-option-value">
                                ${this.resourceGroupInfo?.wsproxy_addr ??
                                'none'}
                              </div>
                            </vaadin-item>
                          `
                        : html``}
                    </div>
                  </div>
                  <div class="center vertial layout" style="width:250px;">
                    <div>
                      <h4 class="horizontal center layout">
                        ${_t('resourceGroup.SchedulerOptions')}
                      </h4>
                      <div role="listbox">
                        ${this.enableSchedulerOpts
                          ? html`
                              ${Object.entries(
                                JSON.parse(
                                  this.resourceGroupInfo?.scheduler_opts,
                                ),
                              ).map(([key, value]: any) => {
                                if (key === 'allowed_session_types') {
                                  return html`
                                    <vaadin-item>
                                      <div>
                                        <strong>allowed session types</strong>
                                      </div>
                                      <div class="scheduler-option-value">
                                        ${value.join(', ')}
                                      </div>
                                    </vaadin-item>
                                  `;
                                } else if (key === 'pending_timeout') {
                                  return html`
                                    <vaadin-item>
                                      <div>
                                        <strong>pending timeout</strong>
                                      </div>
                                      <div class="scheduler-option-value">
                                        ${value +
                                        ' ' +
                                        _text('resourceGroup.TimeoutSeconds')}
                                      </div>
                                    </vaadin-item>
                                  `;
                                } else if (key === 'config') {
                                  if (value['num_retries_to_skip']) {
                                    return html`
                                      <vaadin-item>
                                        <div>
                                          <strong>
                                            # retries to skip pending session
                                          </strong>
                                        </div>
                                        <div class="scheduler-option-value">
                                          ${value['num_retries_to_skip'] +
                                          ' ' +
                                          _text('resourceGroup.RetriesToSkip')}
                                        </div>
                                      </vaadin-item>
                                    `;
                                  } else {
                                    return '';
                                  }
                                } else {
                                  return '';
                                }
                              })}
                            `
                          : html``}
                      </div>
                    </div>
                    <div>
                      <h4 class="horizontal center layout">
                        ${_t('resourceGroup.DriverOptions')}
                      </h4>
                      <div role="listbox"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4>${_t('resourceGroup.Description')}</h4>
                  <mwc-textarea
                    readonly
                    value="${this.resourceGroupInfo?.description ?? ''}"
                  ></mwc-textarea>
                </div>
              </div>
            `
          : ``}
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-resource-group-list': BackendAIResourceGroupList;
  }
}
