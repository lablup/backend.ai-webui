/**
 * @generated SignedSource<<59d91f1eb673a22cb59ea59721e7f4ba>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
export type CleanupArtifactRevisionsInput = {
  artifactRevisionIds: ReadonlyArray<string>;
};
export type BAIDeleteArtifactRevisionsModalCleanupVersionMutation$variables = {
  input: CleanupArtifactRevisionsInput;
};
export type BAIDeleteArtifactRevisionsModalCleanupVersionMutation$data = {
  readonly cleanupArtifactRevisions: {
    readonly artifactRevisions: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly status: ArtifactStatus;
        };
      }>;
    };
  } | null | undefined;
};
export type BAIDeleteArtifactRevisionsModalCleanupVersionMutation = {
  response: BAIDeleteArtifactRevisionsModalCleanupVersionMutation$data;
  variables: BAIDeleteArtifactRevisionsModalCleanupVersionMutation$variables;
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
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIDeleteArtifactRevisionsModalCleanupVersionMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CleanupArtifactRevisionsPayload",
        "kind": "LinkedField",
        "name": "cleanupArtifactRevisions",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ArtifactRevisionConnection",
            "kind": "LinkedField",
            "name": "artifactRevisions",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ArtifactRevisionEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ArtifactRevision",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/)
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
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIDeleteArtifactRevisionsModalCleanupVersionMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CleanupArtifactRevisionsPayload",
        "kind": "LinkedField",
        "name": "cleanupArtifactRevisions",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ArtifactRevisionConnection",
            "kind": "LinkedField",
            "name": "artifactRevisions",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ArtifactRevisionEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ArtifactRevision",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "id",
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
      }
    ]
  },
  "params": {
    "cacheID": "03897a25039ccf906a0013edbae95224",
    "id": null,
    "metadata": {},
    "name": "BAIDeleteArtifactRevisionsModalCleanupVersionMutation",
    "operationKind": "mutation",
    "text": "mutation BAIDeleteArtifactRevisionsModalCleanupVersionMutation(\n  $input: CleanupArtifactRevisionsInput!\n) {\n  cleanupArtifactRevisions(input: $input) {\n    artifactRevisions {\n      edges {\n        node {\n          status\n          id\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a1b18aa3dacff842d5e39ba15c4e3994";

export default node;
