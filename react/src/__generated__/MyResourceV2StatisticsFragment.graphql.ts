/**
 * @generated SignedSource<<0ce70c9de27735fb4d5b6d82e3b8742f>>
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
};
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "projectId"
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
            "kind": "Literal",
            "name": "limit",
            "value": 100
          },
          {
            "fields": [
              {
                "items": [
                  {
                    "fields": [
                      {
                        "kind": "Variable",
                        "name": "value",
                        "variableName": "projectId"
                      }
                    ],
                    "kind": "ObjectValue",
                    "name": "project.0"
                  }
                ],
                "kind": "ListValue",
                "name": "project"
              }
            ],
            "kind": "ObjectValue",
            "name": "scope"
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
                        "selections": [
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
      },
      "to": "RESULT"
    }
  ],
  "type": "Query",
  "abstractKey": null
};
})();

(node as any).hash = "07e73b88a482bf378e203a7f2a9395eb";

export default node;
