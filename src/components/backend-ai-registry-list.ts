/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import '../plastics/lablup-shields/lablup-shields';
import {
  IronFlex,
  IronFlexAlignment,
} from '../plastics/layout/iron-flex-layout-classes';
import './backend-ai-dialog';
import { BackendAiStyles } from './backend-ai-general-styles';
import BackendAIIndicator from './backend-ai-indicator';
import BackendAIIndicatorPool from './backend-ai-indicator-pool';
import BackendAIListStatus, { StatusCondition } from './backend-ai-list-status';
import { BackendAIPage } from './backend-ai-page';
import { default as PainKiller } from './backend-ai-painkiller';
import '@material/mwc-button/mwc-button';
import '@material/mwc-icon-button';
import '@material/mwc-list/mwc-list-item';
import { Select } from '@material/mwc-select/mwc-select';
import '@material/mwc-switch/mwc-switch';
import '@material/mwc-textfield';
import { TextField } from '@material/mwc-textfield';
import '@vaadin/grid/vaadin-grid';
import { css, CSSResultGroup, html, render } from 'lit';
import { get as _text, translate as _t } from 'lit-translate';
import { customElement, query } from 'lit/decorators.js';

/**
 Backend AI Registry List

 `backend-ai-registry-list` manages registries.

  @group Backend.AI Web UI
  @element backend-ai-release-check
*/

@customElement('backend-ai-registry-list')
class BackendAIRegistryList extends BackendAIPage {
  private _listCondition: StatusCondition = 'loading';
  private _allowed_registries: Array<object>;
  private _editMode = false;
  private _hostnames: Array<string>;
  private _indicator!: BackendAIIndicatorPool;
  private _registryList: Array<Record<string, unknown>>;
  private _registryType = 'docker';
  private static _registryTypes: Array<string> = [
    'docker',
    'harbor',
    'harbor2',
  ];
  private _selectedIndex = -1;

  /* Renderer function for grid table */
  private _boundIsEnabledRenderer = this._isEnabledRenderer.bind(this);
  private _boundControlsRenderer = this._controlsRenderer.bind(this);
  private _boundPasswordRenderer = this._passwordRenderer.bind(this);

  @query('#list-status') private _listStatus!: BackendAIListStatus;
  @query('#configure-registry-hostname') private _hostnameInput!: TextField;
  @query('#configure-registry-password') private _passwordInput!: TextField;
  @query('#configure-project-name') private _projectNameInput!: TextField;
  @query('#select-registry-type') private _selectedRegistryTypeInput!: Select;
  @query('#configure-registry-url') private _urlInput!: TextField;
  @query('#configure-registry-username') private _usernameInput!: TextField;

  constructor() {
    super();
    this._allowed_registries = [];
    this._editMode = false;
    this._hostnames = [];
    this._registryList = [];
  }

  public static override get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        vaadin-grid {
          border: 0;
          font-size: 14px;
          height: calc(100vh - 229px);
        }

        h4 {
          font-weight: 200;
          font-size: 14px;
          margin: 0px;
          padding: 5px 15px 5px 20px;
        }

        backend-ai-dialog {
          --component-min-width: 350px;
        }
        mwc-textfield.hostname {
          width: 100%;
        }
        mwc-textfield.helper-text {
          margin-bottom: 0;
        }

