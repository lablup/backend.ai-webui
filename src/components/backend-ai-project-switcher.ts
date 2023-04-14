/**
 @license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
 */


import {customElement, property} from 'lit/decorators.js';
import {css, LitElement, html, CSSResultGroup} from 'lit';
import {translate as _t} from 'lit-translate';
import '@material/mwc-select';
import '@material/mwc-icon-button-toggle';

import {BackendAIWebUIStyles} from './backend-ai-webui-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';
import {get as _text} from 'lit-translate/util';

/**
 Backend AI Project Switcher

 Example:

 <backend-ai-project-switcher></backend-ai-project-switcher>

 @group Backend.AI Web UI
 @element backend-ai-project-switcher
 */
@customElement('backend-ai-project-switcher')
export default class BackendAIProjectSwitcher extends LitElement {
  @property({type: Array}) projects = [];
  @property({type: String}) currentProject = '';

  constructor() {
    super();
  }

  static get styles(): CSSResultGroup {
    return [
      BackendAIWebUIStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        #project-sort-box {
          padding-left: 16px;
          padding-right: 10px;
          border-bottom: 1px solid #ccc;
        }
      `];
  }
  firstUpdated() {
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._refreshUserGroupSelector();
        globalThis.backendaiutils._writeRecentProjectGroup(this.currentProject);
      }, true);
    } else {
      this._refreshUserGroupSelector();
      globalThis.backendaiutils._writeRecentProjectGroup(this.currentProject);
    }
  }
  /**
   * Change the backend.ai client's current group.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  changeGroup(e) {
    globalThis.backendaiclient.current_group = e.target.value;
    this.currentProject = globalThis.backendaiclient.current_group;
    globalThis.backendaiutils._writeRecentProjectGroup(globalThis.backendaiclient.current_group);
    const event: CustomEvent = new CustomEvent('backend-ai-group-changed', {'detail': globalThis.backendaiclient.current_group});
    document.dispatchEvent(event);
  }

  _sortProjects(e) {
    const isAscending = e.target.on;
    if (isAscending) {
      this.projects = [...this.projects.sort()];
    } else {
      this.projects = [...this.projects.sort().reverse()];
    }
  }

  _refreshUserGroupSelector(): void {
    this.currentProject = globalThis.backendaiutils._readRecentProjectGroup();
    globalThis.backendaiclient.current_group = this.currentProject;
    this.projects = globalThis.backendaiclient.groups;
  }

  render() {
    return html`
      <div class="horizontal center center-justified layout">
        <p id="project">${_t('webui.menu.Project')}</p>
        <div id="project-select-box">
          <div class="horizontal center center-justified layout">
            <mwc-select id="project-select" value="${this.currentProject}"
                @selected="${(e) => this.changeGroup(e)}">
              <div id="project-sort-box" class="horizontal layout center space-between">
                <div>${_text('webui.menu.SelectProject')}</div>
                <span class="flex"></span>
                <mwc-icon-button-toggle on onIcon="arrow_drop_up" offIcon="arrow_drop_down"
                    @click="${(e) => this._sortProjects(e)}"></mwc-icon-button-toggle>
              </div>
              ${this.projects.map((group) => html`
                <mwc-list-item value="${group}" ?selected="${this.currentProject === group}">${group}</mwc-list-item>
              `)}
            </mwc-select>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-project-switcher': BackendAIProjectSwitcher;
  }
}
