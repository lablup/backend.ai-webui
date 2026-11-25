/**
 * @generated SignedSource<<3371936dc2a68d2033b5099e8f4fd8d0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ContainerRegistryListEditingRegistryQuery$variables = {
  id: string;
};
export type ContainerRegistryListEditingRegistryQuery$data = {
  readonly container_registry_node: {
    readonly " $fragmentSpreads": FragmentRefs<"ContainerRegistryEditorModalFragment">;
  } | null | undefined;
};
export type ContainerRegistryListEditingRegistryQuery = {
  response: ContainerRegistryListEditingRegistryQuery$data;
  variables: ContainerRegistryListEditingRegistryQuery$variables;
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
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "row_id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ContainerRegistryListEditingRegistryQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ContainerRegistryNode",
        "kind": "LinkedField",
        "name": "container_registry_node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ContainerRegistryEditorModalFragment"
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
    "name": "ContainerRegistryListEditingRegistryQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ContainerRegistryNode",
        "kind": "LinkedField",
        "name": "container_registry_node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "registry_name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "url",
            "storageKey": null
          },
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "project",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "username",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "ssl_verify",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "extra",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "is_global",
            "storageKey": null
          },
          {
            "alias": null,
            "args": [
              {
                "kind": "Literal",
                "name": "first",
                "value": 100
              }
            ],
            "concreteType": "GroupConnection",
            "kind": "LinkedField",
            "name": "allowed_groups",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "GroupEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "GroupNode",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/),
                      (v3/*: any*/),
                      (v4/*: any*/),
                      (v5/*: any*/),
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
                        "name": "domain_name",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "allowed_groups(first:100)"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "6b93f1c8fcf16494661f067354c371dc",
    "id": null,
    "metadata": {},
    "name": "ContainerRegistryListEditingRegistryQuery",
    "operationKind": "query",
    "text": "query ContainerRegistryListEditingRegistryQuery(\n  $id: String!\n) {\n  container_registry_node(id: $id) {\n    ...ContainerRegistryEditorModalFragment\n    id\n  }\n}\n\nfragment ContainerRegistryEditorModalFragment on ContainerRegistryNode {\n  id\n  row_id\n  name\n  registry_name\n  url\n  type\n  project\n  username\n  ssl_verify\n  extra\n  is_global\n  allowed_groups(first: 100) {\n    edges {\n      node {\n        id\n        row_id\n        name\n        type\n        is_active\n        domain_name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "32c07d33e00aebbf75d524cd07a153ea";

export default node;
