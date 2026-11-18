/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { RuntimeParameterGroup } from '../../../hooks/useRuntimeParameterSchema';
import {
  effectiveTensorParallelValue,
  findTensorParallelParam,
  fgpuQuantityFromResourceSlots,
  tensorParallelFgpuWarningKind,
} from './tensorParallelWarning';

const tpParam = {
  entityId: 'tp-uuid',
  name: 'tensor_parallel_size',
  description: null,
  rank: 0,
  category: null,
  displayName: 'Tensor Parallel Size',
  presetTarget: 'ENV' as const,
  valueType: 'INT' as const,
  defaultValue: '1',
  key: 'VLLM_TENSOR_PARALLEL_SIZE',
  uiType: 'select' as const,
  slider: null,
  number: null,
  choices: null,
  text: null,
  required: false,
};

const groups: RuntimeParameterGroup[] = [
  { category: 'parallelism', params: [tpParam] },
];

describe('findTensorParallelParam', () => {
  it('finds the parameter by its tensor-parallel display name', () => {
    expect(findTensorParallelParam(groups)).toBe(tpParam);
  });

  it('finds the parameter by a short TP key', () => {
    const shortKeyGroups: RuntimeParameterGroup[] = [
      {
        category: 'parallelism',
        params: [{ ...tpParam, key: '--tp', displayName: null, name: 'tp' }],
      },
    ];
    expect(findTensorParallelParam(shortKeyGroups)?.key).toBe('--tp');
  });

  it('returns null when the variant has no TP parameter', () => {
    const otherGroups: RuntimeParameterGroup[] = [
      {
        category: 'sampling',
        params: [
          {
            ...tpParam,
            key: '--temperature',
            name: 'temperature',
            displayName: null,
          },
        ],
      },
    ];
    expect(findTensorParallelParam(otherGroups)).toBeNull();
    expect(findTensorParallelParam(null)).toBeNull();
  });

  it('does not match keys that merely contain tp inside a word', () => {
    const httpGroups: RuntimeParameterGroup[] = [
      {
        category: 'network',
        params: [
          { ...tpParam, key: 'http_port', displayName: null, name: 'port' },
        ],
      },
    ];
    expect(findTensorParallelParam(httpGroups)).toBeNull();
  });

  it('does not match INT/FLOAT keys with a delimited tp token inside a longer name', () => {
    const tpEpochGroups: RuntimeParameterGroup[] = [
      {
        category: 'training',
        params: [
          {
            ...tpParam,
            key: 'MAX_TP_EPOCHS',
            displayName: null,
            name: 'max_tp_epochs',
          },
        ],
      },
    ];
    expect(findTensorParallelParam(tpEpochGroups)).toBeNull();
  });

  it('prefers a numeric namesake over a non-numeric one', () => {
    const mixedGroups: RuntimeParameterGroup[] = [
      {
        category: 'parallelism',
        params: [
          {
            ...tpParam,
            key: 'TENSOR_PARALLEL_MODE',
            valueType: 'STR' as const,
            defaultValue: 'auto',
          },
          tpParam,
        ],
      },
    ];
    expect(findTensorParallelParam(mixedGroups)?.key).toBe(
      'VLLM_TENSOR_PARALLEL_SIZE',
    );
  });
});

describe('effectiveTensorParallelValue', () => {
  it('prefers the user-entered value over the default', () => {
    expect(
      effectiveTensorParallelValue(tpParam, { VLLM_TENSOR_PARALLEL_SIZE: 2 }),
    ).toBe(2);
  });

  it('falls back to the parameter default when untouched', () => {
    expect(effectiveTensorParallelValue(tpParam, {})).toBe(1);
    expect(effectiveTensorParallelValue(tpParam, undefined)).toBe(1);
  });

  it('returns null when neither a value nor a usable default exists', () => {
    expect(
      effectiveTensorParallelValue({ ...tpParam, defaultValue: null }, {}),
    ).toBeNull();
  });
});

describe('tensorParallelFgpuWarningKind', () => {
  it('raises no warning for a single TP over a fractional share of one GPU', () => {
    expect(tensorParallelFgpuWarningKind(1, 0.5)).toBeNull();
    expect(tensorParallelFgpuWarningKind(1, 0.6)).toBeNull();
    expect(tensorParallelFgpuWarningKind(1, 1)).toBeNull();
  });

  it('raises the mismatch warning when the fGPU quantity is below the TP value', () => {
    expect(tensorParallelFgpuWarningKind(2, 1)).toBe('mismatch');
    expect(tensorParallelFgpuWarningKind(4, 2)).toBe('mismatch');
  });

  it('raises the non-integer warning for TP 2+ with a fractional fGPU quantity', () => {
    expect(tensorParallelFgpuWarningKind(2, 1.5)).toBe('nonInteger');
    expect(tensorParallelFgpuWarningKind(4, 0.5)).toBe('nonInteger');
  });

  it('raises no warning when the fGPU quantity meets or exceeds the TP value', () => {
    expect(tensorParallelFgpuWarningKind(2, 2)).toBeNull();
    expect(tensorParallelFgpuWarningKind(1, 2)).toBeNull();
    expect(tensorParallelFgpuWarningKind(2, 3)).toBeNull();
  });
});

describe('fgpuQuantityFromResourceSlots', () => {
  it('reads the shares slot quantity', () => {
    expect(
      fgpuQuantityFromResourceSlots([
        { slotName: 'cpu', quantity: '4' },
        { slotName: 'mem', quantity: '16g' },
        { slotName: 'cuda.shares', quantity: '0.5' },
      ]),
    ).toBe(0.5);
  });

  it('returns null when no shares slot is requested', () => {
    expect(
      fgpuQuantityFromResourceSlots([
        { slotName: 'cuda.device', quantity: '2' },
      ]),
    ).toBeNull();
  });
});
