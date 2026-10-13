import type { BAILocale } from '..';
import { BAIConfigProvider } from '../../components/provider/BAIConfigProvider';
import { withUiCommonMessages } from '../uiCommonMessages';
import { useTranslator } from '@lablup/ui-common/i18n';
import { uiCommonMessages } from '@lablup/ui-common/i18n-catalog';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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
    expect(withUiCommonMessages('xx-XX', { a: 'b' }, messages)).toEqual({
      a: 'b',
    });
  });
});

describe('ui-common strings through the BUI locale modules', () => {
  const modules = import.meta.glob<{ default: BAILocale }>(
    '../[a-z][a-z]_*.ts',
  );

  it('every locale module carries ui-common’s translation for its language', async () => {
    expect(Object.keys(modules)).toHaveLength(21);
    for (const [file, load] of Object.entries(modules)) {
      const { default: locale } = await load();
      const confirm = locale.astryxLocale?.['uic.common.confirm'];
      expect(confirm, file).toEqual(expect.any(String));
      // Astryx's own strings are still there.
      expect(Object.keys(locale.astryxLocale ?? {}).length).toBeGreaterThan(
        Object.keys(uiCommonMessages.en).length,
      );
    }
    const { default: en } = await import('../en_US');
    const { default: th } = await import('../th_TH');
    expect(en.astryxLocale?.['uic.common.confirm']).toBe('Confirm');
    expect(th.astryxLocale?.['uic.common.confirm']).toBe('ยืนยัน');
  });

  it('reaches ui-common components through BAIConfigProvider', async () => {
    const Probe = () => {
      const translate = useTranslator();
      return <span>{translate('uic.SelectionLabel.clear')}</span>;
    };
    const { default: ko } = await import('../ko_KR');
    render(
      <BAIConfigProvider locale={ko}>
        <Probe />
      </BAIConfigProvider>,
    );
    expect(screen.getByText('선택 취소')).toBeInTheDocument();
  });
});
