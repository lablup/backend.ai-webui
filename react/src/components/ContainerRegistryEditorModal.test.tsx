/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/resizeObserver.mock.js';
import ContainerRegistryEditorModal from './ContainerRegistryEditorModal';
import '@testing-library/jest-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps, Suspense } from 'react';
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

const renderModal = (
  props: Partial<ComponentProps<typeof ContainerRegistryEditorModal>> = {},
) => {
  const environment = createMockEnvironment();
  const onOk = vi.fn();
  render(
    <RelayEnvironmentProvider environment={environment}>
      {/* Without an outer boundary (the app always has one) React would delay
          the commit instead of hiding — and thereby resetting — the form. */}
      <Suspense fallback={null}>
        <ContainerRegistryEditorModal
          open
          onOk={onOk}
          onCancel={vi.fn()}
          {...props}
        />
      </Suspense>
    </RelayEnvironmentProvider>,
  );
  return { environment, onOk };
};

const PREFILL = {
  registry_name: 'nvcr.io',
  url: 'https://nvcr.io',
  project: 'nvidia',
  type: 'docker',
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

describe('ContainerRegistryEditorModal (FR-3939)', () => {
  beforeEach(() => {
    projectsSettled = false;
    projectsPromise = new Promise<void>((res) => {
      resolveProjects = () => {
        projectsSettled = true;
        res();
      };
    });
  });

  it('pre-fills the create form from initialValues and stays in create mode', () => {
    renderModal({ initialValues: PREFILL });

    const registryName = screen.getByLabelText('registry.RegistryName');
    expect(registryName).toHaveValue('nvcr.io');
    expect(registryName).toBeEnabled();
    expect(screen.getByLabelText('registry.RegistryURL')).toHaveValue(
      'https://nvcr.io',
    );
    expect(screen.getByLabelText('registry.ProjectName')).toHaveValue('nvidia');

    expect(screen.getByText('registry.AddRegistry')).toBeInTheDocument();
    expect(screen.queryByText('registry.ModifyRegistry')).toBeNull();
    // The "change password" checkbox only exists in modify mode.
    expect(screen.queryByLabelText('webui.menu.ChangePassword')).toBeNull();
  });

  it('hands the created registry to onOk after a successful create', async () => {
    const user = userEvent.setup();
    const { environment, onOk } = renderModal({ initialValues: PREFILL });

    await user.click(screen.getByRole('button', { name: 'button.Add' }));
    await waitFor(() =>
      expect(environment.mock.getAllOperations()).toHaveLength(1),
    );

    const createdRegistry = {
      id: 'container-registry-global-id',
      row_id: 'container-registry-row-id',
      registry_name: 'nvcr.io',
      project: 'nvidia',
      url: 'https://nvcr.io',
      type: 'docker',
    };
    act(() => {
      environment.mock.resolveMostRecentOperation({
        data: {
          create_container_registry_node_v2: {
            container_registry: createdRegistry,
          },
        },
      });
    });

    await waitFor(() =>
      expect(onOk).toHaveBeenCalledWith('create', createdRegistry),
    );
  });
});
