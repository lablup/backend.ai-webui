/**
 * @generated SignedSource<<c1b28a9e8200047eb0da63c66b7da2ae>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ArtifactAvailability = "ALIVE" | "DELETED" | "%future added value";
export type DeleteArtifactsInput = {
  artifactIds: ReadonlyArray<string>;
};
export type BAIDeactivateArtifactsModalDeleteArtifactsMutation$variables = {
  input: DeleteArtifactsInput;
};
export type BAIDeactivateArtifactsModalDeleteArtifactsMutation$data = {
  readonly deleteArtifacts: {
    readonly artifacts: ReadonlyArray<{
      readonly availability: ArtifactAvailability;
      readonly id: string;
    }>;
  } | null | undefined;
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
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "DeleteArtifactsPayload",
    "kind": "LinkedField",
    "name": "deleteArtifacts",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Artifact",
        "kind": "LinkedField",
        "name": "artifacts",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "availability",
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
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIDeactivateArtifactsModalDeleteArtifactsMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "e45a6c0badd3acc1f5f3b7801541d496",
    "id": null,
    "metadata": {},
    "name": "BAIDeactivateArtifactsModalDeleteArtifactsMutation",
    "operationKind": "mutation",
    "text": "mutation BAIDeactivateArtifactsModalDeleteArtifactsMutation(\n  $input: DeleteArtifactsInput!\n) {\n  deleteArtifacts(input: $input) {\n    artifacts {\n      id\n      availability\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "377ca74de3de373f6dda7069cc9b34eb";

export default node;
