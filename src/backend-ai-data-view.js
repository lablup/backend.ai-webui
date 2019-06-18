/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {html, PolymerElement} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-styles/typography';
import '@polymer/paper-styles/color';
import '@polymer/paper-item/paper-item.js';
import './components/lablup-loading-indicator';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';

import '@vaadin/vaadin-grid/vaadin-grid.js';
import '@vaadin/vaadin-grid/vaadin-grid-sorter.js';
import '@vaadin/vaadin-item/vaadin-item.js';
import '@vaadin/vaadin-upload/vaadin-upload.js';

import 'weightless/button';
import 'weightless/icon';
import 'weightless/card';
import 'weightless/dialog';

import './components/lablup-notification.js';
import './backend-ai-styles.js';
import './lablup-activity-panel.js';
import './plastics/lablup-shields/lablup-shields';
import {OverlayPatchMixin} from './overlay-patch-mixin.js'
import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';

class BackendAIData extends OverlayPatchMixin(PolymerElement) {
  constructor() {
    super();
    // Resolve warning about scroll performance
    // See https://developers.google.com/web/updates/2016/06/passive-event-listeners
    setPassiveTouchGestures(true);
  }

  static get properties() {
    return {
      folders: {
        type: Object,
        value: {}
      },
      folderInfo: {
        type: Object,
        value: {}
      },
      is_admin: {
        type: Boolean,
        value: false
      },
      authenticated: {
        type: Boolean,
        value: false
      },
      deleteFolderId: {
        type: String,
        value: ''
      },
      active: {
        type: Boolean,
        value: false
      },
      explorer: {
        type: Object,
        value: {},
      },
      uploadFiles: {
        type: Array,
        value: [],
      },
      vhost: {
        type: String,
        value: 'local'
        //value: 'cephfs'
      },
      vhosts: {
        type: Array,
        value: ['local']
        //value: 'cephfs'
      },
    };
  }

  static get observers() {
    return [
      '_routeChanged(route.*)',
      '_viewChanged(routeData.view)',
      '_menuChanged(active)'
    ]
  }

