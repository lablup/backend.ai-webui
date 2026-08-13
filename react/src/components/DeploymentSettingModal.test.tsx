/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import DeploymentSettingModal from './DeploymentSettingModal';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

// `ProjectSelectForAdminPage` is deliberately NOT mocked: the modal must not
// render any project selector at all, and a missing mock would surface as a
// real (suspending) component rather than a silently passing assertion.

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
          // Surfaced so a test can assert which project scopes the options.
          'data-project-name': props.projectName,
          onClick: () => props.onChange?.('mock-resource-group'),
        },
        'select-resource-group',
      ),
  };
});

const renderModal = (
  project: { id: string; name: string },
  onRequestClose = vi.fn(),
) => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  render(
    <RelayEnvironmentProvider environment={environment}>
      <>
        <DeploymentSettingModal
          open
          project={project}
          onRequestClose={onRequestClose}
        />
      </>
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

  it('scopes the resource-group options to the given project', async () => {
    renderModal({
      id: 'fixed-project-id',
      name: 'fixed-project-name',
    });

    expect(screen.getByTestId('mock-resource-group-select')).toHaveAttribute(
      'data-project-name',
      'fixed-project-name',
    );
  });
});
