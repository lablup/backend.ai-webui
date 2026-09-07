/**
 * @generated SignedSource<<aa8593f1a8b14060807ca6e41795183b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type StorageStatusPanelCardPolicyQuery$variables = {
  name: string;
  skip: boolean;
};
export type StorageStatusPanelCardPolicyQuery$data = {
  readonly project_resource_policy?: {
    readonly max_vfolder_count: number | null | undefined;
  } | null | undefined;
};
export type StorageStatusPanelCardPolicyQuery = {
  response: StorageStatusPanelCardPolicyQuery$data;
  variables: StorageStatusPanelCardPolicyQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skip"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "name"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max_vfolder_count",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "StorageStatusPanelCardPolicyQuery",
    "selections": [
      {
        "condition": "skip",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "ProjectResourcePolicy",
            "kind": "LinkedField",
            "name": "project_resource_policy",
            "plural": false,
            "selections": [
              (v2/*: any*/)
            ],
            "storageKey": null
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "StorageStatusPanelCardPolicyQuery",
    "selections": [
      {
        "condition": "skip",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "ProjectResourcePolicy",
            "kind": "LinkedField",
            "name": "project_resource_policy",
            "plural": false,
            "selections": [
              (v2/*: any*/),
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
        ]
      }
    ]
  },
  "params": {
    "cacheID": "0212ffc5b4dc582ca11cf9cc2b369109",
    "id": null,
    "metadata": {},
    "name": "StorageStatusPanelCardPolicyQuery",
    "operationKind": "query",
    "text": "query StorageStatusPanelCardPolicyQuery(\n  $name: String!\n  $skip: Boolean!\n) {\n  project_resource_policy(name: $name) @skip(if: $skip) {\n    max_vfolder_count\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "16d04ab0a0c78a28c8fdcc3525dba163";

export default node;
