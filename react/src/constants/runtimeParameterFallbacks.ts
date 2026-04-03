/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

// TODO(needs-backend): FR-2446
// This entire file is a frontend fallback. Once the server extends
// RuntimeVariantPreset.target_spec with category, ui_type, min, max, step,
// and options fields, these constants should be replaced by server-provided data.

export type RuntimeParameterCategory = 'sampling' | 'context' | 'advanced';

export type RuntimeParameterUIType =
  | 'slider'
  | 'number_input'
  | 'select'
  | 'checkbox'
  | 'text_input';

export interface SelectOption {
  value: string;
  label: string;
}

export interface RuntimeParameterDef {
  /** Display name (i18n key) */
  name: string;
  /** Description (i18n key) */
  description: string;
  /** Category for UI grouping */
  category: RuntimeParameterCategory;
  /** UI component type */
  uiType: RuntimeParameterUIType;
  /** Value type for parsing/serialization */
  valueType: 'float' | 'int' | 'bool' | 'str';
  /** CLI flag key (e.g., "--temperature") */
  key: string;
  /** Default value (as string) */
  defaultValue: string;
  /** Min value for numeric types */
  min?: number;
  /** Max value for numeric types */
  max?: number;
  /** Step for slider/number_input */
  step?: number;
  /** Options for select type */
  options?: SelectOption[];
  /** Display order within category (lower = higher priority) */
  rank: number;
}

// TODO(needs-backend): FR-2446
const VLLM_SAMPLING_PARAMS: RuntimeParameterDef[] = [
  {
    name: 'runtimeParam.temperature',
    description: 'runtimeParam.temperatureDesc',
    category: 'sampling',
    uiType: 'slider',
    valueType: 'float',
    key: '--temperature',
    defaultValue: '0.8',
    min: 0.0,
    max: 2.0,
    step: 0.05,
    rank: 1,
  },
  {
    name: 'runtimeParam.topP',
    description: 'runtimeParam.topPDesc',
    category: 'sampling',
    uiType: 'slider',
    valueType: 'float',
    key: '--top-p',
    defaultValue: '0.9',
    min: 0.0,
    max: 1.0,
    step: 0.05,
    rank: 2,
  },
  {
    name: 'runtimeParam.topK',
    description: 'runtimeParam.topKDesc',
    category: 'sampling',
    uiType: 'slider',
    valueType: 'int',
    key: '--top-k',
    defaultValue: '40',
    min: -1,
    max: 100,
    step: 1,
    rank: 3,
  },
  {
    name: 'runtimeParam.minP',
    description: 'runtimeParam.minPDesc',
    category: 'sampling',
    uiType: 'slider',
    valueType: 'float',
    key: '--min-p',
    defaultValue: '0.1',
    min: 0.0,
    max: 1.0,
    step: 0.05,
    rank: 4,
  },
  {
    name: 'runtimeParam.frequencyPenalty',
    description: 'runtimeParam.frequencyPenaltyDesc',
    category: 'sampling',
    uiType: 'slider',
    valueType: 'float',
    key: '--frequency-penalty',
    defaultValue: '0.0',
    min: 0.0,
    max: 2.0,
    step: 0.1,
    rank: 5,
  },
  {
    name: 'runtimeParam.presencePenalty',
    description: 'runtimeParam.presencePenaltyDesc',
    category: 'sampling',
    uiType: 'slider',
    valueType: 'float',
    key: '--presence-penalty',
    defaultValue: '0.0',
    min: 0.0,
    max: 2.0,
    step: 0.1,
    rank: 6,
  },
  {
    name: 'runtimeParam.repetitionPenalty',
    description: 'runtimeParam.repetitionPenaltyDesc',
    category: 'sampling',
    uiType: 'slider',
    valueType: 'float',
    key: '--repetition-penalty',
    defaultValue: '1.0',
    min: 1.0,
    max: 2.0,
    step: 0.05,
    rank: 7,
  },
  {
    name: 'runtimeParam.seed',
    description: 'runtimeParam.seedDesc',
    category: 'sampling',
    uiType: 'number_input',
    valueType: 'int',
    key: '--seed',
    defaultValue: '-1',
    min: -1,
    max: 2147483647,
    step: 1,
    rank: 8,
  },
];

// TODO(needs-backend): FR-2446
const VLLM_CONTEXT_PARAMS: RuntimeParameterDef[] = [
  {
    name: 'runtimeParam.maxModelLen',
    description: 'runtimeParam.maxModelLenDesc',
    category: 'context',
    uiType: 'slider',
    valueType: 'int',
    key: '--max-model-len',
    defaultValue: '4096',
    min: 512,
    max: 131072,
    step: 512,
    rank: 1,
  },
  {
    name: 'runtimeParam.gpuMemoryUtilization',
    description: 'runtimeParam.gpuMemoryUtilizationDesc',
    category: 'context',
    uiType: 'slider',
    valueType: 'float',
    key: '--gpu-memory-utilization',
    defaultValue: '0.9',
    min: 0.0,
    max: 1.0,
    step: 0.05,
    rank: 2,
  },
];

