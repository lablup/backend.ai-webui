/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import { BackendAIPage } from '../components/backend-ai-page';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 Link Test plugin for Backend.AI Console

 */
@customElement('link-test-plugin')
export default class LinkTestPlugin extends BackendAIPage {
  @property({ type: String }) menuitem = 'LinkTestPage'; // Menu name on sidebar.
  @property({ type: String }) is = 'link-test-plugin'; // Should be exist.
  @property({ type: String }) permission = 'user'; // Can be 'user', 'admin' or 'superadmin'.
  @property({ type: String }) url = 'https://www.google.com'; // URL to redirect.

  constructor() {
    super();
  }

  static get styles() {
    return [];
  }

  updated() {
    this.openExternalLink();
  }

  openExternalLink() {
    window.open(this.url, '_blank');
    window.history.back();
  }

  render() {
    // language=HTML
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'link-test-plugin': LinkTestPlugin;
  }
}
