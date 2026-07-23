/**
 * @generated SignedSource<<f22e7c5de46aa65c57bca7782fde8916>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
export type CancelArtifactInput = {
  artifactRevisionId: string;
};
export type BAIPullingArtifactRevisionAlertCancelMutation$variables = {
  input: CancelArtifactInput;
};
export type BAIPullingArtifactRevisionAlertCancelMutation$data = {
  readonly cancelImportArtifact: {
    readonly artifactRevision: {
      readonly id: string;
      readonly status: ArtifactStatus;
    };
  } | null | undefined;
};
export type BAIPullingArtifactRevisionAlertCancelMutation = {
  response: BAIPullingArtifactRevisionAlertCancelMutation$data;
  variables: BAIPullingArtifactRevisionAlertCancelMutation$variables;
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
    "concreteType": "CancelImportArtifactPayload",
    "kind": "LinkedField",
    "name": "cancelImportArtifact",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ArtifactRevision",
        "kind": "LinkedField",
        "name": "artifactRevision",
        "plural": false,
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
            "name": "status",
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
    "name": "BAIPullingArtifactRevisionAlertCancelMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIPullingArtifactRevisionAlertCancelMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "2b4debfb8df103ad97421b0869b31402",
    "id": null,
    "metadata": {},
    "name": "BAIPullingArtifactRevisionAlertCancelMutation",
    "operationKind": "mutation",
    "text": "mutation BAIPullingArtifactRevisionAlertCancelMutation(\n  $input: CancelArtifactInput!\n) {\n  cancelImportArtifact(input: $input) {\n    artifactRevision {\n      id\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "18b2b20bc4ed731fcd89e1469e73b49c";

export default node;
