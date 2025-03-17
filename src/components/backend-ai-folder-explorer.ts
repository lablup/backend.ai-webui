/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import tus from '../lib/tus';
import {
  IronFlex,
  IronFlexAlignment,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import BackendAIDialog from './backend-ai-dialog';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import { default as PainKiller } from './backend-ai-painkiller';
import { Button } from '@material/mwc-button';
import { TextField } from '@material/mwc-textfield';
import '@vaadin/grid/vaadin-grid';
import '@vaadin/grid/vaadin-grid-column-group';
import '@vaadin/grid/vaadin-grid-selection-column';
import '@vaadin/grid/vaadin-grid-sort-column';
import { css, CSSResultGroup, html, render } from 'lit';
import { get as _text, translate as _t } from 'lit-translate';
import { customElement, property, query, state } from 'lit/decorators.js';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type VaadinGrid = HTMLElementTagNameMap['vaadin-grid'];

interface fileData {
  id: string;
  progress: number;
  caption: string;
  error: boolean;
  complete: boolean;
}

/**
 Backend AI Session View

 Example:

 <backend-ai-session-view active>
 ...
 </backend-ai-settings-view>

 @group Backend.AI Web UI
 @element backend-ai-folder-explorer
*/

@customElement('backend-ai-folder-explorer')
export default class BackendAIFolderExplorer extends BackendAIPage {
  // [target vfolder information]
  @property({ type: String }) vfolderID = '';
  @property({ type: String }) vfolderName = '';
  @property({ type: String }) vfolder = '';
  @property({ type: Array }) vfolderFiles = [];
  @property({ type: String }) vhost = '';
  @property({ type: Boolean }) isWritable = false;
  @property({ type: Array }) breadcrumb = ['.'];
  @property({ type: Number }) _APIMajorVersion = 5;
  @property({ type: Array }) uploadFiles: fileData[] = [];
  @property({ type: Boolean }) _isDirectorySizeVisible = true;
  @property({ type: Object }) notification = Object();
  // [rename folder or file]
  @property({ type: String }) newName = '';
  @property({ type: String }) oldFileExtension = '';
  @property({ type: String }) newFileExtension = '';
  @property({ type: Boolean }) is_dir = false;
  // [download file]
  @property({ type: String }) downloadURL = '';
  // [upload file]
  @property({ type: Boolean }) _uploadFlag = true;
  @property({ type: Boolean }) uploadFilesExist = false;
  @property({ type: Object }) currentUploadFile = Object();
  @property({ type: Number }) _maxFileUploadSize = -1;
  @property({ type: Array }) fileUploadQueue = [];
  @property({ type: Number }) fileUploadCount = 0;
  @property({ type: Number }) concurrentFileUploadLimit = 2;
  @property({ type: Object }) _boundUploadListRenderer = Object();
  @property({ type: Object }) _boundUploadProgressRenderer = Object();
  // [filebrowser]
  @property({ type: Number }) minimumResource = {
    cpu: 1,
    mem: 0.5,
  };
  @property({ type: Array }) filebrowserSupportedImages = [];
  @property({ type: Array }) systemRoleSupportedImages = [];
  @property({ type: Object }) indicator = Object();
  @query('#filebrowser-notification-dialog')
  fileBrowserNotificationDialog!: BackendAIDialog;
  // [SSH / SFTP]
  @property({ type: Object }) volumeInfo = Object();
  // [renderers]
  @property({ type: Object }) _boundFileNameRenderer = Object();
  @property({ type: Object }) _boundCreatedTimeRenderer = Object();
  @property({ type: Object }) _boundSizeRenderer = Object();
  @property({ type: Object }) _boundControlFileListRenderer = Object();
  @state() _unionedAllowedPermissionByVolume = Object();

  @query('#rename-file-dialog') renameDialog!: BackendAIDialog;
  @query('#new-file-name') newNameInput!: TextField;
  @query('#file-extension-change-dialog')
  fileExtensionChangeDialog!: BackendAIDialog;
  @query('#delete-file-dialog') deleteFileDialog!: BackendAIDialog;
  @query('#mkdir-dialog') mkdirDialog!: BackendAIDialog;
  @query('#mkdir-name') mkdirNameInput!: TextField;
  @query('#file-list-grid') fileListGrid!: VaadinGrid;

  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronPositioning,
      // language=CSS
      css`
        div#container {
        }

        div#dropzone {
          display: none;
          position: absolute;
          top: var(--general-modal-header-height, 69px);
          height: calc(100% - 89px);
          width: calc(100% - 48px);
          z-index: 10;
        }

        div#dropzone {
          background: rgba(211, 211, 211, 0.5);
          text-align: center;
        }

        span.title {
          margin: auto 10px;
          min-width: 35px;
        }

        img#filebrowser-img,
        img#ssh-img {
          width: 18px;
          margin: 15px 10px;
        }

        div.breadcrumb {
          color: #637282;
          font-size: 1em;
          margin-bottom: 10px;
          max-width: 65%;
        }

        div.breadcrumb span:first-child {
          display: none;
        }

        .breadcrumb li:before {
          padding: 3px;
          transform: rotate(-45deg) translateY(-2px);
          transition: color ease-in 0.2s;
          border: solid;
          border-width: 0 2px 2px 0;
          border-color: var(--token-colorBorder, #242424);
          margin-right: 10px;
          content: '';
          display: inline-block;
        }

        .breadcrumb li {
          display: inline-block;
          font-size: 16px;
        }

        .breadcrumb ul {
          padding: 0;
          margin: 0;
          list-style-type: none;
        }

        .breadcrumb mwc-icon-button {
          --mdc-icon-size: 20px;
          --mdc-icon-button-size: 22px;
        }

        backend-ai-dialog mwc-textfield,
        backend-ai-dialog mwc-select {
          --mdc-typography-label-font-size: var(--token-fontSizeSM, 12px);
        }

        backend-ai-dialog {
          --component-min-width: 350px;
        }

        vaadin-item {
          font-size: 13px;
          font-weight: 100;
        }

        vaadin-text-field {
          --vaadin-text-field-default-width: auto;
        }

        vaadin-grid-cell-content {
          font-size: 13px;
        }

        mwc-icon-button {
          --mdc-icon-size: 24px;
          --mdc-icon-button-size: 28px;
          padding: 0px;
        }

        mwc-button {
          --mdc-typography-button-font-size: 12px;
        }

        mwc-textfield {
          width: 100%;
          --mdc-theme-error: var(--token-colorError);
        }
      `,
    ];
  }

  constructor() {
    super();
    this._boundFileNameRenderer = this.fileNameRenderer.bind(this);
    this._boundCreatedTimeRenderer = this.createdTimeRenderer.bind(this);
    this._boundSizeRenderer = this.sizeRenderer.bind(this);
    this._boundControlFileListRenderer =
      this.controlFileListRenderer.bind(this);
    this._boundUploadListRenderer = this.uploadListRenderer.bind(this);
    this._boundUploadProgressRenderer = this.uploadProgressRenderer.bind(this);
  }

  async firstUpdated() {
    this.indicator = globalThis.lablupIndicator;
    this.notification = globalThis.lablupNotification;
    this._maxFileUploadSize =
      globalThis.backendaiclient._config.maxFileUploadSize;
    this._APIMajorVersion = globalThis.backendaiclient.APIMajorVersion;
    this.fileListGrid.addEventListener('selected-items-changed', () => {
      this._toggleFileListCheckbox();
    });
    this._addEventListenerDropZone();
    await this._fetchVFolder();
    this.fileListGrid.clearCache();
  }

  _toggleFileListCheckbox() {
    const buttons = this.shadowRoot?.querySelectorAll<Button>(
      '.multiple-action-buttons',
    ) as NodeListOf<Button>;
    if (this.fileListGrid.selectedItems.length > 0) {
      [].forEach.call(buttons, (e: HTMLElement) => {
        e.style.display = 'block';
      });
      document.dispatchEvent(
        new CustomEvent('folderExplorer:columnSelected', { detail: true }),
      );
    } else {
      [].forEach.call(buttons, (e: HTMLElement) => {
        e.style.display = 'none';
      });
      document.dispatchEvent(
        new CustomEvent('folderExplorer:columnSelected', { detail: false }),
      );
    }
  }

  closeDialog(id) {
    (this.shadowRoot?.querySelector('#' + id) as BackendAIDialog).hide();
  }

  /**
   * Render file name as rowData.item.filename.
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  fileNameRenderer(root, column?, rowData?) {
    render(
      html`
        ${this._isDir(rowData.item)
          ? html`
              <div
                class="indicator horizontal center layout"
                name="${rowData.item.name}"
              >
                <mwc-icon-button
                  class="fg controls-running"
                  icon="folder_open"
                  name="${rowData.item.name}"
                  @click="${(e) => this._enqueueFolder(e)}"
                ></mwc-icon-button>
                ${rowData.item.name}
              </div>
            `
          : html`
              <div class="indicator horizontal center layout">
                <mwc-icon-button
                  class="fg controls-running"
                  icon="insert_drive_file"
                ></mwc-icon-button>
                ${rowData.item.name}
              </div>
            `}
      `,
      root,
    );
  }

  /**
   * Render created time.
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  createdTimeRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="layout vertical">
          <span>${this._humanReadableTime(rowData.item.created)}</span>
        </div>
      `,
      root,
    );
  }

  /**
   * Render size by condition
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  sizeRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="layout horizontal">
          ${(rowData.item.type as string).toUpperCase() === 'DIRECTORY' &&
          !this._isDirectorySizeVisible
            ? html`
                <span class="monospace">-</span>
              `
            : html`
                <span>${rowData.item.size}</span>
              `}
        </div>
      `,
      root,
    );
  }

  /**
   * Render control file options - downloadFile, openRenameFileDialog, openDeleteFileDialog, etc.
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  controlFileListRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="flex layout wrap">
          <mwc-icon-button
            id="${rowData.item.name + '-download-btn'}"
            class="tiny fg blue"
            icon="cloud_download"
            style="pointer-events: auto !important;"
            ?disabled="${!this._isDownloadable(this.vhost)}"
            filename="${rowData.item.name}"
            @click="${(e) => this._downloadFile(e, this._isDir(rowData.item))}"
          ></mwc-icon-button>
          ${!this._isDownloadable(this.vhost)
            ? html`
                <vaadin-tooltip
                  for="${rowData.item.name + '-download-btn'}"
                  text="${_t('data.explorer.DownloadNotAllowed')}"
                  position="top-start"
                ></vaadin-tooltip>
              `
            : html``}
          <mwc-icon-button
            id="rename-btn"
            ?disabled="${!this.isWritable}"
            class="tiny fg green"
            icon="edit"
            required
            filename="${rowData.item.name}"
            @click="${(e) =>
              this._openRenameDialog(e, this._isDir(rowData.item))}"
          ></mwc-icon-button>
          <mwc-icon-button
            id="delete-btn"
            ?disabled="${!this.isWritable}"
            class="tiny fg red"
            icon="delete_forever"
            filename="${rowData.item.name}"
            @click="${(e) => this._openDeleteFileDialog(e)}"
          ></mwc-icon-button>
        </div>
      `,
      root,
    );
  }

  _indexFrom1(index) {
    return index + 1;
  }

  _isDir(file) {
    if (this._APIMajorVersion < 6) {
      return file.mode.startsWith('d');
    } else {
      // For some vendor-specific storage APIs, we cannot discern file and
      // directory by just looking at the first letter of file mode. For
      // example, FlashBlade API returns file's mode as a pure number.
      // So, we have to rely on the explicit file's type property to support
      // vendor-specific APIs.
      return file.type === 'DIRECTORY';
    }
  }

  /**
   * Returns the time of the utc type for human reading.
   *
   * @param {Date} d - date
   * @return {string} UTC time string
   * */
  _humanReadableTime(d) {
    const date = new Date(d);
    const offset = date.getTimezoneOffset() / 60;
    const hours = date.getHours();
    date.setHours(hours - offset);

    return date.toUTCString();
  }

  _enqueueFolder(e) {
    const button = e.target;

    // disable button to avoid executing extra onclick event
    button.setAttribute('disabled', 'true');
    const fn = e.target.getAttribute('name');
    this.breadcrumb.push(fn);

    // enable button only if the operation is done.
    this._fetchVFolderFiles().then((res) => {
      this.fileListGrid.selectedItems = [];
      button.removeAttribute('disabled');
    });
  }

  /**
   * Return whether file is downloadable.
   * NOTE: For now, It's handled by storage host, not file itself.
   *
   * @param {Object} host
   * @return {boolean} true
   * */
  _isDownloadable(host) {
    return (this._unionedAllowedPermissionByVolume[host] ?? []).includes(
      'download-file',
    );
  }

  /**
   * Download the file.
   *
   * @param {Event} e - click the cloud_download icon button
   * @param {boolean} archive - whether archive or not
   * */
  _downloadFile(e, archive = false) {
    if (!this._isDownloadable(this.vhost)) {
      this.notification.text = _text('data.explorer.DownloadNotAllowed');
      this.notification.show();
      return;
    }
    const fn = e.target.getAttribute('filename');
    const path = this.breadcrumb.concat(fn).join('/');
    const job = globalThis.backendaiclient.vfolder.request_download_token(
      path,
      this.vfolder,
      archive,
    );
    job
      .then((res) => {
        const token = res.token;
        let url;
        if (this._APIMajorVersion < 6) {
          url =
            globalThis.backendaiclient.vfolder.get_download_url_with_token(
              token,
            );
        } else {
          url = `${res.url}?token=${res.token}&archive=${archive}`;
        }
        if (globalThis.iOSSafari) {
          this.downloadURL = url;
          // this.downloadFileDialog.show();
          URL.revokeObjectURL(url);
        } else {
          const a = document.createElement('a');
          a.style.display = 'none';
          a.addEventListener('click', function (e) {
            e.stopPropagation();
          });
          a.href = url;
          a.download = fn;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      })
      .catch((err) => {
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      });
  }

  /* File upload and download */
  /**
   * Add eventListener to the dropzone - dragleave, dragover, drop.
   * */
  _addEventListenerDropZone() {
    const dndZonePlaceholderEl = this.shadowRoot?.querySelector(
      '#dropzone',
    ) as HTMLDivElement;
    dndZonePlaceholderEl.addEventListener('dragleave', () => {
      dndZonePlaceholderEl.style.display = 'none';
    });

    // TODO specify custom event type
    this.addEventListener('dragover', (e: any) => {
      e.stopPropagation();
      e.preventDefault();
      if (this.isWritable) {
        e.dataTransfer.dropEffect = 'copy';
        dndZonePlaceholderEl.style.display = 'flex';
        return false;
      } else {
        return true;
      }
    });

    // TODO specify custom event type
    this.addEventListener('drop', (e: any) => {
      let isNotificationDisplayed = false;
      e.stopPropagation();
      e.preventDefault();
      dndZonePlaceholderEl.style.display = 'none';
      if (this.isWritable) {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          if (e.dataTransfer.items[i].webkitGetAsEntry().isFile) {
            const file = e.dataTransfer.files[i];
            /* Drag & Drop file upload size limits to configuration */
            if (
              this._maxFileUploadSize > 0 &&
              file.size > this._maxFileUploadSize
            ) {
              this.notification.text =
                _text('data.explorer.FileUploadSizeLimit') +
                ` (${globalThis.backendaiutils._humanReadableFileSize(
                  this._maxFileUploadSize,
                )})`;
              this.notification.show();
              return;
            } else {
              const reUploadFile = this.vfolderFiles.find(
                (elem: any) => elem.filename === file.name,
              );
              if (reUploadFile) {
                // plain javascript modal to confirm whether proceed to overwrite operation or not
                /*
                 *  TODO: replace confirm operation with customized dialog
                 */
                const confirmed = window.confirm(
                  `${_text('data.explorer.FileAlreadyExists')}\n${
                    file.name
                  }\n${_text('data.explorer.DoYouWantToOverwrite')}`,
                );
                if (confirmed) {
                  file.progress = 0;
                  file.caption = '';
                  file.error = false;
                  file.complete = false;
                  this.uploadFiles.push(file);
                }
              } else {
                file.progress = 0;
                file.caption = '';
                file.error = false;
                file.complete = false;
                this.uploadFiles.push(file);
              }
            }
          } else {
            // let item = e.dataTransfer.items[i].webkitGetAsEntry();
            // console.log(item.webkitRelativePath);
            // this._executeFileBrowser();
            // show snackbar to filebrowser only once
            if (!isNotificationDisplayed) {
              if (this.filebrowserSupportedImages.length > 0) {
                this.notification.text = _text(
                  'data.explorer.ClickFilebrowserButton',
                );
                this.notification.show();
              } else {
                this.notification.text = _text(
                  'data.explorer.NoImagesSupportingFileBrowser',
                );
                this.notification.show();
              }
            }
            isNotificationDisplayed = true;
          }
        }

        for (let i = 0; i < this.uploadFiles.length; i++) {
          this.fileUpload(this.uploadFiles[i]);
        }
      } else {
        this.notification.text = _text(
          'data.explorer.WritePermissionRequiredInUploadFiles',
        );
        this.notification.show();
      }
    });
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        async () => {
          this._APIMajorVersion = globalThis.backendaiclient.APIMajorVersion;
          this._maxFileUploadSize =
            globalThis.backendaiclient._config.maxFileUploadSize;
          this._isDirectorySizeVisible =
            globalThis.backendaiclient._config.isDirectorySizeVisible;
          this._getAllowedVFolderHostsByCurrentUserInfo();
          this._checkImageSupported();
          this._getVolumeInformation();
        },
        true,
      );
    } else {
      this._APIMajorVersion = globalThis.backendaiclient.APIMajorVersion;
      this._maxFileUploadSize =
        globalThis.backendaiclient._config.maxFileUploadSize;
      this._isDirectorySizeVisible =
        globalThis.backendaiclient._config.isDirectorySizeVisible;
      this._getAllowedVFolderHostsByCurrentUserInfo();
      this._checkImageSupported();
      this._getVolumeInformation();
    }
  }

  /**
   * Check the images that supports filebrowser application
   *
   */
  async _checkImageSupported() {
    const fields = [
      'name',
      'tag',
      'registry',
      'digest',
      'installed',
      'labels { key value }',
      'resource_limits { key min max }',
    ];
    const response = await globalThis.backendaiclient.image.list(
      fields,
      true,
      true,
    );
    const images = response.images;
    // Filter filebrowser supported images.
    this.filebrowserSupportedImages = images.filter((image) =>
      image.labels.find(
        (label) =>
          label.key === 'ai.backend.service-ports' &&
          label.value.toLowerCase().includes('filebrowser'),
      ),
    );
    // Filter service supported images.
    this.systemRoleSupportedImages = images.filter((image) =>
      image.labels.find(
        (label) =>
          label.key === 'ai.backend.role' &&
          label.value.toLowerCase().includes('system'),
      ),
    );
  }

  async _getAllowedVFolderHostsByCurrentUserInfo() {
    const [vhostInfo, currentKeypairResourcePolicy] = await Promise.all([
      globalThis.backendaiclient.vfolder.list_hosts(),
      this._getCurrentKeypairResourcePolicy(),
    ]);
    const currentDomain = globalThis.backendaiclient._config.domainName;
    const currentGroupId = globalThis.backendaiclient.current_group_id();
    const mergedData =
      await globalThis.backendaiclient.storageproxy.getAllowedVFolderHostsByCurrentUserInfo(
        currentDomain,
        currentGroupId,
        currentKeypairResourcePolicy,
      );

    const allowedPermissionForDomainsByVolume = JSON.parse(
      mergedData?.domain?.allowed_vfolder_hosts || '{}',
    );
    const allowedPermissionForGroupsByVolume = JSON.parse(
      mergedData?.group?.allowed_vfolder_hosts || '{}',
    );
    const allowedPermissionForResourcePolicyByVolume = JSON.parse(
      mergedData?.keypair_resource_policy.allowed_vfolder_hosts || '{}',
    );

    const _mergeDedupe = (arr) => [...new Set([].concat(...arr))];
    this._unionedAllowedPermissionByVolume = Object.assign(
      {},
      ...vhostInfo.allowed.map((volume) => {
        return {
          [volume]: _mergeDedupe([
            allowedPermissionForDomainsByVolume[volume],
            allowedPermissionForGroupsByVolume[volume],
            allowedPermissionForResourcePolicyByVolume[volume],
          ]),
        };
      }),
    );
    this.fileListGrid.clearCache();
  }

  private async _getCurrentKeypairResourcePolicy() {
    const accessKey = globalThis.backendaiclient._config.accessKey;
    const res = await globalThis.backendaiclient.keypair.info(accessKey, [
      'resource_policy',
    ]);
    return res.keypair.resource_policy;
  }

  async _fetchVFolder() {
    const groupId = globalThis.backendaiclient.current_group_id();
    const allowedVFolders =
      await globalThis.backendaiclient.vfolder.list(groupId);
    const vfolder = allowedVFolders.find((vfolder) => {
      return vfolder.id === this.vfolderID;
    });
    this.vfolderName = vfolder.name;
    this.vfolder = globalThis.backendaiclient.supports('vfolder-id-based')
      ? vfolder.id
      : vfolder.name;
    this.vhost = vfolder.host;
    this.isWritable = vfolder.permission.includes('w');

    document.dispatchEvent(
      new CustomEvent('folderExplorer:connected', { detail: this.isWritable }),
    );

    await this._fetchVFolderFiles();
  }

  async _fetchVFolderFiles() {
    this.fileListGrid.selectedItems = [];
    const filesInfo = await globalThis.backendaiclient.vfolder.list_files(
      this.breadcrumb.join('/'),
      this.vfolder,
    );

    const details = filesInfo.items;
    details.forEach((info, cnt) => {
      let ftype = 'FILE';
      if (info.name === filesInfo.items[cnt].name) {
        // value.files and value.items have same order
        ftype = filesInfo.items[cnt].type;
      } else {
        // In case the order is mixed
        for (let i = 0; i < filesInfo.items.length; i++) {
          if (info.filename === filesInfo.items[i].name) {
            ftype = filesInfo.items[i].type;
            break;
          }
        }
      }
      info.type = ftype;
    });
    this.vfolderFiles = details;

    if (
      this.filebrowserSupportedImages.length === 0 ||
      this.systemRoleSupportedImages.length === 0
    ) {
      await this._checkImageSupported();
    }
    this._toggleFilebrowserButton();
    this._toggleSSHSessionButton();
  }

  _gotoFolder(e) {
    const dest = e.target.getAttribute('dest');
    let tempBreadcrumb = this.breadcrumb;
    const index = tempBreadcrumb.indexOf(dest);

    if (index === -1) {
      return;
    }

    tempBreadcrumb = tempBreadcrumb.slice(0, index + 1);
    this.breadcrumb = tempBreadcrumb;
    this._fetchVFolderFiles();
  }

  _openRenameDialog(e, is_dir) {
    const legacyName = e.target.getAttribute('filename');
    this.newNameInput.placeholder = legacyName;
    this.newNameInput.value = '';

    this.renameDialog.show();
    this.is_dir = is_dir;
  }
  _validateExistingFileName() {
    this.newNameInput.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          this.newNameInput.validationMessage = _text(
            'data.FileAndFolderNameRequired',
          );
        }
        return {
          valid: nativeValidity.valid,
          customError: !nativeValidity.valid,
        };
      } else {
        const regex = /[`~!@#$%^&*()|+=?;:'",<>{}[\]\\/]/gi;
        let isValid: boolean;
        const oldFileName = newValue.includes('.')
          ? this.newNameInput.placeholder
          : this.newNameInput.placeholder.split('.')[0];
        if (newValue === oldFileName) {
          this.newNameInput.validationMessage = _text(
            'data.folders.SameFileName',
          );
          isValid = false;
          return {
            valid: false,
            customError: true,
          };
        } else {
          isValid = true;
        }
        isValid = !regex.test(this.newNameInput.value);
        if (!isValid) {
          this.newNameInput.validationMessage = _text(
            'data.AllowsLettersNumbersAnd-_Dot',
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
   * Select filename without extension
   *
   */
  _compareFileExtension() {
    this.newName = this.newNameInput.value;
    const oldFilename = this.newNameInput.placeholder;
    const regex = /\.([0-9a-z]+)$/i;
    const newFileExtension = this.newName.match(regex);
    const oldFileExtension = oldFilename.match(regex);

    if (this.newName.includes('.') && newFileExtension) {
      this.newFileExtension = newFileExtension[1].toLowerCase();
    } else {
      this.newFileExtension = '';
    }
    if (oldFilename.includes('.') && oldFileExtension) {
      this.oldFileExtension = oldFileExtension[1].toLowerCase();
    } else {
      this.oldFileExtension = '';
    }

    if (this.newName) {
      if (
        this.newFileExtension &&
        this.oldFileExtension !== this.newFileExtension
      ) {
        this.fileExtensionChangeDialog.show();
      } else if (this.oldFileExtension) {
        this._keepFileExtension();
      } else {
        this._renameFile();
      }
    } else {
      this._renameFile();
    }
  }

  /**
   * Keep the file extension whether the file extension is explicit or not.
   *
   */
  _keepFileExtension() {
    let newFilename = this.newNameInput.value;
    if (this.newFileExtension) {
      newFilename = newFilename.replace(
        new RegExp(this.newFileExtension + '$'),
        this.oldFileExtension,
      );
    } else {
      newFilename = newFilename + '.' + this.oldFileExtension;
    }
    // 확장자 추가하는 부분
    this.newName = newFilename;
    this._renameFile();
  }

  /**
   * Rename the file.
   *
   * */
  _renameFile() {
    const fn = this.newNameInput.placeholder;
    const path = this.breadcrumb.concat(fn).join('/');
    const newName = this.newName;

    this.fileExtensionChangeDialog.hide();
    this.newNameInput.reportValidity();
    if (this.newNameInput.checkValidity()) {
      if (fn === newName) {
        this.newNameInput.focus();
        this.notification.text = _text('data.folders.SameFileName');
        this.notification.show();
        return;
      }

      const job = globalThis.backendaiclient.vfolder.rename_file(
        path,
        newName,
        this.vfolder,
        this.is_dir,
      );
      job
        .then((res) => {
          this.newNameInput.value = '';
          this.notification.text = _text('data.folders.FileRenamed');
          this.notification.detail = '';
          this.notification.show();
          this._fetchVFolderFiles();
          this.renameDialog.hide();
        })
        .catch((err) => {
          console.error(err);
          if (err && err.message) {
            this.notification.text = err.title;
            this.notification.detail = err.message;
            this.notification.show(true, err);
          }
        });
    } else {
      return;
    }
  }

  /**
   * Open delete file dialog to delete file.
   *
   * @param {Event} e - click the delete-btn
   * */
  _openDeleteFileDialog(e) {
    const fn = e.target.getAttribute('filename');
    this.deleteFileDialog.filename = fn;
    this.deleteFileDialog.files = [];
    this.deleteFileDialog.show();
  }

  /**
   * Open the deleteFileDialog of selected files.
   *
   * @param {Event} e - click the delete button
   * */
  _openDeleteMultipleFileDialog(e?) {
    // TODO define extended type for custom property
    this.deleteFileDialog.files = this.fileListGrid.selectedItems;
    this.deleteFileDialog.filename = '';
    this.deleteFileDialog.show();
  }

  /**
   * If the user presses the Delete File button, and the Okay button on the double check dialogue, delete the file.
   *
   * @param {Event} e - click the Okay button
   * */

  _deleteFileWithCheck(e) {
    const files = this.deleteFileDialog.files;
    if (files.length > 0) {
      const filenames: string[] = [];
      files.forEach((file) => {
        const filename = this.breadcrumb.concat(file.name).join('/');
        filenames.push(filename);
      });
      const job = globalThis.backendaiclient.vfolder.delete_files(
        filenames,
        true,
        this.vfolder,
      );
      job.then((res) => {
        this.notification.text =
          files.length == 1
            ? _text('data.folders.FileDeleted')
            : _text('data.folders.MultipleFilesDeleted');
        this.notification.show();
        this._fetchVFolderFiles();
        this.deleteFileDialog.hide();
      });
    } else {
      // TODO define extended type for custom property
      if (this.deleteFileDialog.filename != '') {
        const path = this.breadcrumb
          .concat(this.deleteFileDialog.filename)
          .join('/');
        const job = globalThis.backendaiclient.vfolder.delete_files(
          [path],
          true,
          this.vfolder,
        );
        job
          .then((res) => {
            this.notification.text = _text('data.folders.FileDeleted');
            this.notification.show();
            this._fetchVFolderFiles();
            this.deleteFileDialog.hide();
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }

  openMkdirDialog() {
    if (this.mkdirDialog) {
      this.mkdirDialog.show();
    }
  }

  /**
   * Validate path name
   * */
  _validatePathName() {
    this.mkdirNameInput.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          this.mkdirNameInput.validationMessage = _text(
            'data.explorer.ValueRequired',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        } else {
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        }
      } else {
        // custom validation for path name using regex
        const regex =
          /^[^`~!@#$%^&*()|+=?;:'",<>{}[\]\r\n/]+(\/[^`~!@#$%^&*()|+=?;:'",<>{}[\]\r\n/]+)*[/\\]?$/gm;

        let isValid = regex.test(this.mkdirNameInput.value);
        if (!isValid || this.mkdirNameInput.value === './') {
          this.mkdirNameInput.validationMessage = _text(
            'data.explorer.ValueShouldBeStarted',
          );
          isValid = false;
        }
        return {
          valid: isValid,
          customError: !isValid,
        };
      }
    };
  }

  _mkdir(e) {
    const newfolder = this.mkdirNameInput.value;
    this.mkdirNameInput.reportValidity();
    if (this.mkdirNameInput.checkValidity()) {
      const job = globalThis.backendaiclient.vfolder
        .mkdir([...this.breadcrumb, newfolder].join('/'), this.vfolder)
        .catch((err) => {
          if (err & err.message) {
            this.notification.text = PainKiller.relieve(err.title);
            this.notification.detail = err.message;
            this.notification.show(true, err);
          } else if (err && err.title) {
            this.notification.text = PainKiller.relieve(err.title);
            this.notification.show(true, err);
          }
        });
      job.then((res) => {
        this.mkdirNameInput.value = '';
        this.mkdirDialog.hide();
        this._fetchVFolder();
      });
    } else {
      return;
    }
  }

  /**
   * It handles file or folder upload event, called by react component. (LegacyFolderExplorer.tsx)
   *
   * @param {string} type - file or folder
   */
  handleUpload(type: string) {
    let inputElement;

    if (type === 'file') {
      inputElement = this.shadowRoot?.querySelector(
        '#fileInput',
      ) as HTMLInputElement;
    } else if (type === 'folder') {
      inputElement = this.shadowRoot?.querySelector(
        '#folderInput',
      ) as HTMLInputElement;
    } else {
      this.notification = globalThis.lablupNotification;
      this.notification.text = _t('data.explorer.ClickFilebrowserButton');
      this.notification.description = '';
      // TODO: Below line causes error, should fix it
      // this.notification.show();
    }

    if (inputElement) {
      const evt = document.createEvent('MouseEvents');
      evt.initEvent('click', true, false);
      inputElement.dispatchEvent(evt);
    }
  }

  getFolderName(file: File) {
    const filePath = file.webkitRelativePath || file.name;
    return filePath.split('/')?.[0];
  }

  /**
   * If file is added, call the fileUpload() function and initialize fileInput string
   *
   * @param {Event} e - add file to the input element
   * */
  _uploadInputChange(e) {
    const length = e.target.files.length;
    const isFolderUpload = e.target.id === 'folderInput';
    const inputElement = isFolderUpload
      ? (this.shadowRoot?.querySelector('#folderInput') as HTMLInputElement)
      : (this.shadowRoot?.querySelector('#fileInput') as HTMLInputElement);
    let isEmptyFileIncluded = false;
    let reUploadFolderConfirmed = false;

    if (e.target.files.length > 0 && isFolderUpload) {
      const file = e.target.files[0];
      const folder = this.getFolderName(file);
      const reUploadFolder = this.vfolderFiles.find((elem: any) => {
        return elem.name === folder;
      });
      if (reUploadFolder) {
        reUploadFolderConfirmed = window.confirm(
          `${_text('data.explorer.FolderAlreadyExists')}\n${folder}\n${_text('data.explorer.DoYouWantToOverwrite')}`,
        );
        if (!reUploadFolderConfirmed) {
          inputElement.value = '';
          return;
        }
      }
    }

    for (let i = 0; i < length; i++) {
      const file = e.target.files[i];

      let text = '';
      const possible =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (let i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      /* File upload size limits to configuration */
      if (this._maxFileUploadSize > 0 && file.size > this._maxFileUploadSize) {
        this.notification.text =
          _text('data.explorer.FileUploadSizeLimit') +
          ` (${globalThis.backendaiutils._humanReadableFileSize(
            this._maxFileUploadSize,
          )})`;
        this.notification.show();
        return;
      } else if (file.size === 0) {
        // skip the empty file upload
        isEmptyFileIncluded = true;
        continue;
      } else {
        const reUploadFile = this.vfolderFiles.find(
          (elem: any) => elem.name === file.name,
        );
        if (reUploadFile && !reUploadFolderConfirmed) {
          // plain javascript modal to confirm whether proceed to overwrite "file" operation or not
          // if the user already confirms to overwrite the "folder", the modal doesn't appear.
          /*
           *  TODO: replace confirm operation with customized dialog
           */
          reUploadFolderConfirmed = window.confirm(
            `${_text('data.explorer.FileAlreadyExists')}\n${file.name}\n${_text(
              'data.explorer.DoYouWantToOverwrite',
            )}`,
          );
          if (reUploadFolderConfirmed) {
            file.id = text;
            file.progress = 0;
            file.caption = '';
            file.error = false;
            file.complete = false;
            this.uploadFiles.push(file);
          }
        } else {
          file.id = text;
          file.progress = 0;
          file.caption = '';
          file.error = false;
          file.complete = false;
          this.uploadFiles.push(file);
        }
      }
    }
    for (let i = 0; i < this.uploadFiles.length; i++) {
      this.fileUpload(this.uploadFiles[i]);
    }
    if (isEmptyFileIncluded || isFolderUpload) {
      this.notification.text = _text(
        'data.explorer.EmptyFilesAndFoldersAreNotUploaded',
      );
      this.notification.show();
    }
    inputElement.value = '';
  }

  /**
   * Upload the file.
   *
   * @param {Object} fileObj - file object
   * */
  fileUpload(fileObj) {
    this._uploadFlag = true;
    this.uploadFilesExist = this.uploadFiles.length > 0;
    const path = this.breadcrumb
      .concat(fileObj.webkitRelativePath || fileObj.name)
      .join('/');
    const job = globalThis.backendaiclient.vfolder.create_upload_session(
      path,
      fileObj,
      this.vfolder,
    );
    job.then((url) => {
      const start_date = new Date().getTime();
      const upload = new tus.Upload(fileObj, {
        endpoint: url,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        uploadUrl: url,
        chunkSize: 15728640, // 15MB
        metadata: {
          filename: path,
          filetype: fileObj.type,
        },
        onError: (error) => {
          console.log('Failed because: ' + error);
          this.currentUploadFile =
            this.uploadFiles[this.uploadFiles.indexOf(fileObj)];
          this.fileUploadCount = this.fileUploadCount - 1;
          this.runFileUploadQueue();
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          this.currentUploadFile =
            this.uploadFiles[this.uploadFiles.indexOf(fileObj)];
          if (!this._uploadFlag) {
            upload.abort();
            this.uploadFiles[this.uploadFiles.indexOf(fileObj)].caption =
              `Canceling...`;
            this.uploadFiles = this.uploadFiles.slice();
            setTimeout(() => {
              this.uploadFiles = [];
              this.uploadFilesExist = false;
              this.fileUploadCount = this.fileUploadCount - 1;
            }, 1000);
            return;
          }

          const now = new Date().getTime();
          const speed: string =
            (
              bytesUploaded /
              (1024 * 1024) /
              ((now - start_date) / 1000)
            ).toFixed(1) + 'MB/s';
          const estimated_seconds = Math.floor(
            (bytesTotal - bytesUploaded) /
              ((bytesUploaded / (now - start_date)) * 1000),
          );
          let estimated_time_left = _text('data.explorer.LessThan10Sec');
          if (estimated_seconds >= 86400) {
            estimated_time_left = _text('data.explorer.MoreThanADay');
          } else if (estimated_seconds > 10) {
            const hour = Math.floor(estimated_seconds / 3600);
            const min = Math.floor((estimated_seconds % 3600) / 60);
            const sec = estimated_seconds % 60;
            estimated_time_left = `${hour}:${min}:${sec}`;
          }
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(1);
          this.uploadFiles[this.uploadFiles.indexOf(fileObj)].progress =
            bytesUploaded / bytesTotal;
          this.uploadFiles[this.uploadFiles.indexOf(fileObj)].caption =
            `${percentage}% / Time left : ${estimated_time_left} / Speed : ${speed}`;
          this.uploadFiles = this.uploadFiles.slice();
        },
        onSuccess: () => {
          this._fetchVFolder();
          this._fetchVFolderFiles();
          this.currentUploadFile =
            this.uploadFiles[this.uploadFiles.indexOf(fileObj)];
          this.uploadFiles[this.uploadFiles.indexOf(fileObj)].complete = true;
          this.uploadFiles = this.uploadFiles.slice();
          setTimeout(() => {
            this.uploadFiles.splice(this.uploadFiles.indexOf(fileObj), 1);
            this.uploadFilesExist = this.uploadFiles.length > 0 ? true : false;
            this.uploadFiles = this.uploadFiles.slice();
            this.fileUploadCount = this.fileUploadCount - 1;
            this.runFileUploadQueue();
          }, 1000);
        },
      });
      this.runFileUploadQueue(upload);
    });
  }

  /**
   * Running file upload queue to upload files.
   *
   * @param {null | string} session - upload session
   * */
  runFileUploadQueue(session = null) {
    if (session !== null) {
      (this.fileUploadQueue as any).push(session);
    }
    let queuedSession;
    for (
      let i = this.fileUploadCount;
      i < this.concurrentFileUploadLimit;
      i++
    ) {
      if (this.fileUploadQueue.length > 0) {
        queuedSession = this.fileUploadQueue.shift();
        this.fileUploadCount = this.fileUploadCount + 1;
        queuedSession.start();
      }
    }
  }

  /**
   * Returns whether resource is enough to launch session for executing filebrowser app or not.
   * @return {boolean} - true when resource is enough, false when resource is not enough to create a session.
   */
  _isResourceEnough() {
    // update current resources statistics.
    const event = new CustomEvent('backend-ai-calculate-current-resource');
    document.dispatchEvent(event);
    const currentResource = globalThis.backendaioptions.get('current-resource');
    if (currentResource) {
      currentResource.cpu =
        typeof currentResource.cpu === 'string'
          ? parseInt(currentResource['cpu'])
          : currentResource['cpu'];
      if (
        currentResource.cpu >= this.minimumResource.cpu &&
        currentResource.mem >= this.minimumResource.mem
      ) {
        return true;
      }
    }
    return false;
  }

  /* Execute Filebrowser by launching session with mimimum resources
   *
   */
  _executeFileBrowser() {
    if (this._isResourceEnough()) {
      if (this.filebrowserSupportedImages.length > 0) {
        const isNotificationVisible = localStorage.getItem(
          'backendaiwebui.filebrowserNotification',
        );
        if (
          (isNotificationVisible == null || isNotificationVisible === 'true') &&
          !this.isWritable
        ) {
          this.fileBrowserNotificationDialog.show();
        }
        this._launchFileBrowserSession();
      } else {
        this.notification.text = _text(
          'data.explorer.NoImagesSupportingFileBrowser',
        );
        this.notification.show();
      }
    } else {
      this.notification.text = _text(
        'data.explorer.NotEnoughResourceForFileBrowserSession',
      );
      this.notification.show();
    }
  }

  /**
   * toggle filebrowser button in Vfolder explorer dialog
   */
  _toggleFilebrowserButton() {
    const isfilebrowserSupported =
      this.filebrowserSupportedImages.length > 0 && this._isResourceEnough()
        ? true
        : false;
    const filebrowserIcon = this.shadowRoot?.querySelector('#filebrowser-img');
    const filebrowserBtn = this.shadowRoot?.querySelector(
      '#filebrowser-btn',
    ) as Button;
    if (filebrowserIcon && filebrowserBtn) {
      filebrowserBtn.disabled = !isfilebrowserSupported;
      const filterClass = isfilebrowserSupported ? '' : 'apply-grayscale';
      filebrowserIcon.setAttribute('class', filterClass);
    }
  }

  /**
   * Toggle notification of filebrowser execution on read-only folder
   *
   * @param {any} e
   */
  _toggleShowFilebrowserNotification(e) {
    const checkbox = e.target;
    if (checkbox) {
      const isHidden = (!checkbox.checked).toString();
      localStorage.setItem('backendaiwebui.filebrowserNotification', isHidden);
    }
  }

  /**
   * Open the session launcher dialog to execute filebrowser app.
   *
   */
  async _launchFileBrowserSession() {
    let appOptions;
    const imageResource: Record<string, unknown> = {};
    // monkeypatch for filebrowser applied environment
    // const environment = 'cr.backend.ai/testing/filebrowser:21.01-ubuntu20.04';
    const images = this.filebrowserSupportedImages.filter(
      (image: any) =>
        image['name'].toLowerCase().includes('filebrowser') &&
        image['installed'],
    );

    // select one image to launch filebrowser supported session
    const preferredImage = images[0];
    const environment =
      preferredImage['registry'] +
      '/' +
      preferredImage['name'] +
      ':' +
      preferredImage['tag'];

    // add current folder
    imageResource['mounts'] = [this.vfolderName];
    imageResource['cpu'] = 1;
    imageResource['mem'] = this.minimumResource.mem + 'g';
    imageResource['domain'] = globalThis.backendaiclient._config.domainName;
    imageResource['group_name'] = globalThis.backendaiclient.current_group;
    const indicator = await this.indicator.start('indeterminate');

    return globalThis.backendaiclient
      .get_resource_slots()
      .then((response) => {
        indicator.set(20, _text('data.explorer.ExecutingFileBrowser'));
        return globalThis.backendaiclient.createIfNotExists(
          environment,
          null,
          imageResource,
          30000,
          undefined,
        );
      })
      .then(async (res) => {
        const service_info = res.servicePorts;
        appOptions = {
          'session-uuid': res.sessionId,
          'session-name': res.sessionName,
          'access-key': '',
          runtime: 'filebrowser',
          arguments: { '--root': '/home/work/' + this.vfolderName },
        };
        // only launch filebrowser app when it has valid service ports
        if (
          service_info.length > 0 &&
          service_info.filter((el) => el.name === 'filebrowser').length > 0
        ) {
          globalThis.appLauncher.showLauncher(appOptions);
        }
        indicator.end(1000);
      })
      .catch((err) => {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
        indicator.end(100);
      });
  }

  async _getVolumeInformation() {
    const vhostInfo = await globalThis.backendaiclient.vfolder.list_hosts();
    this.volumeInfo = vhostInfo.volume_info || {};
  }

  _executeSSHProxyAgent() {
    if (this.volumeInfo[this.vhost]?.sftp_scaling_groups?.length > 0) {
      if (this.systemRoleSupportedImages.length > 0) {
        this._launchSystemRoleSSHSession();
        this._toggleSSHSessionButton();
      } else {
        this.notification.text = _text(
          'data.explorer.NoImagesSupportingSystemSession',
        );
        this.notification.show();
      }
    } else {
      this.notification.text = _text('data.explorer.SFTPSessionNotAvailable');
      this.notification.show();
    }
  }

  /**
   * Launch system role sftp-uploader image and open the dialog that includes the ssh link.
   */
  async _launchSystemRoleSSHSession() {
    const imageResource: Record<string, unknown> = {};
    const configSSHImage = globalThis.backendaiclient._config.systemSSHImage;
    const images = this.systemRoleSupportedImages.filter(
      (image: any) => image['installed'],
    );
    // TODO: use lablup/openssh-server image
    // select one image to launch system role supported session
    const preferredImage = images[0];
    const environment =
      configSSHImage !== ''
        ? configSSHImage
        : preferredImage['registry'] +
          '/' +
          preferredImage['name'] +
          ':' +
          preferredImage['tag'];

    // add current folder
    imageResource['mounts'] = [this.vfolderName];
    imageResource['cpu'] = 1;
    imageResource['mem'] = '256m';
    imageResource['type'] = 'system';
    imageResource['domain'] = globalThis.backendaiclient._config.domainName;
    imageResource['scaling_group'] =
      this.volumeInfo[this.vhost]?.sftp_scaling_groups[0];
    imageResource['group_name'] = globalThis.backendaiclient.current_group;
    const indicator = await this.indicator.start('indeterminate');
    return (async () => {
      try {
        await globalThis.backendaiclient.get_resource_slots();
        indicator.set(50, _text('data.explorer.StartingSSH/SFTPSession'));
        const sessionResponse =
          await globalThis.backendaiclient.createIfNotExists(
            environment,
            `sftp-${this.vfolderID}`,
            imageResource,
            30000,
            undefined,
          );
        if (sessionResponse.status === 'CANCELLED') {
          // Max # of upload sessions exceeded for this used
          this.notification.text = PainKiller.relieve(
            _text('data.explorer.NumberOfSFTPSessionsExceededTitle'),
          );
          this.notification.detail = _text(
            'data.explorer.NumberOfSFTPSessionsExceededBody',
          );
          this.notification.show(true, {
            title: _text('data.explorer.NumberOfSFTPSessionsExceededTitle'),
            message: _text('data.explorer.NumberOfSFTPSessionsExceededBody'),
          });
          indicator.end(100);
          return;
        }
        const directAccessInfo =
          await globalThis.backendaiclient.get_direct_access_info(
            sessionResponse.sessionId,
          );
        const host = directAccessInfo.public_host.replace(/^https?:\/\//, '');
        const port = directAccessInfo.sshd_ports;
        const event = new CustomEvent('read-ssh-key-and-launch-ssh-dialog', {
          detail: {
            sessionUuid: sessionResponse.sessionId,
            host: host,
            port: port,
            mounted: this.vfolderName,
          },
        });
        document.dispatchEvent(event);
        indicator.end(100);
      } catch (err) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
        indicator.end(100);
      }
    })();
  }

  _toggleSSHSessionButton() {
    const isSystemRoleSupported = this.systemRoleSupportedImages.length > 0;
    const sshImageIcon = this.shadowRoot?.querySelector('#ssh-img');
    const sshImageBtn = this.shadowRoot?.querySelector('#ssh-btn') as Button;
    if (sshImageIcon && sshImageBtn) {
      sshImageBtn.disabled = !isSystemRoleSupported;
      const filterClass = isSystemRoleSupported ? '' : 'apply-grayscale';
      sshImageIcon.setAttribute('class', filterClass);
    }
  }

  uploadListRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <vaadin-item class="progress-item">
          <div>
            ${rowData.item.complete
              ? html`
                  <mwc-icon>check</mwc-icon>
                `
              : html``}
          </div>
        </vaadin-item>
      `,
      root,
    );
  }

  uploadProgressRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <vaadin-item>
          <span>${rowData.item.name}</span>
          ${rowData.item.complete
            ? html``
            : html`
                <div>
                  <vaadin-progress-bar
                    value="${rowData.item.progress}"
                  ></vaadin-progress-bar>
                </div>
                <div>
                  <span>${rowData.item.caption}</span>
                </div>
              `}
        </vaadin-item>
      `,
      root,
    );
  }

  /**
   * Cancel upload files.
   *
   * */
  _cancelUpload() {
    this._uploadFlag = false;
  }

  render() {
    // language=HTML
    return html`
      <div id="container">
        <div class="breadcrumb">
          ${this.breadcrumb
            ? html`
                <ul style="padding: 0;">
                  ${this.breadcrumb.map(
                    (item) => html`
                      <li style="white-space: nowrap;">
                        ${item === '.'
                          ? html`
                              <mwc-icon-button
                                icon="folder_open"
                                dest="${item}"
                                @click="${(e) => this._gotoFolder(e)}"
                              ></mwc-icon-button>
                            `
                          : html`
                              <a
                                outlined
                                class="goto"
                                path="item"
                                @click="${(e) => this._gotoFolder(e)}"
                                dest="${item}"
                                style="white-space: normal; word-break: break-all;"
                              >
                                ${item}
                              </a>
                            `}
                      </li>
                    `,
                  )}
                </ul>
              `
            : html``}
        </div>
        <vaadin-grid
          id="file-list-grid"
          class="explorer"
          theme="row-stripes compact dark"
          aria-label="Explorer"
          .items="${this.vfolderFiles}"
        >
          <vaadin-grid-selection-column
            auto-select
          ></vaadin-grid-selection-column>
          <vaadin-grid-sort-column
            auto-width
            resizable
            header="${_t('data.explorer.Name')}"
            path="filename"
            .renderer="${this._boundFileNameRenderer}"
          ></vaadin-grid-sort-column>
          <vaadin-grid-sort-column
            auto-width
            resizable
            header="${_t('data.explorer.Created')}"
            path="ctime"
            .renderer="${this._boundCreatedTimeRenderer}"
          ></vaadin-grid-sort-column>
          <vaadin-grid-sort-column
            auto-width
            resizable
            header="${_t('data.explorer.Size')}"
            path="size"
            .renderer="${this._boundSizeRenderer}"
          ></vaadin-grid-sort-column>
          <vaadin-grid-column
            width="130px"
            header="${_t('data.explorer.Actions')}"
            .renderer="${this._boundControlFileListRenderer}"
          ></vaadin-grid-column>
        </vaadin-grid>
        <div id="dropzone"></div>
        <input
          type="file"
          id="fileInput"
          @change="${(e) => this._uploadInputChange(e)}"
          hidden
          multiple
        />
        <input
          type="file"
          id="folderInput"
          @change="${(e) => this._uploadInputChange(e)}"
          hidden
          webkitdirectory
          mozdirectory
          directory
          multiple
        />
        ${this.uploadFilesExist
          ? html`
              <div class="horizontal layout start-justified">
                <mwc-button
                  icon="cancel"
                  id="cancel_upload"
                  @click="${() => this._cancelUpload()}"
                >
                  ${_t('data.explorer.StopUploading')}
                </mwc-button>
              </div>
              <div class="horizontal layout center progress-item flex">
                ${this.currentUploadFile?.complete
                  ? html`
                      <mwc-icon>check</mwc-icon>
                    `
                  : html``}
                <div class="vertical layout progress-item" style="width:100%;">
                  <span>${this.currentUploadFile?.name}</span>
                  <vaadin-progress-bar
                    value="${this.currentUploadFile?.progress}"
                  ></vaadin-progress-bar>
                  <span>${this.currentUploadFile?.caption}</span>
                </div>
              </div>
            `
          : html``}
      </div>
      <backend-ai-dialog id="rename-file-dialog" fixed backdrop blockscrolling>
        <span slot="title">
          ${this.is_dir
            ? _t('data.explorer.RenameAFolder')
            : _t('data.explorer.RenameAFile')}
        </span>
        <div slot="content">
          <mwc-textfield
            class="red"
            id="new-file-name"
            label=${this.is_dir
              ? _t('data.explorer.Foldername')
              : _t('data.explorer.Filename')}
            required
            @change="${() => this._validateExistingFileName()}"
            auto-validate
            style="width:320px;"
            maxLength="255"
          ></mwc-textfield>
          <div
            id="input-footer"
            style="padding-left:15px;height:2.5em;color:gray;"
          >
            ${_t('maxLength.255chars')}
          </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
            icon="edit"
            fullwidth
            type="button"
            id="rename-file-button"
            unelevated
            @click="${() => this._compareFileExtension()}"
          >
            ${this.is_dir
              ? _text('data.explorer.RenameAFolder')
              : _text('data.explorer.RenameAFile')}
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="file-extension-change-dialog" fixed backdrop>
        <span slot="title">${_t('dialog.title.LetsDouble-Check')}</span>
        <div slot="content">
          <p>${_t('data.explorer.FileExtensionChanged')}</p>
        </div>
        <div
          slot="footer"
          class="horizontal center-justified flex layout distancing"
          style="gap: var(--token-marginSM)"
        >
          <mwc-button
            outlined
            fullwidth
            @click="${(e) => this._keepFileExtension()}"
          >
            ${globalThis.backendaioptions.get(
              'language',
              'default',
              'general',
            ) !== 'ko'
              ? _text('data.explorer.KeepFileExtension') + this.oldFileExtension
              : this.oldFileExtension +
                _text('data.explorer.KeepFileExtension')}
          </mwc-button>
          <mwc-button unelevated fullwidth @click="${() => this._renameFile()}">
            ${globalThis.backendaioptions.get(
              'language',
              'default',
              'general',
            ) !== 'ko'
              ? _text('data.explorer.RemoveFileExtension') +
                this.oldFileExtension
              : this.oldFileExtension +
                _text('data.explorer.RemoveFileExtension')}
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="delete-file-dialog" fixed backdrop>
        <span slot="title">${_t('dialog.title.LetsDouble-Check')}</span>
        <div slot="content">
          <p>
            ${_t('dialog.warning.CannotBeUndone')}
            ${_t('dialog.ask.DoYouWantToProceed')}
          </p>
        </div>
        <div
          slot="footer"
          class="horizontal end-justified flex layout"
          style="gap: 10px;"
        >
          <mwc-button outlined @click="${(e) => this._hideDialog(e)}">
            ${_t('button.Cancel')}
          </mwc-button>
          <mwc-button raised @click="${(e) => this._deleteFileWithCheck(e)}">
            ${_t('button.Okay')}
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="mkdir-dialog" fixed backdrop>
        <span slot="title">${_t('data.explorer.CreateANewFolder')}</span>
        <div slot="content">
          <mwc-textfield
            id="mkdir-name"
            label="${_t('data.explorer.Foldername')}"
            @change="${() => this._validatePathName()}"
            required
            maxLength="255"
            placeholder="${_t('maxLength.255chars')}"
            validationMessage="${_text('data.explorer.ValueRequired')}"
          ></mwc-textfield>
          <br />
        </div>
        <div
          slot="footer"
          class="horizontal center-justified flex layout distancing"
        >
          <mwc-button
            icon="rowing"
            unelevated
            fullwidth
            type="submit"
            id="mkdir-btn"
            @click="${(e) => this._mkdir(e)}"
          >
            ${_t('button.Create')}
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog
        id="filebrowser-notification-dialog"
        fixed
        backdrop
        narrowLayout
      >
        <span slot="title">${_t('dialog.title.Notice')}</span>
        <div slot="content" style="margin: 15px;">
          <span>${_t('data.explorer.ReadOnlyFolderOnFileBrowser')}</span>
        </div>
        <div
          slot="footer"
          class="flex horizontal layout center justified"
          style="margin: 15px 15px 15px 0px;"
        >
          <div class="horizontal layout start-justified center">
            <mwc-checkbox
              @change="${(e) => this._toggleShowFilebrowserNotification(e)}"
            ></mwc-checkbox>
            <span style="font-size:0.8rem;">
              ${_text('dialog.hide.DoNotShowThisAgain')}
            </span>
          </div>
          <mwc-button unelevated @click="${(e) => this._hideDialog(e)}">
            ${_t('button.Confirm')}
          </mwc-button>
        </div>
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-folder-explorer': BackendAIFolderExplorer;
  }
}
