/**
 * @generated SignedSource<<7501221e296c4d009f39d135d79c2589>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type ProjectSelectorQuery$variables = {
  domain_name?: string | null;
};
export type ProjectSelectorQuery$data = {
  readonly projects: ReadonlyArray<{
    readonly id: any | null;
    readonly is_active: boolean | null;
    readonly name: string | null;
    readonly resource_policy: string | null;
  } | null> | null;
};
export type ProjectSelectorQuery = {
  response: ProjectSelectorQuery$data;
  variables: ProjectSelectorQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "domain_name"
  }
],
v1 = [
  {
    "alias": "projects",
    "args": [
      {
        "kind": "Variable",
        "name": "domain_name",
        "variableName": "domain_name"
      },
      {
        "kind": "Literal",
        "name": "is_active",
        "value": true
      }
    ],
    "concreteType": "Group",
    "kind": "LinkedField",
    "name": "groups",
    "plural": true,
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
        "name": "is_active",
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
        "name": "resource_policy",
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
    "name": "ProjectSelectorQuery",
    "selections": (v1/*: any*/),
    "type": "Queries",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProjectSelectorQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "eecad68ff1a08d753ce22ff2c5136c26",
    "id": null,
    "metadata": {},
    "name": "ProjectSelectorQuery",
    "operationKind": "query",
    "text": "query ProjectSelectorQuery(\n  $domain_name: String\n) {\n  projects: groups(domain_name: $domain_name, is_active: true) {\n    id\n    is_active\n    name\n    resource_policy\n  }\n}\n"
  }
};
})();

(node as any).hash = "2845b31197571f750613f64207ded239";

export default node;
