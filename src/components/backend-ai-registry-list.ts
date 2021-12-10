/**
 @license
 Copyright (c) 2015-2018 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html, render} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {BackendAIPage} from './backend-ai-page';

import '@vaadin/vaadin-grid/vaadin-grid';

import '../plastics/lablup-shields/lablup-shields';

import 'weightless/button';
import 'weightless/card';
import 'weightless/icon';
import 'weightless/label';
import 'weightless/textfield';

import '@material/mwc-button/mwc-button';
import '@material/mwc-select/mwc-select';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-switch/mwc-switch';

import './backend-ai-dialog';
import {default as PainKiller} from './backend-ai-painkiller';
import {BackendAiStyles} from './backend-ai-general-styles';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

/**
 Backend AI Registry List

 `backend-ai-registry-list` manages registries.

@group Backend.AI Web UI
 @element backend-ai-release-check
 */

@customElement('backend-ai-registry-list')
class BackendAIRegistryList extends BackendAIPage {
  public registryList: any;
  @property({type: Object}) indicator = Object();
  @property({type: Number}) selectedIndex = 0;
  @property({type: Object}) _boundIsEnabledRenderer = this._isEnabledRenderer.bind(this);
  @property({type: Object}) _boundControlsRenderer = this._controlsRenderer.bind(this);
  @property({type: Object}) _boundPasswordRenderer = this._passwordRenderer.bind(this);
  @property({type: Array}) _registryType;
  @property({type: Array}) allowed_registries;
  @property({type: Array}) hostnames;
  @property({type: Boolean}) editMode = false;

  constructor() {
    super();
    this.registryList = [];
    this._registryType = [];
    this.allowed_registries = [];
    this.hostnames = [];
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

        wl-button {
          --button-bg: var(--paper-yellow-50);
          --button-bg-hover: var(--paper-yellow-100);
          --button-bg-active: var(--paper-yellow-600);
        }

        wl-button.delete {
          --button-bg: var(--paper-red-50);
          --button-bg-hover: var(--paper-red-100);
          --button-bg-active: var(--paper-red-600);
        }

        backend-ai-dialog wl-textfield {
          --input-font-family: var(--general-font-family);
          --input-state-color-invalid: #b00020;
          margin-bottom: 20px;
        }

        backend-ai-dialog {
          --component-min-width: 350px;
        }

        wl-textfield.helper-text {
          margin-bottom: 0px;
        }

        wl-textfield#add-project-name {
          --input-label-space: 20px;
        }

        wl-label.helper-text {
          --label-color: #b00020;
          --label-font-family: 'Ubuntu', Roboto;
          --label-font-size: 11px;
        }

        mwc-select.full-width {
          width: 100%;
        }

        mwc-select.full-width.fixed-position > mwc-list-item {
          width: 330px; // default width
        }

        mwc-select#select-registry-type {
          padding-right: 10px;
          --mdc-select-fill-color: transparent;
          --mdc-theme-primary: var(--general-textfield-selected-color);
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

