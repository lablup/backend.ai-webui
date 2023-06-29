/**
 * @generated SignedSource<<10da523bcc7d9435d84d18d15b049b36>>
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
        "name": "name",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "is_active",
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
    "cacheID": "d7851e79319b5f7e80f5875b0103c807",
    "id": null,
    "metadata": {},
    "name": "ProjectSelectorQuery",
    "operationKind": "query",
    "text": "query ProjectSelectorQuery(\n  $domain_name: String\n) {\n  projects: groups(domain_name: $domain_name, is_active: true) {\n    id\n    name\n    is_active\n  }\n}\n"
  }
};
})();

(node as any).hash = "d5d4dd1a2d05a55184bd44703fc96365";

export default node;
