/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import VFolderTable from './VFolderTable';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { MemoryRouter } from 'react-router-dom';
import { createMockEnvironment } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * FR-2526: the folder-name cell is a file-browser entry point, so it must stop
 * navigating while the form that owns the table has a submit in flight.
 */

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

const MOUNTABLE_HOST = 'local:volume1';

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({
      _config: { accessKey: 'AKIATEST', domainName: 'default' },
    }),
  };
});

vi.mock('../hooks/hooksUsingRelay', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/hooksUsingRelay')>();
  return {
    ...originalModule,
    useKeyPairLazyLoadQuery: () => [{ resource_policy: 'default' }, vi.fn()],
  };
});

vi.mock('../hooks/useCurrentProject', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useCurrentProject')>();
  return {
    ...originalModule,
    useCurrentProjectValue: () => ({
      id: 'test-project-id',
      name: 'test-project-name',
    }),
  };
});

// The folder list is REST-backed; serve it directly instead of a signed request.
vi.mock('../hooks/reactQueryAlias', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/reactQueryAlias')>();
  return {
    ...originalModule,
    useSuspenseTanQuery: () => ({
      data: [
        {
          id: 'folder-id-1',
          name: 'my-model-folder',
          host: MOUNTABLE_HOST,
          status: 'ready',
          usage_mode: 'model',
          ownership_type: 'user',
          permission: 'rw',
          type: 'user',
        },
      ],
    }),
  };
});

vi.mock('./FolderExplorerOpener', () => ({
  useFolderExplorerOpener: () => ({
    open: vi.fn(),
    generateFolderPath: (id: string) => `/folder/${id}`,
  }),
}));

vi.mock('./FolderCreateModalV2', () => ({ default: () => null }));

const renderTable = (isFolderLinkDisabled: boolean) => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  const allowedHosts = JSON.stringify({
    [MOUNTABLE_HOST]: ['mount-in-session'],
  });
  environment.mock.queueOperationResolver(() => ({
    data: {
      domain: { allowed_vfolder_hosts: allowedHosts },
      group: { allowed_vfolder_hosts: allowedHosts },
      keypair_resource_policy: { allowed_vfolder_hosts: allowedHosts },
    },
  }));

  return render(
    <MemoryRouter>
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback={null}>
          <VFolderTable
            rowKey="id"
            isFolderLinkDisabled={isFolderLinkDisabled}
          />
        </Suspense>
      </RelayEnvironmentProvider>
    </MemoryRouter>,
  );
};

describe('VFolderTable folder-link gate (FR-2526)', () => {
  it('links the folder name to the folder explorer by default', async () => {
    renderTable(false);

    const link = await screen.findByRole('link', { name: 'my-model-folder' });
    expect(link).toHaveAttribute('href');
    expect(link).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('renders the folder name as a non-navigating link while disabled', async () => {
    renderTable(true);

    const name = await screen.findByText('my-model-folder');
    // No destination at all: the file browser cannot be reached from the cell.
    expect(screen.queryByRole('link', { name: 'my-model-folder' })).toBeNull();
    expect(name.closest('[aria-disabled="true"]')).not.toBeNull();
  });
});
