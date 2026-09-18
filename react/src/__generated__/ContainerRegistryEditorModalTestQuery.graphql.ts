/**
 * @generated SignedSource<<ee092a7b20887c56e289a1af3bb23f58>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ContainerRegistryEditorModalTestQuery$variables = {
  id: string;
};
export type ContainerRegistryEditorModalTestQuery$data = {
  readonly container_registry_node: {
    readonly " $fragmentSpreads": FragmentRefs<"ContainerRegistryEditorModalFragment">;
  } | null | undefined;
};
export type ContainerRegistryEditorModalTestQuery = {
  response: ContainerRegistryEditorModalTestQuery$data;
  variables: ContainerRegistryEditorModalTestQuery$variables;
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
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v6 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v7 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "UUID"
},
v8 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Boolean"
},
v9 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ContainerRegistryEditorModalTestQuery",
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
    "name": "ContainerRegistryEditorModalTestQuery",
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
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "type",
            "storageKey": null
          },
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
            "args": null,
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
                      (v4/*: any*/)
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
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "9b81d0792271074e231d2e44e39ed7d4",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "container_registry_node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ContainerRegistryNode"
        },
        "container_registry_node.allowed_groups": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "GroupConnection"
        },
        "container_registry_node.allowed_groups.edges": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "GroupEdge"
        },
        "container_registry_node.allowed_groups.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "GroupNode"
        },
        "container_registry_node.allowed_groups.edges.node.id": (v5/*: any*/),
        "container_registry_node.allowed_groups.edges.node.name": (v6/*: any*/),
        "container_registry_node.allowed_groups.edges.node.row_id": (v7/*: any*/),
        "container_registry_node.extra": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "JSONString"
        },
        "container_registry_node.id": (v5/*: any*/),
        "container_registry_node.is_global": (v8/*: any*/),
        "container_registry_node.name": (v6/*: any*/),
        "container_registry_node.project": (v6/*: any*/),
        "container_registry_node.registry_name": (v9/*: any*/),
        "container_registry_node.row_id": (v7/*: any*/),
        "container_registry_node.ssl_verify": (v8/*: any*/),
        "container_registry_node.type": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ContainerRegistryTypeField"
        },
        "container_registry_node.url": (v9/*: any*/),
        "container_registry_node.username": (v6/*: any*/)
      }
    },
    "name": "ContainerRegistryEditorModalTestQuery",
    "operationKind": "query",
    "text": "query ContainerRegistryEditorModalTestQuery(\n  $id: String!\n) {\n  container_registry_node(id: $id) {\n    ...ContainerRegistryEditorModalFragment\n    id\n  }\n}\n\nfragment ContainerRegistryEditorModalFragment on ContainerRegistryNode {\n  id\n  row_id\n  name\n  registry_name\n  url\n  type\n  project\n  username\n  ssl_verify\n  extra\n  is_global\n  allowed_groups {\n    edges {\n      node {\n        id\n        row_id\n        name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "cbb375720d567210ae0fd630ae787a1b";

export default node;
