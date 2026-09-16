/**
 * @generated SignedSource<<b7eda5015e06cd0a24cacd82c1ef7233>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CreateContainerRegistryNodeInputV2 = {
  allowed_groups?: AllowedGroups | null | undefined;
  extra?: string | null | undefined;
  is_global?: boolean | null | undefined;
  password?: string | null | undefined;
  project?: string | null | undefined;
  registry_name: string;
  ssl_verify?: boolean | null | undefined;
  type: any;
  url: string;
  username?: string | null | undefined;
};
export type AllowedGroups = {
  add?: ReadonlyArray<string | null | undefined> | null | undefined;
  remove?: ReadonlyArray<string | null | undefined> | null | undefined;
};
export type ContainerRegistryEditorModalCreateMutation$variables = {
  props: CreateContainerRegistryNodeInputV2;
};
export type ContainerRegistryEditorModalCreateMutation$data = {
  readonly create_container_registry_node_v2: {
    readonly container_registry: {
      readonly id: string;
      readonly project: string | null | undefined;
      readonly registry_name: string;
      readonly row_id: string | null | undefined;
      readonly type: any;
      readonly url: string;
    } | null | undefined;
  } | null | undefined;
};
export type ContainerRegistryEditorModalCreateMutation = {
  response: ContainerRegistryEditorModalCreateMutation$data;
  variables: ContainerRegistryEditorModalCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "props"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "props"
      }
    ],
    "concreteType": "CreateContainerRegistryNodeV2",
    "kind": "LinkedField",
    "name": "create_container_registry_node_v2",
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
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "row_id",
            "storageKey": null
          },
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
            "name": "project",
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
    "name": "ContainerRegistryEditorModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ContainerRegistryEditorModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "ef83ff98ec72022e76de025269ed5c1c",
    "id": null,
    "metadata": {},
    "name": "ContainerRegistryEditorModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation ContainerRegistryEditorModalCreateMutation(\n  $props: CreateContainerRegistryNodeInputV2!\n) {\n  create_container_registry_node_v2(props: $props) {\n    container_registry {\n      id\n      row_id\n      registry_name\n      project\n      url\n      type\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "fb42a8e6eef11fff6d88df4c2c6eac60";

export default node;
