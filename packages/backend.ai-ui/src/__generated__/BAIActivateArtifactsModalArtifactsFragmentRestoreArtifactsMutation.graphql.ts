/**
 * @generated SignedSource<<e78c86f3e22e9c173d8a96c4e520badf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ArtifactAvailability = "ALIVE" | "DELETED" | "%future added value";
export type PartialBulkRestoreArtifactsInput = {
  ids: ReadonlyArray<string>;
};
export type BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation$variables = {
  input: PartialBulkRestoreArtifactsInput;
};
export type BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation$data = {
  readonly partialBulkRestoreArtifacts: {
    readonly failed: ReadonlyArray<{
      readonly id: string;
      readonly message: string;
    }>;
    readonly successes: ReadonlyArray<{
      readonly availability: ArtifactAvailability;
      readonly id: string;
    }>;
  };
};
export type BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation = {
  response: BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation$data;
  variables: BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "PartialBulkArtifactsPayload",
    "kind": "LinkedField",
    "name": "partialBulkRestoreArtifacts",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Artifact",
        "kind": "LinkedField",
        "name": "successes",
        "plural": true,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "availability",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "PartialBulkFailure",
        "kind": "LinkedField",
        "name": "failed",
        "plural": true,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "message",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "432d20cc8421a9533d0a1abdafb0584c",
    "id": null,
    "metadata": {},
    "name": "BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation",
    "operationKind": "mutation",
    "text": "mutation BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation(\n  $input: PartialBulkRestoreArtifactsInput!\n) {\n  partialBulkRestoreArtifacts(input: $input) {\n    successes {\n      id\n      availability\n    }\n    failed {\n      id\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "fd1ec5137350e8e324994d4c7dfe351f";

export default node;
