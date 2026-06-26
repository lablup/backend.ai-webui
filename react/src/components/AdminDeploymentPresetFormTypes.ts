/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { RuntimeParameterValues } from './RuntimeParameterFormSection';

export const STEP_KEYS = ['basic', 'model', 'review'] as const;
export type StepKey = (typeof STEP_KEYS)[number];

export type ModelHealthCheckFormValue = {
  path: string;
  interval?: number;
  maxRetries?: number;
  maxWaitTime?: number;
  expectedStatusCode?: number;
  initialDelay?: number;
};

export type PreStartActionFormValue = {
  action: string;
  args: string; // JSON string
};

export type ModelServiceFormValue = {
  // `service` itself is optional on a model, but when present `port` /
  // `startCommand` are always provided by the form, which marks them
  // `required` (see AdminDeploymentPresetModelConfigItem). Of these the create
  // input (PresetModelServiceConfigInput) only requires `port` non-null;
  // `startCommand` became optional/deprecated in 26.7.0 (superseded by the
  // single-string `command`), but this form still emits `startCommand`, so it
  // stays required at the UI level.
  //
  // `shell` is optional (26.7.0 made the output nullable): leaving it blank
  // omits it on submit — create falls back to the server default `/bin/bash`,
  // update stores null (the model definition is replaced wholesale). Kept as
  // `string | undefined` (never null) so the shared submit object stays
  // assignable to the create input, which forbids null.
  port: number;
  shell?: string;
  startCommand: string;
  preStartActions?: PreStartActionFormValue[];
  enableHealthCheck?: boolean;
  healthCheck?: ModelHealthCheckFormValue;
};

export type ModelMetadataFormValue = {
  author?: string;
  title?: string;
  version?: string;
  description?: string;
  task?: string;
  category?: string;
  architecture?: string;
  framework?: string[];
  label?: string[];
  license?: string;
};

export type ModelConfigFormValue = {
  name: string;
  modelPath: string;
  service?: ModelServiceFormValue;
  metadata?: ModelMetadataFormValue;
};

export type ModelDefinitionFormValue = {
  /**
   * UI switch: whether this preset defines a model. The model definition is
   * optional (nullable) — when off, the submit sends `modelDefinition: null`;
   * when on, the single model's sub-fields are required.
   */
  enabled?: boolean;
  models?: ModelConfigFormValue[];
};

export type AdminDeploymentPresetFormValue = {
  name: string;
  description?: string;
  /** UUID of the selected runtime variant (editable in both create and edit). */
  runtimeVariantId: string;
  /** UUID of the selected image. */
  imageId: string;
  /** Required CPU allocation (e.g. "4"). */
  cpu: string;
  /** Required memory allocation (e.g. "16"). */
  mem: string;
  clusterMode?: 'SINGLE_NODE' | 'MULTI_NODE';
  clusterSize?: number;
  startupCommand?: string;
  bootstrapScript?: string;
  environ?: Array<{ variable: string; value: string }>;
  resourceSlots?: Array<{ resourceType: string; quantity: string }>;
  resourceOpts?: Array<{ name: string; value: string }>;
  modelDefinition?: ModelDefinitionFormValue;
  openToPublic?: boolean;
  replicaCount?: number;
  revisionHistoryLimit?: number;
  /**
   * Runtime-variant preset parameter values keyed by preset key, registered by
   * RuntimeParameterFormSection under the `runtimeParams` namespace. Native-typed
   * (number/boolean/string); serialized to the API's string encoding at submit.
   */
  runtimeParams?: RuntimeParameterValues;
};

export type ResourceSlotTypeInfo = {
  id: string;
  slotName: string;
  slotType: string;
  displayName: string;
  displayUnit: string;
  numberFormat?: {
    binary: boolean;
    roundLength: number;
  } | null;
};
