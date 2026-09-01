/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import type { ResourcePresetSettingModalTestQuery } from '../__generated__/ResourcePresetSettingModalTestQuery.graphql';
import ResourcePresetSettingModal from './ResourcePresetSettingModal';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import type { OperationDescriptor } from 'relay-runtime';
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
    // Astryx 0.4.0's NumberInput is a text-backed spinbutton (#4896), so
    // match the role, not `input[type="number"]`.
    const memInput = screen
      .getByText('mem')
      .closest('[data-bai-form-item]')!
      .querySelector('input[role="spinbutton"]')!;
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

const EXISTING_PRESET = {
  id: 'a3a7e6a4-1fd4-4c5d-9a6f-0a3f4b8e2c11',
  name: 'existing-preset',
  resource_slots: JSON.stringify({ cpu: '2', mem: '2147483648' }),
  shared_memory: null,
  scaling_group_name: null,
};

// Hands the modal a real fragment ref, the way `ResourcePresetList` does.
const EditModalHost = () => {
  const data = useLazyLoadQuery<ResourcePresetSettingModalTestQuery>(
    graphql`
      query ResourcePresetSettingModalTestQuery {
        resource_presets {
          ...ResourcePresetSettingModalFragment
        }
      }
    `,
    {},
  );
  return (
    <ResourcePresetSettingModal
      open
      resourcePresetFrgmt={data.resource_presets?.[0]}
      onRequestClose={vi.fn()}
    />
  );
};

const renderEditModal = () => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  const seenOperations: Array<{
    name: string;
    variables: Record<string, any>;
  }> = [];
  // A queued resolver is dropped after it answers once, and this render
  // issues two operations (the query, then the mutation) — so re-queue a
  // fresh wrapper before answering each one.
  const resolve = (operation: OperationDescriptor) => {
    seenOperations.push({
      name: operation.request.node.params.name,
      variables: operation.request.variables,
    });
    environment.mock.queueOperationResolver((next) => resolve(next));
    return MockPayloadGenerator.generate(operation, {
      ResourcePreset: () => EXISTING_PRESET,
    });
  };
  environment.mock.queueOperationResolver(resolve);
  render(
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={null}>
        <EditModalHost />
      </Suspense>
    </RelayEnvironmentProvider>,
  );
  return { seenOperations };
};

describe('ResourcePresetSettingModal edit contract', () => {
  it('saves an existing preset through the id-keyed modify mutation only', async () => {
    const user = userEvent.setup();
    const { seenOperations } = renderEditModal();

    // Editing: the name is shown but locked, and the button reads Save.
    expect(
      await screen.findByLabelText('resourcePreset.PresetName'),
    ).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /button.Save/ }));

    await waitFor(() => {
      const modify = seenOperations.find(
        (operation) =>
          operation.name === 'ResourcePresetSettingModalModifyMutation',
      );
      expect(modify).toBeDefined();
      expect(modify?.variables.id).toBe(EXISTING_PRESET.id);
      expect(modify?.variables).not.toHaveProperty('name');
      expect(modify?.variables.props).not.toHaveProperty('name');
    });
    expect(
      seenOperations.some(
        (operation) =>
          operation.name === 'ResourcePresetSettingModalCreateMutation',
      ),
    ).toBe(false);
  });
});