        mwc-button, mwc-button[unelevated] {
          background-image: none;
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-on-theme-primary: var(--general-button-background-color);
          --mdc-typography-font-family: var(--general-font-family);
        }
      `];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    this.indicator = globalThis.lablupIndicator;
  }

  /**
   * Parse registry list according to whether obj[hostname] is string or not.
   *
   * @param {Object} obj - registry list
   * @return {Record<string, unknown>} Parsed registry list
   * */
  _parseRegistryList(obj) {
    const isString = (val) => typeof val === 'string' || val instanceof String;
    return Object.keys(obj).map((hostname) =>
      isString(obj[hostname]) ?
        {
          '': obj[hostname],
          hostname
        } :
        {
          ...obj[hostname],
          hostname
        });
  }

  _refreshRegistryList() {
    globalThis.backendaiclient.domain.get(globalThis.backendaiclient._config.domainName, ['allowed_docker_registries']).then((response) => {
      this.allowed_registries = response.domain.allowed_docker_registries;
      return globalThis.backendaiclient.registry.list();
    }).then(({result}) => {
      this.registryList = this._parseRegistryList(result);
      this.hostnames = this.registryList.map((value) => {
        return value.hostname;
      });
      this.requestUpdate();
    });
  }

  /**
   * Change view state. If disconnected, try connecting.
   *
   * @param {Boolean} active - whether view state change or not
   * */
  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }

    // If disconnected
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._registryType = ['docker', 'harbor', 'harbor2'];
      }, true);
    } else { // already connected
      this._refreshRegistryList();
      this._registryType = ['docker', 'harbor', 'harbor2'];
    }
  }

  /**
   * Get host name from url
   *
   * @param {string} url - URL containing hostname
   * @return {string} hostname of URL
   * */
  _getHostname(url) {
    const anchor = document.createElement('a');
    anchor.href = url;
    return anchor.hostname;
  }

  /**
   * Add registry with validation
   * */
  _addRegistry() {
    // somehow type casting is needed to prevent errors, unlike similar use cases in other files
    const hostname = (<HTMLInputElement> this.shadowRoot.querySelector('#add-registry-hostname')).value;
    const url = (<HTMLInputElement> this.shadowRoot.querySelector('#add-registry-url')).value;
    const username = (<HTMLInputElement> this.shadowRoot.querySelector('#add-registry-username')).value;
    const password = (<HTMLInputElement> this.shadowRoot.querySelector('#add-registry-password')).value;
    const registerType = this.shadowRoot.querySelector('#select-registry-type').value;
    const projectName = this.shadowRoot.querySelector('#add-project-name').value.replace(/\s/g, '');

    if (!this.shadowRoot.querySelector('#add-registry-hostname').valid) {
      const validationMessage = this.shadowRoot.querySelector('#registry-hostname-validation');
      if (validationMessage) {
        validationMessage.style.display = 'block';
      }
      return;
    }

    if (!this.shadowRoot.querySelector('#add-registry-url').valid) {
      const validationMessage = this.shadowRoot.querySelector('#registry-url-validation');
      if (validationMessage) {
        validationMessage.style.display = 'block';
      }
      return;
    }

    const input = {};
    input[''] = url;

    if (username !== '') {
      input['username'] = username;

      if (password !== '') input['password'] = password;
    }

    input['type'] = registerType;
    if (['harbor', 'harbor2'].includes(registerType)) {
      if (projectName && projectName !== '') {
        input['project'] = projectName;
      } else {
        return;
      }
    }

    // if hostname already exists
    if (this.hostnames.includes(hostname)) {
      this.notification.text = _text('registry.RegistryHostnameAlreadyExists');
      this.notification.show();
      return;
    }

    globalThis.backendaiclient.registry.set(hostname, input)
      .then(({result}) => {
        if (result === 'ok') {
          this.notification.text = _text('registry.RegistrySuccessfullyAdded');
          // add
          this.hostnames.push(hostname);
          this._refreshRegistryList();
        } else {
          this.notification.text = _text('dialog.ErrorOccurred');
        }
        this._hideDialogById('#add-registry-dialog');
        this.notification.show();
      });
  }

  /**
   * Delete registry
   * */
  _deleteRegistry() {
    const name = (<HTMLInputElement> this.shadowRoot.querySelector('#delete-registry')).value;
    if (this.registryList[this.selectedIndex].hostname === name) {
      globalThis.backendaiclient.registry.delete(name)
        .then(({result}) => {
          if (result === 'ok') {
            this.notification.text = _text('registry.RegistrySuccessfullyDeleted');
            // remove the hostname from allowed registries if it contains deleting registry.
            if (this.hostnames.includes(name)) {
              this.hostnames.splice(this.hostnames.indexOf(name));
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
    this.shadowRoot.querySelector('#delete-registry').value = '';
  }

  _modifyRegistry() {
    const hostname = (<HTMLInputElement> this.shadowRoot.querySelector('#modify-registry-hostname')).value;
    const url = (<HTMLInputElement> this.shadowRoot.querySelector('#modify-registry-url')).value;
    const username = (<HTMLInputElement> this.shadowRoot.querySelector('#modify-registry-username')).value;
    const password = (<HTMLInputElement> this.shadowRoot.querySelector('#modify-registry-password')).value;
    const registerType = this.shadowRoot.querySelector('#modify-select-registry-type').value;
    const projectName = this.shadowRoot.querySelector('#modify-project-name').value.replace(/\s/g, '');

    const input: any = Object();

    if (url !== this.registryList[this.selectedIndex]['']) {
      input[''] = url;
    }
    if (username !== this.registryList[this.selectedIndex].username) {
      input.username = username;
    }
    if (password !== this.registryList[this.selectedIndex].password) {
      input.password = password;
    }

    input.type = registerType;
    if (['harbor', 'harbor2'].includes(registerType)) {
      if (projectName && projectName !== '' && projectName !== this.registryList[this.selectedIndex].project) {
        input.project = projectName;
      } else {
        return;
      }
    } else {
      input.project = '';
    }

    if (Object.entries(input).length === 0) {
      this.notification.text = _text('registry.NoChangeMade');
      this.notification.show();

      return;
    }

    globalThis.backendaiclient.registry.set(hostname, input)
      .then(({result}) => {
        if (result === 'ok') {
          this.notification.text = _text('registry.RegistrySuccessfullyModified');
          // modify
          this._refreshRegistryList();
        } else {
          this.notification.text = _text('dialog.ErrorOccurred');
        }
        this._hideDialogById('#modify-registry-dialog');
        this.notification.show();
      });
  }

  /**
   * Rescan the images if registry has been updated.
   * */
  async _rescanImage() {
    const indicator = await this.indicator.start('indeterminate');
    indicator.set(10, _text('registry.UpdatingRegistryInfo'));
    globalThis.backendaiclient.maintenance.rescan_images(this.registryList[this.selectedIndex]['hostname'])
      .then(({rescan_images}) => {
        if (rescan_images.ok) {
          indicator.set(0, _text('registry.RescanImages'));
          const sse: EventSource = globalThis.backendaiclient.maintenance.attach_background_task(rescan_images.task_id);
          sse.addEventListener('bgtask_updated', (e) => {
            const data = JSON.parse(e['data']);
            const ratio = data.current_progress/data.total_progress;
            indicator.set(100 * ratio, _text('registry.RescanImages'));
          });
          sse.addEventListener('bgtask_done', (e) => {
            indicator.set(100, _text('registry.RegistryUpdateFinished'));
            sse.close();
          });
          sse.addEventListener('bgtask_failed', (e) => {
            console.log('bgtask_failed', e['data']);
            sse.close();
            throw new Error('Background Image scanning task has failed');
          });
          sse.addEventListener('bgtask_cancelled', (e) => {
            sse.close();
            throw new Error('Background Image scanning task has been cancelled');
          });
        } else {
          indicator.set(50, _text('registry.RegistryUpdateFailed'));
          indicator.end(1000);
          this.notification.text = PainKiller.relieve(rescan_images.msg);
          this.notification.detail = rescan_images.msg;
          this.notification.show();
        }
      }).catch((err) => {
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

  _showModifyRegistryDetail(id) {
    this.editMode = true;
    return this._launchDialogById(id);
  }

  _showRegistryDetail(id) {
    this.editMode = false;
    return this._launchDialogById(id);
  }

  _launchDialogById(id) {
    this.shadowRoot.querySelector(id).show();
  }

  _hideDialogById(id) {
    this.shadowRoot.querySelector(id).hide();
  }

  _toggleProjectNameInput() {
    const select = this.editMode 
      ? this.shadowRoot.querySelector('#modify-select-registry-type')
      : this.shadowRoot.querySelector('#select-registry-type');
    const projectNameValidationEl = this.editMode
      ? this.shadowRoot.querySelector('#modify-project-name-validation')
      : this.shadowRoot.querySelector('#project-name-validation');
    const projectTextEl = this.editMode 
      ? this.shadowRoot.querySelector('#modify-project-name')
      : this.shadowRoot.querySelector('#add-project-name');
    projectTextEl.disabled = !(select.value && ['harbor', 'harbor2'].includes(select.value));
    projectNameValidationEl.style.display = 'block';
    this._validateProjectName();
  }

  _validateUrl() {
    const url = this.editMode
      ? this.shadowRoot.querySelector('#modify-registry-url')
      : this.shadowRoot.querySelector('#add-registry-url');
    const validationMessage = this.editMode
      ? this.shadowRoot.querySelector('#modify-registry-url-validation')
      : this.shadowRoot.querySelector('#registry-url-validation');
    validationMessage.style.display = url.valid ? 'none' : 'block';
  }

  _validateHostname() {
    const hostname = this.shadowRoot.querySelector('#add-registry-hostname').value;
    const validationMessage = this.shadowRoot.querySelector('#registry-hostname-validation');
    if (hostname && hostname !== '') {
      validationMessage.style.display = 'none';
    } else {
      validationMessage.style.display = 'block';
    }
  }

  _validateProjectName() {
    const projectTextEl = this.editMode 
      ? this.shadowRoot.querySelector('#modify-project-name')
      : this.shadowRoot.querySelector('#add-project-name');
    const projectNameValidationEl = this.editMode
      ? this.shadowRoot.querySelector('#modify-project-name-validation')
      : this.shadowRoot.querySelector('#project-name-validation');
    projectTextEl.value = projectTextEl.value.replace(/\s/g, '');
    if (projectTextEl && projectTextEl.value !== '' && !projectTextEl.disabled) {
      projectNameValidationEl.style.display = 'none';
    } else {
      projectNameValidationEl.style.display = 'block';
      if (projectTextEl.disabled) {
        projectNameValidationEl.textContent = _text('registry.ForHarborOnly');
      } else  {
        projectNameValidationEl.textContent = _text('registry.ProjectNameIsRequired');
      }
    }
  }

  toggleRegistry(e, hostname) {
    if (!e.target.selected) {
      this._changeRegistryState(hostname, false);
    } else {
      this._changeRegistryState(hostname, true);
    }
  }

  /**
   * If state is true, turn on the registry.
   * If state is false, turn off the registry.
   *
   * @param {string} hostname
   * @param {boolean} state
   * */
  _changeRegistryState(hostname, state) {
    if (state === true) {
      this.allowed_registries.push(hostname);
      this.notification.text = _text('registry.RegistryTurnedOn');
    } else {
      const index = this.allowed_registries.indexOf(hostname);
      if (index !== 1) {
        this.allowed_registries.splice(index, 1);
      }
      this.notification.text = _text('registry.RegistryTurnedOff');
    }
    // input.allowed_docker_registries = this.allowed_registries;
    globalThis.backendaiclient.domain.update(globalThis.backendaiclient._config.domainName, {'allowed_docker_registries': this.allowed_registries}).then((response) => {
      this.notification.show();
    });
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

  _hostRenderer(root, column, rowData) {
    render(
      html`
        <div>
          ${decodeURIComponent(rowData.item['hostname'])}
        </div>
      `,
      root
    );
  }

  _registryRenderer(root, column, rowData) {
    render(
      html`
        <div>
          ${rowData.item['']}
        </div>
      `,
      root
    );
  }

  _passwordRenderer(root, column?, rowData?) {
    render(
      html`
        <div>
          <input type="password" id="registry-password" readonly value="[[item.password]]"/>
        </div>
      `
      , root
    );
  }

  /**
   * Render a switch to check that registry is turned on or off.
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  _isEnabledRenderer(root, column, rowData) {
    render(
      html`
        <div>
          <mwc-switch
              @click="${(e) => this.toggleRegistry(e, rowData.item['hostname'])}"
              ?selected="${this.allowed_registries.includes(rowData.item['hostname'])}"></mwc-switch>
        </div>
      `,
      root
    );
  }

  _updateModifyRegistryDialogValues() {
    const hostname = (<HTMLInputElement> this.shadowRoot.querySelector('#modify-registry-hostname'));
    const url = (<HTMLInputElement> this.shadowRoot.querySelector('#modify-registry-url'));
    const username = (<HTMLInputElement> this.shadowRoot.querySelector('#modify-registry-username'));
    const password = (<HTMLInputElement> this.shadowRoot.querySelector('#modify-registry-password'));
    const registerType = this.shadowRoot.querySelector('#modify-select-registry-type');
    const projectName = this.shadowRoot.querySelector('#modify-project-name');

    hostname.value = this.registryList[this.selectedIndex].hostname;
    url.value = this.registryList[this.selectedIndex][''];
    username.value = this.registryList[this.selectedIndex].username || '';
    password.value = this.registryList[this.selectedIndex].password || '';
    registerType.value = this.registryList[this.selectedIndex].type;
    projectName.value = this.registryList[this.selectedIndex].project || '';
  }

  /**
   * Render control units - delete (delete registry), refresh (rescan image).
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  _controlsRenderer(root, column, rowData) {
    render(
      html`
        <div
          icon="settings"
          id="controls"
          class="layout horizontal flex center"
        >
          <wl-button fab flat inverted
            class="fg blue"
            @click=${() => {
    this.selectedIndex = rowData.index;
    this._updateModifyRegistryDialogValues();
    this._showModifyRegistryDetail('#modify-registry-dialog');
  }}>
            <wl-icon>settings</wl-icon>
          </wl-button>

