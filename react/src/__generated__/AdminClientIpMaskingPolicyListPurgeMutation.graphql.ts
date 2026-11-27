/**
 * @generated SignedSource<<04e4df18275bb03fc64d8feb31fd50d0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AdminClientIpMaskingPolicyListPurgeMutation$variables = {
  id: string;
};
export type AdminClientIpMaskingPolicyListPurgeMutation$data = {
  readonly purgeClientIpMaskingPolicy: {
    readonly entityId: string;
    readonly purgedId: string;
  };
};
export type AdminClientIpMaskingPolicyListPurgeMutation = {
  response: AdminClientIpMaskingPolicyListPurgeMutation$data;
  variables: AdminClientIpMaskingPolicyListPurgeMutation$variables;
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
    "concreteType": "PurgeClientIPMaskingPolicyPayload",
    "kind": "LinkedField",
    "name": "purgeClientIpMaskingPolicy",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "purgedId",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "entityId",
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
    "name": "AdminClientIpMaskingPolicyListPurgeMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminClientIpMaskingPolicyListPurgeMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "2e50b743b2947216873f6f322933151e",
    "id": null,
    "metadata": {},
    "name": "AdminClientIpMaskingPolicyListPurgeMutation",
    "operationKind": "mutation",
    "text": "mutation AdminClientIpMaskingPolicyListPurgeMutation(\n  $id: UUID!\n) {\n  purgeClientIpMaskingPolicy(id: $id) {\n    purgedId\n    entityId\n  }\n}\n"
  }
};
})();

(node as any).hash = "d74c10c74729cf38aa77338f5156fb95";

export default node;
