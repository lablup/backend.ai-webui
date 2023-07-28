/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Style preference for leading underscores.
// tslint:disable:strip-private-property-underscore

import {css} from 'lit';
import {customElement} from 'lit/decorators.js';

import {SnackbarBase} from '@material/mwc-snackbar/mwc-snackbar-base.js';
import {styles} from '@material/mwc-snackbar/mwc-snackbar.css.js';

declare global {
  interface HTMLElementTagNameMap {
    'mwc-snackbar': Snackbar;
  }
}

@customElement('mwc-snackbar')
export class Snackbar extends SnackbarBase {
  static override styles = [styles,
    css`
    .mdc-snackbar {
      position: fixed;
      bottom: var(--mdc-snackbar-bottom, 20px);
    }
    .mdc-snackbar__surface {
      position:absolute;
      right: 20px;
    }
  `];
}
