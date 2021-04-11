/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t} from 'lit-translate';
import {css, customElement, html, property} from 'lit-element';

import '@material/mwc-button/mwc-button';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-select/mwc-select';

import {BackendAiStyles} from './backend-ai-general-styles';

import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';
import {default as PainKiller} from './backend-ai-painkiller';
import {BackendAIPipelineCommon} from './backend-ai-pipeline-common';

/**
 Backend AI Pipeline Runner

 `backend-ai-pipeline-runner` takes responsibility to run pipeline component(s).

 @group Backend.AI Console
 @element backend-ai-pipeline-runner
 */
@customElement('backend-ai-pipeline-runner')
export default class BackendAIPipelineComponentView extends BackendAIPipelineCommon {
  // Elements
  @property({type: Object}) spinner = Object();
  @property({type: Object}) notification = Object();
  // Pipeline components prpoerties
  @property({type: String}) pipelineSelectedName = '';

  constructor() {
    super();
  }

  firstUpdated() {
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this.notification = globalThis.lablupNotification;
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    if (typeof window.backendaiclient === 'undefined' || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', async () => {
      }, true);
    } else {
    }
  }

  async editCode(folderName, nodeInfo) {
    this.spinner.show();
    const code = await this._ensureComponentMainCode(nodeInfo);
    const dialog = this.shadowRoot.querySelector('#codemirror-dialog');
    const editor = this.shadowRoot.querySelector('#codemirror-editor');
    editor.setValue(code);
    dialog.querySelector('span[slot="title"]').textContent = component.title;
    dialog.show();
    this.spinner.hide();
  }

  async _ensureComponentMainCode(nodeInfo) {
    await this._ensureComponentFolder(nodeInfo);
    const filepath = `${nodeInfo.path}/main.py`; // TODO: hard-coded file name
    try {
      const res = await window.backendaiclient.vfolder.download(filepath, this.pipelineFolderName, false, true);
      return await res.text();
    } catch (err) {
      console.error(err);
      if (err.title && err.title.split(' ')[0] === '404') {
        // Code file not found. upload empty code.
        const blob = new Blob([''], {type: 'plain/text'});
        await this._uploadFile(filepath, blob, this.pipelineFolderName);
        return '';
      } else {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true);
      }
    }
  }

  async _ensureComponentFolder(component) {
    const folder = `${component.path}`;
    try {
      await window.backendaiclient.vfolder.mkdir(folder, this.pipelineFolderName, null, true);
    } catch (err) {
      if (err && err.message && err.message.includes('already exists')) {
        // silently pass if the target folder alrady exists
      } else {
        console.error(err);
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true);
      }
    }
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
      `
    ];
  }

  render() {
    // language=HTML
    return html`
      <div class="card" elevation="0">
      </div>

      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-pipeline-runner': BackendAIPipelineRunner;
  }
}
