/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import DeploymentSettingModal from './DeploymentSettingModal';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * Contract tests for the explicit project prop contract (ADR-0001, FR-3410).
 *
 * These tests exercise external behavior only: props in, rendered output and
 * mutation variables out. They intentionally do not assert which hooks the
 * component calls internally.
 */

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: () => new Promise(() => {}),
    },
    ready: true,
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useCurrentDomainValue: () => 'default',
    useWebUINavigate: () => vi.fn(),
  };
});

vi.mock('../hooks/useRouteScope', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useRouteScope')>();
  return {
    ...originalModule,
    useProjectPath: () => (path: string) => `/${path}`,
  };
});

// The in-modal project selector is mocked to a button that reports a fixed
// choice through the same `onSelectProject` surface the real component uses.
// The contract under test is DeploymentSettingModal's (selector rendered or
// not, chosen project reaching the mutation) — not the selector's internals.
vi.mock('./ProjectSelectForAdminPage', async () => {
  const React = await import('react');
  return {
    default: (props: any) =>
      React.createElement(
        'button',
        {
          'data-testid': 'mock-project-select',
          type: 'button',
          onClick: () =>
            props.onSelectProject?.({
              label: 'chosen-project-name',
              value: 'chosen-project-id',
              projectId: 'chosen-project-id',
              projectName: 'chosen-project-name',
              projectResourcePolicy: null,
            }),
        },
        'select-project',
      ),
  };
});

// The resource-group select fetches per-project resource groups internally;
// stub it to a button that commits a fixed choice through the Form.Item
// injected `onChange`.
vi.mock('backend.ai-ui', async (importOriginal) => {
  const React = await import('react');
  const originalModule = await importOriginal<typeof import('backend.ai-ui')>();
  return {
    ...originalModule,
    BAIProjectResourceGroupSelect: (props: any) =>
      React.createElement(
        'button',
        {
          'data-testid': 'mock-resource-group-select',
          type: 'button',
          disabled: props.disabled,
          onClick: () => props.onChange?.('mock-resource-group'),
        },
        'select-resource-group',
      ),
  };
});

const renderModal = (
  project: { id: string; name: string } | null,
  onRequestClose = vi.fn(),
) => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  render(
    <RelayEnvironmentProvider environment={environment}>
      <App>
        <DeploymentSettingModal
          open
          project={project}
          onRequestClose={onRequestClose}
        />
      </App>
    </RelayEnvironmentProvider>,
  );
  return { environment, onRequestClose };
};

const fillRequiredFieldsAndSubmit = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  await user.type(
    screen.getByPlaceholderText('deployment.NamePlaceholder'),
    'contract-deployment',
  );
  await user.click(screen.getByTestId('mock-resource-group-select'));
  await user.click(screen.getByRole('button', { name: 'button.Create' }));
};

describe('DeploymentSettingModal project prop contract (ADR-0001)', () => {
  it('renders no project selector and targets exactly the given project when `project` is non-null', async () => {
    const user = userEvent.setup();
    const { environment } = renderModal({
      id: 'fixed-project-id',
      name: 'fixed-project-name',
    });

    // Fixed mode: the modal must not embed its own project selector.
    expect(screen.queryByTestId('mock-project-select')).not.toBeInTheDocument();

    await fillRequiredFieldsAndSubmit(user);

    await waitFor(() => {
      expect(environment.mock.getAllOperations()).toHaveLength(1);
    });
    const operation = environment.mock.getMostRecentOperation();
    expect(operation.request.node.params.name).toBe(
      'DeploymentSettingModalCreateMutation',
    );
    // The mutation carries exactly the project passed by the page.
    expect(operation.request.variables.input.metadata.projectId).toBe(
      'fixed-project-id',
    );
    expect(operation.request.variables.input.metadata.name).toBe(
      'contract-deployment',
    );
    expect(operation.request.variables.input.metadata.resourceGroupName).toBe(
      'mock-resource-group',
    );
  });

  it('renders a required project selector when `project` is null and blocks submit until a project is chosen', async () => {
    const user = userEvent.setup();
    const { environment } = renderModal(null);

    // Null mode: the modal embeds its own required project selector.
    expect(screen.getByTestId('mock-project-select')).toBeInTheDocument();

    // Submitting without choosing a project fails the required rule and
    // dispatches no mutation.
    await fillRequiredFieldsAndSubmit(user);
    expect(
      await screen.findByText('deployment.TargetProjectRequired'),
    ).toBeInTheDocument();
    expect(environment.mock.getAllOperations()).toHaveLength(0);
  });

  it('targets exactly the project chosen in the in-modal selector when `project` is null', async () => {
    const user = userEvent.setup();
    const { environment } = renderModal(null);

    await user.click(screen.getByTestId('mock-project-select'));
    await fillRequiredFieldsAndSubmit(user);

    await waitFor(() => {
      expect(environment.mock.getAllOperations()).toHaveLength(1);
    });
    const operation = environment.mock.getMostRecentOperation();
    expect(operation.request.node.params.name).toBe(
      'DeploymentSettingModalCreateMutation',
    );
    // The mutation carries exactly the project chosen inside the modal.
    expect(operation.request.variables.input.metadata.projectId).toBe(
      'chosen-project-id',
    );
  });
});
