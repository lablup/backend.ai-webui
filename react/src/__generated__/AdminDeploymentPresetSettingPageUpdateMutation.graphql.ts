/**
 * @generated SignedSource<<5de3db48c36d907ee2047cbb09e05d75>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ClusterMode = "MULTI_NODE" | "SINGLE_NODE" | "%future added value";
export type DeploymentStrategyType = "BLUE_GREEN" | "ROLLING" | "%future added value";
export type UpdateDeploymentRevisionPresetInput = {
  bootstrapScript?: string | null | undefined;
  clusterMode?: ClusterMode | null | undefined;
  clusterSize?: number | null | undefined;
  deploymentStrategy?: PresetDeploymentStrategyInput | null | undefined;
  description?: string | null | undefined;
  environ?: ReadonlyArray<EnvironEntryInput> | null | undefined;
  id: string;
  imageId?: string | null | undefined;
  modelDefinition?: ModelDefinitionInput | null | undefined;
  name?: string | null | undefined;
  openToPublic?: boolean | null | undefined;
  presetValues?: ReadonlyArray<DeploymentRevisionPresetValueEntryInput> | null | undefined;
  rank?: number | null | undefined;
  replicaCount?: number | null | undefined;
  resourceOpts?: ReadonlyArray<ResourceOptsEntryInput> | null | undefined;
  resourceSlots?: ReadonlyArray<ResourceSlotEntryInput> | null | undefined;
  revisionHistoryLimit?: number | null | undefined;
  runtimeVariantId?: string | null | undefined;
  startupCommand?: string | null | undefined;
};
export type PresetDeploymentStrategyInput = {
  blueGreen?: BlueGreenConfigInput | null | undefined;
  rollingUpdate?: RollingUpdateConfigInput | null | undefined;
  type: DeploymentStrategyType;
};
export type RollingUpdateConfigInput = {
  maxSurge?: IntOrPercentInput | null | undefined;
  maxUnavailable?: IntOrPercentInput | null | undefined;
};
export type IntOrPercentInput = {
  count?: number | null | undefined;
  percent?: number | null | undefined;
};
export type BlueGreenConfigInput = {
  autoPromote?: boolean;
  promoteDelaySeconds?: number;
};
export type ModelDefinitionInput = {
  models?: ReadonlyArray<ModelConfigInput> | null | undefined;
};
export type ModelConfigInput = {
  metadata?: ModelMetadataInput | null | undefined;
  modelPath?: string | null | undefined;
  name?: string | null | undefined;
  service?: ModelServiceConfigInput | null | undefined;
};
export type ModelServiceConfigInput = {
  healthCheck?: ModelHealthCheckInput | null | undefined;
  port?: number | null | undefined;
  preStartActions?: ReadonlyArray<PreStartActionInput> | null | undefined;
  shell?: string | null | undefined;
  startCommand?: ReadonlyArray<string> | null | undefined;
};
export type PreStartActionInput = {
  action: string;
  args: any;
};
export type ModelHealthCheckInput = {
  enable?: boolean;
  expectedStatusCode?: number | null | undefined;
  initialDelay?: number | null | undefined;
  interval?: number | null | undefined;
  maxRetries?: number | null | undefined;
  maxWaitTime?: number | null | undefined;
  path?: string | null | undefined;
};
export type ModelMetadataInput = {
  architecture?: string | null | undefined;
  author?: string | null | undefined;
  category?: string | null | undefined;
  created?: string | null | undefined;
  description?: string | null | undefined;
  framework?: ReadonlyArray<string> | null | undefined;
  label?: ReadonlyArray<string> | null | undefined;
  lastModified?: string | null | undefined;
  license?: string | null | undefined;
  minResource?: any | null | undefined;
  task?: string | null | undefined;
  title?: string | null | undefined;
  version?: string | null | undefined;
};
export type ResourceSlotEntryInput = {
  quantity: string;
  resourceType: string;
};
export type ResourceOptsEntryInput = {
  name: string;
  value: string;
};
export type EnvironEntryInput = {
  key: string;
  value: string;
};
export type DeploymentRevisionPresetValueEntryInput = {
  presetId: string;
  value: string;
};
export type AdminDeploymentPresetSettingPageUpdateMutation$variables = {
  input: UpdateDeploymentRevisionPresetInput;
};
export type AdminDeploymentPresetSettingPageUpdateMutation$data = {
  readonly adminUpdateDeploymentRevisionPreset: {
    readonly preset: {
      readonly id: string;
      readonly name: string;
    };
  } | null | undefined;
};
export type AdminDeploymentPresetSettingPageUpdateMutation = {
  response: AdminDeploymentPresetSettingPageUpdateMutation$data;
  variables: AdminDeploymentPresetSettingPageUpdateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "UpdateDeploymentRevisionPresetPayload",
    "kind": "LinkedField",
    "name": "adminUpdateDeploymentRevisionPreset",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "DeploymentRevisionPreset",
        "kind": "LinkedField",
        "name": "preset",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AdminDeploymentPresetSettingPageUpdateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminDeploymentPresetSettingPageUpdateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "dd29e64106d53e3bee3f8eb0571b00cf",
    "id": null,
    "metadata": {},
    "name": "AdminDeploymentPresetSettingPageUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation AdminDeploymentPresetSettingPageUpdateMutation(\n  $input: UpdateDeploymentRevisionPresetInput!\n) {\n  adminUpdateDeploymentRevisionPreset(input: $input) {\n    preset {\n      id\n      name\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "26a49581cab22af4d524e1872724ae7a";

export default node;
