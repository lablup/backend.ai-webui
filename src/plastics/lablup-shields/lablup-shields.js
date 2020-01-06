/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {css, html, LitElement} from "lit-element";
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';
import {IronFlex, IronFlexAlignment, IronFlexFactors, IronPositioning} from "../layout/iron-flex-layout-classes";

/**
 `<lablup-shields>` is a complement lit-element of shields.io

 Example:
 <lablup-shields app="test" description="0.1" ui="flat"></lablup-shields>

 @group Lablup Elements
 @element lablup-shields
 */
class LablupShields extends LitElement {
  constructor() {
    super();
    setPassiveTouchGestures(true);
    this.app = '';
    this.description = '';
    this.color = 'green';
    this.appColor = 'grey';
    this.ui = 'flat';
  }

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
          color: #fff;
        }

        .round {
          border-radius: 4px;
        }
      `];
  }

  static get is() {
    return 'lablup-shields';
  }

  static get properties() {
    return {
      app: {
        type: String
      },
      description: {
        type: String
      },
      color: {
        type: String
      },
      appColor: {
        type: String
      },
      ui: {
        type: String
      }
    }
  }

  get _colorScheme() {
    return {
      "brightgreen": {"colorB": "#4c1", "colorT": "#222222"},
      "lightgreen": {"colorB": "#F3F5D0", "colorT": "#222222"},
      "green": {"colorB": "#97CA00"},
      "darkgreen": {"colorB": "#457B3B"},
      "yellow": {"colorB": "#dfb317"},
      "yellowgreen": {"colorB": "#a4a61d"},
      "orange": {"colorB": "#fe7d37"},
      "red": {"colorB": "#e05d44"},
      "blue": {"colorB": "#007ec6"},
      "lightblue": {"colorB": "#caedfc", "colorT": "#222222"},
      "grey": {"colorB": "#555"},
      "gray": {"colorB": "#555"},
      "lightgrey": {"colorB": "#9f9f9f"},
      "lightgray": {"colorB": "#9f9f9f"}
    }
  }

  render() {
    // language=HTML
    return html`
      <div class="shields layout horizontal flex">
        <div id="app" class="app horizontal layout center">
          <slot name="app-icon"></slot>
          <span id="app-text" class="text app-text">${this.app}</span></div>
        <div id="description" class="desc horizontal layout center">
          <slot name="desc-icon"></slot>
          <span id="desc-text" class="text desc-text">${this.description}</span></div>
      </div>
    `;
  }

  firstUpdated() {
    this._colorChanged();
    this._appColorChanged();
    this._formatItem();
    this._descriptionChanged();
    if (this.app == '') {
      this.shadowRoot.querySelector('#app-text').style.display = 'none';
    }
  }

  connectedCallback() {
    super.connectedCallback();
  }

  attributeChangedCallback(name, oldval, newval) {
    if (name == 'description') {
      this.description = newval;
      this._descriptionChanged();
    }
    super.attributeChangedCallback(name, oldval, newval);
  }

  updated(changedProps) {
    if (changedProps.has("color")) {
      this._colorChanged();
    }
  }

  _classChanged() {
    this._formatItem();
  }

  _colorChanged() {
    if (this._colorScheme[this.color]) {
      this.shadowRoot.querySelector('.desc').style.backgroundColor = this._colorScheme[this.color]['colorB'];
      if (this._colorScheme[this.color]['colorT']) {
        this.shadowRoot.querySelector('.desc-text').style.color = this._colorScheme[this.color]['colorT'];
      }
    }
  }

  _appColorChanged() {
    if (this._colorScheme[this.appColor]) {
      this.shadowRoot.querySelector('.app').style.backgroundColor = this._colorScheme[this.appColor]['colorB'];
      if (this._colorScheme[this.appColor]['colorT']) {
        this.shadowRoot.querySelector('.app-text').style.color = this._colorScheme[this.appColor]['colorT'];
      }
    } else {
      this.shadowRoot.querySelector('.app').style.backgroundColor = '#555';
    }
  }

  async _descriptionChanged() {
    await this.updateComplete;
    if (typeof this.description == 'undefined' || this.description == 'undefined' || this.description === '') {
      this.shadowRoot.querySelector('#description').style.display = 'none';
    } else {
      this.shadowRoot.querySelector('#description').style.display = 'block';
    }
  }

  _formatItem() {
    if (['round'].indexOf(this.ui) >= 0) {
      this.shadowRoot.querySelector('.shields').classList.add(this.ui);
    }
  }
}

customElements.define(LablupShields.is, LablupShields);
