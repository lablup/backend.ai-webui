/**
 Backend.AI view page for Single-page application

 @group Backend.AI Console
 */
import { LitElement } from 'lit-element';

export class backendAIPage extends LitElement {
  constructor() {
    super();
  }

  shouldUpdate() {
    return this.active;
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
