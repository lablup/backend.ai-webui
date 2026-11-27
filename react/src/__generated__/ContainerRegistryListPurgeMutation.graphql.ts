/**
 * @generated SignedSource<<a559f947174485c122f0434dc3e63bec>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ContainerRegistryListPurgeMutation$variables = {
  id: string;
};
export type ContainerRegistryListPurgeMutation$data = {
  readonly adminPurgeContainerRegistryV2: {
    readonly purgedId: string;
  };
};
export type ContainerRegistryListPurgeMutation = {
  response: ContainerRegistryListPurgeMutation$data;
  variables: ContainerRegistryListPurgeMutation$variables;
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
    "concreteType": "PurgeContainerRegistryPayload",
    "kind": "LinkedField",
    "name": "adminPurgeContainerRegistryV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "purgedId",
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
    "name": "ContainerRegistryListPurgeMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ContainerRegistryListPurgeMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "89004b88844031857c852207b4383df2",
    "id": null,
    "metadata": {},
    "name": "ContainerRegistryListPurgeMutation",
    "operationKind": "mutation",
    "text": "mutation ContainerRegistryListPurgeMutation(\n  $id: UUID!\n) {\n  adminPurgeContainerRegistryV2(id: $id) {\n    purgedId\n  }\n}\n"
  }
};
})();

(node as any).hash = "f8dc7076a492143686a2cd171ea32357";

export default node;
