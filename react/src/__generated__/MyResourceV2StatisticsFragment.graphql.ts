/**
 * @generated SignedSource<<ef3c98b5cc6a81500eadd3c6c3c497e8>>
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
v2 = {
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
                "selections": [
                  (v0/*: any*/),
                  (v1/*: any*/)
                ],
                "storageKey": null
              },
              (v2/*: any*/)
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
              (v2/*: any*/)
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

(node as any).hash = "32d075bea3d6be33660661fee77daef7";

export default node;
