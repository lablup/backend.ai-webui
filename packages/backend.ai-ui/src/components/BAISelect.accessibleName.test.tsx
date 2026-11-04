/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * ui-common's Selector names its trigger from an explicit `aria-label` before
 * the enclosing Form.Item's label, so BAISelect's placeholder fallback must
 * not be sent inside a labelled item (#10767).
 */
import { Form } from '../form-engine';
import BAISelect from './BAISelect';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const options = [
  { value: 'default', label: 'default' },
  { value: 'gpu-cluster', label: 'gpu-cluster' },
];

describe('BAISelect accessible name', () => {
  it('takes the Form.Item label, not the placeholder', () => {
    render(
      <Form>
        <Form.Item name="resourceGroup" label="Resource Group">
          <BAISelect placeholder="Select" options={options} />
        </Form.Item>
      </Form>,
    );
    expect(
      screen.getByRole('button', { name: 'Resource Group' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Select' }),
    ).not.toBeInTheDocument();
  });

  it('keeps an explicit label over the Form.Item label', () => {
    render(
      <Form>
        <Form.Item name="resourceGroup" label="Resource Group">
          <BAISelect label="Scaling group" options={options} />
        </Form.Item>
      </Form>,
    );
    expect(
      screen.getByRole('button', { name: 'Scaling group' }),
    ).toBeInTheDocument();
  });

  it('falls back to the placeholder outside a labelled Form.Item', () => {
    render(<BAISelect placeholder="Select Project" options={options} />);
    expect(
      screen.getByRole('button', { name: 'Select Project' }),
    ).toBeInTheDocument();
  });
});
