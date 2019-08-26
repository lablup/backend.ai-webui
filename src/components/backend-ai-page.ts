/**
 Backend.AI view page for Single-page application

 @group Backend.AI Console
 */
import {LitElement} from 'lit-element';

export class BackendAIPage extends LitElement {
  public active: any;

  public _viewStateChanged(param: Boolean): void;

  constructor() {
    super();
  }

  _viewStateChanged(param) {
  }

  shouldUpdate() {
    return this.active;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  activeConnected() {
    return this.active && typeof window.backendaiclient != 'undefined' && window.backendaiclient !== null;
  }

  attributeChangedCallback(name, oldval, newval) {
    if (name == 'active' && newval !== null) {
      this.active = true;
      this._viewStateChanged(true);
    } else {
      this.active = false;
      this._viewStateChanged(false);
    }
    super.attributeChangedCallback(name, oldval, newval);
  }
}
