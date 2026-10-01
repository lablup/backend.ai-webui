/**
 * @generated SignedSource<<a8bf85cc4f519164327e5be3ef8b5dbd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EntityShareScope = {
  recipient?: ReadonlyArray<UUIDScope> | null | undefined;
  recipientProject?: ReadonlyArray<UUIDScope> | null | undefined;
  sharer?: ReadonlyArray<UUIDScope> | null | undefined;
  target?: ReadonlyArray<EntityShareTargetScope> | null | undefined;
};
export type UUIDScope = {
  value: string;
};
export type EntityShareTargetScope = {
  entityId: string;
  entityType: string;
};
export type EntityShareManagerModalQuery$variables = {
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  scope: EntityShareScope;
};
export type EntityShareManagerModalQuery$data = {
  readonly entityShares: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"EntityShareNodesFragment">;
      };
    }>;
  } | null | undefined;
};
export type EntityShareManagerModalQuery = {
  response: EntityShareManagerModalQuery$data;
  variables: EntityShareManagerModalQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v3 = [
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
    "name": "scope",
    "variableName": "scope"
  }
],
v4 = {
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
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "EntityShareManagerModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "EntityShareConnection",
        "kind": "LinkedField",
        "name": "entityShares",
        "plural": false,
        "selections": [
          (v4/*: any*/),
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
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "EntityShareManagerModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "EntityShareConnection",
        "kind": "LinkedField",
        "name": "entityShares",
        "plural": false,
        "selections": [
          (v4/*: any*/),
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
    "cacheID": "34255e9fad5bac4f7ee9de64533a832e",
    "id": null,
    "metadata": {},
    "name": "EntityShareManagerModalQuery",
    "operationKind": "query",
    "text": "query EntityShareManagerModalQuery(\n  $scope: EntityShareScope!\n  $limit: Int\n  $offset: Int\n) {\n  entityShares(scope: $scope, orderBy: [{field: CREATED_AT, direction: \"DESC\"}], limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        ...EntityShareNodesFragment\n        id\n      }\n    }\n  }\n}\n\nfragment EntityShareNodesFragment on EntityShare {\n  id\n  entityId\n  sharerUserId\n  recipientEntityType\n  recipientEntityId\n  recipientEmail\n  targetEntityType\n  targetEntityId\n  permissions\n  status\n  expiresAt\n  createdAt\n  updatedAt\n}\n"
  }
};
})();

(node as any).hash = "d72a89016948277e5a42aa8b724a54e3";

export default node;
