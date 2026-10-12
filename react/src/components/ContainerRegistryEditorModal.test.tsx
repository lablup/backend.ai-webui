/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/resizeObserver.mock.js';
import type { ContainerRegistryEditorModalTestQuery } from '../__generated__/ContainerRegistryEditorModalTestQuery.graphql';
import ContainerRegistryEditorModal from './ContainerRegistryEditorModal';
import '@testing-library/jest-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps, Suspense } from 'react';
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

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
      isManagerVersionCompatibleWith: () => false,
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

// The Extra Information editor needs the host ThemeModeProvider.
vi.mock('./BAICodeEditor', async () => {
  const React = await import('react');
  return { default: () => React.createElement('div') };
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

const REGISTRY_NODE = {
  id: 'container-registry-global-id',
  row_id: 'container-registry-row-id',
  name: 'nvcr.io',
  registry_name: 'nvcr.io',
  url: 'https://nvcr.io',
  type: 'docker',
  project: 'nvidia',
  username: 'ngc-user',
  ssl_verify: true,
  extra: null,
  is_global: true,
  allowed_groups: null,
};

const ModifyModeModal = ({ onOk }: { onOk: (...args: Array<any>) => void }) => {
  const data = useLazyLoadQuery<ContainerRegistryEditorModalTestQuery>(
    graphql`
      query ContainerRegistryEditorModalTestQuery($id: String!)
      @relay_test_operation {
        container_registry_node(id: $id) {
          ...ContainerRegistryEditorModalFragment
        }
      }
    `,
    { id: REGISTRY_NODE.row_id },
  );
  if (!data.container_registry_node) return null;
  return (
    <ContainerRegistryEditorModal
      open
      containerRegistryFrgmt={data.container_registry_node}
      onOk={onOk}
      onCancel={vi.fn()}
    />
  );
};

describe('ContainerRegistryEditorModal modify mode (FR-3939)', () => {
  it('hands onOk only the result fields, never the mutation payload itself', async () => {
    const user = userEvent.setup();
    const environment = createMockEnvironment();
    const onOk = vi.fn();

    render(
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback={null}>
          <ModifyModeModal onOk={onOk} />
        </Suspense>
      </RelayEnvironmentProvider>,
    );

    act(() => {
      environment.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation, {
          ContainerRegistryNode: () => REGISTRY_NODE,
        }),
      );
    });

    await screen.findByText('registry.ModifyRegistry');
    await user.click(screen.getByRole('button', { name: 'button.Save' }));
    await waitFor(() =>
      expect(environment.mock.getAllOperations()).toHaveLength(1),
    );

    act(() => {
      environment.mock.resolveMostRecentOperation({
        data: {
          modify_container_registry_node_v2: {
            container_registry: {
              ...REGISTRY_NODE,
              // The payload the manager actually returns carries form-only
              // fields the callback must not forward.
              password: 'super-secret',
            },
          },
        },
      });
    });

    await waitFor(() =>
      expect(onOk).toHaveBeenCalledWith('modify', {
        id: REGISTRY_NODE.id,
        row_id: REGISTRY_NODE.row_id,
        registry_name: REGISTRY_NODE.registry_name,
        project: REGISTRY_NODE.project,
        url: REGISTRY_NODE.url,
        type: REGISTRY_NODE.type,
      }),
    );

    const projected = onOk.mock.calls[0][1];
    expect(projected).not.toHaveProperty('password');
    expect(projected).not.toHaveProperty('name');
    expect(projected).not.toHaveProperty('ssl_verify');
  });
});
