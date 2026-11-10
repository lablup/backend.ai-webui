/**
 * @generated SignedSource<<d34c1f0a81dd44bc637d5eb52ee94bd4>>
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
  id?: string | null | undefined;
  name?: string | null | undefined;
  status?: RoleStatus | null | undefined;
};
export type RoleFormModalUpdateMutation$variables = {
  id: string;
  input: UpdateRoleInput;
};
export type RoleFormModalUpdateMutation$data = {
  readonly updateRole: {
    readonly autoAssign: boolean;
    readonly description: string | null | undefined;
    readonly id: string;
    readonly name: string;
    readonly updatedAt: string;
  };
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
    "name": "id"
  },
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
        "name": "id",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "Role",
    "kind": "LinkedField",
    "name": "updateRole",
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
    "cacheID": "7f84e5487ae0e8ed66968136320bddbe",
    "id": null,
    "metadata": {},
    "name": "RoleFormModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation RoleFormModalUpdateMutation(\n  $id: UUID!\n  $input: UpdateRoleInput!\n) {\n  updateRole(id: $id, input: $input) {\n    id\n    name\n    description\n    autoAssign\n    updatedAt\n  }\n}\n"
  }
};
})();

(node as any).hash = "c99699a92de5bb5ef733b0c5637e7f4e";

export default node;
