/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';

export interface ReactWebComponentProps {
  value?: string;
  styles?: string;
  dispatchEvent: (name: string, detail: any) => void;
  shadowRoot: ShadowRoot;
  children?: React.ReactNode;
}

export default function reactToWebComponent(
  ReactComponent:
    | React.FC<ReactWebComponentProps>
    | React.ComponentClass<ReactWebComponentProps>,
) {
  class ReactWebComponent extends HTMLElement {
    static get observedAttributes() {
      return ['value', 'styles'];
    }

    constructor() {
      super();
      // Hierarchy:
      // this > shadowRoot > mountPoint(span) > reactRoot
      this.mountPoint = document.createElement('span');
      this.reactRoot = ReactDOM.createRoot(this.mountPoint);
      this.attachShadow({ mode: 'open' });
      this.shadowRoot?.appendChild(this.mountPoint);

      // Add custom css
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'resources/custom.css';
      this.shadowRoot?.appendChild(link);
    }

    mountPoint: HTMLSpanElement;
    reactRoot: any;

    createReactElement(value: string, styles: string) {
      return (
        this.shadowRoot && (
          <ReactComponent
            value={value}
            styles={styles}
            shadowRoot={this.shadowRoot}
            dispatchEvent={(name: string, detail: any, bubbles = true) => {
              this.dispatchEvent(
                new CustomEvent(name, {
                  bubbles,
                  detail: detail,
                }),
              );
            }}
          >
            <slot />
          </ReactComponent>
        )
      );
    }

    connectedCallback() {
      const value = this.getAttribute('value') || '';
      const styles = this.getAttribute('styles') || '';
      this.reactRoot.render(this.createReactElement(value, styles));
    }

    disconnectedCallback() {
      this.reactRoot.unmount();
    }

    attributeChangedCallback(name: any, _oldValue: any, newValue: any) {
      if (this.isConnected) {
        //re-render react component when attribute changes
        if (name === 'value') {
          this.reactRoot.render(
            this.createReactElement(
              newValue,
              this.getAttribute('styles') || '',
            ),
          );
        } else if (name === 'styles') {
          this.reactRoot.render(
            this.createReactElement(this.getAttribute('value') || '', newValue),
          );
        }
      }
    }
  }
  return ReactWebComponent;
}
