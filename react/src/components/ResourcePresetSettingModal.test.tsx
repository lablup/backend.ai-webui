/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import ResourcePresetSettingModal from './ResourcePresetSettingModal';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * Contract tests for the resource-group field of the preset editor
 * (ADR-0001, FR-3415).
 *
 * A resource preset has NO project dimension in the manager: the
 * `resource_presets` table has no group column, its only relation is to a
 * single `ScalingGroupRow`, and a null `scaling_group_name` means the preset
 * is global. So this modal must offer resource groups at ADMIN scope and must
 * expose no project affordance whatsoever — a project-narrowed list would hide
 * resource groups the admin is entitled to bind a global preset to.
 *
 * External behavior only: rendered fields + submitted mutation variables.
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

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({
      supports: (feature: string) =>
        feature === 'resource-presets-per-resource-group',
    }),
  };
});

vi.mock('../hooks/backendai', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/backendai')>();
  return {
    ...originalModule,
    useResourceSlots: () => [{ cpu: 'count', mem: 'bytes' }],
    useResourceSlotsDetails: () => ({ mergedResourceSlots: {} }),
  };
});

// Decoy ambient project: nothing in this modal may narrow by a project, so a
// surviving ambient read would show up as a project-keyed select below.
vi.mock('../hooks/useCurrentProject', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useCurrentProject')>();
  return {
    ...originalModule,
    useCurrentProjectValue: () => ({
      id: 'ambient-project-id',
      name: 'ambient-project-name',
    }),
  };
});

vi.mock('backend.ai-ui', async (importOriginal) => {
  const React = await import('react');
  const originalModule = await importOriginal<typeof import('backend.ai-ui')>();
  return {
    ...originalModule,
    // Project-keyed variant: must NOT appear anywhere in this modal.
    BAIProjectResourceGroupSelect: (props: any) =>
      React.createElement('div', {
        'data-testid': 'mock-project-resource-group-select',
        'data-project-name': props.projectName ?? '',
      }),
    BAIResourceGroupSelect: (props: any) =>
      React.createElement('button', {
        'data-testid': 'mock-admin-resource-group-select',
        'data-allow-clear': String(!!props.allowClear),
        type: 'button',
        onClick: () => props.onChange?.('rg-from-admin-scope'),
      }),
  };
});

const renderModal = () => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  // The resolver settles every operation as it arrives, which also drops it
  // from `getAllOperations()` (that lists only PENDING ones). Record them here
  // instead, the same way the other contract tests in this stack do.
  const seenOperations: Array<{
    name: string;
    variables: Record<string, any>;
  }> = [];
  environment.mock.queueOperationResolver((operation) => {
    seenOperations.push({
      name: operation.request.node.params.name,
      variables: operation.request.variables,
    });
    return MockPayloadGenerator.generate(operation);
  });
  render(
    <RelayEnvironmentProvider environment={environment}>
      <>
        <ResourcePresetSettingModal open onRequestClose={vi.fn()} />
      </>
    </RelayEnvironmentProvider>,
  );
  return { environment, seenOperations };
};

describe('ResourcePresetSettingModal resource-group scope contract (ADR-0001, FR-3415)', () => {
  it('lists resource groups at admin scope, independent of any project', async () => {
    renderModal();

    expect(
      await screen.findByTestId('mock-admin-resource-group-select'),
    ).toBeInTheDocument();
    // Neither a project-narrowed resource-group list nor any project picker.
    expect(
      screen.queryByTestId('mock-project-resource-group-select'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('general.Project')).not.toBeInTheDocument();
  });

  it('keeps the resource group optional so a global preset can be saved', async () => {
    const user = userEvent.setup();
    const { seenOperations } = renderModal();

    // The field is clearable — the manager treats a preset with no resource
    // group as global.
    expect(
      await screen.findByTestId('mock-admin-resource-group-select'),
    ).toHaveAttribute('data-allow-clear', 'true');

    await user.type(
      screen.getByLabelText('resourcePreset.PresetName'),
      'global-preset',
    );
    await user.type(screen.getByLabelText('cpu'), '1');
    // The memory field is a `BAIDynamicUnitInputNumber`: its `<label for>`
    // points at the form-item name while the real control is labelled by the
    // unit selector, so `getByLabelText('mem')` finds the label but no
    // control. Reach the input through its form-item row instead.
    const memInput = screen
      .getByText('mem')
      .closest('[data-bai-form-item]')!
      .querySelector('input[type="number"]')!;
    await user.type(memInput, '1');
    await user.click(screen.getByRole('button', { name: /button.Create/ }));

    await waitFor(() => {
      const create = seenOperations.find(
        (operation) =>
          operation.name === 'ResourcePresetSettingModalCreateMutation',
      );
      expect(create).toBeDefined();
      expect(create?.variables.name).toBe('global-preset');
      expect(create?.variables.props.scaling_group_name).toBeNull();
    });
  });
});
