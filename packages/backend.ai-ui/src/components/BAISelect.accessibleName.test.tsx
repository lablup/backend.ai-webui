/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * A BAISelect inside a labelled `Form.Item` is named by the item, not by its
 * placeholder (#10391).
 */
import { Form } from '../form-engine';
import BAISelect from './BAISelect';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const options = [{ label: 'a', value: 'a' }];

describe('BAISelect accessible name', () => {
  it('takes the enclosing Form.Item label over the placeholder', () => {
    render(
      <Form>
        <Form.Item label="Category" name="categoryId">
          <BAISelect placeholder="No category" options={options} />
        </Form.Item>
      </Form>,
    );
    expect(
      screen.getByRole('button', { name: 'Category' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'No category' }),
    ).not.toBeInTheDocument();
  });

  it('takes the Form.Item label in multiple mode too', () => {
    render(
      <Form>
        <Form.Item label="Projects" name="group_ids">
          <BAISelect
            mode="multiple"
            placeholder="Select Project"
            options={options}
          />
        </Form.Item>
      </Form>,
    );
    expect(
      screen.getByRole('button', { name: 'Projects' }),
    ).toBeInTheDocument();
  });

  it('keeps an explicit label inside a Form.Item', () => {
    render(
      <Form>
        <Form.Item label="Category" name="categoryId">
          <BAISelect label="Preset category" options={options} />
        </Form.Item>
      </Form>,
    );
    expect(
      screen.getByRole('button', { name: 'Preset category' }),
    ).toBeInTheDocument();
  });

  it('falls back to the placeholder outside a Form.Item', () => {
    render(<BAISelect placeholder="No category" options={options} />);
    expect(
      screen.getByRole('button', { name: 'No category' }),
    ).toBeInTheDocument();
  });
});
