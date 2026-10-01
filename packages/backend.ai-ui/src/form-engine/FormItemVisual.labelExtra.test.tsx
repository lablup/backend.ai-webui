/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIFormItemVisual from './FormItemVisual';
import { Form } from './engine';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('BAIFormItemVisual — labelExtra', () => {
  it('renders the slot in the label row, outside the <label>', () => {
    render(
      <BAIFormItemVisual
        label="Environments"
        labelExtra={<button type="button">Filter</button>}
      >
        <input aria-label="environment" />
      </BAIFormItemVisual>,
    );
    const button = screen.getByRole('button', { name: 'Filter' });
    const slot = button.closest('[data-bai-form-item-label-extra]');
    expect(slot).not.toBeNull();
    // Inside a <label> the button would join the control's accessible name.
    expect(button.closest('label')).toBeNull();
    const labelCol = slot?.closest('[data-bai-form-item-label-col]');
    expect(labelCol?.hasAttribute('data-has-label-extra')).toBe(true);
    expect(labelCol?.querySelector('label')?.textContent).toBe('Environments');
  });

  it('is forwarded by Form.Item', () => {
    render(
      <Form>
        <Form.Item
          name="environment"
          label="Environments"
          labelExtra={<button type="button">Filter</button>}
        >
          <input aria-label="environment" />
        </Form.Item>
      </Form>,
    );
    const button = screen.getByRole('button', { name: 'Filter' });
    expect(button.closest('[data-bai-form-item-label-extra]')).not.toBeNull();
  });

  it('keeps the colon on the slot by default', () => {
    render(
      <BAIFormItemVisual
        layout="horizontal"
        label="Environments"
        labelExtra={<button type="button">Filter</button>}
      >
        <input aria-label="environment" />
      </BAIFormItemVisual>,
    );
    const slot = document.querySelector('[data-bai-form-item-label-extra]');
    expect(slot?.hasAttribute('data-no-colon')).toBe(false);
  });

  it('marks the slot as colon-less when the item has no colon', () => {
    render(
      <BAIFormItemVisual
        layout="horizontal"
        colon={false}
        label="Environments"
        labelExtra={<button type="button">Filter</button>}
      >
        <input aria-label="environment" />
      </BAIFormItemVisual>,
    );
    const slot = document.querySelector('[data-bai-form-item-label-extra]');
    expect(slot?.hasAttribute('data-no-colon')).toBe(true);
  });

  it.each([undefined, null, false])(
    'renders no slot for labelExtra=%s',
    (labelExtra) => {
      render(
        <BAIFormItemVisual label="Environments" labelExtra={labelExtra}>
          <input aria-label="environment" />
        </BAIFormItemVisual>,
      );
      expect(
        document.querySelector('[data-bai-form-item-label-extra]'),
      ).toBeNull();
      expect(
        document
          .querySelector('[data-bai-form-item-label-col]')
          ?.hasAttribute('data-has-label-extra'),
      ).toBe(false);
    },
  );
});
