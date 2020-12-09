/**
 @license
 Copyright (c) 2015-2018 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {render} from 'lit-html';
import {BackendAIPage} from './backend-ai-page';

import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid';
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
import {default as PainKiller} from "./backend-ai-painkiller";
import {BackendAiStyles} from "./backend-ai-general-styles";
import {IronFlex, IronFlexAlignment} from "../plastics/layout/iron-flex-layout-classes";

/**
 Backend AI Registry List

 `backend-ai-registry-list` manages registries.

 @group Backend.AI Console
 @element backend-ai-release-check
 */

@customElement("backend-ai-registry-list")
class BackendAIRegistryList extends BackendAIPage {
  public registryList: any;
  @property({type: Object}) indicator = Object();
  @property({type: Number}) selectedIndex = 0;
  @property({type: String}) boundIsEnabledRenderer = this._isEnabledRenderer.bind(this);
  @property({type: String}) boundControlsRenderer = this._controlsRenderer.bind(this);
  @property({type: Array}) _registryType = Array();
  @property({type: Array}) allowed_registries = Array();
  @property({type: Array}) hostnames = Array();

  constructor() {
    super();
    this.registryList = [];
  }

  static get styles() {
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
          --input-font-family: Roboto, Noto, sans-serif;
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
          --label-font-family: Roboto, Noto, sans-serif;
          --label-font-size: 11px;
        }

