/**
 * @generated SignedSource<<52d6d7229096a3fd12948daf73123a37>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type NotificationRuleOrderField = "CREATED_AT" | "NAME" | "UPDATED_AT" | "%future added value";
export type NotificationRuleType = "ARTIFACT_DOWNLOAD_COMPLETED" | "ENDPOINT_LIFECYCLE_CHANGED" | "SESSION_STARTED" | "SESSION_TERMINATED" | "%future added value";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type NotificationRuleFilter = {
  AND?: ReadonlyArray<NotificationRuleFilter> | null | undefined;
  NOT?: ReadonlyArray<NotificationRuleFilter> | null | undefined;
  OR?: ReadonlyArray<NotificationRuleFilter> | null | undefined;
  enabled?: boolean | null | undefined;
  entityId?: UUIDFilter | null | undefined;
  name?: StringFilter | null | undefined;
  ruleType?: NotificationRuleTypeFilter | null | undefined;
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
export type NotificationRuleTypeFilter = {
  equals?: NotificationRuleType | null | undefined;
  in?: ReadonlyArray<NotificationRuleType> | null | undefined;
  notEquals?: NotificationRuleType | null | undefined;
  notIn?: ReadonlyArray<NotificationRuleType> | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type NotificationRuleOrderBy = {
  direction?: OrderDirection;
  field: NotificationRuleOrderField;
};
export type NotificationRuleListQuery$variables = {
  filter?: NotificationRuleFilter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<NotificationRuleOrderBy> | null | undefined;
};
export type NotificationRuleListQuery$data = {
  readonly adminNotificationRules: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly channelId: string;
        readonly createdAt: string;
        readonly description: string | null | undefined;
        readonly enabled: boolean;
        readonly entityId: string;
        readonly id: string;
        readonly name: string;
        readonly ruleType: NotificationRuleType;
        readonly " $fragmentSpreads": FragmentRefs<"NotificationRuleSettingModalFragment">;
      };
    }>;
  } | null | undefined;
};
export type NotificationRuleListQuery = {
  response: NotificationRuleListQuery$data;
  variables: NotificationRuleListQuery$variables;
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
  "name": "orderBy"
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
    "kind": "Variable",
    "name": "orderBy",
    "variableName": "orderBy"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ruleType",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "enabled",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "channelId",
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
    "name": "NotificationRuleListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "NotificationRuleConnection",
        "kind": "LinkedField",
        "name": "adminNotificationRules",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "NotificationRuleEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "NotificationRule",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  (v12/*: any*/),
                  (v13/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "NotificationRuleSettingModalFragment"
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
      (v0/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "NotificationRuleListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "NotificationRuleConnection",
        "kind": "LinkedField",
        "name": "adminNotificationRules",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "NotificationRuleEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "NotificationRule",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  (v12/*: any*/),
                  (v13/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "messageTemplate",
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
    "cacheID": "063742e6e2f1375a187ae1c30f0cc20e",
    "id": null,
    "metadata": {},
    "name": "NotificationRuleListQuery",
    "operationKind": "query",
    "text": "query NotificationRuleListQuery(\n  $filter: NotificationRuleFilter\n  $orderBy: [NotificationRuleOrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  adminNotificationRules(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        entityId\n        name\n        description\n        ruleType\n        enabled\n        createdAt\n        channelId\n        ...NotificationRuleSettingModalFragment\n      }\n    }\n  }\n}\n\nfragment NotificationRuleSettingModalFragment on NotificationRule {\n  id\n  entityId\n  name\n  description\n  ruleType\n  channelId\n  messageTemplate\n  enabled\n}\n"
  }
};
})();

(node as any).hash = "ab69e2a011ee0680cf5844ca93af6652";

export default node;
