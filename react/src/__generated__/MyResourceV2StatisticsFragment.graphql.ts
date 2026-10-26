/**
 * @generated SignedSource<<6623fc7dcea58166e3706ecc2c998eee>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs, Result } from "relay-runtime";
export type MyResourceV2StatisticsFragment$data = {
  readonly effectiveResourceAllocationV2: Result<{
    readonly assignable: ReadonlyArray<{
      readonly quantity: any | null | undefined;
      readonly resourceType: string;
      readonly unlimited: boolean;
    }>;
    readonly breakdown: {
      readonly keypair: {
        readonly used: ReadonlyArray<{
          readonly quantity: any;
          readonly resourceType: string;
        }>;
      };
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
};
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "input"
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
        "args": [
          {
            "kind": "Variable",
            "name": "input",
            "variableName": "input"
          }
        ],
        "concreteType": "EffectiveResourceAllocationV2",
        "kind": "LinkedField",
        "name": "effectiveResourceAllocationV2",
        "plural": false,
        "selections": [
          {
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
          {
            "alias": null,
            "args": null,
            "concreteType": "EffectiveBreakdownV2",
            "kind": "LinkedField",
            "name": "breakdown",
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

(node as any).hash = "bfb4dc46915a5c8acbcbc15df730d84f";

export default node;
