/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';

let OverlayPatchMixn = (superClass) => class extends superClass {
  constructor() {
    super();
  }

  ready() {
    super.ready();
    this.initializeOverlay();
  }

  // Actions to be performed when a dialog with backdrop opens
  _patchIronOverlay(e) {
    const dialog = e.currentTarget;
    let parent = this.parentElement;

    if (dialog.withBackdrop) {
      parent.insertBefore(dialog.backdropElement, this);
      // Attach backdrop element just before the custom element
      // which containing the dialog
/*      if (this.parentNode === this.shadowRoot(this).parentNode) {
        this.shadowRoot(parent).insertBefore(dialog.backdropElement, this);
      } else {
        parent.insertBefore(dialog.backdropElement, this);
      }*/
    }
  }

  initializeOverlay() {
    let nodes = this.shadowRoot.querySelectorAll('paper-dialog');
    [].forEach.call(nodes, (item) => {
      item.addEventListener('iron-overlay-opened', this._patchIronOverlay.bind(this));
      item.addEventListener('iron-overlay-closed', this._removeIronOverlay.bind(this));
    });
  }

  // Actions to be performed when a dialog with backdrop closes
  _removeIronOverlay(e) {
    const dialog = e.currentTarget;
    const body = document.querySelector('body');

    if (dialog.withBackdrop) {
      // Place backdrop element where it originally was (child of body).
      // No need to manually remove backdrop element since
      // it is dealt within paper-dialog element itself.
      body.appendChild(dialog.backdropElement);
    }
  }
};
export const OverlayPatchMixin = dedupingMixin(OverlayPatchMixn);
