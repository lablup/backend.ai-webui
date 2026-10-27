// The component's behaviour is tested in ui-common (`BulkEditFormItem`);
// this covers the adapter's `showClear` mapping.
import { Form } from '../form-engine';
import BAIBulkEditFormItem from './BAIBulkEditFormItem';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const renderItem = (showClear?: boolean) =>
  render(
    <Form>
      <BAIBulkEditFormItem name="field" label="Field" showClear={showClear}>
        <input aria-label="field" />
      </BAIBulkEditFormItem>
    </Form>,
  );

describe('BAIBulkEditFormItem', () => {
  it('offers Clear when showClear is set', () => {
    renderItem(true);
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });

  it('offers no Clear without showClear', () => {
    renderItem();
    expect(screen.getByDisplayValue('Keep as is')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();
  });
});
