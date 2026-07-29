/**
 * @generated SignedSource<<37c70ffffbddb917df0b64a8c7f93e45>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs, Result } from "relay-runtime";
export type ChatCardQuery$variables = {
  deploymentId: string;
};
export type ChatCardQuery$data = {
  readonly deployment: Result<{
    readonly activeReplicas: {
      readonly count: number;
    } | null | undefined;
    readonly id: string;
    readonly networkAccess: {
      readonly endpointUrl: string | null | undefined;
    };
    readonly replicaState: {
      readonly desiredReplicaCount: number;
    };
    readonly revisionHistory: {
      readonly count: number;
    } | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"ChatHeader_Deployment">;
  } | null | undefined, unknown>;
};
export type ChatCardQuery = {
  response: ChatCardQuery$data;
  variables: ChatCardQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "deploymentId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "deploymentId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
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
      "name": "endpointUrl",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v4 = {
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
v5 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v6 = {
  "alias": null,
  "args": null,
  "concreteType": "ModelRevisionConnection",
  "kind": "LinkedField",
  "name": "revisionHistory",
  "plural": false,
  "selections": (v5/*: any*/),
  "storageKey": null
},
v7 = {
  "alias": "activeReplicas",
  "args": [
    {
      "kind": "Literal",
      "name": "filter",
      "value": {
        "status": {
          "equals": "RUNNING"
        },
        "trafficStatus": {
          "equals": "ACTIVE"
        }
      }
    }
  ],
  "concreteType": "ModelReplicaConnection",
  "kind": "LinkedField",
  "name": "replicas",
  "plural": false,
  "selections": (v5/*: any*/),
  "storageKey": "replicas(filter:{\"status\":{\"equals\":\"RUNNING\"},\"trafficStatus\":{\"equals\":\"ACTIVE\"}})"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ChatCardQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": {
          "alias": null,
          "args": (v1/*: any*/),
          "concreteType": "ModelDeployment",
          "kind": "LinkedField",
          "name": "deployment",
          "plural": false,
          "selections": [
            (v2/*: any*/),
            (v3/*: any*/),
            (v4/*: any*/),
            (v6/*: any*/),
            (v7/*: any*/),
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "ChatHeader_Deployment"
            }
          ],
          "storageKey": null
        },
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ChatCardQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelDeploymentMetadata",
            "kind": "LinkedField",
            "name": "metadata",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "574d386dfa419cbeb27faf76bbb93271",
    "id": null,
    "metadata": {},
    "name": "ChatCardQuery",
    "operationKind": "query",
    "text": "query ChatCardQuery(\n  $deploymentId: ID!\n) {\n  deployment(id: $deploymentId) {\n    id\n    networkAccess {\n      endpointUrl\n    }\n    replicaState {\n      desiredReplicaCount\n    }\n    revisionHistory {\n      count\n    }\n    activeReplicas: replicas(filter: {status: {equals: RUNNING}, trafficStatus: {equals: ACTIVE}}) {\n      count\n    }\n    ...ChatHeader_Deployment\n  }\n}\n\nfragment ChatHeader_Deployment on ModelDeployment {\n  id\n  metadata {\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "2dc57cbb436f041731859dcc5f0cc89a";

export default node;
