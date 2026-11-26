/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Astryx fields take no root `className` / `style`: BAISelect adds its own class
 * to the control box, beside the caller's `controlClassName` (#10343).
 */
import BAISelect from './BAISelect';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const controlBox = () =>
  document
    .querySelector("button[aria-haspopup='listbox']")
    ?.closest<HTMLElement>('.bai-select') ?? null;

describe('BAISelect control class and style', () => {
  it('puts the caller controlClassName and controlStyle on the control box', () => {
    render(
      <BAISelect
        aria-label="Host"
        controlClassName="caller-class"
        controlStyle={{ flex: 1 }}
        value="a"
        options={[{ label: 'a', value: 'a' }]}
      />,
    );
    const box = controlBox();
    expect(box).not.toBeNull();
    expect(box).toHaveClass('caller-class');
    expect(box?.style.flex).toBe('1 1 0%');
  });

  it('adds the ghost class', () => {
    render(
      <BAISelect
        aria-label="Host"
        ghost
        options={[{ label: 'a', value: 'a' }]}
      />,
    );
    expect(controlBox()).toHaveClass('bai-select-ghost');
  });
});
