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

  initializeOverlay() {
    let nodes = this.shadowRoot.querySelectorAll('paper-dialog[with-backdrop]');
    [].forEach.call(nodes, (item) => {
      item.addEventListener('opened-changed', this._patchDialogBackdrop.bind(this));
    });
  }

  _patchDialogBackdrop(e) {
    const opened = e.detail.value || false;
    const dialog = e.currentTarget;

    if (!dialog.withBackdrop) return;
    if (opened) {
      // Attach backdrop element just before the iron-pages (#app-page).
      const appPage = this.closest('#app-page');
      appPage.parentElement.insertBefore(dialog.backdropElement, appPage);
    } else {
      const body = document.querySelector('body');
      body.appendChild(dialog.backdropElement);
    }
  }
};

export const OverlayPatchMixin = dedupingMixin(OverlayPatchMixn);
