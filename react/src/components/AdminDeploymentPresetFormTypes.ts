/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

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
  port?: number;
  shell?: string;
  startCommand?: string;
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
