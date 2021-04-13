/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t} from 'lit-translate';
import {css, customElement, html, property} from 'lit-element';

import '@material/mwc-list/mwc-list-item';
import '@material/mwc-select/mwc-select';

import 'weightless/card';
import {BackendAiStyles} from './backend-ai-general-styles';

import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';
import {default as PainKiller} from './backend-ai-painkiller';
import {BackendAIPipelineCommon} from './backend-ai-pipeline-common';

/**
 Backend AI Pipeline Create Element

 `backend-ai-pipeline-create` contains all features to create a pipeline.

 @group Backend.AI Console
 @element backend-ai-pipeline-create
 */
@customElement('backend-ai-pipeline-create')
export default class BackendAIPipelineCreate extends BackendAIPipelineCommon {
  // Elements
  @property({type: Object}) spinner = Object();
  @property({type: Object}) notification = Object();
  // Environments
  @property({type: Object}) tags = Object();
  @property({type: Array}) languages;
  @property({type: String}) defaultLanguage = '';
  @property({type: Array}) versions = [];
  @property({type: String}) scalingGroup = '';
  @property({type: Array}) scalingGroups = [];
  @property({type: String}) vhost = '';
  @property({type: Array}) vhosts = [];
  @property({type: Object}) images = Object();
  @property({type: Object}) imageInfo = Object();
  @property({type: Object}) imageNames = Object();
  @property({type: Object}) resourceLimits = Object();
  @property({type: Object}) supports = Object();
  @property({type: Object}) aliases = Object();
  // Configs
  @property({type: String}) pipelineCreateMode = 'create';
  @property({type: String}) pipelineFolderName = '';
  // Pipeline prpoerties

  constructor() {
    super();
    this.aliases = {
      'TensorFlow': 'python-tensorflow',
      'NGC-TensorFlow': 'ngc-tensorflow',
      'PyTorch': 'python-pytorch',
      'NGC-PyTorch': 'ngc-pytorch',
      'Lablup Research Env.': 'python-ff',
      'Python': 'python',
    };
    this.languages = [];
  }

