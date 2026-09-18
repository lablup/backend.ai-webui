/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import CustomizedImageList from './CustomizedImageList';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * FR-34: each customized image row offers a shortcut into the session
 * launcher with that image already chosen, carried by the `formValues` query
 * param the launcher already reads.
 */

const webuiNavigate = vi.fn();

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
      {
        getBaseVersion: () => '',
        getBaseImages: () => [],
        getBaseImage: () => '',
        tagAlias: (value: string) => value,
        getTags: () => [],
      },
    ],
    useSuspendedBackendaiClient: () => ({
      supports: () => true,
    }),
    useWebUINavigate: () => webuiNavigate,
  };
});

vi.mock('../hooks/useRouteScope', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useRouteScope')>();
  return {
    ...originalModule,
    useProjectPath: () => (key: string) => `/project/default/${key}`,
  };
});

vi.mock('./TableColumnsSettingModal', () => ({ default: () => null }));

const IMAGE = {
  id: 'image-1',
  registry: 'cr.backend.ai',
  namespace: 'testing/ngc-pytorch',
  name: 'testing/ngc-pytorch',
  tag: '23.09-py3-customized_abc',
  architecture: 'aarch64',
  humanized_name: 'ngc-pytorch',
  digest: 'sha256:deadbeef',
  labels: [],
  supported_accelerators: [],
  base_image_name: 'ngc-pytorch',
  tags: [],
  version: '23.09',
};

const FULL_NAME =
  'cr.backend.ai/testing/ngc-pytorch:23.09-py3-customized_abc@aarch64';

const renderList = () => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      ImageNode: () => IMAGE,
    }),
  );
  render(
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={null}>
        <CustomizedImageList />
      </Suspense>
    </RelayEnvironmentProvider>,
  );
  return { environment };
};

describe('CustomizedImageList session shortcut (FR-34)', () => {
  beforeEach(() => {
    webuiNavigate.mockClear();
  });

  it('navigates to the session launcher with the row image preselected', async () => {
    const user = userEvent.setup();
    renderList();

    const startButton = await screen.findByRole('button', {
      name: 'session.launcher.StartNewSession',
    });
    await user.click(startButton);

    await waitFor(() => expect(webuiNavigate).toHaveBeenCalledTimes(1));
    const url = new URL(webuiNavigate.mock.calls[0][0], 'https://localhost');
    expect(url.pathname).toBe('/project/default/session/start');
    expect(url.searchParams.get('step')).toBe('0');
    expect(JSON.parse(url.searchParams.get('formValues') ?? '{}')).toEqual({
      environments: { version: FULL_NAME },
    });
  });
});
