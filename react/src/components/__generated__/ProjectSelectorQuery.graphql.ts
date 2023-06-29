/**
 * @generated SignedSource<<fa1f5ded0bf96122ecee52dce8c8cad2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type ProjectSelectorQuery$variables = {};
export type ProjectSelectorQuery$data = {
  readonly projects: ReadonlyArray<{
    readonly is_active: boolean | null;
    readonly is_public: boolean | null;
    readonly name: string | null;
  } | null> | null;
};
export type ProjectSelectorQuery = {
  response: ProjectSelectorQuery$data;
  variables: ProjectSelectorQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": "projects",
    "args": [
      {
        "kind": "Literal",
        "name": "is_active",
        "value": true
      }
    ],
    "concreteType": "ScalingGroup",
    "kind": "LinkedField",
    "name": "scaling_groups",
    "plural": true,
    "selections": [
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
        "name": "is_active",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "is_public",
        "storageKey": null
      }
    ],
    "storageKey": "scaling_groups(is_active:true)"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ProjectSelectorQuery",
    "selections": (v0/*: any*/),
    "type": "Queries",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ProjectSelectorQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "bac828336acef2aab4bef5655a916bf4",
    "id": null,
    "metadata": {},
    "name": "ProjectSelectorQuery",
    "operationKind": "query",
    "text": "query ProjectSelectorQuery {\n  projects: scaling_groups(is_active: true) {\n    name\n    is_active\n    is_public\n  }\n}\n"
  }
};
})();

(node as any).hash = "d1a331174f281ef39a77271e1d1fdf0a";

export default node;
