/**
 Backend.AI view page for Single-page application

 @group Backend.AI Console
 */
import {LitElement} from 'lit-element';

export class BackendAIPage extends LitElement {
  public active: boolean;
  public shadowRoot: any;
  public updateComplete: any;
  public notification: any;

  constructor() {
    super();
  }

  public _viewStateChanged(param: Boolean): void;

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

  get activeConnected() {
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
