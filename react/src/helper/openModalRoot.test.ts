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

  // The covered root is `inert`, so a match inside it is unreachable — and it
  // is the one document order reaches first.
  it('prefers the topmost root when a modal covers another', () => {
    const outer = openModal('outer');
    openModal('inner');
    outer.toggleAttribute('inert', true);

    expect(queryWithinOpenModal<HTMLInputElement>('.target')?.value).toBe(
      'inner',
    );
  });
});
