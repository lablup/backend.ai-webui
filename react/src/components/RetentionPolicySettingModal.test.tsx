/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import type { RetentionPolicySettingModalTestQuery } from '../__generated__/RetentionPolicySettingModalTestQuery.graphql';
import RetentionPolicySettingModal from './RetentionPolicySettingModal';
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

vi.mock('backend.ai-ui', async (importOriginal) => {
  const React = await import('react');
  const originalModule = await importOriginal<typeof import('backend.ai-ui')>();
  return {
    ...originalModule,
    BAISelect: (props: any) =>
      React.createElement(
        'select',
        {
          'data-testid': 'mock-category-select',
          value: props.value ?? '',
          onChange: (e: any) => props.onChange?.(e.target.value),
        },
        React.createElement('option', { value: '' }),
        ...props.options.map((option: any) =>
          React.createElement(
            'option',
            { key: option.value, value: option.value },
            option.label,
          ),
        ),
      ),
  };
});

const EXISTING_POLICY = {
  id: 'UmV0ZW50aW9uUG9saWN5OjE=',
  entityId: 'b7d3c2a1-5e4f-4a3b-9c8d-1e2f3a4b5c6d',
  category: 'LOGS',
  retentionPeriodDays: 30,
  enabled: true,
};

type SeenOperation = { name: string; variables: Record<string, any> };

const setupEnvironment = (
  existingCategoryPolicyEntityId: string | null = null,
) => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  const seenOperations: Array<SeenOperation> = [];
  const resolve = (operation: OperationDescriptor) => {
    const name = operation.request.node.params.name;
    seenOperations.push({ name, variables: operation.request.variables });
    environment.mock.queueOperationResolver((next) => resolve(next));
    if (name === 'RetentionPolicySettingModalCategoryCheckQuery') {
      return MockPayloadGenerator.generate(operation, {
        RetentionPolicyConnection: () => ({
          edges: existingCategoryPolicyEntityId
            ? [{ node: { entityId: existingCategoryPolicyEntityId } }]
            : [],
        }),
      });
    }
    return MockPayloadGenerator.generate(operation, {
      RetentionPolicy: () => EXISTING_POLICY,
    });
  };
  environment.mock.queueOperationResolver(resolve);
  return { environment, seenOperations };
};

const renderCreateModal = (
  existingCategoryPolicyEntityId: string | null = null,
) => {
  const { environment, seenOperations } = setupEnvironment(
    existingCategoryPolicyEntityId,
  );
  const onRequestClose = vi.fn();
  render(
    <RelayEnvironmentProvider environment={environment}>
      <RetentionPolicySettingModal
        open
        onRequestClose={onRequestClose}
        onViewExistingPolicy={vi.fn()}
      />
    </RelayEnvironmentProvider>,
  );
  return { seenOperations, onRequestClose };
};

const EditModalHost = ({
  onRequestClose,
}: {
  onRequestClose: (success?: boolean) => void;
}) => {
  const data = useLazyLoadQuery<RetentionPolicySettingModalTestQuery>(
    graphql`
      query RetentionPolicySettingModalTestQuery {
        adminRetentionPolicies {
          edges {
            node {
              ...RetentionPolicySettingModalFragment
            }
          }
        }
      }
    `,
    {},
  );
  return (
    <RetentionPolicySettingModal
      open
      policyFrgmt={data.adminRetentionPolicies?.edges[0]?.node}
      onRequestClose={onRequestClose}
      onViewExistingPolicy={vi.fn()}
    />
  );
};

const renderEditModal = () => {
  const { environment, seenOperations } = setupEnvironment();
  const onRequestClose = vi.fn();
  render(
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={null}>
        <EditModalHost onRequestClose={onRequestClose} />
      </Suspense>
    </RelayEnvironmentProvider>,
  );
  return { seenOperations, onRequestClose };
};

const findOperation = (operations: Array<SeenOperation>, name: string) =>
  operations.find((operation) => operation.name === name);

