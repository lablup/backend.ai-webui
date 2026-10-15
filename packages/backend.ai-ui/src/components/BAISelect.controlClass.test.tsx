/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Astryx 0.7.0 fields take no root `className` / `style`, so BAISelect hands
 * its own to the control box, where BAISelect.css looks for them (#10343).
 */
import BAISelect from './BAISelect';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const controlBox = () =>
  document
    .querySelector("button[aria-haspopup='listbox']")
    ?.closest<HTMLElement>('.bai-select') ?? null;

describe('BAISelect control class and style', () => {
  it('puts the caller className, its own class and the style on the control box', () => {
    render(
      <BAISelect
        label="Host"
        className="caller-class"
        style={{ flex: 1 }}
        value="a"
        options={[{ label: 'a', value: 'a' }]}
      />,
    );
    const box = controlBox();
    expect(box).not.toBeNull();
    expect(box).toHaveClass('caller-class');
    expect(box?.style.flex).toBe('1 1 0%');
  });

  it('marks a rich-label trigger so the plain value text is hidden', () => {
    render(
      <BAISelect
        label="Host"
        optionLabelProp="children"
        value="local:volume1"
        options={[
          { label: <strong>local:volume1</strong>, value: 'local:volume1' },
        ]}
      />,
    );
    expect(controlBox()).toHaveClass('bai-select-rich-trigger');
  });

  it('keeps the ghost class', () => {
    render(
      <BAISelect label="Host" ghost options={[{ label: 'a', value: 'a' }]} />,
    );
    expect(controlBox()).toHaveClass('bai-select-ghost');
  });
});
