/**
 * @generated SignedSource<<c6a8e59e1d485d788da7ced91ae24812>>
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
    "cacheID": "333f3d659d98d26a8cb2bdd8d041ca84",
    "id": null,
    "metadata": {},
    "name": "RoleFormModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation RoleFormModalUpdateMutation(\n  $input: UpdateRoleInput!\n) {\n  adminUpdateRole(input: $input) {\n    id\n    name\n    description\n    autoAssign @since(version: \"26.4.4rc7\")\n    updatedAt\n  }\n}\n"
  }
};
})();

(node as any).hash = "d545f8be150a96ff4e46027b794738cf";

export default node;
