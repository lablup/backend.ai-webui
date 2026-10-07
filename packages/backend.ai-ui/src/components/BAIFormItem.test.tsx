/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIFormItem from './BAIFormItem';
import { Form } from '@lablup/ui-common/Form';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const renderItem = (labelExtra: React.ReactNode, label?: string) =>
  render(
    <Form>
      <BAIFormItem name="environment" label={label} labelExtra={labelExtra}>
        <input aria-label="environment" />
      </BAIFormItem>
    </Form>,
  );

describe('BAIFormItem — labelExtra', () => {
  it('renders the slot after the label text in the label row', () => {
    renderItem(<button type="button">Filter</button>, 'Environments');
    const button = screen.getByRole('button', { name: 'Filter' });
    const slot = button.closest('.bai-form-item-label-with-extra__extra');
    expect(slot).not.toBeNull();
    const row = slot?.closest('.bai-form-item-label-with-extra');
    expect(
      row?.querySelector('.bai-form-item-label-with-extra__label')?.textContent,
    ).toBe('Environments');
    expect(row?.closest('.uic-form-item__label')).not.toBeNull();
  });

  it.each([undefined, null, false])(
    'renders the plain label for labelExtra=%s',
    (labelExtra) => {
      renderItem(labelExtra, 'Environments');
      expect(
        document.querySelector('.bai-form-item-label-with-extra'),
      ).toBeNull();
      expect(document.querySelector('label')?.textContent).toBe('Environments');
    },
  );

  it('renders no slot without a label', () => {
    renderItem(<button type="button">Filter</button>);
    expect(screen.queryByRole('button', { name: 'Filter' })).toBeNull();
  });
});
