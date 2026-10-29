/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import PrometheusCategorySelect from './PrometheusCategorySelect';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

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

describe('PrometheusCategorySelect', () => {
  it('names the trigger after the field, not the placeholder', async () => {
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Query: () => ({ prometheusQueryPresetCategories: [] }),
      }),
    );
    render(
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback={null}>
          <PrometheusCategorySelect />
        </Suspense>
      </RelayEnvironmentProvider>,
    );
    const trigger = await screen.findByRole('button', {
      name: 'prometheusQueryPreset.Category',
    });
    expect(trigger).toBeVisible();
  });
});
