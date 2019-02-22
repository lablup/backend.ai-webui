/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.


 */

import {css, html, LitElement} from "lit-element";
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';

import {BackendAiStyles} from '../backend-ai-console-styles.js';
import {IronFlex, IronFlexAlignment, IronFlexFactors, IronPositioning} from '../layout/iron-flex-layout-classes';


class BackendAiEnvironmentView extends LitElement {
  static get is() {
    return 'backend-ai-environment-view';
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
      `];
  }

  render() {
    // language=HTML
    return html``;
  }

  static get properties() {
    return {
      active: {
        type: Boolean
      }
    }
  }
  constructor() {
    super();
    setPassiveTouchGestures(true);
  }

  shouldUpdate() {
    return this.active;
  }

  firstUpdated() {
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }


}

customElements.define(BackendAiEnvironmentView.is, BackendAiEnvironmentView);
