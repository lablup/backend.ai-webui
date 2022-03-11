/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {css, CSSResultGroup, html, render} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

import '../../components/backend-ai-dialog';
import '../../components/lablup-activity-panel';
import '../../components/lablup-codemirror';
import {BackendAIPage} from '../../components/backend-ai-page';
import {BackendAiStyles} from '../../components/backend-ai-general-styles';
import {default as PainKiller} from '../../components/backend-ai-painkiller';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../../plastics/layout/iron-flex-layout-classes';
import {default as YAML} from 'js-yaml';

import '@material/mwc-button';
import '@material/mwc-icon/mwc-icon';
import '@material/mwc-list/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-list/mwc-check-list-item';
import '@material/mwc-select';
import '@material/mwc-tab-bar/mwc-tab-bar';
import '@material/mwc-tab/mwc-tab';
import '@material/mwc-textarea';
import '@material/mwc-textfield';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-column';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column';
import '@vaadin/vaadin-grid/vaadin-grid-filter-column';

import 'weightless/expansion';

/**
 Pipeline List

 `pipeline-list` is fetches and lists of created/imported pipelines

 Example:

 <pipeline-list>
 ...
 </pipeline-list>

@group Backend.AI pipeline
 @element pipeline-list
*/
@customElement('pipeline-list')
export default class PipelineList extends BackendAIPage {
  public shadowRoot: any; // ShadowRoot
  @property({type: Array}) pipelineTypes = ['Custom']; // 
  @property({type: Object}) pipelineInfo = Object();
  @property({type: Array}) pipelines = Array();
  @property({type: Object}) userInfo;
  @property({type: Array}) pipelineGrid;
  @property({type: String}) _activeTab = 'pipeline-general';

  // Elements
  @property({type: Object}) spinner = Object();
  @property({type: Object}) notification = Object();
  // Environments
  @property({type: Object}) tags = Object();
  @property({type: Array}) languages;
  @property({type: String}) defaultLanguage = '';
  @property({type: Array}) versions = [];
  @property({type: Boolean}) _defaultLanguageUpdated = false;
  @property({type: Boolean}) _defaultVersionUpdated = false;
  @property({type: String}) scalingGroup = '';
  @property({type: Array}) scalingGroups = ['default'];
  @property({type: String}) vhost = '';
  @property({type: Array}) vhosts = [];
  @property({type: Object}) images = Object();
  @property({type: Object}) imageInfo = Object();
  @property({type: Object}) imageNames = Object();
  @property({type: Object}) resourceLimits = Object();
  @property({type: Object}) supports = Object();
  @property({type: Object}) aliases = Object();
  @property({type: Object}) resourceBroker;
  @property({type: Array}) vfolders;
  @property({type: Array}) selectedVfolders;
  @property({type: Object}) vfolderGrid = Object();

  @property({type: Object}) _boundNameRenderer = this.nameRenderer.bind(this);
  @property({type: Object}) _boundIndexRenderer = this.indexRenderer.bind(this);
  @property({type: Object}) _boundControlRenderer = this.controlRenderer.bind(this);
  @property({type: Object}) _boundCreateAtRenderer = this.createdAtRenderer.bind(this);
  @property({type: Object}) _boundModifiedAtRenderer = this.modifiedAtRenderer.bind(this);

  constructor() {
    super();
    this.pipelines = [];
    this.aliases = {
      'TensorFlow': 'python-tensorflow',
      'NGC-TensorFlow': 'ngc-tensorflow',
      'PyTorch': 'python-pytorch',
      'NGC-PyTorch': 'ngc-pytorch',
      'Lablup Research Env.': 'python-ff',
      'Python': 'python',
    };
    this.languages = [];
    this.vfolders = [];
    this.selectedVfolders = [];
    this.notification = globalThis.lablupNotification;
    this.resourceBroker = globalThis.resourceBroker;
  }

