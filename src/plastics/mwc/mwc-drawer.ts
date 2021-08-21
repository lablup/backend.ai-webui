/**
 @license
 Copyright 2015-2021 Lablup Inc.

 Original code by 2018 Google Inc. All Rights Reserved.

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

import {DrawerBase} from '@material/mwc-drawer/mwc-drawer-base';
import {styles} from '@material/mwc-drawer/mwc-drawer.css';

declare global {
  interface HTMLElementTagNameMap {
    'mwc-drawer': Drawer;
  }
}

@customElement('mwc-drawer')
export class Drawer extends DrawerBase {
  static get styles() {
    return [styles,
      css`
    .mdc-drawer {
      background-color: var(--mdc-drawer-background-color, '#ffffff');
      width: var(--mdc-drawer-width, 256px);
      border-left: var(--mdc-drawer-border-left, 1px solid rgba(0,0,0,0.12));
      border-right:var(--mdc-drawer-border-right, 1px solid rgba(0,0,0,0.12));
    }
    .mdc-drawer.mdc-drawer--open:not(.mdc-drawer--closing) + .mdc-drawer-app-content {
      margin-left: var(--mdc-drawer-width, 256px)!important;
      width: calc(100% - var(--mdc-drawer-width, 256px));
    }`];
  }
}
