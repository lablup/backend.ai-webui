/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import { BackendAIWebUIStyles } from './backend-ai-webui-styles';
import '@vaadin/combo-box';
import type { ComboBox } from '@vaadin/combo-box';
import { css, LitElement, html, CSSResultGroup } from 'lit';
import { translate as _t } from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';

/**
 Backend AI Project Switcher

 Example:

 <backend-ai-project-switcher></backend-ai-project-switcher>

 @group Backend.AI Web UI
 @element backend-ai-project-switcher
 */
@customElement('backend-ai-project-switcher')
export default class BackendAIProjectSwitcher extends LitElement {
  @property({ type: Array }) projects: string[] = [];
  @property({ type: String }) currentProject = '';
  @query('#project-select') projectSelect!: ComboBox;

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
        vaadin-combo-box {
          font-size: 14px;
          --lumo-font-family: var(--token-fontFamily) !important;
        }
      `,
    ];
  }

  firstUpdated() {
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          this._refreshUserGroupSelector();
          globalThis.backendaiutils._writeRecentProjectGroup(
            this.currentProject,
          );
        },
        true,
      );
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
  protected changeGroup(e) {
    globalThis.backendaiclient.current_group = e.target.value;
    this.currentProject = globalThis.backendaiclient.current_group;
    globalThis.backendaiutils._writeRecentProjectGroup(
      globalThis.backendaiclient.current_group,
    );
    const event: CustomEvent = new CustomEvent('backend-ai-group-changed', {
      detail: globalThis.backendaiclient.current_group,
    });
    document.dispatchEvent(event);
    e.stopPropagation();
  }

  protected _refreshUserGroupSelector(): void {
    this.currentProject = globalThis.backendaiutils._readRecentProjectGroup();
    globalThis.backendaiclient.current_group = this.currentProject;
    this.projects = globalThis.backendaiclient.groups;
    if (globalThis.backendaiclient.is_admin) {
      globalThis.backendaiclient.group
        .list(undefined, undefined, undefined, ['GENERAL', 'MODEL_STORE'])
        .then((res) => {
          this.projects = res.groups.map((group) => group.name);
        });
    }
    this.projectSelect.selectedItem = this.currentProject;
  }

  override render() {
    return html`
      <link rel="stylesheet" href="resources/custom.css" />
      <div class="horizontal center center-justified layout">
        <p id="project">${_t('webui.menu.Project')}</p>
        <div id="project-select-box">
          <div class="horizontal center center-justified layout">
            <vaadin-combo-box
              id="project-select"
              value="${this.currentProject}"
              .items="${this.projects}"
              @change="${(e) => this.changeGroup(e)}"
            ></vaadin-combo-box>
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
