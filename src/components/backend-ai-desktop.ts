/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {css, CSSResultGroup, html, LitElement, PropertyValues} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {BackendAiStyles} from './backend-ai-general-styles';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

import {viewType} from './backend-ai-window-manager';

/**
 Backend AI Desktop

 Desktop is an base element to put windows, widgets and workspaces.

 @group Backend.AI Desktop
 @element backend-ai-desktop
 */
@customElement('backend-ai-desktop')
export default class BackendAIDesktop extends LitElement {
  @property({type: String}) backgroundURL = 'resources/images/background-01.jpg';
  @query('#background') background!: HTMLDivElement;
  @property({type: String}) viewMode : viewType = 'win';

  constructor() {
    super();
  }

  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        #background {
          width: 100%;
          height: 100vh;
          background-position: top left;
          position: fixed;
          background-size: cover;
        }
      `];
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    console.log(this.viewMode);
    if (this.viewMode === 'win') {
      this.background.style.backgroundImage = 'url(' + this.backgroundURL + ')';
    } else { // Tab mode
      this.background.style.background = 'var(--general-background-color)';
    }
  }

  render() {
    // language=HTML
    return html`
      <div id="background"></div>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-desktop': BackendAIDesktop;
  }
}