          <wl-button fab flat inverted
            icon="delete"
            class="fg red"
            @click=${() => {
    this.selectedIndex = rowData.index;
    this._launchDialogById('#delete-registry-dialog');
  }}>
            <wl-icon>delete</wl-icon>
          </wl-button>
          <wl-button fab flat inverted
            icon="refresh"
            class="fg green"
            @click=${() => {
    this.selectedIndex = rowData.index;
    this._rescanImage();
  }}>
            <wl-icon>refresh</wl-icon>
          </wl-button>
        </div>
      `,
      root
    );
  }

  render() {
    // language=HTML
    return html`
      <h4 class="horizontal flex center center-justified layout">
        <span>${_t('registry.Registries')}</span>
        <span class="flex"></span>
        <mwc-button raised id="add-registry" label="${_t('registry.AddRegistry')}" icon="add"
            @click=${() => this._showRegistryDetail('#add-registry-dialog')}></mwc-button>
      </h4>

      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Registry list" .items="${this.registryList}">
        <vaadin-grid-column flex-grow="0" width="40px" header="#" text-align="center" .renderer=${this._indexRenderer}>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" auto-width header="${_t('registry.Hostname')}" .renderer=${this._hostRenderer}>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="2" auto-width header="${_t('registry.RegistryURL')}" resizable .renderer=${this._registryRenderer}>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="0" auto-width resizable header="${_t('registry.Type')}" path="type">
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="0" auto-width resizable header="${_t('registry.HarborProject')}" path="project">
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t('registry.Username')}" path="username">
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t('registry.Password')}" .renderer="${this._boundPasswordRenderer}">
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="0" width="60px" header="${_t('general.Enabled')}" .renderer=${this._boundIsEnabledRenderer}></vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t('general.Control')}" .renderer=${this._boundControlsRenderer}>
        </vaadin-grid-column>
      </vaadin-grid>
      <backend-ai-dialog id="add-registry-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t('registry.AddRegistry')}</span>
        <div slot="content" class="login-panel intro centered">
          <wl-textfield
            id="add-registry-hostname"
            class="helper-text"
            type="text"
            label="${_t('registry.RegistryHostname')}"
            required
            @click=${this._validateHostname}
            @change=${this._validateHostname}
          ></wl-textfield>
          <wl-label class="helper-text" id="registry-hostname-validation" style="display:none;">${_t('registry.DescHostnameIsEmpty')}</wl-label>
          <wl-textfield
            id="add-registry-url"
            class="helper-text"
            label="${_t('registry.RegistryURL')}"
            required
            pattern="^(https?):\/\/(([a-zA-Z\d\.]{2,})\.([a-zA-Z]{2,})|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3})(:((6553[0-5])|(655[0-2])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4})))?$"
            @click=${() => this._validateUrl()}
            @change=${() => this._validateUrl()}
          ></wl-textfield>
          <wl-label class="helper-text" id="registry-url-validation" style="display:none;">${_t('registry.DescURLStartString')}</wl-label>
         <div class="horizontal layout flex">
          <wl-textfield
            id="add-registry-username"
            type="text"
            label="${_t('registry.UsernameOptional')}"
            style="padding-right:10px;"
          ></wl-textfield>
          <wl-textfield
            id="add-registry-password"
            type="password"
            label="${_t('registry.PasswordOptional')}"
            style="padding-left:10px;"
          ></wl-textfield>
         </div>
         <mwc-select class="full-width fixed-position" id="select-registry-type" label="${_t('registry.RegistryType')}"
                      @change=${this._toggleProjectNameInput} required fixedMenuPosition
                      validationMessage="${_t('registry.PleaseSelectOption')}">
            ${this._registryType.map((item) => html`
              <mwc-list-item value="${item}" ?selected="${item === 'docker'}">${item}</mwc-list-item>
            `)}
          </mwc-select>
          <div class="vertical layout end-justified">
              <wl-textfield
                id="add-project-name"
                class="helper-text"
                type="text"
                label="${_t('registry.ProjectName')}"
                required
                @click=${this._validateProjectName}
                @change=${this._validateProjectName}
                ></wl-textfield>
              <wl-label class="helper-text" id="project-name-validation" style="display:block;">${_t('registry.ForHarborOnly')}</wl-label>
         </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button unelevated fullwidth icon="add" label="${_t('button.Add')}"
            @click=${this._addRegistry}></mwc-button>
        </div>
      </backend-ai-dialog>

      <backend-ai-dialog id="delete-registry-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t('dialog.warning.CannotBeUndone')}</span>
        <div slot="content">
          <wl-textfield
            id="delete-registry"
            type="text"
            label="${_t('registry.TypeRegistryNameToDelete')}"
          ></wl-textfield>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button unelevated fullwidth icon="delete" label="${_t('button.Delete')}"
              @click=${this._deleteRegistry}></mwc-button>
        </div>
      </backend-ai-dialog>

      <backend-ai-dialog id="modify-registry-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t("registry.ModifyRegistryConfigurations")}</span>
        <div slot="content" class="login-panel intro centered">
          <wl-textfield
            id="modify-registry-hostname"
            class="helper-text"
            type="text"
            label="${_t("registry.RegistryHostname")}"
            disabled
          ></wl-textfield>
          <wl-textfield
            id="modify-registry-url"
            class="helper-text"
            label="${_t("registry.RegistryURL")}"
            required
            pattern="^(https?):\/\/(([a-zA-Z\d\.]{2,})\.([a-zA-Z]{2,})|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3})(:((6553[0-5])|(655[0-2])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4})))?$";"
            @click=${() => this._validateUrl()}
            @change=${() => this._validateUrl()}
          ></wl-textfield>
          <wl-label class="helper-text" id="modify-registry-url-validation" style="display:none;">${_t(
            "registry.DescURLStartString"
          )}</wl-label>
         <div class="horizontal layout flex">
          <wl-textfield
            id="modify-registry-username"
            type="text"
            label="${_t("registry.UsernameOptional")}"
            style="padding-right:10px;"
          ></wl-textfield>
          <wl-textfield
            id="modify-registry-password"
            type="password"
            label="${_t("registry.PasswordOptional")}"
            style="padding-left:10px;"
          ></wl-textfield>
         </div>
         <mwc-select class="full-width fixed-position" id="modify-select-registry-type" label="${_t("registry.RegistryType")}"
                      @change=${this._toggleProjectNameInput} required fixedMenuPosition
                      validationMessage="${_t("registry.PleaseSelectOption")}"> 
            ${this._registryType.map((item) => html`
                <mwc-list-item value="${item}">${item}</mwc-list-item>
              `
            )}
          </mwc-select>
          <div class="vertical layout end-justified">
            <wl-textfield
              id="modify-project-name"
              class="helper-text"
              type="text"
              label="${_t("registry.ProjectName")}"
              required
              @click=${this._validateProjectName}
              @change=${this._validateProjectName}
            ></wl-textfield>
            <wl-label class="helper-text" id="modify-project-name-validation" style="display:block;"></wl-label>
         </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button unelevated fullwidth icon="check" label="${_t("button.Save")}"
                      @click=${this._modifyRegistry}></mwc-button>
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
