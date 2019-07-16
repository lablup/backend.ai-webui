/**
 * Test plugin
 */

import {css, html, LitElement} from "lit-element";
class TestPlugin extends LitElement {
  constructor() {
    super();
  }

  static get properties() {
    return {
    }
  }

  static get is() {
    return 'test-plugin';
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

customElements.define(TestPlugin.is, TestPlugin);
