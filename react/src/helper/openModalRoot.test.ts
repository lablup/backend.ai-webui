/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/
import { queryWithinOpenModal } from './openModalRoot';
import { afterEach, describe, expect, it } from 'vitest';

const openModal = (fieldValue: string): HTMLElement => {
  const root = document.createElement('div');
  root.setAttribute('data-bai-modal-open', '');
  root.innerHTML = `<input class="target" value="${fieldValue}" />`;
  document.body.appendChild(root);
  return root;
};

describe('queryWithinOpenModal', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns null when no modal is open', () => {
    document.body.innerHTML = '<input class="target" />';
    expect(queryWithinOpenModal('.target')).toBeNull();
  });

  it('scopes the match to the open modal root', () => {
    document.body.innerHTML = '<input class="target" value="page" />';
    openModal('modal');
    expect(queryWithinOpenModal<HTMLInputElement>('.target')?.value).toBe(
      'modal',
    );
  });

  // Document order reaches the covered root first, and it is the one the level
  // stack marked `inert` — its match is unreachable.
  it('skips a covered root when a modal covers another', () => {
    const outer = openModal('outer');
    openModal('inner');
    outer.toggleAttribute('inert', true);

    expect(queryWithinOpenModal<HTMLInputElement>('.target')?.value).toBe(
      'inner',
    );
  });

  // A drawer is a native `<dialog>` the level stack does not track, so nothing
  // inerts the modal it covers — only the ordering separates them.
  it('prefers the last open root when none is inert', () => {
    openModal('first');
    openModal('second');

    expect(queryWithinOpenModal<HTMLInputElement>('.target')?.value).toBe(
      'second',
    );
  });
});
