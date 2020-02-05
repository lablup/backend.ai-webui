/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

 import {css, customElement, html, property} from "lit-element";

 import '@polymer/iron-icon/iron-icon';
 import '@polymer/iron-icons/iron-icons';
 import '@polymer/iron-icons/hardware-icons';
 import '@polymer/iron-icons/av-icons';
 import '@polymer/paper-dialog/paper-dialog';
 import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
 import '@polymer/paper-input/paper-input';
 import '@polymer/paper-icon-button/paper-icon-button';
 import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid';
 import '@vaadin/vaadin-grid/vaadin-grid-selection-column';
 import '@vaadin/vaadin-grid/vaadin-grid-sorter';
 import '@vaadin/vaadin-grid/vaadin-grid-sort-column';
 import '@vaadin/vaadin-icons/vaadin-icons';
 import '@vaadin/vaadin-progress-bar/vaadin-progress-bar';
 
 import 'weightless/card';
 import 'weightless/dialog';
 import 'weightless/checkbox';
 import 'weightless/title';
 
 import './lablup-loading-indicator';
 import './backend-ai-indicator';
 import '../plastics/lablup-shields/lablup-shields';
 
 import {BackendAiStyles} from './backend-ai-console-styles';
 import {BackendAIPage} from './backend-ai-page';
 import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

 @customElement("backend-ai-error-log-list")
 export default class BackendAiErrorLogList extends BackendAIPage {
     @property({type: String}) timestamp = '';
     @property({type: String}) errorType = '';
     @property({type: String}) requestUrl = '';
     @property({type: String}) statusCode = '';
     @property({type: String}) statusText = '';
     @property({type: String}) title = '';
     @property({type: String}) message = '';
     @property({type: Array}) errorlogs = Array();
     @property({type: Array}) _selected_items = Array();
     @property({type: Object}) loadingIndicator = Object();
     @property({type: Object}) _grid = Object();
     
     constructor() {
         super();
     }

     static get styles() {
        return [
          BackendAiStyles,
          IronFlex,
          IronFlexAlignment,
          // language=CSS
          css`
            vaadin-grid {
              width: 100%;
              border: 0;
              font-size: 12px;
              height: calc(100vh - 240px);
            }

            vaadin-grid-cell {
              font-size: 10px;
            }

            [error-cell] {
              color: red;
            }

          `];
      }

      firstUpdated() {
        this.loadingIndicator = this.shadowRoot.querySelector('#loading-indicator');
        this._grid = this.shadowRoot.querySelector('#list-grid');
        if (!window.backendaiclient ||
          !window.backendaiclient.is_admin) {
          this.shadowRoot.querySelector('vaadin-grid').style.height = 'calc(100vh - 200px)';
        }
        this.notification = window.lablupNotification;
        // if localStorage is empty, then empty Array will goes to errorlogs
        this.errorlogs = JSON.parse(localStorage.getItem('backendaiconsole.logs') || '{}');
        // console.log(this.errorlogs);

        document.addEventListener('log-message-refresh', () => this._refreshLogData());
        document.addEventListener('log-message-clear', () => this._clearLogData());

      }

      _refreshLogData() {
        this.errorlogs = JSON.parse(localStorage.getItem('backendaiconsole.logs') || '{}');
        this._grid.clearCache();
      }

      _clearLogData() {
        this.errorlogs = [];
        this._grid.clearCache();
      }

      render() {
        // language=HTML
        return html`
         <lablup-loading-indicator id="loading-indicator"></lablup-loading-indicator>
         <vaadin-grid id="list-grid" theme="row-stripes column-borders compact" aria-label="Error logs"
          .items="${this.errorlogs}">
          <vaadin-grid-column resizable flex-grow="0" text-align="center" width="190px" header="TimeStamp">
          <template>
              <div class="layout vertical" error-cell$="[[item.isError]]">
                <span>[[item.timestamp]]</span>
              </div>
          </template>
          </vaadin-grid-column>
          <vaadin-grid-column resizable flex-grow="0" text-align="center" width="110px" header="Status">
          <template>
              <div class="layout vertical" error-cell$="[[item.isError]]">
                <span>[[item.statusCode]] [[item.statusText]]</span>
              </div>
          </template>
          </vaadin-grid-column>
          <vaadin-grid-column resizable flex-grow="0" text-align="center" width="150px" header="Error Title">
          <template>
              <div class="layout vertical" error-cell$="[[item.isError]]">
                <span>[[item.title]]</span>
              </div>
          </template>
          </vaadin-grid-column>
          <vaadin-grid-column resizable flex-grow="0" text-align="center" width="250px" header="Error Message">
          <template>
              <div class="layout vertical" error-cell$="[[item.isError]]">
                <span>[[item.message]]</span>
              </div>
          </template>
          </vaadin-grid-column>
          <vaadin-grid-column resizable flex-grow="0" text-align="center" width="70px" header="Method">
          <template>
              <div class="layout vertical" error-cell$="[[item.isError]]">
                <span>[[item.requestMethod]]</span>
              </div>
          </template>
          </vaadin-grid-column>
          <vaadin-grid-column resizable flex-grow="0" text-align="start" width="250px" header="Request Url">
          <template>
              <div class="layout vertical" error-cell$="[[item.isError]]">
                <span>[[item.requestUrl]]</span>
              </div>
          </template>
          </vaadin-grid-column>
          <vaadin-grid-column resizable flex-grow="0" text-align="start" width="100px" header="Parameters">
          <template>
              <div class="layout vertical" error-cell$="[[item.isError]]">
                <span>[[item.requestParameters]]</span>
              </div>
          </template>
          </vaadin-grid-column>
          <vaadin-grid-column resizable flex-grow="0" text-align="start" autowidth header="Error Type">
          <template>
              <div class="layout vertical" error-cell$="[[item.isError]]">
                <span>[[item.type]]</span>
              </div>
          </template>
          </vaadin-grid-column>
          </vaadin-grid>
        `;
      }
 }

 declare global {
    interface HTMLElementTagNameMap {
      "backend-ai-error-log-list": BackendAiErrorLogList;
    }
 }
  
