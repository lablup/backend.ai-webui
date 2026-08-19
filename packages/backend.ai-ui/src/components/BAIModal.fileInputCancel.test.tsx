/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 FR-3579 — a file chooser's dismissal must not close the modal around it.

 `<input type="file">` fires a BUBBLING `cancel` when the user dismisses the
 chooser, and Astryx `Dialog` reads any `cancel` reaching its `<dialog>` as its
 own close request — there is no `target === currentTarget` guard upstream, so
 the modal went down with the chooser.
*/
import BAIModal from './BAIModal';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('BAIModal and a file input inside it', () => {
  it('stays open when a descendant file input reports a cancelled chooser', () => {
    const handleCancel = vi.fn();

    render(
      <BAIModal open title="Upload" onCancel={handleCancel}>
        <input type="file" data-testid="picker" />
      </BAIModal>,
    );

    const picker = screen.getByTestId('picker');
    picker.dispatchEvent(new Event('cancel', { bubbles: true }));

    expect(handleCancel).not.toHaveBeenCalled();
  });

  it('still lets the modal be dismissed the normal way', async () => {
    const handleCancel = vi.fn();

    render(
      <BAIModal open title="Upload" onCancel={handleCancel}>
        <input type="file" data-testid="picker" />
      </BAIModal>,
    );

    // The header close button is the modal's own dismissal path; it must be
    // unaffected by the guard on the body.
    const close = screen.getByRole('button', { name: /close/i });
    close.click();

    expect(handleCancel).toHaveBeenCalled();
  });
});
