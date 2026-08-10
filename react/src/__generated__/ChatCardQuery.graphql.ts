/**
 * @generated SignedSource<<98289759770227d3e3f411563ce60562>>
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
    readonly id: string;
    readonly networkAccess: {
      readonly endpointUrl: string | null | undefined;
    };
    readonly replicaState: {
      readonly desiredReplicaCount: number;
    };
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
    "cacheID": "3f9013e20edcaafd1a678f53b915b406",
    "id": null,
    "metadata": {},
    "name": "ChatCardQuery",
    "operationKind": "query",
    "text": "query ChatCardQuery(\n  $deploymentId: ID!\n) {\n  deployment(id: $deploymentId) {\n    id\n    networkAccess {\n      endpointUrl\n    }\n    replicaState {\n      desiredReplicaCount\n    }\n    ...ChatHeader_Deployment\n  }\n}\n\nfragment ChatHeader_Deployment on ModelDeployment {\n  id\n  metadata {\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "0a7cffdb9b1bf06c7a0b1c1cff29396b";

export default node;
