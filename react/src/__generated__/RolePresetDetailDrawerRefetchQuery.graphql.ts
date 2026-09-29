/**
 * @generated SignedSource<<05d5ea4780d45c29dd1c297c2477361f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RolePresetDetailDrawerRefetchQuery$variables = {
  id: string;
};
export type RolePresetDetailDrawerRefetchQuery$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"RolePresetDetailDrawerFragment">;
  } | null | undefined;
};
export type RolePresetDetailDrawerRefetchQuery = {
  response: RolePresetDetailDrawerRefetchQuery$data;
  variables: RolePresetDetailDrawerRefetchQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RolePresetDetailDrawerRefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RolePresetDetailDrawerFragment"
          }
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
    "name": "RolePresetDetailDrawerRefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
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
                "name": "scopeType",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "autoAssign",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "deleted",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "createdAt",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "updatedAt",
                "storageKey": null
              }
            ],
            "type": "RolePreset",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "bc25f8a881404199dee4b5278e6867f9",
    "id": null,
    "metadata": {},
    "name": "RolePresetDetailDrawerRefetchQuery",
    "operationKind": "query",
    "text": "query RolePresetDetailDrawerRefetchQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RolePresetDetailDrawerFragment\n    id\n  }\n}\n\nfragment RolePresetDetailDrawerFragment on RolePreset {\n  id\n  name\n  scopeType\n  autoAssign\n  deleted\n  createdAt\n  updatedAt\n  ...RolePresetPermissionTableFragment\n}\n\nfragment RolePresetPermissionTableFragment on RolePreset {\n  id\n  scopeType\n}\n"
  }
};
})();

(node as any).hash = "0051280d148f5f65cf1eb3712a9de9b5";

export default node;
