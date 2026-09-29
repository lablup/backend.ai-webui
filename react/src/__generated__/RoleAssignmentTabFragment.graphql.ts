/**
 * @generated SignedSource<<85e648b6c73b11dfe0c746bcdb9ce104>>
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
        readonly grantedBy: string | null | undefined;
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
  "name": "scopeType",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeId",
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
                (v1/*: any*/),
                (v2/*: any*/)
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "scopes(first:1)"
    },
    (v1/*: any*/),
    (v2/*: any*/),
    {
      "alias": null,
      "args": [
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
      "concreteType": "RoleAssignmentConnection",
      "kind": "LinkedField",
      "name": "users",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "count",
          "storageKey": null
        },
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
                  "name": "grantedBy",
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
                    {
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
  ],
  "type": "Role",
  "abstractKey": null
};
})();

(node as any).hash = "19141615917ec1434b3e89511a877a6f";

export default node;
