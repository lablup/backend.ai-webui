/**
 * @generated SignedSource<<517a23e984bd7da635e78813ed230801>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpdateProjectResourcePolicyInput = {
  maxNetworkCount?: number | null | undefined;
  maxQuotaScopeSize?: BinarySizeInput | null | undefined;
  maxVfolderCount?: number | null | undefined;
};
export type BinarySizeInput = {
  expr: string;
};
export type ProjectResourcePolicyV2SettingModalModifyMutation$variables = {
  input: UpdateProjectResourcePolicyInput;
  name: string;
};
export type ProjectResourcePolicyV2SettingModalModifyMutation$data = {
  readonly adminUpdateProjectResourcePolicyV2: {
    readonly projectResourcePolicy: {
      readonly createdAt: string | null | undefined;
      readonly id: string;
      readonly maxNetworkCount: number;
      readonly maxQuotaScopeSize: {
        readonly expr: string;
      };
      readonly maxVfolderCount: number;
      readonly name: string;
    };
  } | null | undefined;
};
export type ProjectResourcePolicyV2SettingModalModifyMutation = {
  response: ProjectResourcePolicyV2SettingModalModifyMutation$data;
  variables: ProjectResourcePolicyV2SettingModalModifyMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "name"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      },
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      }
    ],
    "concreteType": "UpdateProjectResourcePolicyPayload",
    "kind": "LinkedField",
    "name": "adminUpdateProjectResourcePolicyV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ProjectResourcePolicyV2",
        "kind": "LinkedField",
        "name": "projectResourcePolicy",
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "createdAt",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "maxVfolderCount",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "BinarySizeInfo",
            "kind": "LinkedField",
            "name": "maxQuotaScopeSize",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "expr",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "maxNetworkCount",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ProjectResourcePolicyV2SettingModalModifyMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "ProjectResourcePolicyV2SettingModalModifyMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "2c96373fbbfdfc5b9f9aebc8fbeee01e",
    "id": null,
    "metadata": {},
    "name": "ProjectResourcePolicyV2SettingModalModifyMutation",
    "operationKind": "mutation",
    "text": "mutation ProjectResourcePolicyV2SettingModalModifyMutation(\n  $name: String!\n  $input: UpdateProjectResourcePolicyInput!\n) {\n  adminUpdateProjectResourcePolicyV2(name: $name, input: $input) {\n    projectResourcePolicy {\n      id\n      name\n      createdAt\n      maxVfolderCount\n      maxQuotaScopeSize {\n        expr\n      }\n      maxNetworkCount\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "9a9c28802a896f925245b977923feb2a";

export default node;
