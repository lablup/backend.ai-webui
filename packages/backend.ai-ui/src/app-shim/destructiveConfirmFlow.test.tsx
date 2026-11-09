/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 to-astryx ticket 11 — destructive-action regression smoke.

 The acceptance criterion asks for an e2e pass over a typed-confirm
 destructive flow, but every such flow in the app sits behind a live
 Backend.AI cluster (vfolder delete-forever, endpoint terminate, user purge).
 RECORDED SUBSTITUTION: this RTL test reproduces the exact post-ticket-11
 wiring of those call sites — `BAIDeleteConfirmModal` (the shipped
 typed-confirmation component, per answers/07 §2 the real successor of the
 `BAIConfirmModalWithInput` rule example) rendered inside `BAIAppProvider`,
 with an `onOk` that reports through the shim's `message.success` the way
 DeleteForeverVFolderModalV2 and friends do after the codemod.

 Asserts the two things ticket 11 could have regressed:
 1. the typed-confirm gate (OK disabled until the exact string is typed)
    still works with the shim mounted around it, and
 2. the confirmed action's feedback flows through the Astryx-backed shim
    (a real toast renders in the LayerProvider viewport — no antd <App>
    context anywhere in the tree).
*/
import BAIDeleteConfirmModal from '../components/BAIDeleteConfirmModal';
import { BAIAppProvider, message } from './index';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('typed-confirm destructive flow through the app-shim', () => {
  it('gates OK on the exact confirm string and reports success via the shim toast', async () => {
    const user = userEvent.setup();
    const handleOk = vi.fn(() => {
      // What converted call sites do after the ticket-11 import swap.
      message.success('Folder deleted.');
    });

    render(
      <BAIAppProvider>
        <BAIDeleteConfirmModal
          open
          items={[{ key: 'vf-1', label: 'my-folder' }]}
          requireConfirmInput
          onOk={handleOk}
          onCancel={vi.fn()}
        />
      </BAIAppProvider>,
    );

    const okButton = screen.getByRole('button', { name: /delete/i });
    expect(okButton).toBeDisabled();

    const input = screen.getByRole('textbox');
    await user.type(input, 'wrong-name');
    expect(okButton).toBeDisabled();

    await user.clear(input);
    await user.type(input, 'my-folder');
    expect(okButton).toBeEnabled();

    await user.click(okButton);
    expect(handleOk).toHaveBeenCalledTimes(1);

    // The success toast is rendered by the shim's Astryx viewport (the text
    // appears both in the toast body and in the a11y live region, hence All).
    const toasts = await screen.findAllByText('Folder deleted.');
    expect(toasts.length).toBeGreaterThan(0);
  });
});
