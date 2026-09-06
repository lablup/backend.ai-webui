/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/resizeObserver.mock.js';
import ContainerRegistryEditorModal from './ContainerRegistryEditorModal';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment } from 'relay-test-utils';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
    ready: true,
  }),
  // BUI's locale module runs `i18n.use(initReactI18next).init()` on import.
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({
      _config: { domainName: 'default' },
      supports: () => false,
    }),
  };
});

// The real select fetches with network-only, so it always suspends on mount;
// this stand-in does the same until the test resolves it.
let resolveProjects: () => void;
let projectsPromise: Promise<void>;
let projectsSettled = false;
vi.mock('./ProjectSelectForAdminPage', async () => {
  const React = await import('react');
  return {
    default: () => {
      if (!projectsSettled) throw projectsPromise;
      return React.createElement('input', {
        'data-testid': 'allowed-projects-select',
      });
    },
  };
});

const renderModal = () => {
  render(
    <RelayEnvironmentProvider environment={createMockEnvironment()}>
      {/* Without an outer boundary (the app always has one) React would delay
          the commit instead of hiding — and thereby resetting — the form. */}
      <Suspense fallback={null}>
        <ContainerRegistryEditorModal open onOk={vi.fn()} onCancel={vi.fn()} />
      </Suspense>
    </RelayEnvironmentProvider>,
  );
};

const sslCheckbox = () =>
  screen.getByLabelText('registry.SSLVerifyDescription');
const globalCheckbox = () =>
  screen.getByLabelText('registry.IsGlobalDescription');

describe('ContainerRegistryEditorModal (FR-3705)', () => {
  beforeEach(() => {
    projectsSettled = false;
    projectsPromise = new Promise<void>((res) => {
      resolveProjects = () => {
        projectsSettled = true;
        res();
      };
    });
  });

  it('unchecking "Set as global registry" keeps SSL verification unchecked across the project-select suspension', async () => {
    const user = userEvent.setup();
    renderModal();

    expect(sslCheckbox()).toBeChecked();
    expect(globalCheckbox()).toBeChecked();

    await user.click(sslCheckbox());
    expect(sslCheckbox()).not.toBeChecked();

    // The Suspense boundary must sit inside the form — engine contract 30.
    await user.click(globalCheckbox());
    resolveProjects();
    await screen.findByTestId('allowed-projects-select');

    expect(globalCheckbox()).not.toBeChecked();
    expect(sslCheckbox()).not.toBeChecked();
  });
});
