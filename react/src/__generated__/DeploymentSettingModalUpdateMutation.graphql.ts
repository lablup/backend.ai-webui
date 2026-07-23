/**
 * @generated SignedSource<<5a3a79adc3a1cafc87a22671177ec161>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeploymentStrategyType = "BLUE_GREEN" | "ROLLING" | "%future added value";
export type UpdateDeploymentInput = {
  defaultDeploymentStrategy?: DeploymentStrategyInput | null | undefined;
  id: string;
  name?: string | null | undefined;
  openToPublic?: boolean | null | undefined;
  preferredDomainName?: string | null | undefined;
  replicaCount?: number | null | undefined;
  tags?: ReadonlyArray<string> | null | undefined;
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
export type DeploymentSettingModalUpdateMutation$variables = {
  input: UpdateDeploymentInput;
};
export type DeploymentSettingModalUpdateMutation$data = {
  readonly updateModelDeployment: {
    readonly deployment: {
      readonly id: string;
    };
  } | null | undefined;
};
export type DeploymentSettingModalUpdateMutation = {
  response: DeploymentSettingModalUpdateMutation$data;
  variables: DeploymentSettingModalUpdateMutation$variables;
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
    "concreteType": "UpdateDeploymentPayload",
    "kind": "LinkedField",
    "name": "updateModelDeployment",
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
    "name": "DeploymentSettingModalUpdateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentSettingModalUpdateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "94d32eceeac74ffa680649dbc39dc4e1",
    "id": null,
    "metadata": {},
    "name": "DeploymentSettingModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation DeploymentSettingModalUpdateMutation(\n  $input: UpdateDeploymentInput!\n) {\n  updateModelDeployment(input: $input) {\n    deployment {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "614463acb88e639fdcf663e2c35779a4";

export default node;
