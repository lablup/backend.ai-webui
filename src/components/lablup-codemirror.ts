/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */
import {css, CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

import '@vanillawc/wc-codemirror/index';
import '@vanillawc/wc-codemirror/mode/python/python';
import '@vanillawc/wc-codemirror/mode/shell/shell';
import '@vanillawc/wc-codemirror/mode/yaml/yaml';
import '@material/mwc-icon';
import {CodemirrorThemeMonokai} from '../lib/codemirror/theme/monokai.css';
import {CodemirrorBaseStyle} from '../lib/codemirror/base-style.css';
import {WCCodeMirror} from '@vanillawc/wc-codemirror/index';
import {BackendAiStyles} from './backend-ai-general-styles';

/**
 Lablup Codemirror

 `lablup-codemirror` is wc-codemirror editor.

 Example:

 <lablup-codemirror></lablup-codemirror>

@group Backend.AI Web UI
 @element lablup-codemirror
 */


@customElement('lablup-codemirror')
export default class LablupCodemirror extends LitElement {
  public editor: any;

  @property({type: Object}) config = Object();
  @property({type: String}) mode = 'shell';
  @property({type: String}) theme = 'monokai';
  @property({type: String}) src = '';
  @property({type: Boolean}) readonly = false;
  @property({type: Boolean}) useLineWrapping = false;
  @property({type: Boolean}) required = false;
  @property({type: String}) helperText = '';
  @property({type: String}) helperTextIcon = 'warning';
  @query('#helper-text') helperTextEl!: HTMLDivElement;
  @query('#codemirror-editor') editorEl!: WCCodeMirror;

  constructor() {
    super();
    this.config = {
      // mode: this.mode,
      // theme: 'monokai',
      tabSize: 2,
      indentUnit: 2,
      cursorScrollMargin: 50,
      lineNumbers: true,
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

  /**
   * Initialize codemirror editor.
   * */
  _initEditor() {
    if (!this.editorEl.__initialized) {
      setTimeout(this._initEditor.bind(this), 100);
      return;
    }
    this.editor = this.editorEl.editor;
    Object.assign(this.editor.options, this.config);
    this.editor.setOption('lineWrapping', this.useLineWrapping); // works only in here
    this.refresh();
  }

  /**
   * Refresh the editor.
   * */
  refresh() {
    globalThis.setTimeout(() => this.editor.refresh(), 100);
  }

  /**
   * Give the editor focus
   * */
  focus() {
    globalThis.setTimeout(() => {
      // Set the cursor at the end of existing content
      this.editor.execCommand('goDocEnd');
      this.editor.focus();
      this.refresh();
    }, 100);
  }

  /**
   * Get the editor's contents.
   *
   * @return {string} Editor's contents
   * */
  getValue() {
    return this.editor.getValue();
  }

  /**
   * Set the editor's contents and then refresh.
   *
   * @param {string} val - content to update editor
   * */
  setValue(val) {
    this.editor.setValue(val);
    this.refresh();
  }

  _validateInput() {
    if (this.required) {
      if (this.getValue() === '') {
        this.helperTextEl.style.display = 'flex';
        this.editorEl.style.border = '2px solid red';
        return false;
      } else {
        this.helperTextEl.style.display = 'none';
        this.editorEl.style.border = 'none';
      }
    }
    return true;
  }

  static get styles(): CSSResultGroup | undefined {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      CodemirrorThemeMonokai,
      CodemirrorBaseStyle,
      // language=CSS
      css`
        .CodeMirror {
          height: auto !important;
          font-size: 15px;
        }

        #helper-text {
          font-size: var(--helper-text-font-size, 12px);
          color: var(--helper-text-color, var(--general-warning-text));
          width: var(--helper-text-width, 100%);
          font-weight: var(--helper-text-font-weight, bold);
        }

        #helper-text mwc-icon {
          font-size: var(--helper-text-font-size, 12px);
          margin-right: 2px;
        }
      `,
    ];
  }

  render() {
    // language=HTML
    return html`
      <div>
        <wc-codemirror id="codemirror-editor" mode="${this.mode}" theme="monokai" ?readonly="${this.readonly}" @input="${() => this._validateInput()}">
          <link rel="stylesheet" href="node_modules/@vanillawc/wc-codemirror/theme/monokai.css">
        </wc-codemirror>
        <div id="helper-text" class="horizontal layout center" style="display:none;">
          <mwc-icon>${this.helperTextIcon}</mwc-icon>
          <span>${this.helperText}</span>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lablup-codemirror': LablupCodemirror;
  }
}
