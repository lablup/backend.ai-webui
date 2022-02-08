/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {css, CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {BackendAiStyles} from '../../components/backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../../plastics/layout/iron-flex-layout-classes';

import '@material/mwc-tab/mwc-tab';
import '@material/mwc-tab-bar/mwc-tab-bar';
import '@material/mwc-menu/mwc-menu';
import '@material/mwc-button/mwc-button';
import '@material/mwc-select/mwc-select';
import '@material/mwc-list/mwc-list-item';

import PipelineUtils from '../lib/pipeline-utils';
import './pipeline-runner-list';
import '../lib/pipeline-flow';
import '../../components/lablup-activity-panel';

/**
 Pipeline Runner View

 `pipeline-runner-view` is wrapper component of instantiated pipeline list and flow display

 Example:

 <pipeline-runner-view>
 ...
 </pipeline-runner-view>

@group Backend.AI pipeline
 @element pipeline-runner-view
*/
@customElement('pipeline-runner-view')
export default class PipelineRunnerView extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({type: String}) _activeTab = 'runner-list';
  @property({type: Object}) pipeline = Object();
  @property({type: String}) totalDuration;
  @property({type: Boolean}) isRunning = false;

  constructor() {
    super();
  }

  static get styles(): CSSResultGroup | undefined {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        h3.tab {
          background-color: var(--general-tabbar-background-color);
          border-radius: 5px 5px 0px 0px;
          margin: 0px auto;
        }

        mwc-tab-bar {
          --mdc-theme-primary: var(--general-sidebar-selected-color);
          --mdc-text-transform: none;
          --mdc-tab-color-default: var(--general-tabbar-background-color);
          --mdc-tab-text-label-color-default: var(--general-tabbar-tab-disabled-color);
        }

        .tab-content {
          width: 100%;
        }

        mwc-icon-button {
          color: var(--general-button-background-color);
        }

        #pipeline-list {
          border: 1px solid #ccc;
          margin-right: 20px;
        }

        #dropdown-menu-container {
          position: relative;
        }

        #dropdown-menu {
          box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
          --mdc-menu-item-height: auto;
          --mdc-theme-surface: #f1f1f1;
          --mdc-menu-item-height : auto;
        }

        #dropdown-menu mwc-list-item {
          font-size: 14px;
        }

        #dropdown-menu mwc-icon {
          padding-right: 10px;
          position: relative;
          top: 5px;
        }

        #workflow-dialog-title {
          min-width: 530px;
        }
      `
    ];
  }

  firstUpdated() {
    if (this.pipeline?.started_at && this.pipeline?.last_updated) {
      this.totalDuration = PipelineUtils._humanReadableTimeDuration(this.pipeline.started_at, this.pipeline.last_updated);
    }
  }

  _showTab(tab) {
    const els = this.shadowRoot.querySelectorAll('.tab-content');
    for (const obj of els) {
      obj.style.display = 'none';
    }
    this._activeTab = tab.title;
    this.shadowRoot.querySelector('#' + tab.title).style.display = 'block';
  }

  _showDialog(id) {
    this.shadowRoot.querySelector('#' + id).show();
  }

  /**
   * Control a button's running state and call method.
   *
   * @param {Event} e - event from dropdown component.
   */
  _toggleRunning(e) {
    const button = e.target;
    if (button.label === 'Start') {
      button.label = 'Stop';
      button.icon = 'pause';
      // call _stopPipeline()
    } else {
      button.label = 'Start';
      button.icon = 'play_arrow';
      // call _startPipeline()
    }
  }

  /**
   * Control a dropdown menu's open state.
   *
   * @param {Event} e - event from dropdown component.
   */
  _toggleDropDown(e) {
    const menu = this.shadowRoot.querySelector('#dropdown-menu');
    const button = e.target;
    menu.anchor = button;
    if (!menu.open) {
      menu.show();
    }
  }

  render() {
    // language=HTML
    return html`
      <lablup-activity-panel noheader narrow autowidth>
        <div slot="message">
          <h3 class="tab horizontal center layout">
            <mwc-tab-bar>
              <mwc-tab title="runner-list" label="Runner List" @click="${(e) => this._showTab(e.target)}"></mwc-tab>
              <mwc-tab title="runner-view" label="Runner View" @click="${(e) => this._showTab(e.target)}"></mwc-tab>
            </mwc-tab-bar>
          </h3>
          <div id="runner-list" class="tab-content">
            <pipeline-runner-list></pipeline-runner-list>
          </div>
          <div id="runner-view" class="tab-content item card" style="display:none;">
            <h4 class="horizontal flex center center-justified layout">
              <mwc-select id="pipeline-list" label="Pipeline"></mwc-select>
              <mwc-list-item twoline>
                <span><strong>Duration</strong></span>
                <span class="monospace" slot="secondary">${this.totalDuration}</span>
              </mwc-list-item>
              <span class="flex"></span>
              <mwc-button label="Start" icon="play_arrow" @click="${(e) => this._toggleRunning(e)}"></mwc-button>
              <div id="dropdown-menu-container">
                <mwc-icon-button icon="more_horiz" @click="${(e) => this._toggleDropDown(e)}"></mwc-icon-button>
                <mwc-menu id="dropdown-menu" corner="BOTTOM_LEFT">
                  <mwc-list-item class="horizontal layout center"
                    @click="${() => {
    this._showDialog('workflow-dialog');
    this.shadowRoot.querySelector('#workflow-editor').refresh();
  }}">
                    <mwc-icon>assignment</mwc-icon>
                    <span>View workflow file</span>
                  </mwc-list-item>
                </mwc-menu>
              </div>
            </h4>
            <pipeline-flow id="pipeline-flow"></pipeline-flow>
          </div>
        </div>
      </lablup-activity-panel>
      <pipeline-dialog id="workflow-dialog">
        <span id="workflow-dialog-title" slot="title">Workflow file</span>
        <div slot="content">
          <lablup-codemirror id="workflow-editor" mode="yaml"></lablup-codemirror>
        </div>
      </pipeline-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pipeline-runner-view': PipelineRunnerView;
  }
}
