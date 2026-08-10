/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import AllResourceGroupSelect from './AllResourceGroupSelect';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment } from 'relay-test-utils';

// antd Select relies on @rc-component/resize-observer, which needs a
// ResizeObserver implementation that jsdom does not provide.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = globalThis.ResizeObserver ?? ResizeObserverMock;

const renderWithEnvironment = (ui: React.ReactElement) => {
  const environment = createMockEnvironment();
  const result = render(
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback="loading...">{ui}</Suspense>
    </RelayEnvironmentProvider>,
  );
  return { environment, ...result };
};

const resolveScalingGroups = (
  environment: ReturnType<typeof createMockEnvironment>,
  names: string[],
) => {
  environment.mock.resolveMostRecentOperation({
    data: {
      scaling_groups: names.map((name) => ({ name })),
    },
  });
};

describe('AllResourceGroupSelect', () => {
  it('lists all resource groups from the root scaling_groups field, independent of any project', async () => {
    const user = userEvent.setup();
    const { environment } = renderWithEnvironment(<AllResourceGroupSelect />);

    expect(screen.getByText('loading...')).toBeInTheDocument();

    // The query is the project-independent root `scaling_groups` field,
    // restricted to active resource groups.
    const operation = environment.mock.getMostRecentOperation();
    expect(operation.request.node.operation.name).toBe(
      'AllResourceGroupSelectQuery',
    );
    expect(operation.request.variables).toEqual({ is_active: true });

    resolveScalingGroups(environment, ['alpha', 'beta', 'gamma']);

    await user.click(await screen.findByRole('combobox'));
    await waitFor(() => {
      expect(screen.getAllByText('alpha').length).toBeGreaterThan(0);
      expect(screen.getAllByText('beta').length).toBeGreaterThan(0);
      expect(screen.getAllByText('gamma').length).toBeGreaterThan(0);
    });
  });

  it('auto-selects the first resource group when autoSelectFirst is set and no value is selected', async () => {
    const onChange = vi.fn();
    const { environment } = renderWithEnvironment(
      <AllResourceGroupSelect
        autoSelectFirst
        value={undefined}
        onChange={onChange}
      />,
    );

    resolveScalingGroups(environment, ['first-rg', 'second-rg']);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('first-rg');
    });
  });

  it('does not override an existing selection with the first option', async () => {
    const onChange = vi.fn();
    const { environment } = renderWithEnvironment(
      <AllResourceGroupSelect
        autoSelectFirst
        value="second-rg"
        onChange={onChange}
      />,
    );

    resolveScalingGroups(environment, ['first-rg', 'second-rg']);

    await screen.findByRole('combobox');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('propagates a user selection through onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { environment } = renderWithEnvironment(
      <AllResourceGroupSelect value="alpha" onChange={onChange} />,
    );

    resolveScalingGroups(environment, ['alpha', 'beta']);

    await user.click(await screen.findByRole('combobox'));
    const betaOptions = await screen.findAllByText('beta');
    await user.click(betaOptions[betaOptions.length - 1]);

    expect(onChange).toHaveBeenCalledWith('beta', {
      value: 'beta',
      label: 'beta',
    });
  });
});
