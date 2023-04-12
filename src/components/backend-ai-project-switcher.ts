/**
 @license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
 */


import {customElement, property, query} from 'lit/decorators.js';
import {LitElement, html, CSSResultGroup} from 'lit';
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
  @property({type: Boolean}) isDescending = false;

  @query('#project-select-box') projectSelectionBox: HTMLDivElement | undefined;

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

  _sortProjects() {
    this.isDescending = !this.isDescending;
    if (this.isDescending) {
      this.projects.reverse();
    } else {
      this.projects.sort();
    }
    this._refreshUserGroupSelector();
  }

  _refreshUserGroupSelector(): void {
    this.currentProject = globalThis.backendaiutils._readRecentProjectGroup();
    globalThis.backendaiclient.current_group = this.currentProject;
    this.projects = globalThis.backendaiclient.groups;
    // Detached from template to support live-update after creating new group (will need it)
    if (this.projectSelectionBox?.hasChildNodes()) {
      this.projectSelectionBox?.removeChild(this.projectSelectionBox.firstChild as ChildNode);
    }
    const div = document.createElement('div');
    div.className = 'horizontal center center-justified layout';

    const select = document.createElement('mwc-select');
    select.id = 'project-select';
    select.value = this.currentProject;
    select.style.width = 'auto';
    select.style.maxWidth = '200px';
    select.addEventListener('selected', (e) => this.changeGroup(e));

    const projectSortBox = document.createElement('div');
    projectSortBox.classList.add('horizontal', 'layout', 'center', 'space-between');
    projectSortBox.style.paddingLeft = '16px';
    projectSortBox.style.paddingRight = '10px';
    projectSortBox.style.borderBottom = '1px solid #ccc';

    const selectProjectText = document.createElement('div');
    selectProjectText.innerHTML = _text('webui.menu.SelectProject');

    const span = document.createElement('span');
    span.classList.add('flex');

    const sortToggleButton = document.createElement('mwc-icon-button-toggle');
    sortToggleButton.setAttribute('onIcon', 'arrow_drop_down');
    sortToggleButton.setAttribute('offIcon', 'arrow_drop_up');
    if (this.isDescending) {
      sortToggleButton.setAttribute('on', '');
    }
    sortToggleButton.addEventListener('click', () => this._sortProjects());

    projectSortBox.appendChild(selectProjectText);
    projectSortBox.appendChild(span);
    projectSortBox.appendChild(sortToggleButton);
    select.appendChild(projectSortBox);

    let opt;
    this.projects.map((group) => {
      opt = document.createElement('mwc-list-item');
      opt.value = group;
      if (this.currentProject === group) {
        opt.selected = true;
      } else {
        opt.selected = false;
      }
      opt.innerHTML = group;
      select.appendChild(opt);
    });
    // select.updateOptions();
    div.appendChild(select);
    this.projectSelectionBox?.appendChild(div);
  }

  render() {
    return html`
      <div class="horizontal center center-justified layout">
        <p id="project">${_t('webui.menu.Project')}</p>
        <div id="project-select-box"></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-project-switcher': BackendAIProjectSwitcher;
  }
}
