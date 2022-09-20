/**
 Backend.AI base view page for Single-page application

@group Backend.AI Web UI
 */
import {property} from 'lit/decorators.js';
import {BackendAIPage} from './backend-ai-page';
import {css, CSSResultGroup, html} from 'lit';
import {BackendAiStyles} from './backend-ai-general-styles';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';
/**
 Backend AI Window Page

@group Backend.AI Web UI
 @element backend-ai-window-page
 */
export class BackendAIWindowPage extends BackendAIPage {
  @property({type: Boolean}) active = false;

  constructor() {
    super();
    this.active = false;
  }
  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
      `]
  };

  render() {
    // language=HTML
    return html`<slot></slot>`;
  }
}
