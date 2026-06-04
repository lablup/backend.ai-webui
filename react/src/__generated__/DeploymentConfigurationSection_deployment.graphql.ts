/**
 * @generated SignedSource<<448cf3b175dd27e7404fc3f8fc765169>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type DeploymentStatus = "DEPLOYING" | "PENDING" | "READY" | "SCALING" | "STOPPED" | "STOPPING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type DeploymentConfigurationSection_deployment$data = {
  readonly currentRevision: {
    readonly id: string;
    readonly revisionNumber: number;
    readonly " $fragmentSpreads": FragmentRefs<"DeploymentRevisionDetail_revision">;
  } | null | undefined;
  readonly deployingRevision: {
    readonly id: string;
    readonly revisionNumber: number;
    readonly " $fragmentSpreads": FragmentRefs<"DeploymentRevisionDetail_revision">;
  } | null | undefined;
  readonly id: string;
  readonly metadata: {
    readonly domainName: string;
    readonly name: string;
    readonly projectId: string;
    readonly projectV2: {
      readonly basicInfo: {
        readonly name: string;
      };
    } | null | undefined;
    readonly resourceGroupName: string;
    readonly status: DeploymentStatus;
    readonly " $fragmentSpreads": FragmentRefs<"BAIDeploymentTagChips_metadata">;
  };
  readonly networkAccess: {
    readonly endpointUrl: string | null | undefined;
    readonly openToPublic: boolean;
  };
  readonly replicaState: {
    readonly desiredReplicaCount: number;
  };
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentRevisionHistoryTab_deployment" | "DeploymentSettingModal_deployment">;
  readonly " $fragmentType": "DeploymentConfigurationSection_deployment";
};
export type DeploymentConfigurationSection_deployment$key = {
  readonly " $data"?: DeploymentConfigurationSection_deployment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentConfigurationSection_deployment">;
};

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
  (v0/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "revisionNumber",
    "storageKey": null
  },
  {
    "args": null,
    "kind": "FragmentSpread",
    "name": "DeploymentRevisionDetail_revision"
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeploymentConfigurationSection_deployment",
  "selections": [
    (v0/*: any*/),
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DeploymentSettingModal_deployment"
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ModelDeploymentMetadata",
      "kind": "LinkedField",
      "name": "metadata",
      "plural": false,
      "selections": [
        (v1/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "projectId",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "domainName",
          "storageKey": null
        },
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
          "name": "resourceGroupName",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "ProjectV2",
          "kind": "LinkedField",
          "name": "projectV2",
          "plural": false,
          "selections": [
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
          "args": null,
          "kind": "FragmentSpread",
          "name": "BAIDeploymentTagChips_metadata"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ModelDeploymentNetworkAccess",
      "kind": "LinkedField",
      "name": "networkAccess",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "openToPublic",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "endpointUrl",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ReplicaState",
      "kind": "LinkedField",
      "name": "replicaState",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "desiredReplicaCount",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ModelRevision",
      "kind": "LinkedField",
      "name": "currentRevision",
      "plural": false,
      "selections": (v2/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ModelRevision",
      "kind": "LinkedField",
      "name": "deployingRevision",
      "plural": false,
      "selections": (v2/*: any*/),
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DeploymentRevisionHistoryTab_deployment"
    }
  ],
  "type": "ModelDeployment",
  "abstractKey": null
};
})();

(node as any).hash = "1168f711a429fe512e69cd4fde1d482b";

export default node;
