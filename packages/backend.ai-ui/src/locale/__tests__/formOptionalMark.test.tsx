import { BAIConfigProvider } from '../../components/provider/BAIConfigProvider';
import { Form } from '../../form-engine';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

// The Form engine is imported before any locale module, the order that once
// left ui-common's catalog without its uic.Form strings (lablup/ui-common#99).
// Only English shows it: other locales pass these strings as overrides.
describe('requiredMark="optional" under the English locale module', () => {
  it('renders the "(optional)" suffix, not the uic key', async () => {
    const { default: en } = await import('../en_US');
    const { container } = render(
      <BAIConfigProvider locale={en}>
        <Form layout="vertical" requiredMark="optional">
          <Form.Item name="description" label="Description">
            <input />
          </Form.Item>
        </Form>
      </BAIConfigProvider>,
    );
    await screen.findByText(/Description/);
    expect(container.textContent).not.toContain('uic.');
    expect(container.textContent).toContain('(optional)');
  });
});
