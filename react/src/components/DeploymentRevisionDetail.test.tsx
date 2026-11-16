/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import type { DeploymentRevisionDetailTestQuery } from '../__generated__/DeploymentRevisionDetailTestQuery.graphql';
import DeploymentRevisionDetail from './DeploymentRevisionDetail';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

const effective = vi.hoisted(() => ({ hideModelDefinitionPath: false }));

vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('../hooks/useWebUIConfig', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../hooks/useWebUIConfig')>()),
  useEffectiveLoginConfig: () => effective,
}));
vi.mock('./FolderLink', () => ({ default: () => null }));
vi.mock('./SourceCodeView', () => ({ default: () => null }));

const TestRenderer = () => {
  const data = useLazyLoadQuery<DeploymentRevisionDetailTestQuery>(
    graphql`
      query DeploymentRevisionDetailTestQuery @relay_test_operation {
        revision(id: "test-revision") {
          ...DeploymentRevisionDetail_revision
        }
      }
    `,
    {},
  );
  return data.revision ? (
    <DeploymentRevisionDetail revisionFrgmt={data.revision} />
  ) : null;
};

const renderDetail = () => {
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      ModelRevision: () => ({
        modelMountConfig: { definitionPath: 'custom-definition.yaml' },
      }),
    }),
  );
  render(
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={null}>
        <TestRenderer />
      </Suspense>
    </RelayEnvironmentProvider>,
  );
};

describe('DeploymentRevisionDetail model definition path', () => {
  afterEach(() => {
    effective.hideModelDefinitionPath = false;
  });

  it('shows the path by default', async () => {
    renderDetail();
    expect(
      await screen.findByText('deployment.ModelDefinitionPath'),
    ).toBeInTheDocument();
    expect(screen.getByText('custom-definition.yaml')).toBeInTheDocument();
  });

  it('drops the row when the System Setting hides it', async () => {
    effective.hideModelDefinitionPath = true;
    renderDetail();
    // Another row proves the details rendered.
    expect(
      await screen.findByText('deployment.ModelFolder'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('deployment.ModelDefinitionPath'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('custom-definition.yaml'),
    ).not.toBeInTheDocument();
  });
});
