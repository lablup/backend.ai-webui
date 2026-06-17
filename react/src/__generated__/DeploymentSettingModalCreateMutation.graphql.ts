/**
 * @generated SignedSource<<34b726bb12703b5a243b6d23d30745ac>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ClusterMode = "MULTI_NODE" | "SINGLE_NODE" | "%future added value";
export type DeploymentStrategyType = "BLUE_GREEN" | "ROLLING" | "%future added value";
export type CreateDeploymentInput = {
  defaultDeploymentStrategy: DeploymentStrategyInput;
  initialRevision?: CreateRevisionInput | null | undefined;
  metadata: ModelDeploymentMetadataInput;
  networkAccess: ModelDeploymentNetworkAccessInput;
  replicaCount: number;
};
export type ModelDeploymentMetadataInput = {
  domainName: string;
  name?: string | null | undefined;
  projectId: string;
  resourceGroupName: string;
  tags?: ReadonlyArray<string> | null | undefined;
};
export type ModelDeploymentNetworkAccessInput = {
  openToPublic?: boolean;
  preferredDomainName?: string | null | undefined;
};
export type DeploymentStrategyInput = {
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
export type CreateRevisionInput = {
  clusterConfig: ClusterConfigInput;
  extraMounts?: ReadonlyArray<ExtraVFolderMountInput> | null | undefined;
  image: ImageInput;
  modelDefinition?: ModelDefinitionInput | null | undefined;
  modelMountConfig: ModelMountConfigInput;
  modelRuntimeConfig: ModelRuntimeConfigInput;
  resourceConfig: ResourceConfigInput;
  revisionPresetId?: string | null | undefined;
};
export type ClusterConfigInput = {
  mode: ClusterMode;
  size: number;
};
export type ResourceConfigInput = {
  resourceOpts?: ResourceOptsInput | null | undefined;
  resourceSlots: ResourceSlotInput;
};
export type ResourceSlotInput = {
  entries: ReadonlyArray<ResourceSlotEntryInput>;
};
export type ResourceSlotEntryInput = {
  quantity: string;
  resourceType: string;
};
export type ResourceOptsInput = {
  entries: ReadonlyArray<ResourceOptsEntryInput>;
};
export type ResourceOptsEntryInput = {
  name: string;
  value: string;
};
export type ImageInput = {
  id: string;
};
export type ModelRuntimeConfigInput = {
  environ?: EnvironmentVariablesInput | null | undefined;
  runtimeVariantId: string;
  runtimeVariantPresetValues?: ReadonlyArray<RuntimeVariantPresetValueInput> | null | undefined;
};
export type EnvironmentVariablesInput = {
  entries: ReadonlyArray<EnvironmentVariableEntryInput>;
};
export type EnvironmentVariableEntryInput = {
  name: string;
  value: string;
};
export type RuntimeVariantPresetValueInput = {
  presetId: string;
  value: string;
};
export type ModelMountConfigInput = {
  definitionPath?: string | null | undefined;
  mountDestination: string;
  subpath?: string | null | undefined;
  vfolderId: string;
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
export type ExtraVFolderMountInput = {
  mountDestination?: string | null | undefined;
  subpath?: string | null | undefined;
  vfolderId: string;
};
export type DeploymentSettingModalCreateMutation$variables = {
  input: CreateDeploymentInput;
};
export type DeploymentSettingModalCreateMutation$data = {
  readonly createModelDeployment: {
    readonly deployment: {
      readonly id: string;
    };
  } | null | undefined;
};
export type DeploymentSettingModalCreateMutation = {
  response: DeploymentSettingModalCreateMutation$data;
  variables: DeploymentSettingModalCreateMutation$variables;
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
    "concreteType": "CreateDeploymentPayload",
    "kind": "LinkedField",
    "name": "createModelDeployment",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
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
    "name": "DeploymentSettingModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentSettingModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "00cc34934f1d215d857c9a401f1ae7c3",
    "id": null,
    "metadata": {},
    "name": "DeploymentSettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation DeploymentSettingModalCreateMutation(\n  $input: CreateDeploymentInput!\n) {\n  createModelDeployment(input: $input) {\n    deployment {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3121181d35d8561977fe7fcb69126cd0";

export default node;
