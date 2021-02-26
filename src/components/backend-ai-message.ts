/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */
import {LitElement} from "lit-element";

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

  firstUpdated() {
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  attributeChangedCallback(name, oldval, newval) {
    super.attributeChangedCallback(name, oldval, newval);
  }
}

customElements.define(BackendAiMessage.is, BackendAiMessage);
