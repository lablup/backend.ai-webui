/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-styles/typography';
import '@polymer/paper-styles/color';
import '@polymer/paper-material/paper-material';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-image/iron-image';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-toast/paper-toast';
import '@polymer/paper-dialog/paper-dialog';
import '@vaadin/vaadin-grid/vaadin-grid.js';

import './backend-ai-styles.js';
import './lablup-activity-panel.js';
import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';

class BackendAIData extends PolymerElement {
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
      }
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
    }
  }

  _countObject(obj) {
    return Object.keys(obj).length;
  }

  _addFolderDialog() {
    this.openDialog('add-folder-dialog');
  }

  openDialog(id) {
    var body = document.querySelector('body');
    body.appendChild(this.$[id]);
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
      </style>
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>
      <paper-material class="item" elevation="1" style="padding-bottom:20px;">
        <h3 class="paper-material-title">Data</h3>
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
              <div class="indicator">[[item.name]]</div>
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
              </div>
            </template>
          </vaadin-grid-column>
        </vaadin-grid>
      </paper-material>
      <paper-dialog id="add-folder-dialog" entry-animation="scale-up-animation" exit-animation="fade-out-animation" modal>
        <paper-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Create a new virtual folder</span>
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
      <paper-dialog id="delete-folder-dialog" entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <paper-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Delete a virtual folder</span>
            <paper-icon-button icon="close" class="blue close-button" dialog-dismiss>
              Close
            </paper-icon-button>
          </h3>
          <div class="warning">WARNING: this cannot be undone!</div>
          <form id="login-form" onSubmit="this._addFolder()">
            <fieldset>
              <paper-input class="red" id="delete-folder-name" label="Type folder name to delete" pattern="[a-zA-Z0-9_-]*" 
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
      <paper-dialog id="info-folder-dialog" entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <paper-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Folder information</span>
            <paper-icon-button icon="close" class="blue close-button" dialog-dismiss>
              Close
            </paper-icon-button>
          </h3>
          <ul>
            <li>[[folderInfo.name]]</li>
            <li>[[folderInfo.id]]</li>
            <li>[[folderInfo.is_owner]]</li>
            <li>[[folderInfo.host]]</li>
            <li>[[folderInfo.numFiles]]</li>
            <li>[[folderInfo.permission]]</li>
          </ul>
        </paper-material>
      </paper-dialog>
      `;
  }
}

customElements.define('backend-ai-data-view', BackendAIData);
