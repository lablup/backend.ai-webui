/**
 * @generated SignedSource<<13efb19dc006774b70041837087ca54d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type FairShareListProjectNameQuery$variables = {
  projectId: string;
};
export type FairShareListProjectNameQuery$data = {
  readonly project: {
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
  },
  "params": {
    "cacheID": "637f33f2c71333884872e567250d1783",
    "id": null,
    "metadata": {},
    "name": "FairShareListProjectNameQuery",
    "operationKind": "query",
    "text": "query FairShareListProjectNameQuery(\n  $projectId: UUID!\n) {\n  project: projectV2(projectId: $projectId) {\n    basicInfo {\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "614756e2216a9a3301c7e2448ce0f421";

export default node;
