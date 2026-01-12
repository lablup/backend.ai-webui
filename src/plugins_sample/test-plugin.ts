/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import { BackendAIPage } from '../components/backend-ai-page';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 Test plugin for Backend.AI WebUI

 */
@customElement('test-plugin')
export default class TestPlugin extends BackendAIPage {
  @property({ type: String }) menuitem = 'TestPage'; // Menu name on sidebar. You may keep this value empty to hide from menu.
  @property({ type: String }) is = 'test-plugin'; // Should exist and unique.
  @property({ type: String }) permission = 'user'; // Can be 'user', 'admin' or 'superadmin'.

  constructor() {
    super();
  }

  static get styles() {
    return [];
  }

  firstUpdated() {
    console.log('test plugin loaded.');
  }

  connectedCallback() {
    super.connectedCallback();
  }

  attributeChangedCallback(name, oldval, newval) {}

  render() {
    // language=HTML
    return html`
      <div>This is test plugin.</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-plugin': TestPlugin;
  }
}
