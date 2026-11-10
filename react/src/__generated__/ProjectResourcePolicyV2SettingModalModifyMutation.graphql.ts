/**
 * @generated SignedSource<<244af4895f59484297d0f3dfd6d73e1b>>
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
  id: string;
  input: UpdateProjectResourcePolicyInput;
};
export type ProjectResourcePolicyV2SettingModalModifyMutation$data = {
  readonly updateProjectResourcePolicyV2: {
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
  };
};
export type ProjectResourcePolicyV2SettingModalModifyMutation = {
  response: ProjectResourcePolicyV2SettingModalModifyMutation$data;
  variables: ProjectResourcePolicyV2SettingModalModifyMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
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
        "name": "id",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "UpdateProjectResourcePolicyPayload",
    "kind": "LinkedField",
    "name": "updateProjectResourcePolicyV2",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ProjectResourcePolicyV2SettingModalModifyMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProjectResourcePolicyV2SettingModalModifyMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "4c12069b24353372583bb83635142b33",
    "id": null,
    "metadata": {},
    "name": "ProjectResourcePolicyV2SettingModalModifyMutation",
    "operationKind": "mutation",
    "text": "mutation ProjectResourcePolicyV2SettingModalModifyMutation(\n  $id: UUID!\n  $input: UpdateProjectResourcePolicyInput!\n) {\n  updateProjectResourcePolicyV2(id: $id, input: $input) {\n    projectResourcePolicy {\n      id\n      name\n      createdAt\n      maxVfolderCount\n      maxQuotaScopeSize {\n        expr\n      }\n      maxNetworkCount\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "07e95ea1b68faa2495ea081c45bd4d52";

export default node;
