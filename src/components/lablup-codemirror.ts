/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */
import {css, customElement, html, LitElement, property} from "lit-element";

import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

import '@vanillawc/wc-codemirror/index';
import '@vanillawc/wc-codemirror/mode/python/python';
import '@vanillawc/wc-codemirror/mode/shell/shell';
import {CodemirrorThemeMonokai} from '../lib/codemirror/theme/monokai.css.js';

declare const window: any;


@customElement('lablup-codemirror')
export default class LablupCodemirror extends LitElement {
  public shadowRoot: any; // ShadowRoot
  public editor: any;

  @property({type: Object}) config = Object();
  @property({type: String}) mode = 'shell';
  @property({type: String}) theme = 'monokai';
  @property({type: String}) src = '';

  constructor() {
    super();
    this.config = {
      // mode: this.mode,
      // theme: 'monokai',
      tabSize: 2,
      indentUnit: 2,
      cursorScrollMargin: 50,
      lineNumbers: true,
      lineWrapping: true,
      // lineNumberFormatter: (line) => (line % 5 === 0 || line === 1) ? line : '',
      matchBrackets: true,
      styleActiveLine: true,
      viewportMargin: Infinity,
      extraKeys: {},
    };
  }

  firstUpdated() {
    this._initEditor();
  }

  _initEditor() {
    const cm = this.shadowRoot.querySelector('#codemirror-editor');
    if (!cm.__initialized) {
      window.setTimeout(this._initEditor.bind(this), 100);
      return;
    }
    this.editor = cm.__editor;
    Object.assign(this.editor.options, this.config);
    this.refresh();
  }

  refresh() {
    window.setTimeout(() => this.editor.refresh(), 0);
  }

  getValue() {
    this.editor.getValue();
  }

  setValue(val) {
    this.editor.setValue(val);
    this.refresh();
  }

  static get styles() {
    return [
      IronFlex,
      IronFlexAlignment,
      CodemirrorThemeMonokai,
      css`
        .CodeMirror {
          font-size: 15px;
        }
      `,
    ];
  }

  render() {
    return html`
      <wc-codemirror id="codemirror-editor" mode="${this.mode}" theme="monokai" src="${this.src}"></wc-codemirror>
    `;
  }
}
