/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */
import {css, customElement, html, LitElement, property} from "lit-element";

import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

<<<<<<< HEAD
import {CodemirrorStyle} from '../lib/codemirror/lib/codemirror.css.js';
import {CodemirrorThemeMonokai} from '../lib/codemirror/theme/monokai.css.js';
import '../lib/codemirror/mode/python/python.js';
=======
import '@vanillawc/wc-codemirror/index';
import '@vanillawc/wc-codemirror/mode/python/python';
import '@vanillawc/wc-codemirror/mode/shell/shell';
import {CodemirrorThemeMonokai} from '../lib/codemirror/theme/monokai.css.js';
>>>>>>> master

declare const window: any;


@customElement('lablup-codemirror')
export default class LablupCodemirror extends LitElement {
  public shadowRoot: any; // ShadowRoot
  public editor: any;

<<<<<<< HEAD
  @property({type: Object}) config = {};
=======
  @property({type: Object}) config = Object();
  @property({type: String}) mode = 'shell';
  @property({type: String}) theme = 'monokai';
  @property({type: String}) src = '';
>>>>>>> master

  constructor() {
    super();
    this.config = {
<<<<<<< HEAD
      mode: 'python',
      theme: 'monokai',
=======
      // mode: this.mode,
      // theme: 'monokai',
>>>>>>> master
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
<<<<<<< HEAD
    const textarea: HTMLTextAreaElement = this.shadowRoot.querySelector('textarea') as HTMLTextAreaElement;
    this.editor = window.CodeMirror.fromTextArea(textarea, this.config);
=======
    const cm = this.shadowRoot.querySelector('#codemirror-editor');
    if (!cm.__initialized) {
      window.setTimeout(this._initEditor.bind(this), 100);
      return;
    }
    this.editor = cm.__editor;
    Object.assign(this.editor.options, this.config);
>>>>>>> master
    this.refresh();
  }

  refresh() {
<<<<<<< HEAD
    window.setTimeout(() => this.editor.refresh(), 0);
=======
    window.setTimeout(() => this.editor.refresh(), 100);
>>>>>>> master
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
<<<<<<< HEAD
      CodemirrorStyle,
      CodemirrorThemeMonokai,
      css`
      .CodeMirror {
        /* font-size: 15px; */
      }
=======
      CodemirrorThemeMonokai,
      css`
        .CodeMirror {
          height: auto;
          font-size: 15px;
        }
>>>>>>> master
      `,
    ];
  }

  render() {
    return html`
<<<<<<< HEAD
      <textarea></textarea>
=======
      <wc-codemirror id="codemirror-editor" mode="${this.mode}" theme="monokai" src="${this.src}"></wc-codemirror>
>>>>>>> master
    `;
  }
}
