/**
 @license
 Copyright (c) 2019 Lablup Inc.
 Ported to lit-element for easier migration from Polymer to LitElement.

 Original paper-material:
 Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
 This code may only be used under the BSD style license found at
 http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
 http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
 found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
 part of the polymer project is also subject to an additional IP rights grant
 found at http://polymer.github.io/PATENTS.txt
 */
import {css, html, LitElement} from "lit-element";
import {PlasticMaterialSharedStyles} from './plastic-material-shared-styles';
import {setPassiveTouchGestures} from "@polymer/polymer/lib/utils/settings";

/**
 Material design:
 [Cards](https://www.google.com/design/spec/components/cards.html)

 `paper-material` is a container that renders two shadows on top of each other to
 create the effect of a lifted piece of paper.

 Example:

 <paper-material elevation="1">
 ... content ...
 </paper-material>

 @group Paper Elements
 @demo demo/index.html
 */

class PlasticMaterial extends LitElement {

  static get is() {
    return 'plastic-material';
  }

  static get properties() {
    return {
      /**
       * The z-depth of this element, from 0-5. Setting to 0 will remove the
       * shadow, and each increasing number greater than 0 will be "deeper"
       * than the last.
       *
       * @attribute elevation
       * @type number
       * @default 1
       */
      elevation: {
        type: Number,
        reflect: true
      },
      /**
       * Set this to true to animate the shadow when setting a new
       * `elevation` value.
       *
       * @attribute animated
       * @type boolean
       * @default false
       */
      animated: {
        type: Boolean,
        reflect: true
      }
    }
  }

  constructor() {
    super();
    setPassiveTouchGestures(true);
    this.elevation = 1;
    this.animated = false;
  }

  firstUpdated() {
  }

  attributeChangedCallback(name, oldval, newval) {
    super.attributeChangedCallback(name, oldval, newval);
  }

  static get styles() {
    return [PlasticMaterialSharedStyles,
      css`
      :host([animated]) {
        transition: box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      }
      :host {
        @apply --plastic-material;
      }    
    `];
  }

  render() {
    return html`<slot></slot>`
  }
}

customElements.define(PlasticMaterial.is, PlasticMaterial);
