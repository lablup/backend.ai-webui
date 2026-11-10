/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { tEn } from '../../../../__test__/i18nBundles';
import '../../../../__test__/resizeObserver.mock.js';
import {
  WEBUI_SETTING_DEFINITIONS,
  type WebUISettingDefinition,
} from '../../../helper/webuiSettings';
import { toSettingsJson } from '../helper/settingsJson';
import SettingsJsonModal from './SettingsJsonModal';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// The real English copy, so the issue lines are checked as an admin reads them.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      tEn(key).replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
        String(options?.[name]),
      ),
    i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
    ready: true,
  }),
  // BUI's locale module runs `i18n.use(initReactI18next).init()` on import.
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

// Monaco loads lazily and needs the host theme; a textarea carries the same
// value / onChange contract.
vi.mock('../../../components/BAICodeEditor', async () => {
  const React = await import('react');
  return {
    default: ({
      value,
      onChange,
    }: {
      value?: string;
      onChange?: (value: string) => void;
    }) =>
      React.createElement('textarea', {
        'data-testid': 'code-editor',
        value,
        onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onChange?.(e.target.value),
      }),
  };
});

const valueOf = (definition: WebUISettingDefinition): unknown => {
  switch (definition.type) {
    case 'boolean':
      return false;
    case 'number':
      return 4;
    case 'stringList':
      return [];
    default:
      return '';
  }
};

const definitionOf = (key: string) =>
  WEBUI_SETTING_DEFINITIONS.find((d) => d.key === key)!;

const renderModal = () => {
  const onLoad = vi.fn();
  const onCancel = vi.fn();
  render(
    <SettingsJsonModal
      open
      currentValueOf={valueOf}
      onLoad={onLoad}
      onCancel={onCancel}
    />,
  );
  return { onLoad, onCancel };
};

const editor = () => screen.getByTestId('code-editor') as HTMLTextAreaElement;
const paste = (text: string) =>
  fireEvent.change(editor(), { target: { value: text } });
const applyButton = () => screen.getByRole('button', { name: 'Apply' });
const cancelButton = () => screen.getByRole('button', { name: 'Cancel' });

describe('SettingsJsonModal', () => {
  it('opens on the values the page shows, as {public, domain} JSON', () => {
    renderModal();
    expect(JSON.parse(editor().value)).toEqual(toSettingsJson(valueOf));
  });

  it('lists the entries it cannot apply and loads nothing into the draft', async () => {
    const { onLoad, onCancel } = renderModal();
    paste(
      JSON.stringify({
        public: { debug: true },
        domain: { maxCPUCoresPerContainer: 'many', e2eUnknownSetting: 1 },
      }),
    );
    await userEvent.click(applyButton());

    const issues = screen.getByTestId('webui-settings-json-issues');
    expect(issues).toHaveTextContent(
      'domain.maxCPUCoresPerContainer: wrong type or value',
    );
    expect(issues).toHaveTextContent(
      'domain.e2eUnknownSetting: unsupported setting',
    );
    expect(onLoad).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
    // Still open, so the admin can fix the document.
    expect(editor()).toBeInTheDocument();
  });

  it('shows the parse error of a document that is not JSON and loads nothing', async () => {
    const { onLoad } = renderModal();
    paste('{ nope');
    await userEvent.click(applyButton());

    expect(screen.getByText(/^This is not valid JSON: /)).toBeInTheDocument();
    expect(onLoad).not.toHaveBeenCalled();
  });

  it('clears the issue list once the document is edited', async () => {
    renderModal();
    paste('{"domain": {"e2eUnknownSetting": 1}}');
    await userEvent.click(applyButton());
    expect(
      screen.getByTestId('webui-settings-json-issues'),
    ).toBeInTheDocument();

    paste('{}');
    expect(
      screen.queryByTestId('webui-settings-json-issues'),
    ).not.toBeInTheDocument();
  });

  it('loads exactly the values the document sets', async () => {
    const { onLoad, onCancel } = renderModal();
    paste(
      '{"public": {"debug": true}, "domain": {"maxCPUCoresPerContainer": 3}}',
    );
    await userEvent.click(applyButton());

    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onLoad).toHaveBeenCalledWith([
      { definition: definitionOf('debug'), value: true },
      { definition: definitionOf('maxCPUCoresPerContainer'), value: 3 },
    ]);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('Cancel closes without loading anything', async () => {
    const { onLoad, onCancel } = renderModal();
    paste('{"domain": {"maxCPUCoresPerContainer": 3}}');
    await userEvent.click(cancelButton());

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onLoad).not.toHaveBeenCalled();
  });

  it('renders nothing while closed', () => {
    render(
      <SettingsJsonModal
        open={false}
        currentValueOf={valueOf}
        onLoad={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.queryByTestId('code-editor')).not.toBeInTheDocument();
  });
});
