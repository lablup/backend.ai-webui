/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { RuntimeParameterValues } from './RuntimeParameterFormSection';

export const STEP_KEYS = ['basic', 'model', 'review'] as const;
export type StepKey = (typeof STEP_KEYS)[number];

export type PreStartActionFormValue = {
  action: string;
  args: string; // JSON string
};

export type ModelHealthCheckFormValue = {
  // Optional at the type level even though the UI marks it required when
  // Health Check is enabled — that's a form-engine `rules` (form-validation)
  // concern, not a TypeScript one, and both DeploymentAddRevisionModal.tsx
  // and this form's initial/unfilled state have it genuinely absent.
  path?: string;
  interval?: number;
  maxRetries?: number;
  maxWaitTime?: number;
  expectedStatusCode?: number;
  initialDelay?: number;
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
  // `startCommand` holds the raw command string typed by the user. On 26.7.0+
  // it is submitted as the single-string `command` (with `shell` derived from
  // the Execution/Shell controls); on older managers it is tokenized into the
  // deprecated `startCommand` list (FR-3205).
  //
  // `shell` is the shell binary for Shell execution; it stays
  // `string | undefined` (never null) so an existing value round-trips on edit
  // and to stay assignable to the create input which forbids null.
  //
  // These leaf names are shared verbatim with `DeploymentAddRevisionModal.tsx`
  // (FR-3474) so a common component can prepend a `namePrefix` without any
  // per-field name mapping. `DeploymentAddRevisionModal.tsx`'s equivalent
  // fields were renamed to match this form's (shorter) names, and the e2e
  // suite that locates them by DOM id (PR #8333/FR-3344) was updated in the
  // same change.
  port?: number;
  shell?: string;
  execution?: 'shell' | 'exec';
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
  // `name`/`modelPath` are optional on PresetModelConfigInput — a user can
  // enable the model definition (e.g. for metadata) without naming a model.
  name?: string;
  modelPath?: string;
  service?: ModelServiceFormValue;
  metadata?: ModelMetadataFormValue;
};

export type ModelDefinitionFormValue = {
  /**
   * UI switch: whether this preset defines a model. The model definition is
   * optional (nullable) — when off, the submit sends `modelDefinition: null`.
   * When on, `name`/`modelPath` are still optional at the field level.
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
