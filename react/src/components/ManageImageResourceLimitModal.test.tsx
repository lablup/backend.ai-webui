/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import type { ManageImageResourceLimitModalTestQuery } from '../__generated__/ManageImageResourceLimitModalTestQuery.graphql';
import ManageImageResourceLimitModal from './ManageImageResourceLimitModal';
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
 * `clear_image_custom_resource_limit` is keyed on the image canonical string,
 * not on the node id, and it only exists from manager 25.6.0 — both are
 * asserted here because a malformed key or an unsupported manager only fails
 * at request time.
 */

let isManagerVersionCompatible = true;

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
      isManagerVersionCompatibleWith: () => isManagerVersionCompatible,
    }),
  };
});

vi.mock('../hooks/backendai', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/backendai')>();
  return {
    ...originalModule,
    useResourceSlotsDetails: () => ({ mergedResourceSlots: {} }),
  };
});

const IMAGE_NODE = {
  registry: 'cr.backend.ai',
  name: 'testing/ngc-pytorch',
  namespace: 'testing/ngc-pytorch',
  architecture: 'x86_64',
  tag: '23.09-py3',
  resource_limits: [{ key: 'cpu', min: '2', max: null }],
};

const ModalHost = () => {
  const data = useLazyLoadQuery<ManageImageResourceLimitModalTestQuery>(
    graphql`
      query ManageImageResourceLimitModalTestQuery {
        image_node(id: "test-image-id") {
          ...ManageImageResourceLimitModal_image
        }
      }
    `,
    {},
  );
  return (
    <ManageImageResourceLimitModal
      open
      imageFrgmt={data.image_node ?? null}
      onRequestClose={vi.fn()}
    />
  );
};

const renderModal = () => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  const seenOperations: Array<{
    name: string;
    variables: Record<string, any>;
  }> = [];
  // A queued resolver answers once, and this render issues the query and then
  // the mutation — re-queue before answering each.
  const resolve = (operation: OperationDescriptor) => {
    seenOperations.push({
      name: operation.request.node.params.name,
      variables: operation.request.variables,
    });
    environment.mock.queueOperationResolver((next) => resolve(next));
    return MockPayloadGenerator.generate(operation, {
      ImageNode: () => IMAGE_NODE,
    });
  };
  environment.mock.queueOperationResolver(resolve);
  render(
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={null}>
        <ModalHost />
      </Suspense>
    </RelayEnvironmentProvider>,
  );
  return { seenOperations };
};

describe('ManageImageResourceLimitModal reset action (FR-854)', () => {
  beforeEach(() => {
    isManagerVersionCompatible = true;
  });

  it('clears the custom limits with the canonical key of the edited image', async () => {
    const user = userEvent.setup();
    const { seenOperations } = renderModal();

    await user.click(
      await screen.findByRole('button', {
        name: 'environment.ResetImageResourceLimit',
      }),
    );
    await user.click(screen.getByRole('button', { name: 'button.Reset' }));

    await waitFor(() => {
      const clear = seenOperations.find(
        (operation) =>
          operation.name === 'ManageImageResourceLimitModalClearMutation',
      );
      expect(clear).toBeDefined();
      expect(clear?.variables.imageCanonical).toBe(
        'cr.backend.ai/testing/ngc-pytorch:23.09-py3',
      );
      expect(clear?.variables.architecture).toBe('x86_64');
    });
  });

  it('hides the reset action on a manager older than 25.6.0', async () => {
    isManagerVersionCompatible = false;
    renderModal();

    expect(
      await screen.findByRole('button', { name: 'button.Save' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: 'environment.ResetImageResourceLimit',
      }),
    ).not.toBeInTheDocument();
  });
});
