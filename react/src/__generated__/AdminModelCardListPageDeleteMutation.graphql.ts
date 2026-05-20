/**
 * @generated SignedSource<<e98842d1465b7579349880d822db291f>>
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
export type AdminModelCardListPageDeleteMutation$variables = {
  id: string;
  options?: DeleteModelCardV2Options | null | undefined;
};
export type AdminModelCardListPageDeleteMutation$data = {
  readonly adminDeleteModelCardV2: {
    readonly id: string;
  } | null | undefined;
};
export type AdminModelCardListPageDeleteMutation = {
  response: AdminModelCardListPageDeleteMutation$data;
  variables: AdminModelCardListPageDeleteMutation$variables;
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
    "concreteType": "DeleteModelCardPayloadGQL",
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
    "name": "AdminModelCardListPageDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminModelCardListPageDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "6ea2d9087d639c271482822ea5f5afa4",
    "id": null,
    "metadata": {},
    "name": "AdminModelCardListPageDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminModelCardListPageDeleteMutation(\n  $id: UUID!\n  $options: DeleteModelCardV2Options\n) {\n  adminDeleteModelCardV2(id: $id, options: $options) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "5f8217e5136af15e1406d703c47af5b4";

export default node;
