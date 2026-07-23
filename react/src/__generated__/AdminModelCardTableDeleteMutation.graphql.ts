/**
 * @generated SignedSource<<566c191f2dcf1be4dda04f34b888b77c>>
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
export type AdminModelCardTableDeleteMutation$variables = {
  id: string;
  options?: DeleteModelCardV2Options | null | undefined;
};
export type AdminModelCardTableDeleteMutation$data = {
  readonly adminDeleteModelCardV2: {
    readonly id: string;
  } | null | undefined;
};
export type AdminModelCardTableDeleteMutation = {
  response: AdminModelCardTableDeleteMutation$data;
  variables: AdminModelCardTableDeleteMutation$variables;
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
    "name": "AdminModelCardTableDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminModelCardTableDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "04868dfdeba9bdca08f35c320ad8c48c",
    "id": null,
    "metadata": {},
    "name": "AdminModelCardTableDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminModelCardTableDeleteMutation(\n  $id: UUID!\n  $options: DeleteModelCardV2Options\n) {\n  adminDeleteModelCardV2(id: $id, options: $options) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "2b62822b4d304967b469220cf47ca93c";

export default node;
