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

  it('prefers an explicit option label over the flattened children text (FR-3544)', () => {
    // The flattener cannot see Badge/tag props, so the call site names the text.
    render(
      <BAISelect label="Version" value="cr.backend.ai/stable/pytorch:2.1.0">
        <SelectOptGroup key="v" label="Versions">
          <SelectOption
            key="cr.backend.ai/stable/pytorch:2.1.0"
            value="cr.backend.ai/stable/pytorch:2.1.0"
            label={'2.1.0 | x86_64 | CUDA 12.1'}
          >
            <span>2.1.0</span>
            <span>x86_64</span>
          </SelectOption>
        </SelectOptGroup>
      </BAISelect>,
    );
    expect(triggerText()).toBe('2.1.0 | x86_64 | CUDA 12.1');
  });

  it('renders the option node on the trigger with optionLabelProp="children" (FR-3544)', () => {
    const { container } = render(
      <BAISelect
        label="Environments"
        optionLabelProp="children"
        value="cr.backend.ai/stable/pytorch"
      >
        <SelectOptGroup key="ml" label="Machine Learning">
          <SelectOption
            key="cr.backend.ai/stable/pytorch"
            value="cr.backend.ai/stable/pytorch"
            label="PyTorch (GPU)"
          >
            <span data-testid="rich-row">PyTorch</span>
            <span>GPU</span>
          </SelectOption>
        </SelectOptGroup>
      </BAISelect>,
    );
    const richValue = container.querySelector('.bai-select-rich-value');
    expect(richValue?.querySelector('[data-testid="rich-row"]')).not.toBeNull();
    // The string label stays the trigger button's accessible text — the rich
    // node must not leak into it.
    expect(triggerText()).toBe('PyTorch (GPU)');
  });

  it('keeps the plain trigger when nothing is selected or without the opt-in', () => {
    const richless = render(
      <BAISelect label="Environments" value="a">
        <SelectOptGroup key="g" label="G">
          <SelectOption key="a" value="a" label="A">
            <span>A</span>
          </SelectOption>
        </SelectOptGroup>
      </BAISelect>,
    );
    expect(
      richless.container.querySelector('.bai-select-rich-trigger'),
    ).toBeNull();
    richless.unmount();

    const empty = render(
      <BAISelect label="Environments" optionLabelProp="children">
        <SelectOptGroup key="g" label="G">
          <SelectOption key="a" value="a" label="A">
            <span>A</span>
          </SelectOption>
        </SelectOptGroup>
      </BAISelect>,
    );
    expect(
      empty.container.querySelector('.bai-select-rich-trigger'),
    ).toBeNull();
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
