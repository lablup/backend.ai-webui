/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */


import {customElement, property, query} from 'lit/decorators.js';
import {LitElement, html, CSSResultGroup} from 'lit';
import {translate as _t} from 'lit-translate';
import '@material/mwc-select';

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
  @property({type: Array}) groups = [];
  @property({type: String}) currentGroup = '';

  @query('#group-select-box') groupSelectionBox: HTMLDivElement | undefined;

  constructor() {
    super();
  }

  static get styles(): CSSResultGroup {
    return [
      BackendAIWebUIStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning
    ];
  }
  firstUpdated() {
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._refreshUserGroupSelector();
        globalThis.backendaiutils._writeRecentProjectGroup(this.currentGroup);
      }, true);
    } else {
      this._refreshUserGroupSelector();
      globalThis.backendaiutils._writeRecentProjectGroup(this.currentGroup);
    }
  }
  /**
   * Change the backend.ai client's current group.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  changeGroup(e) {
    globalThis.backendaiclient.current_group = e.target.value;
    this.currentGroup = globalThis.backendaiclient.current_group;
    globalThis.backendaiutils._writeRecentProjectGroup(globalThis.backendaiclient.current_group);
    const event: CustomEvent = new CustomEvent('backend-ai-group-changed', {'detail': globalThis.backendaiclient.current_group});
    document.dispatchEvent(event);
  }

  _refreshUserGroupSelector(): void {
    this.currentGroup = globalThis.backendaiutils._readRecentProjectGroup();
    globalThis.backendaiclient.current_group = this.currentGroup;
    this.groups = globalThis.backendaiclient.groups;
    // Detached from template to support live-update after creating new group (will need it)
    if (this.groupSelectionBox?.hasChildNodes()) {
      this.groupSelectionBox?.removeChild(this.groupSelectionBox.firstChild as ChildNode);
    }
    const div = document.createElement('div');
    div.className = 'horizontal center center-justified layout';
    const select = document.createElement('mwc-select');
    select.id = 'group-select';
    select.value = this.currentGroup;
    // select.style = 'width: auto;max-width: 200px;';
    select.style.width = 'auto';
    select.style.maxWidth = '200px';
    select.addEventListener('selected', (e) => this.changeGroup(e));
    let opt = document.createElement('mwc-list-item');
    opt.setAttribute('disabled', 'true');
    opt.innerHTML = _text('webui.menu.SelectProject');
    opt.style.borderBottom = '1px solid #ccc';
    select.appendChild(opt);
    this.groups.map((group) => {
      opt = document.createElement('mwc-list-item');
      opt.value = group;
      if (this.currentGroup === group) {
        opt.selected = true;
      } else {
        opt.selected = false;
      }
      opt.innerHTML = group;
      select.appendChild(opt);
    });
    // select.updateOptions();
    div.appendChild(select);
    this.groupSelectionBox?.appendChild(div);
  }

  render() {
    return html`
      <div class="horizontal center center-justified layout">
        <p id="project">${_t('webui.menu.Project')}</p>
        <div id="group-select-box"></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-project-switcher': BackendAIProjectSwitcher;
  }
}