// TODO(needs-backend): FR-2446
const VLLM_ADVANCED_PARAMS: RuntimeParameterDef[] = [
  {
    name: 'runtimeParam.enforceEager',
    description: 'runtimeParam.enforceEagerDesc',
    category: 'advanced',
    uiType: 'checkbox',
    valueType: 'bool',
    key: '--enforce-eager',
    defaultValue: 'false',
    rank: 1,
  },
  {
    name: 'runtimeParam.dtype',
    description: 'runtimeParam.dtypeDesc',
    category: 'advanced',
    uiType: 'select',
    valueType: 'str',
    key: '--dtype',
    defaultValue: 'auto',
    options: [
      { value: 'auto', label: 'Auto' },
      { value: 'float16', label: 'float16' },
      { value: 'bfloat16', label: 'bfloat16' },
      { value: 'float32', label: 'float32' },
    ],
    rank: 2,
  },
  {
    name: 'runtimeParam.kvCacheDtype',
    description: 'runtimeParam.kvCacheDtypeDesc',
    category: 'advanced',
    uiType: 'select',
    valueType: 'str',
    key: '--kv-cache-dtype',
    defaultValue: 'auto',
    options: [
      { value: 'auto', label: 'Auto' },
      { value: 'f32', label: 'f32' },
      { value: 'f16', label: 'f16' },
      { value: 'bf16', label: 'bf16' },
      { value: 'q8_0', label: 'q8_0' },
      { value: 'q4_0', label: 'q4_0' },
      { value: 'q4_1', label: 'q4_1' },
      { value: 'q5_0', label: 'q5_0' },
      { value: 'q5_1', label: 'q5_1' },
    ],
    rank: 3,
  },
  {
    name: 'runtimeParam.trustRemoteCode',
    description: 'runtimeParam.trustRemoteCodeDesc',
    category: 'advanced',
    uiType: 'checkbox',
    valueType: 'bool',
    key: '--trust-remote-code',
    defaultValue: 'false',
    rank: 4,
  },
];

// TODO(needs-backend): FR-2446
const SGLANG_SAMPLING_PARAMS: RuntimeParameterDef[] = VLLM_SAMPLING_PARAMS.map(
  (param) => ({ ...param }),
);

// TODO(needs-backend): FR-2446
const SGLANG_CONTEXT_PARAMS: RuntimeParameterDef[] = [
  {
    name: 'runtimeParam.contextLength',
    description: 'runtimeParam.maxModelLenDesc',
    category: 'context',
    uiType: 'slider',
    valueType: 'int',
    key: '--context-length',
    defaultValue: '4096',
    min: 512,
    max: 131072,
    step: 512,
    rank: 1,
  },
  {
    name: 'runtimeParam.memFractionStatic',
    description: 'runtimeParam.gpuMemoryUtilizationDesc',
    category: 'context',
    uiType: 'slider',
    valueType: 'float',
    key: '--mem-fraction-static',
    defaultValue: '0.9',
    min: 0.0,
    max: 1.0,
    step: 0.05,
    rank: 2,
  },
];

// TODO(needs-backend): FR-2446
const SGLANG_ADVANCED_PARAMS: RuntimeParameterDef[] = [
  {
    name: 'runtimeParam.disableCudaGraph',
    description: 'runtimeParam.disableCudaGraphDesc',
    category: 'advanced',
    uiType: 'checkbox',
    valueType: 'bool',
    key: '--disable-cuda-graph',
    defaultValue: 'false',
    rank: 1,
  },
  {
    name: 'runtimeParam.dtype',
    description: 'runtimeParam.dtypeDesc',
    category: 'advanced',
    uiType: 'select',
    valueType: 'str',
    key: '--dtype',
    defaultValue: 'auto',
    options: [
      { value: 'auto', label: 'Auto' },
      { value: 'float16', label: 'float16' },
      { value: 'bfloat16', label: 'bfloat16' },
      { value: 'float32', label: 'float32' },
    ],
    rank: 2,
  },
  {
    name: 'runtimeParam.kvCacheDtype',
    description: 'runtimeParam.kvCacheDtypeDesc',
    category: 'advanced',
    uiType: 'select',
    valueType: 'str',
    key: '--kv-cache-dtype',
    defaultValue: 'auto',
    options: [
      { value: 'auto', label: 'Auto' },
      { value: 'f32', label: 'f32' },
      { value: 'f16', label: 'f16' },
      { value: 'bf16', label: 'bf16' },
      { value: 'q8_0', label: 'q8_0' },
      { value: 'q4_0', label: 'q4_0' },
      { value: 'q4_1', label: 'q4_1' },
      { value: 'q5_0', label: 'q5_0' },
      { value: 'q5_1', label: 'q5_1' },
    ],
    rank: 3,
  },
  {
    name: 'runtimeParam.trustRemoteCode',
    description: 'runtimeParam.trustRemoteCodeDesc',
    category: 'advanced',
    uiType: 'checkbox',
    valueType: 'bool',
    key: '--trust-remote-code',
    defaultValue: 'false',
    rank: 4,
  },
];

/**
 * Fallback parameter metadata per runtime variant.
 * Used when the server does not yet provide extended target_spec fields.
 */
// TODO(needs-backend): FR-2446
export const RUNTIME_PARAMETER_FALLBACKS: Record<
  string,
  RuntimeParameterDef[]
> = {
  vllm: [
    ...VLLM_SAMPLING_PARAMS,
    ...VLLM_CONTEXT_PARAMS,
    ...VLLM_ADVANCED_PARAMS,
  ],
  sglang: [
    ...SGLANG_SAMPLING_PARAMS,
    ...SGLANG_CONTEXT_PARAMS,
    ...SGLANG_ADVANCED_PARAMS,
  ],
};

/**
 * Get the extra args environment variable name for a given runtime variant.
 */
export function getExtraArgsEnvVar(runtimeVariant: string): string | undefined {
  const mapping: Record<string, string> = {
    vllm: 'VLLM_EXTRA_ARGS',
    sglang: 'SGLANG_EXTRA_ARGS',
  };
  return mapping[runtimeVariant];
}
