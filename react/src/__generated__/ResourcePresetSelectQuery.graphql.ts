/**
 * @generated SignedSource<<2484beafe0ae93006ef6099a661451e2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ResourcePresetSelectQuery$variables = Record<PropertyKey, never>;
export type ResourcePresetSelectQuery$data = {
  readonly resource_presets: ReadonlyArray<{
    readonly name: string | null | undefined;
    readonly resource_slots: string | null | undefined;
    readonly scaling_group_name: string | null | undefined;
    readonly shared_memory: any | null | undefined;
  } | null | undefined> | null | undefined;
};
export type ResourcePresetSelectQuery = {
  response: ResourcePresetSelectQuery$data;
  variables: ResourcePresetSelectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ResourcePreset",
    "kind": "LinkedField",
    "name": "resource_presets",
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
        "name": "resource_slots",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "shared_memory",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "scaling_group_name",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourcePresetSelectQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ResourcePresetSelectQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "52c59e77f72c4107824f14221143ad92",
    "id": null,
    "metadata": {},
    "name": "ResourcePresetSelectQuery",
    "operationKind": "query",
    "text": "query ResourcePresetSelectQuery {\n  resource_presets {\n    name\n    resource_slots\n    shared_memory\n    scaling_group_name\n  }\n}\n"
  }
};
})();

(node as any).hash = "e82af1b048ab523df0ab9ded965a4c46";

export default node;