        mwc-select#select-registry-type {
          width: 100%;
          --mdc-select-fill-color: transparent;
          --mdc-theme-primary: var(--general-textfield-selected-color);
          --mdc-menu-max-width: 362px;
          --mdc-menu-min-width: 362px;
        }

        mwc-list-item {
          height: 30px;
          --mdc-list-item-graphic-margin: 0px;
        }

        input#registry-password {
          border: none;
          background: none;
          pointer-events: none;
        }

        mwc-button,
        mwc-button[unelevated] {
          background-image: none;
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-theme-on-primary: var(--general-button-color);
          --mdc-typography-font-family: var(--token-fontFamily);
        }
      `,
    ];
  }

  /**
   * Invoked when the element is first updated. Implement to perform one time
   * work on the element after update.
   */
  protected override firstUpdated() {
    this.notification = globalThis.lablupNotification;
    this._indicator = globalThis.lablupIndicator as BackendAIIndicatorPool;
    this._projectNameInput.validityTransform = (value, nativeValidity) => {
      return this._checkValidationMsgOnProjectNameInput(value, nativeValidity);
    };
  }

  /**
   * Parse registry list according to whether obj[hostname] is string or not.
   *
   * @param {Object} obj - registry list
   * @return {Record<string, unknown>} Parsed registry list
   * */
  _parseRegistryList(obj) {
    const isString = (val): boolean =>
      typeof val === 'string' || val instanceof String;
    return Object.keys(obj).map((hostname) =>
      isString(obj[hostname])
        ? {
            '': obj[hostname],
            hostname,
          }
        : {
            ...obj[hostname],
            hostname,
          },
    );
  }

  /**
   * Request and Retrieve registry lists from server allowed in the current domain
   */
  _refreshRegistryList() {
    this._listCondition = 'loading';
    this._listStatus?.show();
    globalThis.backendaiclient.domain
      .get(globalThis.backendaiclient._config.domainName, [
        'allowed_docker_registries',
      ])
      .then((response) => {
        this._allowed_registries = response.domain.allowed_docker_registries;
        return globalThis.backendaiclient.registry.list();
      })
      .then(({ result }) => {
        this._registryList = this._parseRegistryList(result);
        if (this._registryList.length == 0) {
          this._listCondition = 'no-data';
        } else {
          this._listStatus?.hide();
        }
        this._hostnames = this._registryList.map((value) => {
          return value.hostname;
        }) as string[];
        this.requestUpdate();
      });
  }

  /**
   * Change view state. If disconnected, try connecting.
   *
   * @param {Boolean} active - whether view state change or not
   * */
  public override async _viewStateChanged(active) {
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
          this._refreshRegistryList();
        },
        true,
      );
    } else {
      // already connected
      this._refreshRegistryList();
    }
  }

  /**
   * Add registry with validation
   *
   * For now, both add and modify operations for registry result in "add(put)" operation on server-side eventually.
   * Therefore the name of function will be maintained as "_addRegistry"
   * */
  private _addRegistry() {
    // somehow type casting is needed to prevent errors, unlike similar use cases in other files
    const hostname = this._hostnameInput.value;
    const url = this._urlInput.value;
    const username = this._usernameInput.value;
    const password = this._passwordInput.value;
    const registryType = this._selectedRegistryTypeInput.value;
    const projectName = this._projectNameInput.value.replace(/\s/g, '');

    if (!this._hostnameInput.validity.valid) {
      return;
    }

    if (!this._urlInput.validity.valid) {
      return;
    }

    const input = {};
    input[''] = url;

    if (username !== '' && password !== '') {
      input['username'] = username;
      input['password'] = password;
    }

    input['type'] = registryType;
    if (['harbor', 'harbor2'].includes(registryType)) {
      if (projectName && projectName !== '') {
        input['project'] = projectName;
      } else {
        return;
      }
    } else {
      input['project'] = '';
    }

    // if hostname already exists
    if (!this._editMode && this._hostnames.includes(hostname)) {
      this.notification.text = _text('registry.RegistryHostnameAlreadyExists');
      this.notification.show();
      return;
    }

    globalThis.backendaiclient.registry
      .set(hostname, input)
      .then(({ result }) => {
        if (result === 'ok') {
          if (this._editMode) {
            this.notification.text = _text(
              'registry.RegistrySuccessfullyModified',
            );
          } else {
            this.notification.text = _text(
              'registry.RegistrySuccessfullyAdded',
            );
            // add
            this._hostnames.push(hostname);
            this._resetRegistryField();
          }
          this._refreshRegistryList();
        } else {
          this.notification.text = _text('dialog.ErrorOccurred');
        }
        this._hideDialogById('#configure-registry-dialog');
        this.notification.show();
      });
  }

  /**
   * Delete registry from allowed registry list corresponding to the current domain by user input on delete registry dialog
   * */
  private _deleteRegistry() {
    const deleteRegistryInputField: TextField = this.shadowRoot?.querySelector(
      '#delete-registry',
    ) as TextField;
    const registryNameToDelete: string = deleteRegistryInputField.value;
    if (
      this._registryList[this._selectedIndex].hostname === registryNameToDelete
    ) {
      globalThis.backendaiclient.registry
        .delete(deleteRegistryInputField.value)
        .then(({ result }) => {
          if (result === 'ok') {
            this.notification.text = _text(
              'registry.RegistrySuccessfullyDeleted',
            );
            // remove the hostname from allowed registries if it contains deleting registry.
            if (this._hostnames.includes(registryNameToDelete)) {
              this._hostnames.splice(
                this._hostnames.indexOf(registryNameToDelete),
              );
            }
            this._refreshRegistryList();
          } else {
            this.notification.text = _text('dialog.ErrorOccurred');
          }
          this._hideDialogById('#delete-registry-dialog');
          this.notification.show();
        });
    } else {
      this.notification.text = _text('registry.HostnameDoesNotMatch');
      this.notification.show();
    }
    // remove written hostname
    deleteRegistryInputField.value = '';
  }

  /**
   * Rescan the images if registry has been updated.
   * */
  private async _rescanImage() {
    const indicator: BackendAIIndicator =
      await this._indicator.start('indeterminate');
    indicator.set(10, _text('registry.UpdatingRegistryInfo'));
    globalThis.backendaiclient.maintenance
      .rescan_images(this._registryList[this._selectedIndex]['hostname'])
      .then(({ rescan_images }) => {
        if (rescan_images.ok) {
          indicator.set(0, _text('registry.RescanImages'));
          const sse: EventSource =
            globalThis.backendaiclient.maintenance.attach_background_task(
              rescan_images.task_id,
            );
          sse.addEventListener('bgtask_updated', (e) => {
            const data = JSON.parse(e['data']);
            const ratio = data.current_progress / data.total_progress;
            indicator.set(100 * ratio, _text('registry.RescanImages'));
          });
          sse.addEventListener('bgtask_done', () => {
            const event = new CustomEvent('image-rescanned');
            document.dispatchEvent(event);
            indicator.set(100, _text('registry.RegistryUpdateFinished'));
            sse.close();
          });
          sse.addEventListener('bgtask_failed', (e) => {
            console.log('bgtask_failed', e['data']);
            sse.close();
            throw new Error('Background Image scanning task has failed');
          });
          sse.addEventListener('bgtask_cancelled', () => {
            sse.close();
            throw new Error(
              'Background Image scanning task has been cancelled',
            );
          });
        } else {
          indicator.set(50, _text('registry.RegistryUpdateFailed'));
          indicator.end(1000);
          this.notification.text = PainKiller.relieve(rescan_images.msg);
          this.notification.detail = rescan_images.msg;
          this.notification.show();
        }
      })
      .catch((err) => {
        console.log(err);
        indicator.set(50, _text('registry.RescanFailed'));
        indicator.end(1000);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      });
  }

  /**
   * Open dialog by element id
   *
   * @param {string} id - element id starts from `#`
   */
  private _launchDialogById(id) {
    this.shadowRoot?.querySelector(id).show();
  }

  /**
   * Hide dialog by element id
   *
   * @param {string} id - element id starts from `#`
   */
  private _hideDialogById(id) {
    this.shadowRoot?.querySelector(id).hide();
  }

  /**
   * Open create registry dialog with initial value
   * NOTE: Initial registry type is `docker`.
   */
  private _openCreateRegistryDialog() {
    this._editMode = false;
    this._selectedIndex = -1;
    this._registryType = 'docker';
    this.requestUpdate(); // call for explicit update
    this._launchDialogById('#configure-registry-dialog');
  }

  /**
   * Open registry configuration dialog by hostname
   *
   * @param {string} hostname
   */
  private _openEditRegistryDialog(hostname: string) {
    this._editMode = true;
    let registryInfo;
    for (let i = 0; i < this._registryList.length; i++) {
      if (this._registryList[i].hostname === hostname) {
        registryInfo = this._registryList[i];
        break;
      }
    }
    if (!registryInfo) {
      globalThis.notification.show(`No such registry hostname: ${hostname}`);
      return;
    }
    this._registryList[this._selectedIndex] = registryInfo;
    this._registryType = this._registryList[this._selectedIndex]
      ?.type as string;
    this.requestUpdate(); // call for explicit update
    this._launchDialogById('#configure-registry-dialog');
  }

  /**
   * Hide/Show validation msg on registry URL input in registry URL dialog
   * Hide when the registry URL is a valid URL format and the protocol is either "http" or "https"
   * Show and validate when registry URL is a invalid URL format or protocol is neither "http" nor "https"
   */
  private _checkValidationMsgOnRegistryUrlInput(ev) {
    try {
      const registryUrl = new URL(this._urlInput.value);
      if (
        registryUrl.protocol === 'http:' ||
        registryUrl.protocol === 'https:'
      ) {
        ev.target.setCustomValidity('');
      } else {
        ev.target.setCustomValidity(_t('registry.DescURLStartString'));
      }
    } catch (err) {
      ev.target.setCustomValidity(_t('import.WrongURLType'));
    }
  }

  /**
   * Hide/Show validation msg on project name input in registry configuration dialog
   * Hide when registry is "docker", Show and validate when registry is "harbor" or "harbor2"
   */
  private _checkValidationMsgOnProjectNameInput(value, nativeValidity) {
    this._projectNameInput.value = this._projectNameInput.value.replace(
      /\s/g,
      '',
    );
    if (['harbor', 'harbor2'].includes(this._registryType)) {
      if (!this._projectNameInput.value) {
        this._projectNameInput.validationMessage = _text(
          'registry.ProjectNameIsRequired',
        );
      }
      this._projectNameInput.disabled = false;
    } else {
      this._projectNameInput.validationMessage = _text(
        'registry.ForHarborOnly',
      );
      this._projectNameInput.disabled = true;
    }
    return {};
  }

  /**
   * Toggle registry enabled/disabled triggered by switch on/off
   *
   * @param {Event} e - click the switch button
   * @param {string} hostname - hostname of current registry row
   */
  private _toggleRegistryEnabled(e, hostname) {
    if (!e.target.selected) {
      this._changeRegistryState(hostname, false);
    } else {
      this._changeRegistryState(hostname, true);
    }
  }

  /**
   * Toggle display of validation msg and the content of validation msg by the type of registry
   */
  private _toggleProjectNameInput() {
    this._registryType = this._selectedRegistryTypeInput.value;
    this._checkValidationMsgOnProjectNameInput(true, true); // Toss mock values to re-render the project name textfield.
    // this._toggleValidationMsgOnProjectNameInput();
  }

  /**
   * Reset registry input fields in registry configuration dialog
   */
  private _resetRegistryField() {
    /**
     * FIXME: need to change repetitive value manipulation in future.
     */
    this._hostnameInput.value = '';
    this._urlInput.value = '';
    this._usernameInput.value = '';
    this._passwordInput.value = '';
    this._selectedRegistryTypeInput.value = '';
    this._projectNameInput.value = '';
    this.requestUpdate(); // call for explicit update
  }

  /**
   * Add/Remove registry as an element of list to refresh(update) when state is true.
   * Disabled when state is false.
   *
   * @param {string} hostname
   * @param {boolean} state
   * */
  private _changeRegistryState(hostname, state: boolean) {
    if (state === true) {
      this._allowed_registries.push(hostname);
      this.notification.text = _text('registry.RegistryTurnedOn');
    } else {
      const index = this._allowed_registries.indexOf(hostname);
      if (index !== 1) {
        this._allowed_registries.splice(index, 1);
      }
      this.notification.text = _text('registry.RegistryTurnedOff');
    }
    globalThis.backendaiclient.domain
      .update(globalThis.backendaiclient._config.domainName, {
        allowed_docker_registries: this._allowed_registries,
      })
      .then((response) => {
        this.notification.show();
      });
  }

  /**
   * Render hostname (string) usually represented by string without protocol of registry url.
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   */
  private _hostNameRenderer(root: HTMLElement, column: HTMLElement, rowData) {
    render(
      html`
        <div>${decodeURIComponent(rowData.item['hostname'])}</div>
      `,
      root,
    );
  }

  /**
   * Render registry url (string) starts from http or https protocol.
   *
   * For now, the key itself represents registry url received from server-side is ''(empty string).
   * Therefore to extract from the rowData, we need to use 'empty string'.
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   */
  private _registryUrlRenderer(
    root: HTMLElement,
    column: HTMLElement,
    rowData,
  ) {
    render(
      html`
        <div>${rowData.item['']}</div>
      `,
      root,
    );
  }

  /**
   * Render string to special character used for password handling
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   */
  private _passwordRenderer(root: HTMLElement, column?: HTMLElement, rowData?) {
    render(
      html`
        <div>
          <input
            type="password"
            id="registry-password"
            readonly
            value="${rowData.item['password']}"
          />
        </div>
      `,
      root,
    );
  }

  /**
   * Render a switch to check that registry is turned on or off.
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  private _isEnabledRenderer(root: HTMLElement, column: HTMLElement, rowData) {
    render(
      html`
        <div>
          <mwc-switch
            @click="${(e) =>
              this._toggleRegistryEnabled(e, rowData.item['hostname'])}"
            ?selected="${this._allowed_registries.includes(
              rowData.item['hostname'],
            )}"
          ></mwc-switch>
        </div>
      `,
      root,
    );
  }

  /**
   * Render control units - delete (delete registry), refresh (rescan image).
   *
   * @param {element} root - the row details content DOM element
   * @param {element} column - the column element that controls the state of the host element
   * @param {object} rowData - the object with the properties related with the rendered item
   * */
  private _controlsRenderer(root: HTMLElement, column: HTMLElement, rowData) {
    render(
      html`
        <div
          icon="settings"
          id="controls"
          class="layout horizontal flex center"
        >
          <mwc-icon-button
            class="fg blue"
            icon="settings"
            @click=${() => {
              this._selectedIndex = rowData.index;
              this._openEditRegistryDialog(rowData.item.hostname);
            }}
          ></mwc-icon-button>
          <mwc-icon-button
            class="fg red"
            icon="delete"
            @click=${() => {
              this._selectedIndex = rowData.index;
              this._launchDialogById('#delete-registry-dialog');
            }}
          ></mwc-icon-button>
          <mwc-icon-button
            class="fg green"
            icon="refresh"
            @click=${() => {
              this._selectedIndex = rowData.index;
              this._rescanImage();
            }}
          ></mwc-icon-button>
        </div>
      `,
      root,
    );
  }

  /**
   * Invoked on each update to perform rendering tasks. This method may return
   * any value renderable by lit-html's `ChildPart` - typically a
   * `TemplateResult`. Setting properties inside this method will *not* trigger
   * the element to update.
   * @return {TemplateResult<1>} - html
   * */
  protected override render() {
    // language=HTML
    return html`
      <h4 class="horizontal flex center center-justified layout">
        <span>${_t('registry.Registries')}</span>
        <span class="flex"></span>
        <mwc-button
          raised
          id="add-registry"
          label="${_t('registry.AddRegistry')}"
          icon="add"
          @click=${() => this._openCreateRegistryDialog()}
        ></mwc-button>
      </h4>
      <div class="list-wrapper">
        <vaadin-grid
          theme="row-stripes column-borders compact dark"
          aria-label="Registry list"
          .items="${this._registryList}"
        >
          <vaadin-grid-column
            flex-grow="1"
            auto-width
            header="${_t('registry.Hostname')}"
            .renderer=${this._hostNameRenderer}
            resizable
          ></vaadin-grid-column>
          <vaadin-grid-column
            flex-grow="2"
            auto-width
            header="${_t('registry.RegistryURL')}"
            resizable
            .renderer=${this._registryUrlRenderer}
            resizable
          ></vaadin-grid-column>
          <vaadin-grid-column
            flex-grow="0"
            auto-width
            resizable
            header="${_t('registry.Type')}"
            path="type"
            resizable
          ></vaadin-grid-column>
          <vaadin-grid-column
            flex-grow="0"
            auto-width
            resizable
            header="${_t('registry.HarborProject')}"
            path="project"
            resizable
          ></vaadin-grid-column>
          <vaadin-grid-column
            flex-grow="1"
            header="${_t('registry.Username')}"
            path="username"
            resizable
          ></vaadin-grid-column>
          <vaadin-grid-column
            flex-grow="1"
            header="${_t('registry.Password')}"
            .renderer="${this._boundPasswordRenderer}"
            resizable
          ></vaadin-grid-column>
          <vaadin-grid-column
            flex-grow="0"
            width="60px"
            header="${_t('general.Enabled')}"
            .renderer=${this._boundIsEnabledRenderer}
            resizable
          ></vaadin-grid-column>
          <vaadin-grid-column
            frozen-to-end
            width="150px"
            resizable
            header="${_t('general.Control')}"
            .renderer=${this._boundControlsRenderer}
          ></vaadin-grid-column>
        </vaadin-grid>
        <backend-ai-list-status
          id="list-status"
          statusCondition="${this._listCondition}"
          message="${_text('registry.NoRegistryToDisplay')}"
        ></backend-ai-list-status>
      </div>
      <backend-ai-dialog
        id="configure-registry-dialog"
        fixed
        backdrop
        blockscrolling
      >
        <span slot="title">
          ${this._editMode
            ? _t('registry.ModifyRegistry')
            : _t('registry.AddRegistry')}
        </span>
        <div slot="content" class="login-panel intro centered">
          <div class="horizontal center-justified layout flex">
            <mwc-textfield
              id="configure-registry-hostname"
              type="text"
              class="hostname"
              label="${_t('registry.RegistryHostname')}"
              required
              ?disabled="${this._editMode}"
              pattern="^.+$"
              value="${this._registryList[this._selectedIndex]?.hostname || ''}"
              validationMessage="${_t('registry.DescHostnameIsEmpty')}"
            ></mwc-textfield>
          </div>
          <div class="horizontal layout flex">
            <mwc-textfield
              id="configure-registry-url"
              type="url"
              class="hostname"
              label="${_t('registry.RegistryURL')}"
              required
              value="${this._registryList[this._selectedIndex]?.[''] || ''}"
              @change=${this._checkValidationMsgOnRegistryUrlInput}
              @click=${this._checkValidationMsgOnRegistryUrlInput}
            ></mwc-textfield>
          </div>
          <div class="horizontal layout flex">
            <mwc-textfield
              id="configure-registry-username"
              type="text"
              label="${_t('registry.UsernameOptional')}"
              style="padding-right:10px;"
              value="${this._registryList[this._selectedIndex]?.username || ''}"
            ></mwc-textfield>
            <mwc-textfield
              id="configure-registry-password"
              type="password"
              label="${_t('registry.PasswordOptional')}"
              style="padding-left:10px;"
              value="${this._registryList[this._selectedIndex]?.password || ''}"
            ></mwc-textfield>
          </div>
          <mwc-select
            id="select-registry-type"
            label="${_t('registry.RegistryType')}"
            @change=${this._toggleProjectNameInput}
            required
            validationMessage="${_t('registry.PleaseSelectOption')}"
            value="${this._registryList[this._selectedIndex]?.type ||
            this._registryType}"
          >
            ${BackendAIRegistryList._registryTypes.map(
              (item) => html`
                <mwc-list-item
                  value="${item}"
                  ?selected="${this._editMode
                    ? item === this._registryList[this._selectedIndex]?.type
                    : item === 'docker'}"
                >
                  ${item}
                </mwc-list-item>
              `,
            )}
          </mwc-select>
          <div class="vertical layout end-justified">
            <mwc-textfield
              id="configure-project-name"
              class="helper-text"
              type="text"
              label="${_t('registry.ProjectName')}"
              required
              value="${this._registryList[this._selectedIndex]?.project || ''}"
              ?disabled="${this._registryType === 'docker'}"
            ></mwc-textfield>
          </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
            unelevated
            fullwidth
            icon="add"
            label=${this._editMode ? _t('button.Save') : _t('button.Add')}
            @click=${() => this._addRegistry()}
          ></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog
        id="delete-registry-dialog"
        fixed
        backdrop
        blockscrolling
      >
        <span slot="title">${_t('dialog.warning.CannotBeUndone')}</span>
        <div slot="content">
          <mwc-textfield
            id="delete-registry"
            type="text"
            label="${_t('registry.TypeRegistryNameToDelete')}"
          ></mwc-textfield>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
            unelevated
            fullwidth
            icon="delete"
            label="${_t('button.Delete')}"
            @click=${() => this._deleteRegistry()}
          ></mwc-button>
        </div>
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-registry-list': BackendAIRegistryList;
  }
}
