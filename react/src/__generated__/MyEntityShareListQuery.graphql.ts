/**
 * @generated SignedSource<<d6feb3bc8b96a937378a5aca2f22da80>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EntityShareSide = "RECIPIENT" | "SHARER" | "%future added value";
export type EntityShareStatus = "ACCEPTED" | "CANCELED" | "PENDING" | "REJECTED" | "REVOKED" | "%future added value";
export type EntityShareFilter = {
  recipientEmail?: string | null | undefined;
  recipientEntityId?: string | null | undefined;
  status?: EntityShareStatus | null | undefined;
};
export type MyEntityShareListQuery$variables = {
  filter?: EntityShareFilter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  sides?: ReadonlyArray<EntityShareSide> | null | undefined;
};
export type MyEntityShareListQuery$data = {
  readonly myEntityShares: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"EntityShareNodesFragment">;
      };
    }>;
  } | null | undefined;
};
export type MyEntityShareListQuery = {
  response: MyEntityShareListQuery$data;
  variables: MyEntityShareListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "sides"
},
v4 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "limit"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "offset"
  },
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": [
      {
        "direction": "DESC",
        "field": "CREATED_AT"
      }
    ]
  },
  {
    "kind": "Variable",
    "name": "sides",
    "variableName": "sides"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "MyEntityShareListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "EntityShareConnection",
        "kind": "LinkedField",
        "name": "myEntityShares",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "EntityShareEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "EntityShare",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
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
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "MyEntityShareListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "EntityShareConnection",
        "kind": "LinkedField",
        "name": "myEntityShares",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "EntityShareEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "EntityShare",
                "kind": "LinkedField",
                "name": "node",
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
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "d778bc99aecde3ea732f79c253c05f9f",
    "id": null,
    "metadata": {},
    "name": "MyEntityShareListQuery",
    "operationKind": "query",
    "text": "query MyEntityShareListQuery(\n  $sides: [EntityShareSide!]\n  $filter: EntityShareFilter\n  $limit: Int\n  $offset: Int\n) {\n  myEntityShares(sides: $sides, filter: $filter, orderBy: [{field: CREATED_AT, direction: \"DESC\"}], limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        ...EntityShareNodesFragment\n        id\n      }\n    }\n  }\n}\n\nfragment EntityShareNodesFragment on EntityShare {\n  id\n  entityId\n  sharerUserId\n  recipientEntityType\n  recipientEntityId\n  recipientEmail\n  targetEntityType\n  targetEntityId\n  permissions\n  status\n  expiresAt\n  createdAt\n  updatedAt\n}\n"
  }
};
})();

(node as any).hash = "6901268e6dece6f5e42bc591bdcedf67";

export default node;