describe('RetentionPolicySettingModal', () => {
  it('renders the category, retention period and enabled fields in create mode', async () => {
    renderCreateModal();

    expect(
      await screen.findByTestId('mock-category-select'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('retentionPolicy.OnePolicyPerCategory'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('retentionPolicy.RetentionPeriodDays'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: 'general.Enabled' }),
    ).toBeChecked();
    expect(
      screen.getByRole('button', { name: /button.Create/ }),
    ).toBeInTheDocument();
  });

  it('shows the current values of the policy in edit mode', async () => {
    renderEditModal();

    expect(await screen.findByTestId('mock-category-select')).toHaveValue(
      EXISTING_POLICY.category,
    );
    expect(
      screen.getByLabelText('retentionPolicy.RetentionPeriodDays'),
    ).toHaveValue('30');
    expect(
      screen.getByRole('switch', { name: 'general.Enabled' }),
    ).toBeChecked();
    expect(
      screen.getByRole('button', { name: /button.Save/ }),
    ).toBeInTheDocument();
  });

  it('closes without success on cancel', async () => {
    const user = userEvent.setup();
    const { onRequestClose } = renderCreateModal();

    await user.click(
      await screen.findByRole('button', { name: /button.Cancel/ }),
    );

    expect(onRequestClose).toHaveBeenCalledWith(false);
  });

  it('creates a policy with the entered values and closes with success', async () => {
    const user = userEvent.setup();
    const { seenOperations, onRequestClose } = renderCreateModal();

    await user.selectOptions(
      await screen.findByTestId('mock-category-select'),
      'SESSIONS',
    );
    await user.type(
      screen.getByLabelText('retentionPolicy.RetentionPeriodDays'),
      '14',
    );
    await user.click(screen.getByRole('switch', { name: 'general.Enabled' }));
    await user.click(screen.getByRole('button', { name: /button.Create/ }));

    await waitFor(() => {
      expect(onRequestClose).toHaveBeenCalledWith(true);
    });
    expect(
      findOperation(
        seenOperations,
        'RetentionPolicySettingModalCategoryCheckQuery',
      )?.variables,
    ).toEqual({ filter: { category: 'SESSIONS' } });
    expect(
      findOperation(seenOperations, 'RetentionPolicySettingModalCreateMutation')
        ?.variables,
    ).toEqual({
      input: { category: 'SESSIONS', retentionPeriodDays: 14, enabled: false },
    });
  });

  it('blocks creation when the category already has a policy', async () => {
    const user = userEvent.setup();
    const { seenOperations, onRequestClose } = renderCreateModal(
      'c4e5f6a7-8b9c-4d0e-9f1a-2b3c4d5e6f70',
    );

    await user.selectOptions(
      await screen.findByTestId('mock-category-select'),
      'SESSIONS',
    );
    await user.type(
      screen.getByLabelText('retentionPolicy.RetentionPeriodDays'),
      '14',
    );
    await user.click(screen.getByRole('button', { name: /button.Create/ }));

    expect(
      await screen.findByText('retentionPolicy.PolicyAlreadyExistsView'),
    ).toBeInTheDocument();
    expect(
      findOperation(
        seenOperations,
        'RetentionPolicySettingModalCreateMutation',
      ),
    ).toBeUndefined();
    expect(onRequestClose).not.toHaveBeenCalled();
  });

  it('updates only the changed fields by entity id and closes with success', async () => {
    const user = userEvent.setup();
    const { seenOperations, onRequestClose } = renderEditModal();

    const daysInput = await screen.findByLabelText(
      'retentionPolicy.RetentionPeriodDays',
    );
    await user.clear(daysInput);
    await user.type(daysInput, '90');
    await user.click(screen.getByRole('button', { name: /button.Save/ }));

    await waitFor(() => {
      expect(onRequestClose).toHaveBeenCalledWith(true);
    });
    expect(
      findOperation(seenOperations, 'RetentionPolicySettingModalUpdateMutation')
        ?.variables,
    ).toEqual({
      input: { id: EXISTING_POLICY.entityId, retentionPeriodDays: 90 },
    });
    expect(
      findOperation(
        seenOperations,
        'RetentionPolicySettingModalCategoryCheckQuery',
      ),
    ).toBeUndefined();
  });
});
