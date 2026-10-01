/**
 * @generated SignedSource<<4671d9255fbf363438881e362d34ddd3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type CreateEntityShareInput = {
  permissions?: ReadonlyArray<PermissionBit>;
  recipient: EntityShareRecipientInput;
  targetEntityId: string;
  targetEntityType: string;
};
export type EntityShareRecipientInput = {
  email?: string | null | undefined;
  projectId?: string | null | undefined;
  userId?: string | null | undefined;
};
export type EntityShareCreateModalMutation$variables = {
  input: CreateEntityShareInput;
};
export type EntityShareCreateModalMutation$data = {
  readonly createEntityShare: {
    readonly share: {
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"EntityShareNodesFragment">;
    };
  } | null | undefined;
};
export type EntityShareCreateModalMutation = {
  response: EntityShareCreateModalMutation$data;
  variables: EntityShareCreateModalMutation$variables;
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
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "EntityShareCreateModalMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "EntitySharePayload",
        "kind": "LinkedField",
        "name": "createEntityShare",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "EntityShare",
            "kind": "LinkedField",
            "name": "share",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "EntityShareNodesFragment"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EntityShareCreateModalMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "EntitySharePayload",
        "kind": "LinkedField",
        "name": "createEntityShare",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "EntityShare",
            "kind": "LinkedField",
            "name": "share",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "entityId",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "sharerUserId",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "recipientEntityType",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "recipientEntityId",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "recipientEmail",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "targetEntityType",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "targetEntityId",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "permissions",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "status",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "expiresAt",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "createdAt",
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
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "95bb9627b0174b8742af27c6057f2f1c",
    "id": null,
    "metadata": {},
    "name": "EntityShareCreateModalMutation",
    "operationKind": "mutation",
    "text": "mutation EntityShareCreateModalMutation(\n  $input: CreateEntityShareInput!\n) {\n  createEntityShare(input: $input) {\n    share {\n      id\n      ...EntityShareNodesFragment\n    }\n  }\n}\n\nfragment EntityShareNodesFragment on EntityShare {\n  id\n  entityId\n  sharerUserId\n  recipientEntityType\n  recipientEntityId\n  recipientEmail\n  targetEntityType\n  targetEntityId\n  permissions\n  status\n  expiresAt\n  createdAt\n  updatedAt\n}\n"
  }
};
})();

(node as any).hash = "bf743acd0ec71f0b60406f00158abcc2";

export default node;
