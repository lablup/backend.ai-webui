/**
 * @generated SignedSource<<12f3a8442ad8b39fbaeed2cab9e94dea>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIVFolderDeleteButtonStoriesQuery$variables = {
  permission?: any | null | undefined;
};
export type BAIVFolderDeleteButtonStoriesQuery$data = {
  readonly vfolder_nodes: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIVFolderDeleteButtonFragment">;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type BAIVFolderDeleteButtonStoriesQuery = {
  response: BAIVFolderDeleteButtonStoriesQuery$data;
  variables: BAIVFolderDeleteButtonStoriesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "permission"
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  },
  {
    "kind": "Literal",
    "name": "offset",
    "value": 0
  },
  {
    "kind": "Variable",
    "name": "permission",
    "variableName": "permission"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIVFolderDeleteButtonStoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "VirtualFolderConnection",
        "kind": "LinkedField",
        "name": "vfolder_nodes",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "VirtualFolderEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "VirtualFolderNode",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIVFolderDeleteButtonFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
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
    "name": "BAIVFolderDeleteButtonStoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "VirtualFolderConnection",
        "kind": "LinkedField",
        "name": "vfolder_nodes",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "VirtualFolderEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "VirtualFolderNode",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "permissions",
                    "storageKey": null
                  },
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
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "b98fed36f9dfbe3a9951963ce651416d",
    "id": null,
    "metadata": {},
    "name": "BAIVFolderDeleteButtonStoriesQuery",
    "operationKind": "query",
    "text": "query BAIVFolderDeleteButtonStoriesQuery(\n  $permission: VFolderPermissionValueField\n) {\n  vfolder_nodes(offset: 0, first: 10, permission: $permission) {\n    edges {\n      node {\n        ...BAIVFolderDeleteButtonFragment\n        id\n      }\n    }\n  }\n}\n\nfragment BAIVFolderDeleteButtonFragment on VirtualFolderNode {\n  permissions\n}\n"
  }
};
})();

(node as any).hash = "d9fac626e9fb6578a0897e22c408e285";

export default node;
