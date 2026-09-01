/**
 * @generated SignedSource<<d6b35ecba8721244593417c2f1cf6bdd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ArtifactAvailability = "ALIVE" | "DELETED" | "%future added value";
export type RestoreArtifactsInput = {
  artifactIds: ReadonlyArray<string>;
};
export type BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation$variables = {
  input: RestoreArtifactsInput;
};
export type BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation$data = {
  readonly restoreArtifacts: {
    readonly artifacts: ReadonlyArray<{
      readonly availability: ArtifactAvailability;
      readonly id: string;
    }>;
  } | null | undefined;
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
    "concreteType": "RestoreArtifactsPayload",
    "kind": "LinkedField",
    "name": "restoreArtifacts",
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
    "name": "BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "818ab68b4b27d1f6b18220eae06fef22",
    "id": null,
    "metadata": {},
    "name": "BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation",
    "operationKind": "mutation",
    "text": "mutation BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation(\n  $input: RestoreArtifactsInput!\n) {\n  restoreArtifacts(input: $input) {\n    artifacts {\n      id\n      availability\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "e6f2f3dbacb79c2439cde2be032f9fe0";

export default node;
