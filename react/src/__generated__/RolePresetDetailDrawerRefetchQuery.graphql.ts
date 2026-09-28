/**
 * @generated SignedSource<<1bfb852543c9396a045b4e7a1bc2a54e>>
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
    "cacheID": "8527e246a1f35cf8cb9b95ada4663608",
    "id": null,
    "metadata": {},
    "name": "RolePresetDetailDrawerRefetchQuery",
    "operationKind": "query",
    "text": "query RolePresetDetailDrawerRefetchQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RolePresetDetailDrawerFragment\n    id\n  }\n}\n\nfragment RolePresetDetailDrawerFragment on RolePreset {\n  name\n  scopeType\n  autoAssign\n  deleted\n  createdAt\n  updatedAt\n  ...RolePresetPermissionTableFragment\n  id\n}\n\nfragment RolePresetPermissionTableFragment on RolePreset {\n  id\n  scopeType\n}\n"
  }
};
})();

(node as any).hash = "df82c6b0ed839ea7b9fab67127ca7020";

export default node;
