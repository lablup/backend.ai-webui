/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";

import './backend-ai-resource-monitor';
import './backend-ai-session-list';
import 'weightless/card';
import 'weightless/tab';
import 'weightless/tab-group';

import '@material/mwc-textfield/mwc-textfield';
import "@material/mwc-list/mwc-list-item";
import "@material/mwc-icon-button/mwc-icon-button";
import "@material/mwc-menu/mwc-menu";

import {BackendAIPage} from './backend-ai-page';
import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

@customElement("backend-ai-session-view")
export default class BackendAiSessionView extends BackendAIPage {
  @property({type: String}) _status = 'inactive';
  @property({type: Boolean}) active = true;
  @property({type: Object}) _lists = Object();
  @property({type: Boolean}) is_admin = false;

  constructor() {
    super();
    this.active = false;
    this._status = 'inactive';
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
        wl-card h3.tab {
          padding-top: 0;
          padding-bottom: 0;
          padding-left: 0;
        }

        wl-tab-group {
          --tab-group-indicator-bg: var(--paper-red-500);
        }

        wl-tab-group wl-divider {
          display: none;
        }

        wl-tab {
          --tab-color: #666666;
          --tab-color-hover: #222222;
          --tab-color-hover-filled: #222222;
          --tab-color-active: #222222;
          --tab-color-active-hover: #222222;
          --tab-color-active-filled: #cccccc;
          --tab-bg-active: var(--paper-red-50);
          --tab-bg-filled: var(--paper-red-50);
          --tab-bg-active-hover: var(--paper-red-100);
        }

        wl-button {
          --button-bg:  var(--paper-light-green-50);
          --button-bg-hover:  var(--paper-green-100);
          --button-bg-active:  var(--paper-green-600);
        }

        mwc-menu {
          --mdc-theme-surface: #f1f1f1;
          --mdc-menu-item-height : auto;
        }

        mwc-list-item {
          font-size : 14px;
        }

        mwc-icon-button {
          --mdc-icon-size: 20px;
          color: var(--paper-grey-700);
        }

        mwc-icon-button#dropdown-menu-button {
          margin-left: 10px;
        }
      `];
  }

  firstUpdated() {
    this._lists = this.shadowRoot.querySelectorAll("backend-ai-session-list");

    document.addEventListener('backend-ai-session-list-refreshed', () => {
      this.shadowRoot.querySelector('#running-jobs').refreshList(true, false);
    });
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.is_admin = globalThis.backendaiclient.is_admin;
      }, true);
    } else {
      this.is_admin = globalThis.backendaiclient.is_admin;
    }
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      this.shadowRoot.querySelector('#resource-monitor').removeAttribute('active');
      this._status = 'inactive';
      for (let x = 0; x < this._lists.length; x++) {
        this._lists[x].removeAttribute('active');
      }
      return;
    }
    this.shadowRoot.querySelector('#resource-monitor').setAttribute('active', true);
    this.shadowRoot.querySelector('#running-jobs').setAttribute('active', true);
    this._status = 'active';
  }

  _exportToCSV() {
    console.log("Downloading CSV File...");
    let event = new CustomEvent("backend-ai-csv-file-export-session", {"detail": globalThis.backendaiclient.current_group});
    document.dispatchEvent(event);
  }

  _showTab(tab) {
    let els = this.shadowRoot.querySelectorAll(".tab-content");
    for (let x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    this.shadowRoot.querySelector('#' + tab.value + '-lists').style.display = 'block';
    for (let x = 0; x < this._lists.length; x++) {
      this._lists[x].removeAttribute('active');
    }
    this.shadowRoot.querySelector('#' + tab.value + '-jobs').setAttribute('active', true);
  }

  _toggleDropdown() {
    let menu = this.shadowRoot.querySelector("#dropdown-menu");
    menu.open = !menu.open;
  }

  render() {
    // language=HTML
    return html`
      <wl-card class="item">
        <h3 class="tab horizontal center layout">
          <wl-tab-group>
            <wl-tab value="running" checked @click="${(e) => this._showTab(e.target)}">${_t("session.Running")}</wl-tab>
            <wl-tab value="finished" @click="${(e) => this._showTab(e.target)}">${_t("session.Finished")}</wl-tab>
            <wl-tab value="others" @click="${(e) => this._showTab(e.target)}">${_t("session.Others")}</wl-tab>
          </wl-tab-group>
          <div class="flex"></div>
          <backend-ai-resource-monitor location="session" id="resource-monitor" ?active="${this.active === true}"></backend-ai-resource-monitor>
          ${this.is_admin ? html`
              <mwc-icon-button id="dropdown-menu-button" icon="more_horiz" raised
                               @click="${this._toggleDropdown}">
                <mwc-menu id="dropdown-menu" absolute x="-50" y="25">
                  <mwc-list-item>
                    <a class="horizontal layout start center" @click="${this._exportToCSV}">
                      <mwc-icon style="color:#242424;padding-right:10px;">get_app</mwc-icon>
                      ${_t("session.exportCSV")}
                    </a>
                  </mwc-list-item>
                </mwc-menu>
              </mwc-icon-button>
            ` : html``}
        </h3>
        <div id="running-lists" class="tab-content">
          <backend-ai-session-list id="running-jobs" condition="running"></backend-ai-session-list>
        </div>
        <div id="finished-lists" class="tab-content" style="display:none;">
          <backend-ai-session-list id="finished-jobs" condition="finished"></backend-ai-session-list>
        </div>
        <div id="others-lists" class="tab-content" style="display:none;">
          <backend-ai-session-list id="others-jobs" condition="others"></backend-ai-session-list>
        </div>

      </wl-card>
`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-session-view": BackendAiSessionView;
  }
}
