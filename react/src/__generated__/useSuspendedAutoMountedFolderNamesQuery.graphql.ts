/**
 * @generated SignedSource<<3fa3fea666dd10683472c85170514270>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useSuspendedAutoMountedFolderNamesQuery$variables = {
  filter?: string | null | undefined;
  scopeId?: any | null | undefined;
};
export type useSuspendedAutoMountedFolderNamesQuery$data = {
  readonly vfolder_nodes: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly name: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type useSuspendedAutoMountedFolderNamesQuery = {
  response: useSuspendedAutoMountedFolderNamesQuery$data;
  variables: useSuspendedAutoMountedFolderNamesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeId"
},
v2 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Literal",
    "name": "first",
    "value": 100
  },
  {
    "kind": "Literal",
    "name": "permission",
    "value": "read_attribute"
  },
  {
    "kind": "Variable",
    "name": "scope_id",
    "variableName": "scopeId"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useSuspendedAutoMountedFolderNamesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
                  (v3/*: any*/)
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
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "useSuspendedAutoMountedFolderNamesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
                  (v3/*: any*/),
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
    "cacheID": "fb01755d8cf03f70a69f5965c4a16bcb",
    "id": null,
    "metadata": {},
    "name": "useSuspendedAutoMountedFolderNamesQuery",
    "operationKind": "query",
    "text": "query useSuspendedAutoMountedFolderNamesQuery(\n  $scopeId: ScopeField\n  $filter: String\n) {\n  vfolder_nodes(scope_id: $scopeId, filter: $filter, first: 100, permission: \"read_attribute\") {\n    edges {\n      node {\n        name\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "843bfb3bf049c4e158eea0588bd4a6a1";

export default node;
