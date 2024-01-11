/**
 @license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
 */
import './backend-ai-dialog';
import { BackendAiStyles } from './backend-ai-general-styles';
import '@material/mwc-linear-progress';
import { css, CSSResultGroup, html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { v4 as uuidv4 } from 'uuid';

/**
 Backend.AI Indicator

 @group Backend.AI Web UI
 @element backend-ai-indicator
 */

@customElement('backend-ai-indicator')
export default class BackendAIIndicator extends LitElement {
  @property({ type: Number }) value = 0;
  @property({ type: Number }) delay = 1000;
  @property({ type: String }) text = '';
  @property({ type: String }) key = '';
  @property({ type: String }) mode = 'determinate';

  constructor() {
    super();
    this.key = uuidv4();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  async start(mode = 'determinate') {
    this.value = 0;
    this.mode = mode;
    await this.updateComplete;
  }

  set(value, text = '') {
    this.value = value / 100.0;
    this.text = text;
    if (this.value >= 1) {
      this.end(this.delay);
    }

    document.dispatchEvent(
      new CustomEvent('webui-notification-indicator', {
        detail: {
          key: this.key,
          set: {
            value,
            text,
            mode: this.mode,
          },
        },
      }),
    );
  }

  end(delay = 1000) {
    document.dispatchEvent(
      new CustomEvent('webui-notification-indicator', {
        detail: {
          key: this.key,
          end: {
            delay,
          },
        },
      }),
    );
  }

  render() {
    return;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-indicator': BackendAIIndicator;
  }
}
