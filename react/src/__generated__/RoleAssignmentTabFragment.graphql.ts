/**
 * @generated SignedSource<<e5a140621314fd9389e0481c5dc0bb6d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type RoleSource = "CUSTOM" | "SYSTEM" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type RoleAssignmentTabFragment$data = {
  readonly entityId: string;
  readonly firstScope: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly scopeId: string;
        readonly scopeType: string;
      };
    }>;
  } | null | undefined;
  readonly id: string;
  readonly name: string;
  readonly scopeId: string;
  readonly scopeType: string;
  readonly source: RoleSource;
  readonly users: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly grantedAt: string;
        readonly id: string;
        readonly user: {
          readonly basicInfo: {
            readonly email: string;
            readonly fullName: string | null | undefined;
          };
          readonly id: string;
        } | null | undefined;
        readonly userId: string;
      };
    }>;
  } | null | undefined;
  readonly usersV2: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly basicInfo: {
          readonly email: string;
          readonly fullName: string | null | undefined;
        };
        readonly entityId: string;
        readonly id: string;
      };
    }>;
  } | null | undefined;
  readonly " $fragmentType": "RoleAssignmentTabFragment";
};
export type RoleAssignmentTabFragment$key = {
  readonly " $data"?: RoleAssignmentTabFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RoleAssignmentTabFragment">;
};

import RoleAssignmentTabRefetchQuery_graphql from './RoleAssignmentTabRefetchQuery.graphql';

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeType",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeId",
  "storageKey": null
},
v4 = {
  "kind": "Variable",
  "name": "limit",
  "variableName": "limit"
},
v5 = {
  "kind": "Variable",
  "name": "offset",
  "variableName": "offset"
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "concreteType": "UserV2BasicInfo",
  "kind": "LinkedField",
  "name": "basicInfo",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "email",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "fullName",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "filter"
    },
    {
      "defaultValue": 10,
      "kind": "LocalArgument",
      "name": "limit"
    },
    {
      "defaultValue": 0,
      "kind": "LocalArgument",
      "name": "offset"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "orderBy"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "userFilter"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "userOrderBy"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": RoleAssignmentTabRefetchQuery_graphql,
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RoleAssignmentTabFragment",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
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
      "name": "source",
      "storageKey": null
    },
    {
      "alias": "firstScope",
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 1
        }
      ],
      "concreteType": "EntityConnection",
      "kind": "LinkedField",
      "name": "scopes",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "EntityRefEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "EntityRef",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v2/*: any*/),
                (v3/*: any*/)
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "scopes(first:1)"
    },
    (v2/*: any*/),
    (v3/*: any*/),
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "filter",
          "variableName": "filter"
        },
        (v4/*: any*/),
        (v5/*: any*/),
        {
          "kind": "Variable",
          "name": "orderBy",
          "variableName": "orderBy"
        }
      ],
      "concreteType": "RoleAssignmentConnection",
      "kind": "LinkedField",
      "name": "users",
      "plural": false,
      "selections": [
        (v6/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "RoleAssignmentEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "RoleAssignment",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v0/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "userId",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "grantedAt",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "UserV2",
                  "kind": "LinkedField",
                  "name": "user",
                  "plural": false,
                  "selections": [
                    (v0/*: any*/),
                    (v7/*: any*/)
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
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "filter",
          "variableName": "userFilter"
        },
        (v4/*: any*/),
        (v5/*: any*/),
        {
          "kind": "Variable",
          "name": "orderBy",
          "variableName": "userOrderBy"
        }
      ],
      "concreteType": "UserV2Connection",
      "kind": "LinkedField",
      "name": "usersV2",
      "plural": false,
      "selections": [
        (v6/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "UserV2Edge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "UserV2",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v0/*: any*/),
                (v1/*: any*/),
                (v7/*: any*/)
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
  "type": "Role",
  "abstractKey": null
};
})();

(node as any).hash = "71960f6098250b33470a6aabd95e29f4";

export default node;
