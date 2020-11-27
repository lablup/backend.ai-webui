/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {customElement, html, property} from "lit-element";
import {BackendAIPage} from "../components/backend-ai-page";

/**
 Test plugin for Backend.AI Console

 */
@customElement("test-plugin")
export default class TestPlugin extends BackendAIPage {
  @property({type: String}) menuitem = 'TestPage'; // Menu name on sidebar.
  @property({type: String}) is = 'test-plugin'; // Should be exist.
  @property({type: String}) permission = 'user'; // Can be 'user', 'admin' or 'superadmin'.

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

  attributeChangedCallback(name, oldval, newval) {
  }


  render() {
    // language=HTML
    return html`
      <div> This is test plugin.</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "test-plugin": TestPlugin;
  }
}
