/**
 * @generated SignedSource<<c617bc418d0d041776f3ccd299549d1e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EntityShareStatus = "ACCEPTED" | "CANCELED" | "PENDING" | "REJECTED" | "REVOKED" | "%future added value";
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
export type EntityShareFilter = {
  entityId?: UUIDFilter | null | undefined;
  recipientEmail?: StringFilter | null | undefined;
  recipientEntityId?: UUIDFilter | null | undefined;
  status?: EntityShareStatusFilter | null | undefined;
  targetEntityId?: UUIDFilter | null | undefined;
};
export type EntityShareStatusFilter = {
  equals?: EntityShareStatus | null | undefined;
  in?: ReadonlyArray<EntityShareStatus> | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type StringFilter = {
  contains?: string | null | undefined;
  endsWith?: string | null | undefined;
  equals?: string | null | undefined;
  iContains?: string | null | undefined;
  iEndsWith?: string | null | undefined;
  iEquals?: string | null | undefined;
  iIn?: ReadonlyArray<string> | null | undefined;
  iNotContains?: string | null | undefined;
  iNotEndsWith?: string | null | undefined;
  iNotEquals?: string | null | undefined;
  iNotIn?: ReadonlyArray<string> | null | undefined;
  iNotStartsWith?: string | null | undefined;
  iStartsWith?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notContains?: string | null | undefined;
  notEndsWith?: string | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
  notStartsWith?: string | null | undefined;
  startsWith?: string | null | undefined;
};
export type InviteFolderSettingModalExistingShareQuery$variables = {
  filter?: EntityShareFilter | null | undefined;
  scope: EntityShareScope;
};
export type InviteFolderSettingModalExistingShareQuery$data = {
  readonly entityShares: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
      };
    }>;
  } | null | undefined;
};
export type InviteFolderSettingModalExistingShareQuery = {
  response: InviteFolderSettingModalExistingShareQuery$data;
  variables: InviteFolderSettingModalExistingShareQuery$variables;
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
  "name": "scope"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "filter"
      },
      {
        "kind": "Literal",
        "name": "limit",
        "value": 1
      },
      {
        "kind": "Variable",
        "name": "scope",
        "variableName": "scope"
      }
    ],
    "concreteType": "EntityShareConnection",
    "kind": "LinkedField",
    "name": "entityShares",
    "plural": false,
    "selections": [
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
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "InviteFolderSettingModalExistingShareQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "InviteFolderSettingModalExistingShareQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "ab1cdb1201e213e12d31b6f720d97fd9",
    "id": null,
    "metadata": {},
    "name": "InviteFolderSettingModalExistingShareQuery",
    "operationKind": "query",
    "text": "query InviteFolderSettingModalExistingShareQuery(\n  $scope: EntityShareScope!\n  $filter: EntityShareFilter\n) {\n  entityShares(scope: $scope, filter: $filter, limit: 1) {\n    edges {\n      node {\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "f9341fdd41dbe5c446547194cf901ea1";

export default node;
