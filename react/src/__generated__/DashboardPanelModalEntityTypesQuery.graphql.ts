/**
 * @generated SignedSource<<274c8e7dac5871dab2d9882f268cd029>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DashboardPanelModalEntityTypesQuery$variables = Record<PropertyKey, never>;
export type DashboardPanelModalEntityTypesQuery$data = {
  readonly entityTypes: ReadonlyArray<{
    readonly name: string;
  }> | null | undefined;
};
export type DashboardPanelModalEntityTypesQuery = {
  response: DashboardPanelModalEntityTypesQuery$data;
  variables: DashboardPanelModalEntityTypesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "DashboardPanelModalEntityTypesQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": {
          "alias": null,
          "args": null,
          "concreteType": "EntityType",
          "kind": "LinkedField",
          "name": "entityTypes",
          "plural": true,
          "selections": [
            (v0/*: any*/)
          ],
          "storageKey": null
        },
        "to": "NULL"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "DashboardPanelModalEntityTypesQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "EntityType",
        "kind": "LinkedField",
        "name": "entityTypes",
        "plural": true,
        "selections": [
          (v0/*: any*/),
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
    "cacheID": "6e91badb3281a11f146bda276a143fbd",
    "id": null,
    "metadata": {},
    "name": "DashboardPanelModalEntityTypesQuery",
    "operationKind": "query",
    "text": "query DashboardPanelModalEntityTypesQuery {\n  entityTypes {\n    name\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "dd607cca218a8e8df923f414b8e10172";

export default node;