  static get template() {
    // language=HTML
    return html`
      <style is="custom-style" include="backend-ai-styles iron-flex iron-flex-alignment iron-positioning">
        vaadin-grid {
          border: 0 !important;
          font-size: 12px;
        }

        ul {
          padding-left: 0;
        }

        ul li {
          list-style: none;
          font-size: 13px;
        }

        span.indicator {
          width: 100px;
        }

        wl-button.add-button,
        wl-button.delete-button {
          width: 100%;
        }

        paper-icon-button.tiny {
          width: 35px;
          height: 35px;
        }

        .warning {
          color: red;
        }

        vaadin-item {
          font-size: 13px;
          font-weight: 100;
        }

        #folder-explorer-dialog {
          --dialog-height: calc(100vh - 120px);
          height: calc(100vh - 120px);
          right: 0;
          top: 0;
          position: fixed;
          margin: 120px 0 0 0;
        }

        @media screen and (max-width: 899px) {
          #folder-explorer-dialog {
            left: 0;
            --dialog-width: 100%;
            width: 100%;
          }
        }

        @media screen and (min-width: 900px) {
          #folder-explorer-dialog {
            left: 150px;
            --dialog-width: calc(100% - 100px);
            width: calc(100% - 100px);
          }
        }

        div.breadcrumb {
          color: #637282;
          font-size: 1em;
        }

        div.breadcrumb span:first-child {
          display: none;
        }

        wl-button.goto {
          margin: 0;
          padding: 5px;
          min-width: 0;
        }

        wl-button.goto:last-of-type {
          font-weight: bold;
        }

        div#upload {
          margin: 0;
          padding: 0;
        }

        div#dropzone {
          display: none;
          position: absolute;
          top: 0;
          height: 100%;
          width: 100%;
          z-index: 10;
        }

        div#dropzone, div#dropzone p {
          margin: 0;
          padding: 0;
          width: 100%;
          background: rgba(211, 211, 211, .5);
          text-align: center;
        }

        .progress {
          padding: 30px 10px;
          border: 1px solid lightgray;
        }

        .progress-item {
          padding: 10px 30px;
        }

        wl-button {
          --button-bg: var(--paper-orange-50);
          --button-bg-hover: var(--paper-orange-100);
          --button-bg-active: var(--paper-orange-600);
          color: var(--paper-orange-900);
        }

      </style>
      <lablup-notification id="notification"></lablup-notification>
      <lablup-loading-indicator id="loading-indicator"></lablup-loading-indicator>
      <wl-card class="item" elevation="1" style="padding-bottom:20px;">
        <h3 class="horizontal center flex layout">
          <span>Virtual Folders</span>
          <span class="flex"></span>
          <wl-button class="fg red" id="add-folder" outlined>
            <wl-icon>add</wl-icon>
            New folder
          </wl-button>
        </h3>

        <vaadin-grid theme="row-stripes column-borders compact" aria-label="Folder list" items="[[folders]]">
          <vaadin-grid-column width="40px" flex-grow="0" resizable>
            <template class="header">#</template>
            <template>[[_indexFrom1(index)]]</template>
          </vaadin-grid-column>

          <vaadin-grid-column resizable>
            <template class="header">Folder Name</template>
            <template>
              <div class="indicator" on-tap="_folderExplorer" folder-id="[[item.name]]">[[item.name]]</div>
            </template>
          </vaadin-grid-column>

          <vaadin-grid-column resizable>
            <template class="header">id</template>
            <template>
              <div class="layout vertical">
                <span>[[item.id]]</span>
              </div>
            </template>
          </vaadin-grid-column>

          <vaadin-grid-column width="85px" flex-grow="0" resizable>
            <template class="header">Location</template>
            <template>
              <div class="layout vertical">
                <span>[[item.host]]</span>
              </div>
            </template>
          </vaadin-grid-column>

          <vaadin-grid-column width="85px" flex-grow="0" resizable>
            <template class="header">Permission</template>
            <template>
              <div class="horizontal center-justified wrap layout">
                <template is="dom-if" if="[[_hasPermission(item, 'r')]]">
                  <lablup-shields app="" color="green"
                                  description="R" ui="flat"></lablup-shields>
                </template>
                <template is="dom-if" if="[[_hasPermission(item, 'w')]]">
                  <lablup-shields app="" color="blue"
                                  description="W" ui="flat"></lablup-shields>
                </template>
                <template is="dom-if" if="[[_hasPermission(item, 'd')]]">
                  <lablup-shields app="" color="red"
                                  description="D" ui="flat"></lablup-shields>
                </template>
              </div>
            </template>
          </vaadin-grid-column>
          <vaadin-grid-column resizable>
            <template class="header">Control</template>
            <template>
              <div id="controls" class="layout horizontal flex center"
                   folder-id="[[item.name]]">
                <paper-icon-button class="fg green controls-running" icon="vaadin:info-circle-o"
                                   on-tap="_infoFolder"></paper-icon-button>
                <template is="dom-if" if="[[_hasPermission(item, 'r')]]">
                  <paper-icon-button class="fg blue controls-running" icon="folder-open"
                                     on-tap="_folderExplorer" folder-id="[[item.name]]"></paper-icon-button>
                </template>
                <template is="dom-if" if="[[_hasPermission(item, 'w')]]">
                </template>
                <template is="dom-if" if="[[_hasPermission(item, 'd')]]">
                  <paper-icon-button class="fg red controls-running" icon="delete"
                                     on-tap="_deleteFolderDialog"></paper-icon-button>
                </template>
              </div>
            </template>
          </vaadin-grid-column>
        </vaadin-grid>
      </wl-card>
      <wl-card>
        <h4 class="horizontal center layout">
          <span>Public Data</span>
        </h4>
        <div class="horizontal center flex layout" style="padding:15px;">
          <div>No data present.</div>
        </div>
      </wl-card>
      <wl-dialog id="add-folder-dialog" fixed backdrop blockscrolling>
        <wl-card elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Create a new virtual folder</span>
            <div class="flex"></div>
            <wl-button fab flat inverted on-tap="_hideDialog">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <div>
            <paper-input id="add-folder-name" label="Folder name" pattern="[a-zA-Z0-9_-]*"
                         error-message="Allows letters, numbers and -_." auto-validate></paper-input>
            <paper-dropdown-menu id="add-folder-host" label="Host">
              <paper-listbox slot="dropdown-content" selected="0">
                <template is="dom-repeat" items="[[ vhosts ]]">
                  <paper-item id="[[ item ]]" label="[[ item ]]">[[ item ]]</paper-item>
                </template>
              </paper-listbox>
            </paper-dropdown-menu>
            <br/>
            <wl-button class="blue" type="submit" id="add-button" outlined>
              <wl-icon>rowing</wl-icon>
              Create
            </wl-button>
          </div>
        </wl-card>
      </wl-dialog>
      <wl-dialog id="delete-folder-dialog" fixed backdrop blockscrolling>
        <wl-card class="login-panel intro centered" style="margin: 0;padding:0;--card-elevation:0;">
          <h3 class="horizontal center layout">
            <span>Delete a virtual folder</span>
            <div class="flex"></div>
            <wl-button fab flat inverted on-tap="_hideDialog">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <div class="warning">WARNING: this cannot be undone!</div>
          <div>
            <paper-input class="red" id="delete-folder-name" label="Type folder name to delete"
                         pattern="[a-zA-Z0-9_-]*"
                         error-message="Allows letters, numbers and -_." auto-validate></paper-input>
            <br/>
            <wl-button class="blue delete-button" type="submit" id="delete-button" outlined>
              <wl-icon>close</wl-icon>
              Delete
            </wl-button>
          </div>
        </wl-card>
      </wl-dialog>
      <wl-dialog id="info-folder-dialog" fixed backdrop blockscrolling>
        <wl-card elevation="1" class="intro centered" style="margin: 0;">
          <h3 class="horizontal center layout" style="border-bottom:1px solid #ddd;">
            <span>[[folderInfo.name]]</span>
            <div class="flex"></div>
            <wl-button fab flat inverted on-tap="_hideDialog">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <div role="listbox" style="margin: 0;">
            <vaadin-item>
              <div><strong>ID</strong></div>
              <div secondary>[[folderInfo.id]]</div>
            </vaadin-item>
            <vaadin-item>
              <div><strong>Location</strong></div>
              <div secondary>[[folderInfo.host]]</div>
            </vaadin-item>
            <vaadin-item>
              <div><strong>Number of Files</strong></div>
              <div secondary>[[folderInfo.numFiles]]</div>
            </vaadin-item>
            <template is="dom-if" if="[[folderInfo.is_owner]]">
              <vaadin-item>
                <div><strong>Ownership</strong></div>
                <div secondary>You are the owner of this folder.</div>
              </vaadin-item>
            </template>
            <vaadin-item>
              <div><strong>Permission</strong></div>
              <div secondary>[[folderInfo.permission]]</div>
            </vaadin-item>
          </div>
        </wl-card>
      </wl-dialog>
      <wl-dialog id="folder-explorer-dialog">
        <wl-card elevation="1" class="intro" style="margin: 0; box-shadow: none; height: 100%;">
          <h3 class="horizontal center layout" style="font-weight:bold">
            <span>[[explorer.id]]</span>
            <div class="flex"></div>
            <wl-button fab flat inverted on-tap="_hideDialog">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>

          <div class="breadcrumb">
            <template is="dom-repeat" items="[[explorer.breadcrumb]]">
              <span>&gt;</span>
              <wl-button outlined class="goto" path="item" on-click="_gotoFolder" dest="[[item]]">[[item]]</wl-button>
            </template>
          </div>

          <div>
            <vaadin-button raised id="add-btn" on-tap="_uploadFileBtnClick">Upload Files...</vaadin-button>
            <vaadin-button id="mkdir" on-click="_mkdirDialog">New Directory</vaadin-button>
          </div>

          <div id="upload">
            <div id="dropzone"><p>drag</p></div>
            <input type="file" id="fileInput" on-change="_uploadFileChange" hidden multiple>
            <template is="dom-if" if="[[uploadFiles.length]]">
              <vaadin-grid class="progress" theme="row-stripes compact" aria-label="uploadFiles" items="[[uploadFiles]]"
                           height-by-rows>
                <vaadin-grid-column width="100px" flex-grow="0">
                  <template>
                    <vaadin-item class="progress-item">
                      <div>
                        <template is="dom-if" if="[[item.complete]]">
                          <wl-icon>check</wl-icon>
                        </template>
                      </div>
                    </vaadin-item>
                  </template>
                </vaadin-grid-column>

                <vaadin-grid-column>
                  <template>
                    <vaadin-item>
                      <span>[[item.name]]</span>
                      <template is="dom-if" if="[[!item.complete]]">
                        <div>
                          <vaadin-progress-bar indeterminate value="0"></vaadin-progress-bar>
                        </div>
                      </template>
                    </vaadin-item>
                  </template>
                </vaadin-grid-column>
              </vaadin-grid>
            </template>
          </div>

          <vaadin-grid theme="row-stripes compact" aria-label="Explorer" items="[[explorer.files]]">
            <vaadin-grid-column width="40px" flex-grow="0" resizable>
              <template class="header">#</template>
              <template>[[_indexFrom1(index)]]</template>
            </vaadin-grid-column>

            <vaadin-grid-column flex-grow="2" resizable>
              <template class="header">
                <vaadin-grid-sorter path="filename">Name</vaadin-grid-sorter>
              </template>
              <template>
                <template is="dom-if" if="[[_isDir(item)]]">
                  <div class="indicator" on-click="_enqueueFolder" name="[[item.filename]]">
                    <paper-icon-button class="fg controls-running" icon="folder-open"
                                       name="[[item.filename]]"></paper-icon-button>
                    [[item.filename]]
                  </div>
                </template>

                <template is="dom-if" if="[[!_isDir(item)]]">
                  <div class="indicator">
                    <paper-icon-button class="fg controls-running" icon="insert-drive-file"></paper-icon-button>
                    [[item.filename]]
                  </div>
                </template>
              </template>
            </vaadin-grid-column>

            <vaadin-grid-column flex-grow="2" resizable>
              <template class="header">
                <vaadin-grid-sorter path="ctime">Created</vaadin-grid-sorter>
              </template>
              <template>
                <div class="layout vertical">
                  <span>[[_humanReadableTime(item.ctime)]]</span>
                </div>
              </template>
            </vaadin-grid-column>

            <vaadin-grid-column flex-grow="1" resizable>
              <template class="header">
                <vaadin-grid-sorter path="size">Size</vaadin-grid-sorter>
              </template>
              <template>
                <div class="layout vertical">
                  <span>[[item.size]]</span>
                </div>
              </template>
            </vaadin-grid-column>

            <vaadin-grid-column flex-grow="2" resizable>
              <template class="header">Actions</template>
              <template>
                <template is="dom-if" if="[[!_isDir(item)]]">
                  <template is="dom-if" if="[[_isDownloadable(item)]]">
                    <paper-icon-button id="download-btn" class="tiny fg red" icon="vaadin:download"
                                       filename="[[item.filename]]" on-tap="_downloadFile"></paper-icon-button>
                  </template>
                </template>
              </template>
            </vaadin-grid-column>
          </vaadin-grid>
        </wl-card>
      </wl-dialog>

      <wl-dialog id="mkdir-dialog" fixed blockscrolling backdrop>
        <wl-card elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Create a new folder</span>
            <div class="flex"></div>
            <wl-button fab flat inverted on-tap="_hideDialog">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <div>
            <paper-input id="mkdir-name" label="Folder name" pattern="[a-zA-Z0-9_-]*"
                         error-message="Allows letters, numbers and -_." auto-validate></paper-input>
            <br/>
            <wl-button class="blue add-button" type="submit" id="mkdir-btn" on-click="_mkdir" outlined>
              <wl-icon>rowing</wl-icon>
              Create
            </wl-button>
          </div>
        </wl-card>
      </wl-dialog>
    `;
  }