  static get styles(): CSSResultGroup | undefined {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        .description {
          color: black;
        }

        .tab-content {
          width: 100%;
        }

        .title {
          color: #666;
        }

        .pipeline-detail-items {
          margin-bottom: 10px;
        }

        a.pipeline-link:hover {
          color: var(--general-textfield-selected-color);
        }

        backend-ai-dialog {
          --component-min-width: 390px;
          --component-max-width: 390px;
        }

        backend-ai-dialog.yaml {
          --component-min-width: auto;
          --component-max-width: 100%;
        }

        mwc-button {
          margin: 10px;
        }

        mwc-button.full-width {
          width: 100%;
        }

        mwc-select.full-width {
          width: 100%;
          font-family: var(--general-font-family);
          --mdc-theme-primary: var(--general-sidebar-color);
          --mdc-menu-item-height: auto;
          /* Need to be set when fixedMenuPosition attribute is enabled */
          --mdc-menu-max-width: 360px;
          --mdc-menu-min-width: 360px;
        }

        mwc-tab-bar {
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-text-transform: none;
          --mdc-tab-color-default: var(--general-tabbar-background-color);
          --mdc-tab-text-label-color-default: var(--general-tabbar-tab-disabled-color);
        }

        mwc-textfield,
        mwc-textarea {
          width: 100%;
        }

        vaadin-grid {
          max-height: 450px;
        }

        wl-expansion {
          --font-family-serif: var(--general-font-family);
          --expansion-elevation: 0;
          --expansion-elevation-open: 0;
          --expansion-elevation-hover: 0;
          --expansion-header-padding: 16px;
          --expansion-margin-open: 0;
        }

        wl-expansion span[slot="title"] {
          font-size: 12px;
          color: rgb(64, 64, 64);
          font-weight: normal;
        }

        wl-expansion.vfolder {
          --expansion-content-padding: 0;
          border-bottom: 1px;
        }

        wl-expansion span {
          font-size: 20px;
          font-weight: 200;
          display: block;
        }
      `
    ];
  }

  firstUpdated() {
    fetch('resources/image_metadata.json')
      .then(
        (resp) => resp.json()
      )
      .then((json) => {
        this.imageInfo = json.imageInfo;
        for (const key in this.imageInfo) {
          if ({}.hasOwnProperty.call(this.imageInfo, key)) {
            this.tags[key] = [];
            if ('name' in this.imageInfo[key]) {
              this.aliases[key] = this.imageInfo[key].name;
              this.imageNames[key] = this.imageInfo[key].name;
            }
            if ('label' in this.imageInfo[key]) {
              this.imageInfo[key].label.forEach((item) => {
                if (!('category' in item)) {
                  this.tags[key].push(item.tag);
                }
              });
            }
          }
        }
      });
    this.shadowRoot.querySelector('#pipeline-environment').addEventListener(
      'selected', this.updateLanguage.bind(this));
    this.vfolderGrid = this.shadowRoot.querySelector('#vfolder-grid');
    this.pipelineGrid = this.shadowRoot.querySelector('vaadin-grid#pipeline-list');
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    // If disconnected
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', async () => {
        this._loadPipelineList();
        this._refreshImageList();
        this.selectDefaultLanguage();
        this._fetchUserInfo(); 
      }, true);
    } else { // already connected
      this._loadPipelineList();
      this._refreshImageList();
      this.selectDefaultLanguage();
      this._fetchUserInfo();
    }
  }

  _refreshImageList() {
    const fields = [
      'name', 'humanized_name', 'tag', 'registry', 'digest', 'installed',
      'resource_limits { key min max }'
    ];
    globalThis.backendaiclient.image.list(fields, true).then((response) => {
      const images: Array<Record<string, unknown>> = [];
      Object.keys(response.images).map((objectKey, index) => {
        const item = response.images[objectKey];
        if (item.installed === true) {
          images.push(item);
        }
      });
      if (images.length === 0) {
        return;
      }
      this.images = images;
      this.supports = {};
      Object.keys(this.images).map((objectKey, index) => {
        const item = this.images[objectKey];
        const supportsKey = `${item.registry}/${item.name}`;
        if (!(supportsKey in this.supports)) {
          this.supports[supportsKey] = [];
        }
        this.supports[supportsKey].push(item.tag);
        this.resourceLimits[`${supportsKey}:${item.tag}`] = item.resource_limits;
      });
      this._updateEnvironment();
    }).catch((err) => {
      // this.metadata_updating = false;
      console.error(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true);
      }
    });
  }

  _updateEnvironment() {
    // this.languages = Object.keys(this.supports);
    // this.languages.sort();
    const langs = Object.keys(this.supports);
    if (langs === undefined) return;
    langs.sort();
    this.languages = [];
    langs.forEach((item, index) => {
      if (!(Object.keys(this.aliases).includes(item))) {
        const humanizedName = this._guessHumanizedNames(item);
        if (humanizedName !== null) {
          this.aliases[item] = humanizedName;
        } else {
          this.aliases[item] = item;
        }
      }
      const specs = item.split('/');
      const registry = specs[0];
      let prefix; let kernelName;
      if (specs.length == 2) {
        prefix = '';
        kernelName = specs[1];
      } else {
        prefix = specs[1];
        kernelName = specs[2];
      }
      const alias = this.aliases[item];
      let basename;
      if (alias !== undefined) {
        basename = alias.split(' (')[0];
      } else {
        basename = kernelName;
      }
      let tags: string[] = [];
      if (kernelName in this.tags) {
        tags = tags.concat(this.tags[kernelName]);
      }
      if (prefix != '') {
        tags.push(prefix);
      }
      this.languages.push({
        name: item,
        registry: registry,
        prefix: prefix,
        kernelname: kernelName,
        alias: alias,
        basename: basename,
        tags: tags
      });
    });
    this._initAliases();
  }

  async selectDefaultLanguage(forceUpdate = false, language = '') {
    if (this._defaultLanguageUpdated === true && forceUpdate === false) {
      return;
    }
    if (language !== '') {
      this.defaultLanguage = language;
    } else if (globalThis.backendaiclient._config.default_session_environment !== undefined &&
      'default_session_environment' in globalThis.backendaiclient._config &&
      globalThis.backendaiclient._config.default_session_environment !== '') {
      this.defaultLanguage = globalThis.backendaiclient._config.default_session_environment;
    } else if (this.languages.length > 1) {
      this.defaultLanguage = this.languages[1].name;
    } else if (this.languages.length !== 0) {
      this.defaultLanguage = this.languages[0].name;
    } else {
      this.defaultLanguage = 'cr.backend.ai/stable/python';
    }
    const environment = this.shadowRoot.querySelector('#pipeline-environment');
    // await environment.updateComplete; async way.
    const obj = environment.items.find((o) => o.value === this.defaultLanguage);
    if (typeof obj === 'undefined' && typeof globalThis.backendaiclient !== 'undefined' && globalThis.backendaiclient.ready === false) { // Not ready yet.
      setTimeout(() => {
        console.log('Environment selector is not ready yet. Trying to set the default language again.');
        return this.selectDefaultLanguage(forceUpdate, language);
      }, 500);
      return Promise.resolve(true);
    }
    const idx = environment.items.indexOf(obj);
    environment.select(idx);
    this._defaultLanguageUpdated = true;
    return Promise.resolve(true);
    console.log(this.defaultLanguage)
  }

    _guessHumanizedNames(kernelName) {
    const candidate = this.imageNames;
    let imageName = '';
    let humanizedName = null;
    let matchedString = 'abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()';
    Object.keys(candidate).forEach((item, index) => {
      const specs = kernelName.split('/');
      if (specs.length == 2) {
        imageName = specs[1];
      } else {
        imageName = specs[2];
      }
      if (imageName === item) {
        humanizedName = candidate[item];
        matchedString = item;
      } else if (imageName === '' && kernelName.endsWith(item) && item.length < matchedString.length) {
        humanizedName = candidate[item];
        matchedString = item;
      }
    });
    return humanizedName;
  }

  _initAliases() {
    for (const item in this.aliases) {
      if ({}.hasOwnProperty.call(this.aliases, item)) {
        this.aliases[this.aliases[item]] = item;
      }
    }
  }

  _generateKernelIndex(kernel, version) {
    return kernel + ':' + version;
  }

  /**
   * Create a pipeline
   */
  _createPipeline() {
    /**
     * TODO: Add pipeline according to selected type
     * 
     */
    const name = this.shadowRoot.querySelector('#pipeline-name').value;
    const description = this.shadowRoot.querySelector('#pipeline-description').value;
    const scalingGroup = this.shadowRoot.querySelector('#scaling-group').value;
    const kernel = this.shadowRoot.querySelector('#pipeline-environment').value;
    const version = this.shadowRoot.querySelector('#pipeline-environment-tag').value;
    const cpuRequest = parseInt(this.shadowRoot.querySelector('#pipeline-cpu').value);
    const memRequest = parseFloat(this.shadowRoot.querySelector('#pipeline-mem').value);
    const shmemRequest = parseFloat(this.shadowRoot.querySelector('#pipeline-shmem').value);
    const gpuRequest = parseFloat(this.shadowRoot.querySelector('#pipeline-gpu').value);
    const environment = {
      scaling_group: scalingGroup,
      image: this._generateKernelIndex(kernel, version),
      envs: {},
    };
    const resources = {
      cpu: cpuRequest,
      mem: memRequest + 'g',
      resource_opts: {
        shmem: shmemRequest + 'g'
      },
      cuda: {
        shares: gpuRequest,
        device: ''
      },
    };
    const mounts = this.selectedVfolders;

    const createdAt = this._humanReadableTime();
    const modifiedAt = createdAt;

    this.pipelineInfo = {
      owner: this.userInfo.username,
      name: name,
      description: description,
      yaml: { // used for tasks
        name: name,
        description: description,
        ownership: {
          domain_name: this.userInfo.domain_name,
          group_name: this.userInfo.group_name,
        },
        environment: environment,
        resources: resources,
        mounts: mounts,
        tasks: {}, // this will be handled in server-side
      },
      dataflow: {}, // used for graph visualization
      version: '',
      is_active: true,
      created_at: createdAt,
      last_modified: modifiedAt,
    };
    this._savePipelineList(this.pipelineInfo);
    this._loadPipelineList();

    // move to pipeline view page with current pipeline info
    this.moveToViewTab();
    this.pipelineInfo = {};
    this._hideDialogById('#create-pipeline');
  }

  /**
   * Delete selected pipeline
   * 
   */
  _deletePipeline() {
    /**
     * TODO: send delete pipline request to server
     */
    const pipelineList = JSON.parse(localStorage.getItem('pipeline-list') || '[]');
    /**
     * FIXME: temporally find pipeline via name, but it have to be replaced into id.
     */ 
    const updatedPipelineList = pipelineList.filter(elem => elem.name !== this.pipelineInfo.name);
    localStorage.setItem('pipeline-list', JSON.stringify(updatedPipelineList));
    this._loadPipelineList();
    this.notification.text = `Pipeline ${this.pipelineInfo.name} deleted.`;
    this.notification.show();
    this.pipelineInfo = {};
    this._hideDialogById('#delete-pipeline');
  }

  _fetchUserInfo() {
    globalThis.backendaiclient.user.get(globalThis.backendaiclient.email, ['full_name', 'username', 'domain_name', 'id']).then((res) => {
      const userInfo = res.user;
      this.userInfo = {
        // username: userInfo.full_name ? userInfo.full_name : userInfo.username,
        domain_name: userInfo.domain_name,
        group_name: globalThis.backendaiclient.current_group,
        // user_uuid: userInfo.id
      }
    }).catch(err => {
      console.log(err);
    });
  }

  _savePipelineList(data) {
    const pipelineList = JSON.parse(localStorage.getItem('pipeline-list') || '[]');
    pipelineList.push(data);
    localStorage.setItem('pipeline-list', JSON.stringify(pipelineList));
  }

  _loadPipelineList() {
    const pipelineList = [...JSON.parse(localStorage.getItem('pipeline-list') || '[]')];
    this.pipelines = pipelineList;
    this.requestUpdate();
  }

  /**
   * Change d of any type to human readable date time.
   *
   * @param {any} d   - string or DateTime object to convert
   * @return {Date}   - Formatted date / time to be human-readable text.
   */
  _humanReadableTime(d = '') {
    const date = d ? new Date(d) : new Date();
    return date.toUTCString();
  }

  _launchDialogById(id) {
    this.shadowRoot.querySelector(id).show();
  }

  _hideDialogById(id) {
    this.shadowRoot.querySelector(id).hide();
  }

  async _launchPipelineDialog() {
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      setTimeout(() => {
        this._launchPipelineDialog();
      }, 1000);
    } else {
      await this.selectDefaultLanguage();
      await this._updateVirtualFolderList();
      this.requestUpdate();
      this._launchDialogById('#create-pipeline');
    }
  }

  _launchPipelineDetailDialog(pipelineInfo: Object) {
    this.pipelineInfo = pipelineInfo;
    this._launchDialogById('#pipeline-detail');
  }

  _launchPipelineDeleteDialog(pipelineInfo: Object) {
    this.pipelineInfo = pipelineInfo;
    this._launchDialogById('#delete-pipeline');
  }

  _launchPipelineYAMLDialog() {
    const codemirror = this.shadowRoot.querySelector('lablup-codemirror#yaml-data');
    const yamlString = YAML.dump(this.pipelineInfo.yaml, {

    });
    codemirror.setValue(yamlString);
    this._launchDialogById('#pipeline-yaml');
  }

  async _updateVirtualFolderList() {
    return this.resourceBroker.updateVirtualFolderList().then(() => {
      this.vfolders = this.resourceBroker.vfolders;
    });
  }

  /**
   * Render index of rowData
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  indexRenderer(root, column, rowData) {
    const idx = rowData.index + 1;
    render(
      html`
        <div>${idx}</div>
      `,
      root
    );
  }

  /**
   * Render name of rowData
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
   nameRenderer(root, column, rowData) {
    render(
      html`
        <div>
          <a class="pipeline-link" @click="${()=> this.loadPipeline(rowData.item)}">${rowData.item.name}</a>
        </div>
      `,
      root
    );
  }

  /**
   * Control rendering
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   */
  controlRenderer(root, column, rowData) {
    render(
      html`
        <div id="controls" class="layout horizontal flex center wrap" .pipeline-id="${rowData.item.name}">
          <wl-button fab flat inverted
            class="fg green" @click="${() => this._launchPipelineDetailDialog(rowData.item)}">
            <wl-icon>info</wl-icon>
          </wl-button>
          <!--<wl-button fab flat inverted
            class="fg blue">
            <wl-icon>settings</wl-icon>
          </wl-button>-->
          <wl-button fab flat inverted
            class="fg blue" @click="${() => this.loadPipeline(rowData.item)}">
            <wl-icon>account_tree</wl-icon>
          </wl-button>
          <wl-button fab flat inverted class="fg red controls-running" 
            @click="${() => this._launchPipelineDeleteDialog(rowData.item)}">
            <wl-icon>delete_forever</wl-icon>
          </wl-button>
        </div>
      `, root
    );
  }

  /**
   * Control rendering
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   */
  createdAtRenderer(root, column?, rowData?) {
    render(
      html`
        <div class="layout vertical">
          <span style="font-size:0.75rem;">${rowData.item.created_at}</span>
        </div>
      `, root
    );
  }

  /**
   * Control rendering
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   */
  modifiedAtRenderer(root, column?, rowData?) {
    render(
      html`
      <div class="layout vertical">
        <span style="font-size:0.75rem;">${rowData.item.last_modified}</span>
      </div>
      `, root
    );
  }

  moveToViewTab() {
    /**
     * TODO: Go to view tab loaded with current pipeline info
     * 
     */
    const moveToViewEvent = 
      new CustomEvent('pipeline-view-active-tab-change', 
        {
          'detail': {
          'activeTab': {
            title :'pipeline-view'
          },
          'pipeline': this.pipelineInfo
        }
      });
    document.dispatchEvent(moveToViewEvent);
  }

  loadPipeline(pipelineInfo: object) {
    this.pipelineInfo = pipelineInfo;
    this.moveToViewTab();
  }

  _showTab(tab) {
    const els = this.shadowRoot.querySelectorAll('.tab-content');
    for (const obj of els) {
      obj.style.display = 'none';
    }
    this._activeTab = tab.title;
    this.shadowRoot.querySelector('#' + tab.title).style.display = 'block';
  }

  updateLanguage() {
    const selectedItem = this.shadowRoot.querySelector('#pipeline-environment').selected;
    if (selectedItem === null) return;
    const kernel = selectedItem.id;
    this._updateVersions(kernel);
  }

  _updateVersions(kernel) {
    const tagEl = this.shadowRoot.querySelector('#pipeline-environment-tag');
    if (kernel in this.supports) {
      const versions = this.supports[kernel];
      versions.sort();
      versions.reverse(); // New version comes first.
      this.versions = versions;
    }
    if (this.versions !== undefined) {
      tagEl.value = this.versions[0];
      tagEl.selectedText = tagEl.value;
      // this.updateMetric('update versions');
    }
  }

  /**
 * Update selected folders.
 * If selectedFolderItems are not empty and forceInitialize is true, unselect the selected items
 *
 * @param {boolean} forceInitialize - whether to initialize selected vfolder or not
 * */
    _updateSelectedFolder(forceInitialize = false) {
      if (this.vfolderGrid && this.vfolderGrid.selectedItems) {
        const selectedFolderItems = this.vfolderGrid.selectedItems;
        let selectedFolders: string[] = [];
        if (selectedFolderItems.length > 0) {
          selectedFolders = selectedFolderItems.map((item) => item.name);
          if (forceInitialize) {
            this._unselectAllSelectedFolder();
          }
        }
        this.selectedVfolders = selectedFolders;
      }
      return Promise.resolve(true);
  }

  _unselectAllSelectedFolder() {
    if (this.vfolderGrid && this.vfolderGrid.selectedItems) {
      this.vfolderGrid.selectedItems.forEach((item) => {
        item.selected = false;
      });
      this.vfolderGrid.selectedItems = [];
    }
      this.selectedVfolders = [];
  }

  render() {
    // language=HTML
    return html`
    <div class="horizontal layout flex center end-justified">
      <mwc-button unelevated icon="add" label="New Pipeline" @click="${() => this._launchPipelineDialog()}"></mwc-button>
    </div>
    <vaadin-grid id="pipeline-list" theme="row-stripes column-borders compact wrap-cell-content" aria-label="Pipeline List" .items="${this.pipelines}">
      <vaadin-grid-column auto-width flex-grow="0" header="#" text-align="center" .renderer="${this._boundIndexRenderer}"></vaadin-grid-column>
      <vaadin-grid-filter-column id="name" auto-width header="Name" resizable .renderer="${this._boundNameRenderer}"></vaadin-grid-filter-column>
      <vaadin-grid-column id="owner" header="Owner" resizable path="owner"></vaadin-grid-column>
      <vaadin-grid-column id="control" header="Controls" resizable .renderer="${this._boundControlRenderer}"></vaadin-grid-column>
      <vaadin-grid-column id="created-at" header="Created At" resizable .renderer="${this._boundCreateAtRenderer}"></vaadin-grid-column>
      <vaadin-grid-column id="modified-at" header="Last Modified" resizable .renderer="${this._boundModifiedAtRenderer}"></vaadin-grid-column>
    </vaadin-grid>
    <backend-ai-dialog id="create-pipeline" fixed backdrop blockscrolling persistent>
      <span slot="title">New Pipeline</span>
      <div slot="content" class="vertical layout flex">
        <mwc-tab-bar class="pipeline-tab">
          <mwc-tab title="pipeline-general" label="General" @click="${(e) => this._showTab(e.target)}"></mwc-tab>
          <mwc-tab title="pipeline-resources" label="Resources" @click="${(e) => this._showTab(e.target)}"></mwc-tab>
          <mwc-tab title="pipeline-mounts" label="Mounts" @click="${(e) => this._showTab(e.target)}"></mwc-tab>
        </mwc-tab-bar>
        <div id="pipeline-general" class="vertical layout center flex tab-content">
          <mwc-textfield id="pipeline-name" label="Pipeline Name" required></mwc-textfield>
          <mwc-select class="full-width" id="pipeline-type" label="Pipeline Type" required fixedMenuPosition>
            <mwc-list-item value="Choose Pipeline Type" disabled>Choose Pipeline Type</mwc-list-item>
            ${this.pipelineTypes.map(item => {
              return html`<mwc-list-item id="${item}" value="${item}">${item}</mwc-list-item>`
            })} 
          </mwc-select>
          <mwc-textarea id="pipeline-description" label="Pipeline Description"></mwc-textarea>
        </div>
        <div id="pipeline-resources" class="vertical layout center flex tab-content" style="display:none;">
          <mwc-select class="full-width" id="scaling-group" label="Scaling Group" fixedMenuPosition>
            ${this.scalingGroups.map((item, idx) => {
              return html`<mwc-list-item id="${item}" value="${item}" ?selected="${idx === 0}">${item}</mwc-list-item>`
            })}
          </mwc-select>
          <mwc-select class="full-width" id="pipeline-environment" label="Default Environment" required fixedMenuPosition value="${this.defaultLanguage}">
                ${this.languages.map((item) => html`
                  <mwc-list-item id="${item.name}" value="${item.name}" ?selected="${item.name === this.defaultLanguage }">
                    <div class="horizontal justified center flex layout" style="width:325px;">
                      <div style="padding-right:5px;">${item.basename}</div>
                      <div class="horizontal layout end-justified center flex">
                          ${item.tags ? item.tags.map((item) => html`
                            <lablup-shields style="margin-left:5px;" description="${item}"></lablup-shields>
                          `) : ''}
                        </div>
                    </div>
                  </mwc-list-item>`
                )}
            </mwc-select>
            <mwc-select class="full-width" id="pipeline-environment-tag" label="Version" required fixedMenuPosition>
              <mwc-list-item style="display:none"></mwc-list-item>
              ${this.versions.map((item, idx) => html`
                    <mwc-list-item id="${item}" value="${item}"
                        ?selected="${idx === 0}">${item}</mwc-list-item>
              `)}
            </mwc-select>
            <mwc-textfield id="pipeline-cpu" label="CPU" type="number" min="1" suffix="Core"></mwc-textfield>
            <mwc-textfield id="pipeline-mem" label="Memory (GiB)" type="number" min="0" suffix="GB"></mwc-textfield>
            <mwc-textfield id="pipeline-shmem" label="Shared Memory" type="number" min="0.0125" step="0.0125" suffix="GB"></mwc-textfield>
            <mwc-textfield id="pipeline-gpu" label="GPU" type="number" min="0" suffix="Unit"></mwc-textfield>
        </div>
        <div id="pipeline-mounts" class="vertical layout center flex tab-content" style="display:none;">
        <div class="vfolder-list">
          <vaadin-grid
              theme="row-stripes column-borders compact wrap-cell-content"
              id="vfolder-grid"
              aria-label="vfolder list"
              all-rows-visible
              .items="${this.vfolders}"
              @selected-items-changed="${() => this._updateSelectedFolder()}">
            <vaadin-grid-selection-column id="select-column"
                                          flex-grow="0"
                                          text-align="center"
                                          auto-select></vaadin-grid-selection-column>
            <vaadin-grid-filter-column header="Folder"
                                       path="name" resizable></vaadin-grid-filter-column>
          </vaadin-grid>
          ${this.vfolders.length > 0 ? html`` : html`
            <div class="vertical layout center flex blank-box-medium">
              <span>There's no available folder to mount :(</span>
            </div>
            `}
          </div>
        </div>
      </div>
      <div slot="footer" class="horizontal layout end-justified flex">
        <mwc-button class="full-width" unelevated label="Create Pipeline" @click="${() => this._createPipeline()}"></mwc-button>
      </div>
    </backend-ai-dialog>
    <backend-ai-dialog id="pipeline-detail" fixed backdrop blockscrolling persistent>
      <span slot="title">Pipeline Detail</span>
      <div slot="content" class="vertical layout flex">
        <div class="horizontal flex layout wrap justified center pipeline-detail-items">
            <div class="vertical center start-justified flex">
              <div class="title">Owner</div>
              <div class="description">${this.pipelineInfo.owner}</div>
            </div>
        </div>
        <div class="horizontal flex layout wrap justified center pipeline-detail-items">
            <div class="vertical center start-justified flex">
              <div class="title">Name</div>
              <div class="description">${this.pipelineInfo.name}</div>
            </div>
        </div>
        <div class="horizontal flex layout wrap justified center pipeline-detail-items">
            <div class="vertical center start-justified flex">
              <div class="title">Description</div>
              <div class="description">${this.pipelineInfo.description}</div>
            </div>
        </div>
        <div class="horizontal flex layout wrap justified center pipeline-detail-items">
          <div class="vertical center start-justified flex">
            <div class="title">YAML</div>
          </div>
          <mwc-button unelevated label="SEE YAML" icon="description" @click="${() => this._launchPipelineYAMLDialog()}"></mwc-button>
        </div>
        <div class="horizontal flex layout wrap justified center pipeline-detail-items">
          <div class="vertical center start-justified flex">
            <div class="title">Version</div>
            <div class="description">${this.pipelineInfo.version ? this.pipelineInfo.version : 'None'}</div>
          </div>
        </div>
        <div class="horizontal flex layout wrap justified center pipeline-detail-items">
          <div class="vertical center start-justified flex">
            <div class="title">Created at</div>
            <div class="description">${this.pipelineInfo.created_at}</div>
          </div>
        </div>
        <div class="horizontal flex layout wrap justified center pipeline-detail-items">
          <div class="vertical center start-justified flex">
            <div class="title">Last modified</div>
            <div class="description">${this.pipelineInfo.last_modified}</div>
          </div>
        </div>
      </div>
    </backend-ai-dialog>
    <backend-ai-dialog id="delete-pipeline" fixed backdrop blockscrolling persistent>
      <span slot="title">Delete Pipeline</span>
      <div slot="content" class="vertical layout flex">
        <span>
          Are you sure you want to delete this pipeline?<br />
          This process cannot be undone!
        </span>
      </div>
      <div slot="footer" class="horizontal end-justified flex layout">
        <div class="flex"></div>
        <mwc-button label="Cancel" @click="${() => this._hideDialogById('#delete-pipeline')}"></mwc-button>
        <mwc-button unelevated class="delete" label="Delete" @click="${() => this._deletePipeline()}"></mwc-button>
      </div>
    </backend-ai-dialog>
    <backend-ai-dialog class="yaml" id="pipeline-yaml" fixed backdrop blockscrolling>
      <span slot="title">${`Pipeline Data (YAML)`}</span>
      <div slot="content">
        <lablup-codemirror id="yaml-data" mode="yaml" readonly></lablup-codemirror>
      </div>
    </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pipeline-list': PipelineList;
  }
}