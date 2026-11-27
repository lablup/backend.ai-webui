/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import SessionLauncherAgentPrefillNotice from './SessionLauncherAgentPrefillNotice';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

const renderAt = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <SessionLauncherAgentPrefillNotice />
    </MemoryRouter>,
  );

const NOTICE = 'session-launcher-agent-prefill-notice';

describe('SessionLauncherAgentPrefillNotice', () => {
  it('shows on a launcher opened by bai_prepare_session', () => {
    renderAt(
      '/project/default/session/start?step=4&formValues=%7B%7D&agentPrefill=abcd1234',
    );
    expect(screen.getByTestId(NOTICE)).toHaveTextContent(
      'session.launcher.AgentPrefilledTitle',
    );
  });

  it('stays hidden on a launcher the user opened, even with formValues', () => {
    renderAt(
      '/project/default/session/start?formValues=%7B%22sessionName%22%3A%22x%22%7D',
    );
    expect(screen.queryByTestId(NOTICE)).not.toBeInTheDocument();
  });

  it('can be dismissed', async () => {
    renderAt('/project/default/session/start?agentPrefill=abcd1234');
    await userEvent.click(
      screen.getByRole('button', { name: /dismiss|close/i }),
    );
    expect(screen.queryByTestId(NOTICE)).not.toBeInTheDocument();
  });
});
