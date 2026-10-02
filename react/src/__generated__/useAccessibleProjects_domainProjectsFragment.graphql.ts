/**
 * @generated SignedSource<<8c93d96f5a1effbe6fb402073bb8d7e9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ProjectTypeV2 = "GENERAL" | "MODEL_STORE" | "PERSONAL" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type useAccessibleProjects_domainProjectsFragment$data = {
  readonly domainProjectsV2: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly basicInfo: {
          readonly name: string;
          readonly type: ProjectTypeV2;
        };
        readonly id: string;
        readonly lifecycle: {
          readonly isActive: boolean | null | undefined;
        };
        readonly organization: {
          readonly resourcePolicy: string;
        };
      };
    }>;
  } | null | undefined;
  readonly " $fragmentType": "useAccessibleProjects_domainProjectsFragment";
};
export type useAccessibleProjects_domainProjectsFragment$key = {
  readonly " $data"?: useAccessibleProjects_domainProjectsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"useAccessibleProjects_domainProjectsFragment">;
};

import useAccessibleProjectsDomainProjectsPaginationQuery_graphql from './useAccessibleProjectsDomainProjectsPaginationQuery.graphql';

const node: ReaderFragment = (function(){
var v0 = [
  "domainProjectsV2"
];
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "after"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "domainName"
    },
    {
      "defaultValue": 1000,
      "kind": "LocalArgument",
      "name": "first"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "types"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "first",
        "cursor": "after",
        "direction": "forward",
        "path": (v0/*: any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "first",
          "cursor": "after"
        },
        "backward": null,
        "path": (v0/*: any*/)
      },
      "fragmentPathInResult": [],
      "operation": useAccessibleProjectsDomainProjectsPaginationQuery_graphql
    }
  },
  "name": "useAccessibleProjects_domainProjectsFragment",
  "selections": [
    {
      "alias": "domainProjectsV2",
      "args": [
        {
          "fields": [
            {
              "kind": "Literal",
              "name": "isActive",
              "value": true
            },
            {
              "fields": [
                {
                  "kind": "Variable",
                  "name": "in_",
                  "variableName": "types"
                }
              ],
              "kind": "ObjectValue",
              "name": "type"
            }
          ],
          "kind": "ObjectValue",
          "name": "filter"
        },
        {
          "fields": [
            {
              "kind": "Variable",
              "name": "domainName",
              "variableName": "domainName"
            }
          ],
          "kind": "ObjectValue",
          "name": "scope"
        }
      ],
      "concreteType": "ProjectV2Connection",
      "kind": "LinkedField",
      "name": "__useAccessibleProjects_domainProjectsV2_connection",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ProjectV2Edge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "ProjectV2",
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
                  "concreteType": "ProjectBasicInfo",
                  "kind": "LinkedField",
                  "name": "basicInfo",
                  "plural": false,
                  "selections": [
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
                      "name": "type",
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "ProjectOrganizationInfo",
                  "kind": "LinkedField",
                  "name": "organization",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "resourcePolicy",
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "ProjectLifecycleInfo",
                  "kind": "LinkedField",
                  "name": "lifecycle",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "isActive",
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "__typename",
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "cursor",
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "PageInfo",
          "kind": "LinkedField",
          "name": "pageInfo",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "endCursor",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "hasNextPage",
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
};
})();

(node as any).hash = "1a10613a39dbae93eabca98509c2d4e9";

export default node;
