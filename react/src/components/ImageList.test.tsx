/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import ImageList from './ImageList';
import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import { App } from 'antd';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * Contract test for the explicit project prop (ADR-0001, FR-3415).
 *
 * The image list is scoped by a `ScopeField` argument; the scope must come
 * from the project the Environments page selected, never from the ambient
 * current project.
 *
 * External behavior only: prop in → query variables out.
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
    useBackendAIImageMetaData: () => [
      null,
      { tagAlias: (value: string) => value },
    ],
  };
});

// Decoy ambient project: if any ambient read survived, the scope below would
// carry `ambient-project-id`.
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

const renderList = (project: { id: string; name: string }) => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  render(
    <RelayEnvironmentProvider environment={environment}>
      <NuqsTestingAdapter searchParams="">
        <App>
          <Suspense fallback={null}>
            <ImageList project={project} />
          </Suspense>
        </App>
      </NuqsTestingAdapter>
    </RelayEnvironmentProvider>,
  );
  return { environment };
};

describe('ImageList project scope contract (ADR-0001, FR-3415)', () => {
  it('scopes the image query to exactly the project it was given', async () => {
    const { environment } = renderList({
      id: 'chosen-project-id',
      name: 'chosen-project-name',
    });

    await waitFor(() => {
      expect(environment.mock.getAllOperations().length).toBeGreaterThan(0);
    });
    const operation = environment.mock.getMostRecentOperation();
    expect(operation.request.node.params.name).toBe('ImageListQuery');
    expect(operation.request.variables.scopeId).toBe(
      'project:chosen-project-id',
    );
    expect(operation.request.variables.scopeId).not.toContain(
      'ambient-project-id',
    );
  });
});
