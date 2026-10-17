/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/
import {
  BAIPowerSearchEditor,
  baiPowerSearchComponents,
  useRenderInputEditors,
  type FilterRenderInput,
} from './BAIPowerSearchAdapters';
import BAIPropertyFilter from './BAIPropertyFilter';
import type { PowerSearchConfig } from '@lablup/ui-common/PowerSearch';
import { render, renderHook, screen } from '@testing-library/react';
import * as _ from 'lodash-es';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

describe('BAIPowerSearchEditor', () => {
  const config: PowerSearchConfig = {
    name: 'test',
    fields: [
      {
        key: 'createdAt',
        label: 'Created At',
        operators: [
          { key: 'after', label: 'after', value: { type: 'date_absolute' } },
        ],
      },
    ],
  };

  it('wraps the Astryx editor in the class hook its stylesheet targets', () => {
    const { container } = render(
      <BAIPowerSearchEditor
        config={config}
        filter={{ field: 'createdAt', operator: 'after' }}
        mode="create"
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    const hook = container.querySelector('.bai-power-search-editor');
    expect(hook).not.toBeNull();
    expect(hook).toContainElement(screen.getByLabelText('Field'));
  });

  it('registers that editor for every operator value type', () => {
    expect(
      _.every(
        _.values(baiPowerSearchComponents),
        (override) => override.Editor === BAIPowerSearchEditor,
      ),
    ).toBe(true);
  });
});

/*
 #10289 — the clear-all (x) sits in an absolutely positioned lane, so a chip
 could run under it and lose its remove (x) clicks to the lane.
 `BAIPowerSearchAdapters.css` pads the tokenizer wrapper by the lane width
 Astryx publishes on the lane's parent (`--_tokenizer-end-lane-reserve`).
 jsdom has no layout, so these pin the two things that rule depends on: the
 DOM it selects (lane and chips under the same `.astryx-tokenizer` inside
 `.bai-power-search`) and the rule itself.
*/
describe('clear-all lane reserve (#10289)', () => {
  it('keeps the clear-all lane and the chips in the wrapper the rule pads', () => {
    render(
      <BAIPropertyFilter
        filterProperties={[
          { key: 'name', propertyLabel: 'Name', type: 'string' },
        ]}
        value={'name ilike "%data%"'}
        onChange={() => {}}
      />,
    );

    const clearAll = screen.getByRole('button', { name: 'Clear all' });
    const wrapper = clearAll.closest('.astryx-tokenizer');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.closest('.bai-power-search')).not.toBeNull();
    // useEndLaneReserve writes the variable on the lane's parent element.
    const lane = _.find(Array.from(wrapper?.children ?? []), (child) =>
      child.contains(clearAll),
    );
    expect(lane?.parentElement).toBe(wrapper);
    expect(wrapper?.querySelector('.astryx-token')).not.toBeNull();
  });

  it('pads the wrapper with chips by the published lane reserve', () => {
    const adapterCss = readFileSync(
      resolve(__dirname, 'BAIPowerSearchAdapters.css'),
      'utf8',
    );
    expect(adapterCss.replace(/\s+/g, ' ')).toContain(
      '.bai-power-search .astryx-tokenizer:has(.astryx-token) { padding-inline-end: calc( var(--_tokenizer-end-lane-reserve, 0px) + var(--spacing-1) - 1px ); }',
    );
  });
});
