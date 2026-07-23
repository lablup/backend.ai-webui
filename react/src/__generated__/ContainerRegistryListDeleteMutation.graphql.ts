/**
 * @generated SignedSource<<408c2dea31daea5196a39b3c4699fd94>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ContainerRegistryListDeleteMutation$variables = {
  id: string;
};
export type ContainerRegistryListDeleteMutation$data = {
  readonly delete_container_registry_node_v2: {
    readonly container_registry: {
      readonly id: string;
    } | null | undefined;
  } | null | undefined;
};
export type ContainerRegistryListDeleteMutation = {
  response: ContainerRegistryListDeleteMutation$data;
  variables: ContainerRegistryListDeleteMutation$variables;
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
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "DeleteContainerRegistryNodeV2",
    "kind": "LinkedField",
    "name": "delete_container_registry_node_v2",
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
    "name": "ContainerRegistryListDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ContainerRegistryListDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "dee7dc9351edf924f27f36708081392a",
    "id": null,
    "metadata": {},
    "name": "ContainerRegistryListDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation ContainerRegistryListDeleteMutation(\n  $id: String!\n) {\n  delete_container_registry_node_v2(id: $id) {\n    container_registry {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "9c376270f9537afa6a7b9c2c8b821097";

export default node;
