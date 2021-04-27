/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */
import {LitElement} from 'lit';

/**
 Backend.AI Message handler

 `backend-ai-message` is a message handler to get polite message.

 Example:

 <backend-ai-message></backend-ai-message>

@group Backend.AI Web UI
 */
class BackendAiMessage extends LitElement {
  constructor() {
    super();
  }

  static get is() {
    return 'backend-ai-message';
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

customElements.define(BackendAiMessage.is, BackendAiMessage);
