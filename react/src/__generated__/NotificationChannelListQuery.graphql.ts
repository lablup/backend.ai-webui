/**
 * @generated SignedSource<<c4bfd46b96a42e646030964291c62119>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type NotificationChannelOrderField = "CREATED_AT" | "NAME" | "UPDATED_AT" | "%future added value";
export type NotificationChannelType = "EMAIL" | "WEBHOOK" | "%future added value";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type NotificationChannelFilter = {
  AND?: ReadonlyArray<NotificationChannelFilter> | null | undefined;
  NOT?: ReadonlyArray<NotificationChannelFilter> | null | undefined;
  OR?: ReadonlyArray<NotificationChannelFilter> | null | undefined;
  channelType?: NotificationChannelTypeFilter | null | undefined;
  enabled?: boolean | null | undefined;
  entityId?: UUIDFilter | null | undefined;
  name?: StringFilter | null | undefined;
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
export type NotificationChannelTypeFilter = {
  equals?: NotificationChannelType | null | undefined;
  in?: ReadonlyArray<NotificationChannelType> | null | undefined;
  notEquals?: NotificationChannelType | null | undefined;
  notIn?: ReadonlyArray<NotificationChannelType> | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type NotificationChannelOrderBy = {
  direction?: OrderDirection;
  field: NotificationChannelOrderField;
};
export type NotificationChannelListQuery$variables = {
  filter?: NotificationChannelFilter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<NotificationChannelOrderBy> | null | undefined;
};
export type NotificationChannelListQuery$data = {
  readonly adminNotificationChannels: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly channelType: NotificationChannelType;
        readonly createdAt: string;
        readonly description: string | null | undefined;
        readonly enabled: boolean;
        readonly entityId: string;
        readonly id: string;
        readonly name: string;
        readonly " $fragmentSpreads": FragmentRefs<"NotificationChannelSettingModalFragment">;
      };
    }>;
  } | null | undefined;
};
export type NotificationChannelListQuery = {
  response: NotificationChannelListQuery$data;
  variables: NotificationChannelListQuery$variables;
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
  "name": "channelType",
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
    "name": "NotificationChannelListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "NotificationChannelConnection",
        "kind": "LinkedField",
        "name": "adminNotificationChannels",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "NotificationChannelEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "NotificationChannel",
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
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "NotificationChannelSettingModalFragment"
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
    "name": "NotificationChannelListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "NotificationChannelConnection",
        "kind": "LinkedField",
        "name": "adminNotificationChannels",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "NotificationChannelEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "NotificationChannel",
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
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "spec",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__typename",
                        "storageKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "url",
                            "storageKey": null
                          }
                        ],
                        "type": "WebhookSpec",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "SMTPConnection",
                            "kind": "LinkedField",
                            "name": "smtp",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "host",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "port",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "useTls",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "timeout",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "EmailMessage",
                            "kind": "LinkedField",
                            "name": "message",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "fromEmail",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "toEmails",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "subjectTemplate",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "SMTPAuth",
                            "kind": "LinkedField",
                            "name": "auth",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "username",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "type": "EmailSpec",
                        "abstractKey": null
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
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "5d0eaa062fcb866c13d9fb121308387e",
    "id": null,
    "metadata": {},
    "name": "NotificationChannelListQuery",
    "operationKind": "query",
    "text": "query NotificationChannelListQuery(\n  $filter: NotificationChannelFilter\n  $orderBy: [NotificationChannelOrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  adminNotificationChannels(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        entityId\n        name\n        description\n        channelType\n        enabled\n        createdAt\n        ...NotificationChannelSettingModalFragment\n      }\n    }\n  }\n}\n\nfragment NotificationChannelSettingModalFragment on NotificationChannel {\n  id\n  entityId\n  name\n  description\n  channelType\n  enabled\n  spec {\n    __typename\n    ... on WebhookSpec {\n      url\n    }\n    ... on EmailSpec {\n      smtp {\n        host\n        port\n        useTls\n        timeout\n      }\n      message {\n        fromEmail\n        toEmails\n        subjectTemplate\n      }\n      auth {\n        username\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3c17f252999226d83cb8a6f462655c04";

export default node;
