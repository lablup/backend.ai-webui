/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import type { InvitationItem } from '../hooks/useVFolderInvitations';
import FolderInvitationResponseModal from './FolderInvitationResponseModal';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

/**
 * #10329: an invitation shows the share's own permission cap, in the share
 * permission selector's words, and names an unknown user or the folder id
 * when the caller may not read the sharer or the folder. `t` is
 * identity-mapped (for BUI's `useBAIi18n` too), so assertions read as keys.
 */

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
    ready: true,
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('../app-shim', () => ({
  App: { useApp: () => ({ message: { success: vi.fn(), error: vi.fn() } }) },
}));

vi.mock('../hooks/useBAINotification', () => ({
  useSetBAINotification: () => ({ upsertNotification: vi.fn() }),
}));

const { invitations } = vi.hoisted(() => ({
  invitations: [] as Array<InvitationItem>,
}));

vi.mock('../hooks/useVFolderInvitations', () => ({
  useVFolderInvitations: () => [
    invitations,
    {
      acceptInvitation: vi.fn(),
      rejectInvitation: vi.fn(),
      updateInvitations: vi.fn(),
    },
  ],
}));

const invitation = (overrides: Partial<InvitationItem>): InvitationItem => ({
  id: 'share-1',
  vfolderId: 'vf-1',
  vfolderName: 'data',
  sharerEmail: 'admin@example.com',
  permissions: ['READ'],
  createdAt: '2026-10-19T00:00:00Z',
  ...overrides,
});

describe('FolderInvitationResponseModal (#10329)', () => {
  beforeEach(() => {
    invitations.length = 0;
  });

  it('shows the share cap under the folder share permission label, not the mount permission', () => {
    invitations.push(
      invitation({
        permissions: ['READ', 'UPDATE', 'CREATE', 'SOFT_DELETE', 'HARD_DELETE'],
      }),
    );
    render(<FolderInvitationResponseModal open />);

    // The folder name is a labeled line like the rest, not an icon heading.
    expect(screen.getByText('data.Foldername')).toBeInTheDocument();
    expect(screen.getByText('data')).toBeInTheDocument();
    expect(
      screen.getByText('data.folders.FolderSharePermission'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('comp:BAIEntitySharePermissionSelector.FullAccess'),
    ).toBeInTheDocument();
    expect(screen.queryByText('data.Permission')).not.toBeInTheDocument();
    expect(screen.queryByText('data.ReadOnly')).not.toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  });

  it('names an unknown user when the caller may not read the sharer', () => {
    invitations.push(
      invitation({ id: 'share-2', sharerEmail: null, permissions: ['READ'] }),
    );
    render(<FolderInvitationResponseModal open />);

    expect(screen.getByText('data.invitation.UnknownUser')).toBeInTheDocument();
    expect(
      screen.getByText('comp:BAIEntitySharePermissionSelector.ReadOnly'),
    ).toBeInTheDocument();
  });

  it('names the folder by its id when the caller may not read it', () => {
    invitations.push(invitation({ id: 'share-3', vfolderName: null }));
    render(<FolderInvitationResponseModal open />);

    expect(screen.getByText('vf-1')).toBeInTheDocument();
  });
});
