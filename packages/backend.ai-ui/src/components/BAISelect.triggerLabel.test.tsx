/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Pins FR-3499 for the `<Select.Option>` children API: the option label Astryx
 * receives is the DISPLAY text, never the synthetic search key.
 *
 * Astryx's `Selector` spends `SelectorOptionData.label` twice — the dropdown
 * filters on it, and the closed trigger renders it — so folding an option's
 * `filterValue` into that label leaked the search key onto the control. The
 * image environment selector (`ImageEnvironmentSelectFormItems`, which is the
 * repo's real user of this children API and the only place `filterValue` is
 * set) rendered `PyTorch PyTorch` and a tab-separated version string on the
 * Session Launcher and the deployment Add-Revision modal.
 *
 * The fixture below mirrors that call site's shape exactly: an OptGroup of
 * rich-JSX option rows, each carrying a `filterValue` whose text overlaps the
 * visible label. jsdom sees the trigger's text content the same way a browser
 * does, so the assertion is the same thing that was measured live.
 */
import BAISelect, {
  BAISelectOptionGroup as SelectOptGroup,
  BAISelectOptionItem as SelectOption,
} from './BAISelect';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

// The popup keeps the keyboard highlight in view; jsdom has no layout, so it
// does not implement `scrollIntoView`. Unrelated to what is asserted.
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const ImageSelect = ({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (next: unknown) => void;
}) => (
  <BAISelect label="Environments" value={value} onChange={onChange}>
    <SelectOptGroup key="ml" label="Machine Learning / Deep Learning">
      <SelectOption
        key="cr.backend.ai/stable/pytorch"
        value="cr.backend.ai/stable/pytorch"
        filterValue={'PyTorch\tstable\tGPU'}
      >
        <span>PyTorch</span>
      </SelectOption>
      <SelectOption
        key="cr.backend.ai/stable/tensorflow"
        value="cr.backend.ai/stable/tensorflow"
        filterValue={'TensorFlow\tstable\tGPU'}
      >
        <span>TensorFlow</span>
      </SelectOption>
    </SelectOptGroup>
  </BAISelect>
);

const triggerText = () =>
  screen.getAllByRole('button')[0]?.textContent?.trim() ?? '';

describe('BAISelect children-option trigger label (FR-3499)', () => {
  it('shows the option text alone, not the folded-in filterValue', () => {
    render(<ImageSelect value="cr.backend.ai/stable/pytorch" />);
    expect(triggerText()).toBe('PyTorch');
  });

  it('never leaks the search key separators onto the trigger', () => {
    render(<ImageSelect value="cr.backend.ai/stable/tensorflow" />);
    const text = triggerText();
    expect(text).not.toContain('\t');
    expect(text).not.toContain('stable');
    // The defect rendered the name twice ("TensorFlow TensorFlow").
    expect(text.match(/TensorFlow/g)).toHaveLength(1);
  });

  it('still selects a grouped option and reports the caller value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ImageSelect value="cr.backend.ai/stable/pytorch" onChange={onChange} />,
    );

    await user.click(screen.getAllByRole('button')[0]);
    await user.click(screen.getByRole('option', { name: 'TensorFlow' }));

    expect(onChange).toHaveBeenCalledWith(
      'cr.backend.ai/stable/tensorflow',
      expect.anything(),
    );
  });
});
