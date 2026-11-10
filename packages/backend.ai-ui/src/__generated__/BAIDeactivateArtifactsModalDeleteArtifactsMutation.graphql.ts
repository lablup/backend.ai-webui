/**
 * @generated SignedSource<<3f8ae5726f0d9bae690e6142b8d44e19>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ArtifactAvailability = "ALIVE" | "DELETED" | "%future added value";
export type PartialBulkDeleteArtifactsInput = {
  ids: ReadonlyArray<string>;
};
export type BAIDeactivateArtifactsModalDeleteArtifactsMutation$variables = {
  input: PartialBulkDeleteArtifactsInput;
};
export type BAIDeactivateArtifactsModalDeleteArtifactsMutation$data = {
  readonly partialBulkDeleteArtifacts: {
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
export type BAIDeactivateArtifactsModalDeleteArtifactsMutation = {
  response: BAIDeactivateArtifactsModalDeleteArtifactsMutation$data;
  variables: BAIDeactivateArtifactsModalDeleteArtifactsMutation$variables;
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
    "name": "partialBulkDeleteArtifacts",
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
    "name": "BAIDeactivateArtifactsModalDeleteArtifactsMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIDeactivateArtifactsModalDeleteArtifactsMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "6c07b526af3f353eaa93e3b6dfd88147",
    "id": null,
    "metadata": {},
    "name": "BAIDeactivateArtifactsModalDeleteArtifactsMutation",
    "operationKind": "mutation",
    "text": "mutation BAIDeactivateArtifactsModalDeleteArtifactsMutation(\n  $input: PartialBulkDeleteArtifactsInput!\n) {\n  partialBulkDeleteArtifacts(input: $input) {\n    successes {\n      id\n      availability\n    }\n    failed {\n      id\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ce674ac703257f81a2cdc6cc92108cc6";

export default node;
