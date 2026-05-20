/**
 * @generated SignedSource<<a5c6c6c75b672ff84abca1c864b3c673>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIAdminProjectSelectValueQuery$variables = {
  projectId: string;
  skipSelected: boolean;
};
export type BAIAdminProjectSelectValueQuery$data = {
  readonly projectV2?: {
    readonly basicInfo: {
      readonly name: string;
    };
    readonly id: string;
  } | null | undefined;
};
export type BAIAdminProjectSelectValueQuery = {
  response: BAIAdminProjectSelectValueQuery$data;
  variables: BAIAdminProjectSelectValueQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "projectId"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skipSelected"
  }
],
v1 = [
  {
    "condition": "skipSelected",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "projectId",
            "variableName": "projectId"
          }
        ],
        "concreteType": "ProjectV2",
        "kind": "LinkedField",
        "name": "projectV2",
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
            "concreteType": "ProjectBasicInfo",
            "kind": "LinkedField",
            "name": "basicInfo",
            "plural": false,
            "selections": [
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
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIAdminProjectSelectValueQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIAdminProjectSelectValueQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "0b8cd06d8550facbf0c9ba606f2a61c4",
    "id": null,
    "metadata": {},
    "name": "BAIAdminProjectSelectValueQuery",
    "operationKind": "query",
    "text": "query BAIAdminProjectSelectValueQuery(\n  $projectId: UUID!\n  $skipSelected: Boolean!\n) {\n  projectV2(projectId: $projectId) @skip(if: $skipSelected) {\n    id\n    basicInfo {\n      name\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0c0fd21d0dc714d6d9d2db8f73705f97";

export default node;
