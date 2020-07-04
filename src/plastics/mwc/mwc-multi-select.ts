/**
 @license
 Copyright 2020 Google Inc. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import {css, customElement} from 'lit-element';
import {SelectBase} from './mwc-multi-select-base';
import {style} from '@material/mwc-select/mwc-select-css.js';

declare global {
  interface HTMLElementTagNameMap {
    'mwc-multi-select': Select;
  }
}

@customElement('mwc-multi-select')
export class Select extends SelectBase {
  static get styles() {
    return [style,
      css`
        .mdc-select__anchor {
          min-width: var(--mdc-select-min-width, 200px);
        }
        .mdc-select--filled {
          min-width: var(--mdc-select-min-width, 200px);
        }
      `];
  }
}
