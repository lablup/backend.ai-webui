/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, html, LitElement} from "lit-element";
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';

import {BackendAiStyles} from '../backend-ai-console-styles.js';
import {IronFlex, IronFlexAlignment, IronFlexFactors, IronPositioning} from '../layout/iron-flex-layout-classes';
import {installOfflineWatcher, installRouter} from "pwa-helpers";
import {store} from "../store";
import {navigate, updateOffline} from "../backend-ai-app";


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

  constructor() {
    super();
    setPassiveTouchGestures(true);
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
