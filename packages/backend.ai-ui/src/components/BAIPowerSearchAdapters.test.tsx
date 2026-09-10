/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/
import {
  useRenderInputEditors,
  type FilterRenderInput,
} from './BAIPowerSearchAdapters';
import { render, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const editorFor = (renderInput: FilterRenderInput) => {
  const recordLabel = vi.fn();
  const { result } = renderHook(() =>
    useRenderInputEditors({
      recordLabel,
      resolveLabel: (_property, value) => value,
    }),
  );
  const operatorValue = result.current.operatorValueFor('owner', renderInput);
  if (!operatorValue) throw new Error('expected a custom operator value');
  return { Editor: operatorValue.Editor, recordLabel };
};

describe('useRenderInputEditors', () => {
  it('passes the staged value and disabled state to renderInput', () => {
    const renderInput = vi.fn<FilterRenderInput>(() => null);
    const { Editor } = editorFor(renderInput);

    render(<Editor onChange={vi.fn()} placeholder="" value="u-1" isDisabled />);

    expect(renderInput).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'u-1', isDisabled: true }),
    );
  });

  it('records the label and stages the value through onAddCondition', () => {
    const renderInput = vi.fn<FilterRenderInput>(() => null);
    const { Editor, recordLabel } = editorFor(renderInput);
    const onChange = vi.fn();

    render(<Editor onChange={onChange} placeholder="" value={null} />);
    renderInput.mock.calls[0][0].onAddCondition('u-2', 'bob');

    expect(recordLabel).toHaveBeenCalledWith('owner', 'u-2', 'bob');
    expect(onChange).toHaveBeenCalledWith('u-2');
  });
});
