/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import ContainerRegistryEditorModal from './ContainerRegistryEditorModal';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment } from 'relay-test-utils';

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

/**
 * Stand-in for the real project select, which fetches with
 * `network-only` and therefore ALWAYS suspends on mount. The mock
 * reproduces exactly that: suspend until the test resolves it.
 */
let projectsDeferred: { promise: Promise<void>; resolve: () => void } | null =
  null;
let projectsSettled = false;
vi.mock('./ProjectSelectForAdminPage', async () => {
  const React = await import('react');
  return {
    default: () => {
      if (!projectsSettled) {
        if (!projectsDeferred) {
          let resolve!: () => void;
          const promise = new Promise<void>((res) => {
            resolve = () => {
              projectsSettled = true;
              res();
            };
          });
          projectsDeferred = { promise, resolve };
        }
        throw projectsDeferred.promise;
      }
      return React.createElement('input', {
        'data-testid': 'allowed-projects-select',
      });
    },
  };
});

const renderModal = () => {
  render(
    <RelayEnvironmentProvider environment={createMockEnvironment()}>
      {/* The app always has a Suspense boundary above the modal; without
          one here React would simply delay the commit instead of hiding
          (and thereby resetting) the form. */}
      <React.Suspense fallback={<div data-testid="page-fallback" />}>
        <ContainerRegistryEditorModal open onOk={vi.fn()} onCancel={vi.fn()} />
      </React.Suspense>
    </RelayEnvironmentProvider>,
  );
};

const sslCheckbox = () =>
  screen.getByLabelText('registry.SSLVerifyDescription');
const globalCheckbox = () =>
  screen.getByLabelText('registry.IsGlobalDescription');

describe('ContainerRegistryEditorModal (FR-3705)', () => {
  beforeEach(() => {
    projectsDeferred = null;
    projectsSettled = false;
  });

  it('unchecking "Set as global registry" keeps SSL verification unchecked across the project-select suspension', async () => {
    const user = userEvent.setup();
    renderModal();

    // Both default to checked in the Add flow.
    expect(sslCheckbox()).toBeChecked();
    expect(globalCheckbox()).toBeChecked();

    await user.click(sslCheckbox());
    expect(sslCheckbox()).not.toBeChecked();

    // Unchecking is_global mounts the allowed-projects select, which
    // suspends. The Suspense boundary must sit INSIDE the form: if the
    // suspension bubbles above it, every preserve={false} field is
    // unregistered by the hide/show cycle and reset to its initial value.
    await user.click(globalCheckbox());
    await waitFor(() => expect(projectsDeferred).not.toBeNull());
    projectsDeferred!.resolve();
    await screen.findByTestId('allowed-projects-select');

    expect(globalCheckbox()).not.toBeChecked();
    expect(sslCheckbox()).not.toBeChecked();
  });
});
