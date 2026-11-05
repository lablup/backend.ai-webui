/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * A BAISelect inside a Form.Item is named by the item's label, not by its
 * placeholder (#10902).
 */
import { Form, FormItem } from '../form-engine';
import BAISelect from './BAISelect';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const options = [
  { label: 'default', value: 'default' },
  { label: 'research', value: 'research' },
];

describe('BAISelect accessible name inside a Form.Item', () => {
  it('uses the Form.Item label over the placeholder in multiple mode', async () => {
    render(
      <Form>
        <FormItem name="group_ids" label="Projects">
          <BAISelect
            mode="multiple"
            placeholder="Select Project"
            options={options}
          />
        </FormItem>
      </Form>,
    );
    const trigger = screen.getByRole('button', { name: /^Projects/ });
    expect(
      screen.queryByRole('button', { name: /^Select Project/ }),
    ).not.toBeInTheDocument();
    await userEvent.click(trigger);
    expect(
      await screen.findByRole('listbox', { name: /^Projects/ }),
    ).toBeInTheDocument();
  });

  it('uses the Form.Item label over the placeholder in single mode', () => {
    render(
      <Form>
        <FormItem name="project" label="Project">
          <BAISelect placeholder="Select Project" options={options} />
        </FormItem>
      </Form>,
    );
    expect(
      screen.getByRole('button', { name: /^Project/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Select Project/ }),
    ).not.toBeInTheDocument();
  });

  it('keeps an explicit aria-label over the Form.Item label', () => {
    render(
      <Form>
        <FormItem name="project" label="Project">
          <BAISelect
            aria-label="No accessible projects"
            placeholder="Select Project"
            options={options}
          />
        </FormItem>
      </Form>,
    );
    expect(
      screen.getByRole('button', { name: /^No accessible projects/ }),
    ).toBeInTheDocument();
  });

  it('keeps the label prop over aria-label and the Form.Item label', () => {
    render(
      <Form>
        <FormItem name="project" label="Project">
          <BAISelect
            label="Destination"
            aria-label="No accessible projects"
            placeholder="Select Project"
            options={options}
          />
        </FormItem>
      </Form>,
    );
    expect(
      screen.getByRole('button', { name: /^Destination/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^No accessible projects/ }),
    ).not.toBeInTheDocument();
  });

  it('falls back to the placeholder in a Form.Item without a label', () => {
    render(
      <Form>
        <FormItem name="project">
          <BAISelect placeholder="Select Project" options={options} />
        </FormItem>
      </Form>,
    );
    expect(
      screen.getByRole('button', { name: /^Select Project/ }),
    ).toBeInTheDocument();
  });

  it('falls back to the placeholder outside a Form.Item', () => {
    render(<BAISelect placeholder="Select Project" options={options} />);
    expect(
      screen.getByRole('button', { name: /^Select Project/ }),
    ).toBeInTheDocument();
  });
});
