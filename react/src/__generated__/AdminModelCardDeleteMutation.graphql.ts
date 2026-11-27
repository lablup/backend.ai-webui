/**
 * @generated SignedSource<<5e84e5b1df0bbfd304c824c230e57ca8>>
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
  readonly purgeModelCardV2: {
    readonly entityId: string;
  };
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
    "concreteType": "PurgeModelCardPayload",
    "kind": "LinkedField",
    "name": "purgeModelCardV2",
    "plural": false,
    "selections": [
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
    "cacheID": "638b823d8968073122fcd0579386466f",
    "id": null,
    "metadata": {},
    "name": "AdminModelCardDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminModelCardDeleteMutation(\n  $id: UUID!\n  $options: DeleteModelCardV2Options\n) {\n  purgeModelCardV2(id: $id, options: $options) {\n    entityId\n  }\n}\n"
  }
};
})();

(node as any).hash = "77df40da86c8befbec0d28da77746c45";

export default node;
