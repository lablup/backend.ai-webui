/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../layout/iron-flex-layout-classes';
import { css, html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

type colorType = {
  colorB: string;
  colorT: string | undefined;
};

type colorSchemeType = {
  [index: string]: colorType;
  brightgreen: colorType;
  lightgreen: colorType;
  green: colorType;
  darkgreen: colorType;
  yellow: colorType;
  yellowgreen: colorType;
  orange: colorType;
  red: colorType;
  blue: colorType;
  purple: colorType;
  lightblue: colorType;
  grey: colorType;
  gray: colorType;
  lightgrey: colorType;
  lightgray: colorType;
};
/**
 `<lablup-shields>` is a complement webcomponent of shields.io

 Example:
 <lablup-shields app="test" description="0.1" ui="flat"></lablup-shields>

 @group Lablup Elements
 @element lablup-shields
 */
@customElement('lablup-shields')
export default class LablupShields extends LitElement {
  @property({ type: String }) app = '';
  @property({ type: String }) description = '';
  @property({ type: String }) color = 'green';
  @property({ type: String }) appColor = 'grey';
  @property({ type: String }) ui = 'flat';
  @property({ type: Object }) customColorPalette = Object();
  @query('#app') appContainer!: HTMLDivElement;
  @query('#description') descriptionContainer!: HTMLDivElement;

  static get styles() {
    return [
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        .text {
          font-family: 'DejaVu Sans', Verdana, Geneva, sans-serif;
          font-size: 11px;
          line-height: 11px;
          padding: 4px;
          display: block;
          color: #ffffff;
        }

        .round {
          border-radius: 4px;
        }
        .round-left {
          border-top-left-radius: 4px;
          border-bottom-left-radius: 4px;
        }
        .round-right {
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
        }
        .app,
        .desc {
          white-space: normal;
          height: fit-content;
          width: var(--lablup-shield-component-width, auto);
        }
      `,
    ];
  }

  get _colorScheme() {
    let colorPalette: colorSchemeType = {
      brightgreen: { colorB: '#44cc11', colorT: '#222222' },
      lightgreen: { colorB: '#f3f5d0', colorT: '#222222' },
      green: { colorB: '#97ca00', colorT: '#ffffff' },
      darkgreen: { colorB: '#457b3b', colorT: '#ffffff' },
      yellow: { colorB: '#dfb317', colorT: '#ffffff' },
      yellowgreen: { colorB: '#a4a61d', colorT: '#ffffff' },
      orange: { colorB: '#fe7d37', colorT: '#ffffff' },
      red: { colorB: '#e05d44', colorT: '#ffffff' },
      blue: { colorB: '#007ec6', colorT: '#ffffff' },
      purple: { colorB: '#ab47bc', colorT: '#ffffff' },
      lightblue: { colorB: '#caedfc', colorT: '#222222' },
      grey: { colorB: '#555555', colorT: '#ffffff' },
      gray: { colorB: '#555555', colorT: '#ffffff' },
      lightgrey: { colorB: '#9f9f9f', colorT: '#ffffff' },
      lightgray: { colorB: '#9f9f9f', colorT: '#ffffff' },
      cyan: { colorB: '#87e8de', colorT: '#222222' },
    };
    if (
      this.customColorPalette &&
      Object.keys(this.customColorPalette).length > 0
    ) {
      colorPalette = Object.assign(colorPalette, this.customColorPalette);
    }
    return colorPalette;
  }

  render() {
    // language=HTML
    return html`
      <div class="shields layout horizontal flex">
        <div id="app" class="app horizontal layout center">
          <slot name="app-icon"></slot>
          <span id="app-text" class="text app-text">${this.app}</span>
        </div>
        <div id="description" class="desc horizontal layout center">
          <slot name="desc-icon"></slot>
          <span id="desc-text" class="text desc-text">${this.description}</span>
        </div>
      </div>
    `;
  }

  firstUpdated() {
    this._colorChanged();
    this._appColorChanged();
    this._formatItem();
    this._descriptionChanged();
    if (this.app == '') {
      this.appContainer.style.display = 'none';
    }
  }

  connectedCallback() {
    super.connectedCallback();
  }

  attributeChangedCallback(name: string, oldval: any, newval: any) {
    super.attributeChangedCallback(name, oldval, newval);
    if (name == 'app') {
      this.app = newval;
      this._appChanged();
    }
    if (name == 'description') {
      this.description = newval;
      this._descriptionChanged();
    }
  }

  updated(changedProps: any) {
    if (changedProps.has('color')) {
      this._colorChanged();
    }
    if (changedProps.has('appColor')) {
      this._appColorChanged();
    }
  }

  _classChanged() {
    this._formatItem();
  }

  _colorChanged() {
    if (this._colorScheme[this.color]) {
      (
        this.shadowRoot?.querySelector('.desc') as HTMLDivElement
      ).style.backgroundColor = this._colorScheme[this.color]['colorB'];
      if (this._colorScheme[this.color]['colorT']) {
        (
          this.shadowRoot?.querySelector('.desc-text') as HTMLSpanElement
        ).style.color = this._colorScheme[this.color]['colorT'] || '';
      }
    }
  }

  _appColorChanged() {
    if (this._colorScheme[this.appColor]) {
      (
        this.shadowRoot?.querySelector('.app') as HTMLDivElement
      ).style.backgroundColor = this._colorScheme[this.appColor]['colorB'];
      if (this._colorScheme[this.appColor]['colorT']) {
        (
          this.shadowRoot?.querySelector('.app-text') as HTMLSpanElement
        ).style.color = this._colorScheme[this.appColor]['colorT'] || '';
      }
    } else {
      (
        this.shadowRoot?.querySelector('.app') as HTMLDivElement
      ).style.backgroundColor = '#555';
    }
  }

  async _appChanged() {
    await this.updateComplete;
    if (
      typeof this.app == 'undefined' ||
      this.app == 'undefined' ||
      this.app === ''
    ) {
      this.appContainer.style.display = 'none';
    } else {
      this.appContainer.style.display = 'block';
    }
  }

  async _descriptionChanged() {
    await this.updateComplete;
    if (
      typeof this.description == 'undefined' ||
      this.description == 'undefined' ||
      this.description === ''
    ) {
      this.descriptionContainer.style.display = 'none';
    } else {
      this.descriptionContainer.style.display = 'block';
    }
  }

  _formatItem() {
    if (['round'].indexOf(this.ui) >= 0) {
      (
        this.shadowRoot?.querySelector('.shields') as HTMLDivElement
      ).classList.add(this.ui);
      if (
        typeof this.description == 'undefined' ||
        this.description == 'undefined' ||
        this.description === ''
      ) {
        if (
          typeof this.app == 'undefined' ||
          this.app == 'undefined' ||
          this.app === ''
        ) {
        } else {
          // App exists/ description does not
          this.appContainer.classList.add(this.ui);
        }
      } else {
        if (
          typeof this.app == 'undefined' ||
          this.app == 'undefined' ||
          this.app === ''
        ) {
          // desc exist but app does not.
          this.descriptionContainer.classList.add(this.ui);
        } else {
          // app and description both exist.
          this.appContainer.classList.add(this.ui + '-left');
          this.descriptionContainer.classList.add(this.ui + '-right');
        }
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lablup-shields': LablupShields;
  }
}
