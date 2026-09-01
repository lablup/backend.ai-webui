/**
 * @generated SignedSource<<54f7f6aa371368bda94bbe52021cf68f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
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
      readonly allowed_groups: {
        readonly edges: ReadonlyArray<{
          readonly node: {
            readonly id: string;
            readonly name: string | null | undefined;
            readonly row_id: string | null | undefined;
          } | null | undefined;
        } | null | undefined>;
      } | null | undefined;
      readonly extra: string | null | undefined;
      readonly id: string;
      readonly is_global: boolean | null | undefined;
      readonly name: string | null | undefined;
      readonly password: string | null | undefined;
      readonly project: string | null | undefined;
      readonly registry_name: string;
      readonly row_id: string | null | undefined;
      readonly ssl_verify: boolean | null | undefined;
      readonly type: any;
      readonly url: string;
      readonly username: string | null | undefined;
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
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "row_id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = [
  {
    "alias": null,
    "args": [
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
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/),
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
            "name": "password",
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
                      (v1/*: any*/),
                      (v2/*: any*/),
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
    "name": "ContainerRegistryEditorModalModifyRegistryMutation",
    "selections": (v4/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ContainerRegistryEditorModalModifyRegistryMutation",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "83c56653a320ed514c8f0ba237d6854c",
    "id": null,
    "metadata": {},
    "name": "ContainerRegistryEditorModalModifyRegistryMutation",
    "operationKind": "mutation",
    "text": "mutation ContainerRegistryEditorModalModifyRegistryMutation(\n  $id: String!\n  $props: ModifyContainerRegistryNodeInputV2!\n) {\n  modify_container_registry_node_v2(id: $id, props: $props) {\n    container_registry {\n      id\n      row_id\n      name\n      registry_name\n      url\n      type\n      project\n      username\n      password\n      ssl_verify\n      extra @since(version: \"24.09.3\")\n      is_global @since(version: \"24.09.0\")\n      allowed_groups @since(version: \"25.3.0\") {\n        edges {\n          node {\n            id\n            row_id\n            name\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b83016ed32b96f0bacfd0663c8a6120e";

export default node;