  ready() {
    super.ready();
    this._addEventListenerDropZone();
    document.addEventListener('backend-ai-connected', () => {
      this.is_admin = window.backendaiclient.is_admin;
      this.authenticated = true;
      this._refreshFolderList();
    }, true);
    this.$['add-folder'].addEventListener('tap', this._addFolderDialog.bind(this));
    this.$['add-button'].addEventListener('tap', this._addFolder.bind(this));
    this.$['delete-button'].addEventListener('tap', this._deleteFolderWithCheck.bind(this));

    this._clearExplorer = this._clearExplorer.bind(this);
    this._mkdir = this._mkdir.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    afterNextRender(this, function () {
    });
  }

  shouldUpdate() {
    return this.active;
  }

  _refreshFolderList() {
    this.shadowRoot.querySelector('#loading-indicator').show();
    let l = window.backendaiclient.vfolder.list();
    l.then((value) => {
      this.shadowRoot.querySelector('#loading-indicator').hide();
      this.folders = value;
    });
    let vhosts = window.backendaiclient.vfolder.list_hosts();
    vhosts.then((response) => {
      console.log(response);
    });
  }

  _menuChanged(active) {
    if (!active) {

    } else {
      if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
        document.addEventListener('backend-ai-connected', () => {
          this.is_admin = window.backendaiclient.is_admin;
          this.authenticated = true;
          this._refreshFolderList();
        }, true);
      } else {
        this.is_admin = window.backendaiclient.is_admin;
        this.authenticated = true;
        this._refreshFolderList();
      }
    }
  }

  _countObject(obj) {
    return Object.keys(obj).length;
  }

  async _addFolderDialog() {
    let vhost_info = await window.backendaiclient.vfolder.list_hosts();
    this.vhosts = vhost_info.allowed;
    this.vhost = vhost_info.default;
    this.openDialog('add-folder-dialog');
  }

  _folderExplorerDialog() {
    this.openDialog('folder-explorer-dialog');
  }

  _mkdirDialog() {
    this.$['mkdir-name'].value = '';
    this.openDialog('mkdir-dialog');
  }

  openDialog(id) {
    //var body = document.querySelector('body');
    //body.appendChild(this.$[id]);
    this.$[id].show();
  }

  closeDialog(id) {
    this.$[id].hide();
  }

  _indexFrom1(index) {
    return index + 1;
  }

  _hasPermission(item, perm) {
    if (item.permission.includes(perm)) {
      return true;
    }
    if (item.permission.includes('w') && perm === 'r') {
      return true;
    }
    return false;
  }

  _addFolder() {
    let name = this.$['add-folder-name'].value;
    let host = this.shadowRoot.querySelector('#add-folder-host').value;
    let job = window.backendaiclient.vfolder.create(name, host);
    job.then((value) => {
      this.$.notification.text = 'Virtual folder is successfully created.';
      this.$.notification.show();
      this._refreshFolderList();
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.$.notification.text = err.message;
        this.$.notification.show();
      }
    });
    this.closeDialog('add-folder-dialog');
  }

  _getControlId(e) {
    const termButton = e.target;
    const controls = e.target.closest('#controls');
    return controls.folderId;
  }

  _infoFolder(e) {
    const folderId = this._getControlId(e);
    let job = window.backendaiclient.vfolder.info(folderId);
    job.then((value) => {
      this.folderInfo = value;
      this.openDialog('info-folder-dialog');
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.$.notification.text = err.message;
        this.$.notification.show();
      }
    });
  }

  _deleteFolderDialog(e) {
    this.deleteFolderId = this._getControlId(e);
    this.$['delete-folder-name'].value = '';
    this.openDialog('delete-folder-dialog');
  }

  _deleteFolderWithCheck() {
    let typedDeleteFolderName = this.$['delete-folder-name'].value;
    if (typedDeleteFolderName != this.deleteFolderId) {
      this.$.notification.text = 'Folder name mismatched. Check your typing.';
      this.$.notification.show();
      return;
    }
    this.closeDialog('delete-folder-dialog');
    this._deleteFolder(this.deleteFolderId);
  }

  _deleteFolder(folderId) {
    let job = window.backendaiclient.vfolder.delete(folderId);
    job.then((value) => {
      this.$.notification.text = 'Virtual folder is successfully deleted.';
      this.$.notification.show();
      this._refreshFolderList();
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.$.notification.text = err.message;
        this.$.notification.show();
      }
    });
  }

  /*Folder Explorer*/
  _clearExplorer(path = this.explorer.breadcrumb.join('/'),
                 id = this.explorer.id,
                 dialog = false) {
    let job = window.backendaiclient.vfolder.list_files(path, id);
    job.then(value => {
      this.set('explorer.files', JSON.parse(value.files));

      if (dialog) {
        this.openDialog('folder-explorer-dialog');
      }

    });
  }

  _folderExplorer(e) {
    const folderId = e.target.folderId;

    let explorer = {
      id: folderId,
      breadcrumb: ['.'],
    };

    this.set('explorer', explorer);
    this._clearExplorer(explorer.breadcrumb.join('/'), explorer.id, true);
  }

  _enqueueFolder(e) {
    const fn = e.target.name;
    this.push('explorer.breadcrumb', fn);
    this._clearExplorer();
  }

  _gotoFolder(e) {
    const dest = e.target.dest;
    let tempBreadcrumb = this.explorer.breadcrumb;
    const index = tempBreadcrumb.indexOf(dest);

    if (index === -1) {
      return;
    }

    tempBreadcrumb = tempBreadcrumb.slice(0, index + 1);

    this.set('explorer.breadcrumb', tempBreadcrumb);
    this._clearExplorer(tempBreadcrumb.join('/'), this.explorer.id, false);
  }

  _mkdir(e) {
    const newfolder = this.$['mkdir-name'].value;
    const explorer = this.explorer;
    let job = window.backendaiclient.vfolder.mkdir([...explorer.breadcrumb, newfolder].join('/'), explorer.id);
    job.then(res => {
      this.closeDialog('mkdir-dialog');
      this._clearExplorer();
    });
  }

  _isDir(file) {
    return file.mode.startsWith("d");
  }

  /* File upload and download */
  _addEventListenerDropZone() {
    const dndZoneEl = this.$['folder-explorer-dialog'];
    const dndZonePlaceholderEl = this.$.dropzone;

    dndZonePlaceholderEl.addEventListener('dragleave', () => {
      dndZonePlaceholderEl.style.display = "none";
    });

    dndZoneEl.addEventListener('dragover', e => {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      dndZonePlaceholderEl.style.display = "flex";
      return false;
    });

    dndZoneEl.addEventListener('drop', e => {
      e.stopPropagation();
      e.preventDefault();
      dndZonePlaceholderEl.style.display = "none";

      let temp = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        if (file.size > 2 ** 20) {
          console.log('File size limit (< 1 MiB)');
        } else {
          file.progress = 0;
          file.error = false;
          file.complete = false;
          temp.push(file);
          this.push("uploadFiles", file);
        }
      }

      for (let i = 0; i < temp.length; i++) {
        this.fileUpload(temp[i]);
        this._clearExplorer();
      }
    });
  }

  _uploadFileBtnClick(e) {
    const elem = this.$.fileInput;
    if (elem && document.createEvent) {  // sanity check
      const evt = document.createEvent("MouseEvents");
      evt.initEvent("click", true, false);
      elem.dispatchEvent(evt);
    }
  }

  _uploadFileChange(e) {
    const length = e.target.files.length;
    for (let i = 0; i < length; i++) {
      const file = e.target.files[i];

      let text = "";
      let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (let i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

      file.id = text;
      file.progress = 0;
      file.error = false;
      file.complete = false;
      this.push("uploadFiles", file);
    }

    for (let i = 0; i < length; i++) {
      this.fileUpload(this.uploadFiles[i]);
      this._clearExplorer();
    }

    this.$.fileInput.value = '';
  }

  fileUpload(fileObj) {
    const fd = new FormData();
    const explorer = this.explorer;
    const path = explorer.breadcrumb.concat(fileObj.name).join("/");
    fd.append("src", fileObj, path);
    const index = this.uploadFiles.indexOf(fileObj);

    let job = window.backendaiclient.vfolder.uploadFormData(fd, explorer.id);
    job.then(resp => {
      this._clearExplorer();
      this.set('uploadFiles.' + index + '.complete', true);

      setTimeout(() => {
        this.splice('uploadFiles', this.uploadFiles.indexOf(fileObj), 1);
      }, 1000);
    });
  }

  _downloadFile(e) {
    let fn = e.target.filename;
    let path = this.explorer.breadcrumb.concat(fn).join("/");
    let job = window.backendaiclient.vfolder.download(path, this.explorer.id);
    job.then(res => {
      const url = window.URL.createObjectURL(res);
      let a = document.createElement('a');
      a.addEventListener('click', function (e) {
        e.stopPropagation();
      });
      a.href = url;
      a.download = fn;
      document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
      a.click();
      a.remove();  //afterwards we remove the element again
      URL.revokeObjectURL(url);
    });
  }

  _humanReadableTime(d) {
    const date = new Date(d * 1000);
    const offset = date.getTimezoneOffset() / 60;
    const hours = date.getHours();
    date.setHours(hours - offset);
    return date.toUTCString();
  }

  _isDownloadable(file) {
    return file.size < 209715200
  }
  
  _hideDialog(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-dialog');
    dialog.hide();
  }
}

customElements.define('backend-ai-data-view', BackendAIData);
