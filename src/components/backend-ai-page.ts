/**
 Backend.AI base view page for Single-page application

 @group Backend.AI Console
 */
import {LitElement, property} from 'lit-element';

export class BackendAIPage extends LitElement {
  public shadowRoot: any; // ShadowRoot
  public updateComplete: any;
  public notification: any;
  @property({type: Boolean}) active = false;

  constructor() {
    super();
    this.active = false;
  }

  get activeConnected() {
    return this.active && typeof window.backendaiclient != 'undefined' && window.backendaiclient !== null && window.backendaiclient.ready === true;
  }

  get connected() {
    return typeof window.backendaiclient != 'undefined' && window.backendaiclient !== null && window.backendaiclient.ready === true;
  }

  public run_after_connection = (fn: any) => {
    fn;
  };

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

  // Compatibility layer from here.
  _addInputValidator(obj) {
    if (!obj.hasAttribute('auto-validate')) {
      return;
    }
    let validationMessage: string;
    if (obj.validityTransform === null) {
      if (obj.getAttribute('error-message')) { // Support paper-component style attribute
        validationMessage = obj.getAttribute('error-message');
      } else if (obj.getAttribute('validationMessage')) { // Support standard attribute
        validationMessage = obj.getAttribute('validationMessage');
      } else {
        validationMessage = 'Validation failed.';
      }
      obj.validityTransform = (value, nativeValidity) => {
        if (!nativeValidity.valid) {
          if (nativeValidity.patternMismatch) {
            obj.validationMessage = validationMessage;
            return {
              valid: nativeValidity.valid,
              patternMismatch: !nativeValidity.valid
            };
          } else if (nativeValidity.valueMissing) {
            obj.validationMessage = "Value required.";
            return {
              valid: nativeValidity.valid,
              valueMissing: !nativeValidity.valid
            }
          } else if (nativeValidity.tooShort) {
            obj.validationMessage = "Input too short.";
            return {
              valid: nativeValidity.valid,
              valueMissing: !nativeValidity.valid
            }
          } else {
            obj.validationMessage = validationMessage;
            return {
              valid: nativeValidity.valid,
              patternMismatch: !nativeValidity.valid,
            }
          }
        } else {
          return {
            valid: nativeValidity.valid
          }
        }
      };
    }
  }
}
