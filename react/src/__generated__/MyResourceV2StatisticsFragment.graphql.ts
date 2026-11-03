/**
 * @generated SignedSource<<0e064959feae49be0c9524e6adfb9b02>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs, Result } from "relay-runtime";
export type MyResourceV2StatisticsFragment$data = {
  readonly myKeypairResourceAllocationV2: Result<{
    readonly keypair: {
      readonly assignable: ReadonlyArray<{
        readonly quantity: any | null | undefined;
        readonly resourceType: string;
        readonly unlimited: boolean;
      }>;
      readonly limits: ReadonlyArray<{
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
      readonly limits: ReadonlyArray<{
        readonly quantity: any | null | undefined;
        readonly resourceType: string;
        readonly unlimited: boolean;
      }>;
    };
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
  (v1/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "unlimited",
    "storageKey": null
  }
],
v3 = {
  "alias": null,
  "args": null,
  "concreteType": "ResourceLimitEntry",
  "kind": "LinkedField",
  "name": "limits",
  "plural": true,
  "selections": (v2/*: any*/),
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "concreteType": "ResourceLimitEntry",
  "kind": "LinkedField",
  "name": "assignable",
  "plural": true,
  "selections": (v2/*: any*/),
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
        "concreteType": "KeypairResourceAllocationV2",
        "kind": "LinkedField",
        "name": "myKeypairResourceAllocationV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ScopeResourceUsageV2",
            "kind": "LinkedField",
            "name": "keypair",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ResourceSlotEntry",
                "kind": "LinkedField",
                "name": "used",
                "plural": true,
                "selections": [
                  (v0/*: any*/),
                  (v1/*: any*/)
                ],
                "storageKey": null
              },
              (v3/*: any*/),
              (v4/*: any*/)
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
              (v3/*: any*/),
              (v4/*: any*/)
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

(node as any).hash = "f48917869ac25abe92b5d37ace77dd61";

export default node;
