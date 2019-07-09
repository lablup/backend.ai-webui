/**
 Backend.AI view page for Single-page application

 @group Backend.AI Console
 */
export const backendAIPage = (state = false) => (baseElement) => class extends baseElement {
  constructor() {
    super();
    if (state === false) {
      this.active = false;
    } else {
      this.active = true;
    }
  }

  shouldUpdate() {
    return this.active;
  }

  attributeChangedCallback(name, oldval, newval) {
    if (name == 'active' && newval !== null) {
      this.active = true;
      this._menuChanged(true);
    } else {
      this.active = false;
      this._menuChanged(false);
    }
    super.attributeChangedCallback(name, oldval, newval);
  }
};
