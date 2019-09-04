/**
 Backend.AI view page for Single-page application

 @group Backend.AI Console
 */
import {LitElement, property} from 'lit-element';

export class BackendAIPage extends LitElement {
  public shadowRoot: any;
  public updateComplete: any;
  public notification: any;
  @property({type: Boolean}) active = false;

  constructor() {
    super();
    this.active = false;
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
