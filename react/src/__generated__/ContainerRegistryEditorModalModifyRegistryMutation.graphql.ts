/**
 * @generated SignedSource<<91d46529ff8072518f61a0a295c5b43a>>
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
      readonly id: string;
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
    "name": "ContainerRegistryEditorModalModifyRegistryMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ContainerRegistryEditorModalModifyRegistryMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "904d92a2293c34d32d71678fe19436e6",
    "id": null,
    "metadata": {},
    "name": "ContainerRegistryEditorModalModifyRegistryMutation",
    "operationKind": "mutation",
    "text": "mutation ContainerRegistryEditorModalModifyRegistryMutation(\n  $id: String!\n  $props: ModifyContainerRegistryNodeInputV2!\n) {\n  modify_container_registry_node_v2(id: $id, props: $props) {\n    container_registry {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "7d37cec70d1be6699f386f7c09adc572";

export default node;