  firstUpdated() {
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this.notification = globalThis.lablupNotification;

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
    this._refreshImageList();
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

  async _fetchResourceGroup() {
    const currentGroup = window.backendaiclient.current_group || null;
    const sgs = await window.backendaiclient.scalingGroup.list(currentGroup);
    this.scalingGroups = sgs.scaling_groups;
    this.scalingGroup = sgs.scaling_groups[0].name;
  }

  _refreshImageList() {
    const fields = [
      'name', 'humanized_name', 'tag', 'registry', 'digest', 'installed',
      'resource_limits { key min max }'
    ];
    window.backendaiclient.image.list(fields, true).then((response) => {
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

  selectDefaultLanguage() {
    if (typeof window.backendaiclient === 'undefined' || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._selectDefaultLanguage();
      }, true);
    } else {
      this._selectDefaultLanguage();
    }
  }

  _selectDefaultLanguage() {
    if (window.backendaiclient._config.default_session_environment !== undefined &&
      'default_session_environment' in window.backendaiclient._config &&
      window.backendaiclient._config.default_session_environment !== '') {
      this.defaultLanguage = window.backendaiclient._config.default_session_environment;
    } else if (this.languages.length !== 0) {
      this.defaultLanguage = this.languages[0].name;
    } else {
      this.defaultLanguage = 'index.docker.io/lablup/ngc-tensorflow';
    }
    return true;
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

  /**
   * Open pipeline create dialog.
   * */
  _openPipelineCreateDialog() {
    this.selectDefaultLanguage();
    this._fetchResourceGroup();
    this._fillPipelineCreateDialogFields(null);
    this.pipelineCreateMode = 'create';
    window.backendaiclient.vfolder.list_hosts()
      .then((resp) => {
        const folderHostEl = this.shadowRoot.querySelector('#pipeline-folder-host');
        this.vhosts = resp.allowed.slice();
        this.vhost = resp.default;
        folderHostEl.value = this.vhost;
      })
      .catch((err) => {
        console.error(err);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true);
        }
      });
    this.shadowRoot.querySelector('#pipeline-create-dialog').show();
  }

  /**
   * Open pipeline update dialog.
   *
   * @param {String} folderName - virtual folder name to update pipeline config.
   * */
  async _openPipelineUpdateDialog(folderName) {
    this.pipelineFolderName = folderName;
    if (!this.pipelineFolderName) {
      this.notification.text = _text('pipeline.NoPipelineSelected');
      this.notification.show();
      return;
    }
    this._fetchResourceGroup();
    const config = await this._downloadPipelineConfig(this.pipelineFolderName);
    this.pipelineCreateMode = 'update';
    window.backendaiclient.vfolder.list_hosts()
      .then((resp) => {
        const folderHostEl = this.shadowRoot.querySelector('#pipeline-folder-host');
        this.vhosts = resp.allowed.slice();
        this.vhost = config.folder_host;
        folderHostEl.value = this.vhost;
        // Ensure version field is updated correctly
        this._fillPipelineCreateDialogFields(config);
      })
      .catch((err) => {
        console.error(err);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true);
        }
      });
    this._fillPipelineCreateDialogFields(config);
    this.shadowRoot.querySelector('#pipeline-create-dialog').show();
  }

  /**
   * Open pipeline delete dialog.
   *
   * @param {String} folderName - virtual folder name to delete.
   * */
  _openPipelineDeleteDialog(folderName) {
    this.pipelineFolderName = folderName;
    if (!this.pipelineFolderName) {
      this.notification.text = _text('pipeline.NoPipelineSelected');
      this.notification.show();
      return;
    }
    this.shadowRoot.querySelector('#pipeline-delete-dialog').show();
  }

  /**
   * Hide pipeline create dialog.
   * */
  _hidePipelineCreateDialog() {
    this.shadowRoot.querySelector('#pipeline-create-dialog').hide();
  }

  /**
   * Hide pipeline delete dialog.
   * */
  _hidePipelineDeleteDialog() {
    this.shadowRoot.querySelector('#pipeline-delete-dialog').hide();
  }

  _fillPipelineCreateDialogFields(config) {
    if (!config) {
      config = {};
    }
    const dialog = this.shadowRoot.querySelector('#pipeline-create-dialog');
    dialog.querySelector('#pipeline-title').value = config.title || '';
    dialog.querySelector('#pipeline-description').value = config.description || '';
    if (config.environment) {
      dialog.querySelector('#pipeline-environment').value = config.environment;
    }
    if (config.version) {
      dialog.querySelector('#pipeline-environment-tag').value = config.version;
    }
    if (config.scaling_group) {
      dialog.querySelector('#pipeline-scaling-group').value = config.scaling_group;
    }
    if (config.folder_host) {
      dialog.querySelector('#pipeline-folder-host').value = config.folder_host;
    }
  }

  /**
   * Create a pipeline.
   * */
  async _createPipeline() {
    const title = this.shadowRoot.querySelector('#pipeline-title').value;
    const description = this.shadowRoot.querySelector('#pipeline-description').value;
    const environment = this.shadowRoot.querySelector('#pipeline-environment').value;
    const version = this.shadowRoot.querySelector('#pipeline-environment-tag').value;
    const scaling_group = this.shadowRoot.querySelector('#pipeline-scaling-group').value;
    const folder_host = this.shadowRoot.querySelector('#pipeline-folder-host').value;
    const sluggedTitle = `pipeline-${window.backendaiclient.slugify(title)}-${window.backendaiclient.generateSessionId(8, true)}`;
    if (!title || !environment || !version || !scaling_group || !folder_host) {
      this.notification.text = _text('pipeline.PipelineDialog.FillAllInputFields');
      this.notification.show();
      return;
    }
    const configObj = {
      title, description, environment, version, scaling_group, folder_host
    };
    this.spinner.show();
    if (this.pipelineCreateMode === 'create') {
      try {
        await window.backendaiclient.vfolder.create(sluggedTitle, folder_host);
        const uploadPipelineTask = this._uploadPipelineConfig(sluggedTitle, configObj);
        const uploadComponentsTask = this._uploadPipelineComponents(sluggedTitle, {});
        await Promise.all([uploadPipelineTask, uploadComponentsTask]);
        const event = new CustomEvent('backend-ai-pipeline-created', {'detail': sluggedTitle});
        this.dispatchEvent(event);
        this._hidePipelineCreateDialog();
        this.spinner.hide();
        this.notification.text = _text('pipeline.PipelineCreated');
        this.notification.show();
      } catch (err) {
        console.error(err);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true);
        }
        this.spinner.hide();
      }
    } else {
      try {
        await this._uploadPipelineConfig(this.pipelineFolderName, configObj);
        const event = new CustomEvent('backend-ai-pipeline-updated', {'detail': this.pipelineFolderName});
        this.dispatchEvent(event);
        this._hidePipelineCreateDialog();
        this.spinner.hide();
      } catch (err) {
        console.error(err);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true);
        }
        this.spinner.hide();
      }
    }
  }

  _deletePipeline() {
    const job = globalThis.backendaiclient.vfolder.delete(this.pipelineFolderName);
    job.then((value) => {
      const event = new CustomEvent('backend-ai-pipeline-deleted', {'detail': this.pipelineFolderName});
      this.dispatchEvent(event);
      this._hidePipelineDeleteDialog();
      this.notification.text = _text('pipeline.PipelineDeleted');
      this.notification.show();
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
   * Upload pipeline config to a virtual folder.
   *
   * @param {String} folderName - virtual folder name to upload pipeline config.
   * @param {Object} configObj - pipeline config object.
   * */
  async _uploadPipelineConfig(folderName, configObj) {
    const blob = new Blob([JSON.stringify(configObj, null, 2)], {type: 'application/json'});
    await this._uploadFile(this.pipelineConfigPath, blob, folderName);
  }

  /**
   * Upload pipeline components information to a virtual folder.
   *
   * @param {String} folderName - virtual folder name to upload components.
   * @param {Object} cinfo - pipeline component information.
   * */
  async _uploadPipelineComponents(folderName, cinfo) {
    const vfpath = this.pipelineComponentDetailPath;
    const blob = new Blob([JSON.stringify(cinfo, null, 2)], {type: 'application/json'});
    try {
      this.spinner.show();
      await this._uploadFile(vfpath, blob, folderName);
      this.spinner.hide();
    } catch (err) {
      console.error(err);
      this.spinner.hide();
      this.notification.text = PainKiller.relieve(err.title);
      this.notification.detail = err.message;
      this.notification.show(true);
    }
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        .warning {
          color: red;
        }
      `
    ];
  }

  render() {
    // language=HTML
    return html`
      <div class="card" elevation="0">
      </div>

      <backend-ai-dialog id="pipeline-create-dialog" fixed backdrop>
        <span slot="title">
          ${this.pipelineCreateMode === 'create' ? _t('pipeline.PipelineDialog.CreateTitle') : _t('pipeline.PipelineDialog.UpdateTitle')}
        </span>
        <div slot="content" class="layout vertical" style="width:450px">
          <mwc-textfield id="pipeline-title" type="text" autofocus
              label="${_t('pipeline.PipelineDialog.Name')}" maxLength="30">
          </mwc-textfield>
          <mwc-textfield id="pipeline-description" type="text"
              label="${_t('pipeline.PipelineDialog.Description')}" maxLength="200">
          </mwc-textfield>
          <mwc-select id="pipeline-environment" label="${_t('pipeline.PipelineDialog.Environment')}">
            <mwc-list-item style="display:none;" value="None">${_t('session.launcher.ChooseEnvironment')}</mwc-list-item>
            ${this.languages.map((item) => html`
              <mwc-list-item id="${item.name}" value="${item.name}"
                  ?selected="${item.name === this.defaultLanguage}">
                <div class="layout horizontal">
                  ${item.basename}
                  ${item.tags ? item.tags.map((item) => html`
                    <lablup-shields style="margin-left:5px;" description="${item}"></lablup-shields>
                  `) : ''}
                </div>
              </mwc-list-item>
            `)}
          </mwc-select>
          <mwc-select id="pipeline-environment-tag" label="${_t('pipeline.PipelineDialog.Version')}">
            <mwc-list-item style="display:none"></mwc-list-item>
            ${this.versions.map((item, idx) => html`
              <mwc-list-item id="${item}" value="${item}"
                  ?selected="${idx === 0}">${item}</mwc-list-item>
            `)}
          </mwc-select>
          <mwc-select id="pipeline-scaling-group" label="${_t('session.launcher.OwnerResourceGroup')}">
            ${this.scalingGroups.map((item: Record<string, unknown>) => html`
              <mwc-list-item id="${item.name}" value="${item.name}"
                  ?selected="${item.name === this.scalingGroup}">
                ${item.name}
              </mwc-list-item>
            `)}
          </mwc-select>
          <mwc-select id="pipeline-folder-host" label="${_t('data.Host')}">
            ${this.vhosts.map((item, idx) => html`
              <mwc-list-item value="${item}" ?selected="${idx === 0}">${item}</mwc-list-item>
            `)}
          </mwc-select>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <div class="flex"></div>
          <mwc-button label="${_t('button.Cancel')}" @click="${this._hideDialog}"></mwc-button>
          <mwc-button unelevated
              label="${this.pipelineCreateMode === 'create' ? _t('button.Create') : _t('button.Update')}"
              @click="${this._createPipeline}"></mwc-button>
        </div>
      </backend-ai-dialog>

      <backend-ai-dialog id="pipeline-delete-dialog" fixed backdrop>
        <span slot="title">${_t('pipeline.PipelineDialog.DeleteTitle')}</span>
        <div slot="content" style="width:100%;">
          <p class="warning">${_t('dialog.warning.CannotBeUndone')}</p>
          <div>${_t('pipeline.PipelineDialog.TargetFolder')}: ${this.pipelineFolderName}</div>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <div class="flex"></div>
          <mwc-button label="${_t('button.Cancel')}" @click="${this._hideDialog}"></mwc-button>
          <mwc-button unelevated @click="${this._deletePipeline}">
            ${_t('button.Delete')}
          </mwc-button>
        </div>
      </backend-ai-dialog>

      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-pipeline-create': BackendAIPipelineCreate;
  }
}
