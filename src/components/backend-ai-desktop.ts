/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {css, CSSResultGroup, html, LitElement, PropertyValues} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {BackendAiStyles} from './backend-ai-general-styles';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';
/**
 Backend AI Desktop

 Desktop is an base element to put windows, widgets and workspaces.

 @group Backend.AI Desktop
 @element backend-ai-desktop
 */
@customElement('backend-ai-desktop')
export default class BackendAIDesktop extends LitElement {

  @property({type: String}) backgroundURL = 'resources/bg1.jpg';
  @query('#background') background!: HTMLDivElement;

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
          width:100%;
          height:100vh;
          background-position:fixed;
          position:fixed;
          background-size:cover;
          backdrop-filter: blur(25px);
        }
      `];
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this.background.style.backgroundImage = 'url(' + this.backgroundURL + ')';
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

