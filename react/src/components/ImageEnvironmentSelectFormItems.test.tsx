/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import { Form } from '../form-engine';
import ImageEnvironmentSelectFormItems from './ImageEnvironmentSelectFormItems';
import '@testing-library/jest-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * FR-35 — the refresh control re-fetches the image list in place, so an image
 * committed after the launcher opened becomes selectable without a reload.
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

vi.mock('./ImageMetaIcon', () => ({ default: () => null }));

// Nothing under test depends on the resolved app mode, so pin it instead of
// mounting `ThemeModeProvider`.
vi.mock('../hooks/useThemeMode', () => ({
  useThemeMode: () => ({ isDarkMode: false }),
}));

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useBackendAIImageMetaData: () => [
      null,
      {
        getBaseVersion: (name: string) => name,
        getImageMeta: () => ({ key: '', tags: [] }),
        getTags: () => [],
        tagAlias: (value: string) => value,
      },
    ],
    useSuspendedBackendaiClient: () => ({
      _config: {
        showNonInstalledImages: false,
        allow_manual_image_name_for_session: false,
      },
      supports: () => false,
    }),
  };
});

const renderFormItems = (
  environment: RelayMockEnvironment,
  showRefreshButton?: boolean,
) =>
  render(
    <RelayEnvironmentProvider environment={environment}>
      <Form>
        <Suspense fallback={<div>loading</div>}>
          <ImageEnvironmentSelectFormItems
            showRefreshButton={showRefreshButton}
          />
        </Suspense>
      </Form>
    </RelayEnvironmentProvider>,
  );

const resolveImageQuery = async (environment: RelayMockEnvironment) => {
  await act(async () => {
    environment.mock.resolveMostRecentOperation((operation) =>
      MockPayloadGenerator.generate(operation),
    );
  });
};

describe('ImageEnvironmentSelectFormItems refresh control', () => {
  it('is hidden unless the consumer asks for it', async () => {
    const environment = createMockEnvironment();
    renderFormItems(environment);
    await resolveImageQuery(environment);

    expect(
      screen.queryByRole('button', { name: 'button.Refresh' }),
    ).not.toBeInTheDocument();
  });

  it('re-executes the image query when clicked', async () => {
    const environment = createMockEnvironment();
    renderFormItems(environment, true);
    await resolveImageQuery(environment);

    const refreshButton = await screen.findByRole('button', {
      name: 'button.Refresh',
    });
    // The initial query is already resolved, so nothing is in flight.
    expect(environment.mock.getAllOperations()).toHaveLength(0);

    await userEvent.click(refreshButton);

    await waitFor(() => {
      expect(environment.mock.getAllOperations()).toHaveLength(1);
    });
    expect(environment.mock.getMostRecentOperation().fragment.node.name).toBe(
      'ImageEnvironmentSelectFormItemsQuery',
    );
  });
});
