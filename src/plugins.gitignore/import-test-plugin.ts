/**
 @license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
 */
//  import '../components/backend-ai-import-view';
import { BackendAIPage } from '../components/backend-ai-page';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
   Admin plugin for Backend.AI WebUI
  
   */
@customElement('import-test-plugin')
export default class ImportTestPlugin extends BackendAIPage {
  @property({ type: String }) menuitem = 'Import Test Plugin'; // Menu name on sidebar. You may keep this value empty to hide from menu.
  @property({ type: String }) is = 'import-test-plugin'; // Should exist and unique.
  @property({ type: String }) permission = 'admin'; // Can be 'user', 'admin' or 'superadmin'.

  constructor() {
    super();
  }

  static get styles() {
    return [];
  }

  firstUpdated() {
    console.log('import test plugin loaded.');
  }

  connectedCallback() {
    super.connectedCallback();
  }

  attributeChangedCallback(name, oldval, newval) {}

  render() {
    // language=HTML
    return html`
      <backend-ai-import-view active></backend-ai-import-view>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'import-test-plugin': ImportTestPlugin;
  }
}
