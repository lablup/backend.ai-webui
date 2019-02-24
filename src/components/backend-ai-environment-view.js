/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.


 */

import {css, html, LitElement} from "lit-element";
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';

import {BackendAiStyles} from '../backend-ai-console-styles.js';
import {IronFlex, IronFlexAlignment, IronFlexFactors, IronPositioning} from '../layout/iron-flex-layout-classes';

//import '@vaadin/vaadin-grid/vaadin-grid.js';
import '@polymer/paper-material';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid.js';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid-sorter.js';

import '@material/mwc-button';

class BackendAiEnvironmentView extends LitElement {
  static get is() {
    return 'backend-ai-environment-view';
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
        vaadin-grid {
          border: 0;
          font-size: 14px;
          height: calc(100vh - 210px);
        }

        div.indicator,
        span.indicator {
          font-size: 9px;
          margin-right: 5px;
        }

      `];
  }

  render() {
    // language=HTML
    return html`
      <paper-material elevation="1">
        <h3 class="horizontal center layout">
          <span>Images</span>
          <span class="flex"></span>
          <mwc-button class="fg red" id="add-image" disabled outlined label="Add" icon="add"></mwc-button>
        </h3>

        <vaadin-grid theme="row-stripes column-borders compact" aria-label="Environments" id="testgrid">
          <vaadin-grid-column width="50px" resizable>
            <template class="header">
              <vaadin-grid-sorter path="created_at">Registry</vaadin-grid-sorter>
            </template>
            <template>
              <div class="layout vertical">
                <span>[[item.registry]]</span>
              </div>
            </template>
          </vaadin-grid-column>

          <vaadin-grid-column width="50px" resizable>
            <template class="header">Namespace</template>
            <template>
              <div>[[item.namespace]]</div>
            </template>
          </vaadin-grid-column>
          <vaadin-grid-column resizable>
            <template class="header">Language</template>
            <template>
              <div>[[item.lang]]</div>
            </template>
          </vaadin-grid-column>
          <vaadin-grid-column width="50px" resizable>
            <template class="header">Version</template>
            <template>
              <div>[[item.baseversion]]</div>
            </template>
          </vaadin-grid-column>
          <vaadin-grid-column width="50px" resizable>
            <template class="header">Base</template>
            <template>
              <div>[[item.baseimage]]</div>
            </template>
          </vaadin-grid-column>
          <vaadin-grid-column width="50px" resizable>
            <template class="header">Addi</template>
            <template>
              <div>[[item.additional_req]]</div>
            </template>
          </vaadin-grid-column>
          <vaadin-grid-column width="150px" flex-grow="0" resizable>
            <template class="header">
              Digest
            </template>
            <template>
              <div class="layout vertical">
                <span class="indicator">[[item.digest]]</span>
              </div>
            </template>
          </vaadin-grid-column>

          <vaadin-grid-column width="150px" flex-grow="0" resizable>
            <template class="header">Resource Limit</template>
            <template>
              <div class="layout horizontal center flex">
                <div class="layout horizontal configuration">
                  <iron-icon class="fg green" icon="hardware:developer-board"></iron-icon>
                  <span>[[item.cpu_limit_min]]</span> ~
                  <span>[[item.cpu_limit_max]]</span>
                  <span class="indicator">core</span>
                </div>
              </div>
              <div class="layout horizontal center flex">
                <div class="layout horizontal configuration">
                  <iron-icon class="fg green" icon="hardware:memory"></iron-icon>
                  <span>[[item.mem_limit_min]]</span> ~
                  <span>[[item.mem_limit_max]]</span>
                  <span class="indicator">GB</span>
                </div>
              </div>
              <template is="dom-if" if="[[item.cuda_device_limit_min]]">
                <div class="layout horizontal center flex">
                  <div class="layout horizontal configuration">
                    <iron-icon class="fg green" icon="hardware:icons:view-module"></iron-icon>
                    <span>[[item.cuda_device_limit_min]]</span> ~
                    <span>[[item.cuda_device_limit_max]]</span>
                    <span class="indicator">GPU</span>
                  </div>
                </div>
              </template>
              <template is="dom-if" if="[[item.cuda_shares_limit_min]]">
                <div class="layout horizontal center flex">
                  <div class="layout horizontal configuration">
                    <iron-icon class="fg green" icon="hardware:icons:view-module"></iron-icon>
                    <span>[[item.cuda_shares_limit_min]]</span> ~
                    <span>[[item.cuda_shares_limit_max]]</span>
                    <span class="indicator">vGPU</span>
                  </div>
                </div>
              </template>
            </template>
          </vaadin-grid-column>
          <vaadin-grid-column resizable>
            <template class="header">Control</template>
            <template>
              <div id="controls" class="layout horizontal flex center"
                   kernel-id="[[item.digest]]">
                <paper-icon-button class="fg red controls-running" disabled
                                   on-tap="_deleteImage" icon="delete"></paper-icon-button>
              </div>
            </template>
          </vaadin-grid-column>
        </vaadin-grid>


      </paper-material>
    `;
  }

  static get properties() {
    return {
      active: {
        type: Boolean
      },
      images: {
        type: Object,
        hasChanged: () => true
      }
    }
  }

  constructor() {
    super();
    setPassiveTouchGestures(true);
    this.images = {};
    this.active = false;
  }

  shouldUpdate() {
    return this.active;
  }

  firstUpdated() {
    if (window.backendaiclient === undefined || window.backendaiclient === null) {
      document.addEventListener('backend-ai-connected', () => {
        this._getImages();
      }, true);
    } else { // already connected
      this._getImages();
    }
  }

  connectedCallback() {
    super.connectedCallback();

  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  _getImages() {
    console.log("test");
    window.backendaiclient.image.list().then((response) => {
      let images = response.images;
      images.forEach((image) => {
        let tags = image.tag.split('-');
        if (tags[1] !== undefined) {
          image.baseversion = tags[0];
          image.baseimage = tags[1];
          if (tags[2] !== undefined) {
            image.additional_req = tags[2].toUpperCase();
          }
        } else {
          image.baseversion = image.tag;
        }
        let names = image.name.split('/');
        if (names[1] !== undefined) {
          image.namespace = names[0];
          image.lang = names[1];
        } else {
          image.lang = image.names;
        }
        var resource_limit = image.resource_limits;
        resource_limit.forEach((resource) => {
          if (resource.max == 0) {
            resource.max = '∞';
          }
          if (resource.key == 'cuda.device') {
            resource.key = 'cuda_device';
          }
          if (resource.key == 'cuda.shares') {
            resource.key = 'cuda_shares';
          }
          image[resource.key + '_limit_min'] = this._addUnit(resource.min);
          image[resource.key + '_limit_max'] = this._addUnit(resource.max);
        });
      });
      this.images = images;
      console.log(images);

      this.shadowRoot.querySelector('#testgrid').items = this.images;
    });
  }

  _addUnit(value) {
    let unit = value.substr(-1);
    if (unit == 'm') {
      return value.slice(0, -1) + 'MB';
    }
    if (unit == 'g') {
      return value.slice(0, -1) + 'GB';
    }
    if (unit == 't') {
      return value.slice(0, -1) + 'TB';
    }
    return value;
  }

  _indexFrom1(index) {
    return index + 1;
  }

}

customElements.define(BackendAiEnvironmentView.is, BackendAiEnvironmentView);
