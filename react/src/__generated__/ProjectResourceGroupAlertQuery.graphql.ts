/**
 * @generated SignedSource<<e3afd2a9309db39bb8b7d8cc85841118>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectResourceGroupAlertQuery$variables = {
  projectId: string;
  resourceGroupName: string;
};
export type ProjectResourceGroupAlertQuery$data = {
  readonly projectV2: {
    readonly resourceGroups: {
      readonly count: number;
    } | null | undefined;
  } | null | undefined;
};
export type ProjectResourceGroupAlertQuery = {
  response: ProjectResourceGroupAlertQuery$data;
  variables: ProjectResourceGroupAlertQuery$variables;
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
    "name": "resourceGroupName"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "projectId",
    "variableName": "projectId"
  }
],
v2 = {
  "alias": null,
  "args": [
    {
      "fields": [
        {
          "fields": [
            {
              "kind": "Variable",
              "name": "equals",
              "variableName": "resourceGroupName"
            }
          ],
          "kind": "ObjectValue",
          "name": "name"
        }
      ],
      "kind": "ObjectValue",
      "name": "filter"
    }
  ],
  "concreteType": "ResourceGroupConnection",
  "kind": "LinkedField",
  "name": "resourceGroups",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "count",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ProjectResourceGroupAlertQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ProjectV2",
        "kind": "LinkedField",
        "name": "projectV2",
        "plural": false,
        "selections": [
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProjectResourceGroupAlertQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ProjectV2",
        "kind": "LinkedField",
        "name": "projectV2",
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
  },
  "params": {
    "cacheID": "20c889dc5982450b39014c631e809a60",
    "id": null,
    "metadata": {},
    "name": "ProjectResourceGroupAlertQuery",
    "operationKind": "query",
    "text": "query ProjectResourceGroupAlertQuery(\n  $projectId: UUID!\n  $resourceGroupName: String!\n) {\n  projectV2(projectId: $projectId) {\n    resourceGroups(filter: {name: {equals: $resourceGroupName}}) @since(version: \"26.9.0a1\") {\n      count\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "33f57e7e2d8c2f923f0de5e17198e86c";

export default node;
