/**
 Backend.AI base view page for Single-page application

@group Backend.AI Web UI
 */
import {get as _text, LanguageIdentifier, registerTranslateConfig} from 'lit-translate';
import {LitElement} from 'lit';
import {property} from 'lit/decorators.js';

/**
 Backend AI Page

@group Backend.AI Web UI
 @element backend-ai-page
 */

registerTranslateConfig({
  loader: (lang: LanguageIdentifier) => {
    return fetch(`/resources/i18n/${lang}.json`).then((res: Response) => {
      return res.json();
    });
  }
});

export class BackendAIPage extends LitElement {
  public shadowRoot: any; // ShadowRoot
  public notification: any; // Global notification
  public tasker: any; // Global Background tasker
  @property({type: Boolean}) active = false;
  @property({type: Boolean}) hasLoadedStrings = false;

  constructor() {
    super();
    this.active = false;
    this.tasker = globalThis.tasker;
  }

  get activeConnected() {
    return this.active && typeof globalThis.backendaiclient != 'undefined' && globalThis.backendaiclient !== null && globalThis.backendaiclient.ready === true;
  }

  get connected() {
    return typeof globalThis.backendaiclient != 'undefined' && globalThis.backendaiclient !== null && globalThis.backendaiclient.ready === true;
  }

  public _viewStateChanged(param: boolean): void;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public _viewStateChanged(param) {
  }

  shouldUpdate(): boolean {
    return this.active;
  }

  attributeChangedCallback(name: string, oldval: string|null, newval: string|null): void {
    if (name == 'active' && newval !== null) {
      this.active = true;
      this._viewStateChanged(true);
    } else if (name === 'active') {
      this.active = false;
      this._viewStateChanged(false);
    }
    super.attributeChangedCallback(name, oldval, newval);
  }

  /**
   * Hide the backend.ai dialog.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  _hideDialog(e) {
    const hideButton = e.target;
    const dialog = hideButton.closest('backend-ai-dialog');
    dialog.hide();
  }

  // Compatibility layer from here.
  _addInputValidator(obj: any) {
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
        validationMessage = _text('credential.validation.ValidationFailed');
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
            obj.validationMessage = _text('explorer.ValueRequired');
            return {
              valid: nativeValidity.valid,
              valueMissing: !nativeValidity.valid
            };
          } else if (nativeValidity.tooShort) {
            obj.validationMessage = _text('explorer.InputTooShort');
            return {
              valid: nativeValidity.valid,
              valueMissing: !nativeValidity.valid
            };
          } else {
            obj.validationMessage = validationMessage;
            return {
              valid: nativeValidity.valid,
              patternMismatch: !nativeValidity.valid,
            };
          }
        } else {
          return {
            valid: nativeValidity.valid
          };
        }
      };
    }
  }
}
