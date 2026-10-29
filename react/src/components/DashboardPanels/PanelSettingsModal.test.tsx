/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import PanelSettingsModal from './PanelSettingsModal';
import type { PanelSettings } from './types';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

// The real select queries the manager; this stub shows what Form.Item hands it.
vi.mock('backend.ai-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('backend.ai-ui')>();
  return {
    ...actual,
    BAIScopedResourceGroupSelect: ({
      value,
      onChange,
    }: {
      value?: string | null;
      onChange?: (value: string | undefined) => void;
    }) => (
      <>
        <output data-testid="resource-group-value">
          {JSON.stringify(value ?? null)}
        </output>
        <button type="button" onClick={() => onChange?.('g2')}>
          pick g2
        </button>
      </>
    ),
  };
});

const renderModal = (
  settings: PanelSettings | undefined,
  onSubmit: (settings: PanelSettings | undefined) => void,
) =>
  render(
    <PanelSettingsModal
      open
      title="My Total Resource Usage"
      definition={{ kind: 'preset', settings: ['resourceGroup'] }}
      settings={settings}
      resourceGroupScope={{ domain: [{ value: 'default' }] } as never}
      onSubmit={onSubmit}
      onRequestClose={() => {}}
    />,
  );

describe('PanelSettingsModal', () => {
  it('shows the saved resource group in the select', async () => {
    renderModal({ resourceGroups: ['g1'] }, vi.fn());

    expect(await screen.findByTestId('resource-group-value')).toHaveTextContent(
      '"g1"',
    );
  });

  it('shows the first group of an older multi-group setting', async () => {
    renderModal({ resourceGroups: ['g3', 'g1'] }, vi.fn());

    expect(await screen.findByTestId('resource-group-value')).toHaveTextContent(
      '"g3"',
    );
  });

  it('submits the resource group picked in the select', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderModal({ resourceGroups: ['g1'] }, onSubmit);

    await user.click(await screen.findByRole('button', { name: 'pick g2' }));
    expect(screen.getByTestId('resource-group-value')).toHaveTextContent(
      '"g2"',
    );
    await user.click(screen.getByRole('button', { name: 'button.Save' }));

    expect(onSubmit).toHaveBeenCalledWith({ resourceGroups: ['g2'] });
  });
});