        mwc-select#select-registry-type {
          width: 100%;
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
   * */
  _parseRegistryList(obj) {
    const isString = (val) => typeof val === "string" || val instanceof String;
    return Object.keys(obj).map(hostname =>
      isString(obj[hostname])
        ? {
          "": obj[hostname],
          hostname
        }
        : {
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
      this.hostnames = this.registryList.map( value => {
        return value.hostname;
      });
      this.requestUpdate();
    })
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
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._registryType = ['docker', 'harbor'];
      }, true);
    } else { // already connected
      this._refreshRegistryList();
      this._registryType = ['docker', 'harbor'];
    }
  }

  /**
   * Get host name from url
   *
   * @param {string} url
   * */
  _getHostname(url) {
    const anchor = document.createElement("a");
    anchor.href = url;

    return anchor.hostname;
  }

  /**
   * Add registry with validation
   * */
  _addRegistry() {
    // somehow type casting is needed to prevent errors, unlike similar use cases in other files
    const hostname = (<HTMLInputElement>this.shadowRoot.querySelector("#add-registry-hostname")).value,
      url = (<HTMLInputElement>this.shadowRoot.querySelector("#add-registry-url")).value,
      username = (<HTMLInputElement>this.shadowRoot.querySelector("#add-registry-username")).value,
      password = (<HTMLInputElement>this.shadowRoot.querySelector("#add-registry-password")).value,
      registerType = this.shadowRoot.querySelector('#select-registry-type').value,
      projectName = this.shadowRoot.querySelector('#add-project-name').value;

    if (!this.shadowRoot.querySelector("#add-registry-hostname").valid) {
      let validationMessage = this.shadowRoot.querySelector("#registry-hostname-validation");
      if (validationMessage) {
        validationMessage.style.display = 'block';
      }
      return;
    }

    if (!this.shadowRoot.querySelector("#add-registry-url").valid) {
      let validationMessage = this.shadowRoot.querySelector("#registry-url-validation");
      if (validationMessage) {
        validationMessage.style.display = 'block';
      }
      return;
    }

    let input = {};
    input[""] = url;

    if (username !== "") {
      input['username'] = username;

      if (password !== "") input['password'] = password;
    }

    input['type'] = registerType;
    if (registerType === 'harbor') {
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

    globalThis.backendaiclient.registry.add(hostname, input)
      .then(({result}) => {
        if (result === "ok") {
          this.notification.text = _text('registry.RegistrySuccessfullyAdded');
          // add 
          this.hostnames.push(hostname);
          this._refreshRegistryList();
        } else {
          this.notification.text = _text('dialog.ErrorOccurred');
        }
        this._hideDialogById("#add-registry-dialog");
        this.notification.show();
      })
  }

  /**
   * Delete registry
   * */
  _deleteRegistry() {
    const name = (<HTMLInputElement>this.shadowRoot.querySelector("#delete-registry")).value;
    if (this.registryList[this.selectedIndex].hostname === name) {
      globalThis.backendaiclient.registry.delete(name)
        .then(({result}) => {
          if (result === "ok") {
            this.notification.text = _text('registry.RegistrySuccessfullyDeleted');
            // remove the hostname from allowed registries if it contains deleting registry.
            if (this.hostnames.includes(name)) {
              this.hostnames.splice(this.hostnames.indexOf(name));
            }
            this._refreshRegistryList();
          } else {
            this.notification.text = _text('dialog.ErrorOccurred');
          }
          this._hideDialogById("#delete-registry-dialog");
          this.notification.show();
        })
    } else {
      this.notification.text = _text('registry.HostnameDoesNotMatch');
      this.notification.show();
    }
    // remove written hostname
    this.shadowRoot.querySelector("#delete-registry").value = '';
  }

  /**
   * Rescan the images if registry has been updated.
   * */
  async _rescanImage() {
    let indicator = await this.indicator.start('indeterminate');
    indicator.set(10, _text('registry.UpdatingRegistryInfo'));
    globalThis.backendaiclient.maintenance.rescan_images(this.registryList[this.selectedIndex]["hostname"])
      .then(({rescan_images}) => {
        if (rescan_images.ok) {
          indicator.set(100, _text('registry.RegistryUpdateFinished'));
        } else {
          indicator.set(50, _text('registry.RegistryUpdateFailed'));
          indicator.end(1000);
          this.notification.text = PainKiller.relieve(rescan_images.msg);
          this.notification.detail = rescan_images.msg;
          this.notification.show();
        }
      }).catch(err => {
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

  _launchDialogById(id) {
    this.shadowRoot.querySelector(id).show();
  }

  _hideDialogById(id) {
    this.shadowRoot.querySelector(id).hide();
  }

  _toggleProjectNameInput() {
    let select = this.shadowRoot.querySelector('#select-registry-type');
    let projectTextEl = this.shadowRoot.querySelector('#add-project-name');
    projectTextEl.disabled = !(select.value && select.value === 'harbor');
    this.shadowRoot.querySelector('#project-name-validation').style.display = 'block';
    if (projectTextEl.disabled) {
      this.shadowRoot.querySelector('#project-name-validation').textContent = _text("registry.ForHarborOnly");
    } else {
      this.shadowRoot.querySelector('#project-name-validation').textContent = _text("registry.ProjectNameIsRequired");
    }
  }

  _validateUrl() {
    let url = this.shadowRoot.querySelector('#add-registry-url');
    let validationMessage = this.shadowRoot.querySelector('#registry-url-validation');
    validationMessage.style.display = url.valid ? 'none' : 'block';
  }

  _validateHostname() {
    let hostname = this.shadowRoot.querySelector('#add-registry-hostname').value;
    let validationMessage = this.shadowRoot.querySelector('#registry-hostname-validation');
    if (hostname && hostname !== '') {
      validationMessage.style.display = 'none';
    } else {
      validationMessage.style.display = 'block';
    }
  }

  _validateProjectName() {
    let projectName = this.shadowRoot.querySelector('#add-project-name').value;
    let validationMessage = this.shadowRoot.querySelector('#project-name-validation');
    if (projectName && projectName !== '') {
      validationMessage.style.display = 'none';
    } else {
      validationMessage.style.display = 'block';
    }
  }

  toggleRegistry(e, hostname) {
    if (!e.target.checked) {
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
      this.notification.text = _text("registry.RegistryTurnedOn");
    } else {
      let index = this.allowed_registries.indexOf(hostname);
      if (index !== 1) {
        this.allowed_registries.splice(index, 1);
      }
      this.notification.text = _text("registry.RegistryTurnedOff");
    }
    //input.allowed_docker_registries = this.allowed_registries;
    globalThis.backendaiclient.domain.update(globalThis.backendaiclient._config.domainName, {'allowed_docker_registries': this.allowed_registries}).then((response) => {
      this.notification.show();
    });
  }

  _indexRenderer(root, column, rowData) {
    let idx = rowData.index + 1;
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
          ${decodeURIComponent(rowData.item["hostname"])}
        </div>
      `,
      root
    )
  }

  _registryRenderer(root, column, rowData) {
    render(
      html`
        <div>
          ${rowData.item[""]}
        </div>
      `,
      root
    )
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
              @change="${(e) => this.toggleRegistry(e, rowData.item["hostname"])}"
              ?checked="${this.allowed_registries.includes(rowData.item["hostname"])}"></mwc-switch>
        </div>
      `,
      root
    )
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
          id="controls"
          class="layout horizontal flex center"
        >
          <wl-button fab flat inverted
            icon="delete"
            class="fg red"
            @click=${() => {
        this.selectedIndex = rowData.index;
        this._launchDialogById("#delete-registry-dialog")
      }}>
                  <wl-icon>delete</wl-icon>

          </wl-button>
          <wl-button fab flat inverted
            icon="refresh"
            class="fg blue"
            @click=${() => {
        this.selectedIndex = rowData.index;
        this._rescanImage();
      }}>
            <wl-icon>refresh</wl-icon>
          </wl-button>
        </div>
      `,
      root
    )
  }

  render() {
    // language=HTML
    return html`
      <h4 class="horizontal flex center center-justified layout">
        <span>${_t("registry.Registries")}</span>
        <span class="flex"></span>
        <mwc-button raised id="add-registry" label="${_t("registry.AddRegistry")}" icon="add"
            @click=${() => this._launchDialogById("#add-registry-dialog")}></mwc-button>
      </h4>

      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Registry list" .items="${this.registryList}">
        <vaadin-grid-column flex-grow="0" width="40px" header="#" text-align="center" .renderer=${this._indexRenderer}>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" auto-width header="${_t("registry.Hostname")}" .renderer=${this._hostRenderer}>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="2" auto-width header="${_t("registry.RegistryURL")}" resizable .renderer=${this._registryRenderer}>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="0" auto-width resizable header="${_t("registry.Type")}">
          <template>
            <div> [[item.type]] </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="0" auto-width resizable header="${_t("registry.HarborProject")}">
          <template>
            <div> [[item.project]] </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t("registry.Username")}">
          <template>
            <div> [[item.username]] </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t("registry.Password")}">
          <template>
            <div>
              <input type="password" id="registry-password" readonly value="[[item.password]]"/>
            </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column flex-grow="0" width="60px" header="${_t("general.Enabled")}" .renderer=${this.boundIsEnabledRenderer}></vaadin-grid-column>
        <vaadin-grid-column flex-grow="1" header="${_t("general.Control")}" .renderer=${this.boundControlsRenderer}>
        </vaadin-grid-column>
      </vaadin-grid>
      <backend-ai-dialog id="add-registry-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t("registry.AddRegistry")}</span>

        <div slot="content" class="login-panel intro centered">
          <wl-textfield
            id="add-registry-hostname"
            class="helper-text"
            type="text"
            label="${_t("registry.RegistryHostname")}"
            required
            @click=${this._validateHostname}
            @change=${this._validateHostname}
          ></wl-textfield>
          <wl-label class="helper-text" id="registry-hostname-validation" style="display:none;">${_t("registry.DescHostnameIsEmpty")}</wl-label>
          <wl-textfield
            id="add-registry-url"
            class="helper-text"
            label="${_t("registry.RegistryURL")}"
            required
            pattern="^(https?):\/\/(([a-zA-Z\d\.]{2,})\.([a-zA-Z]{2,})|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3})(:((6553[0-5])|(655[0-2])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4})))?$";"
            @click=${() => this._validateUrl()}
            @change=${() => this._validateUrl()}
          ></wl-textfield>
          <wl-label class="helper-text" id="registry-url-validation" style="display:none;">${_t("registry.DescURLStartString")}</wl-label>
         <div class="horizontal layout flex">
          <wl-textfield
            id="add-registry-username"
            type="text"
            label="${_t("registry.UsernameOptional")}"
            style="padding-right:10px;"
          ></wl-textfield>
          <wl-textfield
            id="add-registry-password"
            type="password"
            label="${_t("registry.PasswordOptional")}"
            style="padding-left:10px;"
          ></wl-textfield>
         </div>
         <mwc-select id="select-registry-type" label="${_t("registry.RegistryType")}"
                      @change=${this._toggleProjectNameInput} required
                      validationMessage="Please select one option.">
            ${this._registryType.map(item => html`
              <mwc-list-item value="${item}" ?selected="${item === 'docker'}">${item}</mwc-list-item>
            `)}
          </mwc-select>
          <div class="vertical layout end-justified">
              <wl-textfield
              id="add-project-name"
              class="helper-text"
              type="text"
              label="${_t("registry.ProjectName")}"
              required
              @change=${this._validateProjectName}
              ></wl-textfield>
              <wl-label class="helper-text" id="project-name-validation" style="display:block;">${_t("registry.ForHarborOnly")}</wl-label>
         </div>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button unelevated icon="add" label="${_t("button.Add")}"
            @click=${this._addRegistry}></mwc-button>
        </div>
      </backend-ai-dialog>

      <backend-ai-dialog id="delete-registry-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t("dialog.warning.CannotBeUndone")}</span>
        <div slot="content">
          <wl-textfield
            id="delete-registry"
            type="text"
            label="${_t("registry.TypeRegistryNameToDelete")}"
          ></wl-textfield>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button unelevated icon="delete" label="${_t("button.Delete")}"
              @click=${this._deleteRegistry} style="width:100%;"></mwc-button>
        </div>
      </backend-ai-dialog>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-registry-list": BackendAIRegistryList;
  }
}
