import { BAIConfigProvider } from '../../components/provider/BAIConfigProvider';
import { withUiCommonMessages } from '../uiCommonMessages';
import { useTranslator } from '@lablup/ui-common/i18n';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// ui-common's catalog is empty in 0.2.0-alpha.0, so the plumbing is proven
// against a stand-in catalog.
vi.mock('@lablup/ui-common/i18n-catalog', () => ({
  uiCommonMessages: {
    en: { 'uic.Probe.label': { defaultMessage: 'Probe' } },
    'ko-KR': { 'uic.Probe.label': { defaultMessage: '프로브' } },
  },
}));

describe('withUiCommonMessages', () => {
  const messages = {
    'ko-KR': {
      'uic.Probe.label': { defaultMessage: '프로브' },
      'uic.Probe.hint': { defaultMessage: '힌트' },
    },
  };

  it('flattens the locale catalog under the module overrides', () => {
    expect(
      withUiCommonMessages(
        'ko-KR',
        { 'uic.Probe.hint': '재정의', '@astryx.x': 'y' },
        messages,
      ),
    ).toEqual({
      'uic.Probe.label': '프로브',
      'uic.Probe.hint': '재정의',
      '@astryx.x': 'y',
    });
  });

  it('adds nothing for a locale ui-common does not translate', () => {
    expect(withUiCommonMessages('th-TH', { a: 'b' }, messages)).toEqual({
      a: 'b',
    });
  });
});

describe('ui-common strings through the BUI locale modules', () => {
  const Probe = () => {
    const translate = useTranslator();
    return <span>{translate('uic.Probe.label')}</span>;
  };

  it('carries uic.* keys in a locale module', async () => {
    const { default: ko } = await import('../ko_KR');
    const { default: en } = await import('../en_US');
    expect(ko.astryxLocale?.['uic.Probe.label']).toBe('프로브');
    expect(en.astryxLocale?.['uic.Probe.label']).toBe('Probe');
    // Astryx's own strings are still there.
    expect(Object.keys(ko.astryxLocale ?? {}).length).toBeGreaterThan(1);
  });

  it('reaches ui-common components through BAIConfigProvider', async () => {
    const { default: ko } = await import('../ko_KR');
    render(
      <BAIConfigProvider locale={ko}>
        <Probe />
      </BAIConfigProvider>,
    );
    expect(screen.getByText('프로브')).toBeInTheDocument();
  });
});
