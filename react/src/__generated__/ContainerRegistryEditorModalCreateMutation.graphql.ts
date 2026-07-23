/**
 * @generated SignedSource<<632e4d43bd3bb23b54dda193337a5fea>>
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
    "cacheID": "4df9116bd277ca16eb13281d543cbe04",
    "id": null,
    "metadata": {},
    "name": "ContainerRegistryEditorModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation ContainerRegistryEditorModalCreateMutation(\n  $props: CreateContainerRegistryNodeInputV2!\n) {\n  create_container_registry_node_v2(props: $props) {\n    container_registry {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6c83e8833822dff8f1b0fa55b80d0b19";

export default node;
