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
      files: {
        type: Object,
        value: {}
      },
      openedFolder: {
        type: String,
        value: ''
      },
      openedPath: {
        type: String,
        value: ''
      },
      openedPaths: {
        type: Object,
        value: []
      },
      /*upload*/
      uploadFiles: {
        type: Array,
        value: [],
        observe: true
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
    this._addEventListenerDropZone();
    document.addEventListener('backend-ai-connected', () => {
      this.is_admin = window.backendaiclient.is_admin;
      this.authenticated = true;
      this._refreshFolderList();
    }, true);
    this.$['add-folder'].addEventListener('tap', this._addFolderDialog.bind(this));
    this.$['add-button'].addEventListener('tap', this._addFolder.bind(this));
    this.$['add-dir-btn'].addEventListener('tap', this._mkdir.bind(this));
    // this.$['delete-button'].addEventListener('tap', this._deleteFolderWithCheck.bind(this));
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

  _viewFolderDialog() {
    this.openDialog('view-folder-dialog');
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

  /*explorer*/
  _viewFolder(e) {
    const folderId = e.target.folderId;
    this.openedFolder = folderId;
    this.openedPath = '.';
    this.set('openedPaths', []);
    this.openDialog('view-folder-dialog');
    const grid = this.$['files'];
    grid.dataProvider = (params, callback) => {
      var index = params.page * params.pageSize;
      console.log(params);
      let job = window.backendaiclient.vfolder.list_files(this.openedPath, this.openedFolder);
      job.then(value => {
        this.files = JSON.parse(value.files);
        callback(this.files, this.files.length);
      });
    };
  }

  _enqueueFolder(e) {
    const fn = e.target.folderName;
    this.push('openedPaths', fn);
    console.log(this.openedPaths);
    this.set('openedPath', this.openedPaths.join("/"));
    const grid = this.$['files'];
    grid.clearCache();
  }

  _dequeueFolder(e) {
    console.log(this.openedPath);
    this.pop('openedPaths');
    this.set('openedPath', this.openedPaths.join("/"));
    const grid = this.$['files'];
    grid.clearCache();
  }

  _gotoFolder(e) {
    const targetPath = e.target['path-name'] || e.target.innerHTML;
    console.log(targetPath);

    let tempPathArr = [this.openedFolder, ...this.openedPaths];
    const index = tempPathArr.indexOf(targetPath);

    if (index === -1) {
      console.error('path list index out of range error');
    } else {
      this.set('openedPaths', index === 0 ? [] : tempPathArr.slice(1, index + 1));
      this.set('openedPath', this.openedPaths.join("/"));
      const grid = this.$['files'];
      grid.clearCache();
    }
  }

  _isDir(file) {
    return file.mode.startsWith("d")
  }

  _isDownloadable(file) {
    return file.size < 209715200
  }

  _addEventListenerDropZone() {
    const dndZoneEl = this.$['view-folder-dialog'];
    console.log(this.$);
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
        this.uploadFile(temp[i]);
      }
    });
  }

  _fileClick() {
    const elem = this.$.fileInput;
    if (elem && document.createEvent) {  // sanity check
      const evt = document.createEvent("MouseEvents");
      evt.initEvent("click", true, false);
      elem.dispatchEvent(evt);
    }
  }

  _fileChange(e) {
    const length = e.target.files.length;
    for (let i = 0; i < length; i++) {
      const file = e.target.files[i];
      file.progress = 0;
      file.error = false;
      file.complete = false;
      this.push("uploadFiles", file);
    }

    for (let i = 0; i < length; i++) {
      this.uploadFile(this.uploadFiles[i]);
    }
  }

  uploadFile(fileObj) {
    var fd = new FormData();
    let path = this.openedPaths.join("/") + "/" + fileObj.name;
    fd.append("src", fileObj, path);
    let job = window.backendaiclient.vfolder.uploadFormData(fd, this.openedFolder)
    job.then(resp => {
      const grid = this.$['files'];
      grid.clearCache();
      const index = this.uploadFiles.indexOf(fileObj);
      this.splice('uploadFiles', index, 1);
      console.log("Done");
    });
  }

  _downloadFile(e) {
    let fn = e.target.filename;
    let path = this.openedPaths.concat(fn).join("/");
    let job = window.backendaiclient.vfolder.download(path , this.openedFolder)
    job.then(res => {
      var url = window.URL.createObjectURL(res);
      var a = document.createElement('a');
      a.addEventListener('click', function(e) {
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

  _mkdir(e) {
    let name = this.$['add-dir-name'].value;
    let path = this.openedPaths.concat(name).join("/");
    let job = window.backendaiclient.vfolder.mkdir(path , this.openedFolder)
    job.then(res => {
      this.closeDialog('add-dir-dialog');
      const grid = this.$['files'];
      grid.clearCache();
      });
  }

  _mkdirDialog() {
    this.$['add-dir-name'].value = '';
    this.openDialog('add-dir-dialog');
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

        div#upload {
          padding: 16px 24px;
          overflow: hidden;
          transition: background-color 0.6s, border-color 0.6s;
        }

        div#dropzone {
          display: none;
          background: rgba(255, 255, 255, 0.8);
          position: absolute;
          top: 0;
          left: -2px;
          width: 100%;
          border: 3px dashed darkgray;
          height: 100%;
          z-index: 3;
        }

        div#dropzone p {
          color: #222;
          font-size: 2em;
          text-align: center;
        }

        .path-link {
          padding: 3px;
          min-width: 0;
          color: #637282;
        }

        .path-link:last-of-type {
          color: #000;
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
              <div class="indicator" on-tap="_viewFolder" folder-id="[[item.name]]">[[item.name]]</div>
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
                <template is="dom-if" if="[[_hasPermission(item, 'd')]]">
                  <paper-icon-button class="fg controls-running" icon="folder-open"
                                     on-tap="_viewFolder" folder-id="[[item.name]]"></paper-icon-button>
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
      <paper-dialog id="view-folder-dialog" with-backdrop
                    entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <h2 class="horizontal center layout breadcrumb" style="min-width:1000px;">
          <paper-button class="path-link" path-name="." on-tap="_gotoFolder">[[openedFolder]]</paper-button>
          <template is="dom-repeat" items="[[openedPaths]]">
            <span>&gt;</span>
            <paper-button class="path-link" path-name="{{item}}" on-tap="_gotoFolder">[[item]]</paper-button>
          </template>
          <div class="flex"></div>
          <paper-icon-button icon="close" class="blue close-button" dialog-dismiss>
            Close
          </paper-icon-button>
        </h2>
        <div>
          <vaadin-button raised id="add-btn" on-tap="_fileClick">Upload Files...</vaadin-button>
          <vaadin-button id="add-dir" on-tap="_mkdirDialog">New Directory</vaadin-button>
        </div>
        <div id="upload">
          <div id="dropzone"><p>drag</p></div>
          <input type="file" id="fileInput" on-change="_fileChange" hidden multiple>
          <template is="dom-repeat" items="[[uploadFiles]]">
            <div><span>[[item]]</span></div>
          </template>
        </div>
        <vaadin-grid theme="row-stripes column-borders" aria-label="Job list" id="files">
          <vaadin-grid-column width="40px" flex-grow="0" resizable>
            <template class="header">#</template>
            <template>[[_indexFrom1(index)]]</template>
          </vaadin-grid-column>
          <vaadin-grid-column>
            <template class="header">Filename</template>
            <template>
              <div class="indicator">
                <template is="dom-if" if="[[_isDir(item)]]">
                  <paper-icon-button class="fg controls-running" icon="folder-open"
                                     on-tap="_enqueueFolder" folder-name="[[item.filename]]"></paper-icon-button>
                  [[item.filename]]
                </template>
                <template is="dom-if" if="[[!_isDir(item)]]">
                  [[item.filename]]
                </template>
              </div>
            </template>
          </vaadin-grid-column>

          <vaadin-grid-column>
            <template class="header">Ctime</template>
            <template>
              <div class="indicator">[[item.ctime]]</div>
            </template>
          </vaadin-grid-column>

          <vaadin-grid-column>
            <template class="header">Mode</template>
            <template>
              <div class="indicator">[[item.mode]]</div>
            </template>
          </vaadin-grid-column>

          <vaadin-grid-column>
            <template class="header">Size</template>
            <template>
              <div class="indicator">[[item.size]]</div>
            </template>
          </vaadin-grid-column>
          <vaadin-grid-column>
            <template class="header">Actions</template>
            <template>
                <template is="dom-if" if="[[!_isDir(item)]]">
                  <template is="dom-if" if="[[_isDownloadable(item)]]">
                    <paper-icon-button filename="[[item.filename]]" class="fg green controls-running" icon="vaadin:download" on-tap="_downloadFile"></paper-icon-button>
                  </template>
                </template>
            </template>
          </vaadin-grid-column>
        </vaadin-grid>
      </paper-dialog>
      <paper-dialog id="add-dir-dialog" with-backdrop
                    entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <paper-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Create a new virtual folder</span>
            <div class="flex"></div>
            <paper-icon-button icon="close" class="blue close-button" dialog-dismiss>
              Close
            </paper-icon-button>
          </h3>
          <form>
            <fieldset>
              <paper-input id="add-dir-name" label="Folder name" pattern="[a-zA-Z0-9_-]*"
                           error-message="Allows letters, numbers and -_." auto-validate></paper-input>
              <br/>
              <paper-button class="blue add-button" type="submit" id="add-dir-btn">
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
