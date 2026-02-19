/**
 Backend.AI base view page for Single-page application

@group Backend.AI Web UI
 */
import { LitElement } from 'lit';
import {
  get as _text,
  LanguageIdentifier,
  registerTranslateConfig,
} from 'lit-translate';
import { property } from 'lit/decorators.js';

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
  },
});

export class BackendAIPage extends LitElement {
  public notification: any; // Global notification
  public tasker: any; // Global Background tasker
  private requiresUpdateWhenInactive: boolean = false;
  @property({ type: Boolean, reflect: true }) active = false;
  @property({ type: Boolean }) hasLoadedStrings = false;
  @property({ type: String }) permission; // Reserved for plugin pages
  @property({ type: String }) menuitem; // Reserved for plugin pages
  @property({ type: String }) icon; // Reserved for plugin pages
  @property({ type: String }) group; // Reserved for plugin pages
  @property({ type: Boolean }) isDarkMode;

  constructor() {
    super();
    this.active = false;
    this.tasker = globalThis.tasker;
    this.isDarkMode = globalThis.isDarkMode;
  }

  get activeConnected() {
    return (
      this.active &&
      typeof globalThis.backendaiclient != 'undefined' &&
      globalThis.backendaiclient !== null &&
      globalThis.backendaiclient.ready === true
    );
  }

  get connected() {
    return (
      typeof globalThis.backendaiclient != 'undefined' &&
      globalThis.backendaiclient !== null &&
      globalThis.backendaiclient.ready === true
    );
  }

  public _viewStateChanged(param: boolean): void;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public _viewStateChanged(param) {}

  themeHandler = (event: any) => {
    this.isDarkMode = event.detail;
  };
  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener(
      'change:backendaiwebui.setting.isDarkMode',
      this.themeHandler,
    );
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener(
      'change:backendaiwebui.setting.isDarkMode',
      this.themeHandler,
    );
  }

  shouldUpdate(): boolean {
    if (!this.active && this.requiresUpdateWhenInactive) {
      this.requiresUpdateWhenInactive = false; // Only need to update once
      return true;
    } else {
      return this.active;
    }
  }

  attributeChangedCallback(
    name: string,
    oldval: string | null,
    newval: string | null,
  ): void {
    if (name === 'active') {
      if (oldval === newval) {
        return;
      } else if (newval !== null) {
        this.active = true;
        this._viewStateChanged(true);
      } else {
        this.requiresUpdateWhenInactive = true;
        this.active = false;
        this._viewStateChanged(false);
      }
    }
    super.attributeChangedCallback(name, oldval, newval);
  }

  // Compatibility layer from here.
  _addInputValidator(obj: any) {
    if (!obj.hasAttribute('auto-validate')) {
      return;
    }
    let validationMessage: string;
    if (obj.validityTransform === null) {
      if (obj.getAttribute('error-message')) {
        // Support paper-component style attribute
        validationMessage = obj.getAttribute('error-message');
      } else if (obj.getAttribute('validationMessage')) {
        // Support standard attribute
        validationMessage = obj.getAttribute('validationMessage');
      } else {
        validationMessage = _text('general.validation.ValidationFailed');
      }
      obj.validityTransform = (value, nativeValidity) => {
        if (!nativeValidity.valid) {
          if (nativeValidity.patternMismatch) {
            obj.validationMessage = validationMessage;
            return {
              valid: nativeValidity.valid,
              patternMismatch: !nativeValidity.valid,
            };
          } else if (nativeValidity.valueMissing) {
            obj.validationMessage = _text('explorer.ValueRequired');
            return {
              valid: nativeValidity.valid,
              valueMissing: !nativeValidity.valid,
            };
          } else if (nativeValidity.tooShort) {
            obj.validationMessage = _text('explorer.InputTooShort');
            return {
              valid: nativeValidity.valid,
              valueMissing: !nativeValidity.valid,
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
            valid: nativeValidity.valid,
          };
        }
      };
    }
  }
}
