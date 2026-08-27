/**
 * @generated SignedSource<<1f798acb69d2526feef4ab0203c8da5b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectResourcePolicyV2Mutation$variables = {
  name: string;
};
export type ProjectResourcePolicyV2Mutation$data = {
  readonly adminDeleteProjectResourcePolicyV2: {
    readonly name: string;
  } | null | undefined;
};
export type ProjectResourcePolicyV2Mutation = {
  response: ProjectResourcePolicyV2Mutation$data;
  variables: ProjectResourcePolicyV2Mutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      }
    ],
    "concreteType": "DeleteProjectResourcePolicyPayload",
    "kind": "LinkedField",
    "name": "adminDeleteProjectResourcePolicyV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
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
    "name": "ProjectResourcePolicyV2Mutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProjectResourcePolicyV2Mutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "7e55a4620fd1c37cb82357baa9d15d13",
    "id": null,
    "metadata": {},
    "name": "ProjectResourcePolicyV2Mutation",
    "operationKind": "mutation",
    "text": "mutation ProjectResourcePolicyV2Mutation(\n  $name: String!\n) {\n  adminDeleteProjectResourcePolicyV2(name: $name) {\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "d25eb2dc9186fd211b74ad23a0a53b90";

export default node;
