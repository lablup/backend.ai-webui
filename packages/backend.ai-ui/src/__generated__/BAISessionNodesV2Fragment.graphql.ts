/**
 * @generated SignedSource<<53568254ff3c580c8d2fa5096bddcec3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ClusterMode = "MULTI_NODE" | "SINGLE_NODE" | "%future added value";
export type SessionV2Status = "CANCELLED" | "CREATING" | "DEPRIORITIZING" | "PENDING" | "PREEMPTED" | "PREPARED" | "PREPARING" | "RUNNING" | "SCHEDULED" | "TERMINATED" | "TERMINATING" | "%future added value";
export type SessionV2Type = "BATCH" | "INFERENCE" | "INTERACTIVE" | "SYSTEM" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAISessionNodesV2Fragment$data = ReadonlyArray<{
  readonly id: string;
  readonly images: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly identity: {
          readonly canonicalName: string;
          readonly namespace: string;
        };
      };
    }>;
  } | null | undefined;
  readonly lifecycle: {
    readonly createdAt: string | null | undefined;
    readonly status: SessionV2Status;
    readonly terminatedAt: string | null | undefined;
  };
  readonly metadata: {
    readonly clusterMode: ClusterMode;
    readonly clusterSize: number;
    readonly name: string;
    readonly sessionType: SessionV2Type;
  };
  readonly project: {
    readonly basicInfo: {
      readonly name: string;
    };
    readonly id: string;
  } | null | undefined;
  readonly resource: {
    readonly allocation: {
      readonly requested: {
        readonly entries: ReadonlyArray<{
          readonly quantity: any;
          readonly resourceType: string;
        }>;
      };
      readonly used: {
        readonly entries: ReadonlyArray<{
          readonly quantity: any;
          readonly resourceType: string;
        }>;
      } | null | undefined;
    };
    readonly resourceGroupName: string | null | undefined;
  };
  readonly user: {
    readonly basicInfo: {
      readonly email: string;
    };
    readonly id: string;
  } | null | undefined;
  readonly " $fragmentType": "BAISessionNodesV2Fragment";
} | null | undefined>;
export type BAISessionNodesV2Fragment$key = ReadonlyArray<{
  readonly " $data"?: BAISessionNodesV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAISessionNodesV2Fragment">;
}>;

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
  "name": "name",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ResourceSlotEntry",
    "kind": "LinkedField",
    "name": "entries",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "resourceType",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "quantity",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAISessionNodesV2Fragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": (v0/*: any*/),
      "action": "NONE"
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectV2",
      "kind": "LinkedField",
      "name": "project",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "ProjectBasicInfo",
          "kind": "LinkedField",
          "name": "basicInfo",
          "plural": false,
          "selections": [
            (v1/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "SessionV2MetadataInfo",
      "kind": "LinkedField",
      "name": "metadata",
      "plural": false,
      "selections": [
        (v1/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "sessionType",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "clusterMode",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "clusterSize",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "SessionV2LifecycleInfo",
      "kind": "LinkedField",
      "name": "lifecycle",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "status",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "createdAt",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "terminatedAt",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "SessionV2ResourceInfo",
      "kind": "LinkedField",
      "name": "resource",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "resourceGroupName",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "ResourceAllocation",
          "kind": "LinkedField",
          "name": "allocation",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "ResourceSlot",
              "kind": "LinkedField",
              "name": "requested",
              "plural": false,
              "selections": (v2/*: any*/),
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "ResourceSlot",
              "kind": "LinkedField",
              "name": "used",
              "plural": false,
              "selections": (v2/*: any*/),
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
      "args": null,
      "concreteType": "ImageV2Connection",
      "kind": "LinkedField",
      "name": "images",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ImageV2Edge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "ImageV2",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v0/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "ImageV2IdentityInfo",
                  "kind": "LinkedField",
                  "name": "identity",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "canonicalName",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "namespace",
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
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "SessionV2",
  "abstractKey": null
};
})();

(node as any).hash = "7b2489642946a3bce33fba24eb5f1c23";

export default node;
