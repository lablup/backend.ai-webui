/**
 * @generated SignedSource<<45bed0a13d68f126e076a9a681554f8a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type FairShareListProjectNameQuery$variables = {
  projectId: string;
  skipProject: boolean;
};
export type FairShareListProjectNameQuery$data = {
  readonly project?: {
    readonly basicInfo: {
      readonly name: string;
    };
  } | null | undefined;
};
export type FairShareListProjectNameQuery = {
  response: FairShareListProjectNameQuery$data;
  variables: FairShareListProjectNameQuery$variables;
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
    "name": "skipProject"
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "FairShareListProjectNameQuery",
    "selections": [
      {
        "condition": "skipProject",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": "project",
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
    "name": "FairShareListProjectNameQuery",
    "selections": [
      {
        "condition": "skipProject",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": "project",
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
      }
    ]
  },
  "params": {
    "cacheID": "6f6afb69073b1f80e8f437c48bd932e5",
    "id": null,
    "metadata": {},
    "name": "FairShareListProjectNameQuery",
    "operationKind": "query",
    "text": "query FairShareListProjectNameQuery(\n  $projectId: UUID!\n  $skipProject: Boolean!\n) {\n  project: projectV2(projectId: $projectId) @skip(if: $skipProject) {\n    basicInfo {\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "691dcf5b91504b0f3d261fc5633cb3ba";

export default node;
