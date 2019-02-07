/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {html, PolymerElement} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-image/iron-image';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-styles/typography';
import '@polymer/paper-styles/color';
import '@polymer/paper-material/paper-material';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-toast/paper-toast';
import '@polymer/paper-dialog/paper-dialog';
import '@vaadin/vaadin-grid/vaadin-grid.js';
import '@vaadin/vaadin-item/vaadin-item.js';
import '@vaadin/vaadin-upload/vaadin-upload.js';


import './backend-ai-styles.js';
import './lablup-activity-panel.js';
import {OverlayPatchMixin} from './overlay-patch-mixin.js'
import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';

class BackendAIData extends OverlayPatchMixin(PolymerElement) {
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
      visible: {
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
    };
  }

  constructor() {
    super();
    // Resolve warning about scroll performance
    // See https://developers.google.com/web/updates/2016/06/passive-event-listeners
    setPassiveTouchGestures(true);
  }

  ready() {
    super.ready();
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

  static get observers() {
    return [
      '_routeChanged(route.*)',
      '_viewChanged(routeData.view)',
      '_menuChanged(visible)'
    ]
  }

  connectedCallback() {
    super.connectedCallback();
    afterNextRender(this, function () {
    });
  }

  _refreshFolderList() {
    let l = window.backendaiclient.vfolder.list();
    l.then((value) => {
      this.folders = value;
    });
  }

  _routeChanged(changeRecord) {
    if (changeRecord.path === 'path') {
      console.log('Path changed!');
    }
  }

  _viewChanged(view) {
    // load data for view
  }

  _menuChanged(visible) {
    if (!visible) {
      return;
    } else {
      if (window.backendaiclient == undefined || window.backendaiclient == null) {
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

  _addFolderDialog() {
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
    this.$[id].open();
  }

  closeDialog(id) {
    this.$[id].close();
  }

  _indexFrom1(index) {
    return index + 1;
  }

  _hasPermission(item, perm) {
    if (item.permission.includes(perm)) {
      return true;
    }
    return false;
  }

  _addFolder() {
    let name = this.$['add-folder-name'].value;
    let job = window.backendaiclient.vfolder.create(name);
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
      console.log(value);
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
      console.log(JSON.parse(value.files));
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
    console.log(tempBreadcrumb);

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

  /* File uploader */
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
  }

  fileUpload(fileObj) {
    const fd = new FormData();
    const explorer = this.explorer;
    const path = explorer.breadcrumb.concat(fileObj.name).join("/");
    fd.append("src", fileObj, path);
    const index = this.uploadFiles.indexOf(fileObj);

    let job = window.backendaiclient.vfolder.uploadFormData(fd, explorer.id);
    job.then(resp => {
      this.set('uploadFiles.' + index + '.complete', true);

      setTimeout(() => {
        this.splice('uploadFiles', this.uploadFiles.indexOf(fileObj), 1);
        console.log(this.uploadFiles);
      }, 1000);

    });
  }

  static get template() {
    // language=HTML
    return html`
      <style is="custom-style" include="backend-ai-styles iron-flex iron-flex-alignment iron-positioning">
        vaadin-grid {
          border: 0;
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

        paper-button.add-button {
          width: 100%;
        }

        .warning {
          color: red;
        }

        vaadin-item {
          font-size: 13px;
          font-weight: 100;
        }

        #folder-explorer-dialog {
          width: 100%;
        }

        div.breadcrumb {
          color: #637282;
          font-size: 1em;
        }

        div.breadcrumb span:first-child {
          display: none;
        }

        paper-button.goto {
          margin: 0;
          padding: 5px;
          min-width: 0;
        }

        paper-button.goto:last-of-type {
          color: #000;
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
          background: rgba(211, 211, 211, .5);
          text-align: center;
        }

        @media (min-width: 900px) {
          #folder-explorer-dialog {
            left: 30%;
            max-width: 50%;
          } 
        }

      </style>
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>
      <paper-material class="item" elevation="1" style="padding-bottom:20px;">
        <h4 class="horizontal center layout">
          <span>Virtual Folders</span>
          <paper-button id="add-folder" class="fg red">
            <iron-icon icon="add"></iron-icon>
            Add new folder
          </paper-button>
        </h4>

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

          <vaadin-grid-column resizable>
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
                </template>
                <template is="dom-if" if="[[_hasPermission(item, 'w')]]">
                </template>
                <template is="dom-if" if="[[_hasPermission(item, 'd')]]">
                  <paper-icon-button class="fg red controls-running" icon="delete"
                                     on-tap="_deleteFolderDialog"></paper-icon-button>
                </template>
                <template is="dom-if" if="[[_hasPermission(item, 'r')]]">
                  <paper-icon-button class="fg controls-running" icon="folder-open"
                                     on-tap="_folderExplorer" folder-id="[[item.name]]"></paper-icon-button>
                </template>
              </div>
            </template>
          </vaadin-grid-column>
        </vaadin-grid>
      </paper-material>
      <paper-material>
        <h4 class="horizontal center layout">
          <span>Public Data</span>
        </h4>
        <div class="horizontal center flex layout" style="padding:15px;">
          <div>No data present.</div>
        </div>
      </paper-material>
      <paper-dialog id="add-folder-dialog" with-backdrop
                    entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <paper-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Create a new virtual folder</span>
            <div class="flex"></div>
            <paper-icon-button icon="close" class="blue close-button" dialog-dismiss>
              Close
            </paper-icon-button>
          </h3>
          <form id="login-form" onSubmit="this._addFolder()">
            <fieldset>
              <paper-input id="add-folder-name" label="Folder name" pattern="[a-zA-Z0-9_-]*"
                           error-message="Allows letters, numbers and -_." auto-validate></paper-input>
              <paper-input id="add-folder-host" label="Host" pattern="[a-zA-Z0-9_-]*" disabled
                           error-message="Allows letters, numbers and -_." auto-validate value="local"></paper-input>
              <br/>
              <paper-button class="blue add-button" type="submit" id="add-button">
                <iron-icon icon="rowing"></iron-icon>
                Create
              </paper-button>
            </fieldset>
          </form>
        </paper-material>
      </paper-dialog>
      <paper-dialog id="delete-folder-dialog" with-backdrop
                    entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <paper-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Delete a virtual folder</span>
            <div class="flex"></div>
            <paper-icon-button icon="close" class="blue close-button" dialog-dismiss>
              Close
            </paper-icon-button>
          </h3>
          <div class="warning">WARNING: this cannot be undone!</div>
          <form id="login-form" onSubmit="this._addFolder()">
            <fieldset>
              <paper-input class="red" id="delete-folder-name" label="Type folder name to delete"
                           pattern="[a-zA-Z0-9_-]*"
                           error-message="Allows letters, numbers and -_." auto-validate></paper-input>
              <br/>
              <paper-button class="blue delete-button" type="submit" id="delete-button">
                <iron-icon icon="close"></iron-icon>
                Delete
              </paper-button>
            </fieldset>
          </form>
        </paper-material>
      </paper-dialog>
      <paper-dialog id="info-folder-dialog" with-backdrop
                    entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <paper-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout" style="border-bottom:1px solid #ddd;">
            <span>[[folderInfo.name]]</span>
            <div class="flex"></div>
            <paper-icon-button icon="close" class="blue close-button" dialog-dismiss>
              Close
            </paper-icon-button>
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
        </paper-material>
      </paper-dialog>
      <paper-dialog id="folder-explorer-dialog" with-backdrop
                    entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <paper-material elevation="1" class="login-panel intro" style="margin: 0;">
          <h3 class="horizontal center layout" style="font-weight:bold">
            <span>[[explorer.id]]</span>
            <div class="flex"></div>
            <paper-icon-button icon="close" class="blue close-button" dialog-dismiss>
              Close
            </paper-icon-button>
          </h3>

          <div class="breadcrumb">
            <template is="dom-repeat" items="[[explorer.breadcrumb]]">
              <span>&gt;</span>
              <paper-button class="goto" path="item" on-click="_gotoFolder" dest="[[item]]">[[item]]</paper-button>
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
              <div style="background-color:#eee; padding:10px;">
                <h3>Upload Queue</h3>
                <ul style="background-color:#fff; margin:10px;">
                  <template is="dom-repeat" items="[[uploadFiles]]">
                    <li style="list-style-type: circle;">[[item.name]]</li>
                    [[item.complete]]
                  </template>
                </ul>
              </div>
            </template>
          </div>

          <vaadin-grid theme="row-stripes compact" aria-label="Explorer" items="[[explorer.files]]">
            <vaadin-grid-column width="40px" flex-grow="0" resizable>
              <template class="header">#</template>
              <template>[[_indexFrom1(index)]]</template>
            </vaadin-grid-column>

            <vaadin-grid-column flex-grow="2" resizable>
              <template class="header">Name</template>
              <template>
                <template is="dom-if" if="[[_isDir(item)]]">
                  <div class="indicator" on-click="_enqueueFolder" name="[[item.filename]]">
                    <paper-icon-button class="fg controls-running" icon="folder-open"
                                       folder-name="[[item.filename]]"></paper-icon-button>
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
              <template class="header">CTime</template>
              <template>
                <div class="layout vertical">
                  <span>[[item.ctime]]</span>
                </div>
              </template>
            </vaadin-grid-column>

            <vaadin-grid-column flex-grow="1" resizable>
              <template class="header">Size</template>
              <template>
                <div class="layout vertical">
                  <span>[[item.size]]</span>
                </div>
              </template>
            </vaadin-grid-column>

            <vaadin-grid-column flex-grow="2" resizable>
              <template class="header">Actions</template>
              <template>
                <paper-icon-button class="fg controls-running" icon="more-horiz"></paper-icon-button>
              </template>
            </vaadin-grid-column>
          </vaadin-grid>
        </paper-material>
      </paper-dialog>

      <paper-dialog id="mkdir-dialog"
                    entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <paper-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Create a new folder</span>
            <div class="flex"></div>
            <paper-icon-button icon="close" class="blue close-button" dialog-dismiss>
              Close
            </paper-icon-button>
          </h3>
          <form>
            <fieldset>
              <paper-input id="mkdir-name" label="Folder name" pattern="[a-zA-Z0-9_-]*"
                           error-message="Allows letters, numbers and -_." auto-validate></paper-input>
              <br/>
              <paper-button class="blue add-button" type="submit" id="mkdir-btn" on-click="_mkdir">
                <iron-icon icon="rowing"></iron-icon>
                Create
              </paper-button>
            </fieldset>
          </form>
        </paper-material>
      </paper-dialog>
    `;
  }
}

customElements.define('backend-ai-data-view', BackendAIData);
