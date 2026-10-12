/**
 * @generated SignedSource<<b9bb3617806435929e80348e89969a94>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RoleStatus = "ACTIVE" | "DELETED" | "INACTIVE" | "%future added value";
export type UpdateRoleInput = {
  autoAssign?: boolean | null | undefined;
  description?: string | null | undefined;
  id: string;
  name?: string | null | undefined;
  status?: RoleStatus | null | undefined;
};
export type RoleFormModalUpdateMutation$variables = {
  input: UpdateRoleInput;
};
export type RoleFormModalUpdateMutation$data = {
  readonly adminUpdateRole: {
    readonly autoAssign: boolean;
    readonly description: string | null | undefined;
    readonly id: string;
    readonly name: string;
    readonly updatedAt: string;
  } | null | undefined;
};
export type RoleFormModalUpdateMutation = {
  response: RoleFormModalUpdateMutation$data;
  variables: RoleFormModalUpdateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "Role",
    "kind": "LinkedField",
    "name": "adminUpdateRole",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "description",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "autoAssign",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "updatedAt",
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
    "name": "RoleFormModalUpdateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RoleFormModalUpdateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "9efec51c4f535a81b3a1ca89982223fc",
    "id": null,
    "metadata": {},
    "name": "RoleFormModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation RoleFormModalUpdateMutation(\n  $input: UpdateRoleInput!\n) {\n  adminUpdateRole(input: $input) {\n    id\n    name\n    description\n    autoAssign\n    updatedAt\n  }\n}\n"
  }
};
})();

(node as any).hash = "2f0291b09a65c29ee579453b3c9c7e88";

export default node;
