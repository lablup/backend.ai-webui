import { i18n, loadBAILanguage } from '..';
import { BAIConfigProvider } from '../../components/provider/BAIConfigProvider';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import pl from '../pl.json';
import { act, render, screen, waitFor } from '@testing-library/react';
import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';

const NS = 'backend.ai-ui';
const reactGlobal = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };

const CopyLabel = () => {
  'use memo';
  const { t, ready } = useBAIi18n();
  return (
    <span data-testid="copy">{`${ready}:${t('general.button.Copy')}`}</span>
  );
};

describe('BUI lazy locale catalogs', () => {
  afterEach(async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  it('bundles only English', () => {
    expect(i18n.hasResourceBundle('en', NS)).toBe(true);
    expect(i18n.hasResourceBundle('de', NS)).toBe(false);
  });

  it('reads a language through the backend on changeLanguage', async () => {
    expect(i18n.hasResourceBundle('fr', NS)).toBe(false);
    const pending = i18n.changeLanguage('fr');
    // The language only switches once the catalog has arrived.
    expect(i18n.language).toBe('en');
    await pending;
    expect(i18n.hasResourceBundle('fr', NS)).toBe(true);
    expect(i18n.language).toBe('fr');
    expect(i18n.t('general.button.Copy')).toBe('Copier');
  });

  it('keeps rendering the previous language, never raw keys, while loading', async () => {
    render(<CopyLabel />);
    expect(screen.getByTestId('copy')).toHaveTextContent('true:Copy');
    let pending: Promise<unknown> | undefined;
    act(() => {
      pending = i18n.changeLanguage('es');
    });
    expect(screen.getByTestId('copy')).toHaveTextContent('true:Copy');
    await act(async () => {
      await pending;
    });
    expect(screen.getByTestId('copy')).toHaveTextContent('true:Copiar');
  });

  it('caches one load promise per language', () => {
    expect(loadBAILanguage('it')).toBe(loadBAILanguage('it'));
  });

  // A plain root, not `render`: under `act` React never retries this mount
  // after the promise settles, while a real root does.
  it('BAIConfigProvider suspends until the catalog is in, then renders it', async () => {
    expect(i18n.hasResourceBundle('pl', NS)).toBe(false);
    const actEnvironment = reactGlobal.IS_REACT_ACT_ENVIRONMENT;
    reactGlobal.IS_REACT_ACT_ENVIRONMENT = false;
    const container = document.createElement('div');
    const root = createRoot(container);
    try {
      root.render(
        <Suspense fallback={<span>loading</span>}>
          <BAIConfigProvider locale={{ lang: 'pl' }}>
            <CopyLabel />
          </BAIConfigProvider>
        </Suspense>,
      );
      await waitFor(() => expect(container).toHaveTextContent('loading'));
      await waitFor(() =>
        expect(container).toHaveTextContent(`true:${pl.general.button.Copy}`),
      );
    } finally {
      root.unmount();
      reactGlobal.IS_REACT_ACT_ENVIRONMENT = actEnvironment;
    }
  });
});
