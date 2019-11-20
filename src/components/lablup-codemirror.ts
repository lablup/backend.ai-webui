/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */
import {css, customElement, html, LitElement, property} from "lit-element";

import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

import {CodemirrorStyle} from '../lib/codemirror/lib/codemirror.css.js';
import {CodemirrorThemeMonokai} from '../lib/codemirror/theme/monokai.css.js';
import '../lib/codemirror/mode/python/python.js';

declare const window: any;


@customElement('lablup-codemirror')
export default class LablupCodemirror extends LitElement {
  public shadowRoot: any; // ShadowRoot
  public editor: any;

  @property({type: Object}) config = {};

  constructor() {
    super();
    this.config = {
      mode: 'python',
      theme: 'monokai',
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
    const textarea: HTMLTextAreaElement = this.shadowRoot.querySelector('textarea') as HTMLTextAreaElement;
    this.editor = window.CodeMirror.fromTextArea(textarea, this.config);
    this.refresh();
  }

  refresh() {
    window.setTimeout(() => this.editor.refresh(), 0);
  }

  getValue() {
    return this.editor.getValue();
  }

  setValue(val) {
    this.editor.setValue(val);
    this.refresh();
  }

  static get styles() {
    return [
      IronFlex,
      IronFlexAlignment,
      CodemirrorStyle,
      CodemirrorThemeMonokai,
      css`
      .CodeMirror {
        /* font-size: 15px; */
      }
      `,
    ];
  }

  render() {
    return html`
      <textarea></textarea>
    `;
  }
}
