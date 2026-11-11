/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../../../__test__/matchMedia.mock.js';
import '../../../../__test__/resizeObserver.mock.js';
import ActAsConfirmModal from './ActAsConfirmModal';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BAIUnmountAfterClose } from 'backend.ai-ui';
import { useState } from 'react';

vi.mock('react-i18next', async () => {
  const React = await import('react');
  return {
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
      ready: true,
    }),
    Trans: (props: any) => React.createElement('span', null, props.i18nKey),
    initReactI18next: { type: '3rdParty', init: () => {} },
  };
});

type Target = { userId: string; email: string; name: string };
const USER_A: Target = { userId: 'a', email: 'a@example.com', name: 'A' };
const USER_B: Target = { userId: 'b', email: 'b@example.com', name: 'B' };

// Renders through BAIUnmountAfterClose, as AdminUserManagement does.
const Harness = () => {
  const [target, setTarget] = useState<Target | null>(null);
  return (
    <>
      <button onClick={() => setTarget(USER_A)}>open-a</button>
      <button onClick={() => setTarget(USER_B)}>open-b</button>
      <BAIUnmountAfterClose>
        <ActAsConfirmModal
          open={!!target}
          target={target}
          onRequestClose={() => setTarget(null)}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

describe('ActAsConfirmModal', () => {
  it('opens for the chosen user', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'open-a' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('actAs.ConfirmDescription')).toBeInTheDocument();
  });

  it('does not carry the Debug mode choice over to the next user', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'open-a' }));
    const debugA = await screen.findByRole('checkbox', {
      name: 'actAs.DebugMode',
    });
    await user.click(debugA);
    expect(debugA).toBeChecked();

    await user.click(screen.getByRole('button', { name: 'button.Cancel' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'open-b' }));
    expect(
      await screen.findByRole('checkbox', { name: 'actAs.DebugMode' }),
    ).not.toBeChecked();
  });

  // A reopen within the exit transition keeps the modal mounted, as a direct
  // target switch does; jsdom finishes the transition at once, so test the switch.
  it('resets the Debug mode choice when the target changes while mounted', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'open-a' }));
    await user.click(
      await screen.findByRole('checkbox', { name: 'actAs.DebugMode' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'open-b', hidden: true }),
    );

    expect(
      await screen.findByRole('checkbox', { name: 'actAs.DebugMode' }),
    ).not.toBeChecked();
  });
});
