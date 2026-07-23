/**
 * @generated SignedSource<<11cfc1c57cb7ec54ba01d30bb5f996a7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeleteModelCardV2Options = {
  deleteAssociatedVfolder?: boolean;
};
export type AdminModelCardDeleteMutation$variables = {
  id: string;
  options?: DeleteModelCardV2Options | null | undefined;
};
export type AdminModelCardDeleteMutation$data = {
  readonly adminDeleteModelCardV2: {
    readonly id: string;
  } | null | undefined;
};
export type AdminModelCardDeleteMutation = {
  response: AdminModelCardDeleteMutation$data;
  variables: AdminModelCardDeleteMutation$variables;
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
    "name": "options"
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
        "name": "options",
        "variableName": "options"
      }
    ],
    "concreteType": "DeleteModelCardPayload",
    "kind": "LinkedField",
    "name": "adminDeleteModelCardV2",
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AdminModelCardDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminModelCardDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "2ca7a8106333ce590a04113064d28810",
    "id": null,
    "metadata": {},
    "name": "AdminModelCardDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminModelCardDeleteMutation(\n  $id: UUID!\n  $options: DeleteModelCardV2Options\n) {\n  adminDeleteModelCardV2(id: $id, options: $options) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "12f399aebf9f17f39e4ca922f19ba040";

export default node;
