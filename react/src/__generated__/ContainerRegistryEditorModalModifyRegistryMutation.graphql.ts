/**
 * @generated SignedSource<<ac6c1e95a93fb7342faa4d96e06df765>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModifyContainerRegistryNodeInputV2 = {
  allowed_groups?: AllowedGroups | null | undefined;
  extra?: string | null | undefined;
  is_global?: boolean | null | undefined;
  password?: string | null | undefined;
  project?: string | null | undefined;
  registry_name?: string | null | undefined;
  ssl_verify?: boolean | null | undefined;
  type?: any | null | undefined;
  url?: string | null | undefined;
  username?: string | null | undefined;
};
export type AllowedGroups = {
  add?: ReadonlyArray<string | null | undefined> | null | undefined;
  remove?: ReadonlyArray<string | null | undefined> | null | undefined;
};
export type ContainerRegistryEditorModalModifyRegistryMutation$variables = {
  id: string;
  props: ModifyContainerRegistryNodeInputV2;
};
export type ContainerRegistryEditorModalModifyRegistryMutation$data = {
  readonly modify_container_registry_node_v2: {
    readonly container_registry: {
      readonly id: string;
      readonly password: string | null | undefined;
      readonly " $fragmentSpreads": FragmentRefs<"ContainerRegistryEditorModalFragment">;
    } | null | undefined;
  } | null | undefined;
};
export type ContainerRegistryEditorModalModifyRegistryMutation = {
  response: ContainerRegistryEditorModalModifyRegistryMutation$data;
  variables: ContainerRegistryEditorModalModifyRegistryMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "props"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  },
  {
    "kind": "Variable",
    "name": "props",
    "variableName": "props"
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
  "name": "password",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "row_id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ContainerRegistryEditorModalModifyRegistryMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ModifyContainerRegistryNodeV2",
        "kind": "LinkedField",
        "name": "modify_container_registry_node_v2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ContainerRegistryNode",
            "kind": "LinkedField",
            "name": "container_registry",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "ContainerRegistryEditorModalFragment"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ContainerRegistryEditorModalModifyRegistryMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ModifyContainerRegistryNodeV2",
        "kind": "LinkedField",
        "name": "modify_container_registry_node_v2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ContainerRegistryNode",
            "kind": "LinkedField",
            "name": "container_registry",
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
                          (v4/*: any*/),
                          (v5/*: any*/)
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
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a1928812f952799db327407687c02de1",
    "id": null,
    "metadata": {},
    "name": "ContainerRegistryEditorModalModifyRegistryMutation",
    "operationKind": "mutation",
    "text": "mutation ContainerRegistryEditorModalModifyRegistryMutation(\n  $id: String!\n  $props: ModifyContainerRegistryNodeInputV2!\n) {\n  modify_container_registry_node_v2(id: $id, props: $props) {\n    container_registry {\n      id\n      password\n      ...ContainerRegistryEditorModalFragment\n    }\n  }\n}\n\nfragment ContainerRegistryEditorModalFragment on ContainerRegistryNode {\n  id\n  row_id\n  name\n  registry_name\n  url\n  type\n  project\n  username\n  ssl_verify\n  extra @since(version: \"24.09.3\")\n  is_global @since(version: \"24.09.0\")\n  allowed_groups @since(version: \"25.3.0\") {\n    edges {\n      node {\n        id\n        row_id\n        name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "7e2c2edf924b7c4705d1bd6e7c10429f";

export default node;
