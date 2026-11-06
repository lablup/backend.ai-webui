/**
 * @generated SignedSource<<a459ca2a717fa05f17c1ce26245ace8e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs, Result } from "relay-runtime";
export type MyResourceV2StatisticsFragment$data = {
  readonly myUserResourceAllocationV2: Result<{
    readonly user: {
      readonly assignable: ReadonlyArray<{
        readonly quantity: any | null | undefined;
        readonly resourceType: string;
        readonly unlimited: boolean;
      }>;
      readonly used: ReadonlyArray<{
        readonly quantity: any;
        readonly resourceType: string;
      }>;
    };
  } | null | undefined, unknown>;
  readonly projectResourceAllocationV2: Result<{
    readonly project: {
      readonly assignable: ReadonlyArray<{
        readonly quantity: any | null | undefined;
        readonly resourceType: string;
        readonly unlimited: boolean;
      }>;
    };
  } | null | undefined, unknown>;
  readonly scopedResourceGroups: Result<{
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly resourceInfo: {
          readonly capacity: {
            readonly entries: ReadonlyArray<{
              readonly quantity: any;
              readonly resourceType: string;
            }>;
          };
          readonly free: {
            readonly entries: ReadonlyArray<{
              readonly quantity: any;
              readonly resourceType: string;
            }>;
          };
        } | null | undefined;
      };
    }>;
  } | null | undefined, unknown>;
  readonly " $fragmentType": "MyResourceV2StatisticsFragment";
};
export type MyResourceV2StatisticsFragment$key = {
  readonly " $data"?: MyResourceV2StatisticsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"MyResourceV2StatisticsFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resourceType",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "quantity",
  "storageKey": null
},
v2 = [
  (v0/*: any*/),
  (v1/*: any*/)
],
v3 = {
  "alias": null,
  "args": null,
  "concreteType": "ResourceLimitEntry",
  "kind": "LinkedField",
  "name": "assignable",
  "plural": true,
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "unlimited",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v4 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ResourceSlotEntry",
    "kind": "LinkedField",
    "name": "entries",
    "plural": true,
    "selections": (v2/*: any*/),
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "projectId"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "resourceGroupFilter"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "scope"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "MyResourceV2StatisticsFragment",
  "selections": [
    {
      "kind": "CatchField",
      "field": {
        "alias": null,
        "args": null,
        "concreteType": "UserResourceAllocationV2",
        "kind": "LinkedField",
        "name": "myUserResourceAllocationV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ScopeResourceUsageV2",
            "kind": "LinkedField",
            "name": "user",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ResourceSlotEntry",
                "kind": "LinkedField",
                "name": "used",
                "plural": true,
                "selections": (v2/*: any*/),
                "storageKey": null
              },
              (v3/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      "to": "RESULT"
    },
    {
      "kind": "CatchField",
      "field": {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "projectId",
            "variableName": "projectId"
          }
        ],
        "concreteType": "ProjectResourceAllocationV2",
        "kind": "LinkedField",
        "name": "projectResourceAllocationV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ScopeResourceUsageV2",
            "kind": "LinkedField",
            "name": "project",
            "plural": false,
            "selections": [
              (v3/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      "to": "RESULT"
    },
    {
      "kind": "CatchField",
      "field": {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "filter",
            "variableName": "resourceGroupFilter"
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
        "concreteType": "ResourceGroupConnection",
        "kind": "LinkedField",
        "name": "scopedResourceGroups",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ResourceGroupEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ResourceGroup",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ResourceInfo",
                    "kind": "LinkedField",
                    "name": "resourceInfo",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ResourceSlot",
                        "kind": "LinkedField",
                        "name": "capacity",
                        "plural": false,
                        "selections": (v4/*: any*/),
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ResourceSlot",
                        "kind": "LinkedField",
                        "name": "free",
                        "plural": false,
                        "selections": (v4/*: any*/),
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
      },
      "to": "RESULT"
    }
  ],
  "type": "Query",
  "abstractKey": null
};
})();

(node as any).hash = "29786df7b235eb3c9dd15c9af29ba475";

export default node;
